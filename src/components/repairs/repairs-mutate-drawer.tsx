"use client";
import { z } from "zod";
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
import { Repair } from "@/components/repairs/data/schema";
import { Textarea } from "../ui/textarea";
import {
  deviceIssues,
  deviceBrandsAndModels,
  physicalConditions,
} from "@/components/repairs/data/constants";
import { useSession } from "next-auth/react"; // Importar useSession para obtener el usuario autenticado

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Repair;
}

const formSchema = z
  .object({
    device: z.string().min(1, "El dispositivo es requerido."),
    customerId: z.string().min(1, "Customer is required."),
    flaw: z.string().min(1, "Issue is required."),
    priority: z.enum(["Normal", "Alta", "Urgente"]),
    brand: z.string().min(1, "Brand is required."),
    model: z.string(),
    physicalCondition: z.string().min(1, "Selecciona una condición física."),
    notes: z.string().max(125, "Máximo 90 caracteres."),
  })
  .superRefine((data, ctx) => {
    if (data.brand !== "Sin especificar" && data.model.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["model"],
        message: "Model is required.",
      });
    }
  });

type RepairsForm = z.infer<typeof formSchema>;

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

  // Obtener el ID del usuario autenticado
  useEffect(() => {
    if (!session?.user?.email) return;

    fetch(`/api/users/get-by-email?email=${session.user.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.userId) {
          setUserId(data.userId); // Guardar el ID del usuario
        } else {
          console.error("No se pudo obtener el ID del usuario.");
        }
      })
      .catch((err) => console.error("Error al obtener el ID del usuario", err));
  }, [session?.user?.email]);

  // Cargar clientes
  useEffect(() => {
    fetch("http://localhost:3000/api/users")
      .then((res) => res.json())
      .then((data) => {
        const sortedCustomers = data.sort((a, b) =>
          a.fullname.localeCompare(b.fullname)
        );
        setCustomers(sortedCustomers);
      })
      .catch((err) => console.error("Error al cargar clientes", err));
  }, []);

  const isUpdate = !!currentRow;

  const form = useForm<RepairsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device: currentRow?.device || "", // Valor predeterminado
      customerId: currentRow?.customerId || "",
      flaw: currentRow?.issue || "",
      priority: currentRow?.priority || "Normal",
      brand: currentRow?.brand || "",
      model: currentRow?.model || "",
      physicalCondition: currentRow?.physicalCondition || "",
      notes: currentRow?.notes || "",
    },
  });

  const onSubmit = async (data: RepairsForm) => {
    console.log(data.notes);
    if (!userId) {
      toast({
        title: "Error",
        description: "No se ha podido obtener el usuario autenticado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const repairData = {
        title: `Reparación de ${data.device}`,
        customerId: data.customerId,
        receivedBy: userId, // Usar el ID del usuario autenticado
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

      const response = await fetch("http://localhost:3000/api/repairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(repairData),
      });

      if (!response.ok) {
        throw new Error("Error al crear la reparación");
      }

      const result = await response.json();

      toast({
        title: "Reparación creada exitosamente",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(result, null, 2)}
            </code>
          </pre>
        ),
      });

      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error al crear la reparación:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la reparación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                  <FormLabel className="col-span-2 text-right">Marca</FormLabel>
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
                      items={["Normal", "Alta", "Urgente"].map((priority) => ({
                        label: priority,
                        value: priority,
                      }))}
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
                  <FormLabel className="col-span-2 text-right">Notas</FormLabel>
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
  );
}
