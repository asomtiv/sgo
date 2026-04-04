import { getAllPatients } from "@/services/patient";
import { getAllProvincias, getAllObrasSociales, getAllNacionalidades } from "@/services/data";
import { CreatePatientDialog } from "./patient-dialogs";
import { PatientsTable } from "./patients-table";
import { Users } from "lucide-react";

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const [patients, provincias, obrasSociales, nacionalidades] = await Promise.all([
    getAllPatients(search),
    getAllProvincias(),
    getAllObrasSociales(),
    getAllNacionalidades(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">
            Gestión de pacientes de la clínica
          </p>
        </div>
        <CreatePatientDialog provincias={provincias} obrasSociales={obrasSociales} nacionalidades={nacionalidades} />
      </div>

      {patients.length === 0 && !search ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No hay pacientes</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Crea el primer paciente para comenzar.
          </p>
        </div>
      ) : (
        <PatientsTable patients={patients} provincias={provincias} obrasSociales={obrasSociales} nacionalidades={nacionalidades} />
      )}
    </div>
  );
}
