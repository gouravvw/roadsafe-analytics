import express from 'express';

const router = express.Router();

// POST /api/risk-calculator/predict - Algorithmic risk evaluation engine
router.post('/predict', (req, res) => {
  const {
    roadType = 'Expressway',
    speedLimit = 80,
    estimatedSpeed = 100,
    weather = 'Clear',
    lighting = 'Daylight',
    surfaceCondition = 'Dry',
    vehicleType = 'Two-Wheeler',
    driverAgeGroup = '18-24',
    safetyGearUsed = false
  } = req.body;

  // Baseline risk score
  let baseScore = 20;

  // 1. Speed Delta Risk
  const speedDiff = estimatedSpeed - speedLimit;
  let speedRisk = 0;
  if (speedDiff > 0) {
    speedRisk = Math.min(40, speedDiff * 1.5);
  }

  // 2. Weather Risk
  let weatherRisk = 5;
  if (weather === 'Heavy Rain') weatherRisk = 18;
  else if (weather === 'Dense Fog') weatherRisk = 25;
  else if (weather === 'Dust Storm' || weather === 'Storm') weatherRisk = 20;

  // 3. Lighting & Surface Risk
  let environmentRisk = 5;
  if (lighting === 'Dark Unlit') environmentRisk += 15;
  else if (lighting === 'Dusk/Dawn') environmentRisk += 8;

  if (surfaceCondition === 'Waterlogged' || surfaceCondition === 'Wet') environmentRisk += 12;
  else if (surfaceCondition === 'Gravel') environmentRisk += 15;

  // 4. Vehicle Vulnerability Risk
  let vehicleRisk = 10;
  if (vehicleType === 'Two-Wheeler') vehicleRisk = 22;
  else if (vehicleType === 'Commercial/Auto') vehicleRisk = 16;
  else if (vehicleType === 'Pedestrian') vehicleRisk = 30;

  // 5. Driver Demographics & Safety Gear Risk
  let driverRisk = 5;
  if (driverAgeGroup === '18-24') driverRisk += 10;
  if (!safetyGearUsed) driverRisk += 15;

  // Aggregate Total Risk Score (0 - 100 max)
  let rawScore = baseScore + speedRisk + weatherRisk + environmentRisk + vehicleRisk + driverRisk;
  const riskScore = Math.min(99.9, Math.max(10.0, rawScore));

  // Determine Risk Tier
  let riskTier = 'Low Risk';
  let badgeColor = 'emerald';
  if (riskScore >= 75) {
    riskTier = 'Critical Danger';
    badgeColor = 'crimson';
  } else if (riskScore >= 50) {
    riskTier = 'High Risk';
    badgeColor = 'amber';
  } else if (riskScore >= 35) {
    riskTier = 'Moderate Risk';
    badgeColor = 'sapphire';
  }

  // Engineering & Behavioral Countermeasures
  const countermeasures = [];
  if (speedDiff > 0) {
    countermeasures.push(`Reduce vehicle speed by at least ${speedDiff} km/h to match design speed limit (${speedLimit} km/h).`);
    countermeasures.push('Deploy radar speed feedback indicators & automated speed enforcement.');
  }
  if (weather === 'Dense Fog' || weather === 'Heavy Rain') {
    countermeasures.push('Activate high-visibility hazard lights & reduce travel speed by 30%.');
    countermeasures.push('Install thermal fog sensors & illuminated cat-eye road delineators.');
  }
  if (!safetyGearUsed) {
    countermeasures.push('Mandatory use of ISI-certified helmets or seatbelts (Reduces fatality rate by ~45%).');
  }
  if (lighting === 'Dark Unlit') {
    countermeasures.push('Install solar-powered LED streetlights along unlit corridor segments.');
  }

  res.json({
    riskScore: Number(riskScore.toFixed(1)),
    riskTier,
    badgeColor,
    factorBreakdown: {
      speedRisk: Number(speedRisk.toFixed(1)),
      weatherRisk: Number(weatherRisk.toFixed(1)),
      environmentRisk: Number(environmentRisk.toFixed(1)),
      vehicleRisk: Number(vehicleRisk.toFixed(1)),
      driverRisk: Number(driverRisk.toFixed(1))
    },
    countermeasures
  });
});

export default router;
