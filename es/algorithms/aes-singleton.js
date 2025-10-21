/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { AESEncryptor } from './aes.js';

class AESEncryptorSingleton {
  /**
   * 获取单例实例
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new AESEncryptor();
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
    const { RandomUtils } = await import('../utils/index.js');
    return RandomUtils.generateKey(length);
  }
};

export { aesOptimized };
//# sourceMappingURL=aes-singleton.js.map
