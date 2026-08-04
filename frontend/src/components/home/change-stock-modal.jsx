import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import Modal from "../modal";
import FormInput from "../form-input";

import { updateProductStock } from "../../services/product";
import ErrorModal from "../error-modal";
import SuccesModal from "../succes-modal";

const updateStockSchema = z.object({
  stock: z.coerce
    .number({
      invalid_type_error: "El stock es obligatorio",
    })
    .min(0, "El stock no puede ser negativo")
    .max(999999, "El stock es demasiado grande"),
});

export default function ChangeStockModal({
  close,
  product,
  onProductUpdated,
  setError,
}) {
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateStockSchema),
    mode: "onTouched",
    defaultValues: {
      stock: product.stock,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateProductStock(product.id, data),

    onSuccess: (updatedProduct) => {
      onProductUpdated(updatedProduct);
      queryClient.invalidateQueries({
        queryKey: ["modal-products"],
      });

      setError(null);
      setSuccessMessage("Stock actualizado correctamente");
      setSuccessModal(true);
      setBackendError(null);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al actualizar el stock";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (data) => {
    setBackendError(null);
    updateMutation.mutate({
      stock: data.stock,
    });
  };

  return (
    <>
      <Modal open={true} onClose={close}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">Actualizar stock</h2>
          <X className="cursor-pointer hover:text-gray-500" onClick={close} />
        </div>

        <p className="mb-3">
          Producto: <span className="font-semibold">{product.name}</span>
        </p>

        <p className="mb-6">
          Stock actual: <span className="font-semibold">{product.stock}</span>
        </p>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormInput
            label="Nuevo stock"
            id="stock"
            type="number"
            placeholder="Ingresá el nuevo stock"
            register={register("stock")}
            error={errors.stock}
            disabled={updateMutation.isPending}
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={close}
              className="cursor-pointer px-4 py-2 rounded border hover:bg-[#e1e1e9]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending || isSubmitting}
              className="shadow-md bg-gray-700 text-[#efefef] rounded px-4 py-2 hover:bg-gray-800 transition-all duration-200 cursor-pointer"
            >
              {updateMutation.isPending
                ? "Actualizando..."
                : "Actualizar stock"}
            </button>
          </div>
        </form>
      </Modal>

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}

      {successModal && (
        <SuccesModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError={true}
        />
      )}
    </>
  );
}
