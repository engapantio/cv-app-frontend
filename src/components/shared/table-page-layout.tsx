"use client";

import type { ReactNode } from "react";

interface TablePageLayoutProps {
  title: string;
  children: ReactNode;
}

export function TablePageLayout({ title, children }: TablePageLayoutProps) {
  return (
    <div className="flex w-full">
      <main className="flex-1">
        <div className="flex items-center h-11">
          <h1 className="text-base text-foreground/70">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
