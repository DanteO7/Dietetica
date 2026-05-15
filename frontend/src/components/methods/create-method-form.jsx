import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../modal";
import { createMethod } from "../../services/payment-method";
import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMethodSchema } from "../../schema/method-schema";
import FormInput from "../form-input";
import SuccesModal from "../succes-modal";
import ErrorModal from "../error-modal";

export default function CreateMethodForm({ close }) {
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
    resolver: zodResolver(createMethodSchema),
    mode: "onTouched",
  });

  const createMutation = useMutation({
    mutationKey: ["createCode"],
    mutationFn: createMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getMethods"],
      });

      setSuccessMessage("Metodo creado correctamente");
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
    createMutation.mutate(data);
  };

  return (
    <Modal open={true} onClose={close}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Crear Metodo de pago</h2>
        <X className="cursor-pointer hover:text-gray-500" onClick={close} />
      </div>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3.5"
      >
        <FormInput
          label="Nombre"
          id="name"
          type="text"
          placeholder="Ej: Mercado Pago..."
          register={register("name")}
          error={errors.name}
          disabled={isSubmitting || createMutation.isPending}
        />
        <FormInput
          label="Descuento"
          id="discount"
          type="number"
          placeholder="Ej: 10, 25..."
          register={register("discount")}
          error={errors.discount}
          disabled={isSubmitting || createMutation.isPending}
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
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-700 cursor-pointer transition-all duration-200"
          >
            Agregar
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
