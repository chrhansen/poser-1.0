import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { billingService } from "@/services/billing.service";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { BillingInfo } from "@/lib/types";
import { ArrowRight, Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingService.getBillingInfo().then((b) => {
      setBilling(b);
      setLoading(false);
    });
  }, []);

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (!billing) return <AppLayout><Section compact><p className="text-muted-foreground">Unable to load billing info.</p></Section></AppLayout>;

  const remaining = billing.analysesTotal - billing.analysesUsed;
  const usagePct = billing.analysesTotal > 0 ? Math.round((billing.analysesUsed / billing.analysesTotal) * 100) : 0;
  const isFreeTier = billing.currentPack.id === "free";
  const isSeasonPass = billing.currentPack.id === "max";

  return (
    <AppLayout>
      <Section compact>
        <div className="mx-auto max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing</h1>

          <div className="mt-8 space-y-6">
            {/* Analyses remaining */}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Analyses</h2>
              <div className="mt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-foreground">{remaining} remaining</span>
                  <span className="text-sm text-muted-foreground">{billing.analysesUsed} of {billing.analysesTotal} used</span>
                </div>
                <Progress value={usagePct} className="mt-3 h-2" />
              </div>
            </div>

            {/* Current pack */}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Current pack</h2>
              <p className="mt-1 text-2xl font-bold text-foreground">{billing.currentPack.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isFreeTier
                  ? "3 free analyses included with every account"
                  : `$${billing.currentPack.price} · one-time purchase`}
              </p>
            </div>

            {/* Upgrade CTA */}
            {!isSeasonPass && (
              <div className="rounded-xl border border-foreground bg-secondary p-6 text-center">
                <h3 className="text-lg font-semibold text-foreground">
                  {isFreeTier ? "Get more analyses" : "Upgrade to Season Pass"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isFreeTier
                    ? "Purchase a Trip Pack or Season Pass to analyze more clips."
                    : "25 analyses for $69. Unused Trip Pack analyses carry over."}
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/pricing">See packs <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            )}

            {/* Purchase history */}
            <div className="rounded-xl border border-border p-6">
              <h2 className="text-sm font-semibold text-foreground">Purchase history</h2>
              {billing.purchases.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No purchases yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {billing.purchases.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{p.packName}</span>
                      </div>
                      <span className="text-muted-foreground">{p.date}</span>
                      <span className="text-foreground">${p.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>
    </AppLayout>
  );
}
