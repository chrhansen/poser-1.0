import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import demoFrame from "@/assets/demo-frame.png";

interface DemoStep1Props {
  onComplete: () => void;
}

// Two skiers in the new frame — positions as percentages
const skiers = [
  { id: "front", label: "Front skier", x: 35, y: 62, cropX: 22, cropY: 42, cropW: 26, cropH: 40 },
  { id: "back", label: "Back skier", x: 52, y: 42, cropX: 40, cropY: 22, cropW: 24, cropH: 40 },
] as const;

const TARGET_ID = "front"; // correct skier

export function DemoStep1Select({ onComplete }: DemoStep1Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showGhost, setShowGhost] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const ghostTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    ghostTimerRef.current = setTimeout(() => setShowGhost(true), 2500);
    autoTimerRef.current = setTimeout(() => handleSelect(TARGET_ID), 4500);
    return () => {
      clearTimeout(ghostTimerRef.current);
      clearTimeout(autoTimerRef.current);
    };
  }, []);

  const handleSelect = (id: string) => {
    if (selected) return;
    setSelected(id);
    clearTimeout(ghostTimerRef.current);
    clearTimeout(autoTimerRef.current);
    setTimeout(() => onComplete(), 500);
  };

  const target = skiers.find((s) => s.id === TARGET_ID)!;

  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
      {/* Media area */}
      <div className="relative flex flex-col bg-accent/20 md:w-1/2 overflow-hidden">
        {/* Frame */}
        <div className="relative w-full flex-1 min-h-0">
          <img
            src={demoFrame}
            alt="Two skiers on slope — tap to select one"
            className="h-full w-full object-cover"
          />

          {/* Clickable target zones for each skier */}
          {skiers.map((skier) => (
            <button
              key={skier.id}
              onClick={() => handleSelect(skier.id)}
              className="absolute z-10 rounded-full focus:outline-none"
              style={{
                left: `${skier.x}%`,
                top: `${skier.y}%`,
                width: "16%",
                height: "32%",
                transform: "translate(-50%, -50%)",
              }}
              aria-label={`Select ${skier.label}`}
            />
          ))}

          {/* Pulsing rings around both skiers */}
          <AnimatePresence>
            {!selected &&
              skiers.map((skier) => (
                <motion.div
                  key={skier.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pointer-events-none absolute"
                  style={{
                    left: `${skier.x}%`,
                    top: `${skier.y}%`,
                    width: "14%",
                    height: "28%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 1],
                      opacity: [0.5, 0.15, 0.5],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full border-2 border-primary"
                  />
                  <div className="absolute inset-[15%] rounded-full border-2 border-primary/70" />
                </motion.div>
              ))}
          </AnimatePresence>

          {/* "Tap to select" label on target skier */}
          {!selected && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pointer-events-none absolute rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm"
              style={{
                left: `${target.x}%`,
                top: `${target.y + 18}%`,
                transform: "translateX(-50%)",
              }}
            >
              Tap to select
            </motion.div>
          )}

          {/* Ghost cursor */}
          <AnimatePresence>
            {showGhost && !selected && (
              <motion.div
                initial={{ opacity: 0, x: "70%", y: "80%" }}
                animate={{
                  opacity: [0, 0.7, 0.7],
                  x: `${target.x}%`,
                  y: `${target.y}%`,
                }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="pointer-events-none absolute z-20"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <div className="h-6 w-6 rounded-full border-2 border-foreground/50 bg-foreground/10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection confirmation chip */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute z-20 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg"
                style={{
                  left: `${skiers.find((s) => s.id === selected)!.x}%`,
                  top: `${skiers.find((s) => s.id === selected)!.y + 18}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <Check className="h-3 w-3" />
                Skier selected
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Thumbnail selectors */}
        <div className="flex gap-2 p-3 border-t border-border bg-background/60">
          {skiers.map((skier) => (
            <button
              key={skier.id}
              onClick={() => handleSelect(skier.id)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus:outline-none ${
                selected === skier.id
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border hover:border-primary/50"
              }`}
              aria-label={`Select ${skier.label}`}
            >
              {/* Cropped view of the skier from the frame */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${demoFrame})`,
                  backgroundSize: `${100 / (skier.cropW / 100)}% ${100 / (skier.cropH / 100)}%`,
                  backgroundPosition: `${(skier.cropX / (100 - skier.cropW)) * 100}% ${(skier.cropY / (100 - skier.cropH)) * 100}%`,
                }}
              />
              {selected === skier.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <Check className="h-4 w-4 text-primary-foreground drop-shadow" />
                </div>
              )}
            </button>
          ))}
          <span className="flex items-center text-xs text-muted-foreground ml-1">
            Select a skier
          </span>
        </div>
      </div>

      {/* Copy area */}
      <div className="flex flex-1 flex-col justify-between p-6 md:w-1/2">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Step 1
            </p>
            <h3 className="mt-1 text-xl font-bold text-foreground">
              Select the skier to analyze
            </h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Tap the skier you want Poser to track through the run.
          </p>

          <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            This is the only step you do in the demo.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => handleSelect(TARGET_ID)}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Auto-play demo
          </button>
        </div>
      </div>
    </div>
  );
}
