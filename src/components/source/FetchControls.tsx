import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'

interface Header {
  key: string
  value: string
}

export function FetchControls() {
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<Array<Header>>([])
  const { isFetching } = useDcrState()
  const dispatch = useDcrDispatch()

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }])

  const removeHeader = (index: number) =>
    setHeaders(headers.filter((_, i) => i !== index))

  const updateHeader = (index: number, field: 'key' | 'value', val: string) =>
    setHeaders(
      headers.map((h, i) => (i === index ? { ...h, [field]: val } : h)),
    )

  const handleFetch = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    dispatch({ type: 'SET_FETCHING', payload: true })

    try {
      const reqHeaders: Record<string, string> = {}
      for (const h of headers) {
        if (h.key.trim()) reqHeaders[h.key.trim()] = h.value
      }

      const res = await fetch(url, { headers: reqHeaders })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

      const data = await res.json()
      const json = JSON.stringify(data, null, 2)

      dispatch({
        type: 'SET_SOURCE_FETCHED',
        payload: { json, fetchedAt: new Date().toISOString() },
      })
      toast.success('JSON fetched successfully')
    } catch (err) {
      const message =
        err instanceof TypeError
          ? 'Network error — check the URL or CORS policy'
          : err instanceof Error
            ? err.message
            : 'Failed to fetch'
      toast.error(message)
    } finally {
      dispatch({ type: 'SET_FETCHING', payload: false })
    }
  }

  const handleClear = () => {
    dispatch({ type: 'CLEAR_SOURCE' })
    setUrl('')
    setHeaders([])
  }

  return (
    <div className="space-y-3 border-b p-4">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://api.example.com/data"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleFetch} disabled={isFetching || !url.trim()}>
          {isFetching ? 'Fetching...' : 'Fetch'}
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="headers">
          <AccordionTrigger className="text-xs text-muted-foreground hover:text-foreground">
            Headers {headers.length > 0 && `(${headers.length})`}
          </AccordionTrigger>
          <AccordionContent className="mt-2 space-y-2">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Key"
                  value={h.key}
                  onChange={(e) => updateHeader(i, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={h.value}
                  onChange={(e) => updateHeader(i, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHeader(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addHeader}>
              <Plus className="mr-1 h-3 w-3" />
              Add Header
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
