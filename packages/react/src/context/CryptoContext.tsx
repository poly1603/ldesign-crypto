import React, { createContext, useContext, ReactNode } from 'react'
import { encrypt, decrypt, hash } from '@ldesign/crypto-core'
import type { CryptoContextValue } from '../types'

const CryptoContext = createContext<CryptoContextValue | null>(null)

export function CryptoProvider({ children }: { children: ReactNode }) {
  const value: CryptoContextValue = {
    encrypt: async (data: string, key: string) => {
      const result = await encrypt.aes(data, key)
      return result.success ? result.data : null
    },
    decrypt: async (data: string, key: string) => {
      const result = await decrypt.aes(data, key)
      return result.success ? result.data : null
    },
    hash: async (data: string, algorithm = 'SHA256') => {
      const result = await hash.sha256(data)
      return result.success ? result.data : null
    },
  }

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>
}

export function useCryptoContext() {
  const context = useContext(CryptoContext)
  if (!context) {
    throw new Error('useCryptoContext must be used within CryptoProvider')
  }
  return context
}

