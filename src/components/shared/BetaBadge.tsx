import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const BADGE_CLASSES =
  "text-[15px] leading-none px-2 py-[2px] font-semibold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15 cursor-default";

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
        <TooltipContent side="bottom" sideOffset={6} className="max-w-52 text-center font-normal">
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
        <PopoverContent side="bottom" sideOffset={6} className="max-w-52 text-center text-sm font-normal p-3">
          {TIP_TEXT}
        </PopoverContent>
      </Popover>
    </>
  );
}
