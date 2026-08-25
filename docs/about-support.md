# 关于与支持入口

Android 安装包内的“我的”和“设置”页面都会进入关于与支持页，页面内置长期稳定的官方渠道：

- GitHub 主页：<https://github.com/layouwen>
- GitHub Releases：<https://github.com/whale-wave/ww-bill-client/releases>
- QQ 群：鲸浪记账交流群（1108214948）

发布新 Android 包时，只需要创建新的 GitHub Release 并上传 APK。旧版本仍会通过 Releases 地址找到最新安装包；如果 QQ 加群链接重新生成，需要同步更新 `src/shared/config/app-info.ts` 中的 `qqGroupJoinUrl`。
