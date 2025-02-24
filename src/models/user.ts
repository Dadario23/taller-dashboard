import { model, models, Schema, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Acepta cualquier correo válido con un formato básico
        "Email is not valid",
      ],
    },
    password: {
      type: String,
      select: false,
    },
    fullname: {
      type: String,
      required: [true, "Fullname is required"],
      minLength: [3, "Fullname must be at least 3 characters"],
      maxLength: [50, "Fullname must be at most 50 characters"],
    },
    provider: {
      type: String,
      default: "credentials",
    },
    googleId: {
      type: String, // Almacena el ID proporcionado por Google
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["superadmin", "user", "admin", "technician", "reception"],
      default: "user",
    },
    country: {
      type: String,
      default: "", // Valor inicial vacío
    },
    state: {
      type: String,
      default: "", // Valor inicial vacío
    },
    locality: {
      type: String,
      default: "", // Valor inicial vacío
    },
    address: {
      type: String,
      default: "", // Dirección inicial vacía
    },
    whatsapp: {
      type: String,
      default: "", // Número de WhatsApp inicial vacío
    },
    postalcode: {
      type: String,
      default: "", // código postal inicial vacío
    },
    status: {
      type: String,
      enum: ["activo", "inactivo", "suspendido"], // Cambia los valores a español
    },

    repairs: [
      {
        type: String, // Relación indirecta con `repairCode` en la colección `repairs`
        ref: "Repair",
      },
    ],
  },
  { timestamps: true }
);

export type UserType = InferSchemaType<typeof userSchema>;

const User = models.User || model("User", userSchema);
export default User;
