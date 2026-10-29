import express from 'express';
import { Accident } from '../models/Accident.js';

const router = express.Router();

// GET /api/reports/export-csv - Generate CSV download dump from MongoDB
router.get('/export-csv', async (req, res) => {
  try {
    const rows = await Accident.find({}).sort({ timestamp: -1 }).lean();

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No data available to export' });
    }

    const headers = [
      'id', 'date', 'year', 'month', 'locationName', 'city', 'district', 'state',
      'lat', 'lng', 'severity', 'fatalities', 'injuries', 'primaryCause',
      'weather', 'roadType', 'speedLimit', 'riskScore'
    ];

    let csvContent = headers.join(',') + '\n';

    rows.forEach(r => {
      const rowVals = headers.map(h => {
        let val = r[h] !== undefined && r[h] !== null ? String(r[h]) : '';
        if (val.includes(',') || val.includes('"')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvContent += rowVals.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="roadsafe_accident_dataset.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('CSV Export Error:', err);
    res.status(500).json({ error: 'Failed to export CSV dataset' });
  }
});

export default router;
