# Motion `AnimateView` / View Transitions 调研（2026-09-17）

## 结论

**可以纳入系统的中期演进项，但不能直接接入当前客户端。** Motion 新增的能力实际名为 `AnimateView`：它已不再是 Motion+ 早期访问功能，而是从 `motion/react-animate-view` 单独导入的开源入口。它适合少量、完整页面的切换或明确的共享元素，不适合取代现有记账、拖拽、滑动等可中断的微交互。

当前各前端的实装版本都未满足该入口的组合要求：

| 前端 | 已安装的 Motion / React | `AnimateView` 可用性 | 结论 |
| --- | --- | --- | --- |
| `ww-bill-client`（移动端） | Motion 12.40.0；React 18.3.1 | 否 | 同时要跨 React 19.3、Motion 13.4、旧 Router 6 的升级，成本最高。 |
| `ww-bill-admin` | Motion 12.40.0；React 19.2.x | 否 | React 只差一个小版本，但 Motion 仍没有该导出。 |
| `ww-bill-website` | Motion 12.43.0；React 19.2.x | 否 | 三者中最接近，适合作为获批依赖升级后的第一条 PoC 路径。 |

其中客户端还额外受 `react-router-dom@6.24.1` 约束：

- 三个已安装 Motion 包的 `exports` 中都没有 `./react-animate-view`，解析该入口会失败；npm 最新 `motion` 是 13.4.0，且该入口在此版本的发布元数据中才出现。
- Motion 官方要求 `AnimateView` 使用 React 和 React DOM **19.3+**；其他 `motion/react` API 才继续支持 React 18。因此当前 React 18 不能仅升级 Motion 来启用它。
- 当前安装的 React Router 6.24.1 也没有其后续的 `viewTransition` 路由 API。升级到当前 React Router 后，可选择它自己的原生浏览器方案；但该方案是 `document.startViewTransition()`，不是 Motion `AnimateView` / React `<ViewTransition>` 的同一套协调机制。

所以本轮**不建议为动效单独推进 React 19、Router 和 Motion 的组合升级**。保留现有 `motion/react`、`MotionProvider`、系统减少动态与长者模式处理；等 React 19 升级被其它业务需求批准时，优先在网站做一个受控 PoC，再评估管理端和移动端。

## 最新能力是什么

`AnimateView` 把 Motion 的 mini `animate()`、Spring 参数与 React 19.3 的 `<ViewTransition>` 边界组合起来。包装的节点可处理：

- `enter` / `exit`：插入、移除时的过渡；
- `update`：内容、样式、尺寸或位置变化；
- `share`：两个视图中相同 `name` 的共享元素；
- `transition`：全局或上述各阶段的时长、缓动、Spring 等参数。

触发更新必须放进 React 的 `startTransition`。默认是浏览器的交叉淡入淡出；为 `enter`、`exit`、`update` 或 `share` 指定值会取代默认淡化。一个共享 `name` 在任一视图中重复都会使动画失败，名称必须以业务 ID 保持全局唯一。

示意（**非当前代码可用示例**）：

```
import { startTransition, useState } from 'react';
import { AnimateView } from 'motion/react-animate-view';

function RecordPreview() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <>
      <button onClick={() => startTransition(() => setIsDetailOpen(true))}>
        查看详情
      </button>
      {isDetailOpen && (
        <AnimateView name="bill-record-preview-42" transition={{ duration: 0.2 }}>
          <RecordDetail />
        </AnimateView>
      )}
    </>
  );
}
```

## 与鲸浪记账的契合度

| 场景 | 判断 | 原因 |
| --- | --- | --- |
| 记录卡片到详情、账本卡片到详情 | 适合做 PoC | 是明确的全视图切换；可将缩略信息和详情头图设为唯一共享元素。 |
| 设置页、二级资料页的前进切换 | 可选 | 可用短暂交叉淡化；不应给全部路由套一个全局边界。 |
| 记账成功反馈、分类选择、按钮反馈 | 不适合替换 | 这些需要即时响应和可打断；Motion 官方明确认为 View Transition 不可中断，更适合页面级切换。 |
| 记录列表滚动、拖拽排序、日历横滑 | 不适合替换 | 截图式过渡会增加内存/绘制开销，且会与现有 `m`、手势和滑动导航竞争。 |
| Android / iOS Capacitor 容器 | 先真机验证 | 原生 View Transition 由嵌入 WebView 决定，不由 Capacitor 版本或 Android minSdk 单独保证；不能把桌面浏览器成功当作 App 验收。 |

