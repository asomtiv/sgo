"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { createHistoriaClinica, updateHistoriaClinica } from "@/services/historia-clinica";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AnamnesisData,
  ExamenClinicoData,
  HistoriaClinicaData,
  HistoriaOdontologicaData,
} from "@/types";

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_ANAMNESIS: AnamnesisData = {
  enfermedades: false,
  tratamientoMedico: false,
  medicamentosActuales: false,
  medicamentosPasados: false,
  operaciones: false,
  transfusiones: false,
  problemasRespiratorios: false,
  cicatrizaMal: false,
  sangraMucho: false,
  problemaColageno: false,
  fiebreReumatica: false,
  diabetes: false,
  diabetesControlada: false,
  problemaCardiaco: false,
  aspirinAnticoagulante: false,
  presionAlta: false,
  chagas: false,
  chagasTratamiento: false,
  problemasRenales: false,
  ulceraGastrica: false,
  hepatitis: false,
  problemaHepatico: false,
  convulsionesEpilepsia: false,
  sifilisgonorrea: false,
  otraEnfermedad: false,
  tratamientoAlternativo: false,
  fuma: false,
  deporte: false,
  malestDeporte: false,
};

const DEFAULT_EXAMEN: ExamenClinicoData = {
  lesionManchas: false,
  lesionAbultamiento: false,
  lesionUlceraciones: false,
  lesionAmpollas: false,
  anomalias: false,
  salidaPus: false,
  movilidadDental: false,
  morderAlto: false,
  caraHinchada: false,
  sangradoEncias: false,
  sarro: false,
  enfermedadPeriodontal: false,
};

const DEFAULT_ODONTO: HistoriaOdontologicaData = {
  consultoOtroProfesional: false,
  tomoMedicamentoPrevio: false,
  medicamentoPrevioResultado: false,
  tuvoDolor: false,
  golpeDientes: false,
  fracturaDiente: false,
};

type CriticalState = {
  alergias: boolean;
  alergiasDetalle: string;
  enfermedadContagiosa: boolean;
  contagiosaDetalle: string;
  embarazada: boolean;
  embarazadaMeses: string;
};

// ── Primitives ───────────────────────────────────────────────────────────────

function YesNoToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex shrink-0">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={[
          "h-8 px-3 text-sm border border-r-0 transition-colors",
          value
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground border-border hover:bg-muted",
        ].join(" ")}
      >
        Sí
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={[
          "h-8 px-3 text-sm border transition-colors",
          !value
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground border-border hover:bg-muted",
        ].join(" ")}
      >
        No
      </button>
    </div>
  );
}

