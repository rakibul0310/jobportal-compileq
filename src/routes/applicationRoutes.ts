import { Router } from "express";
import {
  applyForJob,
  deleteApplication,
  getAllApplications,
  getJobApplications,
  getMyApplications,
} from "../controllers/applicationController";
import { authenticate, authorize } from "../middlewares/auth";
import { validateApplication } from "../middlewares/validation";

const router = Router();

router.post(
  "/apply",
  authenticate,
  authorize("candidate"),
  validateApplication,
  applyForJob
);
router.get("/my", authenticate, authorize("candidate"), getMyApplications);
router.get(
  "/job/:jobId",
  authenticate,
  authorize("employer", "admin"),
  getJobApplications
);
router.get("/", authenticate, authorize("admin"), getAllApplications);
router.delete("/:id", authenticate, deleteApplication);

export default router;
