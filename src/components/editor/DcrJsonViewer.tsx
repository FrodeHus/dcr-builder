import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { JsonEditor } from './JsonEditor'
import { DeploymentInstructions } from './DeploymentInstructions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'
import { copyToClipboard, downloadFile, downloadJsonFile } from '@/lib/utils'
import { generateArmTemplate, generateBicep } from '@/lib/dcr-utils'

type OutputFormat = 'json' | 'arm' | 'bicep'

const formatConfig: Record<
  OutputFormat,
  { filename: string; label: string; toastName: string }
> = {
  json: { filename: 'dcr.json', label: 'JSON', toastName: 'DCR JSON' },
  arm: {
    filename: 'dcr-template.json',
    label: 'ARM',
    toastName: 'ARM template',
  },
  bicep: { filename: 'main.bicep', label: 'Bicep', toastName: 'Bicep' },
}

export function DcrJsonViewer() {
  const { generatedJson, shareId, shareUrl, dcrForm } = useDcrState()
  const dispatch = useDcrDispatch()
  const [format, setFormat] = useState<OutputFormat>('json')

  const displayedContent = useMemo(() => {
    if (!generatedJson) return ''
    switch (format) {
      case 'arm':
        return generateArmTemplate(dcrForm)
      case 'bicep':
        return generateBicep(dcrForm)
      default:
        return generatedJson
    }
  }, [generatedJson, format, dcrForm])

  const handleCopy = async () => {
    const ok = await copyToClipboard(displayedContent)
    if (ok) {
      toast.success(`${formatConfig[format].toastName} copied to clipboard`)
    } else {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    const { filename, toastName } = formatConfig[format]
    if (format === 'bicep') {
      downloadFile(displayedContent, filename, 'text/plain')
    } else {
      downloadJsonFile(displayedContent, filename)
    }
    toast.success(`Downloaded ${filename}`)
  }

  const handleGenerateUrl = async () => {
    if (!generatedJson || shareId) return
    try {
      const response = await fetch('/api/dcr', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ json: generatedJson }),
      })
      if (!response.ok) {
        throw new Error('Failed to store DCR JSON')
      }
      const { id } = (await response.json()) as { id: string }
      const baseUrl =
        typeof window === 'undefined' ? '' : window.location.origin
      const url = `${baseUrl}/api/dcr/${id}`
      dispatch({ type: 'SET_SHARE_DATA', payload: { id, url } })
      const ok = await copyToClipboard(url)
      if (ok) {
        toast.success('Download URL copied to clipboard')
      } else {
        toast.success('Download URL generated')
      }
    } catch {
      toast.error('Failed to generate URL')
    }
  }

  useEffect(() => {
    if (!shareId || !generatedJson) return
    const updateCache = async () => {
      try {
        const response = await fetch(`/api/dcr/${shareId}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ json: generatedJson }),
        })
        if (!response.ok) {
          throw new Error('Failed to update cached JSON')
        }
      } catch {
        toast.warning('Share link may be out of date')
      }
    }
    void updateCache()
  }, [generatedJson, shareId])

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={!generatedJson}
        >
          <Copy className="mr-1 h-4 w-4" />
          Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!generatedJson}
        >
          <Download className="mr-1 h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateUrl}
          disabled={!generatedJson || !!shareId}
        >
          <Link2 className="mr-1 h-4 w-4" />
          Generate URL
        </Button>
        {shareUrl && (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="h-8 text-xs"
              aria-label="Generated download URL"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Copied
            </span>
          </div>
        )}
        <Tabs
          value={format}
          onValueChange={(v) => setFormat(v as OutputFormat)}
          className="ml-auto"
        >
          <TabsList className="h-8">
            <TabsTrigger value="json" className="text-xs px-2 py-1">
              JSON
            </TabsTrigger>
            <TabsTrigger value="arm" className="text-xs px-2 py-1">
              ARM
            </TabsTrigger>
            <TabsTrigger value="bicep" className="text-xs px-2 py-1">
              Bicep
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="min-h-0 flex-1 flex gap-4 overflow-hidden">
        {/* JSON Editor - 2/3 width */}
        <div className="w-2/3 min-h-0 flex flex-col overflow-auto p-4">
          <h3 className="text-sm font-semibold mb-2 shrink-0">
            Generated {formatConfig[format].label}
          </h3>
          <div className="min-h-0 flex-1 overflow-auto">
            <JsonEditor
              value={displayedContent}
              readOnly
              placeholder="Generated DCR output will appear here..."
            />
          </div>
        </div>

        {/* Deployment Instructions - 1/3 width */}
        {generatedJson && (
          <div className="w-1/3 min-h-0 flex flex-col overflow-auto p-4 border-l">
            <DeploymentInstructions />
          </div>
        )}
      </div>
    </div>
  )
}
