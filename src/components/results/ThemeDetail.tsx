import type { ThemeScore, SubmetricScore } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ThemeDetailProps {
  theme: ThemeScore;
  activeSubmetric: string | null;
  onSubmetricSelect: (id: string) => void;
  children?: React.ReactNode; // SubmetricDetail renders here
}

export function ThemeDetail({ theme, activeSubmetric, onSubmetricSelect, children }: ThemeDetailProps) {
  return (
    <div className="space-y-4">
      {/* Theme summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-lg font-bold text-foreground capitalize">{theme.name}</p>
          <span className="text-2xl font-bold text-warm">{theme.score}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{theme.summary}</p>
        <div className="mt-3 rounded-lg bg-warm/[0.04] border border-warm/10 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-warm">Next focus</p>
          <p className="mt-0.5 text-xs text-foreground">{theme.nextFocus}</p>
        </div>
      </div>

      {/* Submetric chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {theme.submetrics.map((sm) => (
          <button
            key={sm.id}
            onClick={() => onSubmetricSelect(sm.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all",
              activeSubmetric === sm.id
                ? "border-warm/30 bg-warm/[0.06] shadow-sm"
                : "border-border bg-card hover:border-border/80 hover:shadow-sm"
            )}
          >
            <div>
              <p className={cn("text-xs font-semibold", activeSubmetric === sm.id ? "text-foreground" : "text-muted-foreground")}>{sm.name}</p>
              <p className="text-[11px] text-muted-foreground">{sm.score}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Submetric detail slot */}
      {children}
    </div>
  );
}
