/**
 * Crypto Helper Functions
 * 提供类型安全的加密工具函数
 */
/**
 * CryptoJS加密配置接口
 */
export interface CryptoJSConfig {
    mode: unknown;
    padding?: unknown;
    iv?: unknown;
}
/**
 * 安全地获取CryptoJS加密模式
 * @param mode 模式名称
 * @returns CryptoJS模式对象
 */
export declare function getCryptoJSMode(mode: string): unknown;
/**
 * 安全地获取CryptoJS填充方式
 * @param padding 填充方式名称
 * @returns CryptoJS填充对象
 */
export declare function getCryptoJSPadding(padding: string): unknown;
/**
 * 创建类型安全的加密配置
 * @param options 配置选项
 * @param options.mode 加密模式
 * @param options.padding 填充方式
 * @param options.iv 初始化向量
 * @returns CryptoJS配置对象
 */
export declare function createCryptoJSConfig(options: {
    mode?: string;
    padding?: string;
    iv?: string;
}): CryptoJSConfig;
/**
 * 安全地提取错误消息
 * @param error 未知类型的错误
 * @returns 错误消息字符串
 */
export declare function getErrorMessage(error: unknown): string;
