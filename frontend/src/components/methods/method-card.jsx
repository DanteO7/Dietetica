import { useState } from "react";
import UpdateMethodForm from "./update-method-form";
import { Trash2 } from "lucide-react";
import { SquarePen } from "lucide-react";
import DeleteMethodForm from "./delete-method-form";

export default function MethodCard({ method }) {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  return (
    <div
      role="group"
      aria-label={`Método de pago ${method.name}`}
      tabIndex={0}
      data-keyboard-nav-item
      data-keyboard-activate
      onClick={() => {
        if (openDeleteModal || openUpdateModal) return;
        setOpenUpdateModal(true);
      }}
      className="group flex flex-col justify-between border rounded-2xl p-7 text-2xl w-55 h-55 text-center shadow-xl hover:bg-[#e1e1e9] transition-all duration-200 cursor-pointer"
    >
      <p>{method.name}</p>

      <p>
        {method.discount === 0
          ? "Sin descuento"
          : `${method.discount}% de descuento`}
      </p>

      <div className="flex opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300">
        <button
          type="button"
          aria-label={`Editar ${method.name}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpenUpdateModal(true);
          }}
          className="m-auto text-gray-500 hover:text-black transition-all duration-300 cursor-pointer"
        >
          <SquarePen aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Eliminar ${method.name}`}
          onClick={(e) => {
            e.stopPropagation();
            setOpenDeleteModal(true);
          }}
          className="m-auto text-red-500 hover:text-red-800 transition-all duration-300 cursor-pointer"
        >
          <Trash2 aria-hidden="true" />
        </button>
      </div>
      {openUpdateModal && (
        <UpdateMethodForm
          close={() => setOpenUpdateModal(false)}
          method={method}
        />
      )}
      {openDeleteModal && (
        <DeleteMethodForm
          close={() => setOpenDeleteModal(false)}
          method={method}
        />
      )}
    </div>
  );
}
