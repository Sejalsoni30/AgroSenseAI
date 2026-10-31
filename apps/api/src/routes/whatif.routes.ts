import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Zone } from '../models/Zone';
import { Farm } from '../models/Farm';
import { Reading } from '../models/Reading';
import { callEngineWhatIf } from '../services/engineClient';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const WhatIfSchema = z.object({
  zoneId: z.string(),
  currentInputs: z.object({
    soilMoisture: z.number().nullable().optional(),
    temperature: z.number().nullable().optional(),
    humidity: z.number().nullable().optional(),
    rainfall: z.number().nullable().optional()
  }),
  modifications: z.object({
    rainfall: z.number().nullable().optional(),
    temperature_delta: z.number().optional(),
    soil_moisture: z.number().nullable().optional(),
    growth_stage: z.string().optional(),
    sensor_offline: z.boolean().optional()
  })
});

router.post('/simulate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = WhatIfSchema.parse(req.body);
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

    const baselinePayload = {
      zone_id: zone._id.toString(),
      crop_name: zone.cropName,
      growth_stage: zone.growthStage,
      soil_type: zone.soilType,
      soil_moisture: data.currentInputs.soilMoisture,
      temperature: data.currentInputs.temperature,
      humidity: data.currentInputs.humidity,
      rainfall: data.currentInputs.rainfall,
      latitude_deg: farm.location.latitude,
      root_depth_m: zone.rootDepthM
    };

    const simulationResult = await callEngineWhatIf(baselinePayload, data.modifications);

    res.json(simulationResult);
  } catch (err) {
    next(err);
  }
});

export default router;

