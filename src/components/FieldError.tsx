import type { ValidationError } from '@/types/dcr'

export function FieldError({ errors }: { errors: Array<ValidationError> }) {
  if (errors.length === 0) return null
  return <p className="text-xs text-destructive mt-1">{errors[0].message}</p>
}
