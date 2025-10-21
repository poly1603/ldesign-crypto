/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { aes } from '../algorithms/aes.js';
import 'crypto-js';
import './errors.js';
import './key-derivation.js';
import './object-pool.js';
import './performance-logger.js';
import '../algorithms/encoding.js';
import 'node-forge';

class KeyRotation {
  constructor() {
    this.keys = /* @__PURE__ */ new Map();
  }
  /**
   * 添加密钥
   */
  addKey(version, key, expiresAt) {
    if (this.keys.has(version)) {
      throw new Error(`Key version '${version}' already exists`);
    }
    this.keys.set(version, {
      version,
      key,
      createdAt: /* @__PURE__ */ new Date(),
      active: false,
      deprecated: false,
      expiresAt
    });
  }
  /**
   * 设置激活密钥
   */
  setActiveKey(version) {
    const keyInfo = this.keys.get(version);
    if (!keyInfo) {
      throw new Error(`Key version '${version}' not found`);
    }
    if (this.activeKeyVersion) {
      const oldKey = this.keys.get(this.activeKeyVersion);
      if (oldKey) {
        oldKey.active = false;
      }
    }
    keyInfo.active = true;
    this.activeKeyVersion = version;
  }
  /**
   * 轮换密钥（添加新密钥并设为激活）
   */
  rotateKey(newVersion, newKey, expiresAt) {
    if (this.activeKeyVersion) {
      const oldKey = this.keys.get(this.activeKeyVersion);
      if (oldKey) {
        oldKey.deprecated = true;
      }
    }
    this.addKey(newVersion, newKey, expiresAt);
    this.setActiveKey(newVersion);
  }
  /**
   * 获取激活密钥
   */
  getActiveKey() {
    if (!this.activeKeyVersion) {
      return void 0;
    }
    return this.keys.get(this.activeKeyVersion);
  }
  /**
   * 获取密钥
   */
  getKey(version) {
    return this.keys.get(version);
  }
  /**
   * 获取所有密钥
   */
  getAllKeys() {
    return Array.from(this.keys.values());
  }
  /**
   * 删除密钥
   */
  removeKey(version) {
    if (version === this.activeKeyVersion) {
      throw new Error("Cannot remove active key");
    }
    return this.keys.delete(version);
  }
  /**
   * 清理过期密钥
   */
  cleanupExpiredKeys() {
    const now = /* @__PURE__ */ new Date();
    let count = 0;
    for (const [version, keyInfo] of this.keys.entries()) {
      if (keyInfo.expiresAt && keyInfo.expiresAt < now && !keyInfo.active) {
        this.keys.delete(version);
        count++;
      }
    }
    return count;
  }
  /**
   * 使用激活密钥加密数据
   */
  encrypt(data, _algorithm = "AES", options) {
    const activeKey = this.getActiveKey();
    if (!activeKey) {
      throw new Error("No active key set");
    }
    const result = aes.encrypt(data, activeKey.key, options);
    return {
      ...result,
      keyVersion: activeKey.version
    };
  }
  /**
   * 解密数据（自动选择正确的密钥版本）
   */
  decrypt(encryptedData, _algorithm = "AES", options) {
    let keyVersion;
    if (typeof encryptedData === "string") {
      try {
        const parsed = JSON.parse(encryptedData);
        keyVersion = parsed.keyVersion;
      } catch {
        throw new Error("Cannot determine key version from encrypted data");
      }
    } else {
      keyVersion = encryptedData.keyVersion;
    }
    const keyInfo = this.getKey(keyVersion);
    if (!keyInfo) {
      throw new Error(`Key version '${keyVersion}' not found`);
    }
    return aes.decrypt(encryptedData, keyInfo.key, options);
  }
  /**
   * 重新加密数据（使用新的激活密钥）
   */
  async reencryptData(encryptedData, algorithm = "AES", options) {
    try {
      const decrypted = this.decrypt(encryptedData, algorithm, options);
      if (!decrypted.success || !decrypted.data) {
        return {
          success: false,
          error: decrypted.error || "Decryption failed"
        };
      }
      const encrypted = this.encrypt(decrypted.data, algorithm, options);
      const oldKeyVersion = typeof encryptedData === "string" ? JSON.parse(encryptedData).keyVersion : encryptedData.keyVersion;
      return {
        success: true,
        newData: encrypted,
        oldKeyVersion,
        newKeyVersion: encrypted.keyVersion
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Reencryption failed"
      };
    }
  }
  /**
   * 批量重新加密数据
   */
  async reencryptBatch(dataList, algorithm = "AES", options) {
    const results = [];
    for (const data of dataList) {
      const result = await this.reencryptData(data, algorithm, options);
      results.push(result);
    }
    return results;
  }
  /**
   * 导出密钥配置
   */
  exportKeys() {
    const keysArray = Array.from(this.keys.values());
    return JSON.stringify({
      keys: keysArray,
      activeKeyVersion: this.activeKeyVersion
    });
  }
  /**
   * 导入密钥配置
   */
  importKeys(json) {
    const config = JSON.parse(json);
    this.keys.clear();
    for (const keyInfo of config.keys) {
      this.keys.set(keyInfo.version, {
        ...keyInfo,
        createdAt: new Date(keyInfo.createdAt),
        expiresAt: keyInfo.expiresAt ? new Date(keyInfo.expiresAt) : void 0
      });
    }
    this.activeKeyVersion = config.activeKeyVersion;
  }
}
function createKeyRotation() {
  return new KeyRotation();
}

export { KeyRotation, createKeyRotation };
//# sourceMappingURL=key-rotation.js.map
