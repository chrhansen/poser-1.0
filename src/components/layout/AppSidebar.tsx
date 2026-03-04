import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, Settings, CreditCard, HelpCircle, LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState, createContext, useContext } from "react";
import { ContactSupportDialog } from "@/components/dialogs/ContactSupportDialog";
import { RecentAnalysesList } from "./RecentAnalysesList";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
];

const internalLinks = [
  { label: "Metrics", href: "/internal/metrics-debug", icon: BarChart3 },
];

// Context for sidebar collapse state
interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}
const SidebarContext = createContext<SidebarContextValue>({ collapsed: false, setCollapsed: () => {} });
export const useSidebarCollapsed = () => useContext(SidebarContext);

// Persist sidebar state across navigations
const STORAGE_KEY = "sidebar-collapsed";
function getInitialCollapsed() {
  try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedRaw] = useState(getInitialCollapsed);
  const setCollapsed = (v: boolean) => {
    setCollapsedRaw(v);
    try { localStorage.setItem(STORAGE_KEY, String(v)); } catch {}
  };
  return <SidebarContext.Provider value={{ collapsed, setCollapsed }}>{children}</SidebarContext.Provider>;
}

interface AppSidebarProps {
  extraContent?: React.ReactNode;
}

export function AppSidebar({ extraContent }: AppSidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [supportOpen, setSupportOpen] = useState(false);
  const { collapsed, setCollapsed } = useSidebarCollapsed();

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-surface-sunken transition-all duration-300 lg:flex flex-col",
          collapsed ? "w-14" : "w-60"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Collapse toggle */}
          <div className={cn("flex items-center border-b border-border px-3 py-2", collapsed ? "justify-center" : "justify-end")}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-shrink-0 space-y-0.5 px-2 py-3">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                title={collapsed ? link.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  location.pathname === link.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {!collapsed && link.label}
              </Link>
            ))}

            {/* Internal links */}
            {user?.plan === "team" && (
              <>
                <div className="my-3 border-t border-border" />
                {!collapsed && (
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Internal
                  </p>
                )}
                {internalLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    title={collapsed ? link.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      location.pathname === link.href
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && link.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Recent analyses — always shown, scrollable */}
          {!collapsed && (
            <div className="flex-1 overflow-y-auto border-t border-border px-2 py-3">
              {extraContent}
              <RecentAnalysesList />
            </div>
          )}

          {/* Bottom actions */}
          <div className="mt-auto space-y-0.5 border-t border-border px-2 py-3">
            <button
              onClick={() => setSupportOpen(true)}
              title={collapsed ? "Support" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              {!collapsed && "Support"}
            </button>
            <button
              onClick={() => signOut()}
              title={collapsed ? "Sign out" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}
