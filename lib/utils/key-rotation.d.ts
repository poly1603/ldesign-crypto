/**
 * 密钥轮换辅助工具
 *
 * 特性：
 * - 支持平滑的密钥轮换
 * - 保持旧密钥的解密能力
 * - 自动重新加密数据
 * - 密钥版本管理
 *
 * @example
 * ```typescript
 * const rotation = new KeyRotation()
 *
 * // 添加初始密钥
 * rotation.addKey('v1', 'old-key-1')
 * rotation.setActiveKey('v1')
 *
 * // 轮换到新密钥
 * rotation.addKey('v2', 'new-key-2')
 * rotation.rotateKey('v2')
 *
 * // 重新加密数据
 * const reencrypted = await rotation.reencryptData(oldEncryptedData)
 * ```
 */
import type { DecryptResult, EncryptionAlgorithm, EncryptResult } from '../types';
/**
 * 密钥信息
 */
export interface KeyInfo {
    /** 密钥版本 */
    version: string;
    /** 密钥值 */
    key: string;
    /** 创建时间 */
    createdAt: Date;
    /** 是否激活 */
    active: boolean;
    /** 是否已弃用 */
    deprecated: boolean;
    /** 过期时间（可选） */
    expiresAt?: Date;
}
/**
 * 加密数据元数据
 */
export interface EncryptedDataMetadata {
    /** 密钥版本 */
    keyVersion: string;
    /** 加密时间 */
    encryptedAt: Date;
    /** 算法 */
    algorithm: string;
}
/**
 * 重新加密结果
 */
export interface ReencryptionResult {
    success: boolean;
    /** 新的加密数据 */
    newData?: EncryptResult;
    /** 旧密钥版本 */
    oldKeyVersion?: string;
    /** 新密钥版本 */
    newKeyVersion?: string;
    /** 错误信息 */
    error?: string;
}
/**
 * 密钥轮换类
 */
export declare class KeyRotation {
    private keys;
    private activeKeyVersion?;
    /**
     * 添加密钥
     */
    addKey(version: string, key: string, expiresAt?: Date): void;
    /**
     * 设置激活密钥
     */
    setActiveKey(version: string): void;
    /**
     * 轮换密钥（添加新密钥并设为激活）
     */
    rotateKey(newVersion: string, newKey: string, expiresAt?: Date): void;
    /**
     * 获取激活密钥
     */
    getActiveKey(): KeyInfo | undefined;
    /**
     * 获取密钥
     */
    getKey(version: string): KeyInfo | undefined;
    /**
     * 获取所有密钥
     */
    getAllKeys(): KeyInfo[];
    /**
     * 删除密钥
     */
    removeKey(version: string): boolean;
    /**
     * 清理过期密钥
     */
    cleanupExpiredKeys(): number;
    /**
     * 使用激活密钥加密数据
     */
    encrypt(data: string, _algorithm?: EncryptionAlgorithm, // 未使用，默认使用AES
    options?: Record<string, unknown>): EncryptResult & {
        keyVersion: string;
    };
    /**
     * 解密数据（自动选择正确的密钥版本）
     */
    decrypt(encryptedData: (EncryptResult & {
        keyVersion: string;
    }) | string, _algorithm?: EncryptionAlgorithm, // 未使用，默认使用AES
    options?: Record<string, unknown>): DecryptResult;
    /**
     * 重新加密数据（使用新的激活密钥）
     */
    reencryptData(encryptedData: (EncryptResult & {
        keyVersion: string;
    }) | string, algorithm?: EncryptionAlgorithm, options?: Record<string, unknown>): Promise<ReencryptionResult>;
    /**
     * 批量重新加密数据
     */
    reencryptBatch(dataList: Array<(EncryptResult & {
        keyVersion: string;
    }) | string>, algorithm?: EncryptionAlgorithm, options?: Record<string, unknown>): Promise<ReencryptionResult[]>;
    /**
     * 导出密钥配置
     */
    exportKeys(): string;
    /**
     * 导入密钥配置
     */
    importKeys(json: string): void;
}
/**
 * 创建密钥轮换实例
 */
export declare function createKeyRotation(): KeyRotation;
