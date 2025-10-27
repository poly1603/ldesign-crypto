/**
 * API 签名示例
 * 演示如何使用 HMAC 对 API 请求进行签名和验证
 */

const { hash, timingSafeEqual } = require('@ldesign/crypto')

console.log('=== API 签名和验证示例 ===\n')

// 模拟 API 密钥
const API_KEY = 'my-api-key-12345'
const API_SECRET = 'my-api-secret-67890'

/**
 * 生成 API 请求签名
 * @param {string} method - HTTP 方法
 * @param {string} path - API 路径
 * @param {string} body - 请求体
 * @param {number} timestamp - 时间戳
 * @param {string} secret - API 密钥
 * @returns {string} 签名
 */
function generateSignature(method, path, body, timestamp, secret) {
  // 构造待签名字符串
  const message = `${method}\n${path}\n${timestamp}\n${body}`

  // 使用 HMAC-SHA256 生成签名
  return hash.hmac(message, secret, 'sha256')
}

/**
 * 验证 API 请求签名
 * @param {string} receivedSignature - 接收到的签名
 * @param {string} method - HTTP 方法
 * @param {string} path - API 路径
 * @param {string} body - 请求体
 * @param {number} timestamp - 时间戳
 * @param {string} secret - API 密钥
 * @param {number} maxAge - 最大时间差(毫秒)
 * @returns {{valid: boolean, reason?: string}} 验证结果
 */
function verifySignature(receivedSignature, method, path, body, timestamp, secret, maxAge = 300000) {
  // 检查时间戳是否在有效范围内 (防止重放攻击)
  const now = Date.now()
  const age = now - timestamp

  if (age > maxAge) {
    return { valid: false, reason: 'Timestamp expired' }
  }

  if (age < -60000) { // 允许1分钟的时钟偏差
    return { valid: false, reason: 'Timestamp too far in the future' }
  }

  // 重新计算签名
  const expectedSignature = generateSignature(method, path, body, timestamp, secret)

  // 使用恒定时间比较 (防止时序攻击)
  const isValid = timingSafeEqual(receivedSignature, expectedSignature)

  return {
    valid: isValid,
    reason: isValid ? undefined : 'Invalid signature'
  }
}

// ==================== 示例使用 ====================

console.log('1. 客户端发送请求')
console.log('------------------------')

// 模拟客户端发送 POST 请求
const requestMethod = 'POST'
const requestPath = '/api/v1/users'
const requestBody = JSON.stringify({
  name: 'John Doe',
  email: 'john@example.com'
})
const requestTimestamp = Date.now()

console.log('HTTP Method:', requestMethod)
console.log('Path:', requestPath)
console.log('Body:', requestBody)
console.log('Timestamp:', requestTimestamp, '(' + new Date(requestTimestamp).toISOString() + ')')

// 生成签名
const signature = generateSignature(
  requestMethod,
  requestPath,
  requestBody,
  requestTimestamp,
  API_SECRET
)

console.log('✅ 签名:', signature)

console.log('\n')

// ==================== 服务端验证 ====================

console.log('2. 服务端验证请求')
console.log('------------------------')

// 模拟服务端接收到的请求
const receivedRequest = {
  method: requestMethod,
  path: requestPath,
  body: requestBody,
  timestamp: requestTimestamp,
  signature: signature,
  apiKey: API_KEY
}

console.log('接收到的签名:', receivedRequest.signature)

// 验证签名
const verificationResult = verifySignature(
  receivedRequest.signature,
  receivedRequest.method,
  receivedRequest.path,
  receivedRequest.body,
  receivedRequest.timestamp,
  API_SECRET,
  300000 // 5分钟有效期
)

if (verificationResult.valid) {
  console.log('✅ 签名验证通过 - 请求有效')
} else {
  console.log('❌ 签名验证失败:', verificationResult.reason)
}

console.log('\n')

// ==================== 测试各种攻击场景 ====================

console.log('3. 测试安全场景')
console.log('------------------------')

// 场景1: 篡改请求体
console.log('\n场景1: 篡改请求体')
const tamperedBody = JSON.stringify({
  name: 'John Doe',
  email: 'attacker@example.com' // 被篡改
})
const result1 = verifySignature(
  signature,
  requestMethod,
  requestPath,
  tamperedBody,
  requestTimestamp,
  API_SECRET
)
console.log('结果:', result1.valid ? '❌ 不应通过' : '✅ 正确拒绝 - ' + result1.reason)

// 场景2: 重放攻击 (过期的时间戳)
console.log('\n场景2: 重放攻击 (过期时间戳)')
const oldTimestamp = Date.now() - 400000 // 6分钟前
const oldSignature = generateSignature(
  requestMethod,
  requestPath,
  requestBody,
  oldTimestamp,
  API_SECRET
)
const result2 = verifySignature(
  oldSignature,
  requestMethod,
  requestPath,
  requestBody,
  oldTimestamp,
  API_SECRET,
  300000 // 5分钟有效期
)
console.log('结果:', result2.valid ? '❌ 不应通过' : '✅ 正确拒绝 - ' + result2.reason)

// 场景3: 错误的密钥
console.log('\n场景3: 使用错误的密钥')
const wrongSecret = 'wrong-secret'
const wrongSignature = generateSignature(
  requestMethod,
  requestPath,
  requestBody,
  requestTimestamp,
  wrongSecret
)
const result3 = verifySignature(
  wrongSignature,
  requestMethod,
  requestPath,
  requestBody,
  requestTimestamp,
  API_SECRET
)
console.log('结果:', result3.valid ? '❌ 不应通过' : '✅ 正确拒绝 - ' + result3.reason)

// 场景4: 修改 HTTP 方法
console.log('\n场景4: 修改 HTTP 方法')
const result4 = verifySignature(
  signature,
  'GET', // 修改为 GET
  requestPath,
  requestBody,
  requestTimestamp,
  API_SECRET
)
console.log('结果:', result4.valid ? '❌ 不应通过' : '✅ 正确拒绝 - ' + result4.reason)

console.log('\n')

// ==================== Express.js 中间件示例 ====================

console.log('4. Express.js 中间件示例代码')
console.log('------------------------')

const middlewareCode = `
// Express.js API 签名验证中间件
const { hash, timingSafeEqual } = require('@ldesign/crypto')

function apiSignatureMiddleware(req, res, next) {
  const signature = req.headers['x-signature']
  const timestamp = parseInt(req.headers['x-timestamp'])
  const apiKey = req.headers['x-api-key']
  
  // 检查必需的头部
  if (!signature || !timestamp || !apiKey) {
    return res.status(401).json({ error: 'Missing authentication headers' })
  }
  
  // 从数据库获取API密钥对应的secret (示例)
  const apiSecret = getApiSecretByKey(apiKey)
  if (!apiSecret) {
    return res.status(401).json({ error: 'Invalid API key' })
  }
  
  // 获取请求体
  const body = JSON.stringify(req.body)
  
  // 验证签名
  const result = verifySignature(
    signature,
    req.method,
    req.path,
    body,
    timestamp,
    apiSecret,
    300000 // 5分钟
  )
  
  if (!result.valid) {
    return res.status(401).json({ error: 'Invalid signature', reason: result.reason })
  }
  
  next()
}

// 使用中间件
app.use('/api/v1/*', apiSignatureMiddleware)

app.post('/api/v1/users', (req, res) => {
  // 签名已验证，可以安全处理请求
  res.json({ success: true, message: 'User created' })
})
`

console.log(middlewareCode)

console.log('\n=== 示例完成 ===')

// 导出函数供其他模块使用
module.exports = {
  generateSignature,
  verifySignature
}

