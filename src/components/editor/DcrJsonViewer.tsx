import { Copy, Download } from 'lucide-react'
import { toast } from 'sonner'
import { JsonEditor } from './JsonEditor'
import { Button } from '@/components/ui/button'
import { useDcrState } from '@/store/dcr-context'

export function DcrJsonViewer() {
  const { generatedJson } = useDcrState()

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
      </div>
      <div className="flex-1 overflow-auto p-4">
        <JsonEditor
          value={generatedJson}
          readOnly
          placeholder="Generated DCR JSON will appear here..."
        />
      </div>
    </div>
  )
}
