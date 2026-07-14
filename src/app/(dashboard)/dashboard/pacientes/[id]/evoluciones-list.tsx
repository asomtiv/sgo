"use client";

import { Fragment, useActionState, useEffect, useState } from "react";
import { Pencil, ClipboardList, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteEvolucion } from "@/services/evolucion";
import { Button } from "@/components/ui/button";
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
import { formatDisplayName } from "@/lib/format";
import type { EvolucionWithDetails } from "@/types";

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function EvolucionesList({
  patientId,
  evoluciones,
  canEdit,
  canDelete,
  onEdit,
  onNew,
}: {
  patientId: string;
  evoluciones: EvolucionWithDetails[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (evolucion: EvolucionWithDetails) => void;
  onNew: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmEv, setConfirmEv] = useState<EvolucionWithDetails | null>(null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteEvolucion, null);

  useEffect(() => {
    if (deleteState?.success) {
      toast.success("Evolución eliminada");
      setConfirmOpen(false);
      setConfirmEv(null);
    } else if (deleteState?.error) {
      toast.error(deleteState.error);
    }
  }, [deleteState]);

  useEffect(() => {
    if (!confirmOpen) setConfirmEv(null);
  }, [confirmOpen]);

  if (evoluciones.length === 0) {
    return (
      <div className="border border-border flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
        <ClipboardList className="size-10 opacity-30" />
        <p className="font-medium text-sm">Sin evoluciones registradas</p>
        {canEdit && (
          <Button size="sm" onClick={onNew}>
            Registrar primera evolución
          </Button>
        )}
      </div>
    );
  }

  const showActions = canEdit || canDelete;

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">Fecha y hora</TableHead>
              <TableHead className="w-[20%]">Profesional</TableHead>
              <TableHead className="w-[10%]">Diente</TableHead>
              <TableHead className="w-[25%]">Prestación</TableHead>
              <TableHead>Observaciones</TableHead>
              {showActions && <TableHead className="w-16" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {evoluciones.map((ev, evIdx) => {
              const profName = formatDisplayName(ev.professional.user.profile, "Profesional", ev.professional.user.role);
              const firstItem = ev.items[0];
              const extraItems = ev.items.slice(1);

              return (
                <Fragment key={ev.id}>
                  <TableRow className={`hover:bg-transparent ${evIdx > 0 ? "border-t-2 border-t-zinc-400 dark:border-t-zinc-500" : ""}`}>
                    <TableCell rowSpan={ev.items.length || 1} className="align-top font-medium text-sm">
                      {formatDateTime(ev.appointment.startDateTime)}
                    </TableCell>
                    <TableCell rowSpan={ev.items.length || 1} className="align-top text-sm">
                      <span>{profName}</span>
                      <span className="block text-xs text-muted-foreground">{ev.professional.speciality.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {firstItem?.diente ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{firstItem?.prestacion ?? "—"}</TableCell>
                    <TableCell rowSpan={ev.items.length || 1} className="align-top text-sm text-muted-foreground">
                      {ev.observations ?? "—"}
                    </TableCell>
                    {showActions && (
                      <TableCell rowSpan={ev.items.length || 1} className="align-top">
                        <div className="flex gap-1">
                          {canEdit && (
                            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(ev)} title="Editar evolución">
                              <Pencil className="size-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => { setConfirmEv(ev); setConfirmOpen(true); }}
                              title="Eliminar evolución"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>

                  {extraItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-transparent">
                      <TableCell className="font-mono text-xs font-semibold">{item.diente}</TableCell>
                      <TableCell className="text-sm">{item.prestacion}</TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar evolución</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de eliminar la evolución del{" "}
              <span className="font-medium text-foreground">
                {confirmEv ? formatDateTime(confirmEv.appointment.startDateTime) : ""}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deletePending}>
              Cancelar
            </Button>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={confirmEv?.id ?? ""} />
              <input type="hidden" name="patientId" value={patientId} />
              <Button variant="destructive" type="submit" disabled={deletePending}>
                {deletePending ? "Eliminando..." : "Eliminar"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
