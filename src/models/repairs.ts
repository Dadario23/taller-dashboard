import { model, models, Schema, InferSchemaType } from "mongoose";

const repairSchema = new Schema(
  {
    repairCode: {
      type: String,
      unique: true,
      required: [true, "Repair code is required"],
      match: [/^TASK-\d{4,}$/, "Repair code must match format TASK-XXXX"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "In Progress",
        "Ready for Pickup",
        "Delivered",
        "Cancelled",
        "Not Repairable",
        "Waiting for Customer Approval",
      ],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Relación con la colección de usuarios
      required: true,
    },
    device: {
      type: {
        type: String, // Tipo de dispositivo (ej. Celular, Computadora)
        required: [true, "Device type is required"],
      },
      brand: {
        type: String,
        required: [true, "Device brand is required"],
      },
      model: {
        type: String,
        required: [true, "Device model is required"],
      },
      serialNumber: {
        type: String,
      },
      physicalCondition: {
        type: String, // Observaciones del estado físico
      },
      problemDescription: {
        type: String, // Problema reportado
        required: [true, "Problem description is required"],
      },
      passwordOrPattern: {
        type: String, // Contraseña o patrón del dispositivo
        required: false,
        default: null, // Inicialmente puede estar vacío
      },
    },
    timeline: [
      {
        status: {
          type: String, // Estado actualizado
          required: true,
          enum: [
            "Pending",
            "Under Review",
            "In Progress",
            "Ready for Pickup",
            "Delivered",
            "Cancelled",
            "Not Repairable",
            "Waiting for Customer Approval",
          ],
        },
        timestamp: {
          type: Date,
          default: Date.now, // Fecha del cambio
        },
        note: {
          type: String, // Notas adicionales sobre el cambio
        },
        changedBy: {
          type: Schema.Types.ObjectId, // ID del usuario (técnico) que cambió el estado
          ref: "User",
        },
      },
    ],
    label: {
      type: String,
      default: "documentation", // Se puede ajustar para categorizar las tareas
    },
  },
  { timestamps: true }
);

export type RepairType = InferSchemaType<typeof repairSchema>;

const Repair = models.Repair || model("Repair", repairSchema);
export default Repair;
