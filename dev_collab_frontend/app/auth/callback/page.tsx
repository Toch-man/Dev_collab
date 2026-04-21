import { Suspense } from "react";
import AuthCallbackClient from "./authCallbackClient/page";

export default function Page() {
  return (
    <Suspense fallback={<p>Logging you in...</p>}>
      <AuthCallbackClient />
    </Suspense>
  );
}
