import type { CartDto } from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import * as productRepository from "../product/product.repository.js";
import * as cartRepository from "./cart.repository.js";
import { toCartDto } from "./cart.repository.js";

const emptyCart: CartDto = { items: [], subtotal: 0, itemCount: 0 };

export const getCart = async (userId: string): Promise<CartDto> => {
  const cart = await cartRepository.findCart(userId);
  if (!cart) return emptyCart;

  return toCartDto(cart);
};

const assertProductAvailable = async (productId: string, quantity: number) => {
  const product = await productRepository.findProductById(productId);
  if (!product || product.status !== "active") {
    throw AppError.notFound("Product not found");
  }
  if (product.stock < quantity) {
    throw AppError.badRequest("Requested quantity exceeds available stock");
  }
  return product;
};

export const addItem = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  await assertProductAvailable(productId, quantity);
  await cartRepository.addItem(userId, productId, quantity);
  return getCart(userId);
};

export const updateItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const cart = await cartRepository.findRawCart(userId);
  const item = cart?.items.find(
    (entry) => entry.productId.toString() === productId,
  );
  if (!item) throw AppError.notFound("Cart item not found");

  await assertProductAvailable(productId, quantity);
  await cartRepository.updateItemQuantity(userId, productId, quantity);
  return getCart(userId);
};

export const removeItem = async (userId: string, productId: string) => {
  await cartRepository.removeItem(userId, productId);
  return getCart(userId);
};

export const clearCart = async (userId: string) => {
  await cartRepository.clearCart(userId);
  return emptyCart;
};
