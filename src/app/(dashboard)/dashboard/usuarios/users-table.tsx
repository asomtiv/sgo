"use client";

import { useState } from "react";
import { toast } from "sonner";
import { toggleUserActive } from "@/services/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPen, ShieldCheck, Power } from "lucide-react";
import { EditRoleDialog, EditProfileDialog } from "./user-dialogs";
import type { UserWithProfile } from "@/types";
import type { Role } from "@/generated/prisma/client";

const roleBadgeVariant: Record<Role, "destructive" | "default" | "secondary"> = {
  Admin: "destructive",
  Profesional: "default",
  Recepcion: "secondary",
};

const roleLabel: Record<Role, string> = {
  Admin: "Admin",
  Profesional: "Profesional",
  Recepcion: "Recepción",
};

export function UsersTable({ users }: { users: UserWithProfile[] }) {
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  async function handleToggleActive(user: UserWithProfile) {
    const action = user.isActive ? "desactivar" : "activar";
    if (!confirm(`¿Estás seguro de ${action} a ${user.profile?.firstName} ${user.profile?.lastName}?`)) {
      return;
    }

    const result = await toggleUserActive(user.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        result.isActive
          ? "Usuario activado exitosamente"
          : "Usuario desactivado exitosamente"
      );
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.profile
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : "Sin perfil"}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={roleBadgeVariant[user.role]}>
                  {roleLabel[user.role]}
                </Badge>
              </TableCell>
              <TableCell>
                {user.isActive ? (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Inactivo
                  </span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        setSelectedUser(user);
                        setEditProfileOpen(true);
                      }}
                    >
                      <UserPen className="size-4 mr-2" />
                      Editar Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setSelectedUser(user);
                        setEditRoleOpen(true);
                      }}
                    >
                      <ShieldCheck className="size-4 mr-2" />
                      Editar Rol
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleToggleActive(user)}
                    >
                      <Power className="size-4 mr-2" />
                      {user.isActive ? "Desactivar" : "Activar"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditRoleDialog
        user={selectedUser}
        open={editRoleOpen}
        onOpenChange={setEditRoleOpen}
      />
      <EditProfileDialog
        user={selectedUser}
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      />
    </>
  );
}
