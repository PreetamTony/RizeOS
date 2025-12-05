import express from 'express';
import {
  firebaseLogin,
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  updateDetails,
  updatePassword,
  verifyEmail
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verifyemail/:verificationtoken', verifyEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/firebase-login', firebaseLogin);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.get('/logout', logout);
router.put('/updatedetails', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'avatar', maxCount: 1 }
]), updateDetails);
router.put('/updatepassword', updatePassword);

export default router;
