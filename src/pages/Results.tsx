import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/Layout";
import { Section } from "@/components/shared/Section";
import { PageLoader } from "@/components/shared/PageLoader";
import { PageError } from "@/components/shared/PageError";
import { ConfirmActionDialog } from "@/components/dialogs/ConfirmActionDialog";
import { ContactSupportDialog } from "@/components/dialogs/ContactSupportDialog";
import { ResultsHeader } from "@/components/results/ResultsHeader";
import { OverviewSection } from "@/components/results/OverviewSection";
import { ThemeDetail } from "@/components/results/ThemeDetail";
import { SubmetricDetail } from "@/components/results/SubmetricDetail";
import { ThemeNav } from "@/components/results/ThemeNav";
import { ThemePills } from "@/components/results/ThemePills";
import { analysisService } from "@/services/analysis.service";
import type { AnalysisResult, ThemeKey, KeyMoment, ThemeScores } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NewAnalysisSheet } from "@/components/upload/NewAnalysisSheet";
import {
  Loader2, RefreshCw, Trash2, HelpCircle, AlertTriangle, Clock,
} from "lucide-react";
import { toast } from "sonner";

// ─── Fallback theme scores (in case result doesn't have them) ───────────────
import { mockThemeScores_res1, mockThemeScores_res5 } from "@/services/mock-themes";

function getThemeScores(result: AnalysisResult): ThemeScores | null {
  if (result.themeScores) return result.themeScores;
  // fallback to mock data for known IDs
  if (result.id === "res_1") return mockThemeScores_res1;
  if (result.id === "res_5") return mockThemeScores_res5;
  // Generate a basic fallback for any complete result
  if (result.status === "complete") return mockThemeScores_res1;
  return null;
}

// ─── Main Results Page ──────────────────────────────────────────────────────
export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  // 3-level navigation state
  const [activeView, setActiveView] = useState<string>("overview");
  const [activeSubmetric, setActiveSubmetric] = useState<string | null>(null);
  const [activeEvidence, setActiveEvidence] = useState("highlights");
  const [selectedTurn, setSelectedTurn] = useState<string | null>(null);

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

  // Polling for processing/pending
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
    toast.success("Clip deleted.");
    navigate("/dashboard");
  };

  const handleRerun = async () => {
    if (!result) return;
    await analysisService.rerunAnalysis(result.id);
    toast.success("Re-running clip…");
    setResult({ ...result, status: "processing", progress: 0, failedReason: undefined });
  };

  // Navigation handlers
  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === "overview") {
      setActiveSubmetric(null);
    } else {
      // Auto-select first submetric when entering a theme
      const themes = result ? getThemeScores(result) : null;
      if (themes) {
        const theme = themes[view as ThemeKey];
        if (theme?.submetrics.length > 0) {
          setActiveSubmetric(theme.submetrics[0].id);
        }
      }
    }
    setActiveEvidence("highlights");
    setSelectedTurn(null);
  };

  const handleSubmetricSelect = (themeKey: ThemeKey, subId: string) => {
    setActiveView(themeKey);
    setActiveSubmetric(subId);
    setActiveEvidence("highlights");
  };

  const handleThemeSelect = (key: ThemeKey) => {
    handleViewChange(key);
  };

  const handleMomentSelect = (moment: KeyMoment) => {
    if (moment.turnId) setSelectedTurn(moment.turnId);
  };

  const handleTurnSelect = (turnId: string) => {
    setSelectedTurn(turnId);
  };

  // Loading / error states
  if (loading) return <AppLayout><PageLoader /></AppLayout>;
  if (error || !result) return <AppLayout><PageError message="Result not found." onRetry={loadData} /></AppLayout>;

  // Non-complete states
  if (result.status === "pending") {
    return (
      <AppLayout>
        <Section>
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Clock className="h-10 w-10 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Queued for analysis</h1>
            <p className="text-muted-foreground">Your clip is in the queue. Processing will begin shortly.</p>
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
            <h1 className="text-2xl font-bold text-foreground">Analyzing clip…</h1>
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
            <h1 className="text-2xl font-bold text-foreground">Couldn't analyze clip</h1>
            <p className="text-sm text-muted-foreground">{result.failedReason ?? "An unexpected error occurred."}</p>
            <div className="flex gap-3">
              <Button onClick={handleRerun}><RefreshCw className="mr-2 h-4 w-4" />Re-run clip</Button>
              <Button variant="outline" onClick={() => setSupportOpen(true)}><HelpCircle className="mr-2 h-4 w-4" />Contact support</Button>
            </div>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />Delete clip
            </Button>
          </div>
        </Section>
        <ConfirmActionDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete clip?" description="This action cannot be undone." confirmLabel="Delete" destructive onConfirm={handleDelete} />
        <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
      </AppLayout>
    );
  }

  // ── Complete state ──
  const themes = getThemeScores(result);
  if (!themes) return <AppLayout><PageError message="No clip data available." onRetry={loadData} /></AppLayout>;

  const currentTheme = activeView !== "overview" ? themes[activeView as ThemeKey] : null;
  const currentSubmetric = currentTheme?.submetrics.find((s) => s.id === activeSubmetric) ?? null;

  return (
    <AppLayout>
      <Section>
        <div className="mx-auto max-w-5xl space-y-5">
          {/* Header */}
          <ResultsHeader result={result} />

          {/* Mobile pills */}
          <ThemePills activeView={activeView} onViewChange={handleViewChange} />

          {/* Layout: sidebar (desktop) + content */}
          <div className="flex gap-6">
            {/* Desktop sidebar */}
            <ThemeNav
              themes={themes}
              activeView={activeView}
              activeSubmetric={activeSubmetric}
              onViewChange={handleViewChange}
              onSubmetricSelect={handleSubmetricSelect}
            />

            {/* Main content */}
            <div className="min-w-0 flex-1">
              {activeView === "overview" ? (
                <OverviewSection
                  skiRank={result.skiRank ?? 0}
                  themes={themes}
                  onThemeSelect={handleThemeSelect}
                  onMomentSelect={handleMomentSelect}
                />
              ) : currentTheme ? (
                <ThemeDetail
                  theme={currentTheme}
                  activeSubmetric={activeSubmetric}
                  onSubmetricSelect={(id) => handleSubmetricSelect(activeView as ThemeKey, id)}
                >
                  {currentSubmetric && (
                    <SubmetricDetail
                      submetric={currentSubmetric}
                      activeEvidence={activeEvidence}
                      onEvidenceChange={setActiveEvidence}
                      metrics={result.metrics}
                      duration={result.duration}
                      selectedTurn={selectedTurn}
                      onTurnSelect={handleTurnSelect}
                    />
                  )}
                </ThemeDetail>
              ) : null}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-border pt-5">
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSupportOpen(true)}>
              <HelpCircle className="mr-2 h-4 w-4" /> Support
            </Button>
          </div>
        </div>
      </Section>

      <ConfirmActionDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete clip?" description="This will permanently remove this clip and all associated data." confirmLabel="Delete" destructive onConfirm={handleDelete} />
      <ContactSupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
      <NewAnalysisSheet open={newAnalysisOpen} onOpenChange={setNewAnalysisOpen} />
    </AppLayout>
  );
}
