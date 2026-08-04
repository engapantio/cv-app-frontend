"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn, buildFullName } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Users,
  Languages,
  TrendingUp,
  FileUser,
  Folders,
  Building,
  Briefcase,
  Menu,
  Globe,
  ChevronLeft,
  Sun,
  Moon,
} from "lucide-react";
import { Container } from "../container";
import { useTheme } from "next-themes";
import { useSession, logout } from "@/lib/auth/session";
import { usePermissions } from "@/lib/auth/permissions";
import { useTranslations } from "next-intl";
import { locales } from "@/i18n/locales";
import { useLocalePref, setLocale } from "@/lib/preferences/locale";
interface AppSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
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

function ThemeToggle() {
  const t = useTranslations();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("header.toggleTheme")}
      className="rounded-full"
    >
      {!mounted ? (
        <span className="h-5 w-5" />
      ) : isDark ? (
        <Sun className="h-5 w-5 text-icon" />
      ) : (
        <Moon className="h-5 w-5 text-icon" />
      )}
    </Button>
  );
}

const isActivePath = (pathname: string, href: string): boolean => {
  if (pathname === href || pathname === href + "/") {
    return true;
  }
  if (pathname.startsWith(href + "/")) {
    if (
      href === "/users" &&
      (pathname.endsWith("/cvs") ||
        pathname.includes("/cvs/") ||
        pathname.endsWith("/languages") ||
        pathname.includes("/languages/"))
    ) {
      return false;
    }
    return true;
  }
  if (href === "/cvs" && (pathname.endsWith("/cvs") || pathname.includes("/cvs/"))) {
    return true;
  }
  return false;
};

function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocalePref();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={t("header.selectLanguage")} />}
      >
        <Globe className="text-icon" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"flex justify-around"}>
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={cn(
              locale === lang.code && "bg-sidebar-accent",
              "w-7 hover:bg-sidebar-accent",
            )}
          >
            {lang.short}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileSection({
  loading,
  error,
  fullName,
  avatar,
  initial,
  compact = false,
  showLanguageSwitcher = true,
  userId,
  menuSide = "bottom",
}: {
  loading: boolean;
  error?: Error | null;
  fullName: string;
  avatar?: string | null;
  initial: string;
  compact?: boolean;
  showLanguageSwitcher?: boolean;
  userId?: string | null;
  menuSide?: "top" | "bottom";
}) {
  const router = useRouter();
  const t = useTranslations();

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        {!compact && (
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-destructive">Error loading profile</div>;
  }

  const content = (
    <>
      {compact && fullName && <h2>{fullName}</h2>}
      <Avatar className="h-10 w-10">
        <AvatarFallback>{initial}</AvatarFallback>
        <AvatarImage src={avatar ?? undefined} />
      </Avatar>
      {!compact && <p className="text-sm font-medium truncate">{fullName}</p>}
    </>
  );

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <div className="flex items-center gap-3">
      {showLanguageSwitcher && <LanguageSwitcher />}
      {userId ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-3 cursor-pointer outline-none"
              />
            }
          >
            {content}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side={menuSide} className="min-w-36">
            <DropdownMenuItem
              onClick={() => router.push(`/users/${userId}/profile`)}
              className="justify-center cursor-pointer"
            >
              {t("profile.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="justify-center cursor-pointer"
            >
              {t("profile.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="justify-center cursor-pointer">
              {t("profile.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        content
      )}
    </div>
  );
}

interface MenuItemData {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  prefetch?: boolean;
}

function MenuItem({
  item,
  label,
  isActive,
  isMobile,
  onClick,
}: {
  item: MenuItemData;
  label: string;
  isActive: boolean;
  isMobile: boolean;
  onClick: () => void;
}) {
  const baseClasses = cn(
    "w-full text-icon",
    isMobile ? "p-5 w-auto! shrink-0" : "py-8",
    isActive &&
      (isMobile
        ? "bg-sidebar-accent rounded-full text-foreground"
        : "bg-sidebar-accent rounded-r-full rounded-l-none text-foreground"),
    !isMobile && "hover:rounded-r-full rounded-l-none",
  );

  return (
    <SidebarMenuButton
      className={baseClasses}
      render={
        <Link
          href={item.href}
          prefetch={item.prefetch ?? true}
          onClick={onClick}
          className="flex items-center gap-4 w-full h-full"
        />
      }
    >
      <item.icon className="h-4 w-4" />
      <span>{label}</span>
    </SidebarMenuButton>
  );
}

export function AppSidebar({ isSidebarOpen, setIsSidebarOpen }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, loading } = useSession();
  const { isAdmin } = usePermissions();
  const t = useTranslations();

  const userId = user?.id ?? null;
  const fullName =
    user?.profile?.full_name || buildFullName(user?.profile?.first_name, user?.profile?.last_name);
  const avatar = user?.profile?.avatar;
  const initial = fullName ? fullName[0].toUpperCase() : "";
  const closeSidebar = () => setIsSidebarOpen(false);

  const employeePersonalLinks: Record<string, string> = {
    "nav.skills": `/users/${userId}/skills`,
    "nav.languages": `/users/${userId}/languages`,
  };

  const menuItems: MenuItemData[] = (isAdmin ? adminMenuItems : employeeMenuItems).map((item) => {
    const personalHref = !isAdmin && userId ? employeePersonalLinks[item.labelKey] : undefined;
    return personalHref ? { ...item, href: personalHref } : item;
  });

  const renderMenuItems = (isMobile: boolean, showDivider = false) => {
    const items = menuItems.map((item) => (
      <MenuItem
        key={item.href}
        item={item}
        label={t(item.labelKey)}
        isActive={isActivePath(pathname, item.href)}
        isMobile={isMobile}
        onClick={() => {}}
      />
    ));

    if (showDivider && isAdmin) {
      const beforeDepartments = items.slice(0, 3);
      const afterDepartments = items.slice(3);
      return (
        <>
          {beforeDepartments}
          <div className="border-b border-border my-0" />
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
          <SidebarMenu className="mt-10 gap-2">{renderMenuItems(false, true)}</SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <ProfileSection
            loading={loading}
            fullName={fullName}
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
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-2 py-2 flex flex-col items-center gap-1 min-[1440px]:hidden">
        <div className="flex flex-wrap justify-center items-center gap-1">
          {renderMenuItems(true)}
        </div>
        <ProfileSection
          loading={loading}
          fullName={fullName}
          avatar={avatar}
          initial={initial}
          compact
          showLanguageSwitcher={false}
          userId={userId}
          menuSide="top"
        />
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
