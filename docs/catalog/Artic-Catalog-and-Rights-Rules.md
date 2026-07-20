# ARTIC 馆藏与权利规则

> 状态：Showcase v1 阶段 1 技术研究结论  
> 调研日期：2026-07-20  
> 数据源：芝加哥艺术博物馆（Art Institute of Chicago，ARTIC）公开 API、IIIF 与开放获取政策  
> 适用范围：Showcase v1 的芝加哥馆藏浏览、搜索、筛选、作品详情与图片查看器  
> 本文不是法律意见；如馆方记录与本文冲突，以馆方当前作品页、开放获取政策和使用条款为准。

## 1. 结论摘要

1. Showcase v1 的默认图片馆藏应只纳入同时满足以下条件的 `/artworks` 记录：
   - `is_public_domain === true`；
   - `image_id` 是非空、格式可接受的标识；
   - 主 IIIF 图片实际可读取；
   - 记录没有权利字段冲突，也未进入人工隔离名单。
2. 不得由艺术家卒年、创作年代、媒介或 `copyright_notice` 为空自行推断公共领域。`is_public_domain` 是规模化准入的必要条件；馆方作品页的 “CC0 Public Domain Designation” 是争议时的最终核对依据。
3. `is_zoomable` 只表示是否允许在可缩放界面中显示图片，不是图片权利许可。2026-07-20 的实时抽样计数中，仍有 15,951 条 `is_public_domain=false`、有图且 `is_zoomable=true` 的记录，因此绝不能以它替代公共领域判断。
4. 权利必须分层建模：作品状态、数字图片许可、字段级元数据许可、馆方声明与署名不能压成一个 `CC0/RESTRICTED` 字段。
5. `/artworks/search` 单次查询最多只能翻到第 10,000 条。当前符合“公共领域且有主图”的全部作品记录约 58,797 条，因此仅依赖远端搜索接口无法实现全类型完整馆藏。Showcase v1 已决定先直连 API、暂不建设数据库，并接受这一限制；页面不得宣称完整收录全部馆藏。
6. ARTIC 的 `/artworks` 包含绘画、雕塑、版画、摄影、纺织、装置、数字媒介等多种类型；但 Canvium Gallery 的产品范围已确定为二维绘画。Showcase v1 默认只纳入 `artwork_type_id=1`（`Painting`）且同时满足图片与权利规则的记录，其他类型不进入公开馆藏。
7. `thumbnail` 提供 `lqip`、原图宽高和无障碍文本；当前适配器没有取用。卡片比例、渐进加载和馆方 alt text 均应以它为首选来源，不能把请求宽度 843/1686 当成图片固有宽度。
8. 馆方推荐通常使用 843 像素宽 IIIF 派生图；公共领域图片在确有需要时可请求 1686 像素宽。高清查看器应基于 IIIF `info.json`/分块能力，而不是只加载一张固定宽度 JPEG。

## 2. 数据边界与作品类型

### 2.1 数据资源边界

Showcase v1 的馆藏主体只使用 ARTIC 的 `artworks` 资源。以下资源可作为补充数据，但不能混入作品总数：

- `agents`：艺术家/文化实体补充资料；
- `artwork-types`、`departments`、`category-terms`：筛选词表；
- `images`：图片资产级 alt text、credit line 和更新时间；
- `galleries`：展厅信息；
- `sounds`、`videos`、`documents`、`texts`：作品关联资源；
- `exhibitions`、`articles`、`products` 等不是作品记录，不进入馆藏结果。

### 2.2 Showcase v1 可纳入的作品类型

ARTIC 官方词表覆盖多种馆藏类型，但 Canvium Gallery 已确定为专注二维绘画的线上美术馆。Showcase v1 采用严格准入：

- 只自动纳入 `artwork_type_id=1` 且 `artwork_type_title=Painting` 的记录；
- 同时要求记录满足第 3 节的公共领域、图片可用和无权利冲突规则；
- `classification_title`、`medium_display` 用于说明媒介和细分类，不代替 `artwork_type_id` 做一级准入；
- `Miniature Painting`、`Drawing and Watercolor`、`Mixed Media` 等虽然可能在视觉上接近绘画，v1 仍不自动纳入。如以后扩展，必须先形成明确的产品范围决定和独立映射；
- 雕塑、器物、装置、摄影、版画、书籍、服饰、建筑构件、数字和时基媒介等其他类型不进入公开馆藏，也不计入 Canvium 的作品总数。

