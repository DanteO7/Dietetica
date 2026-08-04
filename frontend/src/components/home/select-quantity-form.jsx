import { X } from "lucide-react";
import React, { useState } from "react";
import Modal from "../modal";
import ChangeStockModal from "./change-stock-modal";

export default function SelectQuantityForm({
  close,
  closeAll,
  addProduct,
  product,
  onProductUpdated,
}) {
  const [openChangeStockModal, setOpenChangeStockModal] = useState(false);
  const [input, setInput] = useState(0);
  const [error, setError] = useState("");

  return (
    <Modal open={true} onClose={close}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Seleccionar cantidad</h2>

        <X className="cursor-pointer hover:text-gray-500" onClick={close} />
      </div>
      <div className="flex flex-col gap-2 mb-2">
        <p>
          {product.type === "Unit" ? (
            <>
              ¿Cuantas <b>unidades</b> queres agregar de <b>{product.name}</b>?
            </>
          ) : (
            <>
              ¿Cuantos <b>gramos</b> queres agregar de <b>{product.name}</b>?
            </>
          )}
        </p>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <input
          type="number"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value <= 0) {
              setError("Seleccione una cantidad mayor a cero");
            } else if (e.target.value > product.stock) {
              setError("La cantidad es mayor al stock");
            } else {
              setError("");
            }
          }}
          className="border rounded-[5px] p-1 w-22.5"
          placeholder={product.type === "Unit" ? "Unidades" : "Gramos"}
        />
      </div>
      <div className="flex gap-3 justify-between">
        {error == "La cantidad es mayor al stock" ? (
          <button
            onClick={() => setOpenChangeStockModal(true)}
            className="cursor-pointer px-4 py-2 self-start rounded border hover:bg-[#e1e1e9]"
          >
            Agregar Stock
          </button>
        ) : (
          <div></div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={close}
            className="cursor-pointer px-4 py-2 rounded border hover:bg-[#e1e1e9]"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (input <= 0) {
                setError("Seleccione una cantidad mayor a cero");
                return;
              }
              setTimeout(() => {
                close();
                closeAll();
              }, 300);
              addProduct(product, input);
            }}
            className="cursor-pointer px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Aceptar
          </button>
        </div>
      </div>
      {openChangeStockModal && (
        <ChangeStockModal
          close={() => {
            setOpenChangeStockModal(false);
          }}
          product={product}
          onProductUpdated={onProductUpdated}
          setError={setError}
        />
      )}
    </Modal>
  );
}
