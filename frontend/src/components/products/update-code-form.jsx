import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { updateCode } from "../../services/code";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateCodeSchema } from "../../schema/code-schema";
import FormInput from "../form-input";
import { useFilterStore } from "../../store/filter-store";
import Modal from "../modal";
import SuccesModal from "../succes-modal";

export default function UpdateCodeForm({ close, code, productSelected }) {
  const queryClient = useQueryClient();
  const { search, isGranel, isUnit } = useFilterStore();
  const [backendError, setBackendError] = useState();
  const [succesMessage, setSuccessMessage] = useState();
  const [succesModal, setSuccesModal] = useState(false);

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateCodeSchema),
    mode: "onTouched",
    defaultValues: {
      value: code.value,
      type: code.type === "Barcode" ? 1 : 2,
    },
  });

  const updateMutation = useMutation({
    mutationKey: ["updateCode"],
    mutationFn: updateCode,
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
      setSuccessMessage("Código actualizado correctamente");
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
    },
  });

  const onSubmit = (data) => {
    setBackendError(null);
    updateMutation.mutate({ id: code.id, data });
  };

  const handleScan = useCallback(async (code) => {
    setValue("value", code, { shouldValidate: true });
    setValue("type", "1", { shouldValidate: true });
  }, []);

  useEffect(() => {
    let buffer = "";
    let timeout = null;

    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      clearTimeout(timeout);

      if (e.key === "Enter") {
        if (buffer.length > 0) {
          handleScan(buffer);
          buffer = "";
        }
        return;
      }

      buffer += e.key;

      timeout = setTimeout(() => {
        buffer = "";
      }, 100);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleScan]);

  return (
    <Modal open={true} onClose={close}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Editar código</h2>
        <X className="cursor-pointer hover:text-gray-500" onClick={close} />
      </div>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex-col gap-2"
      >
        <div className="flex gap-2">
          <FormInput
            label="Código"
            id="value"
            type="text"
            placeholder="Ej: AVN1, 12345"
            register={register("value")}
            error={errors.value}
            disabled={isSubmitting || updateMutation.isPending}
          />
          <div>
            <div className="mb-2 block">
              <label className="text-black" htmlFor="type">
                Tipo
              </label>
            </div>
            <select
              {...register("type")}
              className="rounded-[13px] px-1 py-2 w-full border-gray-200 border-[1.7px] bg-[#efefef]"
            >
              <option value="">Tipo</option>
              <option value="1">Barras</option>
              <option value="2">Auxiliar</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}
          </div>
        </div>

        {backendError && (
          <p className="text-red-600 font-semibold text-center mb-5">
            {backendError}
          </p>
        )}

        <div className="flex gap-3 justify-end mt-5">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 rounded border cursor-pointer transition-all duration-200 hover:bg-gray-200"
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
    </Modal>
  );
}
