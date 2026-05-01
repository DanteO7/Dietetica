import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Modal from "../modal";
import { Search, X } from "lucide-react";
import { getProducts } from "../../services/product";
import SelectQuantityForm from "./select-quantity-form";

export default function AddProductForm({ close, addProduct }) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [productSelected, setProductSelected] = useState(null);
  const [openQuantityModal, setOpenQuantityModal] = useState(false);
  const [error, setError] = useState("");

  // debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data, isLoading } = useQuery({
    queryKey: ["modal-products", debouncedSearch],
    queryFn: () =>
      getProducts({
        search: debouncedSearch || undefined,
        page: 1,
        pageSize: 10,
      }),
    enabled: debouncedSearch.length > 0,
  });

  const products = data?.items || [];

  return (
    <Modal open={true} onClose={close}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Agregar producto</h2>

        <X className="cursor-pointer hover:text-gray-500" onClick={close} />
      </div>

      <div className="relative mb-5">
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-black"
          />
        )}
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="max-h-[350px] overflow-y-auto mb-5">
        {isLoading && <p>Buscando...</p>}

        {!isLoading &&
          products.map((p) => (
            <div
              key={p.id}
              className={`border rounded p-3 mb-2 cursor-pointer hover:bg-gray-100 ${productSelected?.id == p.id ? "border-2 bg-green-50 border-green-600" : ""}`}
              onClick={() => {
                setError("");
                setProductSelected(p);
              }}
            >
              {p.name}
            </div>
          ))}
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={close}
          className="cursor-pointer px-4 py-2 rounded border hover:bg-gray-200"
        >
          Cancelar
        </button>

        <button
          onClick={() => {
            if (productSelected == null) {
              setError("Selecciona algun producto");
              return;
            }
            setOpenQuantityModal(true);
          }}
          className="cursor-pointer px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        >
          Agregar
        </button>
      </div>
      {openQuantityModal && (
        <SelectQuantityForm
          close={() => setOpenQuantityModal(false)}
          closeAll={() => close()}
          addProduct={addProduct}
          product={productSelected}
        />
      )}
    </Modal>
  );
}
