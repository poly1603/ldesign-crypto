import type { AESOptions, BlowfishOptions, DecryptResult, DESOptions, EncodingType, EncryptionAlgorithm, EncryptionOptions, EncryptResult, HashAlgorithm, HashOptions, HashResult, RSAKeyPair, RSAOptions, TripleDESOptions } from '../types';
/**
 * 加密类（Encrypt）
 *
 * 提供对称/非对称加密的一致 API 封装：AES、RSA、DES/3DES、Blowfish 以及通用入口 encrypt。
 * - 自动处理 IV：若未显式提供，AES/3DES 会按库常量自动生成 IV 并包含在结果中（或依赖 CryptoJS 格式）
 * - 密钥派生：当传入非十六进制密钥字符串时，AES 会使用 PBKDF2-SHA256 派生密钥
 * - 结果结构：返回 EncryptResult，包含 success、data、algorithm、mode、iv、keySize 等元数据
 *
 * 使用建议：
 * - 优先使用 AES-256/CBC 或 AES-256/GCM（如需 AEAD）
 * - RSA 适用于小数据/密钥封装（不要直接加密大数据）
 *
 * 示例：
 * ```ts
 * import { Encrypt } from '@ldesign/crypto'
 * const enc = new Encrypt()
 * const res = enc.aes('hello', 'secret', { keySize: 256, mode: 'CBC' })
 * ```
 */
