import RegisterForm from "@/features/auth/components/RegisterForm";
import { pageTitle } from "@/i18n/server";

export const generateMetadata = pageTitle("register");

export default function RegisterPage() {
  return <RegisterForm />;
}
