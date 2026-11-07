import type {
  AdminStatsDto,
  AdminUserDto,
  AdminUserListQuery,
  UpdateAdminUserInput,
} from "@rebuy/contracts";
import { orderStatusSchema } from "@rebuy/contracts";
import UserModel, { type UserDocument } from "../user/user.model.js";
import ProductModel from "../product/product.model.js";
import OrderModel from "../order/order.model.js";
import { AppError } from "../../common/errors.js";
import * as userRepository from "../user/user.repository.js";

const toAdminUserDto = (user: UserDocument): AdminUserDto => ({
  userId: user._id.toString(),
  username: user.username,
  email: user.email,
  role: user.role ?? "user",
  isBlocked: user.isBlocked,
  emailVerified: Boolean(user.emailVerifiedAt),
  createdAt: new Date(user.createdAt).toISOString(),
});

export const listUsers = async (query: AdminUserListQuery) => {
  const result = await userRepository.listUsers({
    q: query.q,
    limit: query.limit,
    cursor: query.cursor,
  });

  return {
    items: result.items.map(toAdminUserDto),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  };
};

export const updateUser = async (
  adminId: string,
  userId: string,
  input: UpdateAdminUserInput,
) => {
  if (adminId === userId && (input.isBlocked || input.role === "user")) {
    throw AppError.badRequest("You cannot block or demote yourself");
  }

  const user = await userRepository.updateUserAdmin(userId, input);
  if (!user) throw AppError.notFound("User not found");

  return toAdminUserDto(user);
};

const paidStatuses = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "completed",
];

export const getStats = async (): Promise<AdminStatsDto> => {
  const [
    revenueResult,
    statusResult,
    topProductsResult,
    totalOrders,
    totalUsers,
    totalProducts,
    lowStockProducts,
  ] = await Promise.all([
    OrderModel.aggregate<{ total: number }>([
      { $match: { status: { $in: paidStatuses } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]),
    OrderModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    OrderModel.aggregate<{
      _id: string;
      name: string;
      quantity: number;
      revenue: number;
    }>([
      { $match: { status: { $in: paidStatuses } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
    OrderModel.countDocuments(),
    UserModel.countDocuments(),
    ProductModel.countDocuments(),
    ProductModel.find({ status: "active", stock: { $lte: 3 } })
      .sort({ stock: 1 })
      .limit(10),
  ]);

  const ordersByStatus = Object.fromEntries(
    orderStatusSchema.options.map((status) => [status, 0]),
  ) as AdminStatsDto["ordersByStatus"];

  for (const row of statusResult) {
    if (row._id in ordersByStatus) {
      ordersByStatus[row._id as keyof AdminStatsDto["ordersByStatus"]] =
        row.count;
    }
  }

  return {
    revenue: revenueResult[0]?.total ?? 0,
    totalOrders,
    totalUsers,
    totalProducts,
    ordersByStatus,
    topProducts: topProductsResult.map((row) => ({
      productId: row._id.toString(),
      name: row.name,
      quantity: row.quantity,
      revenue: row.revenue,
    })),
    lowStock: lowStockProducts.map((product) => ({
      productId: product._id.toString(),
      name: product.name,
      stock: product.stock,
    })),
  };
};
