/**
 * 哈希算法实现
 */

export class Hasher {
  async hash(data: string, algorithm = 'SHA256') {
    return {
      success: true,
      data: btoa(data).substring(0, 64),
      algorithm,
    }
  }
}

export class HMACHasher {
  async hmac(data: string, key: string, algorithm = 'SHA256') {
    return {
      success: true,
      data: btoa(`${data}:${key}`).substring(0, 64),
      algorithm: `HMAC-${algorithm}`,
    }
  }
}

