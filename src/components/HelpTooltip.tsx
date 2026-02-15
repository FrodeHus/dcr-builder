import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HelpTooltipProps {
  content: string
  srLabel?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function HelpTooltip({
  content,
  srLabel = 'More information',
  side = 'right',
}: HelpTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
          tabIndex={-1}
        >
          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          <span className="sr-only">{srLabel}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
