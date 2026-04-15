"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parse,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MonthlyDayCell } from "./monthly-day-cell";
import type { MonthlyAppointmentCounts } from "@/types";

interface MonthlyCalendarProps {
  month: string; // "YYYY-MM"
  counts: MonthlyAppointmentCounts;
  selectedDate: string; // "YYYY-MM-DD"
  onDaySelect: (date: string) => void;
  onPrefetch: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

// Lun–Vie = 0–4, Sáb–Dom = 5–6 (weekStartsOn: 1 → Mon is index 0)
const DAY_HEADERS = [
  { label: "Lun", weekend: false },
  { label: "Mar", weekend: false },
  { label: "Mié", weekend: false },
  { label: "Jue", weekend: false },
  { label: "Vie", weekend: false },
  { label: "Sáb", weekend: true },
  { label: "Dom", weekend: true },
];

// Map JS getDay() (0=Sun) to grid column index with weekStartsOn: 1
// Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
function columnIndex(day: Date): number {
  const d = getDay(day); // 0=Sun, 1=Mon, ..., 6=Sat
  return d === 0 ? 6 : d - 1;
}

export function MonthlyCalendar({
  month,
  counts,
  selectedDate,
  onDaySelect,
  onPrefetch,
  onPrevMonth,
  onNextMonth,
}: MonthlyCalendarProps) {
  const { days, anchor, monthLabel, totalAppointments } = useMemo(() => {
    const anchor = parse(month + "-01", "yyyy-MM-dd", new Date());
    const gridStart = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const monthLabel = format(anchor, "MMMM yyyy", { locale: es });
    const totalAppointments = Object.values(counts).reduce((a, b) => a + b, 0);
    return { days, anchor, monthLabel, totalAppointments };
  }, [month, counts]);

  return (
    <div className="border border-border bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Button variant="outline" size="icon-sm" onClick={onPrevMonth}>
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-xl font-semibold capitalize">{monthLabel}</h2>
        <Button variant="outline" size="icon-sm" onClick={onNextMonth}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* ── Day-of-week header row ── */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_HEADERS.map(({ label, weekend }) => (
          <div
            key={label}
            className={cn(
              "py-2 text-center text-[11px] font-semibold uppercase tracking-wider",
              weekend
                ? "text-muted-foreground/50 bg-muted/20"
                : "text-muted-foreground"
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── Day cells grid ── */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const col = columnIndex(day);
          const isWeekend = col >= 5;
          const inMonth = isSameMonth(day, anchor);

          return (
            <MonthlyDayCell
              key={dateStr}
              date={day}
              dateStr={dateStr}
              count={counts[dateStr] ?? 0}
              isInMonth={inMonth}
              isSelected={dateStr === selectedDate}
              isToday={isToday(day)}
              isWeekend={isWeekend}
              onSelect={() => onDaySelect(dateStr)}
              onPrefetch={() => onPrefetch(dateStr)}
            />
          );
        })}
      </div>
    </div>
  );
}
