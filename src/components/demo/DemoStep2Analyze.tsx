import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import demoFrame from "@/assets/demo-frame.png";

interface DemoStep2Props {
  onComplete: () => void;
}

const progressRows = [
  { label: "Tracking location of skier", duration: 2700 },
  { label: "Estimating body position in 3D", duration: 3000 },
  { label: "Measuring signals and calculating metrics", duration: 3300 },
  { label: "Generating feedback", duration: 2400 },
];

// Simple skeleton keypoints for the overlay (percentage-based)
const skeletonPoints = [
  { x: 38, y: 28 }, // head
  { x: 36, y: 36 }, // left shoulder
  { x: 40, y: 36 }, // right shoulder
  { x: 37, y: 46 }, // left hip
  { x: 40, y: 45 }, // right hip
  { x: 35, y: 55 }, // left knee
  { x: 42, y: 54 }, // right knee
  { x: 33, y: 63 }, // left ankle
  { x: 43, y: 62 }, // right ankle
];

const skeletonBones: [number, number][] = [
  [0, 1], [0, 2],   // head to shoulders
  [1, 2],            // shoulder span
  [1, 3], [2, 4],    // torso
  [3, 4],            // hip span
  [3, 5], [4, 6],    // upper legs
  [5, 7], [6, 8],    // lower legs
];

export function DemoStep2Analyze({ onComplete }: DemoStep2Props) {
  const [completedRows, setCompletedRows] = useState(0);
  const [activeRow, setActiveRow] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const showMetrics = activeRow >= 2;

  useEffect(() => {
    // Show skeleton after first row starts
    const skelTimer = setTimeout(() => setShowSkeleton(true), 600);

    // Sequentially complete rows
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [skelTimer];

    progressRows.forEach((row, i) => {
      // Start row
      const startTimer = setTimeout(() => setActiveRow(i), elapsed);
      timers.push(startTimer);
      elapsed += row.duration;
      // Complete row
      const endTimer = setTimeout(() => setCompletedRows(i + 1), elapsed);
      timers.push(endTimer);
    });

    // Move to step 3 after all done + small delay
    const finishTimer = setTimeout(() => onComplete(), elapsed + 600);
    timers.push(finishTimer);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
      {/* Media area — frame with skeleton overlay */}
      <div className="relative flex items-center justify-center bg-accent/20 md:w-1/2 overflow-hidden">
        <div className="relative w-full h-48 md:h-full">
          <img
            src={demoFrame}
            alt="Analysis in progress"
            className="h-full w-full object-cover"
          />

          {/* Scanning overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            className="absolute inset-0 bg-primary"
          />

          {/* Scan line */}
          <motion.div
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-px bg-primary/60"
          />

          {/* Skeleton overlay */}
          {showSkeleton && !showMetrics && (
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {skeletonBones.map(([a, b], i) => (
                <motion.line
                  key={`bone-${i}`}
                  x1={skeletonPoints[a].x}
                  y1={skeletonPoints[a].y}
                  x2={skeletonPoints[b].x}
                  y2={skeletonPoints[b].y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.9, 0.6] }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                />
              ))}
              {skeletonPoints.map((pt, i) => (
                <motion.circle
                  key={`joint-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="0.8"
                  fill="hsl(var(--primary))"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                />
              ))}
            </svg>
          )}

          {/* Metrics / math overlay */}
          {showMetrics && (
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Angle arc at knee */}
              <motion.path
                d="M 35 55 Q 37 50 39 46"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.4"
                strokeDasharray="1 0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 0.6 }}
              />
              <motion.path
                d="M 33 58 A 4 4 0 0 1 37 53"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
              <motion.text
                x="30"
                y="52"
                fontSize="2.8"
                fill="hsl(var(--primary))"
                fontFamily="monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7] }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                68°
              </motion.text>

              {/* Angle arc at hip */}
              <motion.path
                d="M 40 45 A 5 5 0 0 1 36 39"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
              <motion.text
                x="42"
                y="41"
                fontSize="2.8"
                fill="hsl(var(--primary))"
                fontFamily="monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7] }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                43°
              </motion.text>

              {/* Vertical plumb line (COM) */}
              <motion.line
                x1="38" y1="28" x2="38" y2="68"
                stroke="hsl(var(--primary))"
                strokeWidth="0.35"
                strokeDasharray="1.5 1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              />

              {/* Horizontal reference line */}
              <motion.line
                x1="28" y1="63" x2="48" y2="63"
                stroke="hsl(var(--primary))"
                strokeWidth="0.3"
                strokeDasharray="0.8 0.8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              />

              {/* Shin angle measurement */}
              <motion.line
                x1="35" y1="55" x2="33" y2="63"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              />
              <motion.text
                x="28"
                y="60"
                fontSize="2.5"
                fill="hsl(var(--primary))"
                fontFamily="monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.9, 0.6] }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                14°
              </motion.text>

              {/* Small ticks / measurement markers */}
              {[30, 34, 38, 42, 46].map((x, i) => (
                <motion.line
                  key={`tick-${i}`}
                  x1={x} y1="62.5" x2={x} y2="63.5"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                />
              ))}

              {/* Pulsing calculation dot */}
              <motion.circle
                cx="38" cy="46"
                r="1"
                fill="hsl(var(--primary))"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.3, 0.8], scale: [0.8, 1.2, 0.8, 1.2] }}
                transition={{ delay: 0.5, duration: 2, repeat: Infinity }}
              />
            </svg>
          )}
        </div>
      </div>

      {/* Copy area */}
      <div className="flex flex-1 flex-col justify-between p-6 md:w-1/2">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Step 2
            </p>
            <h3 className="mt-1 text-xl font-bold text-foreground">
              Poser is analyzing the clip
            </h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            We track the skier and estimate body position through the clip. Then
            we derive metrics and generate an overall technique feedback.
          </p>

          {/* Progress rows */}
          <div className="flex flex-col gap-2 mt-2">
            {progressRows.map((row, i) => {
              const done = i < completedRows;
              const active = i === activeRow && !done;
              return (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-5 w-5 items-center justify-center">
                    {done ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                      >
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </motion.div>
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-border" />
                    )}
                  </div>
                  <span
                    className={
                      done
                        ? "text-sm font-medium text-foreground"
                        : active
                        ? "text-sm font-medium text-foreground"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {row.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground/70">
          Demo shortened. Your own clip usually takes about 1–2 minutes.
        </p>
      </div>
    </div>
  );
}
