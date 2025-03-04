"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { RepairsForm, formSchema } from "@/components/repairs/data/schema";
import { createRepair, getUserIdByEmail } from "@/lib/api";
import { RepairFields } from "./RepairFields";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: RepairsForm;
}

export function RepairForm({ open, onOpenChange, currentRow }: Props) {
  const { data: session } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const isUpdate = !!currentRow;

  useEffect(() => {
    if (session?.user?.email) {
      getUserIdByEmail(session.user.email).then(setUserId);
    }
  }, [session?.user?.email]);

  const form = useForm<RepairsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device: currentRow?.device || "",
      customer: currentRow?.customer || "",
      flaw: currentRow?.flaw || "",
      priority: currentRow?.priority || "Normal",
      brand: currentRow?.brand || "",
      model: currentRow?.model || "",
      physicalCondition: currentRow?.physicalCondition || "",
      notes: currentRow?.notes || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        device: currentRow?.device || "",
        customer: currentRow?.customer || "",
        flaw: currentRow?.flaw || "",
        priority: currentRow?.priority || "Normal",
        brand: currentRow?.brand || "",
        model: currentRow?.model || "",
        physicalCondition: currentRow?.physicalCondition || "",
        notes: currentRow?.notes || "",
      });
    }
  }, [open, currentRow, form]);

  const onSubmit = async (data: RepairsForm) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "No se ha podido obtener el usuario autenticado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const repairData = {
      title: `Reparación de ${data.device}`,
      customer: data.customer,
      receivedBy: userId,
      device: {
        type: data.device,
        brand: data.brand,
        model: data.model,
        physicalCondition: data.physicalCondition,
        flaw: data.flaw,
        notes: data.notes,
      },
      priority: data.priority,
    };

    const pdfUrl = await createRepair(repairData);
    if (pdfUrl) {
      setPdfUrl(pdfUrl);
      setShowPrintDialog(true); // Mostrar el diálogo de impresión
      toast({
        title: "Reparación creada",
        description: "El ticket se generó correctamente.",
      });
      onOpenChange(false);
      form.reset();
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear la reparación.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col h-full">
          <SheetHeader className="text-left">
            <SheetTitle>
              {isUpdate ? "Actualizar Reparación" : "Nueva Reparación"}
            </SheetTitle>
            <SheetDescription>
              {isUpdate
                ? "Actualiza la reparación con la información necesaria."
                : "Añade una nueva reparación proporcionando la información requerida."}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto space-y-4"
          >
            <RepairFields form={form} />
          </form>

          <SheetFooter className="mt-4 flex flex-col sm:flex-row sm:space-x-2">
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? "Cargando..." : "Crear"}
            </Button>

            <SheetClose asChild>
              <Button variant="outline">Cancelar</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Diálogo de impresión */}
      <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Deseas imprimir el ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              El ticket de la reparación se ha generado correctamente. ¿Quieres
              imprimirlo o descargarlo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pdfUrl) {
                  const link = document.createElement("a");
                  link.href = pdfUrl;
                  link.download = `ticket-${Date.now()}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
                setShowPrintDialog(false);
              }}
            >
              Descargar
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => {
                if (pdfUrl) {
                  const iframe = document.createElement("iframe");
                  iframe.style.display = "none";
                  iframe.src = pdfUrl;
                  document.body.appendChild(iframe);
                  iframe.onload = () => {
                    iframe.contentWindow?.print();
                  };
                }
                setShowPrintDialog(false);
              }}
            >
              Imprimir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
