import type {
  DcrColumn,
  DcrColumnType,
  DcrFormData,
  ValidationError,
} from '@/types/dcr'

const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/

function inferType(value: unknown): DcrColumnType {
  if (value === null || value === undefined) return 'string'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'real'
  }
  if (typeof value === 'string') {
    if (ISO_DATE_REGEX.test(value)) return 'datetime'
    return 'string'
  }
  if (Array.isArray(value) || typeof value === 'object') return 'dynamic'
  return 'string'
}

export function inferColumnsFromJson(json: unknown): Array<DcrColumn> {
  if (json === null || json === undefined) return []

  let sample: Record<string, unknown>
  if (Array.isArray(json)) {
    if (json.length === 0) return []
    sample = json[0] as Record<string, unknown>
  } else if (typeof json === 'object') {
    sample = json as Record<string, unknown>
  } else {
    return []
  }

  if (typeof sample !== 'object') return []

  return Object.entries(sample).map(([key, value]) => ({
    name: key,
    type: inferType(value),
  }))
}

export function generateDcr(formData: DcrFormData): object {
  return {
    location: formData.location,
    kind: 'Direct',
    properties: {
      streamDeclarations: formData.streamDeclarations,
      destinations: formData.destinations,
      dataFlows: formData.dataFlows,
    },
  }
}

export function validateDcr(formData: DcrFormData): Array<ValidationError> {
  const errors: Array<ValidationError> = []

  if (!formData.name.trim()) {
    errors.push({
      field: 'name',
      message: 'Name is required',
      severity: 'error',
    })
  }

  if (!formData.location.trim()) {
    errors.push({
      field: 'location',
      message: 'Location is required',
      severity: 'error',
    })
  }

  const streamNames = Object.keys(formData.streamDeclarations)
  if (streamNames.length === 0) {
    errors.push({
      field: 'streamDeclarations',
      message: 'At least one stream declaration is required',
      severity: 'error',
    })
  }

  for (const name of streamNames) {
    if (!name.startsWith('Custom-')) {
      errors.push({
        field: 'streamDeclarations',
        message: `Stream name "${name}" must start with "Custom-"`,
        severity: 'error',
      })
    }
    const cols = formData.streamDeclarations[name].columns
    if (cols.length === 0) {
      errors.push({
        field: 'streamDeclarations',
        message: `Stream "${name}" must have at least one column`,
        severity: 'error',
      })
    }
  }

  if (formData.destinations.logAnalytics.length === 0) {
    errors.push({
      field: 'destinations',
      message: 'At least one Log Analytics destination is required',
      severity: 'error',
    })
  }

  for (const dest of formData.destinations.logAnalytics) {
    if (!dest.workspaceResourceId.trim()) {
      errors.push({
        field: 'destinations',
        message: 'Workspace resource ID is required',
        severity: 'error',
      })
    }
    if (!dest.name.trim()) {
      errors.push({
        field: 'destinations',
        message: 'Destination name is required',
        severity: 'error',
      })
    }
  }

  if (formData.dataFlows.length === 0) {
    errors.push({
      field: 'dataFlows',
      message: 'At least one data flow is required',
      severity: 'error',
    })
  }

  for (const flow of formData.dataFlows) {
    if (flow.streams.length === 0) {
      errors.push({
        field: 'dataFlows',
        message: 'Data flow must reference at least one stream',
        severity: 'error',
      })
    }
    if (flow.destinations.length === 0) {
      errors.push({
        field: 'dataFlows',
        message: 'Data flow must reference at least one destination',
        severity: 'error',
      })
    }
    if (!flow.outputStream.trim()) {
      errors.push({
        field: 'dataFlows',
        message: 'Output stream is required',
        severity: 'warning',
      })
    }
  }

  return errors
}

export function createDefaultFormData(): DcrFormData {
  return {
    name: '',
    location: '',
    description: '',
    streamDeclarations: {},
    destinations: { logAnalytics: [] },
    dataFlows: [],
  }
}
