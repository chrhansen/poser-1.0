import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoSkierSelect } from "@/components/shared/VideoSkierSelect";

interface UploadSkierSelectProps {
  file: File;
  onCancel: () => void;
  onContinue: (skierId: number) => void;
  /** Override the submit button label (default: "Analyze my skiing") */
  submitLabel?: string;
}

export function UploadSkierSelect({ file, onCancel, onContinue, submitLabel }: UploadSkierSelectProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <VideoSkierSelect file={file} maxTrimSeconds={20}>
        {({ selected, getResult }) => (
          <Button
            className="w-full"
            disabled={!selected}
            onClick={() => {
              const result = getResult();
              onContinue(result.objectId);
            }}
          >
            {selected ? "Analyze my skiing" : "Select a skier to continue"}
          </Button>
        )}
      </VideoSkierSelect>
    </div>
  );
}
