import { Router } from 'express';
import { register, login, getMe, logout, googleLogin, updateProfile, updatePassword, updateAvatar } from '../controllers/authController';
import { protect } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/avatar', protect, upload.single('avatar'), updateAvatar);

export default router;
