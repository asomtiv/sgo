import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/user";
import { getAllProfessionals, getAvailableUsersForProfessional } from "@/services/professional";
import { getAllSpecialities } from "@/services/data";
import { CreateProfessionalDialog } from "./professional-dialogs";
import { ProfessionalsGrid } from "./professionals-grid";
import { Stethoscope } from "lucide-react";

export default async function ProfesionalesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || (currentUser.role !== "Admin" && currentUser.role !== "Recepcion")) {
    redirect("/dashboard");
  }

  const isAdmin = currentUser.role === "Admin";

  const [professionals, availableUsers, specialities] = await Promise.all([
    getAllProfessionals(),
    isAdmin ? getAvailableUsersForProfessional() : Promise.resolve([]),
    getAllSpecialities(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profesionales</h1>
          <p className="text-muted-foreground">
            Gestión de profesionales de la clínica
          </p>
        </div>
        {isAdmin && (
          <CreateProfessionalDialog
            availableUsers={availableUsers}
            specialities={specialities}
          />
        )}
      </div>

      {professionals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Stethoscope className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No hay profesionales</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Asigna un usuario con rol Profesional para comenzar.
          </p>
        </div>
      ) : (
        <ProfessionalsGrid
          professionals={professionals}
          specialities={specialities}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
