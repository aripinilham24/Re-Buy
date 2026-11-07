import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  addWishlistService,
  listWishlistService,
  removeWishlistService,
} from "../services/wishlistServices";

export const useWishlist = (enabled = true) =>
  useQuery({
    queryKey: ["wishlist"],
    queryFn: listWishlistService,
    enabled,
  });

export const useWishlistMutations = () => {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: addWishlistService,
    onSuccess: () => {
      toast.success("Ditambahkan ke wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menambah wishlist")),
  });

  const remove = useMutation({
    mutationFn: removeWishlistService,
    onSuccess: () => {
      toast.success("Dihapus dari wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus wishlist")),
  });

  return { add, remove };
};
