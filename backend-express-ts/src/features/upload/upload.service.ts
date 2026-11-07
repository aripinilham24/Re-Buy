import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import type { PresignUploadInput, PresignUploadResult } from "@rebuy/contracts";
import { createPresignedUpload } from "../../common/storage.js";

const safeFilename = (filename: string) =>
  filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);

export const presignUpload = async (
  input: PresignUploadInput,
): Promise<PresignUploadResult> => {
  const extension = extname(input.filename).toLowerCase();
  const base =
    safeFilename(input.filename.slice(0, input.filename.length - extension.length)) ||
    "file";
  const key = `${input.folder}/${randomUUID()}-${base}${extension}`;

  return createPresignedUpload(key, input.contentType);
};
