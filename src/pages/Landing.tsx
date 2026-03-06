import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Target, TrendingUp, ArrowRight, QrCode, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { UploadBlock } from "@/components/upload/UploadBlock";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-ski.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const steps = [
  {
    icon: Upload,
    title: "Upload your clip",
    description: "Record a short video of your skiing and upload it to Poser.",
  },
  {
    icon: Target,
    title: "Get analyzed",
    description: "Our AI breaks down your stance, balance, edging, and rotation.",
  },
  {
    icon: TrendingUp,
    title: "Improve",
    description: "Follow clear, actionable feedback to ski better next time out.",
  },
];

type UploadTab = "demo" | "clip";

function DemoContent() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Target className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        See Poser in action with a sample ski clip
      </p>
      <p className="text-xs text-muted-foreground max-w-xs">
        We'll run an analysis on a pre-recorded clip so you can see the kind of feedback you'll get.
      </p>
      <Button size="lg">
        Run demo analysis
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function ClipContent() {
  return (
    <div className="flex flex-col gap-6">
      <UploadBlock />
      <div className="relative flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Send from your phone</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Scan the QR code with your phone camera to upload a clip directly from your camera roll.
        </p>
        <div className="mt-1 flex h-28 w-28 items-center justify-center rounded-lg border border-border bg-secondary">
          <QrCode className="h-14 w-14 text-muted-foreground/60" />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<UploadTab>("demo");

  const scrollToUpload = () => {
    document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-sunken">
        <div className="container relative z-10 pb-16 pt-20 md:pb-24 md:pt-32">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl"
            >
              Know what to change in your skiing.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground"
            >
              Upload a short ski clip and Poser shows the stance and movement changes that matter most for better turns.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Button size="lg" onClick={scrollToUpload}>
                Try demo analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                setActiveTab("clip");
                document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
              }}>
                Upload your clip
              </Button>
            </motion.div>
            <motion.p
              variants={fadeUp}
              custom={3}
              className="mt-4 text-xs text-muted-foreground"
            >
              No sensors · short clip · results in minutes
            </motion.p>
          </motion.div>
        </div>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="container pb-8 md:pb-16"
        >
          <div className="overflow-hidden rounded-xl border border-border shadow-xl">
            <img
              src={heroImage}
              alt="Skier carving a turn on a mountain slope"
              className="w-full object-cover"
              style={{ maxHeight: "480px" }}
              loading="eager"
            />
          </div>
        </motion.div>
      </section>

      {/* Upload Section */}
      <Section>
        <div id="upload" className="scroll-mt-24 mx-auto max-w-xl">
          {/* Pill switch */}
          <div className="mx-auto mb-8 flex w-fit rounded-full bg-muted p-1">
            {(["demo", "clip"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "demo" ? "Try demo" : "Use my clip"}
              </button>
            ))}
          </div>

          {/* Card content */}
          <div className="rounded-2xl border border-border bg-card p-6">
            {activeTab === "demo" ? <DemoContent /> : <ClipContent />}
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section className="bg-surface-sunken">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Three simple steps to better skiing.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <step.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-lg text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Ready to improve?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start with a free analysis. No credit card required.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <a href="/pricing">
              See pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </Section>
    </Layout>
  );
}
