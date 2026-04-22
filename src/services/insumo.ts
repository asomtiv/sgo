"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createProductoSchema,
  updateProductoSchema,
  createStockMovementSchema,
} from "@/types/schemas";
import { getCurrentUser } from "@/services/user";
import {
  normalizeProductName,
  findSimilarProducts,
} from "@/lib/normalize";
import type { TipoMovimiento } from "@/generated/prisma/client";
import type {
  ProductoWithStock,
  StockMovementWithDetails,
  ProductoForSelect,
} from "@/types";

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

export async function getAllProductos(
  search?: string
): Promise<ProductoWithStock[]> {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          {
            description: { contains: search, mode: "insensitive" as const },
          },
        ],
      }
    : undefined;

  const productos = await prisma.producto.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const stockSums = await prisma.stockMovement.groupBy({
    by: ["productoId"],
    _sum: { quantity: true },
  });

  const stockMap = new Map(
    stockSums.map((s) => [s.productoId, s._sum.quantity ?? 0])
  );

  return productos.map((p) => ({
    ...p,
    currentStock: stockMap.get(p.id) ?? 0,
  }));
}

export async function getActiveProductos(): Promise<ProductoForSelect[]> {
  return prisma.producto.findMany({
    where: { isActive: true },
    select: { id: true, name: true, unit: true, isActive: true },
    orderBy: { name: "asc" },
  });
}

async function getProductoStockById(productoId: string): Promise<number> {
  const result = await prisma.stockMovement.aggregate({
    where: { productoId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export async function findSimilarProductNames(
  name: string,
  excludeId?: string
): Promise<{ id: string; name: string }[]> {
  const all = await prisma.producto.findMany({
    select: { id: true, name: true, normalizedName: true },
  });
  return findSimilarProducts(name, all, excludeId);
}

export async function createProducto(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = createProductoSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    unit: formData.get("unit"),
    minStock: formData.get("minStock"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisá el nombre, categoría y unidad." };
  }

  const normalizedName = normalizeProductName(parsed.data.name);

  const existing = await prisma.producto.findFirst({
    where: { normalizedName },
  });

  if (existing) {
    return {
      error: `Ya existe un producto con un nombre similar: "${existing.name}"`,
    };
  }

  await prisma.producto.create({
    data: {
      name: parsed.data.name.trim(),
      normalizedName,
      description: parsed.data.description || null,
      category: parsed.data.category,
      unit: parsed.data.unit,
      minStock: parsed.data.minStock,
    },
  });

  revalidatePath("/dashboard/insumos");
  return { success: true };
}

export async function updateProducto(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = updateProductoSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    unit: formData.get("unit"),
    minStock: formData.get("minStock"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos." };
  }

  const normalizedName = normalizeProductName(parsed.data.name);

  const existing = await prisma.producto.findFirst({
    where: { normalizedName, NOT: { id: parsed.data.id } },
  });

  if (existing) {
    return {
      error: `Ya existe otro producto con un nombre similar: "${existing.name}"`,
    };
  }

  await prisma.producto.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name.trim(),
      normalizedName,
      description: parsed.data.description || null,
      category: parsed.data.category,
      unit: parsed.data.unit,
      minStock: parsed.data.minStock,
    },
  });

  revalidatePath("/dashboard/insumos");
  return { success: true };
}

export async function deleteProducto(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "Admin") {
    return { error: "Solo los administradores pueden eliminar productos." };
  }

  await prisma.$transaction([
    prisma.stockMovement.deleteMany({ where: { productoId: id } }),
    prisma.producto.delete({ where: { id } }),
  ]);

  revalidatePath("/dashboard/insumos");
  return { success: true };
}

export async function toggleProductoActive(id: string, isActive: boolean) {
  if (!isActive) {
    const stock = await getProductoStockById(id);
    if (stock > 0) {
      return {
        error: `No se puede desactivar un producto con stock disponible (${stock} unidades). Registrá un ajuste de salida primero.`,
      };
    }
  }

  await prisma.producto.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/dashboard/insumos");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Movimientos de Stock
// ---------------------------------------------------------------------------

export async function getAllStockMovements(filters?: {
  productoId?: string;
  type?: TipoMovimiento;
  dateFrom?: string;
  dateTo?: string;
}): Promise<StockMovementWithDetails[]> {
  const where: Record<string, unknown> = {};

  if (filters?.productoId) where.productoId = filters.productoId;
  if (filters?.type) where.type = filters.type;

  if (filters?.dateFrom || filters?.dateTo) {
    const createdAt: Record<string, Date> = {};
    if (filters.dateFrom) createdAt.gte = new Date(`${filters.dateFrom}T00:00:00`);
    if (filters.dateTo) createdAt.lte = new Date(`${filters.dateTo}T23:59:59`);
    where.createdAt = createdAt;
  }

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      producto: { select: { id: true, name: true, unit: true } },
      createdBy: {
        select: { profile: { select: { firstName: true, lastName: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return movements as unknown as StockMovementWithDetails[];
}

export async function createStockMovement(
  _prevState: unknown,
  formData: FormData
) {
  const parsed = createStockMovementSchema.safeParse({
    productoId: formData.get("productoId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason"),
    lote: formData.get("lote") || undefined,
    expirationDate: formData.get("expirationDate") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Revisá la cantidad y el motivo." };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Debés estar autenticado para registrar un movimiento." };
  }

  const producto = await prisma.producto.findUnique({
    where: { id: parsed.data.productoId },
  });

  if (!producto) {
    return { error: "Producto no encontrado." };
  }

  if (!producto.isActive) {
    return { error: "No se pueden registrar movimientos en un producto inactivo." };
  }

  // Determine signed quantity
  const isNegativeAdjustment = formData.get("adjustmentSign") === "negative";
  let signedQuantity: number;

  switch (parsed.data.type) {
    case "Entrada":
      signedQuantity = parsed.data.quantity;
      break;
    case "Salida":
      signedQuantity = -parsed.data.quantity;
      break;
    case "Ajuste":
      signedQuantity = isNegativeAdjustment
        ? -parsed.data.quantity
        : parsed.data.quantity;
      break;
  }

  // Validate resulting stock for Salida and negative Ajuste
  if (signedQuantity < 0) {
    const currentStock = await getProductoStockById(parsed.data.productoId);
    const resultingStock = currentStock + signedQuantity;
    if (resultingStock < 0) {
      return {
        error: `Stock insuficiente. Stock actual: ${currentStock}. Intentando retirar: ${Math.abs(signedQuantity)}.`,
      };
    }
  }

  await prisma.stockMovement.create({
    data: {
      productoId: parsed.data.productoId,
      type: parsed.data.type,
      quantity: signedQuantity,
      reason: parsed.data.reason,
      lote: parsed.data.lote || null,
      expirationDate: parsed.data.expirationDate
        ? new Date(`${parsed.data.expirationDate}T00:00:00`)
        : null,
      notes: parsed.data.notes || null,
      createdById: currentUser.id,
    },
  });

  revalidatePath("/dashboard/insumos");
  return { success: true };
}
