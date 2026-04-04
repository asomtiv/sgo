"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Returns a 0–100 fill percentage and a color class based on appointment count
function getHeatmap(count: number): { pct: number; color: string } {
  if (count === 0) return { pct: 0, color: "" };
  if (count <= 3)
    return {
      pct: Math.round((count / 3) * 40 + 10), // 10–50%
      color: "bg-teal-500 dark:bg-teal-400",
    };
  if (count <= 7)
    return {
      pct: Math.round(((count - 3) / 4) * 30 + 50), // 50–80%
      color: "bg-amber-500 dark:bg-amber-400",
    };
  return { pct: Math.min(80 + (count - 8) * 3, 100), color: "bg-red-500" };
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
  const { pct, color } = getHeatmap(count);
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
        // Today: blue transparent overlay (on top of weekend tint)
        isInMonth && isToday && "bg-blue-500/10 dark:bg-blue-400/10",
        // Out-of-month: hatching
        !isInMonth && [
          "bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,rgb(0_0_0/0.05)_5px,rgb(0_0_0/0.05)_6px)]",
          "dark:bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,rgb(255_255_255/0.04)_5px,rgb(255_255_255/0.04)_6px)]",
        ]
      )}
    >
      {/* Cell content */}
      <div className="flex flex-col flex-1 p-2 gap-1.5">
        {/* Top row: day number + count badge */}
        <div className="flex items-center justify-between gap-1">
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

          {/* Appointment count badge */}
          {isInMonth && count > 0 && (
            <span
              className={cn(
                "text-[11px] font-bold leading-none px-1.5 py-0.5 shrink-0",
                count <= 3 &&
                  "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200",
                count > 3 &&
                  count <= 7 &&
                  "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
                count > 7 &&
                  "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
              )}
            >
              {count}
            </span>
          )}
        </div>

      </div>

      {/* Heatmap bar — flush to the bottom */}
      {isInMonth && (
        <div className="h-1.5 w-full bg-border/40 overflow-hidden shrink-0">
          {pct > 0 && (
            <div
              className={cn("h-full transition-all duration-500", color)}
              style={{ width: `${pct}%` }}
            />
          )}
        </div>
      )}
    </div>
  );
}
