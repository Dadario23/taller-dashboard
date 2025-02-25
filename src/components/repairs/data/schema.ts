import { z } from "zod";

export const formSchema = z
  .object({
    device: z.string().min(1, "El dispositivo es requerido."),
    customerId: z.string().min(1, "Customer is required."),
    flaw: z.string().min(1, "Issue is required."),
    priority: z.enum(["Normal", "Alta", "Urgente"]),
    brand: z.string().min(1, "Brand is required."),
    model: z.string(),
    physicalCondition: z.string().min(1, "Selecciona una condición física."),
    notes: z.string().max(125, "Máximo 90 caracteres."),
  })
  .superRefine((data, ctx) => {
    if (data.brand !== "Sin especificar" && data.model.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["model"],
        message: "Model is required.",
      });
    }
  });

export type RepairsForm = z.infer<typeof formSchema>;
