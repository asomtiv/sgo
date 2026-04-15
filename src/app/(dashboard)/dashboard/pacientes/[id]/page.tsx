import { notFound } from "next/navigation";
import { getPatientFicha } from "@/services/historia-clinica";
import { getCurrentUser } from "@/services/user";
import { PatientFicha } from "./patient-ficha";

export default async function PatientFichaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, currentUser] = await Promise.all([
    getPatientFicha(id),
    getCurrentUser(),
  ]);
  if (!data) notFound();

  const canEditHistoria = currentUser?.role !== "Recepcion";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ficha del Paciente</h1>
        <p className="text-muted-foreground">
          {data.firstName} {data.lastName} — DNI {data.dni}
        </p>
      </div>
      <PatientFicha data={data} canEditHistoria={canEditHistoria} />
    </div>
  );
}
