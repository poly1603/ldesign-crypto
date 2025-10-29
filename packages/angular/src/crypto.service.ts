import { Injectable } from '@angular/core'
import { encrypt, decrypt, hash } from '@ldesign/crypto-core'

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  async encryptAES(data: string, key: string) {
    const result = await encrypt.aes(data, key)
    return result.success ? result.data : null
  }

  async decryptAES(data: string, key: string) {
    const result = await decrypt.aes(data, key)
    return result.success ? result.data : null
  }

  async hashSHA256(data: string) {
    const result = await hash.sha256(data)
    return result.success ? result.data : null
  }
}

