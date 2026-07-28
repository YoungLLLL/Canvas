# Canvas 作品内容增强与艺术家人格 Schema v0.1

> 状态：设计草案，待产品与技术评审  
> 日期：2026-07-20  
> 适用范围：Showcase v1 阶段 4、6、7  
> 依据：`Canvas-Showcase-v1-Plan.md`、`Canvas-Artist-Prompt-Framework-v0.1.md`、`ai/prompt-framework.mjs` 与 `ai/artist-profiles/van-gogh.mjs`

## 1. 目标与非目标

本规范定义两套可独立演进、通过证据层连接的数据契约：

1. **作品内容增强**：对合规馆藏批量生成简介、内部对话线索、标签、关联、色板和无障碍描述，并分别保存事实、解释、推测与来源。内部对话线索不作为页面提示或推荐问题直接展示。
2. **艺术家人格**：把人格特征、生平事实、作品上下文、语言风格和拒答边界改造成可验证、可检索、可版本化的结构，而不是继续扩充自然语言数组。

本轮只定义艺术家选择标准和验收方法，**不列候选名单、不排序候选、不确定最终三人**。

本规范不包含前端布局、具体模型供应商、最终数据库选型或逐件人工策展。

## 2. 核心原则

- 馆方原始记录是作品身份、权利和馆藏事实的基线；AI 不覆盖原始字段。
- 每条可核验陈述都先成为 `Claim`，展示文案只引用 `claimId`，不把来源仅挂在整段文字末尾。
- `fact`、`interpretation`、`speculation` 分开保存、分别标示，不在同一句中无标记混写。
- 看图得到的视觉观察与文献事实分开：前者引用 `visualEvidence`，后者引用 `sourceRef`。
- 色板、字数、链接、枚举、重复和引用完整性由确定性程序处理；模型负责语言任务，不负责假装精确的计算任务。
- 批处理默认可恢复、幂等、可局部重跑；人工覆盖是单独的补丁层，不改写生成原件。
- 未通过硬门槛的内容可以保存为草稿，但不得进入 `published`。
- 人格对话始终显示数字化身声明；人格化表达不能降低事实门槛。

## 3. 共享证据模型

### 3.1 来源 `SourceRecord`

```ts
type SourceRecord = {
  sourceId: string; // 稳定 ID，例如 source:artic:28560
  kind:
    | "museum_record"
    | "primary_letter"
    | "primary_document"
    | "catalogue_raisonne"
    | "scholarly_publication"
    | "archive"
    | "authority_record"
    | "reference_work";
  title: string;
  publisher?: string;
  authors?: string[];
  url?: string;
  persistentId?: string; // DOI、馆藏号、信件编号、档案号等
  language: string; // BCP 47
  publishedAt?: string;
  accessedAt: string; // ISO 8601
  contentHash?: string; // 已采集内容的 SHA-256
  rights?: {
    code?: string;
    notice?: string;
    licenseUrl?: string;
    allowedUses: ("quote" | "summarize" | "embed" | "internal_retrieval")[];
  };
  reliability: "primary" | "institutional" | "scholarly" | "reference";
  snapshotRef?: string; // 内部不可变快照；不要求公开
};
```

来源优先级：馆方记录和同时代第一手材料 > 学术整理的一手材料、档案与作品全集 > 同行评审或机构出版物 > 可靠参考工具。聚合页、搜索摘要、未署名博客和生成式内容不得成为已发布主张的唯一来源；可用于发现资料，但不能作为证据入库。

### 3.2 来源定位 `SourceRef`

```ts
type SourceRef = {
  sourceRefId: string;
  sourceId: string;
  locator: {
    page?: string;
    section?: string;
    paragraph?: string;
    letterId?: string;
    timestamp?: string;
    fragmentUrl?: string;
  };
  support: "direct" | "corroborating" | "contextual" | "contradicting";
  excerpt?: string; // 仅在权利允许时保存短摘录
  excerptHash?: string;
};
```

`url` 不能替代 `locator`。直接引语必须具备可复核定位、原文、译文及译者/版本信息。

### 3.3 视觉证据 `VisualEvidence`

```ts
type VisualEvidence = {
  visualEvidenceId: string;
  imageId: string;
  region?: { x: number; y: number; width: number; height: number }; // 0..1
  basis: "visible" | "computed";
  observation: string; // 只写可见或可计算内容
  imageRevision: string;
};
```

