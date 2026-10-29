import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const accidentSchema = new mongoose.Schema({}, { strict: false });
const Accident = mongoose.model('Accident', accidentSchema);

async function importRealData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Dropping old synthetic data...');
    await Accident.collection.drop().catch(err => console.log('Collection might not exist yet:', err.message));

    const csvPath = path.join(__dirname, '../public/morth_irad_real_dataset.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim());

    const records = [];
    // Super basic CSV parser
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex to split by comma but ignore commas inside quotes
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (!values) continue;

      const record = {};
      headers.forEach((header, index) => {
        let val = values[index];
        if (!val) return;
        val = val.replace(/^"|"$/g, ''); // strip quotes

        // Parse types based on header
        if (['lat', 'lng', 'fatalities', 'injuries', 'vehiclesInvolved', 'speedLimit', 'safetyGearUsed', 'riskScore', 'year', 'hour'].includes(header)) {
          record[header] = Number(val);
        } else if (header === 'vehicleTypes') {
          try {
            record[header] = JSON.parse(val.replace(/""/g, '"'));
          } catch (e) {
            record[header] = [val];
          }
        } else if (header === 'date') {
           record[header] = new Date(val);
        } else {
          record[header] = val;
        }
      });
      records.push(record);
    }

    console.log(`Parsed ${records.length} records. Inserting into MongoDB...`);
    await Accident.insertMany(records);
    console.log('Successfully imported real dataset!');
    process.exit(0);

  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importRealData();
