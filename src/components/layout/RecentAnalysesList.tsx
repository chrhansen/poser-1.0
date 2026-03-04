import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult } from "@/lib/types";
import { Clock, Loader2, CheckCircle, XCircle } from "lucide-react";

const statusIcons: Record<AnalysisResult["status"], { icon: typeof Clock; cls: string }> = {
  pending: { icon: Clock, cls: "text-muted-foreground" },
  processing: { icon: Loader2, cls: "text-accent" },
  complete: { icon: CheckCircle, cls: "text-foreground" },
  error: { icon: XCircle, cls: "text-destructive" },
};

function StatusBadge({ status }: { status: AnalysisResult["status"] }) {
  const { icon: Icon, cls } = statusIcons[status];
  return <Icon className={cn("h-3.5 w-3.5", cls, status === "processing" && "animate-spin")} />;
}

export function RecentAnalysesList() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const { id: currentId } = useParams<{ id: string }>();

  useEffect(() => {
    analysisService.getResults().then(setResults).catch(() => {});
  }, []);

  if (results.length === 0) return null;

  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Recent analyses
      </h3>
      <div className="mt-2 space-y-1.5">
        {results.map((r) => (
          <Link
            key={r.id}
            to={`/results/${r.id}`}
            className={cn(
              "block rounded-lg border p-2.5 text-sm transition-colors",
              r.id === currentId
                ? "border-foreground/30 bg-secondary"
                : "border-border hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center justify-between">
              <StatusBadge status={r.status} />
              {r.status === "complete" && r.metrics && (
                <span className="text-xs font-bold text-foreground">
                  {r.metrics.edgeSimilarity.overall}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {new Date(r.createdAt).toLocaleDateString()}
              {r.duration ? ` · ${r.duration}s` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
