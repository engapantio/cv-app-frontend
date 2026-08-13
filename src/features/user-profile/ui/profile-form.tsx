"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { toast } from "sonner";
import { syncSessionProfileFromUpdate } from "@/lib/auth/session";
import { buildUserUpdateOperations } from "@/lib/user-updates";
import { UpdateProfileDocument, UpdateUserDocument, UserDocument } from "@/gql/generated/graphql";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { useDepartmentsList } from "@/lib/apollo/use-departments-list";
import { usePositionsList } from "@/lib/apollo/use-positions-list";
import { useTranslations } from "next-intl";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/features/user-profile/utils/profile-form-schema";

interface ProfileFormProps {
  userId: string;
  defaultValues: {
    first_name?: string | null;
    last_name?: string | null;
    departmentId?: string | null;
    positionId?: string | null;
  };
  userDepartmentName?: string | null;
  userPositionName?: string | null;
  isOwner: boolean;
  isSelf: boolean;
}

export function ProfileForm({
  userId,
  defaultValues,
  userDepartmentName,
  userPositionName,
  isOwner,
  isSelf,
}: ProfileFormProps) {
  const t = useTranslations();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: defaultValues.first_name || "",
      last_name: defaultValues.last_name || "",
      departmentId: defaultValues.departmentId || "",
      positionId: defaultValues.positionId || "",
    },
  });

  const { data: departmentsData } = useDepartmentsList();
  const { data: positionsData } = usePositionsList();

  const [updateUser] = useMutation(UpdateUserDocument);
  const [updateProfile] = useMutation(UpdateProfileDocument);
  const client = useApolloClient();

  useEffect(() => {
    if (isSubmitting) return;
    reset({
      first_name: defaultValues.first_name || "",
      last_name: defaultValues.last_name || "",
      departmentId: defaultValues.departmentId || "",
      positionId: defaultValues.positionId || "",
    });
  }, [defaultValues, reset, isSubmitting]);

  const onSubmit = async (data: ProfileFormValues) => {
    const operations = buildUserUpdateOperations(
      {
        userId,
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        departmentId: data.departmentId ?? null,
        positionId: data.positionId ?? null,
      },
      {
        first_name: defaultValues.first_name ?? "",
        last_name: defaultValues.last_name ?? "",
        departmentId: defaultValues.departmentId ?? null,
        positionId: defaultValues.positionId ?? null,
      },
      { updateProfile, updateUser },
    );

    if (operations.length === 0) return;

    try {
      for (const operation of operations) {
        const result = (await operation.run()) as { error?: { message?: string } };
        if (result.error) {
          throw new Error(result.error?.message || "Partial update — some fields failed");
        }
      }

      await client.refetchQueries({ include: [UserDocument] });

      const dept = departments.find((d) => d.id === data.departmentId);
      const pos = positions.find((p) => p.id === data.positionId);

      if (isSelf) {
        syncSessionProfileFromUpdate({
          first_name: data.first_name || null,
          last_name: data.last_name || null,
          department: data.departmentId
            ? { id: data.departmentId, name: dept?.name ?? null }
            : null,
          position: data.positionId ? { id: data.positionId, name: pos?.name ?? null } : null,
        });
      }

      toast.success("Profile updated successfully");
      reset(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const departments = departmentsData?.departments || [];
  const positions = positionsData?.positions || [];

  const fieldGroupClasses =
    "group relative rounded-none border border-border transition-colors focus-within:border-primary h-12";
  const fieldLabelClasses =
    "absolute -top-2.5 left-3 bg-background px-1 text-xs text-muted-foreground dark:text-icon transition-colors group-focus-within:text-primary";
  const fieldInputClasses =
    "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-full w-full disabled:bg-transparent dark:disabled:bg-transparent";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className={fieldGroupClasses}>
            <span className={fieldLabelClasses}>{t("fields.firstName")}</span>
            <Controller
              name="first_name"
              control={control}
              render={({ field }) => (
                <Input
                  id="first_name"
                  {...field}
                  disabled={!isOwner}
                  placeholder=""
                  className={fieldInputClasses}
                />
              )}
            />
          </div>
          {errors.first_name?.message && (
            <p className="mt-1 text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div className="relative">
          <div className={fieldGroupClasses}>
            <span className={fieldLabelClasses}>{t("fields.lastName")}</span>
            <Controller
              name="last_name"
              control={control}
              render={({ field }) => (
                <Input
                  id="last_name"
                  {...field}
                  disabled={!isOwner}
                  placeholder=""
                  className={fieldInputClasses}
                />
              )}
            />
          </div>
          {errors.last_name?.message && (
            <p className="mt-1 text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className={fieldGroupClasses}>
            <span className={fieldLabelClasses}>{t("fields.department")}</span>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={!isOwner}
                >
                  <SelectTrigger
                    id="department"
                    className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full bg-transparent shadow-none data-[size=default]:h-full py-0"
                  >
                    <SelectValue className="flex items-center h-full">
                      {departments.find((d) => d.id === field.value)?.name ||
                        userDepartmentName ||
                        ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        <div className="relative">
          <div className={fieldGroupClasses}>
            <span className={fieldLabelClasses}>{t("fields.position")}</span>
            <Controller
              name="positionId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={!isOwner}
                >
                  <SelectTrigger
                    id="position"
                    className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full bg-transparent shadow-none data-[size=default]:h-full py-0"
                  >
                    <SelectValue className="flex items-center h-full">
                      {positions.find((p) => p.id === field.value)?.name || userPositionName || ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div />
          <div>
            <Button
              variant="default"
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="w-full uppercase"
            >
              {isSubmitting ? t("common.loading") : t("buttons.update")}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
