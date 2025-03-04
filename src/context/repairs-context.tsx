"use client";
import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { Repair } from "@/components/repairs/data/schema";

type RepairsDialogType = "create" | "update" | "delete" | "import";

interface RepairsContextType {
  open: RepairsDialogType | null;
  setOpen: (str: RepairsDialogType | null) => void;
  currentRow: Repair | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Repair | null>>;
}

const RepairsContext = React.createContext<RepairsContextType | null>(null);

interface Props {
  children: React.ReactNode;
}

export default function RepairsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<RepairsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Repair | null>(null);

  return (
    <RepairsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </RepairsContext.Provider>
  );
}

export const useRepairs = () => {
  const repairsContext = React.useContext(RepairsContext);

  if (!repairsContext) {
    throw new Error("useRepairs has to be used within <RepairsProvider>");
  }

  return repairsContext;
};
