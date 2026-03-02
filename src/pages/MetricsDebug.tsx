import { useEffect, useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { metricsService } from "@/services/metrics.service";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { FramePreview } from "@/components/metrics/FramePreview";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { MetricsData, AnalysisResult } from "@/lib/types";
import { toast } from "sonner";
import {
  Loader2, Search, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

export default function MetricsDebugPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Analysis lookup
  const [analysisId, setAnalysisId] = useState("");
  const [embedToken, setEmbedToken] = useState("");
  const [lookupResult, setLookupResult] = useState<AnalysisResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Frame scrubber
  const [currentFrame, setCurrentFrame] = useState(0);
  const totalFrames = lookupResult?.edgeSimilarity?.length ?? 0;

  // Rerun modal
  const [rerunOpen, setRerunOpen] = useState(false);
  const [rerunning, setRerunning] = useState(false);

  useEffect(() => {
    metricsService.getMetrics().then((m) => {
      setMetrics(m);
      setLoading(false);
    });
  }, []);

  const handleLookupById = async () => {
    if (!analysisId.trim()) return;
    setLookupLoading(true);
    const r = await metricsService.getAnalysisById(analysisId.trim());
    setLookupResult(r);
    setCurrentFrame(0);
    setLookupLoading(false);
    if (!r) toast.error("Analysis not found.");
  };

  const handleLookupByToken = async () => {
    if (!embedToken.trim()) return;
    setLookupLoading(true);
    const r = await metricsService.getAnalysisByToken(embedToken.trim());
    setLookupResult(r);
    setCurrentFrame(0);
    setLookupLoading(false);
    if (!r) toast.error("Analysis not found for this token.");
  };

  const handleRerun = async () => {
    if (!lookupResult) return;
    setRerunning(true);
    await metricsService.rerunAnalysis(lookupResult.id);
    setRerunning(false);
    setRerunOpen(false);
    toast.success("Analysis re-run triggered.");
  };

  // Keyboard shortcuts for frame scrubber
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (totalFrames === 0) return;
    if (e.key === "ArrowLeft") setCurrentFrame((f) => Math.max(0, f - 1));
    if (e.key === "ArrowRight") setCurrentFrame((f) => Math.min(totalFrames - 1, f + 1));
  }, [totalFrames]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (!metrics) return <AppLayout><PageError message="Failed to load metrics." /></AppLayout>;

  const stats = [
    { label: "Total Users", value: metrics.totalUsers.toLocaleString() },
    { label: "Total Analyses", value: metrics.totalAnalyses.toLocaleString() },
    { label: "Avg Score", value: metrics.avgScore.toFixed(1) },
    { label: "Conversion", value: `${(metrics.conversionRate * 100).toFixed(1)}%` },
  ];

  const dauData = metrics.dailyActiveUsers.map((v, i) => ({ day: `D${i + 1}`, users: v }));
  const apdData = metrics.analysesPerDay.map((v, i) => ({ day: `D${i + 1}`, analyses: v }));

  return (
    <AppLayout>
      <Section>
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Metrics <span className="text-sm font-normal text-muted-foreground">(internal)</span>
          </h1>

          {/* Stats grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">Daily Active Users</h2>
              <div className="mt-3" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dauData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="users" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <h2 className="text-sm font-semibold text-foreground">Analyses per Day</h2>
              <div className="mt-3" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={apdData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="analyses" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Analysis lookup */}
          <div className="mt-8 rounded-xl border border-border p-6">
            <h2 className="text-sm font-semibold text-foreground">Analysis Lookup</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="analysis-id">Analysis ID</Label>
                <div className="flex gap-2">
                  <Input id="analysis-id" placeholder="res_1" value={analysisId} onChange={(e) => setAnalysisId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookupById()} />
                  <Button variant="outline" size="sm" onClick={handleLookupById} disabled={lookupLoading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="embed-token">Embed Token</Label>
                <div className="flex gap-2">
                  <Input id="embed-token" placeholder="tok_abc123" value={embedToken} onChange={(e) => setEmbedToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookupByToken()} />
                  <Button variant="outline" size="sm" onClick={handleLookupByToken} disabled={lookupLoading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {lookupLoading && (
              <div className="mt-4 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            )}

            {lookupResult && !lookupLoading && (
              <div className="mt-6 space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{lookupResult.id}</p>
                    <p className="text-xs text-muted-foreground">ID</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold capitalize text-foreground">{lookupResult.status}</p>
                    <p className="text-xs text-muted-foreground">Status</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{lookupResult.scores.overall || "—"}</p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{lookupResult.duration ? `${lookupResult.duration}s` : "—"}</p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>
                </div>

                {/* Frame scrubber */}
                {totalFrames > 0 && (
                  <div className="rounded-lg border border-border p-4">
                    <h3 className="text-xs font-semibold text-foreground">Frame Scrubber (←/→ keys)</h3>
                    <div className="mt-3 flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))} disabled={currentFrame === 0} aria-label="Previous frame">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex-1">
                        <Slider
                          value={[currentFrame]}
                          min={0}
                          max={totalFrames - 1}
                          step={1}
                          onValueChange={([v]) => setCurrentFrame(v)}
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1))} disabled={currentFrame === totalFrames - 1} aria-label="Next frame">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Frame {currentFrame + 1} / {totalFrames} — Similarity: {Math.round((lookupResult.edgeSimilarity![currentFrame]) * 100)}%
                    </p>

                    {/* Mock frame preview */}
                    <div className="mt-3 h-40">
                      <FramePreview
                        frameIndex={currentFrame}
                        totalFrames={totalFrames}
                        similarity={lookupResult.edgeSimilarity![currentFrame]}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Rerun */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRerunOpen(true)}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Re-run analysis
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>

      <ConfirmActionDialog
        open={rerunOpen} onOpenChange={setRerunOpen}
        title="Re-run analysis?" description={`This will re-trigger the analysis pipeline for ${lookupResult?.id ?? "this analysis"}.`}
        confirmLabel={rerunning ? "Re-running…" : "Re-run"} onConfirm={handleRerun}
      />
    </AppLayout>
  );
}
