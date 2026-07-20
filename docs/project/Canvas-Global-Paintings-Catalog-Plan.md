# Canvium Gallery 全球画作馆藏扩充计划

> 文档用途：指导世界知名美术馆名单整理、开放馆藏采集、画作筛选、版权审计与网站接入  
> 状态：建议执行基准 / 待评审  
> 更新日期：2026-07-20  
> 适用范围：画作目录，不包含雕塑、装置、影像、建筑及其他不适合平面观看的作品

## 1. 执行结论

Canvium Gallery 不应在用户浏览时临时向多家博物馆 API 各取十几件作品，也不应把“网上能看到”视为“可以收录和展示”。建议建立一套本地馆藏目录：定期拉取馆方开放元数据，按统一 Schema 归一化，只发布具有明确图片许可、馆方永久链接和画作类型的记录。

首个扩充里程碑建议为：

- 接通至少 8 个机构或机构网络；
- 上线不少于 25,000 件通过版权与类型校验的画作；
- 每件上线作品都有馆方原始链接、图片权利状态和来源更新时间；
- 上线集合中雕塑、器物、装置、视频等非画作误入率低于 0.5%；
- 不以艺术家去世年份推断图片权利；图片许可不明确的记录只进入内部索引，不公开展示。

“全部拿下来”在工程上分成三件事：

1. 元数据：在许可允许时完整同步到本地原始层和标准层。
2. 图片元数据：保存 IIIF、缩略图、原图地址、尺寸、许可和署名；默认使用馆方推荐的 IIIF/图片地址。
3. 图片文件：只有馆方明确允许缓存或再分发时才进入对象存储；否则不批量镜像，避免违反条款和给馆方造成不必要负载。

## 2. 当前项目现状

代码检查显示，项目已有：

- 芝加哥艺术博物馆 `artic`、The Met `met`、克利夫兰艺术博物馆 `cleveland` 三个作品 Provider；
- Wikidata 博物馆基础信息 Provider；
- 统一的作品标题、艺术家、年代、材料、尺寸、图片、许可和来源字段；
- 15 分钟内存缓存与基础 Provider 单元测试；
- 地图上的约 30 家博物馆静态资料。

当前主要缺口：

- 只有三家馆能读取真实作品；其余地图点位没有真实馆藏；
- 前端在切馆时实时搜索并临时取 12 件，没有本地目录、分页、搜索或稳定排序；
- Provider 没有统一的“只要画作”能力，搜索结果可能混入雕塑、器物和其他媒介；
- 缺少原始数据快照、增量同步、失败重试、删除/撤回处理和同步审计；
- 图片与说明文字的权利没有拆开建模；
- 缺少重复作品识别、艺术家实体对齐、中文名称和人工策展状态；
- 图片依赖上游 URL，没有失效检测和合规缓存策略；
- Demo 的博物馆名单和真实可用数据源写在不同位置，容易失配。

## 3. 收录边界

### 3.1 允许进入公开画廊

- 油画、蛋彩、丙烯、湿壁画等以绘画为主要表达方式的作品；
- 水彩、水粉、粉彩；
- 中国画、日本画、韩国画等纸本或绢本绘画；
- 可作为连续平面图像查看的挂轴、手卷、屏风画；
- 综合材料作品，但必须以平面绘画为主体且有可用的正面图像；
- 馆方分类明确为 `painting`、`peinture`、`maleri` 或可可靠映射到绘画的本地分类。

### 3.2 首期不收录

- 雕塑、陶瓷、家具、服饰、珠宝、武器、考古器物；
- 建筑、装置、行为、声音、电影、视频、交互媒体、软件艺术；
- 只有展厅照、侧面照、局部照而没有作品正面图的记录；
- 单纯素描、版画、摄影、海报、手稿、书籍插图。它们可在未来作为独立频道加入，但不与“画作”混在一起；
- 图片权利未知、图片来源不可追溯、馆方记录已撤回或只有低质量缩略图的记录；
- 仅由聚合站或个人上传、无法回链馆方原始记录的作品。

### 3.3 机器判定与人工复核

每条记录生成以下字段：

```text
workForm: painting | drawing | print | photograph | sculpture | other
displayMode: flat | scroll | screen | object | time_based
eligibility: publish | review | reject
eligibilityReasons: string[]
```

判定顺序：馆方结构化类型 > 馆方部门/分类 > 材料与技法词典 > 标题关键词。只依靠标题或图片识别的记录不得自动发布。手卷、屏风和综合材料进入人工抽检队列。

