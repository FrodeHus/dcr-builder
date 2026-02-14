import { Copy, Download, WrapText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'

export function SourceFooter() {
  const { sourceJson } = useDcrState()
  const dispatch = useDcrDispatch()

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(sourceJson)
      dispatch({
        type: 'SET_SOURCE_JSON',
        payload: JSON.stringify(parsed, null, 2),
      })
      toast.success('JSON formatted')
    } catch {
      toast.error('Invalid JSON — cannot format')
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sourceJson)
    toast.success('Copied to clipboard')
  }

  const handleDownload = () => {
    const blob = new Blob([sourceJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'source.json'
    a.click()
    URL.revokeObjectURL(url)
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
