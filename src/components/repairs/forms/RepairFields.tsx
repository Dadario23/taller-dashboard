"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SelectDropdown } from "@/components/select-dropdown";
import { Textarea } from "@/components/ui/textarea";
import {
  deviceIssues,
  deviceBrandsAndModels,
  physicalConditions,
} from "@/components/repairs/data/constants";
import { getCustomers } from "@/lib/api";
import { RepairsForm } from "@/components/repairs/data/schema";

interface RepairFieldsProps {
  form: UseFormReturn<RepairsForm>;
}

export function RepairFields({ form }: RepairFieldsProps) {
  const [customers, setCustomers] = useState<
    { _id: string; fullname: string }[]
  >([]);
  const deviceTypes = [
    "Celular",
    "CPU",
    "Notebook",
    "Tablet",
    "Consola de video juego",
  ] as const;
  type DeviceType = (typeof deviceTypes)[number];

  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);

  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  return (
    <Form {...form}>
      <div className="space-y-4">
        {/* Cliente */}
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecciona un cliente"
                  items={customers.map((user) => ({
                    label: user.fullname,
                    value: user._id,
                  }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dispositivo */}
        <FormField
          control={form.control}
          name="device"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dispositivo</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedDevice(
                      value as
                        | "Celular"
                        | "Tablet"
                        | "CPU"
                        | "Notebook"
                        | "Consola de video juego"
                    );
                    setSelectedBrand("");
                    setSelectedModel("");
                  }}
                  placeholder="Selecciona un dispositivo"
                  items={Object.keys(deviceIssues).map((device) => ({
                    label: device,
                    value: device,
                  }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Marca (depende del Dispositivo) */}
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => {
            const brandOptions =
              selectedDevice !== null
                ? (deviceBrandsAndModels[selectedDevice]?.marcas ?? [])
                : [];

            // Agregar "Sin especificar" solo si no está en la lista
            const uniqueBrands = brandOptions.includes("Sin especificar")
              ? brandOptions
              : ["Sin especificar", ...brandOptions];

            return (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "Sin especificar") {
                        setSelectedBrand(""); // No se establece una marca válida
                      } else {
                        setSelectedBrand(value);
                      }
                      setSelectedModel(""); // Siempre reseteamos el modelo al cambiar la marca
                    }}
                    placeholder="Selecciona una marca"
                    items={uniqueBrands.map((brand) => ({
                      label: brand,
                      value: brand,
                    }))}
                    disabled={!selectedDevice}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Modelo (depende de la Marca) */}
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecciona un modelo"
                  items={
                    selectedBrand && selectedBrand !== "Sin especificar"
                      ? (selectedDevice !== null
                          ? (deviceBrandsAndModels[selectedDevice]?.modelos[
                              selectedBrand
                            ] ?? [])
                          : []
                        ).map((model: string) => ({
                          label: model,
                          value: model,
                        }))
                      : []
                  }
                  disabled={
                    !selectedBrand || selectedBrand === "Sin especificar"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Condición física */}
        <FormField
          control={form.control}
          name="physicalCondition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condición Física</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecciona un estado"
                  items={physicalConditions.map((condition) => ({
                    label: condition,
                    value: condition,
                  }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Desperfecto (depende del Dispositivo) */}
        <FormField
          control={form.control}
          name="flaw"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Desperfecto</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecciona un desperfecto"
                  items={
                    selectedDevice
                      ? deviceIssues[selectedDevice].map((flaw) => ({
                          label: flaw,
                          value: flaw,
                        }))
                      : []
                  }
                  disabled={!selectedDevice}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prioridad */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridad</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecciona una prioridad"
                  items={["Normal", "Alta", "Urgente"].map((priority) => ({
                    label: priority,
                    value: priority,
                  }))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notas */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ingresa observaciones adicionales"
                  maxLength={90}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
