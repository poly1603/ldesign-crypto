/**
 * 密码安全示例
 * 演示密码哈希、验证和安全存储的最佳实践
 */

const { KeyDerivation, RandomUtils, timingSafeEqual, PasswordStrength } = require('@ldesign/crypto')

console.log('=== 密码安全最佳实践示例 ===\n')

// ==================== 1. 密码哈希 (PBKDF2) ====================

console.log('1. 使用 PBKDF2 哈希密码')
console.log('------------------------')

/**
 * 哈希密码
 * @param {string} password - 明文密码
 * @returns {{hash: string, salt: string, algorithm: string, iterations: number}}
 */
function hashPassword(password) {
  // 生成随机盐值 (16字节 = 128位)
  const salt = RandomUtils.generateSalt(16)

  // 使用 PBKDF2 派生密钥
  const hash = KeyDerivation.pbkdf2(password, salt, {
    iterations: 100000, // OWASP 推荐最低 100,000 次
    keySize: 32, // 256 位
    hash: 'SHA256'
  })

  return {
    hash,
    salt,
    algorithm: 'pbkdf2-sha256',
    iterations: 100000
  }
}

/**
 * 验证密码
 * @param {string} password - 用户输入的密码
 * @param {string} storedHash - 存储的哈希值
 * @param {string} salt - 盐值
 * @param {number} iterations - 迭代次数
 * @returns {boolean} 是否匹配
 */
function verifyPassword(password, storedHash, salt, iterations = 100000) {
  // 使用相同的盐值和参数重新哈希
  const hash = KeyDerivation.pbkdf2(password, salt, {
    iterations,
    keySize: 32,
    hash: 'SHA256'
  })

  // 使用恒定时间比较 (防止时序攻击)
  return timingSafeEqual(hash, storedHash)
}

// 示例使用
const userPassword = 'MySecurePassword123!'
console.log('原始密码:', userPassword)

const hashed = hashPassword(userPassword)
console.log('\n哈希结果:')
console.log('- 哈希值:', hashed.hash.substring(0, 40) + '...')
console.log('- 盐值:', hashed.salt)
console.log('- 算法:', hashed.algorithm)
console.log('- 迭代次数:', hashed.iterations)

// 验证正确的密码
const isValid = verifyPassword(userPassword, hashed.hash, hashed.salt, hashed.iterations)
console.log('\n✅ 正确密码验证:', isValid ? '通过' : '失败')

// 验证错误的密码
const isInvalid = verifyPassword('WrongPassword', hashed.hash, hashed.salt, hashed.iterations)
console.log('❌ 错误密码验证:', isInvalid ? '不应通过' : '正确拒绝')

console.log('\n')

// ==================== 2. 密码强度检查 ====================

console.log('2. 密码强度评估')
console.log('------------------------')

/**
 * 检查密码强度
 * @param {string} password - 密码
 * @returns {{score: number, strength: string, feedback: string[]}}
 */
function checkPasswordStrength(password) {
  const criteria = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }

  const result = {
    score: 0,
    strength: 'Very Weak',
    feedback: []
  }

  // 长度检查
  if (password.length < criteria.minLength) {
    result.feedback.push(`密码至少需要 ${criteria.minLength} 个字符`)
  } else {
    result.score += 20
  }

  // 额外长度加分
  if (password.length >= 12) result.score += 10
  if (password.length >= 16) result.score += 10

  // 大写字母
  if (!/[A-Z]/.test(password)) {
    result.feedback.push('添加大写字母可以增强密码强度')
  } else {
    result.score += 15
  }

  // 小写字母
  if (!/[a-z]/.test(password)) {
    result.feedback.push('添加小写字母可以增强密码强度')
  } else {
    result.score += 15
  }

  // 数字
  if (!/[0-9]/.test(password)) {
    result.feedback.push('添加数字可以增强密码强度')
  } else {
    result.score += 15
  }

  // 特殊字符
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.feedback.push('添加特殊字符可以增强密码强度')
  } else {
    result.score += 15
  }

  // 字符多样性
  const uniqueChars = new Set(password).size
  if (uniqueChars > password.length * 0.7) {
    result.score += 10
  }

  // 常见密码检查
  const commonPasswords = ['password', '123456', 'qwerty', 'admin']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    result.score = Math.max(0, result.score - 50)
    result.feedback.push('避免使用常见密码')
  }

  // 评分转换为强度等级
  if (result.score >= 80) {
    result.strength = 'Very Strong'
  } else if (result.score >= 60) {
    result.strength = 'Strong'
  } else if (result.score >= 40) {
    result.strength = 'Medium'
  } else if (result.score >= 20) {
    result.strength = 'Weak'
  }

  if (result.feedback.length === 0) {
    result.feedback.push('密码强度良好!')
  }

  return result
}

// 测试不同强度的密码
const passwordTests = [
  '123456',
  'password',
  'Password1',
  'MyPassword123',
  'MySecureP@ssw0rd!',
  'Tr0ub4dour&3Complex!'
]

