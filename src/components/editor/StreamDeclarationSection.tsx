import { Plus, Trash2 } from 'lucide-react'
import type { DcrColumn, DcrColumnType } from '@/types/dcr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { TooltipLabel } from '@/components/TooltipLabel'
import { dcrTooltips } from '@/data/dcr-tooltips'

const COLUMN_TYPES: Array<DcrColumnType> = [
  'string',
  'int',
  'long',
  'real',
  'boolean',
  'dynamic',
  'datetime',
]

interface StreamDeclarationSectionProps {
  streamName: string
  columns: Array<DcrColumn>
  setStreamName: (name: string) => void
  setColumns: (cols: Array<DcrColumn>) => void
}

export function StreamDeclarationSection({
  streamName,
  columns,
  setStreamName,
  setColumns,
}: StreamDeclarationSectionProps) {
  return (
    <CollapsibleSection
      title="Stream Declaration"
      tooltip="Defines the schema of incoming data. Each column represents a property in your JSON with its corresponding data type"
      defaultOpen
    >
      <div className="space-y-1.5">
        <TooltipLabel
          label="Stream Name"
          tooltip={dcrTooltips.streamName}
          required
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Custom-</span>
          <Input
            id="stream-name"
            value={streamName.replace(/^Custom-/, '')}
            onChange={(e) => setStreamName(e.target.value)}
            placeholder="MyStream"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <TooltipLabel
          label="Columns"
          tooltip={dcrTooltips.columnType}
          required
        />
        {columns.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Paste JSON in the source pane to auto-infer columns, or add them
            manually.
          </p>
        )}
        {columns.map((col, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    value={col.name}
                    onChange={(e) => {
                      const updated = [...columns]
                      updated[i] = { ...col, name: e.target.value }
                      setColumns(updated)
                    }}
                    placeholder="Column name"
                    className="w-full"
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {dcrTooltips.columnName}
                </TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-32">
                  <Select
                    value={col.type}
                    onValueChange={(val: DcrColumnType) => {
                      const updated = [...columns]
                      updated[i] = { ...col, type: val }
                      setColumns(updated)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {dcrTooltips.columnType}
              </TooltipContent>
            </Tooltip>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setColumns(columns.filter((_, j) => j !== i))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setColumns([...columns, { name: '', type: 'string' }])
          }
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Column
        </Button>
      </div>
    </CollapsibleSection>
  )
}
