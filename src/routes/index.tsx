import { createFileRoute } from '@tanstack/react-router'
import { DcrProvider } from '@/store/dcr-context'
import { TopBar } from '@/components/layout/TopBar'
import { BuilderLayout } from '@/components/layout/BuilderLayout'
import { MobileSectionToggle } from '@/components/layout/MobileSectionToggle'
import { SourcePane } from '@/components/source/SourcePane'
import { DcrPane } from '@/components/editor/DcrPane'
import { LandingPageOverlay } from '@/components/LandingPageOverlay'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <DcrProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <TopBar />
        <MobileSectionToggle />
        <BuilderLayout leftPane={<SourcePane />} rightPane={<DcrPane />} />
      </div>
      {/* Landing page overlay that shows on first visit */}
      <LandingPageOverlay />
    </DcrProvider>
  )
}
