/**
 * Crypto Engine 插件
 *
 * 将 Crypto 功能集成到 LDesign Engine 中，提供统一的加密解密管理体验
 */
import type { Plugin } from '@ldesign/engine/types';
import { type CryptoPluginOptions } from '../adapt/vue/plugin';
/**
 * Crypto Engine 插件配置选项
 */
export interface CryptoEnginePluginOptions extends CryptoPluginOptions {
    /** 插件名称 */
    name?: string;
    /** 插件版本 */
    version?: string;
    /** 插件描述 */
    description?: string;
    /** 插件依赖 */
    dependencies?: string[];
    /** 是否自动安装到 Vue 应用 */
    autoInstall?: boolean;
    /** 是否启用性能监控 */
    enablePerformanceMonitoring?: boolean;
    /** 是否启用调试模式 */
    debug?: boolean;
}
/**
 * 创建 Crypto Engine 插件
 *
 * 将 Crypto 功能集成到 LDesign Engine 中，提供统一的加密解密管理体验
 *
 * @param options 插件配置选项
 * @returns Engine 插件实例
 *
 * @example
 * ```typescript
 * import { createCryptoEnginePlugin } from '@ldesign/crypto'
 *
 * const cryptoPlugin = createCryptoEnginePlugin({
 *   config: {
 *     defaultAESKeySize: 256,
 *     defaultRSAKeySize: 2048,
 *     defaultHashAlgorithm: 'SHA256'
 *   },
 *   globalPropertyName: '$crypto',
 *   enablePerformanceMonitoring: true
 * })
 *
 * await engine.use(cryptoPlugin)
 * ```
 */
export declare function createCryptoEnginePlugin(options?: CryptoEnginePluginOptions): Plugin;
/**
 * 创建默认 Crypto 插件
 */
export declare function createDefaultCryptoEnginePlugin(): Plugin;
/**
 * 创建高性能 Crypto 插件
 */
export declare function createPerformanceCryptoEnginePlugin(options?: Partial<CryptoEnginePluginOptions>): Plugin;
/**
 * 创建调试模式 Crypto 插件
 */
export declare function createDebugCryptoEnginePlugin(options?: Partial<CryptoEnginePluginOptions>): Plugin;
declare const _default: {
    createCryptoEnginePlugin: typeof createCryptoEnginePlugin;
    createDefaultCryptoEnginePlugin: typeof createDefaultCryptoEnginePlugin;
    createPerformanceCryptoEnginePlugin: typeof createPerformanceCryptoEnginePlugin;
    createDebugCryptoEnginePlugin: typeof createDebugCryptoEnginePlugin;
};
export default _default;
/**
 * 向后兼容的导出
 */
export { createCryptoEnginePlugin as cryptoEnginePlugin };
