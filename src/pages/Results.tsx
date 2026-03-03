import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { ContactSupportDialog } from "@/components/dialogs/ContactSupportDialog";
import { ModelViewer } from "@/components/results/ModelViewer";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult, AnalysisMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2, Maximize2, Minimize2, Download, RefreshCw, Trash2, Plus,
  AlertTriangle, Clock, CheckCircle, XCircle, HelpCircle, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

// ─── Shared chart wrapper ───────────────────────────────────────────────────
function MetricChart({ children, height = 160 }: { children: React.ReactNode; height?: number }) {
  return (
    <div className="mt-3" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

// ─── Metric Section (collapsible) ───────────────────────────────────────────
function MetricSection({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-secondary/50">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{summary}</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 rounded-lg border border-border p-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Overview stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border p-3 text-center">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
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
              {r.status === "complete" && r.metrics && (
                <span className="text-xs font-bold text-foreground">{r.metrics.edgeSimilarity.overall}</span>
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

// ─── Metrics drill-down panels ──────────────────────────────────────────────

function ShinParallelPanel({ m }: { m: AnalysisMetrics }) {
  const avgScore = Math.round(m.shinParallel.reduce((a, b) => a + b.parallelismScore, 0) / m.shinParallel.length);
  // Downsample for chart: every Nth frame
  const step = Math.max(1, Math.floor(m.shinParallel.length / 80));
  const chartData = m.shinParallel.filter((_, i) => i % step === 0).map((f) => ({
    frame: f.frame,
    score: f.parallelismScore,
    angle: Math.round(f.shinAngle * 10) / 10,
  }));
  return (
    <MetricSection title="Shin Parallel" summary={`Avg parallelism: ${avgScore}/100`}>
      <MetricChart>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number, name: string) => [name === "score" ? `${val}/100` : `${val}°`, name === "score" ? "Parallelism" : "Shin Angle"]} />
          <Area type="monotone" dataKey="score" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={2} />
        </AreaChart>
      </MetricChart>
    </MetricSection>
  );
}

function COMPanel({ m }: { m: AnalysisMetrics }) {
  const step = Math.max(1, Math.floor(m.com.length / 80));
  const chartData = m.com.filter((_, i) => i % step === 0).map((f) => ({
    frame: f.frame,
    x: Math.round(f.x * 100) / 100,
    y: Math.round(f.y * 100) / 100,
  }));
  return (
    <MetricSection title="Center of Mass" summary="3D position (x, y, z) per frame">
      <MetricChart>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
          <Line type="monotone" dataKey="x" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} name="X" />
          <Line type="monotone" dataKey="y" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="Y" />
        </LineChart>
      </MetricChart>
    </MetricSection>
  );
}

function AngulationPanel({ m }: { m: AnalysisMetrics }) {
  const avgAbs = Math.round(m.angulation.reduce((a, b) => a + b.absolute, 0) / m.angulation.length * 10) / 10;
  const step = Math.max(1, Math.floor(m.angulation.length / 80));
  const chartData = m.angulation.filter((_, i) => i % step === 0).map((f) => ({
    frame: f.frame,
    degrees: f.signed,
  }));
  return (
    <MetricSection title="Angulation" summary={`Avg ${avgAbs}° upper/lower body separation`}>
      <MetricChart>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number) => [`${val}°`, "Angulation"]} />
          <Area type="monotone" dataKey="degrees" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={2} />
        </AreaChart>
      </MetricChart>
    </MetricSection>
  );
}

function CounterPanel({ m }: { m: AnalysisMetrics }) {
  const avgAbs = Math.round(m.counter.reduce((a, b) => a + b.absolute, 0) / m.counter.length * 10) / 10;
  const step = Math.max(1, Math.floor(m.counter.length / 80));
  const chartData = m.counter.filter((_, i) => i % step === 0).map((f) => ({
    frame: f.frame,
    degrees: f.signed,
  }));
  return (
    <MetricSection title="Counter-Rotation" summary={`Avg ${avgAbs}° torso–pelvis separation`}>
      <MetricChart>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number) => [`${val}°`, "Counter"]} />
          <Area type="monotone" dataKey="degrees" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" fillOpacity={0.05} strokeWidth={2} />
        </AreaChart>
      </MetricChart>
    </MetricSection>
  );
}

function AngVsIncPanel({ m }: { m: AnalysisMetrics }) {
  const step = Math.max(1, Math.floor(m.angulationVsInclination.length / 80));
  const chartData = m.angulationVsInclination.filter((_, i) => i % step === 0).map((f) => ({
    frame: f.frame,
    lower: f.lowerBodyLean,
    upper: f.upperBodyLean,
  }));
  return (
    <MetricSection title="Angulation vs Inclination" summary="Lower-body lean vs upper-body lean">
      <MetricChart>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number, name: string) => [`${val}°`, name === "lower" ? "Lower Body" : "Upper Body"]} />
          <Line type="monotone" dataKey="lower" stroke="hsl(var(--accent))" strokeWidth={1.5} dot={false} name="lower" />
          <Line type="monotone" dataKey="upper" stroke="hsl(var(--foreground))" strokeWidth={1.5} dot={false} name="upper" />
        </LineChart>
      </MetricChart>
    </MetricSection>
  );
}

