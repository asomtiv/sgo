"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createUser,
  updateUserRole,
  updateUserProfile,
  adminResetPassword,
} from "@/services/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Copy, Check } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import type { UserWithProfile } from "@/types";

// --- Create User Dialog ---

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createUser, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Usuario creado exitosamente");
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button />}
      >
        <Plus data-icon="inline-start" />
        Crear Usuario
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Usuario</DialogTitle>
          <DialogDescription>
            Completa los datos para crear un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-firstName">Nombre</Label>
              <Input
                id="create-firstName"
                name="firstName"
                placeholder="Juan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-lastName">Apellido</Label>
              <Input
                id="create-lastName"
                name="lastName"
                placeholder="Pérez"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              name="email"
              type="email"
              placeholder="usuario@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-password">Contraseña</Label>
            <Input
              id="create-password"
              name="password"
              type="password"
              placeholder="••••••"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-phone">Teléfono</Label>
            <PhoneInput id="create-phone" name="phone" />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select name="role" defaultValue="Recepcion">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Profesional">Profesional</SelectItem>
                <SelectItem value="Recepcion">Recepción</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creando..." : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Edit Role Dialog ---

export function EditRoleDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(updateUserRole, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Rol actualizado exitosamente");
      onOpenChange(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Rol</DialogTitle>
          <DialogDescription>
            Cambiar el rol de {user.profile?.firstName} {user.profile?.lastName}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select name="role" defaultValue={user.role}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Profesional">Profesional</SelectItem>
                <SelectItem value="Recepcion">Recepción</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Edit Profile Dialog ---

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(updateUserProfile, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Perfil actualizado exitosamente");
      onOpenChange(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Editar datos de {user.profile?.firstName} {user.profile?.lastName}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">Nombre</Label>
              <Input
                id="edit-firstName"
                name="firstName"
                defaultValue={user.profile?.firstName ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Apellido</Label>
              <Input
                id="edit-lastName"
                name="lastName"
                defaultValue={user.profile?.lastName ?? ""}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Teléfono</Label>
            <PhoneInput
              id="edit-phone"
              name="phone"
              defaultValue={user.profile?.phone ?? ""}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Reset Password Dialog ---

function generatePassword(length = 16): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: UserWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState(
    adminResetPassword,
    null
  );

  useEffect(() => {
    if (open) {
      setPassword(generatePassword());
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (state?.success) {
      toast.success("Contraseña restablecida exitosamente");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  async function handleCopy() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Contraseña copiada al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Restablecer Contraseña</DialogTitle>
          <DialogDescription>
            Se generó una contraseña temporal para{" "}
            <span className="font-medium text-foreground">
              {user.profile?.firstName} {user.profile?.lastName}
            </span>
            . Copiala antes de restablecer.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="password" value={password} />
          <div className="space-y-2">
            <Label>Contraseña temporal</Label>
            <div className="flex gap-2">
              <Input readOnly value={password} className="font-mono text-sm" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>
          {state?.success && (
            <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm p-3 border border-green-200 dark:border-green-800">
              Contraseña restablecida. Entregá la contraseña temporal al usuario.
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Restableciendo..." : "Restablecer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
