/**
 * 链式调用 API - 提供流畅的加解密操作体验
 *
 * 特性：
 * - 链式调用，代码更简洁
 * - 自动类型推导
 * - 支持加密、哈希、编码等所有操作
 * - 支持数据转换和格式化
 *
 * @example
 * ```typescript
 * // 加密并编码
 * const result = crypto.chain('hello world')
 *  .encrypt('AES', 'secret-key')
 *  .base64()
 *  .execute()
 *
 * // 解密
 * const decrypted = crypto.chain(result)
 *  .fromBase64()
 *  .decrypt('AES', 'secret-key')
 *  .execute()
 *
 * // 哈希链
 * const hash = crypto.chain('password')
 *  .hash('SHA256')
 *  .hash('SHA256') // 二次哈希
 *  .execute()
 * ```
 */
import type { AESOptions, EncryptionAlgorithm, EncryptResult, HashAlgorithm, RSAOptions } from '../types';
/**
 * 链式操作结果类型
 */
type ChainData = string | EncryptResult;
/**
 * CryptoChain - 链式加解密操作类
 * 优化：改进内存管理，减少字符串复制
 */
export declare class CryptoChain {
    private data;
    private errorOccurred;
    private lastError?;
    private resultCache;
    constructor(data: ChainData);
    /**
     * 加密数据
     */
    encrypt(algorithm: 'AES', key: string, options?: AESOptions): CryptoChain;
    encrypt(algorithm: 'RSA', key: string, options?: RSAOptions): CryptoChain;
    encrypt(algorithm: 'DES' | '3DES', key: string, options?: Record<string, unknown>): CryptoChain;
    /**
     * 解密数据
     */
    decrypt(algorithm: 'AES', key: string, options?: AESOptions): CryptoChain;
    decrypt(algorithm: 'RSA', key: string, options?: RSAOptions): CryptoChain;
    decrypt(algorithm: 'DES' | '3DES', key: string, options?: Record<string, unknown>): CryptoChain;
    /**
     * 哈希数据
     */
    hash(algorithm?: HashAlgorithm): CryptoChain;
    /**
     * Base64 编码
     */
    base64(): CryptoChain;
    /**
     * Base64 解码
     */
    fromBase64(): CryptoChain;
    /**
     * Hex 编码
     */
    hex(): CryptoChain;
    /**
     * Hex 解码
     */
    fromHex(): CryptoChain;
    /**
     * 转大写
     */
    toUpperCase(): CryptoChain;
    /**
     * 转小写
     */
    toLowerCase(): CryptoChain;
    /**
     * JSON 序列化
     */
    toJSON<T>(obj: T): CryptoChain;
    /**
     * JSON 反序列化
     */
    fromJSON<T>(): T | null;
    /**
     * 执行链式操作，返回最终结果
     */
    execute(): string;
    /**
     * 执行链式操作，返回 EncryptResult
     */
    executeAsResult(): EncryptResult | string;
    /**
     * 获取当前错误
     */
    getError(): Error | undefined;
    /**
     * 检查是否发生错误
     */
    hasError(): boolean;
    /**
     * 清除错误状态，继续执行链
     */
    clearError(): CryptoChain;
    /**
     * 条件执行
     */
    if(condition: boolean, fn: (chain: CryptoChain) => CryptoChain): CryptoChain;
    /**
     * 自定义转换
     */
    transform(fn: (data: string) => string): CryptoChain;
    /**
     * 获取字符串形式的数据
     */
    private getStringData;
    /**
     * 处理错误（优化内存使用）
     */
    private handleError;
    /**
     * 清理内部状态，释放内存
     */
    dispose(): void;
}
/**
 * 创建链式调用实例
 */
export declare function chain(data: string | EncryptResult): CryptoChain;
/**
 * 快捷加密方法 - 加密 + Base64 编码
 */
export declare function encryptToBase64(data: string, algorithm: EncryptionAlgorithm, key: string, options?: AESOptions | RSAOptions | Record<string, unknown>): string;
/**
 * 快捷解密方法 - Base64 解码 + 解密
 */
export declare function decryptFromBase64(data: string, algorithm: EncryptionAlgorithm, key: string, options?: AESOptions | RSAOptions | Record<string, unknown>): string;
/**
 * 快捷 JSON 加密
 */
export declare function encryptJSON<T>(obj: T, algorithm: EncryptionAlgorithm, key: string, options?: AESOptions | RSAOptions | Record<string, unknown>): string;
/**
 * 快捷 JSON 解密
 */
export declare function decryptJSON<T>(data: string, algorithm: EncryptionAlgorithm, key: string, options?: AESOptions | RSAOptions | Record<string, unknown>): T;
/**
 * 密码哈希（多次）- 优化内存使用
 */
export declare function hashPassword(password: string, iterations?: number): string;
export {};
