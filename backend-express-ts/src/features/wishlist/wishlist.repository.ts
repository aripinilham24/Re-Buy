import type { WishlistItemDto } from "@rebuy/contracts";
import { toProductDto } from "../product/product.mapper.js";
import type { PopulatedProduct } from "../product/product.mapper.js";
import WishlistModel, { type WishlistDocument } from "./wishlist.model.js";

export type PopulatedWishlist = Omit<WishlistDocument, "productId"> & {
  productId: PopulatedProduct;
};

export const listWishlist = async (userId: string) => {
  const items = await WishlistModel.find({ userId })
    .sort({ createdAt: -1 })
    .populate<{ productId: PopulatedProduct }>({
      path: "productId",
      populate: { path: "categoryId" },
    });

  return items as unknown as PopulatedWishlist[];
};

export const findWishlistItem = async (
  userId: string,
  productId: string,
) => {
  const item = await WishlistModel.findOne({ userId, productId }).populate<{
    productId: PopulatedProduct;
  }>({
    path: "productId",
    populate: { path: "categoryId" },
  });

  return (item as unknown as PopulatedWishlist | null) ?? null;
};

export const addWishlistItem = (userId: string, productId: string) =>
  WishlistModel.findOneAndUpdate(
    { userId, productId },
    { $setOnInsert: { userId, productId } },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  );

export const removeWishlistItem = (userId: string, productId: string) =>
  WishlistModel.findOneAndDelete({ userId, productId });

export const toWishlistDto = (item: PopulatedWishlist): WishlistItemDto => ({
  wishlistId: item._id.toString(),
  product: toProductDto(item.productId),
  addedAt: new Date(item.createdAt).toISOString(),
});
