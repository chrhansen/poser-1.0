import { CheckCircle, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedbackResponse } from "@/services/embed-api.service";

interface ResultsStepProps {
  feedback: FeedbackResponse;
  onReset: () => void;
}

export function ResultsStep({ feedback, onReset }: ResultsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5" style={{ color: "hsl(142 71% 45%)" }} />
        <span className="text-base font-semibold" style={{ color: "hsl(142 71% 45%)" }}>Analysis Complete</span>
      </div>

      {/* Video preview */}
      {feedback.video_url ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
          <video
            src={feedback.video_url}
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
            {feedback.edge_similarity_overall}%
          </p>
          <p className="text-xs text-muted-foreground">Edge Similarity</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">
            {feedback.turns_analyzed}
          </p>
          <p className="text-xs text-muted-foreground">Turns Analyzed</p>
        </div>
      </div>

      {/* Actions */}
      <Button
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() => window.open(feedback.results_url, "_blank")}
      >
        View results link from your email
      </Button>

      <Button size="lg" className="w-full" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Analyze Another Video
      </Button>
    </div>
  );
}
