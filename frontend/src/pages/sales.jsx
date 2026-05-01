import { useEffect, useRef, useState } from "react";
import { useInfiniteSales } from "../hooks/useInfinitesSales";
import MainLayout from "../layouts/main-layout";
import SaleCard from "../components/sales/sale-card";
import { useSaleFilterStore } from "../store/sale-filter-store";

export default function Sales() {
  const sentinelRef = useRef(null);
  const [saleSelected, setSaleSelected] = useState(null);
  const { setFilters, date, paymentMethodId } = useSaleFilterStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteSales();

  const sales = data?.pages.flatMap((page) => page.items) ?? [];
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

  return (
    <MainLayout>
      <div className="flex justify-between w-[50%] items-center text-xl">
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
        <p>Ventas en este dia: {sales.length}</p>
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
      <div className="w-[55%] overflow-y-auto h-147 px-2 overflow-x-hidden scrollbar-hide">
        {sales.map((s) => (
          <SaleCard
            key={s.id}
            sale={s}
            select={setSaleSelected}
            saleSelected={saleSelected}
          />
        ))}
      </div>
      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <p className="text-center py-4 text-sm text-gray-400">
          Cargando más...
        </p>
      )}
    </MainLayout>
  );
}
