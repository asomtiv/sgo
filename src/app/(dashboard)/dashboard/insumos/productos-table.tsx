"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleProductoActive, deleteProducto } from "@/services/insumo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Power,
  ArrowRightLeft,
  Trash2,
} from "lucide-react";
import {
  CATEGORIA_PRODUCTO_LABELS,
  UNIDAD_MEDIDA_LABELS,
} from "@/lib/constants";
import { EditProductoDialog } from "./producto-dialogs";
import type { ProductoWithStock } from "@/types";

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
        Sin stock
      </span>
    );
  }
  if (stock <= minStock) {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
        {stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
      {stock}
    </span>
  );
}

type ConfirmAction = "toggle" | "delete";

export function ProductosTable({
  productos,
  isAdmin,
}: {
  productos: ProductoWithStock[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const [selectedProducto, setSelectedProducto] =
    useState<ProductoWithStock | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProducto, setConfirmProducto] =
    useState<ProductoWithStock | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>("toggle");
  const [loading, setLoading] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    router.push(`/dashboard/insumos?${params.toString()}`);
  }

  function openConfirm(p: ProductoWithStock, action: ConfirmAction) {
    setConfirmProducto(p);
    setConfirmAction(action);
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!confirmProducto) return;
    setLoading(true);

    const result =
      confirmAction === "delete"
        ? await deleteProducto(confirmProducto.id)
        : await toggleProductoActive(
            confirmProducto.id,
            !confirmProducto.isActive
          );

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      if (confirmAction === "delete") {
        toast.success("Producto eliminado");
      } else {
        toast.success(
          confirmProducto.isActive ? "Producto desactivado" : "Producto activado"
        );
      }
    }

    setConfirmOpen(false);
    setConfirmProducto(null);
  }

  const confirmTitle =
    confirmAction === "delete"
      ? "Eliminar Producto"
      : confirmProducto?.isActive
        ? "Desactivar Producto"
        : "Activar Producto";

  const confirmDescription =
    confirmAction === "delete"
      ? `¿Estás seguro de eliminar "${confirmProducto?.name}"? Se eliminarán también todos sus movimientos de stock. Esta acción no se puede deshacer.`
      : confirmProducto?.isActive
        ? `¿Estás seguro de desactivar "${confirmProducto?.name}"? No se podrán registrar movimientos mientras esté inactivo.`
        : `¿Querés reactivar "${confirmProducto?.name}"?`;

  const confirmButtonLabel = loading
    ? "Procesando..."
    : confirmAction === "delete"
      ? "Eliminar"
      : confirmProducto?.isActive
        ? "Desactivar"
        : "Activar";

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-10" />
          </colgroup>
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Nombre</th>
              <th className="px-3 py-2 text-left font-medium">Categoría</th>
              <th className="px-3 py-2 text-left font-medium">Unidad</th>
              <th className="px-3 py-2 text-left font-medium">Stock</th>
              <th className="px-3 py-2 text-left font-medium">Stock Mín.</th>
              <th className="px-3 py-2 text-left font-medium">Estado</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-3 py-2 truncate" title={p.name}>
                  {p.name}
                  {p.description && (
                    <span className="block text-xs text-muted-foreground truncate">
                      {p.description}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {CATEGORIA_PRODUCTO_LABELS[p.category]}
                </td>
                <td className="px-3 py-2">{UNIDAD_MEDIDA_LABELS[p.unit]}</td>
                <td className="px-3 py-2">
                  <StockBadge stock={p.currentStock} minStock={p.minStock} />
                </td>
                <td className="px-3 py-2">{p.minStock}</td>
                <td className="px-3 py-2">
                  {p.isActive ? (
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button className="rounded p-1 hover:bg-muted">
                          <MoreHorizontal className="size-4" />
                        </button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        closeOnClick
                        onClick={() => {
                          setSelectedProducto(p);
                          setEditOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 size-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        closeOnClick
                        onClick={() =>
                          router.push(
                            `/dashboard/insumos?tab=movimientos&productoId=${p.id}`
                          )
                        }
                      >
                        <ArrowRightLeft className="mr-2 size-4" />
                        Ver Movimientos
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        closeOnClick
                        onClick={() => openConfirm(p, "toggle")}
                      >
                        <Power className="mr-2 size-4" />
                        {p.isActive ? "Desactivar" : "Activar"}
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem
                          closeOnClick
                          className="text-destructive focus:text-destructive"
                          onClick={() => openConfirm(p, "delete")}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog (toggle active / delete) */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={
                confirmAction === "delete" ||
                (confirmAction === "toggle" && confirmProducto?.isActive)
                  ? "destructive"
                  : "default"
              }
              onClick={handleConfirm}
              disabled={loading}
            >
              {confirmButtonLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditProductoDialog
        key={selectedProducto?.id}
        producto={selectedProducto}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
