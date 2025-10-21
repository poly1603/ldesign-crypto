import type { DecryptResult, EncryptResult, IEncryptor } from '../types';
/**
 * 高级加密算法选项
 */
export interface AdvancedEncryptOptions {
    /** 随机数 */
    nonce?: string;
    /** 关联数据 (AEAD) */
    aad?: string;
    /** 认证标签长度 */
    tagLength?: number;
    /** 计数器 */
    counter?: number;
}
/**
 * ChaCha20-Poly1305 加密器
 * 一种现代的流密码，具有认证加密功能
 */
export declare class ChaCha20Encryptor implements IEncryptor {
    private readonly NONCE_LENGTH;
    private readonly KEY_LENGTH;
    private readonly TAG_LENGTH;
    /**
     * ChaCha20-Poly1305 加密
     */
    encrypt(data: string, key: string, options?: AdvancedEncryptOptions): EncryptResult;
    /**
     * ChaCha20-Poly1305 解密
     */
    decrypt(encryptedData: string | EncryptResult, key: string, options?: AdvancedEncryptOptions): DecryptResult;
    /**
     * 执行 ChaCha20 加密/解密（简化实现）
     */
    private performChaCha20;
    /**
     * 生成认证标签（简化实现）
     */
    private generateAuthTag;
    private hexToBytes;
    private bytesToHex;
}
/**
 * AES-GCM 加密器
 * Galois/Counter Mode - 提供认证加密
 */
export declare class AESGCMEncryptor implements IEncryptor {
    private readonly IV_LENGTH;
    private readonly TAG_LENGTH;
    encrypt(data: string, key: string, options?: AdvancedEncryptOptions): Promise<EncryptResult>;
    decrypt(encryptedData: string | EncryptResult, key: string, options?: AdvancedEncryptOptions): Promise<DecryptResult>;
    /**
     * 浏览器环境的 AES-GCM 加密
     */
    private encryptBrowser;
    /**
     * 浏览器环境的 AES-GCM 解密
     */
    private decryptBrowser;
    /**
     * Node.js 环境的 AES-GCM 加密（简化实现）
     */
    private encryptNode;
    /**
     * Node.js 环境的 AES-GCM 解密（简化实现）
     */
    private decryptNode;
    private simpleXor;
    private generateTag;
    private hexToArrayBuffer;
    private arrayBufferToHex;
}
export declare const chacha20: ChaCha20Encryptor;
export declare const aesGcm: AESGCMEncryptor;
