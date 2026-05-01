import { X } from "lucide-react";
import React, { useState } from "react";
import Modal from "../modal";

export default function SelectQuantityForm({
  close,
  closeAll,
  addProduct,
  product,
}) {
  const [input, setInput] = useState(0);
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
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border rounded-[5px] p-1 w-[90px]"
          placeholder={product.type === "Unit" ? "Unidades" : "Gramos"}
        />
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
    </Modal>
  );
}
