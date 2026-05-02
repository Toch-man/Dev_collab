import { Suspense } from "react";
import NotificationPanel from "../components/NotificationPanel";

const Notification = () => {
  return (
    <Suspense fallback={null}>
      <NotificationPanel />
    </Suspense>
  );
};
export default Notification;
