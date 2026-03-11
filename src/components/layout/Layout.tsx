import { useState } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AppSidebar, MobileTopBar, SidebarProvider } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarExtra?: React.ReactNode;
}

export function Layout({ children, hideHeader, hideFooter }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeader && <Header />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

/** Layout for authenticated app pages with sidebar */
export function AppLayout({ children, sidebarExtra }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar
          extraContent={sidebarExtra}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
