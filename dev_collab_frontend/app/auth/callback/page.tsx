import { Suspense } from "react";
import AuthCallbackClient from "../../components/authCallbackClient";

export default function Page() {
  return (
    <Suspense fallback={<p>Logging you in...</p>}>
      <AuthCallbackClient />
    </Suspense>
  );
}
