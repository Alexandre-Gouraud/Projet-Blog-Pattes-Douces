import RegisterForm from "@/features/auth/components/RegisterForm";
import { pageTitle } from "@/i18n/dictionaries";

export const generateMetadata = pageTitle("register");

export default function RegisterPage() {
  return <RegisterForm />;
}
