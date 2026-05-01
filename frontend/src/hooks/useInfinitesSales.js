import { useInfiniteQuery } from "@tanstack/react-query";
import { getSales } from "../services/sale";
import { useSaleFilterStore } from "../store/sale-filter-store";

export function useInfiniteSales() {
  const { date, paymentMethodId } = useSaleFilterStore();

  return useInfiniteQuery({
    queryKey: ["sales", { date, paymentMethodId }],
    queryFn: ({ pageParam = 1 }) =>
      getSales({ date, paymentMethodId, page: pageParam, pageSize: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });
}
