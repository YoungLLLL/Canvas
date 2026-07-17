const works = [
  {
    id: 'bedroom', title: '卧室', originalTitle: 'The Bedroom', year: '1889', place: '圣雷米',
    medium: '布面油画 · 73.6 × 92.3 cm',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Bedroom%20-%201926.417%20-%20Art%20Institute%20of%20Chicago.jpg?width=1800',
    source: 'https://www.artic.edu/artworks/28560/the-bedroom',
    description: '梵高为卧室创作了三个版本。这是1889年的第二个版本；他希望用平涂的色彩表达“绝对的休息”，倾斜的透视却让房间保持着微妙的张力。',
    greeting: '欢迎进来。这是我在阿尔勒黄房子里的卧室。我想让颜色替我说出一种休息——不是奢华的休息，只是终于有一张属于自己的床。你先注意到了什么？',
    suggestions: ['为什么透视是歪的？', '这些颜色真实吗？', '墙上的画是谁？'],
    hotspots: [
      { x: 72, y: 46, label: '两把椅子', message: '两把椅子让空房间里仍有一种等待。它们是极普通的木椅；我喜欢普通事物，因为一个人的生活常常就藏在这些不被注意的东西里。', tag: '作品解读' },
      { x: 54, y: 35, label: '墙上的肖像', message: '墙上的小幅肖像使这个房间不只是家具的排列。它们提示着友谊与陪伴——一种我在布置黄房子时十分渴望的生活。', tag: '合理解读' },
      { x: 79, y: 68, label: '红色床铺', message: '床与椅子的铬黄色、床罩的血红色，是我在给提奥的信里明确写下的颜色。我让轮廓保持坚实，希望画面像一幅日本版画那样简单。', tag: '书信依据' },
      { x: 39, y: 43, label: '绿色窗户', message: '窗户是一块很小的绿色，但它把封闭的房间与外界连在一起。这里的颜色并不完全服从自然，而是在共同制造一种感受。', tag: '作品解读' }
    ]
  },
  {
    id: 'portrait', title: '自画像', originalTitle: 'Self-Portrait', year: '1887', place: '巴黎',
    medium: '画家板上油彩 · 41 × 32.5 cm',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%201954.326%20-%20Art%20Institute%20of%20Chicago.jpg?width=1400',
    source: 'https://www.artic.edu/artworks/80607/self-portrait',
    description: '巴黎时期的梵高受到印象派和点彩技法影响。密集的短笔触把绿色、蓝色、红色和橙色并置，让脸庞像从不断流动的颜色中浮现。',
    greeting: '这张脸是我最方便、也最不花钱的模特。但自画像不只是记录长相，它也是一次练习：怎样让互相碰撞的颜色仍然抓住一个人的目光。',
    suggestions: ['为什么画这么多自画像？', '眼神为什么很紧张？', '这些短笔触从哪里来？'],
    hotspots: [
      { x: 50, y: 38, label: '凝视', message: '我让眼睛成为颜色旋涡里的锚。芝加哥艺术博物馆也特别指出，密集的色点最终都被这道凝视稳定下来。至于它是否紧张，那是你的感受，而不是可以证实的诊断。', tag: '馆藏解读' },
      { x: 57, y: 56, label: '互补色', message: '胡须的橙红与外套、背景里的蓝绿互相加强。颜色并不只是覆盖物体，它们在相邻的位置上彼此发声。', tag: '形式分析' },
      { x: 44, y: 68, label: '短笔触', message: '在巴黎，我接触到修拉等人的新方法。但我没有把点彩当成冷静的科学公式，而是把短促的点与划变成更个人、更急切的语言。', tag: '馆藏资料' },
      { x: 62, y: 23, label: '蓝色背景', message: '背景没有退到远处，它和脸一样活跃。那些方向不断改变的笔触，让空气也像某种有质地的东西。', tag: '形式分析' }
    ]
  },
  {
    id: 'garden', title: '诗人的花园', originalTitle: "The Poet's Garden", year: '1888', place: '阿尔勒',
    medium: '布面油画 · 73 × 92.1 cm',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Poet%27s%20Garden%20-%201933.433%20-%20Art%20Institute%20of%20Chicago.jpg?width=1800',
    source: 'https://www.artic.edu/artworks/14586/the-poet-s-garden',
    description: '1888年9月，梵高在阿尔勒描绘公共花园。这件作品后来被安排在黄房子中高更使用的房间里，自然景色因此也带上了他对“艺术家共同体”的期待。',
    greeting: '我把这片阿尔勒的公共花园称作“诗人的花园”。我并不是在寻找一位具体的诗人，而是想把南方的色彩画成一个可以让想象停留的地方。',
    suggestions: ['为什么叫诗人的花园？', '那棵树为什么这么大？', '这幅画与高更有关吗？'],
    hotspots: [
      { x: 65, y: 34, label: '高耸的树', message: '树干几乎像画面中的人物。它把天空和花园连在一起，也让这片日常的公共绿地获得一种纪念碑般的存在。', tag: '作品解读' },
      { x: 45, y: 66, label: '花园小径', message: '道路没有把你笔直带向远处，而是从色块之间慢慢穿过。我希望你不是站在花园外看它，而是感觉自己可以走进去。', tag: '形式分析' },
      { x: 23, y: 52, label: '夹竹桃', message: '前景浓密的植物把视线挡了一下。观看因此变得像散步：景色不是一次全部交代，而是在移动中逐渐出现。', tag: '作品解读' },
      { x: 76, y: 67, label: '两个人影', message: '远处的人很小，几乎融进花园。这里真正占据画面的不是某个故事，而是植物、光线和色彩共同形成的环境。', tag: '形式分析' }
    ]
  }
];

