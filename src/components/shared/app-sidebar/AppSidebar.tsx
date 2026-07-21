"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client/react";
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
import { Users, Languages, TrendingUp, FileUser, Menu, Globe, ChevronLeft } from "lucide-react";
import { GET_ME, GetMeResponse } from "@/lib/graphql/queries/me.queries";
import { Container } from "../container";
import { useState } from "react";

interface AppSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isTablet: boolean;
}

const menuItems = [
  { href: "/users", label: "Employees", icon: Users },
  { href: "/skills", label: "Skills", icon: TrendingUp },
  { href: "/languages", label: "Languages", icon: Languages },
  { href: "/cvs", label: "CVs", icon: FileUser },
];

const LANGUAGES = ["EN", "PL", "RU"];

const getUserIdFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie.split("; ").find((row) => row.startsWith("cv_session_user="));
  if (!cookie) return null;
  try {
    let value = cookie.split("=")[1];
    while (value.includes("%")) {
      try {
        const decoded = decodeURIComponent(value);
        if (decoded === value) break;
        value = decoded;
      } catch {
        break;
      }
    }
    if (value.startsWith("{") && value.endsWith("}")) {
      const parsed = JSON.parse(value);
      return parsed?.id || null;
    }
    return null;
  } catch (e) {
    console.error("[AppSidebar] Error parsing cookie:", e);
    return null;
  }
};

const isActivePath = (pathname: string, href: string): boolean => {
  return pathname === href || pathname === href + "/" || pathname.startsWith(href + "/");
};

function LanguageSwitcher() {
  const [language, setLanguage] = useState("EN");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <Globe />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"flex justify-around"}>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={cn(language === lang && "bg-gray-200", "w-7")}
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
}: {
  loading: boolean;
  error?: Error | null;
  fullName: string;
  avatar?: string | null;
  initial: string;
  compact?: boolean;
  showLanguageSwitcher?: boolean;
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
    return <div className="text-sm text-red-500">Error loading profile</div>;
  }

  return (
    <div className="flex items-center gap-3">
      {showLanguageSwitcher && <LanguageSwitcher />}
      {compact && <h2>{fullName}</h2>}
      <Avatar className="h-10 w-10">
        <AvatarFallback>{initial}</AvatarFallback>
        <AvatarImage src={avatar ?? undefined} />
      </Avatar>
      {!compact && <p className="text-sm font-medium truncate">{fullName}</p>}
    </div>
  );
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
    "w-full",
    isMobile ? "py-5" : "py-8",
    isActive &&
      (isMobile ? "bg-gray-200 rounded-full" : "bg-gray-300 rounded-r-full rounded-l-none"),
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
  const userId = getUserIdFromCookie();
  const { data, loading, error } = useQuery<GetMeResponse>(GET_ME, {
    variables: { userId },
    skip: !userId,
  });

  const user = data?.user;
  const fullName =
    user?.profile?.full_name ||
    `${user?.profile?.first_name || ""} ${user?.profile?.last_name || ""}`.trim() ||
    "";
  const avatar = user?.profile?.avatar;
  const initial = fullName ? fullName[0].toUpperCase() : "";

  const closeSidebar = () => setIsSidebarOpen(false);

  const renderMenuItems = (isMobile: boolean) =>
    menuItems.map((item) => (
      <MenuItem
        key={item.href}
        item={item}
        isActive={isActivePath(pathname, item.href)}
        isMobile={isMobile}
        onClick={closeSidebar}
      />
    ));

  const renderDesktopHeader = () => {
    if (isTablet || isSidebarOpen) return null;
    return (
      <header className="sticky top-0 z-40 px-4 py-3 border-b bg-white border-gray-100 shadow-sm">
        <Container className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="hidden sm:flex"
          >
            <Menu />
          </Button>
          <div className="flex items-center gap-4">
            <ProfileSection
              loading={loading}
              error={error}
              fullName={fullName}
              avatar={avatar}
              initial={initial}
              compact
              showLanguageSwitcher={false}
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
        className="fixed top-0 left-0 h-full bg-white transition-transform duration-300 ease-in-out z-50"
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
            error={error}
            fullName={fullName}
            avatar={avatar}
            initial={initial}
            compact={false}
            showLanguageSwitcher={false}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 mt-2" onClick={closeSidebar}>
            <ChevronLeft />
          </Button>
        </SidebarFooter>
      </Sidebar>
    );
  };

  const renderMobileFooter = () => {
    if (!isTablet) return null;
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around">
        {renderMenuItems(true)}
        <div className="flex items-center gap-1">
          <ProfileSection
            loading={loading}
            error={error}
            fullName={fullName}
            avatar={avatar}
            initial={initial}
            compact
            showLanguageSwitcher={false}
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
