import { AlertTriangle, Trophy, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface HighlightsTabProps {
  selectedTurn: string | null;
  onTurnSelect: (turnId: string) => void;
}

const highlights = [
  { id: "weakest", turnId: "turn_3", label: "Weakest turn", description: "Late edge build on this right turn.", icon: AlertTriangle },
  { id: "best", turnId: "turn_5", label: "Best turn", description: "Cleaner stance and earlier edging.", icon: Trophy },
  { id: "representative", turnId: "turn_2", label: "Most representative", description: "This turn shows your typical pattern.", icon: Eye },
];

export function HighlightsTab({ selectedTurn, onTurnSelect }: HighlightsTabProps) {
  return (
    <div className="space-y-3">
      {highlights.map((h) => {
        const Icon = h.icon;
        const active = selectedTurn === h.turnId;
        return (
          <button
            key={h.id}
            onClick={() => onTurnSelect(h.turnId)}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all",
              active ? "border-accent/30 bg-accent/[0.04]" : "border-border hover:border-border/80 hover:shadow-sm"
            )}
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{h.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{h.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