const els = {
  workList: document.querySelector('#workList'), workCount: document.querySelector('#workCount'), workTitle: document.querySelector('#workTitle'),
  viewerMeta: document.querySelector('#viewerMeta'), artStage: document.querySelector('#artStage'), artTransform: document.querySelector('#artTransform'),
  artImage: document.querySelector('#artImage'), hotspots: document.querySelector('#hotspots'), loadingArt: document.querySelector('#loadingArt'),
  artHint: document.querySelector('#artHint'), workDescription: document.querySelector('#workDescription'), sourceLink: document.querySelector('#sourceLink'),
  messages: document.querySelector('#messages'), suggestions: document.querySelector('#suggestions'), chatForm: document.querySelector('#chatForm'),
  chatInput: document.querySelector('#chatInput'), zoomValue: document.querySelector('#zoomValue'), toast: document.querySelector('#toast')
};
let currentIndex = 0;
let view = { scale: 1, x: 0, y: 0 };
let dragStart = null;
let toastTimer;

function init() {
  works.forEach((work, index) => {
    const button = document.createElement('button');
    button.className = 'work-button';
    button.innerHTML = `<span class="index">0${index + 1}</span><span><span class="name">${work.title}</span><span class="year">${work.originalTitle.toUpperCase()} · ${work.year}</span></span>`;
    button.addEventListener('click', () => selectWork(index));
    els.workList.appendChild(button);
  });
  bindEvents();
  selectWork(0, true);
}

