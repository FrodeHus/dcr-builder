import { Plus, Trash2 } from 'lucide-react'
import type { DcrDataFlow } from '@/types/dcr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { TooltipLabel } from '@/components/TooltipLabel'
import { dcrTooltips } from '@/data/dcr-tooltips'

interface DataFlowsSectionProps {
  dataFlows: Array<DcrDataFlow>
  addDataFlow: () => void
  removeDataFlow: (index: number) => void
  updateDataFlow: (index: number, patch: Partial<DcrDataFlow>) => void
}

export function DataFlowsSection({
  dataFlows,
  addDataFlow,
  removeDataFlow,
  updateDataFlow,
}: DataFlowsSectionProps) {
  return (
    <CollapsibleSection
      title="Data Flows"
      tooltip="Connects input streams to destinations. Optionally applies KQL transformations to data before ingestion"
      defaultOpen
    >
      {dataFlows.map((flow, i) => (
        <div key={i} className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Flow {i + 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeDataFlow(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1.5">
            <TooltipLabel
              label="Transform KQL"
              tooltip={dcrTooltips.transformKql}
              required
            />
            <Textarea
              value={flow.transformKql}
              onChange={(e) =>
                updateDataFlow(i, { transformKql: e.target.value })
              }
              placeholder="source"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <TooltipLabel
              label="Output Stream"
              tooltip={dcrTooltips.outputStream}
              required
            />
            <Input
              value={flow.outputStream}
              onChange={(e) =>
                updateDataFlow(i, { outputStream: e.target.value })
              }
              placeholder="Custom-MyTable_CL or Microsoft-TableName"
            />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addDataFlow}>
        <Plus className="mr-1 h-3 w-3" />
        Add Data Flow
      </Button>
    </CollapsibleSection>
  )
}
