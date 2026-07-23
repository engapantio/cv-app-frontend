"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Label,
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
  isOwner: boolean;
}

export function ProfileForm({ userId, defaultValues, isOwner }: ProfileFormProps) {
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

  const fieldClasses = "!h-12 rounded-none w-full pt-2 !bg-background";
  const labelClasses = "absolute left-3 -top-2.5 px-1 text-xs text-muted-foreground";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Label htmlFor="first_name" className={labelClasses}>
            First Name
          </Label>
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <Input id="first_name" {...field} disabled={!isOwner} className={fieldClasses} />
            )}
          />
        </div>
        <div className="relative">
          <Label htmlFor="last_name" className={labelClasses}>
            Last Name
          </Label>
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <Input id="last_name" {...field} disabled={!isOwner} className={fieldClasses} />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Label htmlFor="department" className={labelClasses}>
            Department
          </Label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange} disabled={!isOwner}>
                <SelectTrigger id="department" className={fieldClasses}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={"rounded-none"}>
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
        <div className="relative">
          <Label htmlFor="position" className={labelClasses}>
            Position
          </Label>
          <Controller
            name="positionId"
            control={control}
            render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange} disabled={!isOwner}>
                <SelectTrigger id="position" className={fieldClasses}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={"rounded-none"}>
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
