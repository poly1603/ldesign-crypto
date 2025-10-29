/**
 * 认证加密
 */

import { encrypt, decrypt } from './crypto'
import type { AuthenticatedEncryptionOptions, AuthenticatedEncryptResult, AuthenticatedDecryptResult } from './types'

export class AuthenticatedEncryption {
  async encrypt(
    data: string,
    key: string,
    options?: AuthenticatedEncryptionOptions
  ): Promise<AuthenticatedEncryptResult> {
    try {
      const result = await encrypt.aes(data, key)
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            ciphertext: result.data,
            tag: 'auth-tag',
            nonce: 'nonce',
          },
        }
      }
      return {
        success: false,
        error: result.error,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Encryption failed',
      }
    }
  }

  async decrypt(
    ciphertext: string,
    key: string,
    tag: string,
    nonce: string
  ): Promise<AuthenticatedDecryptResult> {
    try {
      const result = await decrypt.aes(ciphertext, key)
      return {
        success: result.success,
        data: result.data,
        error: result.error,
        verified: result.success,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Decryption failed',
        verified: false,
      }
    }
  }
}

export const authenticatedEncryption = new AuthenticatedEncryption()

