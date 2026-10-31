import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Farm } from '../models/Farm';
import { Zone } from '../models/Zone';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// --- Farm Endpoints ---
const FarmCreateSchema = z.object({
  name: z.string().min(2),
  location: z.object({
    address: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
    altitudeM: z.number().optional()
  }),
  totalAreaHa: z.number().positive().optional()
});

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const farms = await Farm.find({ userId: req.user?.id }).sort({ createdAt: -1 });
    res.json({ farms });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = FarmCreateSchema.parse(req.body);
    const farm = await Farm.create({
      ...data,
      userId: req.user?.id,
      source: 'manual',
      isDemo: false
    });
    res.status(201).json({ farm });
  } catch (err) {
    next(err);
  }
});

router.get('/:farmId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.farmId, userId: req.user?.id });
    if (!farm) {
      res.status(404).json({ error: 'Farm not found.' });
      return;
    }
    const zones = await Zone.find({ farmId: farm._id });
    res.json({ farm, zones });
  } catch (err) {
    next(err);
  }
});

router.delete('/:farmId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.farmId, userId: req.user?.id });
    if (!farm) {
      res.status(404).json({ error: 'Farm not found.' });
      return;
    }
    await Zone.deleteMany({ farmId: farm._id });
    res.json({ message: 'Farm and associated zones deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// --- Zone Endpoints ---
const ZoneCreateSchema = z.object({
  farmId: z.string(),
  name: z.string().min(2),
  soilType: z.enum(['sandy', 'sandy_loam', 'loam', 'clay_loam', 'silty_clay', 'clay']),
  cropName: z.string().min(2),
  growthStage: z.enum(['initial', 'development', 'mid', 'late']),
  areaHa: z.number().positive(),
  rootDepthM: z.number().positive(),
  irrigationType: z.enum(['drip', 'sprinkler', 'flood', 'furrow']).optional(),
  sensorId: z.string().optional()
});

router.post('/zones', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = ZoneCreateSchema.parse(req.body);
    const farm = await Farm.findOne({ _id: data.farmId, userId: req.user?.id });
    if (!farm) {
      res.status(404).json({ error: 'Associated farm not found.' });
      return;
    }

    const zone = await Zone.create({
      ...data,
      isDemo: farm.isDemo,
      source: 'manual'
    });
    res.status(201).json({ zone });
  } catch (err) {
    next(err);
  }
});

router.get('/zones/:zoneId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zone = await Zone.findById(req.params.zoneId);
    if (!zone) {
      res.status(404).json({ error: 'Zone not found.' });
      return;
    }
    res.json({ zone });
  } catch (err) {
    next(err);
  }
});

router.put('/zones/:zoneId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.zoneId, req.body, { new: true });
    if (!zone) {
      res.status(404).json({ error: 'Zone not found.' });
      return;
    }
    res.json({ zone });
  } catch (err) {
    next(err);
  }
});

router.delete('/zones/:zoneId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.zoneId);
    if (!zone) {
      res.status(404).json({ error: 'Zone not found.' });
      return;
    }
    res.json({ message: 'Zone deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;

