import type {
  DcrColumn,
  DcrColumnType,
  DcrFormData,
  ValidationError,
} from '@/types/dcr'

const ISO_DATE_REGEX =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/

/** Higher number = more specific type. When merging across samples, pick the most specific non-null type. */
const TYPE_SPECIFICITY: Record<DcrColumnType, number> = {
  string: 0,
  dynamic: 1,
  boolean: 2,
  long: 3,
  int: 4,
  real: 5,
  datetime: 6,
}

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

function moreSpecific(a: DcrColumnType, b: DcrColumnType): DcrColumnType {
  return TYPE_SPECIFICITY[a] >= TYPE_SPECIFICITY[b] ? a : b
}

export function inferColumnsFromJson(json: unknown): Array<DcrColumn> {
  if (json === null || json === undefined) return []

  let samples: Array<Record<string, unknown>>
  if (Array.isArray(json)) {
    if (json.length === 0) return []
    samples = json.slice(0, 10) as Array<Record<string, unknown>>
  } else if (typeof json === 'object') {
    samples = [json as Record<string, unknown>]
  } else {
    return []
  }

  if (typeof samples[0] !== 'object') return []

  // Collect all keys and their most specific type across samples
  const typeMap = new Map<string, DcrColumnType>()

  for (const sample of samples) {
    if (typeof sample !== 'object' || sample === null) continue
    for (const [key, value] of Object.entries(sample)) {
      if (value === null || value === undefined) continue
      const inferred = inferType(value)
      const existing = typeMap.get(key)
      typeMap.set(key, existing ? moreSpecific(existing, inferred) : inferred)
    }
  }

  // Keys that appeared but only had null/undefined values won't be in typeMap yet.
  // Also collect all keys seen across samples to preserve them.
  const allKeys = new Set<string>()
  for (const sample of samples) {
    if (typeof sample !== 'object' || sample === null) continue
    for (const key of Object.keys(sample)) {
      allKeys.add(key)
    }
  }

  return Array.from(allKeys).map((key) => ({
    id: crypto.randomUUID(),
    name: key,
    type: typeMap.get(key) ?? 'string',
  }))
}

export function generateDcr(formData: DcrFormData): object {
  // Strip internal `id` fields from list items
  const streamDeclarations: Record<
    string,
    { columns: Array<{ name: string; type: DcrColumnType }> }
  > = {}
  for (const [name, decl] of Object.entries(formData.streamDeclarations)) {
    streamDeclarations[name] = {
      columns: decl.columns.map(({ name, type }) => ({ name, type })),
    }
  }

  const destinations = {
    logAnalytics: formData.destinations.logAnalytics.map(
      ({ workspaceResourceId, name }) => ({ workspaceResourceId, name }),
    ),
  }

  const dataFlows = formData.dataFlows.map(
    ({ streams, destinations, transformKql, outputStream }) => ({
      streams,
      destinations,
      transformKql,
      outputStream,
    }),
  )

  return {
    name: formData.name,
    location: formData.location,
    kind: 'Direct',
    properties: {
      ...(formData.description ? { description: formData.description } : {}),
      streamDeclarations,
      destinations,
      dataFlows,
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
