import { Router } from "express";
import AuthRoutes from "../features/auth/auth.routes.js";
import UserRoutes from "../features/user/user.routes.js";
import {
  adminCategoryRouter,
  publicCategoryRouter,
} from "../features/category/category.routes.js";
import {
  adminProductRouter,
  publicProductRouter,
} from "../features/product/product.routes.js";
import { sendSuccess } from "../common/http.js";
import { verifyAuth } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/health", (_req, res) => {
  return sendSuccess(res, {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/", (_req, res) => {
  return sendSuccess(res, null, "API is working");
});

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/categories", publicCategoryRouter);
router.use("/products", publicProductRouter);
router.use(
  "/admin/categories",
  verifyAuth,
  authorize("admin"),
  adminCategoryRouter,
);
router.use(
  "/admin/products",
  verifyAuth,
  authorize("admin"),
  adminProductRouter,
);

export default router;
