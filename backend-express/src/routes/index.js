import { Router } from "express";
import authRoutes from "../modules/auth/auth.route.js"

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "API is running",
    message: "Welcome to the E-Commerce SDG 12 API",
    timestamp: new Date().toISOString(),
  });
});

// // modules routes
router.use("/auth", authRoutes);
// router.use("/users", usersRoutes);

export default router;
