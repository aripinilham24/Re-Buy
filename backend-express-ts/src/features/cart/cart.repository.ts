import type { CartDto } from "@rebuy/contracts";
import { toProductDto } from "../product/product.mapper.js";
import type { PopulatedProduct } from "../product/product.mapper.js";
import CartModel, { type CartDocument } from "./cart.model.js";

export type PopulatedCartItem = {
  productId: PopulatedProduct | null;
  quantity: number;
};

export type PopulatedCart = Omit<CartDocument, "items"> & {
  items: PopulatedCartItem[];
};

const populateCart = {
  path: "items.productId",
  populate: { path: "categoryId" },
};

export const findCart = async (userId: string) => {
  const cart = await CartModel.findOne({ userId }).populate<{
    items: PopulatedCartItem[];
  }>(populateCart);

  return (cart as unknown as PopulatedCart | null) ?? null;
};

export const findRawCart = (userId: string) =>
  CartModel.findOne({ userId });

export const addItem = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const updated = await CartModel.findOneAndUpdate(
    { userId, "items.productId": productId },
    { $inc: { "items.$.quantity": quantity } },
    { returnDocument: "after" },
  );

  if (updated) return updated;

  return CartModel.findOneAndUpdate(
    { userId },
    { $push: { items: { productId, quantity } } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
};

export const updateItemQuantity = (
  userId: string,
  productId: string,
  quantity: number,
) =>
  CartModel.findOneAndUpdate(
    { userId, "items.productId": productId },
    { $set: { "items.$.quantity": quantity } },
    { returnDocument: "after" },
  );

export const removeItem = (userId: string, productId: string) =>
  CartModel.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId } } },
    { returnDocument: "after" },
  );

export const clearCart = (userId: string) =>
  CartModel.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { returnDocument: "after" },
  );

export const toCartDto = (cart: PopulatedCart): CartDto => {
  const items = cart.items.flatMap((item) => {
    if (!item.productId) return [];
    const product = toProductDto(item.productId);
    return [
      {
        product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      },
    ];
  });

  return {
    items,
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
  };
};
