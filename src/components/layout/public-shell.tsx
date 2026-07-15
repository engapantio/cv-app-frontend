export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-lg font-semibold">CV App</span>
        </div>
        {children}
      </div>
    </div>
  );
}
