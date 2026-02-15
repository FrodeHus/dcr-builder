import { isValid, parseISO } from 'date-fns'
import type {
  DcrColumn,
  DcrColumnType,
  DcrFormData,
  ValidationError,
} from '@/types/dcr'

/**
 * Maximum allowed size for input JSON (10MB)
 */
const MAX_JSON_SIZE_BYTES = 10 * 1024 * 1024

/**
 * Maximum depth for nested objects before treating as dynamic
 */
const MAX_NESTING_DEPTH = 5

/**
 * Detects if a string is a valid ISO 8601 date
 */
function isIso8601Date(value: string): boolean {
  if (typeof value !== 'string') return false
  try {
    const date = parseISO(value)
    return isValid(date)
  } catch {
    return false
  }
}

/**
 * Infers the DCR column type from a JavaScript value
 * @param value - The value to infer type from
 * @param depth - Current nesting depth (to prevent deep recursion)
 */
function inferType(value: unknown, depth = 0): DcrColumnType {
  if (value === null || value === undefined) return 'string'
  if (typeof value === 'boolean') return 'boolean'

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'int' : 'real'
  }

  if (typeof value === 'string') {
    return isIso8601Date(value) ? 'datetime' : 'string'
  }

  // Deep nesting detected - treat as dynamic
  if (depth > MAX_NESTING_DEPTH) return 'dynamic'

  if (Array.isArray(value) || typeof value === 'object') return 'dynamic'

  return 'string'
}

/**
 * Validates JSON string size and structure
 * @throws Error if JSON exceeds size limits
 */
function validateJsonSize(jsonString: string): void {
  const sizeBytes = new Blob([jsonString]).size
  if (sizeBytes > MAX_JSON_SIZE_BYTES) {
    throw new Error(
      `JSON exceeds maximum size of ${MAX_JSON_SIZE_BYTES / 1024 / 1024}MB. Current size: ${(sizeBytes / 1024 / 1024).toFixed(2)}MB`,
    )
  }
}

/**
 * Infers columns from JSON by sampling multiple objects for consistency checking
 * @param json - Parsed JSON object or array
 * @returns Array of inferred columns with types
 */
export function inferColumnsFromJson(json: unknown): Array<DcrColumn> {
  if (json === null || json === undefined) return []

  // Sample up to 10 objects to check type consistency
  const samples: Array<Record<string, unknown>> = []

  if (Array.isArray(json)) {
    if (json.length === 0) return []
    // Sample first, middle, and last items plus random items
    const sampleIndices = new Set([
      0,
      Math.floor(json.length / 2),
      json.length - 1,
    ])
    // Add up to 7 random samples
    while (sampleIndices.size < Math.min(10, json.length)) {
      sampleIndices.add(Math.floor(Math.random() * json.length))
    }
    for (const idx of sampleIndices) {
      const item = json[idx]
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        samples.push(item as Record<string, unknown>)
      }
    }
  } else if (typeof json === 'object' && !Array.isArray(json)) {
    samples.push(json as Record<string, unknown>)
  } else {
    return []
  }

  if (samples.length === 0) return []

  // Collect all keys from all samples
  const allKeys = new Set<string>()
  for (const sample of samples) {
    if (typeof sample === 'object' && sample !== null) {
      Object.keys(sample).forEach((key) => allKeys.add(key))
    }
  }

  // Infer types by checking consistency across samples
  const columns: Array<DcrColumn> = []
  for (const key of allKeys) {
    const types = new Map<DcrColumnType, number>()
    let foundInSamples = 0

    for (const sample of samples) {
      if (key in sample) {
        foundInSamples++
        const value = sample[key]
        const type = inferType(value)
        types.set(type, (types.get(type) ?? 0) + 1)
      }
    }

    // Use most common type (handles mixed types gracefully)
    let inferredType: DcrColumnType = 'string'
    let maxCount = 0

    for (const [type, count] of types) {
      if (count > maxCount) {
        maxCount = count
        inferredType = type
      }
    }

    columns.push({
      name: key,
      type: inferredType,
    })
  }

  return columns.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Safely parses and validates JSON input
 * @param jsonString - Raw JSON string
 * @returns Parsed JSON object
 * @throws Error if JSON is invalid or exceeds size limits
 */
