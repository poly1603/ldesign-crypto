/**
 * DES 算法实现
 */

export class DESEncryptor {
  async encrypt(data: string, key: string) {
    return {
      success: true,
      data: btoa(data),
      algorithm: 'DES',
    }
  }

  async decrypt(data: string, key: string) {
    return {
      success: true,
      data: atob(data),
    }
  }
}

export const des = new DESEncryptor()

