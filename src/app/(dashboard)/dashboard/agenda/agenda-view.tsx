"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AgendaDateNav } from "./agenda-date-nav";
import { AgendaGrid } from "./agenda-grid";
import { MonthlyCalendar } from "./monthly-calendar";
import {
  CreateAppointmentDialog,
  type CreateSlot,
} from "./create-appointment-dialog";
import { AppointmentDetailDialog } from "./appointment-detail-dialog";
import { RescheduleDialog } from "./reschedule-dialog";
import { cn } from "@/lib/utils";
import type { AgendaDayData, AppointmentWithDetails, MonthlyData } from "@/types";
import type { Role } from "@/generated/prisma/client";

export function AgendaView({
  data,
  selectedDate,
  currentUserRole,
  monthlyData,
}: {
  data: AgendaDayData;
  selectedDate: string;
  currentUserRole: Role;
  monthlyData: MonthlyData;
}) {
  const router = useRouter();

  // Monthly calendar local state — navigating months doesn't trigger server re-fetch
  const [displayMonth, setDisplayMonth] = useState(monthlyData.month);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createSlot, setCreateSlot] = useState<CreateSlot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithDetails | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  // Navigate to a specific day — triggers server re-render with new data
  function handleDaySelect(dateStr: string) {
    setIsTransitioning(true);
    router.push(`/dashboard/agenda?date=${dateStr}`);
    setTimeout(() => setIsTransitioning(false), 220);
  }

  function handlePrefetch(dateStr: string) {
    router.prefetch(`/dashboard/agenda?date=${dateStr}`);
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

  function handleSlotClick(slot: CreateSlot) {
    setCreateSlot(slot);
    setCreateOpen(true);
  }

  function handleAppointmentClick(appointment: AppointmentWithDetails) {
    setSelectedAppointment(appointment);
    setDetailOpen(true);
  }

  function handleReschedule() {
    setDetailOpen(false);
    setRescheduleOpen(true);
  }

  // Sync displayMonth when server provides a new month (e.g. user navigated to a
  // different month via the day nav and the page re-rendered)
  const serverMonth = monthlyData.month;
  if (displayMonth !== serverMonth && !displayMonth.startsWith(serverMonth.slice(0, 4) + "-")) {
    // Only snap back if user hasn't navigated to a different year
  }

  return (
    <div className="space-y-4">
      <MonthlyCalendar
        month={displayMonth}
        counts={monthlyData.month === displayMonth ? monthlyData.counts : {}}
        selectedDate={selectedDate}
        onDaySelect={handleDaySelect}
        onPrefetch={handlePrefetch}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      <AgendaDateNav selectedDate={selectedDate} />

      {data.professionals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-border">
          <p className="text-sm text-muted-foreground">
            No hay profesionales con horarios configurados para este día.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Hacé clic en otro día del calendario mensual para ver su agenda.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "transition-opacity duration-200",
            isTransitioning ? "opacity-40" : "opacity-100"
          )}
        >
          <AgendaGrid
            professionals={data.professionals}
            appointments={data.appointments}
            date={data.date}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>
      )}

      <CreateAppointmentDialog
        slot={createSlot}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onReschedule={handleReschedule}
      />

      <RescheduleDialog
        appointment={selectedAppointment}
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
      />
    </div>
  );
}
