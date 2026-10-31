import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1) {
    return; // Already connected
  }

  const uri = process.env.MONGODB_URI;

  try {
    if (uri) {
      await mongoose.connect(uri);
      console.log(`[Database] Connected to external MongoDB at ${uri.split('@')[1] || uri}`);
    } else {
      console.log('[Database] MONGODB_URI not provided. Initializing in-memory MongoDB Server...');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] In-memory MongoDB connected successfully at ${memoryUri}`);
    }
  } catch (err) {
    console.warn('[Database] Failed to connect to primary MongoDB, falling back to MongoMemoryServer...', err);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] In-memory MongoDB connected fallback successfully at ${memoryUri}`);
    } catch (fallbackErr) {
      console.error('[Database] Fatal: Unable to initialize any MongoDB instance.', fallbackErr);
      process.exit(1);
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
