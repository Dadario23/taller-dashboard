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
import { Repair } from "@/types/repair"; // Cambiar a Repair

interface RepairFieldsProps {
  form: UseFormReturn<Repair>; // Cambiar a Repair
}

export function RepairFields({ form }: RepairFieldsProps) {
  const [customers, setCustomers] = useState<
    { _id: string; fullname: string }[]
  >([]);
  type DeviceType =
    | "Celular"
    | "CPU"
    | "Notebook"
    | "Tablet"
    | "Consola de video juego";

  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  useEffect(() => {
    getCustomers().then(setCustomers);
  }, []);

  return (
    <Form {...form}>
      <div className="space-y-4">
        {/* Cliente */}
        <FormField
          control={form.control}
          name="customer" // Este campo no cambia
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select a client"
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
          name="device.type" // Cambiar a device.type
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedDevice(value as DeviceType);
                    setSelectedBrand("");
                  }}
                  placeholder="Select a device"
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
          name="device.brand" // Cambiar a device.brand
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
                <FormLabel>Brand</FormLabel>
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
                    }}
                    placeholder="Select a brand"
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
          name="device.model" // Cambiar a device.model
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select a model"
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
          name="device.physicalCondition" // Cambiar a device.physicalCondition
          render={({ field }) => (
            <FormItem>
              <FormLabel>Physical Condition</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select a status physical"
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
          name="device.flaw" // Cambiar a device.flaw
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select a issue"
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
          name="priority" // Este campo no cambia
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <SelectDropdown
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select a priority"
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
          name="device.notes" // Cambiar a device.notes
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter additional observations"
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
