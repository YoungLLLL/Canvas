# Canvium Gallery 阶段 4 工程基础

> 状态：已建立并验证  
> 日期：2026-07-20

## 工程边界

- 正式应用：`apps/web/`
- 视觉与交互迁移基线：`experiments/canvas-demo/`（保留，不覆盖）
- 当前数据适配原型：根目录 `data/` 与 `server.mjs`（阶段 5 再迁移）

正式应用采用 Next.js 16 App Router、React 19、TypeScript 和 Zod。根路径通过 `proxy.ts` 按已保存语言或浏览器语言进入 `zh` / `en`；5 类稳定内容路由与信息架构规范一致。

## 运行时契约

`apps/web/src/schemas/catalog.ts` 定义并校验：

- 来源、博物馆和艺术家；
- 首选/备选图片、尺寸、LQIP、IIIF、缩放与健康状态；
- 作品本体、数字图片、元数据与长描述的分层权利；
- 展示资格状态和原因；
- 作品及分页响应。

`apps/web/src/schemas/ai-content.ts` 将既有 AI 设计稿落实为来源、定位、视觉证据、原子主张、生成分区、发布状态和人格版本的运行时契约。关键跨字段约束包括：可展示作品必须有 CC0 首选图；事实必须有直接来源或可见证据；推测必须包含限定语。

## 验证命令

在 `apps/web/` 下运行：

```bash
npm run check
npm run build
npm run test:e2e
```

2026-07-20 验证结果：格式、ESLint、路由类型、TypeScript、6 个单元测试、生产构建和 1 个 Chromium 路由测试全部通过。

`npm audit` 仍报告 2 个中等级项，均来自 Next.js 16.2.10 内置 PostCSS 的 `GHSA-qx2v-qp2m-jg93`，当前报告为 `fixAvailable: false`；无高危或严重项。升级 Next.js 时应重新审计。
