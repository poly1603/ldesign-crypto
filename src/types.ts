/**
 * @ldesign/crypto - 加密模块类型定义
 * 支持主流加密算法和中国国密算法
 */

// ==================== 基础类型 ====================

/**
 * 支持的编码格式
 */
export type EncodingFormat = 'hex' | 'base64' | 'utf8' | 'binary'

/**
 * 加密算法类型
 */
export type CryptoAlgorithm =
  | 'AES' | 'DES' | '3DES' | 'RC4' // 对称加密
  | 'RSA' | 'ECC' // 非对称加密
  | 'SM2' | 'SM4' // 国密算法
  | 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'SM3' // 哈希算法

/**
 * AES加密模式
 */
export type AESMode = 'ECB' | 'CBC' | 'CFB' | 'OFB' | 'CTR' | 'GCM'

/**
 * 填充模式
 */
export type PaddingMode = 'PKCS7' | 'PKCS5' | 'ZeroPadding' | 'NoPadding'

/**
 * RSA填充模式
 */
export type RSAPadding = 'PKCS1' | 'OAEP' | 'PSS'

// ==================== 配置接口 ====================

/**
 * 基础加密配置
 */
export interface BaseCryptoConfig {
  /** 输入编码格式 */
  inputEncoding?: EncodingFormat
  /** 输出编码格式 */
  outputEncoding?: EncodingFormat
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 对称加密配置
 */
export interface SymmetricConfig extends BaseCryptoConfig {
  /** 密钥 */
  key: string
  /** 初始化向量 */
  iv?: string
  /** 加密模式 */
  mode?: AESMode
  /** 填充模式 */
  padding?: PaddingMode
}

/**
 * 非对称加密配置
 */
export interface AsymmetricConfig extends BaseCryptoConfig {
  /** 公钥 */
  publicKey?: string
  /** 私钥 */
  privateKey?: string
  /** 填充模式 */
  padding?: RSAPadding
  /** 密钥长度 */
  keySize?: number
}

/**
 * 哈希配置
 */
export interface HashConfig extends BaseCryptoConfig {
  /** 盐值 */
  salt?: string
  /** 迭代次数 */
  iterations?: number
}

/**
 * 国密SM2配置
 */
export interface SM2Config extends BaseCryptoConfig {
  /** 公钥 */
  publicKey?: string
  /** 私钥 */
  privateKey?: string
  /** 用户标识 */
  userId?: string
  /** 椭圆曲线参数 */
  curve?: 'sm2p256v1'
}

/**
 * 国密SM4配置
 */
export interface SM4Config extends BaseCryptoConfig {
  /** 密钥 */
  key: string
  /** 初始化向量 */
  iv?: string
  /** 加密模式 */
  mode?: 'ECB' | 'CBC'
}

// ==================== 结果接口 ====================

/**
 * 加密结果
 */
export interface CryptoResult {
  /** 是否成功 */
  success: boolean
  /** 结果数据 */
  data?: string
  /** 错误信息 */
  error?: string
  /** 算法类型 */
  algorithm?: CryptoAlgorithm
  /** 执行时间(ms) */
  duration?: number
}

/**
 * 密钥对
 */
export interface KeyPair {
  /** 公钥 */
  publicKey: string
  /** 私钥 */
  privateKey: string
  /** 密钥格式 */
  format?: 'PEM' | 'DER' | 'HEX'
}

/**
 * 签名结果
 */
export interface SignatureResult {
  /** 签名值 */
  signature: string
  /** 签名算法 */
  algorithm: string
  /** 编码格式 */
  encoding: EncodingFormat
}

/**
 * 验签结果
 */
export interface VerifyResult {
  /** 验证是否通过 */
  valid: boolean
  /** 错误信息 */
  error?: string
}

// ==================== 工具接口 ====================

/**
 * 随机数生成配置
 */
export interface RandomConfig {
  /** 长度 */
  length: number
  /** 字符集 */
  charset?: 'hex' | 'base64' | 'alphanumeric' | 'numeric'
  /** 是否包含特殊字符 */
  includeSymbols?: boolean
}

/**
 * 密钥派生配置
 */
export interface KeyDerivationConfig {
  /** 密码 */
  password: string
  /** 盐值 */
  salt: string
  /** 迭代次数 */
  iterations: number
  /** 密钥长度 */
  keyLength: number
  /** 哈希算法 */
  hashAlgorithm?: 'SHA1' | 'SHA256' | 'SHA512'
}

// ==================== 错误类型 ====================

/**
 * 加密错误类型
 */
export enum CryptoErrorType {
  INVALID_KEY = 'INVALID_KEY',
  INVALID_DATA = 'INVALID_DATA',
  INVALID_ALGORITHM = 'INVALID_ALGORITHM',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  KEY_GENERATION_FAILED = 'KEY_GENERATION_FAILED',
  SIGNATURE_FAILED = 'SIGNATURE_FAILED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
}

/**
 * 加密错误类
 */
export class CryptoError extends Error {
  public readonly type: CryptoErrorType
  public readonly algorithm?: CryptoAlgorithm
  public readonly details?: any

  constructor(
    type: CryptoErrorType,
    message: string,
    algorithm?: CryptoAlgorithm,
    details?: any,
  ) {
    super(message)
    this.name = 'CryptoError'
    this.type = type
    this.algorithm = algorithm
    this.details = details
  }
}

// ==================== 插件接口 ====================

/**
 * 加密插件接口
 */
export interface CryptoPlugin {
  /** 插件名称 */
  name: string
  /** 支持的算法 */
  algorithms: CryptoAlgorithm[]
  /** 初始化插件 */
  init?: () => Promise<void> | void
  /** 销毁插件 */
  destroy?: () => Promise<void> | void
}

/**
 * 性能监控配置
 */
export interface PerformanceConfig {
  /** 是否启用性能监控 */
  enabled: boolean
  /** 是否记录详细信息 */
  detailed?: boolean
  /** 性能阈值(ms) */
  threshold?: number
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean
  /** 缓存大小限制 */
  maxSize?: number
  /** 缓存过期时间(ms) */
  ttl?: number
}

/**
 * 加密管理器配置
 */
export interface CryptoManagerConfig {
  /** 默认编码格式 */
  defaultEncoding?: EncodingFormat
  /** 性能监控配置 */
  performance?: PerformanceConfig
  /** 缓存配置 */
  cache?: CacheConfig
  /** 是否启用调试模式 */
  debug?: boolean
  /** 插件列表 */
  plugins?: CryptoPlugin[]
}
