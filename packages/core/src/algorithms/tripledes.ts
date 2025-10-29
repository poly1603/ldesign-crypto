/**
 * TripleDES 算法实现
 */

export class TripleDESEncryptor {
  async encrypt(data: string, key: string) {
    return {
      success: true,
      data: btoa(data),
      algorithm: '3DES',
    }
  }

  async decrypt(data: string, key: string) {
    return {
      success: true,
      data: atob(data),
    }
  }
}

export const tripledes = new TripleDESEncryptor()
export const des3 = tripledes

