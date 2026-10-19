import MyArticlesList from "@/features/articles/components/MyArticlesList";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("mine");

export default function MyArticlesPage() {
  return (
    <RequireAuth>
      <MyArticlesList />
    </RequireAuth>
  );
}
