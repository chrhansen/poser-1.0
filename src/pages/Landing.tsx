import { motion } from "framer-motion";
import { Upload, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { UploadBlock } from "@/components/upload/UploadBlock";
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

export default function LandingPage() {
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
              Upload a ski clip. Get clear feedback on what to change next.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground"
            >
              Poser analyzes your stance and movement, then highlights the body-position changes that matter most for better turns.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Button size="lg" onClick={scrollToUpload}>
                Try a demo analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about">Learn more</Link>
              </Button>
            </motion.div>
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
        <div className="mx-auto max-w-xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Try it now
            </h2>
            <p className="mt-2 text-muted-foreground">
              Upload a clip and get your analysis in minutes.
            </p>
          </div>
          <UploadBlock />
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
            <Link to="/pricing">
              See pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </Section>
    </Layout>
  );
}
