import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { hasVisitedBefore, setVisitedCookie } from '@/lib/cookies'
import { LandingPage } from '@/components/LandingPage'

/**
 * Landing page overlay component
 * Shows the landing page on first visit as a fullscreen modal overlay
 * This approach avoids hydration mismatches by always rendering the same DOM
 */
export function LandingPageOverlay() {
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    // Check if user has visited before (only runs on client)
    const visited = hasVisitedBefore()

    if (!visited) {
      // First time visitor, show overlay and ask for cookie permission
      setShowOverlay(true)

      // Show toast asking for cookie permission
      toast.message('Welcome! 👋', {
        description: `We use a cookie to remember that you've visited, so we won't show this landing page again.`,
        action: {
          label: 'Allow',
          onClick: () => {
            setVisitedCookie()
            toast.success(`Cookie saved! You won't see this page again.`)
          },
        },
        cancel: {
          label: 'Skip',
        },
        duration: 8000,
      })
    }
  }, [])

  const handleGetStarted = () => {
    // Set the visited cookie and hide overlay
    setVisitedCookie()
    setShowOverlay(false)
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-background transition-opacity duration-300 ${
        showOverlay
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      <LandingPage onGetStarted={handleGetStarted} />
    </div>
  )
}
