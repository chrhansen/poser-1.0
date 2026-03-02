import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { ContactSupportDialog } from "@/components/dialogs/ContactSupportDialog";
import { ModelViewer } from "@/components/results/ModelViewer";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, Maximize2, Minimize2, Download, RefreshCw, Trash2, Plus,
  AlertTriangle, Clock, CheckCircle, XCircle, HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Score Ring ─────────────────────────────────────────────────────────────
function ScoreRing({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "text-accent" : score >= 60 ? "text-foreground" : "text-destructive";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("flex h-16 w-16 items-center justify-center rounded-full border-2 border-border text-xl font-bold", color)}>
        {score}
      </div>
      <span className="text-xs capitalize text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AnalysisResult["status"] }) {
  const config = {
    pending: { icon: Clock, label: "Pending", cls: "text-muted-foreground bg-muted" },
    processing: { icon: Loader2, label: "Processing", cls: "text-accent bg-accent/10" },
    complete: { icon: CheckCircle, label: "Complete", cls: "text-foreground bg-secondary" },
    error: { icon: XCircle, label: "Failed", cls: "text-destructive bg-destructive/10" },
  }[status];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", config.cls)}>
      <Icon className={cn("h-3 w-3", status === "processing" && "animate-spin")} />
      {config.label}
    </span>
  );
}