function selectWork(index, firstLoad = false) {
  currentIndex = index;
  const work = works[index];
  document.querySelectorAll('.work-button').forEach((button, i) => button.classList.toggle('active', i === index));
  els.workCount.textContent = `作品 0${index + 1} / 0${works.length}`;
  els.workTitle.textContent = work.title;
  els.viewerMeta.innerHTML = `${work.year} · ${work.place}<br>${work.medium}`;
  els.workDescription.textContent = work.description;
  els.sourceLink.href = work.source;
  resetView();
  els.loadingArt.classList.remove('hidden');
  els.loadingArt.innerHTML = '<span></span> 正在展开高清作品';
  els.artImage.classList.remove('loaded');
  els.artImage.alt = `文森特·梵高《${work.title}》，${work.year}`;
  els.artImage.src = work.image;
  els.artImage.onload = () => { els.artImage.classList.add('loaded'); els.loadingArt.classList.add('hidden'); renderHotspots(); };
  els.artImage.onerror = () => { els.loadingArt.innerHTML = '图像暂时无法载入，请检查网络后重试'; };
  renderSuggestions();
  els.messages.innerHTML = '';
  addMessage('assistant', work.greeting, { label: '角色导览', url: work.source });
  if (!firstLoad) showToast(`已来到《${work.title}》`);
}

function renderHotspots() {
  const work = works[currentIndex];
  els.hotspots.innerHTML = '';
  work.hotspots.forEach((point, i) => {
    const button = document.createElement('button');
    button.className = 'hotspot';
    button.setAttribute('aria-label', `探索细节：${point.label}`);
    button.innerHTML = `<span class="hotspot-label">${point.label}</span>`;
    button.addEventListener('click', event => {
      event.stopPropagation();
      document.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active'));
      button.classList.add('active');
      els.artHint.style.opacity = '0';
      addMessage('assistant', point.message, { label: point.tag, url: work.source });
    });
    els.hotspots.appendChild(button);
  });
  positionHotspots();
}

function positionHotspots() {
  const img = els.artImage;
  if (!img.naturalWidth) return;
  const stageW = els.artStage.clientWidth, stageH = els.artStage.clientHeight;
  const imageRatio = img.naturalWidth / img.naturalHeight, stageRatio = stageW / stageH;
  let width, height, offsetX, offsetY;
  if (imageRatio > stageRatio) { width = stageW; height = width / imageRatio; offsetX = 0; offsetY = (stageH - height) / 2; }
  else { height = stageH; width = height * imageRatio; offsetX = (stageW - width) / 2; offsetY = 0; }
  works[currentIndex].hotspots.forEach((point, i) => {
    const node = els.hotspots.children[i]; if (!node) return;
    node.style.left = `${offsetX + width * point.x / 100}px`;
    node.style.top = `${offsetY + height * point.y / 100}px`;
  });
}

function renderSuggestions() {
  els.suggestions.innerHTML = '';
  works[currentIndex].suggestions.forEach(text => {
    const button = document.createElement('button'); button.className = 'suggestion'; button.textContent = text;
    button.addEventListener('click', () => askQuestion(text)); els.suggestions.appendChild(button);
  });
}

function addMessage(role, text, evidence) {
  const node = document.createElement('div'); node.className = `message ${role}`;
  const bubble = document.createElement('div'); bubble.className = 'message-bubble';
  if (role === 'assistant') { const speaker = document.createElement('span'); speaker.className = 'speaker'; speaker.textContent = '文森特'; bubble.appendChild(speaker); }
  bubble.appendChild(document.createTextNode(text));
  if (evidence) {
    const info = document.createElement('div'); info.className = 'evidence';
    const tag = document.createElement('span'); tag.className = 'fact'; tag.textContent = evidence.label;
    const link = document.createElement('a'); link.href = evidence.url; link.target = '_blank'; link.rel = 'noreferrer'; link.textContent = '查看依据 ↗';
    info.append(tag, link); bubble.appendChild(info);
  }
  node.appendChild(bubble); els.messages.appendChild(node); els.messages.scrollTop = els.messages.scrollHeight;
}

function askQuestion(question) {
  const clean = question.trim(); if (!clean) return;
  addMessage('user', clean); els.chatInput.value = ''; autoSizeInput();
  const typing = document.createElement('div'); typing.className = 'message assistant'; typing.innerHTML = '<div class="typing"><i></i><i></i><i></i></div>';
  els.messages.appendChild(typing); els.messages.scrollTop = els.messages.scrollHeight;
  setTimeout(() => { typing.remove(); const response = getResponse(clean, works[currentIndex]); addMessage('assistant', response.text, { label: response.tag, url: works[currentIndex].source }); }, 650 + Math.random() * 450);
}

