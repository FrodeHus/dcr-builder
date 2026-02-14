import type { MobileSection } from '@/store/dcr-store'
import { cn } from '@/lib/utils'
import { useDcrDispatch, useDcrState } from '@/store/dcr-context'

const sections: Array<{ value: MobileSection; label: string }> = [
  { value: 'source', label: 'Source JSON' },
  { value: 'editor', label: 'DCR Editor' },
]

export function MobileSectionToggle() {
  const { mobileSection } = useDcrState()
  const dispatch = useDcrDispatch()

  return (
    <div className="sticky top-14 z-10 flex justify-center border-b bg-background/90 p-2 backdrop-blur-sm lg:hidden">
      <div className="flex rounded-lg bg-muted p-1">
        {sections.map((s) => (
          <button
            key={s.value}
            onClick={() =>
              dispatch({ type: 'SET_MOBILE_SECTION', payload: s.value })
            }
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              mobileSection === s.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
