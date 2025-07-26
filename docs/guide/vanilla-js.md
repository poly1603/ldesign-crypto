# 通用 JavaScript

@ldesign/crypto 可以在任何 JavaScript 环境中使用，包括原生 JavaScript、React、Angular 等框架。

## 基础使用

### 浏览器环境

```html
<!DOCTYPE html>
<html>
<head>
    <title>Crypto Demo</title>
</head>
<body>
    <div id="app">
        <h1>加密演示</h1>
        
        <div class="section">
            <h3>AES 加密</h3>
            <input type="text" id="plaintext" placeholder="输入要加密的文本" />
            <button onclick="encryptAES()">加密</button>
            <button onclick="decryptAES()">解密</button>
            <div id="aes-result"></div>
        </div>
        
        <div class="section">
            <h3>哈希计算</h3>
            <input type="text" id="hash-input" placeholder="输入要哈希的文本" />
            <button onclick="calculateHash()">计算SHA-256</button>
            <div id="hash-result"></div>
        </div>
        
        <div class="section">
            <h3>RSA 加密</h3>
            <button onclick="generateRSAKeys()">生成RSA密钥对</button>
            <input type="text" id="rsa-plaintext" placeholder="输入要加密的文本" />
            <button onclick="encryptRSA()">RSA加密</button>
            <button onclick="decryptRSA()">RSA解密</button>
            <div id="rsa-result"></div>
        </div>
    </div>

    <!-- 引入加密库 -->
    <script src="https://unpkg.com/@ldesign/crypto@latest/dist/index.umd.js"></script>
    
    <script>
        // 全局变量
        let crypto = null;
        let aesKey = null;
        let rsaKeyPair = null;
        let encryptedData = null;
        let rsaEncryptedData = null;

        // 初始化
        async function init() {
            try {
                crypto = LDesignCrypto.createCrypto({
                    debug: true,
                    performance: { enabled: true }
                });
                
                await crypto.init();
                console.log('加密库初始化成功');
                
                // 生成AES密钥
                aesKey = crypto.generateKey('AES', 256);
                console.log('AES密钥已生成:', aesKey);
                
            } catch (error) {
                console.error('初始化失败:', error);
                alert('加密库初始化失败: ' + error.message);
            }
        }

        // AES 加密
        async function encryptAES() {
            const plaintext = document.getElementById('plaintext').value;
            if (!plaintext) {
                alert('请输入要加密的文本');
                return;
            }

            try {
                const result = await crypto.aesEncrypt(plaintext, {
                    key: aesKey,
                    mode: 'CBC'
                });

                if (result.success) {
                    encryptedData = result.data;
                    document.getElementById('aes-result').innerHTML = `
                        <h4>加密结果:</h4>
                        <p><strong>密文:</strong> ${result.data}</p>
                        <p><strong>IV:</strong> ${result.iv || 'N/A'}</p>
                    `;
                } else {
                    alert('加密失败: ' + result.error);
                }
            } catch (error) {
                console.error('AES加密失败:', error);
                alert('加密失败: ' + error.message);
            }
        }

        // AES 解密
        async function decryptAES() {
            if (!encryptedData) {
                alert('请先进行加密操作');
                return;
            }

            try {
                const result = await crypto.aesDecrypt(encryptedData, {
                    key: aesKey,
                    mode: 'CBC'
                });

                if (result.success) {
                    document.getElementById('aes-result').innerHTML += `
                        <h4>解密结果:</h4>
                        <p><strong>明文:</strong> ${result.data}</p>
                    `;
                } else {
                    alert('解密失败: ' + result.error);
                }
            } catch (error) {
                console.error('AES解密失败:', error);
                alert('解密失败: ' + error.message);
            }
        }

        // 计算哈希
        async function calculateHash() {
            const input = document.getElementById('hash-input').value;
            if (!input) {
                alert('请输入要哈希的文本');
                return;
            }

            try {
                const result = await crypto.sha256(input);
                
                if (result.success) {
                    document.getElementById('hash-result').innerHTML = `
                        <h4>SHA-256 哈希结果:</h4>
                        <p style="word-break: break-all; font-family: monospace;">
                            ${result.data}
                        </p>
                        <p><small>长度: ${result.data.length} 字符</small></p>
                    `;
                } else {
                    alert('哈希计算失败: ' + result.error);
                }
            } catch (error) {
                console.error('哈希计算失败:', error);
                alert('哈希计算失败: ' + error.message);
            }
        }

        // 生成RSA密钥对
        async function generateRSAKeys() {
            try {
                rsaKeyPair = await crypto.generateRSAKeyPair(2048);
                
                document.getElementById('rsa-result').innerHTML = `
                    <h4>RSA密钥对已生成:</h4>
                    <p><strong>公钥:</strong></p>
                    <textarea readonly style="width: 100%; height: 100px; font-family: monospace; font-size: 12px;">
