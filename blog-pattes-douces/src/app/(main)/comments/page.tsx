import type { Metadata } from "next";
import CommentList from "@/features/comments/components/CommentList";

export const metadata: Metadata = { title: "Commentaires" };

export default function CommentsPage() {
  return <CommentList />;
}
