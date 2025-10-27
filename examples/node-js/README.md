# Node.js 示例

这些示例演示如何在 Node.js 环境中使用 `@ldesign/crypto`。

## 运行示例

```bash
# 安装依赖
pnpm install

# 运行基础加密示例
pnpm run basic

# 运行 API 签名示例
pnpm run api-signature

# 运行密码安全示例
pnpm run password

# 运行所有示例
pnpm run all
```

## 示例列表

### 1. basic-encryption.js
基础加密示例，包括:
- AES 对称加密
- 哈希计算 (MD5, SHA-256, SHA-512)
- HMAC 消息认证
- RSA 非对称加密
- 数字签名
- Base64 编码/解码

### 2. api-signature.js
API 签名和验证示例，包括:
- 使用 HMAC 生成 API 签名
- 验证 API 请求签名
- 防止重放攻击
- 防止时序攻击
- Express.js 中间件示例

### 3. password-security.js
密码安全最佳实践，包括:
- 使用 PBKDF2 哈希密码
- 密码强度评估
- PHC 字符串格式
- 数据库存储示例
- 安全建议

## 主要特性

- ✅ 完整的加密/解密示例
- ✅ 安全最佳实践
- ✅ 生产环境可用的代码
- ✅ 详细的注释和说明
- ✅ 错误处理示例
- ✅ 性能优化建议

## 相关文档

- [API 文档](../../docs/api/)
- [安全指南](../../docs/security.md)
- [更多示例](../../docs/examples/)

