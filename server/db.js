import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { seedRealDataToDb } from './seedRealData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'roadsafe.db');
const db = new sqlite3.Database(dbPath);

export function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create Accidents Table
      db.run(`
        CREATE TABLE IF NOT EXISTS accidents (
          id TEXT PRIMARY KEY,
          timestamp TEXT,
          date TEXT,
          year INTEGER,
          month TEXT,
          dayOfWeek TEXT,
          hour INTEGER,
          locationName TEXT,
          city TEXT,
          district TEXT,
          state TEXT,
          lat REAL,
          lng REAL,
          severity TEXT,
          fatalities INTEGER,
          injuries INTEGER,
          vehiclesInvolved INTEGER,
          vehicleTypes TEXT,
          primaryCause TEXT,
          weather TEXT,
          roadType TEXT,
          surfaceCondition TEXT,
          lighting TEXT,
          speedLimit INTEGER,
          driverAgeGroup TEXT,
          driverGender TEXT,
          safetyGearUsed INTEGER,
          riskScore REAL
        )
      `);

      // Create Blackspots Table
      db.run(`
        CREATE TABLE IF NOT EXISTS blackspots (
          id TEXT PRIMARY KEY,
          name TEXT,
          highway TEXT,
          city TEXT,
          district TEXT,
          state TEXT,
          lat REAL,
          lng REAL,
          totalAccidents INTEGER,
          fatalities INTEGER,
          injuries INTEGER,
          severityIndex REAL,
          primaryFactor TEXT,
          speedLimit INTEGER,
          recommendedIntervention TEXT
        )
      `);

      // Create System Logs Table
      db.run(`
        CREATE TABLE IF NOT EXISTS system_logs (
          id TEXT PRIMARY KEY,
          action TEXT,
          details TEXT,
          timestamp TEXT
        )
      `);

      // Check if Accidents Table count is small and seed real data
      db.get('SELECT COUNT(*) as count FROM accidents', [], (err, row) => {
        if (err) {
          console.error('Error checking accidents count:', err);
          return resolve(db);
        }

        if (!row || row.count < 500) {
          console.log('Seeding SQLite database with 500+ authentic Indian MoRTH road safety records...');
          seedRealDataToDb().then(() => {
            seedBlackspots();
            resolve(db);
          });
        } else {
          console.log(`Database ready. ${row.count} accident records loaded.`);
          resolve(db);
        }
      });
    });
  });
}

function seedBlackspots() {
  db.run('DELETE FROM blackspots');

  const sampleBlackspots = [
    {
      id: 'BS-101',
      name: 'Silk Board Flyover Junction',
      highway: 'NH-44 / Hosur Road',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      lat: 12.9172,
      lng: 77.6228,
      totalAccidents: 142,
      fatalities: 28,
      injuries: 138,
      severityIndex: 9.4,
      primaryFactor: 'Weaving High-Speed Traffic & Inadequate Pedestrian Flyover',
      speedLimit: 60,
      recommendedIntervention: 'Grade separation flyover ramp modification, automated speed enforcement cameras, pedestrian foot overbridge.'
    },
    {
      id: 'BS-102',
      name: 'Khandala Ghat Sharp Descent (Km 84-86)',
      highway: 'Mumbai-Pune Expressway',
      city: 'Lonavala',
      district: 'Pune',
      state: 'Maharashtra',
      lat: 18.7550,
      lng: 73.3768,
      totalAccidents: 158,
      fatalities: 42,
      injuries: 164,
      severityIndex: 9.8,
      primaryFactor: 'Brake Failure on Heavy Gradient & Monsoon Fog',
      speedLimit: 50,
      recommendedIntervention: 'Runaway truck ramps, thermal fog warning signage, high-friction friction course asphalt surface.'
    },
    {
      id: 'BS-103',
      name: 'Noida-Greater Noida Expressway Exit 4',
      highway: 'Yamuna Expressway Link',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      lat: 28.5133,
      lng: 77.3780,
      text: 'Sudden Exit Merge & Blind Spots',
      totalAccidents: 112,
      fatalities: 26,
      injuries: 98,
      severityIndex: 8.6,
      primaryFactor: 'Sudden Exit Merge & High-Speed Tailgating',
      speedLimit: 100,
      recommendedIntervention: 'Extended deceleration lane, solar rumble strips, LED lane delineation studs.'
    },
    {
      id: 'BS-104',
      name: 'Chingrighata Flyover Crossing',
      highway: 'EM Bypass',
      city: 'Kolkata',
      district: 'Kolkata',
      state: 'West Bengal',
      lat: 22.5645,
      lng: 88.3995,
      totalAccidents: 97,
      fatalities: 21,
      injuries: 89,
      severityIndex: 8.2,
      primaryFactor: 'Pedestrian Jaywalking & Signal Override',
      speedLimit: 50,
      recommendedIntervention: 'Full perimeter pedestrian barricading, automated signal timing with pedestrian priority phases.'
    },
    {
      id: 'BS-105',
      name: 'Gachibowli Outer Ring Road Interchange',
      highway: 'Nehru ORR (Km 18)',
      city: 'Hyderabad',
      district: 'Ranga Reddy',
      state: 'Telangana',
      lat: 17.4401,
      lng: 78.3489,
      totalAccidents: 139,
      fatalities: 34,
      injuries: 121,
      severityIndex: 9.1,
      primaryFactor: 'High Speed Night Driving & Drunk Driving',
      speedLimit: 120,
      recommendedIntervention: 'ANPR radar speed display boards, high-intensity LED illumination towers, nightly sobriety checkpoints.'
    }
  ];

  const bsStmt = db.prepare(`
    INSERT INTO blackspots (
      id, name, highway, city, district, state, lat, lng, totalAccidents, fatalities,
      injuries, severityIndex, primaryFactor, speedLimit, recommendedIntervention
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleBlackspots.forEach(bs => {
    bsStmt.run(
      bs.id, bs.name, bs.highway, bs.city, bs.district, bs.state, bs.lat, bs.lng,
      bs.totalAccidents, bs.fatalities, bs.injuries, bs.severityIndex, bs.primaryFactor,
      bs.speedLimit, bs.recommendedIntervention
    );
  });
  bsStmt.finalize();

  db.run(`
    INSERT INTO system_logs (id, action, details, timestamp)
    VALUES ('LOG-INIT', 'DB_INIT', 'Database seeded with 500+ Indian road safety records', datetime('now'))
  `);

  console.log('Blackspot seeding complete.');
}

export { db };
