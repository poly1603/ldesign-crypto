/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { CryptoPlugin } from '../adapt/vue/plugin.js';
import { cryptoManager, digitalSignature, keyGenerator, decrypt, encrypt } from '../core/index.js';
import { hex, base64, encoding } from '../algorithms/encoding.js';
import { aes } from '../algorithms/aes.js';
import 'crypto-js';
import '../utils/errors.js';
import '../utils/key-derivation.js';
import '../utils/object-pool.js';
import '../utils/performance-logger.js';
import { hmac, hash } from '../algorithms/hash.js';
import { rsa } from '../algorithms/rsa.js';

const defaultConfig = {
  name: "crypto",
  version: "1.0.0",
  description: "LDesign Crypto Engine Plugin",
  dependencies: [],
  autoInstall: true,
  enablePerformanceMonitoring: false,
  debug: false,
  globalPropertyName: "$crypto",
  registerComposables: true,
  config: {
    defaultAESKeySize: 256,
    defaultRSAKeySize: 2048,
    defaultHashAlgorithm: "SHA256",
    defaultEncoding: "base64"
  }
};
function createGlobalCryptoInstance(options) {
  return {
    // 核心功能
    encrypt,
    decrypt,
    hash,
    hmac,
    keyGenerator,
    digitalSignature,
    // 算法实现
    aes,
    rsa,
    encoding,
    base64,
    hex,
    // 管理器
    manager: cryptoManager,
    // 配置
    config: options?.config || defaultConfig.config
  };
}
function createCryptoEnginePlugin(options = {}) {
  const config = { ...defaultConfig, ...options };
  const {
    name = "crypto",
    version = "1.0.0",
    // description = 'LDesign Crypto Engine Plugin', // 未使用
    dependencies = [],
    autoInstall = true,
    enablePerformanceMonitoring = false,
    debug = false
  } = config;
  if (debug) {
    console.info("[Crypto Plugin] createCryptoEnginePlugin called with options:", options);
  }
  return {
    name,
    version,
    dependencies,
    async install(context) {
      try {
        if (debug) {
          console.info("[Crypto Plugin] install method called with context:", context);
        }
        const engine = context.engine || context;
        if (debug) {
          console.info("[Crypto Plugin] engine instance:", !!engine);
        }
        const performInstall = async () => {
          engine.logger?.info("[Crypto Plugin] performInstall called");
          const vueApp2 = engine.getApp();
          if (!vueApp2) {
            throw new Error("Vue app not found. Make sure the engine has created a Vue app before installing crypto plugin.");
          }
          engine.logger?.info("[Crypto Plugin] Vue app found, proceeding with installation");
          engine.logger?.info(`Installing ${name} plugin...`, {
            version,
            enablePerformanceMonitoring
          });
          const globalCrypto = createGlobalCryptoInstance(config);
          if (engine.state) {
            engine.state.set("crypto:instance", globalCrypto);
            engine.state.set("crypto:config", config.config);
            engine.state.set("crypto:manager", cryptoManager);
          }
          if (autoInstall) {
            vueApp2.use(CryptoPlugin, {
              globalPropertyName: config.globalPropertyName,
              registerComposables: config.registerComposables,
              config: config.config
            });
            if (debug) {
              console.info("[Crypto Plugin] Vue plugin installed successfully");
            }
          } else {
            vueApp2.provide("crypto", globalCrypto);
            vueApp2.provide("cryptoConfig", config.config);
          }
          vueApp2.provide("cryptoManager", cryptoManager);
          if (enablePerformanceMonitoring && engine.performance) {
            engine.performance.mark("crypto-plugin-installed");
          }
          if (engine.events) {
            engine.events.emit("plugin:installed", {
              name,
              version,
              type: "crypto"
            });
          }
          engine.logger?.info(`${name} plugin installed successfully`);
        };
        const vueApp = engine.getApp();
        if (vueApp) {
          engine.logger?.info("[Crypto Plugin] Vue app found, installing immediately");
          await performInstall();
        } else {
          engine.logger?.info("[Crypto Plugin] Vue app not found, registering event listener");
          await new Promise((resolve, reject) => {
            engine.events?.once("app:created", async () => {
              try {
                engine.logger?.info("[Crypto Plugin] app:created event received, installing now");
                await performInstall();
                resolve();
              } catch (error) {
                engine.logger?.error("[Crypto Plugin] Failed to install after app creation:", error);
                reject(error);
              }
            });
            engine.logger?.info(`${name} plugin registered, waiting for Vue app creation...`);
          });
        }
      } catch (error) {
        if (context.engine?.logger) {
          context.engine.logger.error("[Crypto Plugin] Installation failed:", error);
        } else {
          console.error("[Crypto Plugin] Installation failed:", error);
        }
        throw error;
      }
    },
    async uninstall(context) {
      try {
        const engine = context.engine || context;
        engine.logger?.info(`Uninstalling ${name} plugin...`);
        if (engine.state) {
          engine.state.delete("crypto:instance");
          engine.state.delete("crypto:config");
          engine.state.delete("crypto:manager");
        }
        if (engine.events) {
          engine.events.emit("plugin:uninstalled", {
            name,
            version,
            type: "crypto"
          });
        }
        engine.logger?.info(`${name} plugin uninstalled successfully`);
      } catch (error) {
        const engine = context.engine || context;
        if (engine && engine.logger && typeof engine.logger.error === "function") {
          engine.logger.error(`Failed to uninstall ${name} plugin:`, error);
        } else {
          console.error(`Failed to uninstall ${name} plugin:`, error);
        }
        throw error;
      }
    }
  };
}
function createDefaultCryptoEnginePlugin() {
  return createCryptoEnginePlugin(defaultConfig);
}
function createPerformanceCryptoEnginePlugin(options) {
  return createCryptoEnginePlugin({
    ...defaultConfig,
    enablePerformanceMonitoring: true,
    config: {
      ...defaultConfig.config,
      defaultAESKeySize: 256,
      defaultRSAKeySize: 4096
    },
    ...options
  });
}
function createDebugCryptoEnginePlugin(options) {
  return createCryptoEnginePlugin({
    ...defaultConfig,
    debug: true,
    enablePerformanceMonitoring: true,
    ...options
  });
}
var plugin = {
  createCryptoEnginePlugin,
  createDefaultCryptoEnginePlugin,
  createPerformanceCryptoEnginePlugin,
  createDebugCryptoEnginePlugin
};

export { createCryptoEnginePlugin, createDebugCryptoEnginePlugin, createDefaultCryptoEnginePlugin, createPerformanceCryptoEnginePlugin, createCryptoEnginePlugin as cryptoEnginePlugin, plugin as default };
//# sourceMappingURL=plugin.js.map
