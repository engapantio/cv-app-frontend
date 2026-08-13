"use client";

import { useState, useCallback, useMemo } from "react";
import type { UserItem } from "@/features/users/types";
import type { UpdateUserPayload } from "@/features/users/hooks/use-users-page";
import { usePermissions } from "@/lib/auth/permissions";
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

interface UpdateUserDialogProps {
  target: UserItem | null;
  onClose: () => void;
  onConfirm: (payload: UpdateUserPayload) => Promise<void>;
  loading: boolean;
}

const inputClasses =
  "peer border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12";
const selectClassName =
  "border-0 w-full bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none data-[size=default]:h-12 py-1 text-sm";

export function UpdateUserDialog({
  target,
  onClose,
  onConfirm,
  loading,
}: UpdateUserDialogProps) {
  const t = useTranslations();
  const { currentUserId } = usePermissions();
  const { data: departmentsData } = useDepartmentsList();
  const { data: positionsData } = usePositionsList();
  const departments = departmentsData?.departments ?? [];
  const positions = positionsData?.positions ?? [];
  const user = target;
  const isCurrentUser = !!currentUserId && user?.id === currentUserId;

  const [email] = useState(user?.email ?? "");
  const [firstName, setFirstName] = useState(user?.profile?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.profile?.last_name ?? "");
  const [departmentId, setDepartmentId] = useState(user?.department?.id ?? "");
  const [positionId, setPositionId] = useState(user?.position?.id ?? "");
  const [role, setRole] = useState(user?.role ?? "");
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [positionOpen, setPositionOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return (
      firstName !== (user.profile?.first_name ?? "") ||
      lastName !== (user.profile?.last_name ?? "") ||
      departmentId !== (user.department?.id ?? "") ||
      positionId !== (user.position?.id ?? "") ||
      role !== user.role
    );
  }, [user, firstName, lastName, departmentId, positionId, role]);

  const handleConfirm = useCallback(async () => {
    if (!user) return;
    try {
      await onConfirm({
        userId: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        departmentId: departmentId || null,
        positionId: positionId || null,
        role: role as UpdateUserPayload["role"],
      });
      onClose();
    } catch {
      // The page hook already surfaces the failure toast; keep the dialog open for retry.
    }
  }, [user, firstName, lastName, departmentId, positionId, role, onConfirm, onClose]);

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton className="sm:max-w-xl bg-card border-border rounded-none">
        <DialogHeader>
          <DialogTitle className="text-left text-base font-semibold">
            {t("dialogs.updateUser")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label={t("fields.email")}>
              <Input
                id="email"
                value={email}
                readOnly
                disabled
                type="email"
                autoComplete="email"
                placeholder=" "
                className={inputClasses}
              />
            </FloatingField>
            <div>
              <AuthField
                id="password"
                label={t("fields.password")}
                type="password"
                autoComplete="new-password"
                disabled
                value=""
                onChange={() => {}}
                className={inputClasses}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t("dialogs.updateUserPasswordUnavailable")}
              </p>
            </div>
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
              disabled={loading || isCurrentUser}
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
          submitLabel={t("buttons.update")}
          loadingLabel={t("buttons.updating")}
          loading={loading}
          disabled={!hasChanges}
          onCancel={() => onClose()}
          onSubmit={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
