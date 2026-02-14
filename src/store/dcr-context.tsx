import { createContext, useContext, useReducer } from 'react'
import { dcrReducer, initialState } from './dcr-store'
import type { ReactNode } from 'react'
import type { DcrAction, DcrState } from './dcr-store'

const DcrStateContext = createContext<DcrState | null>(null)
const DcrDispatchContext = createContext<React.Dispatch<DcrAction> | null>(null)

export function DcrProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dcrReducer, initialState)

  return (
    <DcrStateContext value={state}>
      <DcrDispatchContext value={dispatch}>{children}</DcrDispatchContext>
    </DcrStateContext>
  )
}

export function useDcrState(): DcrState {
  const state = useContext(DcrStateContext)
  if (!state) throw new Error('useDcrState must be used within DcrProvider')
  return state
}

export function useDcrDispatch(): React.Dispatch<DcrAction> {
  const dispatch = useContext(DcrDispatchContext)
  if (!dispatch)
    throw new Error('useDcrDispatch must be used within DcrProvider')
  return dispatch
}
