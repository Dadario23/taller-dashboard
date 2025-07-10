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
import { useRepairStore } from "@/stores/repairs-store";
import { Customer, Repair } from "@/types/repair"; // ✅ Asegurar que `Repair` está importado

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: RepairsForm;
}

export function RepairForm({ open, onOpenChange, currentRow }: Props) {
  const { data: session } = useSession();
  const { addRepair } = useRepairStore();
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

  // 📌 Solución: Asegurar que `defaultValues` coincida con `formSchema`
  const form = useForm<RepairsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: undefined, // ✅ Ahora puede ser `undefined`
      status: "Ingresado",
      priority: "Normal",
      device: {
        type: "",
        brand: "",
        model: "",
        physicalCondition: "",
        flaw: "",
        notes: "",
      },
      customer: "",
      receivedBy: "",
    },
  });

  // 📌 Solución: Asegurar que `form.reset()` reciba valores correctos
  useEffect(() => {
    if (open) {
      form.reset(
        currentRow || {
          title: "", // ✅ Se establece como vacío si es opcional
          status: "Ingresado",
          priority: "Normal",
          device: {
            type: "",
            brand: "",
            model: "",
            physicalCondition: "",
            flaw: "",
            notes: "",
          },
          customer: "",
          receivedBy: userId || "",
        }
      );
    }
  }, [open, currentRow, userId, form]);

  const onSubmit = async (data: RepairsForm) => {
    try {
      console.log("🚀 Intentando enviar el formulario...", data);

      if (!userId) {
        toast({
          title: "Error",
          description: "No se ha podido obtener el usuario autenticado.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);

      // ✅ Generamos `title` automáticamente a partir del `issue`
      const generatedTitle = `${data.device.type} - ${data.device.flaw}`;

      const repairData: Repair = {
        id: "",
        title: generatedTitle,
        status: data.status,
        priority: data.priority,
        customer:
          typeof data.customer === "string"
            ? data.customer
            : (data.customer?._id ?? ""), // ✅ Siempre un `string`
        receivedBy: userId,
        device: {
          type: data.device.type,
          brand: data.device.brand,
          model: data.device.model,
          physicalCondition: data.device.physicalCondition,
          flaw: data.device.flaw,
          notes: data.device.notes || "",
        },
      };

      console.log("📤 Enviando datos a la API:", repairData);
      const response = await createRepair(repairData); // ✅ Ahora no dará error
      console.log("✅ Respuesta de la API:", response);

      if (response?.repairCode) {
        toast({
          title: "Reparación creada",
          description: `Código de reparación: ${response.repairCode}`,
        });

        addRepair({
          ...repairData,
          id: Math.random().toString(),
          repairCode: response.repairCode,
        });

        setPdfUrl(response.pdfUrl);
        setShowPrintDialog(true);
        onOpenChange(false);
        form.reset();
      } else {
        throw new Error("No se recibió repairCode.");
      }
    } catch (error) {
      console.error("❌ Error al crear la reparación:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error desconocido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col h-full">
          <SheetHeader className="text-left">
            <SheetTitle>{isUpdate ? "Update Repair" : "New Repair"}</SheetTitle>
            <SheetDescription>
              {isUpdate
                ? "Update the repair with the necessary information."
                : "Add a new repair by providing the required information."}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("🟢 El formulario ha sido enviado correctamente.");
              console.log(
                "🔎 Errores actuales en el formulario:",
                form.formState.errors
              );

              form.handleSubmit((data) => {
                console.log("✅ onSubmit ha sido llamado con los datos:", data);
                onSubmit(data);
              })();
            }}
            className="flex-1 overflow-y-auto space-y-4"
          >
            {/* 📌 Solución: Asegurar que `RepairFields` reciba `form` del mismo tipo */}
            <RepairFields form={form as any} />
            <SheetFooter className="mt-4 flex flex-col sm:flex-row sm:space-x-2">
              <Button type="submit" disabled={isLoading || !userId}>
                {isLoading ? "Cargando..." : "Crear"}
              </Button>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      {/* Diálogo de impresión */}
      <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Would you like to print the ticket?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The repair ticket has been successfully generated. Do you want to
              print it or download it?
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
              Download
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
              Print
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
