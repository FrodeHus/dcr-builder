import { useEffect } from 'react'
import { Copy, Download, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { JsonEditor } from './JsonEditor'
import { DeploymentInstructions } from './DeploymentInstructions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'
import { copyToClipboard, downloadJsonFile } from '@/lib/utils'

export function DcrJsonViewer() {
  const { generatedJson, shareId, shareUrl } = useDcrState()
  const dispatch = useDcrDispatch()

  const handleCopy = async () => {
    const ok = await copyToClipboard(generatedJson)
    if (ok) {
      toast.success('DCR JSON copied to clipboard')
    } else {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    downloadJsonFile(generatedJson, 'dcr.json')
    toast.success('Downloaded dcr.json')
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
