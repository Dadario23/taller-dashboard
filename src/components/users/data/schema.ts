// data/schema.ts
import { z } from "zod";

const userStatusSchema = z.union([
  z.literal("active"),
  z.literal("inactive"),
  z.literal("invited"),
  z.literal("suspended"),
]);
export type UserStatus = z.infer<typeof userStatusSchema>;

const userRoleSchema = z.union([
  z.literal("superadmin"),
  z.literal("admin"),
  z.literal("technician"),
  z.literal("reception"),
  z.literal("user"),
]);

const userSchema = z.object({
  id: z.string(),
  fullname: z.string(), // Cambiamos de firstName/lastName a fullname
  email: z.string(),
  whatsapp: z.string(), // Cambiamos de phoneNumber a whatsapp
  status: userStatusSchema,
  role: userRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof userSchema>;

export const userListSchema = z.array(userSchema);
