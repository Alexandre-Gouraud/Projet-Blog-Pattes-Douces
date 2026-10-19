import { RequireAuth } from "@/features/auth/components/RequireAuth";
import ProfileView from "@/features/profile/components/ProfileView";
import { pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("profile");

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileView />
    </RequireAuth>
  );
}
