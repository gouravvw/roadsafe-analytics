import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import { Accident } from '../models/Accident.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// In-memory upload logs
const uploadLogs = [];

// POST /api/admin/upload-csv - CSV Dataset Upload & Ingestion Pipeline (MongoDB)
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded.' });
  }

  try {
    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or missing headers.' });
    }

    const docs = records.map((row, index) => {
      const id = row.id || row.accident_id || row.accider || `ACC-UPLOAD-${Date.now()}-${index}`;
      const timestamp = row.timestamp || new Date().toISOString();
      const date = row.date || timestamp.split('T')[0];
      const year = parseInt(row.year || new Date(date).getFullYear(), 10);
      const monthNumber = parseInt(row.month || 11, 10);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = row.month_name || monthNames[monthNumber - 1] || 'Nov';
      const dayOfWeek = row.dayOfWeek || row.day_of_week || 'Mon';
      const hour = parseInt(row.hour || 12, 10);
      const locationName = row.locationName || row.Name || 'Highway Stretch';
      const city = row.city || 'Unknown';
      const district = row.district || city;
      const state = row.state || 'Karnataka';
      const lat = parseFloat(row.lat || row.latitude || 12.9716);
      const lng = parseFloat(row.lng || row.longitude || 77.5946);
      
      const severity = row.severity || (Math.random() > 0.8 ? 'Fatal' : Math.random() > 0.4 ? 'Serious' : 'Minor');
      const fatalities = parseInt(row.fatalities || (severity === 'Fatal' ? Math.floor(Math.random() * 3) + 1 : 0), 10);
      const injuries = parseInt(row.injuries || (severity !== 'Minor' ? Math.floor(Math.random() * 4) + 1 : 0), 10);
      const vehiclesInvolved = parseInt(row.vehiclesInvolved || 2, 10);
      let vehicleTypes = ['Car', 'Two-Wheeler'];
      if (row.vehicleTypes) {
        try {
          vehicleTypes = typeof row.vehicleTypes === 'string' ? JSON.parse(row.vehicleTypes) : row.vehicleTypes;
        } catch {
          vehicleTypes = [row.vehicleTypes];
        }
      }
      
      const possibleCauses = ['Overspeeding', 'Drunk Driving', 'Signal Jumping', 'Weather Effect', 'Road Defect/Pothole'];
      const primaryCause = row.primaryCause || row.cause || possibleCauses[Math.floor(Math.random() * possibleCauses.length)];
      
      const weather = row.weather || 'Clear';
      const roadType = row.roadType || row.road_type || 'National Highway';
      const surfaceCondition = row.surfaceCondition || 'Dry';
      const lighting = row.lighting || 'Daylight';
      const speedLimit = parseInt(row.speedLimit || 80, 10);

      return {
        id, timestamp, date, year, month, dayOfWeek, hour, locationName, city, district, state,
        lat, lng, severity, fatalities, injuries, vehiclesInvolved, vehicleTypes, primaryCause,
        weather, roadType, surfaceCondition, lighting, speedLimit
      };
    });

    if (docs.length > 0) {
      await Accident.bulkWrite(
        docs.map(doc => ({
          updateOne: {
            filter: { id: doc.id },
            update: { $set: doc },
            upsert: true
          }
        }))
      );
    }

    const logEntry = {
      id: `LOG-${Date.now()}`,
      action: 'CSV_UPLOAD',
      details: `Uploaded ${docs.length} records from file ${req.file.originalname}`,
      timestamp: new Date().toISOString()
    };
    uploadLogs.unshift(logEntry);

    res.json({
      success: true,
      message: `Successfully processed and ingested ${docs.length} accident records into database!`,
      recordsIngested: docs.length
    });
  } catch (error) {
    console.error('CSV Parsing Error:', error);
    res.status(500).json({ error: `CSV Parsing Failed: ${error.message}` });
  }
});

// GET /api/admin/uploads - Fetch recent dataset upload history
router.get('/uploads', (req, res) => {
  res.json(uploadLogs.slice(0, 15));
});

export default router;
