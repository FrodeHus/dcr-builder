import { useCallback, useEffect } from 'react'
import { BasicsSection } from './BasicsSection'
import { StreamDeclarationSection } from './StreamDeclarationSection'
import { DestinationsSection } from './DestinationsSection'
import { DataFlowsSection } from './DataFlowsSection'
import { ValidationErrorsSection } from './ValidationErrorsSection'
import type { DcrColumn, DcrDataFlow } from '@/types/dcr'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'
import { inferColumnsFromJson } from '@/lib/dcr-utils'

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
      <BasicsSection dcrForm={dcrForm} update={update} />
      <StreamDeclarationSection
        streamName={streamName}
        columns={columns}
        setStreamName={setStreamName}
        setColumns={setColumns}
      />
      <DestinationsSection
        destinations={destinations}
        addDestination={addDestination}
        removeDestination={removeDestination}
        updateDestination={updateDestination}
      />
      <DataFlowsSection
        dataFlows={dataFlows}
        addDataFlow={addDataFlow}
        removeDataFlow={removeDataFlow}
        updateDataFlow={updateDataFlow}
      />
      <ValidationErrorsSection validationErrors={validationErrors} />
    </div>
  )
}
