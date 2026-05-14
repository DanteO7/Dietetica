import z from "zod";

export const createMethodSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(32, "El nombre no puede tener mas de 50 caracteres"),
  discount: z.coerce
    .number()
    .nonnegative("El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor que 100%"),
});

export const updateMethodSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(32, "El nombre no puede tener mas de 50 caracteres"),
  discount: z.coerce
    .number()
    .nonnegative("El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor que 100%"),
});
