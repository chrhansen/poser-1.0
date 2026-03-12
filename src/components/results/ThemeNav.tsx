import type { ThemeScores, ThemeKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Scale, Gauge, Diamond, Navigation } from "lucide-react";

interface ThemeNavProps {
  themes: ThemeScores;
  activeView: string;
  activeSubmetric: string | null;
  onViewChange: (view: string) => void;
  onSubmetricSelect: (themeKey: ThemeKey, subId: string) => void;
}

const themeIcons: Record<ThemeKey, React.ElementType> = {
  balance: Scale,
  pressure: Gauge,
  edging: Diamond,
  steering: Navigation,
};

const themeOrder: ThemeKey[] = ["balance", "pressure", "edging", "steering"];

export function ThemeNav({ themes, activeView, activeSubmetric, onViewChange, onSubmetricSelect }: ThemeNavProps) {
  return (
    <nav className="hidden w-52 shrink-0 space-y-0.5 lg:block">
      {/* Overview */}
      <button
        onClick={() => onViewChange("overview")}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          activeView === "overview"
            ? "bg-accent/10 text-foreground shadow-[inset_3px_0_0_hsl(var(--accent))]"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        Overview
      </button>

      {/* Themes */}
      {themeOrder.map((key) => {
        const theme = themes[key];
        const Icon = themeIcons[key];
        const isActive = activeView === key;

        return (
          <div key={key}>
            <button
              onClick={() => onViewChange(key)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-accent/10 text-foreground shadow-[inset_3px_0_0_hsl(var(--accent))]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" />
                <span className="capitalize">{theme.name}</span>
              </span>
              <span className={cn("text-xs font-semibold", isActive ? "text-accent-foreground" : "text-muted-foreground")}>{theme.score}</span>
            </button>

            {/* Submetrics */}
            {isActive && (
              <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border pl-3">
                {theme.submetrics.map((sm) => (
                  <button
                    key={sm.id}
                    onClick={() => onSubmetricSelect(key, sm.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
                      activeSubmetric === sm.id
                        ? "text-foreground font-medium bg-secondary/60"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{sm.name}</span>
                    <span className="text-muted-foreground">{sm.score}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
