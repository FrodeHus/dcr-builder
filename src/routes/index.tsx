import { createFileRoute } from '@tanstack/react-router'
import { DcrProvider } from '@/store/dcr-context'
import { TopBar } from '@/components/layout/TopBar'
import { BuilderLayout } from '@/components/layout/BuilderLayout'
import { MobileSectionToggle } from '@/components/layout/MobileSectionToggle'
import { SourcePane } from '@/components/source/SourcePane'
import { DcrPane } from '@/components/editor/DcrPane'
import { LandingPage } from '@/components/LandingPage'
import { useLandingPageVisibility } from '@/hooks/use-landing-page-visibility'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { showLanding, handleGetStarted } = useLandingPageVisibility()

  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  return (
    <DcrProvider>
      <div className="flex h-screen flex-col bg-background">
        <TopBar />
        <MobileSectionToggle />
        <BuilderLayout leftPane={<SourcePane />} rightPane={<DcrPane />} />
      </div>
    </DcrProvider>
  )
}
