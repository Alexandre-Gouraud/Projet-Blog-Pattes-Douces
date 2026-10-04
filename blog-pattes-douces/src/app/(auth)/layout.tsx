import AppShell from "@/components/layout/AppShell";

/** Chassis des pages de connexion et d'inscription. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
