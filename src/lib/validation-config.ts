/**
 * Input validation configuration and constants
 * Defines limits and constraints for DCR Builder inputs
 */

/**
 * Maximum allowed JSON input size (10 MB)
 * Prevents memory exhaustion from very large files
 */
export const MAX_JSON_SIZE_MB = 10
export const MAX_JSON_SIZE_BYTES = MAX_JSON_SIZE_MB * 1024 * 1024

/**
 * Maximum nesting depth for object inference
 * Prevents infinite recursion on circular/deeply nested structures
 */
export const MAX_NESTING_DEPTH = 5

/**
 * Maximum number of samples to take from arrays during inference
 * Balances accuracy with performance
 */
export const MAX_INFERENCE_SAMPLES = 10

/**
 * Maximum cache entries before LRU eviction
 */
export const MAX_CACHE_ENTRIES = 10000

/**
 * Maximum single cache entry size (5 MB)
 */
export const MAX_CACHE_ENTRY_SIZE_MB = 5
export const MAX_CACHE_ENTRY_SIZE_BYTES = MAX_CACHE_ENTRY_SIZE_MB * 1024 * 1024

/**
 * Default cache TTL (30 minutes)
 */
export const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 30

/**
 * Maximum DCR name length
 */
export const MAX_DCR_NAME_LENGTH = 128

/**
 * Maximum stream name length
 */
export const MAX_STREAM_NAME_LENGTH = 64

/**
 * Stream name must start with this prefix
 */
export const STREAM_NAME_PREFIX = 'Custom-'

/**
 * Performance thresholds for logging in development
 */
export const PERFORMANCE_THRESHOLDS = {
  jsonParsing: 100, // ms
  columnInference: 500, // ms
  validation: 50, // ms
  generation: 100, // ms
} as const
