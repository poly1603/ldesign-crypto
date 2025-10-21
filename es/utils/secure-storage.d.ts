/**
 * 安全存储工具
 * 提供加密的本地存储功能
 */
/**
 * 存储选项
 */
export interface SecureStorageOptions {
    /** 加密密钥 */
    key: string;
    /** 存储前缀（默认'secure_'） */
    prefix?: string;
    /** 使用sessionStorage而非localStorage */
    useSessionStorage?: boolean;
    /** 数据过期时间（毫秒，0表示永不过期） */
    ttl?: number;
}
/**
 * 安全存储工具类
 *
 * 提供加密的localStorage/sessionStorage功能
 * 自动处理数据的加密、解密、序列化和反序列化
 */
export declare class SecureStorage {
    private key;
    private prefix;
    private storage;
    private defaultTTL;
    /**
     * 创建安全存储实例
     *
     * @param options 存储选项
     *
     * @example
     * ```typescript
     * const storage = new SecureStorage({ key: 'my-secret-key' })
     * storage.set('user', { name: 'John', age: 30 })
     * const user = storage.get('user')
     * ```
     */
    constructor(options: SecureStorageOptions);
    /**
     * 存储数据
     *
     * @param key 键名
     * @param value 值（自动序列化）
     * @param ttl 过期时间（毫秒，可选）
     * @returns 是否成功
     */
    set<T>(key: string, value: T, ttl?: number): boolean;
    /**
     * 获取数据
     *
     * @param key 键名
     * @param defaultValue 默认值（可选）
     * @returns 值或默认值
     */
    get<T>(key: string, defaultValue?: T): T | undefined;
    /**
     * 删除数据
     *
     * @param key 键名
     * @returns 是否成功
     */
    remove(key: string): boolean;
    /**
     * 清空所有数据
     *
     * @returns 是否成功
     */
    clear(): boolean;
    /**
     * 检查键是否存在
     *
     * @param key 键名
     * @returns 是否存在
     */
    has(key: string): boolean;
    /**
     * 获取所有键名
     *
     * @returns 键名数组
     */
    keys(): string[];
    /**
     * 获取存储项数量
     *
     * @returns 数量
     */
    size(): number;
    /**
     * 清理过期数据
     *
     * @returns 清理的数量
     */
    cleanup(): number;
    /**
     * 获取存储项的元数据
     *
     * @param key 键名
     * @returns 元数据或undefined
     */
    getMetadata(key: string): {
        timestamp: number;
        expiresAt: number;
        type: string;
        isExpired: boolean;
    } | undefined;
    /**
     * 更新密钥（重新加密所有数据）
     *
     * @param newKey 新密钥
     * @returns 是否成功
     */
    updateKey(newKey: string): boolean;
}
/**
 * 创建安全存储实例的便捷函数
 */
export declare function createSecureStorage(options: SecureStorageOptions): SecureStorage;
