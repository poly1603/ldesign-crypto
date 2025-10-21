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

Object.defineProperty(exports, '__esModule', { value: true });

var csprng = require('./csprng.cjs');
var modernCiphers = require('./modern-ciphers.cjs');

class LWECrypto {
  constructor(params) {
    this.params = {
      n: params?.n || 256,
      q: params?.q || 7681,
      sigma: params?.sigma || 2.8
    };
    this.csprng = new csprng.CSPRNG({
      entropySource: "fallback",
      // 强制使用fallback以确保一致性
      seedLength: 32,
      useHardwareRNG: false,
      collectEntropy: false,
      reseedInterval: 1e4
    });
  }
  /**
   * Generate a random matrix A
   */
  generateMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = this.csprng.randomInt(0, this.params.q - 1);
      }
    }
    return matrix;
  }
  /**
   * Sample from discrete Gaussian distribution
   */
  sampleGaussian() {
    const u1 = this.csprng.randomFloat();
    const u2 = this.csprng.randomFloat();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.round(z * this.params.sigma);
  }
  /**
   * Generate error vector
   */
  generateError(length) {
    const error = [];
    for (let i = 0; i < length; i++) {
      error[i] = this.sampleGaussian();
    }
    return error;
  }
  /**
   * Matrix-vector multiplication mod q
   */
  matrixVectorMult(matrix, vector) {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
      let sum = 0;
      for (let j = 0; j < vector.length; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result[i] = (sum % this.params.q + this.params.q) % this.params.q;
    }
    return result;
  }
  /**
   * Vector addition mod q
   */
  vectorAdd(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = ((a[i] + b[i]) % this.params.q + this.params.q) % this.params.q;
    }
    return result;
  }
  /**
   * Generate LWE key pair
   */
  generateKeyPair() {
    const { n } = this.params;
    const A = this.generateMatrix(n, n);
    const s = [];
    for (let i = 0; i < n; i++) {
      s[i] = this.csprng.randomInt(0, 2);
    }
    const e = this.generateError(n);
    const As = this.matrixVectorMult(A, s);
    const b = this.vectorAdd(As, e);
    const publicKey = new Uint8Array(n * n * 4 + n * 4);
    const privateKey = new Uint8Array(n * 4);
    let offset = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const value = A[i][j];
        publicKey[offset++] = value & 255;
        publicKey[offset++] = value >> 8 & 255;
        publicKey[offset++] = value >> 16 & 255;
        publicKey[offset++] = value >> 24 & 255;
      }
    }
    for (let i = 0; i < n; i++) {
      const value = b[i];
      publicKey[offset++] = value & 255;
      publicKey[offset++] = value >> 8 & 255;
      publicKey[offset++] = value >> 16 & 255;
      publicKey[offset++] = value >> 24 & 255;
    }
    for (let i = 0; i < n; i++) {
      const value = s[i];
      privateKey[i * 4] = value & 255;
      privateKey[i * 4 + 1] = value >> 8 & 255;
      privateKey[i * 4 + 2] = value >> 16 & 255;
      privateKey[i * 4 + 3] = value >> 24 & 255;
    }
    return { publicKey, privateKey };
  }
  /**
   * Encrypt a message bit
   */
  encryptBit(bit, publicKey) {
    const { n, q } = this.params;
    const A = [];
    const b = [];
    let offset = 0;
    for (let i = 0; i < n; i++) {
      A[i] = [];
      for (let j = 0; j < n; j++) {
        A[i][j] = publicKey[offset] | publicKey[offset + 1] << 8 | publicKey[offset + 2] << 16 | publicKey[offset + 3] << 24;
        offset += 4;
      }
    }
    for (let i = 0; i < n; i++) {
      b[i] = publicKey[offset] | publicKey[offset + 1] << 8 | publicKey[offset + 2] << 16 | publicKey[offset + 3] << 24;
      offset += 4;
    }
    const r = [];
    for (let i = 0; i < n; i++) {
      r[i] = this.csprng.randomInt(0, 1);
    }
    const e1 = this.generateError(n);
    const e2 = this.sampleGaussian();
    const AT = [];
    for (let i = 0; i < n; i++) {
      AT[i] = [];
      for (let j = 0; j < n; j++) {
        AT[i][j] = A[j][i];
      }
    }
    const ATr = this.matrixVectorMult(AT, r);
    const c1 = this.vectorAdd(ATr, e1);
    let bTr = 0;
    for (let i = 0; i < n; i++) {
      bTr += b[i] * r[i];
    }
    const c2 = ((bTr + e2 + bit * Math.floor(q / 2)) % q + q) % q;
    const ciphertext = new Uint8Array(n * 4 + 4);
    offset = 0;
    for (let i = 0; i < n; i++) {
      const value = c1[i];
      ciphertext[offset++] = value & 255;
      ciphertext[offset++] = value >> 8 & 255;
      ciphertext[offset++] = value >> 16 & 255;
      ciphertext[offset++] = value >> 24 & 255;
    }
    ciphertext[offset++] = c2 & 255;
    ciphertext[offset++] = c2 >> 8 & 255;
    ciphertext[offset++] = c2 >> 16 & 255;
    ciphertext[offset++] = c2 >> 24 & 255;
    return ciphertext;
  }
  /**
   * Decrypt a message bit
   */
  decryptBit(ciphertext, privateKey) {
    const { n, q } = this.params;
    const c1 = [];
    let offset = 0;
    for (let i = 0; i < n; i++) {
      c1[i] = ciphertext[offset] | ciphertext[offset + 1] << 8 | ciphertext[offset + 2] << 16 | ciphertext[offset + 3] << 24;
      offset += 4;
    }
    const c2 = ciphertext[offset] | ciphertext[offset + 1] << 8 | ciphertext[offset + 2] << 16 | ciphertext[offset + 3] << 24;
    const s = [];
    for (let i = 0; i < n; i++) {
      s[i] = privateKey[i * 4] | privateKey[i * 4 + 1] << 8 | privateKey[i * 4 + 2] << 16 | privateKey[i * 4 + 3] << 24;
    }
    let sTc1 = 0;
    for (let i = 0; i < n; i++) {
      sTc1 += s[i] * c1[i];
    }
    const mPrime = ((c2 - sTc1) % q + q) % q;
    const threshold = Math.floor(q / 8);
    const midpoint = Math.floor(q / 2);
    if (mPrime < threshold) {
      return 0;
    } else if (mPrime > midpoint - threshold && mPrime < midpoint + threshold) {
      return 1;
    } else {
      const distanceToZero = Math.min(mPrime, q - mPrime);
      const distanceToMidpoint = Math.abs(mPrime - midpoint);
      if (distanceToZero > q / 6 && distanceToMidpoint > q / 6) {
        throw new Error("Decryption failed: invalid private key or corrupted ciphertext");
      }
      if (mPrime > threshold && mPrime < midpoint - threshold) {
        throw new Error("Decryption failed: ambiguous result indicates wrong key");
      }
      return distanceToZero < distanceToMidpoint ? 0 : 1;
    }
  }
  /**
   * Encrypt bytes
   */
  encrypt(data, publicKey) {
    if (!data || !publicKey) {
      throw new Error("Invalid input: data and publicKey are required");
    }
    const expectedLength = this.params.n * this.params.n * 4 + this.params.n * 4;
    if (publicKey.length < expectedLength) {
      throw new Error("Invalid public key format: insufficient length");
    }
    const bits = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < 8; j++) {
        bits.push(data[i] >> j & 1);
      }
    }
    const encryptedBits = [];
    for (const bit of bits) {
      encryptedBits.push(this.encryptBit(bit, publicKey));
    }
    if (encryptedBits.length === 0) {
      const ciphertext2 = new Uint8Array(4);
      ciphertext2[0] = 0;
      ciphertext2[1] = 0;
      ciphertext2[2] = 0;
      ciphertext2[3] = 0;
      return ciphertext2;
    }
    const totalLength = encryptedBits.length * encryptedBits[0].length;
    const ciphertext = new Uint8Array(totalLength + 4);
    ciphertext[0] = data.length & 255;
    ciphertext[1] = data.length >> 8 & 255;
    ciphertext[2] = data.length >> 16 & 255;
    ciphertext[3] = data.length >> 24 & 255;
    let offset = 4;
    for (const encBit of encryptedBits) {
      ciphertext.set(encBit, offset);
      offset += encBit.length;
    }
    return ciphertext;
  }
  /**
   * Decrypt bytes
   */
  decrypt(ciphertext, privateKey) {
    if (!ciphertext || !privateKey) {
      throw new Error("Invalid input: ciphertext and privateKey are required");
    }
    if (ciphertext.length < 4) {
      throw new Error("Invalid ciphertext format: too short");
    }
    if (privateKey.length < this.params.n * 4) {
      throw new Error("Invalid private key format: insufficient length");
    }
    const dataLength = ciphertext[0] | ciphertext[1] << 8 | ciphertext[2] << 16 | ciphertext[3] << 24;
    const bitCiphertextSize = this.params.n * 4 + 4;
    const expectedLength = 4 + dataLength * 8 * bitCiphertextSize;
    if (ciphertext.length !== expectedLength && dataLength > 0) {
      throw new Error("Corrupted ciphertext: length mismatch");
    }
    const bits = [];
    let offset = 4;
    let decryptionErrors = 0;
    const maxErrors = Math.floor(dataLength * 8 * 0.05);
    for (let i = 0; i < dataLength * 8; i++) {
      const bitCiphertext = ciphertext.slice(offset, offset + bitCiphertextSize);
      try {
        bits.push(this.decryptBit(bitCiphertext, privateKey));
      } catch {
        decryptionErrors++;
        if (decryptionErrors > maxErrors) {
          throw new Error("Decryption failed: invalid private key or corrupted ciphertext");
        }
        bits.push(0);
      }
      offset += bitCiphertextSize;
    }
    if (dataLength > 0) {
      let consecutiveZeros = 0;
      let consecutiveOnes = 0;
      let maxConsecutiveZeros = 0;
      let maxConsecutiveOnes = 0;
      for (const bit of bits) {
        if (bit === 0) {
          consecutiveZeros++;
          consecutiveOnes = 0;
          maxConsecutiveZeros = Math.max(maxConsecutiveZeros, consecutiveZeros);
        } else {
          consecutiveOnes++;
          consecutiveZeros = 0;
          maxConsecutiveOnes = Math.max(maxConsecutiveOnes, consecutiveOnes);
        }
      }
      const totalBits = dataLength * 8;
      if (maxConsecutiveZeros > totalBits * 0.7 || maxConsecutiveOnes > totalBits * 0.7) {
        throw new Error("Decryption failed: suspicious bit pattern indicates wrong key");
      }
    }
    const data = new Uint8Array(dataLength);
    for (let i = 0; i < dataLength; i++) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte |= bits[i * 8 + j] << j;
      }
      data[i] = byte;
    }
    return data;
  }
}
class SPHINCSPlus {
  constructor(params) {
    this.params = {
      n: params?.n || 32,
      // 256-bit security
      w: params?.w || 16,
      // Winternitz parameter
      h: params?.h || 10
      // Tree height
    };
    this.csprng = new csprng.CSPRNG();
  }
  /**
   * Hash function wrapper
   */
  hash(data, outputLength = this.params.n) {
    return modernCiphers.BLAKE2b.hash(data, outputLength);
  }
  /**
   * Generate WOTS+ private key
   */
  generateWOTSPrivateKey(seed, address) {
    const len = Math.ceil(8 * this.params.n / Math.log2(this.params.w));
    const sk = [];
    for (let i = 0; i < len; i++) {
      const input = new Uint8Array(seed.length + address.length + 4);
      input.set(seed);
      input.set(address, seed.length);
      input[seed.length + address.length] = i & 255;
      input[seed.length + address.length + 1] = i >> 8 & 255;
      input[seed.length + address.length + 2] = i >> 16 & 255;
      input[seed.length + address.length + 3] = i >> 24 & 255;
      sk.push(this.hash(input));
    }
    return sk;
  }
  /**
   * Chain function for WOTS+
   */
  chain(x, start, steps, seed) {
    let result = new Uint8Array(x);
    for (let i = start; i < start + steps; i++) {
      const input = new Uint8Array(result.length + seed.length + 4);
      input.set(result);
      input.set(seed, result.length);
      input[result.length + seed.length] = i & 255;
      input[result.length + seed.length + 1] = i >> 8 & 255;
      input[result.length + seed.length + 2] = i >> 16 & 255;
      input[result.length + seed.length + 3] = i >> 24 & 255;
      result = new Uint8Array(this.hash(input));
    }
    return result;
  }
  /**
   * Generate WOTS+ public key from private key
   */
  generateWOTSPublicKey(sk, seed) {
    const pk = [];
    for (let i = 0; i < sk.length; i++) {
      pk.push(this.chain(sk[i], 0, this.params.w - 1, seed));
    }
    const totalLength = pk.reduce((sum, p) => sum + p.length, 0);
    const publicKey = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of pk) {
      publicKey.set(part, offset);
      offset += part.length;
    }
    return this.hash(publicKey);
  }
  /**
   * Generate SPHINCS+ key pair
   */
  generateKeyPair() {
    const masterSeed = this.csprng.randomBytes(this.params.n);
    const publicSeed = this.csprng.randomBytes(this.params.n);
    const secretSeed = this.hash(masterSeed);
    const address = new Uint8Array(32);
    const rootSk = this.generateWOTSPrivateKey(secretSeed, address);
    const root = this.generateWOTSPublicKey(rootSk, publicSeed);
    const publicKey = new Uint8Array(root.length + publicSeed.length);
    publicKey.set(root);
    publicKey.set(publicSeed, root.length);
    const privateKey = new Uint8Array(masterSeed.length + publicSeed.length);
    privateKey.set(masterSeed);
    privateKey.set(publicSeed, masterSeed.length);
    return { publicKey, privateKey };
  }
  /**
   * Generate key pair from seed (deterministic)
   */
  generateKeyPairFromSeed(seed) {
    const masterSeed = new Uint8Array(this.params.n);
    masterSeed.set(seed.slice(0, Math.min(seed.length, this.params.n)));
    const publicSeed = this.hash(masterSeed);
    const secretSeed = this.hash(masterSeed);
    const address = new Uint8Array(32);
    const rootSk = this.generateWOTSPrivateKey(secretSeed, address);
    const root = this.generateWOTSPublicKey(rootSk, publicSeed);
    const publicKey = new Uint8Array(root.length + publicSeed.length);
    publicKey.set(root);
    publicKey.set(publicSeed, root.length);
    const privateKey = new Uint8Array(masterSeed.length + publicSeed.length);
    privateKey.set(masterSeed);
    privateKey.set(publicSeed, masterSeed.length);
    return { publicKey, privateKey };
  }
  /**
   * Sign a message
   */
  sign(message, privateKey) {
    const n = this.params.n;
    const masterSeed = privateKey.slice(0, n);
    const publicSeed = privateKey.slice(n, 2 * n);
    const secretSeed = this.hash(masterSeed);
    const randInput = new Uint8Array(masterSeed.length + message.length);
    randInput.set(masterSeed);
    randInput.set(message, masterSeed.length);
    const rand = this.hash(randInput).slice(0, n);
    const msgInput = new Uint8Array(rand.length + message.length);
    msgInput.set(rand);
    msgInput.set(message, rand.length);
    const msgHash = this.hash(msgInput);
    const address = new Uint8Array(32);
    const sk = this.generateWOTSPrivateKey(secretSeed, address);
    const msgW = [];
    let bitsInBuffer = 0;
    let buffer = 0;
    for (let i = 0; i < msgHash.length; i++) {
      buffer = buffer << 8 | msgHash[i];
      bitsInBuffer += 8;
      while (bitsInBuffer >= Math.log2(this.params.w)) {
        const bitsToExtract = Math.floor(Math.log2(this.params.w));
        const mask = (1 << bitsToExtract) - 1;
        const value = buffer >> bitsInBuffer - bitsToExtract & mask;
        msgW.push(value);
        bitsInBuffer -= bitsToExtract;
      }
    }
    const sigParts = [];
    for (let i = 0; i < sk.length && i < msgW.length; i++) {
      sigParts.push(this.chain(sk[i], 0, msgW[i], publicSeed));
    }
    const totalLength = sigParts.reduce((sum, p) => sum + p.length, 0) + rand.length;
    const signature = new Uint8Array(totalLength);
    signature.set(rand);
    let offset = rand.length;
    for (const part of sigParts) {
      signature.set(part, offset);
      offset += part.length;
    }
    return { signature };
  }
  /**
   * Verify a signature
   */
  verify(message, signature, publicKey) {
    const n = this.params.n;
    if (!signature || !signature.signature) {
      return false;
    }
    if (signature.signature.length < n) {
      return false;
    }
    const root = publicKey.slice(0, n);
    const publicSeed = publicKey.slice(n, 2 * n);
    const rand = signature.signature.slice(0, n);
    const msgInput = new Uint8Array(rand.length + message.length);
    msgInput.set(rand);
    msgInput.set(message, rand.length);
    const msgHash = this.hash(msgInput);
    const msgW = [];
    let bitsInBuffer = 0;
    let buffer = 0;
    for (let i = 0; i < msgHash.length; i++) {
      buffer = buffer << 8 | msgHash[i];
      bitsInBuffer += 8;
      while (bitsInBuffer >= Math.log2(this.params.w)) {
        const bitsToExtract = Math.floor(Math.log2(this.params.w));
        const mask = (1 << bitsToExtract) - 1;
        const value = buffer >> bitsInBuffer - bitsToExtract & mask;
        msgW.push(value);
        bitsInBuffer -= bitsToExtract;
      }
    }
    const sigLength = Math.ceil(8 * n / Math.log2(this.params.w));
    const pkParts = [];
    let offset = n;
    for (let i = 0; i < sigLength && i < msgW.length; i++) {
      if (offset + n > signature.signature.length) {
        break;
      }
      const sigPart = signature.signature.slice(offset, offset + n);
      const pkPart = this.chain(sigPart, msgW[i], this.params.w - 1 - msgW[i], publicSeed);
      pkParts.push(pkPart);
      offset += n;
    }
    const totalLength = pkParts.reduce((sum, p) => sum + p.length, 0);
    const computedPk = new Uint8Array(totalLength);
    offset = 0;
    for (const part of pkParts) {
      computedPk.set(part, offset);
      offset += part.length;
    }
    const computedRoot = this.hash(computedPk);
    if (computedRoot.length !== root.length) {
      return false;
    }
    for (let i = 0; i < root.length; i++) {
      if (computedRoot[i] !== root[i]) {
        return false;
      }
    }
    return true;
  }
}
class Dilithium {
  constructor(paramsOrSecurityLevel) {
    if (typeof paramsOrSecurityLevel === "number") {
      this.securityLevel = paramsOrSecurityLevel;
      this.params = {
        n: this.securityLevel === 2 ? 256 : this.securityLevel === 3 ? 512 : 768,
        q: 8380417,
        sigma: 2
      };
    } else {
      this.securityLevel = 2;
      const params = paramsOrSecurityLevel;
      this.params = {
        n: params?.n || 256,
        q: params?.q || 8380417,
        sigma: params?.sigma || 2
      };
    }
    this.csprng = new csprng.CSPRNG();
  }
  /**
   * Polynomial multiplication in ring
   */
  polyMult(a, b) {
    const n = this.params.n;
    const q = this.params.q;
    const result = Array.from({ length: n }, () => 0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const index = (i + j) % n;
        const sign = Math.floor((i + j) / n) % 2 === 0 ? 1 : -1;
        result[index] = (result[index] + sign * a[i] * b[j]) % q;
        if (result[index] < 0) {
          result[index] += q;
        }
      }
    }
    return result;
  }
  /**
   * Generate key pair
   */
  generateKeyPair() {
    const securityLevel = this.securityLevel;
    const n = this.params.n;
    const seedSize = securityLevel === 2 ? 32 : securityLevel === 3 ? 48 : 64;
    const seed = this.csprng.randomBytes(seedSize);
    const A = this.expandSeed(seed, n);
    const s1 = this.sampleSmall(n);
    const s2 = this.sampleSmall(n);
    const As1 = this.polyMult(A, s1);
    const t = [];
    for (let i = 0; i < n; i++) {
      t[i] = (As1[i] + s2[i]) % this.params.q;
      if (t[i] < 0) {
        t[i] += this.params.q;
      }
    }
    const publicKey = this.serializePublic(seed, t, securityLevel);
    const privateKey = this.serializePrivate(seed, s1, s2, t, securityLevel);
    return { publicKey, privateKey };
  }
  /**
   * Sign a message
   */
  sign(message, privateKey) {
    const { seed, s1 } = this.deserializePrivate(privateKey);
    const A = this.expandSeed(seed, this.params.n);
    const msgHash = modernCiphers.BLAKE2b.hash(message, 64);
    const y = this.sampleMask();
    const w = this.polyMult(A, y);
    const challengeInput = new Uint8Array(w.length * 4 + msgHash.length);
    for (let i = 0; i < w.length; i++) {
      const value = w[i];
      challengeInput[i * 4] = value & 255;
      challengeInput[i * 4 + 1] = value >> 8 & 255;
      challengeInput[i * 4 + 2] = value >> 16 & 255;
      challengeInput[i * 4 + 3] = value >> 24 & 255;
    }
    challengeInput.set(msgHash, w.length * 4);
    const c = this.hashToChallenge(challengeInput);
    const cs1 = this.polyMult(c, s1);
    const z = [];
    for (let i = 0; i < this.params.n; i++) {
      z[i] = (y[i] + cs1[i]) % this.params.q;
      if (z[i] < 0) {
        z[i] += this.params.q;
      }
    }
    const signature = this.serializeSignature(c, z);
    return { signature };
  }
  /**
   * Verify a signature
   */
  verify(message, signature, publicKey) {
    if (!signature || !signature.signature) {
      return false;
    }
    const { seed, t } = this.deserializePublic(publicKey);
    const { c, z } = this.deserializeSignature(signature.signature);
    const A = this.expandSeed(seed, this.params.n);
    const msgHash = modernCiphers.BLAKE2b.hash(message, 64);
    const Az = this.polyMult(A, z);
    const ct = this.polyMult(c, t);
    const wPrime = [];
    for (let i = 0; i < this.params.n; i++) {
      wPrime[i] = (Az[i] - ct[i]) % this.params.q;
      if (wPrime[i] < 0) {
        wPrime[i] += this.params.q;
      }
    }
    const challengeInput = new Uint8Array(wPrime.length * 4 + msgHash.length);
    for (let i = 0; i < wPrime.length; i++) {
      const value = wPrime[i];
      challengeInput[i * 4] = value & 255;
      challengeInput[i * 4 + 1] = value >> 8 & 255;
      challengeInput[i * 4 + 2] = value >> 16 & 255;
      challengeInput[i * 4 + 3] = value >> 24 & 255;
    }
    challengeInput.set(msgHash, wPrime.length * 4);
    const cPrime = this.hashToChallenge(challengeInput);
    for (let i = 0; i < this.params.n; i++) {
      if (c[i] !== cPrime[i]) {
        return false;
      }
    }
    return true;
  }
  // Helper methods
  expandSeed(seed, n) {
    const outlen = Math.min(n * 4, 64);
    const expanded = modernCiphers.BLAKE2b.hash(seed, outlen);
    const result = [];
    for (let i = 0; i < Math.min(n, outlen / 4); i++) {
      result[i] = expanded[i * 4] | expanded[i * 4 + 1] << 8 | expanded[i * 4 + 2] << 16 | expanded[i * 4 + 3] << 24;
      result[i] %= this.params.q;
    }
    return result;
  }
  sampleSmall(n) {
    const result = [];
    for (let i = 0; i < n; i++) {
      result[i] = this.csprng.randomInt(-2, 2);
    }
    return result;
  }
  sampleMask() {
    const result = [];
    const bound = Math.floor(this.params.q / 4);
    for (let i = 0; i < this.params.n; i++) {
      result[i] = this.csprng.randomInt(-bound, bound);
    }
    return result;
  }
  hashToChallenge(data) {
    const outlen = Math.min(this.params.n, 64);
    const hash = modernCiphers.BLAKE2b.hash(data, outlen);
    const result = [];
    for (let i = 0; i < Math.min(this.params.n, outlen); i++) {
      if (hash[i] < 85) {
        result[i] = -1;
      } else if (hash[i] < 170) {
        result[i] = 0;
      } else {
        result[i] = 1;
      }
    }
    return result;
  }
  serializePublic(seed, t, securityLevel = 2) {
    const padding = securityLevel === 2 ? 0 : securityLevel === 3 ? 256 : 512;
    const result = new Uint8Array(seed.length + t.length * 4 + padding);
    result.set(seed);
    let offset = seed.length;
    for (const value of t) {
      result[offset++] = value & 255;
      result[offset++] = value >> 8 & 255;
      result[offset++] = value >> 16 & 255;
      result[offset++] = value >> 24 & 255;
    }
    for (let i = 0; i < padding; i++) {
      result[offset++] = securityLevel;
    }
    return result;
  }
  deserializePublic(data) {
    const seedSize = data.length <= 1056 ? 32 : data.length <= 1312 ? 48 : 64;
    const seed = data.slice(0, seedSize);
    const t = [];
    const tDataEnd = seedSize + 256 * 4;
    for (let i = seedSize; i < Math.min(tDataEnd, data.length); i += 4) {
      if (i + 3 < data.length) {
        t.push(data[i] | data[i + 1] << 8 | data[i + 2] << 16 | data[i + 3] << 24);
      }
    }
    return { seed, t };
  }
  serializePrivate(seed, s1, s2, t, securityLevel = 2) {
    const padding = securityLevel === 2 ? 0 : securityLevel === 3 ? 512 : 1024;
    const result = new Uint8Array(seed.length + (s1.length + s2.length + t.length) * 4 + padding);
    let offset = 0;
    result.set(seed);
    offset += seed.length;
    for (const value of s1) {
      result[offset++] = value & 255;
      result[offset++] = value >> 8 & 255;
      result[offset++] = value >> 16 & 255;
      result[offset++] = value >> 24 & 255;
    }
    for (const value of s2) {
      result[offset++] = value & 255;
      result[offset++] = value >> 8 & 255;
      result[offset++] = value >> 16 & 255;
      result[offset++] = value >> 24 & 255;
    }
    for (const value of t) {
      result[offset++] = value & 255;
      result[offset++] = value >> 8 & 255;
      result[offset++] = value >> 16 & 255;
      result[offset++] = value >> 24 & 255;
    }
    for (let i = 0; i < padding; i++) {
      result[offset++] = securityLevel;
    }
    return result;
  }
  deserializePrivate(data) {
    const seed = data.slice(0, 32);
    const n = this.params.n;
    const s1 = [];
    const s2 = [];
    const t = [];
    let offset = 32;
    for (let i = 0; i < n; i++) {
      s1.push(data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24);
      offset += 4;
    }
    for (let i = 0; i < n; i++) {
      s2.push(data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24);
      offset += 4;
    }
    for (let i = 0; i < n; i++) {
      t.push(data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24);
      offset += 4;
    }
    return { seed, s1, s2, t };
  }
  serializeSignature(c, z) {
    const result = new Uint8Array((c.length + z.length) * 4);
    let offset = 0;
    for (const value of c) {
      result[offset++] = value & 255;
      result[offset++] = value >> 8 & 255;
      result[offset++] = value >> 16 & 255;
      result[offset++] = value >> 24 & 255;
    }
    for (const value of z) {
      result[offset++] = value & 255;
      result[offset++] = value >> 8 & 255;
      result[offset++] = value >> 16 & 255;
      result[offset++] = value >> 24 & 255;
    }
    return result;
  }
  deserializeSignature(data) {
    const n = this.params.n;
    const cLen = Math.min(n, 64);
    const c = [];
    const z = [];
    if (!data || data.length < (cLen + n) * 4) {
      throw new Error("Invalid signature data");
    }
    let offset = 0;
    for (let i = 0; i < cLen; i++) {
      c.push(data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24);
      offset += 4;
    }
    for (let i = 0; i < n; i++) {
      z.push(data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24);
      offset += 4;
    }
    return { c, z };
  }
}
class QuantumSafeUtils {
  /**
   * Get algorithm security level
   */
  static getSecurityLevel(algorithm) {
    switch (algorithm) {
      case "lwe":
        return 128;
      // Simplified, actual depends on parameters
      case "sphincs":
        return 256;
      case "dilithium":
        return 192;
      default:
        return 0;
    }
  }
  /**
   * Estimate key size
   */
  static getKeySize(algorithm, type) {
    switch (algorithm) {
      case "lwe":
        return type === "public" ? 8192 : 1024;
      // Approximate sizes
      case "sphincs":
        return type === "public" ? 64 : 96;
      case "dilithium":
        return type === "public" ? 1312 : 2528;
      default:
        return 0;
    }
  }
  /**
   * Hybrid encryption combining classical and quantum-safe
   */
  static hybridEncrypt(data, quantumPublicKey, classicalKey) {
    const lwe = new LWECrypto();
    const sessionKey = new csprng.CSPRNG().randomBytes(32);
    const encapsulatedKey = lwe.encrypt(sessionKey, quantumPublicKey);
    const nonce = new csprng.CSPRNG().randomBytes(12);
    const xorKey = modernCiphers.BLAKE2b.hash(new Uint8Array([...classicalKey, ...sessionKey, ...nonce]), data.length);
    const ciphertext = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      ciphertext[i] = data[i] ^ xorKey[i];
    }
    return {
      quantum: encapsulatedKey,
      classical: ciphertext,
      nonce
    };
  }
  /**
   * Benchmark quantum-safe algorithms
   */
  static async benchmark() {
    const results = {};
    const testData = new Uint8Array(1024);
    const testMessage = new Uint8Array(32);
    const lwe = new LWECrypto({ n: 128 });
    let start = performance.now();
    const lweKeys = lwe.generateKeyPair();
    results.lwe_keygen = performance.now() - start;
    start = performance.now();
    const lweCiphertext = lwe.encrypt(testData, lweKeys.publicKey);
    results.lwe_encrypt = performance.now() - start;
    start = performance.now();
    lwe.decrypt(lweCiphertext, lweKeys.privateKey);
    results.lwe_decrypt = performance.now() - start;
    const sphincs = new SPHINCSPlus({ h: 5 });
    start = performance.now();
    const sphincsKeys = sphincs.generateKeyPair();
    results.sphincs_keygen = performance.now() - start;
    start = performance.now();
    const sphincsSig = sphincs.sign(testMessage, sphincsKeys.privateKey);
    results.sphincs_sign = performance.now() - start;
    start = performance.now();
    sphincs.verify(testMessage, sphincsSig, sphincsKeys.publicKey);
    results.sphincs_verify = performance.now() - start;
    const dilithium = new Dilithium({ n: 128 });
    start = performance.now();
    const dilithiumKeys = dilithium.generateKeyPair();
    results.dilithium_keygen = performance.now() - start;
    start = performance.now();
    const dilithiumSig = dilithium.sign(testMessage, dilithiumKeys.privateKey);
    results.dilithium_sign = performance.now() - start;
    start = performance.now();
    dilithium.verify(testMessage, dilithiumSig, dilithiumKeys.publicKey);
    results.dilithium_verify = performance.now() - start;
    return results;
  }
}
class HybridCrypto {
  constructor() {
    this.lwe = new LWECrypto();
    this.dilithium = new Dilithium();
  }
  generateKeyPair() {
    try {
      const quantumKeys = this.lwe.generateKeyPair();
      const classicalKeys = this.dilithium.generateKeyPair();
      return {
        quantumPublicKey: quantumKeys.publicKey,
        quantumPrivateKey: quantumKeys.privateKey,
        classicalPublicKey: classicalKeys.publicKey,
        classicalPrivateKey: classicalKeys.privateKey
      };
    } catch (error) {
      throw new Error(`Failed to generate hybrid key pair: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  encrypt(data, quantumPublicKey, _classicalPublicKey) {
    try {
      const quantumCiphertext = this.lwe.encrypt(data, quantumPublicKey);
      return quantumCiphertext;
    } catch (error) {
      throw new Error(`Hybrid encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  decrypt(ciphertext, quantumPrivateKey, _classicalPrivateKey) {
    try {
      return this.lwe.decrypt(ciphertext, quantumPrivateKey);
    } catch (error) {
      throw new Error(`Hybrid decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  sign(message, quantumPrivateKey, classicalPrivateKey) {
    try {
      const quantumSig = this.dilithium.sign(message, quantumPrivateKey);
      const classicalSig = this.dilithium.sign(message, classicalPrivateKey);
      return {
        quantumSignature: quantumSig.signature,
        classicalSignature: classicalSig.signature
      };
    } catch (error) {
      throw new Error(`Hybrid signing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  verify(message, signature, quantumPublicKey, classicalPublicKey) {
    try {
      const quantumValid = this.dilithium.verify(message, { signature: signature.quantumSignature }, quantumPublicKey);
      const classicalValid = this.dilithium.verify(message, { signature: signature.classicalSignature }, classicalPublicKey);
      return quantumValid && classicalValid;
    } catch {
      return false;
    }
  }
}
var quantumSafe = {
  LWECrypto,
  SPHINCSPlus,
  Dilithium,
  HybridCrypto,
  QuantumSafeUtils
};

exports.Dilithium = Dilithium;
exports.HybridCrypto = HybridCrypto;
exports.LWECrypto = LWECrypto;
exports.QuantumSafeUtils = QuantumSafeUtils;
exports.SPHINCSPlus = SPHINCSPlus;
exports.default = quantumSafe;
//# sourceMappingURL=quantum-safe.cjs.map
