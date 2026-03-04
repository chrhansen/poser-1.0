import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { EmptyState } from "@/components/shared/EmptyState";
import { analysisService } from "@/services/analysis.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus, Clock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { NewAnalysisSheet } from "@/components/upload/NewAnalysisSheet";

const statusConfig: Record<AnalysisResult["status"], { icon: typeof Clock; label: string; cls: string }> = {
  pending: { icon: Clock, label: "Pending", cls: "text-muted-foreground" },
  processing: { icon: Loader2, label: "Processing", cls: "text-accent" },
  complete: { icon: CheckCircle, label: "Complete", cls: "text-foreground" },
  error: { icon: XCircle, label: "Failed", cls: "text-destructive" },
};

function ResultCard({ r }: { r: AnalysisResult }) {
  const { icon: Icon, label, cls } = statusConfig[r.status];
  const edgeScore = r.metrics?.edgeSimilarity?.overall;
  return (
    <Link
      to={`/results/${r.id}`}
      className="flex items-center justify-between rounded-xl border border-border p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-5 w-5 shrink-0", cls, r.status === "processing" && "animate-spin")} />
        <div>
          <p className="text-sm font-medium text-foreground">
            {r.status === "complete" && edgeScore != null ? `Edge: ${edgeScore}` : label}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(r.createdAt).toLocaleDateString()}
            {r.duration ? ` · ${r.duration}s` : ""}
          </p>
        </div>
      </div>
      <span className={cn("text-xs font-medium capitalize", cls)}>{label}</span>
    </Link>
  );
}

function ResultTableRow({ r }: { r: AnalysisResult }) {
  const { icon: Icon, label, cls } = statusConfig[r.status];
  const edgeScore = r.metrics?.edgeSimilarity?.overall;
  const turnCount = r.metrics?.turnSegments?.length ?? 0;
  return (
    <Link
      to={`/results/${r.id}`}
      className="grid grid-cols-5 items-center gap-4 border-b border-border px-4 py-3 text-sm transition-colors hover:bg-secondary/50 last:border-0"
    >
      <span className="text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
      <span className="flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", cls, r.status === "processing" && "animate-spin")} />
        <span className={cls}>{label}</span>
      </span>
      <span className="text-foreground">{r.status === "complete" && edgeScore != null ? edgeScore : "—"}</span>
      <span className="text-muted-foreground">{r.duration ? `${r.duration}s` : "—"}</span>
      <span className="text-muted-foreground">{turnCount > 0 ? `${turnCount} turns` : "—"}</span>
    </Link>
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
                {results.map((r) => <ResultCard key={r.id} r={r} />)}
              </div>

              {/* Desktop table */}
              <div className="mt-6 hidden overflow-hidden rounded-xl border border-border md:block">
                <div className="grid grid-cols-5 gap-4 border-b border-border bg-secondary/50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Date</span>
                  <span>Status</span>
                  <span>Edge Score</span>
                  <span>Duration</span>
                  <span>Turns</span>
                </div>
                {results.map((r) => <ResultTableRow key={r.id} r={r} />)}
              </div>
            </>
          )}
        </div>
      </Section>
      <NewAnalysisSheet open={newAnalysisOpen} onOpenChange={setNewAnalysisOpen} />
    </AppLayout>
  );
}