function TurnSegmentsPanel({ m }: { m: AnalysisMetrics }) {
  const chartData = m.turnSegments.map((t) => ({
    turn: t.id.replace("turn_", "#"),
    duration: t.durationMs,
    dir: t.direction,
  }));
  return (
    <MetricSection title="Turn Segments" summary={`${m.turnSegments.length} turns detected`}>
      <div className="mb-3 flex flex-wrap gap-2">
        {m.turnSegments.map((t) => (
          <span key={t.id} className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            t.direction === "left" ? "bg-accent/10 text-accent" : "bg-secondary text-foreground"
          )}>
            {t.direction === "left" ? "L" : "R"} · {t.durationMs}ms
          </span>
        ))}
      </div>
      <MetricChart height={120}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="turn" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number) => [`${val}ms`, "Duration"]} />
          <Bar dataKey="duration" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
        </BarChart>
      </MetricChart>
    </MetricSection>
  );
}

function EdgeSimilarityPanel({ m }: { m: AnalysisMetrics }) {
  const e = m.edgeSimilarity;
  return (
    <MetricSection title="Edge Similarity" summary={`Overall: ${e.overall} · Left: ${e.left} · Right: ${e.right}`} defaultOpen>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Overall" value={e.overall} />
        <StatCard label="Left" value={e.left} />
        <StatCard label="Right" value={e.right} />
      </div>
      {e.perTurn.length > 0 && (
        <MetricChart height={120}>
          <BarChart data={e.perTurn.map((t) => ({ turn: t.turnId.replace("turn_", "#"), score: t.score }))}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="turn" tick={{ fontSize: 9 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
              formatter={(val: number) => [`${val}/100`, "Edge Score"]} />
            <Bar dataKey="score" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
          </BarChart>
        </MetricChart>
      )}
    </MetricSection>
  );
}

function TurnCadencePanel({ m }: { m: AnalysisMetrics }) {
  const c = m.turnCadence;
  return (
    <MetricSection title="Turn Cadence" summary={`${c.tpmMedian} tpm median · CV ${c.turnDurationCv}`}>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Median TPM" value={c.tpmMedian} />
        <StatCard label="Peak 6 TPM" value={c.tpmPeak6} />
        <StatCard label="Duration CV" value={c.turnDurationCv} sub="lower = more consistent" />
      </div>
    </MetricSection>
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

  useEffect(() => { setLoading(true); setError(false); loadData(); }, [loadData]);

  useEffect(() => {
    if (!result || (result.status !== "processing" && result.status !== "pending")) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      const updated = await analysisService.pollResult(result.id);
      if (updated) setResult(updated);
      if (updated && (updated.status === "complete" || updated.status === "error")) clearInterval(pollRef.current);
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

  // ── Non-complete states ──
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
                  <Button onClick={handleRerun}><RefreshCw className="mr-2 h-4 w-4" />Re-run analysis</Button>
                  <Button variant="outline" onClick={() => setSupportOpen(true)}><HelpCircle className="mr-2 h-4 w-4" />Contact support</Button>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />Delete analysis
                </Button>
              </div>
            </Section>
          </div>
        </div>
        <ConfirmActionDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete analysis?" description="This action cannot be undone." confirmLabel="Delete" destructive onConfirm={handleDelete} />
        <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
      </AppLayout>
    );
  }

  // ── Complete state ──
  const m = result.metrics;

  const handleVideoTimeUpdate = () => { if (videoRef.current) setVideoTime(videoRef.current.currentTime); };
  const handleVideoPlay = () => setVideoPlaying(true);
  const handleVideoPause = () => setVideoPlaying(false);
  const handleModelSeek = (time: number) => {
    if (videoRef.current) { videoRef.current.currentTime = time; setVideoTime(time); }
  };

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
                    <video ref={videoRef} src={result.videoUrl} controls className="w-full"
                      onTimeUpdate={handleVideoTimeUpdate} onPlay={handleVideoPlay} onPause={handleVideoPause} />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Video preview unavailable</div>
                  )}
                </div>
                {theater && (
                  <ModelViewer duration={result.duration ?? 10} currentTime={videoTime} onSeek={handleModelSeek} isPlaying={videoPlaying} modelUrl={result.modelUrl} />
                )}
              </div>

              {/* ── Overview cards ── */}
              {m && (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Edge Score" value={m.edgeSimilarity.overall} />
                  <StatCard label="Turns" value={m.turnSegments.length} />
                  <StatCard label="Cadence" value={`${m.turnCadence.tpmMedian}`} sub="turns/min" />
                  <StatCard label="Consistency" value={m.turnCadence.turnDurationCv} sub="duration CV" />
                </div>
              )}

              {/* ── Expandable metric sections ── */}
              {m && (
                <div className="mt-6 space-y-3">
                  <EdgeSimilarityPanel m={m} />
                  <ShinParallelPanel m={m} />
                  <AngulationPanel m={m} />
                  <CounterPanel m={m} />
                  <AngVsIncPanel m={m} />
                  <COMPanel m={m} />
                  <TurnSegmentsPanel m={m} />
                  <TurnCadencePanel m={m} />
                </div>
              )}

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

      <ConfirmActionDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete analysis?" description="This will permanently remove this analysis and all associated data." confirmLabel="Delete" destructive onConfirm={handleDelete} />
      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </AppLayout>
  );
}
