/**
 * 密码学安全随机数生成器 (CSPRNG)
 * Cryptographically Secure Pseudorandom Number Generator
 */
/**
 * 随机数生成器配置
 */
export interface CSPRNGConfig {
    /** 熵源类型 */
    entropySource: 'crypto' | 'webcrypto' | 'node' | 'fallback';
    /** 种子长度（字节） */
    seedLength: number;
    /** 是否使用硬件随机数生成器 */
    useHardwareRNG: boolean;
    /** 是否收集额外熵 */
    collectEntropy: boolean;
    /** 重新播种间隔（生成次数） */
    reseedInterval: number;
}
/**
 * 熵收集器
 */
export declare class EntropyCollector {
    private entropy;
    private mouseEntropy;
    private keyboardEntropy;
    private timeEntropy;
    private collecting;
    /**
     * 开始收集熵
     */
    startCollecting(): void;
    /**
     * 停止收集熵
     */
    stopCollecting(): void;
    /**
     * 收集鼠标熵
     */
    private collectMouseEntropy;
    /**
     * 收集键盘熵
     */
    private collectKeyboardEntropy;
    /**
     * 收集时间熵
     */
    private collectTimeEntropy;
    /**
     * 获取收集的熵
     */
    getEntropy(): Uint8Array;
    /**
     * 添加外部熵
     */
    addEntropy(data: string | Uint8Array): void;
    /**
     * 获取熵池质量
     */
    getEntropyQuality(): number;
}
/**
 * 密码学安全随机数生成器
 */
export declare class CSPRNG {
    private config;
    private seed;
    private counter;
    private entropyCollector;
    private lastReseed;
    constructor(config?: Partial<CSPRNGConfig>);
    /**
     * 检测最佳熵源
     */
    private detectBestEntropySource;
    /**
     * 初始化种子
     */
    private initializeSeed;
    /**
     * 回退种子生成
     */
    private fallbackSeed;
    /**
     * 生成随机字节
     */
    randomBytes(length: number): Uint8Array;
    /**
     * 回退随机字节生成
     */
    private fallbackRandomBytes;
    /**
     * 生成随机整数
     */
    randomInt(min: number, max: number): number;
    /**
     * 生成随机浮点数
     */
    randomFloat(min?: number, max?: number): number;
    /**
     * 生成随机字符串
     */
    randomString(length: number, charset?: string): string;
    /**
     * 生成随机十六进制字符串
     */
    randomHex(length: number): string;
    /**
     * 生成随机 Base64 字符串
     */
    randomBase64(length: number): string;
    /**
     * 生成 UUID v4
     */
    randomUUID(): string;
    /**
     * 生成安全令牌
     */
    randomToken(length?: number): string;
    /**
     * 随机洗牌数组
     */
    shuffle<T>(array: T[]): T[];
    /**
     * 随机选择元素
     */
    choice<T>(array: T[]): T;
    /**
     * 随机选择多个元素
     */
    sample<T>(array: T[], count: number): T[];
    /**
     * 重新播种
     */
    reseed(additionalEntropy?: Uint8Array): void;
    /**
     * 添加熵
     */
    addEntropy(data: string | Uint8Array): void;
    /**
     * 获取熵质量
     */
    getEntropyQuality(): number;
    /**
     * 销毁生成器
     */
    destroy(): void;
}
/**
 * 全局 CSPRNG 实例
 */
export declare const csprng: CSPRNG;
/**
 * 便捷函数
 */
export declare const random: {
    bytes: (length: number) => Uint8Array<ArrayBufferLike>;
    int: (min: number, max: number) => number;
    float: (min?: number, max?: number) => number;
    string: (length: number, charset?: string) => string;
    hex: (length: number) => string;
    base64: (length: number) => string;
    uuid: () => string;
    token: (length?: number) => string;
    shuffle: <T>(array: T[]) => T[];
    choice: <T>(array: T[]) => T;
    sample: <T>(array: T[], count: number) => T[];
};