function getResponse(question, work) {
  const q = question.toLowerCase();
  if (/透视|歪|倾斜/.test(q) && work.id === 'bedroom') return { tag: '事实 + 解读', text: '家具边缘和地板线条并不汇向一个稳定的消失点。这既与房间本身不规则有关，也被我主动简化和加强。可以确认的是，我想要“简单”的平涂效果；至于今天感受到的不安，是观看者对形式的合理解读。' };
  if (/颜色|真实|色彩/.test(q)) return { tag: '书信与形式分析', text: work.id === 'bedroom' ? '我在信中逐一写过这些颜色：淡紫墙面、褪红地板、铬黄色的床与椅子、血红床罩。颜料后来有所褪色，所以你今天看到的并不完全等于1889年的色彩。' : '我并不要求颜色只复制眼前所见。并置的蓝与橙、绿与红会互相增强；有时，颜色比准确的轮廓更接近我想表达的感受。' };
  if (/墙|肖像|谁/.test(q) && work.id === 'bedroom') return { tag: '谨慎解读', text: '墙上的图像在不同版本中有所变化，通常被理解为我珍视的人物或作品。Demo 暂不把每一个小画框强行指认给具体人物；正式知识库会把版本差异和研究依据一起呈现。' };
  if (/为什么.*自画像|很多.*自画像|模特/.test(q)) return { tag: '馆藏事实', text: '在巴黎请模特需要钱，而我常常缺钱；自己的脸随时可用，也适合练习新的颜色和笔触。芝加哥艺术博物馆指出，我在巴黎两年间至少画了二十四幅自画像。' };
  if (/眼|目光|紧张|精神/.test(q)) return { tag: '事实与感受分离', text: '我确实把眼睛画得很集中，让它们压住四周跳动的短笔触。但“紧张”属于你面对画面时的感受，不能仅凭一张自画像推断我的医学或心理状态。' };
  if (/笔触|点彩|修拉/.test(q)) return { tag: '馆藏事实', text: '巴黎让我看到印象派和修拉的点彩方法。我借用了分离色彩的短笔触，却没有严格遵循科学化的规则；这些点和划最终变成更自由、更有情绪强度的表面。' };
  if (/诗人|名字|命名/.test(q) && work.id === 'garden') return { tag: '作品背景', text: '“诗人的花园”不是一幅人物肖像，而是我赋予公共花园的想象性名称。我希望自然本身像诗一样组织颜色与节奏。把它理解为一种理想化的南方空间，会比寻找某位确定诗人更接近作品。' };
  if (/高更|共同体|朋友/.test(q) && work.id === 'garden') return { tag: '历史背景', text: '有关系。这幅画后来被放进黄房子里为高更准备的房间。那时我期待在阿尔勒形成艺术家共同生活与工作的“南方画室”；这种期待后来没有按我想象的方式实现。' };
  if (/树|花园|自然/.test(q) && work.id === 'garden') return { tag: '形式分析', text: '我让树木占据比人物更强的位置。弯曲的树干、密集的叶片和前景植物共同形成节奏，使一处普通公园获得近乎人物肖像般的性格。' };
  if (/难过|压抑|孤独|感受|不安/.test(q)) return { tag: '开放式解读', text: '你的感受不需要先得到艺术史的许可。可以再回到画面，找出让你产生这种感觉的具体颜色、线条或空间；那会让“我觉得”慢慢变成一次有根据的观看。' };
  if (/真的|本人|ai|人工智能|数字/.test(q)) return { tag: '身份说明', text: '我不是梵高本人，而是 Canvas 根据公开史料设计的数字化身。现在这个 Demo 使用策展团队预写的回答；正式版本会检索书信和馆藏资料，并明确标记事实、学术解读与推测。' };
  return { tag: '策展解读', text: `这是个好问题。先别急着相信一个完整答案——请回到《${work.title}》里，找一处最吸引你的颜色或线条。对我来说，画不是把解释封在里面，而是让观看从那里继续发生。正式版本会进一步检索书信与研究资料来回答这个问题。` };
}

