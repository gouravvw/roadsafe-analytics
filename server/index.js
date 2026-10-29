import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import accidentRoutes from './routes/accidents.js';
import blackspotRoutes from './routes/blackspots.js';
import riskRoutes from './routes/risk.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/reports.js';

dotenv.config();
dotenv.config({ path: './server/.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize MongoDB database
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
    .catch(err => console.error('❌ Failed to connect to MongoDB:', err));
} else {
  console.warn('⚠️ Warning: Neither MONGO_URI nor MONGO_URL is set in environment variables.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'RoadSafe Analytics API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/accidents', accidentRoutes);
app.use('/api/blackspots', blackspotRoutes);
app.use('/api/risk-calculator', riskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Serve built frontend in production or if dist exists
if (process.env.NODE_ENV === 'production' || fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 RoadSafe Analytics Server active on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});
