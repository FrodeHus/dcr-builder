import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { hasVisitedBefore, setVisitedCookie } from '@/lib/cookies'

/**
 * Hook to manage landing page visibility and cookie consent
 * Shows landing page on first visit and asks for cookie permission
 *
 * Note: useEffect doesn't run on server, so we only show landing page
 * after client-side hydration to avoid hydration mismatch
 */
export function useLandingPageVisibility() {
  const [showLanding, setShowLanding] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if user has visited before (only runs on client)
    const visited = hasVisitedBefore()

    if (!visited) {
      // First time visitor, prepare to show landing page and ask for cookie permission
      setShowLanding(true)

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

    // Mark hydration as complete
    setIsReady(true)
  }, [])

  const handleGetStarted = () => {
    // Set the visited cookie and hide landing page
    setVisitedCookie()
    setShowLanding(false)
  }

  return {
    showLanding: isReady && showLanding,
    handleGetStarted,
  }
}
