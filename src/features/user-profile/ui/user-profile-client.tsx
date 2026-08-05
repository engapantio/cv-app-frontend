"use client";

import { useEffect, useState } from "react";
import { UserQuery } from "@/gql/generated/graphql";
import { AvatarUpload } from "./avatar-upload";
import { ProfileForm } from "./profile-form";
import { useSession } from "@/lib/auth/session";
import { VerifiedBadge } from "@/components/shared";
import { useTranslations } from "next-intl";

type User = NonNullable<UserQuery["user"]>;

interface UserProfileClientProps {
  user: User;
  isOwner: boolean;
}

export function UserProfileClient({ user, isOwner }: UserProfileClientProps) {
  const t = useTranslations();
  const { user: currentUser } = useSession();
  const isAdmin = currentUser?.role === "Admin";
  const [canEdit, setCanEdit] = useState(isOwner);

  useEffect(() => {
    if (isAdmin) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCanEdit(true);
    }
  }, [isAdmin]);

  const isSelf = currentUser?.id === user.id;
  const fullName =
    (isSelf
      ? (currentUser?.profile?.full_name ?? user.profile?.full_name)
      : user.profile?.full_name) || "";
  const avatar = isSelf
    ? (currentUser?.profile?.avatar ?? user.profile?.avatar)
    : user.profile?.avatar;
  const first_name = isSelf
    ? (currentUser?.profile?.first_name ?? user.profile?.first_name)
    : user.profile?.first_name;
  const last_name = isSelf
    ? (currentUser?.profile?.last_name ?? user.profile?.last_name)
    : user.profile?.last_name;
  const departmentId = isSelf
    ? (currentUser?.department?.id ?? user.department?.id)
    : user.department?.id;
  const positionId = isSelf ? (currentUser?.position?.id ?? user.position?.id) : user.position?.id;
  const userDepartmentName = isSelf
    ? (currentUser?.department_name ?? user.department_name)
    : user.department_name;
  const userPositionName = isSelf
    ? (currentUser?.position_name ?? user.position_name)
    : user.position_name;

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
        />
        <div className="flex flex-col items-center mb-16">
          <h2 className="mb-2 font-normal text-2xl">{fullName}</h2>
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
          defaultValues={{
            first_name,
            last_name,
            departmentId,
            positionId,
          }}
          userDepartmentName={userDepartmentName}
          userPositionName={userPositionName}
          isOwner={canEdit}
        />
      </div>
    </div>
  );
}
