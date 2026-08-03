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
  "border-0 w-full bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-12 py-1 text-sm";

export function CreateUserDialog({
  open,
  onOpenChange,
  departments,
  positions,
  onConfirm,
  loading,
}: CreateUserDialogProps) {
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
      toast.error("Failed to create user");
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
          <DialogTitle className="text-left text-base font-semibold">Create User</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FloatingField label="Email">
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
            <FloatingField label="Password">
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
            <FloatingField label="First Name">
              <Input
                id="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder=" "
                disabled={loading}
                className={inputClasses}
              />
            </FloatingField>
            <FloatingField label="Last Name">
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
              label="Department"
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
                  <SelectValue placeholder="Department">
                    {departments.find((d) => d.id === departmentId)?.name ?? "Department"}
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
              label="Position"
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
                  <SelectValue placeholder="Position">
                    {positions.find((p) => p.id === positionId)?.name ?? "Position"}
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
            label="Role"
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
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </FloatingField>
        </div>

        <DialogActions
          submitLabel="CREATE"
          loadingLabel="CREATING..."
          loading={loading}
          disabled={!canSubmit}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleConfirm}
        />
      </DialogContent>
    </Dialog>
  );
}
