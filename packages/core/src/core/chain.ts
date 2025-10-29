/**
 * 链式 API
 */

import { encrypt, decrypt, hash } from './crypto'

export class CryptoChain {
  private data: string = ''

  input(data: string): this {
    this.data = data
    return this
  }

  async encrypt(key: string) {
    const result = await encrypt.aes(this.data, key)
    if (result.success && result.data) {
      this.data = result.data
    }
    return this
  }

  async decrypt(key: string) {
    const result = await decrypt.aes(this.data, key)
    if (result.success && result.data) {
      this.data = result.data
    }
    return this
  }

  async hash() {
    const result = await hash.sha256(this.data)
    if (result.success && result.data) {
      this.data = result.data
    }
    return this
  }

  output(): string {
    return this.data
  }
}

export function chain(): CryptoChain {
  return new CryptoChain()
}

