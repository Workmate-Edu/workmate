import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

export const generateToken = (userId: string) => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
  return token;
};

export const verifyMailToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      valid: true,
      payload: decoded,
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.message,
    };
  }
};

const generateResetPasswordToken = (userId: string) => {
  // Generate the token based on user ID and purpose (you can use a library like 'jsonwebtoken' for this)
  const token = "your_token_generation_logic";
  const resetPasswordLink = `https://yourdomain.com/reset-password/${token}`;

  return `
            <h1>Reset Your Password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${resetPasswordLink}">${resetPasswordLink}</a>
          `;
};

export { generateResetPasswordToken };
