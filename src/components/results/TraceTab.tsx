import type { AnalysisMetrics } from "@/lib/types";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface TraceTabProps {
  metrics: AnalysisMetrics;
}

export function TraceTab({ metrics }: TraceTabProps) {
  // Normalize into turn-phase view using angulation data
  const step = Math.max(1, Math.floor(metrics.angulation.length / 100));
  const chartData = metrics.angulation
    .filter((_, i) => i % step === 0)
    .map((f) => ({
      frame: f.frame,
      angulation: f.signed,
      counter: metrics.counter.find((c) => c.frame === f.frame)?.signed ?? 0,
    }));

  // Turn markers
  const turnMarkers = metrics.turnSegments.map((t) => t.apexFrame);

  return (
    <div>
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Full-run trace · Angulation & Counter
      </p>
      <p className="mb-3 text-[10px] text-muted-foreground">
        Vertical lines mark turn apexes. This is an advanced view.
      </p>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
              formatter={(val: number, name: string) => [`${val}°`, name === "angulation" ? "Angulation" : "Counter"]}
            />
            {turnMarkers.map((f) => (
              <ReferenceLine key={f} x={f} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            ))}
            <Area
              type="monotone"
              dataKey="angulation"
              stroke="hsl(var(--warm))"
              fill="hsl(var(--warm))"
              fillOpacity={0.06}
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="counter"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.04}
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
