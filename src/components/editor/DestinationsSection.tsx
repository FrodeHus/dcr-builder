import { Plus, Trash2 } from 'lucide-react'
import type { DcrLogAnalyticsDestination } from '@/types/dcr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { TooltipLabel } from '@/components/TooltipLabel'
import { dcrTooltips } from '@/data/dcr-tooltips'

interface DestinationsSectionProps {
  destinations: Array<DcrLogAnalyticsDestination>
  addDestination: () => void
  removeDestination: (index: number) => void
  updateDestination: (
    index: number,
    field: 'workspaceResourceId' | 'name',
    value: string,
  ) => void
}

export function DestinationsSection({
  destinations,
  addDestination,
  removeDestination,
  updateDestination,
}: DestinationsSectionProps) {
  return (
    <CollapsibleSection
      title="Destinations"
      tooltip="Specifies where your data will be sent. Currently supports Log Analytics workspaces"
      defaultOpen
    >
      {destinations.map((dest, i) => (
        <div key={i} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Destination {i + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeDestination(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <TooltipLabel
              label="Workspace Resource ID"
              tooltip={dcrTooltips.workspaceResourceId}
              required
            />
            <Input
              value={dest.workspaceResourceId}
              onChange={(e) =>
                updateDestination(i, 'workspaceResourceId', e.target.value)
              }
              placeholder="/subscriptions/.../workspaces/..."
            />
          </div>
          <div className="space-y-1.5">
            <TooltipLabel
              label="Destination Name"
              tooltip={dcrTooltips.destinationName}
              required
            />
            <Input
              value={dest.name}
              onChange={(e) => updateDestination(i, 'name', e.target.value)}
              placeholder="Destination name"
            />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addDestination}>
        <Plus className="mr-1 h-3 w-3" />
        Add Destination
      </Button>
    </CollapsibleSection>
  )
}
