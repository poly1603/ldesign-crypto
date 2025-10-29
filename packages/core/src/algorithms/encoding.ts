/**
 * 编码算法实现
 */

export class Encoder {
  encodeBase64(data: string): string {
    return btoa(data)
  }

  decodeBase64(data: string): string {
    return atob(data)
  }

  encodeHex(data: string): string {
    return Array.from(data)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  }

  decodeHex(hex: string): string {
    const bytes = hex.match(/.{1,2}/g) || []
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 16))).join('')
  }
}

export const encoding = new Encoder()
export const base64 = {
  encode: (data: string) => encoding.encodeBase64(data),
  decode: (data: string) => encoding.decodeBase64(data),
}
export const hex = {
  encode: (data: string) => encoding.encodeHex(data),
  decode: (data: string) => encoding.decodeHex(data),
}

