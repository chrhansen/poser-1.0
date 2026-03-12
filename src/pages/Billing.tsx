import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { billingService } from "@/services/billing.service";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import type { BillingInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AlertCircle, CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

type Currency = "usd" | "eur" | "gbp";
const currencySymbols: Record<Currency, string> = { usd: "$", eur: "€", gbp: "£" };
const currencyRates: Record<Currency, number> = { usd: 1, eur: 0.92, gbp: 0.79 };

function formatPrice(amount: number, currency: Currency) {
  return `${currencySymbols[currency]}${(amount * currencyRates[currency]).toFixed(2)}`;
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<Currency>("usd");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    billingService.getBillingInfo().then((b) => {
      setBilling(b);
      setCurrency(b.currency);
      setLoading(false);
    });
  }, []);

  const handleManage = async () => {
    // TODO_STRIPE_HOOKUP: Open Stripe Customer Portal
    setPortalLoading(true);
    const { url } = await billingService.createPortalSession();
    setPortalLoading(false);
    if (url !== "#") window.location.href = url;
    else toast.info("Stripe portal not yet connected.");
  };

  const handleCancel = async () => {
    setCancelling(true);
    await billingService.cancelSubscription();
    setCancelling(false);
    setCancelOpen(false);
    if (billing) setBilling({ ...billing, cancelAtPeriodEnd: true });
    toast.success("Subscription will cancel at period end.");
  };

  const handleResume = async () => {
    await billingService.resumeSubscription();
    if (billing) setBilling({ ...billing, cancelAtPeriodEnd: false });
    toast.success("Subscription resumed.");
  };

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (!billing) return <AppLayout><Section compact><p className="text-muted-foreground">Unable to load billing info.</p></Section></AppLayout>;

  const usagePct = billing.usageLimit > 0 ? Math.round((billing.usageCredits / billing.usageLimit) * 100) : 0;
  const hasFailedInvoice = billing.invoices.some((inv) => inv.status === "failed");

  return (
    <AppLayout>
      <Section>
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing</h1>
            {/* Currency toggle */}
            <div className="flex rounded-lg border border-border">
              {(["usd", "eur", "gbp"] as Currency[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium uppercase transition-colors",
                    currency === c ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Failed payment warning */}
          {hasFailedInvoice && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span className="text-muted-foreground">A payment has failed. Please update your payment method.</span>
              <Button variant="outline" size="sm" className="ml-auto shrink-0" onClick={handleManage}>
                Update
              </Button>
            </div>
          )}

          <div className="mt-8 space-y-6">
            {/* Usage meter */}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Usage this period</h2>
              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-foreground">{billing.usageCredits}</span>
                  <span className="text-sm text-muted-foreground">of {billing.usageLimit} analyses</span>
                </div>
                <Progress value={usagePct} className="mt-3 h-2" />
              </div>
            </div>

            {/* Current plan */}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Current plan</h2>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {billing.plan.name} — {formatPrice(billing.plan.price, currency)}/{billing.plan.interval}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {billing.cancelAtPeriodEnd
                  ? `Cancels on ${billing.nextBillingDate}`
                  : `Next billing: ${billing.nextBillingDate}`}
              </p>
              <div className="mt-4 flex gap-2">
                {/* TODO_STRIPE_HOOKUP */}
                <Button variant="outline" size="sm" onClick={handleManage} disabled={portalLoading}>
                  {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Manage subscription
                </Button>
                {billing.cancelAtPeriodEnd ? (
                  <Button variant="outline" size="sm" onClick={handleResume}>Resume</Button>
                ) : (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setCancelOpen(true)}>
                    Cancel plan
                  </Button>
                )}
              </div>
            </div>

            {/* Upgrade CTA for free plans */}
            {billing.plan.id === "free" && (
              <div className="rounded-xl border border-foreground bg-secondary p-6 text-center">
                <h3 className="text-lg font-semibold text-foreground">Upgrade to Pro</h3>
                <p className="mt-1 text-sm text-muted-foreground">Unlimited analyses, 4K support, and priority processing.</p>
                {/* TODO_STRIPE_HOOKUP */}
                <Button className="mt-4" asChild>
                  <Link to="/pricing">
                    See plans <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Payment method */}
            {billing.paymentMethod && (
              <div className="rounded-xl border border-border p-6">
                <h2 className="text-sm font-semibold text-foreground">Payment method</h2>
                <div className="mt-2 flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm capitalize text-muted-foreground">
                    {billing.paymentMethod.type} ending in {billing.paymentMethod.last4}
                  </p>
                </div>
                {/* TODO_STRIPE_HOOKUP */}
                <Button variant="outline" size="sm" className="mt-3" onClick={handleManage}>
                  Update payment method
                </Button>
              </div>
            )}

            {/* Invoices */}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Invoices</h2>
              {billing.invoices.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No invoices yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {billing.invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{inv.date}</span>
                      <span className="text-foreground">{formatPrice(inv.amount, currency)}</span>
                      <span className={cn(
                        "capitalize",
                        inv.status === "paid" && "text-foreground",
                        inv.status === "pending" && "text-accent",
                        inv.status === "failed" && "text-destructive"
                      )}>{inv.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      <ConfirmActionDialog
        open={cancelOpen} onOpenChange={setCancelOpen}
        title="Cancel subscription?" description="You'll retain access until the end of your billing period. You can resume anytime before then."
        confirmLabel={cancelling ? "Cancelling…" : "Cancel plan"} destructive onConfirm={handleCancel}
      />
    </AppLayout>
  );
}
