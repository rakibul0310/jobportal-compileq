import { Router } from "express";
import { getProfile, login, register } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";
import { validateRegistration } from "../middlewares/validation";

const router = Router();

router.post("/register", validateRegistration, register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);

export default router;
