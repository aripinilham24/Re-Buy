import {
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Bucket, s3Client, toPublicObjectUrl } from "../config/s3.js";
import { AppError } from "./errors.js";

const UPLOAD_EXPIRES_IN = 300;

export const createPresignedUpload = async (
  key: string,
  contentType: string,
) => {
  if (!s3Client) {
    throw new AppError(
      "Object storage is not configured",
      503,
      "STORAGE_NOT_CONFIGURED",
    );
  }

  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: UPLOAD_EXPIRES_IN,
  });

  return {
    uploadUrl,
    key,
    publicUrl: toPublicObjectUrl(key),
    expiresIn: UPLOAD_EXPIRES_IN,
  };
};

export const deleteObject = async (key: string) => {
  if (!s3Client) return;

  await s3Client.send(
    new DeleteObjectCommand({ Bucket: s3Bucket, Key: key }),
  );
};

export { toPublicObjectUrl };
