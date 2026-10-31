import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import farmRoutes from './routes/farm.routes';
import readingRoutes from './routes/reading.routes';
import weatherRoutes from './routes/weather.routes';
import decisionRoutes from './routes/decision.routes';
import feedbackRoutes from './routes/feedback.routes';
import whatifRoutes from './routes/whatif.routes';
import contactRoutes from './routes/contact.routes';
import { seedDatabase } from './seed/seedData';
import { Farm } from './models/Farm';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow Vite dev server in dev mode
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting (120 requests per minute)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' }
});
app.use('/api/', limiter);

// Root health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AgroSenseAI API Gateway',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/whatif', whatifRoutes);
app.use('/api/contact', contactRoutes);

// Centralized error handling
app.use(errorHandler);

// Start server
async function startServer() {
  await connectDB();

  // Auto-seed demo data if database is fresh/empty
  const farmCount = await Farm.countDocuments();
  if (farmCount === 0) {
    console.log('[API Server] Fresh database detected. Auto-seeding DEMO DATA...');
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`[API Server] AgroSenseAI Backend listening on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[API Server] Failed to start:', err);
});

export default app;
