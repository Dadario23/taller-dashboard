import { z } from "zod";

// Esquema para validación de reparaciones
export const repairSchema = z.object({
  id: z.string(),
  repairCode: z
    .string()
    .regex(/^TASK-\d{4,}$/, "Repair code must match format TASK-XXXX"),
  title: z.string().min(1, "Title is required"),
  status: z.enum([
    "Pending",
    "Under Review",
    "In Progress",
    "Ready for Pickup",
    "Delivered",
    "Cancelled",
    "Not Repairable",
    "Waiting for Customer Approval",
  ]),
  priority: z.enum(["Low", "Medium", "High"]),
  customerId: z.object({
    _id: z.string(),
    email: z.string().email(),
    fullname: z.string(),
  }),
  device: z.object({
    type: z.string(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string().optional(),
    physicalCondition: z.string().optional(),
    problemDescription: z.string(),
    passwordOrPattern: z.string().nullable(),
  }),
  timeline: z.array(
    z.object({
      status: z.enum([
        "Pending",
        "Under Review",
        "In Progress",
        "Ready for Pickup",
        "Delivered",
        "Cancelled",
        "Not Repairable",
        "Waiting for Customer Approval",
      ]),
      timestamp: z.date(),
      note: z.string().optional(),
      changedBy: z.string(),
    })
  ),
  label: z.string().optional(),
});

export type Repair = z.infer<typeof repairSchema>;
