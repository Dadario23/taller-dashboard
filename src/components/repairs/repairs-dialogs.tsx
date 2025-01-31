"use client";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useRepairs } from "@/context/repairs-context";
import { RepairsImportDialog } from "./repairs-import-dialog";
import { RepairsMutateDrawer } from "./repairs-mutate-drawer";

export function RepairsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRepairs();

  return (
    <>
      {/* Modal para crear una nueva reparación */}
      <RepairsMutateDrawer
        key="repair-create"
        open={open === "create"}
        onOpenChange={() => setOpen("create")}
      />

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
            key={`repair-update-${currentRow.id}`}
            open={open === "update"}
            onOpenChange={() => {
              setOpen("update");
              setTimeout(() => {
                setCurrentRow(null);
              }, 500);
            }}
            currentRow={currentRow}
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
            title={`Delete this repair: ${currentRow.id} ?`}
            desc={
              <>
                You are about to delete a repair with the ID{" "}
                <strong>{currentRow.id}</strong>. <br />
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
