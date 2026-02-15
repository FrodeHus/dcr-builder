export type DcrColumnType =
  | 'string'
  | 'int'
  | 'long'
  | 'real'
  | 'boolean'
  | 'dynamic'
  | 'datetime'

export interface DcrColumn {
  id: string
  name: string
  type: DcrColumnType
}

export interface DcrStreamDeclaration {
  columns: Array<DcrColumn>
}

export interface DcrLogAnalyticsDestination {
  id: string
  subscriptionId: string
  resourceGroupName: string
  workspaceName: string
  name: string
}

export interface DcrDestinations {
  logAnalytics: Array<DcrLogAnalyticsDestination>
}

export interface DcrDataFlow {
  id: string
  streams: Array<string>
  destinations: Array<string>
  transformKql: string
  outputStream: string
}

export interface DcrFormData {
  name: string
  location: string
  description: string
  streamDeclarations: Record<string, DcrStreamDeclaration>
  destinations: DcrDestinations
  dataFlows: Array<DcrDataFlow>
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}
