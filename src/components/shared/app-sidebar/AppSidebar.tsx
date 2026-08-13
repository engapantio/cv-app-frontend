"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Users,
  Languages,
  TrendingUp,
  FileUser,
  Folders,
  Building,
  Briefcase,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { buildFullName, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu } from "@/components/ui/sidebar";
import { Container } from "../container";
import { useSession } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/cookies";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { ProfileSection } from "./profile-section";
import { MenuItem, type MenuItemData } from "./menu-item";

interface AppSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  initialUser?: SessionUser | null;
}

const adminMenuItems = [
  { href: "/users", labelKey: "nav.employees", icon: Users },
  { href: "/projects", labelKey: "nav.projects", icon: Folders },
  { href: "/cvs", labelKey: "nav.cvs", icon: FileUser },
  { href: "/departments", labelKey: "nav.departments", icon: Building },
  { href: "/positions", labelKey: "nav.positions", icon: Briefcase },
  { href: "/skills", labelKey: "nav.skills", icon: TrendingUp },
  { href: "/languages", labelKey: "nav.languages", icon: Languages, prefetch: false },
];

const employeeMenuItems = [
  { href: "/users", labelKey: "nav.employees", icon: Users },
  { href: "/skills", labelKey: "nav.skills", icon: TrendingUp },
  { href: "/languages", labelKey: "nav.languages", icon: Languages, prefetch: false },
  { href: "/cvs", labelKey: "nav.cvs", icon: FileUser },
];

const isActivePath = (pathname: string, href: string): boolean => {
  if (pathname === href || pathname === href + "/") return true;
  if (href !== "/users" && pathname.startsWith(href + "/")) return true;
  return false;
};

const pathToActiveKey = (pathname: string): string | null => {
  if (pathname === "/cvs" || pathname.startsWith("/cvs/")) return "nav.cvs";
  if (pathname === "/users" || pathname === "/users/") return "nav.employees";
  if (pathname.startsWith("/users/")) {
    const segment = pathname.split("/").pop() ?? "";
    switch (segment) {
      case "skills":
        return "nav.skills";
      case "languages":
        return "nav.languages";
      case "cvs":
        return "nav.cvs";
      default:
        return "nav.employees";
    }
  }
  return null;
};

