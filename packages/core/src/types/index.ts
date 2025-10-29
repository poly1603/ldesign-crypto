/**
 * @ldesign/crypto-core/types
 * 类型定义模块
 */

// ============= 加密相关类型 =============
export type EncryptionAlgorithm =
  | 'AES-128-CBC'
  | 'AES-192-CBC'
  | 'AES-256-CBC'
  | 'AES-128-CTR'
  | 'AES-192-CTR'
  | 'AES-256-CTR'
  | 'AES-128-GCM'
  | 'AES-192-GCM'
  | 'AES-256-GCM'
  | 'RSA-2048'
  | 'RSA-4096'
  | 'DES'
  | '3DES'
  | 'Blowfish'

export interface EncryptionOptions {
  algorithm?: EncryptionAlgorithm
  mode?: 'CBC' | 'CTR' | 'GCM' | 'ECB'
  keySize?: 128 | 192 | 256 | 1024 | 2048 | 4096
  iv?: string
  padding?: 'PKCS7' | 'ISO97971' | 'AnsiX923' | 'ZeroPadding'
}

export interface EncryptResult {
  success: boolean
  data?: string
  error?: string
  algorithm?: string
  timestamp?: number
}

export interface DecryptResult {
  success: boolean
  data?: string
  error?: string
  timestamp?: number
}

// ============= 哈希相关类型 =============
export type HashAlgorithm =
  | 'MD5'
  | 'SHA1'
  | 'SHA256'
  | 'SHA512'
  | 'SHA3-256'
  | 'SHA3-512'

export interface HashOptions {
  algorithm?: HashAlgorithm
  encoding?: 'hex' | 'base64'
}

export interface HashResult {
  success: boolean
  data?: string
  error?: string
  algorithm?: string
}

export type HMACAlgorithm = 'SHA1' | 'SHA256' | 'SHA512'

export interface HMACOptions {
  algorithm?: HMACAlgorithm
  encoding?: 'hex' | 'base64'
}

// ============= AES 相关类型 =============
export type AESMode = 'CBC' | 'CTR' | 'GCM' | 'ECB'
export type AESKeySize = 128 | 192 | 256

export interface AESOptions {
  mode?: AESMode
  keySize?: AESKeySize
  iv?: string
  padding?: 'PKCS7' | 'ISO97971' | 'AnsiX923' | 'ZeroPadding'
}

// ============= RSA 相关类型 =============
export type RSAKeyFormat = 'PEM' | 'DER' | 'JWK'
export type RSAKeySize = 1024 | 2048 | 4096

export interface RSAOptions {
  keySize?: RSAKeySize
  format?: RSAKeyFormat
  padding?: 'OAEP' | 'PKCS1'
}

export interface RSAKeyPair {
  publicKey: string
  privateKey: string
}

// ============= DES 相关类型 =============
export interface DESOptions {
  mode?: 'CBC' | 'ECB'
  iv?: string
  padding?: 'PKCS7' | 'ZeroPadding'
}

export interface TripleDESOptions extends DESOptions { }

// ============= Blowfish 相关类型 =============
export interface BlowfishOptions {
  mode?: 'CBC' | 'ECB'
  iv?: string
  keySize?: 128 | 192 | 256 | 448
}

// ============= 编码相关类型 =============
export type EncodingType = 'base64' | 'hex' | 'utf8' | 'binary'

// ============= 密钥生成相关类型 =============
export interface KeyGenerationOptions {
  length?: number
  algorithm?: 'random' | 'pbkdf2' | 'hkdf'
  salt?: string
  iterations?: number
}

// ============= 接口类型 =============
export interface IEncryptor {
  encrypt(data: string, key: string, options?: any): Promise<EncryptResult>
  decrypt(data: string, key: string, options?: any): Promise<DecryptResult>
}

export interface IHasher {
  hash(data: string, options?: HashOptions): Promise<HashResult>
}

export interface IHMACer {
  hmac(data: string, key: string, options?: HMACOptions): Promise<HashResult>
}

export interface IEncoder {
  encode(data: string, encoding: EncodingType): string
  decode(data: string, encoding: EncodingType): string
}

export interface IKeyGenerator {
  generate(options?: KeyGenerationOptions): Promise<string>
  derive(password: string, salt: string, options?: KeyGenerationOptions): Promise<string>
}

