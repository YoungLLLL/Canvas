# Canvium Gallery

> 正式名称：`Canvium Gallery`；简称与主字标：`Canvium`。

一座专注二维绘画、连接真实美术馆与博物馆开放馆藏、高清作品观看和可信艺术家对话的线上美术馆。

## 当前阶段

项目已有可运行的静态 Demo、开放馆藏适配层、梵高人格实验和四张批准视觉基准图。产品名称与基础品牌命题已经确认；下一阶段继续以 [Canvium Gallery Showcase v1 工作计划](docs/project/Canvas-Showcase-v1-Plan.md) 为唯一执行基准。

当前方向：

- 展示芝加哥艺术博物馆中符合图片与权利规则的美术作品。
- 建立可复用于更多博物馆的馆藏展示规则。
- 建立 AI 作品内容生成流水线，而不是逐件人工策展。
- 完成约三个具有史料边界的艺术家人格。
- 在正式工程迁移前锁定视觉与动效系统，迁移后使用真实数据完成最终精修。
- 渐进迁移至 Next.js、React 和 TypeScript。

## 目录结构

```text
ai/             AI 提示词框架与艺术家人格实验
data/           馆藏服务、统一数据模型与数据源适配器
docs/
  handoff/      当前批准视觉稿及交接说明
  product/      仍在使用的产品与 AI 规范
  project/      当前工作计划与数据接入计划
experiments/
  canvas-demo/  当前可运行的视觉与交互基线
scripts/        数据源验证脚本
test/           数据适配层单元测试
tools/          本地辅助工具
archive/        历史文档、旧计划和未采用的视觉探索
server.mjs      当前静态服务、馆藏 API 与 AI API 原型
```

## 当前有效文档

- [Showcase v1 工作计划](docs/project/Canvas-Showcase-v1-Plan.md)：当前唯一执行基准。
- [品牌命名与品牌命题决策稿](docs/project/Canvas-Brand-Naming-Phase-0.md)：阶段 0 的品牌优先级、双语策略、候选名称与首轮风险筛选。
- [批准视觉交接](docs/handoff/2026-07-18-homepage-approved/STATUS.md)：四张当前视觉参考及交互结论。
- [全球馆藏接入计划](docs/project/Canvas-Global-Paintings-Catalog-Plan.md)：开放馆藏、版权审计与后续扩展参考。
- [艺术家 Prompt 框架](docs/product/Canvas-Artist-Prompt-Framework-v0.1.md)：当前人格与证据边界参考。
- [AI 内容增强与人格 Schema](docs/product/Canvas-AI-Content-and-Persona-Schema-v0.1.md)：批量作品增强、人格证据、版本管理、自动评估与艺术家选择标准。
- [莫奈候选人格审核稿](docs/product/Canvas-Claude-Monet-Persona-Review-v0.1.md)：按新 Schema 编写的首份候选人格试作，不代表最终艺术家名单。
- [归档说明](archive/README.md)：历史内容及移动位置。

## 本地运行

正式应用位于 `apps/web/`。复制它的环境变量示例，填写 ARTIC 要求的项目联系地址，然后从仓库根目录启动：

```bash
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

默认访问 `http://localhost:3000`。当前未发布任何艺术家人格，因此正式应用不会显示模拟的实时艺术家回答。

旧静态 Demo 只作为视觉与交互参考保留，需要对照时单独运行：

```bash
npm run demo
```

## 开发检查

```bash
npm run check
npm test
npm run test:e2e
npm run verify:catalog
```

`verify:catalog` 会访问三家馆方的真实线上 API。正式展示图片时必须检查每条记录的 `rights.publicDomain`、`rights.code`、`rights.licenseUrl` 和 `rights.attribution`，不能根据艺术家年代推断图片许可。

## 当前开放馆藏接口

```text
GET /api/catalog/sources
GET /api/catalog/artworks?source=artic&ids=28560,80607,14586&publicDomainOnly=true
GET /api/catalog/artworks?source=met&q=van%20gogh&limit=10&publicDomainOnly=true
GET /api/catalog/artworks?source=cleveland&q=monet&limit=10&publicDomainOnly=true
GET /api/catalog/museums?source=wikidata&ids=Q239303
```

当前支持 `artic`、`met`、`cleveland` 作品数据和 `wikidata` 博物馆信息，响应统一为作品、艺术家、年代、媒介、尺寸、图片、许可和来源字段，并在服务端缓存 15 分钟。
