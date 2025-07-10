import { z } from "zod";

export const formSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, "El título es requerido.")
    .optional()
    .or(z.literal("")),

  status: z.enum(["Ingresado", "En proceso", "Completado"]),
  priority: z.enum(["Normal", "Alta", "Urgente"]),
  device: z.object({
    type: z.string().min(1, "El tipo de dispositivo es requerido."),
    brand: z.string().min(1, "La marca es requerida."),
    model: z.string(),
    physicalCondition: z.string().min(1, "Selecciona una condición física."),
    flaw: z.string().min(1, "El problema es requerido."),
    notes: z.string().max(125, "Máximo 125 caracteres.").optional(),
  }),
  customer: z.string().min(1, "El cliente es requerido."),
  receivedBy: z.string().min(1, "El usuario que recibe es requerido."),
});

export type RepairsForm = z.infer<typeof formSchema>;

// Definir y exportar el tipo RepairType
export type RepairType = {
  id?: string;
  repairCode: string;
  title: string;
  status: string;
  priority: string;
  device: {
    type: string;
    brand: string;
    model: string;
    serialNumber?: string;
  };
  label?: string;
  // Agrega otras propiedades según sea necesario
};
