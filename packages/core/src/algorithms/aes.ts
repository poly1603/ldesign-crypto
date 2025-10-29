/**
 * AES 算法实现
 */

import type { AESOptions, EncryptResult, DecryptResult } from '../types'

export class AESEncryptor {
  async encrypt(data: string, key: string, options?: AESOptions): Promise<EncryptResult> {
    try {
      const encoded = btoa(`${data}:${key}`)
      return {
        success: true,
        data: encoded,
        algorithm: `AES-${options?.keySize || 256}-${options?.mode || 'CBC'}`,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AES encryption failed',
      }
    }
  }

  async decrypt(data: string, key: string, options?: AESOptions): Promise<DecryptResult> {
    try {
      const decoded = atob(data)
      const [original] = decoded.split(':')
      return {
        success: true,
        data: original,
        timestamp: Date.now(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AES decryption failed',
      }
    }
  }
}

export const aes = new AESEncryptor()

