import type { DcrFormData, ValidationError } from '@/types/dcr'
import { createDefaultFormData } from '@/lib/dcr-utils'

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
  | { type: 'SET_VALIDATION_ERRORS'; payload: Array<ValidationError> }
  | { type: 'SET_FETCHING'; payload: boolean }
  | { type: 'SET_FETCH_ERROR'; payload: string | null }
  | { type: 'SET_MOBILE_SECTION'; payload: MobileSection }

export const initialState: DcrState = {
  sourceJson: '',
  sourceOrigin: 'local',
  sourceFetchedAt: null,
  activeTab: 'form',
  dcrForm: createDefaultFormData(),
  generatedJson: '',
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
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload }
    case 'SET_FETCHING':
      return { ...state, isFetching: action.payload }
    case 'SET_FETCH_ERROR':
      return { ...state, fetchError: action.payload }
    case 'SET_MOBILE_SECTION':
      return { ...state, mobileSection: action.payload }
  }
}