${rsaKeyPair.publicKey}
                    </textarea>
                    <p><strong>私钥:</strong></p>
                    <textarea readonly style="width: 100%; height: 100px; font-family: monospace; font-size: 12px;">
${rsaKeyPair.privateKey}
                    </textarea>
                `;
                
                console.log('RSA密钥对已生成');
            } catch (error) {
                console.error('RSA密钥生成失败:', error);
                alert('RSA密钥生成失败: ' + error.message);
            }
        }

        // RSA 加密
        async function encryptRSA() {
            if (!rsaKeyPair) {
                alert('请先生成RSA密钥对');
                return;
            }

            const plaintext = document.getElementById('rsa-plaintext').value;
            if (!plaintext) {
                alert('请输入要加密的文本');
                return;
            }

            try {
                const result = await crypto.rsaEncrypt(plaintext, {
                    publicKey: rsaKeyPair.publicKey,
                    padding: 'OAEP'
                });

                if (result.success) {
                    rsaEncryptedData = result.data;
                    document.getElementById('rsa-result').innerHTML += `
                        <h4>RSA加密结果:</h4>
                        <p style="word-break: break-all; font-family: monospace;">
                            ${result.data}
                        </p>
                    `;
                } else {
                    alert('RSA加密失败: ' + result.error);
                }
            } catch (error) {
                console.error('RSA加密失败:', error);
                alert('RSA加密失败: ' + error.message);
            }
        }

        // RSA 解密
        async function decryptRSA() {
            if (!rsaEncryptedData) {
                alert('请先进行RSA加密操作');
                return;
            }

            try {
                const result = await crypto.rsaDecrypt(rsaEncryptedData, {
                    privateKey: rsaKeyPair.privateKey,
                    padding: 'OAEP'
                });

                if (result.success) {
                    document.getElementById('rsa-result').innerHTML += `
                        <h4>RSA解密结果:</h4>
                        <p><strong>明文:</strong> ${result.data}</p>
                    `;
                } else {
                    alert('RSA解密失败: ' + result.error);
                }
            } catch (error) {
                console.error('RSA解密失败:', error);
                alert('RSA解密失败: ' + error.message);
            }
        }

        // 页面加载完成后初始化
        window.addEventListener('load', init);
    </script>

    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #f9f9f9;
        }
        
        input, button, textarea {
            margin: 5px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        
        button {
            background: #007bff;
            color: white;
            cursor: pointer;
        }
        
        button:hover {
            background: #0056b3;
        }
        
        #aes-result, #hash-result, #rsa-result {
            margin-top: 15px;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
    </style>
</body>
</html>
```

### Node.js 环境

