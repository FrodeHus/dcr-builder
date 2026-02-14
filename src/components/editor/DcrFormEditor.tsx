import { useCallback, useEffect } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
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
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'
import { inferColumnsFromJson } from '@/lib/dcr-utils'

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
    } catch {
      // invalid JSON, skip inference
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
        <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-semibold">
          <ChevronDown className="h-4 w-4" />
          Basics
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="dcr-name">Name</Label>
            <Input
              id="dcr-name"
              value={dcrForm.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="my-data-collection-rule"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dcr-location">Location</Label>
            <Input
              id="dcr-location"
              value={dcrForm.location}
              onChange={(e) => update({ location: e.target.value })}
              placeholder="westeurope"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dcr-desc">Description</Label>
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
        <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-semibold">
          <ChevronDown className="h-4 w-4" />
          Stream Declaration
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="stream-name">Stream Name</Label>
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
            <Label>Columns</Label>
            {columns.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Paste JSON in the source pane to auto-infer columns, or add them
                manually.
              </p>
            )}
            {columns.map((col, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={col.name}
                  onChange={(e) => {
                    const updated = [...columns]
                    updated[i] = { ...col, name: e.target.value }
                    setColumns(updated)
                  }}
                  placeholder="Column name"
                  className="flex-1"
                />
                <Select
                  value={col.type}
                  onValueChange={(val: DcrColumnType) => {
                    const updated = [...columns]
                    updated[i] = { ...col, type: val }
                    setColumns(updated)
                  }}
                >
                  <SelectTrigger className="w-32">
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
        <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-semibold">
          <ChevronDown className="h-4 w-4" />
          Destinations
        </CollapsibleTrigger>
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
              <Input
                value={dest.workspaceResourceId}
                onChange={(e) =>
                  updateDestination(i, 'workspaceResourceId', e.target.value)
                }
                placeholder="/subscriptions/.../workspaces/..."
              />
              <Input
                value={dest.name}
                onChange={(e) => updateDestination(i, 'name', e.target.value)}
                placeholder="Destination name"
              />
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
        <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-semibold">
          <ChevronDown className="h-4 w-4" />
          Data Flows
        </CollapsibleTrigger>
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
                <Label>Transform KQL</Label>
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
                <Label>Output Stream</Label>
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
        <div className="space-y-2">
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
                <span className="font-medium">{err.field}:</span> {err.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}
