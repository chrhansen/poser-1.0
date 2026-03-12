import type { AnalysisMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface TurnsTabProps {
  metrics: AnalysisMetrics;
  selectedTurn: string | null;
  onTurnSelect: (turnId: string) => void;
}

export function TurnsTab({ metrics, selectedTurn, onTurnSelect }: TurnsTabProps) {
  const barData = metrics.edgeSimilarity.perTurn.map((t) => {
    const segment = metrics.turnSegments.find((s) => s.id === t.turnId);
    return {
      turnId: t.turnId,
      label: t.turnId.replace("turn_", "T"),
      score: t.score,
      direction: segment?.direction ?? "left",
    };
  });

  const leftAvg = Math.round(
    barData.filter((d) => d.direction === "left").reduce((a, b) => a + b.score, 0) /
    Math.max(1, barData.filter((d) => d.direction === "left").length)
  );
  const rightAvg = Math.round(
    barData.filter((d) => d.direction === "right").reduce((a, b) => a + b.score, 0) /
    Math.max(1, barData.filter((d) => d.direction === "right").length)
  );
  const overallAvg = Math.round(barData.reduce((a, b) => a + b.score, 0) / Math.max(1, barData.length));

  return (
    <div>
      {/* Summary stats */}
      <div className="mb-4 flex gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-foreground">{overallAvg}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Overall</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{leftAvg}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Left avg</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{rightAvg}</p>
          <p className="text-[10px] text-muted-foreground uppercase">Right avg</p>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} onClick={(e) => {
            if (e?.activePayload?.[0]?.payload?.turnId) {
              onTurnSelect(e.activePayload[0].payload.turnId);
            }
          }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="label" tick={{ fontSize: 9 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
              formatter={(val: number) => [`${val}/100`, "Score"]}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} cursor="pointer">
              {barData.map((entry) => (
                <Cell
                  key={entry.turnId}
                  fill={selectedTurn === entry.turnId ? "hsl(var(--accent))" : "hsl(var(--accent-foreground))"}
                  opacity={selectedTurn && selectedTurn !== entry.turnId ? 0.4 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Direction labels */}
      <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Left turn</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent opacity-60" /> Right turn</span>
      </div>
    </div>
  );
}
