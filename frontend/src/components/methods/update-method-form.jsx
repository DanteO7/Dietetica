import React from "react";
import Modal from "../modal";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateMethodSchema } from "../../schema/method-schema";
import { updatePaymentMethod } from "../../services/payment-method";
import { X } from "lucide-react";
import FormInput from "../form-input";
import ErrorModal from "../error-modal";
import SuccesModal from "../succes-modal";

export default function UpdateMethodForm({ close, method }) {
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();
  const [succesModal, setSuccesModal] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    isSubmitting,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateMethodSchema),
    mode: "onTouched",
    defaultValues: {
      name: method.name,
      discount: method.discount,
    },
  });

  const updateMutation = useMutation({
    mutationKey: ["updateMethod"],
    mutationFn: updatePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getMethods"],
      });

      setSuccessMessage("Metodo actualizado correctamente");
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

  const onSubmit = (data) => {
    setBackendError(null);
    updateMutation.mutate({ id: method.id, data });
  };

  return (
    <Modal open={true} onClose={close}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Actualizar Metodo de pago</h2>
        <X className="cursor-pointer hover:text-gray-500" onClick={close} />
      </div>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex-col gap-2"
      >
        <FormInput
          label="Nombre"
          id="name"
          type="text"
          placeholder="Ej: Mercado Pago..."
          register={register("name")}
          error={errors.name}
          disabled={isSubmitting || updateMutation.isPending}
        />
        <FormInput
          label="Descuento"
          id="discount"
          type="number"
          placeholder="Ej: 10, 25..."
          register={register("discount")}
          error={errors.discount}
          disabled={isSubmitting || updateMutation.isPending}
        />
        <div className="flex gap-3 justify-end mt-5">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 rounded border cursor-pointer transition-all duration-200 hover:bg-[#e1e1e9]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700 cursor-pointer transition-all duration-200"
          >
            Guardar
          </button>
        </div>
      </form>
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
