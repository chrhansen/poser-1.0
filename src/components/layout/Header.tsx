import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import poserLogo from "@/assets/poser-logo.svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { LoginDialog } from "@/components/dialogs/LoginDialog";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

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

  const scrollToUpload = () => {
    if (location.pathname === "/") {
      document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <img src={poserLogo} alt="" className="h-5 w-auto" />
            poser
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
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

          <div className="hidden items-center gap-3 md:flex">
            {!loading && !user && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)}>
                  Log in
                </Button>
                <Button size="sm" asChild>
                  <Link to="/#upload" onClick={scrollToUpload}>Upload clip</Link>
                </Button>
              </>
            )}
            {!loading && user && (
              <>
                <Button size="sm" asChild>
                  <Link to="/#upload" onClick={scrollToUpload}>Upload clip</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="max-w-[120px] truncate">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/billing">Billing</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

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
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                {!user ? (
                  <>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => { setMobileOpen(false); setLoginOpen(true); }}>
                      Log in
                    </Button>
                    <Button size="sm" className="w-full" asChild>
                      <Link to="/#upload" onClick={() => setMobileOpen(false)}>Upload clip</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">Dashboard</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => { signOut(); setMobileOpen(false); }}>
                      Sign out
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
