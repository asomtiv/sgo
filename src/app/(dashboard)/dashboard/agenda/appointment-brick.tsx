"use client";

import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AppointmentWithDetails } from "@/types";

function formatTime(date: Date): string {
  return date.toLocaleString("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function AppointmentBrick({
  appointment,
  onClick,
  style,
}: {
  appointment: AppointmentWithDetails;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  const colors = APPOINTMENT_STATUS_COLORS[appointment.status];
  const startTime = formatTime(new Date(appointment.startDateTime));
  const endTime = formatTime(new Date(appointment.endDateTime));

  // Duration in minutes to decide how much info to show
  const durationMs =
    new Date(appointment.endDateTime).getTime() -
    new Date(appointment.startDateTime).getTime();
  const durationMin = durationMs / 60000;

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn(
        "absolute inset-x-1 border-l-4 shadow-sm text-left pl-2 pr-1 py-1 overflow-hidden cursor-pointer transition-all hover:brightness-95 hover:shadow-md z-10",
        colors.bg,
        colors.text,
        colors.border,
        "bg-opacity-90"
      )}
    >
      {/* Always show patient name */}
      <p className={cn("font-semibold leading-tight truncate", durationMin >= 30 ? "text-xs" : "text-[10px]")}>
        {appointment.patient.lastName}, {appointment.patient.firstName}
      </p>

      {/* Show time if tall enough */}
      {durationMin >= 20 && (
        <p className="text-[10px] opacity-80 leading-tight mt-0.5">
          {startTime} – {endTime}
        </p>
      )}

      {/* Show status badge if tall enough */}
      {durationMin >= 30 && (
        <p className={cn("text-[10px] font-medium mt-0.5 opacity-70")}>
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </p>
      )}
    </button>
  );
}
