type AuthFormRootErrorProps = {
  message?: string;
};

export function AuthFormRootError({ message }: AuthFormRootErrorProps) {
  if (!message) return null;

  return (
    <p className="mt-5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}
