# 错误处理

@ldesign/crypto 提供了完善的错误处理机制，帮助开发者优雅地处理各种异常情况。

## 错误类型

### 内置错误类型

```typescript
// 基础错误类
class CryptoError extends Error {
  code: string
  details?: any

  constructor(message: string, code: string, details?: any) {
    super(message)
    this.name = 'CryptoError'
    this.code = code
    this.details = details
  }
}

// 算法错误
class AlgorithmError extends CryptoError {
  constructor(message: string, algorithm: string, details?: any) {
    super(message, 'ALGORITHM_ERROR', { algorithm, ...details })
    this.name = 'AlgorithmError'
  }
}

// 密钥错误
class KeyError extends CryptoError {
  constructor(message: string, keyType: string, details?: any) {
    super(message, 'KEY_ERROR', { keyType, ...details })
    this.name = 'KeyError'
  }
}

// 验证错误
class ValidationError extends CryptoError {
  constructor(message: string, field: string, value: any) {
    super(message, 'VALIDATION_ERROR', { field, value })
    this.name = 'ValidationError'
  }
}

// 网络错误
class NetworkError extends CryptoError {
  constructor(message: string, url: string, status?: number) {
    super(message, 'NETWORK_ERROR', { url, status })
    this.name = 'NetworkError'
  }
}

// 权限错误
class PermissionError extends CryptoError {
  constructor(message: string, operation: string, resource: string) {
    super(message, 'PERMISSION_ERROR', { operation, resource })
    this.name = 'PermissionError'
  }
}
```

### 错误代码定义

```typescript
export const ErrorCodes = {
  // 通用错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  NOT_INITIALIZED: 'NOT_INITIALIZED',

  // 算法错误
  ALGORITHM_NOT_FOUND: 'ALGORITHM_NOT_FOUND',
  ALGORITHM_NOT_SUPPORTED: 'ALGORITHM_NOT_SUPPORTED',
  INVALID_ALGORITHM_PARAMETER: 'INVALID_ALGORITHM_PARAMETER',

  // 密钥错误
  INVALID_KEY: 'INVALID_KEY',
  KEY_TOO_SHORT: 'KEY_TOO_SHORT',
  KEY_TOO_LONG: 'KEY_TOO_LONG',
  KEY_NOT_FOUND: 'KEY_NOT_FOUND',
  KEY_EXPIRED: 'KEY_EXPIRED',

  // 加密错误
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  INVALID_CIPHERTEXT: 'INVALID_CIPHERTEXT',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',

  // 签名错误
  SIGNATURE_FAILED: 'SIGNATURE_FAILED',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',

  // 哈希错误
  HASH_FAILED: 'HASH_FAILED',
  INVALID_HASH_ALGORITHM: 'INVALID_HASH_ALGORITHM',

  // 网络错误
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  SERVER_ERROR: 'SERVER_ERROR',

  // 权限错误
  ACCESS_DENIED: 'ACCESS_DENIED',
  INSUFFICIENT_PRIVILEGES: 'INSUFFICIENT_PRIVILEGES',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED'
} as const
```

## 错误处理策略

### 基础错误处理

```typescript
import { CryptoError, ErrorCodes, createCrypto } from '@ldesign/crypto'

const crypto = createCrypto()

try {
  await crypto.init()

  const encrypted = await crypto.aesEncrypt('test data', {
    key: 'invalid-key',
    mode: 'CBC'
  })
}
 catch (error) {
  if (error instanceof CryptoError) {
    console.error('加密错误:', {
      message: error.message,
      code: error.code,
      details: error.details
    })

    // 根据错误代码处理
    switch (error.code) {
      case ErrorCodes.INVALID_KEY:
        console.log('请检查密钥格式和长度')
        break
      case ErrorCodes.ALGORITHM_NOT_SUPPORTED:
        console.log('当前环境不支持该算法')
        break
      case ErrorCodes.ENCRYPTION_FAILED:
        console.log('加密操作失败，请重试')
        break
      default:
        console.log('未知错误，请联系技术支持')
    }
  }
 else {
    console.error('系统错误:', error.message)
  }
}
```

### 高级错误处理

