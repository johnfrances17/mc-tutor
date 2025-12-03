import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import {
  getMaterials,
  uploadMaterial,
  deleteMaterial,
  downloadMaterial,
} from '../controllers/materialController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
 destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb: any) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only document files are allowed'));
    }
  },
});

// Get materials (with filters)
router.get('/', authMiddleware, getMaterials);

// Upload material (tutor only)
router.post('/upload', authMiddleware, roleMiddleware(['tutor']), upload.single('file'), uploadMaterial);

// Download material
router.get('/:id/download', authMiddleware, downloadMaterial);

// Delete material (tutor only)
router.delete('/:id', authMiddleware, roleMiddleware(['tutor']), deleteMaterial);

export default router;
