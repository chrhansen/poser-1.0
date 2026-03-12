import { cn } from "@/lib/utils";
import { HighlightsTab } from "./HighlightsTab";
import { TurnsTab } from "./TurnsTab";
import { TraceTab } from "./TraceTab";
import { ModelViewer } from "./ModelViewer";
import type { AnalysisMetrics } from "@/lib/types";

const TABS = [
  { id: "highlights", label: "Highlights" },
  { id: "turns", label: "Turns" },
  { id: "3d", label: "3D" },
  { id: "trace", label: "Trace" },
];

interface EvidenceTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  metrics?: AnalysisMetrics;
  duration?: number;
  selectedTurn: string | null;
  onTurnSelect: (turnId: string) => void;
}

export function EvidenceTabs({ activeTab, onTabChange, metrics, duration, selectedTurn, onTurnSelect }: EvidenceTabsProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border bg-secondary/30">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 px-3 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-accent text-foreground bg-card"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === "highlights" && (
          <HighlightsTab selectedTurn={selectedTurn} onTurnSelect={onTurnSelect} />
        )}
        {activeTab === "turns" && metrics && (
          <TurnsTab metrics={metrics} selectedTurn={selectedTurn} onTurnSelect={onTurnSelect} />
        )}
        {activeTab === "3d" && (
          <ModelViewer
            duration={duration ?? 10}
            currentTime={0}
            className="border-0"
          />
        )}
        {activeTab === "trace" && metrics && (
          <TraceTab metrics={metrics} />
        )}
      </div>
    </div>
  );
}
