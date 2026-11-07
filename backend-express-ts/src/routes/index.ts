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
import UploadRoutes from "../features/upload/upload.routes.js";
import WishlistRoutes from "../features/wishlist/wishlist.routes.js";
import CartRoutes from "../features/cart/cart.routes.js";
import {
  adminCouponRouter,
  userCouponRouter,
} from "../features/coupon/coupon.routes.js";
import {
  adminOrderRouter,
  userOrderRouter,
} from "../features/order/order.routes.js";
import PaymentRoutes from "../features/payment/payment.routes.js";
import {
  adminReviewRouter,
  publicReviewRouter,
  userReviewRouter,
} from "../features/review/review.routes.js";
import NotificationRoutes from "../features/notification/notification.routes.js";
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
router.use(
  "/uploads",
  verifyAuth,
  authorize("admin"),
  UploadRoutes,
);
router.use("/wishlist", WishlistRoutes);
router.use("/cart", CartRoutes);
router.use("/coupons", userCouponRouter);
router.use(
  "/admin/coupons",
  verifyAuth,
  authorize("admin"),
  adminCouponRouter,
);
router.use("/orders", userOrderRouter);
router.use("/payments", PaymentRoutes);
router.use("/reviews", publicReviewRouter);
router.use("/reviews", userReviewRouter);
router.use("/notifications", NotificationRoutes);
router.use(
  "/admin/orders",
  verifyAuth,
  authorize("admin"),
  adminOrderRouter,
);
router.use(
  "/admin/reviews",
  verifyAuth,
  authorize("admin"),
  adminReviewRouter,
);

export default router;
