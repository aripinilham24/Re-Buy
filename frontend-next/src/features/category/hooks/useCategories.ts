import { useQuery } from "@tanstack/react-query";
import { listCategoriesService } from "../services/categoryServices";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: listCategoriesService,
    staleTime: 5 * 60 * 1000,
  });
