import type { AddressInput, UpdateAddressInput } from "@rebuy/contracts";
import AddressModel from "./address.model.js";

export const listAddresses = (userId: string) =>
  AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

export const findAddress = (userId: string, addressId: string) =>
  AddressModel.findOne({ _id: addressId, userId });

export const countAddresses = (userId: string) =>
  AddressModel.countDocuments({ userId });

export const createAddress = (userId: string, data: AddressInput) =>
  AddressModel.create({ ...data, userId });

export const updateAddress = (
  userId: string,
  addressId: string,
  data: UpdateAddressInput,
) =>
  AddressModel.findOneAndUpdate({ _id: addressId, userId }, data, {
    new: true,
    runValidators: true,
  });

export const deleteAddress = (userId: string, addressId: string) =>
  AddressModel.findOneAndDelete({ _id: addressId, userId });

export const clearDefaultAddress = (userId: string) =>
  AddressModel.updateMany({ userId, isDefault: true }, { isDefault: false });

export const setDefaultAddress = (
  userId: string,
  addressId: string,
) =>
  AddressModel.findOneAndUpdate(
    { _id: addressId, userId },
    { isDefault: true },
    { new: true },
  );

export const findFirstAddress = (userId: string) =>
  AddressModel.findOne({ userId }).sort({ createdAt: 1 });
