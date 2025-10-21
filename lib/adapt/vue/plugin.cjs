/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:49 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../../core/index.cjs');
var useCrypto = require('./composables/useCrypto.cjs');
require('vue');
var useHash = require('./composables/useHash.cjs');
var useSignature = require('./composables/useSignature.cjs');
var encoding = require('../../algorithms/encoding.cjs');
var aes = require('../../algorithms/aes.cjs');
require('crypto-js');
require('../../utils/errors.cjs');
require('../../utils/key-derivation.cjs');
require('../../utils/object-pool.cjs');
require('../../utils/performance-logger.cjs');
var hash = require('../../algorithms/hash.cjs');
var rsa = require('../../algorithms/rsa.cjs');

function createGlobalCrypto(_options) {
  return {
    // 核心功能
    encrypt: index.encrypt,
    decrypt: index.decrypt,
    hash: hash.hash,
    hmac: hash.hmac,
    keyGenerator: index.keyGenerator,
    digitalSignature: index.digitalSignature,
    // 算法实现
    aes: aes.aes,
    rsa: rsa.rsa,
    encoding: encoding.encoding,
    base64: encoding.base64,
    hex: encoding.hex,
    // Composition API
    useCrypto: useCrypto.useCrypto,
    useHash: useHash.useHash,
    useSignature: useSignature.useSignature
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
      app.config.globalProperties.$useCrypto = useCrypto.useCrypto;
      app.config.globalProperties.$useHash = useHash.useHash;
      app.config.globalProperties.$useSignature = useSignature.useSignature;
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

exports.CryptoPlugin = CryptoPlugin;
exports.createCryptoPlugin = createCryptoPlugin;
exports.default = CryptoPlugin;
exports.installCrypto = installCrypto;
//# sourceMappingURL=plugin.cjs.map
