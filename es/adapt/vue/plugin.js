/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { digitalSignature, keyGenerator, decrypt, encrypt } from '../../core/index.js';
import { useCrypto } from './composables/useCrypto.js';
import 'vue';
import { useHash } from './composables/useHash.js';
import { useSignature } from './composables/useSignature.js';
import { hex, base64, encoding } from '../../algorithms/encoding.js';
import { aes } from '../../algorithms/aes.js';
import 'crypto-js';
import '../../utils/errors.js';
import '../../utils/key-derivation.js';
import '../../utils/object-pool.js';
import '../../utils/performance-logger.js';
import { hmac, hash } from '../../algorithms/hash.js';
import { rsa } from '../../algorithms/rsa.js';

function createGlobalCrypto(_options) {
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
    // Composition API
    useCrypto,
    useHash,
    useSignature
  };
}
const CryptoPlugin = {
  install(app, options = {}) {
    const { globalPropertyName = "$crypto", registerComposables = true, config = {} } = options;
    const globalCrypto = createGlobalCrypto();
    app.config.globalProperties[globalPropertyName] = globalCrypto;
    app.provide("crypto", globalCrypto);
    app.provide("cryptoConfig", config);
    if (registerComposables) {
      app.config.globalProperties.$useCrypto = useCrypto;
      app.config.globalProperties.$useHash = useHash;
      app.config.globalProperties.$useSignature = useSignature;
    }
    if (
      // eslint-disable-next-line node/prefer-global/process
      typeof process !== "undefined" && process.env?.NODE_ENV === "development"
    ) {
      console.info("[LDesign Crypto] Plugin installed successfully");
      console.info("[LDesign Crypto] Global property:", globalPropertyName);
      console.info("[LDesign Crypto] Config:", config);
    }
  }
};
function installCrypto(app, options) {
  app.use(CryptoPlugin, options);
}
function createCryptoPlugin(options) {
  return {
    install(app) {
      app.use(CryptoPlugin, options);
    }
  };
}

export { CryptoPlugin, createCryptoPlugin, CryptoPlugin as default, installCrypto };
//# sourceMappingURL=plugin.js.map
