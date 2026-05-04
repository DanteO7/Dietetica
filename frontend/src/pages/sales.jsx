import { useEffect, useRef, useState } from "react";
import { useInfiniteSales } from "../hooks/useInfinitesSales";
import MainLayout from "../layouts/main-layout";
import SaleCard from "../components/sales/sale-card";
import { useSaleFilterStore } from "../store/sale-filter-store";
import { useQuery } from "@tanstack/react-query";
import { getSalesCount } from "../services/sale";

export default function Sales() {
  const sentinelRef = useRef(null);
  const [saleSelected, setSaleSelected] = useState(null);
  const { setFilters, date, paymentMethodId } = useSaleFilterStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteSales();

  const sales = data?.pages.flatMap((page) => page.items) ?? [];
  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    if (!date) {
      setFilters({ date: today });
    }
  }, []);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { data: count, isLoading } = useQuery({
    queryKey: ["count-sales", date, paymentMethodId],
    queryFn: () =>
      getSalesCount({
        date,
        paymentMethodId,
      }),
  });
  useEffect(() => {
    if (date === undefined) {
      setFilters({ date: today });
    }
  }, []);

  return (
    <MainLayout>
      <div className="flex justify-between w-[60%] items-center text-xl">
        <input
          type="date"
          className="border rounded-xl px-2 py-2"
          value={date || ""}
          onChange={(e) =>
            setFilters({
              date: e.target.value || undefined,
            })
          }
        />
        <p>Ventas en este dia: {isLoading ? "..." : count}</p>
        <div className=" flex items-center gap-5">
          <label className="text-black">Método de pago:</label>

          <select
            value={paymentMethodId || ""}
            onChange={(e) =>
              setFilters({
                paymentMethodId: Number(e.target.value) || undefined,
              })
            }
            className="rounded-[13px] p-2 min-w-[25%] border-gray-200 border-[1.7px] bg-[#efefef] cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="1">Transferencia</option>
            <option value="2">Efectivo</option>
            <option value="3">Tarjeta</option>
          </select>
        </div>
      </div>
      <div className="w-[65%] overflow-y-auto px-1 pt-1 overflow-x-hidden scrollbar-hide">
        {sales.map((s) => (
          <SaleCard
            key={s.id}
            sale={s}
            select={setSaleSelected}
            saleSelected={saleSelected}
          />
        ))}
        <div ref={sentinelRef} className="h-4" />

        {isFetchingNextPage && (
          <p className="text-center py-4 text-sm text-gray-400">
            Cargando más...
          </p>
        )}
      </div>
    </MainLayout>
  );
}
