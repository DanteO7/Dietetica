import { useEffect, useRef, useState } from "react";
import { useInfiniteSales } from "../hooks/useInfinitesSales";
import MainLayout from "../layouts/main-layout";
import SaleCard from "../components/sales/sale-card";
import { useSaleFilterStore } from "../store/sale-filter-store";
import { useQuery } from "@tanstack/react-query";
import { getSalesCount } from "../services/sale";
import DateModal from "../components/date-modal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getPaymentMethods } from "../services/payment-method";

export default function Sales() {
  const sentinelRef = useRef(null);
  const [saleSelected, setSaleSelected] = useState(null);
  const { setFilters, date, dateTo, paymentMethodId } = useSaleFilterStore();
  const [selected, setSelected] = useState({
    from: new Date(),
    to: new Date(),
  });

  const { data: methods } = useQuery({
    queryKey: ["getMethods"],
    queryFn: getPaymentMethods,
  });

  useEffect(() => {
    if (!selected?.from) return;

    setFilters({
      date: format(selected.from, "yyyy-MM-dd"),
      dateTo: selected.to ? format(selected.to, "yyyy-MM-dd") : undefined,
    });
  }, [selected, setFilters]);

  const [openDateModal, setOpenDateModal] = useState(false);

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

  const { data: count, isLoading } = useQuery({
    queryKey: ["count-sales", date, dateTo, paymentMethodId],
    queryFn: () =>
      getSalesCount({
        date,
        dateTo,
        paymentMethodId,
      }),
  });

  const sameDay =
    selected?.from &&
    selected?.to &&
    selected.from.toDateString() === selected.to.toDateString();

  return (
    <MainLayout>
      {sameDay ? (
        <h2 className="text-3xl font-semibold">
          {format(selected.from, "PPPP", { locale: es })}
        </h2>
      ) : (
        <h2 className="text-3xl font-semibold">
          Desde {selected?.from && format(selected.from, "PPP", { locale: es })}
          {selected?.to &&
            ` - hasta ${format(selected.to, "PPP", { locale: es })}`}
        </h2>
      )}

      <div className="flex justify-between w-[60%] items-center text-xl">
        <button
          className="border bg-gray-700 text-[#efefef] rounded-[7px] px-2.5 py-1.5 hover:bg-gray-800 transition-all duration-200 cursor-pointer"
          onClick={() => setOpenDateModal(true)}
        >
          Seleccionar fecha
        </button>

        <p>
          Ventas en este {sameDay ? "dia" : "rango"}:{" "}
          {isLoading ? "..." : count}
        </p>
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
            <option value="">
              {isLoading ? "Cargando..." : "Todos los metodos"}
            </option>

            {methods?.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
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
      {openDateModal && (
        <DateModal
          close={() => setOpenDateModal(false)}
          changeSelected={setSelected}
        />
      )}
    </MainLayout>
  );
}
