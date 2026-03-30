"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { forgotPassword } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPassword, null);

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Image src="/icon.svg" alt="SGO" width={64} height={64} priority />
        </div>
        <CardTitle className="text-2xl font-bold">
          Recuperar Contraseña
        </CardTitle>
        <CardDescription>
          Ingresá tu email y te enviaremos un enlace para restablecer tu
          contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">
              {state.error}
            </div>
          )}
          {state?.success && (
            <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm p-3 border border-green-200 dark:border-green-800">
              Si el email existe en el sistema, recibirás un enlace de
              recuperación. Revisá tu bandeja de entrada.
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Volver a iniciar sesión
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
