import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../form-input";
import ImageInput from "../image-input";
import { useFilterStore } from "../../store/filter-store";
import { updateProductSchema } from "../../schema/product-schema";
import { uploadImage } from "../../services/upload";
import { updateProduct } from "../../services/product";
import Modal from "../modal";
import SuccesModal from "../succes-modal";
import ErrorModal from "../error-modal";

export default function UpdateProductForm({ close, product, productSelected }) {
  const queryClient = useQueryClient();
  const { search, isGranel, isUnit } = useFilterStore();
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();
  const [succesModal, setSuccesModal] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(product.imageUrl || null);
  const modalRef = useRef(null);

  const handleImage = (file) => {
    setFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const {
    control,
    getValues,
    setValue,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateProductSchema),
    mode: "onTouched",
    defaultValues: {
      name: product.name,
      shortName: product.shortName,
      price: product.price,
      stock: product.stock,
      type: product.type === "Unit" ? 1 : 2,
      codes: product.codes.map((c) => ({
        id: c.id,
        value: c.value,
        type: c.type === "Barcode" ? 1 : 2,
      })),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "codes",
  });

  const uploadMutation = useMutation({
    mutationFn: uploadImage,
    onError: () => {
      setBackendError("Error al subir la imagen");
      modalRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
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
      setSuccessMessage("Producto actualizado correctamente");
      setSuccesModal(true);
      setBackendError(null);
      setTimeout(() => {
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
      modalRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  });

  const onSubmit = async (data) => {
    console.log(data);

    setBackendError(null);
    try {
      let imageUrl = product.imageUrl;

      if (!preview && !file) {
        imageUrl = "";
      }

      if (file) {
        const result = await uploadMutation.mutateAsync(file);
        imageUrl = result.url;
      }

      await updateMutation.mutateAsync({
        id: product.id,
        data: { ...data, imageUrl },
      });
    } catch {
      // los errores los manejan los onError de cada mutation
    }
  };

  const handleScan = useCallback(
    (code) => {
      const codes = getValues("codes");

      const exists = codes.some((c) => c.value === code);
      if (exists) return;

      const emptyIndex = codes.findIndex(
        (item) => !item.value || item.value.trim() === "",
      );

      if (emptyIndex !== -1) {
        setValue(`codes.${emptyIndex}.value`, code, {
          shouldValidate: true,
        });

        setValue(`codes.${emptyIndex}.type`, "1", {
          shouldValidate: true,
        });

        return;
      }

      append({
        value: code,
        type: "1",
      });
    },
    [getValues, setValue, append],
  );

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

  const isPending =
    isSubmitting || updateMutation.isPending || uploadMutation.isPending;

  return (
    <Modal open={true} onClose={close} ref={modalRef}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold">Editar producto</h2>
        <X className="cursor-pointer hover:text-red-500" onClick={close} />
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
          register={register("name")}
          error={errors.name}
          disabled={isPending}
        />

        <FormInput
          label="Nombre corto (32 caracteres)"
          id="shortName"
          type="text"
          placeholder="Ej: Empanadas de JyQ x4..."
          register={register("shortName")}
          error={errors.shortName}
          disabled={isPending}
        />

        <ImageInput onChange={handleImage} preview={preview} />

        <FormInput
          label="Precio"
          id="price"
          type="number"
          register={register("price")}
          error={errors.price}
          disabled={isPending}
        />

        <FormInput
          label="Stock (en unidad o gramos)"
          id="stock"
          type="number"
          register={register("stock")}
          error={errors.stock}
          disabled={isPending}
        />

        <div>
          <div className="mb-2 block">
            <label className="text-black" htmlFor="type">
              Tipo de producto
            </label>
          </div>
          <select
            {...register("type")}
            className="rounded-[13px] px-1 py-2 w-full border-gray-200 border-[1.7px] bg-[#efefef] cursor-pointer"
          >
            <option value="">Seleccionar tipo</option>
            <option value="1">Unidad</option>
            <option value="2">Peso</option>
          </select>
          {errors.type && (
            <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end w-full gap-5">
            {/* id oculto para que se mande al backend */}
            <input type="hidden" {...register(`codes.${index}.id`)} />
            <FormInput
              label="Código"
              id={`code-value-${index}`}
              type="text"
              placeholder="Ej: AVN1, 12345"
              register={register(`codes.${index}.value`)}
              error={errors.codes?.[index]?.value}
              disabled={isPending}
            />
            <div>
              <div className="mb-2 block">
                <label className="text-black">Tipo</label>
              </div>
              <select
                {...register(`codes.${index}.type`)}
                className="rounded-[13px] px-1 py-2 border-gray-200 border-[1.7px] bg-[#efefef] w-25"
              >
                <option value="">Tipo</option>
                <option value="1">Barras</option>
                <option value="2">Auxiliar</option>
              </select>
              {errors.codes?.[index]?.type && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.codes[index].type.message}
                </p>
              )}
            </div>
            <button
              type="button"
              className="pb-2.5"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              <Trash2 className="m-auto text-red-500 hover:text-red-800 transition-all duration-300 cursor-pointer" />
            </button>{" "}
          </div>
        ))}

        <button
          type="button"
          className="border-gray-200 border-[1.7px] bg-[#efefef] w-1/3 rounded-[10px] py-1 m-auto cursor-pointer"
          onClick={() => append({ value: "", type: "" })}
        >
          + Agregar código
        </button>

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 rounded border cursor-pointer transition-all duration-200 hover:bg-[#e1e1e9]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700 cursor-pointer transition-all duration-200"
          >
            {isPending ? "Guardando..." : "Guardar"}
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
