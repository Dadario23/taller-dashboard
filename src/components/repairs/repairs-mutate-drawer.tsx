"use client";

import { RepairForm } from "./forms/RepairForm";

interface RepairRow {
  device: string;
  customer: string;
  flaw: string;
  priority: "Normal" | "Alta" | "Urgente";
  brand: string;
  model: string;
  physicalCondition: string;
  notes: string;
  id?: number; // Opcional
  status?: string; // Opcional
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: RepairRow;
}

export function RepairsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  return (
    <RepairForm
      open={open}
      onOpenChange={onOpenChange}
      currentRow={currentRow}
    />
  );
}
