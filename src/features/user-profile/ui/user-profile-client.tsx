"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { UserDocument, UserQuery } from "@/gql/generated/graphql";
import { UserCircle2Icon } from "lucide-react";
import { AvatarUpload } from "./avatar-upload";
import { ProfileForm } from "./profile-form";
import { VerifiedBadge } from "@/components/shared";
import { useTranslations } from "next-intl";

type User = NonNullable<UserQuery["user"]>;

interface UserProfileClientProps {
  user: User;
  canEdit: boolean;
  isSelf: boolean;
}

export function UserProfileClient({ user, canEdit, isSelf }: UserProfileClientProps) {
  const t = useTranslations();

  const { data } = useQuery(UserDocument, {
    variables: { userId: user.id },
  });

  const profileUser = data?.user ?? user;
  const fullName = profileUser.profile?.full_name ?? "";
  const avatar = profileUser.profile?.avatar ?? null;
  const first_name = profileUser.profile?.first_name ?? null;
  const last_name = profileUser.profile?.last_name ?? null;
  const departmentId = profileUser.department?.id ?? null;
  const positionId = profileUser.position?.id ?? null;
  const userDepartmentName = profileUser.department_name ?? null;
  const userPositionName = profileUser.position_name ?? null;

  const defaultValues = useMemo(
    () => ({
      first_name: first_name || "",
      last_name: last_name || "",
      departmentId: departmentId || "",
      positionId: positionId || "",
    }),
    [first_name, last_name, departmentId, positionId],
  );

  const formatDate = (value: string | number | null | undefined) => {
    if (!value) return t("common.na");
    const timestamp = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(timestamp)) return t("common.na");
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return t("common.na");
    return date.toDateString();
  };

  const formattedDate = formatDate(user.created_at);

  return (
    <div>
      <div className="flex flex-col items-center gap-8">
        <AvatarUpload
          userId={user.id}
          currentAvatar={avatar}
          fullName={fullName}
          isOwner={canEdit}
          isSelf={isSelf}
        />
        <div className="flex flex-col items-center mb-16">
          <h2 className="mb-2 font-normal text-2xl">
            {fullName || (
              <span className="inline-flex items-center">
                <UserCircle2Icon className="size-9 text-muted-foreground" />
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1.5">
            <p className="text-muted-foreground text-base">{user.email}</p>
            <VerifiedBadge verified={user.is_verified} />
          </div>
          <p className="text-base text-foreground">
            {t("common.memberSince", { date: formattedDate })}
          </p>
        </div>
      </div>

      <div>
        <ProfileForm
          userId={user.id}
          defaultValues={defaultValues}
          userDepartmentName={userDepartmentName}
          userPositionName={userPositionName}
          isOwner={canEdit}
          isSelf={isSelf}
        />
      </div>
    </div>
  );
}
