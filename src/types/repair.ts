// types/repair.ts

export interface Customer {
  _id: string;
  fullname: string;
  email: string;
}

export interface Repair {
  id?: string; // Opcional para nuevas reparaciones
  repairCode?: string; // Opcional para nuevas reparaciones
  title: string;
  status: string;
  priority: "Normal" | "Alta" | "Urgente";
  device: {
    type: string;
    brand: string;
    model: string;
    serialNumber?: string;
    physicalCondition: string;
    flaw: string;
    passwordOrPattern?: string;
    notes: string; // Opcional
  };
  customer: string | Customer; // ✅ Puede ser un ID o un objeto poblado
  receivedBy: string;
  repairVerifiedBy?: string;
  estimatedCompletion?: Date;
  warranty?: boolean;
  warrantyPeriod?: number;
  warrantyExpiresAt?: Date;
  timeline?: Array<{
    status: string;
    previousStatus?: string;
    timestamp: Date;
    note?: string;
    changedBy: string;
    roleAtChange: "admin" | "superadmin" | "technician" | "user" | "reception";
  }>;
  attachments?: Array<{
    url: string;
    description?: string;
    uploadedAt: Date;
  }>;
  customerNotifications?: Array<{
    message: string;
    sentAt: Date;
    method: "email" | "sms" | "whatsapp";
  }>;
  usedParts?: Array<{
    partName: string;
    partCost: number;
    partSupplier: string;
  }>;
  totalCost?: number;
  technicianNotes?: string;
  internalNotes?: string;
  totalProcessingTimeHours?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