// ─── Recent Analyses Sidebar ────────────────────────────────────────────────
function RecentSidebar({ results, currentId }: { results: AnalysisResult[]; currentId: string }) {
  return (
    <div className="hidden w-64 shrink-0 border-r border-border p-4 xl:block">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent analyses</h3>
      <div className="mt-3 space-y-2">
        {results.map((r) => (
          <Link
            key={r.id}
            to={`/results/${r.id}`}
            className={cn(
              "block rounded-lg border p-3 text-sm transition-colors",
              r.id === currentId ? "border-foreground bg-secondary" : "border-border hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center justify-between">
              <StatusBadge status={r.status} />
              {r.status === "complete" && (
                <span className="text-xs font-bold text-foreground">{r.scores.overall}</span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {new Date(r.createdAt).toLocaleDateString()}
              {r.duration ? ` · ${r.duration}s` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Edge Similarity Chart ──────────────────────────────────────────────────
function EdgeSimilarityChart({ data }: { data: number[] }) {
  const chartData = data.map((val, i) => ({ frame: i + 1, similarity: Math.round(val * 100) }));
  return (
    <div className="rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground">Edge Similarity by Frame</h3>
      <div className="mt-3" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="frame" tick={{ fontSize: 10 }} className="text-muted-foreground" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
              formatter={(val: number) => [`${val}%`, "Similarity"]}
            />
            <Area type="monotone" dataKey="similarity" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main Results Page ──────────────────────────────────────────────────────
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [allResults, setAllResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [theater, setTheater] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [r, all] = await Promise.all([
        analysisService.getResult(id ?? ""),
        analysisService.getResults(),
      ]);
      if (!r) { setError(true); setLoading(false); return; }
      setResult(r);
      setAllResults(all);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    loadData();
  }, [loadData]);

  // Polling for processing/pending status
  useEffect(() => {
    if (!result || (result.status !== "processing" && result.status !== "pending")) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      const updated = await analysisService.pollResult(result.id);
      if (updated) setResult(updated);
      if (updated && (updated.status === "complete" || updated.status === "error")) {
        clearInterval(pollRef.current);
      }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [result?.id, result?.status]);

  const handleDelete = async () => {
    if (!result) return;
    await analysisService.deleteResult(result.id);
    toast.success("Analysis deleted.");
    navigate("/dashboard");
  };

  const handleRerun = async () => {
    if (!result) return;
    await analysisService.rerunAnalysis(result.id);
    toast.success("Re-running analysis…");
    setResult({ ...result, status: "processing", progress: 0, failedReason: undefined });
  };

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error || !result) return <AppLayout><PageError message="Result not found." onRetry={loadData} /></AppLayout>;

  // ── Pending state ──
  if (result.status === "pending") {
    return (
      <AppLayout>
        <div className="flex flex-1">
          <RecentSidebar results={allResults} currentId={result.id} />
          <div className="flex-1">
            <Section>
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Clock className="h-10 w-10 text-muted-foreground" />
                <h1 className="text-2xl font-bold text-foreground">Queued for analysis</h1>
                <p className="text-muted-foreground">Your clip is in the queue. Analysis will begin shortly.</p>
              </div>
            </Section>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Processing state ──
  if (result.status === "processing") {
    return (
      <AppLayout>
        <div className="flex flex-1">
          <RecentSidebar results={allResults} currentId={result.id} />
          <div className="flex-1">
            <Section>
              <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-accent" />
                <h1 className="text-2xl font-bold text-foreground">Analyzing your clip…</h1>
                <p className="text-muted-foreground">This usually takes 1–2 minutes.</p>
                <div className="w-full">
                  <Progress value={result.progress ?? 0} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">{result.progress ?? 0}% complete</p>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Failed state ──
  if (result.status === "error") {
    return (
      <AppLayout>
        <div className="flex flex-1">
          <RecentSidebar results={allResults} currentId={result.id} />
          <div className="flex-1">
            <Section>
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-10 w-10 text-destructive" />
                <h1 className="text-2xl font-bold text-foreground">Analysis failed</h1>
                <p className="text-sm text-muted-foreground">{result.failedReason ?? "An unexpected error occurred."}</p>
                <div className="flex gap-3">
                  <Button onClick={handleRerun}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Re-run analysis
                  </Button>
                  <Button variant="outline" onClick={() => setSupportOpen(true)}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Contact support
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete analysis
                </Button>
              </div>
            </Section>
          </div>
        </div>
        <ConfirmActionDialog
          open={deleteOpen} onOpenChange={setDeleteOpen}
          title="Delete analysis?" description="This action cannot be undone."
          confirmLabel="Delete" destructive onConfirm={handleDelete}
        />
        <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
      </AppLayout>
    );
  }

  // ── Complete state ──

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) setVideoTime(videoRef.current.currentTime);
  };
  const handleVideoPlay = () => setVideoPlaying(true);
  const handleVideoPause = () => setVideoPlaying(false);
  const handleModelSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoTime(time);
    }
  };

  const metricsCards = [
    { label: "Overall", value: result.scores.overall },
    { label: "Stance", value: result.scores.stance },
    { label: "Balance", value: result.scores.balance },
    { label: "Edging", value: result.scores.edging },
    { label: "Rotation", value: result.scores.rotation },
  ];

  return (
    <AppLayout>
      <div className="flex flex-1">
        <RecentSidebar results={allResults} currentId={result.id} />
        <div className="flex-1 overflow-auto">
          <Section>
            <div className={cn("mx-auto", theater ? "max-w-6xl" : "max-w-2xl")}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Results</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(result.createdAt).toLocaleDateString()}
                    {result.duration ? ` · ${result.duration}s clip` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setTheater(!theater)} aria-label="Toggle theater mode">
                    {theater ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" aria-label="Download results">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/#upload")}>
                    <Plus className="mr-1 h-4 w-4" /> New
                  </Button>
                </div>
              </div>

              {/* Video + Model panels */}
              <div className={cn("mt-6 grid gap-4", theater ? "md:grid-cols-2" : "grid-cols-1")}>
                <div className="overflow-hidden rounded-xl border border-border bg-secondary">
                  {result.videoUrl ? (
                    <video
                      ref={videoRef}
                      src={result.videoUrl}
                      controls
                      className="w-full"
                      onTimeUpdate={handleVideoTimeUpdate}
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                      Video preview unavailable
                    </div>
                  )}
                </div>
                {theater && (
                  <ModelViewer
                    duration={result.duration ?? 10}
                    currentTime={videoTime}
                    onSeek={handleModelSeek}
                    isPlaying={videoPlaying}
                    modelUrl={result.modelUrl}
                  />
                )}
              </div>

              {/* Score cards */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 rounded-xl border border-border bg-surface-sunken p-6">
                {metricsCards.map((m) => (
                  <ScoreRing key={m.label} label={m.label} score={m.value} />
                ))}
              </div>

              {/* Edge similarity chart */}
              {result.edgeSimilarity && result.edgeSimilarity.length > 0 && (
                <div className="mt-6">
                  <EdgeSimilarityChart data={result.edgeSimilarity} />
                </div>
              )}

              {/* Feedback */}
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Feedback</h2>
                {result.feedback.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No feedback items available.</p>
                ) : (
                  result.feedback.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-lg border p-4",
                        item.severity === "critical" && "border-destructive/30 bg-destructive/5",
                        item.severity === "warning" && "border-accent/30 bg-accent/5",
                        item.severity === "info" && "border-border"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "inline-block h-2 w-2 rounded-full",
                          item.severity === "critical" && "bg-destructive",
                          item.severity === "warning" && "bg-accent",
                          item.severity === "info" && "bg-muted-foreground"
                        )} />
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                        {item.timestamp !== undefined && (
                          <span className="ml-auto text-xs text-muted-foreground">@{item.timestamp.toFixed(1)}s</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3 border-t border-border pt-6">
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSupportOpen(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" /> Support
                </Button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <ConfirmActionDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        title="Delete analysis?" description="This will permanently remove this analysis and all associated data."
        confirmLabel="Delete" destructive onConfirm={handleDelete}
      />
      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </AppLayout>
  );
}
