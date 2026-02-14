import type { ReactNode } from 'react'
import { useDcrState } from '@/store/dcr-context'
import { cn } from '@/lib/utils'

export function BuilderLayout({
  leftPane,
  rightPane,
}: {
  leftPane: ReactNode
  rightPane: ReactNode
}) {
  const { mobileSection } = useDcrState()

  return (
    <div className="flex min-h-0 flex-1 gap-4 overflow-hidden p-4">
      <div
        className={cn(
          'flex min-h-0 flex-col lg:w-[38%] lg:shrink-0',
          mobileSection === 'source' ? 'flex' : 'hidden lg:flex',
        )}
      >
        {leftPane}
      </div>
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col',
          mobileSection === 'editor' ? 'flex' : 'hidden lg:flex',
        )}
      >
        {rightPane}
      </div>
    </div>
  )
}
