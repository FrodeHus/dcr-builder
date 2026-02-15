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

function generateId(): string {
  return crypto.randomUUID()
}

/**
 * Infers columns from JSON by sampling multiple objects for consistency checking
 */
export function inferColumnsFromJson(json: unknown): Array<DcrColumn> {
  if (json === null || json === undefined) return []

  const samples: Array<Record<string, unknown>> = []

  if (Array.isArray(json)) {
    if (json.length === 0) return []
    const sampleIndices = new Set([
      0,
      Math.floor(json.length / 2),
      json.length - 1,
    ])
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

  const allKeys = new Set<string>()
  for (const sample of samples) {
    Object.keys(sample).forEach((key) => allKeys.add(key))
  }

  const columns: Array<DcrColumn> = []
  for (const key of allKeys) {
    const types = new Map<DcrColumnType, number>()

    for (const sample of samples) {
      if (key in sample) {
        const type = inferType(sample[key])
        types.set(type, (types.get(type) ?? 0) + 1)
      }
    }

    let inferredType: DcrColumnType = 'string'
    let maxCount = 0

    for (const [type, count] of types) {
      if (count > maxCount) {
        maxCount = count
        inferredType = type
      }
    }

    columns.push({
      id: generateId(),
      name: key,
      type: inferredType,
    })
  }

  return columns.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Safely parses and validates JSON input
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
  const buildWorkspaceResourceId = (
    subscriptionId: string,
    resourceGroupName: string,
    workspaceName: string,
  ) =>
    `/subscriptions/${subscriptionId}/resourcegroups/${resourceGroupName}/providers/microsoft.operationalinsights/workspaces/${workspaceName}`

  const streamDeclarations: Record<
    string,
    { columns: Array<{ name: string; type: DcrColumnType }> }
  > = {}
  for (const [streamKey, decl] of Object.entries(
    formData.streamDeclarations,
  )) {
    streamDeclarations[streamKey] = {
      columns: decl.columns.map(({ name, type }) => ({ name, type })),
    }
  }

  const logAnalytics = formData.destinations.logAnalytics.map(
    ({ subscriptionId, resourceGroupName, workspaceName, name: destName }) => ({
      workspaceResourceId: buildWorkspaceResourceId(
        subscriptionId,
        resourceGroupName,
        workspaceName,
      ),
      name: destName,
    }),
  )

  const dataFlows = formData.dataFlows.map(
    ({ streams, destinations: flowDests, transformKql, outputStream }) => ({
      streams,
      destinations: flowDests,
      transformKql,
      outputStream,
    }),
  )

  return {
    location: formData.location,
    kind: 'Direct',
    properties: {
      ...(formData.description ? { description: formData.description } : {}),
      ...(formData.dataCollectionEndpointId
        ? {
            dataCollectionEndpointId: formData.dataCollectionEndpointId,
          }
        : {}),
      streamDeclarations,
      destinations: { logAnalytics },
      dataFlows,
    },
  }
}

export function validateDcr(formData: DcrFormData): Array<ValidationError> {
  const errors: Array<ValidationError> = []

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

  if (!formData.location.trim()) {
    errors.push({
      field: 'location',
      message:
        'Azure region/location is required (e.g., "eastus", "westeurope")',
      severity: 'error',
    })
  }

  const streamNames = Object.keys(formData.streamDeclarations)
  if (streamNames.length === 0) {
    errors.push({
      field: 'streamDeclarations',
      message:
        'At least one stream declaration is required. Add a stream to define the data schema.',
      severity: 'error',
    })
  }

  for (const streamKey of streamNames) {
    if (!streamKey.startsWith('Custom-')) {
      errors.push({
        field: 'streamDeclarations',
        message: `Stream name "${streamKey}" must start with "Custom-" prefix (e.g., "Custom-MyStream")`,
        severity: 'error',
      })
    }
    if (streamKey.length > 64) {
      errors.push({
        field: 'streamDeclarations',
        message: `Stream name "${streamKey}" exceeds 64 character limit`,
        severity: 'error',
      })
    }

    const cols = formData.streamDeclarations[streamKey].columns
    if (cols.length === 0) {
      errors.push({
        field: 'streamDeclarations',
        message: `Stream "${streamKey}" must have at least one column. Paste JSON in the Source pane to auto-infer columns.`,
        severity: 'error',
      })
    }

    for (const col of cols) {
      if (!col.name.trim()) {
        errors.push({
          field: 'streamDeclarations',
          message: `Stream "${streamKey}" has a column with empty name`,
          severity: 'error',
        })
      }
    }
  }

  if (formData.destinations.logAnalytics.length === 0) {
    errors.push({
      field: 'destinations',
      message:
        'At least one Log Analytics destination is required. Specify where your data will be sent.',
      severity: 'error',
    })
  }

  for (const dest of formData.destinations.logAnalytics) {
    const subscriptionId = dest.subscriptionId.trim()
    const resourceGroupName = dest.resourceGroupName.trim()
    const workspaceName = dest.workspaceName.trim()

    if (!subscriptionId || !resourceGroupName || !workspaceName) {
      errors.push({
        field: 'destinations',
        message:
          'Subscription ID, resource group name, and workspace name are required for Log Analytics destinations.',
        severity: 'error',
      })
    }

    if (
      subscriptionId &&
      !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        subscriptionId,
      )
    ) {
      errors.push({
        field: 'destinations',
        message: 'Subscription ID must be a valid GUID.',
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
        message:
          'Output stream is required (e.g., "Custom-ProcessedData_CL")',
        severity: 'warning',
      })
    }
  }

  return errors
}

export function generateArmTemplate(formData: DcrFormData): string {
  const dcr = generateDcr(formData)
  const template = {
    $schema:
      'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
    contentVersion: '1.0.0.0',
    resources: [
      {
        type: 'Microsoft.Insights/dataCollectionRules',
        apiVersion: '2023-03-11',
        name: formData.name,
        ...dcr,
      },
    ],
  }
  return JSON.stringify(template, null, 2)
}

function toBicepValue(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent)
  const innerPad = '  '.repeat(indent + 1)

  if (value === null || value === undefined) {
    return 'null'
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((item) => `${innerPad}${toBicepValue(item, indent + 1)}`)
    return `[\n${items.join('\n')}\n${pad}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const lines = entries.map(
      ([k, v]) => `${innerPad}${k}: ${toBicepValue(v, indent + 1)}`,
    )
    return `{\n${lines.join('\n')}\n${pad}}`
  }
  return String(value)
}

export function generateBicep(formData: DcrFormData): string {
  const dcr = generateDcr(formData) as Record<string, unknown>
  const lines: Array<string> = [
    `resource dcrRule 'Microsoft.Insights/dataCollectionRules@2023-03-11' = {`,
    `  name: '${formData.name.replace(/'/g, "''")}'`,
  ]

  for (const [key, value] of Object.entries(dcr)) {
    lines.push(`  ${key}: ${toBicepValue(value, 1)}`)
  }

  lines.push('}')
  return lines.join('\n')
}

export function createDefaultFormData(): DcrFormData {
  return {
    name: '',
    location: '',
    description: '',
    dataCollectionEndpointId: '',
    streamDeclarations: {},
    destinations: { logAnalytics: [] },
    dataFlows: [],
  }
}
