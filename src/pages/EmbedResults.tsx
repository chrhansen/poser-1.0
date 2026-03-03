import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

function ScoreCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

export default function EmbedResultsPage() {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    analysisService.getEmbedResult(token ?? "").then((r) => {
      if (!r) setError(true);
      else setResult(r);
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  }, [token]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><PageLoader /></div>;
  if (error || !result) return <div className="flex min-h-screen items-center justify-center bg-background"><PageError message="Result not found or link expired." /></div>;

  const m = result.metrics;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">Poser Analysis</h1>
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
            result.status === "complete" && "bg-secondary text-foreground",
            result.status === "processing" && "bg-accent/10 text-accent",
            result.status === "error" && "bg-destructive/10 text-destructive",
          )}>
            {result.status}
          </span>
        </div>

        {result.videoUrl ? (
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <video src={result.videoUrl} controls className="w-full" />
          </div>
        ) : (
          <div className="mt-4 flex h-40 items-center justify-center rounded-lg border border-border bg-secondary text-sm text-muted-foreground">
            Video preview unavailable
          </div>
        )}

        {result.status === "complete" && m && (
          <div className="mt-4 flex flex-wrap justify-center gap-4 rounded-xl border border-border p-4">
            <ScoreCard label="Edge Score" value={m.edgeSimilarity.overall} />
            <ScoreCard label="Cadence" value={`${m.turnCadence.tpmMedian} tpm`} />
            <ScoreCard label="Turns" value={m.turnSegments.length} />
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by <a href="/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Poser</a>
        </p>
      </div>
    </div>
  );
}
