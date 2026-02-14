import { AlertCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import type { ValidationError } from '@/types/dcr'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ValidationErrorsSectionProps {
  validationErrors: Array<ValidationError>
}

export function ValidationErrorsSection({
  validationErrors,
}: ValidationErrorsSectionProps) {
  if (validationErrors.length === 0) return null

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-semibold text-destructive">
        <ChevronDown className="h-4 w-4" />
        Validation Issues ({validationErrors.length})
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-2">
        {validationErrors.map((err, i) => (
          <Alert
            key={i}
            variant={err.severity === 'error' ? 'destructive' : 'default'}
          >
            {err.severity === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              <span className="font-medium">{err.field}:</span> {err.message}
            </AlertDescription>
          </Alert>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