export declare class Encrypt {
    /**
     * AES 加密
     */
    aes(data: string, key: string, options?: AESOptions): EncryptResult;
    /**
     * AES-128 加密
     */
    aes128(data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult;
    /**
     * AES-192 加密
     */
    aes192(data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult;
    /**
     * AES-256 加密
     */
    aes256(data: string, key: string, options?: Omit<AESOptions, 'keySize'>): EncryptResult;
    /**
     * RSA 加密
     */
    rsa(data: string, publicKey: string, options?: RSAOptions): EncryptResult;
    /**
     * DES 加密
     */
    des(data: string, key: string, options?: DESOptions): EncryptResult;
    /**
     * 3DES 加密
     */
    des3(data: string, key: string, options?: TripleDESOptions): EncryptResult;
    /**
     * Triple DES 加密 (别名)
     */
    tripledes(data: string, key: string, options?: TripleDESOptions): EncryptResult;
    /**
     * Blowfish 加密
     */
    blowfish(data: string, key: string, options?: BlowfishOptions): EncryptResult;
    /**
     * 通用加密方法
     * 根据算法类型自动选择合适的加密方法
     */
    encrypt(data: string, key: string, algorithm: EncryptionAlgorithm, options?: EncryptionOptions): EncryptResult;
    /**
     * Base64 编码
     */
    base64(data: string): string;
    /**
     * URL 安全的 Base64 编码
     */
    base64Url(data: string): string;
    /**
     * Hex 编码
     */
    hex(data: string): string;
    /**
     * 通用编码
     */
    encode(data: string, encodingType: EncodingType): string;
}
/**
 * 解密类（Decrypt）
 *
 * 与 Encrypt 配套的解密封装，支持：AES、RSA、DES/3DES、Blowfish 以及通用入口 decrypt。
 * - 自动探测：当传入 EncryptResult 时，会优先读取其中的 algorithm/mode/iv 参数进行解密
 * - 统一返回：返回 DecryptResult，包含 success、data、algorithm、mode 等元数据
 *
 * 示例：
 * ```ts
 * import { Encrypt, Decrypt } from '@ldesign/crypto'
 * const enc = new Encrypt(); const dec = new Decrypt()
 * const res = enc.aes('hello', 'secret')
 * const plain = dec.decrypt(res, 'secret')
 * ```
 */
export declare class Decrypt {
    private encoder;
    /**
     * AES 解密
     */
    aes(encryptedData: string | EncryptResult, key: string, options?: AESOptions): DecryptResult;
    /**
     * AES-128 解密
     */
    aes128(encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult;
    /**
     * AES-192 解密
     */
    aes192(encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult;
    /**
     * AES-256 解密
     */
    aes256(encryptedData: string | EncryptResult, key: string, options?: Omit<AESOptions, 'keySize'>): DecryptResult;
    /**
     * RSA 解密
     */
    rsa(encryptedData: string | EncryptResult, privateKey: string, options?: RSAOptions): DecryptResult;
    /**
     * DES 解密
     */
    des(encryptedData: string | EncryptResult, key: string, options?: DESOptions): DecryptResult;
    /**
     * 3DES 解密
     */
    des3(encryptedData: string | EncryptResult, key: string, options?: TripleDESOptions): DecryptResult;
    /**
     * Triple DES 解密 (别名)
     */
    tripledes(encryptedData: string | EncryptResult, key: string, options?: TripleDESOptions): DecryptResult;
    /**
     * Blowfish 解密
     */
    blowfish(encryptedData: string | EncryptResult, key: string, options?: BlowfishOptions): DecryptResult;
    /**
     * 通用解密方法
     * 根据算法类型自动选择合适的解密方法
     */
    decrypt(encryptedData: string | EncryptResult, key: string, algorithm?: EncryptionAlgorithm, options?: EncryptionOptions): DecryptResult;
    /**
     * Base64 解码
     */
    base64(encodedData: string): string;
    /**
     * URL 安全的 Base64 解码
     */
    base64Url(encodedData: string): string;
    /**
     * Hex 解码
     */
    hex(encodedData: string): string;
    /**
     * 通用解码
     */
    decode(encodedData: string, encoding: EncodingType): string;
}
/**
 * 哈希类（Hash）
 *
 * 提供常见消息摘要：MD5、SHA-1/224/256/384/512，统一编码输出（默认 hex）。
 * - 支持 verify：用于对比明文与期望哈希值
 * - 支持自定义编码：hex/base64/utf8（默认 hex）
 */
export declare class Hash {
    private hasher;
    /**
     * MD5 哈希
     */
    md5(data: string, options?: HashOptions): HashResult;
    /**
     * SHA1 哈希
     */
    sha1(data: string, options?: HashOptions): HashResult;
    /**
     * SHA224 哈希
     */
    sha224(data: string, options?: HashOptions): HashResult;
    /**
     * SHA256 哈希
     */
    sha256(data: string, options?: HashOptions): HashResult;
    /**
     * SHA384 哈希
     */
    sha384(data: string, options?: HashOptions): HashResult;
    /**
     * SHA512 哈希
     */
    sha512(data: string, options?: HashOptions): HashResult;
    /**
     * 通用哈希方法
     */
    hash(data: string, algorithm?: HashAlgorithm, options?: HashOptions): HashResult;
    /**
     * 验证哈希
     */
    verify(data: string, expectedHash: string, algorithm?: HashAlgorithm, options?: HashOptions): boolean;
}
/**
 * HMAC 类（HMAC）
 *
 * 提供 HMAC-MD5/SHA1/SHA256/SHA384/SHA512 便捷封装，默认输出 hex。
 * - verify：常量时间比较由底层实现负责，API 提供简便验证接口
 * - 建议：密钥长度不小于哈希输出位数，避免键重用
 */
export declare class HMAC {
    private hmacHasher;
    /**
     * HMAC-MD5
     */
    md5(data: string, key: string, options?: HashOptions): string;
    /**
     * HMAC-SHA1
     */
    sha1(data: string, key: string, options?: HashOptions): string;
    /**
     * HMAC-SHA256
     */
    sha256(data: string, key: string, options?: HashOptions): string;
    /**
     * HMAC-SHA384
     */
    sha384(data: string, key: string, options?: HashOptions): string;
    /**
     * HMAC-SHA512
     */
    sha512(data: string, key: string, options?: HashOptions): string;
    /**
     * 通用 HMAC
     */
    hmac(data: string, key: string, algorithm?: HashAlgorithm, options?: HashOptions): string;
    /**
     * 验证 HMAC
     */
    verify(data: string, key: string, expectedHmac: string, algorithm?: HashAlgorithm, options?: HashOptions): boolean;
}
/**
 * 密钥生成类（KeyGenerator）
 *
 * 提供对称密钥/随机材料生成：RSA 密钥对、随机密钥/字节、盐值与 IV。
 * 注意：generateKey 返回十六进制字符串（长度为字节数×2）。
 */
export declare class KeyGenerator {
    /**
     * 生成 RSA 密钥对
     */
    generateRSAKeyPair(keySize?: 1024 | 2048 | 3072 | 4096): RSAKeyPair;
    /**
     * 生成随机密钥
     */
    generateKey(length?: number): string;
    /**
     * 生成随机字节
     */
    generateRandomBytes(length: number): string;
    /**
     * 生成盐值
     */
    generateSalt(length?: number): string;
    /**
     * 生成初始化向量
     */
    generateIV(length?: number): string;
}
/**
 * 数字签名类（DigitalSignature）
 *
 * 基于 RSA 的签名与验签封装（默认算法 sha256）。
 * - sign：使用私钥对字符串数据签名，返回 Base64 编码签名
 * - verify：使用公钥验证签名，返回 boolean
 *
 * 提示：请妥善保管私钥，不要在客户端暴露。
 */
export declare class DigitalSignature {
    /**
     * RSA 签名
     */
    sign(data: string, privateKey: string, algorithm?: string): string;
    /**
     * RSA 验证签名
     */
    verify(data: string, signature: string, publicKey: string, algorithm?: string): boolean;
}
