import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Reading } from '../models/Reading';
import { Zone } from '../models/Zone';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const TelemetryItemSchema = z.object({
  value: z.number().nullable(),
  unit: z.string(),
  source: z.enum(['measured', 'manual', 'api', 'estimated', 'simulated', 'demo']).default('measured'),
  ageSeconds: z.number().optional(),
  isEstimated: z.boolean().optional()
});

const SingleReadingSchema = z.object({
  zoneId: z.string(),
  farmId: z.string(),
  timestamp: z.string().optional(),
  soilMoisture: TelemetryItemSchema,
  temperature: TelemetryItemSchema,
  humidity: TelemetryItemSchema,
  rainfall: TelemetryItemSchema,
  notes: z.string().optional()
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = SingleReadingSchema.parse(req.body);
    const zone = await Zone.findById(data.zoneId);
    if (!zone) {
      res.status(404).json({ error: 'Zone not found.' });
      return;
    }

    const reading = await Reading.create({
      zoneId: data.zoneId,
      farmId: data.farmId,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      soilMoisture: data.soilMoisture,
      temperature: data.temperature,
      humidity: data.humidity,
      rainfall: data.rainfall,
      notes: data.notes,
      isDemo: zone.isDemo
    });

    res.status(201).json({ reading });
  } catch (err) {
    next(err);
  }
});

// CSV Batch Import
router.post('/csv-import', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { zoneId, farmId, rows } = req.body;
    if (!zoneId || !farmId || !Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ error: 'zoneId, farmId and rows array are required for CSV import.' });
      return;
    }

    const zone = await Zone.findById(zoneId);
    if (!zone) {
      res.status(404).json({ error: 'Zone not found.' });
      return;
    }

    const createdReadings = [];
    for (const r of rows) {
      const smVal = parseFloat(r.soil_moisture);
      const tempVal = parseFloat(r.temperature);
      const rhVal = parseFloat(r.humidity);
      const rainVal = parseFloat(r.rainfall);

      const readingDoc = await Reading.create({
        zoneId,
        farmId,
        timestamp: r.timestamp ? new Date(r.timestamp) : new Date(),
        soilMoisture: {
          value: isNaN(smVal) ? null : (smVal > 1.0 ? smVal / 100.0 : smVal),
          unit: 'm3/m3',
          source: r.source || 'manual',
          isEstimated: r.source === 'estimated'
        },
        temperature: {
          value: isNaN(tempVal) ? null : tempVal,
          unit: 'degC',
          source: r.source || 'manual'
        },
        humidity: {
          value: isNaN(rhVal) ? null : rhVal,
          unit: '%',
          source: r.source || 'manual'
        },
        rainfall: {
          value: isNaN(rainVal) ? null : rainVal,
          unit: 'mm',
          source: r.source || 'manual'
        },
        notes: 'Imported via CSV batch upload',
        isDemo: zone.isDemo
      });
      createdReadings.push(readingDoc);
    }

    res.status(201).json({
      message: `Successfully imported ${createdReadings.length} readings.`,
      count: createdReadings.length
    });
  } catch (err) {
    next(err);
  }
});

// Get readings for a zone
router.get('/zone/:zoneId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit as string) || 30);
    const readings = await Reading.find({ zoneId: req.params.zoneId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({ readings });
  } catch (err) {
    next(err);
  }
});

export default router;

