import { Response, NextFunction } from 'express';
import { Food } from '../models/Food.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const createFood = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to log food items',
      });
      return;
    }

    const {
      title,
      description,
      category,
      quantity,
      unit,
      expiryTime,
      pickupLocation,
      latitude,
      longitude,
      image,
      status,
    } = req.body;

    const food = await Food.create({
      title,
      description,
      category,
      quantity,
      unit,
      expiryTime,
      pickupLocation,
      latitude,
      longitude,
      image,
      status: status || 'Available',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Food item logged successfully',
      food,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFoods = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, status, createdBy } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    // Return foods populated with creator's name and email
    const foods = await Food.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    next(error);
  }
};

export const getFoodById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const food = await Food.findById(id).populate('createdBy', 'name email role');
    if (!food) {
      res.status(404).json({
        success: false,
        message: `Food item not found with id: ${id}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFood = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to update food listings',
      });
      return;
    }

    const food = await Food.findById(id);
    if (!food) {
      res.status(404).json({
        success: false,
        message: `Food item not found with id: ${id}`,
      });
      return;
    }

    // Check ownership or Admin role
    if (food.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own food listings.',
      });
      return;
    }

    // Perform update
    const updatedFood = await Food.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Food listing updated successfully',
      food: updatedFood,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFood = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to delete food listings',
      });
      return;
    }

    const food = await Food.findById(id);
    if (!food) {
      res.status(404).json({
        success: false,
        message: `Food item not found with id: ${id}`,
      });
      return;
    }

    // Check ownership or Admin role
    if (food.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own food listings.',
      });
      return;
    }

    await Food.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Food listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