```typescript
class ErrorHandler {
  private retryAttempts = new Map<string, number>()
  private maxRetries = 3
  private retryDelay = 1000

  async handleWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    options: RetryOptions = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries || this.maxRetries
    const delay = options.delay || this.retryDelay
    const backoff = options.backoff || 'exponential'

    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()

        // 成功后重置重试计数
        this.retryAttempts.delete(operationId)

        return result
      }
 catch (error) {
        lastError = error

        // 检查是否应该重试
        if (!this.shouldRetry(error, attempt, maxRetries)) {
          break
        }

        // 记录重试次数
        this.retryAttempts.set(operationId, attempt + 1)

        // 等待后重试
        const waitTime = this.calculateDelay(delay, attempt, backoff)
        await this.sleep(waitTime)

        console.warn(`操作失败，${waitTime}ms后进行第${attempt + 1}次重试:`, error.message)
      }
    }

    // 所有重试都失败
    this.retryAttempts.delete(operationId)
    throw new CryptoError(
      `操作在${maxRetries}次重试后仍然失败: ${lastError.message}`,
      ErrorCodes.UNKNOWN_ERROR,
      { originalError: lastError, attempts: maxRetries + 1 }
    )
  }

  private shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
    // 超过最大重试次数
    if (attempt >= maxRetries) {
      return false
    }

    // 检查错误类型是否可重试
    if (error instanceof CryptoError) {
      const retryableCodes = [
        ErrorCodes.NETWORK_TIMEOUT,
        ErrorCodes.CONNECTION_FAILED,
        ErrorCodes.SERVER_ERROR
      ]

      return retryableCodes.includes(error.code as any)
    }

    // 网络相关错误通常可以重试
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return true
    }

    return false
  }

  private calculateDelay(baseDelay: number, attempt: number, backoff: string): number {
    switch (backoff) {
      case 'linear':
        return baseDelay * (attempt + 1)
      case 'exponential':
        return baseDelay * 2 ** attempt
      case 'fixed':
      default:
        return baseDelay
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 使用示例
const errorHandler = new ErrorHandler()

const result = await errorHandler.handleWithRetry(
  () => crypto.encrypt('data', { key: 'key', algorithm: 'AES' }),
  'encrypt-operation',
  {
    maxRetries: 5,
    delay: 1000,
    backoff: 'exponential'
  }
)
```

### 错误恢复机制

```typescript
class ErrorRecovery {
  private fallbackStrategies = new Map<string, FallbackStrategy>()

  registerFallback(errorCode: string, strategy: FallbackStrategy) {
    this.fallbackStrategies.set(errorCode, strategy)
  }

  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    context: OperationContext
  ): Promise<T> {
    try {
      return await primaryOperation()
    }
 catch (error) {
      if (error instanceof CryptoError) {
        const strategy = this.fallbackStrategies.get(error.code)

        if (strategy) {
          console.warn(`主操作失败，尝试备用策略: ${error.message}`)
          return await strategy.execute(context, error)
        }
      }

      throw error
    }
  }
}

// 备用策略接口
interface FallbackStrategy {
  execute: (context: OperationContext, error: CryptoError) => Promise<any>
}

// 算法降级策略
class AlgorithmFallbackStrategy implements FallbackStrategy {
  private fallbackAlgorithms: Map<string, string[]>

  constructor() {
    this.fallbackAlgorithms = new Map([
      ['AES-256-GCM', ['AES-256-CBC', 'AES-128-CBC']],
      ['RSA-4096', ['RSA-2048', 'RSA-1024']],
      ['SHA-512', ['SHA-256', 'SHA-1']]
    ])
  }

  async execute(context: OperationContext, error: CryptoError): Promise<any> {
    const originalAlgorithm = context.algorithm
    const fallbacks = this.fallbackAlgorithms.get(originalAlgorithm)

    if (!fallbacks) {
      throw error
    }

    for (const fallbackAlgorithm of fallbacks) {
      try {
        console.log(`尝试备用算法: ${fallbackAlgorithm}`)

        const newContext = { ...context, algorithm: fallbackAlgorithm }
        return await context.operation(newContext)
      }
 catch (fallbackError) {
        console.warn(`备用算法 ${fallbackAlgorithm} 也失败了:`, fallbackError.message)
        continue
      }
    }

    throw new CryptoError(
      `所有备用算法都失败了`,
      ErrorCodes.ALGORITHM_NOT_SUPPORTED,
      { originalAlgorithm, attemptedFallbacks: fallbacks }
    )
  }
}

// 提供者切换策略
class ProviderFallbackStrategy implements FallbackStrategy {
  private providerPriority = ['hardware', 'software', 'cloud']

  async execute(context: OperationContext, error: CryptoError): Promise<any> {
    const currentProvider = context.provider
    const currentIndex = this.providerPriority.indexOf(currentProvider)

    // 尝试其他提供者
    for (let i = currentIndex + 1; i < this.providerPriority.length; i++) {
      const fallbackProvider = this.providerPriority[i]

      try {
        console.log(`切换到备用提供者: ${fallbackProvider}`)

        const newContext = { ...context, provider: fallbackProvider }
        return await context.operation(newContext)
      }
 catch (fallbackError) {
        console.warn(`备用提供者 ${fallbackProvider} 失败:`, fallbackError.message)
        continue
      }
    }

    throw new CryptoError(
      `所有提供者都不可用`,
      ErrorCodes.NOT_SUPPORTED,
      { originalProvider: currentProvider, attemptedProviders: this.providerPriority }
    )
  }
}

// 使用示例
const recovery = new ErrorRecovery()

// 注册备用策略
recovery.registerFallback(ErrorCodes.ALGORITHM_NOT_SUPPORTED, new AlgorithmFallbackStrategy())
recovery.registerFallback(ErrorCodes.CONNECTION_FAILED, new ProviderFallbackStrategy())

// 执行操作
const result = await recovery.executeWithFallback(
  () => crypto.encrypt('data', { algorithm: 'AES-256-GCM', provider: 'hardware' }),
  {
    operation: crypto.encrypt.bind(crypto),
    algorithm: 'AES-256-GCM',
    provider: 'hardware',
    data: 'data'
  }
)
```

