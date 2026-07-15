"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sessionVar } from "@/lib/auth/session";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message ?? "Login failed");
      return;
    }

    sessionVar(data.user);
    router.push("/users");
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* inputs */}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
