import ActivityList from "@/features/activity/components/ActivityList";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("activity");

export default function ActivityPage() {
  return (
    <RequireAuth>
      <ActivityList />
    </RequireAuth>
  );
}
