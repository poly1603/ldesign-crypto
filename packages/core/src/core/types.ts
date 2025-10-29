/**
 * 核心模块类型定义
 */

export interface CryptoConfig {
  defaultAlgorithm?: string
  enableCache?: boolean
  cacheSize?: number
  cacheTTL?: number
}

export interface PerformanceOptimizerConfig {
  enableCache?: boolean
  cacheSize?: number
  enableBatching?: boolean
  batchSize?: number
  enableProfiling?: boolean
}

export interface PerformanceMetrics {
  totalOperations: number
  cacheHits: number
  cacheMisses: number
  averageTime: number
  peakMemory: number
}

export interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
}

export interface BatchOperation {
  operation: 'encrypt' | 'decrypt' | 'hash'
  data: string
  key?: string
  options?: any
}

export interface BatchResult {
  success: boolean
  data?: any
  error?: string
}

export interface AuthenticatedEncryptionOptions {
  algorithm?: 'AES-256-GCM' | 'ChaCha20-Poly1305'
  additionalData?: string
}

export interface AuthenticatedEncryptResult {
  success: boolean
  data?: {
    ciphertext: string
    tag: string
    nonce: string
  }
  error?: string
}

export interface AuthenticatedDecryptResult {
  success: boolean
  data?: string
  error?: string
  verified?: boolean
}

