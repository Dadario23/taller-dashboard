import { create } from "zustand";
import { Repair } from "@/types/repair"; // Importar el tipo unificado

interface RepairStore {
  repairs: Repair[];
  isLoading: boolean;
  selectedRepairs: string[];
  open: "create" | "update" | "delete" | "import" | null;
  currentRow: Repair | null; // Usar Repair
  fetchRepairs: () => Promise<void>;
  deleteRepairs: (repairIds: string[]) => Promise<void>;
  toggleRepairSelection: (repairId: string) => void;
  clearSelectedRepairs: () => void;
  setOpen: (type: "create" | "update" | "delete" | "import" | null) => void;
  setCurrentRow: (row: Repair | null) => void; // Usar Repair
  addRepair: (repair: Repair) => void; // ✅ Agregamos la nueva función
}

export const useRepairStore = create<RepairStore>((set, get) => ({
  repairs: [],
  isLoading: false,
  selectedRepairs: [],
  open: null,
  currentRow: null,
  addRepair: (repair) =>
    set((state) => ({
      repairs: [repair, ...state.repairs], // ✅ Agregar nueva reparación a la lista global
    })),

  // Función para abrir/cerrar diálogos
  setOpen: (type) => set({ open: type }),

  // Función para establecer la fila actual
  setCurrentRow: (row) => set({ currentRow: row }),

  // Función para obtener las reparaciones
  fetchRepairs: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/repairs");
      const data = await response.json();
      set({ repairs: data });
    } catch (error) {
      console.error("Error fetching repairs:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Función para eliminar reparaciones
  deleteRepairs: async (repairIds: string[]) => {
    set({ isLoading: true });
    try {
      await fetch("/api/repairs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repairIds }),
      });
      // Actualizar la lista de reparaciones después de eliminar
      await get().fetchRepairs();
      // Limpiar las reparaciones seleccionadas
      set({ selectedRepairs: [] });
    } catch (error) {
      console.error("Error deleting repairs:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Función para seleccionar/deseleccionar una reparación
  toggleRepairSelection: (repairId: string) => {
    set((state) => {
      const selectedRepairs = state.selectedRepairs.includes(repairId)
        ? state.selectedRepairs.filter((id) => id !== repairId) // Deseleccionar
        : [...state.selectedRepairs, repairId]; // Seleccionar
      return { selectedRepairs };
    });
  },

  // Función para limpiar las reparaciones seleccionadas
  clearSelectedRepairs: () => {
    set({ selectedRepairs: [] });
  },
}));
