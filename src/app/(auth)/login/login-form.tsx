"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { login } from "@/services/auth";
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

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Image src="/icon.svg" alt="SGO" width={64} height={64} priority />
        </div>
        <CardTitle className="text-2xl font-bold">SGO</CardTitle>
        <CardDescription>
          Sistema de Gestión Odontológica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">
              {state.error}
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
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