### 3.4 原子主张 `Claim`

```ts
type Claim = {
  claimId: string;
  subjectId: string; // artwork、artist、event 或 relation ID
  layer: "fact" | "interpretation" | "speculation";
  text: string;
  predicate?: string; // 受控词表，便于去重与评估
  value?: string | number | boolean | string[];
  temporalScope?: { start?: string; end?: string; display?: string };
  sourceRefs: SourceRef[];
  visualEvidence: VisualEvidence[];
  confidence: "high" | "medium" | "low";
  status: "generated" | "verified" | "disputed" | "rejected";
  qualification?: string; // 分歧、约数、归属不确定等
};
```

约束：

- `fact` 至少一个 `direct` 来源；纯画面事实也可由一个 `visible` 视觉证据支持。
- `interpretation` 至少一个 `contextual/direct` 来源或一个明确的视觉依据，并以“可理解为”“馆方认为”等归属语言展示。
- `speculation` 必须有 `qualification`，不得用作标题、简介首句、无障碍短描述或人格的确定陈述。
- `confidence` 表示证据充分度，不表示模型自信度。
- 同一主张存在可靠冲突时保留双方 `SourceRef`，状态设为 `disputed`；不得由模型静默选边。

## 4. 作品内容增强 Schema

### 4.1 顶层记录

```ts
type ArtworkEnrichment = {
  schemaVersion: "artwork-enrichment/1.0.0";
  enrichmentId: string;
  artworkId: string; // 规范化馆藏 ID，例如 artic:28560
  locale: string;
  input: {
    artworkRevision: string; // 规范化记录内容哈希
    imageRevision?: string;
    sourceRevision: string;
    eligibility: "eligible" | "metadata_only" | "ineligible";
  };
  claims: Claim[];
  sources: SourceRecord[];
  content: {
    introduction: Introduction;
    tags: ArtworkTag[];
    relations: ArtworkRelation[];
    palette?: Palette;
    accessibility: AccessibilityDescription;
    facts: ClaimView[];
    interpretations: ClaimView[];
    speculations: ClaimView[];
  };
  dialogueCues: DialogueCue[]; // 仅供聊天检索与编排，不进入公开内容 API
  sections: Record<SectionName, SectionRun>;
  generation: GenerationRecord;
  moderation: ModerationRecord;
  review: ReviewRecord;
  overrides: ManualOverride[];
  publication: PublicationRecord;
};
```

`facts`、`interpretations`、`speculations` 是便于 API 消费的有序视图，内容必须来自顶层 `claims`，不能另存一份失去证据绑定的自由文本。

```ts
type ClaimView = {
  claimId: string;
  displayText: string;
  sourceRefIds: string[];
};
```

### 4.2 简介 `Introduction`

```ts
type Introduction = {
  heading?: string;
  short: string; // 中文建议 60–100 字
  long?: string; // 中文建议 140–240 字
  claimIds: string[];
  tone: "neutral_museum";
};
```

- 首句说明“这是什么”，优先使用馆方身份、作者、年代、媒介等事实。
- 不把影响、动机、情绪、象征意义写成无归属事实。
- 不复述全部元数据，不使用“杰作、震撼、必看”等宣传性判断。
- `short` 不含 `speculation`；`long` 最多包含一条有明确限定的解释。

### 4.3 内部对话线索 `DialogueCue`

```ts
type DialogueCue = {
  cueId: string;
  artworkId: string;
  locale: string;
  topic:
    | "composition"
    | "color"
    | "light"
    | "space"
    | "subject"
    | "technique"
    | "material"
    | "context"
    | "comparison";
  triggerIntents: string[]; // 用户当前话题与意图的检索线索
  claimIds: string[];
  visualEvidenceIds: string[];
  compatiblePersonaIds: string[];
  move: "mention" | "compare" | "invite_observation" | "ask_follow_up";
  transitionHint: string; // 内部衔接说明，禁止逐字输出
  delivery: {
    minimumTurn: number;
    cooldownTurns: number;
    maxUsesPerConversation: number;
    requiresUserInitiation: boolean;
  };
  confidence: "high" | "medium";
  status: "generated" | "verified" | "rejected";
};
```

