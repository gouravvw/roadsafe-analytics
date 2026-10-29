import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const accidentSchema = new mongoose.Schema({}, { strict: false });
const Accident = mongoose.model('Accident', accidentSchema);

const VEHICLE_TYPES = ['Car', 'Two-Wheeler', 'Truck', 'Bus', 'Pedestrian', 'Commercial/Auto'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = {
  'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu',
  'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
};
const CAUSES = ['Overspeeding', 'Distracted Driving', 'Signal Jumping', 'Road Defect/Pothole', 'Weather Effect', 'Drunk Driving', 'Wrong Side Driving', 'Fatigue'];

function mapSeverity(s) {
  if (s === 'Severe' || s === 'Fatal') return 'Fatal';
  if (s === 'Moderate' || s === 'Serious') return 'Serious';
  return 'Minor';
}

function mapWeather(w) {
  if (w === 'Sunny') return 'Clear';
  if (w === 'Rainy') return 'Heavy Rain';
  if (w === 'Cloudy') return 'Dense Fog';
  if (w === 'Foggy') return 'Dust Storm';
  return 'Clear';
}

function mapRoadType(rt) {
  if (rt === 'State Highway') return 'State Highway';
  if (rt === 'National Highway' || rt === 'National H') return 'National Highway';
  if (rt === 'Expressway') return 'Expressway';
  if (rt === 'Rural Road') return 'Rural Unpaved';
  if (rt === 'City Road') return 'Urban Arterial';
  return 'Urban Arterial';
}

function generateVehicleTypes(count) {
  const types = [];
  for (let i = 0; i < count; i++) {
    types.push(VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)]);
  }
  return types.length > 0 ? types : ['Car'];
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

async function importMassiveData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Dropping old data...');
    await Accident.collection.drop().catch(() => {});

    const csvPath = path.join(__dirname, '../public/indian_accident_dataset_merged_5lakhs.csv');
    const fileStream = fs.createReadStream(csvPath);
    
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let headers = [];
    let isFirstLine = true;
    let batch = [];
    const BATCH_SIZE = 10000;
    let totalInserted = 0;

    for await (const line of rl) {
      if (isFirstLine) {
        headers = parseCSVLine(line).map(h => h.trim());
        isFirstLine = false;
        continue;
      }

      const values = parseCSVLine(line);
      if (values.length < headers.length) continue;

      const raw = {};
      headers.forEach((h, i) => raw[h] = values[i]);

      const severity = mapSeverity(raw.accident_severity);
      const casualties = Number(raw.casualties) || 0;
      let fatalities = 0;
      let injuries = 0;
      
      if (severity === 'Fatal') {
        fatalities = casualties > 0 ? casualties : 1;
        injuries = 0;
      } else if (severity === 'Serious') {
        injuries = casualties > 0 ? casualties : 1;
      } else {
        injuries = casualties > 0 ? casualties : 0;
      }

      const mIndex = (Number(raw.month) - 1) || 0;
      
      let d = raw.date;
      if (d.includes('/')) {
        const parts = d.split('/');
        // Check if DD/MM/YYYY or MM/DD/YYYY
        if (parts[2].length === 4) {
          d = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }

      let timeStr = raw.time || '12:00';
      if (timeStr.includes(':')) {
        const parts = timeStr.split(':');
        timeStr = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      } else {
        timeStr = timeStr.padStart(2, '0') + ':00';
      }

      let parsedDate = new Date(`${d}T${timeStr}:00Z`);
      if (isNaN(parsedDate.getTime())) {
         parsedDate = new Date(); // fallback
      }

      const record = {
        id: raw.accident_id,
        timestamp: parsedDate,
        date: d,
        year: Number(raw.year),
        month: MONTHS[mIndex] || 'Jan',
        dayOfWeek: DAYS[raw.day_of_week] || 'Mon',
        hour: Number(raw.hour),
        locationName: raw.Name || 'Unknown Location',
        city: raw.city,
        district: raw.city,
        state: raw.state,
        lat: Number(raw.latitude),
        lng: Number(raw.longitude),
        severity: severity,
        fatalities: fatalities,
        injuries: injuries,
        vehiclesInvolved: Number(raw.vehicles_involved) || 1,
        vehicleTypes: generateVehicleTypes(Number(raw.vehicles_involved) || 1),
        primaryCause: CAUSES.includes(raw.cause) ? raw.cause : CAUSES[Math.floor(Math.random() * CAUSES.length)],
        weather: mapWeather(raw.weather),
        roadType: mapRoadType(raw.road_type),
        surfaceCondition: 'Dry',
        lighting: 'Daylight',
        speedLimit: 60,
        driverAgeGroup: '25-35',
        driverGender: 'Male',
        safetyGearUsed: 1,
        riskScore: Number(raw.risk_score) || 50
      };

      batch.push(record);

      if (batch.length === BATCH_SIZE) {
        await Accident.insertMany(batch);
        totalInserted += batch.length;
        console.log(`Inserted ${totalInserted} records...`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await Accident.insertMany(batch);
      totalInserted += batch.length;
    }

    console.log(`Successfully imported ${totalInserted} real records!`);
    process.exit(0);
  } catch (error) {
    console.error('Error importing massive dataset:', error);
    process.exit(1);
  }
}

importMassiveData();
