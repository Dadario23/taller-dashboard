"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SelectDropdown } from "@/components/select-dropdown";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import {
  deviceIssues,
  deviceBrandsAndModels,
  physicalConditions,
} from "@/components/repairs/data/constants";
import { useSession } from "next-auth/react";
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
import { formSchema, RepairsForm } from "@/components/repairs/data/schema";
import {
  getUserIdByEmail,
  getCustomers,
  createRepair,
  getTicketPdf,
} from "@/lib/api";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: RepairsForm;
}

export function RepairsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { data: session } = useSession(); // Obtener la sesión del usuario
  const [customers, setCustomers] = useState<
    { _id: string; fullname: string; email: string }[]
  >([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Estado para almacenar el ID del usuario autenticado
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null); // Estado para almacenar la URL del PDF
  const [repairCode, setRepairCode] = useState<string | null>(null); // Estado para almacenar el código de reparación

  // Obtener el ID del usuario autenticado
  useEffect(() => {
    if (!session?.user?.email) return;
    getUserIdByEmail(session.user.email).then(setUserId);
  }, [session?.user?.email]);

  // Cargar clientes
  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  const isUpdate = !!currentRow;

  const form = useForm<RepairsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device: currentRow?.device || "", // Valor predeterminado
      customerId: currentRow?.customerId || "",
      flaw: currentRow?.flaw || "",
      priority: currentRow?.priority || "Normal",
      brand: currentRow?.brand || "",
      model: currentRow?.model || "",
      physicalCondition: currentRow?.physicalCondition || "",
      notes: currentRow?.notes || "",
    },
  });

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
      customerId: data.customerId,
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
      setShowPrintDialog(true);
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

  const handlePrintTicket = async () => {
    if (!repairCode) return;
    const pdfUrl = await getTicketPdf(repairCode);
    if (pdfUrl) window.open(pdfUrl, "_blank");
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v);
          form.reset();
        }}
      >
        <SheetContent className="flex flex-col h-full">
          <SheetHeader className="text-left">
            <SheetTitle>
              {isUpdate ? "Update Repair" : "Crea una reparación"}
            </SheetTitle>
            <SheetDescription>
              {isUpdate
                ? "Update the repair by providing the necessary information."
                : "Add a new repair by providing the necessary information."}
              Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            {/* Contenedor del formulario con desplazamiento */}
            <div className="space-y-4 overflow-y-auto flex-1">
              {/* Select de Cliente */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                    <FormLabel className="col-span-2 text-right">
                      Cliente
                    </FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecciona un cliente"
                        className="col-span-4"
                        items={customers.map((user) => ({
                          label: `${user.fullname}`,
                          value: user._id,
                        }))}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              {/* Select de Dispositivo */}
              <FormField
                control={form.control}
                name="device"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                    <FormLabel className="col-span-2 text-right">
                      Dispositivo
                    </FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value} // Asegúrate de pasar defaultValue
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedDevice(value);
                          setSelectedBrand(""); // Resetear la marca cuando cambia el dispositivo
                          setSelectedModel(""); // Resetear el modelo cuando cambia el dispositivo
                        }}
                        placeholder="Selecciona un dispositivo"
                        className="col-span-4"
                        items={Object.keys(deviceIssues).map((device) => ({
                          label: device,
                          value: device,
                        }))}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />{" "}
                    {/* Muestra el mensaje de error */}
                  </FormItem>
                )}
              />

              {/* Select de Condiciones Físicas */}
              <FormField
                control={form.control}
                name="physicalCondition"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                    <FormLabel className="col-span-2 text-right">
                      Estado
                    </FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecciona un estado"
                        className="col-span-4"
                        items={physicalConditions.map((condition) => ({
                          label: condition,
                          value: condition,
                        }))}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              {/* Select de Marca (depende de Dispositivo) */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                    <FormLabel className="col-span-2 text-right">
                      Marca
                    </FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedBrand(value);
                          setSelectedModel(""); // Resetear el modelo cuando cambia la marca
                        }}
                        placeholder="Selecciona una marca"
                        className="col-span-4"
                        items={
                          selectedDevice
                            ? deviceBrandsAndModels[selectedDevice].marcas.map(
                                (brand) => ({
                                  label: brand,
                                  value: brand,
                                })
                              )
                            : []
                        }
                        disabled={!selectedDevice} // Deshabilitar si no hay dispositivo seleccionado
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              {/* Select de Modelo (depende de Marca) */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                    <FormLabel className="col-span-2 text-right">
                      Modelo
                    </FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecciona un modelo"
                        className="col-span-4"
                        items={
                          selectedBrand && selectedBrand !== "Sin especificar"
                            ? deviceBrandsAndModels[selectedDevice].modelos[
                                selectedBrand
                              ].map((model) => ({
                                label: model,
                                value: model,
                              }))
                            : []
                        }
                        disabled={
                          !selectedBrand || selectedBrand === "Sin especificar"
                        } // Deshabilitar si no hay marca seleccionada o si es "Sin especificar"
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              {/* Select de Desperfecto */}
              <FormField
                control={form.control}
                name="flaw"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                    <FormLabel className="col-span-2 text-right">
                      Desperfecto
                    </FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecciona un desperfecto"
                        className="col-span-4"
                        items={
                          selectedDevice
                            ? deviceIssues[selectedDevice].map((flaw) => ({
                                label: flaw,
                                value: flaw,
                              }))
                            : []
                        }
                        disabled={!selectedDevice} // Deshabilitar si no hay dispositivo seleccionado
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              {/* Select de Prioridad */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                    <FormLabel className="col-span-2 text-right">
                      Prioridad
                    </FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecciona una prioridad"
                        className="col-span-4"
                        items={["Normal", "Alta", "Urgente"].map(
                          (priority) => ({
                            label: priority,
                            value: priority,
                          })
                        )}
                      />
                    </FormControl>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />

              {/* TextArea de Observaciones */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
                    <FormLabel className="col-span-2 text-right">
                      Notas
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Ingresa observaciones adicionales"
                        className="col-span-4"
                        maxLength={90} // Límite de 90 caracteres
                        rows={3} // Número de filas visibles
                      />
                    </FormControl>
                    <FormDescription className="col-span-4 col-start-3 text-sm text-gray-500">
                      Máximo 90 caracteres.
                    </FormDescription>
                    <FormMessage className="col-span-4 col-start-3" />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="mt-4 flex flex-col sm:flex-row sm:space-x-2">
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                className="mb-2 sm:mb-0"
              >
                Guardar
              </Button>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
            </SheetFooter>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Deseas imprimir el ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              El ticket de la reparación se ha generado correctamente. ¿Quieres
              imprimirlo ahora?
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
