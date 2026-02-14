import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HelpTooltipProps {
  tooltip: string
  srLabel?: string
}

export function HelpTooltip({ tooltip, srLabel }: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
          tabIndex={-1}
        >
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          {srLabel && <span className="sr-only">{srLabel}</span>}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
