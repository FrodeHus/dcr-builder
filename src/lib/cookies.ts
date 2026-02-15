/**
 * Cookie management utilities for tracking user preferences and state
 */

const VISITED_COOKIE_NAME = 'dcr_visited'
const VISITED_COOKIE_DURATION_DAYS = 365

/**
 * Check if user has previously visited the application
 */
export function hasVisitedBefore(): boolean {
  if (typeof document === 'undefined') return false
  const cookies = document.cookie.split(';')
  return cookies.some((cookie) =>
    cookie.trim().startsWith(`${VISITED_COOKIE_NAME}=`),
  )
}

/**
 * Set the visited cookie to mark user as having seen the app
 */
export function setVisitedCookie(): void {
  if (typeof document === 'undefined') return

  const expirationDate = new Date()
  expirationDate.setDate(
    expirationDate.getDate() + VISITED_COOKIE_DURATION_DAYS,
  )

  document.cookie = `${VISITED_COOKIE_NAME}=true; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`
}

/**
 * Clear the visited cookie (for testing/reset purposes)
 */
export function clearVisitedCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${VISITED_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
}