未知或新增 `artwork_type_id` 默认不展示并记录为 `unsupported_type`，不能因为名称包含 “painting” 就自动放行。稳定判断使用 `artwork_type_id`，显示名称使用 `artwork_type_title`。

## 3. 权利与展示决策

### 3.1 必须分开的权利层

| 层级 | ARTIC 依据 | Showcase 建议字段 | 规则 |
|---|---|---|---|
| 作品本体 | `is_public_domain`、`copyright_notice` | `rights.work.status`、`rights.work.notice` | 只由馆方标记确定，不做年代推断 |
| 数字图片 | 开放图片政策、作品页 CC0 标记、IIIF 可用性 | `rights.image.licenseCode`、`rights.image.licenseUrl` | 符合开放图片条件时记为 `CC0-1.0` |
| 作品元数据 | API 响应 `info.license_text` | `rights.metadata.defaultLicense` | 除 `description` 外，作品响应数据为 CC0 |
| 长描述 | API 文档对 `description` 的单独声明 | `rights.fields.description` | `CC-BY-4.0`，展示时保留来源和署名 |
| 馆方请求署名 | 开放图片政策 | `caption`、`source.label` | 建议格式：Artist. Title, Date. The Art Institute of Chicago. |

`credit_line` 是作品入藏/捐赠信息，不等于开放图片政策要求的图片 caption；两者应分别显示。`copyright_notice` 按官方字段说明作用于作品本身，也不能直接当作图片资产许可。

### 3.2 决策矩阵

| 条件 | 主馆藏卡片 | 作品详情 | 图片/缩放 | 状态码建议 |
|---|---|---|---|---|
| `is_public_domain=true` + 有图 + IIIF 正常 + 无冲突 | 展示 | 展示 | 展示；按 `is_zoomable` 决定缩放 | `image_displayable` |
| `is_public_domain=true` + 无图或图片失效 | 默认图片流不展示；可进入“仅资料”结果 | 可展示元数据与缺图说明 | 不展示占位伪图 | `metadata_only_no_image` |
| `is_public_domain=false/null` | 默认图片流不展示 | 若产品明确支持仅元数据页，可显示已许可元数据 | 不显示馆方图片，不生成缩略图 | `metadata_only_rights` |
| `is_public_domain=true` 但存在非空版权声明或作品页无 CC0 标记 | 不展示 | 隔离页/内部可见 | 不展示 | `quarantined_rights_conflict` |
| 类型为行政/非作品类型 | 不展示 | 内部可见 | 不展示 | `quarantined_type` |
| 记录结构不可解析或标识无效 | 不展示 | 内部可见 | 不展示 | `quarantined_invalid_record` |

截至 2026-07-20 的 API 实时计数仅用于估算而非产品常量：公共领域记录约 61,568 条；其中有 `image_id` 的约 58,797 条，无 `image_id` 的约 2,771 条。数字会随馆方更新变化，UI 和测试不得硬编码。

### 3.3 展示文案与链接

每个作品页至少显示：

- 艺术家/文化实体、作品名、日期；
- “The Art Institute of Chicago” 来源标识；
- `credit_line` 与 `main_reference_number`；
- “CC0 Public Domain Designation” 或等义中文，并链接 CC0 1.0；
- ARTIC 原作品页链接；
- 如展示 `description`，标明该字段来自 ARTIC、采用 CC BY 4.0，并链接许可；
- 馆方条款链接和“第三方权利由使用者自行核实”的简短提示。

推荐图片 caption 由结构化字段生成，而不是直接把 `credit_line` 当署名：

```text
{artist_display 或 Unknown artist}. {title}, {date_display}. The Art Institute of Chicago.
```

## 4. API 字段规则

### 4.1 列表/索引最低字段集

```text
id, api_link, title, alt_titles,
date_display, date_start, date_end,
artist_id, artist_title, artist_ids, artist_titles, artist_display,
place_of_origin, medium_display, dimensions,
main_reference_number, credit_line,
image_id, alt_image_ids, thumbnail,
is_public_domain, copyright_notice, is_zoomable, max_zoom_window_size,
artwork_type_id, artwork_type_title,
department_id, department_title,
classification_id, classification_title, classification_ids, classification_titles,
style_ids, style_titles, subject_ids, subject_titles,
material_ids, material_titles, technique_ids, technique_titles,
is_on_view, gallery_id, gallery_title,
source_updated_at, updated_at, timestamp
```

