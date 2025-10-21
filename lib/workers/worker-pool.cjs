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

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
class WorkerPool {
  constructor(options = {}) {
    this.workers = [];
    this.taskQueue = [];
    this.activeTasks = /* @__PURE__ */ new Map();
    this.isInitialized = false;
    this.isNodeEnv = false;
    this.taskIdCounter = 0;
    this.stats = {
      completedTasks: 0,
      failedTasks: 0,
      totalTaskTime: 0
    };
    this.isNodeEnv = false;
    const defaultSize = navigator.hardwareConcurrency || 4;
    this.options = {
      size: options.size || defaultSize,
      timeout: options.timeout || 3e4,
      autoStart: options.autoStart !== false,
      workerPath: options.workerPath || ""
    };
    if (this.options.autoStart) {
      this.initialize();
    }
  }
  /**
   * 初始化 Worker 池
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }
    try {
      for (let i = 0; i < this.options.size; i++) {
        this.createWorker(i);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize worker pool:", error);
      throw error;
    }
  }
  /**
   * 创建 Worker 实例
   */
  createWorker(id) {
    try {
      const workerUrl = new URL("./crypto.worker.ts", (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('workers/worker-pool.cjs', document.baseURI).href)));
      const worker = new Worker(workerUrl, { type: "module" });
      const instance = {
        id,
        worker,
        busy: false,
        taskCount: 0
      };
      worker.addEventListener("message", (event) => {
        this.handleWorkerResponse(instance, event.data);
      });
      worker.addEventListener("error", (event) => {
        this.handleWorkerError(instance, new Error(event.message));
      });
      this.workers.push(instance);
    } catch (error) {
      console.error(`Failed to create worker ${id}:`, error);
      throw error;
    }
  }
  /**
   * 处理 Worker 响应
   */
  handleWorkerResponse(worker, response) {
    const task = this.activeTasks.get(response.id);
    if (!task) {
      return;
    }
    if (task.timeout) {
      clearTimeout(task.timeout);
    }
    worker.busy = false;
    worker.taskCount++;
    this.activeTasks.delete(response.id);
    this.stats.completedTasks++;
    task.resolve(response.result);
    this.processNextTask();
  }
  /**
   * 处理 Worker 错误
   */
  handleWorkerError(worker, error) {
    for (const [taskId, task] of this.activeTasks.entries()) {
      if (task.timeout) {
        clearTimeout(task.timeout);
      }
      this.activeTasks.delete(taskId);
      this.stats.failedTasks++;
      task.reject(error);
    }
    worker.busy = false;
    this.processNextTask();
  }
  /**
   * 处理队列中的下一个任务
   */
  processNextTask() {
    if (this.taskQueue.length === 0) {
      return;
    }
    const idleWorker = this.workers.find((w) => !w.busy);
    if (!idleWorker) {
      return;
    }
    const task = this.taskQueue.shift();
    if (!task) {
      return;
    }
    this.executeTask(idleWorker, task);
  }
  /**
   * 执行任务
   */
  executeTask(worker, task) {
    worker.busy = true;
    this.activeTasks.set(task.id, task);
    task.timeout = window.setTimeout(() => {
      this.activeTasks.delete(task.id);
      this.stats.failedTasks++;
      worker.busy = false;
      task.reject(new Error(`Task ${task.id} timeout after ${this.options.timeout}ms`));
      this.processNextTask();
    }, this.options.timeout);
    const startTime = Date.now();
    worker.worker.postMessage(task.message);
    const activeTask = this.activeTasks.get(task.id);
    if (activeTask) {
      activeTask.resolve = /* @__PURE__ */ ((originalResolve) => {
        return (result) => {
          const elapsed = Date.now() - startTime;
          this.stats.totalTaskTime += elapsed;
          originalResolve(result);
        };
      })(task.resolve);
    }
  }
  /**
   * 提交加密任务
   */
  async encrypt(data, key, algorithm, options) {
    if (!this.isInitialized) {
      this.initialize();
    }
    const taskId = `encrypt-${++this.taskIdCounter}-${Date.now()}`;
    return new Promise((resolve, reject) => {
      const task = {
        id: taskId,
        message: {
          id: taskId,
          type: "encrypt",
          algorithm,
          data,
          key,
          options
        },
        resolve,
        reject
      };
      const idleWorker = this.workers.find((w) => !w.busy);
      if (idleWorker) {
        this.executeTask(idleWorker, task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }
  /**
   * 提交解密任务
   */
  async decrypt(data, key, algorithm, options) {
    if (!this.isInitialized) {
      this.initialize();
    }
    const taskId = `decrypt-${++this.taskIdCounter}-${Date.now()}`;
    return new Promise((resolve, reject) => {
      const task = {
        id: taskId,
        message: {
          id: taskId,
          type: "decrypt",
          algorithm,
          data,
          key,
          options
        },
        resolve,
        reject
      };
      const idleWorker = this.workers.find((w) => !w.busy);
      if (idleWorker) {
        this.executeTask(idleWorker, task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }
  /**
   * 批量加密
   */
  async batchEncrypt(operations) {
    if (!this.isInitialized) {
      this.initialize();
    }
    const promises = operations.map((op) => this.encrypt(op.data, op.key, op.algorithm, op.options));
    return Promise.all(promises);
  }
  /**
   * 批量解密
   */
  async batchDecrypt(operations) {
    if (!this.isInitialized) {
      this.initialize();
    }
    const promises = operations.map((op) => this.decrypt(op.data, op.key, op.algorithm, op.options));
    return Promise.all(promises);
  }
  /**
   * 获取统计信息
   */
  getStats() {
    const idleWorkers = this.workers.filter((w) => !w.busy).length;
    const busyWorkers = this.workers.length - idleWorkers;
    return {
      totalWorkers: this.workers.length,
      idleWorkers,
      busyWorkers,
      queueLength: this.taskQueue.length,
      completedTasks: this.stats.completedTasks,
      failedTasks: this.stats.failedTasks,
      averageTaskTime: this.stats.completedTasks > 0 ? this.stats.totalTaskTime / this.stats.completedTasks : 0
    };
  }
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      completedTasks: 0,
      failedTasks: 0,
      totalTaskTime: 0
    };
  }
  /**
   * 终止所有 Worker
   */
  async terminate() {
    for (const task of this.taskQueue) {
      if (task.timeout) {
        clearTimeout(task.timeout);
      }
      task.reject(new Error("Worker pool terminated"));
    }
    this.taskQueue = [];
    for (const [taskId, task] of this.activeTasks.entries()) {
      if (task.timeout) {
        clearTimeout(task.timeout);
      }
      task.reject(new Error("Worker pool terminated"));
      this.activeTasks.delete(taskId);
    }
    for (const instance of this.workers) {
      if (this.isNodeEnv) {
        await instance.worker.terminate();
      } else {
        instance.worker.terminate();
      }
    }
    this.workers = [];
    this.isInitialized = false;
  }
  /**
   * 获取池大小
   */
  get size() {
    return this.workers.length;
  }
  /**
   * 是否已初始化
   */
  get initialized() {
    return this.isInitialized;
  }
}
let globalWorkerPool = null;
function getGlobalWorkerPool(options) {
  if (!globalWorkerPool) {
    globalWorkerPool = new WorkerPool(options);
  }
  return globalWorkerPool;
}
async function destroyGlobalWorkerPool() {
  if (globalWorkerPool) {
    await globalWorkerPool.terminate();
    globalWorkerPool = null;
  }
}

exports.WorkerPool = WorkerPool;
exports.destroyGlobalWorkerPool = destroyGlobalWorkerPool;
exports.getGlobalWorkerPool = getGlobalWorkerPool;
//# sourceMappingURL=worker-pool.cjs.map
