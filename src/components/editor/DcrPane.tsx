import { toast } from 'sonner'
import { DcrFormEditor } from './DcrFormEditor'
import { DcrJsonViewer } from './DcrJsonViewer'
import { PanePanel, PaneStickyHeader } from '@/components/layout/PanePanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'
import { generateDcr, validateDcr } from '@/lib/dcr-utils'

export function DcrPane() {
  const { activeTab, dcrForm } = useDcrState()
  const dispatch = useDcrDispatch()

  const handleValidate = () => {
    const errors = validateDcr(dcrForm)
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors })
    if (errors.length === 0) {
      toast.success('Validation passed — no errors found')
    } else {
      toast.error(`Found ${errors.length} issue(s)`)
    }
  }

  const handleApply = () => {
    const errors = validateDcr(dcrForm)
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors })
    if (errors.some((e) => e.severity === 'error')) {
      toast.error('Fix validation errors before generating JSON')
      return
    }
    const dcr = generateDcr(dcrForm)
    dispatch({
      type: 'SET_GENERATED_JSON',
      payload: JSON.stringify(dcr, null, 2),
    })
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'json' })
    toast.success('DCR JSON generated')
  }

  return (
    <PanePanel className="flex-1">
      <Tabs
        value={activeTab}
        onValueChange={(val) =>
          dispatch({
            type: 'SET_ACTIVE_TAB',
            payload: val as 'form' | 'json',
          })
        }
        className="flex flex-1 flex-col"
      >
        <PaneStickyHeader>
          <h2 className="text-sm font-semibold">DCR Editor</h2>
          <TabsList className="ml-auto">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="json">Generated JSON</TabsTrigger>
          </TabsList>
        </PaneStickyHeader>

        <TabsContent value="form" className="flex-1 overflow-auto mt-0">
          <DcrFormEditor />
        </TabsContent>

        <TabsContent value="json" className="flex flex-1 flex-col mt-0">
          <DcrJsonViewer />
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 border-t p-3">
        <Button variant="outline" size="sm" onClick={handleValidate}>
          Validate
        </Button>
        <Button size="sm" onClick={handleApply}>
          Apply to JSON
        </Button>
      </div>
    </PanePanel>
  )
}
