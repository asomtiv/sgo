"use client";

import React from "react";
import { GRID_BASE_INTERVAL, LEAVE_TYPE_LABELS } from "@/lib/constants";
import { formatDisplayName } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppointmentBrick } from "./appointment-brick";
import { CalendarPlus } from "lucide-react";
import type {
  AgendaProfessional,
  AppointmentWithDetails,
  AvailabilityBlock,
} from "@/types";
import type { Role } from "@/generated/prisma/client";

export type SlotClick = {
  professionalId: string;
  startDateTime: string;
  endDateTime: string;
  professionalName: string;
  isOverbooking?: boolean;
};

const CLICK_INTERVAL = 30;
const ROW_HEIGHT = 30; // px per 15-min visual row
const TIME_COL_WIDTH = 72;

// Height in px of the overbooking indicator strip between two back-to-back appointments
const OB_STRIP_HEIGHT = 6;
// Half-height of the CalendarPlus trigger button, centered on the boundary line
const OB_TRIGGER_HALF = 10;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function isWithinAvailability(
  timeMinutes: number,
  durationMin: number,
  availabilities: AvailabilityBlock[]
): boolean {
  return availabilities.some(
    (a) =>
      timeMinutes >= timeToMinutes(a.startTime) &&
      timeMinutes + durationMin <= timeToMinutes(a.endTime)
  );
}

function dateTimeForSlot(date: string, timeMinutes: number): string {
  return `${date}T${minutesToTime(timeMinutes)}:00-03:00`;
}

