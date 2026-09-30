# Android 安装包更新流程

## 原因

Gitee 的 APK 附件可能返回 `Content-Type: application/zip`。APK 本身是 ZIP 容器，系统浏览器或文件管理器可能据此把下载结果交给解压器。仅保证 URL 以 `.apk` 结尾，不能保证手机调起安装器。

## 客户端流程

Android 的版本弹窗和“关于与支持”更新按钮调用 `NativeAppUpdate`，不再把 APK 链接交给 `Browser.open`：

1. 从已发布版本接口读取 HTTPS 下载地址和 `versionCode`。
2. 原生线程下载到应用私有缓存，只接受 HTTPS 跳转，限制文件大小。
3. 使用 Android 包解析器校验 APK 包名等于当前应用包名，版本号等于发布记录。
4. 通过已有 `FileProvider` 生成 `content://` URI，以 APK MIME 和 `ACTION_INSTALL_PACKAGE` 调起系统安装器。安装仍需用户确认；Android 8 及以上若尚未允许此来源安装，则先进入对应系统设置，返回后重新点击更新。

文件管理器和解压器不参与 App 内更新。系统仍会检查 APK 签名是否与已安装应用一致。

## 发布与验收

- 新客户端代码只有在下一版 APK 安装后生效。已安装旧版仍会打开浏览器，需先从官网安装新版。
- 发布记录必须指向实际可下载的完整 APK，`versionCode` 必须与包内一致。
- 在真机上分别验证：正常更新、首次安装来源授权后重试、下载中断、错误文件、版本号不符，以及旧版升级到新版。编译成功不等于设备安装验收。
- 官网等浏览器下载入口仍应尽量由可控下载服务返回 `application/vnd.android.package-archive` 和带 `.apk` 后缀的 `Content-Disposition`；这不替代 App 内原生安装流程。
