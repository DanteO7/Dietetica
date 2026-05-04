import { z } from "zod";

export const commerceDataSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "El nombre del negocio no debe tener mas de 50 caracteres"),
});
