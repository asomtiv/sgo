import { redirect } from "next/navigation";
import { getCurrentUser, getAllUsers } from "@/services/user";
import { CreateUserDialog } from "./user-dialogs";
import { UsersTable } from "./users-table";
import { Users } from "lucide-react";

export default async function UsuariosPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "Admin") {
    redirect("/dashboard");
  }

  const users = await getAllUsers();

  const admins = users.filter((u) => u.role === "Admin");
  const profesionales = users.filter((u) => u.role === "Profesional");
  const recepcion = users.filter((u) => u.role === "Recepcion");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administración de usuarios y roles del sistema
          </p>
        </div>
        <CreateUserDialog />
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="size-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No hay usuarios</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Crea el primer usuario para comenzar.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <UsersTable title="Administradores" users={admins} />
          <UsersTable title="Profesionales" users={profesionales} />
          <UsersTable title="Recepción" users={recepcion} />
        </div>
      )}
    </div>
  );
}
