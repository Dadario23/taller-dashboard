"use client";

import { RepairForm } from "./forms/RepairForm";
import { useRepairStore } from "@/stores/repairs-store"; // Importar el store
import { Repair } from "@/types/repair"; // Importar el tipo unificado

interface Props {
  currentRow?: Repair; // Usar Repair
}

export function RepairsMutateDrawer({ currentRow }: Props) {
  const { open, setOpen } = useRepairStore(); // Obtener open y setOpen del store

  return (
    <RepairForm
      open={open === "create" || open === "update"} // Abre el Sheet si open es "create" o "update"
      onOpenChange={(isOpen) => {
        if (!isOpen) setOpen(null); // Cierra el Sheet
      }}
      currentRow={currentRow}
    />
  );
}
