"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
        isWeekend && "bg-zinc-100 dark:bg-zinc-800/60",
        isInMonth && isSelected && "ring-2 ring-inset ring-black dark:ring-white z-10",
        !isInMonth && [
          "bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,rgb(0_0_0/0.05)_5px,rgb(0_0_0/0.05)_6px)]",
          "dark:bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,rgb(255_255_255/0.04)_5px,rgb(255_255_255/0.04)_6px)]",
        ]
      )}
    >
      <div className="flex flex-col flex-1 p-2">
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

      {/* Appointment count — pinned to bottom */}
      {isInMonth && count > 0 && (
        <span className="absolute bottom-1.5 left-2 text-[10px] text-muted-foreground leading-none">
          {count} turno{count !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
