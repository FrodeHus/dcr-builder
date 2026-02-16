import { useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'

interface JsonEditorProps {
  value: string
  onChange?: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  className?: string
}

export function JsonEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
  className,
}: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lineCount = Math.max(value.split('\n').length, 1)
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value)
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab' && !readOnly) {
        e.preventDefault()
        const textarea = textareaRef.current
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newValue = value.slice(0, start) + '  ' + value.slice(end)
        onChange?.(newValue)
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        })
      }
    },
    [value, onChange, readOnly],
  )

  return (
    <div
      className={cn(
        'flex h-full overflow-auto rounded-md bg-panel2 font-mono text-sm',
        className,
      )}
    >
      <div
        className="sticky left-0 select-none border-r bg-muted/50 px-3 py-3 text-right text-xs leading-[1.625] text-muted-foreground"
        aria-hidden
      >
        {lines.map((n) => (
          <div key={n}>{n}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        className="min-w-0 flex-1 resize-none bg-transparent p-3 leading-[1.625] text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
