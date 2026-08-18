"use client";

import { useState, type ComponentProps, type ImgHTMLAttributes } from "react";
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: "default" | "sm" | "lg" | "xl";
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 data-[size=xl]:size-30 dark:after:mix-blend-lighten",
        className,
      )}
      {...props}
    />
  );
}

function AvatarLoadingDots() {
  return (
    <span
      aria-hidden
      data-slot="avatar-loading"
      className="absolute inset-0 z-10 flex size-full items-center justify-center gap-[3px] rounded-full"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1 rounded-full bg-avatar-letter animate-bounce group-data-[size=xl]/avatar:size-1.5"
          style={{ animationDelay: `${-i * 160}ms` }}
        />
      ))}
    </span>
  );
}

function AvatarImage({ className, src, alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");

  if (resolvedSrc !== src) {
    setResolvedSrc(src);
    setStatus(src ? "loading" : "error");
  }

  if (status === "error") return null;

  return (
    <>
      <span aria-hidden className="absolute inset-0 z-10 size-full rounded-full bg-avatar-bg" />
      {status === "loading" && <AvatarLoadingDots />}
      {/* eslint-disable-next-line @next/next/no-img-element -- avatars may be base64 data URIs or arbitrary-host URLs and can arrive asynchronously, so next/image optimization does not apply */}
      <img
        src={src}
        alt={alt}
        data-slot="avatar-image"
        ref={(node) => {
          if (node?.complete) {
            setStatus(node.naturalWidth > 0 ? "loaded" : "error");
          }
        }}
        className={cn(
          "absolute inset-0 z-10 size-full rounded-full object-cover transition-opacity",
          status === "loading" && "opacity-0",
          className,
        )}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        {...props}
      />
    </>
  );
}

function AvatarFallback({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn(
        "absolute inset-0 flex size-full items-center justify-center rounded-full text-sm text-avatar-letter group-data-[size=sm]/avatar:text-xs group-data-[size=xl]/avatar:text-4xl bg-avatar-bg",
        className,
      )}
      {...props}
    />
  );
}

function AvatarBadge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        "group-data-[size=xl]/avatar:size-4 group-data-[size=xl]/avatar:[&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 group-has-data-[size=xl]/avatar-group:size-30 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge };
