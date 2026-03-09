import type { SubmetricScore } from "@/lib/types";
import { EvidenceTabs } from "./EvidenceTabs";
import type { AnalysisMetrics, TurnSegment } from "@/lib/types";

interface SubmetricDetailProps {
  submetric: SubmetricScore;
  activeEvidence: string;
  onEvidenceChange: (tab: string) => void;
  metrics?: AnalysisMetrics;
  duration?: number;
  selectedTurn: string | null;
  onTurnSelect: (turnId: string) => void;
}

export function SubmetricDetail({
  submetric, activeEvidence, onEvidenceChange, metrics, duration, selectedTurn, onTurnSelect,
}: SubmetricDetailProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-base font-bold text-foreground">{submetric.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Run-level result</p>
          </div>
          <span className="text-xl font-bold text-warm">{submetric.score}</span>
        </div>

        {/* Explanation blocks */}
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">What it is</p>
            <p className="mt-0.5 text-sm text-foreground">{submetric.whatItIs}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Why it matters</p>
            <p className="mt-0.5 text-sm text-foreground">{submetric.whyItMatters}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">What yours looked like</p>
            <p className="mt-0.5 text-sm text-foreground">{submetric.whatYoursLookedLike}</p>
          </div>
        </div>

        {/* Coaching card */}
        <div className="mt-4 rounded-lg border border-warm/10 bg-warm/[0.04] px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-warm">What to try</p>
          <p className="mt-0.5 text-sm text-foreground">{submetric.whatToTry}</p>
        </div>
      </div>

      {/* Evidence tabs */}
      <EvidenceTabs
        activeTab={activeEvidence}
        onTabChange={onEvidenceChange}
        metrics={metrics}
        duration={duration}
        selectedTurn={selectedTurn}
        onTurnSelect={onTurnSelect}
      />
    </div>
  );
}
