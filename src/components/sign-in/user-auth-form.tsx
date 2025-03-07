"use client";

import { useState, HTMLAttributes } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Por favor ingresa tu correo electrónico." })
    .email({ message: "Correo electrónico no válido." }),
  password: z
    .string()
    .min(1, { message: "Por favor ingresa tu contraseña." })
    .min(7, { message: "La contraseña debe tener al menos 7 caracteres." }),
});

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast({
          title: "Error al iniciar sesión",
          description: res.error,
          variant: "destructive",
        });
      } else if (res?.ok) {
        router.push("/dashboard"); // Redirige al dashboard después del login
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description:
          "Hubo un error durante el inicio de sesión. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
      console.log(
        "Hubo un error durante el inicio de sesión. Inténtalo de nuevo más tarde",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: "/dashboard", prompt: "none" });
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: `No se pudo iniciar sesión con ${provider}.`,
        variant: "destructive",
      });
      console.log("Error al iniciar sesión", error);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            {/* Campo de Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Contraseña */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <div className="flex items-center justify-between">
                    <FormLabel>Contraseña</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-muted-foreground hover:opacity-75"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botón de Login */}
            <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>

            {/* Enlace para crear una cuenta */}
            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Crear cuenta
              </Link>
            </div>

            {/* Separador */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continuar con
                </span>
              </div>
            </div>

            {/* Botones de Proveedores */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => handleProviderSignIn("google")}
                disabled={isLoading}
              >
                Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => handleProviderSignIn("github")}
                disabled={isLoading}
              >
                GitHub
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
