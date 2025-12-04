import jwt from 'jsonwebtoken';

interface TokenPayload {
  user_id: number;
  school_id: string;
  email: string;
  role: string;
  full_name: string;
  type?: string; // Optional type field for special tokens like password_reset
}

/**
 * Generate JWT access token
 */
export const generateToken = (payload: TokenPayload | any, customExpiry?: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = customExpiry || process.env.JWT_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: expiresIn as string,
    issuer: 'mc-tutor',
  } as jwt.SignOptions);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.verify(token, jwtSecret) as TokenPayload;
};

/**
 * Generate refresh token (longer expiration)
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: '30d',
    issuer: 'mc-tutor',
  });
};
