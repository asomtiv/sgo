"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { updatePassword } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updatePassword, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Contraseña actualizada exitosamente");
      setTimeout(() => router.push("/login"), 1500);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Image src="/icon.svg" alt="SGO" width={64} height={64} priority />
        </div>
        <CardTitle className="text-2xl font-bold">Nueva Contraseña</CardTitle>
        <CardDescription>Ingresá tu nueva contraseña.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
