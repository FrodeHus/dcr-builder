/**
 * Tooltip content for DCR form fields
 * Based on official Azure documentation:
 * https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/data-collection-rule-structure
 */

export const dcrTooltips = {
  // Basics section
  name: 'Unique identifier for this Data Collection Rule. Used to reference the DCR when creating or updating it.',
  location:
    'Azure region where the DCR will be created (e.g., eastus, westeurope). Must match your resource group location.',
  description:
    'Optional description to document the purpose and details of this Data Collection Rule for future reference.',

  // Stream Declaration section
  streamName:
    'Name of the input stream that receives data. Must start with "Custom-" for custom streams. Used in Data Flows to reference this stream.',
  columnName: 'The name of the property in your incoming JSON data that maps to this column.',
  columnType:
    'The data type for this column. Maps JSON types: string→string, number→real/int/long, boolean→boolean, object/array→dynamic, ISO dates→datetime.',

  // Destinations section
  workspaceResourceId:
    'The full Azure Resource Manager ID of the Log Analytics workspace where data will be sent. Format: /subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/microsoft.operationalinsights/workspaces/{workspaceName}',
  destinationName:
    'Friendly name to identify this destination. Used in Data Flows to reference where data will be sent.',

  // Data Flows section
  transformKql:
    'Optional Kusto Query Language (KQL) transformation applied to incoming data before ingestion. Use "source" for no transformation. The transformation must output data matching your output stream schema.',
  outputStream:
    'The destination table name. Use "Custom-[TableName]_CL" for custom tables or "Microsoft-[TableName]" for standard tables. The suffix "_CL" indicates a custom table.',
}
