import { useInfiniteQuery } from "@tanstack/react-query";
import { getProducts } from "../services/product";
import { useFilterStore } from "../store/filter-store";

export function useInfiniteProducts() {
  const { search, isGranel, isUnit, isLowStock } = useFilterStore();

  return useInfiniteQuery({
    queryKey: ["products", { search, isGranel, isUnit, isLowStock }],
    queryFn: ({ pageParam = 1 }) =>
      getProducts({
        search,
        isGranel,
        isUnit,
        isLowStock,
        page: pageParam,
        pageSize: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });
}
