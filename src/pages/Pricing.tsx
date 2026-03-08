import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/shared/PageLoader";
import { pricingService } from "@/services/pricing.service";
import type { PricingPlan, PricingFAQ } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [faqs, setFaqs] = useState<PricingFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { hash } = useLocation();

  useEffect(() => {
    Promise.all([pricingService.getPlans(), pricingService.getFAQs()]).then(([p, f]) => {
      setPlans(p);
      setFaqs(f);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [loading, hash]);

  if (loading) return <Layout><PageLoader /></Layout>;

  const getCtaHref = (plan: PricingPlan) => {
    if (plan.id === "free") return user ? "/dashboard" : "/#upload";
    return user ? "/billing" : "/#upload";
  };

  return (
    <Layout>
      {/* Plan comparison */}
      <Section>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Simple, transparent pricing</h1>
          <p className="mt-3 text-muted-foreground">Start free. Upgrade when you're ready.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-xl border p-6",
                plan.highlighted ? "border-foreground shadow-lg" : "border-border"
              )}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-block self-start rounded-full bg-foreground px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-foreground">{plan.price === 0 ? "Free" : `$${plan.price}`}</span>
                {plan.interval !== "one-time" && (
                  <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                )}
                {plan.interval === "one-time" && plan.price > 0 && (
                  <span className="text-sm text-muted-foreground"> one-time</span>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    {f}
                  </li>
                ))}
              </ul>
              {/* TODO_STRIPE_HOOKUP: Wire CTA to Stripe Checkout */}
              <Button variant={plan.highlighted ? "default" : "outline"} className="mt-6" asChild>
                <Link to={getCtaHref(plan)}>
                  {plan.ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <Section className="bg-surface-sunken" id="faq">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="mt-8">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                  {faq.id === "faq6" ? (
                      <>Yes! <a href="/#upload" className="underline text-foreground hover:text-foreground/80">Try the demo here</a>.</>
                    ) : (
                      faq.answer
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      )}
    </Layout>
  );
}
