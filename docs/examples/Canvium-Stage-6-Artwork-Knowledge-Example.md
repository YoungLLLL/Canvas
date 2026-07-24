# Canvium Stage 6：单件作品知识包完整示例

> 示例作品：Vincent van Gogh, _The Bedroom_, 1889  
> 规范化作品 ID：`artic:28560`  
> 文档用途：展示“一件作品完成阶段 6 后应具备什么资料”  
> 注意：本文是便于产品与编辑审核的人类可读视图；程序实际读取的是经过 Zod 校验的版本化 JSON。

## 1. 完成交付的定义

一件作品只有同时具备以下内容，才算完成阶段 6：

1. 冻结的馆方记录、图片修订和权利状态；
2. 可追溯的来源记录与来源定位；
3. 拆分到原子粒度的事实、视觉观察、解释和有限推测；
4. 面向作品页的简介、标签、色板和无障碍描述；
5. 仅供聊天使用的内部 `DialogueCue`；
6. 生成模型、Prompt、输入哈希和时间记录；
7. 确定性校验、自动评估和人工抽样结果；
8. 不可变候选版本、当前发布版本和可回滚的上一版本。

“AI 已经写出一段介绍”不等于完成。未通过证据、Schema 和发布门槛的内容只能作为候选。

## 2. 冻结的作品输入

```yaml
artworkId: artic:28560
sourceId: "28560"
museumId: artic
title: The Bedroom
artistDisplay: Vincent van Gogh (Dutch, 1853–1890)
dateDisplay: "1889"
mediumDisplay: Oil on canvas
dimensionsDisplay: 73.6 × 92.3 cm
museumRecordUrl: https://www.artic.edu/artworks/28560
artworkRevision: 2026-07-23T23:27:33-05:00

eligibility:
  status: image_displayable
  workRights: public_domain
  imageLicense: PDM-1.0

preferredImage:
  imageId: commons:28560
  width: 843
  height: 658
  source: Wikimedia Commons
  imageRevision: commons:28560
```

这里保存的是生成时实际使用的修订信息。馆方记录或图片改变后，相关内容会被标记为 `stale`，不会继续假装仍然有效。

## 3. 来源记录

### `source:artic:28560:museum`

```yaml
kind: museum_record
title: The Bedroom
publisher: The Art Institute of Chicago
url: https://www.artic.edu/artworks/28560
language: en
reliability: institutional
allowedUses:
  - summarize
  - internal_retrieval
```

本来源支持：

- 作品名称、作者、年代、媒介、尺寸和馆藏信息；
- 馆方对作品创作背景的说明；
- 馆方记录中关于阿尔勒卧室版本及画家表达意图的陈述。

正式知识包还会保存 `accessedAt`、内容哈希和来源快照引用。生成模型不能自行添加不存在的书名、网址或页码。

### `source:commons:28560:image`

```yaml
kind: image_record
publisher: Wikimedia Commons
license: PDM-1.0
imageId: commons:28560
allowedUses:
  - embed
  - internal_retrieval
```

它只证明本次分析使用的是哪一个图像修订及其图片权利，不替代 ARTIC 对作品身份和作品权利的判断。

## 4. 原子主张与证据

### 事实主张

#### `claim:artic:28560:title`

```yaml
layer: fact
text: 馆方将这件作品记录为《The Bedroom》。
confidence: high
status: verified
sourceRefs:
  - sourceId: source:artic:28560:museum
    locator:
      section: object record / title
    support: direct
```

#### `claim:artic:28560:artist`

```yaml
layer: fact
text: 馆方将这件作品归于文森特·梵高。
confidence: high
status: verified
sourceRefs:
  - sourceId: source:artic:28560:museum
    locator:
      section: object record / artist
    support: direct
```

#### `claim:artic:28560:date-medium`

```yaml
layer: fact
text: 作品创作于 1889 年，媒介为布面油画。
confidence: high
status: verified
sourceRefs:
  - sourceId: source:artic:28560:museum
    locator:
      section: object record / date and medium
    support: direct
```

#### `claim:artic:28560:arles-version`

```yaml
layer: fact
text: ARTIC 的作品说明将本作描述为梵高阿尔勒卧室的三个绘画版本之一。
confidence: high
status: verified
sourceRefs:
  - sourceId: source:artic:28560:museum
    locator:
      section: description
    support: direct
```

### 视觉事实

#### `claim:artic:28560:visible-furniture`