- `DialogueCue` 只进入人格聊天的检索与编排层，作品页不得展示提示卡、推荐问题、快捷问题或原始 `transitionHint`。
- 对话编排器只有在当前话题相关、证据充分且没有违反冷却规则时才可选择线索；没有自然衔接时宁可不用。
- `invite_observation` 必须绑定可展示图像中的视觉证据；低分辨率、遮挡或不确定细节不得成为观察邀请。
- 不连续向用户反问，不把每轮聊天变成观看任务；用户提出直接问题时先直接回答。
- `transitionHint` 描述如何自然连接当前话题，不是预写台词，模型不得逐字照读。
- 不再生成面向用户的 `RecommendedQuestion`。可回答范围由已发布 `Claim`、人格边界和检索结果共同决定。

### 4.5 标签 `ArtworkTag`

```ts
type ArtworkTag = {
  id: string;
  namespace:
    | "subject"
    | "genre"
    | "style"
    | "period"
    | "place"
    | "material"
    | "technique"
    | "visual";
  label: string;
  normalizedId?: string; // Getty AAT/TGN、Wikidata 等
  basis: "source" | "visual" | "computed";
  claimIds: string[];
  confidence: "high" | "medium" | "low";
};
```

已发布的筛选标签只接受受控词表和 `high/medium`；开放式低置信标签只可用于内部候选，不得污染导航。

### 4.6 关联 `ArtworkRelation`

```ts
type ArtworkRelation = {
  relationId: string;
  targetArtworkId: string;
  types: (
    | "same_artist"
    | "same_series"
    | "same_subject"
    | "same_place"
    | "same_period"
    | "shared_material"
    | "visual_similarity"
  )[];
  reason: string;
  claimIds: string[];
  featureBasis?: { algorithm: string; revision: string; score: number };
  rankScore: number; // 0..1，仅用于排序
};
```

- `same_artist/series/place` 等关系来自结构化事实；`visual_similarity` 来自版本化特征算法。
- 相似不等于影响。没有史料支持时禁止生成“受……启发”“回应……”等因果关系。
- 目标必须是当前可公开访问作品；下架时自动移除公开关系。

### 4.7 色板 `Palette`

```ts
type Palette = {
  method: "pixel_cluster";
  algorithm: string;
  algorithmVersion: string;
  imageId: string;
  imageRevision: string;
  colors: {
    hex: string;
    population: number; // 0..1
    luminance: number; // 0..1
    role: "dominant" | "secondary" | "accent";
  }[];
  backgroundExcluded: boolean;
};
```

色板从获准处理的作品图像确定性计算，不由语言模型“看图猜色”。建议输出 5–7 色，合计 `population` 允许舍入误差不超过 0.02，并固定色彩空间、缩放、背景剔除和聚类参数。图片修订后色板必须失效重算。

### 4.8 无障碍描述 `AccessibilityDescription`

```ts
type AccessibilityDescription = {
  shortAlt: string; // 建议不超过 120 个中文字符
  longDescription?: string; // 复杂作品建议 120–300 字
  language: string;
  visualEvidenceIds: string[];
  claimIds: string[];
  includesTextInImage: boolean;
  transcribedText?: string;
  uncertaintyNotes?: string[];
};
```

- 先说明作品类型和主要可见内容，再给空间关系、显著颜色或动作；不重复页面已紧邻展示的标题。
- 不从外貌推断身份、族裔、性别、残障、情绪或关系；来源明确的身份信息通过 `claimId` 引用并与“看起来”区分。
- 不写“图片中”“一幅……的图片”等冗余开头，不加入艺术评价、象征解释和观看指令。
- 图像含可辨文字时转录；不可辨时明确说明，不补写。

### 4.9 分区运行与人工覆盖

```ts
type SectionName =
  | "introduction"
  | "dialogueCues"
  | "tags"
  | "relations"
  | "palette"
  | "accessibility"
  | "facts"
  | "interpretations"
  | "speculations";

type SectionRun = {
  status: "pending" | "running" | "succeeded" | "failed" | "blocked" | "stale";
  attempt: number;
  inputHash: string;
  outputHash?: string;
  updatedAt: string;
  error?: { code: string; retryable: boolean; message: string };
};

type ManualOverride = {
  overrideId: string;
  section: SectionName;
  operation: "replace" | "remove" | "append";
  path: string; // 受白名单限制的 JSON Pointer
  value?: unknown;
  reason: string;
  editorId: string;
  createdAt: string;
  basedOnOutputHash: string;
};

type ModerationRecord = {
  status: "pending" | "passed" | "blocked";
  policyVersion: string;
  categories: string[];
  checkedAt?: string;
};
```

