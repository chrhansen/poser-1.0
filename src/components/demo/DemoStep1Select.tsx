import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import demoFrame from "@/assets/demo-frame.png";

interface DemoStep1Props {
  onComplete: () => void;
}

/**
 * Step 1 — Select the skier.
 * Shows a paused frame with a pulsing target ring around the skier.
 * User clicks the skier (or auto-selects after ~4.5s).
 */
export function DemoStep1Select({ onComplete }: DemoStep1Props) {
  const [selected, setSelected] = useState(false);
  const [showGhost, setShowGhost] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const ghostTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Target skier position (percentage-based for responsiveness)
  const target = { x: 38, y: 45 };

  useEffect(() => {
    // After 2.5s show ghost cursor
    ghostTimerRef.current = setTimeout(() => setShowGhost(true), 2500);
    // After 4.5s auto-select
    autoTimerRef.current = setTimeout(() => handleSelect(), 4500);
    return () => {
      clearTimeout(ghostTimerRef.current);
      clearTimeout(autoTimerRef.current);
    };
  }, []);

  const handleSelect = () => {
    if (selected) return;
    setSelected(true);
    clearTimeout(ghostTimerRef.current);
    clearTimeout(autoTimerRef.current);
    setTimeout(() => onComplete(), 500);
  };

  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
      {/* Media area */}
      <div className="relative flex items-center justify-center bg-accent/20 md:w-1/2 overflow-hidden">
        <div className="relative w-full h-48 md:h-full">
          <img
            src={demoFrame}
            alt="Skier on slope — tap to select"
            className="h-full w-full object-cover"
          />

          {/* Clickable target zone */}
          <button
            onClick={handleSelect}
            className="absolute z-10 rounded-full focus:outline-none"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: "18%",
              height: "36%",
              transform: "translate(-50%, -50%)",
            }}
            aria-label="Select this skier"
          />

          {/* Pulsing ring around target */}
          <AnimatePresence>
            {!selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-none absolute"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: "16%",
                  height: "32%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Outer pulse */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border-2 border-primary"
                />
                {/* Inner ring */}
                <div className="absolute inset-[15%] rounded-full border-2 border-primary/70" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* "Tap to select" label */}
          {!selected && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pointer-events-none absolute rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm"
              style={{
                left: `${target.x}%`,
                top: `${target.y + 22}%`,
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
                animate={{ opacity: [0, 0.7, 0.7], x: `${target.x}%`, y: `${target.y}%` }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="pointer-events-none absolute z-20"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                {/* Simple cursor indicator */}
                <div className="h-6 w-6 rounded-full border-2 border-foreground/50 bg-foreground/10" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection confirmation */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute z-20 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y + 22}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <Check className="h-3 w-3" />
                Skier selected
              </motion.div>
            )}
          </AnimatePresence>
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
            onClick={handleSelect}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Auto-play demo
          </button>
        </div>
      </div>
    </div>
  );
}
