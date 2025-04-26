// lib/tokens.ts
import jwt from "jsonwebtoken";

export const generateVerificationToken = (userId: string) => {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not set');
  }

  return jwt.sign(
    { userId },
    process.env.NEXTAUTH_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string) => {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not set');
  }

  return jwt.verify(token, process.env.NEXTAUTH_SECRET) as { userId: string };
};