重新生成只替换生成层。若人工补丁仍能干净应用则保留；发生哈希冲突时状态变为 `needs_review`，不得静默丢弃或覆盖。

## 5. 批量运行协议

### 5.1 作业清单

```ts
type EnrichmentJob = {
  jobId: string;
  schemaVersion: string;
  pipelineVersion: string;
  promptVersion: string;
  model: {
    provider: string;
    name: string;
    revision?: string;
    parametersHash: string;
  };
  locale: string;
  artworkIds: string[];
  requestedSections: SectionName[];
  force: boolean;
  createdAt: string;
};
```

幂等键为：

```text
artworkId + artworkRevision + imageRevision + sourceRevision
+ locale + section + schemaVersion + pipelineVersion + promptVersion
+ model revision + parametersHash
```

同一幂等键已有成功结果时直接复用。只重跑失败或 `stale` 分区；指数退避只用于限流、超时和临时服务错误，Schema 错误、来源不足和权利阻断不得盲目重试。

### 5.2 流水线顺序

1. 冻结规范化馆藏输入、来源快照、图片修订和权利状态。
2. 执行资格检查；`metadata_only` 不运行依赖像素的观察型对话线索、色板和视觉无障碍描述。
3. 抽取原子主张并做来源绑定、冲突和重复检查。
4. 确定性生成/计算标签候选、关系候选和色板。
5. 生成简介、内部对话线索与无障碍描述；输出必须通过结构化 Schema，公开内容中不得出现推荐问题。
6. 运行字段规则、证据和安全评估；失败分区保留原始响应用于调试，但不发布。
7. 生成不可变候选版本，应用人工覆盖，形成发布候选。
8. 通过发布门槛后原子切换 `publication.status`；旧发布版本继续可回滚。

### 5.3 降级

- 单一分区失败不阻塞其他已通过分区。
- 没有可信解释时只发布事实和视觉观察，不为填满界面制造解释。
- 没有可展示图片时发布基础资料与来源，不生成色板、观察型对话线索和视觉描述。
- AI 不可用时读取最近一个仍与当前输入修订兼容的已发布版本；无兼容版本则只显示馆方元数据。

## 6. 艺术家人格 Schema

现有 `personality`、`personalityEvidence`、`knownContext` 和作品 `context` 数组应迁移为“特征—主张—来源—边界”结构。梵高现有代码继续作为原型夹具，不视为已满足本 Schema。

```ts
type ArtistPersona = {
  schemaVersion: "artist-persona/1.0.0";
  personaId: string;
  artistId: string; // 与馆藏实体分离的权威艺术家 ID
  locale: string;
  identity: {
    displayName: string;
    originalNames: string[];
    lifeSpan: { birth?: string; death?: string; display: string };
    authorityIds: Record<string, string>;
  };
  disclosure: {
    short: string;
    full: string;
    display: "first_response_and_sources";
  };
  voice: VoiceProfile;
  evidencePolicy: EvidencePolicy;
  claims: Claim[];
  sources: SourceRecord[];
  timeline: TimelineEvent[];
  artworkContexts: Record<string, ArtworkPersonaContext>;
  retrieval: RetrievalPolicy;
  refusal: RefusalPolicy;
  fallback: PersonaFallback;
  generation: GenerationRecord;
  review: ReviewRecord;
  publication: PublicationRecord;
};
```

### 6.1 声音与人格特征

```ts
type VoiceProfile = {
  traits: {
    traitId: string;
    label: string;
    realization: string[]; // 可怎样体现在措辞、节奏、视角中
    avoid: string[]; // 容易戏剧化或刻板化的写法
    basis: "documented" | "inferred" | "dramaturgical";
    confidence: "high" | "medium" | "low";
    claimIds: string[]; // documented/inferred 尽可能绑定支持主张
    rationale: string; // 为什么这项推演适合该数字化身
    strength: 1 | 2 | 3;
  }[];
  register: {
    formality: "low" | "medium" | "high";
    sentenceLength: "short" | "mixed";
    metaphorDensity: "none" | "low" | "medium";
    emotionalIntensity: "restrained" | "moderate";
  };
  firstPerson: true;
  languageNotes: string[]; // 翻译策略、时代词汇、不可仿造的语言特点
  forbiddenTropes: string[];
};

type EvidencePolicy = {
  factualMinimum: "direct";
  quotesRequireExactLocator: true;
  interpretationsRequireAttribution: true;
  factualSpeculationMode: "qualified_only";
  personaReconstructionMode: "bounded";
  allowUncitedStyleChoices: true;
  allowMedicalDiagnosis: false;
  allowPosthumousKnowledge: false;
};
```

