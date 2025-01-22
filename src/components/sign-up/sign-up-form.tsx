"use client";

import { useState, HTMLAttributes } from "react";
import axios, { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
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
import { PasswordInput } from "@/components/password-input";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

// Define esquema para validar datos del formulario
const formSchema = z
  .object({
    fullname: z
      .string()
      .min(3, {
        message: "El nombre completo debe tener al menos 3 caracteres.",
      })
      .max(50, {
        message: "El nombre completo debe tener menos de 50 caracteres.",
      }),
    email: z
      .string()
      .min(1, { message: "Por favor ingrese su correo electrónico." })
      .email({ message: "El correo electrónico no es válido." }),
    password: z
      .string()
      .min(7, { message: "La contraseña debe tener al menos 7 caracteres." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type SignUpFormProps = HTMLAttributes<HTMLDivElement>;

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Configuración de React Hook Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRegisterError(null);

    try {
      // Registro del usuario en el servidor
      const signupResponse = await axios.post("/api/auth/signup", {
        email: data.email,
        fullname: data.fullname,
        password: data.password,
      });

      // Intento de iniciar sesión automáticamente después del registro
      const res = await signIn("credentials", {
        email: signupResponse.data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.ok) {
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "Iniciando sesión...",
          action: <ToastAction altText="Cerrar">Cerrar</ToastAction>,
        });
        return router.push("/dashboard"); // Redirige al dashboard después del login
      } else {
        setRegisterError("Error al iniciar sesión después del registro.");
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
          setRegisterError("Ya existe un usuario registrado con este correo.");
        } else {
          setRegisterError(
            error.response.data.message || "Error al registrar el usuario."
          );
        }
      } else {
        setRegisterError("Error de conexión al servidor.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            {registerError && (
              <p className="text-red-500 text-center">{registerError}</p>
            )}

            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="mt-2" disabled={isLoading}>
              Crear cuenta
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
