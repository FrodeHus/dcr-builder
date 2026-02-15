import { useCallback, useEffect } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react'
import type { DcrColumn, DcrColumnType, DcrDataFlow } from '@/types/dcr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'
import { inferColumnsFromJson } from '@/lib/dcr-utils'
import { dcrTooltips } from '@/data/dcr-tooltips'
import { TooltipLabel } from '@/components/TooltipLabel'

const COLUMN_TYPES: Array<DcrColumnType> = [
  'string',
  'int',
  'long',
  'real',
  'boolean',
  'dynamic',
  'datetime',
]

export function DcrFormEditor() {
  const { dcrForm, sourceJson, validationErrors } = useDcrState()
  const dispatch = useDcrDispatch()

  const update = useCallback(
    (
      patch: Parameters<typeof dispatch>[0] extends { payload: infer P }
        ? P extends Record<string, unknown>
          ? P
          : never
        : never,
    ) => {
      dispatch({ type: 'UPDATE_DCR_FORM', payload: patch })
    },
    [dispatch],
  )

  const streamName =
    Object.keys(dcrForm.streamDeclarations)[0] || 'Custom-MyStream'
  const columns =
    (streamName in dcrForm.streamDeclarations
      ? dcrForm.streamDeclarations[streamName].columns
      : undefined) ?? []

  const setColumns = useCallback(
    (cols: Array<DcrColumn>) => {
      dispatch({
        type: 'UPDATE_DCR_FORM',
        payload: {
          streamDeclarations: {
            [streamName]: { columns: cols },
          },
        },
      })
    },
    [dispatch, streamName],
  )

  const setStreamName = useCallback(
    (newName: string) => {
      const prefixed = newName.startsWith('Custom-')
        ? newName
        : `Custom-${newName}`
      dispatch({
        type: 'UPDATE_DCR_FORM',
        payload: {
          streamDeclarations: {
            [prefixed]: { columns },
          },
        },
      })
    },
    [dispatch, columns],
  )

  // Infer columns when source JSON changes
  useEffect(() => {
    if (!sourceJson.trim()) return
    try {
      const parsed = JSON.parse(sourceJson)
      const inferred = inferColumnsFromJson(parsed)
      if (inferred.length > 0) {
        setColumns(inferred)
      }
    } catch (error) {
      // Invalid JSON or inference error - log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.debug(
          'Column inference skipped:',
          error instanceof Error ? error.message : 'Unknown error',
        )
      }
    }
  }, [sourceJson, setColumns])

  const destinations = dcrForm.destinations.logAnalytics
  const dataFlows = dcrForm.dataFlows

  const addDestination = () => {
    dispatch({
      type: 'UPDATE_DCR_FORM',
      payload: {
        destinations: {
          logAnalytics: [
            ...destinations,
            { workspaceResourceId: '', name: '' },
          ],
        },
      },
    })
  }

  const removeDestination = (index: number) => {
    dispatch({
      type: 'UPDATE_DCR_FORM',
      payload: {
        destinations: {
          logAnalytics: destinations.filter((_, i) => i !== index),
        },
      },
    })
  }

  const updateDestination = (
    index: number,
    field: 'workspaceResourceId' | 'name',
    value: string,
  ) => {
    dispatch({
      type: 'UPDATE_DCR_FORM',
      payload: {
        destinations: {
          logAnalytics: destinations.map((d, i) =>
            i === index ? { ...d, [field]: value } : d,
          ),
        },
      },
    })
  }

  const addDataFlow = () => {
    dispatch({
      type: 'UPDATE_DCR_FORM',
      payload: {
        dataFlows: [
          ...dataFlows,
          {
            streams: [streamName],
            destinations: destinations.length > 0 ? [destinations[0].name] : [],
            transformKql: 'source',
            outputStream: '',
          },
        ],
      },
    })
  }

  const removeDataFlow = (index: number) => {
    dispatch({
      type: 'UPDATE_DCR_FORM',
      payload: {
        dataFlows: dataFlows.filter((_, i) => i !== index),
      },
    })
  }

  const updateDataFlow = (index: number, patch: Partial<DcrDataFlow>) => {
    dispatch({
      type: 'UPDATE_DCR_FORM',
      payload: {
        dataFlows: dataFlows.map((f, i) =>
          i === index ? { ...f, ...patch } : f,
        ),
      },
    })
  }

  return (
    <div className="space-y-4 p-4">
      {/* Basics */}
      <Collapsible defaultOpen>
        <div className="flex w-full items-center justify-between">
          <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-sm font-semibold">
            <ChevronDown className="h-4 w-4" />
            <span>Basics</span>
          </CollapsibleTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
                tabIndex={-1}
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="sr-only">Basics section information</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Basic properties of your Data Collection Rule including name,
              location, and optional description
            </TooltipContent>
          </Tooltip>
        </div>
        <CollapsibleContent className="mt-3 space-y-3">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Stream Declaration */}
      <Collapsible defaultOpen>
        <div className="flex w-full items-center justify-between">
          <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-sm font-semibold">
            <ChevronDown className="h-4 w-4" />
            <span>Stream Declaration</span>
          </CollapsibleTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
                tabIndex={-1}
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="sr-only">Stream declaration information</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Defines the schema of incoming data. Each column represents a
              property in your JSON with its corresponding data type
            </TooltipContent>
          </Tooltip>
        </div>
        <CollapsibleContent className="mt-3 space-y-3">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Destinations */}
      <Collapsible defaultOpen>
        <div className="flex w-full items-center justify-between">
          <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-sm font-semibold">
            <ChevronDown className="h-4 w-4" />
            <span>Destinations</span>
          </CollapsibleTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
                tabIndex={-1}
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="sr-only">
                  Destinations section information
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Specifies where your data will be sent. Currently supports Log
              Analytics workspaces
            </TooltipContent>
          </Tooltip>
        </div>
        <CollapsibleContent className="mt-3 space-y-3">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Data Flows */}
      <Collapsible defaultOpen>
        <div className="flex w-full items-center justify-between">
          <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-sm font-semibold">
            <ChevronDown className="h-4 w-4" />
            <span>Data Flows</span>
          </CollapsibleTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-muted"
                tabIndex={-1}
              >
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="sr-only">Data flows section information</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Connects input streams to destinations. Optionally applies KQL
              transformations to data before ingestion
            </TooltipContent>
          </Tooltip>
        </div>
        <CollapsibleContent className="mt-3 space-y-3">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-semibold text-destructive">
            <ChevronDown className="h-4 w-4" />
            Validation Issues ({validationErrors.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-2">
            {validationErrors.map((err, i) => (
              <Alert
                key={i}
                variant={err.severity === 'error' ? 'destructive' : 'default'}
              >
                {err.severity === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <span className="font-medium">{err.field}:</span>{' '}
                  {err.message}
                </AlertDescription>
              </Alert>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
