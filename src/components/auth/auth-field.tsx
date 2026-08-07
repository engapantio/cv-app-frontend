"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/shared/floating-field";
import { cn } from "@/lib/utils";

const inputClasses =
  "peer w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";

type AuthFieldProps = Omit<React.ComponentProps<"input">, "type"> & {
  id: string;
  label: string;
  type?: "email" | "text" | "password";
};

export function AuthField({ id, label, type = "text", className, ...inputProps }: AuthFieldProps) {
  const t = useTranslations("auth.passwordToggle");
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <FloatingField label={label}>
      {isPassword && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0.5 top-0.5 z-10 rounded-[20px] text-foreground/70"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? t("hide") : t("show")}
          disabled={inputProps.disabled}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      )}
      <Input
        id={id}
        type={inputType}
        placeholder=" "
        className={cn(inputClasses, isPassword && "pr-12", className)}
        {...inputProps}
      />
    </FloatingField>
  );
}
