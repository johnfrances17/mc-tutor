import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getUserByStudentId,
  changePassword,
} from '../controllers/userController';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Get current user profile
router.get('/profile', authMiddleware, getProfile);

// Update profile
router.put('/profile', authMiddleware, updateProfile);

// Upload profile picture
router.post('/profile/picture', authMiddleware, upload.single('profile_picture'), uploadProfilePicture);

// Get user by student ID
router.get('/:studentId', getUserByStudentId);

// Change password
router.put('/password', authMiddleware, changePassword);

export default router;
