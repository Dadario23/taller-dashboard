"use client";

import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const profileFormSchema = z.object({
  fullname: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." })
    .max(50, { message: "Full name must not be longer than 50 characters." }),
  email: z.string().email(),
  whatsapp: z
    .string()
    .min(10, { message: "WhatsApp number must be at least 10 digits." })
    .optional(),
  country: z.string().min(2, { message: "Country is required." }),
  state: z.string().min(2, { message: "State is required." }),
  locality: z.string().min(2, { message: "Locality is required." }),
  postalcode: z
    .string()
    .regex(/^\d{4,10}$/, { message: "Postal code must be a valid number." }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm({
  user,
}: {
  user: ProfileFormValues & { _id: string };
}) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullname: "",
      email: "",
      whatsapp: "",
      country: "",
      state: "",
      locality: "",
      postalcode: "",
      address: "",
    },
    mode: "onChange",
  });

  const { reset } = form;

  // Usar useEffect para resetear el formulario con los datos del usuario cuando estén disponibles
  useEffect(() => {
    if (user) {
      reset({
        fullname: user.fullname,
        email: user.email,
        whatsapp: user.whatsapp || "",
        country: user.country,
        state: user.state,
        locality: user.locality,
        postalcode: user.postalcode,
        address: user.address,
      });
    }
  }, [user, reset]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      // Muestra una notificación de carga
      toast({
        title: "Updating profile...",
      });

      const response = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }

      const updatedUser = await response.json();

      // Actualiza el estado del formulario con los datos actualizados
      reset({
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        whatsapp: updatedUser.whatsapp || "",
        country: updatedUser.country,
        state: updatedUser.state,
        locality: updatedUser.locality,
        postalcode: updatedUser.postalcode,
        address: updatedUser.address,
      });

      // Muestra una notificación de éxito
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Campo de nombre completo */}
        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre y Apellido</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: correo@ejemplo.com"
                  {...field}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de WhatsApp */}
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp</FormLabel>
              <FormControl>
                <Input placeholder="Your WhatsApp number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de país */}
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Your country" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de estado */}
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="Your state" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de localidad */}
        <FormField
          control={form.control}
          name="locality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Locality</FormLabel>
              <FormControl>
                <Input placeholder="Your locality" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de código postal */}
        <FormField
          control={form.control}
          name="postalcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input placeholder="Your postal code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de dirección */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Your address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Update profile</Button>

        <div className="pt-4">
          <Link href="/change-password">
            <Button variant="secondary">Change Password</Button>
          </Link>
        </div>
      </form>
    </Form>
  );
}
