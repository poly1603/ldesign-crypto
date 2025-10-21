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

class ObjectPool {
  constructor(options) {
    this.pool = [];
    this.acquires = 0;
    this.releases = 0;
    this.hits = 0;
    this.misses = 0;
    this.discards = 0;
    this.maxSize = options.maxSize ?? 100;
    this.enableStats = options.enableStats ?? true;
    this.factory = options.factory;
    this.resetFn = options.reset;
  }
  /**
   * 从池中获取对象
   */
  acquire() {
    if (this.enableStats) {
      this.acquires++;
    }
    const obj = this.pool.pop();
    if (obj) {
      if (this.enableStats) {
        this.hits++;
      }
      return obj;
    }
    if (this.enableStats) {
      this.misses++;
    }
    return this.factory();
  }
  /**
   * 释放对象回池
   */
  release(obj) {
    if (this.enableStats) {
      this.releases++;
    }
    this.resetFn(obj);
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    } else {
      if (this.enableStats) {
        this.discards++;
      }
    }
  }
  /**
   * 清空池
   */
  clear() {
    this.pool = [];
  }
  /**
   * 获取统计信息
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    return {
      size: this.pool.length,
      maxSize: this.maxSize,
      acquires: this.acquires,
      releases: this.releases,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      discards: this.discards
    };
  }
  /**
   * 重置统计信息
   */
  resetStats() {
    this.acquires = 0;
    this.releases = 0;
    this.hits = 0;
    this.misses = 0;
    this.discards = 0;
  }
  /**
   * 获取当前池大小
   */
  get size() {
    return this.pool.length;
  }
  /**
   * 预热池（预先创建对象）
   */
  prewarm(count) {
    const createCount = Math.min(count, this.maxSize - this.pool.length);
    for (let i = 0; i < createCount; i++) {
      this.pool.push(this.factory());
    }
  }
}
class EncryptResultPool extends ObjectPool {
  constructor(options = {}) {
    const factoryFn = () => ({
      success: false,
      data: "",
      algorithm: ""
    });
    const resetFn = (obj) => {
      obj.success = false;
      obj.data = "";
      obj.algorithm = "";
      obj.mode = void 0;
      obj.keySize = void 0;
      obj.iv = void 0;
      obj.error = void 0;
    };
    super({
      ...options,
      factory: factoryFn,
      reset: resetFn
    });
  }
  /**
   * 创建成功的加密结果
   */
  createSuccess(data, algorithm, extras) {
    const result = this.acquire();
    result.success = true;
    result.data = data;
    result.algorithm = algorithm;
    if (extras) {
      if (extras.mode !== void 0)
        result.mode = extras.mode;
      if (extras.keySize !== void 0)
        result.keySize = extras.keySize;
      if (extras.iv !== void 0)
        result.iv = extras.iv;
    }
    return result;
  }
  /**
   * 创建失败的加密结果
   */
  createFailure(algorithm, error) {
    const result = this.acquire();
    result.success = false;
    result.data = "";
    result.algorithm = algorithm;
    result.error = error;
    return result;
  }
}
class DecryptResultPool extends ObjectPool {
  constructor(options = {}) {
    const factoryFn = () => ({
      success: false,
      data: "",
      algorithm: ""
    });
    const resetFn = (obj) => {
      obj.success = false;
      obj.data = "";
      obj.algorithm = "";
      obj.mode = void 0;
      obj.error = void 0;
    };
    super({
      ...options,
      factory: factoryFn,
      reset: resetFn
    });
  }
  /**
   * 创建成功的解密结果
   */
  createSuccess(data, algorithm, mode) {
    const result = this.acquire();
    result.success = true;
    result.data = data;
    result.algorithm = algorithm;
    if (mode)
      result.mode = mode;
    return result;
  }
  /**
   * 创建失败的解密结果
   */
  createFailure(algorithm, error, mode) {
    const result = this.acquire();
    result.success = false;
    result.data = "";
    result.algorithm = algorithm;
    result.error = error;
    if (mode)
      result.mode = mode;
    return result;
  }
}
const globalEncryptResultPool = new EncryptResultPool({ maxSize: 200 });
const globalDecryptResultPool = new DecryptResultPool({ maxSize: 200 });
function acquireEncryptResult() {
  return globalEncryptResultPool.acquire();
}
function releaseEncryptResult(result) {
  globalEncryptResultPool.release(result);
}
function acquireDecryptResult() {
  return globalDecryptResultPool.acquire();
}
function releaseDecryptResult(result) {
  globalDecryptResultPool.release(result);
}
function createEncryptSuccess(data, algorithm, extras) {
  return globalEncryptResultPool.createSuccess(data, algorithm, extras);
}
function createEncryptFailure(algorithm, error) {
  return globalEncryptResultPool.createFailure(algorithm, error);
}
function createDecryptSuccess(data, algorithm, mode) {
  return globalDecryptResultPool.createSuccess(data, algorithm, mode);
}
function createDecryptFailure(algorithm, error, mode) {
  return globalDecryptResultPool.createFailure(algorithm, error, mode);
}
function getAllPoolStats() {
  return {
    encryptResults: globalEncryptResultPool.getStats(),
    decryptResults: globalDecryptResultPool.getStats()
  };
}
function clearAllPools() {
  globalEncryptResultPool.clear();
  globalDecryptResultPool.clear();
}

exports.DecryptResultPool = DecryptResultPool;
exports.EncryptResultPool = EncryptResultPool;
exports.ObjectPool = ObjectPool;
exports.acquireDecryptResult = acquireDecryptResult;
exports.acquireEncryptResult = acquireEncryptResult;
exports.clearAllPools = clearAllPools;
exports.createDecryptFailure = createDecryptFailure;
exports.createDecryptSuccess = createDecryptSuccess;
exports.createEncryptFailure = createEncryptFailure;
exports.createEncryptSuccess = createEncryptSuccess;
exports.getAllPoolStats = getAllPoolStats;
exports.globalDecryptResultPool = globalDecryptResultPool;
exports.globalEncryptResultPool = globalEncryptResultPool;
exports.releaseDecryptResult = releaseDecryptResult;
exports.releaseEncryptResult = releaseEncryptResult;
//# sourceMappingURL=object-pool.cjs.map