export function parseJsonSafely(jsonString: string): unknown {
  validateJsonSize(jsonString)
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error(
      `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
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

  // Validate name
  if (!formData.name.trim()) {
    errors.push({
      field: 'name',
      message: 'Rule name is required',
      severity: 'error',
    })
  } else if (formData.name.trim().length < 3) {
    errors.push({
      field: 'name',
      message: 'Rule name must be at least 3 characters long',
      severity: 'warning',
    })
  }

  // Validate location
  if (!formData.location.trim()) {
    errors.push({
      field: 'location',
      message:
        'Azure region/location is required (e.g., "eastus", "westeurope")',
      severity: 'error',
    })
  }

  // Validate stream declarations
  const streamNames = Object.keys(formData.streamDeclarations)
  if (streamNames.length === 0) {
    errors.push({
      field: 'streamDeclarations',
      message:
        'At least one stream declaration is required. Add a stream to define the data schema.',
      severity: 'error',
    })
  }

  for (const name of streamNames) {
    // Stream name validation
    if (!name.startsWith('Custom-')) {
      errors.push({
        field: 'streamDeclarations',
        message: `Stream name "${name}" must start with "Custom-" prefix (e.g., "Custom-MyStream")`,
        severity: 'error',
      })
    }
    if (name.length > 64) {
      errors.push({
        field: 'streamDeclarations',
        message: `Stream name "${name}" exceeds 64 character limit`,
        severity: 'error',
      })
    }

    const cols = formData.streamDeclarations[name].columns
    if (cols.length === 0) {
      errors.push({
        field: 'streamDeclarations',
        message: `Stream "${name}" must have at least one column. Paste JSON in the Source pane to auto-infer columns.`,
        severity: 'error',
      })
    }

    // Column validation
    for (const col of cols) {
      if (!col.name.trim()) {
        errors.push({
          field: 'streamDeclarations',
          message: `Stream "${name}" has a column with empty name`,
          severity: 'error',
        })
      }
    }
  }

  // Validate destinations
  if (formData.destinations.logAnalytics.length === 0) {
    errors.push({
      field: 'destinations',
      message:
        'At least one Log Analytics destination is required. Specify where your data will be sent.',
      severity: 'error',
    })
  }

  for (const dest of formData.destinations.logAnalytics) {
    if (!dest.workspaceResourceId.trim()) {
      errors.push({
        field: 'destinations',
        message:
          'Workspace Resource ID is required. Format: /subscriptions/{id}/resourcegroups/{name}/providers/microsoft.operationalinsights/workspaces/{workspace}',
        severity: 'error',
      })
    } else if (
      !dest.workspaceResourceId.includes(
        'microsoft.operationalinsights/workspaces',
      )
    ) {
      errors.push({
        field: 'destinations',
        message:
          'Invalid Workspace Resource ID format. Must include "microsoft.operationalinsights/workspaces"',
        severity: 'warning',
      })
    }

    if (!dest.name.trim()) {
      errors.push({
        field: 'destinations',
        message:
          'Destination name is required (e.g., "MyWorkspace"). Used to identify this destination in data flows.',
        severity: 'error',
      })
    }
  }

  // Validate data flows
  if (formData.dataFlows.length === 0) {
    errors.push({
      field: 'dataFlows',
      message:
        'At least one data flow is required. Data flows connect streams to destinations.',
      severity: 'error',
    })
  }

  for (const flow of formData.dataFlows) {
    if (flow.streams.length === 0) {
      errors.push({
        field: 'dataFlows',
        message:
          'Data flow must reference at least one stream. Select which streams to process.',
        severity: 'error',
      })
    }

    if (flow.destinations.length === 0) {
      errors.push({
        field: 'dataFlows',
        message:
          'Data flow must reference at least one destination. Select where to send the data.',
        severity: 'error',
      })
    }

    if (!flow.transformKql.trim()) {
      errors.push({
        field: 'dataFlows',
        message:
          'Transform KQL is required. Use "source" for no transformation, or a KQL query to transform the data.',
        severity: 'error',
      })
    }

    if (!flow.outputStream.trim()) {
      errors.push({
        field: 'dataFlows',
        message: 'Output stream is required (e.g., "Custom-ProcessedData_CL")',
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
