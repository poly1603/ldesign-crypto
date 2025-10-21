/**
 * 认证加密（Authenticated Encryption with Associated Data - AEAD）
 *
 * 特性：
 * - 同时提供机密性（加密）和完整性（认证）
 * - 防止数据篡改和中间人攻击
 * - 支持附加认证数据（AAD）
 * - 使用 AES-GCM 或 AES+HMAC 组合
 *
 * @example
 * ```typescript
 * // 加密并认证
 * const result = encryptWithAuth('sensitive data', 'secret-key')
 *
 * // 解密并验证
 * const decrypted = decryptWithAuth(result, 'secret-key')
 * if (decrypted.verified) {
 *
 * }
 * ```
 */
import type { EncryptionAlgorithm } from '../types';
/**
 * 认证加密结果
 */
export interface AuthenticatedEncryptResult {
    success: boolean;
    /** 加密数据（Base64） */
    ciphertext: string;
    /** 认证标签（HMAC） */
    authTag: string;
    /** 初始化向量 */
    iv: string;
    /** 盐值 */
    salt: string;
    /** 算法 */
    algorithm: string;
    /** 附加认证数据（可选） */
    aad?: string;
    /** 错误信息 */
    error?: string;
}
/**
 * 认证解密结果
 */
export interface AuthenticatedDecryptResult {
    success: boolean;
    /** 解密后的数据 */
    data: string;
    /** 认证是否通过 */
    verified: boolean;
    /** 错误信息 */
    error?: string;
}
/**
 * 认证加密选项
 */
export interface AuthenticatedEncryptionOptions {
    /** 加密算法，默认 AES */
    algorithm?: EncryptionAlgorithm;
    /** 密钥大小（位），默认 256 */
    keySize?: 256 | 128 | 192;
    /** 附加认证数据（不加密但需要认证） */
    aad?: string;
    /** 是否使用 GCM 模式（如果为 false 则使用 CBC+HMAC） */
    useGCM?: boolean;
}
/**
 * 认证加密类
 */
export declare class AuthenticatedEncryption {
    /**
     * 加密并认证数据
     */
    encrypt(data: string, key: string, options?: AuthenticatedEncryptionOptions): AuthenticatedEncryptResult;
    /**
     * 解密并验证数据
     */
    decrypt(encryptedResult: AuthenticatedEncryptResult | string, key: string, options?: AuthenticatedEncryptionOptions): AuthenticatedDecryptResult;
    /**
     * 序列化加密结果为 JSON
     */
    serializeResult(result: AuthenticatedEncryptResult): string;
    /**
     * 从 JSON 反序列化加密结果
     */
    deserializeResult(json: string): AuthenticatedEncryptResult;
}
/**
 * 创建认证加密实例
 */
export declare const authenticatedEncryption: AuthenticatedEncryption;
/**
 * 快捷方法：加密并认证
 */
export declare function encryptWithAuth(data: string, key: string, options?: AuthenticatedEncryptionOptions): AuthenticatedEncryptResult;
/**
 * 快捷方法：解密并验证
 */
export declare function decryptWithAuth(encryptedData: AuthenticatedEncryptResult | string, key: string, options?: AuthenticatedEncryptionOptions): AuthenticatedDecryptResult;
/**
 * 快捷方法：加密 JSON 对象并认证
 */
export declare function encryptJSONWithAuth<T>(obj: T, key: string, options?: AuthenticatedEncryptionOptions): string;
/**
 * 快捷方法：解密并验证 JSON 对象
 */
export declare function decryptJSONWithAuth<T>(encryptedData: string, key: string, options?: AuthenticatedEncryptionOptions): {
    data: T | null;
    verified: boolean;
    error?: string;
};
