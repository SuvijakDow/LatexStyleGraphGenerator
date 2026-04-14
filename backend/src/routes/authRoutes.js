import express from 'express';
import { registerUser, loginUser, googleLogin, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.put('/profile', protect, updateProfile);

export default router;
