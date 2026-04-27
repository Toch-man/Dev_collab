"use client";

import { Suspense } from "react";
import UsersComponents from "../components/user";

export default function UsersPage() {
  <Suspense fallback={null}>
    <UsersComponents />
  </Suspense>;
}
