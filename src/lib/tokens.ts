import { randomBytes } from 'crypto';
import Token from '@/models/token.model';
import { addHours } from 'date-fns';

export const generateToken = () => {
  return randomBytes(32).toString('hex');
};

export const createVerificationToken = async (userId: string) => {
  const token = generateToken();
  const expiresAt = addHours(new Date(), 24);

  const verificationToken = await Token.create({
    userId,
    token,
    type: 'verification',
    expiresAt,
  });

  return verificationToken;
};

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await Token.findOne({
      token,
      type: 'verification',
      expiresAt: { $gt: new Date() },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

export const getVerificationTokenByUserId = async (userId: string) => {
  try {
    const verificationToken = await Token.findOne({
      userId,
      type: 'verification',
      expiresAt: { $gt: new Date() },
    });

    return verificationToken;
  } catch {
    return null;
  }
};
