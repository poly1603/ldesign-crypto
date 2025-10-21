/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import forge from 'node-forge';
import { CONSTANTS, ErrorUtils, ValidationUtils } from '../utils/index.js';

class RSAEncryptor {
  constructor() {
    this.defaultOptions = {
      keyFormat: "pkcs1",
      keySize: CONSTANTS.RSA.DEFAULT_KEY_SIZE,
      padding: "OAEP"
    };
    this.keyPairCache = /* @__PURE__ */ new Map();
    this.publicKeyCache = /* @__PURE__ */ new Map();
    this.privateKeyCache = /* @__PURE__ */ new Map();
    this.maxKeyCacheSize = 50;
  }
  /**
   * 生成 RSA 密钥对
   */
  generateKeyPair(keySize = CONSTANTS.RSA.DEFAULT_KEY_SIZE) {
    try {
      if (!CONSTANTS.RSA.KEY_SIZES.includes(keySize)) {
        throw ErrorUtils.createEncryptionError(`Unsupported RSA key size: ${keySize}`, "RSA");
      }
      const keypair = forge.pki.rsa.generateKeyPair({ bits: keySize });
      return {
        publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
        privateKey: forge.pki.privateKeyToPem(keypair.privateKey)
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw ErrorUtils.createEncryptionError("Failed to generate RSA key pair", "RSA");
    }
  }
  /**
   * RSA 公钥加密
   */
  encrypt(data, publicKey, options = {}) {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError("Data cannot be empty", "RSA");
      }
      if (ValidationUtils.isEmpty(publicKey)) {
        throw ErrorUtils.createEncryptionError("Public key cannot be empty", "RSA");
      }
      const opts = { ...this.defaultOptions, ...options };
      const publicKeyObj = this.parsePublicKey(publicKey);
      const paddingScheme = this.getPaddingScheme(opts.padding);
      const encrypted = publicKeyObj.encrypt(data, paddingScheme);
      const encryptedBase64 = forge.util.encode64(encrypted);
      return {
        success: true,
        data: encryptedBase64,
        algorithm: `RSA-${opts.keySize}`
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw ErrorUtils.createEncryptionError("Unknown encryption error", "RSA");
    }
  }
  /**
   * RSA 私钥解密
   */
  decrypt(encryptedData, privateKey, options = {}) {
    const opts = { ...this.defaultOptions, ...options };
    try {
      if (ValidationUtils.isEmpty(privateKey)) {
        throw ErrorUtils.createDecryptionError("Private key cannot be empty", "RSA");
      }
      let ciphertext;
      if (typeof encryptedData === "string") {
        ciphertext = encryptedData;
      } else {
        ciphertext = encryptedData.data || "";
      }
      const privateKeyObj = this.parsePrivateKey(privateKey);
      const paddingScheme = this.getPaddingScheme(opts.padding);
      const encryptedBytes = forge.util.decode64(ciphertext);
      const decrypted = privateKeyObj.decrypt(encryptedBytes, paddingScheme);
      return {
        success: true,
        data: decrypted,
        algorithm: `RSA-${opts.keySize}`
      };
    } catch (error) {
      const algorithmName = `RSA-${opts.keySize}`;
      if (error instanceof Error) {
        return {
          success: false,
          data: "",
          algorithm: algorithmName,
          error: error.message
        };
      }
      return {
        success: false,
        data: "",
        algorithm: algorithmName,
        error: "Unknown decryption error"
      };
    }
  }
  /**
   * RSA 签名
   */
  sign(data, privateKey, algorithm = "sha256") {
    try {
      if (ValidationUtils.isEmpty(data)) {
        throw ErrorUtils.createEncryptionError("Data cannot be empty", "RSA");
      }
      if (ValidationUtils.isEmpty(privateKey)) {
        throw ErrorUtils.createEncryptionError("Private key cannot be empty", "RSA");
      }
      const privateKeyObj = this.parsePrivateKey(privateKey);
      const md = this.getMessageDigest(algorithm);
      md.update(data, "utf8");
      const signature = privateKeyObj.sign(md);
      return forge.util.encode64(signature);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw ErrorUtils.createEncryptionError("Failed to sign data", "RSA");
    }
  }
  /**
   * RSA 验证签名
   */
  verify(data, signature, publicKey, algorithm = "sha256") {
    try {
      if (ValidationUtils.isEmpty(data) || ValidationUtils.isEmpty(signature) || ValidationUtils.isEmpty(publicKey)) {
        return false;
      }
      const publicKeyObj = this.parsePublicKey(publicKey);
      const md = this.getMessageDigest(algorithm);
      md.update(data, "utf8");
      const signatureBytes = forge.util.decode64(signature);
      return publicKeyObj.verify(md.digest().bytes(), signatureBytes);
    } catch {
      return false;
    }
  }
  /**
   * 解析公钥
   */
  parsePublicKey(publicKey) {
    try {
      if (publicKey.includes("-----BEGIN")) {
        return forge.pki.publicKeyFromPem(publicKey);
      }
      const pemKey = `-----BEGIN PUBLIC KEY-----
${publicKey}
-----END PUBLIC KEY-----`;
      return forge.pki.publicKeyFromPem(pemKey);
    } catch {
      throw ErrorUtils.createEncryptionError("Invalid public key format", "RSA");
    }
  }
  /**
   * 解析私钥
   */
  parsePrivateKey(privateKey) {
    try {
      if (privateKey.includes("-----BEGIN")) {
        return forge.pki.privateKeyFromPem(privateKey);
      }
      const pemKey = `-----BEGIN PRIVATE KEY-----
${privateKey}
-----END PRIVATE KEY-----`;
      return forge.pki.privateKeyFromPem(pemKey);
    } catch {
      throw ErrorUtils.createDecryptionError("Invalid private key format", "RSA");
    }
  }
  /**
   * 获取填充方案
   */
  getPaddingScheme(padding) {
    switch (padding.toUpperCase()) {
      case "OAEP":
        return "RSA-OAEP";
      case "PKCS1":
        return "RSAES-PKCS1-V1_5";
      default:
        return "RSA-OAEP";
    }
  }
  getMessageDigest(algorithm) {
    const alg = algorithm.toLowerCase();
    switch (alg) {
      case "sha1":
        return forge.md.sha1.create();
      case "sha256":
        return forge.md.sha256.create();
      case "sha512":
        return forge.md.sha512.create();
      default:
        return forge.md.sha256.create();
    }
  }
  /**
   * 缓存公钥
   */
  cachePublicKey(keyString, publicKey) {
    if (this.publicKeyCache.size >= this.maxKeyCacheSize) {
      const firstKey = this.publicKeyCache.keys().next().value;
      if (firstKey) {
        this.publicKeyCache.delete(firstKey);
      }
    }
    this.publicKeyCache.set(keyString, publicKey);
  }
  /**
   * 缓存私钥
   */
  cachePrivateKey(keyString, privateKey) {
    if (this.privateKeyCache.size >= this.maxKeyCacheSize) {
      const firstKey = this.privateKeyCache.keys().next().value;
      if (firstKey) {
        this.privateKeyCache.delete(firstKey);
      }
    }
    this.privateKeyCache.set(keyString, privateKey);
  }
  /**
   * 获取缓存的公钥或解析新的公钥
   */
  getPublicKey(keyString) {
    const cached = this.publicKeyCache.get(keyString);
    if (cached) {
      return cached;
    }
    const publicKey = forge.pki.publicKeyFromPem(keyString);
    this.cachePublicKey(keyString, publicKey);
    return publicKey;
  }
  /**
   * 获取缓存的私钥或解析新的私钥
   */
  getPrivateKey(keyString) {
    const cached = this.privateKeyCache.get(keyString);
    if (cached) {
      return cached;
    }
    const privateKey = forge.pki.privateKeyFromPem(keyString);
    this.cachePrivateKey(keyString, privateKey);
    return privateKey;
  }
  /**
   * 清除密钥缓存
   */
  clearKeyCache() {
    this.keyPairCache.clear();
    this.publicKeyCache.clear();
    this.privateKeyCache.clear();
  }
}
const rsa = {
  /**
   * 生成 RSA 密钥对
   */
  generateKeyPair: (keySize) => {
    const encryptor = new RSAEncryptor();
    return encryptor.generateKeyPair(keySize);
  },
  /**
   * RSA 公钥加密
   */
  encrypt: (data, publicKey, options) => {
    const encryptor = new RSAEncryptor();
    return encryptor.encrypt(data, publicKey, options);
  },
  /**
   * RSA 私钥解密
   */
  decrypt: (encryptedData, privateKey, options) => {
    const encryptor = new RSAEncryptor();
    return encryptor.decrypt(encryptedData, privateKey, options);
  },
  /**
   * RSA 签名
   */
  sign: (data, privateKey, algorithm) => {
    const encryptor = new RSAEncryptor();
    return encryptor.sign(data, privateKey, algorithm);
  },
  /**
   * RSA 验证签名
   */
  verify: (data, signature, publicKey, algorithm) => {
    const encryptor = new RSAEncryptor();
    return encryptor.verify(data, signature, publicKey, algorithm);
  }
};

export { RSAEncryptor, rsa };
//# sourceMappingURL=rsa.js.map
