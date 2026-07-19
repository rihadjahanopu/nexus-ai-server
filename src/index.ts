import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import chatRoutes from './routes/chatRoutes';
import itemRoutes from './routes/itemRoutes';

// Load environment variables (no-op on Vercel where they're set via dashboard)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create local uploads directory in dev only (Vercel FS is read-only)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow any localhost port in development
      const localhostRegex = /^http:\/\/localhost:\d+$/;
      if (localhostRegex.test(origin)) return callback(null, true);
      // Allow configured CLIENT_URL in production
      if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
        return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// DB Connection Middleware (Crucial for Serverless + bufferCommands: false)
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/items', itemRoutes);

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Nexus API', status: 'ok' });
});

// Global error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server (dev only — Vercel handles the lifecycle itself)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to DB:', err.message);
    });
}

export default app;
