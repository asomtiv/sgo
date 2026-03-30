"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createPatient, updatePatient } from "@/services/patient";
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
import { PhoneInput } from "@/components/ui/phone-input";
import type { PatientWithProvincia } from "@/types";

type Provincia = { id: string; name: string };
type ObraSocial = { id: string; name: string };

function provinciaName(provincias: Provincia[], value: unknown) {
  return provincias.find((p) => p.id === value)?.name ?? "Seleccionar...";
}

function obraSocialName(obrasSociales: ObraSocial[], value: unknown) {
  return obrasSociales.find((o) => o.id === value)?.name ?? "Seleccionar...";
}

// --- Create Patient Dialog ---

export function CreatePatientDialog({
  provincias,
  obrasSociales,
}: {
  provincias: Provincia[];
  obrasSociales: ObraSocial[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createPatient, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Paciente creado exitosamente");
      setOpen(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus data-icon="inline-start" />
        Crear Paciente
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear Paciente</DialogTitle>
          <DialogDescription>
            Completa los datos del nuevo paciente.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-dni">DNI</Label>
              <Input
                id="create-dni"
                name="dni"
                placeholder="12345678"
                required
                pattern="\d{7,8}"
                title="7 u 8 dígitos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-p-firstName">Nombre</Label>
              <Input
                id="create-p-firstName"
                name="firstName"
                placeholder="Juan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-p-lastName">Apellido</Label>
              <Input
                id="create-p-lastName"
                name="lastName"
                placeholder="Pérez"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-p-email">Email</Label>
              <Input
                id="create-p-email"
                name="email"
                type="email"
                placeholder="paciente@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-p-phone">Teléfono</Label>
              <PhoneInput id="create-p-phone" name="phone" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-p-birthDate">Fecha de Nacimiento</Label>
              <Input
                id="create-p-birthDate"
                name="birthDate"
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label>Provincia</Label>
              <Select name="provinciaId">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {(value: unknown) => provinciaName(provincias, value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {provincias.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-p-address">Dirección</Label>
              <Input
                id="create-p-address"
                name="address"
                placeholder="Av. Ejemplo 123"
              />
            </div>
            <div className="space-y-2">
              <Label>Obra Social</Label>
              <Select name="obraSocialId">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {(value: unknown) => obraSocialName(obrasSociales, value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {obrasSociales.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creando..." : "Crear Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Edit Patient Dialog ---

export function EditPatientDialog({
  patient,
  provincias,
  obrasSociales,
  open,
  onOpenChange,
}: {
  patient: PatientWithProvincia | null;
  provincias: Provincia[];
  obrasSociales: ObraSocial[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(updatePatient, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Paciente actualizado exitosamente");
      onOpenChange(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  if (!patient) return null;

  const birthDateStr = patient.birthDate
    ? new Date(patient.birthDate).toISOString().split("T")[0]
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>
            Modificar datos de {patient.firstName} {patient.lastName}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={patient.id} />
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dni">DNI</Label>
              <Input
                id="edit-dni"
                name="dni"
                defaultValue={patient.dni}
                required
                pattern="\d{7,8}"
                title="7 u 8 dígitos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-p-firstName">Nombre</Label>
              <Input
                id="edit-p-firstName"
                name="firstName"
                defaultValue={patient.firstName}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-p-lastName">Apellido</Label>
              <Input
                id="edit-p-lastName"
                name="lastName"
                defaultValue={patient.lastName}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-p-email">Email</Label>
              <Input
                id="edit-p-email"
                name="email"
                type="email"
                defaultValue={patient.email ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-p-phone">Teléfono</Label>
              <PhoneInput
                id="edit-p-phone"
                name="phone"
                defaultValue={patient.phone ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-p-birthDate">Fecha de Nacimiento</Label>
              <Input
                id="edit-p-birthDate"
                name="birthDate"
                type="date"
                defaultValue={birthDateStr}
              />
            </div>
            <div className="space-y-2">
              <Label>Provincia</Label>
              <Select
                name="provinciaId"
                defaultValue={patient.provinciaId ?? undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {(value: unknown) => provinciaName(provincias, value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {provincias.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-p-address">Dirección</Label>
              <Input
                id="edit-p-address"
                name="address"
                defaultValue={patient.address ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Obra Social</Label>
              <Select
                name="obraSocialId"
                defaultValue={patient.obraSocialId ?? undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {(value: unknown) => obraSocialName(obrasSociales, value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {obrasSociales.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