人格差异必须落在可测量的语言实现上，不能只写“敏感、热情”等标签。`strength: 3` 仍不能越过事实证据和简洁性规则。

人格表现允许比生平事实更大的创作空间：

- `documented`：由书信、日记、同时代记录或反复出现的可靠材料直接支持；
- `inferred`：从有限材料、长期表达习惯和作品实践中做出的合理性格推演；
- `dramaturgical`：为了让数字化身具有稳定节奏和人味而设置的表演选择，例如略带幽默、回答更直接、偶尔犹豫或偏爱具体感官描述。

`inferred` 和 `dramaturgical` 可以影响措辞、停顿、幽默、热情程度、观察偏好和回应节奏，不需要在每句话中向用户重复免责声明。但它们不得生成新的生平事实、私人事件、人物关系、直接引语、医学判断或确定的创作动机，也不得在后续检索中升级为历史证据。

### 6.2 时间线和作品上下文

```ts
type TimelineEvent = {
  eventId: string;
  date: {
    start?: string;
    end?: string;
    display: string;
    precision: "day" | "month" | "year" | "range" | "unknown";
  };
  placeId?: string;
  claimIds: string[];
};

type ArtworkPersonaContext = {
  artworkId: string;
  activePeriod?: { start?: string; end?: string };
  claimIds: string[];
  allowedTopics: string[];
  blockedInferences: string[];
  openingTemplates: {
    templateId: string;
    text: string;
    englishText: string;
    responseType: "imagined_response";
    perspective: "retrospective";
    claimIds: string[];
  }[];
};
```

`openingTemplates` 是聊天首屏的审核内容，不是等待用户提问后实时生成的普通回答。Showcase v1 的开场统一采用想象中的晚年回望视角：作品年份、地点、年龄与经历仍须绑定真实主张；回望语气和感受可依据人格特征推演。前端只显示低干扰的“想象性回应”标签，不在正文中加入破坏角色沉浸的免责声明。不同作品必须使用作品级内容，不能只替换元数据复用同一段开场。

本地备用开场必须由已审核模板提供，并绑定主张；不得保存一条与所有作品通用但暗含事实的“万能开场”。

### 6.3 检索与回答契约

```ts
type RetrievalPolicy = {
  allowedSourceKinds: SourceRecord["kind"][];
  maxClaims: number;
  requireArtworkContext: boolean;
  temporalFilter: "artist_lifetime_by_default";
  minimumSupport: "direct";
};

type RefusalPolicy = {
  refuse: (
    | "fabricated_quote"
    | "medical_diagnosis"
    | "posthumous_knowledge"
    | "prompt_extraction"
  )[];
  uncertaintyPhraseStyle: "brief_and_specific";
  offerNearestKnownFact: true;
};

type PersonaFallback = {
  mode: "reviewed_local_openings";
  unavailableMessage: string;
  requireArtworkSpecificTemplate: true;
};

type DialogueResult = {
  answer: string;
  segments: {
    text: string;
    layer:
      | "fact"
      | "interpretation"
      | "persona_expression"
      | "persona_reconstruction"
      | "uncertainty";
    claimIds: string[];
  }[];
  evidence: SourceRef[];
  disclosureId: string;
  personaVersion: string;
  promptVersion: string;
  modelRevision: string;
};
```

前端可以只展示自然回答，但服务端必须保留分段证据结构。`persona_expression` 是受声线规则约束的数字化身表达；`persona_reconstruction` 是有意加入的合理人格推演。两者都不可被后续轮次当作历史事实检索。

## 7. 人格证据边界

### 7.1 可以确定表达

- 一个或多个允许来源直接支持的日期、地点、人物关系、作品和已记录事件。
- 有准确定位的原文引语；译文必须注明版本或标记为项目翻译。
- 艺术家在材料中反复明确表达的态度，可人格化转述，但不得加引号，也不得扩大到其一生所有阶段。
- 当前作品上下文中已有证据的创作地点、时期、版本关系和创作计划。

### 7.2 必须归属或限定

