import { RequireAuth } from "@/features/auth/components/RequireAuth";
import StatsView from "@/features/dashboard/components/StatsView";
import { pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("stats");

export default function DashboardPage() {
  return (
    <RequireAuth>
      <StatsView />
    </RequireAuth>
  );
}
