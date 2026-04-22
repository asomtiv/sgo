"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { deletePatient } from "@/services/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPen, Trash2, Search, ClipboardList } from "lucide-react";
import Link from "next/link";
import { EditPatientDialog } from "./patient-dialogs";
import type { PatientWithProvincia } from "@/types";

type Provincia = { id: string; name: string };
type ObraSocial = { id: string; name: string };
type Nacionalidad = { id: string; name: string };

const ESTADO_CIVIL_LABELS: Record<string, string> = {
  Soltero: "Soltero/a",
  Casado: "Casado/a",
  Viudo: "Viudo/a",
  Divorciado: "Divorciado/a",
  Convivencia: "Convivencia",
  SeparadoLegalmente: "Separado/a Leg.",
};

function calcularEdad(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export function PatientsTable({
  patients,
  provincias,
  obrasSociales,
  nacionalidades,
}: {
  patients: PatientWithProvincia[];
  provincias: Provincia[];
  obrasSociales: ObraSocial[];
  nacionalidades: Nacionalidad[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );
  const [selectedPatient, setSelectedPatient] =
    useState<PatientWithProvincia | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPatient, setConfirmPatient] =
    useState<PatientWithProvincia | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [fichaSearchOpen, setFichaSearchOpen] = useState(false);
  const [fichaSearchValue, setFichaSearchValue] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    router.push(`/dashboard/pacientes?${params.toString()}`);
  }

  function openConfirmDelete(patient: PatientWithProvincia) {
    setConfirmPatient(patient);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!confirmPatient) return;
    setDeleting(true);
    const result = await deletePatient(confirmPatient.id);
    setDeleting(false);
    if (result?.error) {
      toast.error(result.error);
      setConfirmOpen(false);
      return;
    }
    setConfirmOpen(false);
    if (result.success) {
      toast.success("Paciente eliminado exitosamente");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por DNI o nombre..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </form>
        <Button variant="outline" size="icon" onClick={() => { setFichaSearchValue(""); setFichaSearchOpen(true); }}>
          <ClipboardList className="size-4" />
        </Button>
      </div>

      <div className="rounded-md border bg-card">
      <Table className="table-fixed">
        <colgroup>
          <col className="w-[7%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[4%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[9%]" />
          <col className="w-[5%]" />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>DNI</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado Civil</TableHead>
            <TableHead>Nacionalidad</TableHead>
            <TableHead>Provincia</TableHead>
            <TableHead>Obra Social</TableHead>
            <TableHead>Nro. Afiliado</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                No se encontraron pacientes.
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.dni}</TableCell>
                <TableCell className="font-medium">{patient.firstName}</TableCell>
                <TableCell className="font-medium">{patient.lastName}</TableCell>
                <TableCell>
                  {patient.birthDate ? calcularEdad(new Date(patient.birthDate)) : "—"}
                </TableCell>
                <TableCell>{patient.phone ?? "—"}</TableCell>
                <TableCell className="truncate">
                  {patient.estadoCivil ? ESTADO_CIVIL_LABELS[patient.estadoCivil] ?? "—" : "—"}
                </TableCell>
                <TableCell className="truncate">{patient.nacionalidad?.name ?? "—"}</TableCell>
                <TableCell className="truncate">{patient.provincia?.name ?? "—"}</TableCell>
                <TableCell className="truncate">{patient.obraSocial?.name ?? "—"}</TableCell>
                <TableCell className="truncate">{patient.nroAfiliado ?? "—"}</TableCell>
                <TableCell className="truncate">{patient.address ?? "—"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        closeOnClick
                        render={<Link href={`/dashboard/pacientes/${patient.id}`} />}
                      >
                        <ClipboardList className="size-4 mr-2" />
                        Ver Ficha
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        closeOnClick
                        onClick={() => {
                          setSelectedPatient(patient);
                          setEditOpen(true);
                        }}
                      >
                        <UserPen className="size-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        closeOnClick
                        className="text-destructive focus:text-destructive"
                        onClick={() => openConfirmDelete(patient)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      {/* Confirm delete dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar paciente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar a{" "}
              <span className="font-medium text-foreground">
                {confirmPatient?.firstName} {confirmPatient?.lastName}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditPatientDialog
        key={`edit-patient-${selectedPatient?.id}`}
        patient={selectedPatient}
        provincias={provincias}
        obrasSociales={obrasSociales}
        nacionalidades={nacionalidades}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Buscar ficha médica */}
      <Dialog open={fichaSearchOpen} onOpenChange={setFichaSearchOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Buscar Ficha Médica</DialogTitle>
            <DialogDescription>
              Buscá al paciente por DNI o nombre para acceder a su ficha.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="DNI o nombre..."
              value={fichaSearchValue}
              onChange={(e) => setFichaSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {(() => {
              const q = fichaSearchValue.trim().toLowerCase();
              if (!q) return null;
              const filtered = patients.filter(
                (p) =>
                  p.dni.includes(q) ||
                  p.firstName.toLowerCase().includes(q) ||
                  p.lastName.toLowerCase().includes(q)
              );
              if (filtered.length === 0)
                return (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No se encontraron pacientes.
                  </p>
                );
              return filtered.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/pacientes/${p.id}`}
                  onClick={() => setFichaSearchOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <ClipboardList className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {p.lastName}, {p.firstName}
                    </p>
                    <p className="text-xs text-muted-foreground">DNI {p.dni}</p>
                  </div>
                </Link>
              ));
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
