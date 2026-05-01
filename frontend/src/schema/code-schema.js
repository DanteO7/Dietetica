import z from "zod";

export const createCodeSchema = z.object({
  value: z.string().min(1, "El código es obligatorio"),
  type: z.coerce
    .number({
      required_error: "Seleccioná un tipo",
    })
    .int()
    .positive("Seleccioná un tipo"),
});
export const updateCodeSchema = z.object({
  value: z.string().min(1, "El código es obligatorio"),
  type: z.coerce
    .number({
      required_error: "Seleccioná un tipo",
    })
    .int()
    .positive("Seleccioná un tipo"),
});
