# 博物馆项目

## 目录结构

- `docs/product/`：产品需求、规划等项目文档
- `docs/project/`：实施计划、任务拆分与项目推进文档
- `experiments/`：验证想法与交互方案的实验代码

## 当前内容

- `docs/product/Canvas-MVP-PRD-v0.3.md`：当前 MVP 产品、设计与开发执行基准
- `docs/product/Canvas-PRD-v0.1.md`：Canvas PRD v0.1
- `docs/product/Canvas-PRD-v0.2.md`：Canvas PRD v0.2（历史版本）
- `docs/project/Canvas-MVP-Implementation-Plan.md`：Canvas MVP 分阶段实施计划
- `experiments/canvas-demo/`：可对话的数字博物馆静态前端 Demo

实验项目的运行方式与素材说明见各实验目录内的 README。

## 开放馆藏 API

服务端已经接入并统一以下官方开放馆藏数据源：

- `artic`：芝加哥艺术博物馆，支持批量 ID、搜索、公共领域过滤与 IIIF 图片。
- `met`：大都会艺术博物馆，支持作品 ID、搜索与公共领域过滤。
- `cleveland`：克利夫兰艺术博物馆，支持作品 ID、搜索、公共领域过滤及原始高清图字段。
- `wikidata`：博物馆基础信息，支持中英文名称、简介、坐标、地址、官网、成立时间和关联城市/国家。

启动服务后可使用：

```text
GET /api/catalog/sources
GET /api/catalog/artworks?source=artic&ids=28560,80607,14586&publicDomainOnly=true
GET /api/catalog/artworks?source=met&q=van%20gogh&limit=10&publicDomainOnly=true
GET /api/catalog/artworks?source=cleveland&q=monet&limit=10&publicDomainOnly=true
GET /api/catalog/museums?source=wikidata&ids=Q239303
```

响应被归一化为统一的作品、艺术家、年代、媒介、尺寸、图片、许可和来源字段，并在服务端缓存 15 分钟。Demo 会优先读取芝加哥艺术博物馆的 IIIF 图片；请求失败时继续使用原有 Wikimedia 图片，不影响基础浏览。

开发检查：

```bash
npm run check
npm test
npm run verify:catalog
```

`verify:catalog` 会访问三家馆方的真实线上 API。正式展示图片时必须检查每条记录的 `rights.publicDomain`、`rights.code`、`rights.licenseUrl` 和 `rights.attribution`，不能根据艺术家年代推断图片许可。
