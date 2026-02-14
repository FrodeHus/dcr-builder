import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TooltipLabelProps {
  label: string
  tooltip: string
  required?: boolean
}

/**
 * A label component with an integrated tooltip icon
 * Shows a help icon next to the label that displays the tooltip on hover
 */
export function TooltipLabel({
  label,
  tooltip,
  required = false,
}: TooltipLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span>
        {label}
        {required && <span className="text-destructive">*</span>}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
            tabIndex={-1}
          >
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
            <span className="sr-only">{label} information</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
