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
      onClick={() => setOpenUpdateModal(true)}
      className="group flex flex-col justify-between border rounded-2xl p-7 text-2xl w-55 h-55 text-center shadow-xl hover:bg-[#e1e1e9] transition-all duration-200 cursor-pointer"
    >
      <p>{method.name}</p>

      <p>
        {method.discount === 0
          ? "Sin descuento"
          : `${method.discount}% de descuento`}
      </p>

      <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-300">
        <SquarePen
          className="m-auto text-gray-500 hover:text-black transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setOpenUpdateModal(true);
          }}
        />
        <Trash2
          className="m-auto text-red-500 hover:text-red-800 transition-all duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setOpenDeleteModal(true);
          }}
        />
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
