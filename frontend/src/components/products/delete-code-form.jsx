import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { deleteCode } from "../../services/code";
import { useState } from "react";
import { useFilterStore } from "../../store/filter-store";
import Modal from "../modal";
import SuccesModal from "../succes-modal";
import ErrorModal from "../error-modal";

export default function DeleteCodeForm({ close, code, productSelected }) {
  const queryClient = useQueryClient();
  const { search, isGranel, isUnit } = useFilterStore();
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();
  const [succesModal, setSuccesModal] = useState(false);

  const deleteMutation = useMutation({
    mutationKey: ["deleteCode"],
    mutationFn: deleteCode,
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData(
        ["products", { search, isGranel, isUnit }],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((p) =>
                p.id === updatedProduct.id ? updatedProduct : p,
              ),
            })),
          };
        },
      );
      productSelected(updatedProduct);
      setSuccessMessage("Código eliminado correctamente");
      setSuccesModal(true);
      setBackendError(null);
      setTimeout(() => {
        close();
      }, 3000);
    },
    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.title) {
        msg = data.title;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  return (
    <Modal open={true} onClose={close}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Eliminar código</h2>
        <X className="cursor-pointer hover:text-gray-500" onClick={close} />
      </div>

      <p className="mb-5">
        ¿Seguro que querés eliminar el código '<b>{code.value}</b>'?
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={close}
          className="px-4 py-2 rounded border cursor-pointer transition-all duration-200 hover:bg-[#e1e1e9]"
        >
          Cancelar
        </button>
        <button
          onClick={() => deleteMutation.mutate(code.id)}
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
      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
