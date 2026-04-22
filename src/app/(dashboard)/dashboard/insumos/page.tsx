import {
  getAllProductos,
  getAllStockMovements,
  getActiveProductos,
} from "@/services/insumo";
import { getCurrentUser } from "@/services/user";
import { ProductosTable } from "./productos-table";
import { MovimientosTable } from "./movimientos-table";
import { CreateProductoDialog } from "./producto-dialogs";
import { CreateMovimientoDialog } from "./movimiento-dialog";
import { InsumosTabs } from "./insumos-tabs";
import { Package } from "lucide-react";
import type { TipoMovimiento } from "@/generated/prisma/client";

export default async function InsumosPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    productoId?: string;
    tipo?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const params = await searchParams;

  const [currentUser, productos, movimientos, productosActivos] = await Promise.all([
    getCurrentUser(),
    getAllProductos(params.search),
    getAllStockMovements({
      productoId: params.productoId,
      type: params.tipo as TipoMovimiento | undefined,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    getActiveProductos(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Insumos</h1>
          <p className="text-muted-foreground">
            Gestión de insumos y materiales
          </p>
        </div>
        <div className="flex gap-2">
          <CreateMovimientoDialog productos={productosActivos} />
          <CreateProductoDialog />
        </div>
      </div>

      <InsumosTabs
        catalogoContent={
          productos.length === 0 && !params.search ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No hay productos</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Creá el primer producto para comenzar.
              </p>
            </div>
          ) : (
            <ProductosTable productos={productos} isAdmin={currentUser?.role === "Admin"} />
          )
        }
        movimientosContent={
          movimientos.length === 0 &&
          !params.productoId &&
          !params.tipo &&
          !params.dateFrom ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No hay movimientos</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Registrá un movimiento de stock para comenzar.
              </p>
            </div>
          ) : (
            <MovimientosTable
              movimientos={movimientos}
              productos={productosActivos}
            />
          )
        }
      />
    </div>
  );
}