详情页按需再取 `short_description`、`description`、`dimensions_detail`、`color`、`colorfulness`、`provenance_text`、关联资源标志等较重字段。始终读取响应的 `config.iiif_url` 和 `config.website_url`，不要把测试域名或当前生产域名写死；对 `website_url` 的 HTTP 值应安全升级为 HTTPS。

### 4.2 图片字段

- `image_id`：首选代表图标识；为空时不得拼 URL。
- `alt_image_ids`：非首选图片，仅表示关联顺序，不说明它是背面、细节、装裱还是文档照。去重并移除与主图重复的 ID；不能假设每个 ID 均有效。
- `thumbnail.lqip`：仅用于加载占位。验证为预期的 `data:image/...;base64`，设置长度上限，禁止把任意 data URI 原样注入 DOM。
- `thumbnail.width/height`：主图原始像素尺寸，用于计算比例。非有限数、零或负数视为缺失。
- `thumbnail.alt_text`：馆方提供的主图无障碍描述，优先于 AI 生成描述；为空时才进入后续无障碍内容生成流程，且必须标注 AI 来源。
- `is_zoomable`：控制是否启用缩放查看器。
- `max_zoom_window_size`：若为正数，查看器不得超过该限制；馆方样本中的 `-1` 可建模为“未限制”，但应通过契约测试确认后再实现。

IIIF URL 使用响应中的 `config.iiif_url`：

```text
{iiif_url}/{image_id}/full/200,/0/default.jpg
{iiif_url}/{image_id}/full/400,/0/default.jpg
{iiif_url}/{image_id}/full/600,/0/default.jpg
{iiif_url}/{image_id}/full/843,/0/default.jpg
{iiif_url}/{image_id}/full/1686,/0/default.jpg  # 仅公共领域且确有需要
{iiif_url}/{image_id}/info.json                 # 查看器能力和真实尺寸
```

馆方允许 hotlink 且支持 CORS，但明确提示图片可能随时撤下或替换。不要永久缓存最终图片 URL 的可用结论。

### 4.3 IIIF Manifest

公共领域作品可使用：

```text
https://api.artic.edu/api/v1/artworks/{id}/manifest.json
```

Manifest 可供 Mirador 等查看器使用，也可确认多图顺序和权利元数据。只有 `is_public_domain=true` 时才暴露 `iiifManifestUrl`；非公共领域记录不能像当前适配器一样无条件生成该地址。

## 5. 分页、搜索与筛选

### 5.1 远端接口行为

- 列表和搜索默认每页 12 条，`page` 从 1 开始；`limit` 最大 100。
- 响应 `pagination` 包含 `total`、`limit`、`offset`、`current_page`、`total_pages`，部分响应有 `prev_url`/`next_url`。
- `/artworks` 是全部已发布作品列表，默认按最近更新倒序；支持 `ids`、`page`、`limit`、`fields`。
- `/artworks/search` 支持全文 `q`、Elasticsearch `query`、`sort`、`from`、`size` 和 `facets`。实际集成仍应优先使用馆方示例已验证的 `page`/`limit`，并为 `from`/`size` 做契约测试。
- 搜索端点的任一查询最多访问 10,000 条，`limit=100&page=101` 会失败。`limit=0` 可只取总数。
- API 无需认证；匿名调用限制为每 IP 每分钟 60 次。服务端请求应发送馆方建议的 `AIC-User-Agent: 产品名 (联系邮箱)`，并使用 HTTPS。

### 5.2 Showcase v1：直连 API

Showcase v1 已决定优先降低建设与维护成本，采用服务端直连 ARTIC API：

1. 列表、搜索和详情实时请求馆方 API，前端不直接暴露复杂查询逻辑。
2. 使用短期服务端缓存降低延迟和馆方压力；不建设本地馆藏数据库，也不安排定期全量下载。
3. 图片直接使用馆方 IIIF 地址，不自行保存图片文件。
4. 接受宽泛搜索最多访问前 10,000 条的限制；UI 不使用“完整收录”“全部馆藏”等无法兑现的表述。
5. 只在当前返回结果中执行绘画类型、公共领域、有图和异常数据检查。
6. API 暂时失败时显示明确错误或使用仍在有效期内的短期缓存，不把网络错误误判为作品被下架。

### 5.3 未来需要完整覆盖时

如果后续明确需要覆盖全部合格作品，再考虑使用馆方 nightly `api-data` dump 生成静态目录或本地索引。该方案是未来扩展项，不是 Showcase v1 的前置条件。

### 5.4 查询与筛选规则

远端的小范围搜索可用如下布尔约束作为准入条件：

