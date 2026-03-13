import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import poserLogo from "@/assets/poser-logo.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BetaBadge } from "@/components/shared/BetaBadge";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog, type AuthContext } from "@/components/dialogs/AuthDialog";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authContext, setAuthContext] = useState<AuthContext>("signin");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const openAuth = (ctx: AuthContext) => {
    setAuthContext(ctx);
    setAuthOpen(true);
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  const scrollToDemo = () => {
    if (location.pathname === "/") {
      document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container relative flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <img src={poserLogo} alt="" className="h-6 w-auto" />
            poser
            <BetaBadge className="ml-1" />
          </Link>

          {/* Desktop nav — absolutely centered on the full width */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isHash = link.href.startsWith("/#");
              return isHash ? (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    location.pathname === link.href ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions — logged-out only on public pages */}
          {!user && (
            <div className="hidden items-center gap-3 md:flex">
              <button
                onClick={() => openAuth("signin")}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </button>
              <Button size="sm" onClick={scrollToDemo}>
                Try demo
              </Button>
            </div>
          )}

          {/* If user is logged in, show nothing extra here (sidebar handles it) */}
          {user && <div className="hidden md:block" />}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="border-t border-border bg-background px-6 pb-6 pt-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isHash = link.href.startsWith("/#");
                return isHash ? (
                  <button
                    key={link.href}
                    onClick={() => { setMobileOpen(false); handleNavClick(link.href); }}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground text-left"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                );
              })}
              {!user && (
                <div className="flex flex-col gap-2 border-t border-border pt-4">
                  <button
                    onClick={() => { setMobileOpen(false); openAuth("signin"); }}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground text-left"
                  >
                    Sign in
                  </button>
                  <Button size="sm" className="w-full" onClick={() => { setMobileOpen(false); scrollToDemo(); }}>
                    Try demo
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} context={authContext} />
    </>
  );
}
