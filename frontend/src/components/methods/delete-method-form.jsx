import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../modal";
import { useState } from "react";
import { deletePaymentMethod } from "../../services/payment-method";
import { X } from "lucide-react";
import SuccesModal from "../succes-modal";

export default function DeleteMethodForm({ close, method }) {
  const queryClient = useQueryClient();
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();
  const [succesModal, setSuccesModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      setSuccessMessage("Metodo de pago eliminado correctamente");
      setSuccesModal(true);
      setBackendError(null);
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["getMethods"],
        });
        close();
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
      setErrorModal(true);
    },
  });
  return (
    <Modal open={true} onClose={close}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Eliminar Metodo de pago</h2>
        <X className="cursor-pointer hover:text-red-500" onClick={close} />
      </div>

      <p className="mb-6">
        ¿Seguro que querés eliminar <b>{method.name}</b>?
      </p>

      <div className="flex gap-3 justify-end">
        <button
          onClick={close}
          className="px-4 py-2 rounded border cursor-pointer transition-all duration-200 hover:bg-[#e1e1e9]"
        >
          Cancelar
        </button>
        <button
          onClick={() => deleteMutation.mutate(method.id)}
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
        <SuccesModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
