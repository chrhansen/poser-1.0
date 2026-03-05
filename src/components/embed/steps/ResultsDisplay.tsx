import { CheckCircle, Play } from "lucide-react";

interface ResultsDisplayProps {
  videoUrl?: string;
  edgeSimilarity: number;
  turnsAnalyzed: number;
}

export function ResultsDisplay({ videoUrl, edgeSimilarity, turnsAnalyzed }: ResultsDisplayProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5" style={{ color: "hsl(142 71% 45%)" }} />
        <span className="text-base font-semibold" style={{ color: "hsl(142 71% 45%)" }}>Analysis Complete</span>
      </div>

      {/* Video preview */}
      {videoUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
          <video
            src={videoUrl}
            className="w-full max-h-[35vh] object-contain"
            controls
            playsInline
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-secondary">
          <Play className="h-10 w-10 text-muted-foreground" />
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">
            {edgeSimilarity}%
          </p>
          <p className="text-xs text-muted-foreground">Edge Similarity</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">
            {turnsAnalyzed}
          </p>
          <p className="text-xs text-muted-foreground">Turns Analyzed</p>
        </div>
      </div>
    </div>
  );
}