## 4. 机构名单与接入优先级

机构名单不按主观“全球排名”生成，而按四项共同决定：绘画馆藏的重要性、开放数据成熟度、图片许可、地域与艺术史覆盖。地图可以先收录机构资料，数字画廊只有在数据和图片都通过门槛后才显示“已开放”。

### 4.1 第一批：直接进入工程接入

| 机构/网络 | 地区 | 数据方式 | 图片与许可要点 | 计划 |
|---|---|---|---|---|
| Art Institute of Chicago | 美国芝加哥 | REST、数据包、IIIF | 公共领域作品有 IIIF；描述文字与其他字段许可不同 | 保留现有 Provider，改为批量同步并加画作过滤 |
| The Metropolitan Museum of Art | 美国纽约 | REST、GitHub 数据集 | Open Access 公共领域记录提供高分辨率图 | 保留现有 Provider，改为本地完整索引 |
| Cleveland Museum of Art | 美国克利夫兰 | REST | 数据为 CC0；只有 `share_license_status=CC0` 的作品图片可开放使用 | 保留现有 Provider，修正搜索后再次执行权利过滤 |
| National Gallery of Art | 美国华盛顿 | 每日更新 CSV、馆方图片服务 | 13 万余件作品/艺术家数据为 CC0，6 万余张开放图片 | 新建批量导入器；按分类表筛选 Painting |
| Rijksmuseum | 荷兰阿姆斯特丹 | Search API、LOD、OAI-PMH、LDES、数据包、IIIF | 新版数据服务适合完整导入和增量同步 | 新建 Linked Art/IIIF 导入器；按分类 URI 筛选 |
| SMK — National Gallery of Denmark | 丹麦哥本哈根 | REST | API 原生支持 `object_names:maleri`、`has_image`、`public_domain` 过滤 | 新建 REST 导入器，作为画作过滤基准实现 |
| Paris Musées（14 家市立博物馆） | 法国巴黎 | GraphQL | 公共领域高清图逐步开放；当前公开检索可见 8,000 余件权利开放的绘画 | 新建 GraphQL 导入器；保留具体所属博物馆，不合并成一个虚拟馆 |
| J. Paul Getty Museum | 美国洛杉矶 | Linked Art REST、SPARQL、ActivityStream、IIIF | 元数据大体为 CC0；每张图片和每段说明需读取独立权利块 | 先做权利解析 Spike，再按 ActivityStream 增量同步 |

### 4.2 第二批：补充覆盖

| 机构/网络 | 价值 | 注意事项 | 计划 |
|---|---|---|---|
| Smithsonian American Art Museum / National Portrait Gallery | 美国艺术与肖像画覆盖 | Smithsonian Open Access 跨 21 家博物馆，必须先限定馆别、类型和 CC0 媒体 | 通过 Smithsonian API/GitHub 导入，只取指定 Unit 的 painting |
| Walters Art Museum | 欧洲古典、伊斯兰与亚洲绘画补充 | API v1 已于 2023 年关闭，目前提供静态数据；数据和合规图片为 CC0 | 使用静态数据包，不依赖已关闭 API |
| Musée du Louvre | 古典绘画核心机构 | 单条记录可取 JSON；文本按 Etalab 开放许可，但图片免费使用范围有限 | 先做元数据索引；公开图片默认不上线，除非逐条满足产品用途 |
| The National Gallery, London | 欧洲绘画核心机构 | 新数据 API 为 Beta；结构化数据 CC0、说明 CC BY、图片 CC BY-NC-ND，IIIF 仍在建设 | 先收元数据和永久链接；图片进入 `review/restricted`，不进入默认公开集合 |
| Museum of Modern Art | 现代绘画核心机构 | 公开 16 万余作品、1.5 万艺术家元数据，图片不在开放数据中，公开 API 仍只供员工和伙伴 | 导入元数据用于跨馆索引；不复制图片，不标“数字画廊已开放” |

### 4.3 机构资料先收录、馆藏暂缓

以下机构具有很高的绘画价值，但在完成官方 API、批量访问方式及图片再利用条款核对前，只作为地图机构和策展候选，不抓网页、不绕过限制：

- Musée d’Orsay、Centre Pompidou、Museo del Prado、Gallerie degli Uffizi、Tate；
- Van Gogh Museum、Guggenheim、SFMOMA；
- 故宫博物院、台北故宫博物院、东京国立博物馆、National Gallery Singapore、M+；
- National Gallery of Australia、MASP 等区域代表性机构。

