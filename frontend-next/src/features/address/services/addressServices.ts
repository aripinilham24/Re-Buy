import type { AddressDto, ApiSuccess } from "@rebuy/contracts";
import api from "@/lib/axios";

export const listAddressesService = async () => {
  const response = await api.get<ApiSuccess<AddressDto[]>>(
    "/users/me/addresses",
  );
  return response.data.data;
};

export const createAddressService = async (data: {
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  isDefault?: boolean;
}) => {
  const response = await api.post<ApiSuccess<AddressDto>>(
    "/users/me/addresses",
    data,
  );
  return response.data.data;
};

export const updateAddressService = async (
  addressId: string,
  data: Partial<AddressDto>,
) => {
  const response = await api.patch<ApiSuccess<AddressDto>>(
    `/users/me/addresses/${addressId}`,
    data,
  );
  return response.data.data;
};

export const deleteAddressService = async (addressId: string) => {
  await api.delete(`/users/me/addresses/${addressId}`);
};

export const setDefaultAddressService = async (addressId: string) => {
  const response = await api.patch<ApiSuccess<AddressDto>>(
    `/users/me/addresses/${addressId}/default`,
  );
  return response.data.data;
};
