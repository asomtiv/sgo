import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

export function AgendaDateNav({ selectedDate }: { selectedDate: string }) {
  const dateObj = parse(selectedDate, "yyyy-MM-dd", new Date());

  const displayDate = format(dateObj, "EEEE d 'de' MMMM, yyyy", {
    locale: es,
  });

  return (
    <div className="flex justify-center">
      <span className="text-2xl font-semibold capitalize">{displayDate}</span>
    </div>
  );
}
