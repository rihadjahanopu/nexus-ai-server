import multer from 'multer';
import path from 'path';

// Vercel's filesystem is read-only except /tmp — use memoryStorage for serverless
const isServerless = process.env.VERCEL || process.env.NOW_REGION;

const storage = isServerless
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: function (_req, _file, cb) {
        // Only reached in local dev — directory is pre-created by index.ts
        cb(null, path.join(process.cwd(), 'uploads'));
      },
      filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
      },
    });

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
