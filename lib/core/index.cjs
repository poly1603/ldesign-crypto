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

var crypto = require('./crypto.cjs');
var manager = require('./manager.cjs');
var aes = require('../algorithms/aes.cjs');
var blowfish = require('../algorithms/blowfish.cjs');
var des = require('../algorithms/des.cjs');
var encoding = require('../algorithms/encoding.cjs');
var hash = require('../algorithms/hash.cjs');
var rsa = require('../algorithms/rsa.cjs');
var tripledes = require('../algorithms/tripledes.cjs');
var authenticatedEncryption = require('./authenticated-encryption.cjs');
var chain = require('./chain.cjs');
var performance = require('./performance.cjs');

const encrypt = new crypto.Encrypt();
const decrypt = new crypto.Decrypt();
const hashInstance = new crypto.Hash();
const hmacInstance = new crypto.HMAC();
const keyGenerator = new crypto.KeyGenerator();
const digitalSignature = new crypto.DigitalSignature();
const cryptoManager = new manager.CryptoManager({
  defaultAlgorithm: "AES",
  enableCache: true,
  maxCacheSize: 1e3,
  enableParallel: true,
  autoGenerateIV: true,
  keyDerivation: false,
  debug: false,
  logLevel: "error"
});

exports.Decrypt = crypto.Decrypt;
exports.DigitalSignature = crypto.DigitalSignature;
exports.Encrypt = crypto.Encrypt;
exports.HMAC = crypto.HMAC;
exports.Hash = crypto.Hash;
exports.KeyGenerator = crypto.KeyGenerator;
exports.CryptoManager = manager.CryptoManager;
exports.aes = aes.aes;
exports.blowfish = blowfish.blowfish;
exports.des = des.des;
exports.base64 = encoding.base64;
exports.encoding = encoding.encoding;
exports.hex = encoding.hex;
exports.hash = hash.hash;
exports.hmac = hash.hmac;
exports.rsa = rsa.rsa;
exports.des3 = tripledes.des3;
exports.tripledes = tripledes.tripledes;
exports.AuthenticatedEncryption = authenticatedEncryption.AuthenticatedEncryption;
exports.authenticatedEncryption = authenticatedEncryption.authenticatedEncryption;
exports.decryptJSONWithAuth = authenticatedEncryption.decryptJSONWithAuth;
exports.decryptWithAuth = authenticatedEncryption.decryptWithAuth;
exports.encryptJSONWithAuth = authenticatedEncryption.encryptJSONWithAuth;
exports.encryptWithAuth = authenticatedEncryption.encryptWithAuth;
exports.CryptoChain = chain.CryptoChain;
exports.chain = chain.chain;
exports.decryptFromBase64 = chain.decryptFromBase64;
exports.decryptJSON = chain.decryptJSON;
exports.encryptJSON = chain.encryptJSON;
exports.encryptToBase64 = chain.encryptToBase64;
exports.hashPassword = chain.hashPassword;
exports.PerformanceOptimizer = performance.PerformanceOptimizer;
exports.cryptoManager = cryptoManager;
exports.decrypt = decrypt;
exports.digitalSignature = digitalSignature;
exports.encrypt = encrypt;
exports.hashInstance = hashInstance;
exports.hmacInstance = hmacInstance;
exports.keyGenerator = keyGenerator;
//# sourceMappingURL=index.cjs.map
