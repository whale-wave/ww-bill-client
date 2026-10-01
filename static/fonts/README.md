# 展示字体

Web 保留 Fontsource 的 Unicode 分片加载。小程序通过 `loadFontFace` 加载本目录的完整可变字体；资源由 Web 静态服务提供，不打入微信代码包。

| 文件 | 上游版本 | SHA256 |
| --- | --- | --- |
| `noto-sans-sc-v2.004-930a260f.woff2` | Noto Sans SC 2.004-H2 | `930a260f7fee98926d51c905ee054a2d6f23f58e30bb3031c45db4d5422b0044` |
| `nunito-v3.602-827cba27.woff2` | Nunito 3.602 | `827cba279b7510b4e0bca7e1aab63a1b902d8ef531df0577d7c20e63f2551ba3` |

版本与当前 Web 的 `@fontsource-variable/noto-sans-sc@5.3.0`、`@fontsource-variable/nunito@5.3.0` 字体 name table 对照一致。

## 来源与许可

- [Noto Sans SC 原始 TTF](https://raw.githubusercontent.com/google/fonts/a85815a42757630ce188fdad368c2dfc444d4773/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf)，Google Fonts 固定提交 `a85815a42757630ce188fdad368c2dfc444d4773`。
- [Nunito 原始 TTF](https://raw.githubusercontent.com/google/fonts/8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5/ofl/nunito/Nunito%5Bwght%5D.ttf)，固定提交 `8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5`。
- 对应 OFL 1.1 许可保存为 `noto-sans-sc-OFL.txt`、`nunito-OFL.txt`。

使用 FontTools 4.66.1（Brotli 1.2.0）将 TTF 保存为 WOFF2：读取 `TTFont`，设置 `flavor = 'woff2'` 后保存。未删减字形、改名或调整字重轴。

## 运行配置

本地 Web 静态服务为 `http://127.0.0.1:4331/fonts`。构建设置 `BILL_MINIAPP_FONT_BASE_URL`；部署时填写可访问的 HTTPS 静态资源目录，保留 `font/woff2` MIME 和字体跨域响应头。文件名含版本及内容哈希，资源更新应生成新名称并同步公共字体清单。

Noto 完整字体约 7.8 MB，首次下载有成本，失败时保留系统字体回退。当前只验证开发者工具；真机下载、旧系统字体兼容和线上静态资源配置需单独验收。
