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
  streamDeclaration:
    'Defines the schema of incoming data. Each column must have a name and type. The shape of incoming JSON data will be matched to these columns.',
  columnName:
    'The name of the property in your incoming JSON data that maps to this column.',
  columnType:
    'The data type for this column. Maps JSON types: string→string, number→real/int/long, boolean→boolean, object/array→dynamic, ISO dates→datetime.',
  dataType_string: 'Text data. Use for any string values.',
  dataType_int: 'Integer values in the range of -2147483648 to 2147483647.',
  dataType_long:
    'Large integer values in the range of -9223372036854775808 to 9223372036854775807.',
  dataType_real: 'Floating-point numbers (decimal values).',
  dataType_boolean: 'True or false values.',
  dataType_dynamic:
    'Complex objects or arrays. Stored as JSON for flexible querying.',
  dataType_datetime:
    'Date and time values. Supports ISO 8601 format (e.g., 2024-02-14T10:30:00Z).',

  // Destinations section
  subscriptionId:
    'Azure subscription GUID that owns the Log Analytics workspace. Example: 00000000-0000-0000-0000-000000000000.',
  resourceGroupName:
    'Resource group name that contains the Log Analytics workspace.',
  workspaceName: 'Log Analytics workspace name where data will be sent.',
  destinationName:
    'Friendly name to identify this destination. Used in Data Flows to reference where data will be sent.',

  // Data Flows section
  transformKql:
    'Optional Kusto Query Language (KQL) transformation applied to incoming data before ingestion. Use "source" for no transformation. The transformation must output data matching your output stream schema.',
  outputStream:
    'The destination table name. Use "Custom-[TableName]_CL" for custom tables or "Microsoft-[TableName]" for standard tables. The suffix "_CL" indicates a custom table.',

  // Column type reference
  columnTypeReference:
    'Supported types: string, int, long, real, boolean, dynamic (JSON), datetime (ISO 8601)',
}