function aptMinutes(apt: AppointmentWithDetails): { start: number; end: number } {
  const toMin = (d: Date) =>
    timeToMinutes(
      d.toLocaleString("sv-SE", {
        timeZone: "America/Argentina/Buenos_Aires",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
  return { start: toMin(new Date(apt.startDateTime)), end: toMin(new Date(apt.endDateTime)) };
}

export function AgendaGrid({
  professionals,
  appointments,
  date,
  currentUserRole,
  onSlotClick,
  onAppointmentClick,
}: {
  professionals: AgendaProfessional[];
  appointments: AppointmentWithDetails[];
  date: string;
  currentUserRole: Role;
  onSlotClick: (slot: SlotClick) => void;
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
}) {
  const canOverbooking = currentUserRole === "Admin" || currentUserRole === "Recepcion";

  let gridStartMin = Infinity;
  let gridEndMin = -Infinity;
  for (const prof of professionals) {
    for (const a of prof.availabilities) {
      const s = timeToMinutes(a.startTime);
      const e = timeToMinutes(a.endTime);
      if (s < gridStartMin) gridStartMin = s;
      if (e > gridEndMin) gridEndMin = e;
    }
  }
  if (gridStartMin === Infinity) { gridStartMin = 8 * 60; gridEndMin = 20 * 60; }
  gridStartMin = Math.floor(gridStartMin / 60) * 60;
  gridEndMin   = Math.ceil(gridEndMin   / 60) * 60;

  const visualSlots: number[] = [];
  for (let t = gridStartMin; t < gridEndMin; t += GRID_BASE_INTERVAL) visualSlots.push(t);

  const clickSlots: number[] = [];
  for (let t = gridStartMin; t < gridEndMin; t += CLICK_INTERVAL) clickSlots.push(t);

  const totalHeightPx = visualSlots.length * ROW_HEIGHT;
  const clickSlotHeight = (CLICK_INTERVAL / GRID_BASE_INTERVAL) * ROW_HEIGHT;

  const appointmentsByProf = new Map<string, AppointmentWithDetails[]>();
  for (const apt of appointments) {
    const list = appointmentsByProf.get(apt.professionalId) ?? [];
    list.push(apt);
    appointmentsByProf.set(apt.professionalId, list);
  }

  return (
    <div className="border border-zinc-300 dark:border-zinc-600 bg-card rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: TIME_COL_WIDTH + professionals.length * 200 }}>

          {/* Header */}
          <div
            className="flex bg-muted/30 border-b-2 border-zinc-300 dark:border-zinc-600"
            style={{ paddingLeft: TIME_COL_WIDTH }}
          >
            {professionals.map((prof) => {
              const name = formatDisplayName(prof.user.profile, "Sin perfil", prof.user.role);
              return (
                <div
                  key={prof.id}
                  className="flex-1 min-w-[200px] border-r border-zinc-300 dark:border-zinc-600 px-3 py-2.5 flex flex-col gap-0.5"
                >
                  <p className="text-sm font-bold truncate leading-tight">{name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs truncate text-muted-foreground">{prof.speciality.name}</p>
                    {prof.onLeave && (
                      <Badge variant="secondary" className="text-[10px] py-0 h-4">
                        {LEAVE_TYPE_LABELS[prof.onLeave.type]}
                      </Badge>
                    )}
                  </div>
                  {!prof.onLeave && prof.availabilities.length > 0 && (
                    <p className="text-[10px] text-muted-foreground/60">
                      {prof.availabilities
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((a) => `${a.startTime}–${a.endTime}`)
                        .join("  ·  ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div className="flex" style={{ height: totalHeightPx }}>

            {/* Time column */}
            <div
              className="shrink-0 bg-background border-r-2 border-zinc-300 dark:border-zinc-600"
              style={{ width: TIME_COL_WIDTH }}
            >
              {visualSlots.map((slotMin) => {
                const isHour = slotMin % 60 === 0;
                const isHalf = slotMin % 30 === 0 && !isHour;
                return (
                  <div
                    key={slotMin}
                    className={cn(
                      "flex items-start justify-end pr-2 pt-1",
                      isHour ? "border-t-2 border-zinc-300 dark:border-zinc-600"
                        : isHalf ? "border-t border-zinc-300/70 dark:border-zinc-600/70"
                        : ""
                    )}
                    style={{ height: ROW_HEIGHT }}
                  >
                    {isHour && (
                      <span className="text-xs font-semibold text-muted-foreground tabular-nums leading-none">
                        {minutesToTime(slotMin)}
                      </span>
                    )}
                    {isHalf && (
                      <span className="text-[10px] text-muted-foreground/50 tabular-nums leading-none">
                        {minutesToTime(slotMin)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Professional columns */}
            {professionals.map((prof) => {
              const profAppointments = appointmentsByProf.get(prof.id) ?? [];

              // Separate regular vs overbooking appointments
              const regularApts = profAppointments
                .filter((a) => !a.isOverbooking)
                .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
              const overbookingApts = profAppointments.filter((a) => a.isOverbooking);

              // Find all consecutive pairs of regular appointments that touch or are
              // back-to-back (endTime of A === startTime of B). These boundaries are
              // where we show the overbooking trigger icon (when no OB exists yet) or
              // the overbooking strip (when an OB was already created there).
              type Boundary = {
                atMin: number;         // minute where the boundary sits
                startISO: string;      // startDateTime ISO of the OB slot (= endTime of apt A)
                endISO: string;        // endDateTime ISO of the OB slot (= startTime of apt B)
                existingOb?: AppointmentWithDetails; // OB already created at this boundary
              };

              const boundaries: Boundary[] = [];
              for (let i = 0; i < regularApts.length - 1; i++) {
                const a = regularApts[i];
                const b = regularApts[i + 1];
                const aEnd   = aptMinutes(a).end;
                const bStart = aptMinutes(b).start;

                // Only show between back-to-back or very-close (≤5 min gap) appointments
                if (bStart - aEnd > 5) continue;

                // Check if an overbooking already exists at this exact boundary
                // (its startDateTime matches the end of apt A)
                const existingOb = overbookingApts.find((ob) => {
                  const obStart = aptMinutes(ob).start;
                  return obStart === aEnd;
                });

                boundaries.push({
                  atMin: aEnd,
                  startISO: new Date(a.endDateTime).toISOString(),
                  endISO:   new Date(b.startDateTime).toISOString(),
                  existingOb,
                });
              }

              const profName = formatDisplayName(prof.user.profile, "Profesional", prof.user.role);

              return (
                <div
                  key={prof.id}
                  className="group relative flex-1 min-w-[200px] border-r border-zinc-300 dark:border-zinc-600"
                >
                  {/* Visual grid lines */}
                  {visualSlots.map((slotMin) => {
                    const isHour = slotMin % 60 === 0;
                    const isHalf = slotMin % 30 === 0 && !isHour;
                    const withinAvail = isWithinAvailability(slotMin, GRID_BASE_INTERVAL, prof.availabilities);
                    return (
                      <div
                        key={slotMin}
                        className={cn(
                          "absolute w-full pointer-events-none",
                          isHour ? "border-t-2 border-zinc-300 dark:border-zinc-600"
                            : isHalf ? "border-t border-zinc-300/70 dark:border-zinc-600/70"
                            : "",
                          prof.onLeave || !withinAvail ? "bg-zinc-200 dark:bg-zinc-700" : ""
                        )}
                        style={{
                          top: ((slotMin - gridStartMin) / GRID_BASE_INTERVAL) * ROW_HEIGHT,
                          height: ROW_HEIGHT,
                        }}
                      />
                    );
                  })}

                  {/* 30-min clickable zones (regular appointments) */}
                  {clickSlots.map((slotMin) => {
                    const available =
                      !prof.onLeave &&
                      isWithinAvailability(slotMin, CLICK_INTERVAL, prof.availabilities);
                    const topPx = ((slotMin - gridStartMin) / GRID_BASE_INTERVAL) * ROW_HEIGHT;
                    return (
                      <div
                        key={slotMin}
                        className={cn(
                          "absolute w-full group",
                          available ? "cursor-pointer hover:bg-primary/8 transition-colors" : "cursor-default"
                        )}
                        style={{ top: topPx, height: clickSlotHeight }}
                        onClick={() => {
                          if (!available) return;
                          onSlotClick({
                            professionalId: prof.id,
                            startDateTime: dateTimeForSlot(date, slotMin),
                            endDateTime: dateTimeForSlot(date, slotMin + prof.slotDuration),
                            professionalName: profName,
                          });
                        }}
                      >
                        {available && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-primary/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
                            + {minutesToTime(slotMin)}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Regular appointment bricks */}
                  {regularApts.map((apt) => {
                    const { start: s, end: e } = aptMinutes(apt);
                    const topPx    = ((s - gridStartMin) / GRID_BASE_INTERVAL) * ROW_HEIGHT;
                    const heightPx = ((e - s)            / GRID_BASE_INTERVAL) * ROW_HEIGHT;
                    return (
                      <AppointmentBrick
                        key={apt.id}
                        appointment={apt}
                        onClick={() => onAppointmentClick(apt)}
                        style={{ top: `${topPx + 1}px`, height: `${heightPx - 2}px` }}
                      />
                    );
                  })}

                  {/* ── Boundary markers between back-to-back appointments ── */}
                  {boundaries.map((boundary) => {
                    const topPx = ((boundary.atMin - gridStartMin) / GRID_BASE_INTERVAL) * ROW_HEIGHT;

                    if (boundary.existingOb) {
                      // ── Overbooking indicator: small icon on the boundary line ──
                      return (
                        <button
                          key={`ob-strip-${boundary.atMin}`}
                          type="button"
                          title="Sobreturno — clic para ver detalle"
                          onClick={() => onAppointmentClick(boundary.existingOb!)}
                          className="absolute z-30 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                          style={{ top: topPx - OB_TRIGGER_HALF, height: OB_TRIGGER_HALF * 2, right: 4, width: 20 }}
                        >
                          <CalendarPlus className="size-4 text-green-600 dark:text-green-400" />
                        </button>
                      );
                    }

                    if (!canOverbooking) return null;

                    // ── Trigger button: CalendarPlus icon centered on the boundary line ──
                    return (
                      <button
                        key={`ob-trigger-${boundary.atMin}`}
                        type="button"
                        title={`Agregar sobreturno en ${minutesToTime(boundary.atMin)}`}
                        onClick={() =>
                          onSlotClick({
                            professionalId: prof.id,
                            startDateTime: boundary.startISO,
                            endDateTime:   boundary.endISO,
                            professionalName: profName,
                            isOverbooking: true,
                          })
                        }
                        className={cn(
                          "absolute z-30 flex items-center justify-center",
                          "transition-opacity cursor-pointer",
                          "opacity-0 group-hover:opacity-100 hover:opacity-70",
                        )}
                        style={{
                          top: topPx - OB_TRIGGER_HALF,
                          height: OB_TRIGGER_HALF * 2,
                          right: 4,
                          width: 20,
                        }}
                      >
                        <CalendarPlus className="size-4 text-amber-500 dark:text-amber-400" />
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
