import { Link } from "react-router-dom";
import { useState } from "react";
import { AuthDialog, type AuthContext } from "@/components/dialogs/AuthDialog";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/pricing#faq" },
      { label: "Integrations", href: "/integrations" },
      { label: "Releases", href: "/releases" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const accountLinks: { label: string; context: AuthContext }[] = [
  { label: "Sign in", context: "signin" },
  { label: "Create account", context: "signup" },
];

export function Footer() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authContext, setAuthContext] = useState<AuthContext>("signin");

  const openAuth = (ctx: AuthContext) => {
    setAuthContext(ctx);
    setAuthOpen(true);
  };

  return (
    <>
      <footer className="border-t border-border bg-surface-sunken">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="text-lg font-bold tracking-tight text-foreground">
                poser
              </Link>
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Ski better with clear, AI-powered technique feedback.
              </p>
            </div>
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-foreground">{group.title}</h4>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {/* Account section */}
            <div>
              <h4 className="text-sm font-semibold text-foreground">Account</h4>
              <ul className="mt-3 space-y-2">
                {accountLinks.map((item) => (
                  <li key={item.context}>
                    <button
                      onClick={() => openAuth(item.context)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Poser. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} context={authContext} />
    </>
  );
}
