import z from "zod";

export const signInSchema = z.object({
  username: z.string().max(50, "El nombre no debe tener mas de 50 caracteres"),
  password: z.string(),
});
