"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { repairSchema, RepairForm } from "../schemas/repairSchema";
import {
  deviceIssues,
  deviceBrandsAndModels,
  physicalConditions,
} from "../data/constants";
import { Combobox, SelectDropdown, Textarea } from "@/components/ui"; // Ajusta las importaciones según tu estructura

export function RepairForm({ onSubmit, initialValues }) {
  const form = useForm<RepairForm>({
    resolver: zodResolver(repairSchema),
    defaultValues: initialValues,
  });

  return (
    <Form {...form}>
      {/* Contenedor del formulario con desplazamiento */}
      <div className="space-y-4 overflow-y-auto flex-1">
        {/* Select de Cliente */}

        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
              <FormLabel className="col-span-2 text-right">Cliente</FormLabel>
              <FormControl>
                <Combobox
                  options={customers.map((user) => ({
                    label: `${user.fullname} - ${user.email}`,
                    value: user._id,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecciona un cliente"
                  className="col-span-4"
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
              <FormMessage className="col-span-4 col-start-3" />
            </FormItem>
          )}
        />
        {/* Select de Condiciones Físicas */}
        <FormField
          control={form.control}
          name="physicalCondition"
          render={({ field }) => (
            <FormItem className="grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0">
              <FormLabel className="col-span-2 text-right">Estado</FormLabel>
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
              <FormLabel className="col-span-2 text-right">Modelo</FormLabel>
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
          name="issue"
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
                      ? deviceIssues[selectedDevice].map((issue) => ({
                          label: issue,
                          value: issue,
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
              <FormLabel className="col-span-2 text-right">Prioridad</FormLabel>
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
          name="observations"
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
  );
}
