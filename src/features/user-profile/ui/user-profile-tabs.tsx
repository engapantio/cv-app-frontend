"use client";

import { useTranslations } from "next-intl";
import { TabNav, type TabNavItem } from "@/components/shared/tab-nav";

export function UserProfileTabs({ userId }: { userId: string }) {
  const t = useTranslations();

  const items: TabNavItem[] = [
    { key: "profile", label: t("tabs.profile"), href: `/users/${userId}/profile` },
    { key: "skills", label: t("tabs.skills"), href: `/users/${userId}/skills` },
    { key: "languages", label: t("tabs.languages"), href: `/users/${userId}/languages` },
    { key: "cvs", label: t("tabs.cvs"), href: `/users/${userId}/cvs` },
  ];

  return <TabNav items={items} />;
}
