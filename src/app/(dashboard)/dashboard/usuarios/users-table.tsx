"use client";

import { useState } from "react";
import { toast } from "sonner";
import { toggleUserActive, deleteUser } from "@/services/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MoreHorizontal, UserPen, ShieldCheck, Power, Trash2, KeyRound } from "lucide-react";
import { EditRoleDialog, EditProfileDialog, ResetPasswordDialog } from "./user-dialogs";
import { formatDisplayName } from "@/lib/format";
import type { UserWithProfile } from "@/types";
import type { Role } from "@/generated/prisma/client";

const roleBadgeVariant: Record<Role, "destructive" | "default" | "secondary"> =
  {
    Admin: "destructive",
    Profesional: "default",
    Recepcion: "secondary",
  };

const roleLabel: Record<Role, string> = {
  Admin: "Admin",
  Profesional: "Profesional",
  Recepcion: "Recepción",
};

export function UsersTable({
  title,
  users,
}: {
  title: string;
  users: UserWithProfile[];
}) {
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(
    null
  );
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<UserWithProfile | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUser_, setDeleteUser_] = useState<UserWithProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openDelete(user: UserWithProfile) {
    setDeleteUser_(user);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteUser_) return;
    setDeleting(true);
    const result = await deleteUser(deleteUser_.id);
    setDeleting(false);
    setDeleteOpen(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Usuario eliminado exitosamente");
    }
  }

  function openConfirm(user: UserWithProfile) {
    setConfirmUser(user);
    setConfirmOpen(true);
  }

  async function handleConfirmToggle() {
    if (!confirmUser) return;
    setToggling(true);
    const result = await toggleUserActive(confirmUser.id);
    setToggling(false);
    setConfirmOpen(false);
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
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <Badge variant="outline">{users.length}</Badge>
      </div>
      <Card>
      <CardContent className="px-0 py-0">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No hay usuarios en este rol.
          </p>
        ) : (
          <>
            <Table className="table-fixed">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[24%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {formatDisplayName(user.profile, "Sin perfil", user.role)}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.profile?.phone ?? "—"}
                    </TableCell>
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
                            closeOnClick
                            onClick={() => {
                              setSelectedUser(user);
                              setEditProfileOpen(true);
                            }}
                          >
                            <UserPen className="size-4 mr-2" />
                            Editar Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            closeOnClick
                            onClick={() => {
                              setSelectedUser(user);
                              setEditRoleOpen(true);
                            }}
                          >
                            <ShieldCheck className="size-4 mr-2" />
                            Editar Rol
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            closeOnClick
                            onClick={() => {
                              setSelectedUser(user);
                              setResetPasswordOpen(true);
                            }}
                          >
                            <KeyRound className="size-4 mr-2" />
                            Restablecer Contraseña
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            closeOnClick
                            onClick={() => openConfirm(user)}
                          >
                            <Power className="size-4 mr-2" />
                            {user.isActive ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            closeOnClick
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDelete(user)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Confirm toggle dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>
                    {confirmUser?.isActive
                      ? "Desactivar usuario"
                      : "Activar usuario"}
                  </DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de{" "}
                    {confirmUser?.isActive ? "desactivar" : "activar"} a{" "}
                    <span className="font-medium text-foreground">
                      {confirmUser ? formatDisplayName(confirmUser.profile, confirmUser.email, confirmUser.role) : ""}
                    </span>
                    ?{" "}
                    {confirmUser?.isActive
                      ? "El usuario no podrá iniciar sesión."
                      : "El usuario podrá volver a iniciar sesión."}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmOpen(false)}
                    disabled={toggling}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant={confirmUser?.isActive ? "destructive" : "default"}
                    onClick={handleConfirmToggle}
                    disabled={toggling}
                  >
                    {toggling
                      ? "Procesando..."
                      : confirmUser?.isActive
                      ? "Desactivar"
                      : "Activar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Confirm delete dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Eliminar usuario</DialogTitle>
                  <DialogDescription>
                    ¿Estás seguro de eliminar a{" "}
                    <span className="font-medium text-foreground">
                      {deleteUser_ ? formatDisplayName(deleteUser_.profile, deleteUser_.email, deleteUser_.role) : ""}
                    </span>
                    ? Esta acción es permanente y no se puede deshacer.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteOpen(false)}
                    disabled={deleting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Eliminando..." : "Eliminar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <EditRoleDialog
              key={`role-${selectedUser?.id}`}
              user={selectedUser}
              open={editRoleOpen}
              onOpenChange={setEditRoleOpen}
            />
            <EditProfileDialog
              key={`profile-${selectedUser?.id}`}
              user={selectedUser}
              open={editProfileOpen}
              onOpenChange={setEditProfileOpen}
            />
            <ResetPasswordDialog
              key={`reset-${selectedUser?.id}`}
              user={selectedUser}
              open={resetPasswordOpen}
              onOpenChange={setResetPasswordOpen}
            />
          </>
        )}
      </CardContent>
      </Card>
    </div>
  );
}