大英博物馆、埃及博物馆、中国国家博物馆等综合或考古机构仍可保留地图资料，但不应成为首批画作采集重点。

## 5. 数据架构

### 5.1 三层数据

```text
馆方 API / 数据包 / IIIF
        ↓
Raw 原始层：按来源保留原始响应、抓取时间、校验和与许可快照
        ↓
Normalized 标准层：统一 Museum / Artist / Artwork / Image / Rights
        ↓
Published 发布层：只含通过类型、图片、版权和质量门槛的画作
        ↓
网站搜索、画廊、作品详情、未来艺术家对话检索
```

Raw 层用于追溯，不直接暴露给前端。Published 层应能独立服务网站，上游 API 暂时失败时不影响用户浏览。

### 5.2 核心实体

| 实体 | 必需内容 |
|---|---|
| `Museum` | 稳定 ID、中英文名、官方名、坐标、国家/城市、官网、Wikidata QID、开放状态 |
| `Source` | Provider ID、协议、基础地址、条款地址、速率限制、同步方式、最后成功时间 |
| `Artist` | 规范名、别名、出生/去世、国籍、馆方人物 ID、ULAN/Wikidata ID、数据来源 |
| `Artwork` | 规范 ID、馆方 ID、标题、创作者、年代、材料、尺寸、分类、部门、入藏号、馆方永久链接 |
| `ArtworkImage` | 角色、缩略/展示/原图或 IIIF、宽高、校验和、图片权利、署名、可缓存策略 |
| `RightsAssertion` | 适用对象（数据/文字/图片）、许可代码、许可 URL、权利声明原文、判定结果、检查时间 |
| `ImportRun` | 来源、版本/游标、开始结束时间、读取/新增/更新/撤回/拒绝数量、错误摘要 |
| `EditorialRecord` | 中文标题、精选状态、人工说明、审核人、审核时间、对话内容就绪度 |

图片权利必须属于 `ArtworkImage`，不能只放在 `Artwork` 上；一件作品的主图和辅助图可能有不同许可。

### 5.3 建议新增的统一字段

在现有规范化结果上补充：

```text
canonicalId
museumId
sourceRevision
sourceUpdatedAt
ingestedAt
workForm
displayMode
techniques[]
materials[]
subjects[]
artist.authorityIds
dimensions.heightCm / widthCm / depthCm
images[].rights
images[].cachePolicy
texts[].kind / language / rights
eligibility / eligibilityReasons[]
qualityScore
editorialStatus
```

## 6. 采集与发布流程

### 6.1 来源注册

建立唯一的 Source Registry，保存每家机构的协议、许可、速率限制、User-Agent 要求、分页方式、全量与增量策略、可接受图片许可。前端和地图不再直接把博物馆 ID 当 Provider ID。

### 6.2 全量同步

- 有官方数据包时优先数据包，不用深分页轰击 API；
- 有 OAI-PMH、LDES 或 ActivityStream 时保存游标；
- 只有 REST 分页时严格遵守馆方节流要求，并支持断点续传；
- 保存原始记录的校验和，重复同步只处理变化项；
- 上游删除或撤回不物理删除本地审计记录，只从 Published 层下架。

### 6.3 标准化

每个 Provider 只负责“官方格式 → Canvium Gallery 标准格式”，不在 Provider 内写策展逻辑。类型词典、权利策略、质量评分和去重应使用共享模块，避免八家机构各自实现一套规则。

### 6.4 权利闸门

默认公开允许：`CC0`、Public Domain Mark、明确的公共领域声明、`CC BY`。`CC BY-SA` 先进入复核；`NC`、`ND`、`NC-ND`、`all rights reserved`、`unknown` 默认不发布图片。

权利闸门检查：

1. 图片本身的许可，而不是只看作品年代；
2. 许可是否允许当前网站用途和未来商业化；
3. 是否需要署名、回链或禁止裁切；
4. 说明文字是否可以复制，还是只能自行撰写摘要；
5. 馆方是否允许热链、缓存或批量下载；
6. 许可或条款发生变化时能否批量下架受影响图片。

### 6.5 画作过滤

使用“允许词典 + 排除词典 + 馆方分类 URI”而不是一个模糊搜索词。每家 Provider 做映射测试，例如：

- `Painting`, `Paintings`, `Peinture`, `maleri`, `Schilderij` → `painting`；
- `oil on canvas`、`ink and color on silk` 只能辅助确认，不能覆盖馆方明确的非画作分类；
- 含 `sculpture`、`vessel`、`coin`、`furniture`、`installation`、`video` 等明确类型时拒绝；
- 无结构化类型但看似画作的记录进入 `review`。

