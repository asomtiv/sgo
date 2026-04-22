"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Returns a 0–100 fill percentage and a bar color based on appointment count.
// Scale: 1 turno ≈ 10%, lineal, tope en 100% a los 10+ turnos.
// Color: teal ≤ 4, amber ≤ 7, rojo ≥ 8.
function getHeatmap(count: number): { pct: number; barColor: string } {
  if (count === 0) return { pct: 0, barColor: "" };
  const pct = Math.min(count * 10, 100);
  const barColor = count <= 4 ? "#14b8a6" : count <= 7 ? "#f59e0b" : "#ef4444";
  return { pct, barColor };
}

interface MonthlyDayCellProps {
  date: Date;
  dateStr: string;
  count: number;
  isInMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  isWeekend: boolean;
  onSelect: () => void;
  onPrefetch: () => void;
}

export function MonthlyDayCell({
  date,
  count,
  isInMonth,
  isSelected,
  isToday,
  isWeekend,
  onSelect,
  onPrefetch,
}: MonthlyDayCellProps) {
  const { pct, barColor } = getHeatmap(count);
  const dayNum = format(date, "d");

  return (
    <div
      role="button"
      tabIndex={isInMonth ? 0 : -1}
      onClick={isInMonth ? onSelect : undefined}
      onMouseEnter={isInMonth ? onPrefetch : undefined}
      onKeyDown={(e) => isInMonth && e.key === "Enter" && onSelect()}
      className={cn(
        "group relative flex flex-col min-h-[80px] border-r border-b border-border select-none outline-none",
        isInMonth
          ? "cursor-pointer transition-colors duration-100 hover:bg-muted/40"
          : "cursor-default",
        // Weekend tint (applies to all weekend cells)
        isWeekend && "bg-zinc-100 dark:bg-zinc-800/60",
        // Selected: bold black outline
        isInMonth && isSelected && "ring-2 ring-inset ring-black dark:ring-white z-10",
        // Today: no overlay (day number circle is sufficient indicator)
        // Out-of-month: hatching
        !isInMonth && [
          "bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,rgb(0_0_0/0.05)_5px,rgb(0_0_0/0.05)_6px)]",
          "dark:bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,rgb(255_255_255/0.04)_5px,rgb(255_255_255/0.04)_6px)]",
        ]
      )}
    >
      {/* Cell content */}
      <div className="flex flex-col flex-1 p-2 gap-1.5">
        {/* Day number — circle for today */}
        <div
          className={cn(
            "flex items-center justify-center w-6 h-6 text-xs font-semibold leading-none shrink-0",
            !isInMonth && "text-muted-foreground/25",
            isInMonth && !isToday && !isSelected && "text-foreground",
            isInMonth && isSelected && !isToday && "text-primary",
            isInMonth && isToday && "rounded-full bg-primary text-primary-foreground"
          )}
        >
          {dayNum}
        </div>

      </div>

      {/* Heatmap fill bar — bottom-anchored, proportional width */}
      {isInMonth && count > 0 && (
        <div
          aria-hidden
          className="absolute bottom-0 left-0 h-[3px]"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      )}
    </div>
  );
}