## 错误监控和报告

### 错误收集器

```typescript
class ErrorCollector {
  private errors: ErrorReport[] = []
  private maxErrors = 1000
  private reportingEndpoint?: string

  constructor(options: ErrorCollectorOptions = {}) {
    this.maxErrors = options.maxErrors || 1000
    this.reportingEndpoint = options.reportingEndpoint

    // 定期上报错误
    if (this.reportingEndpoint) {
      setInterval(() => this.reportErrors(), 60000) // 每分钟上报一次
    }
  }

  collectError(error: Error, context: ErrorContext) {
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error instanceof CryptoError ? error.code : 'UNKNOWN'
      },
      context: {
        operation: context.operation,
        algorithm: context.algorithm,
        provider: context.provider,
        userId: context.userId,
        sessionId: context.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      environment: {
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      }
    }

    this.errors.push(report)

    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // 立即上报严重错误
    if (this.isCriticalError(error)) {
      this.reportError(report)
    }
  }

  private isCriticalError(error: Error): boolean {
    if (error instanceof CryptoError) {
      const criticalCodes = [
        ErrorCodes.AUTHENTICATION_FAILED,
        ErrorCodes.ACCESS_DENIED,
        ErrorCodes.KEY_EXPIRED
      ]

      return criticalCodes.includes(error.code as any)
    }

    return false
  }

  private async reportError(report: ErrorReport) {
    if (!this.reportingEndpoint)
return

    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      })
    }
 catch (reportingError) {
      console.error('错误上报失败:', reportingError)
    }
  }

  private async reportErrors() {
    if (this.errors.length === 0 || !this.reportingEndpoint)
return

    const batch = [...this.errors]
    this.errors.length = 0

    try {
      await fetch(`${this.reportingEndpoint}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ errors: batch })
      })
    }
 catch (reportingError) {
      console.error('批量错误上报失败:', reportingError)
      // 将错误重新加入队列
      this.errors.unshift(...batch)
    }
  }

  getErrorStats(): ErrorStats {
    const stats = {
      total: this.errors.length,
      byCode: new Map<string, number>(),
      byOperation: new Map<string, number>(),
      byAlgorithm: new Map<string, number>(),
      recent: this.errors.slice(-10)
    }

    this.errors.forEach((report) => {
      // 按错误代码统计
      const code = report.error.code
      stats.byCode.set(code, (stats.byCode.get(code) || 0) + 1)

      // 按操作统计
      const operation = report.context.operation
      stats.byOperation.set(operation, (stats.byOperation.get(operation) || 0) + 1)

      // 按算法统计
      const algorithm = report.context.algorithm
      if (algorithm) {
        stats.byAlgorithm.set(algorithm, (stats.byAlgorithm.get(algorithm) || 0) + 1)
      }
    })

    return stats
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// 全局错误处理器
class GlobalErrorHandler {
  private collector: ErrorCollector

  constructor(options: GlobalErrorHandlerOptions = {}) {
    this.collector = new ErrorCollector(options.collector)

    // 监听未捕获的错误
    window.addEventListener('error', this.handleGlobalError.bind(this))
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
  }

  private handleGlobalError(event: ErrorEvent) {
    this.collector.collectError(event.error, {
      operation: 'unknown',
      source: 'global'
    })
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

    this.collector.collectError(error, {
      operation: 'promise',
      source: 'unhandled-rejection'
    })
  }

  getStats(): ErrorStats {
    return this.collector.getErrorStats()
  }
}

// 使用示例
const globalHandler = new GlobalErrorHandler({
  collector: {
    maxErrors: 5000,
    reportingEndpoint: 'https://api.example.com/errors'
  }
})

// 在crypto操作中使用
try {
  const result = await crypto.encrypt('data', options)
}
 catch (error) {
  globalHandler.collector.collectError(error, {
    operation: 'encrypt',
    algorithm: options.algorithm,
    userId: getCurrentUserId(),
    sessionId: getSessionId()
  })

  throw error
}
```

完善的错误处理机制确保了 @ldesign/crypto 在各种异常情况下都能提供清晰的错误信息和合理的恢复策略。
