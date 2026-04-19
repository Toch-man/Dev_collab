"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      router.push("/login");
      return;
    }

    const exchange = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/exchange_code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("access_token", data.access_token);
        // clear the code from the URL before redirecting
        window.history.replaceState({}, "", "/auth/callback");
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    };

    exchange();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Logging you in...</p>
    </div>
  );
}
