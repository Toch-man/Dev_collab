"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get("code");

    if (!code) {
      router.push("/login");
      return;
    }

    const exchange = async () => {
      try {
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
          window.history.replaceState({}, "", "/auth/callback");
          router.push("/dashboard");
        } else {
          router.push("/auth/login");
        }
      } catch (err) {
        router.push("/auth/login");
      }
    };

    exchange();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Logging you in...</p>
    </div>
  );
}
