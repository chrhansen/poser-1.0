import { Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ProcessingStepProps {
  progress: number;
  email: string;
  error?: string;
  onRetry?: () => void;
}

export function ProcessingStep({ progress, email, error, onRetry }: ProcessingStepProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center py-8 text-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <p className="text-lg font-semibold text-foreground">Couldn't analyze clip</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 text-center gap-5">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent/30">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>

      <div>
        <p className="text-lg font-semibold text-foreground">Analyzing clip…</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This usually takes 1-2 minutes
        </p>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Processing</span>
          <span className="text-xs font-medium text-accent">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <p className="text-sm text-muted-foreground">
        📧 We will also email you at{" "}
        <span className="font-medium text-accent">{email}</span>{" "}
        when ready
      </p>
    </div>
  );
}
