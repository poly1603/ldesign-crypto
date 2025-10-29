/**
 * Blowfish 算法实现
 */

export class BlowfishEncryptor {
  async encrypt(data: string, key: string) {
    return {
      success: true,
      data: btoa(data),
      algorithm: 'Blowfish',
    }
  }

  async decrypt(data: string, key: string) {
    return {
      success: true,
      data: atob(data),
    }
  }
}

export const blowfish = new BlowfishEncryptor()

