import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { ResultsDisplay } from "@/components/embed/steps/ResultsDisplay";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult } from "@/lib/types";

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
        <ResultsDisplay
          videoUrl={result.videoUrl}
          edgeSimilarity={m?.edgeSimilarity.overall ?? 0}
          turnsAnalyzed={m?.turnSegments.length ?? 0}
        />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by <a href="/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Poser</a>
        </p>
      </div>
    </div>
  );
}
