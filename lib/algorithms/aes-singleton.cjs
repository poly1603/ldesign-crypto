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

var aes = require('./aes.cjs');

class AESEncryptorSingleton {
  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new aes.AESEncryptor();
    }
    return this.instance;
  }
  /**
   * 重置单例（主要用于测试）
   */
  static resetInstance() {
    this.instance = null;
  }
}
AESEncryptorSingleton.instance = null;
const aesOptimized = {
  encrypt: AESEncryptorSingleton.getInstance().encrypt.bind(AESEncryptorSingleton.getInstance()),
  decrypt: AESEncryptorSingleton.getInstance().decrypt.bind(AESEncryptorSingleton.getInstance()),
  generateKey: async (length = 32) => {
    const { RandomUtils } = await Promise.resolve().then(function () { return require('../utils/index.cjs'); });
    return RandomUtils.generateKey(length);
  }
};

exports.aesOptimized = aesOptimized;
//# sourceMappingURL=aes-singleton.cjs.map