function bindEvents() {
  document.querySelector('#enterExhibition').addEventListener('click', () => document.querySelector('#gallery').scrollIntoView({ behavior: 'smooth' }));
  document.querySelectorAll('.map-work-button').forEach(button => button.addEventListener('click', () => {
    selectWork(Number(button.dataset.workIndex));
    document.querySelector('#gallery').scrollIntoView({ behavior: 'smooth' });
  }));
  const mapPin = document.querySelector('.map-pin[data-location="chicago"]');
  const revealLocation = () => {
    document.querySelector('#chicagoCard').classList.add('active');
    showToast('芝加哥艺术博物馆 · 已收录 3 件作品');
  };
  mapPin.addEventListener('click', revealLocation);
  mapPin.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); revealLocation(); }
  });
  document.querySelector('#zoomIn').addEventListener('click', () => setScale(view.scale + .25));
  document.querySelector('#zoomOut').addEventListener('click', () => setScale(view.scale - .25));
  document.querySelector('#zoomReset').addEventListener('click', resetView);
  els.artStage.addEventListener('wheel', e => { e.preventDefault(); setScale(view.scale + (e.deltaY < 0 ? .15 : -.15)); }, { passive: false });
  els.artStage.addEventListener('pointerdown', e => { if (e.target.closest('.hotspot,button')) return; dragStart = { px: e.clientX, py: e.clientY, x: view.x, y: view.y }; els.artStage.setPointerCapture(e.pointerId); els.artStage.classList.add('dragging'); });
  els.artStage.addEventListener('pointermove', e => { if (!dragStart || view.scale === 1) return; view.x = dragStart.x + e.clientX - dragStart.px; view.y = dragStart.y + e.clientY - dragStart.py; applyView(); });
  const endDrag = () => { dragStart = null; els.artStage.classList.remove('dragging'); };
  els.artStage.addEventListener('pointerup', endDrag); els.artStage.addEventListener('pointercancel', endDrag);
  document.querySelector('#fullscreenButton').addEventListener('click', () => { if (!document.fullscreenElement) els.artStage.requestFullscreen?.(); else document.exitFullscreen?.(); });
  els.chatForm.addEventListener('submit', e => { e.preventDefault(); askQuestion(els.chatInput.value); });
  els.chatInput.addEventListener('input', autoSizeInput);
  els.chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); els.chatForm.requestSubmit(); } });
  window.addEventListener('resize', positionHotspots);
  const dialog = document.querySelector('#aboutDialog');
  document.querySelector('#aboutButton').addEventListener('click', () => dialog.showModal());
  document.querySelector('#dialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => showToast(button.dataset.toast)));
  document.querySelector('#soundToggle').addEventListener('click', e => { e.currentTarget.classList.toggle('muted'); showToast(e.currentTarget.classList.contains('muted') ? '环境声音已关闭' : '环境声音将在正式展览中开放'); });
}

function setScale(next) { view.scale = Math.max(1, Math.min(3.5, next)); if (view.scale === 1) { view.x = 0; view.y = 0; } applyView(); }
function resetView() { view = { scale: 1, x: 0, y: 0 }; applyView(); }
function applyView() { els.artTransform.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.scale})`; els.zoomValue.textContent = `${Math.round(view.scale * 100)}%`; }
function autoSizeInput() { els.chatInput.style.height = 'auto'; els.chatInput.style.height = `${Math.min(els.chatInput.scrollHeight, 90)}px`; }
function showToast(message) { clearTimeout(toastTimer); els.toast.textContent = message; els.toast.classList.add('show'); toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2300); }

init();
