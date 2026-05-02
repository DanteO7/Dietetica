import { useMutation } from "@tanstack/react-query";
import Modal from "../modal";
import { createSale } from "../../services/sale";
import { useState } from "react";
import { X } from "lucide-react";

export default function SaleConfirm({ close, data, setSale }) {
  const [successMessage, setSuccessMessage] = useState("");
  const [backendError, setBackendError] = useState("");

  const mutation = useMutation({
    mutationKey: ["createSale"],
    mutationFn: createSale,
    onSuccess: (sale) => {
      setSale(sale);
      setSuccessMessage("Venta creada correctamente");
      setBackendError(null);
      setTimeout(() => {
        close();
      }, 1200);
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
        <h2 className="text-xl font-semibold">Confirmar Venta</h2>

        <X className="cursor-pointer hover:text-gray-500" onClick={close} />
      </div>
      {backendError && <p className="text-red-600 mb-2">{backendError}</p>}
      {successMessage && (
        <p className="text-green-600 mb-2">{successMessage}</p>
      )}
      <div className="flex gap-3 justify-end">
        <button
          onClick={close}
          className="cursor-pointer px-4 py-2 rounded border hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          onClick={() => mutation.mutate(data)}
          disabled={mutation.isPending}
          disabled={mutation.isSuccess}
          className="cursor-pointer px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Procesando..." : "Aceptar"}
        </button>
      </div>
    </Modal>
  );
}
