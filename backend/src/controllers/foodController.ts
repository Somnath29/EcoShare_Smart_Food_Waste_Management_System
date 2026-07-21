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
      isForDonation,
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
      isForDonation: isForDonation || false,
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
    const { category, status, createdBy, reservedBy } = req.query;
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

    if (reservedBy) {
      query.reservedBy = reservedBy;
    }

    if (req.user?.role === 'Student') {
      query.isForDonation = { $ne: true };
      query.expiryTime = { $gt: new Date() };
    } else if (req.user?.role === 'NGO') {
      query.$or = [
        { isForDonation: true },
        { expiryTime: { $lte: new Date() } }
      ];
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

export const reserveFood = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to reserve food items',
      });
      return;
    }

    if (req.user.role !== 'Student' && req.user.role !== 'NGO' && req.user.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Only Students, NGOs, or Admins can claim food listings.',
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

    if (food.status !== 'Available') {
      res.status(400).json({
        success: false,
        message: `Food item is not available for reservation (Current status: ${food.status})`,
      });
      return;
    }

    const { quantity } = req.body;
    let reservedFoodId = id;

    if (quantity !== undefined) {
      const requestedQuantity = Number(quantity);
      if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
        res.status(400).json({ success: false, message: 'Invalid quantity requested.' });
        return;
      }
      if (requestedQuantity > food.quantity) {
        res.status(400).json({ success: false, message: 'Requested quantity exceeds available quantity.' });
        return;
      }
      
      if (requestedQuantity < food.quantity) {
        // Partial reservation
        food.quantity -= requestedQuantity;
        await food.save();
        
        const cloneData: any = food.toObject();
        delete cloneData._id;
        delete cloneData.createdAt;
        delete cloneData.updatedAt;
        cloneData.quantity = requestedQuantity;
        cloneData.status = 'Reserved';
        cloneData.reservedBy = req.user._id as any;
        
        const newReservedFood = await Food.create(cloneData);
        reservedFoodId = newReservedFood._id.toString();
      } else {
        // Full reservation
        food.status = 'Reserved';
        food.reservedBy = req.user._id as any;
        await food.save();
      }
    } else {
      // Fallback if quantity is not provided (legacy behavior)
      food.status = 'Reserved';
      food.reservedBy = req.user._id as any;
      await food.save();
    }

    // Populate creator detail
    const updatedFood = await Food.findById(reservedFoodId)
      .populate('createdBy', 'name email role')
      .populate('reservedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Food item successfully reserved',
      food: updatedFood,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to cancel reservations',
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

    if (food.status !== 'Reserved') {
      res.status(400).json({
        success: false,
        message: `Food item does not have a current reservation (Current status: ${food.status})`,
      });
      return;
    }

    // Access control: creator, reserver, or Admin
    const isReserver = food.reservedBy && food.reservedBy.toString() === req.user._id.toString();
    const isCreator = food.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isReserver && !isCreator && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to cancel this reservation.',
      });
      return;
    }

    // Reset status and clear reservedBy reference
    food.status = 'Available';
    food.reservedBy = undefined;

    await food.save();

    res.status(200).json({
      success: true,
      message: 'Reservation successfully cancelled. Food is now available.',
    });
  } catch (error) {
    next(error);
  }
};

export const collectFood = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to update collection status',
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

    if (food.status !== 'Reserved') {
      res.status(400).json({
        success: false,
        message: `Only reserved food items can be marked as collected (Current status: ${food.status})`,
      });
      return;
    }

    // Access control: creator, reserver, or Admin
    const isReserver = food.reservedBy && food.reservedBy.toString() === req.user._id.toString();
    const isCreator = food.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isReserver && !isCreator && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to update collection status.',
      });
      return;
    }

    // Update status
    food.status = 'Collected';

    await food.save();

    res.status(200).json({
      success: true,
      message: 'Food item successfully marked as collected.',
    });
  } catch (error) {
    next(error);
  }
};
