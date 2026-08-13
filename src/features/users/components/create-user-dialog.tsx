"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { CreateUserPayload } from "@/features/users/hooks/use-users-page";
import { isDuplicateEmailError } from "@/features/users/errors";
import { AuthField } from "@/components/auth/auth-field";
import { useDepartmentsList } from "@/lib/apollo/use-departments-list";
import { usePositionsList } from "@/lib/apollo/use-positions-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { DialogActions, FloatingField } from "@/components/shared";
import { useTranslations } from "next-intl";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: CreateUserPayload) => Promise<void>;
  loading: boolean;
}

const inputClasses =
  "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";
const selectClassName =
  "border-0 w-full bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none data-[size=default]:h-12 py-1 text-sm";

export function CreateUserDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: CreateUserDialogProps) {
  const t = useTranslations();
  const { data: departmentsData } = useDepartmentsList();
  const { data: positionsData } = usePositionsList();
  const departments = departmentsData?.departments ?? [];
  const positions = positionsData?.positions ?? [];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [positionId, setPositionId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validationMessages = useMemo(
    () => ({
      emailRequired: t("validation.emailRequired"),
      emailInvalid: t("validation.emailInvalid"),
      passwordRequired: t("validation.passwordRequired"),
      passwordMin: t("validation.passwordMin"),
    }),
    [t],
  );

  const credentialsSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .min(1, validationMessages.emailRequired)
          .email(validationMessages.emailInvalid),
        password: z
          .string()
          .min(1, validationMessages.passwordRequired)
          .min(8, validationMessages.passwordMin),
      }),
    [validationMessages],
  );

  const reset = useCallback(() => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setDepartmentId("");
    setPositionId("");
    setRole("");
    setEmailError(null);
    setPasswordError(null);
  }, []);

  const canSubmit = email.trim() !== "" && password !== "" && role !== "";

  const handleConfirm = useCallback(async () => {
    const parsed = credentialsSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setEmailError(fieldErrors.email?.[0] ?? null);
      setPasswordError(fieldErrors.password?.[0] ?? null);
      return;
    }
    try {
      await onConfirm({
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        departmentId: departmentId || null,
        positionId: positionId || null,
        role: role as CreateUserPayload["role"],
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        setEmailError(t("validation.emailInUse"));
        return;
      }
      toast.error(t("common.createUserFailed"));
    }
  }, [
    email,
    password,
    firstName,
    lastName,
    departmentId,
    positionId,
    role,
    credentialsSchema,
    onConfirm,
    reset,
    onOpenChange,
    t,
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent showCloseButton className="sm:max-w-xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.createUser")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label={t("fields.email")} error={emailError ?? undefined}>
              <Input
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                type="email"
                autoComplete="email"
                placeholder=" "
                disabled={loading}
                className={inputClasses}
              />
            </FloatingField>
            <AuthField
              id="password"
              label={t("fields.password")}
              type="password"
              autoComplete="new-password"
              disabled={loading}
              value={password}
              error={passwordError ?? undefined}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingField label={t("fields.firstName")}>
              <Input
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder=" "
                disabled={loading}
                className={inputClasses}
              />
            </FloatingField>
            <FloatingField label={t("fields.lastName")}>
              <Input
                id="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder=" "
                disabled={loading}
                className={inputClasses}
              />
            </FloatingField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FloatingField
              label={t("fields.department")}
              variant="select"
              labelClassName="bg-background"
              active={!!departmentId || departmentOpen}
            >
              <Select
                value={departmentId}
                onValueChange={(v) => setDepartmentId(v ?? "")}
                onOpenChange={setDepartmentOpen}
                disabled={loading}
              >
                <SelectTrigger className={selectClassName}>
                  <SelectValue placeholder={t("fields.department")}>
                    {departments.find((d) => d.id === departmentId)?.name ?? t("fields.department")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FloatingField>
            <FloatingField
              label={t("fields.position")}
              variant="select"
              labelClassName="bg-background"
              active={!!positionId || positionOpen}
            >
              <Select
                value={positionId}
                onValueChange={(v) => setPositionId(v ?? "")}
                onOpenChange={setPositionOpen}
                disabled={loading}
              >
                <SelectTrigger className={selectClassName}>
                  <SelectValue placeholder={t("fields.position")}>
                    {positions.find((p) => p.id === positionId)?.name ?? t("fields.position")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FloatingField>
          </div>

          <FloatingField
            label={t("fields.role")}
            variant="select"
            labelClassName="bg-background"
            active={!!role || roleOpen}
          >
            <Select
              value={role}
              onValueChange={(v) => setRole(v ?? "")}
              onOpenChange={setRoleOpen}
              disabled={loading}
            >
              <SelectTrigger className={selectClassName}>
                <SelectValue placeholder={t("fields.role")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">{t("roles.employee")}</SelectItem>
                <SelectItem value="Admin">{t("roles.admin")}</SelectItem>
              </SelectContent>
            </Select>
          </FloatingField>
        </div>

        <DialogActions
          submitLabel={t("buttons.create")}
          loadingLabel={t("buttons.creating")}
          loading={loading}
          disabled={!canSubmit}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
