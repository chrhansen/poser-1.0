import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BarChart3, Settings, CreditCard, HelpCircle, LogOut, PanelLeftClose, PanelLeft, Info, Tag, FileText, ChevronUp, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import React, { useState, createContext, useContext } from "react";
import { ContactSupportDialog } from "@/components/dialogs/ContactSupportDialog";
import { RecentAnalysesList } from "./RecentAnalysesList";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import poserLogo from "@/assets/poser-logo.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function SidebarInner({ extraContent, collapsed, setCollapsed, onNavigate, hideHeader }: {
  extraContent?: React.ReactNode;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onNavigate?: () => void;
  hideHeader?: boolean;
}) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [supportOpen, setSupportOpen] = useState(false);

  const handleNav = () => onNavigate?.();

  return (
    <>
      <div
        className="flex h-full flex-col"
        onClick={(e) => {
          if (collapsed && e.target === e.currentTarget) {
            setCollapsed(false);
          }
        }}
      >
        {/* Top: Logo + collapse toggle (hidden when used inside mobile sheet) */}
        {!hideHeader && (
          <div className={cn("flex items-center border-b border-border px-3 py-3", collapsed ? "justify-center" : "justify-between")}>
            {!collapsed && (
              <Link to="/" onClick={handleNav}>
                <img src={poserLogo} alt="poser" className="h-6 w-auto" />
              </Link>
            )}
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
        )}

        {/* Nav links */}
        <nav className="flex-shrink-0 space-y-0.5 px-2 py-3">
          {sidebarLinks.map((link) => (
            <SidebarTooltip key={link.href} label={link.label} collapsed={collapsed}>
              <Link
                to={link.href}
                onClick={handleNav}
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
                    onClick={handleNav}
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

        {/* Bottom: Support + User menu */}
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

          {/* User menu */}
          <DropdownMenu>
            <SidebarTooltip label={user?.name ?? "Account"} collapsed={collapsed}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/50",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Avatar className="h-6 w-6 shrink-0 text-[10px]">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{user?.name}</span>
                      <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
            </SidebarTooltip>
            <DropdownMenuContent
              side={collapsed ? "right" : "top"}
              align={collapsed ? "end" : "start"}
              className="w-56"
              sideOffset={8}
            >
              {!collapsed && (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link to="/about" onClick={handleNav}><Info className="mr-2 h-4 w-4" />About</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/pricing" onClick={handleNav}><Tag className="mr-2 h-4 w-4" />Pricing</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/releases" onClick={handleNav}><FileText className="mr-2 h-4 w-4" />Releases</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}

export function AppSidebar({ extraContent }: AppSidebarProps) {
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Use lg breakpoint (1024px) to match the CSS lg:flex class
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Desktop sidebar
  if (isDesktop) {
    return (
      <aside
        className={cn(
          "sticky top-0 h-screen shrink-0 border-r border-border bg-surface-sunken transition-all duration-300 flex flex-col",
          collapsed ? "w-14 cursor-pointer" : "w-60"
        )}
        onClick={(e) => {
          if (collapsed && e.target === e.currentTarget) {
            setCollapsed(false);
          }
        }}
      >
        <SidebarInner extraContent={extraContent} collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>
    );
  }

  // Mobile: hamburger button + Sheet overlay
  return (
    <>
      <MobileMenuButton onClick={() => setMobileOpen(true)} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-surface-sunken [&>button.absolute]:hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">
            {/* Close button row */}
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <img src={poserLogo} alt="poser" className="h-6 w-auto" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Reuse inner content, always expanded */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <SidebarInner extraContent={extraContent} collapsed={false} setCollapsed={() => {}} onNavigate={() => setMobileOpen(false)} hideHeader />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Floating hamburger button for mobile */
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed left-3 top-3 z-40 rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
