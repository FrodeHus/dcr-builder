import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { hasVisitedBefore, setVisitedCookie } from '@/lib/cookies'

/**
 * Hook to manage landing page visibility and cookie consent
 * Shows landing page on first visit and asks for cookie permission
 */
export function useLandingPageVisibility() {
  const [showLanding, setShowLanding] = useState(true)
  const [hasCheckedCookie, setHasCheckedCookie] = useState(false)

  useEffect(() => {
    // Check if user has visited before
    const visited = hasVisitedBefore()

    if (visited) {
      // User has visited before, skip landing page
      setShowLanding(false)
    } else {
      // First time visitor, show landing page and ask for cookie permission
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

    setHasCheckedCookie(true)
  }, [])

  const handleGetStarted = () => {
    // Set the visited cookie and hide landing page
    setVisitedCookie()
    setShowLanding(false)
  }

  return {
    showLanding: showLanding && hasCheckedCookie,
    handleGetStarted,
  }
}
