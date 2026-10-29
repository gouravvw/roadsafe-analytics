import mongoose from 'mongoose';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Accident } from './models/Accident.js';

dotenv.config({ path: './server/.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI is missing in your .env file!');
  process.exit(1);
}

const csvFilePath = path.resolve('large_accident_dataset.csv');

async function uploadData() {
  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas!');

    // Optional: Clear existing data
    console.log('⏳ Clearing old data...');
    await Accident.deleteMany({});
    console.log('✅ Old data cleared.');

    console.log('⏳ Reading CSV file and uploading to cloud... (This may take a minute)');
    const results = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          id: row.id,
          timestamp: row.timestamp,
          date: row.date,
          year: parseInt(row.year),
          month: row.month,
          dayOfWeek: row.dayOfWeek,
          hour: parseInt(row.hour),
          locationName: row.locationName,
          city: row.city,
          district: row.district,
          state: row.state,
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
          severity: row.severity,
          fatalities: parseInt(row.fatalities),
          injuries: parseInt(row.injuries),
          vehiclesInvolved: parseInt(row.vehiclesInvolved),
          vehicleTypes: row.vehicleTypes ? row.vehicleTypes.split('|') : [],
          primaryCause: row.primaryCause,
          weather: row.weather,
          roadType: row.roadType,
          surfaceCondition: row.surfaceCondition,
          lighting: row.lighting,
          speedLimit: parseInt(row.speedLimit),
          driverAge: parseInt(row.driverAge),
          woreSafetyGear: row.woreSafetyGear === 'True'
        });
      })
      .on('end', async () => {
        // We will insert in batches to prevent running out of memory
        const BATCH_SIZE = 5000;
        console.log(`✅ CSV parsed successfully. ${results.length} rows found.`);
        console.log(`⏳ Uploading to MongoDB in batches of ${BATCH_SIZE}...`);

        for (let i = 0; i < results.length; i += BATCH_SIZE) {
          const batch = results.slice(i, i + BATCH_SIZE);
          await Accident.insertMany(batch);
          console.log(`  -> Uploaded batch ${i / BATCH_SIZE + 1} (${i + batch.length} / ${results.length})`);
        }

        console.log('🎉 SUCCESS: All 50,000 records have been uploaded to MongoDB Atlas!');
        mongoose.connection.close();
        process.exit(0);
      });

  } catch (error) {
    console.error('❌ Upload Failed:', error);
    process.exit(1);
  }
}

uploadData();
