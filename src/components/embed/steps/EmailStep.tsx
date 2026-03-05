import { useState } from "react";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailStepProps {
  onSubmit: (email: string) => void;
  onBack: () => void;
  submitting?: boolean;
  submitError?: string;
}

export function EmailStep({ onSubmit, onBack, submitting, submitError }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Mail className="h-6 w-6 text-accent" />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">Enter your email</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We will send a link to confirm and view results
        </p>
      </div>

      <div className="w-full">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !submitting && handleSubmit()}
          disabled={submitting}
        />
        {(error || submitError) && (
          <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error || submitError}</span>
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Submitting…" : "Analyze My Video"}
      </Button>

      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        disabled={submitting}
      >
        <ArrowLeft className="h-3 w-3" /> Back to video
      </button>

      <p className="text-xs text-muted-foreground text-center">
        By submitting, you agree to receive analysis results via email
      </p>
    </div>
  );
}
