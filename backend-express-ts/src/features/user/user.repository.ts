import type { QueryFilter } from "mongoose";
import UserModel, { type User } from "./user.model.js";
import { decodeCursor, encodeCursor } from "../../common/pagination.js";

export const findUserById = (userId: string) => UserModel.findById(userId);

export const listUsers = async (params: {
  q?: string;
  limit: number;
  cursor?: string;
}) => {
  const filter: QueryFilter<User> = {};
  if (params.q) {
    const regex = new RegExp(
      params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    filter.$or = [{ username: regex }, { email: regex }];
  }

  const cursor = decodeCursor<{ createdAt: string; id: string }>(
    params.cursor,
  );
  if (cursor) {
    const createdAt = new Date(cursor.createdAt);
    filter.$and = [
      {
        $or: [
          { createdAt: { $lt: createdAt } },
          { createdAt, _id: { $lt: cursor.id } },
        ],
      },
    ];
  }

  const users = await UserModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(params.limit + 1);

  const hasMore = users.length > params.limit;
  const page = hasMore ? users.slice(0, params.limit) : users;
  const last = page[page.length - 1];

  return {
    items: page,
    hasMore,
    nextCursor:
      hasMore && last
        ? encodeCursor({
            createdAt: new Date(last.createdAt).toISOString(),
            id: last._id.toString(),
          })
        : null,
  };
};

export const updateUserAdmin = (
  userId: string,
  data: { isBlocked?: boolean; role?: "user" | "admin" },
) =>
  UserModel.findByIdAndUpdate(userId, data, {
    returnDocument: "after",
    runValidators: true,
  });

export const updateUserProfile = (
  userId: string,
  data: { username: string },
) =>
  UserModel.findByIdAndUpdate(userId, data, {
    returnDocument: "after",
    runValidators: true,
  });
