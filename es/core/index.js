/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import { Decrypt, DigitalSignature, KeyGenerator, Encrypt, Hash, HMAC } from './crypto.js';
import { CryptoManager } from './manager.js';
export { aes } from '../algorithms/aes.js';
export { blowfish } from '../algorithms/blowfish.js';
export { des } from '../algorithms/des.js';
export { base64, encoding, hex } from '../algorithms/encoding.js';
export { hash, hmac } from '../algorithms/hash.js';
export { rsa } from '../algorithms/rsa.js';
export { des3, tripledes } from '../algorithms/tripledes.js';
export { AuthenticatedEncryption, authenticatedEncryption, decryptJSONWithAuth, decryptWithAuth, encryptJSONWithAuth, encryptWithAuth } from './authenticated-encryption.js';
export { CryptoChain, chain, decryptFromBase64, decryptJSON, encryptJSON, encryptToBase64, hashPassword } from './chain.js';
export { PerformanceOptimizer } from './performance.js';

const encrypt = new Encrypt();
const decrypt = new Decrypt();
const hashInstance = new Hash();
const hmacInstance = new HMAC();
const keyGenerator = new KeyGenerator();
const digitalSignature = new DigitalSignature();
const cryptoManager = new CryptoManager({
  defaultAlgorithm: "AES",
  enableCache: true,
  maxCacheSize: 1e3,
  enableParallel: true,
  autoGenerateIV: true,
  keyDerivation: false,
  debug: false,
  logLevel: "error"
});

export { CryptoManager, Decrypt, DigitalSignature, Encrypt, HMAC, Hash, KeyGenerator, cryptoManager, decrypt, digitalSignature, encrypt, hashInstance, hmacInstance, keyGenerator };
//# sourceMappingURL=index.js.map
