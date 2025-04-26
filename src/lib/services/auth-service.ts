import { User } from "@/models/user";
import bcrypt from "bcryptjs";

export async function resetPassword(params: {
  userId: string,
  password: string,
  parentId?: string
}) {
  const { userId, password, parentId } = params;

  // If parentId is provided, verify parent-child relationship
  if (parentId) {
    const child = await User.findOne({
      _id: userId,
      role: "student",
      'studentProfile.registeredAs': 'child',
      'studentProfile.parent': parentId
    });

    if (!child) {
      throw new Error("Unauthorized: Parent-child relationship not found");
    }
  }

  // Hash password and update user
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.findByIdAndUpdate(userId, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordTokenExpiry: null
  });

  return true;
}
