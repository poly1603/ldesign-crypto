/**
 * 环境检测工具
 * 
 * 自动检测运行环境(浏览器/Node.js),为跨平台功能提供支持
 */

/**
 * 环境类型
 */
export type Environment = 'browser' | 'node' | 'worker' | 'unknown'

/**
 * 环境信息
 */
export interface EnvironmentInfo {
  type: Environment
  isBrowser: boolean
  isNode: boolean
  isWorker: boolean
  hasWebCrypto: boolean
  hasNodeCrypto: boolean
}

/**
 * 检测是否在浏览器环境
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * 检测是否在Node.js环境
 */
export function isNode(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  )
}

/**
 * 检测是否在Web Worker环境
 */
export function isWorker(): boolean {
  return (
    typeof self !== 'undefined' &&
    typeof (self as any).WorkerGlobalScope !== 'undefined' &&
    (self as any) instanceof (self as any).WorkerGlobalScope
  )
}

/**
 * 检测是否支持Web Crypto API
 */
export function hasWebCrypto(): boolean {
  if (isBrowser()) {
    return typeof window.crypto !== 'undefined' && typeof window.crypto.subtle !== 'undefined'
  }
  if (isWorker()) {
    return typeof self.crypto !== 'undefined' && typeof self.crypto.subtle !== 'undefined'
  }
  return false
}

/**
 * 检测是否支持Node.js crypto模块
 */
export function hasNodeCrypto(): boolean {
  if (!isNode()) {
    return false
  }
  try {
    require.resolve('crypto')
    return true
  } catch {
    return false
  }
}

/**
 * 获取当前环境类型
 */
export function getEnvironmentType(): Environment {
  if (isWorker()) return 'worker'
  if (isBrowser()) return 'browser'
  if (isNode()) return 'node'
  return 'unknown'
}

/**
 * 获取完整的环境信息
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  const type = getEnvironmentType()
  return {
    type,
    isBrowser: type === 'browser',
    isNode: type === 'node',
    isWorker: type === 'worker',
    hasWebCrypto: hasWebCrypto(),
    hasNodeCrypto: hasNodeCrypto(),
  }
}

/**
 * 全局环境信息(缓存)
 */
let cachedEnvInfo: EnvironmentInfo | null = null

/**
 * 获取环境信息(带缓存)
 */
export function getEnv(): EnvironmentInfo {
  if (!cachedEnvInfo) {
    cachedEnvInfo = getEnvironmentInfo()
  }
  return cachedEnvInfo
}

/**
 * 清除环境信息缓存(用于测试)
 */
export function clearEnvCache(): void {
  cachedEnvInfo = null
}