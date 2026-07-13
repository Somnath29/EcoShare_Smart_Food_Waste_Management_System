import { Request, Response, NextFunction } from 'express';

export const validateCreateFood = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, category, quantity, unit, expiryTime, pickupLocation, latitude, longitude, image, status } = req.body;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim() === '') {
    errors.push('Title is required and must be a string');
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    errors.push('Description is required and must be a string');
  }

  if (!category || typeof category !== 'string' || category.trim() === '') {
    errors.push('Category is required and must be a string');
  }

  if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
    errors.push('Quantity is required and must be a non-negative number');
  }

  if (!unit || typeof unit !== 'string' || unit.trim() === '') {
    errors.push('Unit is required and must be a string');
  }

  if (!expiryTime || isNaN(Date.parse(expiryTime))) {
    errors.push('Expiry time is required and must be a valid ISO date');
  } else if (new Date(expiryTime) <= new Date()) {
    errors.push('Expiry time must be in the future');
  }

  if (!pickupLocation || typeof pickupLocation !== 'string' || pickupLocation.trim() === '') {
    errors.push('Pickup location is required and must be a string');
  }

  if (latitude === undefined || typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    errors.push('Latitude is required and must be a number between -90 and 90');
  }

  if (longitude === undefined || typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    errors.push('Longitude is required and must be a number between -180 and 180');
  }

  if (image && typeof image !== 'string') {
    errors.push('Image must be a string URL');
  }

  const validStatuses = ['Available', 'Reserved', 'Collected', 'Expired'];
  if (status && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  next();
};

export const validateUpdateFood = (req: Request, res: Response, next: NextFunction): void => {
  const { title, description, category, quantity, unit, expiryTime, pickupLocation, latitude, longitude, image, status } = req.body;
  const errors: string[] = [];

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    errors.push('Title must be a non-empty string');
  }

  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
    errors.push('Description must be a non-empty string');
  }

  if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
    errors.push('Category must be a non-empty string');
  }

  if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
    errors.push('Quantity must be a non-negative number');
  }

  if (unit !== undefined && (typeof unit !== 'string' || unit.trim() === '')) {
    errors.push('Unit must be a non-empty string');
  }

  if (expiryTime !== undefined) {
    if (isNaN(Date.parse(expiryTime))) {
      errors.push('Expiry time must be a valid ISO date');
    } else if (new Date(expiryTime) <= new Date()) {
      errors.push('Expiry time must be in the future');
    }
  }

  if (pickupLocation !== undefined && (typeof pickupLocation !== 'string' || pickupLocation.trim() === '')) {
    errors.push('Pickup location must be a non-empty string');
  }

  if (latitude !== undefined && (typeof latitude !== 'number' || latitude < -90 || latitude > 90)) {
    errors.push('Latitude must be a number between -90 and 90');
  }

  if (longitude !== undefined && (typeof longitude !== 'number' || longitude < -180 || longitude > 180)) {
    errors.push('Longitude must be a number between -180 and 180');
  }

  if (image !== undefined && typeof image !== 'string') {
    errors.push('Image must be a string URL');
  }

  const validStatuses = ['Available', 'Reserved', 'Collected', 'Expired'];
  if (status !== undefined && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  next();
};
