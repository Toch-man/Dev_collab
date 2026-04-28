"use client";

import { Suspense } from "react";
import ResetPasswordComponent from "@/app/components/reset_password_page";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