```json
{
  "bool": {
    "must": [
      { "term": { "is_public_domain": true } },
      { "exists": { "field": "image_id" } }
    ]
  }
}
```

建议对外提供的基础筛选：

- 作品类型：`artwork_type_id`；
- 部门：`department_id`；
- 艺术家/文化实体：`artist_ids`；
- 年代：本地用 `date_start`/`date_end` 与用户范围做区间相交，缺失日期放入“年代未知”；
- 分类、风格、题材、材料、技法：优先稳定 ID，标题仅作显示；
- 在展：`is_on_view`，并提示这是会变化的状态；
- 有无多媒体/教育/高级影像：对应布尔字段。

文本标题字段做 Elasticsearch 精确筛选时应使用其 `.keyword` 子字段；不要用分词后的展示标题做 `term`。馆方文档声明 `facets` 可做 count 聚合，但 2026-07-20 对作品类型的试验请求未返回聚合块，因此正式实现前必须加实时契约测试。筛选词表和计数更稳妥地由本地索引生成，官方资源端点负责补充名称。

排序建议：

- 有 `q` 时默认相关度；相同分数用稳定 ID 兜底；
- 无 `q` 时提供馆方最近更新、年代、艺术家/标题等明确排序；
- 所有本地分页都使用确定性复合排序和不透明游标，避免同步期间重复/漏项；
- URL 保存 `q`、筛选、排序和游标/页码，支持分享及前进后退恢复。

## 6. 缺图、低清、异常比例与失效图片

### 6.1 缺图和失效

1. `image_id` 为空：直接判定 `metadata_only_no_image`，不要发送 IIIF 请求。
2. 有 ID 但 `thumbnail` 为空或宽高无效：仍可尝试 IIIF `info.json`，但记录为 `image_metadata_incomplete`。
3. `info.json` 或派生图返回 404/410：立即从图片流降级为仅元数据，做有期限的负缓存；404 不能无限重试。
4. 429：遵循 `Retry-After`（若有），指数退避并加随机抖动。
5. 5xx、超时和网络错误：保留最近成功状态，有限重试；UI 显示“图片暂时不可用”，不要误写成“无版权”。
6. 图片解码失败、返回非图片 MIME、空响应或 HTML 错误页：视为图片健康失败并上报。

### 6.2 低清图片

- 以 `thumbnail.width/height` 或 IIIF `info.json` 的真实尺寸判断，不以 URL 中的 `843`/`1686` 判断。
- 原图短边低于卡片所需像素时不强行锐化或放大；使用 `contain`、中性色背景，并标注“馆方仅提供低分辨率图像”。
- 低清不等于不可展示。只有达到产品视觉验收阈值时才从主视觉流降级，阈值应按卡片、详情和全屏三个场景分别配置。

### 6.3 异常比例与多图

- 不因极横、极竖、方形或微型对象自动排除作品。
- 网格卡片使用有界容器和 `object-fit: contain`，不得裁掉作品主体；瀑布流可以使用经验证的真实比例。
- 比例缺失时使用中性占位比例，图片加载后平滑校正，避免布局跳动。
- 极端比例进入专门布局；阈值作为 UI 配置而不是权利规则。
- 多图先展示 `image_id`，其余图片去重后按馆方顺序展示。若无法确认含义，统一标为“附加图像”，不要臆造“细节/背面”。
- 3D、360、视频和时基作品需要专门查看器；在 v1 尚未支持时只展示代表图与清晰的媒介说明。

## 7. 异常元数据处理

- `title` 为空：显示“Untitled / 题名未提供”，保留原始空值，不把 fallback 回写成馆方事实。
- 艺术家为空：显示“Artist unknown / 创作者未提供”；不要把缺值自动归为 `Unknown artist` 实体。
- 多位创作者：保留 `artist_ids`/`artist_titles` 全集，`artist_title` 只作馆方首选项；当前适配器只存一个名字会丢信息。
- 日期：优先展示 `date_display`。数值年份可为负数或近似范围；若起止颠倒、越界或仅一端存在，标记异常，不擅自修正。
- 描述：保存原始 HTML 和安全渲染/纯文本版本；当前正则删标签只适合原型，不能替代 HTML sanitizer。记录究竟使用 `short_description` 还是 `description`，以应用正确的字段许可。
- 重复记录：以 `source=artic + sourceId` 为唯一键；图片 ID 不能当作品键。
- 空数组、`null` 与字段缺失分别保留语义。API 通常用 `null` 表示空标量、空数组表示无多值，但上游 schema 漂移仍需运行时校验。
- API 返回 404：作品可能撤下或 ID 无效，标记 tombstone；不要继续公开旧图片。
- API schema/许可文本变化：停止自动扩大展示范围，告警并进入兼容性评审。

