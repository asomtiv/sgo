"use client";

import React from "react";
import { GRID_BASE_INTERVAL, LEAVE_TYPE_LABELS } from "@/lib/constants";
import { formatDisplayName } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppointmentBrick } from "./appointment-brick";
import type {
  AgendaProfessional,
  AppointmentWithDetails,
  AvailabilityBlock,
} from "@/types";

type SlotClick = {
  professionalId: string;
  startDateTime: string;
  endDateTime: string;
  professionalName: string;
};

// Visual grid uses 15-min intervals for precise appointment rendering.
// Click slots are 30-min blocks — the minimum bookable unit shown to receptionists.
const CLICK_INTERVAL = 30; // minutes per clickable slot
const ROW_HEIGHT = 30;     // px per 15-min visual row (= 60px per 30-min slot)
const TIME_COL_WIDTH = 72; // px

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
  // The whole click slot must fall within an availability block
  return availabilities.some(
    (a) =>
      timeMinutes >= timeToMinutes(a.startTime) &&
      timeMinutes + durationMin <= timeToMinutes(a.endTime)
  );
}

function dateTimeForSlot(date: string, timeMinutes: number): string {
  return `${date}T${minutesToTime(timeMinutes)}:00-03:00`;
}

export function AgendaGrid({
  professionals,
  appointments,
  date,
  onSlotClick,
  onAppointmentClick,
}: {
  professionals: AgendaProfessional[];
  appointments: AppointmentWithDetails[];
  date: string;
  onSlotClick: (slot: SlotClick) => void;
  onAppointmentClick: (appointment: AppointmentWithDetails) => void;
}) {
  // Calculate grid time range aligned to full-hour boundaries
  let gridStartMin = Infinity;
  let gridEndMin = -Infinity;

  for (const prof of professionals) {
    for (const a of prof.availabilities) {
      const start = timeToMinutes(a.startTime);
      const end = timeToMinutes(a.endTime);
      if (start < gridStartMin) gridStartMin = start;
      if (end > gridEndMin) gridEndMin = end;
    }
  }

  if (gridStartMin === Infinity) {
    gridStartMin = 8 * 60;
    gridEndMin = 20 * 60;
  }

  gridStartMin = Math.floor(gridStartMin / 60) * 60;
  gridEndMin = Math.ceil(gridEndMin / 60) * 60;

  // 15-min visual rows
  const visualSlots: number[] = [];
  for (let t = gridStartMin; t < gridEndMin; t += GRID_BASE_INTERVAL) {
    visualSlots.push(t);
  }

  // 30-min clickable slots
  const clickSlots: number[] = [];
  for (let t = gridStartMin; t < gridEndMin; t += CLICK_INTERVAL) {
    clickSlots.push(t);
  }

  const totalVisualRows = visualSlots.length;
  const totalHeightPx = totalVisualRows * ROW_HEIGHT;

  // Map appointments by professional
  const appointmentsByProf = new Map<string, AppointmentWithDetails[]>();
  for (const apt of appointments) {
    const list = appointmentsByProf.get(apt.professionalId) ?? [];
    list.push(apt);
    appointmentsByProf.set(apt.professionalId, list);
  }

  // Height per 30-min click slot (= 2 visual rows)
  const clickSlotHeight = (CLICK_INTERVAL / GRID_BASE_INTERVAL) * ROW_HEIGHT;

  return (
    <div className="border border-zinc-300 dark:border-zinc-600 bg-background rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        {/* ── Fixed header + scrollable body together so they scroll horizontally in sync ── */}
        <div style={{ minWidth: TIME_COL_WIDTH + professionals.length * 200 }}>

          {/* Header row */}
          <div
            className="flex bg-muted/30 border-b-2 border-zinc-300 dark:border-zinc-600"
            style={{ paddingLeft: TIME_COL_WIDTH }}
          >
            {professionals.map((prof) => {
              const name = formatDisplayName(
                prof.user.profile,
                "Sin perfil",
                prof.user.role
              );
              return (
                <div
                  key={prof.id}
                  className="flex-1 min-w-[200px] border-r border-zinc-300 dark:border-zinc-600 px-3 py-2.5 flex flex-col gap-0.5"
                >
                  <p className="text-sm font-semibold truncate leading-tight">
                    {name}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs text-muted-foreground truncate">
                      {prof.speciality.name}
                    </p>
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

          {/* Body: time column + professional columns */}
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
                      isHour
                        ? "border-t-2 border-zinc-300 dark:border-zinc-600"
                        : isHalf
                          ? "border-t border-zinc-300/70 dark:border-zinc-600/70"
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

              return (
                <div
                  key={prof.id}
                  className="relative flex-1 min-w-[200px] border-r border-zinc-300 dark:border-zinc-600"
                >
                  {/* ── Visual grid lines (15-min rows) ── */}
                  {visualSlots.map((slotMin) => {
                    const isHour = slotMin % 60 === 0;
                    const isHalf = slotMin % 30 === 0 && !isHour;
                    const withinAvail = isWithinAvailability(slotMin, GRID_BASE_INTERVAL, prof.availabilities);
                    const unavailable = prof.onLeave || !withinAvail;
                    return (
                      <div
                        key={slotMin}
                        className={cn(
                          "absolute w-full pointer-events-none",
                          isHour
                            ? "border-t-2 border-zinc-300 dark:border-zinc-600"
                            : isHalf
                              ? "border-t border-zinc-300/70 dark:border-zinc-600/70"
                              : "",
                          prof.onLeave
                            ? "bg-zinc-200 dark:bg-zinc-700"
                            : !withinAvail
                              ? "bg-zinc-200 dark:bg-zinc-700"
                              : ""
                        )}
                        style={{
                          top: ((slotMin - gridStartMin) / GRID_BASE_INTERVAL) * ROW_HEIGHT,
                          height: ROW_HEIGHT,
                        }}
                      />
                    );
                  })}

                  {/* ── 30-min clickable zones (on top of grid lines) ── */}
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
                          available
                            ? "cursor-pointer hover:bg-primary/8 transition-colors"
                            : "cursor-default"
                        )}
                        style={{ top: topPx, height: clickSlotHeight }}
                        onClick={() => {
                          if (!available) return;
                          const profName = formatDisplayName(
                            prof.user.profile,
                            "Profesional",
                            prof.user.role
                          );
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

                  {/* ── Appointment bricks ── */}
                  {profAppointments.map((apt) => {
                    const aptStartMin = timeToMinutes(
                      new Date(apt.startDateTime).toLocaleString("sv-SE", {
                        timeZone: "America/Argentina/Buenos_Aires",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    );
                    const aptEndMin = timeToMinutes(
                      new Date(apt.endDateTime).toLocaleString("sv-SE", {
                        timeZone: "America/Argentina/Buenos_Aires",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    );

                    const topPx = ((aptStartMin - gridStartMin) / GRID_BASE_INTERVAL) * ROW_HEIGHT;
                    const heightPx = ((aptEndMin - aptStartMin) / GRID_BASE_INTERVAL) * ROW_HEIGHT;

                    return (
                      <AppointmentBrick
                        key={apt.id}
                        appointment={apt}
                        onClick={() => onAppointmentClick(apt)}
                        style={{
                          top: `${topPx + 1}px`,
                          height: `${heightPx - 2}px`,
                        }}
                      />
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
