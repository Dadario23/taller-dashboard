"use client";

import { RepairForm } from "./forms/RepairForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: any;
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
