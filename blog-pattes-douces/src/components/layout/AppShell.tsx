import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { SidebarProvider } from "@/context/SidebarContext";

/**
 * Chassis commun (Sidebar + Header + Footer) partage par les groupes de routes
 * (auth) et (main). Server Component : seuls SidebarProvider, Sidebar et Header
 * sont des Client Components.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          <Header />
          <main
            className="flex-1 p-8"
            style={{
              background:
                "linear-gradient(90deg, hsla(28, 100%, 72%, 1) 0%, hsla(28, 38%, 43%, 1) 100%)",
            }}
          >
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
