/**
 * @ldesign/crypto-utils
 * 
 * Utility functions for crypto operations
 */

export {
  PasswordStrengthChecker,
  type PasswordStrength,
  type PasswordAnalysis,
} from './password-strength'

export {
  PerformanceMonitor,
  type PerformanceMonitorConfig,
  type PerformanceMetric,
  type PerformanceReport,
} from './performance-monitor'

export {
  KeyDerivation,
  deriveKey,
  generateSalt,
  verifyKey,
  type KeyDerivationOptions,
  type KeyDerivationResult,
} from './key-derivation'

export {
  KeyRotation,
  createKeyRotation,
  type KeyInfo,
  type EncryptedDataMetadata,
  type ReencryptionResult,
} from './key-rotation'

export {
  SecureStorage,
  createSecureStorage,
  type SecureStorageOptions,
} from './secure-storage'

export {
  RateLimiter,
  createFixedWindowLimiter,
  createSlidingWindowLimiter,
  createTokenBucketLimiter,
  type RateLimiterOptions,
  type RateLimitStatus,
} from './rate-limiter'

export {
  LRUCache,
  type LRUCacheOptions,
} from './lru-cache'

export {
  ValidationUtils,
  StringUtils,
  RandomUtils,
  ErrorUtils,
  CONSTANTS,
} from './crypto-helpers'

export const version = '2.0.0'


