"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { UserCircle2Icon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/session";
import { LanguageSwitcher } from "./language-switcher";

interface ProfileSectionProps {
  loading: boolean;
  error?: Error | null;
  fullName: string;
  email?: string | null;
  avatar?: string | null;
  initial: string;
  compact?: boolean;
  showLanguageSwitcher?: boolean;
  userId?: string | null;
  menuSide?: "top" | "bottom";
}

export function ProfileSection({
  loading,
  error,
  fullName,
  email,
  avatar,
  initial,
  compact = false,
  showLanguageSwitcher = true,
  userId,
  menuSide = "bottom",
}: ProfileSectionProps) {
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

  const name = fullName || email || "";
  const content = (
    <>
      {compact && name && <h2>{name}</h2>}
      <Avatar className="h-10 w-10">
        <AvatarFallback style={{ backgroundColor: "var(--primary)" }}>
          {initial ? initial : <UserCircle2Icon className="size-6 text-[var(--avatar-letter)]" />}
        </AvatarFallback>
        <AvatarImage src={avatar ?? undefined} />
      </Avatar>
      {!compact && <p className="text-sm font-medium truncate">{name}</p>}
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
