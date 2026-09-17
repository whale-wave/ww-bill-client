# 客户端网络错误定位

`AxiosError: Network Error` 表示浏览器没有向 Axios 提供可用的 HTTP 响应，不等于服务端返回 500。DNS、TLS、CORS、混合内容、连接中断等都可能产生这类异常；前端无法可靠地自动判定具体原因。

## 查看已有事件

先打开 Sentry 完整事件，查看 `http` 上下文中的方法、接口路径与状态，再查看 HTTP breadcrumbs、浏览器/系统和 release/build_id。通知中的 Request URL 通常是页面 URL，不是失败接口地址。项目使用 Hash Router，页面 URL `/` 也不能确定用户实际停留在哪个业务页面。

以接口、用户、版本和事件时间交叉查看网关访问/错误日志与服务端日志。Sentry 显示 UTC 时须换算日志时区；例如 2026-09-16 10:25:33 UTC 是北京时间当天 18:25:33。查看前后数分钟是否有同接口或同版本错误集中出现。网关有记录而应用没有记录时，检查代理/upstream；请求日志不存在时继续检查域名、TLS、CORS/预检和客户端网络，不能仅凭日志缺失断言客户端原因。

浏览器能够复现时，同时查看 Network 与 Console；特别核对实际请求地址、OPTIONS 预检、跨域响应头与 HTTPS 页面是否请求 HTTP。旧事件无法补录此次新增的诊断字段。

## 新增诊断字段

- Tags：`monitoring_kind=transport`、`transport_kind`、`http_method`、`axios_error_code`。
- `http`：实际 API origin/path、XHR 状态和 readyState、错误类型/错误码、请求耗时 `duration_ms`、配置超时 `timeout_ms`。
- `client_state`：实际 Hash 路由、页面可见性、是否受 Service Worker 控制。
- `network`：`navigator.onLine`、浏览器支持时的连接类型、估算 RTT 和带宽。
- HTTP breadcrumb：在捕获异常前记录本次失败请求，保留方法、路径、错误类型/错误码和耗时；成功和 HTTP 错误记录使用 Axios 的地址拼接规则。

XHR `status=0` 表示没有可用 HTTP 状态；超时对调用方仍使用原有 `statusCode=408`，诊断上下文不会伪装成服务端返回 408。`onLine=true` 不代表 API 可达，连接类型/RTT/带宽是浏览器估算值，缺少这些字段不代表 SDK 故障。耗时接近配置超时只能作为线索。

已知离线失败继续不发送 Sentry 事件，主动取消请求也不作为网络事件发送；调用方错误结构和原有提示逻辑保留。`silent` 只控制提示，线上网络/超时异常仍会上报。

## 隐私与 trace

新增上下文只包含白名单诊断字段，不复制 Axios config、请求头、请求/响应 body、params。地址去掉凭证、query、fragment，家庭/账本邀请链接中的邀请码脱敏；路由去掉 query，并脱敏邀请码。沿用用户内部 ID、应用版本和构建信息。

现有 browser tracing 和 API trace 传播配置保留；默认 transaction 采样率 5%，不能保证每次错误都有完整服务端 trace。后续需要精确关联网关和应用日志时，应另行统一请求 ID 的生成、回传、跨域暴露和日志记录，不能仅添加一个前端字段就声称已关联。


## 设备信息

所有客户端异常新增 `client_device` 上下文：平台、User-Agent、语言、时区、屏幕/视口尺寸（CSS 像素）、像素比、浏览器支持时的屏幕方向，以及是否以独立窗口运行。信息在事件发送前采集，避免窗口大小变化后仍记录启动时尺寸。

Web 事件只保留 `User-Agent` 请求头，供 Sentry 识别浏览器、系统和设备类型；Authorization、Cookie、Referer 等其他请求头仍删除。Web 环境无法保证拿到准确的手机型号，不使用 UA 猜测型号。

Android/iOS 复用当前 Sentry Capacitor 默认 DeviceContext 集成提供的原生 `device` 和 `os`，不新增设备插件、不覆盖原生信息。若原生上下文提供相应字段，增加 `device_model`、`device_brand`、`os_name`、`os_version` tags，便于查询和告警摘要展示。原生设备名称、ID、序列号删除，不额外采集持久设备标识。原生上下文是否成功获取需在新安装包的完整事件中验收；本地模拟测试不等于真机验证。
