import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { HelpTooltip } from '@/components/HelpTooltip'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  tooltip?: string
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  tooltip,
  defaultOpen,
  children,
  className,
}: CollapsibleSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center gap-2 text-sm font-semibold',
          className,
        )}
      >
        <ChevronDown className="h-4 w-4" />
        <span className="flex items-center gap-1.5">
          {title}
          {tooltip && (
            <HelpTooltip tooltip={tooltip} srLabel={`${title} information`} />
          )}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
