# iOS 快捷记账确认流程

## 用户流程

iPhone 快捷指令由背部轻点触发，依次执行截屏、本机文字识别、HTTPS POST 和打开确认地址。客户端不接收原始截图，只接收服务端草稿中的 OCR 文字与候选字段。

设置入口为 `/settings/shortcut-bookkeeping`，确认入口为 `/bookkeeping/import`。确认页必须完成以下动作后才能创建正式记录：

1. 用地址中的一次性 handoff code 通过 POST 领取草稿。
2. 领取成功后立即从地址栏移除 code，后续使用新生成的 review code；领取 code 仅临时保存在当前标签页，用于刷新或响应丢失后的恢复。
3. 用户明确选择支出或收入、目标账本和分类，并核对金额、备注及日期。
4. 用户点击记账编辑器的完成按钮后提交正式记录。
5. 用户也可以主动放弃，立即清除 OCR 原文、候选字段并使草稿失效。

## 官方快捷指令模板

正式模板固定请求 `https://abill.easyhappy.top/api/shortcut-drafts`，按以下顺序配置：

1. “截屏”。
2. “从图像中提取文本”，输入选择上一步截图。
3. “生成 UUID”，作为 `clientRequestId`。
4. “当前日期”，使用 ISO 8601 格式作为 `capturedAt`。
5. “获取 URL 内容”，方法为 POST，请求正文为 JSON：
   - `rawText`：提取的文字；
   - `clientRequestId`：生成的 UUID；
   - `capturedAt`：格式化后的当前日期。
6. 请求头 `Authorization` 设置为 `Bearer ` 加凭证。凭证文本必须配置成快捷指令的导入问题，提示用户粘贴鲸浪页面刚复制的凭证；公共模板中不得填写真实凭证。
7. 从响应依次读取 `data` 和 `confirmationUrl`。有值时使用“打开 URL”，无值时显示“提交失败，请检查网络或重新创建凭证”。

本地验证时使用当前页面展示的局域网请求地址。验证通过后复制快捷指令，将请求地址替换为上述生产地址，再创建 iCloud 分享链接。生产构建通过 `VITE_IOS_SHORTCUT_URL=https://www.icloud.com/shortcuts/<id>` 注入链接；只接受 `https://www.icloud.com/shortcuts/` 下的分享地址。未配置或地址非法时，页面保留“创建凭证”并自动展开手动配置。

在 GitHub 仓库变量中设置 `VITE_IOS_SHORTCUT_URL` 后重新构建客户端镜像。更新模板需要发布新的 iCloud 分享链接、替换该变量并重新构建；不能把测试凭证带入共享模板，发布前应撤销制作和验收期间使用的临时凭证。

## 客户端安全边界

- 主账号 JWT 只用于登录后的领取、放弃和确认接口，不进入快捷指令或 URL。
- 快捷指令使用独立的 draft-only bearer credential；完整值只在创建时显示一次。
- OCR 原文和 review code 只保存在当前页面内存中，不写入 React Query 持久化缓存；领取 code 只进入当前标签页的 `sessionStorage`，确认或放弃后立即清除。
- iOS 的 Open URLs 通常进入 Safari，不能依赖主屏幕 PWA 的登录状态；首次使用可能需要在 Safari 再登录一次。

## 维护提示

确认页复用现有账本权限、分类查询和记录编辑器。服务端返回的金额、类型、商户和日期都只是候选；不能绕过用户选择和服务端最终校验。真机验收需要覆盖目标 iOS 版本、支付宝和微信付款截图、Safari 登录回跳、连续两次背部轻点以及草稿放弃。
