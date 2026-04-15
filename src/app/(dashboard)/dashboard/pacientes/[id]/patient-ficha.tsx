"use client";

import { useState } from "react";
import { AlertTriangle, Download, Stethoscope, ClipboardList, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HistoriaForm } from "./historia-form";
import { HistoriaDisplay } from "./historia-display";
import { OdontogramSection } from "@/components/odontogram";
import type { PatientFichaData } from "@/types";

function calcularEdad(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

const ESTADO_CIVIL_LABELS: Record<string, string> = {
  Soltero: "Soltero/a",
  Casado: "Casado/a",
  Viudo: "Viudo/a",
  Divorciado: "Divorciado/a",
  Convivencia: "Convivencia",
  SeparadoLegalmente: "Separado/a Legalmente",
};

const TABS = [
  { key: "historia", label: "Historia Clínica" },
  { key: "evoluciones", label: "Evoluciones" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function PatientFicha({ data, canEditHistoria = true }: { data: PatientFichaData; canEditHistoria?: boolean }) {
  const [activeTab, setActiveTab] = useState<TabKey>("historia");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const historia = data.historiaClinica;
  const hasCriticalAlerts =
    historia && (historia.alergias || historia.enfermedadContagiosa || historia.embarazada);

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    setIsCreating(false);
    setIsEditing(false);
  }

  return (
    <div className="space-y-4">
      {/* Critical alerts banner — only when historia exists */}
      {historia && (
        <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-3">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="flex flex-1 flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Alertas clínicas:
            </span>
            {historia.alergias && (
              <Badge variant="destructive">
                Alérgico/a{historia.alergiasDetalle ? `: ${historia.alergiasDetalle}` : ""}
              </Badge>
            )}
            {historia.enfermedadContagiosa && (
              <Badge variant="destructive">
                Enf. Contagiosa{historia.contagiosaDetalle ? `: ${historia.contagiosaDetalle}` : ""}
              </Badge>
            )}
            {historia.embarazada && (
              <Badge className="bg-amber-500 text-white border-transparent hover:bg-amber-600">
                Embarazada{historia.embarazadaMeses ? ` (${historia.embarazadaMeses} meses)` : ""}
              </Badge>
            )}
            {!hasCriticalAlerts && (
              <span className="text-sm text-amber-700 dark:text-amber-400">
                Sin alertas críticas registradas
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            className={[
              "relative px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            ].join(" ")}
          >
            {tab.label}
            {tab.key === "historia" && !historia && (
              <span className="ml-1.5 inline-block size-1.5 bg-amber-500 rounded-full align-middle" />
            )}
          </button>
        ))}
      </div>

      {/* Historia Clínica tab — full document: Datos + HC + Odontograma */}
      {activeTab === "historia" && (
        <div className="space-y-0 border border-border">
          {/* Section 1: Datos Generales */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Datos Generales</h2>
              <Tooltip>
                <TooltipTrigger render={<Button variant="ghost" size="icon-sm" disabled />}>
                  <Download className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Descargar Historia Clínica</TooltipContent>
              </Tooltip>
            </div>
            <dl className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">DNI</dt>
                <dd className="font-medium mt-0.5">{data.dni}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Nombre completo</dt>
                <dd className="font-medium mt-0.5">
                  {data.firstName} {data.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Edad</dt>
                <dd className="font-medium mt-0.5">
                  {data.birthDate ? `${calcularEdad(new Date(data.birthDate))} años` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fecha de nacimiento</dt>
                <dd className="font-medium mt-0.5">
                  {data.birthDate
                    ? new Date(data.birthDate).toLocaleDateString("es-AR")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium mt-0.5">{data.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Teléfono</dt>
                <dd className="font-medium mt-0.5">{data.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estado civil</dt>
                <dd className="font-medium mt-0.5">
                  {data.estadoCivil
                    ? (ESTADO_CIVIL_LABELS[data.estadoCivil] ?? data.estadoCivil)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Nacionalidad</dt>
                <dd className="font-medium mt-0.5">{data.nacionalidad?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Provincia</dt>
                <dd className="font-medium mt-0.5">{data.provincia?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dirección</dt>
                <dd className="font-medium mt-0.5">{data.address ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Obra social</dt>
                <dd className="font-medium mt-0.5">{data.obraSocial?.name ?? "—"}</dd>
              </div>
            </dl>
          </div>

          <Separator />

          {/* Section 2: Historia Clínica */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Historia Clínica</h2>
              {canEditHistoria && historia && !isEditing && (
                <Tooltip>
                  <TooltipTrigger render={<Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)} />}>
                    <Pencil className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>Editar Historia Clínica</TooltipContent>
                </Tooltip>
              )}
            </div>

            {!historia && !isCreating && (
              <div className="flex items-start gap-3 border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-4">
                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Este paciente no tiene historia clínica.
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Completá el formulario antes de la primera consulta.
                  </p>
                </div>
                {canEditHistoria && (
                  <Button onClick={() => setIsCreating(true)}>
                    Completar Historia Clínica
                  </Button>
                )}
              </div>
            )}

            {!historia && isCreating && (
              <HistoriaForm
                patientId={data.id}
                mode="create"
                onCancel={() => setIsCreating(false)}
              />
            )}

            {historia && !isEditing && (
              <HistoriaDisplay historia={historia} />
            )}

            {historia && isEditing && (
              <HistoriaForm
                patientId={data.id}
                mode="edit"
                initialData={historia}
                onCancel={() => setIsEditing(false)}
              />
            )}
          </div>

          <Separator />

          {/* Section 3: Odontograma */}
          <div className="p-6">
            {historia ? (
              <OdontogramSection
                historiaClinicaId={historia.id}
                initialData={historia.odontograma}
                canEdit={canEditHistoria}
              />
            ) : (
              <>
                <h2 className="text-base font-semibold mb-4">Odontograma</h2>
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground gap-3 border border-dashed border-border">
                  <Stethoscope className="size-10 opacity-30" />
                  <p className="text-sm">Complete la historia clínica para habilitar el odontograma</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Evoluciones tab */}
      {activeTab === "evoluciones" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
            <ClipboardList className="size-10 opacity-30" />
            <p className="font-medium">Evoluciones</p>
            <p className="text-sm">Próximamente disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
