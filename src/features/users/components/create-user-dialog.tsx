"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { CreateUserPayload } from "@/features/users/hooks/use-users-page";
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

interface DepartmentOption {
  id: string;
  name: string;
}
interface PositionOption {
  id: string;
  name: string;
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentOption[];
  positions: PositionOption[];
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
  departments,
  positions,
  onConfirm,
  loading,
}: CreateUserDialogProps) {
  const t = useTranslations();
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

  const reset = useCallback(() => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setDepartmentId("");
    setPositionId("");
    setRole("");
  }, []);

  const canSubmit = email.trim() !== "" && password !== "" && role !== "";

  const handleConfirm = useCallback(async () => {
    if (!canSubmit) return;
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
    } catch {
      toast.error(t("common.createUserFailed"));
    }
  }, [
    canSubmit,
    email,
    password,
    firstName,
    lastName,
    departmentId,
    positionId,
    role,
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
            <FloatingField label={t("fields.email")}>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder=" "
                disabled={loading}
                className={inputClasses}
              />
            </FloatingField>
            <FloatingField label={t("fields.password")}>
              <Input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder=" "
                disabled={loading}
                className={inputClasses}
              />
            </FloatingField>
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