```yaml
layer: fact
text: 一张木床位于画面右侧；左侧可见两把椅子和一张小桌。
confidence: high
status: verified
visualEvidence:
  - visualEvidenceId: visual:artic:28560:bed
    imageId: commons:28560
    region:
      x: 0.49
      y: 0.22
      width: 0.49
      height: 0.70
    basis: visible
    observation: 画面右半部可见一张木床。
  - visualEvidenceId: visual:artic:28560:left-furniture
    imageId: commons:28560
    region:
      x: 0.02
      y: 0.40
      width: 0.48
      height: 0.57
    basis: visible
    observation: 左侧可见椅子和小桌。
```

### 解释性主张

#### `claim:artic:28560:spatial-instability`

```yaml
layer: interpretation
text: 家具边缘和地面线条没有形成完全统一的透视秩序，使房间产生轻微的倾斜与不稳定感。
confidence: medium
status: generated
qualification: 这是基于画面结构的视觉解释，不是对画家心理状态的判断。
visualEvidence:
  - visualEvidenceId: visual:artic:28560:bed-edge
  - visualEvidenceId: visual:artic:28560:floor-lines
  - visualEvidenceId: visual:artic:28560:back-wall
```

这条内容不能被写成“梵高内心焦虑，所以把房间画歪了”。除非存在足够的一手材料，否则画面特征不能被直接转换成心理诊断或确定的创作动机。

## 5. 面向作品页的公开内容

### 简介

> 梵高以强烈的轮廓、简化的形体和平涂色块描绘自己的房间。床、椅子和墙上画作都清晰可辨，但家具边缘与地面线条并未汇聚成稳定、规整的空间，使这个日常房间显得亲近，又略微失衡。

绑定主张：

- `claim:artic:28560:artist`
- `claim:artic:28560:visible-furniture`
- `claim:artic:28560:spatial-instability`

### 标签

```yaml
- label: 室内空间
  vocabulary: canvium-subject-v1
  confidence: high
  claimIds:
    - claim:artic:28560:visible-furniture

- label: 强轮廓
  vocabulary: canvium-visual-v1
  confidence: medium
  visualEvidenceIds:
    - visual:artic:28560:bed-edge
    - visual:artic:28560:back-wall

- label: 倾斜空间
  vocabulary: canvium-visual-v1
  confidence: medium
  claimIds:
    - claim:artic:28560:spatial-instability
```

低置信标签可以保留在候选中，但不能进入公开筛选和导航。

### 色板

```yaml
- hex: "#B8A445"
  label: muted yellow
  proportion: 0.30
- hex: "#7B9EB1"
  label: cool blue
  proportion: 0.26
- hex: "#9B5C3F"
  label: warm brown
  proportion: 0.20
- hex: "#C7B79A"
  label: light neutral
  proportion: 0.14
- hex: "#444743"
  label: dark outline
  proportion: 0.10
```

色板属于计算结果，需要记录算法版本和图片修订。以上数值用于展示数据结构，正式数值必须由确定性色彩提取程序重新计算，不能由语言模型目测填写。

### 无障碍描述

短描述：

> 一间色彩鲜明的卧室，右侧是一张木床，左侧摆放椅子和小桌，后墙有窗户与悬挂的画作。

长描述：

> 画面呈现一间小型卧室。木床占据右半部，床头靠近后墙；左侧有两把椅子和一张放置日常物品的小桌。后墙中央是一扇关闭的窗户，两侧悬挂画作。家具、墙面和地板由明显的深色轮廓分隔。地板线条向后延伸，但床沿、椅子和墙面的方向并未形成完全规则的透视空间。

无障碍描述只陈述可见内容，不加入象征意义、情绪诊断或观看指令。

## 6. 仅供聊天使用的内部线索

以下内容不会显示在作品页，也不会作为“推荐问题”按钮返回给客户端。

### `cue:artic:28560:space`

```yaml
topic: space
triggerIntents:
  - 房间为什么看起来有点歪
  - 透视
  - 空间不稳定
  - 家具角度
claimIds:
  - claim:artic:28560:visible-furniture
  - claim:artic:28560:spatial-instability
visualEvidenceIds:
  - visual:artic:28560:bed-edge
  - visual:artic:28560:floor-lines
move: invite_observation
transitionHint: 先回答用户对空间的疑问；若衔接自然，再提到床沿和地板线条。不要把它说成观察任务。
delivery:
  minimumTurn: 2
  cooldownTurns: 4
  maxUsesPerConversation: 1
  requiresUserInitiation: true
confidence: medium
status: verified
```

可能产生的自然回复：

