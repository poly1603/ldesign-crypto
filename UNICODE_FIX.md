# Unicode编码修复说明

## 问题描述

在演示组件中，当用户输入包含中文字符的文本进行加密演示时，会出现以下错误：

```
Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.
```

## 问题原因

JavaScript的 `btoa()` 和 `atob()` 函数只能处理Latin1字符集（0-255），当遇到中文或其他Unicode字符时就会报错。

## 解决方案

创建了安全的Base64编码/解码函数，支持Unicode字符：

### safeBase64Encode(str)
- 使用 `TextEncoder` 将字符串转换为UTF-8字节
- 将字节数组转换为二进制字符串
- 使用 `btoa()` 编码二进制字符串
- 降级方案：十六进制编码

### safeBase64Decode(encodedStr)
- 使用 `atob()` 解码Base64字符串
- 将二进制字符串转换为字节数组
- 使用 `TextDecoder` 将字节数组转换为UTF-8字符串
- 降级方案：十六进制解码

## 修复的文件

1. **CryptoPlayground.vue** - 主要加密演示组件
   - 替换了所有 `btoa()` 调用为 `safeBase64Encode()`
   - 替换了所有 `atob()` 调用为 `safeBase64Decode()`

2. **SMCryptoDemo.vue** - 国密算法演示组件
   - 修复了SM2、SM4加密和签名函数中的编码问题

3. **SymmetricDemo.vue** - 对称加密演示组件
   - 修复了AES、DES、3DES加密函数中的编码问题

## 测试验证

创建了测试页面 `test-unicode-fix.html` 来验证修复效果：

```bash
# 启动开发服务器
pnpm run docs:dev

# 访问测试页面
http://localhost:5177/test-unicode-fix.html
```

## 使用示例

现在用户可以在演示页面中输入中文文本进行加密测试，不会再出现编码错误：

```
输入: "你好世界！这是一个测试。"
输出: 正常的加密结果，无错误
```

## 兼容性

- ✅ 支持所有Unicode字符（包括中文、emoji等）
- ✅ 向后兼容原有的Latin1字符
- ✅ 提供降级方案，确保在任何环境下都能工作
- ✅ 不影响实际的加密库功能，仅修复演示组件

## 注意事项

这个修复只影响演示组件中的模拟加密函数，不会影响实际的加密库实现。实际的加密库应该有自己的Unicode处理机制。
