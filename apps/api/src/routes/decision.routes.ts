import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DecisionRun } from '../models/DecisionRun';
import { Zone } from '../models/Zone';
import { Farm } from '../models/Farm';
import { Reading } from '../models/Reading';
import { callEngineEvaluate } from '../services/engineClient';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// --- Public Evaluation Endpoint (For Landing Page Interactive Demo) ---
const PublicEvaluateSchema = z.object({
  cropName: z.string().default('wheat'),
  growthStage: z.string().default('development'),
  soilType: z.string().default('loam'),
  soilMoisture: z.number().nullable().optional(),
  temperature: z.number().nullable().optional(),
  humidity: z.number().nullable().optional(),
  rainfall: z.number().nullable().optional()
});

router.post('/public-evaluate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = PublicEvaluateSchema.parse(req.body);

    const enginePayload = {
      zone_id: 'public-demo-zone',
      crop_name: data.cropName,
      growth_stage: data.growthStage,
      soil_type: data.soilType,
      soil_moisture: data.soilMoisture,
      soil_moisture_source: 'simulated',
      temperature: data.temperature,
      temperature_source: 'simulated',
      humidity: data.humidity,
      humidity_source: 'simulated',
      rainfall: data.rainfall,
      rainfall_source: 'simulated',
      weather_age_seconds: 0,
      timestamp: new Date().toISOString(),
      latitude_deg: 28.6139,
      root_depth_m: 1.0
    };

    const engineResult = await callEngineEvaluate(enginePayload);

    res.json({
      ...engineResult,
      isDemo: true,
      notice: 'SIMULATED DEMO EVALUATION • No live field sensors attached'
    });
  } catch (err) {
    next(err);
  }
});

// All subsequent routes require authentication
router.use(authMiddleware);

const RunDecisionSchema = z.object({
  zoneId: z.string(),
  soilMoisture: z.number().nullable().optional(),
  soilMoistureSource: z.string().optional(),
  temperature: z.number().nullable().optional(),
  temperatureSource: z.string().optional(),
  humidity: z.number().nullable().optional(),
  humiditySource: z.string().optional(),
  rainfall: z.number().nullable().optional(),
  rainfallSource: z.string().optional(),
  weatherAgeSeconds: z.number().optional(),
  weatherForecast: z.any().optional()
});

router.post('/evaluate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = RunDecisionSchema.parse(req.body);
    const zone = await Zone.findById(data.zoneId);
    if (!zone) {
      res.status(404).json({ error: 'Zone not found.' });
      return;
    }
    const farm = await Farm.findById(zone.farmId);
    if (!farm) {
      res.status(404).json({ error: 'Farm not found.' });
      return;
    }

    // Pull recent 10 historical soil moisture readings for MAD spike detection
    const recentReadings = await Reading.find({ zoneId: zone._id })
      .sort({ timestamp: -1 })
      .limit(10);

    const recentMoistures = recentReadings
      .map(r => r.soilMoisture?.value)
      .filter((v): v is number => typeof v === 'number');

    // Prepare payload for FastAPI Decision Engine
    const enginePayload = {
      zone_id: zone._id.toString(),
      crop_name: zone.cropName,
      growth_stage: zone.growthStage,
      soil_type: zone.soilType,
      soil_moisture: data.soilMoisture,
      soil_moisture_source: data.soilMoistureSource || 'measured',
      temperature: data.temperature,
      temperature_source: data.temperatureSource || 'measured',
      humidity: data.humidity,
      humidity_source: data.humiditySource || 'measured',
      rainfall: data.rainfall,
      rainfall_source: data.rainfallSource || 'measured',
      weather_age_seconds: data.weatherAgeSeconds || 0,
      timestamp: new Date().toISOString(),
      recent_moisture_history: recentMoistures,
      weather_forecast: data.weatherForecast,
      latitude_deg: farm.location.latitude,
      root_depth_m: zone.rootDepthM
    };

    // Execute Python Decision Engine
    const engineResult = await callEngineEvaluate(enginePayload);

    // Save immutable DecisionRun snapshot
    const runDoc = await DecisionRun.create({
      farmId: farm._id,
      zoneId: zone._id,
      timestamp: new Date(),
      engineVersion: engineResult.engine_version,
      decision: engineResult.decision,
      confidenceBand: engineResult.confidence_band,
      abstentionReason: engineResult.abstention_reason,
      reliabilityScore: engineResult.reliability.reliability_score,
      reliabilityStatus: engineResult.reliability.status_category,
      penalties: engineResult.reliability.penalties,
      waterBalance: {
        drMm: engineResult.water_balance.dr_mm,
        rawMm: engineResult.water_balance.raw_mm,
        tawMm: engineResult.water_balance.taw_mm,
        etcMm: engineResult.water_balance.etc_mm,
        pEffMm: engineResult.water_balance.p_eff_mm,
        netIrrigationReqMm: engineResult.water_balance.net_irrigation_req_mm,
        stressRatio: engineResult.water_balance.stress_ratio,
        underwateringRiskPct: engineResult.water_balance.underwatering_risk_pct,
        overwateringRiskPct: engineResult.water_balance.overwatering_risk_pct
      },
      uncertainty: {
        pIrrigate: engineResult.uncertainty.p_irrigate,
        drInterval90: engineResult.uncertainty.dr_interval_90,
        straddlesRawThreshold: engineResult.uncertainty.straddles_raw_threshold
      },
      explanation: {
        summary: engineResult.explanation.summary,
        drivers: engineResult.explanation.drivers,
        counterfactuals: engineResult.explanation.counterfactuals,
        uncertainInputs: engineResult.explanation.uncertain_inputs
      },
      inputsSnapshot: engineResult.provenance,
      isDemo: zone.isDemo
    });

    res.status(200).json({
      runId: runDoc._id,
      ...engineResult
    });
  } catch (err) {
    next(err);
  }
});

// Get decision runs for zone
router.get('/history/zone/:zoneId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const runs = await DecisionRun.find({ zoneId: req.params.zoneId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ runs });
  } catch (err) {
    next(err);
  }
});

// Get all recent decision runs for a farm
router.get('/history/farm/:farmId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit as string) || 30);
    const runs = await DecisionRun.find({ farmId: req.params.farmId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ runs });
  } catch (err) {
    next(err);
  }
});

export default router;

