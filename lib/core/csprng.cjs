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

class EntropyCollector {
  constructor() {
    this.entropy = [];
    this.mouseEntropy = [];
    this.keyboardEntropy = [];
    this.timeEntropy = [];
    this.collecting = false;
    this.collectMouseEntropy = (event) => {
      const entropy = (event.clientX ^ event.clientY) * Date.now();
      this.mouseEntropy.push(entropy);
      if (this.mouseEntropy.length > 256) {
        this.mouseEntropy.shift();
      }
    };
    this.collectKeyboardEntropy = (event) => {
      const entropy = event.keyCode * Date.now();
      this.keyboardEntropy.push(entropy);
      if (this.keyboardEntropy.length > 256) {
        this.keyboardEntropy.shift();
      }
    };
  }
  /**
   * 开始收集熵
   */
  startCollecting() {
    if (this.collecting) {
      return;
    }
    this.collecting = true;
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", this.collectMouseEntropy);
      window.addEventListener("keypress", this.collectKeyboardEntropy);
    }
    this.collectTimeEntropy();
  }
  /**
   * 停止收集熵
   */
  stopCollecting() {
    this.collecting = false;
    if (typeof window !== "undefined") {
      window.removeEventListener("mousemove", this.collectMouseEntropy);
      window.removeEventListener("keypress", this.collectKeyboardEntropy);
    }
  }
  /**
   * 收集时间熵
   */
  collectTimeEntropy() {
    const entropy = performance.now() * Date.now();
    this.timeEntropy.push(entropy);
    if (this.timeEntropy.length > 256) {
      this.timeEntropy.shift();
    }
    if (this.collecting) {
      setTimeout(() => this.collectTimeEntropy(), 100);
    }
  }
  /**
   * 获取收集的熵
   */
  getEntropy() {
    const allEntropy = [
      ...this.entropy,
      ...this.mouseEntropy,
      ...this.keyboardEntropy,
      ...this.timeEntropy
    ];
    let mixed = 0;
    for (const e of allEntropy) {
      mixed = mixed ^ e;
      mixed = mixed << 1 | mixed >>> 31;
    }
    const bytes = new Uint8Array(32);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = mixed >> i * 8 & 255;
      mixed = mixed << 3 | mixed >>> 29;
    }
    return bytes;
  }
  /**
   * 添加外部熵
   */
  addEntropy(data) {
    let entropy;
    if (typeof data === "string") {
      entropy = 0;
      for (let i = 0; i < data.length; i++) {
        entropy = (entropy << 5) - entropy + data.charCodeAt(i);
        entropy = entropy & entropy;
      }
    } else {
      entropy = 0;
      for (let i = 0; i < data.length; i++) {
        entropy = (entropy << 5) - entropy + data[i];
        entropy = entropy & entropy;
      }
    }
    this.entropy.push(entropy);
    if (this.entropy.length > 256) {
      this.entropy.shift();
    }
  }
  /**
   * 获取熵池质量
   */
  getEntropyQuality() {
    const totalEntropy = this.entropy.length + this.mouseEntropy.length + this.keyboardEntropy.length + this.timeEntropy.length;
    return Math.min(100, totalEntropy / 1024 * 100);
  }
}
class CSPRNG {
  constructor(config = {}) {
    this.counter = 0;
    this.lastReseed = 0;
    this.config = {
      entropySource: this.detectBestEntropySource(),
      seedLength: 32,
      useHardwareRNG: true,
      collectEntropy: true,
      reseedInterval: 1e4,
      ...config
    };
    this.seed = new Uint8Array(this.config?.seedLength);
    this.entropyCollector = new EntropyCollector();
    this.initializeSeed();
    if (this.config?.collectEntropy) {
      this.entropyCollector.startCollecting();
    }
  }
  /**
   * 检测最佳熵源
   */
  detectBestEntropySource() {
    if (typeof globalThis !== "undefined" && globalThis.crypto) {
      return "node";
    }
    if (typeof window !== "undefined" && window.crypto && typeof window.crypto.getRandomValues === "function") {
      return "webcrypto";
    }
    if (CryptoJS && CryptoJS.lib && CryptoJS.lib.WordArray) {
      return "crypto";
    }
    return "fallback";
  }
  /**
   * 初始化种子
   */
  initializeSeed() {
    switch (this.config?.entropySource) {
      case "node":
        if (typeof require !== "undefined") {
          try {
            const crypto = require("node:crypto");
            crypto.randomFillSync(this.seed);
          } catch {
            this.fallbackSeed();
          }
        } else {
          this.fallbackSeed();
        }
        break;
      case "webcrypto":
        if (typeof window !== "undefined" && window.crypto) {
          window.crypto.getRandomValues(this.seed);
        } else {
          this.fallbackSeed();
        }
        break;
      case "crypto": {
        const wordArray = CryptoJS.lib.WordArray.random(this.config?.seedLength);
        const words = wordArray.words;
        for (let i = 0; i < this.seed.length; i++) {
          this.seed[i] = words[Math.floor(i / 4)] >> (3 - i % 4) * 8 & 255;
        }
        break;
      }
      default:
        this.fallbackSeed();
    }
    if (this.config?.collectEntropy) {
      const entropy = this.entropyCollector.getEntropy();
      for (let i = 0; i < Math.min(entropy.length, this.seed.length); i++) {
        this.seed[i] ^= entropy[i];
      }
    }
  }
  /**
   * 回退种子生成
   */
  fallbackSeed() {
    const now = Date.now();
    const perf = typeof performance !== "undefined" ? performance.now() : 0;
    for (let i = 0; i < this.seed.length; i++) {
      const random1 = Math.random();
      const random2 = Math.random();
      const random3 = Math.random();
      const value = (now + i * 1e3) * (perf + i * 100) * (random1 + i) + random2 * 4294967296 + random3 * 65536 + i;
      this.seed[i] = Math.floor(value) & 255;
    }
  }
  /**
   * 生成随机字节
   */
  randomBytes(length) {
    const bytes = new Uint8Array(length);
    if (this.counter - this.lastReseed > this.config?.reseedInterval) {
      this.reseed();
    }
    switch (this.config?.entropySource) {
      case "node":
        if (typeof require !== "undefined") {
          try {
            const crypto = require("node:crypto");
            crypto.randomFillSync(bytes);
          } catch {
            this.fallbackRandomBytes(bytes);
          }
        } else {
          this.fallbackRandomBytes(bytes);
        }
        break;
      case "webcrypto":
        if (typeof window !== "undefined" && window.crypto) {
          window.crypto.getRandomValues(bytes);
        } else {
          this.fallbackRandomBytes(bytes);
        }
        break;
      case "crypto": {
        const wordArray = CryptoJS.lib.WordArray.random(length);
        const words = wordArray.words;
        for (let i = 0; i < length; i++) {
          bytes[i] = words[Math.floor(i / 4)] >> (3 - i % 4) * 8 & 255;
        }
        break;
      }
      default:
        this.fallbackRandomBytes(bytes);
    }
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] ^= this.seed[i % this.seed.length];
      bytes[i] ^= this.counter >> i % 4 * 8 & 255;
    }
    this.counter++;
    return bytes;
  }
  /**
   * 回退随机字节生成
   */
  fallbackRandomBytes(bytes) {
    let s0 = this.seed[0] | this.seed[1] << 8 | this.seed[2] << 16 | this.seed[3] << 24;
    let s1 = this.seed[4] | this.seed[5] << 8 | this.seed[6] << 16 | this.seed[7] << 24;
    if (s0 === 0 && s1 === 0) {
      s0 = 305419896;
      s1 = 2596069104;
    }
    for (let i = 0; i < bytes.length; i++) {
      let x = s0;
      const y = s1;
      s0 = y;
      x ^= x << 23;
      x ^= x >>> 17;
      x ^= y;
      x ^= y >>> 26;
      s1 = x;
      bytes[i] = s0 + s1 & 255;
    }
    this.seed[0] = s0 & 255;
    this.seed[1] = s0 >> 8 & 255;
    this.seed[2] = s0 >> 16 & 255;
    this.seed[3] = s0 >> 24 & 255;
    this.seed[4] = s1 & 255;
    this.seed[5] = s1 >> 8 & 255;
    this.seed[6] = s1 >> 16 & 255;
    this.seed[7] = s1 >> 24 & 255;
  }
  /**
   * 生成随机整数
   */
  randomInt(min, max) {
    if (min >= max) {
      throw new Error("min must be less than max");
    }
    const range = max - min;
    if (range === 1) {
      return min;
    }
    const bytesNeeded = Math.max(1, Math.ceil(Math.log2(range) / 8));
    const maxValue = 256 ** bytesNeeded;
    const threshold = maxValue - maxValue % range;
    let value;
    let attempts = 0;
    const maxAttempts = 1e3;
    do {
      if (attempts++ > maxAttempts) {
        const bytes2 = this.randomBytes(4);
        const fallbackValue = bytes2[0] << 24 | bytes2[1] << 16 | bytes2[2] << 8 | bytes2[3];
        return min + Math.abs(fallbackValue) % range;
      }
      const bytes = this.randomBytes(bytesNeeded);
      value = 0;
      for (let i = 0; i < bytesNeeded; i++) {
        value = value << 8 | bytes[i];
      }
    } while (value >= threshold);
    return min + value % range;
  }
  /**
   * 生成随机浮点数
   */
  randomFloat(min = 0, max = 1) {
    const bytes = this.randomBytes(8);
    const view = new DataView(bytes.buffer);
    const mantissa = view.getUint32(0) / 4294967296;
    return min + mantissa * (max - min);
  }
  /**
   * 生成随机字符串
   */
  randomString(length, charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
    let result = "";
    for (let i = 0; i < length; i++) {
      const index = this.randomInt(0, charset.length);
      result += charset[index];
    }
    return result;
  }
  /**
   * 生成随机十六进制字符串
   */
  randomHex(length) {
    const bytes = this.randomBytes(Math.ceil(length / 2));
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, length);
  }
  /**
   * 生成随机 Base64 字符串
   */
  randomBase64(length) {
    const bytes = this.randomBytes(Math.ceil(length * 3 / 4));
    if (typeof node_buffer.Buffer !== "undefined") {
      return node_buffer.Buffer.from(bytes).toString("base64").substring(0, length);
    } else {
      return btoa(String.fromCharCode.apply(null, Array.from(bytes))).substring(0, length);
    }
  }
  /**
   * 生成 UUID v4
   */
  randomUUID() {
    const bytes = this.randomBytes(16);
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join("-");
  }
  /**
   * 生成安全令牌
   */
  randomToken(length = 32) {
    return this.randomBase64(length).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  /**
   * 随机洗牌数组
   */
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  /**
   * 随机选择元素
   */
  choice(array) {
    if (array.length === 0) {
      throw new Error("Cannot choose from empty array");
    }
    return array[this.randomInt(0, array.length)];
  }
  /**
   * 随机选择多个元素
   */
  sample(array, count) {
    if (count > array.length) {
      throw new Error("Sample size cannot be larger than array length");
    }
    const indices = /* @__PURE__ */ new Set();
    while (indices.size < count) {
      indices.add(this.randomInt(0, array.length));
    }
    return Array.from(indices).map((i) => array[i]);
  }
  /**
   * 重新播种
   */
  reseed(additionalEntropy) {
    this.initializeSeed();
    if (additionalEntropy) {
      for (let i = 0; i < Math.min(additionalEntropy.length, this.seed.length); i++) {
        this.seed[i] ^= additionalEntropy[i];
      }
    }
    if (this.config?.collectEntropy) {
      const entropy = this.entropyCollector.getEntropy();
      for (let i = 0; i < Math.min(entropy.length, this.seed.length); i++) {
        this.seed[i] ^= entropy[i];
      }
    }
    this.lastReseed = this.counter;
  }
  /**
   * 添加熵
   */
  addEntropy(data) {
    this.entropyCollector.addEntropy(data);
  }
  /**
   * 获取熵质量
   */
  getEntropyQuality() {
    return this.entropyCollector.getEntropyQuality();
  }
  /**
   * 销毁生成器
   */
  destroy() {
    if (this.config?.collectEntropy) {
      this.entropyCollector.stopCollecting();
    }
    this.seed.fill(0);
    this.counter = 0;
    this.lastReseed = 0;
  }
}
const csprng = new CSPRNG({
  entropySource: "webcrypto",
  seedLength: 32,
  useHardwareRNG: true,
  collectEntropy: true,
  reseedInterval: 1e4
});
const random = {
  bytes: (length) => csprng.randomBytes(length),
  int: (min, max) => csprng.randomInt(min, max),
  float: (min, max) => csprng.randomFloat(min, max),
  string: (length, charset) => csprng.randomString(length, charset),
  hex: (length) => csprng.randomHex(length),
  base64: (length) => csprng.randomBase64(length),
  uuid: () => csprng.randomUUID(),
  token: (length) => csprng.randomToken(length),
  shuffle: (array) => csprng.shuffle(array),
  choice: (array) => csprng.choice(array),
  sample: (array, count) => csprng.sample(array, count)
};

exports.CSPRNG = CSPRNG;
exports.EntropyCollector = EntropyCollector;
exports.csprng = csprng;
exports.random = random;
//# sourceMappingURL=csprng.cjs.map
