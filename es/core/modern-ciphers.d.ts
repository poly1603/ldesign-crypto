/**
 * Modern Cipher Algorithms Implementation
 * Includes ChaCha20, Poly1305, XSalsa20, and ChaCha20-Poly1305 AEAD
 */
export interface ModernCipherOptions {
    key: Uint8Array;
    nonce?: Uint8Array;
    counter?: number;
}
export interface AEADOptions extends ModernCipherOptions {
    additionalData?: Uint8Array;
}
export interface AEADResult {
    ciphertext: Uint8Array;
    tag: Uint8Array;
}
/**
 * ChaCha20 Stream Cipher
 * Based on RFC 8439
 */
export declare class ChaCha20 {
    private key;
    private nonce;
    private counter;
    private block;
    private blockUsed;
    constructor(key: Uint8Array, nonce: Uint8Array, counter?: number);
    private u8to32le;
    private u32to8le;
    private rotl;
    private quarterRound;
    private chacha20Block;
    encrypt(plaintext: Uint8Array): Uint8Array;
    decrypt(ciphertext: Uint8Array): Uint8Array;
}
/**
 * Poly1305 MAC
 * Based on RFC 8439
 */
export declare class Poly1305 {
    private r;
    private h;
    private pad;
    private leftover;
    private buffer;
    private final;
    constructor(key: Uint8Array);
    private u8to32le;
    private blocks;
    update(data: Uint8Array): void;
    finish(): Uint8Array;
    private u32to8le;
    static auth(data: Uint8Array, key: Uint8Array): Uint8Array;
    static verify(tag1: Uint8Array, tag2: Uint8Array): boolean;
}
/**
 * ChaCha20-Poly1305 AEAD
 * Based on RFC 8439
 */
export declare class ChaCha20Poly1305 {
    encrypt(plaintext: Uint8Array, key: Uint8Array, nonce: Uint8Array, aad?: Uint8Array): AEADResult;
    decrypt(ciphertext: Uint8Array, tag: Uint8Array, key: Uint8Array, nonce: Uint8Array, aad?: Uint8Array): Uint8Array | null;
}
/**
 * XSalsa20 Stream Cipher
 * Extended nonce variant of Salsa20
 */
export declare class XSalsa20 {
    private key;
    private nonce;
    private block;
    private blockUsed;
    private counter;
    constructor(key: Uint8Array, nonce: Uint8Array);
    private hsalsa20;
    private u8to32le;
    private u32to8le;
    private rotl;
    private quarterRound;
    private doubleRound;
    private salsa20Block;
    encrypt(plaintext: Uint8Array): Uint8Array;
    decrypt(ciphertext: Uint8Array): Uint8Array;
}
/**
 * BLAKE2b Hash Function
 * Based on RFC 7693
 */
export declare class BLAKE2b {
    private static readonly IV;
    private static readonly SIGMA;
    private h;
    private t;
    private f;
    private buf;
    private buflen;
    private outlen;
    constructor(outlen?: number, key?: Uint8Array);
    private rotr64;
    private g;
    private compress;
    private u8to32le;
    private u32to8le;
    private incrementCounter;
    update(data: Uint8Array): void;
    digest(): Uint8Array;
    static hash(data: Uint8Array, outlen?: number, key?: Uint8Array): Uint8Array;
}
/**
 * Utility functions for modern ciphers
 */
export declare class ModernCipherUtils {
    /**
     * Generate a random key for the specified algorithm
     */
    static generateKey(_algorithm?: 'chacha20' | 'xsalsa20' | 'blake2b'): Uint8Array;
    /**
     * Generate a random nonce for the specified algorithm
     */
    static generateNonce(algorithm?: 'chacha20' | 'xsalsa20'): Uint8Array;
    /**
     * Encrypt data with authentication using ChaCha20-Poly1305
     */
    static encryptAEAD(plaintext: Uint8Array | string, key: Uint8Array, additionalData?: Uint8Array | string): {
        ciphertext: Uint8Array;
        nonce: Uint8Array;
        tag: Uint8Array;
    };
    /**
     * Decrypt data with authentication using ChaCha20-Poly1305
     */
    static decryptAEAD(ciphertext: Uint8Array, tag: Uint8Array, key: Uint8Array, nonce: Uint8Array, additionalData?: Uint8Array | string): Uint8Array | null;
    /**
     * Hash data using BLAKE2b
     */
    static blake2bHash(data: Uint8Array | string, outputLength?: number, key?: Uint8Array): Uint8Array;
    /**
     * Create a keyed hash (MAC) using BLAKE2b
     */
    static blake2bMAC(data: Uint8Array | string, key: Uint8Array, outputLength?: number): Uint8Array;
}
declare const _default: {
    ChaCha20: typeof ChaCha20;
    Poly1305: typeof Poly1305;
    ChaCha20Poly1305: typeof ChaCha20Poly1305;
    XSalsa20: typeof XSalsa20;
    BLAKE2b: typeof BLAKE2b;
    ModernCipherUtils: typeof ModernCipherUtils;
};
export default _default;