function QuestionRow({
  label,
  value,
  onChange,
  detailValue,
  onDetailChange,
  detailPlaceholder = "¿Cuál?",
  children,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  detailValue?: string;
  onDetailChange?: (v: string) => void;
  detailPlaceholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3 py-1.5 border-b border-border">
        <span className="flex-1 text-sm">{label}</span>
        <YesNoToggle value={value} onChange={onChange} />
      </div>
      {value && onDetailChange !== undefined && (
        <div className="ml-4">
          <Input
            placeholder={detailPlaceholder}
            value={detailValue ?? ""}
            onChange={(e) => onDetailChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      {value && children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground border-b pb-2">
      {children}
    </h3>
  );
}

// ── Stepper ──────────────────────────────────────────────────────────────────

const STEP_LABELS = ["HC Odontológica", "Anamnesis", "Examen Clínico"];

function StepperHeader({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center">
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const isCompleted = step > s;
          const isActive = step === s;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={[
                    "flex size-8 shrink-0 items-center justify-center border text-sm font-medium transition-colors",
                    isCompleted || isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {isCompleted ? <Check className="size-4" /> : s}
                </div>
                <span className={["text-xs whitespace-nowrap", isActive ? "text-primary font-medium" : "text-muted-foreground"].join(" ")}>
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={["h-px flex-1 mx-2 mb-5 transition-colors", step > s ? "bg-primary" : "bg-border"].join(" ")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function HistoriaForm({
  patientId,
  mode,
  initialData,
  onCancel,
}: {
  patientId: string;
  mode: "create" | "edit";
  initialData?: HistoriaClinicaData;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [pending, setPending] = useState(false);

  const [critical, setCritical] = useState<CriticalState>({
    alergias: initialData?.alergias ?? false,
    alergiasDetalle: initialData?.alergiasDetalle ?? "",
    enfermedadContagiosa: initialData?.enfermedadContagiosa ?? false,
    contagiosaDetalle: initialData?.contagiosaDetalle ?? "",
    embarazada: initialData?.embarazada ?? false,
    embarazadaMeses: initialData?.embarazadaMeses ?? "",
  });

  const [anamnesis, setAnamnesis] = useState<AnamnesisData>(
    initialData?.anamnesis ?? DEFAULT_ANAMNESIS
  );
  const [examen, setExamen] = useState<ExamenClinicoData>(
    initialData?.examenClinico ?? DEFAULT_EXAMEN
  );
  const [odonto, setOdonto] = useState<HistoriaOdontologicaData>(
    initialData?.historiaOdontologica ?? DEFAULT_ODONTO
  );

  function ua<K extends keyof AnamnesisData>(key: K, value: AnamnesisData[K]) {
    setAnamnesis((p) => ({ ...p, [key]: value }));
  }
  function ue<K extends keyof ExamenClinicoData>(key: K, value: ExamenClinicoData[K]) {
    setExamen((p) => ({ ...p, [key]: value }));
  }
  function uo<K extends keyof HistoriaOdontologicaData>(key: K, value: HistoriaOdontologicaData[K]) {
    setOdonto((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit() {
    setPending(true);
    const input =
      mode === "create"
        ? {
            patientId,
            ...critical,
            alergiasDetalle: critical.alergiasDetalle || undefined,
            contagiosaDetalle: critical.contagiosaDetalle || undefined,
            embarazadaMeses: critical.embarazadaMeses || undefined,
            anamnesis,
            examenClinico: examen,
            historiaOdontologica: odonto,
          }
        : {
            id: initialData!.id,
            ...critical,
            alergiasDetalle: critical.alergiasDetalle || undefined,
            contagiosaDetalle: critical.contagiosaDetalle || undefined,
            embarazadaMeses: critical.embarazadaMeses || undefined,
            anamnesis,
            examenClinico: examen,
            historiaOdontologica: odonto,
          };

    const result = await (mode === "create"
      ? createHistoriaClinica(input)
      : updateHistoriaClinica(input));

    setPending(false);
    if (result.success) {
      toast.success(mode === "create" ? "Historia clínica creada exitosamente" : "Historia clínica actualizada exitosamente");
      onCancel();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <StepperHeader step={step} />

      {/* ── Step 2: Anamnesis ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Col izquierda: Antecedentes + Alertas */}
            <div className="space-y-4">
              <SectionTitle>Antecedentes Patológicos y Riesgo</SectionTitle>

              <QuestionRow label="¿Sufre o ha sufrido alguna enfermedad?" value={anamnesis.enfermedades} onChange={(v) => ua("enfermedades", v)} detailValue={anamnesis.enfermedadesDetalle} onDetailChange={(v) => ua("enfermedadesDetalle", v)} detailPlaceholder="¿Cuál? (Diabetes, Hipertensión, Chagas, etc.)" />
              <QuestionRow label="¿Hace algún tratamiento médico actualmente?" value={anamnesis.tratamientoMedico} onChange={(v) => ua("tratamientoMedico", v)} detailValue={anamnesis.tratamientoDetalle} onDetailChange={(v) => ua("tratamientoDetalle", v)} />
              <QuestionRow label="¿Consume medicamentos habitualmente?" value={anamnesis.medicamentosActuales} onChange={(v) => ua("medicamentosActuales", v)} detailValue={anamnesis.medicamentosActualesDetalle} onDetailChange={(v) => ua("medicamentosActualesDetalle", v)} detailPlaceholder="¿Cuáles?" />
              <QuestionRow label="¿Ha consumido otros medicamentos en los últimos 5 años?" value={anamnesis.medicamentosPasados} onChange={(v) => ua("medicamentosPasados", v)} detailValue={anamnesis.medicamentosPasadosDetalle} onDetailChange={(v) => ua("medicamentosPasadosDetalle", v)} detailPlaceholder="¿Cuáles?" />
              <QuestionRow label="¿Ha sido operado/a alguna vez?" value={anamnesis.operaciones} onChange={(v) => ua("operaciones", v)} detailValue={anamnesis.operacionesDetalle} onDetailChange={(v) => ua("operacionesDetalle", v)} detailPlaceholder="¿De qué y cuándo?" />
              <QuestionRow label="¿Ha recibido transfusiones de sangre?" value={anamnesis.transfusiones} onChange={(v) => ua("transfusiones", v)} />
              <QuestionRow label="¿Tiene problemas respiratorios?" value={anamnesis.problemasRespiratorios} onChange={(v) => ua("problemasRespiratorios", v)} detailValue={anamnesis.respiratoriosDetalle} onDetailChange={(v) => ua("respiratoriosDetalle", v)} />

              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-sm">Al sacarle una muela o lastimarse, ¿cicatriza mal?</span>
                  <YesNoToggle value={anamnesis.cicatrizaMal} onChange={(v) => ua("cicatrizaMal", v)} />
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="flex-1 text-sm text-muted-foreground">¿Sangra mucho?</span>
                  <YesNoToggle value={anamnesis.sangraMucho} onChange={(v) => ua("sangraMucho", v)} />
                </div>
              </div>

              <QuestionRow label="¿Tiene problema de colágeno (hiperlaxitud)?" value={anamnesis.problemaColageno} onChange={(v) => ua("problemaColageno", v)} />
              <QuestionRow label="¿Antecedentes de fiebre reumática?" value={anamnesis.fiebreReumatica} onChange={(v) => ua("fiebreReumatica", v)} detailValue={anamnesis.fiebreReumaticaMedicacion} onDetailChange={(v) => ua("fiebreReumaticaMedicacion", v)} detailPlaceholder="Medicación que toma" />

              <QuestionRow label="¿Es diabético/a?" value={anamnesis.diabetes} onChange={(v) => ua("diabetes", v)}>
                {anamnesis.diabetes && (
                  <div className="ml-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground flex-1">¿Está controlado/a?</span>
                      <YesNoToggle value={anamnesis.diabetesControlada} onChange={(v) => ua("diabetesControlada", v)} />
                    </div>
                    <Input placeholder="¿Con qué?" value={anamnesis.diabetesDetalle ?? ""} onChange={(e) => ua("diabetesDetalle", e.target.value)} className="max-w-sm" />
                  </div>
                )}
              </QuestionRow>

              <QuestionRow label="¿Tiene algún problema cardíaco?" value={anamnesis.problemaCardiaco} onChange={(v) => ua("problemaCardiaco", v)} detailValue={anamnesis.problemaCardiacoDetalle} onDetailChange={(v) => ua("problemaCardiacoDetalle", v)} />
              <QuestionRow label="¿Toma seguido aspirina y/o anticoagulante?" value={anamnesis.aspirinAnticoagulante} onChange={(v) => ua("aspirinAnticoagulante", v)} detailValue={anamnesis.aspirinFrecuencia} onDetailChange={(v) => ua("aspirinFrecuencia", v)} detailPlaceholder="¿Con qué frecuencia?" />
              <QuestionRow label="¿Tiene presión alta?" value={anamnesis.presionAlta} onChange={(v) => ua("presionAlta", v)} />

              <QuestionRow label="¿Chagas?" value={anamnesis.chagas} onChange={(v) => ua("chagas", v)}>
                {anamnesis.chagas && (
                  <div className="ml-4 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground flex-1">¿Está en tratamiento?</span>
                    <YesNoToggle value={anamnesis.chagasTratamiento} onChange={(v) => ua("chagasTratamiento", v)} />
                  </div>
                )}
              </QuestionRow>

              <QuestionRow label="¿Tiene problemas renales?" value={anamnesis.problemasRenales} onChange={(v) => ua("problemasRenales", v)} />
              <QuestionRow label="¿Úlcera gástrica?" value={anamnesis.ulceraGastrica} onChange={(v) => ua("ulceraGastrica", v)} />

              <QuestionRow label="¿Tuvo hepatitis?" value={anamnesis.hepatitis} onChange={(v) => ua("hepatitis", v)} detailValue={anamnesis.hepatitisTipo} onDetailChange={(v) => ua("hepatitisTipo", v)} detailPlaceholder="Tipo: A / B / C" />
              <QuestionRow label="¿Tiene algún problema hepático?" value={anamnesis.problemaHepatico} onChange={(v) => ua("problemaHepatico", v)} detailValue={anamnesis.problemaHepaticoDetalle} onDetailChange={(v) => ua("problemaHepaticoDetalle", v)} />
              <QuestionRow label="¿Tuvo convulsiones o es epiléptico/a?" value={anamnesis.convulsionesEpilepsia} onChange={(v) => ua("convulsionesEpilepsia", v)} detailValue={anamnesis.convulsionesMedicacion} onDetailChange={(v) => ua("convulsionesMedicacion", v)} detailPlaceholder="Medicación que toma" />
              <QuestionRow label="¿Ha tenido Sífilis o Gonorrea?" value={anamnesis.sifilisgonorrea} onChange={(v) => ua("sifilisgonorrea", v)} />
              <QuestionRow label="¿Otra enfermedad o recomendación médica a dejar constancia?" value={anamnesis.otraEnfermedad} onChange={(v) => ua("otraEnfermedad", v)} detailValue={anamnesis.otraEnfermedadDetalle} onDetailChange={(v) => ua("otraEnfermedadDetalle", v)} />
              <QuestionRow label="¿Realiza tratamiento homeopático, acupuntura u otros?" value={anamnesis.tratamientoAlternativo} onChange={(v) => ua("tratamientoAlternativo", v)} detailValue={anamnesis.tratamientoAlternativoDetalle} onDetailChange={(v) => ua("tratamientoAlternativoDetalle", v)} detailPlaceholder="¿Cuál?" />

              <div className="grid grid-cols-1 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label>Médico de cabecera</Label>
                  <Input placeholder="Nombre del médico de cabecera" value={anamnesis.medicoClinico ?? ""} onChange={(e) => ua("medicoClinico", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Clínica/Hospital para derivación</Label>
                  <Input placeholder="Nombre de la institución" value={anamnesis.clinicaDerivacion ?? ""} onChange={(e) => ua("clinicaDerivacion", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Col derecha: Alertas + Familia + Hábitos */}
            <div className="space-y-6">
              <div className="space-y-4">
                <SectionTitle>Alertas Críticas</SectionTitle>
                <QuestionRow label="¿Es alérgico/a a alguna droga o sustancia? (Ej: Penicilina, Anestesia)" value={critical.alergias} onChange={(v) => setCritical((p) => ({ ...p, alergias: v }))} detailValue={critical.alergiasDetalle} onDetailChange={(v) => setCritical((p) => ({ ...p, alergiasDetalle: v }))} />
                <QuestionRow label="¿Padece alguna enfermedad infecto-contagiosa?" value={critical.enfermedadContagiosa} onChange={(v) => setCritical((p) => ({ ...p, enfermedadContagiosa: v }))} detailValue={critical.contagiosaDetalle} onDetailChange={(v) => setCritical((p) => ({ ...p, contagiosaDetalle: v }))} />
                <QuestionRow label="(Solo mujeres) ¿Está embarazada?" value={critical.embarazada} onChange={(v) => setCritical((p) => ({ ...p, embarazada: v }))} detailValue={critical.embarazadaMeses} onDetailChange={(v) => setCritical((p) => ({ ...p, embarazadaMeses: v }))} detailPlaceholder="¿De cuántos meses?" />
              </div>

              <div className="space-y-4">
                <SectionTitle>Antecedentes Familiares</SectionTitle>
                <div className="space-y-1.5">
                  <Label>Padre — ¿Vive? ¿Enfermedad que padece o padeció?</Label>
                  <Input placeholder="Ej: Vive, hipertensión" value={anamnesis.antecedentesPadre ?? ""} onChange={(e) => ua("antecedentesPadre", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Madre — ¿Vive? ¿Enfermedad que padece o padeció?</Label>
                  <Input placeholder="Ej: Falleció, diabetes" value={anamnesis.antecedentesMadre ?? ""} onChange={(e) => ua("antecedentesMadre", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Hermanos/as — ¿Enfermedades?</Label>
                  <Input placeholder="Ej: Sanos / Uno con epilepsia" value={anamnesis.antecedentesHermanos ?? ""} onChange={(e) => ua("antecedentesHermanos", e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <SectionTitle>Hábitos</SectionTitle>
                <QuestionRow label="¿Fuma?" value={anamnesis.fuma} onChange={(v) => ua("fuma", v)} />
                <QuestionRow label="¿Realiza algún deporte?" value={anamnesis.deporte} onChange={(v) => ua("deporte", v)} detailValue={anamnesis.deporteDetalle} onDetailChange={(v) => ua("deporteDetalle", v)} detailPlaceholder="¿Cuál?">
                  {anamnesis.deporte && (
                    <div className="ml-4 flex items-center gap-3">
                      <span className="text-sm text-muted-foreground flex-1">¿Nota algún malestar al realizarlo?</span>
                      <YesNoToggle value={anamnesis.malestDeporte} onChange={(v) => ua("malestDeporte", v)} />
                    </div>
                  )}
                </QuestionRow>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Examen Clínico ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <SectionTitle>Tejidos Blandos</SectionTitle>
              {(["tejidoLabios", "tejidoLengua", "tejidoPaladar", "tejidoPisoBoca", "tejidoMucosaYugal", "tejidoCarrillos", "tejidoRebordes"] as const).map((field) => {
                const labels: Record<string, string> = {
                  tejidoLabios: "Labios",
                  tejidoLengua: "Lengua",
                  tejidoPaladar: "Paladar",
                  tejidoPisoBoca: "Piso de boca",
                  tejidoMucosaYugal: "Mucosa yugal",
                  tejidoCarrillos: "Carrillos",
                  tejidoRebordes: "Rebordes",
                };
                return (
                  <div key={field} className="space-y-1.5">
                    <Label>{labels[field]}</Label>
                    <Input placeholder="Observaciones..." value={examen[field] ?? ""} onChange={(e) => ue(field, e.target.value)} />
                  </div>
                );
              })}

              <SectionTitle>Tipo de Lesiones</SectionTitle>
              <QuestionRow label="¿Manchas?" value={examen.lesionManchas} onChange={(v) => ue("lesionManchas", v)} />
              <QuestionRow label="¿Abultamiento de los tejidos?" value={examen.lesionAbultamiento} onChange={(v) => ue("lesionAbultamiento", v)} />
              <QuestionRow label="¿Ulceraciones?" value={examen.lesionUlceraciones} onChange={(v) => ue("lesionUlceraciones", v)} />
              <QuestionRow label="¿Ampollas?" value={examen.lesionAmpollas} onChange={(v) => ue("lesionAmpollas", v)} />
              <div className="space-y-1.5">
                <Label>Otras lesiones</Label>
                <Input placeholder="Describir..." value={examen.lesionesOtras ?? ""} onChange={(e) => ue("lesionesOtras", e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <SectionTitle>Estado Bucal</SectionTitle>
              <QuestionRow label="¿Se observa presencia de pus, fístulas o inflamación gingival?" value={examen.anomalias} onChange={(v) => ue("anomalias", v)} detailValue={examen.anomaliasDetalle} onDetailChange={(v) => ue("anomaliasDetalle", v)} detailPlaceholder="Describir..." />
              <QuestionRow label="¿Sale pus de algún lugar de la boca?" value={examen.salidaPus} onChange={(v) => ue("salidaPus", v)} detailValue={examen.salidaPusDetalle} onDetailChange={(v) => ue("salidaPusDetalle", v)} detailPlaceholder="¿De dónde?" />
              <QuestionRow label="¿Tiene movilidad en los dientes?" value={examen.movilidadDental} onChange={(v) => ue("movilidadDental", v)}>
                {examen.movilidadDental && (
                  <div className="ml-4 flex items-center gap-3">
                    <span className="text-sm text-muted-foreground flex-1">¿Al morder siente los dientes altos?</span>
                    <YesNoToggle value={examen.morderAlto} onChange={(v) => ue("morderAlto", v)} />
                  </div>
                )}
              </QuestionRow>
              <QuestionRow label="¿Ha tenido la cara hinchada?" value={examen.caraHinchada} onChange={(v) => ue("caraHinchada", v)} detailValue={examen.caraHinchadaDetalle} onDetailChange={(v) => ue("caraHinchadaDetalle", v)} detailPlaceholder="¿Hielo? ¿Calor? ¿Otros?" />
              <QuestionRow label="¿Le sangran las encías?" value={examen.sangradoEncias} onChange={(v) => ue("sangradoEncias", v)} detailValue={examen.sangradoDesde} onDetailChange={(v) => ue("sangradoDesde", v)} detailPlaceholder="¿Desde cuándo?" />
              <QuestionRow label="Presencia de Sarro" value={examen.sarro} onChange={(v) => ue("sarro", v)} />
              <QuestionRow label="Enfermedad Periodontal" value={examen.enfermedadPeriodontal} onChange={(v) => ue("enfermedadPeriodontal", v)} />

              <div className="space-y-1.5">
                <Label>Índice de placa</Label>
                <Input placeholder="Valor..." value={examen.indicePlaca ?? ""} onChange={(e) => ue("indicePlaca", e.target.value)} className="max-w-xs" />
              </div>
              <div className="space-y-1.5">
                <Label>Estado de Higiene Bucal</Label>
                <Select
                  value={examen.higieneEstado ?? ""}
                  onValueChange={(v) => ue("higieneEstado", v as ExamenClinicoData["higieneEstado"])}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MuyBueno">Muy Bueno</SelectItem>
                    <SelectItem value="Bueno">Bueno</SelectItem>
                    <SelectItem value="Deficiente">Deficiente</SelectItem>
                    <SelectItem value="Malo">Malo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Historia Clínica Odontológica ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <SectionTitle>Motivo de Consulta</SectionTitle>
              <div className="space-y-1.5">
                <Label>¿Por qué asistió a la consulta?</Label>
                <Input placeholder="Descripción del motivo..." value={odonto.motivoConsulta ?? ""} onChange={(e) => uo("motivoConsulta", e.target.value)} />
              </div>
              <QuestionRow label="¿Consultó antes con algún otro profesional?" value={odonto.consultoOtroProfesional} onChange={(v) => uo("consultoOtroProfesional", v)} />
              <QuestionRow label="¿Tomó algún medicamento previo a la consulta?" value={odonto.tomoMedicamentoPrevio} onChange={(v) => uo("tomoMedicamentoPrevio", v)}>
                {odonto.tomoMedicamentoPrevio && (
                  <div className="ml-4 space-y-2">
                    <Input placeholder="Nombre del/los medicamentos" value={odonto.medicamentoPrevioNombre ?? ""} onChange={(e) => uo("medicamentoPrevioNombre", e.target.value)} />
                    <Input placeholder="¿Desde cuándo?" value={odonto.medicamentoPrevioDesde ?? ""} onChange={(e) => uo("medicamentoPrevioDesde", e.target.value)} />
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground flex-1">¿Obtuvo resultados?</span>
                      <YesNoToggle value={odonto.medicamentoPrevioResultado} onChange={(v) => uo("medicamentoPrevioResultado", v)} />
                    </div>
                  </div>
                )}
              </QuestionRow>

              <SectionTitle>Dolor</SectionTitle>
              <QuestionRow label="¿Ha tenido dolor?" value={odonto.tuvoDolor} onChange={(v) => uo("tuvoDolor", v)}>
                {odonto.tuvoDolor && (
                  <div className="ml-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Intensidad</Label>
                      <Select value={odonto.dolorTipo ?? ""} onValueChange={(v) => uo("dolorTipo", v as HistoriaOdontologicaData["dolorTipo"])}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Suave">Suave</SelectItem>
                          <SelectItem value="Moderado">Moderado</SelectItem>
                          <SelectItem value="Intenso">Intenso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Duración</Label>
                      <Select value={odonto.dolorTemporal ?? ""} onValueChange={(v) => uo("dolorTemporal", v as HistoriaOdontologicaData["dolorTemporal"])}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Temporario">Temporario</SelectItem>
                          <SelectItem value="Intermitente">Intermitente</SelectItem>
                          <SelectItem value="Continuo">Continuo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Modo</Label>
                      <Select value={odonto.dolorModo ?? ""} onValueChange={(v) => uo("dolorModo", v as HistoriaOdontologicaData["dolorModo"])}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Espontáneo">Espontáneo</SelectItem>
                          <SelectItem value="Provocado">Provocado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Estímulo</Label>
                      <Select value={odonto.dolorEstimulo ?? ""} onValueChange={(v) => uo("dolorEstimulo", v as HistoriaOdontologicaData["dolorEstimulo"])}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Al frío">Al frío</SelectItem>
                          <SelectItem value="Al calor">Al calor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Ubicación</Label>
                      <Select value={odonto.dolorUbicacion ?? ""} onValueChange={(v) => uo("dolorUbicacion", v as HistoriaOdontologicaData["dolorUbicacion"])}>
                        <SelectTrigger className="w-48"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Localizado">Localizado</SelectItem>
                          <SelectItem value="Irradiado">Irradiado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {odonto.dolorUbicacion === "Localizado" && (
                      <Input placeholder="¿Dónde?" value={odonto.dolorLocalizadoDonde ?? ""} onChange={(e) => uo("dolorLocalizadoDonde", e.target.value)} />
                    )}
                    {odonto.dolorUbicacion === "Irradiado" && (
                      <Input placeholder="¿Hacia dónde?" value={odonto.dolorIrradiadoHacia ?? ""} onChange={(e) => uo("dolorIrradiadoHacia", e.target.value)} />
                    )}
                    <Input placeholder="¿Puede calmarlo con algo?" value={odonto.dolorCalmante ?? ""} onChange={(e) => uo("dolorCalmante", e.target.value)} />
                  </div>
                )}
              </QuestionRow>
            </div>

            <div className="space-y-4">
              <SectionTitle>Traumatismos y Función</SectionTitle>
              <QuestionRow label="¿Sufrió algún golpe en los dientes?" value={odonto.golpeDientes} onChange={(v) => uo("golpeDientes", v)}>
                {odonto.golpeDientes && (
                  <div className="ml-4 space-y-2">
                    <Input placeholder="¿Cuándo?" value={odonto.golpeCuando ?? ""} onChange={(e) => uo("golpeCuando", e.target.value)} />
                    <Input placeholder="¿Cómo se produjo?" value={odonto.golpeComo ?? ""} onChange={(e) => uo("golpeComo", e.target.value)} />
                  </div>
                )}
              </QuestionRow>
              <QuestionRow label="¿Se fracturó algún diente?" value={odonto.fracturaDiente} onChange={(v) => uo("fracturaDiente", v)}>
                {odonto.fracturaDiente && (
                  <div className="ml-4 space-y-2">
                    <Input placeholder="¿Cuál?" value={odonto.fracturaDetalle ?? ""} onChange={(e) => uo("fracturaDetalle", e.target.value)} />
                    <Input placeholder="¿Recibió algún tratamiento?" value={odonto.fracturaTratamiento ?? ""} onChange={(e) => uo("fracturaTratamiento", e.target.value)} />
                  </div>
                )}
              </QuestionRow>

              <SectionTitle>Dificultades Funcionales</SectionTitle>
              {(["dificultadHablar", "dificultadMasticar", "dificultadAbrirBoca", "dificultadTragar"] as const).map((field) => {
                const labels: Record<string, string> = {
                  dificultadHablar: "¿Tiene dificultad para hablar?",
                  dificultadMasticar: "¿Tiene dificultad para masticar?",
                  dificultadAbrirBoca: "¿Tiene dificultad para abrir la boca?",
                  dificultadTragar: "¿Tiene dificultad para tragar los alimentos?",
                };
                return (
                  <div key={field} className="space-y-1.5">
                    <Label>{labels[field]}</Label>
                    <Input placeholder="Describir..." value={odonto[field] ?? ""} onChange={(e) => uo(field, e.target.value)} />
                  </div>
                );
              })}

              <SectionTitle>Diagnóstico y Plan</SectionTitle>
              <div className="space-y-1.5">
                <Label>Diagnóstico presuntivo</Label>
                <Input placeholder="..." value={odonto.diagnosticoPresuntivo ?? ""} onChange={(e) => uo("diagnosticoPresuntivo", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Plan de tratamiento</Label>
                <Input placeholder="..." value={odonto.planTratamiento ?? ""} onChange={(e) => uo("planTratamiento", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Observaciones</Label>
                <Input placeholder="..." value={odonto.observaciones ?? ""} onChange={(e) => uo("observaciones", e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-border">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={pending}>Cancelar</Button>
          {step > 1 && (
            <Button variant="outline" type="button" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} disabled={pending}>
              Anterior
            </Button>
          )}
        </div>
        {step < 3 ? (
          <Button type="button" onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}>Siguiente</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={pending}>
            {pending
              ? mode === "create" ? "Guardando..." : "Actualizando..."
              : mode === "create" ? "Guardar Historia Clínica" : "Actualizar Historia Clínica"}
          </Button>
        )}
      </div>
    </div>
  );
}
