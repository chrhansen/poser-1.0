import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Target, TrendingUp, ArrowRight, QrCode, Smartphone, Eye, AlertTriangle, Crosshair, BookOpen, Video, BarChart3 } from "lucide-react";
import { DemoAnalysisModal } from "@/components/demo/DemoAnalysisModal";
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
    title: "Upload a short clip",
    description: "Record and upload a video of you skiing.",
  },
  {
    icon: Target,
    title: "Poser analyzes the movement",
    description: "Poser estimates body position through the turn and looks for technique patterns.",
  },
  {
    icon: TrendingUp,
    title: "Get clear feedback",
    description: "See what looks strong, what looks off, and what to work on next.",
  },
];

type UploadTab = "demo" | "clip";

function DemoContent({ onStartDemo }: { onStartDemo: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
        <Target className="h-5 w-5 text-accent-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        See a sample run analyzed from start to finish
      </p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Watch how Poser goes from uploaded clip to movement breakdown to clear technique feedback.
      </p>
      <Button size="lg" onClick={onStartDemo}>
        Start demo analysis
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <p className="text-[11px] text-muted-foreground">No signup required</p>
    </div>
  );
}

function ClipContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center mb-2">
        <p className="text-sm font-medium text-foreground">Upload a short ski clip</p>
        <p className="text-xs text-muted-foreground mt-1">
          Drag and drop a clip from this device, or send one from your phone.
        </p>
      </div>
      <UploadBlock />
      <div className="relative flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
          <Smartphone className="h-5 w-5 text-accent-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Send from your phone</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Most ski videos live on your phone. Scan to upload there.
        </p>
        <div className="mt-1 flex h-28 w-28 items-center justify-center rounded-lg border border-border bg-accent">
          <QrCode className="h-14 w-14 text-accent-foreground/60" />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<UploadTab>("demo");
  const [demoOpen, setDemoOpen] = useState(false);

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
              <Button size="lg" onClick={() => {
                setActiveTab("demo");
                document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
              }}>
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
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Try Poser in under a minute
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start with a demo clip, or use your own.
            </p>
          </div>
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
            {activeTab === "demo" ? <DemoContent onStartDemo={() => setDemoOpen(true)} /> : <ClipContent />}
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section className="bg-surface-sunken scroll-mt-24" id="how-it-works">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            From clip to next-step feedback.
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <step.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Feedback section */}
      <Section>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Clear feedback, not just another video.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Poser helps you see the movement behind your turns and gives you something useful to work on next.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            { icon: Eye, title: "Visual breakdown", description: "See pose overlays and movement through the turn." },
            { icon: AlertTriangle, title: "Technique callouts", description: "Spot stance, balance, shin alignment, and body-position issues." },
            { icon: Crosshair, title: "One next focus", description: "Finish each analysis knowing what to try on your next run." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                <item.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Use cases */}
      <Section className="bg-surface-sunken">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            For the moments skiers get stuck.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            You can feel when a turn is off. Poser helps you see why.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Use it between lessons, after filming with friends, or anytime you want a clearer picture of your technique.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: BookOpen, title: "Between lessons" },
            { icon: Video, title: "After a filmed run" },
            { icon: BarChart3, title: "To track changes over time" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <item.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">{item.title}</p>
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
            See what to change before your next ski day.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Try a demo analysis or upload your own clip and get clearer technique feedback.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => {
              setActiveTab("demo");
              document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Try demo analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              setActiveTab("clip");
              document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Upload your clip
            </Button>
          </div>
        </motion.div>
      </Section>
      <DemoAnalysisModal open={demoOpen} onOpenChange={setDemoOpen} />
    </Layout>
  );
}