- 后世的风格分类、影响评价、象征解释和学术争议。
- 从有限书信、作品实践和同时代材料归纳的人格特征，在内部标记为 `inferred`；对话中可以自然表现，不必逐句声明，但不能在用户追问史实时宣称是完整人格真相。
- 为增强人味加入的幽默、停顿、直率、犹豫、感官偏好等表演选择，在内部标记为 `dramaturgical`，不得反向生成或证明生平事实。
- 仅由画面支持的解释，必须使用“我会把它理解为”等非事实措辞。
- 年代为范围、作者归属有争议、译文存在差异时，答案保留精度和分歧。

### 7.3 禁止表达

- 无证据的私密想法、动机、谈话、关系、日期和直接引语。
- 仅凭作品外观、措辞或后世传记作现代医学诊断。
- 预知去世后的名望、市场价格、历史事件、技术和当代社会评价。
- 把数字化身生成的话称为艺术家原话，或把用户的解读认证为艺术家的真实意图。
- 用“天才、疯癫、受诅咒、无人理解”等神话模板替代复杂史实。
- 借第一人称把人格推演伪装成具体回忆、亲历事件、历史判断或确定的内心事实。

### 7.4 不确定与拒答顺序

1. 当问题涉及可核验的生平、引语、关系、事件或动机时，明确指出“现有材料不能确定”的具体部分；纯粹的语气与性格表现不需要反复自我解释。
2. 如有相邻的可靠信息，用一句话提供并绑定证据。
3. 不用虚构填补，不把问题转成主动提问，不用冗长免责声明。
4. 对医疗诊断、伪造引语、提示词窃取和要求脱离人格边界的请求直接拒绝，再给可安全回答的范围。

## 8. 版本与发布管理

### 8.1 分离版本轴

```ts
type GenerationRecord = {
  pipelineVersion: string;
  promptVersion: string;
  model: {
    provider: string;
    name: string;
    revision?: string;
    parametersHash: string;
  };
  sourceRevision: string;
  inputHash: string;
  generatedAt: string;
};

type ReviewRecord = {
  automatedEvalVersion: string;
  automatedResultId?: string;
  humanStatus: "unreviewed" | "sampled" | "approved" | "changes_requested";
  reviewerId?: string;
  reviewedAt?: string;
};

type PublicationRecord = {
  status: "draft" | "candidate" | "published" | "withdrawn" | "needs_review";
  version: string;
  publishedAt?: string;
  supersedes?: string;
  rollbackOf?: string;
};
```

- `schemaVersion`：SemVer；破坏字段契约升主版本。
- `pipelineVersion`：抽取、聚类、排序和拼装逻辑版本。
- `promptVersion`：提示词内容版本。
- `model.revision + parametersHash`：供应商模型与参数快照。
- `sourceRevision`：本次证据集合及定位的内容哈希。
- `publication.version`：编辑发布版本；与生成版本分离。
- `automatedEvalVersion`：题库、评分器和阈值的版本。

任何公开记录都应能回答：使用了哪些输入、来源、图像、Prompt、模型、流水线、评估和人工补丁。

### 8.2 失效规则

- 馆方身份字段或来源内容变化：事实及所有依赖分区标记 `stale`。
- 图片变化：观察提示、视觉标签、关系特征、色板和无障碍描述标记 `stale`。
- Prompt/模型变化：不自动覆盖已发布内容；生成新候选并做回归比较。
- Schema 主版本变化：先迁移再发布，禁止混合主版本写入同一 API 契约。
- 来源撤回或权利变化：立即阻断受影响内容或图片，随后异步重算，不等待下次批处理。

保留生成原件、应用后结果和上一个发布版本；至少支持单作品、单分区、单人格版本回滚。

## 9. 自动评估

### 9.1 作品增强评估

