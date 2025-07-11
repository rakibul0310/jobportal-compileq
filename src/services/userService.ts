import bcrypt from "bcryptjs";
import { IUser, User } from "../models/User";

export class UserService {
  static async createUser(userData: {
    email: string;
    password: string;
    role: "admin" | "employer" | "candidate";
  }): Promise<IUser> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    return await user.save();
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  static async validatePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async updateUser(
    userId: string,
    updates: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(userId, updates, { new: true });
  }

  static async deleteUser(userId: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  }

  static async getUserStats() {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });
    const employerCount = await User.countDocuments({ role: "employer" });
    const candidateCount = await User.countDocuments({ role: "candidate" });
    const bannedCount = await User.countDocuments({ isBanned: true });

    return {
      total: totalUsers,
      admins: adminCount,
      employers: employerCount,
      candidates: candidateCount,
      banned: bannedCount,
    };
  }
}
