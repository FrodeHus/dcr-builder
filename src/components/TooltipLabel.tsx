import { HelpTooltip } from '@/components/HelpTooltip'

interface TooltipLabelProps {
  label: string
  tooltip: string
  required?: boolean
}

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
      <HelpTooltip tooltip={tooltip} srLabel={`${label} information`} />
    </div>
  )
}
