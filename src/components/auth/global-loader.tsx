import { Loader2 } from "lucide-react";

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 isolate z-100 flex items-center justify-center bg-background/60 supports-backdrop-filter:backdrop-blur-sm">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}
