/**
 * Node.js 基础加密示例
 * 演示如何在 Node.js 环境中使用 @ldesign/crypto
 */

const { createAES, hash, createRSA } = require('@ldesign/crypto')

console.log('=== @ldesign/crypto Node.js 示例 ===\n')

// 1. AES 对称加密
console.log('1. AES 加密演示')
console.log('------------------------')

const aes = createAES('my-secret-password-32-chars-long')

const plaintext = 'Hello, this is a secret message!'
console.log('明文:', plaintext)

const encryptResult = aes.encrypt(plaintext)
if (encryptResult.success) {
  console.log('加密成功!')
  console.log('密文:', encryptResult.data.substring(0, 50) + '...')
  console.log('IV:', encryptResult.iv)

  // 解密
  const decryptResult = aes.decrypt(encryptResult.data)
  if (decryptResult.success) {
    console.log('解密成功!')
    console.log('解密后:', decryptResult.data)
    console.log('验证:', decryptResult.data === plaintext ? '✅ 通过' : '❌ 失败')
  }
}

console.log('\n')

// 2. 哈希计算
console.log('2. 哈希计算演示')
console.log('------------------------')

const data = 'sensitive-data-to-hash'
console.log('原始数据:', data)

const md5Hash = hash.md5(data)
const sha256Hash = hash.sha256(data)
const sha512Hash = hash.sha512(data)

console.log('MD5:', md5Hash)
console.log('SHA-256:', sha256Hash)
console.log('SHA-512:', sha512Hash)

console.log('\n')

// 3. HMAC 消息认证
console.log('3. HMAC 认证演示')
console.log('------------------------')

const message = 'Important message'
const secretKey = 'hmac-secret-key'

const hmacSha256 = hash.hmac(message, secretKey, 'sha256')
console.log('消息:', message)
console.log('HMAC-SHA256:', hmacSha256)

// 验证HMAC
const hmacToVerify = hash.hmac(message, secretKey, 'sha256')
const isValid = hmacSha256 === hmacToVerify
console.log('HMAC验证:', isValid ? '✅ 通过' : '❌ 失败')

console.log('\n')

// 4. RSA 非对称加密
console.log('4. RSA 加密演示')
console.log('------------------------')

const rsa = createRSA()

console.log('生成 RSA 密钥对...')
const keyPair = rsa.generateKeyPair(2048)
console.log('✅ 密钥对生成成功')
console.log('公钥长度:', keyPair.publicKey.length, '字符')
console.log('私钥长度:', keyPair.privateKey.length, '字符')

const rsaMessage = 'Secret RSA message'
console.log('\n加密消息:', rsaMessage)

const rsaEncrypted = rsa.encrypt(rsaMessage, keyPair.publicKey)
if (rsaEncrypted.success) {
  console.log('✅ 加密成功')
  console.log('密文长度:', rsaEncrypted.data.length)

  const rsaDecrypted = rsa.decrypt(rsaEncrypted.data, keyPair.privateKey)
  if (rsaDecrypted.success) {
    console.log('✅ 解密成功')
    console.log('解密后:', rsaDecrypted.data)
    console.log('验证:', rsaDecrypted.data === rsaMessage ? '✅ 通过' : '❌ 失败')
  }
}

console.log('\n')

// 5. 数字签名
console.log('5. 数字签名演示')
console.log('------------------------')

const documentToSign = 'This is an important contract'
console.log('文档内容:', documentToSign)

// 使用私钥签名
const signature = rsa.sign(documentToSign, keyPair.privateKey)
if (signature.success) {
  console.log('✅ 签名成功')
  console.log('签名:', signature.data.substring(0, 50) + '...')

  // 使用公钥验证
  const verified = rsa.verify(documentToSign, signature.data, keyPair.publicKey)
  console.log('签名验证:', verified.success && verified.data ? '✅ 有效' : '❌ 无效')

  // 尝试验证被篡改的文档
  const tamperedDoc = documentToSign + ' MODIFIED'
  const verifiedTampered = rsa.verify(tamperedDoc, signature.data, keyPair.publicKey)
  console.log('篡改后验证:', verifiedTampered.success && verifiedTampered.data ? '❌ 不应通过' : '✅ 正确拒绝')
}

console.log('\n')

// 6. Base64 编码/解码
console.log('6. Base64 编码演示')
console.log('------------------------')

const { base64 } = require('@ldesign/crypto')

const originalText = 'Hello, 世界!'
console.log('原始文本:', originalText)

const encoded = base64.encode(originalText)
console.log('Base64 编码:', encoded)

const decoded = base64.decode(encoded)
console.log('解码后:', decoded)
console.log('验证:', decoded === originalText ? '✅ 通过' : '❌ 失败')

console.log('\n=== 示例完成 ===')

