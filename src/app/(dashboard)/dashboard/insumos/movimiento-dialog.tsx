"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createStockMovement } from "@/services/insumo";
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
import { ArrowRightLeft } from "lucide-react";
import {
  TIPO_MOVIMIENTO_LABELS,
  UNIDAD_MEDIDA_LABELS,
  MOTIVOS_ENTRADA,
  MOTIVOS_SALIDA,
  MOTIVOS_AJUSTE,
} from "@/lib/constants";
import type { ProductoForSelect } from "@/types";
import type { TipoMovimiento } from "@/generated/prisma/client";

function getMotivosByType(type: string) {
  switch (type) {
    case "Entrada":
      return MOTIVOS_ENTRADA;
    case "Salida":
      return MOTIVOS_SALIDA;
    case "Ajuste":
      return MOTIVOS_AJUSTE;
    default:
      return [];
  }
}

export function CreateMovimientoDialog({
  productos,
}: {
  productos: ProductoForSelect[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createStockMovement,
    null
  );
  const [tipo, setTipo] = useState<string>("");
  const [isNegativeAdjustment, setIsNegativeAdjustment] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success("Movimiento registrado exitosamente");
      setOpen(false);
      setTipo("");
      setIsNegativeAdjustment(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const motivos = getMotivosByType(tipo);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setTipo("");
          setIsNegativeAdjustment(false);
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" />}>
        <ArrowRightLeft data-icon="inline-start" />
        Registrar Movimiento
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Stock</DialogTitle>
          <DialogDescription>
            Registrá una entrada, salida o ajuste de inventario.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label>Producto</Label>
            <Select name="productoId" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar producto...">
                  {(value: unknown) =>
                    productos.find((p) => p.id === value)?.name ??
                    "Seleccionar producto..."
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {productos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}{" "}
                    <span className="text-muted-foreground">
                      ({UNIDAD_MEDIDA_LABELS[p.unit]})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Movimiento</Label>
              <Select
                name="type"
                required
                value={tipo}
                onValueChange={(v) => {
                  setTipo(v ?? "");
                  setIsNegativeAdjustment(false);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar...">
                    {(value: unknown) =>
                      TIPO_MOVIMIENTO_LABELS[value as TipoMovimiento] ??
                      "Seleccionar..."
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_MOVIMIENTO_LABELS).map(
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
              <Label htmlFor="mov-quantity">Cantidad</Label>
              <Input
                id="mov-quantity"
                name="quantity"
                type="number"
                min={1}
                required
                placeholder="1"
              />
            </div>
          </div>

          {tipo === "Ajuste" && (
            <div className="flex items-center gap-2">
              <input
                type="hidden"
                name="adjustmentSign"
                value={isNegativeAdjustment ? "negative" : "positive"}
              />
              <input
                type="checkbox"
                id="negative-adj"
                checked={isNegativeAdjustment}
                onChange={(e) => setIsNegativeAdjustment(e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="negative-adj" className="text-sm font-normal">
                Ajuste negativo (reducir stock)
              </Label>
            </div>
          )}

          <div className="space-y-2">
            <Label>Motivo</Label>
            <Select name="reason" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar motivo...">
                  {(value: unknown) => (value as string) || "Seleccionar motivo..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {motivos.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(tipo === "Entrada" || tipo === "") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mov-lote">
                  Lote{" "}
                  <span className="text-xs text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="mov-lote"
                  name="lote"
                  placeholder="LOT-2026-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mov-expiration">
                  Vencimiento{" "}
                  <span className="text-xs text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="mov-expiration"
                  name="expirationDate"
                  type="date"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mov-notes">
              Notas{" "}
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="mov-notes"
              name="notes"
              placeholder="Observaciones adicionales"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Registrando..." : "Registrar Movimiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
