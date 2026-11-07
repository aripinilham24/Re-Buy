import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AddressInput } from "@rebuy/contracts";
import { getErrorMessage } from "@/lib/errors";
import {
  createAddressService,
  deleteAddressService,
  listAddressesService,
  setDefaultAddressService,
  updateAddressService,
} from "../services/addressServices";

export const useAddresses = () =>
  useQuery({
    queryKey: ["addresses"],
    queryFn: listAddressesService,
  });

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddressInput) => createAddressService(data),
    onSuccess: () => {
      toast.success("Alamat ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menambah alamat")),
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      data,
    }: {
      addressId: string;
      data: Partial<AddressInput>;
    }) => updateAddressService(addressId, data),
    onSuccess: () => {
      toast.success("Alamat diperbarui");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui alamat")),
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddressService,
    onSuccess: () => {
      toast.success("Alamat dihapus");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus alamat")),
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultAddressService,
    onSuccess: () => {
      toast.success("Alamat utama diperbarui");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui alamat utama")),
  });
};
