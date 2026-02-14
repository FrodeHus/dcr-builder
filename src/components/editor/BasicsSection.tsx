import type { DcrFormData } from '@/types/dcr'
import { Input } from '@/components/ui/input'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { TooltipLabel } from '@/components/TooltipLabel'
import { dcrTooltips } from '@/data/dcr-tooltips'

interface BasicsSectionProps {
  dcrForm: DcrFormData
  update: (patch: Partial<DcrFormData>) => void
}

export function BasicsSection({ dcrForm, update }: BasicsSectionProps) {
  return (
    <CollapsibleSection
      title="Basics"
      tooltip="Basic properties of your Data Collection Rule including name, location, and optional description"
      defaultOpen
    >
      <div className="space-y-1.5">
        <TooltipLabel label="Name" tooltip={dcrTooltips.name} required />
        <Input
          id="dcr-name"
          value={dcrForm.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="my-data-collection-rule"
        />
      </div>
      <div className="space-y-1.5">
        <TooltipLabel
          label="Location"
          tooltip={dcrTooltips.location}
          required
        />
        <Input
          id="dcr-location"
          value={dcrForm.location}
          onChange={(e) => update({ location: e.target.value })}
          placeholder="westeurope"
        />
      </div>
      <div className="space-y-1.5">
        <TooltipLabel
          label="Description"
          tooltip={dcrTooltips.description}
        />
        <Input
          id="dcr-desc"
          value={dcrForm.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Optional description"
        />
      </div>
    </CollapsibleSection>
  )
}
