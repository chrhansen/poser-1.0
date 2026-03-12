import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { UploadPickContent } from "@/components/upload/UploadPickContent";
import { toast } from "sonner";

interface NewAnalysisSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, skip upload and go directly to skier select (rerun mode) */
  rerunFile?: File;
}

export function NewAnalysisSheet({ open, onOpenChange, rerunFile }: NewAnalysisSheetProps) {
  const isMobile = useIsMobile();
  const isRerun = !!rerunFile;
  const title = isRerun ? "Re-run analysis" : "Upload clip";

  const handleContinue = (_skierId: number) => {
    toast.success(isRerun ? "Re-running analysis… (UI-only demo)" : "Clip uploaded! (UI-only demo)");
    onOpenChange(false);
  };

  const body = (
    <div className="overflow-y-auto px-4 py-6 sm:px-6">
      <UploadPickContent
        onContinue={handleContinue}
        initialFile={rerunFile}
        submitLabel={isRerun ? "Re-run analysis" : undefined}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="flex h-[92dvh] flex-col p-0 rounded-t-xl [&>button]:hidden"
        >
          <SheetTitle className="border-b border-border px-4 py-3 sm:px-6 text-base font-semibold">
            {title}
          </SheetTitle>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-lg flex-col overflow-hidden rounded-xl p-0 max-h-[85vh]">
        <DialogTitle className="border-b border-border px-4 py-3 sm:px-6 text-base font-semibold">
            {title}
        </DialogTitle>
        {body}
      </DialogContent>
    </Dialog>
  );
}
