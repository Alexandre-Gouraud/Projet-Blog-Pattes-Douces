import ArticleForm from "@/features/articles/components/ArticleForm";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import { pageTitle } from "@/i18n/server";

export const generateMetadata = pageTitle("new");

export default function NewArticlePage() {
  return (
    <RequireAuth>
      <ArticleForm />
    </RequireAuth>
  );
}
