import { RequireAuth } from "@/features/auth/components/RequireAuth";
import CommentList from "@/features/comments/components/CommentList";
import { pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("comments");

export default function CommentsPage() {
  return (
    <RequireAuth>
      <CommentList />
    </RequireAuth>
  );
}