```javascript
// crypto-demo.js
const { createCrypto } = require('@ldesign/crypto');

class CryptoDemo {
    constructor() {
        this.crypto = null;
        this.keys = new Map();
    }

    async init() {
        this.crypto = createCrypto({
            debug: true,
            performance: { enabled: true },
            cache: { enabled: true }
        });
        
        await this.crypto.init();
        console.log('✅ 加密库初始化成功');
    }

    // 对称加密演示
    async symmetricDemo() {
        console.log('\n🔐 对称加密演示');
        console.log('='.repeat(50));

        // 生成AES密钥
        const aesKey = this.crypto.generateKey('AES', 256);
        this.keys.set('aes-demo', aesKey);
        console.log('AES密钥:', aesKey);

        const plaintext = 'Hello, Node.js Crypto!';
        console.log('明文:', plaintext);

        // AES加密
        const encrypted = await this.crypto.aesEncrypt(plaintext, {
            key: aesKey,
            mode: 'CBC'
        });

        console.log('加密结果:', encrypted.data);
        console.log('IV:', encrypted.iv);

        // AES解密
        const decrypted = await this.crypto.aesDecrypt(encrypted.data, {
            key: aesKey,
            mode: 'CBC',
            iv: encrypted.iv
        });

        console.log('解密结果:', decrypted.data);
        console.log('验证:', decrypted.data === plaintext ? '✅ 成功' : '❌ 失败');
    }

    // 非对称加密演示
    async asymmetricDemo() {
        console.log('\n🔑 非对称加密演示');
        console.log('='.repeat(50));

        // 生成RSA密钥对
        const keyPair = await this.crypto.generateRSAKeyPair(2048);
        this.keys.set('rsa-demo', keyPair);
        
        console.log('RSA公钥长度:', keyPair.publicKey.length);
        console.log('RSA私钥长度:', keyPair.privateKey.length);

        const message = 'Secret message for RSA';
        console.log('原始消息:', message);

        // RSA加密
        const encrypted = await this.crypto.rsaEncrypt(message, {
            publicKey: keyPair.publicKey,
            padding: 'OAEP'
        });

        console.log('RSA加密结果长度:', encrypted.data.length);

        // RSA解密
        const decrypted = await this.crypto.rsaDecrypt(encrypted.data, {
            privateKey: keyPair.privateKey,
            padding: 'OAEP'
        });

        console.log('RSA解密结果:', decrypted.data);
        console.log('验证:', decrypted.data === message ? '✅ 成功' : '❌ 失败');
    }

    // 哈希算法演示
    async hashDemo() {
        console.log('\n🔍 哈希算法演示');
        console.log('='.repeat(50));

        const data = 'Data to hash';
        console.log('原始数据:', data);

        // 计算不同哈希
        const sha256 = await this.crypto.sha256(data);
        const sha512 = await this.crypto.sha512(data);
        const md5 = await this.crypto.md5(data);

        console.log('SHA-256:', sha256.data);
        console.log('SHA-512:', sha512.data);
        console.log('MD5:', md5.data);

        // HMAC演示
        const hmacKey = this.crypto.generateKey('HMAC', 256);
        const hmac = await this.crypto.hmac(data, hmacKey, {
            algorithm: 'SHA-256'
        });

        console.log('HMAC-SHA256:', hmac.data);

        // 验证HMAC
        const verified = await this.crypto.verifyHmac(data, hmac.data, hmacKey, {
            algorithm: 'SHA-256'
        });

        console.log('HMAC验证:', verified ? '✅ 成功' : '❌ 失败');
    }

    // 国密算法演示
    async smDemo() {
        console.log('\n🇨🇳 国密算法演示');
        console.log('='.repeat(50));

        const data = 'Hello, 国密算法!';
        console.log('原始数据:', data);

        // SM3哈希
        const sm3Hash = await this.crypto.sm3(data);
        console.log('SM3哈希:', sm3Hash.data);

        // SM4加密
        const sm4Key = this.crypto.generateKey('SM4');
        console.log('SM4密钥:', sm4Key);

        const sm4Encrypted = await this.crypto.sm4Encrypt(data, {
            key: sm4Key,
            mode: 'ECB'
        });

        console.log('SM4加密结果:', sm4Encrypted.data);

        const sm4Decrypted = await this.crypto.sm4Decrypt(sm4Encrypted.data, {
            key: sm4Key,
            mode: 'ECB'
        });

        console.log('SM4解密结果:', sm4Decrypted.data);
        console.log('SM4验证:', sm4Decrypted.data === data ? '✅ 成功' : '❌ 失败');

        // SM2椭圆曲线
        const sm2KeyPair = await this.crypto.generateSM2KeyPair();
        console.log('SM2密钥对已生成');

        const sm2Encrypted = await this.crypto.sm2Encrypt(data, {
            publicKey: sm2KeyPair.publicKey
        });

        console.log('SM2加密结果长度:', sm2Encrypted.data.length);

        const sm2Decrypted = await this.crypto.sm2Decrypt(sm2Encrypted.data, {
            privateKey: sm2KeyPair.privateKey
        });

        console.log('SM2解密结果:', sm2Decrypted.data);
        console.log('SM2验证:', sm2Decrypted.data === data ? '✅ 成功' : '❌ 失败');
    }

    // 性能测试
    async performanceTest() {
        console.log('\n📊 性能测试');
        console.log('='.repeat(50));

        const testData = 'A'.repeat(1000); // 1KB数据
        const iterations = 100;

        // AES性能测试
        const aesKey = this.crypto.generateKey('AES', 256);
        
        console.time('AES加密 x' + iterations);
        for (let i = 0; i < iterations; i++) {
            await this.crypto.aesEncrypt(testData, {
                key: aesKey,
                mode: 'CBC'
            });
        }
        console.timeEnd('AES加密 x' + iterations);

        // SHA-256性能测试
        console.time('SHA-256 x' + iterations);
        for (let i = 0; i < iterations; i++) {
            await this.crypto.sha256(testData);
        }
        console.timeEnd('SHA-256 x' + iterations);

        // 获取性能指标
        const metrics = this.crypto.getPerformanceMetrics();
        console.log('\n性能指标:');
        console.log(JSON.stringify(metrics, null, 2));
    }

    // 运行所有演示
    async runAll() {
        try {
            await this.init();
            await this.symmetricDemo();
            await this.asymmetricDemo();
            await this.hashDemo();
            await this.smDemo();
            await this.performanceTest();
            
            console.log('\n🎉 所有演示完成!');
        } catch (error) {
            console.error('❌ 演示过程中出现错误:', error);
        }
    }
}

// 运行演示
if (require.main === module) {
    const demo = new CryptoDemo();
    demo.runAll();
}

module.exports = CryptoDemo;
```