export function AppSidebar({ isSidebarOpen, setIsSidebarOpen, initialUser }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, loading: sessionLoading } = useSession();
  const t = useTranslations();

  const userData = user ?? initialUser ?? null;
  const loading = sessionLoading && !initialUser;
  const isAdmin = userData?.role === "Admin";

  const userId = userData?.id ?? null;
  const fullName =
    userData?.profile?.full_name ||
    buildFullName(userData?.profile?.first_name, userData?.profile?.last_name);
  const avatar = userData?.profile?.avatar;
  const email = userData?.email ?? "";
  const initial = fullName ? fullName[0].toUpperCase() : "";
  const closeSidebar = () => setIsSidebarOpen(false);

  const employeePersonalLinks: Record<string, string> = {
    "nav.skills": `/users/${userId}/skills`,
    "nav.languages": `/users/${userId}/languages`,
    "nav.cvs": `/users/${userId}/cvs`,
  };

  const menuItems: MenuItemData[] = (isAdmin ? adminMenuItems : employeeMenuItems).map((item) => {
    const personalHref = !isAdmin && userId ? employeePersonalLinks[item.labelKey] : undefined;
    return personalHref ? { ...item, href: personalHref } : item;
  });

  const renderMenuSkeleton = (isMobile: boolean) => {
    const count = isMobile ? 4 : menuItems.length;
    return Array.from({ length: count }).map((_, i) => (
      <div
        key={`skeleton-${i}`}
        className={cn("flex items-center gap-4 w-full", isMobile ? "p-5 w-auto! shrink-0" : "py-8")}
      >
        <Skeleton className="h-4 w-4 rounded-md" />
        {!isMobile && <Skeleton className="h-4 w-24" />}
      </div>
    ));
  };

  const activeKey = pathToActiveKey(pathname);

  const renderMenuItem = (item: MenuItemData, isMobile: boolean) => (
    <MenuItem
      key={item.href}
      item={item}
      label={t(item.labelKey)}
      isActive={activeKey != null ? item.labelKey === activeKey : isActivePath(pathname, item.href)}
      isMobile={isMobile}
      onClick={() => {}}
    />
  );

  const renderMenuItems = (isMobile: boolean, showDivider = false) => {
    if (loading) return renderMenuSkeleton(isMobile);

    const items = menuItems.map((item) => renderMenuItem(item, isMobile));

    if (showDivider && isAdmin) {
      const beforeDepartments = items.slice(0, 3);
      const afterDepartments = items.slice(3);
      return (
        <>
          {beforeDepartments}
          <div className="border-b border-border" />
          {afterDepartments}
        </>
      );
    }

    return items;
  };

  const renderDesktopHeader = () => {
    if (isSidebarOpen) return null;
    return (
      <header className="sticky top-0 z-40 px-4 py-3 border-b bg-background border-border shadow-sm hidden min-[1440px]:flex">
        <Container className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="hidden sm:flex"
          >
            <Menu className="text-icon" />
          </Button>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <ProfileSection
              loading={loading}
              fullName={fullName}
              email={email}
              avatar={avatar}
              initial={initial}
              compact
              showLanguageSwitcher={false}
              userId={userId}
            />
          </div>
        </Container>
      </header>
    );
  };

  const renderDesktopSidebar = () => {
    return (
      <Sidebar
        collapsible="none"
        className="fixed top-0 left-0 h-full bg-background transition-transform duration-300 ease-in-out z-50 hidden min-[1440px]:flex"
        style={{
          borderRight: "none",
          width: "12rem",
          transform: isSidebarOpen ? "translateX(0)" : `translateX(-12rem)`,
        }}
      >
        <SidebarContent>
          <SidebarMenu className="mt-10 space-y-3.5">{renderMenuItems(false, true)}</SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <ProfileSection
            loading={loading}
            fullName={fullName}
            email={email}
            avatar={avatar}
            initial={initial}
            compact={false}
            showLanguageSwitcher={false}
            userId={userId}
            menuSide="top"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 mt-2" onClick={closeSidebar}>
            <ChevronLeft className="text-icon" />
          </Button>
        </SidebarFooter>
      </Sidebar>
    );
  };

  const renderMobileFooter = () => {
    const avatarElement = (
      <ProfileSection
        loading={loading}
        fullName={fullName}
        email={email}
        avatar={avatar}
        initial={initial}
        compact
        showLanguageSwitcher={false}
        userId={userId}
        menuSide="top"
      />
    );

    const footerItems = menuItems.filter((item) => item.labelKey !== "nav.cvs");

    let menuContent: React.ReactNode;
    if (loading) {
      menuContent = (
        <>
          {renderMenuSkeleton(true)}
          {avatarElement}
        </>
      );
    } else if (isAdmin) {
      menuContent = (
        <>
          <div className="flex justify-center items-center gap-1">
            {footerItems.slice(0, 3).map((item) => renderMenuItem(item, true))}
          </div>
          <div className="flex justify-center items-center gap-1">
            {footerItems.slice(3).map((item) => renderMenuItem(item, true))}
            {avatarElement}
          </div>
        </>
      );
    } else {
      menuContent = (
        <div className="flex justify-center items-center gap-1">
          {footerItems.map((item) => renderMenuItem(item, true))}
          {avatarElement}
        </div>
      );
    }

    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-2 py-2 flex flex-col items-center gap-1 min-[1440px]:hidden">
        {menuContent}
      </footer>
    );
  };

  return (
    <>
      {renderDesktopHeader()}
      {renderDesktopSidebar()}
      {renderMobileFooter()}
    </>
  );
}
