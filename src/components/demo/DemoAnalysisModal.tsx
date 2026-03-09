import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

const steps = [
  { number: 1, label: "Select" },
  { number: 2, label: "Analyze" },
  { number: 3, label: "Feedback" },
] as const;

interface DemoAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center gap-1">
          {i > 0 && (
            <div
              className={cn(
                "h-px w-4 sm:w-6",
                step.number <= currentStep ? "bg-primary" : "bg-border"
              )}
            />
          )}
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                step.number < currentStep
                  ? "bg-primary text-primary-foreground"
                  : step.number === currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground border border-border"
              )}
            >
              {step.number}
            </div>
            <span
              className={cn(
                "text-xs font-medium hidden sm:inline",
                step.number <= currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ModalTopBar({
  currentStep,
  onClose,
}: {
  currentStep: number;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between border-b border-border px-6 py-4">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Demo analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            See how Poser goes from clip to feedback
          </p>
        </div>
        <StepIndicator currentStep={currentStep} />
      </div>
      <button
        onClick={onClose}
        className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}

function ModalBody({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
      {/* Left / Top — media area */}
      <div className="flex items-center justify-center bg-accent/30 p-6 md:w-1/2">
        <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground md:h-full">
          Media placeholder — Step {currentStep}
        </div>
      </div>

      {/* Right / Bottom — copy area */}
      <div className="flex flex-1 flex-col justify-between p-6 md:w-1/2">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Step {currentStep} content will go here.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DemoAnalysisModal({
  open,
  onOpenChange,
}: DemoAnalysisModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const isMobile = useIsMobile();

  const handleClose = () => {
    onOpenChange(false);
    // Reset step after close animation
    setTimeout(() => setCurrentStep(1), 300);
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="flex h-[100dvh] flex-col p-0 rounded-none [&>button]:hidden"
        >
          <ModalTopBar currentStep={currentStep} onClose={handleClose} />
          <ModalBody currentStep={currentStep} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className={cn(
              "relative z-50 flex w-full max-w-[1000px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl",
              "max-h-[85vh]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            )}
            data-state={open ? "open" : "closed"}
          >
            <ModalTopBar currentStep={currentStep} onClose={handleClose} />
            <ModalBody currentStep={currentStep} />
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
