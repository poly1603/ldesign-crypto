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

var node_buffer = require('node:buffer');
var CryptoJS = require('crypto-js');
var aes = require('../algorithms/aes.cjs');
var kdf = require('../algorithms/kdf.cjs');

class KeyManager {
  constructor(options = {}) {
    this.keys = /* @__PURE__ */ new Map();
    this.masterKey = null;
    this.rotationTimers = /* @__PURE__ */ new Map();
    this.options = {
      type: "memory",
      encrypted: true,
      kdfAlgorithm: "argon2",
      autoRotation: false,
      rotationInterval: 90,
      ...options
    };
    this.kdfManager = new kdf.KDFManager();
    if (this.options.type !== "memory") {
      this.loadKeysFromStorage();
    }
  }
  /**
   * 通过口令派生并初始化主密钥（向后兼容别名）
   * 等价于 initializeMasterKey，但保留 name 参数以兼容现有调用方（仅用于标记用途）。
   * @param password 用于派生主密钥的口令
   * @param name 可选的主密钥标识标签（用于存储标记，不参与派生）
   */
  async deriveKeyFromPassword(password, name) {
    await this.initializeMasterKey(password);
    if (name && this.options.type !== "memory") {
      await this.saveToStorage("master_label", name);
    }
  }
  /**
   * 初始化主密钥
   */
  async initializeMasterKey(password) {
    const salt = this.generateSalt();
    const derivedKey = await this.kdfManager.deriveKey(password, salt, this.options.kdfAlgorithm, {
      keyLength: 32,
      ...this.options.kdfParams
    });
    this.masterKey = derivedKey.key;
    if (this.options.type !== "memory") {
      this.saveToStorage("master_salt", salt);
    }
  }
  /**
   * 生成新密钥
   */
  async generateKey(options) {
    const keyId = this.generateKeyId();
    let keyMaterial;
    switch (options.algorithm) {
      case "AES":
        keyMaterial = this.generateRandomKey(options.keySize || 256);
        break;
      case "RSA":
        keyMaterial = await this.generateRSAKey(options.keySize || 2048);
        break;
      case "ECDSA":
        keyMaterial = await this.generateECDSAKey("P-256");
        break;
      case "Ed25519":
        keyMaterial = await this.generateEd25519Key();
        break;
      default:
        throw new Error(`Unsupported algorithm: ${options.algorithm}`);
    }
    const metadata = {
      id: keyId,
      name: options.name,
      algorithm: options.algorithm,
      purpose: options.purpose,
      created: /* @__PURE__ */ new Date(),
      expires: options.expires,
      version: 1,
      tags: options.tags || [],
      permissions: options.permissions || this.getDefaultPermissions(options.purpose)
    };
    if (this.options.encrypted && this.masterKey) {
      const encrypted = await this.encryptKey(keyMaterial);
      this.keys.set(keyId, {
        key: encrypted.key,
        metadata,
        encrypted: true,
        salt: encrypted.salt,
        iv: encrypted.iv
      });
    } else {
      this.keys.set(keyId, {
        key: keyMaterial,
        metadata,
        encrypted: false
      });
    }
    if (this.options.autoRotation) {
      this.scheduleKeyRotation(keyId);
    }
    if (this.options.type !== "memory") {
      await this.saveKeyToStorage(keyId);
    }
    return keyId;
  }
  /**
   * 获取密钥
   */
  async getKey(keyId, operation) {
    const keyMaterial = this.keys.get(keyId);
    if (!keyMaterial) {
      return null;
    }
    if (operation && !this.checkPermission(keyMaterial.metadata, operation)) {
      throw new Error(`Operation '${operation}' not allowed for key ${keyId}`);
    }
    if (keyMaterial.metadata.expires && /* @__PURE__ */ new Date() > keyMaterial.metadata.expires) {
      throw new Error(`Key ${keyId} has expired`);
    }
    if (keyMaterial.encrypted && this.masterKey) {
      return await this.decryptKey(keyMaterial);
    }
    return keyMaterial.key;
  }
  /**
   * 轮换密钥
   */
  async rotateKey(keyId) {
    const oldKeyMaterial = this.keys.get(keyId);
    if (!oldKeyMaterial) {
      throw new Error(`Key ${keyId} not found`);
    }
    const newKeyMaterial = this.generateRandomKey(256);
    const newKeyId = this.generateKeyId();
    const newMetadata = {
      ...oldKeyMaterial.metadata,
      id: newKeyId,
      created: /* @__PURE__ */ new Date(),
      rotated: /* @__PURE__ */ new Date(),
      version: oldKeyMaterial.metadata.version + 1
    };
    if (this.options.encrypted && this.masterKey) {
      const encrypted = await this.encryptKey(newKeyMaterial);
      this.keys.set(newKeyId, {
        key: encrypted.key,
        metadata: newMetadata,
        encrypted: true,
        salt: encrypted.salt,
        iv: encrypted.iv
      });
    } else {
      this.keys.set(newKeyId, {
        key: newKeyMaterial,
        metadata: newMetadata,
        encrypted: false
      });
    }
    oldKeyMaterial.metadata.rotated = /* @__PURE__ */ new Date();
    if (this.options.autoRotation) {
      this.scheduleKeyRotation(newKeyId);
    }
    if (this.options.type !== "memory") {
      await this.saveKeyToStorage(newKeyId);
    }
    return newKeyId;
  }
  /**
   * 删除密钥
   */
  async deleteKey(keyId) {
    const exists = this.keys.has(keyId);
    if (!exists) {
      return false;
    }
    const timer = this.rotationTimers.get(keyId);
    if (timer) {
      clearTimeout(timer);
      this.rotationTimers.delete(keyId);
    }
    this.keys.delete(keyId);
    if (this.options.type !== "memory") {
      await this.removeFromStorage(keyId);
    }
    return true;
  }
  /**
   * 列出所有密钥
   */
  listKeys(filter) {
    const keys = [];
    const now = /* @__PURE__ */ new Date();
    for (const [, keyMaterial] of this.keys) {
      const metadata = keyMaterial.metadata;
      if (!filter?.includeExpired && metadata.expires && now > metadata.expires) {
        continue;
      }
      if (filter?.purpose && metadata.purpose !== filter.purpose) {
        continue;
      }
      if (filter?.algorithm && metadata.algorithm !== filter.algorithm) {
        continue;
      }
      if (filter?.tags && filter.tags.length > 0) {
        const hasAllTags = filter.tags.every((tag) => metadata.tags.includes(tag));
        if (!hasAllTags) {
          continue;
        }
      }
      keys.push({ ...metadata });
    }
    return keys;
  }
  /**
   * 导出密钥
   */
  async exportKey(keyId, format = "raw") {
    const key = await this.getKey(keyId);
    if (!key) {
      throw new Error(`Key ${keyId} not found`);
    }
    const keyMaterial = this.keys.get(keyId);
    if (!keyMaterial) {
      throw new Error(`Key material for ${keyId} not found`);
    }
    switch (format) {
      case "raw":
        return key;
      case "jwk":
        return this.convertToJWK(key, keyMaterial.metadata);
      case "pem":
        return this.convertToPEM(key, keyMaterial.metadata);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  /**
   * 导入密钥
   */
  async importKey(keyData, format, metadata) {
    const keyId = this.generateKeyId();
    let keyMaterial;
    switch (format) {
      case "raw":
        keyMaterial = keyData;
        break;
      case "jwk":
        keyMaterial = this.parseJWK(keyData);
        break;
      case "pem":
        keyMaterial = this.parsePEM(keyData);
        break;
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
    const fullMetadata = {
      ...metadata,
      id: keyId,
      created: /* @__PURE__ */ new Date(),
      version: 1
    };
    if (this.options.encrypted && this.masterKey) {
      const encrypted = await this.encryptKey(keyMaterial);
      this.keys.set(keyId, {
        key: encrypted.key,
        metadata: fullMetadata,
        encrypted: true,
        salt: encrypted.salt,
        iv: encrypted.iv
      });
    } else {
      this.keys.set(keyId, {
        key: keyMaterial,
        metadata: fullMetadata,
        encrypted: false
      });
    }
    if (this.options.type !== "memory") {
      await this.saveKeyToStorage(keyId);
    }
    return keyId;
  }
  /**
   * 备份所有密钥
   */
  async backup(password) {
    const backup = {
      version: "1.0",
      created: (/* @__PURE__ */ new Date()).toISOString(),
      keys: []
    };
    for (const [keyId, keyMaterial] of this.keys) {
      const key = await this.getKey(keyId);
      if (key) {
        backup.keys.push({
          id: keyId,
          key,
          metadata: keyMaterial.metadata
        });
      }
    }
    const json = JSON.stringify(backup);
    if (password) {
      const encrypted = aes.aes.encrypt(json, password);
      if (!encrypted.success) {
        throw new Error("Failed to encrypt backup");
      }
      return `${encrypted.iv}:${encrypted.data}`;
    }
    return json;
  }
  /**
   * 恢复备份
   */
  async restore(backupData, password) {
    let json;
    if (password) {
      const parts = backupData.split(":");
      if (parts.length === 2) {
        const [iv, encryptedData] = parts;
        const decrypted = aes.aes.decrypt(encryptedData, password, { iv });
        if (!decrypted.success || !decrypted.data) {
          throw new Error("Failed to decrypt backup");
        }
        json = decrypted.data;
      } else {
        const decrypted = aes.aes.decrypt(backupData, password);
        if (!decrypted.success || !decrypted.data) {
          throw new Error("Failed to decrypt backup");
        }
        json = decrypted.data;
      }
    } else {
      json = backupData;
    }
    const backup = JSON.parse(json);
    let restored = 0;
    for (const item of backup.keys) {
      if (this.options.encrypted && this.masterKey) {
        const encrypted = await this.encryptKey(item.key);
        this.keys.set(item.id, {
          key: encrypted.key,
          metadata: item.metadata,
          encrypted: true,
          salt: encrypted.salt,
          iv: encrypted.iv
        });
      } else {
        this.keys.set(item.id, {
          key: item.key,
          metadata: item.metadata,
          encrypted: false
        });
      }
      restored++;
    }
    if (this.options.type !== "memory") {
      for (const [keyId] of this.keys) {
        await this.saveKeyToStorage(keyId);
      }
    }
    return restored;
  }
  /**
   * 清理过期密钥
   */
  cleanupExpiredKeys() {
    const now = /* @__PURE__ */ new Date();
    let cleaned = 0;
    for (const [keyId, keyMaterial] of this.keys) {
      if (keyMaterial.metadata.expires && now > keyMaterial.metadata.expires) {
        this.deleteKey(keyId);
        cleaned++;
      }
    }
    return cleaned;
  }
  // 私有方法
  generateKeyId() {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  generateSalt() {
    return CryptoJS.lib.WordArray.random(128 / 8).toString();
  }
  generateRandomKey(bits) {
    return CryptoJS.lib.WordArray.random(bits / 8).toString();
  }
  async generateRSAKey(keySize) {
    return this.generateRandomKey(keySize / 8);
  }
  async generateECDSAKey(_curve) {
    return this.generateRandomKey(256);
  }
  async generateEd25519Key() {
    return this.generateRandomKey(256);
  }
  async encryptKey(key) {
    if (!this.masterKey) {
      throw new Error("Master key not initialized");
    }
    const iv = CryptoJS.lib.WordArray.random(128 / 8).toString();
    const salt = this.generateSalt();
    const encrypted = aes.aes.encrypt(key, this.masterKey, {
      keySize: 256,
      iv
    });
    if (!encrypted.data) {
      throw new Error("Failed to encrypt key - no data returned");
    }
    return {
      key: encrypted.data,
      salt,
      iv
    };
  }
  async decryptKey(keyMaterial) {
    if (!this.masterKey) {
      throw new Error("Master key not initialized");
    }
    const decrypted = aes.aes.decrypt(keyMaterial.key, this.masterKey, {
      keySize: 256,
      iv: keyMaterial.iv
    });
    if (!decrypted.success || !decrypted.data) {
      throw new Error("Failed to decrypt key");
    }
    return decrypted.data;
  }
  getDefaultPermissions(purpose) {
    switch (purpose) {
      case "encryption":
        return [
          { operation: "encrypt", allowed: true },
          { operation: "decrypt", allowed: true }
        ];
      case "signing":
        return [
          { operation: "sign", allowed: true },
          { operation: "verify", allowed: true }
        ];
      case "key-derivation":
        return [
          { operation: "derive", allowed: true }
        ];
      case "authentication":
        return [
          { operation: "sign", allowed: true },
          { operation: "verify", allowed: true }
        ];
      default:
        return [];
    }
  }
  checkPermission(metadata, operation) {
    const permission = metadata.permissions.find((p) => p.operation === operation);
    if (!permission || !permission.allowed) {
      return false;
    }
    if (permission.conditions) {
      const now = /* @__PURE__ */ new Date();
      if (permission.conditions.timeWindow) {
        if (now < permission.conditions.timeWindow.start || now > permission.conditions.timeWindow.end) {
          return false;
        }
      }
    }
    return true;
  }
  scheduleKeyRotation(keyId) {
    const existingTimer = this.rotationTimers.get(keyId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = setTimeout(() => {
      this.rotateKey(keyId).catch(console.error);
    }, this.options.rotationInterval * 24 * 60 * 60 * 1e3);
    this.rotationTimers.set(keyId, timer);
  }
  convertToJWK(key, metadata) {
    const jwk = {
      kty: metadata.algorithm === "RSA" ? "RSA" : "oct",
      kid: metadata.id,
      use: metadata.purpose === "encryption" ? "enc" : "sig",
      alg: metadata.algorithm,
      k: node_buffer.Buffer.from(key).toString("base64url")
    };
    return JSON.stringify(jwk);
  }
  convertToPEM(key, metadata) {
    const base64 = node_buffer.Buffer.from(key).toString("base64");
    const type = metadata.purpose === "encryption" ? "ENCRYPTED PRIVATE KEY" : "PRIVATE KEY";
    return `-----BEGIN ${type}-----
${base64}
-----END ${type}-----`;
  }
  parseJWK(jwkString) {
    const jwk = JSON.parse(jwkString);
    return node_buffer.Buffer.from(jwk.k, "base64url").toString();
  }
  parsePEM(pem) {
    const base64 = pem.replace(/-----BEGIN.*-----/, "").replace(/-----END.*-----/, "").replace(/\s/g, "");
    return node_buffer.Buffer.from(base64, "base64").toString();
  }
  // 存储相关方法
  async loadKeysFromStorage() {
  }
  async saveKeyToStorage(_keyId) {
  }
  async saveToStorage(_key, _value) {
  }
  async removeFromStorage(_keyId) {
  }
  /**
   * 销毁管理器
   */
  destroy() {
    for (const timer of this.rotationTimers.values()) {
      clearTimeout(timer);
    }
    this.rotationTimers.clear();
    this.keys.clear();
    this.masterKey = null;
  }
}
const keyManager = new KeyManager({
  type: "memory",
  encrypted: true,
  kdfAlgorithm: "argon2",
  autoRotation: true,
  rotationInterval: 90
});

exports.KeyManager = KeyManager;
exports.keyManager = keyManager;
//# sourceMappingURL=key-manager.cjs.map
