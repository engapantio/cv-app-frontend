"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import {
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui";
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
import { useSession } from "@/lib/auth/session";
import { usePermissions } from "@/lib/auth/permissions";

interface AppSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isTablet: boolean;
}

const adminMenuItems = [
  { href: "/users", label: "Employees", icon: Users },
  { href: "/projects", label: "Projects", icon: Folders },
  { href: "/cvs", label: "CVs", icon: FileUser },
  { href: "/departments", label: "Departments", icon: Building },
  { href: "/positions", label: "Positions", icon: Briefcase },
  { href: "/skills", label: "Skills", icon: TrendingUp },
  { href: "/languages", label: "Languages", icon: Languages },
];

const employeeMenuItems = [
  { href: "/users", label: "Employees", icon: Users },
  { href: "/skills", label: "Skills", icon: TrendingUp },
  { href: "/languages", label: "Languages", icon: Languages },
  { href: "/cvs", label: "CVs", icon: FileUser },
];

const LANGUAGES = ["EN", "PL", "RU"];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
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
    if (href === "/users" && (pathname.endsWith("/cvs") || pathname.includes("/cvs/"))) {
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
  const [language, setLanguage] = useState("EN");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Globe className="text-icon" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"flex justify-around"}>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={cn(language === lang && "bg-sidebar-accent", "w-7 hover:bg-sidebar-accent")}
          >
            {lang}
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
}: {
  loading: boolean;
  error?: Error | null;
  fullName: string;
  avatar?: string | null;
  initial: string;
  compact?: boolean;
  showLanguageSwitcher?: boolean;
  userId?: string | null;
}) {
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

  return (
    <div className="flex items-center gap-3">
      {showLanguageSwitcher && <LanguageSwitcher />}
      {userId ? (
        <Link href={`/users/${userId}/profile`} className="flex items-center gap-3">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

interface MenuItemData {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function MenuItem({
  item,
  isActive,
  isMobile,
  onClick,
}: {
  item: (typeof menuItems)[0];
  isActive: boolean;
  isMobile: boolean;
  onClick: () => void;
}) {
  const baseClasses = cn(
    "w-full text-icon",
    isMobile ? "p-5 w-auto" : "py-8",
    isActive &&
      (isMobile
        ? "bg-sidebar-accent rounded-full text-foreground"
        : "bg-sidebar-accent rounded-r-full rounded-l-none text-foreground"),
    !isMobile && "hover:rounded-r-full rounded-l-none",
  );

  return (
    <SidebarMenuButton className={baseClasses}>
      <Link href={item.href} onClick={onClick} className="flex items-center gap-4">
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
      </Link>
    </SidebarMenuButton>
  );
}

export function AppSidebar({ isSidebarOpen, setIsSidebarOpen, isTablet }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, loading } = useSession();
  const { isAdmin } = usePermissions();

  const userId = user?.id ?? null;
  const fullName =
    user?.profile?.full_name ||
    `${user?.profile?.first_name || ""} ${user?.profile?.last_name || ""}`.trim() ||
    "";
  const avatar = user?.profile?.avatar;
  const initial = fullName ? fullName[0].toUpperCase() : "";
  const closeSidebar = () => setIsSidebarOpen(false);

  const menuItems: MenuItemData[] = isAdmin
    ? adminMenuItems
    : employeeMenuItems.map((item) =>
        item.label === "Skills"
          ? { ...item, href: userId ? `/users/${userId}/skills` : item.href }
          : item,
      );

  const renderMenuItems = (isMobile: boolean) =>
    menuItems.map((item) => (
      <MenuItem
        key={item.href}
        item={item}
        isActive={isActivePath(pathname, item.href)}
        isMobile={isMobile}
        onClick={() => {}}
      />
    ));

  const renderDesktopHeader = () => {
    if (isTablet || isSidebarOpen) return null;
    return (
      <header className="sticky top-0 z-40 px-4 py-3 border-b bg-background border-border shadow-sm">
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
    if (isTablet) return null;
    return (
      <Sidebar
        collapsible="none"
        className="fixed top-0 left-0 h-full bg-background transition-transform duration-300 ease-in-out z-50"
        style={{
          borderRight: "none",
          width: "12rem",
          transform: isSidebarOpen ? "translateX(0)" : `translateX(-12rem)`,
        }}
      >
        <SidebarContent>
          <SidebarMenu className="mt-10">{renderMenuItems(false)}</SidebarMenu>
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
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 mt-2" onClick={closeSidebar}>
            <ChevronLeft className="text-icon" />
          </Button>
        </SidebarFooter>
      </Sidebar>
    );
  };

  const renderMobileFooter = () => {
    if (!isTablet) return null;
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border px-2 py-2 flex items-center justify-around">
        {renderMenuItems(true)}
        <div className="flex items-center gap-1">
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
