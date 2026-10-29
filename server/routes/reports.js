import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/reports/export-csv - Generate CSV download dump
router.get('/export-csv', (req, res) => {
  db.all('SELECT * FROM accidents ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error('CSV Export Error:', err);
      return res.status(500).json({ error: 'Failed to export CSV dataset' });
    }

    if (rows.length === 0) {
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
        // Escape quotes if needed
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
  });
});

export default router;
