"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createProducto,
  updateProducto,
  findSimilarProductNames,
} from "@/services/insumo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, AlertTriangle } from "lucide-react";
import {
  CATEGORIA_PRODUCTO_LABELS,
  UNIDAD_MEDIDA_LABELS,
} from "@/lib/constants";
import type { ProductoWithStock } from "@/types";
import type { CategoriaProducto, UnidadMedida } from "@/generated/prisma/client";

// --- Fuzzy Warning Component ---

function FuzzyWarning({
  name,
  excludeId,
}: {
  name: string;
  excludeId?: string;
}) {
  const [similar, setSimilar] = useState<{ id: string; name: string }[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (name.trim().length < 2) {
      setSimilar([]);
      return;
    }

    const timeout = setTimeout(() => {
      startTransition(async () => {
        const results = await findSimilarProductNames(name, excludeId);
        setSimilar(results);
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [name, excludeId, startTransition]);

  if (similar.length === 0) return null;

  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div>
        <span className="font-medium">Productos similares encontrados: </span>
        {similar.map((s) => s.name).join(", ")}
        . Asegurate de que no sea un duplicado.
      </div>
    </div>
  );
}

// --- Create Product Dialog ---

export function CreateProductoDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createProducto, null);
  const [nameValue, setNameValue] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success("Producto creado exitosamente");
      setOpen(false);
      setNameValue("");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setNameValue("");
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus data-icon="inline-start" />
        Nuevo Producto
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear Producto</DialogTitle>
          <DialogDescription>
            Agregá un nuevo producto al catálogo de insumos.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-prod-name">Nombre</Label>
            <Input
              id="create-prod-name"
              name="name"
              placeholder="Resina Composita A2"
              required
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
            />
            <FuzzyWarning name={nameValue} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-prod-desc">Descripción</Label>
            <Textarea
              id="create-prod-desc"
              name="description"
              placeholder="Descripción opcional del producto"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select name="category" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {(value: unknown) =>
                      CATEGORIA_PRODUCTO_LABELS[
                        value as CategoriaProducto
                      ] ?? "Seleccionar..."
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIA_PRODUCTO_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidad de Medida</Label>
              <Select name="unit" required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {(value: unknown) =>
                      UNIDAD_MEDIDA_LABELS[value as UnidadMedida] ??
                      "Seleccionar..."
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIDAD_MEDIDA_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-prod-minStock">Stock Mínimo</Label>
            <Input
              id="create-prod-minStock"
              name="minStock"
              type="number"
              min={0}
              defaultValue={0}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Se mostrará una alerta cuando el stock esté por debajo de este
              valor.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creando..." : "Crear Producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Edit Product Dialog ---

export function EditProductoDialog({
  producto,
  open,
  onOpenChange,
}: {
  producto: ProductoWithStock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(updateProducto, null);
  const [nameValue, setNameValue] = useState(producto?.name ?? "");

  useEffect(() => {
    if (producto) setNameValue(producto.name);
  }, [producto]);

  useEffect(() => {
    if (state?.success) {
      toast.success("Producto actualizado exitosamente");
      onOpenChange(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  if (!producto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modificar datos de {producto.name}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={producto.id} />

          <div className="space-y-2">
            <Label htmlFor="edit-prod-name">Nombre</Label>
            <Input
              id="edit-prod-name"
              name="name"
              required
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
            />
            <FuzzyWarning name={nameValue} excludeId={producto.id} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-prod-desc">Descripción</Label>
            <Textarea
              id="edit-prod-desc"
              name="description"
              defaultValue={producto.description ?? ""}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                name="category"
                defaultValue={producto.category}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {(value: unknown) =>
                      CATEGORIA_PRODUCTO_LABELS[
                        value as CategoriaProducto
                      ] ?? "Seleccionar..."
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIA_PRODUCTO_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidad de Medida</Label>
              <Select name="unit" defaultValue={producto.unit} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {(value: unknown) =>
                      UNIDAD_MEDIDA_LABELS[value as UnidadMedida] ??
                      "Seleccionar..."
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIDAD_MEDIDA_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-prod-minStock">Stock Mínimo</Label>
            <Input
              id="edit-prod-minStock"
              name="minStock"
              type="number"
              min={0}
              defaultValue={producto.minStock}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
