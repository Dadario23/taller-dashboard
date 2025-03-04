import { Document, Model, model, models, Schema } from "mongoose";

// Definir la interfaz para el dispositivo
interface IDevice {
  type:
    | "Celular"
    | "CPU"
    | "Notebook"
    | "Tablet"
    | "Consola de video juego"
    | "otro";
  brand: string;
  model: string;
  serialNumber?: string;
  physicalCondition: string;
  flaw: string;
  passwordOrPattern?: string;
  notes?: string;
}

// Definir la interfaz para la línea de tiempo
interface ITimeline {
  status: string;
  previousStatus?: string;
  timestamp: Date;
  note?: string;
  changedBy: Schema.Types.ObjectId;
  roleAtChange: "admin" | "superadmin" | "technician" | "user" | "reception";
}

// Definir la interfaz para los archivos adjuntos
interface IAttachment {
  url: string;
  description?: string;
  uploadedAt: Date;
}

// Definir la interfaz para las notificaciones al cliente
interface ICustomerNotification {
  message: string;
  sentAt: Date;
  method: "email" | "sms" | "whatsapp";
}

// Definir la interfaz para las partes usadas
interface IUsedPart {
  partName: string;
  partCost: number;
  partSupplier: string;
}

// Definir la interfaz principal para el esquema de reparación
interface IRepair extends Document {
  repairCode: string;
  title: string;
  status: string;
  priority: string;
  requiresCustomerApproval: boolean;
  customer: Schema.Types.ObjectId;
  technician?: Schema.Types.ObjectId;
  receivedBy: Schema.Types.ObjectId;
  repairVerifiedBy?: Schema.Types.ObjectId;
  estimatedCompletion?: Date;
  device: IDevice;
  warranty: boolean;
  warrantyPeriod?: number;
  warrantyExpiresAt?: Date;
  timeline: ITimeline[];
  attachments: IAttachment[];
  customerNotifications: ICustomerNotification[];
  usedParts: IUsedPart[];
  totalCost?: number;
  technicianNotes?: string;
  internalNotes?: string;
  totalProcessingTimeHours: number;
  createdAt: Date;
  updatedAt: Date;
}

// Definir el esquema de Mongoose
const repairSchema = new Schema<IRepair>(
  {
    repairCode: {
      type: String,
      unique: true,
      required: true,
      match: [/^TASK-\d{4,}$/, "El código debe tener el formato TASK-XXXX"],
      index: true,
    },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "Ingresado",
        "Pendiente / A revisar",
        "En Revisión",
        "Equipo Diagnosticado",
        "Esperando Aprobación del Cliente",
        "Esperando Repuesto",
        "Reparación en Progreso",
        "Reparación Finalizada",
        "Equipo Listo para Retiro",
        "Equipo Retirado",
        "Reparación Cancelada por el Cliente",
        "Reparación Imposible de Realizar",
        "No Existen Repuestos Disponibles",
      ],
      default: "Ingresado",
    },
    priority: {
      type: String,
      enum: ["Normal", "Alta", "Urgente"],
      default: "Normal",
    },
    requiresCustomerApproval: { type: Boolean, default: false },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Cambiado de customerId → customer
    technician: { type: Schema.Types.ObjectId, ref: "User", default: null }, // Cambiado de technicianId → technician
    receivedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    repairVerifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    estimatedCompletion: { type: Date },
    device: {
      type: {
        type: String,
        enum: [
          "Celular",
          "CPU",
          "Notebook",
          "Tablet",
          "Consola de video juego",
        ],
        required: true,
      },
      brand: { type: String, required: true },
      model: {
        type: String,
        required: function () {
          return this.device.brand !== "Sin especificar";
        },
      },
      serialNumber: { type: String, unique: true, match: /^[a-zA-Z0-9]{10,}$/ },
      physicalCondition: { type: String, required: true },
      flaw: { type: String, required: true },
      passwordOrPattern: { type: String, default: null },
      notes: { type: String, default: null },
    },
    warranty: { type: Boolean, default: false },
    warrantyPeriod: { type: Number, default: null },
    warrantyExpiresAt: { type: Date, default: null },
    timeline: [
      {
        status: { type: String, required: true },
        previousStatus: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        roleAtChange: {
          type: String,
          enum: ["admin", "superadmin", "technician", "user", "reception"],
          required: true,
        },
      },
    ],
    attachments: [
      {
        url: String,
        description: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    customerNotifications: [
      {
        message: String,
        sentAt: { type: Date, default: Date.now },
        method: { type: String, enum: ["email", "sms", "whatsapp"] },
      },
    ],
    usedParts: [{ partName: String, partCost: Number, partSupplier: String }],
    totalCost: { type: Number },
    technicianNotes: { type: String },
    internalNotes: { type: String },
    totalProcessingTimeHours: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

// Middleware: Evita que una reparación pase de "Esperando Repuestos" a "Reparación Finalizada" sin pasar por "En Progreso"
repairSchema.pre("validate", function (next) {
  const lastStatus = this.timeline[this.timeline.length - 1]?.status;

  if (
    lastStatus === "Esperando Repuesto" &&
    this.status === "Reparación Finalizada"
  ) {
    return next(
      new Error(
        "No se puede finalizar la reparación sin pasar por 'En Progreso'."
      )
    );
  }

  next();
});

// Middleware: Configura la garantía cuando la reparación finaliza
repairSchema.pre("save", function (next) {
  if (this.status === "Reparación Finalizada") {
    if (!this.warrantyPeriod) {
      this.warrantyPeriod = Math.random() < 0.5 ? 30 : 60; // Garantía de 30 o 60 días
    }
    this.warrantyExpiresAt = new Date();
    this.warrantyExpiresAt.setDate(
      this.warrantyExpiresAt.getDate() + this.warrantyPeriod
    );
    this.warranty = true;
  } else {
    this.warranty = false;
  }
  next();
});

// Middleware: Calcula el tiempo total de reparación asegurando que nunca sea 0
repairSchema.pre("save", function (next) {
  if (this.timeline.length > 1) {
    const firstTimestamp = new Date(this.timeline[0].timestamp);
    const lastTimestamp = new Date(
      this.timeline[this.timeline.length - 1].timestamp
    );
    this.totalProcessingTimeHours = Math.max(
      1,
      Math.round(
        (lastTimestamp.getTime() - firstTimestamp.getTime()) / (1000 * 60 * 60)
      )
    );
    this.updatedAt = lastTimestamp;
  }
  next();
});

const Repair: Model<IRepair> =
  models.Repair || model<IRepair>("Repair", repairSchema);
export default Repair;
