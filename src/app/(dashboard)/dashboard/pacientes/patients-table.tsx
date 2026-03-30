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
import { MoreHorizontal, UserPen, Trash2, Search } from "lucide-react";
import { EditPatientDialog } from "./patient-dialogs";
import type { PatientWithProvincia } from "@/types";

type Provincia = { id: string; name: string };
type ObraSocial = { id: string; name: string };

export function PatientsTable({
  patients,
  provincias,
  obrasSociales,
}: {
  patients: PatientWithProvincia[];
  provincias: Provincia[];
  obrasSociales: ObraSocial[];
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
    setConfirmOpen(false);
    if (result.success) {
      toast.success("Paciente eliminado exitosamente");
    }
  }

  return (
    <>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
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

      <Table className="table-fixed">
        <colgroup>
          <col className="w-[8%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[12%]" />
          <col className="w-[6%]" />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>DNI</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Apellido</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>F. Nacimiento</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Provincia</TableHead>
            <TableHead>Obra Social</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No se encontraron pacientes.
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.dni}</TableCell>
                <TableCell className="font-medium">{patient.firstName}</TableCell>
                <TableCell className="font-medium">{patient.lastName}</TableCell>
                <TableCell>{patient.phone ?? "—"}</TableCell>
                <TableCell>
                  {patient.birthDate
                    ? new Date(patient.birthDate).toLocaleDateString("es-AR")
                    : "—"}
                </TableCell>
                <TableCell className="truncate">{patient.address ?? "—"}</TableCell>
                <TableCell className="truncate">{patient.provincia?.name ?? "—"}</TableCell>
                <TableCell className="truncate">{patient.obraSocial?.name ?? "—"}</TableCell>
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
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
