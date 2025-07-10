"use client";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RepairsImportDialog } from "./repairs-import-dialog";
import { RepairsMutateDrawer } from "./repairs-mutate-drawer";
import { useRepairStore } from "@/stores/repairs-store"; // Importar el store de Zustand

export function RepairsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRepairStore();

  return (
    <>
      {/* Modal para crear una nueva reparación */}
      <RepairsMutateDrawer key="repair-create" />

      {/* Modal para importar reparaciones */}
      <RepairsImportDialog
        key="repairs-import"
        open={open === "import"}
        onOpenChange={() => setOpen("import")}
      />

      {/* Modales condicionales para editar o eliminar reparaciones */}
      {currentRow && (
        <>
          {/* Modal para actualizar una reparación */}
          <RepairsMutateDrawer
            key={`repair-update-${currentRow.id}`} // Usar currentRow.id
            currentRow={currentRow} // Pasar currentRow
          />

          {/* Diálogo de confirmación para eliminar una reparación */}
          <ConfirmDialog
            key="repair-delete"
            destructive
            open={open === "delete"}
            onOpenChange={() => {
              setOpen("delete");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            handleConfirm={() => {
              setOpen(null);
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
              toast({
                title: "The following repair has been deleted:",
                description: (
                  <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">
                      {JSON.stringify(currentRow, null, 2)}
                    </code>
                  </pre>
                ),
              });
            }}
            className="max-w-md"
            title={`Delete this repair: ${currentRow.id} ?`} // Usar currentRow.id
            desc={
              <>
                You are about to delete a repair with the ID{" "}
                <strong>{currentRow.id}</strong>. <br />{" "}
                {/* Usar currentRow.id */}
                This action cannot be undone.
              </>
            }
            confirmText="Delete"
          />
        </>
      )}
    </>
  );
}
