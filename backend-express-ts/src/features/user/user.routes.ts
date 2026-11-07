import { Router } from "express";
import { z } from "zod";
import {
  addressInputSchema,
  objectIdSchema,
  updateAddressSchema,
  updateProfileSchema,
} from "@rebuy/contracts";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import UserController from "./user.controller.js";

const addressParamsSchema = z.object({ addressId: objectIdSchema });

const router = Router();

router.get("/me", verifyAuth, UserController.getProfile);
router.patch(
  "/me",
  verifyAuth,
  validate({ body: updateProfileSchema }),
  UserController.updateProfile,
);

router.get("/me/addresses", verifyAuth, UserController.listAddresses);
router.post(
  "/me/addresses",
  verifyAuth,
  validate({ body: addressInputSchema }),
  UserController.createAddress,
);
router.patch(
  "/me/addresses/:addressId",
  verifyAuth,
  validate({ params: addressParamsSchema, body: updateAddressSchema }),
  UserController.updateAddress,
);
router.delete(
  "/me/addresses/:addressId",
  verifyAuth,
  validate({ params: addressParamsSchema }),
  UserController.deleteAddress,
);
router.patch(
  "/me/addresses/:addressId/default",
  verifyAuth,
  validate({ params: addressParamsSchema }),
  UserController.setDefaultAddress,
);

export default router;
