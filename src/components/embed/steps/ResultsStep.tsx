import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultsDisplay } from "./ResultsDisplay";
import type { FeedbackResponse } from "@/services/embed-api.service";

interface ResultsStepProps {
  feedback: FeedbackResponse;
  onReset: () => void;
}

export function ResultsStep({ feedback, onReset }: ResultsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <ResultsDisplay
        videoUrl={feedback.video_url}
        edgeSimilarity={feedback.edge_similarity_overall}
        turnsAnalyzed={feedback.turns_analyzed}
      />

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
