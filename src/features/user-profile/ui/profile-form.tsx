"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  UpdateProfileDocument,
  UpdateUserDocument,
  DepartmentsDocument,
  PositionsDocument,
  UserDocument,
} from "@/gql/generated/graphql";
import { useMutation, useQuery } from "@apollo/client/react";

const profileSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  departmentId: z.string().optional(),
  positionId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

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
}

export function ProfileForm({
  userId,
  defaultValues,
  userDepartmentName,
  userPositionName,
  isOwner,
}: ProfileFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: defaultValues.first_name || "",
      last_name: defaultValues.last_name || "",
      departmentId: defaultValues.departmentId || "",
      positionId: defaultValues.positionId || "",
    },
  });

  const { data: departmentsData } = useQuery(DepartmentsDocument);
  const { data: positionsData } = useQuery(PositionsDocument);

  const [updateUser] = useMutation(UpdateUserDocument, {
    refetchQueries: [{ query: UserDocument, variables: { userId } }],
  });
  const [updateProfile] = useMutation(UpdateProfileDocument, {
    refetchQueries: [{ query: UserDocument, variables: { userId } }],
  });

  useEffect(() => {
    reset({
      first_name: defaultValues.first_name || "",
      last_name: defaultValues.last_name || "",
      departmentId: defaultValues.departmentId || "",
      positionId: defaultValues.positionId || "",
    });
  }, [defaultValues, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const [profileResult, userResult] = await Promise.all([
        updateProfile({
          variables: {
            profile: {
              userId,
              first_name: data.first_name,
              last_name: data.last_name,
            },
          },
        }),
        updateUser({
          variables: {
            user: {
              userId,
              departmentId: data.departmentId || null,
              positionId: data.positionId || null,
            },
          },
        }),
      ]);
      if (profileResult.error || userResult.error) {
        throw new Error("Partial update — some fields failed");
      }

      toast.success("Profile updated successfully");
      reset(data);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const departments = departmentsData?.departments || [];
  const positions = positionsData?.positions || [];

  const fieldGroupClasses =
    "group relative rounded-none border border-border transition-colors focus-within:border-primary h-12";
  const fieldLabelClasses =
    "absolute -top-2.5 left-3 bg-background px-1 text-xs text-foreground transition-colors group-focus-within:text-primary";
  const fieldInputClasses =
    "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none h-full w-full";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className={fieldGroupClasses}>
            <span className={fieldLabelClasses}>First Name</span>
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
        </div>
        <div className="relative">
          <div className={fieldGroupClasses}>
            <span className={fieldLabelClasses}>Last Name</span>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className={fieldGroupClasses}>
            <span className={fieldLabelClasses}>Department</span>
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
            <span className={fieldLabelClasses}>Position</span>
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
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
