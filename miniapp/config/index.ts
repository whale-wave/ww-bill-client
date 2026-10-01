import { defineConfig, type UserConfigExport } from '@tarojs/cli'

import devConfig from './dev'
import prodConfig from './prod'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(async (merge) => {
  const apiBaseUrl = process.env.BILL_MINIAPP_API_BASE_URL?.trim()
    || (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:4301' : '')
  if (!apiBaseUrl)
    throw new Error('小程序构建缺少接口地址：请设置 BILL_MINIAPP_API_BASE_URL，或使用 dev:weapp 进行本地开发')
  const fontBaseUrl = process.env.BILL_MINIAPP_FONT_BASE_URL?.trim()
    || (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:4331/fonts' : '')
  if (!fontBaseUrl)
    throw new Error('小程序构建缺少字体地址：请设置 BILL_MINIAPP_FONT_BASE_URL，指向 Web 静态资源的 /fonts 目录')

  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'miniapp',
    date: '2026-9-30',
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [
      "@tarojs/plugin-generator"
    ],
    defineConstants: {
      BILL_API_BASE_URL: JSON.stringify(apiBaseUrl),
      BILL_FONT_BASE_URL: JSON.stringify(fontBaseUrl),
    },
    copy: {
      patterns: [
        { from: '../packages/bill-ui/assets/whale-logo.png', to: 'dist/assets/bill-ui/whale-logo.png' },
        { from: '../packages/bill-ui/assets/whale-loading.png', to: 'dist/assets/bill-ui/whale-loading.png' },
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: 'vite',
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
    },
  }


  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
