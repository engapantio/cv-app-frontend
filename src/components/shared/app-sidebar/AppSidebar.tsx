"use client";

import { GET_ME, GetMeResponse } from "@/lib/graphql/queries/me.queries";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  useSidebar,
} from "@/components/ui";
import { Users, Languages, TrendingUp, FileUser, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/users", label: "Employees", icon: Users },
  { href: "/skills", label: "Skills", icon: TrendingUp },
  { href: "/languages", label: "Languages", icon: Languages },
  { href: "/cvs", label: "CVs", icon: FileUser },
];

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

export function AppSidebar() {
  const pathname = usePathname();
  const userId = getUserIdFromCookie();
  const { toggleSidebar } = useSidebar();

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

  return (
    <Sidebar style={{ borderRight: "none" }}>
      <SidebarContent>
        <SidebarMenu className="mt-10">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname === item.href + "/" ||
              pathname.startsWith(item.href + "/");
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  className={cn(
                    "w-full py-8",
                    isActive && "bg-gray-300 text-accent-foreground rounded-r-full rounded-l-none",
                  )}
                >
                  <Link href={item.href} className="flex items-center gap-4 px-4">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        _
      </SidebarContent>
      <SidebarFooter className="m-4">
        {loading ? (
          <div className="text-sm">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-500">Error loading profile</div>
        ) : (
          <div className=" items-center justify-between gap-3">
            <div className="flex items-center gap-3 mb-5">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar ?? undefined} />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fullName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
              <ChevronLeft />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
