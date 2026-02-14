import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PanePanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PaneStickyHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex items-center gap-3 border-b bg-card/90 px-4 py-3 backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}
