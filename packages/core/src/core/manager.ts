/**
 * 加密管理器
 */

import { encrypt, decrypt } from './crypto'
import type { CryptoConfig } from './types'

export class CryptoManager {
  private config: CryptoConfig = {
    defaultAlgorithm: 'AES-256-CBC',
    enableCache: false,
    cacheSize: 1000,
  }

  configure(config: Partial<CryptoConfig>) {
    this.config = { ...this.config, ...config }
  }

  async encrypt(data: string, key: string) {
    return encrypt.aes(data, key)
  }

  async decrypt(data: string, key: string) {
    return decrypt.aes(data, key)
  }

  getConfig() {
    return { ...this.config }
  }
}

export const cryptoManager = new CryptoManager()

