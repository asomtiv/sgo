"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createProfessional,
  updateProfessional,
} from "@/services/professional";
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
import type { UserWithProfile, ProfessionalWithDetails } from "@/types";

type Speciality = { id: string; name: string };

function specialityName(specialities: Speciality[], value: unknown) {
  return specialities.find((s) => s.id === value)?.name ?? "Seleccionar especialidad...";
}

function userName(availableUsers: UserWithProfile[], value: unknown) {
  const u = availableUsers.find((u) => u.id === value);
  if (!u) return "Seleccionar usuario...";
  return u.profile ? `${u.profile.firstName} ${u.profile.lastName}` : u.email;
}

// --- Create Professional Dialog ---

export function CreateProfessionalDialog({
  availableUsers,
  specialities,
}: {
  availableUsers: UserWithProfile[];
  specialities: Speciality[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createProfessional,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Profesional asignado exitosamente");
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus data-icon="inline-start" />
        Asignar Profesional
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Profesional</DialogTitle>
          {availableUsers.length > 0 && (
            <DialogDescription>
              Selecciona un usuario con rol Profesional y asigna su matrícula y
              especialidad.
            </DialogDescription>
          )}
        </DialogHeader>
        {availableUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No hay usuarios con rol Profesional disponibles. Primero crea un
            usuario con ese rol desde Gestión de Usuarios.
          </p>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Select name="userId">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar usuario...">
                    {(value: unknown) => userName(availableUsers, value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.profile
                        ? `${u.profile.firstName} ${u.profile.lastName}`
                        : u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-license">Matrícula</Label>
              <Input
                id="create-license"
                name="licenseNumber"
                placeholder="MP-12345"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Select name="specialityId">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar especialidad...">
                    {(value: unknown) => specialityName(specialities, value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {specialities.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Asignando..." : "Asignar"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// --- Edit Professional Dialog ---

export function EditProfessionalDialog({
  professional,
  specialities,
  open,
  onOpenChange,
}: {
  professional: ProfessionalWithDetails | null;
  specialities: Speciality[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfessional,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Profesional actualizado exitosamente");
      onOpenChange(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  if (!professional) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Profesional</DialogTitle>
          <DialogDescription>
            Modificar datos de{" "}
            {professional.user.profile?.firstName}{" "}
            {professional.user.profile?.lastName}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={professional.id} />
          <div className="space-y-2">
            <Label htmlFor="edit-license">Matrícula</Label>
            <Input
              id="edit-license"
              name="licenseNumber"
              defaultValue={professional.licenseNumber}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Especialidad</Label>
            <Select
              name="specialityId"
              defaultValue={professional.speciality.id}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: unknown) => specialityName(specialities, value)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {specialities.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
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
