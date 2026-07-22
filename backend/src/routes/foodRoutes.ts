import { Router } from 'express';
import {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
  reserveFood,
  cancelReservation,
  collectFood,
} from '../controllers/foodController.js';
import {
  validateCreateFood,
  validateUpdateFood,
} from '../validators/foodValidator.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

// Routes definitions
router.post(
  '/',
  protect,
  restrictTo('Kitchen Staff', 'Admin', 'Volunteer'),
  validateCreateFood,
  createFood
);

router.get('/', protect, getAllFoods);

router.get('/:id', protect, getFoodById);

router.put(
  '/:id',
  protect,
  restrictTo('Kitchen Staff', 'Admin', 'Volunteer'),
  validateUpdateFood,
  updateFood
);

router.delete(
  '/:id',
  protect,
  restrictTo('Kitchen Staff', 'Admin', 'Volunteer'),
  deleteFood
);

router.patch('/:id/reserve', protect, reserveFood);
router.patch('/:id/cancel', protect, cancelReservation);
router.patch('/:id/collect', protect, collectFood);

export default router;