### 6.6 去重与实体对齐

- 馆内唯一键：`source + sourceId`；
- 跨馆不把同名作品自动合并，保留不同实体作品；
- 同一实体被馆方 API、Wikidata、Wikimedia 重复描述时，优先馆方记录，外部来源只补权威 ID、多语言名和主题；
- 通过入藏号、馆方永久链接、Wikidata QID、标题/艺术家/年代/尺寸组合生成重复候选；
- 艺术家对齐优先 ULAN、VIAF、Wikidata 等权威 ID，姓名模糊匹配只能产生候选。

### 6.7 图片处理

- 首选 IIIF，并保存 manifest 和 image service，而不是写死单一 JPEG；
- 生成 400、800、1600 像素显示档位，原图只在用户放大时加载；
- 保留原始长宽比，不默认裁切作品；
- 对手卷和屏风支持超宽查看，缩略图可以 letterbox，但不裁去画面；
- 每日抽检失效 URL；连续失败后隐藏图片并告警；
- 只有 `cachePolicy=allowed` 才写入对象存储，否则使用馆方推荐地址；
- 不下载 TIFF 等保存级母版作为网站默认资产。

### 6.8 中文与内容丰富度

第一阶段不机器编造作品事实。中文层分为：

- 馆方提供的官方中文；
- Wikidata/权威词表补充的名称；
- Canvium Gallery 编辑翻译，明确记录译者与来源版本；
- AI 辅助翻译草稿，只能在人工抽检后发布。

艺术家聊天暂未完成时，作品仍可上线，但需标记 `dialogueStatus=unavailable | basic | curated`。画作目录和艺术家对话知识库分离，避免因对话内容不足阻塞馆藏丰富度。

## 7. 网站接入方式

### 7.1 后端

用持久化目录替代当前的实时上游聚合：

```text
GET /api/museums?hasPublishedPaintings=true
GET /api/museums/:museumId
GET /api/artworks?museum=&artist=&period=&page=&sort=
GET /api/artworks/:canonicalId
GET /api/artists/:artistId/artworks
GET /api/discover?seed=&museum=&limit=
```

25,000～100,000 级画作先使用 PostgreSQL、全文检索和模糊匹配即可，不急于引入单独搜索集群。同步任务与网站进程分离，Provider 故障不直接传导给用户。

### 7.2 前端

- 地图点位状态改为 `资料已收录 / 馆藏同步中 / 数字画廊已开放`；
- 馆详情展示合规画作总数、覆盖年代、代表艺术家和最后更新时间；
- 数字画廊从本地分页 API 读取，不再固定展示 12 件搜索结果；
- 支持按艺术家、年代、地域和材料筛选；
- 作品详情固定展示馆方来源、图片许可、署名和“查看馆方原始记录”；
- 没有艺术家对话内容时仍提供高清观看与基础资料，但不展示虚假的聊天入口；
- 对 restricted/metadata-only 机构不展示第三方图片，可显示“查看馆方网站”。

## 8. 分阶段执行

### 阶段 0：政策与 Schema 冻结（2～3 个工程日）

- 确认网站按未来可商业化的最严格图片策略执行；
- 冻结 painting 收录规则、权利枚举和 Source Registry；
- 将图片权利与文字权利拆开；
- 准备每个来源各 20 条的黄金测试样本，包含允许、拒绝和边界案例。

完成门槛：同一条记录在不同机器上得到相同的类型与权利判定。

### 阶段 1：把现有三家改成稳定目录（约 1 周）

- 建立数据库迁移、Raw/Normalized/Published 三层；
- 为 AIC、Met、Cleveland 增加完整分页、断点续传和增量同步；
- 增加画作过滤、图片权利逐图建模和撤回处理；
- 前端改读本地目录；
- 建立同步报告和公开画作数统计。

完成门槛：断开三家馆方网络后，网站仍能浏览已同步作品；非画作抽检误入率低于 0.5%。

### 阶段 2：扩至第一批 8 个来源（约 2～3 周）

- 先接 NGA、SMK、Rijksmuseum；
- 再接 Paris Musées 与 Getty；
- 每接一家都完成 Provider contract test、许可样本测试和 100 条人工抽检；
- 地图机构 Registry 与真实目录打通；
- 达到首个 25,000 件合规画作目标。

完成门槛：至少 8 个来源、每条公开作品有合规图片和馆方回链、图片坏链率低于 1%。

### 阶段 3：地域与现代艺术补齐（约 2 周）

