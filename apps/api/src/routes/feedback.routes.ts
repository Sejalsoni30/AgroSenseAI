import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FarmerFeedback } from '../models/FarmerFeedback';
import { DecisionRun } from '../models/DecisionRun';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const FeedbackSchema = z.object({
  runId: z.string(),
  agreedWithRecommendation: z.boolean(),
  actualActionTaken: z.enum(['IRRIGATED', 'DID_NOT_IRRIGATE', 'OTHER']),
  waterAppliedMm: z.number().positive().optional(),
  farmerObservation: z.string().optional()
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = FeedbackSchema.parse(req.body);
    const run = await DecisionRun.findById(data.runId);
    if (!run) {
      res.status(404).json({ error: 'Associated decision run not found.' });
      return;
    }

    const feedback = await FarmerFeedback.create({
      runId: run._id,
      zoneId: run.zoneId,
      farmId: run.farmId,
      userId: req.user?.id,
      agreedWithRecommendation: data.agreedWithRecommendation,
      actualActionTaken: data.actualActionTaken,
      waterAppliedMm: data.waterAppliedMm,
      farmerObservation: data.farmerObservation,
      verifiedByAgronomist: false,
      usedForRetraining: false, // Rule #6: Strict no auto-retraining on unverified farmer feedback
      isDemo: run.isDemo
    });

    res.status(201).json({
      message: 'Feedback submitted successfully. Thank you for helping verify decision quality.',
      feedback
    });
  } catch (err) {
    next(err);
  }
});

router.get('/run/:runId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const feedbacks = await FarmerFeedback.find({ runId: req.params.runId });
    res.json({ feedbacks });
  } catch (err) {
    next(err);
  }
});

export default router;

