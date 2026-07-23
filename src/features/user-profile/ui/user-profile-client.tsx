"use client";

import { UserQuery } from "@/gql/generated/graphql";
import { AvatarUpload } from "./avatar-upload";
import { ProfileForm } from "./profile-form";
import { usePathname } from "next/navigation";

type User = NonNullable<UserQuery["user"]>;

interface UserProfileClientProps {
  user: User;
  isOwner: boolean;
}

export function UserProfileClient({ user, isOwner }: UserProfileClientProps) {
  const pathname = usePathname();

  const tabs = [
    { name: "profile", href: `/users/${user.id}/profile` },
    { name: "skills", href: `/users/${user.id}/skills` },
    { name: "languages", href: `/users/${user.id}/languages` },
  ];

  const fullName = user.profile?.full_name || "";
  const avatar = user.profile?.avatar;
  const first_name = user.profile?.first_name;
  const last_name = user.profile?.last_name;
  const departmentId = user.department?.id || null;
  const positionId = user.position?.id || null;

  const formatDate = (value: string | number | null | undefined) => {
    if (!value) return "N/A";
    const timestamp = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(timestamp)) return "N/A";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "N/A";
    return date.toDateString();
  };

  const formattedDate = formatDate(user.created_at);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap ">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <a
              key={tab.name}
              href={tab.href}
              className={`
                flex justify-center items-center text-sm w-37 h-12 uppercase
                border-b-2 transition-colors duration-200 font-semibold
                ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground hover:border-primary hover:text-primary"
                }
              `}
            >
              {tab.name}
            </a>
          );
        })}
      </div>

      <div>
        <div className="flex flex-col items-center gap-8">
          <AvatarUpload
            userId={user.id}
            currentAvatar={avatar}
            fullName={fullName}
            isOwner={isOwner}
          />
          <div className="flex flex-col items-center mb-16">
            <h2 className="mb-2 font-semibold text-xl">{fullName}</h2>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <p className="text-sm text-foreground">A member since {formattedDate}</p>
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
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
}
