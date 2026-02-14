import { Badge } from '@/components/ui/badge'
import { useDcrState } from '@/store/dcr-context'

export function OriginBadge() {
  const { sourceOrigin, sourceFetchedAt } = useDcrState()

  if (sourceOrigin === 'fetched' && sourceFetchedAt) {
    const time = new Date(sourceFetchedAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    return (
      <Badge className="bg-info text-info-foreground hover:bg-info/90">
        Fetched {time}
      </Badge>
    )
  }

  return <Badge variant="secondary">Local</Badge>
}
