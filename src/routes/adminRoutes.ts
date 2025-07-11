import { Router } from "express";
import {
  banUser,
  deleteUser,
  getAllApplications,
  getAllJobs,
  getAllUsers,
  getDashboardStats,
  unbanUser,
} from "../controllers/adminController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

router.get("/users", authenticate, authorize("admin"), getAllUsers);
router.get(
  "/applications",
  authenticate,
  authorize("admin"),
  getAllApplications
);
router.get("/jobs", authenticate, authorize("admin"), getAllJobs);
router.put("/ban/:userId", authenticate, authorize("admin"), banUser);
router.put("/unban/:userId", authenticate, authorize("admin"), unbanUser);
router.delete("/users/:userId", authenticate, authorize("admin"), deleteUser);
router.get("/stats", authenticate, authorize("admin"), getDashboardStats);

export default router;