### React 集成

```jsx
// CryptoProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createCrypto } from '@ldesign/crypto';

const CryptoContext = createContext(null);

export function CryptoProvider({ children }) {
    const [crypto, setCrypto] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initCrypto = async () => {
            try {
                const cryptoInstance = createCrypto({
                    debug: process.env.NODE_ENV === 'development',
                    performance: { enabled: true }
                });
                
                await cryptoInstance.init();
                setCrypto(cryptoInstance);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        initCrypto();
    }, []);

    return (
        <CryptoContext.Provider value={{ crypto, isLoading, error }}>
            {children}
        </CryptoContext.Provider>
    );
}

export const useCrypto = () => {
    const context = useContext(CryptoContext);
    if (!context) {
        throw new Error('useCrypto must be used within a CryptoProvider');
    }
    return context;
};
```

```jsx
// CryptoDemo.jsx
import React, { useState } from 'react';
import { useCrypto } from './CryptoProvider';

export function CryptoDemo() {
    const { crypto, isLoading, error } = useCrypto();
    const [plaintext, setPlaintext] = useState('Hello React!');
    const [result, setResult] = useState('');
    const [operation, setOperation] = useState('');

    if (isLoading) return <div>加载中...</div>;
    if (error) return <div>错误: {error}</div>;

    const handleAESEncrypt = async () => {
        setOperation('AES加密中...');
        try {
            const key = crypto.generateKey('AES', 256);
            const encrypted = await crypto.aesEncrypt(plaintext, {
                key,
                mode: 'CBC'
            });
            setResult(`加密结果: ${encrypted.data}`);
        } catch (err) {
            setResult(`错误: ${err.message}`);
        } finally {
            setOperation('');
        }
    };

    const handleSHA256 = async () => {
        setOperation('计算SHA-256...');
        try {
            const hash = await crypto.sha256(plaintext);
            setResult(`SHA-256: ${hash.data}`);
        } catch (err) {
            setResult(`错误: ${err.message}`);
        } finally {
            setOperation('');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px' }}>
            <h2>React 加密演示</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <label>输入文本:</label>
                <input
                    type="text"
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    style={{ width: '100%', padding: '8px', margin: '5px 0' }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={handleAESEncrypt}
                    disabled={!!operation}
                    style={{ marginRight: '10px', padding: '8px 16px' }}
                >
                    AES加密
                </button>
                
                <button 
                    onClick={handleSHA256}
                    disabled={!!operation}
                    style={{ padding: '8px 16px' }}
                >
                    SHA-256哈希
                </button>
            </div>

            {operation && <div>状态: {operation}</div>}

            {result && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px', 
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    wordBreak: 'break-all'
                }}>
                    {result}
                </div>
            )}
        </div>
    );
}
```

### Angular 集成