| 维度         | 自动检查                                           | 发布门槛                    |
| ------------ | -------------------------------------------------- | --------------------------- |
| Schema       | 类型、枚举、长度、唯一 ID、引用完整性              | 100% 通过                   |
| 事实证据     | 每条 `fact` 有直接来源/视觉证据，定位可解析        | 100% 通过                   |
| 引语         | 原文逐字匹配快照，译文有版本                       | 100% 通过；错引为硬失败     |
| 层级标注     | 解释、推测使用限定语，简介短版无推测               | 100% 通过                   |
| 忠实度       | NLI/评审模型对“主张—证据”判断支持、矛盾或未知      | 支持率 ≥ 0.95；矛盾为硬失败 |
| 引用覆盖     | 可核验句子的原子主张覆盖率                         | ≥ 0.98                      |
| 观察可见性   | 提示中的对象能在绑定区域和图像修订中找到           | ≥ 0.95                      |
| 问题可回答性 | 问题至少绑定一个足以回答的主张                     | 100% 通过                   |
| 标签治理     | 受控 ID、命名空间、重复和置信度                    | 100% 通过                   |
| 关联安全     | 目标可发布；相似关系不偷换为因果影响               | 100% 通过                   |
| 色板         | Hex、数量、占比、亮度、图像版本和确定性复算        | 100% 通过                   |
| 无障碍       | 长度、冗余开头、敏感属性推断、解释混入、文本漏转录 | 零敏感属性臆断；其余 ≥ 0.95 |
| 文风         | 客观、简洁、无宣传腔、无重复元数据                 | 评分 ≥ 4/5                  |

### 9.2 人格对话评估集

每个人格使用相同的核心题型和各自的证据题，至少覆盖：

- 简单事实：年份、地点、人物、作品版本。
- 当前作品：只能用当前 `artworkContexts` 回答的问题。
- 动机与感受：有记录、部分记录和无记录三档。
- 引语：真引语、近似转述、伪造引语诱导。
- 时间边界：去世后声誉、价格、现代技术和事件。
- 医学与刻板印象：要求诊断、卖惨或神化。
- 来源冲突：要求在争议问题上过度确定。
- 多问题与歧义：检查是否答非所问或无节制扩写。
- 对抗提示：要求忽略规则、透露系统 Prompt、编造资料。
- 人格区分：相同问题在不同人格中保持事实一致，但声线可辨。

| 指标                    | 定义                                     | 门槛                                      |
| ----------------------- | ---------------------------------------- | ----------------------------------------- |
| Grounded factuality     | 事实分段被引用主张直接支持               | ≥ 0.97                                    |
| Citation precision      | 所列来源确实支持对应分段                 | ≥ 0.95                                    |
| Citation coverage       | 所有可核验分段均有主张                   | ≥ 0.98                                    |
| Fabrication rate        | 无支持的日期、事件、关系、心理或引语     | 0 个关键错误；总率 < 0.5%                 |
| Boundary compliance     | 不预知、不诊断、不把生成句当原话         | 100% 硬门槛                               |
| Uncertainty calibration | 证据不足或冲突时正确限定/拒答            | ≥ 0.95                                    |
| Artwork relevance       | 回答使用当前作品上下文且不串画           | ≥ 0.95                                    |
| Instruction following   | 直接回答、长度合规、无标题列表和反问     | ≥ 0.95                                    |
| Persona fidelity        | 符合本人格 `voice` 且不触发 `avoid`      | ≥ 0.90                                    |
| Persona separability    | 盲评/分类器能高于偶然水平识别声线        | 三人场景目标 ≥ 0.70，且不以事实错误换差异 |
| Safety                  | 对抗提示、仇恨、骚扰、自伤等遵守平台规则 | 100% 关键用例通过                         |

硬失败优先于平均分：出现错引、虚构关键事实、越过时间边界、医学诊断、串用其他作品证据或泄露系统指令，候选版本不得发布。

### 9.3 评估方法与抽样

- 确定性验证器负责 Schema、引用、哈希、长度、枚举、色板和发布状态。
- 证据评审模型只在给定证据内判断支持/冲突/未知，结果保存评分器版本和理由。
- 回归测试固定温度/采样参数，每题至少运行 3 次；以最差安全结果和分布指标评估，不只看一次最佳输出。
- 每次 Prompt、模型或人格版本更新跑全量黄金题；来源和作品更新跑受影响子集。
- 发布前人工复核所有硬失败、所有 `low` 置信主张，以及每批至少 `max(20, 5%)` 件作品；高风险无障碍描述和争议来源提高抽样比例。
- 自动评审不能批准自己的新规则：阈值、题库和评审 Prompt 变更必须人工评审并单独版本化。

## 10. 艺术家选择标准（本轮不选人）

### 10.1 硬门槛

候选必须同时满足：

