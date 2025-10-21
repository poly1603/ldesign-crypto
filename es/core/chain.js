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
import { blowfish } from '../algorithms/blowfish.js';
import { des } from '../algorithms/des.js';
import { encoding } from '../algorithms/encoding.js';
import { Hasher } from '../algorithms/hash.js';
import { rsa } from '../algorithms/rsa.js';
import { des3 } from '../algorithms/tripledes.js';
import { ErrorUtils } from '../utils/index.js';

class CryptoChain {
  constructor(data) {
    this.errorOccurred = false;
    this.resultCache = /* @__PURE__ */ new WeakMap();
    this.data = data;
  }
  encrypt(algorithm, key, options) {
    if (this.errorOccurred)
      return this;
    try {
      const text = this.getStringData();
      let result;
      switch (algorithm.toUpperCase()) {
        case "AES":
          result = aes.encrypt(text, key, options);
          break;
        case "RSA":
          result = rsa.encrypt(text, key, options);
          break;
        case "DES":
          result = des.encrypt(text, key, options);
          break;
        case "3DES":
          result = des3.encrypt(text, key, options);
          break;
        case "BLOWFISH":
          result = blowfish.encrypt(text, key, options);
          break;
        default:
          throw ErrorUtils.createEncryptionError(`Unsupported algorithm: ${algorithm}`, "CHAIN");
      }
      if (!result.success) {
        throw new Error(result.error || "Encryption failed");
      }
      this.data = result;
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  decrypt(algorithm, key, options) {
    if (this.errorOccurred)
      return this;
    try {
      let result;
      switch (algorithm.toUpperCase()) {
        case "AES":
          result = aes.decrypt(this.data, key, options);
          break;
        case "RSA":
          result = rsa.decrypt(this.data, key, options);
          break;
        case "DES":
          result = des.decrypt(this.data, key, options);
          break;
        case "3DES":
          result = des3.decrypt(this.data, key, options);
          break;
        case "BLOWFISH":
          result = blowfish.decrypt(this.data, key, options);
          break;
        default:
          throw ErrorUtils.createDecryptionError(`Unsupported algorithm: ${algorithm}`, "CHAIN");
      }
      if (!result.success || !result.data) {
        throw new Error(result.error || "Decryption failed");
      }
      this.data = result.data;
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * 哈希数据
   */
  hash(algorithm = "SHA256") {
    if (this.errorOccurred)
      return this;
    try {
      const hasher = new Hasher();
      const text = this.getStringData();
      const result = hasher.hash(text, algorithm);
      if (!result.success) {
        throw new Error(result.error || "Hashing failed");
      }
      this.data = result.hash;
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * Base64 编码
   */
  base64() {
    if (this.errorOccurred)
      return this;
    try {
      const text = this.getStringData();
      this.data = encoding.encode(text, "base64");
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * Base64 解码
   */
  fromBase64() {
    if (this.errorOccurred)
      return this;
    try {
      const text = this.getStringData();
      this.data = encoding.decode(text, "base64");
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * Hex 编码
   */
  hex() {
    if (this.errorOccurred)
      return this;
    try {
      const text = this.getStringData();
      this.data = encoding.encode(text, "hex");
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * Hex 解码
   */
  fromHex() {
    if (this.errorOccurred)
      return this;
    try {
      const text = this.getStringData();
      this.data = encoding.decode(text, "hex");
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * 转大写
   */
  toUpperCase() {
    if (this.errorOccurred)
      return this;
    try {
      const text = this.getStringData();
      this.data = text.toUpperCase();
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * 转小写
   */
  toLowerCase() {
    if (this.errorOccurred)
      return this;
    try {
      const text = this.getStringData();
      this.data = text.toLowerCase();
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * JSON 序列化
   */
  toJSON(obj) {
    if (this.errorOccurred)
      return this;
    try {
      this.data = JSON.stringify(obj);
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * JSON 反序列化
   */
  fromJSON() {
    if (this.errorOccurred) {
      throw this.lastError || new Error("Chain execution failed");
    }
    try {
      const text = this.getStringData();
      return JSON.parse(text);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  /**
   * 执行链式操作，返回最终结果
   */
  execute() {
    if (this.errorOccurred) {
      throw this.lastError || new Error("Chain execution failed");
    }
    return this.getStringData();
  }
  /**
   * 执行链式操作，返回 EncryptResult
   */
  executeAsResult() {
    if (this.errorOccurred) {
      throw this.lastError || new Error("Chain execution failed");
    }
    return this.data;
  }
  /**
   * 获取当前错误
   */
  getError() {
    return this.lastError;
  }
  /**
   * 检查是否发生错误
   */
  hasError() {
    return this.errorOccurred;
  }
  /**
   * 清除错误状态，继续执行链
   */
  clearError() {
    this.errorOccurred = false;
    this.lastError = void 0;
    return this;
  }
  /**
   * 条件执行
   */
  if(condition, fn) {
    if (condition && !this.errorOccurred) {
      return fn(this);
    }
    return this;
  }
  /**
   * 自定义转换
   */
  transform(fn) {
    if (this.errorOccurred)
      return this;
    try {
      const text = this.getStringData();
      this.data = fn(text);
      return this;
    } catch (error) {
      this.handleError(error);
      return this;
    }
  }
  /**
   * 获取字符串形式的数据
   */
  getStringData() {
    if (typeof this.data === "string") {
      return this.data;
    }
    return this.data.data || "";
  }
  /**
   * 处理错误（优化内存使用）
   */
  handleError(error) {
    this.errorOccurred = true;
    const message = error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500);
    this.lastError = new Error(message);
  }
  /**
   * 清理内部状态，释放内存
   */
  dispose() {
    if (typeof this.data === "string") {
      this.data = "";
    } else if (this.data && typeof this.data === "object") {
      this.data.data = "";
    }
    this.lastError = void 0;
    this.resultCache = /* @__PURE__ */ new WeakMap();
  }
}
function chain(data) {
  return new CryptoChain(data);
}
function encryptToBase64(data, algorithm, key, options) {
  const chainInstance = chain(data);
  return chainInstance.encrypt(algorithm, key, options).base64().execute();
}
function decryptFromBase64(data, algorithm, key, options) {
  const chainInstance = chain(data).fromBase64();
  return chainInstance.decrypt(algorithm, key, options).execute();
}
function encryptJSON(obj, algorithm, key, options) {
  const chainInstance = chain(JSON.stringify(obj));
  return chainInstance.encrypt(algorithm, key, options).base64().execute();
}
function decryptJSON(data, algorithm, key, options) {
  const chainInstance = chain(data).fromBase64();
  const decrypted = chainInstance.decrypt(algorithm, key, options).execute();
  return JSON.parse(decrypted);
}
function hashPassword(password, iterations = 1e4) {
  let chainInstance = chain(password);
  const batchSize = 100;
  for (let i = 0; i < iterations; i += batchSize) {
    const count = Math.min(batchSize, iterations - i);
    for (let j = 0; j < count; j++) {
      chainInstance = chainInstance.hash("SHA256");
    }
    if (i % 1e3 === 0 && i > 0) {
      const intermediate = chainInstance.execute();
      chainInstance.dispose();
      chainInstance = chain(intermediate);
    }
  }
  const result = chainInstance.execute();
  chainInstance.dispose();
  return result;
}

export { CryptoChain, chain, decryptFromBase64, decryptJSON, encryptJSON, encryptToBase64, hashPassword };
//# sourceMappingURL=chain.js.map