> 因为这里的家具并没有服从同一个整齐的透视秩序。床沿、椅子和地板各自把视线带向稍有差异的方向，所以房间虽然很具体，却不像一只测量准确的盒子。你感到的那种轻微倾斜，主要可以从床的边缘和向后延伸的地板线条中察觉。

不能产生：

> 请观察床沿和地板线条。你觉得它们有什么特点？

### `cue:artic:28560:repose`

```yaml
topic: context
triggerIntents:
  - 这幅画让人平静吗
  - 梵高想表达什么
  - 房间的情绪
claimIds:
  - claim:artic:28560:arles-version
move: mention
transitionHint: 将馆方转述的画家表达意图与当前视觉感受并置，明确说明来源，不把两者强行统一。
delivery:
  minimumTurn: 2
  cooldownTurns: 4
  maxUsesPerConversation: 1
  requiresUserInitiation: true
confidence: high
status: verified
```

这里应允许人格指出“画家表达意图”和“今天的观看感受”可能不同，而不是替用户规定唯一答案。

## 7. 生成与审核记录

```yaml
generation:
  provider: openai
  model: configured-stage6-model
  promptVersion: stage6-artwork-knowledge-v1
  inputHash: <sha256>
  generatedAt: <ISO-8601 timestamp>

review:
  status: passed
  evaluationVersion: stage6-eval-v1
  checks:
    schema: passed
    sourceReferences: passed
    visualGrounding: passed
    dialogueCueGrounding: passed
    prohibitedPublicQuestions: passed
    accessibilitySafety: passed
    humanSampleReview: passed

publication:
  status: published
  version: candidate-<input-hash-prefix>
  publishedAt: <ISO-8601 timestamp>
  publishedBy: <reviewer-id>
```

本文模拟的是最终通过状态。真实流水线不会直接把模型返回的 `review.status` 当真；必须由独立验证器和审核流程写入通过结果。

## 8. 机器实际保存在哪里

当前已经实现的阶段 6 存储结构为：

```text
data/generated/artwork-knowledge/
└── artic_28560/
    ├── zh/
    │   ├── candidates/
    │   │   └── candidate-<input-hash-prefix>.json
    │   ├── published.json
    │   └── run-state.json
    └── en/
        ├── candidates/
        │   └── candidate-<input-hash-prefix>.json
        ├── published.json
        └── run-state.json
```

各文件职责：

| 文件                | 作用                                       | 是否可修改               |
| ------------------- | ------------------------------------------ | ------------------------ |
| `candidates/*.json` | 保存每次生成并通过 Schema 的不可变候选     | 不覆盖；新输入产生新版本 |
| `published.json`    | 当前线上读取的已审核版本                   | 只由发布动作原子替换     |
| `run-state.json`    | 保存输入哈希、运行状态、重试次数和产物路径 | 流水线运行时更新         |

下一步还会补齐来源快照目录：

```text
data/generated/source-snapshots/
└── artic_28560/
    ├── museum-record/
    │   └── <content-hash>.json
    └── image-record/
        └── <image-revision>.json
```

来源快照只保存馆方响应、许可和图片元数据，不重复下载并提交整张高清作品图片。作品图继续使用经过权利校验的来源 URL。

## 9. 页面和聊天分别读取什么

作品页 API 只返回：

- 已发布简介；
- 已发布标签、关系和色板；
- 无障碍描述；
- 用户可查看的来源与权利信息。

作品页 API 不返回：

- `DialogueCue`；
- `transitionHint`；
- 内部评估意见；
- 被拒绝或低置信候选；
- 原始模型响应；
- 推荐问题列表。

人格聊天服务端可以读取：

- 当前作品的已发布 `Claim`；
- 与用户消息相关的少量 `DialogueCue`；
- 当前人格允许使用的来源与时间边界；
- 当前会话已经使用过的线索和冷却状态。

浏览器不能下载完整内部知识包，避免内部提示、未发布内容和人格编排规则泄露。

## 10. 回滚与失效

- 馆方元数据变化：依赖相应来源的主张和公开内容标记为 `stale`；
- 图片变化：视觉证据、色板、视觉标签、无障碍描述和观察型 `DialogueCue` 标记为 `stale`；
- Prompt 或模型变化：产生新候选，不自动覆盖当前发布版本；
- 新候选评估失败：线上继续读取上一份 `published.json`；
- 发布后发现问题：把 `published.json` 原子切回上一份通过审核的候选。

因此，一件“做完”的作品不是一段散文，而是一份有来源、有证据、有版本、有发布状态，并能安全支持人格聊天的知识包。
