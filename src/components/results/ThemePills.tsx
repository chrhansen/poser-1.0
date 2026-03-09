import type { ThemeKey } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ThemePillsProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const pills: { id: string; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "balance", label: "Balance" },
  { id: "pressure", label: "Pressure" },
  { id: "edging", label: "Edging" },
  { id: "steering", label: "Steering" },
];

export function ThemePills({ activeView, onViewChange }: ThemePillsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
      {pills.map((p) => (
        <button
          key={p.id}
          onClick={() => onViewChange(p.id)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
            activeView === p.id
              ? "bg-warm text-warm-foreground shadow-sm"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
