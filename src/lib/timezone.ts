const TZ = "America/Argentina/Buenos_Aires";

export function toArgentinaTime(date: Date): string {
  return date.toLocaleString("sv-SE", { timeZone: TZ });
}

export function extractTime(date: Date): string {
  const argentina = toArgentinaTime(date);
  // sv-SE format: "2025-03-15 09:30:00"
  return argentina.split(" ")[1].slice(0, 5); // "09:30"
}

export function extractDayOfWeek(date: Date): number {
  const argentina = toArgentinaTime(date);
  const dateStr = argentina.split(" ")[0]; // "2025-03-15"
  return new Date(dateStr + "T12:00:00").getDay();
}

export function todayInArgentina(): string {
  return toArgentinaTime(new Date()).split(" ")[0]; // "YYYY-MM-DD"
}

export function dayStartEnd(dateStr: string): { start: Date; end: Date } {
  const start = new Date(`${dateStr}T00:00:00-03:00`);
  const end = new Date(`${dateStr}T23:59:59.999-03:00`);
  return { start, end };
}
