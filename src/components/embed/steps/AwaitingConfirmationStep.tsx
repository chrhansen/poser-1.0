import { Loader2 } from "lucide-react";

interface AwaitingConfirmationStepProps {
  email: string;
}

export function AwaitingConfirmationStep({ email }: AwaitingConfirmationStepProps) {
  return (
    <div className="flex flex-col items-center py-8 text-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent/30">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>

      <div>
        <p className="text-lg font-semibold text-foreground">Confirm your email</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Click the link we sent to start analysis
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        📧 We have emailed you at{" "}
        <span className="font-medium text-accent">{email}</span>{" "}
        to confirm your email
      </p>
    </div>
  );
}
