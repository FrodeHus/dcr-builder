import { Copy, Download, WrapText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'
import { parseJsonSafely } from '@/lib/dcr-utils'
import { copyToClipboard, downloadJsonFile } from '@/lib/utils'

export function SourceFooter() {
  const { sourceJson, dcrForm } = useDcrState()
  const dispatch = useDcrDispatch()

  const handleFormat = () => {
    try {
      const parsed = parseJsonSafely(sourceJson)
      dispatch({
        type: 'SET_SOURCE_JSON',
        payload: JSON.stringify(parsed, null, 2),
      })
      toast.success('JSON formatted successfully')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid JSON format'
      toast.error(message)
    }
  }

  const handleCopy = async () => {
    const ok = await copyToClipboard(sourceJson)
    if (ok) {
      toast.success('Copied to clipboard')
    } else {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownload = () => {
    const base = dcrForm.name.trim() || 'source'
    const filename = `${base}-source.json`
    downloadJsonFile(sourceJson, filename)
    toast.success(`Downloaded ${filename}`)
  }

  return (
    <div className="flex gap-2 border-t p-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleFormat}
        disabled={!sourceJson}
      >
        <WrapText className="mr-1 h-4 w-4" />
        Format
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        disabled={!sourceJson}
      >
        <Copy className="mr-1 h-4 w-4" />
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={!sourceJson}
      >
        <Download className="mr-1 h-4 w-4" />
        Download
      </Button>
    </div>
  )
}
