"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getMonthlyAppointmentCounts } from "@/services/appointment";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { AgendaGrid } from "./agenda-grid";
import { MonthlyCalendar } from "./monthly-calendar";
import {
  CreateAppointmentDialog,
  type CreateSlot,
} from "./create-appointment-dialog";
import { AppointmentDetailDialog } from "./appointment-detail-dialog";
import { RescheduleDialog } from "./reschedule-dialog";
import { APPOINTMENT_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AgendaDayData, AppointmentWithDetails, MonthlyData } from "@/types";
import type { EstadoTurno, Role } from "@/generated/prisma/client";

const STATUS_PLURAL: Record<EstadoTurno, string> = {
  Pendiente:  "Pendientes",
  Confirmado: "Confirmados",
  Completado: "Completados",
  Cancelado:  "Cancelados",
  Ausente:    "Ausentes",
};

const STATUS_ORDER: EstadoTurno[] = ["Pendiente", "Confirmado", "Completado", "Cancelado", "Ausente"];

function DaySummaryPanel({
  selectedDate,
  appointments,
  monthlyData,
}: {
  selectedDate: string;
  appointments: AppointmentWithDetails[];
  monthlyData: MonthlyData;
}) {
  const dateObj = parse(selectedDate, "yyyy-MM-dd", new Date());

  const dayCounts = useMemo(
    () => appointments.reduce<Partial<Record<EstadoTurno, number>>>((acc, apt) => {
      acc[apt.status] = (acc[apt.status] ?? 0) + 1;
      return acc;
    }, {}),
    [appointments]
  );

  const monthTotal = useMemo(
    () => Object.values(monthlyData.counts).reduce((a, b) => a + b, 0),
    [monthlyData.counts]
  );

  const monthLabel = format(parse(monthlyData.month + "-01", "yyyy-MM-dd", new Date()), "MMMM yyyy", { locale: es });

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="border border-border bg-card p-6 flex flex-col justify-center items-center text-center flex-1">
        <p className="text-2xl font-semibold capitalize leading-tight">
          {format(dateObj, "EEEE", { locale: es })}
        </p>
        <p className="text-8xl font-bold leading-none">
          {format(dateObj, "d")}
        </p>
        <p className="text-2xl font-normal capitalize leading-tight w-full truncate text-center">
          {format(dateObj, "MMMM yyyy", { locale: es })}
        </p>
      </div>

      <div className="border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Turnos del día</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1 border-b border-border">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-bold">{appointments.length}</span>
          </div>
          {STATUS_ORDER.map((status) => {
            const count = dayCounts[status];
            if (!count) return null;
            const color = APPOINTMENT_STATUS_COLORS[status];
            return (
              <div key={status} className="flex items-center justify-between">
                <span className={cn("text-xs px-2 py-0.5 font-medium", color.bg, color.text)}>
                  {STATUS_PLURAL[status]}
                </span>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            );
          })}
          {appointments.length === 0 && (
            <p className="text-xs text-muted-foreground">Sin turnos para este día.</p>
          )}
        </div>
      </div>

      <div className="border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Turnos del mes</p>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-medium capitalize">{monthLabel}</span>
          <span className="text-lg font-bold">{monthTotal}</span>
        </div>
      </div>
    </div>
  );
}

export function AgendaView({
  data,
  selectedDate,
  currentUserRole,
  monthlyData,
  professionalId,
}: {
  data: AgendaDayData;
  selectedDate: string;
  currentUserRole: Role;
  monthlyData: MonthlyData;
  professionalId?: string;
}) {
  const router = useRouter();

  const [displayMonth, setDisplayMonth] = useState(monthlyData.month);
  const [countsCache, setCountsCache] = useState<Record<string, Record<string, number>>>(
    { [monthlyData.month]: monthlyData.counts }
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const fetchingRef = useRef<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [createSlot, setCreateSlot] = useState<CreateSlot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  useEffect(() => {
    if (countsCache[displayMonth] !== undefined) return;
    if (fetchingRef.current.has(displayMonth)) return;
    fetchingRef.current.add(displayMonth);
    getMonthlyAppointmentCounts(displayMonth, professionalId).then((counts) => {
      setCountsCache((prev) => ({ ...prev, [displayMonth]: counts }));
    });
  }, [displayMonth, professionalId, countsCache]);

  function handleDaySelect(dateStr: string) {
    setIsTransitioning(true);
    router.push(`/dashboard/agenda?date=${dateStr}`);
    setTimeout(() => setIsTransitioning(false), 220);
  }

  function handlePrevMonth() {
    const [y, m] = displayMonth.split("-").map(Number);
    setDisplayMonth(
      m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`
    );
  }

  function handleNextMonth() {
    const [y, m] = displayMonth.split("-").map(Number);
    setDisplayMonth(
      m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-stretch">
        <div className="w-[30%] shrink-0">
          <DaySummaryPanel selectedDate={selectedDate} appointments={data.appointments} monthlyData={monthlyData} />
        </div>

        <div className="flex-1">
          <MonthlyCalendar
            month={displayMonth}
            counts={countsCache[displayMonth] ?? {}}
            selectedDate={selectedDate}
            onDaySelect={handleDaySelect}
            onPrefetch={(dateStr) => router.prefetch(`/dashboard/agenda?date=${dateStr}`)}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </div>
      </div>

      {data.professionals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            No hay profesionales con horarios configurados para este día.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Hacé clic en otro día del calendario mensual para ver su agenda.
          </p>
        </div>
      ) : (
        <div className={cn("transition-opacity duration-200", isTransitioning ? "opacity-40" : "opacity-100")}>
          <AgendaGrid
            professionals={data.professionals}
            appointments={data.appointments}
            date={data.date}
            onSlotClick={(slot) => { setCreateSlot(slot); setCreateOpen(true); }}
            onAppointmentClick={(apt) => { setSelectedAppointment(apt); setDetailOpen(true); }}
          />
        </div>
      )}

      <CreateAppointmentDialog slot={createSlot} open={createOpen} onOpenChange={setCreateOpen} />
      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onReschedule={() => { setDetailOpen(false); setRescheduleOpen(true); }}
      />
      <RescheduleDialog appointment={selectedAppointment} open={rescheduleOpen} onOpenChange={setRescheduleOpen} />
    </div>
  );
}
