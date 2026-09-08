# 关于与支持入口

“我的”页面提供直达“关于与支持”的入口，页面内置长期稳定的官方渠道和项目支持方式：

- GitHub 主页：<https://github.com/layouwen>
- GitHub Releases：<https://github.com/whale-wave/ww-bill-client/releases>
- QQ 群：鲸浪记账交流群（1108214948）
- 项目支持：展示与官网相同的支付宝赞助二维码，并支持保存到相册或下载

发布新 Android 包时，只需要创建新的 GitHub Release 并上传 APK。旧版本仍会通过 Releases 地址找到最新安装包；如果 QQ 加群链接重新生成，需要同步更新 `src/shared/config/app-info.ts` 中的 `qqGroupJoinUrl`。官网赞助二维码变更时，需要同步替换 `src/assets/support/sponsor-alipay.png`。
