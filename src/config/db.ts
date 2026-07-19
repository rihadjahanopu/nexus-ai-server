import mongoose from 'mongoose';

// Cache connection across serverless warm invocations
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus';

  try {
    const conn = await mongoose.connect(uri, {
      bufferCommands: false,        // fail fast instead of queueing ops
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    // Log but do NOT call process.exit() — it crashes the Vercel Lambda
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;  // let the caller (index.ts) decide what to do
  }
};
