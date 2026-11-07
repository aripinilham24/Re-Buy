import { AppError } from "../../common/errors.js";
import * as productRepository from "../product/product.repository.js";
import * as wishlistRepository from "./wishlist.repository.js";
import { toWishlistDto } from "./wishlist.repository.js";

export const listWishlist = async (userId: string) => {
  const items = await wishlistRepository.listWishlist(userId);
  return items.map(toWishlistDto);
};

export const addWishlistItem = async (
  userId: string,
  productId: string,
) => {
  const product = await productRepository.findProductById(productId);
  if (!product || product.status !== "active") {
    throw AppError.notFound("Product not found");
  }

  const item = await wishlistRepository.addWishlistItem(userId, productId);
  if (!item) throw AppError.notFound("Product not found");

  const populated = await wishlistRepository.findWishlistItem(
    userId,
    productId,
  );
  if (!populated) throw AppError.notFound("Wishlist item not found");

  return toWishlistDto(populated);
};

export const removeWishlistItem = async (
  userId: string,
  productId: string,
) => {
  const item = await wishlistRepository.removeWishlistItem(userId, productId);
  if (!item) throw AppError.notFound("Wishlist item not found");

  return { removed: true };
};
