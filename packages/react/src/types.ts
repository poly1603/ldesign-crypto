export interface UseCryptoReturn {
  encryptData: (data: string, key: string, options?: any) => Promise<string | null>
  decryptData: (data: string, key: string, options?: any) => Promise<string | null>
  loading: boolean
  error: string | null
  clearError: () => void
}

export interface UseEncryptionReturn {
  encrypt: (data: string, key: string, options?: any) => Promise<string | null>
  loading: boolean
  error: string | null
}

export interface UseHashReturn {
  md5: (data: string) => Promise<string | null>
  sha256: (data: string) => Promise<string | null>
  sha512: (data: string) => Promise<string | null>
  loading: boolean
  error: string | null
}

export interface CryptoContextValue {
  encrypt: (data: string, key: string) => Promise<string | null>
  decrypt: (data: string, key: string) => Promise<string | null>
  hash: (data: string, algorithm?: string) => Promise<string | null>
}