## 8. 当前适配器差距

检查对象：`data/providers/artic.mjs`，并结合 `data/catalog-service.mjs` 和 `server.mjs` 的调用链。

| 优先级 | 当前行为 | 与 Showcase v1 直连目标的差距 | 建议 |
|---|---|---|---|
| P0 | 仅返回 `total` 和 `items`，请求不接收 `page`/游标 | 永远只能取第一页，无法恢复浏览状态 | 返回完整分页契约；正式馆藏改由本地索引分页 |
| P0 | 公共领域筛选只检查 `is_public_domain` | 未要求绘画类型、`image_id`、IIIF 可用和无冲突 | 建立独立 eligibility 判定器及原因码 |
| P0 | `rights.code` 把公共领域作品统一写成 `CC0` | 混淆作品状态、图片 CC0 与字段级元数据许可 | 分层 rights schema，单列 `description` 的 CC BY 4.0 |
| P0 | 非公共领域记录仍构造 843px 图片 URL | 在 `publicDomainOnly=false` 时可能把受限图交给前端 | 权利判定前绝不创建/返回可展示图片 URL |
| P0 | 所有记录都构造 manifest URL | 官方只为公共领域作品提供 manifest | 仅对合格公共领域记录暴露 manifest |
| 后续 | 依赖 `/search` 获取公共领域集合 | 宽泛查询受 10,000 条深分页上限影响 | v1 明确接受并在 UI 说明；只有未来要求完整覆盖时才生成静态目录或本地索引 |
| P1 | 未请求 `thumbnail` | 缺失 LQIP、真实尺寸、比例和馆方 alt text | 将 `thumbnail` 纳入列表字段并校验 |
| P1 | 未请求 `is_zoomable`、`max_zoom_window_size` | 查看器无法遵守馆方缩放能力 | 建模图片能力并由 UI 强制执行 |
| P1 | 主图/附图都硬写宽度 843 或 1686 | 把派生请求宽度误当固有宽度，且公共领域默认过度请求 1686 | 固有尺寸来自 thumbnail/info.json；列表优先 400/843 |
| P1 | `alt_image_ids` 被盲目转换为与主图同规则 URL | 无去重、健康检查、尺寸、alt text和语义 | 批量补图片资产或解析 manifest，失败逐图隔离 |
| P1 | 只保留首选 `artist_title`、首选分类/风格 | 多作者和多值分类丢失，筛选能力不足 | 保存 ID 与 title 的多值集合 |
| P1 | `sourceUrl` 和 IIIF fallback 硬编码 | 忽略响应 config，可能误用环境或旧地址 | 从 `config` 派生并校验主机，HTTPS 规范化 |
| P1 | 按 ID 请求时客户端过滤公共领域，但 `total` 仍可能是上游原始总数 | 返回计数与 `items` 不一致 | 明确 `upstreamTotal`、`eligibleTotal`；ID 批取按结果重算 |
| P1 | 只设通用 `user-agent` | 未遵循馆方建议的 `AIC-User-Agent` 联系方式 | 服务端增加产品名和可维护联系邮箱 |
| P1 | 15 分钟进程内 Map 缓存 | 重启丢失、无持久索引、无版本/失效/权利撤回机制 | 使用持久缓存，区分元数据、资格和图片健康 TTL |
| P2 | 非 2xx 统一抛错，只有超时特殊化 | 无 429、404、5xx、解码失败和 stale fallback 策略 | 分类错误、有限重试、负缓存、指标与告警 |
| P2 | 无运行时 schema 校验 | null、类型漂移或畸形数组可能污染 UI | 在原始响应和规范化输出两端做 schema 校验 |
| P2 | `cleanText` 用正则删除 HTML | 实体解码不完整，不能作为安全 sanitizer | 保存原文；采用成熟 sanitizer 与文本转换器 |
| P2 | 能力只标 `search`/`batch-by-id`/`iiif`/`public-domain-filter` | 不能表达分页、筛选、排序、详情、图片健康和增量同步 | 扩展 provider contract，能力必须可测试 |

## 9. 推荐的适配器输出契约

后续实现可采用类似结构；字段名最终以阶段 4 的 TypeScript schema 为准：

