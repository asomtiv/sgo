"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createUser, updateUserRole, updateUserProfile } from "@/services/user";
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
import { Plus } from "lucide-react";
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
            <Input
              id="edit-phone"
              name="phone"
              defaultValue={user.profile?.phone ?? ""}
              placeholder="Opcional"
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
