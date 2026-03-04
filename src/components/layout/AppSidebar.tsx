import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, Settings, CreditCard, HelpCircle, LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useState, createContext, useContext } from "react";
import { ContactSupportDialog } from "@/components/dialogs/ContactSupportDialog";
import { RecentAnalysesList } from "./RecentAnalysesList";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

const TOOLTIP_DELAY = 100;

function SidebarTooltip({ label, collapsed, children }: { label: string; collapsed: boolean; children: React.ReactNode }) {
  if (!collapsed) return <>{children}</>;
  return (
    <Tooltip delayDuration={TOOLTIP_DELAY}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  );
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
            <SidebarTooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} collapsed={collapsed}>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </SidebarTooltip>
          </div>

          {/* Nav links */}
          <nav className="flex-shrink-0 space-y-0.5 px-2 py-3">
            {sidebarLinks.map((link) => (
              <SidebarTooltip key={link.href} label={link.label} collapsed={collapsed}>
                <Link
                  to={link.href}
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
              </SidebarTooltip>
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
                  <SidebarTooltip key={link.href} label={link.label} collapsed={collapsed}>
                    <Link
                      to={link.href}
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
                  </SidebarTooltip>
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
            <SidebarTooltip label="Support" collapsed={collapsed}>
              <button
                onClick={() => setSupportOpen(true)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                {!collapsed && "Support"}
              </button>
            </SidebarTooltip>
            <SidebarTooltip label="Sign out" collapsed={collapsed}>
              <button
                onClick={() => signOut()}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && "Sign out"}
              </button>
            </SidebarTooltip>
          </div>
        </div>
      </aside>

      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}
