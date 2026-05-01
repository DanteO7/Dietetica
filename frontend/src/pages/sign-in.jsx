import { Link, useLocation } from "wouter";
import FormInput from "../components/form-input";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/auth-store";
import { signIn } from "../services/auth";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "../schema/auth-schema";

export default function SignIn() {
  const { setAuth } = useAuthStore();
  const [, setLocation] = useLocation();
  const [backendError, setBackendError] = useState();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationKey: ["signin"],
    mutationFn: signIn,
    onSuccess: (data) => {
      setAuth(data);
      setLocation("/");
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message || "Ocurrió un error al iniciar sesión";

      setBackendError(msg);
    },
  });

  const onSubmit = (credentials) => {
    setBackendError(null);
    console.log("submit", credentials);
    mutation.mutate(credentials);
  };

  return (
    <div className="bg-[#ede9ee] pt-10 h-screen text-[12px]">
      <div className="text-black p-5 m-auto w-11/12 md:w-1/2 lg:w-1/4">
        <form
          noValidate
          className="flex max-w flex-col gap-3.5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-center text-2xl font-bold">Turno Fácil</h2>
          <p className="text-center text-gray-700 text-[16px]">
            Iniciar sesión
          </p>
          {backendError && (
            <p className="text-red-600 font-semibold text-center mb-2">
              {backendError}
            </p>
          )}
          <div>
            <FormInput
              id="username"
              type="text"
              placeholder="Nombre..."
              register={register("username")}
              error={errors.username}
              disabled={isSubmitting || mutation.isPending}
            />
          </div>
          <div>
            <FormInput
              id="password"
              type="password"
              placeholder="Contraseña..."
              register={register("password")}
              error={errors.password}
              disabled={isSubmitting || mutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="text-[#efefef] bg-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
          >
            {mutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
