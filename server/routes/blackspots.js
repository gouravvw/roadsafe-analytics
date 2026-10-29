import express from 'express';
import { Accident } from '../models/Accident.js';

const router = express.Router();

// GET /api/blackspots - Dynamically calculate high density blackspots
router.get('/', async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: { $concat: ["$roadType", " near ", "$city"] },
          totalAccidents: { $sum: 1 },
          fatalities: { $sum: "$fatalities" },
          injuries: { $sum: "$injuries" },
          lat: { $first: "$lat" },
          lng: { $first: "$lng" },
          city: { $first: "$city" },
          district: { $first: "$district" },
          state: { $first: "$state" },
          highway: { $first: "$roadType" },
          primaryFactor: { $first: "$primaryCause" },
          speedLimit: { $first: "$speedLimit" }
        }
      },
      {
        $addFields: {
          severityIndex: { 
            $round: [{ $multiply: [{ $divide: [{ $add: [{ $multiply: ["$fatalities", 3] }, "$injuries"] }, "$totalAccidents"] }, 2] }, 1] 
          }
        }
      },
      {
        $sort: { severityIndex: -1, totalAccidents: -1 }
      },
      {
        $limit: 15
      }
    ];
    const results = await Accident.aggregate(pipeline).allowDiskUse(true);
    
    const getMitigation = (cause) => {
      switch (cause) {
        case 'Overspeeding': return 'Install Speed Cameras, Breakers & Enforce Strict Fines';
        case 'Drunk Driving': return 'Increase Breathalyzer Checks & Police Patrols at Night';
        case 'Road Defect/Pothole': return 'Immediate Road Resurfacing & Infrastructure Maintenance';
        case 'Weather Effect': return 'Improve Signage, Cat Eyes, & High-Visibility Street Lighting';
        case 'Distracted Driving': return 'Driver Awareness Campaigns & Stricter Highway Patrolling';
        case 'Signal Jumping': return 'Install Red Light Cameras & Automated E-Challan Systems';
        case 'Wrong Side Driving': return 'Deploy Tyre Killers & Strict Surveillance on Intersections';
        default: return 'Install Speed Cameras & Improve Lighting';
      }
    };

    // Map to expected frontend format
    const blackspots = results.map((r, index) => ({
      id: `BS-ID-${100 + index}`,
      name: r._id,
      highway: r.highway,
      city: r.city,
      district: r.district,
      state: r.state,
      lat: r.lat,
      lng: r.lng,
      totalAccidents: r.totalAccidents,
      fatalities: r.fatalities,
      injuries: r.injuries,
      severityIndex: r.severityIndex > 10 ? 10 : r.severityIndex,
      primaryFactor: r.primaryFactor,
      speedLimit: r.speedLimit,
      recommendedMitigation: getMitigation(r.primaryFactor)
    }));

    res.json(blackspots);
  } catch (error) {
    console.error('Error calculating blackspots:', error);
    res.status(500).json({ error: 'Failed to calculate dynamic blackspots' });
  }
});

// GET /api/blackspots/:id - Not needed anymore since we just use the list, but kept for compatibility
router.get('/:id', (req, res) => {
  res.status(404).json({ error: 'Single dynamic blackspot fetch not implemented' });
});

export default router;
