import type { NextFunction, Request, Response } from "express";
import type { PresignUploadInput } from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import * as uploadService from "./upload.service.js";

export const presign = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<PresignUploadInput>(req, "body");
    const result = await uploadService.presignUpload(input);
    return sendSuccess(res, result, "Upload URL created", 201);
  } catch (error) {
    next(error);
  }
};

export default { presign };
