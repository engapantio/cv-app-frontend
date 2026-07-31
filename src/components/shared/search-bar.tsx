"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search" }: SearchBarProps) {
  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-3.5 h-5 w-5 text-icon" />
      <Input
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 rounded-[40px] text-foreground !bg-background"
      />
    </div>
  );
}
