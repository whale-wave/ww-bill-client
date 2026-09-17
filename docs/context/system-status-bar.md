# 系统状态栏与页面背景同步

`src/shared/lib/system-status-bar.ts` 在 React 启动前读取外观背景，并在页面容器挂载、class/style 改变、外观切换、窗口尺寸改变和应用恢复时更新 `theme-color` 与 `--ww-status-bar-background`。`html/body` 使用同一颜色，避免浏览器画布与页面之间露出白色。线性渐变使用第一个色阶；它是顶部颜色的近似值，斜向渐变不承诺逐像素一致。顶部元素若有独立背景，则以它覆盖页面背景。

安卓通过本地 `NativeStatusBar` 插件同步原生窗口、WebView 父容器与 WebView 的背景。Android 15+ 保留系统强制的透明状态栏和 Capacitor 的安全区处理；旧 WebView 留出的原生区域也使用同步后的颜色。Android 14 及以前同时设置状态栏背景。文字根据背景亮度选择黑色或白色，恢复应用或系统配置改变后重新应用。

iOS 桌面快捷方式保持 `apple-mobile-web-app-status-bar-style=default`，通过动态 `theme-color` 和页面画布背景交由 WebKit 着色。没有改成 `black-translucent`，以免浅色主题下状态栏文字对比度不足。iOS 的快捷方式没有原生状态栏 API，实际着色行为受系统版本控制，需要在目标 iPhone 上验收；不能保证所有 iOS 版本都支持动态着色。

网页发布后快捷方式重新打开才能加载变更；安卓本地插件需要重新打包安装。此改动本身不等于已发布、已安装或已真机验收。

参考：[Capacitor SystemBars](https://capacitorjs.com/docs/apis/system-bars)、[Apple 状态栏 meta 标签](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html)、[WebKit theme-color 支持](https://webkit.org/blog/11989/new-webkit-features-in-safari-15/)。
