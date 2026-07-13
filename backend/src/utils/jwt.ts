import jwt from 'jsonwebtoken';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('[Warning] JWT_SECRET is not set in environment variables! Using default value.');
    return 'fallback_default_jwt_secret_key_change_in_production';
  }
  return secret;
};

export const signToken = (payload: { id: string; role: string }): string => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, getJwtSecret());
};
