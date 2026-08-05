"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserProfileBreadcrumb } from "@/features/user-profile/ui/user-profile-breadcrumb";
import { UserProfileTabs } from "@/features/user-profile/ui/user-profile-tabs";

const TABS = ["profile", "skills", "languages", "cvs"] as const;

export function UserLayoutClient({
  userId,
  userName,
  children,
}: {
  userId: string;
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations();

  const currentTab = pathname.split("/").pop() ?? "profile";

  const tabLabels: Record<(typeof TABS)[number], string> = {
    profile: t("tabs.profile"),
    skills: t("tabs.skills"),
    languages: t("tabs.languages"),
    cvs: t("tabs.cvs"),
  };

  return (
    <div className="flex w-full flex-col">
      <UserProfileBreadcrumb
        userName={userName}
        tabLabel={
          TABS.includes(currentTab as (typeof TABS)[number])
            ? tabLabels[currentTab as (typeof TABS)[number]]
            : currentTab
        }
      />
      <UserProfileTabs userId={userId} />
      {children}
    </div>
  );
}
