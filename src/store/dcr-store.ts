import type {
  DcrColumn,
  DcrDataFlow,
  DcrFormData,
  ValidationError,
} from '@/types/dcr'
import { createDefaultFormData, inferColumnsFromJson } from '@/lib/dcr-utils'

export type SourceOrigin = 'local' | 'fetched'
export type ActiveTab = 'form' | 'json'
export type MobileSection = 'source' | 'editor'

export interface DcrState {
  sourceJson: string
  sourceOrigin: SourceOrigin
  sourceFetchedAt: string | null
  activeTab: ActiveTab
  dcrForm: DcrFormData
  generatedJson: string
  shareId: string | null
  shareUrl: string | null
  validationErrors: Array<ValidationError>
  isFetching: boolean
  mobileSection: MobileSection
  touchedFields: Set<string>
  columnsSourceHash: string | null
}

export type DcrAction =
  | { type: 'SET_SOURCE_JSON'; payload: string }
  | {
      type: 'SET_SOURCE_FETCHED'
      payload: { json: string; fetchedAt: string }
    }
  | { type: 'CLEAR_SOURCE' }
  | { type: 'SET_ACTIVE_TAB'; payload: ActiveTab }
  | { type: 'UPDATE_DCR_FORM'; payload: Partial<DcrFormData> }
  | { type: 'SET_STREAM_NAME'; payload: string }
  | { type: 'SET_COLUMNS'; payload: Array<DcrColumn> }
  | { type: 'ADD_DESTINATION' }
  | { type: 'REMOVE_DESTINATION'; payload: number }
  | {
      type: 'UPDATE_DESTINATION'
      payload: {
        index: number
        field: 'subscriptionId' | 'resourceGroupName' | 'workspaceName' | 'name'
        value: string
      }
    }
  | { type: 'ADD_DATA_FLOW' }
  | { type: 'REMOVE_DATA_FLOW'; payload: number }
  | {
      type: 'UPDATE_DATA_FLOW'
      payload: { index: number; patch: Partial<DcrDataFlow> }
    }
  | { type: 'SET_GENERATED_JSON'; payload: string }
  | { type: 'SET_SHARE_DATA'; payload: { id: string; url: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: Array<ValidationError> }
  | { type: 'SET_FETCHING'; payload: boolean }
  | { type: 'SET_MOBILE_SECTION'; payload: MobileSection }
  | { type: 'TOUCH_FIELD'; payload: string }
  | { type: 'TOUCH_ALL_FIELDS' }
  | { type: 'REINFER_COLUMNS' }
  | { type: 'DISMISS_REINFER' }
  | { type: 'RESET_SESSION' }

function getStreamName(state: DcrState): string {
  return Object.keys(state.dcrForm.streamDeclarations)[0] || 'Custom-MyStream'
}

function getColumns(state: DcrState): Array<DcrColumn> {
  const name = getStreamName(state)
  return (
    (
      state.dcrForm.streamDeclarations[name] as
        | { columns: Array<DcrColumn> }
        | undefined
    )?.columns ?? []
  )
}

export function computeSourceHash(json: string): string {
  return json.length + ':' + json.slice(0, 200)
}

function inferAndSetColumns(state: DcrState, jsonString: string): DcrState {
  if (!jsonString.trim()) return state
  try {
    const parsed = JSON.parse(jsonString)
    const inferred = inferColumnsFromJson(parsed)
    if (inferred.length > 0) {
      const streamName = getStreamName(state)
      return {
        ...state,
        columnsSourceHash: computeSourceHash(jsonString),
        dcrForm: {
          ...state.dcrForm,
          streamDeclarations: {
            [streamName]: { columns: inferred },
          },
        },
      }
    }
  } catch {
    // Invalid JSON — skip inference
  }
  return state
}

export const initialState: DcrState = {
  sourceJson: '',
  sourceOrigin: 'local',
  sourceFetchedAt: null,
  activeTab: 'form',
  dcrForm: createDefaultFormData(),
  generatedJson: '',
  shareId: null,
  shareUrl: null,
  validationErrors: [],
  isFetching: false,
  mobileSection: 'source',
  touchedFields: new Set<string>(),
  columnsSourceHash: null,
}

export function dcrReducer(state: DcrState, action: DcrAction): DcrState {
  switch (action.type) {
    case 'SET_SOURCE_JSON': {
      const next = {
        ...state,
        sourceJson: action.payload,
        sourceOrigin: 'local' as const,
      }
      return inferAndSetColumns(next, action.payload)
    }
    case 'SET_SOURCE_FETCHED': {
      const next = {
        ...state,
        sourceJson: action.payload.json,
        sourceOrigin: 'fetched' as const,
        sourceFetchedAt: action.payload.fetchedAt,
      }
      return inferAndSetColumns(next, action.payload.json)
    }
    case 'CLEAR_SOURCE':
      return {
        ...state,
        sourceJson: '',
        sourceOrigin: 'local',
        sourceFetchedAt: null,
      }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'UPDATE_DCR_FORM':
      return {
        ...state,
        dcrForm: { ...state.dcrForm, ...action.payload },
      }
    case 'SET_STREAM_NAME': {
      const prefixed = action.payload.startsWith('Custom-')
        ? action.payload
        : `Custom-${action.payload}`
      const currentColumns = getColumns(state)
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          streamDeclarations: {
            [prefixed]: { columns: currentColumns },
          },
        },
      }
    }
    case 'SET_COLUMNS': {
      const streamName = getStreamName(state)
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          streamDeclarations: {
            [streamName]: { columns: action.payload },
          },
        },
      }
    }
    case 'ADD_DESTINATION':
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          destinations: {
            logAnalytics: [
              ...state.dcrForm.destinations.logAnalytics,
              {
                id: crypto.randomUUID(),
                subscriptionId: '',
                resourceGroupName: '',
                workspaceName: '',
                name: '',
              },
            ],
          },
        },
      }
    case 'REMOVE_DESTINATION':
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          destinations: {
            logAnalytics: state.dcrForm.destinations.logAnalytics.filter(
              (_, i) => i !== action.payload,
            ),
          },
        },
      }
    case 'UPDATE_DESTINATION': {
      const { index, field, value } = action.payload
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          destinations: {
            logAnalytics: state.dcrForm.destinations.logAnalytics.map((d, i) =>
              i === index ? { ...d, [field]: value } : d,
            ),
          },
        },
      }
    }
    case 'ADD_DATA_FLOW': {
      const streamName = getStreamName(state)
      const dests = state.dcrForm.destinations.logAnalytics
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          dataFlows: [
            ...state.dcrForm.dataFlows,
            {
              id: crypto.randomUUID(),
              streams: [streamName],
              destinations: dests.length > 0 ? [dests[0].name] : [],
              transformKql: 'source',
              outputStream: '',
            },
          ],
        },
      }
    }
    case 'REMOVE_DATA_FLOW':
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          dataFlows: state.dcrForm.dataFlows.filter(
            (_, i) => i !== action.payload,
          ),
        },
      }
    case 'UPDATE_DATA_FLOW': {
      const { index: flowIndex, patch } = action.payload
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          dataFlows: state.dcrForm.dataFlows.map((f, i) =>
            i === flowIndex ? { ...f, ...patch } : f,
          ),
        },
      }
    }
    case 'SET_GENERATED_JSON':
      return { ...state, generatedJson: action.payload }
    case 'SET_SHARE_DATA':
      return {
        ...state,
        shareId: action.payload.id,
        shareUrl: action.payload.url,
      }
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload }
    case 'SET_FETCHING':
      return { ...state, isFetching: action.payload }
    case 'SET_MOBILE_SECTION':
      return { ...state, mobileSection: action.payload }
    case 'TOUCH_FIELD': {
      const next = new Set(state.touchedFields)
      next.add(action.payload)
      return { ...state, touchedFields: next }
    }
    case 'TOUCH_ALL_FIELDS':
      return {
        ...state,
        touchedFields: new Set([
          'name',
          'location',
          'streamDeclarations',
          'destinations',
          'dataFlows',
        ]),
      }
    case 'REINFER_COLUMNS':
      return inferAndSetColumns(
        { ...state, columnsSourceHash: null },
        state.sourceJson,
      )
    case 'DISMISS_REINFER':
      return {
        ...state,
        columnsSourceHash: state.sourceJson.trim()
          ? computeSourceHash(state.sourceJson)
          : null,
      }
    case 'RESET_SESSION':
      return { ...initialState, touchedFields: new Set<string>() }
  }
}
