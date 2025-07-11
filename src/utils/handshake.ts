import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/User";
dotenv.config();

/**
 * Handshake function to ensure admin user exists on server startup
 * Checks for admin user in database and creates one if none exists
 */
export const handshake = async (): Promise<void> => {
  try {
    console.log("🤝 Starting handshake - checking for admin user...");

    // Check if any admin user exists in the database
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:", existingAdmin.email);
      return;
    }

    // No admin found, create default admin from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error(
        "❌ ADMIN_EMAIL or ADMIN_PASSWORD not found in environment variables"
      );
      console.error(
        "Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file"
      );
      process.exit(1);
    }

    // Hash the admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isBanned: false,
    });

    await adminUser.save();

    console.log("🎉 Default admin user created successfully!");
    console.log("📧 Admin Email:", adminEmail);
    console.log("🔒 Admin Password:", adminPassword);
    console.log(
      "⚠️  Please change the default admin password after first login"
    );
  } catch (error) {
    console.error("❌ Error during handshake:", error);
    console.error("Failed to ensure admin user exists");
    process.exit(1);
  }
};

/**
 * Alternative handshake function with custom credentials
 * @param email - Custom admin email
 * @param password - Custom admin password
 */
export const handshakeWithCustomAdmin = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    console.log("🤝 Starting handshake with custom admin credentials...");

    // Check if any admin user exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:", existingAdmin.email);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format provided");
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = new User({
      email: email,
      password: hashedPassword,
      role: "admin",
      isBanned: false,
    });

    await adminUser.save();

    console.log("🎉 Custom admin user created successfully!");
    console.log("📧 Admin Email:", email);
    console.log("⚠️  Please keep your admin credentials secure");
  } catch (error) {
    console.error("❌ Error during handshake with custom admin:", error);
    throw error;
  }
};

/**
 * Check admin status without creating one
 * @returns boolean indicating if admin exists
 */
export const checkAdminExists = async (): Promise<boolean> => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    return !!existingAdmin;
  } catch (error) {
    console.error("❌ Error checking admin status:", error);
    return false;
  }
};

/**
 * Get admin count
 * @returns number of admin users in the system
 */
export const getAdminCount = async (): Promise<number> => {
  try {
    const adminCount = await User.countDocuments({ role: "admin" });
    return adminCount;
  } catch (error) {
    console.error("❌ Error getting admin count:", error);
    return 0;
  }
};
