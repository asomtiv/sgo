import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/user";
import { getAgendaData, getMonthlyAppointmentCounts } from "@/services/appointment";
import { todayInArgentina } from "@/lib/timezone";
import { prisma } from "@/lib/prisma";
import { AgendaView } from "./agenda-view";
import type { MonthlyData } from "@/types";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  let professionalFilter: string | undefined;
  if (currentUser.role === "Profesional") {
    const prof = await prisma.professional.findUnique({
      where: { userId: currentUser.id },
      select: { id: true },
    });
    if (!prof) {
      redirect("/dashboard");
    }
    professionalFilter = prof.id;
  }

  const selectedDate = date ?? todayInArgentina();
  const month = selectedDate.slice(0, 7);

  const [agendaData, monthlyCounts] = await Promise.all([
    getAgendaData(selectedDate, professionalFilter),
    getMonthlyAppointmentCounts(month, professionalFilter),
  ]);

  const monthlyData: MonthlyData = { counts: monthlyCounts, month };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Agenda</h1>
        <p className="text-muted-foreground">Gestión de citas y turnos</p>
      </div>
      <AgendaView
        data={agendaData}
        selectedDate={selectedDate}
        currentUserRole={currentUser.role}
        monthlyData={monthlyData}
        professionalId={professionalFilter}
      />
    </div>
  );
}
