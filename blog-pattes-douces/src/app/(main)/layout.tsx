import AppShell from "@/components/layout/AppShell";

/** Chassis commun a toutes les pages connectees. */
export default function MainLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
