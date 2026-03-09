import type { ThemeScores, ThemeKey, KeyMoment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Trophy, Star, Eye } from "lucide-react";

interface OverviewSectionProps {
  skiRank: number;
  themes: ThemeScores;
  onThemeSelect: (key: ThemeKey) => void;
  onMomentSelect: (moment: KeyMoment) => void;
}

const themeOrder: ThemeKey[] = ["balance", "pressure", "edging", "steering"];

function findStrongestWeakest(themes: ThemeScores) {
  let strongest: ThemeKey = "balance";
  let weakest: ThemeKey = "balance";
  for (const key of themeOrder) {
    if (themes[key].score > themes[strongest].score) strongest = key;
    if (themes[key].score < themes[weakest].score) weakest = key;
  }
  return { strongest, weakest };
}

const momentIcons = {
  weakest: AlertTriangle,
  best: Trophy,
  representative: Eye,
};

export function OverviewSection({ skiRank, themes, onThemeSelect, onMomentSelect }: OverviewSectionProps) {
  const { strongest, weakest } = findStrongestWeakest(themes);

  return (
    <div className="space-y-4">
      {/* SkiRank hero */}
      <div className="rounded-2xl border border-warm/20 bg-gradient-to-br from-warm/[0.06] via-warm-glow/[0.03] to-transparent p-6 text-center shadow-sm">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Overall technique score</p>
        <p className="mt-2 text-5xl font-bold text-warm">{skiRank}</p>
        <p className="mt-1 text-xs font-semibold text-warm">SkiRank</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Strongest in <span className="font-medium text-foreground capitalize">{strongest}</span> · Weakest in <span className="font-medium text-foreground capitalize">{weakest}</span>
        </p>
      </div>

      {/* Why not higher */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why your SkiRank wasn't higher</p>
        <p className="mt-1.5 text-sm text-foreground">{themes.whyNotHigher}</p>
      </div>

      {/* Next focus */}
      <div className="rounded-xl border border-warm/15 bg-warm/[0.04] p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-warm">Next focus</p>
        <p className="mt-1.5 text-sm font-medium text-foreground">{themes.nextFocus}</p>
        {themes.nextFocusDetail && (
          <p className="mt-1 text-xs text-muted-foreground">{themes.nextFocusDetail}</p>
        )}
      </div>

      {/* Theme cards */}
      <div className="grid grid-cols-2 gap-3">
        {themeOrder.map((key) => {
          const t = themes[key];
          const isWeakest = key === weakest;
          const isStrongest = key === strongest;
          return (
            <button
              key={key}
              onClick={() => onThemeSelect(key)}
              className={cn(
                "flex flex-col items-start rounded-xl border p-4 text-left transition-all hover:shadow-md",
                isWeakest
                  ? "border-warm/30 bg-warm/[0.04]"
                  : "border-border bg-card hover:border-border/80"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold text-foreground capitalize">{t.name}</span>
                <span className={cn("text-lg font-bold", isWeakest ? "text-warm" : "text-foreground")}>{t.score}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.summary}</p>
              {isWeakest && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-warm/10 px-2 py-0.5 text-[10px] font-semibold text-warm">
                  <AlertTriangle className="h-2.5 w-2.5" /> Biggest limiter
                </span>
              )}
              {isStrongest && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <Star className="h-2.5 w-2.5" /> Strongest
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Key moments */}
      {themes.keyMoments.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key moments</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {themes.keyMoments.map((km) => {
              const Icon = momentIcons[km.type];
              return (
                <button
                  key={km.id}
                  onClick={() => onMomentSelect(km)}
                  className="flex min-w-[180px] shrink-0 items-start gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-all hover:shadow-md"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{km.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{km.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