```typescript
// crypto.service.ts
import { Injectable } from '@angular/core';
import { createCrypto } from '@ldesign/crypto';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private crypto: any = null;
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  
  public isInitialized$: Observable<boolean> = this.isInitializedSubject.asObservable();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      this.crypto = createCrypto({
        debug: !environment.production,
        performance: { enabled: true }
      });
      
      await this.crypto.init();
      this.isInitializedSubject.next(true);
    } catch (error) {
      console.error('Crypto initialization failed:', error);
    }
  }

  async aesEncrypt(data: string, key: string): Promise<any> {
    if (!this.crypto) throw new Error('Crypto not initialized');
    
    return await this.crypto.aesEncrypt(data, {
      key,
      mode: 'CBC'
    });
  }

  async sha256(data: string): Promise<any> {
    if (!this.crypto) throw new Error('Crypto not initialized');
    
    return await this.crypto.sha256(data);
  }

  generateKey(algorithm: string, keySize?: number): string {
    if (!this.crypto) throw new Error('Crypto not initialized');
    
    return this.crypto.generateKey(algorithm, keySize);
  }
}
```

```typescript
// crypto-demo.component.ts
import { Component, OnInit } from '@angular/core';
import { CryptoService } from './crypto.service';

@Component({
  selector: 'app-crypto-demo',
  template: `
    <div class="crypto-demo">
      <h2>Angular 加密演示</h2>
      
      <div *ngIf="!isInitialized">加载中...</div>
      
      <div *ngIf="isInitialized">
        <div class="input-section">
          <label>输入文本:</label>
          <input [(ngModel)]="plaintext" placeholder="输入要处理的文本" />
        </div>

        <div class="actions">
          <button (click)="encryptAES()" [disabled]="isLoading">
            {{ isLoading ? '处理中...' : 'AES加密' }}
          </button>
          
          <button (click)="calculateHash()" [disabled]="isLoading">
            SHA-256哈希
          </button>
        </div>

        <div *ngIf="result" class="result">
          <h4>结果:</h4>
          <pre>{{ result }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .crypto-demo {
      padding: 20px;
      max-width: 600px;
    }
    
    .input-section {
      margin-bottom: 20px;
    }
    
    input {
      width: 100%;
      padding: 8px;
      margin: 5px 0;
    }
    
    .actions button {
      margin-right: 10px;
      padding: 8px 16px;
    }
    
    .result {
      margin-top: 20px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }
  `]
})
export class CryptoDemoComponent implements OnInit {
  plaintext = 'Hello Angular!';
  result = '';
  isLoading = false;
  isInitialized = false;
  private aesKey = '';

  constructor(private cryptoService: CryptoService) {}

  ngOnInit() {
    this.cryptoService.isInitialized$.subscribe(initialized => {
      this.isInitialized = initialized;
      if (initialized) {
        this.aesKey = this.cryptoService.generateKey('AES', 256);
      }
    });
  }

  async encryptAES() {
    this.isLoading = true;
    try {
      const encrypted = await this.cryptoService.aesEncrypt(this.plaintext, this.aesKey);
      this.result = `AES加密结果: ${encrypted.data}`;
    } catch (error) {
      this.result = `错误: ${error.message}`;
    } finally {
      this.isLoading = false;
    }
  }

  async calculateHash() {
    this.isLoading = true;
    try {
      const hash = await this.cryptoService.sha256(this.plaintext);
      this.result = `SHA-256: ${hash.data}`;
    } catch (error) {
      this.result = `错误: ${error.message}`;
    } finally {
      this.isLoading = false;
    }
  }
}
```

## 错误处理

```javascript
// 统一错误处理
class CryptoErrorHandler {
    static handle(error, operation) {
        console.error(`${operation} 失败:`, error);
        
        // 根据错误类型提供用户友好的消息
        if (error.name === 'CryptoInitError') {
            return '加密库初始化失败，请检查浏览器兼容性';
        } else if (error.name === 'InvalidKeyError') {
            return '密钥格式无效，请检查密钥长度和格式';
        } else if (error.name === 'EncryptionError') {
            return '加密操作失败，请检查输入数据和参数';
        } else if (error.name === 'DecryptionError') {
            return '解密操作失败，请检查密钥和密文';
        } else {
            return `操作失败: ${error.message}`;
        }
    }
}

// 使用示例
async function safeEncrypt(data, key) {
    try {
        return await crypto.aesEncrypt(data, { key, mode: 'CBC' });
    } catch (error) {
        const message = CryptoErrorHandler.handle(error, 'AES加密');
        throw new Error(message);
    }
}
```

## 下一步

- 了解 [性能监控](/guide/performance) 的配置
- 学习 [缓存机制](/guide/caching) 的使用
- 查看 [错误处理](/guide/error-handling) 的最佳实践
