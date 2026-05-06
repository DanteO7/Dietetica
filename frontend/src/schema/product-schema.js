import z from "zod";

export const createProductSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    shortName: z
      .string()
      .max(32, "El nombre corto no puede tener mas de 40 caracteres")
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    price: z.coerce
      .number()
      .positive("El precio debe ser mayor a cero")
      .max(9999999, "El precio es demasiado grande"),
    stock: z.coerce
      .number()
      .positive("El stock debe ser mayor a cero")
      .max(999999, "El stock es demasiado grande"),
    type: z.coerce
      .number({
        required_error: "Seleccioná un tipo",
      })
      .int()
      .positive("Seleccioná un tipo"),
    image: z.any().optional(),
    codes: z
      .array(
        z.object({
          value: z.string().min(1, "El código es obligatorio"),
          type: z.coerce
            .number({
              required_error: "Seleccioná un tipo",
            })
            .int()
            .positive("Seleccioná un tipo"),
        }),
      )
      .min(1, "Debe agregar al menos un código"),
  })
  .refine(
    (data) =>
      data.name.length <= 32 || (data.shortName && data.shortName.length > 0),
    {
      message:
        "Debe ingresar un nombre corto si el nombre supera los 32 caracteres",
      path: ["shortName"],
    },
  );

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es obligatorio")
      .max(100, "Máximo 100 caracteres"),
    shortName: z
      .string()
      .max(32, "El nombre corto no puede tener mas de 40 caracteres")
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    price: z.coerce
      .number()
      .positive("El precio debe ser mayor a cero")
      .max(9999999, "El precio es demasiado grande"),
    stock: z.coerce
      .number()
      .positive("El stock debe ser mayor a cero")
      .max(999999, "El stock es demasiado grande"),
    type: z.coerce
      .number({ required_error: "Seleccioná un tipo" })
      .int()
      .positive("Seleccioná un tipo"),
    image: z.any().optional(),
    codes: z
      .array(
        z.object({
          id: z.preprocess(
            (val) =>
              val === "" || val === undefined ? undefined : Number(val),
            z.number().int().positive().optional(),
          ),
          value: z.string().min(1, "El código es obligatorio"),
          type: z.coerce
            .number({ required_error: "Seleccioná un tipo" })
            .int()
            .positive("Seleccioná un tipo"),
        }),
      )
      .min(1, "Debe agregar al menos un código"),
  })
  .refine(
    (data) =>
      data.name.length <= 32 || (data.shortName && data.shortName.length > 0),
    {
      message:
        "Debe ingresar un nombre corto si el nombre supera los 32 caracteres",
      path: ["shortName"],
    },
  );
