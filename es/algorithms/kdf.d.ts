/**
 * 密钥派生函数（Key Derivation Functions）
 * 提供多种密钥派生算法，用于从密码生成加密密钥
 */
/**
 * KDF 配置选项
 */
export interface KDFOptions {
    /** 迭代次数 */
    iterations?: number;
    /** 密钥长度（字节） */
    keyLength?: number;
    /** 盐值 */
    salt?: string;
    /** 内存成本（Argon2/scrypt） */
    memoryCost?: number;
    /** 并行度（Argon2/scrypt） */
    parallelism?: number;
    /** 时间成本（Argon2） */
    timeCost?: number;
    /** 输出格式 */
    outputFormat?: 'hex' | 'base64' | 'raw';
}
/**
 * KDF 结果
 */
export interface KDFResult {
    /** 派生的密钥 */
    key: string;
    /** 使用的盐值 */
    salt: string;
    /** 算法名称 */
    algorithm: string;
    /** 参数 */
    parameters: {
        iterations?: number;
        keyLength: number;
        memoryCost?: number;
        parallelism?: number;
        timeCost?: number;
    };
}
/**
 * PBKDF2 实现
 * Password-Based Key Derivation Function 2
 */
export declare class PBKDF2 {
    private readonly defaultOptions;
    /**
     * 派生密钥
     */
    derive(password: string, options?: KDFOptions): KDFResult;
    /**
     * 验证密码
     */
    verify(password: string, derivedKey: string, salt: string, options?: KDFOptions): boolean;
    /**
     * 推荐的安全参数
     */
    getRecommendedParameters(securityLevel?: 'low' | 'medium' | 'high'): KDFOptions;
}
/**
 * Argon2 实现（简化版）
 * 内存硬化的密钥派生函数
 */
export declare class Argon2 {
    private readonly defaultOptions;
    /**
     * 派生密钥（简化实现）
     * 注意：这是一个简化的实现，实际应使用专门的 Argon2 库
     */
    derive(password: string, options?: KDFOptions): KDFResult;
    /**
     * 验证密码
     */
    verify(password: string, derivedKey: string, salt: string, options?: KDFOptions): boolean;
    /**
     * 推荐的安全参数
     */
    getRecommendedParameters(securityLevel?: 'low' | 'medium' | 'high'): KDFOptions;
}
/**
 * scrypt 实现（简化版）
 * 内存硬化的密钥派生函数
 */
export declare class Scrypt {
    private readonly defaultOptions;
    /**
     * 派生密钥（简化实现）
     * 注意：这是一个简化的实现，实际应使用专门的 scrypt 库
     */
    derive(password: string, options?: KDFOptions): KDFResult;
    /**
     * 验证密码
     */
    verify(password: string, derivedKey: string, salt: string, options?: KDFOptions): boolean;
    /**
     * 推荐的安全参数
     */
    getRecommendedParameters(securityLevel?: 'low' | 'medium' | 'high'): KDFOptions;
}
/**
 * KDF 管理器
 */
export declare class KDFManager {
    private pbkdf2;
    private argon2;
    private scrypt;
    /**
     * 派生密钥
     */
    derive(password: string, algorithm?: 'pbkdf2' | 'argon2' | 'scrypt', options?: KDFOptions): KDFResult;
    /**
     * 派生密钥（异步版本）
     */
    deriveKey(password: string, salt: string, algorithm?: 'pbkdf2' | 'argon2' | 'scrypt', options?: KDFOptions): Promise<KDFResult>;
    /**
     * 验证密码
     */
    verify(password: string, derivedKey: string, salt: string, algorithm?: 'pbkdf2' | 'argon2' | 'scrypt', options?: KDFOptions): boolean;
    /**
     * 获取推荐参数
     */
    getRecommendedParameters(algorithm?: 'pbkdf2' | 'argon2' | 'scrypt', securityLevel?: 'low' | 'medium' | 'high'): KDFOptions;
    /**
     * 基准测试 - 测试不同参数的性能
     */
    benchmark(algorithm: 'pbkdf2' | 'argon2' | 'scrypt', password?: string): Promise<{
        algorithm: string;
        parameters: KDFOptions;
        timeMs: number;
        opsPerSecond: number;
    }[]>;
}
export declare const pbkdf2: PBKDF2;
export declare const argon2: Argon2;
export declare const scrypt: Scrypt;
export declare const kdfManager: KDFManager;
