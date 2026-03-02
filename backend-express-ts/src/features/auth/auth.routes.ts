import { Router } from "express";
import AuthController from "./auth.controller.js";
import { verifyAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", verifyAuth, AuthController.me);

export default router;
