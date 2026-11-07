import type { QueryFilter } from "mongoose";
import type { ProductInput, UpdateProductInput } from "@rebuy/contracts";
import ProductModel, { type Product } from "./product.model.js";
import type { CategoryDocument } from "../category/category.model.js";
import type { PopulatedProduct } from "./product.mapper.js";
import { toProductDto } from "./product.mapper.js";
import { decodeCursor, encodeCursor } from "../../common/pagination.js";
import { AppError } from "../../common/errors.js";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

interface ProductCursor {
  createdAt?: string;
  price?: number;
  id: string;
}

export interface ProductListParams {
  q?: string;
  categoryId?: string;
  condition?: Product["condition"];
  minPrice?: number;
  maxPrice?: number;
  status?: Product["status"];
  sort: "newest" | "price_asc" | "price_desc";
  limit: number;
  cursor?: string;
}

export const productSlugExists = async (slug: string) =>
  Boolean(await ProductModel.exists({ slug }));

export const findProductById = async (productId: string) => {
  const product = await ProductModel.findById(productId).populate<{
    categoryId: CategoryDocument;
  }>("categoryId");
  return (product as unknown as PopulatedProduct | null) ?? null;
};

export const findProductBySlug = async (slug: string) => {
  const product = await ProductModel.findOne({ slug }).populate<{
    categoryId: CategoryDocument;
  }>("categoryId");
  return (product as unknown as PopulatedProduct | null) ?? null;
};

export const createProduct = (data: ProductInput & { slug: string }) =>
  ProductModel.create(data);

export const updateProduct = (
  productId: string,
  data: UpdateProductInput & { slug?: string },
) =>
  ProductModel.findByIdAndUpdate(productId, data, {
    returnDocument: "after",
    runValidators: true,
  });

export const deleteProduct = (productId: string) =>
  ProductModel.findByIdAndDelete(productId);

export const countProductsByCategory = (categoryId: string) =>
  ProductModel.countDocuments({ categoryId });

export const decrementStock = (productId: string, quantity: number) =>
  ProductModel.findOneAndUpdate(
    {
      _id: productId,
      status: "active",
      stock: { $gte: quantity },
    },
    { $inc: { stock: -quantity } },
    { returnDocument: "after" },
  );

export const incrementStock = (productId: string, quantity: number) =>
  ProductModel.findByIdAndUpdate(
    productId,
    { $inc: { stock: quantity } },
    { returnDocument: "after" },
  );

export const incrementSoldCount = (productId: string, quantity: number) =>
  ProductModel.findByIdAndUpdate(productId, {
    $inc: { soldCount: quantity },
  });

export const updateProductRating = (
  productId: string,
  ratingAvg: number,
  ratingCount: number,
) =>
  ProductModel.findByIdAndUpdate(productId, { ratingAvg, ratingCount });

export const listProducts = async (params: ProductListParams) => {
  const filter: QueryFilter<Product> = {};

  if (params.categoryId) filter.categoryId = params.categoryId;
  if (params.condition) filter.condition = params.condition;
  if (params.status) filter.status = params.status;
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filter.price = {
      ...(params.minPrice !== undefined ? { $gte: params.minPrice } : {}),
      ...(params.maxPrice !== undefined ? { $lte: params.maxPrice } : {}),
    };
  }
  if (params.q) {
    const regex = new RegExp(escapeRegex(params.q), "i");
    filter.$and = [
      ...((filter.$and as QueryFilter<Product>[]) ?? []),
      { $or: [{ name: regex }, { description: regex }] },
    ];
  }

  const cursor = decodeCursor<ProductCursor>(params.cursor);
  if (cursor) {
    if (params.sort === "newest") {
      if (!cursor.createdAt) {
        throw AppError.badRequest("Invalid cursor for sort");
      }
      const createdAt = new Date(cursor.createdAt);
      filter.$and = [
        ...((filter.$and as QueryFilter<Product>[]) ?? []),
        {
          $or: [
            { createdAt: { $lt: createdAt } },
            { createdAt, _id: { $lt: cursor.id } },
          ],
        },
      ];
    } else {
      if (typeof cursor.price !== "number") {
        throw AppError.badRequest("Invalid cursor for sort");
      }
      const priceCondition =
        params.sort === "price_asc"
          ? { $gt: cursor.price }
          : { $lt: cursor.price };
      const idCondition =
        params.sort === "price_asc"
          ? { $gt: cursor.id }
          : { $lt: cursor.id };
      filter.$and = [
        ...((filter.$and as QueryFilter<Product>[]) ?? []),
        {
          $or: [
            { price: priceCondition },
            { price: cursor.price, _id: idCondition },
          ],
        },
      ];
    }
  }

  const sortSpec: Record<string, 1 | -1> =
    params.sort === "newest"
      ? { createdAt: -1, _id: -1 }
      : params.sort === "price_asc"
        ? { price: 1, _id: 1 }
        : { price: -1, _id: -1 };

  const documents = await ProductModel.find(filter)
    .sort(sortSpec)
    .limit(params.limit + 1)
    .populate<{ categoryId: CategoryDocument }>("categoryId");

  const hasMore = documents.length > params.limit;
  const page = hasMore ? documents.slice(0, params.limit) : documents;
  const last = page[page.length - 1];

  const nextCursor =
    hasMore && last
      ? encodeCursor(
          params.sort === "newest"
            ? {
                createdAt: new Date(last.createdAt).toISOString(),
                id: last._id.toString(),
              }
            : { price: last.price, id: last._id.toString() },
        )
      : null;

  return {
    items: page.map((document) =>
      toProductDto(document as unknown as PopulatedProduct),
    ),
    nextCursor,
    hasMore,
  };
};
