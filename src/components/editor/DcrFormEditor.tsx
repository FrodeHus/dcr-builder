import { AlertCircle, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import type { DcrColumnType } from '@/types/dcr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'
import { dcrTooltips } from '@/data/dcr-tooltips'
import { HelpTooltip } from '@/components/HelpTooltip'
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
  const { dcrForm, validationErrors } = useDcrState()
  const dispatch = useDcrDispatch()

  const streamName =
    Object.keys(dcrForm.streamDeclarations)[0] || 'Custom-MyStream'
  const columns =
    (streamName in dcrForm.streamDeclarations
      ? dcrForm.streamDeclarations[streamName].columns
      : undefined) ?? []
  const destinations = dcrForm.destinations.logAnalytics
  const dataFlows = dcrForm.dataFlows

  return (
    <div className="p-4">
      <Accordion type="multiple" defaultValue={['basics']}>
        {/* Basics */}
        <AccordionItem value="basics">
          <div className="flex w-full items-center justify-between">
            <AccordionTrigger className="flex flex-1 items-center gap-2 text-sm font-semibold">
              <span>Basics</span>
            </AccordionTrigger>
            <HelpTooltip
              content="Basic properties of your Data Collection Rule including name, location, and optional description"
              srLabel="Basics section information"
            />
          </div>
          <AccordionContent className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <TooltipLabel label="Name" tooltip={dcrTooltips.name} required />
              <Input
                id="dcr-name"
                value={dcrForm.name}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_DCR_FORM',
                    payload: { name: e.target.value },
                  })
                }
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
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_DCR_FORM',
                    payload: { location: e.target.value },
                  })
                }
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
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_DCR_FORM',
                    payload: { description: e.target.value },
                  })
                }
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-1.5">
              <TooltipLabel
                label="Data Collection Endpoint"
                tooltip={dcrTooltips.dataCollectionEndpointId}
              />
              <Input
                id="dcr-dce-id"
                value={dcrForm.dataCollectionEndpointId}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_DCR_FORM',
                    payload: { dataCollectionEndpointId: e.target.value },
                  })
                }
                placeholder="Leave empty to create automatically"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Stream Declaration */}
        <AccordionItem value="stream-declaration">
          <div className="flex w-full items-center justify-between">
            <AccordionTrigger className="flex flex-1 items-center gap-2 text-sm font-semibold">
              <span>Stream Declaration</span>
            </AccordionTrigger>
            <HelpTooltip
              content="Defines the schema of incoming data. Each column represents a property in your JSON with its corresponding data type"
              srLabel="Stream declaration information"
            />
          </div>
          <AccordionContent className="mt-3 space-y-3">
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
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_STREAM_NAME',
                      payload: e.target.value,
                    })
                  }
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
                  Paste JSON in the source pane to auto-infer columns, or add
                  them manually.
                </p>
              )}
              {columns.map((col) => (
                <div key={col.id} className="flex gap-2">
                  <div className="flex-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          value={col.name}
                          onChange={(e) =>
                            dispatch({
                              type: 'SET_COLUMNS',
                              payload: columns.map((c) =>
                                c.id === col.id
                                  ? { ...c, name: e.target.value }
                                  : c,
                              ),
                            })
                          }
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
                          onValueChange={(val: DcrColumnType) =>
                            dispatch({
                              type: 'SET_COLUMNS',
                              payload: columns.map((c) =>
                                c.id === col.id ? { ...c, type: val } : c,
                              ),
                            })
                          }
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
                    onClick={() =>
                      dispatch({
                        type: 'SET_COLUMNS',
                        payload: columns.filter((c) => c.id !== col.id),
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  dispatch({
                    type: 'SET_COLUMNS',
                    payload: [
                      ...columns,
                      {
                        id: crypto.randomUUID(),
                        name: '',
                        type: 'string',
                      },
                    ],
                  })
                }
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Column
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Destinations */}
        <AccordionItem value="destinations">
          <div className="flex w-full items-center justify-between">
            <AccordionTrigger className="flex flex-1 items-center gap-2 text-sm font-semibold">
              <span>Destinations</span>
            </AccordionTrigger>
            <HelpTooltip
              content="Specifies where your data will be sent. Currently supports Log Analytics workspaces"
              srLabel="Destinations section information"
            />
          </div>
          <AccordionContent className="mt-3 space-y-3">
            {destinations.map((dest, i) => (
              <div key={dest.id} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Destination {i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      dispatch({ type: 'REMOVE_DESTINATION', payload: i })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <TooltipLabel
                    label="Subscription ID"
                    tooltip={dcrTooltips.subscriptionId}
                    required
                  />
                  <Input
                    value={dest.subscriptionId}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_DESTINATION',
                        payload: {
                          index: i,
                          field: 'subscriptionId',
                          value: e.target.value,
                        },
                      })
                    }
                    placeholder="00000000-0000-0000-0000-000000000000"
                  />
                </div>
                <div className="space-y-1.5">
                  <TooltipLabel
                    label="Resource Group Name"
                    tooltip={dcrTooltips.resourceGroupName}
                    required
                  />
                  <Input
                    value={dest.resourceGroupName}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_DESTINATION',
                        payload: {
                          index: i,
                          field: 'resourceGroupName',
                          value: e.target.value,
                        },
                      })
                    }
                    placeholder="my-resource-group"
                  />
                </div>
                <div className="space-y-1.5">
                  <TooltipLabel
                    label="Workspace Name"
                    tooltip={dcrTooltips.workspaceName}
                    required
                  />
                  <Input
                    value={dest.workspaceName}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_DESTINATION',
                        payload: {
                          index: i,
                          field: 'workspaceName',
                          value: e.target.value,
                        },
                      })
                    }
                    placeholder="my-log-workspace"
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
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_DESTINATION',
                        payload: {
                          index: i,
                          field: 'name',
                          value: e.target.value,
                        },
                      })
                    }
                    placeholder="Destination name"
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'ADD_DESTINATION' })}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Destination
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Data Flows */}
        <AccordionItem value="data-flows">
          <div className="flex w-full items-center justify-between">
            <AccordionTrigger className="flex flex-1 items-center gap-2 text-sm font-semibold">
              <span>Data Flows</span>
            </AccordionTrigger>
            <HelpTooltip
              content="Connects input streams to destinations. Optionally applies KQL transformations to data before ingestion"
              srLabel="Data flows section information"
            />
          </div>
          <AccordionContent className="mt-3 space-y-3">
            {dataFlows.map((flow, i) => (
              <div key={flow.id} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Flow {i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      dispatch({ type: 'REMOVE_DATA_FLOW', payload: i })
                    }
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
                      dispatch({
                        type: 'UPDATE_DATA_FLOW',
                        payload: {
                          index: i,
                          patch: { transformKql: e.target.value },
                        },
                      })
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
                      dispatch({
                        type: 'UPDATE_DATA_FLOW',
                        payload: {
                          index: i,
                          patch: { outputStream: e.target.value },
                        },
                      })
                    }
                    onBlur={(e) => {
                      const value = e.target.value.trim()
                      if (!value) return

                      let formatted = value

                      // Add prefix if not already present
                      if (
                        !formatted.startsWith('Custom-') &&
                        !formatted.startsWith('Microsoft-')
                      ) {
                        formatted = `Custom-${formatted}`
                      }

                      // Add suffix if it's a Custom table and doesn't already have it
                      if (
                        formatted.startsWith('Custom-') &&
                        !formatted.endsWith('_CL')
                      ) {
                        formatted = `${formatted}_CL`
                      }

                      // Update if changed
                      if (formatted !== value) {
                        dispatch({
                          type: 'UPDATE_DATA_FLOW',
                          payload: {
                            index: i,
                            patch: { outputStream: formatted },
                          },
                        })
                      }
                    }}
                    placeholder="Custom-MyTable_CL or Microsoft-TableName"
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'ADD_DATA_FLOW' })}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Data Flow
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <AccordionItem value="validation-errors">
            <AccordionTrigger className="flex w-full items-center gap-2 text-sm font-semibold text-destructive">
              <span>Validation Issues ({validationErrors.length})</span>
            </AccordionTrigger>
            <AccordionContent className="mt-3 space-y-2">
              {validationErrors.map((err) => (
                <Alert
                  key={`${err.field}-${err.message}`}
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
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )
}
