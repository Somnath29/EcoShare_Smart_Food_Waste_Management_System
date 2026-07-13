import { Router } from 'express';
import {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood,
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
  restrictTo('Kitchen Staff', 'Admin'),
  validateCreateFood,
  createFood
);

router.get('/', protect, getAllFoods);

router.get('/:id', protect, getFoodById);

router.put(
  '/:id',
  protect,
  restrictTo('Kitchen Staff', 'Admin'),
  validateUpdateFood,
  updateFood
);

router.delete(
  '/:id',
  protect,
  restrictTo('Kitchen Staff', 'Admin'),
  deleteFood
);

export default router;
