import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { useFilterStore } from "../../store/filter-store";
import { deleteProduct } from "../../services/product";
import Modal from "../modal";
import SuccesModal from "../succes-modal";

export default function DeleteProductForm({
  close,
  product,
  productSelected,
  closeDetail,
}) {
  const queryClient = useQueryClient();
  const { search, isGranel, isUnit } = useFilterStore();
  const [backendError, setBackendError] = useState();
  const [succesMessage, setSuccessMessage] = useState();
  const [succesModal, setSuccesModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.setQueryData(
        ["products", { search, isGranel, isUnit }],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.filter((p) => p.id !== product.id),
            })),
          };
        },
      );
      setSuccessMessage("Producto eliminado correctamente");
      setSuccesModal(true);
      setBackendError(null);
      setTimeout(() => {
        close();
        closeDetail(); // cierra el aside si estaba abierto
        productSelected(null);
      }, 3000);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error";
      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;
      setBackendError(msg);
    },
  });

  return (
    <Modal open={true} onClose={close}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Eliminar producto</h2>
        <X className="cursor-pointer hover:text-red-500" onClick={close} />
      </div>

      <p className="mb-6">
        ¿Seguro que querés eliminar <b>{product.name}</b>?
      </p>

      {backendError && (
        <p className="text-red-600 font-semibold text-center mb-5">
          {backendError}
        </p>
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={close}
          className="px-4 py-2 rounded border cursor-pointer transition-all duration-200 hover:bg-[#e1e1e9]"
        >
          Cancelar
        </button>
        <button
          onClick={() => deleteMutation.mutate(product.id)}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-700 cursor-pointer transition-all duration-200"
        >
          Eliminar
        </button>
      </div>
      {succesModal && (
        <SuccesModal
          close={() => setSuccesModal(false)}
          message={succesMessage}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
