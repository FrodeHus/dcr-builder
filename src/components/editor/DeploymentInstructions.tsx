import { ExternalLink } from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useDcrState } from '@/store/dcr-context'

export function DeploymentInstructions() {
  const { dcrForm } = useDcrState()

  const dcrName = dcrForm.name || 'my-dcr'
  const rgName = '{resource-group}'
  const location = dcrForm.location || 'eastus'

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold mb-3">Deployment Instructions</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Choose a deployment method to create this Data Collection Rule in
          Azure.
        </p>
      </div>

      <Accordion type="single" collapsible defaultValue="azure-cli">
        {/* Azure CLI */}
        <AccordionItem value="azure-cli">
          <AccordionTrigger>Azure CLI</AccordionTrigger>
          <AccordionContent className="mt-3 space-y-2">
            <Alert>
              <AlertDescription className="text-xs">
                <p className="mb-2">
                  Save the JSON to a file and deploy using the Azure CLI:
                </p>
                <pre className="bg-muted rounded p-2 text-[11px] overflow-x-auto mb-2">
                  {`az monitor data-collection rule create \\
  --location '${location}' \\
  --resource-group '${rgName}' \\
  --name '${dcrName}' \\
  --rule-file 'dcr.json'`}
                </pre>
                <p className="text-[11px]">
                  To update an existing DCR, use the same command with the same
                  name.
                </p>
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>

        {/* PowerShell */}
        <AccordionItem value="powershell">
          <AccordionTrigger>PowerShell</AccordionTrigger>
          <AccordionContent className="mt-3 space-y-2">
            <Alert>
              <AlertDescription className="text-xs">
                <p className="mb-2">
                  Deploy using PowerShell with the New-AzDataCollectionRule
                  cmdlet:
                </p>
                <pre className="bg-muted rounded p-2 text-[11px] overflow-x-auto mb-2">
                  {`$dcr = Get-Content -Path 'dcr.json' -Raw | ConvertFrom-Json

New-AzDataCollectionRule \\
  -ResourceGroupName '${rgName}' \\
  -Location '${location}' \\
  -Name '${dcrName}' \\
  -DataCollectionRuleData $dcr`}
                </pre>
                <p className="text-[11px]">
                  Ensure you have the Az.Monitor module installed:
                  <code className="bg-muted px-1 rounded ml-1">
                    Install-Module Az.Monitor
                  </code>
                </p>
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>

        {/* ARM Template / Bicep */}
        <AccordionItem value="arm-template">
          <AccordionTrigger>ARM Template / Bicep</AccordionTrigger>
          <AccordionContent className="mt-3 space-y-2">
            <Alert>
              <AlertDescription className="text-xs space-y-2">
                <p>
                  Use the JSON as the properties in an ARM template or Bicep
                  file:
                </p>
                <pre className="bg-muted rounded p-2 text-[11px] overflow-x-auto">
                  {`{
  "type": "Microsoft.Insights/dataCollectionRules",
  "apiVersion": "2024-03-11",
  "name": "${dcrName}",
  "location": "${location}",
  "properties": {
    // Paste DCR properties here
  }
}`}
                </pre>
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>

        {/* Share & Retrieve */}
        <AccordionItem value="share-retrieve">
          <AccordionTrigger>Share & Retrieve Configuration</AccordionTrigger>
          <AccordionContent className="mt-3 space-y-2">
            <Alert>
              <AlertDescription className="text-xs space-y-2">
                <div>
                  <p className="font-medium mb-2">
                    Generate a shareable download URL:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px]">
                    <li>
                      Click the{' '}
                      <code className="bg-muted px-1 rounded">
                        Generate URL
                      </code>{' '}
                      button above
                    </li>
                    <li>The URL is automatically copied to your clipboard</li>
                    <li>Share this URL with team members or save for later</li>
                    <li>
                      Anyone with the URL can download the current DCR JSON
                      configuration
                    </li>
                  </ol>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <p className="font-medium mb-1">URL features:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li>Links are available for 30 days before expiring</li>
                    <li>
                      Each time you modify the configuration, the URL stays the
                      same
                    </li>
                    <li>
                      Perfect for collaborative workflows and documentation
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>

        {/* Key Requirements */}
        <AccordionItem value="prerequisites">
          <AccordionTrigger>Important Prerequisites</AccordionTrigger>
          <AccordionContent className="mt-3 space-y-2">
            <Alert>
              <AlertDescription className="text-xs space-y-2">
                <div>
                  <p className="font-medium mb-1">Before deploying:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li>
                      Verify the Log Analytics workspace exists and you have
                      access to it
                    </li>
                    <li>
                      Ensure the workspace is in the same region or a supported
                      region
                    </li>
                    <li>
                      For Logs Ingestion API, create a Data Collection Endpoint
                      (DCE) first
                    </li>
                    <li>
                      You must have sufficient permissions to create resources
                      in the target resource group
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>

        {/* Learn More */}
        <AccordionItem value="learn-more">
          <AccordionTrigger>Learn More</AccordionTrigger>
          <AccordionContent className="mt-3 space-y-2">
            <Alert>
              <AlertDescription className="text-xs space-y-1.5">
                <a
                  href="https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/data-collection-rule-create-edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  Create and edit DCRs in Azure Monitor
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://learn.microsoft.com/en-us/azure/azure-monitor/data-collection/data-collection-rule-structure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  DCR Structure Reference
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://learn.microsoft.com/en-us/azure/azure-monitor/logs/logs-ingestion-api-overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  Logs Ingestion API Documentation
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
