import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Farm } from '../models/Farm';
import { Zone } from '../models/Zone';
import { Reading } from '../models/Reading';
import { DecisionRun } from '../models/DecisionRun';

export async function seedDatabase() {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  console.log('[Seed] Clearing existing demo data...');
  await User.deleteMany({ email: 'demo@agrosense.ai' });
  await Farm.deleteMany({ isDemo: true });
  await Zone.deleteMany({ isDemo: true });
  await Reading.deleteMany({ isDemo: true });
  await DecisionRun.deleteMany({ isDemo: true });

  console.log('[Seed] Creating demo user...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('demo123', salt);

  const demoUser = await User.create({
    email: 'demo@agrosense.ai',
    passwordHash,
    name: 'Dr. Ramesh Sharma (Demo Agronomist)',
    role: 'agronomist',
    preferredLanguage: 'en'
  });

  console.log('[Seed] Creating demo farms...');
  const farm1 = await Farm.create({
    userId: demoUser._id,
    name: '[DEMO DATA] Greenfield Agro-Hydrology Station',
    location: {
      address: 'IARI Research Pusa, New Delhi, India',
      latitude: 28.636,
      longitude: 77.155,
      altitudeM: 220
    },
    totalAreaHa: 14.5,
    isDemo: true,
    source: 'demo'
  });

  const farm2 = await Farm.create({
    userId: demoUser._id,
    name: '[DEMO DATA] Punjab Precision Irrigation Testbed',
    location: {
      address: 'Ludhiana Agricultural Belt, Punjab, India',
      latitude: 30.901,
      longitude: 75.857,
      altitudeM: 244
    },
    totalAreaHa: 22.0,
    isDemo: true,
    source: 'demo'
  });

  console.log('[Seed] Creating demo zones with diverse soil textures & crops...');
  const zone1 = await Zone.create({
    farmId: farm1._id,
    name: '[DEMO DATA] Zone A1 - Clay Loam Wheat (Mid Season)',
    soilType: 'clay_loam',
    cropName: 'wheat',
    growthStage: 'mid',
    areaHa: 4.5,
    rootDepthM: 1.1,
    irrigationType: 'drip',
    sensorId: 'SENSOR-DLH-01',
    isDemo: true,
    source: 'demo'
  });

  const zone2 = await Zone.create({
    farmId: farm1._id,
    name: '[DEMO DATA] Zone A2 - Sandy Loam Tomato (Development)',
    soilType: 'sandy_loam',
    cropName: 'tomato',
    growthStage: 'development',
    areaHa: 3.0,
    rootDepthM: 0.8,
    irrigationType: 'drip',
    sensorId: 'SENSOR-DLH-02',
    isDemo: true,
    source: 'demo'
  });

  const zone3 = await Zone.create({
    farmId: farm2._id,
    name: '[DEMO DATA] Sector P1 - Loam Cotton (Development)',
    soilType: 'loam',
    cropName: 'cotton',
    growthStage: 'development',
    areaHa: 8.0,
    rootDepthM: 1.2,
    irrigationType: 'sprinkler',
    sensorId: 'SENSOR-PB-01',
    isDemo: true,
    source: 'demo'
  });

  console.log('[Seed] Populating historical demo telemetry readings (past 7 days)...');
  const now = Date.now();
  const readingsToInsert = [];

  // Generate 7 days of realistic readings for Zone 1 (gradual drydown curve)
  for (let d = 7; d >= 0; d--) {
    const timestamp = new Date(now - d * 24 * 3600 * 1000);
    // Soil moisture dries down from 0.30 to 0.20
    const moisture = Math.max(0.18, 0.30 - (7 - d) * 0.015);
    readingsToInsert.push({
      zoneId: zone1._id,
      farmId: farm1._id,
      timestamp,
      soilMoisture: { value: Math.round(moisture * 1000) / 1000, unit: 'm3/m3', source: 'demo' },
      temperature: { value: 29.5 + Math.sin(d) * 3, unit: 'degC', source: 'demo' },
      humidity: { value: 45 + Math.cos(d) * 10, unit: '%', source: 'demo' },
      rainfall: { value: d === 3 ? 4.5 : 0.0, unit: 'mm', source: 'demo' },
      isDemo: true,
      notes: '[DEMO DATA] Synthesized calibration test telemetry'
    });
  }

  // Generate readings for Zone 2 (sandy loam tomato, faster drydown)
  for (let d = 7; d >= 0; d--) {
    const timestamp = new Date(now - d * 24 * 3600 * 1000);
    const moisture = Math.max(0.10, 0.17 - (7 - d) * 0.01);
    readingsToInsert.push({
      zoneId: zone2._id,
      farmId: farm1._id,
      timestamp,
      soilMoisture: { value: Math.round(moisture * 1000) / 1000, unit: 'm3/m3', source: 'demo' },
      temperature: { value: 30.0 + Math.sin(d) * 2, unit: 'degC', source: 'demo' },
      humidity: { value: 42 + Math.cos(d) * 8, unit: '%', source: 'demo' },
      rainfall: { value: d === 3 ? 4.5 : 0.0, unit: 'mm', source: 'demo' },
      isDemo: true,
      notes: '[DEMO DATA] Synthesized tomato root-zone telemetry'
    });
  }

  await Reading.insertMany(readingsToInsert);

  console.log('[Seed] Populating initial demo DecisionRun snapshot...');
  await DecisionRun.create({
    farmId: farm1._id,
    zoneId: zone1._id,
    timestamp: new Date(),
    engineVersion: '1.0.0-fao56',
    decision: 'IRRIGATE',
    confidenceBand: 'HIGH',
    reliabilityScore: 0.95,
    reliabilityStatus: 'HIGH_CONFIDENCE',
    penalties: [],
    waterBalance: {
      drMm: 72.5,
      rawMm: 68.2,
      tawMm: 165.0,
      etcMm: 5.4,
      pEffMm: 0.0,
      netIrrigationReqMm: 72.5,
      stressRatio: 1.06,
      underwateringRiskPct: 4.4,
      overwateringRiskPct: 0.0
    },
    uncertainty: {
      pIrrigate: 0.89,
      drInterval90: {
        lower: 66.4,
        median: 72.1,
        upper: 78.6,
        widthMm: 12.2
      },
      straddlesRawThreshold: false
    },
    explanation: {
      summary: {
        en: 'Irrigation is recommended. The crop root zone has depleted 72.5 mm, exceeding the safe allowable limit (68.2 mm).',
        hi: 'सिंचाई की सलाह दी जाती है। फसल की जड़ों में 72.5 मिमी पानी की कमी हो गई है, जो सुरक्षित सीमा (68.2 मिमी) से अधिक है।'
      },
      drivers: [
        { name: 'Soil Moisture Deficit (Dr)', value_mm: 72.5, importance: 1.0, impact: 'Increases irrigation requirement' },
        { name: 'Crop Water Demand (ETc)', value_mm: 5.4, importance: 0.54, impact: 'Daily atmospheric water loss' }
      ],
      counterfactuals: [
        {
          trigger: 'Incoming rainfall reaches 5.3 mm before watering',
          trigger_hi: 'सिंचाई से पहले 5.3 मिमी बारिश हो जाती है',
          current_value: '0.0 mm',
          flips_decision_to: 'NO_IRRIGATION_NEEDED'
        }
      ],
      uncertainInputs: []
    },
    inputsSnapshot: {
      soil_moisture: { value: 0.20, unit: 'm3/m3', source: 'demo' },
      temperature: { value: 31.0, unit: 'degC', source: 'demo' },
      humidity: { value: 40.0, unit: '%', source: 'demo' },
      rainfall: { value: 0.0, unit: 'mm', source: 'demo' }
    },
    isDemo: true
  });

  console.log('[Seed] Database successfully seeded with demo entities!');
  console.log('Demo Login Credentials:');
  console.log('  Email:    demo@agrosense.ai');
  console.log('  Password: demo123');
}

if (require.main === module) {
  seedDatabase()
    .then(() => disconnectDB())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

