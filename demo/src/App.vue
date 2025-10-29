<script setup lang="ts">
import { ref, computed } from 'vue'
import AESDemo from './components/AESDemo.vue'
import RSADemo from './components/RSADemo.vue'
import HashDemo from './components/HashDemo.vue'
import PasswordStrengthDemo from './components/PasswordStrengthDemo.vue'
import PerformanceDemo from './components/PerformanceDemo.vue'

/**
 * 演示标签页类型
 */
type DemoTab = 'aes' | 'rsa' | 'hash' | 'password' | 'performance'

/**
 * 当前激活的标签页
 */
const activeTab = ref<DemoTab>('aes')

/**
 * 标签页配置
 */
const tabs = [
  { id: 'aes', label: 'AES 加密', icon: '🔒' },
  { id: 'rsa', label: 'RSA 加密', icon: '🔑' },
  { id: 'hash', label: '哈希算法', icon: '#️⃣' },
  { id: 'password', label: '密码强度', icon: '💪' },
  { id: 'performance', label: '性能测试', icon: '⚡' },
] as const

/**
 * 切换标签页
 */
function switchTab(tabId: DemoTab) {
  activeTab.value = tabId
}
</script>

<template>
  <div class="app-container">
    <!-- 头部 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🔐</span>
          <h1 class="logo-text">@ldesign/crypto</h1>
        </div>
        <p class="subtitle">全面的加密解密解决方案</p>
      </div>
    </header>

    <!-- 标签导航 -->
    <nav class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="switchTab(tab.id as DemoTab)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- 内容区域 -->
    <main class="demo-content">
      <Transition name="fade" mode="out-in">
        <AESDemo v-if="activeTab === 'aes'" />
        <RSADemo v-else-if="activeTab === 'rsa'" />
        <HashDemo v-else-if="activeTab === 'hash'" />
        <PasswordStrengthDemo v-else-if="activeTab === 'password'" />
        <PerformanceDemo v-else-if="activeTab === 'performance'" />
      </Transition>
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <p>
        基于 
        <a href="https://github.com/ldesign/ldesign" target="_blank" rel="noopener">
          @ldesign/launcher
        </a>
        构建
      </p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem 1rem;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 3rem;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.logo-text {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.subtitle {
  color: #666;
  font-size: 1.125rem;
  margin: 0;
}

.tabs-nav {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.tab-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tab-button.active {
  background: #fff;
  border-color: #667eea;
  color: #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.tab-icon {
  font-size: 1.25rem;
}

.demo-content {
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-footer {
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 1.5rem;
  font-size: 0.875rem;
}

.app-footer a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.3s;
}

.app-footer a:hover {
  opacity: 0.8;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式 */
@media (max-width: 768px) {
  .logo-text {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .tabs-nav {
    gap: 0.25rem;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .demo-content {
    padding: 1rem 0.5rem;
  }
}
</style>


