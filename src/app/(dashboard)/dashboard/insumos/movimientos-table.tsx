"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TIPO_MOVIMIENTO_LABELS,
  TIPO_MOVIMIENTO_COLORS,
  UNIDAD_MEDIDA_LABELS,
} from "@/lib/constants";
import type { StockMovementWithDetails, ProductoForSelect } from "@/types";
import type { TipoMovimiento } from "@/generated/prisma/client";

export function MovimientosTable({
  movimientos,
  productos,
}: {
  movimientos: StockMovementWithDetails[];
  productos: ProductoForSelect[];
}) {
  const router = useRouter();
  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ tab: "movimientos" });
    if (productoId) params.set("productoId", productoId);
    if (tipo) params.set("tipo", tipo);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    router.push(`/dashboard/insumos?${params.toString()}`);
  }

  function handleClear() {
    setProductoId("");
    setTipo("");
    setDateFrom("");
    setDateTo("");
    router.push("/dashboard/insumos?tab=movimientos");
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="space-y-1">
          <Label className="text-xs">Producto</Label>
          <Select value={productoId} onValueChange={(v) => setProductoId(v ?? "")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos">
                {(value: unknown) =>
                  productos.find((p) => p.id === value)?.name ?? "Todos"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {productos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Tipo</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v ?? "")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Todos">
                {(value: unknown) =>
                  TIPO_MOVIMIENTO_LABELS[value as TipoMovimiento] ?? "Todos"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIPO_MOVIMIENTO_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Desde</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hasta</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Filtrar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
        >
          Limpiar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-md border bg-card">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Fecha</th>
              <th className="px-3 py-2 text-left font-medium">Producto</th>
              <th className="px-3 py-2 text-left font-medium">Tipo</th>
              <th className="px-3 py-2 text-left font-medium">Cantidad</th>
              <th className="px-3 py-2 text-left font-medium">Lote</th>
              <th className="px-3 py-2 text-left font-medium">Vencimiento</th>
              <th className="px-3 py-2 text-left font-medium">Motivo</th>
              <th className="px-3 py-2 text-left font-medium">
                Registrado por
              </th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => {
              const colors = TIPO_MOVIMIENTO_COLORS[m.type];
              const userName = m.createdBy.profile
                ? `${m.createdBy.profile.firstName} ${m.createdBy.profile.lastName}`
                : "—";
              const sign = m.quantity >= 0 ? "+" : "";

              return (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    {format(new Date(m.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </td>
                  <td className="px-3 py-2 truncate" title={m.producto.name}>
                    {m.producto.name}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      {TIPO_MOVIMIENTO_LABELS[m.type]}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {sign}
                    {m.quantity}{" "}
                    <span className="text-xs text-muted-foreground">
                      {UNIDAD_MEDIDA_LABELS[m.producto.unit]}
                    </span>
                  </td>
                  <td className="px-3 py-2 truncate">{m.lote ?? "—"}</td>
                  <td className="px-3 py-2">
                    {m.expirationDate
                      ? format(new Date(m.expirationDate), "dd/MM/yyyy")
                      : "—"}
                  </td>
                  <td className="px-3 py-2 truncate" title={m.reason}>
                    {m.reason}
                    {m.notes && (
                      <span
                        className="block text-xs text-muted-foreground truncate"
                        title={m.notes}
                      >
                        {m.notes}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 truncate">{userName}</td>
                </tr>
              );
            })}
            {movimientos.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No se encontraron movimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
