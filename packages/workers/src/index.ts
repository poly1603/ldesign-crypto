/**
 * @ldesign/crypto-workers
 * 
 * Worker thread pool for parallel crypto operations
 */

export {
  WorkerPool,
  getGlobalWorkerPool,
  destroyGlobalWorkerPool,
  type WorkerPoolOptions,
  type WorkerPoolStats,
  type WorkerMessage,
  type WorkerResponse,
} from './worker-pool'

export const version = '2.0.0'


