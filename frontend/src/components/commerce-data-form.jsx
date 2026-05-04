import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "./modal";
import { commerceDataSchema } from "../schema/data-schema";
import { useForm } from "react-hook-form";
import { useDataStore } from "../store/data-store";
import FormInput from "./form-input";
import { useEffect } from "react";

export default function CommerceDataForm({ close }) {
  const { setData, commerceName } = useDataStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(commerceDataSchema),
    mode: "onTouched",
    defaultValues: {
      name: commerceName || "",
    },
  });

  useEffect(() => {
    if (commerceName) {
      reset({ name: commerceName });
    }
  }, [commerceName, reset]);

  const onSubmit = (data) => {
    setData(data);
    close();
  };

  return (
    <Modal open={true} onClose={close}>
      <h3 className="font-semibold text-xl">Elegir datos del negocio</h3>
      <form
        noValidate
        className="flex flex-col gap-5 pt-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormInput
          id="name"
          type="text"
          label="Nombre"
          placeholder="Nombre del negocio..."
          register={register("name")}
          error={errors.name}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-[#efefef] bg-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
        >
          Agregar datos
        </button>
      </form>
    </Modal>
  );
}
