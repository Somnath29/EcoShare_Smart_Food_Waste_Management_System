import { Router } from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../validators/authValidator.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);
router.get('/me', protect, getMe);

// Admin User Management Routes
router.get('/users', protect, restrictTo('Admin'), getAllUsers);
router.patch('/users/:id/role', protect, restrictTo('Admin'), updateUserRole);
router.delete('/users/:id', protect, restrictTo('Admin'), deleteUser);

export default router;
