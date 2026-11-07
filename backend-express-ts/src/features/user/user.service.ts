import type {
  AddressInput,
  UpdateAddressInput,
  UpdateProfileInput,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import { toAuthUser } from "../auth/auth.mapper.js";
import { toAddressDto } from "./address.mapper.js";
import * as addressRepository from "./address.repository.js";
import * as userRepository from "./user.repository.js";

export const getProfile = async (userId: string) => {
  const user = await userRepository.findUserById(userId);
  if (!user) throw AppError.notFound("User not found");

  return toAuthUser(user);
};

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput,
) => {
  const user = await userRepository.updateUserProfile(userId, {
    username: input.username,
  });
  if (!user) throw AppError.notFound("User not found");

  return toAuthUser(user);
};

export const listAddresses = async (userId: string) => {
  const addresses = await addressRepository.listAddresses(userId);
  return addresses.map(toAddressDto);
};

export const createAddress = async (userId: string, input: AddressInput) => {
  const count = await addressRepository.countAddresses(userId);
  const isDefault = input.isDefault ?? count === 0;

  if (isDefault) {
    await addressRepository.clearDefaultAddress(userId);
  }

  const address = await addressRepository.createAddress(userId, {
    ...input,
    isDefault,
  });

  return toAddressDto(address);
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  input: UpdateAddressInput,
) => {
  const existing = await addressRepository.findAddress(userId, addressId);
  if (!existing) throw AppError.notFound("Address not found");

  if (input.isDefault) {
    await addressRepository.clearDefaultAddress(userId);
  }

  const address = await addressRepository.updateAddress(
    userId,
    addressId,
    input,
  );
  if (!address) throw AppError.notFound("Address not found");

  return toAddressDto(address);
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await addressRepository.deleteAddress(userId, addressId);
  if (!address) throw AppError.notFound("Address not found");

  if (address.isDefault) {
    const nextAddress = await addressRepository.findFirstAddress(userId);
    if (nextAddress) {
      await addressRepository.setDefaultAddress(
        userId,
        nextAddress._id.toString(),
      );
    }
  }

  return { deleted: true };
};

export const setDefaultAddress = async (
  userId: string,
  addressId: string,
) => {
  const address = await addressRepository.findAddress(userId, addressId);
  if (!address) throw AppError.notFound("Address not found");

  await addressRepository.clearDefaultAddress(userId);
  const updated = await addressRepository.setDefaultAddress(userId, addressId);
  if (!updated) throw AppError.notFound("Address not found");

  return toAddressDto(updated);
};