```json
{
  "id": "artic:28560",
  "source": {
    "id": "artic",
    "label": "The Art Institute of Chicago",
    "recordUrl": "https://www.artic.edu/artworks/28560",
    "apiUrl": "https://api.artic.edu/api/v1/artworks/28560",
    "updatedAt": "..."
  },
  "display": {
    "title": "The Bedroom",
    "artistDisplay": "Vincent van Gogh...",
    "dateDisplay": "1889"
  },
  "images": {
    "preferred": {
      "id": "...",
      "width": 12614,
      "height": 9875,
      "altText": "...",
      "lqip": "data:image/gif;base64,...",
      "iiifBaseUrl": "...",
      "zoomable": true,
      "maxZoomWindowSize": null,
      "health": "ok"
    },
    "alternates": []
  },
  "rights": {
    "work": { "status": "public_domain", "notice": null },
    "image": { "licenseCode": "CC0-1.0", "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/" },
    "metadata": { "defaultLicense": "CC0-1.0", "descriptionLicense": "CC-BY-4.0" },
    "termsUrl": "https://www.artic.edu/terms"
  },
  "eligibility": {
    "status": "image_displayable",
    "ruleVersion": "artic-showcase-v1-2026-07-20",
    "checkedAt": "...",
    "reasons": []
  }
}
```

分页响应至少包含：

```json
{
  "items": [],
  "pageInfo": {
    "totalEligible": 0,
    "hasNextPage": false,
    "nextCursor": null
  },
  "query": {
    "q": "",
    "filters": {},
    "sort": "relevance"
  },
  "snapshotVersion": "..."
}
```

## 10. 缓存、刷新与可观测性

- 列表、搜索和详情使用短期服务端缓存；建议从 15 分钟起步，之后根据实际流量调整。
- 缓存过期后重新读取馆方 API 并重算资格，避免长期保留已经改变权利状态的记录。
- API 短暂失败时可返回仍在可接受陈旧窗口内的缓存，并明确标记数据更新时间。
- 图片直接 hotlink 馆方 IIIF，不在 v1 自建图片库；浏览器缓存遵循馆方响应头。
- 图片 404/410 做有期限的负缓存，时间应长于瞬时 5xx；不要永久认定图片失效。
- 记录指标：上游延迟/状态码、429 次数、schema 失败、合格/缺图/权利受限/隔离计数和图片解码失败。
- 不运行全量抓取任务；若开发调试需要少量抓取，遵循馆方的单线程和限速建议。

## 11. 实施验收清单

- 任一 ARTIC 记录都能得到唯一且可解释的 eligibility 状态和原因码。
- `is_public_domain=false/null` 的记录不会向前端返回可渲染的馆方图片 URL。
- 权利、元数据许可、图片许可、credit line 和 caption 分开存储与显示。
- 搜索达到远端 10,000 条访问边界时行为可预测，界面不误导用户认为已经展示全部结果。
- 搜索、筛选、排序、分页均为确定性行为，并写入可分享 URL。
- 主图缺失、主图 404、低清、极端比例、多图部分失效均有稳定 UI 状态。
- 馆方 alt text 优先，AI 文本不覆盖馆方文本且有来源标签。
- 缩放严格服从 `is_zoomable` 和 `max_zoom_window_size`。
- 上游 429、5xx、超时、schema 漂移和权利撤回有自动测试、指标和告警。
- 每次同步保存来源更新时间、判定时间和规则版本，可审计某张图片为何在某时被展示。

## 12. 官方资料

- [ARTIC API Documentation](https://api.artic.edu/docs/)
- [ARTIC Open Access Images](https://www.artic.edu/open-access/open-access-images)
- [ARTIC Image Licensing](https://www.artic.edu/image-licensing)
- [ARTIC Terms and Conditions](https://www.artic.edu/terms)
- [ARTIC Public API](https://www.artic.edu/open-access/public-api)
- [ARTIC API nightly data dumps](https://github.com/art-institute-of-chicago/api-data)
- [Creative Commons CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
- [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

关键官方依据摘要：API 文档说明匿名限流、分页和 10,000 条搜索上限，建议缓存、选取字段、批量按 ID、使用 nightly dump，并从响应 `config.iiif_url` 构造 IIIF URL；开放图片政策说明带 “CC0 Public Domain Designation” 的图片可自由使用并给出建议 caption；API 的 artworks 许可说明将 `description` 单独置于 CC BY 4.0，其余作品响应数据置于 CC0；字段文档明确 `copyright_notice` 针对作品本身，`is_zoomable` 针对查看器能力。