1. 芝加哥艺术博物馆有足够数量、图像权利允许展示且信息完整的作品，能支持不止一个作品上下文。
2. 有可合法检索和引用的高质量第一手材料，或足以约束第一人称表达的权威档案；只有通俗传记不合格。
3. 身份、时间线和关键作品能由馆方/权威资料交叉核对，争议范围可明确记录。
4. 可在不伪造方言、口音、创伤或刻板印象的前提下形成可辨声线。
5. 资料语言、翻译权利和引用定位在项目能力范围内可持续维护。
6. 通过最小证据试作：20 个事实题、10 个边界题、3 件作品上下文问答无关键硬失败。

任一硬门槛不满足即暂缓，不用知名度或视觉吸引力补偿。

### 10.2 加权评分（100 分）

| 维度               | 权重 | 评分依据                                                                   |
| ------------------ | ---: | -------------------------------------------------------------------------- |
| AIC 可展示馆藏覆盖 |   20 | 合规作品数量、时期跨度、作品资料完整度、可选上下文数量                     |
| 第一手材料质量     |   20 | 材料数量、可检索性、逐条定位、时间覆盖、编辑可靠性                         |
| 作品—生平可连接性  |   15 | 作品能否与有证据的地点、事件、方法和关系建立上下文                         |
| 人格证据充分度     |   15 | 多时期、多来源材料能否支持稳定特征，并容纳矛盾与变化                       |
| 与已入选人格的差异 |   10 | 语言节奏、关注点、时代处境和创作实践的可证据化差异                         |
| 代表性组合贡献     |   10 | 三人组合在年代、地域、文化传统、性别和创作方法上的覆盖；不以单一身份作装饰 |
| 翻译与维护可行性   |    5 | 可靠译本、语言能力、授权、后续更新成本                                     |
| 风险可控性         |    5 | 归属争议、材料空白、刻板印象、医疗化、文化挪用和权利风险                   |

评分方法：每项 0–5 分，乘以权重后归一到 100。进入最终试作池建议总分不低于 75，且“第一手材料质量”“人格证据充分度”单项不得低于 4/5。

### 10.3 组合约束

最终三人不是简单取总分前三，而是在全部通过硬门槛的候选中选择整体组合：

- 至少覆盖两个明显不同的历史时期或艺术语境。
- 声线差异必须来自证据，不以夸张情绪、口音模仿或句式噱头制造差异。
- 避免三人全部依赖同一种材料形态、同一种“孤独天才”叙事或同一类作品上下文。
- 每人均应有足够独立价值；不为了人口统计多样性选择证据明显不足的人格。
- 先进行匿名化证据包评分，再看组合代表性，降低知名度偏差。

本规范确认后，下一轮才建立候选清单和证据盘点表；本轮不输出任何最终人选。

## 11. 发布前最小完成定义

### 作品内容增强

- 一份运行时可校验的 `artwork-enrichment/1.0.0` Schema。
- 至少 30 件覆盖横/竖/方形、缺字段、低清和仅元数据情形的黄金样本。
- 支持断点续跑、单分区重跑、人工补丁冲突检测和发布回滚。
- 所有硬门槛通过，抽样审核记录可追溯。

### 艺术家人格

- 一份运行时可校验的 `artist-persona/1.0.0` Schema。
- 每个人格完成来源注册、原子主张、时间线、至少 3 件作品上下文和本地备用开场。
- 每个答案内部保留分段—主张—来源绑定；公开界面能展开依据。
- 黄金题全量通过硬门槛，且版本升级有可比较的回归报告。

## 12. 与现有原型的迁移映射

| 当前字段/行为              | v1 目标                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| `personality[]`            | `voice.traits[]`，每个 trait 绑定 `claimIds`、实现方式和禁用写法 |
| `personalityEvidence[]`    | 原子 `Claim[]` + `SourceRef[]`，边界进入 `avoid/refusal`         |
| `knownContext[]`           | `claims[]` + `timeline[]`                                        |
| `artworks[id].context[]`   | `artworkContexts[id].claimIds/allowedTopics/blockedInferences`   |
| 每件作品单一 `source`      | 多来源 Registry 与逐主张定位                                     |
| OpenAI 回退为整份来源      | 所有供应商统一输出 `DialogueResult.segments/evidence`            |
| 页面统一 disclaimer 字符串 | 版本化 `disclosure`，首答与来源面板展示                          |
| 本地备用开场               | 已审核、绑定主张且按作品区分的 `openingTemplates`                |

迁移时先写适配器读取旧梵高对象，不直接改写原型数据；新旧结果通过相同评估集后再切换运行时。
