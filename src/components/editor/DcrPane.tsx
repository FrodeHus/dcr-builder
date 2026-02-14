import { toast } from 'sonner'
import { DcrFormEditor } from './DcrFormEditor'
import { DcrJsonViewer } from './DcrJsonViewer'
import { PanePanel, PaneStickyHeader } from '@/components/layout/PanePanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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

  const handleNewSession = () => {
    dispatch({ type: 'RESET_SESSION' })
    toast.success('Started a new DCR session')
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
        className="flex min-h-0 flex-1 flex-col"
      >
        <PaneStickyHeader>
          <h2 className="text-sm font-semibold">DCR Editor</h2>
          <TabsList className="ml-auto">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="json">Generated JSON</TabsTrigger>
          </TabsList>
        </PaneStickyHeader>

        <TabsContent value="form" className="min-h-0 flex-1 overflow-auto mt-0">
          <DcrFormEditor />
        </TabsContent>

        <TabsContent value="json" className="flex min-h-0 flex-1 flex-col mt-0">
          <DcrJsonViewer />
        </TabsContent>
      </Tabs>

      <div className="flex shrink-0 gap-2 border-t p-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              New
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start a new DCR session?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear the current source JSON, form values, generated
                output, validation messages, and any generated download URL.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleNewSession}>
                Start new
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
