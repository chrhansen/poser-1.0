import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { UploadPickContent } from "@/components/upload/UploadPickContent";
import { toast } from "sonner";

interface NewAnalysisSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAnalysisSheet({ open, onOpenChange }: NewAnalysisSheetProps) {
  const isMobile = useIsMobile();

  const handleContinue = (_skierId: number) => {
    toast.success("Clip uploaded! (UI-only demo)");
    onOpenChange(false);
  };

  const body = (
    <div className="overflow-y-auto px-4 py-6 sm:px-6">
      <UploadPickContent onContinue={handleContinue} />
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
            Upload clip
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
            Upload clip
        </DialogTitle>
        {body}
      </DialogContent>
    </Dialog>
  );
}
