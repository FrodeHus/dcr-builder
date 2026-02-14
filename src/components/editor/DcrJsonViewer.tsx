import { useEffect, useState } from 'react'
import { Copy, Download, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { JsonEditor } from './JsonEditor'
import { DeploymentInstructions } from './DeploymentInstructions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDcrState } from '@/store/dcr-context'

export function DcrJsonViewer() {
  const { generatedJson } = useDcrState()
  const [shareUrl, setShareUrl] = useState('')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedJson)
    toast.success('Copied to clipboard')
  }

  const handleDownload = () => {
    const blob = new Blob([generatedJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dcr.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerateUrl = async () => {
    if (!generatedJson) return
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
      setShareUrl(url)
      await navigator.clipboard.writeText(url)
      toast.success('Download URL copied to clipboard')
    } catch (error) {
      toast.error('Failed to generate URL')
      console.error(error)
    }
  }

  useEffect(() => {
    setShareUrl('')
  }, [generatedJson])

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex gap-2 border-b p-3">
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
          disabled={!generatedJson}
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
      </div>
      <div className="min-h-0 flex-1 flex gap-4 overflow-hidden">
        {/* JSON Editor - 2/3 width */}
        <div className="w-2/3 min-h-0 flex flex-col overflow-auto p-4">
          <h3 className="text-sm font-semibold mb-2 shrink-0">
            Generated JSON
          </h3>
          <div className="min-h-0 flex-1 overflow-auto">
            <JsonEditor
              value={generatedJson}
              readOnly
              placeholder="Generated DCR JSON will appear here..."
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
