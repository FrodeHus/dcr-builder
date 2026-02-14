import { OriginBadge } from './OriginBadge'
import { FetchControls } from './FetchControls'
import { SourceFooter } from './SourceFooter'
import { JsonEditor } from '@/components/editor/JsonEditor'
import { PanePanel, PaneStickyHeader } from '@/components/layout/PanePanel'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'

export function SourcePane() {
  const { sourceJson } = useDcrState()
  const dispatch = useDcrDispatch()

  return (
    <PanePanel className="flex-1">
      <PaneStickyHeader>
        <h2 className="text-sm font-semibold">Source JSON</h2>
        <OriginBadge />
      </PaneStickyHeader>
      <FetchControls />
      <div className="flex-1 overflow-auto p-4">
        <JsonEditor
          value={sourceJson}
          onChange={(val) =>
            dispatch({ type: 'SET_SOURCE_JSON', payload: val })
          }
          placeholder="Paste JSON here or fetch from an API endpoint above..."
        />
      </div>
      <SourceFooter />
    </PanePanel>
  )
}
