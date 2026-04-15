"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistoriaClinicaData } from "@/types";

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground w-64 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function YesNo({
  value,
  detail,
  neutral = false,
}: {
  value: boolean;
  detail?: string | null;
  neutral?: boolean;
}) {
  if (value) {
    return (
      <span className={neutral ? "font-medium" : "text-destructive"}>
        Sí{detail ? ` — ${detail}` : ""}
      </span>
    );
  }
  return <span className="text-muted-foreground">No</span>;
}

function Dash() {
  return <span className="text-muted-foreground">—</span>;
}

const HIGIENE_LABELS: Record<string, string> = {
  MuyBueno: "Muy Bueno",
  Bueno: "Bueno",
  Deficiente: "Deficiente",
  Malo: "Malo",
};

export function HistoriaDisplay({
  historia,
}: {
  historia: HistoriaClinicaData;
}) {
  const a = historia.anamnesis;
  const e = historia.examenClinico;
  const o = historia.historiaOdontologica;

  return (
    <div className="space-y-4">
      {/* Historia Clínica Odontológica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historia Clínica Odontológica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <FieldRow label="Motivo de consulta" value={o.motivoConsulta || <Dash />} />
              <FieldRow label="¿Consultó con otro profesional?" value={<YesNo value={o.consultoOtroProfesional} neutral />} />
              <FieldRow
                label="¿Tomó medicamento previo?"
                value={
                  o.tomoMedicamentoPrevio ? (
                    <span className="font-medium">
                      Sí
                      {o.medicamentoPrevioNombre ? ` — ${o.medicamentoPrevioNombre}` : ""}
                      {o.medicamentoPrevioDesde ? ` (desde ${o.medicamentoPrevioDesde})` : ""}
                      {o.medicamentoPrevioResultado ? " — con resultados" : " — sin resultados"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
              <FieldRow
                label="¿Ha tenido dolor?"
                value={
                  o.tuvoDolor ? (
                    <span className="text-destructive">
                      Sí
                      {o.dolorTipo ? ` — ${o.dolorTipo}` : ""}
                      {o.dolorTemporal ? `, ${o.dolorTemporal}` : ""}
                      {o.dolorModo ? `, ${o.dolorModo}` : ""}
                      {o.dolorEstimulo ? ` (${o.dolorEstimulo})` : ""}
                      {o.dolorUbicacion ? `, ${o.dolorUbicacion}` : ""}
                      {o.dolorLocalizadoDonde ? ` en ${o.dolorLocalizadoDonde}` : ""}
                      {o.dolorIrradiadoHacia ? ` hacia ${o.dolorIrradiadoHacia}` : ""}
                      {o.dolorCalmante ? ` — calma con: ${o.dolorCalmante}` : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
            </div>
            <div>
              <FieldRow
                label="¿Sufrió golpe en los dientes?"
                value={
                  o.golpeDientes ? (
                    <span className="text-destructive">
                      Sí
                      {o.golpeCuando ? ` — ${o.golpeCuando}` : ""}
                      {o.golpeComo ? ` — ${o.golpeComo}` : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
              <FieldRow
                label="¿Se fracturó algún diente?"
                value={
                  o.fracturaDiente ? (
                    <span className="text-destructive">
                      Sí
                      {o.fracturaDetalle ? ` — ${o.fracturaDetalle}` : ""}
                      {o.fracturaTratamiento ? ` — tratamiento: ${o.fracturaTratamiento}` : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
              <FieldRow label="Dificultad para hablar" value={o.dificultadHablar || <Dash />} />
              <FieldRow label="Dificultad para masticar" value={o.dificultadMasticar || <Dash />} />
              <FieldRow label="Dificultad para abrir la boca" value={o.dificultadAbrirBoca || <Dash />} />
              <FieldRow label="Dificultad para tragar" value={o.dificultadTragar || <Dash />} />
              <FieldRow label="Diagnóstico presuntivo" value={o.diagnosticoPresuntivo || <Dash />} />
              <FieldRow label="Plan de tratamiento" value={o.planTratamiento || <Dash />} />
              <FieldRow label="Observaciones" value={o.observaciones || <Dash />} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Críticas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alertas Críticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <FieldRow
                label="¿Es alérgico/a a alguna droga o sustancia?"
                value={<YesNo value={historia.alergias} detail={historia.alergiasDetalle} />}
              />
              <FieldRow
                label="¿Padece enfermedad infecto-contagiosa?"
                value={<YesNo value={historia.enfermedadContagiosa} detail={historia.contagiosaDetalle} />}
              />
            </div>
            <div>
              <FieldRow
                label="¿Está embarazada?"
                value={
                  historia.embarazada ? (
                    <span className="text-amber-600">
                      Sí{historia.embarazadaMeses ? ` — ${historia.embarazadaMeses} meses` : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Antecedentes Patológicos y Riesgo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Antecedentes Patológicos y Riesgo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <FieldRow label="¿Sufre o ha sufrido alguna enfermedad?" value={<YesNo value={a.enfermedades} detail={a.enfermedadesDetalle} />} />
              <FieldRow label="¿Está realizando tratamiento médico?" value={<YesNo value={a.tratamientoMedico} detail={a.tratamientoDetalle} />} />
              <FieldRow label="¿Consume medicamentos habitualmente?" value={<YesNo value={a.medicamentosActuales} detail={a.medicamentosActualesDetalle} />} />
              <FieldRow label="¿Medicamentos en los últimos 5 años?" value={<YesNo value={a.medicamentosPasados} detail={a.medicamentosPasadosDetalle} />} />
              <FieldRow label="¿Ha sido operado/a alguna vez?" value={<YesNo value={a.operaciones} detail={a.operacionesDetalle} />} />
              <FieldRow label="¿Ha recibido transfusiones de sangre?" value={<YesNo value={a.transfusiones} />} />
              <FieldRow label="¿Tiene problemas respiratorios?" value={<YesNo value={a.problemasRespiratorios} detail={a.respiratoriosDetalle} />} />
              <FieldRow
                label="¿Cicatriza mal al hacerse una herida?"
                value={
                  a.cicatrizaMal ? (
                    <span className="text-destructive">
                      Sí{a.sangraMucho ? " — sangra mucho" : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
              <FieldRow label="¿Problema de colágeno (hiperlaxitud)?" value={<YesNo value={a.problemaColageno} />} />
              <FieldRow label="¿Antecedentes de fiebre reumática?" value={<YesNo value={a.fiebreReumatica} detail={a.fiebreReumaticaMedicacion} />} />
              <FieldRow
                label="¿Es diabético/a?"
                value={
                  a.diabetes ? (
                    <span className="text-destructive">
                      Sí — {a.diabetesControlada ? "controlada" : "no controlada"}
                      {a.diabetesDetalle ? ` — ${a.diabetesDetalle}` : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
            </div>
            <div>
              <FieldRow label="¿Tiene algún problema cardíaco?" value={<YesNo value={a.problemaCardiaco} detail={a.problemaCardiacoDetalle} />} />
              <FieldRow label="¿Toma aspirina y/o anticoagulante?" value={<YesNo value={a.aspirinAnticoagulante} detail={a.aspirinFrecuencia} />} />
              <FieldRow label="¿Tiene presión alta?" value={<YesNo value={a.presionAlta} />} />
              <FieldRow
                label="¿Chagas?"
                value={
                  a.chagas ? (
                    <span className="text-destructive">
                      Sí — {a.chagasTratamiento ? "en tratamiento" : "sin tratamiento"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
              <FieldRow label="¿Tiene problemas renales?" value={<YesNo value={a.problemasRenales} />} />
              <FieldRow label="¿Úlcera gástrica?" value={<YesNo value={a.ulceraGastrica} />} />
              <FieldRow label="¿Tuvo hepatitis?" value={<YesNo value={a.hepatitis} detail={a.hepatitisTipo} />} />
              <FieldRow label="¿Tiene algún problema hepático?" value={<YesNo value={a.problemaHepatico} detail={a.problemaHepaticoDetalle} />} />
              <FieldRow label="¿Tuvo convulsiones o es epiléptico/a?" value={<YesNo value={a.convulsionesEpilepsia} detail={a.convulsionesMedicacion} />} />
              <FieldRow label="¿Ha tenido Sífilis o Gonorrea?" value={<YesNo value={a.sifilisgonorrea} />} />
              <FieldRow label="¿Otra enfermedad a dejar constancia?" value={<YesNo value={a.otraEnfermedad} detail={a.otraEnfermedadDetalle} />} />
              <FieldRow label="¿Tratamiento homeopático, acupuntura u otros?" value={<YesNo value={a.tratamientoAlternativo} detail={a.tratamientoAlternativoDetalle} />} />
              <FieldRow label="Médico de cabecera" value={a.medicoClinico || <Dash />} />
              <FieldRow label="Clínica/Hospital para derivación" value={a.clinicaDerivacion || <Dash />} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Antecedentes Familiares y Hábitos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Antecedentes Familiares y Hábitos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <FieldRow label="Padre — ¿Vive? ¿Enfermedad que padece o padeció?" value={a.antecedentesPadre || <Dash />} />
              <FieldRow label="Madre — ¿Vive? ¿Enfermedad que padece o padeció?" value={a.antecedentesMadre || <Dash />} />
              <FieldRow label="Hermanos/as — ¿Enfermedades?" value={a.antecedentesHermanos || <Dash />} />
            </div>
            <div>
              <FieldRow label="¿Fuma?" value={<YesNo value={a.fuma} />} />
              <FieldRow
                label="¿Realiza algún deporte?"
                value={
                  a.deporte ? (
                    <span className="font-medium">
                      Sí{a.deporteDetalle ? ` — ${a.deporteDetalle}` : ""}
                      {a.malestDeporte ? " (nota malestar)" : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examen Clínico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Examen Clínico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8">
            <div>
              <FieldRow label="Tejidos blandos — Labios" value={e.tejidoLabios || <Dash />} />
              <FieldRow label="Tejidos blandos — Lengua" value={e.tejidoLengua || <Dash />} />
              <FieldRow label="Tejidos blandos — Paladar" value={e.tejidoPaladar || <Dash />} />
              <FieldRow label="Tejidos blandos — Piso de boca" value={e.tejidoPisoBoca || <Dash />} />
              <FieldRow label="Tejidos blandos — Mucosa yugal" value={e.tejidoMucosaYugal || <Dash />} />
              <FieldRow label="Tejidos blandos — Carrillos" value={e.tejidoCarrillos || <Dash />} />
              <FieldRow label="Tejidos blandos — Rebordes" value={e.tejidoRebordes || <Dash />} />
              <FieldRow label="Lesiones — ¿Manchas?" value={<YesNo value={e.lesionManchas} />} />
              <FieldRow label="Lesiones — ¿Abultamiento?" value={<YesNo value={e.lesionAbultamiento} />} />
              <FieldRow label="Lesiones — ¿Ulceraciones?" value={<YesNo value={e.lesionUlceraciones} />} />
              <FieldRow label="Lesiones — ¿Ampollas?" value={<YesNo value={e.lesionAmpollas} />} />
              <FieldRow label="Otras lesiones" value={e.lesionesOtras || <Dash />} />
            </div>
            <div>
              <FieldRow label="¿Pus, fístulas o inflamación gingival?" value={<YesNo value={e.anomalias} detail={e.anomaliasDetalle} />} />
              <FieldRow label="¿Sale pus de algún lugar?" value={<YesNo value={e.salidaPus} detail={e.salidaPusDetalle} />} />
              <FieldRow
                label="¿Movilidad en los dientes?"
                value={
                  e.movilidadDental ? (
                    <span className="text-destructive">
                      Sí{e.morderAlto ? " — siente los dientes altos" : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No</span>
                  )
                }
              />
              <FieldRow label="¿Ha tenido la cara hinchada?" value={<YesNo value={e.caraHinchada} detail={e.caraHinchadaDetalle} />} />
              <FieldRow label="Índice de placa" value={e.indicePlaca || <Dash />} />
              <FieldRow
                label="Estado de Higiene Bucal"
                value={e.higieneEstado ? HIGIENE_LABELS[e.higieneEstado] ?? e.higieneEstado : <Dash />}
              />
              <FieldRow label="¿Le sangran las encías?" value={<YesNo value={e.sangradoEncias} detail={e.sangradoDesde} />} />
              <FieldRow label="Presencia de Sarro" value={<YesNo value={e.sarro} />} />
              <FieldRow label="Enfermedad Periodontal" value={<YesNo value={e.enfermedadPeriodontal} />} />
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-right">
        Última actualización:{" "}
        {new Date(historia.updatedAt).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
