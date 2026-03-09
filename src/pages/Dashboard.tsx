import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { EmptyState } from "@/components/shared/EmptyState";
import { analysisService } from "@/services/analysis.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { AnalysisResult, SkiLimiter } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus, Clock, Loader2, CheckCircle, XCircle, RotateCcw, AlertTriangle } from "lucide-react";
import { NewAnalysisSheet } from "@/components/upload/NewAnalysisSheet";

const statusConfig: Record<AnalysisResult["status"], { icon: typeof Clock; label: string; cls: string }> = {
  pending: { icon: Clock, label: "Pending", cls: "text-muted-foreground" },
  processing: { icon: Loader2, label: "Processing", cls: "text-accent-foreground" },
  complete: { icon: CheckCircle, label: "Complete", cls: "text-foreground" },
  error: { icon: XCircle, label: "Failed", cls: "text-destructive" },
};

const limiterLabels: Record<SkiLimiter, string> = {
  balance: "Balance",
  pressure: "Pressure",
  edging: "Edging",
  rotary: "Rotary",
};

function formatClipMeta(r: AnalysisResult) {
  const date = new Date(r.createdAt).toLocaleDateString();
  const clip = r.clipLength ? `${r.clipLength}s clip` : null;
  return [date, clip].filter(Boolean).join(" · ");
}

function ResultCard({ r, onRetry }: { r: AnalysisResult; onRetry: (id: string) => void }) {
  const { icon: Icon, cls } = statusConfig[r.status];
  return (
    <div className="rounded-xl border border-border p-4 transition-shadow hover:shadow-md">
      <Link to={r.status === "error" ? "#" : `/results/${r.id}`} className="block">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={cn("h-5 w-5 shrink-0", cls, r.status === "processing" && "animate-spin")} />
            <div>
              {r.status === "complete" && r.skiRank != null ? (
                <p className="text-sm font-bold text-foreground">SkiRank {r.skiRank}</p>
              ) : (
                <p className={cn("text-sm font-medium", cls)}>{statusConfig[r.status].label}</p>
              )}
              <p className="text-xs text-muted-foreground">{formatClipMeta(r)}</p>
            </div>
          </div>
          {r.status === "complete" && r.biggestLimiter && (
            <span className="text-xs text-muted-foreground">
              Limiter: <span className="font-medium text-foreground">{limiterLabels[r.biggestLimiter]}</span>
            </span>
          )}
        </div>
      </Link>
      {r.status === "error" && (
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onRetry(r.id)}>
            <RotateCcw className="mr-1 h-3 w-3" /> Retry
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <Link to={`/results/${r.id}`}>
              <AlertTriangle className="mr-1 h-3 w-3" /> View issue
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function ResultTableRow({ r, onRetry }: { r: AnalysisResult; onRetry: (id: string) => void }) {
  const { icon: Icon, label, cls } = statusConfig[r.status];
  return (
    <div className="grid grid-cols-[1fr_1fr_1.2fr_auto] items-center gap-4 border-b border-border px-4 py-3 text-sm transition-colors hover:bg-secondary/50 last:border-0">
      {/* SkiRank + status */}
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", cls, r.status === "processing" && "animate-spin")} />
        {r.status === "complete" && r.skiRank != null ? (
          <span className="font-bold text-foreground">SkiRank {r.skiRank}</span>
        ) : (
          <span className={cls}>{label}</span>
        )}
      </div>

      {/* Date + clip length */}
      <span className="text-muted-foreground">{formatClipMeta(r)}</span>

      {/* Biggest limiter or error actions */}
      {r.status === "complete" && r.biggestLimiter ? (
        <span className="text-muted-foreground">
          Biggest limiter: <span className="font-medium text-foreground">{limiterLabels[r.biggestLimiter]}</span>
        </span>
      ) : r.status === "error" ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => { e.preventDefault(); onRetry(r.id); }}>
            <RotateCcw className="mr-1 h-3 w-3" /> Retry
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <Link to={`/results/${r.id}`}>
              <AlertTriangle className="mr-1 h-3 w-3" /> View issue
            </Link>
          </Button>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}

      {/* Link arrow for non-error rows */}
      {r.status !== "error" ? (
        <Link to={`/results/${r.id}`} className="text-muted-foreground hover:text-foreground">
          →
        </Link>
      ) : <span />}
    </div>
  );
}

export default function DashboardPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError(false);
    analysisService.getResults().then((r) => {
      setResults(r);
      setLoading(false);
    }).catch(() => {
      setError(true);
      setLoading(false);
    });
  };

  const handleRetry = (id: string) => {
    analysisService.rerunAnalysis(id).then(() => loadData());
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error) return <AppLayout><PageError message="Failed to load analyses." onRetry={loadData} /></AppLayout>;

  return (
    <AppLayout>
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <Button size="sm" onClick={() => setNewAnalysisOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> New analysis
            </Button>
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="No analyses yet"
              description="Upload a clip to get your first analysis."
              action={<Button onClick={() => setNewAnalysisOpen(true)}>Upload clip</Button>}
            />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="mt-6 space-y-3 md:hidden">
                {results.map((r) => <ResultCard key={r.id} r={r} onRetry={handleRetry} />)}
              </div>

              {/* Desktop table */}
              <div className="mt-6 hidden overflow-hidden rounded-xl border border-border md:block">
                <div className="grid grid-cols-[1fr_1fr_1.2fr_auto] gap-4 border-b border-border bg-secondary/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>SkiRank</span>
                  <span>Details</span>
                  <span>Insight</span>
                  <span />
                </div>
                {results.map((r) => <ResultTableRow key={r.id} r={r} onRetry={handleRetry} />)}
              </div>
            </>
          )}
        </div>
      </Section>
      <NewAnalysisSheet open={newAnalysisOpen} onOpenChange={setNewAnalysisOpen} />
    </AppLayout>
  );
}
