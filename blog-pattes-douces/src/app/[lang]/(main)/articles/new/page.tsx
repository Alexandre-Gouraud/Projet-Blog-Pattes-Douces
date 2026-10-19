import ArticleForm from "@/features/articles/components/ArticleForm";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("new");

export default function NewArticlePage() {
  return (
    <RequireAuth>
      <ArticleForm />
    </RequireAuth>
  );
}
