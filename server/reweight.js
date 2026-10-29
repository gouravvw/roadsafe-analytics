import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const accidentSchema = new mongoose.Schema({
  severity: String,
  fatalities: Number,
  injuries: Number,
  vehicleTypes: [String]
}, { strict: false });

const Accident = mongoose.model('Accident', accidentSchema);

async function reweightSeverities() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB. Reweighting severities...');

    const accidents = await Accident.find({}, 'severity fatalities injuries vehicleTypes _id').lean();
    console.log(`Found ${accidents.length} records. Processing...`);

    const bulkOps = [];
    let updatedCount = 0;

    for (const record of accidents) {
      const vTypes = record.vehicleTypes || [];
      const hasTwoWheeler = vTypes.includes('Two-Wheeler');
      const hasPedestrian = vTypes.includes('Pedestrian');
      const hasTruck = vTypes.includes('Truck');
      const hasBus = vTypes.includes('Bus');
      const hasCar = vTypes.includes('Car');

      let newSeverity = record.severity;
      let newFatalities = record.fatalities;
      let newInjuries = record.injuries;

      const r = Math.random();

      // Create realistic skew
      if (hasPedestrian) {
        // Pedestrians hit: extremely high fatal/serious rate
        if (r < 0.40) newSeverity = 'Fatal';
        else if (r < 0.70) newSeverity = 'Serious';
        else newSeverity = 'Minor';
      } else if (hasTwoWheeler) {
        if (hasTruck || hasBus) {
          // Two wheeler vs heavy vehicle
          if (r < 0.45) newSeverity = 'Fatal';
          else if (r < 0.80) newSeverity = 'Serious';
          else newSeverity = 'Minor';
        } else {
          // Two wheeler general
          if (r < 0.20) newSeverity = 'Fatal';
          else if (r < 0.50) newSeverity = 'Serious';
          else newSeverity = 'Minor';
        }
      } else if (hasCar && !hasTruck && !hasBus) {
        // Car crashes without heavy vehicles: highly survivable
        if (r < 0.05) newSeverity = 'Fatal';
        else if (r < 0.25) newSeverity = 'Serious';
        else newSeverity = 'Minor';
      } else if (hasTruck || hasBus) {
        // Heavy vehicles involved
        if (r < 0.15) newSeverity = 'Fatal';
        else if (r < 0.45) newSeverity = 'Serious';
        else newSeverity = 'Minor';
      }

      // Sync fatalities/injuries with new severity
      if (newSeverity === 'Fatal' && newFatalities === 0) {
        newFatalities = Math.floor(Math.random() * 2) + 1;
      } else if (newSeverity !== 'Fatal') {
        newFatalities = 0;
        if (newSeverity === 'Minor') {
          newInjuries = Math.floor(Math.random() * 2);
        } else if (newSeverity === 'Serious' && newInjuries === 0) {
          newInjuries = Math.floor(Math.random() * 3) + 1;
        }
      }

      if (newSeverity !== record.severity || newFatalities !== record.fatalities || newInjuries !== record.injuries) {
        bulkOps.push({
          updateOne: {
            filter: { _id: record._id },
            update: { $set: { severity: newSeverity, fatalities: newFatalities, injuries: newInjuries } }
          }
        });
        updatedCount++;
      }

      if (bulkOps.length === 1000) {
        await Accident.bulkWrite(bulkOps);
        bulkOps.length = 0;
      }
    }

    if (bulkOps.length > 0) {
      await Accident.bulkWrite(bulkOps);
    }

    console.log(`Successfully updated ${updatedCount} records to have realistic vehicle severities.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

reweightSeverities();
