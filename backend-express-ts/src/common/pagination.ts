import { AppError } from "./errors.js";

export const encodeCursor = (payload: Record<string, unknown>) =>
  Buffer.from(JSON.stringify(payload)).toString("base64url");

export const decodeCursor = <T>(cursor?: string): T | null => {
  if (!cursor) return null;

  try {
    return JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as T;
  } catch {
    throw AppError.badRequest("Invalid pagination cursor");
  }
};

export interface PageResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
