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
}

export type DcrAction =
  | { type: 'SET_SOURCE_JSON'; payload: string }
  | { type: 'SET_SOURCE_FETCHED'; payload: { json: string; fetchedAt: string } }
  | { type: 'CLEAR_SOURCE' }
  | { type: 'SET_ACTIVE_TAB'; payload: ActiveTab }
  | { type: 'UPDATE_DCR_FORM'; payload: Partial<DcrFormData> }
  | { type: 'SET_GENERATED_JSON'; payload: string }
  | { type: 'SET_SHARE_DATA'; payload: { id: string; url: string } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: Array<ValidationError> }
  | { type: 'SET_FETCHING'; payload: boolean }
  | { type: 'SET_MOBILE_SECTION'; payload: MobileSection }
  | { type: 'RESET_SESSION' }
  // Form mutation actions
  | { type: 'SET_STREAM_NAME'; payload: string }
  | { type: 'SET_COLUMNS'; payload: Array<DcrColumn> }
  | { type: 'ADD_DESTINATION' }
  | { type: 'REMOVE_DESTINATION'; payload: number }
  | {
      type: 'UPDATE_DESTINATION'
      payload: {
        index: number
        field: 'workspaceResourceId' | 'name'
        value: string
      }
    }
  | { type: 'ADD_DATA_FLOW' }
  | { type: 'REMOVE_DATA_FLOW'; payload: number }
  | {
      type: 'UPDATE_DATA_FLOW'
      payload: { index: number; patch: Partial<DcrDataFlow> }
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
}

function getStreamName(dcrForm: DcrFormData): string {
  return Object.keys(dcrForm.streamDeclarations)[0] || 'Custom-MyStream'
}

function applyInferredColumns(
  dcrForm: DcrFormData,
  jsonString: string,
): DcrFormData {
  if (!jsonString.trim()) return dcrForm
  try {
    const parsed = JSON.parse(jsonString)
    const inferred = inferColumnsFromJson(parsed)
    if (inferred.length > 0) {
      const streamName = getStreamName(dcrForm)
      return {
        ...dcrForm,
        streamDeclarations: {
          [streamName]: { columns: inferred },
        },
      }
    }
  } catch {
    // invalid JSON, skip inference
  }
  return dcrForm
}

export function dcrReducer(state: DcrState, action: DcrAction): DcrState {
  switch (action.type) {
    case 'SET_SOURCE_JSON': {
      const dcrForm = applyInferredColumns(state.dcrForm, action.payload)
      return {
        ...state,
        sourceJson: action.payload,
        sourceOrigin: 'local',
        dcrForm,
      }
    }
    case 'SET_SOURCE_FETCHED': {
      const dcrForm = applyInferredColumns(
        state.dcrForm,
        action.payload.json,
      )
      return {
        ...state,
        sourceJson: action.payload.json,
        sourceOrigin: 'fetched',
        sourceFetchedAt: action.payload.fetchedAt,
        dcrForm,
      }
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
    case 'RESET_SESSION':
      return { ...initialState }

    // --- Form mutation actions ---
    case 'SET_STREAM_NAME': {
      const prefixed = action.payload.startsWith('Custom-')
        ? action.payload
        : `Custom-${action.payload}`
      const currentStream = getStreamName(state.dcrForm)
      const columns =
        state.dcrForm.streamDeclarations[currentStream]?.columns ?? []
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          streamDeclarations: {
            [prefixed]: { columns },
          },
        },
      }
    }
    case 'SET_COLUMNS': {
      const streamName = getStreamName(state.dcrForm)
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
                workspaceResourceId: '',
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
      const streamName = getStreamName(state.dcrForm)
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
      const { index, patch } = action.payload
      return {
        ...state,
        dcrForm: {
          ...state.dcrForm,
          dataFlows: state.dcrForm.dataFlows.map((f, i) =>
            i === index ? { ...f, ...patch } : f,
          ),
        },
      }
    }
  }
}
