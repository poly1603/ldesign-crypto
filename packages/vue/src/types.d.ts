import type { GlobalCrypto } from './plugin'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $crypto: GlobalCrypto
  }
}

export interface UseCryptoOptions {
  algorithm?: string
  onError?: (error: Error) => void
}

export interface UseCryptoReturn {
  encrypt: (data: string, key: string) => Promise<string | null>
  decrypt: (data: string, key: string) => Promise<string | null>
  loading: import('vue').Ref<boolean>
  error: import('vue').Ref<string | null>
  clearError: () => void
}

export interface UseEncryptionOptions {
  enableCache?: boolean
  batchSize?: number
}

export interface UseEncryptionReturn {
  encryptAES: (data: string, key: string) => Promise<string | null>
  loading: import('vue').Ref<boolean>
  error: import('vue').Ref<string | null>
}

export interface UseHashOptions {
  algorithm?: string
}

export interface UseHashReturn {
  sha256: (data: string) => Promise<string | null>
  loading: import('vue').Ref<boolean>
  error: import('vue').Ref<string | null>
}

