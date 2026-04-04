"use client";

import { useState, useRef, useEffect } from "react";
import { searchPatients } from "@/services/appointment";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { PatientSearchResult } from "@/types";

export function PatientCombobox({
  onSelect,
}: {
  onSelect: (patient: PatientSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PatientSearchResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setSelected(null);
    clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await searchPatients(value);
      setResults(data);
      setOpen(true);
      setLoading(false);
    }, 300);
  }

  function handleSelect(patient: PatientSearchResult) {
    setSelected(patient);
    setQuery(`${patient.dni} — ${patient.lastName}, ${patient.firstName}`);
    setOpen(false);
    onSelect(patient);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          placeholder="Buscar por DNI o nombre..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0 && !selected) setOpen(true);
          }}
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 top-full left-0 w-full mt-1 border border-border bg-popover text-popover-foreground shadow-md max-h-48 overflow-y-auto">
          {results.map((patient) => (
            <li key={patient.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleSelect(patient)}
              >
                <span className="font-medium">{patient.dni}</span>
                <span className="text-muted-foreground">
                  {" — "}
                  {patient.lastName}, {patient.firstName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 border border-border bg-popover px-3 py-2 text-sm text-muted-foreground">
          No se encontraron pacientes
        </div>
      )}
    </div>
  );
}