该项目使用 `createHashRouter`，大量跳转来自 `useNavigate` 和标签手势。React 的官方说明还指出：基于旧 `popstate` 的后退导航会跳过 View Transition，除非路由器使用 Navigation API。因此即使完成升级，也应把“系统返回是否动效”作为 PoC 验收项，而不要承诺所有前进/后退路径一致。

## 浏览器与可访问性边界

- View Transition 是浏览器快照旧、新视图，抑制中间绘制后以 CSS 动画过渡；同文档 SPA 过渡在 Chrome 111 起可用。当前 Chrome 官方的支持表同时列出 Chromium 111、Firefox 144、Safari 18；实际 Capacitor WebView 仍要按目标设备检测 `document.startViewTransition`。
- 不支持 API 时应直接完成原有状态更新，动效只是渐进增强，不能阻塞导航、保存、错误提示或焦点管理。
- 过渡期间是截图层而非可持续交互的页面；官方 Motion 文档将它描述为不可中断，适合页面级切换。因此要防止用户快速连点造成排队或陈旧的视觉状态。
- React 不会自动尊重 `prefers-reduced-motion`。项目现有 `MotionProvider` 已将系统减少动态和长者模式汇为 `shouldReduceMotion`；将来新增 View Transition 时，必须在 CSS 和触发层复用这个规则，禁用或显著降低该动画。
- React 在 View Transition 前会等待数据、CSS，并最多等 500ms 字体；图片边界也会等待图片加载。因此不要把网络依赖的大页面或整张长记录列表放进同一边界，以免导航观感变慢。

## 两条实现路线（以后再选）

1. **优先的 Motion 路线：** 在获批升级 `react`、`react-dom` 至 19.3+，并升级 `motion` 至 13.4+ 后，先在 `ww-bill-website` 选一个“卡片 → 详情”路径 PoC。保持现有 Motion 微交互；用 `AnimateView` 只标注页面主体和一个共享元素。
2. **较低耦合的 Router 路线：** 以后升级 React Router 时，对少量 `Link` / `navigate` 传入 `viewTransition`。这是原生 `document.startViewTransition()` 包装，基本效果是交叉淡化；它不需要把 Motion 当成路由框架，也不能与 React `<ViewTransition>` / `AnimateView` 混用为同一次转场。

PoC 的最低验收：Chrome、Android WebView、iOS WKWebView 各验证一次；前进、返回、冷启动后的首个跳转、慢网懒加载、`prefers-reduced-motion`、长者模式，以及保存/失败提示期间的焦点和可操作性。通过后再决定是否扩大到第二条页面路径。

## 一手来源

- Motion 官方：[`AnimateView` 文档](https://motion.dev/docs/react-animate-view)（安装要求、独立入口、`startTransition`、属性、性能/适用范围）。
- React 官方：[`<ViewTransition>` 参考](https://react.dev/reference/react/ViewTransition)（触发条件、命名约束、减少动态、加载等待、路由/后退限制）。
- React Router 官方：[View Transitions](https://reactrouter.com/how-to/view-transitions)（`Link` / `NavLink` / `Form` 的 `viewTransition` 与 `navigate(..., { viewTransition: true })`，以及使用 `document.startViewTransition()`）。
- Chrome 团队：[View Transition API](https://developer.chrome.com/docs/web-platform/view-transitions/)（同文档过渡机制、特性检测和当前官方支持表）。
- npm 注册表：[`motion@latest`](https://registry.npmjs.org/motion/latest)、[`react@latest`](https://registry.npmjs.org/react/latest)（2026-09-17 查询：Motion 13.4.0、React 19.3.0）。
