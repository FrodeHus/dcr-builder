import type { DcrFormData, ValidationError } from '@/types/dcr'
import { createDefaultFormData } from '@/lib/dcr-utils'

export type SourceOrigin = 'local' | 'fetched'
export type ActiveTab = 'form' | 'json'
export type MobileSection = 'source' | 'editor'

export interface DcrState {
  sessionId: string
  sourceJson: string
  sourceOrigin: SourceOrigin
  sourceFetchedAt: string | null
  activeTab: ActiveTab
  dcrForm: DcrFormData
  generatedJson: string
  shareId: string
  shareUrl: string
  validationErrors: Array<ValidationError>
  isDirty: boolean
  isFetching: boolean
  fetchError: string | null
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
  | { type: 'SET_FETCH_ERROR'; payload: string | null }
  | { type: 'SET_MOBILE_SECTION'; payload: MobileSection }
  | { type: 'RESET_SESSION' }

function createSessionId() {
  if (typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const initialState: DcrState = {
  sessionId: createSessionId(),
  sourceJson: '',
  sourceOrigin: 'local',
  sourceFetchedAt: null,
  activeTab: 'form',
  dcrForm: createDefaultFormData(),
  generatedJson: '',
  shareId: '',
  shareUrl: '',
  validationErrors: [],
  isDirty: false,
  isFetching: false,
  fetchError: null,
  mobileSection: 'source',
}

export function dcrReducer(state: DcrState, action: DcrAction): DcrState {
  switch (action.type) {
    case 'SET_SOURCE_JSON':
      return {
        ...state,
        sourceJson: action.payload,
        sourceOrigin: 'local',
        isDirty: true,
      }
    case 'SET_SOURCE_FETCHED':
      return {
        ...state,
        sourceJson: action.payload.json,
        sourceOrigin: 'fetched',
        sourceFetchedAt: action.payload.fetchedAt,
        isDirty: true,
        fetchError: null,
      }
    case 'CLEAR_SOURCE':
      return {
        ...state,
        sourceJson: '',
        sourceOrigin: 'local',
        sourceFetchedAt: null,
        isDirty: false,
        fetchError: null,
      }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'UPDATE_DCR_FORM':
      return {
        ...state,
        dcrForm: { ...state.dcrForm, ...action.payload },
        isDirty: true,
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
    case 'SET_FETCH_ERROR':
      return { ...state, fetchError: action.payload }
    case 'SET_MOBILE_SECTION':
      return { ...state, mobileSection: action.payload }
    case 'RESET_SESSION':
      return {
        ...initialState,
        sessionId: createSessionId(),
      }
  }
}
