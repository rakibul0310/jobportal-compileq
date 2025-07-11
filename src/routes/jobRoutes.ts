import { Router } from "express";
import {
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
} from "../controllers/jobController";
import { authenticate, authorize } from "../middlewares/auth";
import { validateJobCreation } from "../middlewares/validation";

const router = Router();

router.get("/", getAllJobs);
router.get("/my", authenticate, authorize("employer", "admin"), getMyJobs);
router.get("/:id", getJobById);
router.post(
  "/",
  authenticate,
  authorize("employer", "admin"),
  validateJobCreation,
  createJob
);
router.put("/:id", authenticate, authorize("employer", "admin"), updateJob);
router.delete("/:id", authenticate, authorize("employer", "admin"), deleteJob);

export default router;