passwordTests.forEach(pwd => {
  const strength = checkPasswordStrength(pwd)
  console.log(`\n密码: "${pwd}"`)
  console.log(`强度: ${strength.strength} (${strength.score}/100)`)
  console.log('建议:')
  strength.feedback.forEach(fb => console.log(`  - ${fb}`))
})

console.log('\n')

// ==================== 3. 密码存储格式 (PHC字符串) ====================

console.log('3. PHC 字符串格式')
console.log('------------------------')

/**
 * 将密码哈希编码为 PHC 字符串格式
 * 格式: $algorithm$param1,param2$salt$hash
 */
function encodePHC(hashedPassword) {
  return `$${hashedPassword.algorithm}$i=${hashedPassword.iterations}$${hashedPassword.salt}$${hashedPassword.hash}`
}

/**
 * 解析 PHC 字符串
 */
function parsePHC(phcString) {
  const parts = phcString.split('$').filter(Boolean)

  if (parts.length !== 4) {
    throw new Error('Invalid PHC string format')
  }

  const [algorithm, params, salt, hash] = parts
  const iterations = parseInt(params.split('=')[1])

  return {
    algorithm,
    iterations,
    salt,
    hash
  }
}

// 示例
const phcString = encodePHC(hashed)
console.log('PHC 字符串:')
console.log(phcString)

console.log('\n解析结果:')
const parsed = parsePHC(phcString)
console.log(JSON.stringify(parsed, null, 2))

console.log('\n')

// ==================== 4. 数据库存储示例 ====================

console.log('4. 数据库存储示例 (伪代码)')
console.log('------------------------')

const dbExampleCode = `
// 用户注册
async function registerUser(username, password, email) {
  // 1. 检查密码强度
  const strength = checkPasswordStrength(password)
  if (strength.score < 40) {
    throw new Error('Password too weak: ' + strength.feedback.join(', '))
  }
  
  // 2. 哈希密码
  const hashedPassword = hashPassword(password)
  
  // 3. 存储到数据库
  await db.users.insert({
    username,
    email,
    password: encodePHC(hashedPassword), // 存储 PHC 格式
    createdAt: new Date(),
    passwordChangedAt: new Date()
  })
}

// 用户登录
async function loginUser(username, password) {
  // 1. 从数据库获取用户
  const user = await db.users.findOne({ username })
  if (!user) {
    throw new Error('User not found')
  }
  
  // 2. 解析存储的密码
  const parsed = parsePHC(user.password)
  
  // 3. 验证密码
  const isValid = verifyPassword(
    password,
    parsed.hash,
    parsed.salt,
    parsed.iterations
  )
  
  if (!isValid) {
    throw new Error('Invalid password')
  }
  
  // 4. 检查是否需要重新哈希 (如果迭代次数更新了)
  const CURRENT_ITERATIONS = 100000
  if (parsed.iterations < CURRENT_ITERATIONS) {
    // 用新参数重新哈希
    const newHashed = hashPassword(password)
    await db.users.update(
      { username },
      { password: encodePHC(newHashed) }
    )
  }
  
  return { success: true, userId: user.id }
}

// 密码重置
async function resetPassword(userId, newPassword) {
  // 1. 检查密码强度
  const strength = checkPasswordStrength(newPassword)
  if (strength.score < 40) {
    throw new Error('Password too weak')
  }
  
  // 2. 检查是否与旧密码相同 (可选)
  const user = await db.users.findOne({ id: userId })
  const parsed = parsePHC(user.password)
  const isSame = verifyPassword(newPassword, parsed.hash, parsed.salt, parsed.iterations)
  if (isSame) {
    throw new Error('New password must be different from old password')
  }
  
  // 3. 哈希新密码
  const hashedPassword = hashPassword(newPassword)
  
  // 4. 更新数据库
  await db.users.update(
    { id: userId },
    { 
      password: encodePHC(hashedPassword),
      passwordChangedAt: new Date()
    }
  )
}
`

console.log(dbExampleCode)

console.log('\n')

// ==================== 5. 安全建议 ====================

console.log('5. 密码安全最佳实践')
console.log('------------------------')
console.log('✅ 使用强密钥派生函数 (PBKDF2, scrypt, Argon2)')
console.log('✅ 使用高迭代次数 (PBKDF2: 100,000+)')
console.log('✅ 使用随机盐值 (每个密码不同)')
console.log('✅ 使用恒定时间比较防止时序攻击')
console.log('✅ 强制密码复杂度要求')
console.log('✅ 限制登录尝试次数')
console.log('✅ 使用 2FA (双因素认证)')
console.log('✅ 定期提示用户更新密码')
console.log('✅ 检测常见密码和泄露密码')
console.log('✅ 使用 HTTPS 传输密码')

console.log('\n=== 示例完成 ===')

// 导出函数
module.exports = {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
  encodePHC,
  parsePHC
}

