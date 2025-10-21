import type { DecryptResult, EncryptionAlgorithm, EncryptResult, HashAlgorithm, HashOptions, RSAKeyPair } from '../types';
import { type BatchOperation, type BatchResult } from './performance';
/**
 * 加密配置选项
 */
export interface CryptoConfig {
    defaultAlgorithm?: EncryptionAlgorithm;
    enableCache?: boolean;
    maxCacheSize?: number;
    enableParallel?: boolean;
    autoGenerateIV?: boolean;
    keyDerivation?: boolean;
    debug?: boolean;
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
}
/**
 * 统一的加解密管理器（CryptoManager）
 *
 * 在 Encrypt/Decrypt/Hash/HMAC/KeyGenerator 基础上提供更易用的一致入口，并内置批量、并行与结果缓存等性能优化能力。
 *
 * 能力概览：
 * - encryptData/decryptData：统一算法选择与错误捕获，返回标准结构体
 * - batchEncrypt/batchDecrypt：可按配置启用并行（Web Worker/模拟）
 * - 配置项：默认算法、缓存、并行、自动 IV、KDF、调试日志等级等
 * - 性能：通过 PerformanceOptimizer 统计与缓存，getPerformanceStats 获取指标
 *
 * 使用示例：
 * ```ts
 * import { cryptoManager } from '@ldesign/crypto'
 * const enc = await cryptoManager.encryptData('hello', 'secret', 'AES')
 * const dec = await cryptoManager.decryptData(enc, 'secret')
 * ```
 */
export declare class CryptoManager {
    private encrypt;
    private decrypt;
    private hash;
    private hmac;
    private keyGenerator;
    private optimizer;
    private config;
    constructor(config?: CryptoConfig);
    /**
     * 简化的加密方法
     */
    encryptData(data: string, key: string, algorithm?: EncryptionAlgorithm, options?: Record<string, unknown>): Promise<EncryptResult>;
    /**
     * 简化的解密方法
     */
    decryptData(encryptedData: string | EncryptResult, key: string, algorithm?: EncryptionAlgorithm, options?: Record<string, unknown>): Promise<DecryptResult>;
    /**
     * 批量加密
     */
    batchEncrypt(operations: BatchOperation[]): Promise<Array<{
        id: string;
        result: EncryptResult;
    }>>;
    /**
     * 批量解密
     */
    batchDecrypt(operations: BatchOperation[]): Promise<Array<{
        id: string;
        result: DecryptResult;
    }>>;
    /**
     * 哈希计算
     */
    hashData(data: string, algorithm?: HashAlgorithm, options?: HashOptions): string;
    /**
     * HMAC 计算
     */
    hmacData(data: string, key: string, algorithm?: HashAlgorithm): string;
    /**
     * 生成密钥
     */
    generateKey(algorithm: EncryptionAlgorithm, keySize?: number): string | RSAKeyPair;
    /**
     * 获取支持的算法列表
     */
    getSupportedAlgorithms(): EncryptionAlgorithm[];
    /**
     * 获取性能统计
     */
    getPerformanceStats(): import('./performance').CacheStats;
    /**
     * 获取缓存统计（别名）
     */
    getCacheStats(): import('./performance').CacheStats;
    /**
     * 获取性能指标
     */
    getPerformanceMetrics(): import('./performance').PerformanceMetrics;
    /**
     * 清理过期缓存
     */
    cleanupCache(): number;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 更新配置
     */
    updateConfig(newConfig: Partial<CryptoConfig>): void;
    /**
     * 获取当前配置
     */
    getConfig(): CryptoConfig;
    /**
     * 日志记录
     */
    private log;
}
export declare const cryptoManager: CryptoManager;
export type { BatchOperation, BatchResult };
