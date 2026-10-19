import LoginForm from "@/features/auth/components/LoginForm";
import { pageTitle } from "@/i18n/dictionaries";
import { safeNext } from "@/lib/routes";

export const generateMetadata = pageTitle("login");

export default async function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  const { raison, suite } = await searchParams;
  return (
    <LoginForm
      // Arrivee depuis une page reservee aux membres (voir RequireAuth).
      notice={raison === "connexion"}
      next={safeNext(typeof suite === "string" ? suite : null)}
    />
  );
}
