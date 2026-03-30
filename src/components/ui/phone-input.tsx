"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

function formatPhone(raw: string): string {
  // Keep only digits, max 10
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

type PhoneInputProps = Omit<React.ComponentProps<"input">, "onChange" | "type">;

export function PhoneInput({ defaultValue, value, ...props }: PhoneInputProps) {
  const [display, setDisplay] = React.useState(() =>
    formatPhone(String(defaultValue ?? value ?? ""))
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDisplay(formatPhone(e.target.value));
  }

  return (
    <Input
      {...props}
      type="tel"
      value={display}
      onChange={handleChange}
      placeholder="123-123-1234"
      maxLength={12}
    />
  );
}
