import { motion } from "framer-motion";
import { ArrowRight, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import demoFrame from "@/assets/demo-frame.png";

interface DemoStep3Props {
  onReplay: () => void;
  onClose: () => void;
}

const metrics = [
  {
    label: "Edge match",
    value: "Stable through most of the turn",
    color: "bg-primary/15 text-primary",
  },
  {
    label: "Balance over feet",
    value: "Slightly back at transition",
    color: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  {
    label: "Turn rhythm",
    value: "Consistent",
    color: "bg-primary/15 text-primary",
  },
];

export function DemoStep3Feedback({ onReplay, onClose }: DemoStep3Props) {
  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
      {/* Media area — analyzed frame with metric overlays */}
      <div className="relative flex flex-col bg-accent/20 md:w-1/2 overflow-hidden">
        <div className="relative flex-1 min-h-[180px]">
          <img
            src={demoFrame}
            alt="Analyzed skier frame"
            className="h-full w-full object-cover"
          />

          {/* Dark overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />

          {/* Metric callouts overlaid on image */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
            {metrics.slice(0, 2).map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="flex items-center gap-2 rounded-lg bg-background/90 backdrop-blur-sm px-3 py-2 shadow-sm"
              >
                <div className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${m.color}`}>
                  {m.label}
                </div>
                <span className="text-xs text-foreground">{m.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Copy area */}
      <div className="flex flex-1 flex-col justify-between p-6 md:w-1/2">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Step 3
            </p>
            <h3 className="mt-1 text-xl font-bold text-foreground">
              Here's the kind of feedback you'll get
            </h3>
          </div>

          {/* Next focus card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
              Next focus
            </p>
            <p className="text-sm font-semibold text-foreground">
              Move forward earlier through turn initiation
            </p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              This helps you stay more centered and build pressure earlier in the
              turn.
            </p>
          </motion.div>

          {/* Third metric */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
          >
            <div className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${metrics[2].color}`}>
              {metrics[2].label}
            </div>
            <span className="text-xs text-foreground">{metrics[2].value}</span>
          </motion.div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={() =>
              window.open("/results/sample", "_blank")
            }
          >
            See full sample report
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload your clip
          </Button>

          <button
            onClick={onReplay}
            className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Replay demo
          </button>
        </div>
      </div>
    </div>
  );
}
