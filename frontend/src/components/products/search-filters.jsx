import { Search, X } from "lucide-react";
import { useFilterStore } from "../../store/filter-store";
import { useEffect, useState } from "react";
import CreateProductForm from "./create-product-form";

export default function SearchFilters({ disabledEscaner, enableScanner }) {
  const [openModal, setOpenModal] = useState(false);
  const { search, isGranel, isUnit, isLowStock, setFilters } = useFilterStore();

  const [inputValue, setInputValue] = useState(search || "");

  // debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({
        search: inputValue.trim() || undefined,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, setFilters]);

  return (
    <div className="mb-5 flex flex-wrap gap-3 items-center sticky top-0 bg-[#ede9ee] pb-3">
      <div className="relative flex-1 min-w-62.5">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Buscar producto o código..."
          className="w-full border rounded-xl pl-10 pr-10 py-2 outline-none"
        />

        {inputValue && (
          <X
            size={18}
            onClick={() => setInputValue("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-black transition-all"
          />
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isGranel || false}
          onChange={(e) =>
            setFilters({
              isGranel: e.target.checked ? true : undefined,
            })
          }
        />
        Granel
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isUnit || false}
          onChange={(e) =>
            setFilters({
              isUnit: e.target.checked ? true : undefined,
            })
          }
        />
        Unidad
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isLowStock || false}
          onChange={(e) =>
            setFilters({
              isLowStock: e.target.checked ? true : undefined,
            })
          }
        />
        Stock bajo
      </label>
      <button
        className="border rounded-[7px] px-2 py-1 hover:bg-gray-200 transition-all duration-200 cursor-pointer"
        onClick={() => {
          disabledEscaner();
          setOpenModal(true);
        }}
      >
        Crear Producto
      </button>
      {openModal && (
        <CreateProductForm
          close={() => {
            enableScanner();
            setOpenModal(false);
          }}
        />
      )}
    </div>
  );
}
