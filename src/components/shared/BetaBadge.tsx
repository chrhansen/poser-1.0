import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const BADGE_CLASSES =
  "text-[10px] leading-none px-1.5 py-[1px] font-semibold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15 cursor-default";

const TIP_TEXT = "Not all features are fully functioning. Until then, Poser is free.";

export function BetaBadge({ className = "" }: { className?: string }) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <>
      {/* Desktop: tooltip on hover */}
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="hidden sm:inline-flex" onClick={(e) => e.preventDefault()}>
            <Badge className={`${BADGE_CLASSES} ${className}`}>Beta</Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6} className="max-w-52 text-center">
          {TIP_TEXT}
        </TooltipContent>
      </Tooltip>

      {/* Mobile: popover on tap */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <span
            className="inline-flex sm:hidden"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPopoverOpen((v) => !v);
            }}
          >
            <Badge className={`${BADGE_CLASSES} ${className}`}>Beta</Badge>
          </span>
        </PopoverTrigger>
        <PopoverContent side="bottom" sideOffset={6} className="max-w-52 text-center text-sm p-3">
          {TIP_TEXT}
        </PopoverContent>
      </Popover>
    </>
  );
}
