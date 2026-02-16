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
      <div className="min-h-0 flex-1 p-4">
        <div className="relative h-full">
          {!sourceJson.trim() && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10">
              <div className="max-w-sm space-y-3 text-muted-foreground">
                <p className="text-sm font-medium">No JSON data yet</p>
                <p className="text-xs">
                  Paste your JSON sample directly, or use the controls above to
                  fetch from an API endpoint. The columns will be automatically
                  detected.
                </p>
                <p className="text-xs font-medium text-foreground pt-2">
                  Supported formats:
                </p>
                <code className="inline-block bg-muted p-2 rounded text-[11px] text-left">
                  {`{\n  "field1": "text",\n  "field2": 123\n}`}
                </code>
              </div>
            </div>
          )}
          <JsonEditor
            value={sourceJson}
            onChange={(val) =>
              dispatch({ type: 'SET_SOURCE_JSON', payload: val })
            }
            placeholder="Paste JSON here or fetch from an API endpoint above..."
          />
        </div>
      </div>
      <SourceFooter />
    </PanePanel>
  )
}
