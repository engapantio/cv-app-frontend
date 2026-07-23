"use client";

import { UserQuery } from "@/gql/generated/graphql";
import { AvatarUpload } from "./avatar-upload";
import { ProfileForm } from "./profile-form";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui";

type User = NonNullable<UserQuery["user"]>;

interface UserProfileClientProps {
  user: User;
  isOwner: boolean;
}

export function UserProfileClient({ user, isOwner }: UserProfileClientProps) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { name: "profile", href: `/users/${user.id}/profile` },
    { name: "skills", href: `/users/${user.id}/skills` },
    { name: "languages", href: `/users/${user.id}/languages` },
  ];

  const currentTab = pathname.split("/").pop() || "profile";

  const handleTabChange = (value: string) => {
    const tab = tabs.find((t) => t.name === value);
    if (tab) router.push(tab.href);
  };

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
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList variant="line" className="flex flex-wrap mb-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <TabsTrigger
                key={tab.name}
                value={tab.name}
                className={`
                flex justify-center items-center
                w-37.5 h-12
                uppercase text-sm font-medium
                transition-colors duration-200
                cursor-pointer ${
                  isActive ? "border-primary text-primary!" : "text-foreground! hover:text-primary!"
                }
              `}
              >
                {tab.name}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div>
        <div className="flex flex-col items-center gap-8">
          <AvatarUpload
            userId={user.id}
            currentAvatar={avatar}
            fullName={fullName}
            isOwner={isOwner}
          />
          <div className="flex flex-col items-center mb-16">
            <h2 className="mb-2 font-normal text-2xl">{fullName}</h2>
            <p className="text-muted-foreground text-base">{user.email}</p>
            <p className="text-base text-foreground">A member since {formattedDate}</p>
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
