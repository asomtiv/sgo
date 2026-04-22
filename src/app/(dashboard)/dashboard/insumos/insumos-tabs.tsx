"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InsumosTabs({
  catalogoContent,
  movimientosContent,
}: {
  catalogoContent: React.ReactNode;
  movimientosContent: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab =
    searchParams.get("tab") === "movimientos" ? "movimientos" : "catalogo";

  function handleTabChange(value: string | null) {
    const tab = value ?? "catalogo";
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    // Reset filters irrelevant to the new tab
    if (tab === "catalogo") {
      params.delete("productoId");
      params.delete("tipo");
      params.delete("dateFrom");
      params.delete("dateTo");
    } else {
      params.delete("search");
    }
    router.push(`/dashboard/insumos?${params.toString()}`);
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
        <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
      </TabsList>
      <TabsContent value="catalogo">{catalogoContent}</TabsContent>
      <TabsContent value="movimientos">{movimientosContent}</TabsContent>
    </Tabs>
  );
}
