import { Request, Response, NextFunction } from 'express';

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password, role } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and must be a string');
  }

  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }

  if (role === 'Admin') {
    errors.push('Registration as Admin is restricted. Please sign in using the dedicated Administrator credentials.');
  } else {
    const validRoles = ['Student', 'Kitchen Staff', 'NGO', 'Volunteer'];
    if (!role || !validRoles.includes(role)) {
      errors.push(`Role is required and must be one of: ${validRoles.join(', ')}`);
    }
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

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('Password is required');
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

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body;

  if (!email || !emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['A valid email address is required'],
    });
    return;
  }

  next();
};

export const validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { password } = req.body;

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Password is required and must be at least 6 characters'],
    });
    return;
  }

  next();
};
