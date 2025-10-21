/**
 * 加密密钥管理系统
 * 提供安全的密钥生成、存储、轮换和访问控制
 */
/**
 * 密钥元数据
 */
export interface KeyMetadata {
    id: string;
    name: string;
    algorithm: string;
    purpose: 'encryption' | 'signing' | 'key-derivation' | 'authentication';
    created: Date;
    expires?: Date;
    rotated?: Date;
    version: number;
    tags: string[];
    permissions: KeyPermission[];
}
/**
 * 密钥权限
 */
export interface KeyPermission {
    operation: 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'derive';
    allowed: boolean;
    conditions?: {
        timeWindow?: {
            start: Date;
            end: Date;
        };
        ipWhitelist?: string[];
        maxUses?: number;
        requireMFA?: boolean;
    };
}
/**
 * 密钥存储选项
 */
export interface KeyStorageOptions {
    /** 存储类型 */
    type: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB' | 'secure';
    /** 是否加密存储 */
    encrypted: boolean;
    /** 主密钥派生算法 */
    kdfAlgorithm: 'pbkdf2' | 'argon2' | 'scrypt';
    /** KDF 参数 */
    kdfParams?: Record<string, unknown>;
    /** 是否启用密钥轮换 */
    autoRotation: boolean;
    /** 轮换间隔（天） */
    rotationInterval: number;
}
/**
 * 密钥管理器
 */
export declare class KeyManager {
    private keys;
    private masterKey;
    private options;
    private kdfManager;
    private rotationTimers;
    constructor(options?: Partial<KeyStorageOptions>);
    /**
     * 通过口令派生并初始化主密钥（向后兼容别名）
     * 等价于 initializeMasterKey，但保留 name 参数以兼容现有调用方（仅用于标记用途）。
     * @param password 用于派生主密钥的口令
     * @param name 可选的主密钥标识标签（用于存储标记，不参与派生）
     */
    deriveKeyFromPassword(password: string, name?: string): Promise<void>;
    /**
     * 初始化主密钥
     */
    initializeMasterKey(password: string): Promise<void>;
    /**
     * 生成新密钥
     */
    generateKey(options: {
        name: string;
        algorithm: 'AES' | 'RSA' | 'ECDSA' | 'Ed25519';
        purpose: KeyMetadata['purpose'];
        keySize?: number;
        expires?: Date;
        tags?: string[];
        permissions?: KeyPermission[];
    }): Promise<string>;
    /**
     * 获取密钥
     */
    getKey(keyId: string, operation?: KeyPermission['operation']): Promise<string | null>;
    /**
     * 轮换密钥
     */
    rotateKey(keyId: string): Promise<string>;
    /**
     * 删除密钥
     */
    deleteKey(keyId: string): Promise<boolean>;
    /**
     * 列出所有密钥
     */
    listKeys(filter?: {
        purpose?: KeyMetadata['purpose'];
        algorithm?: string;
        tags?: string[];
        includeExpired?: boolean;
    }): KeyMetadata[];
    /**
     * 导出密钥
     */
    exportKey(keyId: string, format?: 'raw' | 'jwk' | 'pem'): Promise<string>;
    /**
     * 导入密钥
     */
    importKey(keyData: string, format: 'raw' | 'jwk' | 'pem', metadata: Omit<KeyMetadata, 'id' | 'created' | 'version'>): Promise<string>;
    /**
     * 备份所有密钥
     */
    backup(password?: string): Promise<string>;
    /**
     * 恢复备份
     */
    restore(backupData: string, password?: string): Promise<number>;
    /**
     * 清理过期密钥
     */
    cleanupExpiredKeys(): number;
    private generateKeyId;
    private generateSalt;
    private generateRandomKey;
    private generateRSAKey;
    private generateECDSAKey;
    private generateEd25519Key;
    private encryptKey;
    private decryptKey;
    private getDefaultPermissions;
    private checkPermission;
    private scheduleKeyRotation;
    private convertToJWK;
    private convertToPEM;
    private parseJWK;
    private parsePEM;
    private loadKeysFromStorage;
    private saveKeyToStorage;
    private saveToStorage;
    private removeFromStorage;
    /**
     * 销毁管理器
     */
    destroy(): void;
}
/**
 * 全局密钥管理器实例
 */
export declare const keyManager: KeyManager;
