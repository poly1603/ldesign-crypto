/**
 * Quantum-Safe Cryptography Implementation
 * Includes post-quantum algorithms resistant to quantum computer attacks
 */
export interface QuantumSafeKeyPair {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
}
export interface QuantumSafeSignature {
    signature: Uint8Array;
    publicKey?: Uint8Array;
}
export interface LatticeParams {
    n: number;
    q: number;
    sigma: number;
}
export interface HashBasedParams {
    n: number;
    w: number;
    h: number;
}
/**
 * Learning With Errors (LWE) based encryption
 * Simplified implementation for demonstration
 */
export declare class LWECrypto {
    private params;
    private csprng;
    constructor(params?: Partial<LatticeParams>);
    /**
     * Generate a random matrix A
     */
    private generateMatrix;
    /**
     * Sample from discrete Gaussian distribution
     */
    private sampleGaussian;
    /**
     * Generate error vector
     */
    private generateError;
    /**
     * Matrix-vector multiplication mod q
     */
    private matrixVectorMult;
    /**
     * Vector addition mod q
     */
    private vectorAdd;
    /**
     * Generate LWE key pair
     */
    generateKeyPair(): QuantumSafeKeyPair;
    /**
     * Encrypt a message bit
     */
    encryptBit(bit: number, publicKey: Uint8Array): Uint8Array;
    /**
     * Decrypt a message bit
     */
    decryptBit(ciphertext: Uint8Array, privateKey: Uint8Array): number;
    /**
     * Encrypt bytes
     */
    encrypt(data: Uint8Array, publicKey: Uint8Array): Uint8Array;
    /**
     * Decrypt bytes
     */
    decrypt(ciphertext: Uint8Array, privateKey: Uint8Array): Uint8Array;
}
/**
 * SPHINCS+ Hash-based signature scheme
 * Simplified implementation
 */
export declare class SPHINCSPlus {
    private params;
    private csprng;
    constructor(params?: Partial<HashBasedParams>);
    /**
     * Hash function wrapper
     */
    private hash;
    /**
     * Generate WOTS+ private key
     */
    private generateWOTSPrivateKey;
    /**
     * Chain function for WOTS+
     */
    private chain;
    /**
     * Generate WOTS+ public key from private key
     */
    private generateWOTSPublicKey;
    /**
     * Generate SPHINCS+ key pair
     */
    generateKeyPair(): QuantumSafeKeyPair;
    /**
     * Generate key pair from seed (deterministic)
     */
    generateKeyPairFromSeed(seed: Uint8Array): QuantumSafeKeyPair;
    /**
     * Sign a message
     */
    sign(message: Uint8Array, privateKey: Uint8Array): QuantumSafeSignature;
    /**
     * Verify a signature
     */
    verify(message: Uint8Array, signature: QuantumSafeSignature, publicKey: Uint8Array): boolean;
}
/**
 * Dilithium - Lattice-based digital signature
 * Simplified implementation
 */
export declare class Dilithium {
    private params;
    private csprng;
    private securityLevel;
    constructor(paramsOrSecurityLevel?: Partial<LatticeParams> | number);
    /**
     * Polynomial multiplication in ring
     */
    private polyMult;
    /**
     * Generate key pair
     */
    generateKeyPair(): QuantumSafeKeyPair;
    /**
     * Sign a message
     */
    sign(message: Uint8Array, privateKey: Uint8Array): QuantumSafeSignature;
    /**
     * Verify a signature
     */
    verify(message: Uint8Array, signature: QuantumSafeSignature, publicKey: Uint8Array): boolean;
    private expandSeed;
    private sampleSmall;
    private sampleMask;
    private hashToChallenge;
    private serializePublic;
    private deserializePublic;
    private serializePrivate;
    private deserializePrivate;
    private serializeSignature;
    private deserializeSignature;
}
/**
 * Quantum-Safe Crypto Utilities
 */
export declare class QuantumSafeUtils {
    /**
     * Get algorithm security level
     */
    static getSecurityLevel(algorithm: 'lwe' | 'sphincs' | 'dilithium'): number;
    /**
     * Estimate key size
     */
    static getKeySize(algorithm: 'lwe' | 'sphincs' | 'dilithium', type: 'public' | 'private'): number;
    /**
     * Hybrid encryption combining classical and quantum-safe
     */
    static hybridEncrypt(data: Uint8Array, quantumPublicKey: Uint8Array, classicalKey: Uint8Array): {
        quantum: Uint8Array;
        classical: Uint8Array;
        nonce: Uint8Array;
    };
    /**
     * Benchmark quantum-safe algorithms
     */
    static benchmark(): Promise<Record<string, number>>;
}
/**
 * Hybrid Cryptography combining quantum-safe and classical algorithms
 */
export declare class HybridCrypto {
    private lwe;
    private dilithium;
    generateKeyPair(): {
        quantumPublicKey: Uint8Array<ArrayBufferLike>;
        quantumPrivateKey: Uint8Array<ArrayBufferLike>;
        classicalPublicKey: Uint8Array<ArrayBufferLike>;
        classicalPrivateKey: Uint8Array<ArrayBufferLike>;
    };
    encrypt(data: Uint8Array, quantumPublicKey: Uint8Array, _classicalPublicKey?: Uint8Array): Uint8Array;
    decrypt(ciphertext: Uint8Array, quantumPrivateKey: Uint8Array, _classicalPrivateKey?: Uint8Array): Uint8Array;
    sign(message: Uint8Array, quantumPrivateKey: Uint8Array, classicalPrivateKey: Uint8Array): {
        quantumSignature: Uint8Array<ArrayBufferLike>;
        classicalSignature: Uint8Array<ArrayBufferLike>;
    };
    verify(message: Uint8Array, signature: {
        quantumSignature: Uint8Array;
        classicalSignature: Uint8Array;
    }, quantumPublicKey: Uint8Array, classicalPublicKey: Uint8Array): boolean;
}
declare const _default: {
    LWECrypto: typeof LWECrypto;
    SPHINCSPlus: typeof SPHINCSPlus;
    Dilithium: typeof Dilithium;
    HybridCrypto: typeof HybridCrypto;
    QuantumSafeUtils: typeof QuantumSafeUtils;
};
export default _default;
