"use client";

import { Suspense } from "react";
import UsersComponents from "../components/user";

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersComponents />
    </Suspense>
  );
}
