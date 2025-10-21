/**
 * 密钥派生工具
 * 提供安全的密钥派生功能，从密码生成强密钥
 */
import CryptoJS from 'crypto-js';
/**
 * 密钥派生选项
 */
export interface KeyDerivationOptions {
    /** 盐值（可选，自动生成） */
    salt?: string;
    /** 迭代次数（默认10000） */
    iterations?: number;
    /** 密钥长度（字节，默认32） */
    keySize?: number;
    /** 哈希算法（默认SHA256） */
    hasher?: typeof CryptoJS.algo.SHA256 | typeof CryptoJS.algo.SHA512;
}
/**
 * 密钥派生结果
 */
export interface KeyDerivationResult {
    /** 派生的密钥 */
    key: string;
    /** 使用的盐值 */
    salt: string;
    /** 迭代次数 */
    iterations: number;
    /** 密钥长度（字节） */
    keySize: number;
}
/**
 * 密钥派生工具类
 *
 * 使用PBKDF2算法从密码派生密钥
 * 提供安全的密钥生成和验证功能
 */
export declare class KeyDerivation {
    private static readonly DEFAULT_ITERATIONS;
    private static readonly DEFAULT_KEY_SIZE;
    private static readonly SALT_SIZE;
    /**
     * 从密码派生密钥
     *
     * @param password 密码
     * @param options 派生选项
     * @returns 派生结果
     *
     * @example
     * ```typescript
     * const result = KeyDerivation.deriveKey('myPassword123')
     *  // 派生的密钥
     *  // 使用的盐值
     * ```
     */
    static deriveKey(password: string, options?: KeyDerivationOptions): KeyDerivationResult;
    /**
     * 验证密码是否匹配派生的密钥
     *
     * @param password 要验证的密码
     * @param derivedKey 之前派生的密钥
     * @param salt 使用的盐值
     * @param options 派生选项
     * @returns 是否匹配
     *
     * @example
     * ```typescript
     * const result = KeyDerivation.deriveKey('myPassword123')
     * const isValid = KeyDerivation.verifyKey('myPassword123', result.key, result.salt)
     *  // true
     * ```
     */
    static verifyKey(password: string, derivedKey: string, salt: string, options?: KeyDerivationOptions): boolean;
    /**
     * 生成随机盐值
     *
     * @param size 盐值大小（字节，默认16）
     * @returns 盐值（Hex字符串）
     */
    static generateSalt(size?: number): string;
    /**
     * 从密码派生多个密钥
     *
     * @param password 密码
     * @param count 密钥数量
     * @param options 派生选项
     * @returns 派生的密钥数组
     *
     * @example
     * ```typescript
     * const keys = KeyDerivation.deriveMultipleKeys('myPassword', 3)
     * // 返回3个不同的密钥，可用于不同用途
     * ```
     */
    static deriveMultipleKeys(password: string, count: number, options?: KeyDerivationOptions): KeyDerivationResult[];
    /**
     * 计算推荐的迭代次数
     *
     * 根据目标延迟时间计算合适的迭代次数
     *
     * @param targetDelayMs 目标延迟时间（毫秒，默认100ms）
     * @returns 推荐的迭代次数
     */
    static calculateIterations(targetDelayMs?: number): number;
    /**
     * 从密码派生加密密钥和HMAC密钥
     *
     * @param password 密码
     * @param options 派生选项
     * @returns 加密密钥和HMAC密钥
     *
     * @example
     * ```typescript
     * const { encryptionKey, hmacKey } = KeyDerivation.deriveEncryptionKeys('myPassword')
     * // 使用encryptionKey进行加密，使用hmacKey进行消息认证
     * ```
     */
    static deriveEncryptionKeys(password: string, options?: KeyDerivationOptions): {
        encryptionKey: KeyDerivationResult;
        hmacKey: KeyDerivationResult;
        salt: string;
    };
    /**
     * 估算派生时间
     *
     * @param iterations 迭代次数
     * @returns 预估时间（毫秒）
     */
    static estimateDerivationTime(iterations: number): number;
}
/**
 * 便捷的密钥派生函数
 */
export declare function deriveKey(password: string, options?: KeyDerivationOptions): KeyDerivationResult;
/**
 * 便捷的密钥验证函数
 */
export declare function verifyKey(password: string, derivedKey: string, salt: string, options?: KeyDerivationOptions): boolean;
/**
 * 便捷的盐值生成函数
 */
export declare function generateSalt(size?: number): string;
