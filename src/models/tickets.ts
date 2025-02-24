import { InferSchemaType, model, models, Schema } from "mongoose";

const ticketSchema = new Schema(
  {
    ticketCode: {
      type: String,
      unique: true,
      required: [true, "Ticket code is required"],
      match: [/^TICKET-\d{4,}$/, "Ticket code must match format TICKET-XXXX"],
    },
    repairCode: {
      type: String,
      required: true, // Relación con la reparación
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    details: {
      device: {
        type: {
          type: String,
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
      },
      flaw: {
        type: String,
        required: [true, "Problem description is required"],
      },
    },
  },
  { timestamps: true }
);

export type TicketType = InferSchemaType<typeof ticketSchema>;

const Ticket = models.Ticket || model("Ticket", ticketSchema);
export default Ticket;
