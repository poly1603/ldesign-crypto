import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/crypto',
  description: '功能完整的加解密模块，支持主流加密算法和中国国密算法',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#007bff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:title', content: '@ldesign/crypto | 加密模块' }],
    ['meta', { name: 'og:site_name', content: '@ldesign/crypto' }],
    ['meta', { name: 'og:image', content: '/og-image.png' }],
    ['meta', { name: 'og:url', content: 'https://ldesign.com/crypto/' }]
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/symmetric' },
      { text: '演示', link: '/demo/playground' },
      { text: '示例', link: '/examples/basic-usage' },
      {
        text: '更多',
        items: [
          { text: '更新日志', link: '/changelog' },
          { text: '贡献指南', link: '/contributing' },
          { text: 'GitHub', link: 'https://github.com/ldesign/crypto' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装配置', link: '/guide/installation' },
            { text: '基础概念', link: '/guide/concepts' }
          ]
        },
        {
          text: '加密算法',
          items: [
            { text: '对称加密', link: '/guide/symmetric' },
            { text: '非对称加密', link: '/guide/asymmetric' },
            { text: '哈希算法', link: '/guide/hash' },
            { text: '国密算法', link: '/guide/sm-crypto' }
          ]
        },
        {
          text: '框架集成',
          items: [
            { text: 'Vue 3集成', link: '/guide/vue-integration' },
            { text: '通用JavaScript', link: '/guide/vanilla-js' }
          ]
        },
        {
          text: '高级功能',
          items: [
            { text: '高级功能', link: '/guide/advanced' },
            { text: '性能监控', link: '/guide/performance' },
            { text: '缓存机制', link: '/guide/caching' },
            { text: '插件开发', link: '/guide/plugin-development' },
            { text: '错误处理', link: '/guide/error-handling' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '对称加密', link: '/api/symmetric' },
            { text: '非对称加密', link: '/api/asymmetric' },
            { text: '哈希算法', link: '/api/hash' },
            { text: '国密算法', link: '/api/sm-crypto' },
            { text: 'Vue组合式API', link: '/api/vue-composables' },
            { text: '类型定义', link: '/api/types' }
          ]
        }
      ],
      '/demo/': [
        {
          text: '在线演示',
          items: [
            { text: '加密演练场', link: '/demo/playground' },
            { text: '对称加密演示', link: '/demo/symmetric' },
            { text: '国密算法演示', link: '/demo/sm-crypto' }
          ]
        }
      ],
      '/examples/': [
        {
          text: '代码示例',
          items: [
            { text: '基础使用', link: '/examples/basic-usage' },
            { text: 'Vue组件', link: '/examples/vue-component' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/crypto' }
    ],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024 LDesign Team'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/crypto/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: false
    }
  }
})
