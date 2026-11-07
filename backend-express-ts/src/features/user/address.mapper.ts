import type { AddressDto } from "@rebuy/contracts";
import type { AddressDocument } from "./address.model.js";

export const toAddressDto = (address: AddressDocument): AddressDto => ({
  addressId: address._id.toString(),
  label: address.label,
  recipientName: address.recipientName,
  phone: address.phone,
  street: address.street,
  city: address.city,
  province: address.province,
  postalCode: address.postalCode,
  notes: address.notes ?? undefined,
  isDefault: address.isDefault,
});