- 接 Smithsonian 指定艺术馆与 Walters 静态数据；
- 导入 MoMA、Louvre、National Gallery London 的 metadata-only 索引；
- 对亚洲、大洋洲、拉丁美洲重点机构完成开放数据和权利调研；
- 发布覆盖缺口报表，避免目录只集中于欧美古典绘画。

完成门槛：网站清楚区分可浏览画廊和仅有馆方索引，不用受限图片填充版面。

### 阶段 4：持续运营

- 每日：执行支持增量协议的来源、图片健康检查；
- 每周：执行普通 REST/API 来源、更新计数和失败报告；
- 每月：许可条款抽查、来源版本审计、重复候选复核；
- 每季度：新增 2～3 家来源、检查地域/年代/性别代表性、下架低质量记录。

## 9. 测试与验收

### 9.1 自动检查

- Provider contract：分页、空值、限流、超时、字段变化；
- Schema：所有 Published 记录通过运行时校验；
- Rights：所有公开图片具有许可代码、许可 URL、署名和来源页；
- Type：明确排除类型不能进入 Published；
- Image：HTTP/IIIF 可访问、尺寸与长宽比有效；
- Sync：重复执行幂等，更新与撤回可重放；
- Frontend：分页、筛选、空状态、上游不可用、超宽作品展示。

### 9.2 发布质量指标

| 指标 | 门槛 |
|---|---|
| 公开图片明确权利率 | 100% |
| 公开作品馆方原始链接覆盖率 | 100% |
| 画作类型准确率 | ≥ 99.5% |
| 图片坏链率 | < 1% |
| 标题、艺术家、机构完整率 | ≥ 98% |
| 年代、材料、尺寸三项至少两项完整率 | ≥ 80% |
| 重复公开记录率 | < 0.5% |
| 同步失败可追溯率 | 100% |

## 10. 风险与对应措施

| 风险 | 对应措施 |
|---|---|
| “公共领域作品”被误当成“图片可自由使用” | 图片单独建权利记录，只有明确许可才发布 |
| 馆方条款变化 | 保存条款 URL 与检查时间，按来源批量重新判定和下架 |
| API 限流或下线 | 优先数据包/增量协议、本地持久化、断点续传；不让前端直连 |
| 类型命名跨语言且不统一 | 馆方分类 URI + 多语言词典 + 黄金样本 + 人工复核 |
| 聚合数据覆盖面大但错误多 | 馆方为主数据，Wikidata/Wikimedia 只做身份与多语言补充 |
| 欧美馆藏占比过高 | 建立地域覆盖报表；无开放 API 的地区以合作或官方数据申请补齐，不抓受限站点 |
| 一次导入太多低质量记录 | Raw 可全量，Published 必须过质量评分；策展推荐与全目录分层 |
| 图片存储和流量膨胀 | IIIF 分档与懒加载，允许时缓存展示尺寸，不默认保存母版 |

## 11. 本计划采用的官方资料

- [Art Institute of Chicago API Documentation](https://api.artic.edu/docs/)
- [The Met Collection API](https://metmuseum.github.io/)
- [Cleveland Museum of Art Open Access API](https://openaccess-api.clevelandart.org/)
- [National Gallery of Art — Free Images and Open Access](https://www.nga.gov/artworks/free-images-and-open-access)
- [Rijksmuseum Data Services](https://data.rijksmuseum.nl/docs/)
- [SMK API](https://www.smk.dk/en/article/smk-api/)
- [Paris Musées API Documentation](https://www.parismuseescollections.paris.fr/en/node/777947)
- [Getty Museum Collection API](https://data.getty.edu/museum/collection/docs/)
- [Smithsonian Open Access](https://www.si.edu/openaccess)
- [Walters Art Museum Open Data](https://api.thewalters.org/index.html)
- [National Gallery, London — Collection Data APIs and Licences](https://www.nationalgallery.org.uk/documentation/ngacuk)
- [MoMA Open Data](https://api.moma.org/)
- [Louvre JSON Documentation and Terms of Use](https://collections.louvre.fr/en/page/documentationJSON)

## 12. 推荐的下一步

按阶段 0 开始，不立即批量下载图片。第一批实际工作应是：建立 Source Registry 与新版 Schema，选取现有三家各 20 条黄金样本，完成“画作类型 + 图片权利 + 发布资格”统一判定。这个基础通过后，再全量同步已有三家并接入 NGA、SMK、Rijksmuseum；这样扩馆时新增的只是 Provider，而不是每家再重做一套数据和版权逻辑。
