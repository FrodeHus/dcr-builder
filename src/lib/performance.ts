/**
 * Performance monitoring utilities for DCR Builder
 * Tracks metrics like JSON parsing time, inference time, validation time
 * Reports to console in development, can be extended for analytics
 */

type PerformanceMetric = {
  name: string
  duration: number
  startTime: number
  metadata?: Record<string, unknown>
}

const metrics: Map<string, Array<PerformanceMetric>> = new Map()

/**
 * Start measuring performance for a named operation
 * @param name - Operation name (e.g., "parse-json", "infer-columns")
 * @returns Function to call when operation completes
 *
 * @example
 * const end = startMeasure('infer-columns')
 * // ... do work ...
 * end({ columnCount: 10 })
 */
export function startMeasure(name: string) {
  const startTime = performance.now()

  return (metadata?: Record<string, unknown>) => {
    const duration = performance.now() - startTime
    const metric: PerformanceMetric = {
      name,
      duration,
      startTime,
      metadata,
    }

    if (!metrics.has(name)) {
      metrics.set(name, [])
    }
    metrics.get(name)!.push(metric)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      const threshold = 100 // Log operations taking longer than 100ms
      if (duration > threshold) {
        console.debug(
          `[Performance] ${name}: ${duration.toFixed(2)}ms`,
          metadata || '',
        )
      }
    }
  }
}

/**
 * Get performance metrics for a named operation
 * @param name - Operation name
 * @returns Array of metric records with statistics
 */
export function getMetrics(name: string) {
  const opMetrics = metrics.get(name) || []
  if (opMetrics.length === 0) {
    return {
      name,
      count: 0,
      averageDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      totalDuration: 0,
    }
  }

  const durations = opMetrics.map((m) => m.duration)
  const totalDuration = durations.reduce((a, b) => a + b, 0)

  return {
    name,
    count: opMetrics.length,
    averageDuration: totalDuration / opMetrics.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    totalDuration,
  }
}

/**
 * Get all recorded metrics
 */
export function getAllMetrics() {
  const all: Record<string, ReturnType<typeof getMetrics>> = {}
  for (const name of metrics.keys()) {
    all[name] = getMetrics(name)
  }
  return all
}

/**
 * Clear all metrics
 */
export function clearMetrics() {
  metrics.clear()
}

/**
 * Report performance metrics to console
 * Useful for debugging performance issues
 */
export function reportMetrics() {
  console.group('[Performance Report]')
  for (const [name] of metrics) {
    const stats = getMetrics(name)
    console.table(stats)
  }
  console.groupEnd()
}
