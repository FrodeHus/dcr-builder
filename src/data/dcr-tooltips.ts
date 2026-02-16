/**
 * Tooltip content for DCR form fields
 * Based on official Azure documentation:
 * https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/data-collection-rule-structure
 */

export const dcrTooltips = {
  // Basics section
  name: 'Unique identifier for this Data Collection Rule within your resource group.',
  location:
    'Azure region where the DCR will be deployed (e.g., "eastus", "westeurope"). Should match the region of your monitored resources.',
  description: 'Optional user-defined description of the Data Collection Rule.',
  dataCollectionEndpointId:
    'Resource ID of the Data Collection Endpoint (DCE). For DCRs with kind "Direct", an endpoint is created automatically if not specified. Required when using Private Link.',

  // Stream Declaration section
  streamName:
    'Identifies the input stream. Must begin with "Custom-". The stream defines the schema of incoming JSON data sent via the Logs Ingestion API.',
  columnName:
    'Top-level property name in your incoming JSON. The shape of the data you send does not need to match the destination table — the transform output must match instead.',
  columnType:
    'DCR data type for this column. Valid types: string, int, long, real, boolean, dynamic (objects/arrays), datetime (ISO 8601 strings).',

  // Destinations section
  subscriptionId:
    'Azure subscription GUID that owns the Log Analytics workspace.',
  resourceGroupName: 'Resource group containing the Log Analytics workspace.',
  workspaceName:
    'Name of the Log Analytics workspace. This only identifies the workspace — the destination table is specified in the Data Flow output stream.',
  destinationName:
    'A friendly name used to reference this destination in Data Flows. One stream can only send to one Log Analytics workspace per DCR.',

  // Data Flows section
  transformKql:
    'KQL transformation applied to the incoming stream before ingestion. Use "source" for passthrough (no transformation). The output schema must match the destination table. Only one stream per data flow when using a transform.',
  outputStream:
    'Destination table. Use "Custom-[TableName]_CL" for custom tables or "Microsoft-[TableName]" for built-in tables (e.g., Microsoft-Syslog). Not needed for known data sources like events or performance counters.',
}
