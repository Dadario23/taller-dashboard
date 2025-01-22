import { z } from "zod";

// Esquema para login
export const loginSchema = z.object({
  email: z.string().email("Debe ser un correo válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Esquema para registro
export const registerSchema = z
  .object({
    fullname: z.string().min(3, "Fullname must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Mostrar el error en el campo confirmPassword
  });

export type RegisterInput = z.infer<typeof registerSchema>;
