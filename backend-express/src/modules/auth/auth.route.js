import {Router} from "express";
import AuthController from "./auth.controller.js";
import validate from "../../middlewares/validate.js";
import {LoginSchema, RegisterSchema} from "./auth.validation.js";

const router = Router();

router.post("/register", validate(RegisterSchema), AuthController.register);
router.post("google-auth", validate(LoginSchema), AuthController.googleAuth);
router.post("/login", validate(LoginSchema), AuthController.login);
router.post("/logout", AuthController.logout);

export default router;