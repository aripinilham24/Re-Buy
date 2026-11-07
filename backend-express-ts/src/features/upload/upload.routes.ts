import { Router } from "express";
import { presignUploadSchema } from "@rebuy/contracts";
import UploadController from "./upload.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router.post(
  "/presign",
  validate({ body: presignUploadSchema }),
  UploadController.presign,
);

export default router;
