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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Loader2, Maximize2, Minimize2, Download, RefreshCw, Trash2, Plus,
  AlertTriangle, Clock, CheckCircle, XCircle, HelpCircle,
  Cuboid, GitCompareArrows, RotateCw, Crosshair, Timer,
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

// ─── Metric definitions ─────────────────────────────────────────────────────
type MetricKey = "model" | "edge" | "angulation" | "counter" | "com" | "cadence";

interface MetricDef {
  key: MetricKey;
  label: string;
  sub: string;
  icon: React.ElementType;
}

const METRICS: MetricDef[] = [
  { key: "model", label: "3D Body Model", sub: "Animated 3D pose reconstruction", icon: Cuboid },
  { key: "edge", label: "Edge Similarity", sub: "Edge quality per turn & aggregate", icon: GitCompareArrows },
  { key: "angulation", label: "Angulation", sub: "Upper vs lower body separation", icon: Crosshair },
  { key: "counter", label: "Counter-Rotation", sub: "Torso–pelvis yaw separation", icon: RotateCw },
  { key: "com", label: "Center of Mass", sub: "3D world-space COM tracking", icon: Crosshair },
  { key: "cadence", label: "Turn Cadence", sub: "Tempo & rhythm metrics", icon: Timer },
];

// ─── Metric sidebar nav (desktop) ───────────────────────────────────────────
function MetricNav({ selected, onSelect }: { selected: MetricKey; onSelect: (k: MetricKey) => void }) {
  return (
    <nav className="hidden w-56 shrink-0 space-y-1 lg:block">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Metrics</p>
      {METRICS.map((m) => {
        const Icon = m.icon;
        const active = m.key === selected;
        return (
          <button
            key={m.key}
            onClick={() => onSelect(m.key)}
            className={cn(
              "group flex w-full items-start gap-2.5 rounded-xl px-3 py-3 text-left transition-all duration-200",
              active
                ? "bg-gradient-to-r from-warm/10 to-warm-glow/5 shadow-[inset_3px_0_0_hsl(var(--warm))]"
                : "hover:bg-warm-muted/40"
            )}
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0 transition-colors", active ? "text-warm" : "text-muted-foreground group-hover:text-warm/60")} />
            <div>
              <p className={cn("text-sm font-medium transition-colors", active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{m.label}</p>
              <p className="text-[11px] text-muted-foreground">{m.sub}</p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Metric dropdown (mobile) ───────────────────────────────────────────────
function MetricDropdown({ selected, onSelect }: { selected: MetricKey; onSelect: (k: MetricKey) => void }) {
  const current = METRICS.find((m) => m.key === selected)!;
  const Icon = current.icon;
  return (
    <div className="lg:hidden">
      <Select value={selected} onValueChange={(v) => onSelect(v as MetricKey)}>
        <SelectTrigger className="w-full border-warm/20 bg-warm/5">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-warm" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {METRICS.map((m) => {
            const MIcon = m.icon;
            return (
              <SelectItem key={m.key} value={m.key}>
                <div className="flex items-center gap-2">
                  <MIcon className="h-4 w-4" />
                  <span>{m.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Overview stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-warm/10 bg-gradient-to-b from-warm/[0.04] to-transparent p-4 text-center transition-shadow hover:shadow-[var(--shadow-warm)]">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
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



// ─── Metrics drill-down panels ──────────────────────────────────────────────




function COMPanel({ m }: { m: AnalysisMetrics }) {
  const step = Math.max(1, Math.floor(m.com.length / 80));
  const chartData = m.com.filter((_, i) => i % step === 0).map((f) => ({
    frame: f.frame, x: Math.round(f.x * 100) / 100, y: Math.round(f.y * 100) / 100,
  }));
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Center of Mass</p>
      <p className="text-lg font-bold text-foreground">3D Position Tracking</p>
      <p className="text-xs text-muted-foreground">X (lateral), Y (vertical), Z (downhill) per frame</p>
      <MetricChart height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
          <Line type="monotone" dataKey="x" stroke="hsl(var(--warm))" strokeWidth={1.5} dot={false} name="X (lateral)" />
          <Line type="monotone" dataKey="y" stroke="hsl(var(--warm-glow))" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Y (vertical)" />
        </LineChart>
      </MetricChart>
    </div>
  );
}

function AngulationPanel({ m }: { m: AnalysisMetrics }) {
  const avgAbs = Math.round(m.angulation.reduce((a, b) => a + b.absolute, 0) / m.angulation.length * 10) / 10;
  const step = Math.max(1, Math.floor(m.angulation.length / 80));
  const chartData = m.angulation.filter((_, i) => i % step === 0).map((f) => ({ frame: f.frame, degrees: f.signed }));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Angulation</p>
          <p className="text-lg font-bold text-foreground">Upper vs Lower Body</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-warm">{avgAbs}°</p>
          <p className="text-[10px] text-muted-foreground">avg separation</p>
        </div>
      </div>
      <MetricChart height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number) => [`${val}°`, "Angulation"]} />
          <Area type="monotone" dataKey="degrees" stroke="hsl(var(--warm))" fill="hsl(var(--warm))" fillOpacity={0.08} strokeWidth={2} />
        </AreaChart>
      </MetricChart>
    </div>
  );
}

function CounterPanel({ m }: { m: AnalysisMetrics }) {
  const avgAbs = Math.round(m.counter.reduce((a, b) => a + b.absolute, 0) / m.counter.length * 10) / 10;
  const peakAbs = Math.round(Math.max(...m.counter.map((c) => c.absolute)) * 10) / 10;
  const step = Math.max(1, Math.floor(m.counter.length / 80));
  const chartData = m.counter.filter((_, i) => i % step === 0).map((f) => ({ frame: f.frame, signed: f.signed, absolute: f.absolute }));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Counter-Rotation</p>
          <p className="text-lg font-bold text-foreground">Torso–Pelvis Yaw</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-warm">{avgAbs}°</p>
          <p className="text-[10px] text-muted-foreground">avg counter</p>
        </div>
      </div>
      <MetricChart height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="frame" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
            formatter={(val: number, name: string) => [`${val}°`, name === "signed" ? "Signed" : "Absolute"]} />
          <Line type="monotone" dataKey="signed" stroke="hsl(var(--warm))" strokeWidth={2} dot={false} name="signed" />
          <Line type="monotone" dataKey="absolute" stroke="hsl(var(--warm-glow))" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="absolute" />
        </LineChart>
      </MetricChart>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Avg Counter" value={`${avgAbs}°`} sub="Active counter" />
        <StatCard label="Peak Counter" value={`${peakAbs}°`} sub="Maximum separation" />
      </div>
    </div>
  );
}




function EdgeSimilarityPanel({ m }: { m: AnalysisMetrics }) {
  const e = m.edgeSimilarity;
  const barData = e.perTurn.map((t) => ({
    turn: t.turnId.replace("turn_", "T"),
    score: t.score,
  }));
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Edge Similarity</p>
      <div className="flex items-baseline gap-6">
        <p className="text-5xl font-bold text-warm">{e.overall}</p>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">{e.left}</p>
            <p className="text-[10px] text-muted-foreground">Left Turns</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-muted-foreground">{e.right}</p>
            <p className="text-[10px] text-muted-foreground">Right Turns</p>
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Overall edge quality score based on apex shin parallelism.</p>
      {barData.length > 0 && (
        <>
          <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">Per-Turn Edge Score</p>
          <MetricChart height={180}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="turn" tick={{ fontSize: 9 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                formatter={(val: number) => [`${val}/100`, "Edge Score"]} />
              <Bar dataKey="score" fill="hsl(var(--warm))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </MetricChart>
        </>
      )}
    </div>
  );
}

function TurnCadencePanel({ m }: { m: AnalysisMetrics }) {
  const c = m.turnCadence;
  const cvLabel = c.turnDurationCv < 0.2 ? "Consistent" : c.turnDurationCv < 0.35 ? "Moderate" : "Variable";
  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-warm/10 via-warm-glow/5 to-transparent p-8 text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Turn Cadence</p>
        <p className="mt-3 text-5xl font-bold text-warm">{c.tpmMedian}</p>
        <p className="mt-1 text-sm text-muted-foreground">median turns per minute</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard label="TPM Peak (6)" value={c.tpmPeak6} sub="tpm" />
        <StatCard label="Duration CV" value={`${Math.round(c.turnDurationCv * 100)}%`} sub={cvLabel} />
        <StatCard label="Total Turns" value={m.turnSegments.length} />
      </div>
    </div>
  );
}

// ─── 3D Model panel ─────────────────────────────────────────────────────────
function ModelPanel({ result, videoTime, videoPlaying, onSeek }: {
  result: AnalysisResult; videoTime: number; videoPlaying: boolean; onSeek: (t: number) => void;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">3D Body Model</p>
      <p className="text-lg font-bold text-foreground">Pose Reconstruction</p>
      <div className="mt-4">
        <ModelViewer
          duration={result.duration ?? 10}
          currentTime={videoTime}
          onSeek={onSeek}
          isPlaying={videoPlaying}
          modelUrl={result.modelUrl}
          className="border-0"
        />
      </div>
    </div>
  );
}

// ─── Metric content renderer ────────────────────────────────────────────────
function MetricContent({ metricKey, m, result, videoTime, videoPlaying, onSeek }: {
  metricKey: MetricKey; m: AnalysisMetrics; result: AnalysisResult;
  videoTime: number; videoPlaying: boolean; onSeek: (t: number) => void;
}) {
  switch (metricKey) {
    case "model": return <ModelPanel result={result} videoTime={videoTime} videoPlaying={videoPlaying} onSeek={onSeek} />;
    case "edge": return <EdgeSimilarityPanel m={m} />;
    case "angulation": return <AngulationPanel m={m} />;
    case "counter": return <CounterPanel m={m} />;
    case "com": return <COMPanel m={m} />;
    case "cadence": return <TurnCadencePanel m={m} />;
  }
}

// ─── Main Results Page ──────────────────────────────────────────────────────
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("model");
  const [theater, setTheater] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const r = await analysisService.getResult(id ?? "");
      if (!r) { setError(true); setLoading(false); return; }
      setResult(r);
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
        <Section>
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Clock className="h-10 w-10 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Queued for analysis</h1>
            <p className="text-muted-foreground">Your clip is in the queue. Analysis will begin shortly.</p>
          </div>
        </Section>
      </AppLayout>
    );
  }

  if (result.status === "processing") {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  if (result.status === "error") {
    return (
      <AppLayout>
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
      <Section>
        <div className="mx-auto max-w-5xl">
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
              {m && (
                <span className="rounded-full bg-gradient-to-r from-warm to-warm-glow px-4 py-1.5 text-sm font-bold text-warm-foreground shadow-[var(--shadow-warm)]">
                  Score {m.edgeSimilarity.overall}
                </span>
              )}
              <Button variant="outline" size="sm" aria-label="Download results">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/#upload")}>
                <Plus className="mr-1 h-4 w-4" /> New
              </Button>
            </div>
          </div>

          {/* Metric nav dropdown (mobile) */}
          {m && (
            <div className="mt-6">
              <MetricDropdown selected={selectedMetric} onSelect={setSelectedMetric} />
            </div>
          )}

          {/* Content area: sidebar + metric panel */}
          {m && (
            <div className="mt-6 flex gap-6">
              <MetricNav selected={selectedMetric} onSelect={setSelectedMetric} />
              <div className="min-w-0 flex-1 rounded-2xl border border-border/60 bg-gradient-to-b from-card to-background p-6 shadow-md">
                <MetricContent
                  metricKey={selectedMetric}
                  m={m}
                  result={result}
                  videoTime={videoTime}
                  videoPlaying={videoPlaying}
                  onSeek={handleModelSeek}
                />
              </div>
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

      <ConfirmActionDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete analysis?" description="This will permanently remove this analysis and all associated data." confirmLabel="Delete" destructive onConfirm={handleDelete} />
      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </AppLayout>
  );
}
