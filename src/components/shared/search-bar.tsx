"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wrapperClassName?: string;
  inputClassName?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  wrapperClassName,
  inputClassName,
}: SearchBarProps) {
  return (
    <div className={cn("relative w-sm", wrapperClassName)}>
      <Search className="absolute left-3 top-3.5 h-5 w-5 text-icon" />
      <Input
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "pl-10 rounded-[40px] text-foreground bg-background placeholder:text-foreground/70",
          inputClassName,
        )}
      />
    </div>
  );
}
