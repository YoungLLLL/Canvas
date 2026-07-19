figma.showUI(__html__, { width: 360, height: 580, themeColors: true });

const FRAME_W = 1440;
const FRAME_H = 960;
const PAPER = '#F3F0EA';
const PAPER_ALT = '#F7F4EE';
const INK = '#0D0E0D';
const MUTED = '#77746F';
const LINE = '#D0CCC5';
const STONE = '#D9D4CB';
const BLUE = '#173C67';
const DARK = '#252827';
const WHITE = '#FFFFFF';

const IMAGE_URLS = {
  pearl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Meisje%20met%20de%20parel.jpg?width=900',
  garden: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Poet%27s%20Garden%20-%201933.433%20-%20Art%20Institute%20of%20Chicago.jpg?width=1200',
  portrait: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%201954.326%20-%20Art%20Institute%20of%20Chicago.jpg?width=1200',
  bedroom: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Bedroom%20-%201926.417%20-%20Art%20Institute%20of%20Chicago.jpg?width=1400'
};

let fonts = null;
const loadedFonts = new Set();

function rgb(hex) {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255
  };
}

function solid(hex, opacity = 1) {
  return { type: 'SOLID', color: rgb(hex), opacity };
}

function postStatus(text, busy = false) {
  figma.ui.postMessage({ type: 'status', text, busy });
}

async function prepareFonts() {
  if (fonts) return fonts;
  const available = await figma.listAvailableFontsAsync();
  const names = new Map(available.map(item => [`${item.fontName.family}|||${item.fontName.style}`, item.fontName]));

  function first(candidates) {
    for (const candidate of candidates) {
      const found = names.get(`${candidate.family}|||${candidate.style}`);
      if (found) return found;
    }
    return { family: 'Inter', style: 'Regular' };
  }

  fonts = {
    sans: first([
      { family: 'Noto Sans SC', style: 'Regular' },
      { family: 'PingFang SC', style: 'Regular' },
      { family: 'Inter', style: 'Regular' }
    ]),
    sansMedium: first([
      { family: 'Noto Sans SC', style: 'Medium' },
      { family: 'PingFang SC', style: 'Medium' },
      { family: 'Inter', style: 'Medium' }
    ]),
    serif: first([
      { family: 'Cormorant Garamond', style: 'Medium' },
      { family: 'Cormorant Garamond', style: 'Regular' },
      { family: 'Georgia', style: 'Regular' },
      { family: 'Times New Roman', style: 'Regular' }
    ]),
    serifSemibold: first([
      { family: 'Cormorant Garamond', style: 'SemiBold' },
      { family: 'Cormorant Garamond', style: 'Bold' },
      { family: 'Georgia', style: 'Bold' },
      { family: 'Times New Roman', style: 'Bold' }
    ]),
    cjkSerif: first([
      { family: 'Noto Serif SC', style: 'Regular' },
      { family: 'Songti SC', style: 'Regular' },
      { family: 'STSong', style: 'Regular' },
      { family: 'Noto Sans SC', style: 'Regular' },
      { family: 'PingFang SC', style: 'Regular' },
      { family: 'Inter', style: 'Regular' }
    ])
  };
  return fonts;
}

async function loadFont(fontName) {
  const key = `${fontName.family}|||${fontName.style}`;
  if (loadedFonts.has(key)) return;
  await figma.loadFontAsync(fontName);
  loadedFonts.add(key);
}

function setMeta(node, options = {}) {
  if (options.selector) node.setPluginData('canvasSelector', options.selector);
  if (options.role) node.setPluginData('canvasRole', options.role);
  if (options.imageUrl) node.setPluginData('canvasImageUrl', options.imageUrl);
  return node;
}

function append(parent, node, name, x, y) {
  node.name = name;
  parent.appendChild(node);
  node.x = x;
  node.y = y;
  return node;
}

function makeFrame(parent, name, x, y, width, height, options = {}) {
  const node = figma.createFrame();
  append(parent, node, name, x, y);
  node.resize(width, height);
  node.fills = options.fill ? [solid(options.fill, options.opacity ?? 1)] : [];
  node.clipsContent = options.clip !== false;
  if (options.radius !== undefined) node.cornerRadius = options.radius;
  if (options.stroke) {
    node.strokes = [solid(options.stroke, options.strokeOpacity ?? 1)];
    node.strokeWeight = options.strokeWeight || 1;
  }
  if (options.effect) node.effects = [options.effect];
  return setMeta(node, options);
}

function makeRect(parent, name, x, y, width, height, options = {}) {
  const node = figma.createRectangle();
  append(parent, node, name, x, y);
  node.resize(width, height);
  node.fills = options.fill ? [solid(options.fill, options.opacity ?? 1)] : [];
  if (options.radius !== undefined) node.cornerRadius = options.radius;
  if (options.stroke) {
    node.strokes = [solid(options.stroke, options.strokeOpacity ?? 1)];
    node.strokeWeight = options.strokeWeight || 1;
  }
  if (options.effect) node.effects = [options.effect];
  return setMeta(node, options);
}

function makeEllipse(parent, name, x, y, width, height, options = {}) {
  const node = figma.createEllipse();
  append(parent, node, name, x, y);
  node.resize(width, height);
  node.fills = options.fill ? [solid(options.fill, options.opacity ?? 1)] : [];
  if (options.stroke) {
    node.strokes = [solid(options.stroke, options.strokeOpacity ?? 1)];
    node.strokeWeight = options.strokeWeight || 1;
  }
  return setMeta(node, options);
}

async function makeText(parent, name, characters, x, y, width, options = {}) {
  const fontSet = await prepareFonts();
  const requestedFont = options.font || 'sans';
  const containsCjk = /[\u3400-\u9fff]/.test(characters);
  const fontKey = containsCjk && requestedFont.startsWith('serif') ? 'cjkSerif' : requestedFont;
  const fontName = fontSet[fontKey] || fontSet.sans;
  await loadFont(fontName);
  const node = figma.createText();
  append(parent, node, name, x, y);
  node.fontName = fontName;
  node.fontSize = options.size || 16;
  node.characters = characters;
  node.fills = [solid(options.color || INK, options.opacity ?? 1)];
  node.textAutoResize = 'HEIGHT';
  node.resize(width, Math.max(node.height, 1));
  if (options.lineHeight) node.lineHeight = { unit: 'PIXELS', value: options.lineHeight };
  if (options.letterSpacing !== undefined) node.letterSpacing = { unit: 'PERCENT', value: options.letterSpacing };
  if (options.align) node.textAlignHorizontal = options.align;
  return setMeta(node, options);
}

async function makeImage(parent, name, url, x, y, width, height, options = {}) {
  const node = makeRect(parent, name, x, y, width, height, {
    fill: options.fallback || STONE,
    radius: options.radius,
    stroke: options.stroke,
    strokeWeight: options.strokeWeight,
    selector: options.selector,
    role: options.role,
    imageUrl: url,
    effect: options.effect
  });
  try {
    const image = await figma.createImageAsync(url);
    node.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: options.scaleMode || 'FILL' }];
  } catch (error) {
    node.setPluginData('canvasImageError', String(error));
    await makeText(parent, `${name} / Image fallback label`, 'IMAGE', x + 12, y + 12, Math.max(80, width - 24), {
      size: 10,
      color: MUTED,
      role: 'fallback-label'
    });
  }
  return node;
}

async function makeButton(parent, name, label, x, y, width, height, options = {}) {
  const button = makeFrame(parent, name, x, y, width, height, {
    fill: options.fill || INK,
    radius: options.radius || 0,
    stroke: options.stroke,
    selector: options.selector,
    role: options.role || 'button'
  });
  await makeText(button, 'Label', label, 18, Math.round((height - 16) / 2), width - 36, {
    font: 'sansMedium',
    size: options.size || 13,
    color: options.color || WHITE,
    lineHeight: 16
  });
  return button;
}

function shadow(opacity = 0.18, y = 8, blur = 18) {
  return {
    type: 'DROP_SHADOW',
    color: { ...rgb('#000000'), a: opacity },
    offset: { x: 0, y },
    radius: blur,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  };
}

async function addHeader(frame) {
  const header = makeFrame(frame, 'Header', 0, 0, FRAME_W, 88, {
    role: 'header',
    selector: '.site-header',
    clip: false
  });
  await makeText(header, 'Wordmark', 'CANVAS', 43, 31, 180, {
    font: 'sansMedium', size: 25, letterSpacing: -5, selector: '.wordmark', role: 'wordmark'
  });
  await makeText(header, 'Navigation', '博物馆       艺术家       每日艺术', 548, 35, 370, {
    size: 15, align: 'CENTER', selector: '.site-header nav', role: 'navigation'
  });
  const search = makeFrame(header, 'Search pill', 1282, 23, 112, 42, {
    fill: INK, radius: 21, selector: '.search-pill', role: 'button'
  });
  await makeText(search, 'Label', '搜索  ↗', 20, 12, 72, { size: 13, color: WHITE, lineHeight: 16 });
  return header;
}

function createRootFrame(name, x, y, background) {
  const frame = makeFrame(figma.currentPage, name, x, y, FRAME_W, FRAME_H, { fill: background });
  frame.setPluginData('canvasBridge', 'root-v1');
  frame.setPluginData('canvasViewport', '1440x960');
  return frame;
}

async function createHome(x, y) {
  const frame = createRootFrame('Canvas / 01 Home / Desktop', x, y, PAPER);
  await addHeader(frame);
  await makeText(frame, 'Explore label', 'EXPLORE ART / 01', 43, 118, 128, {
    size: 11, color: MUTED, selector: '.side-label', role: 'label'
  });
  makeRect(frame, 'Explore label line', 43, 145, 128, 1, { fill: LINE, role: 'divider' });

  const history = makeFrame(frame, 'Previous artworks', 58, 250, 418, 422, {
    clip: false, selector: '.art-history', role: 'media-group'
  });
  await makeImage(history, 'Girl with a Pearl Earring', IMAGE_URLS.pearl, 0, 148, 130, 220, {
    selector: '.history-small', role: 'artwork-image', effect: shadow()
  });
  await makeImage(history, "The Poet's Garden", IMAGE_URLS.garden, 184, 34, 234, 330, {
    selector: '.history-large', role: 'artwork-image', effect: shadow()
  });
  await makeText(history, 'Today note / label', '今日作品', 276, 376, 142, { size: 11, color: BLUE, role: 'label' });
  await makeText(history, 'Today note / artist', '文森特·梵高', 276, 397, 142, { font: 'serif', size: 18, role: 'title' });

  await makeImage(frame, 'Daily artwork / Self-Portrait', IMAGE_URLS.portrait, 511, 106, 389, 548, {
    selector: '.daily-art', role: 'artwork-image', stroke: INK, strokeWeight: 3, effect: shadow(.22, 6, 16)
  });
  await makeText(frame, 'Daily index', '01\n/ 03', 926, 212, 65, {
    font: 'serif', size: 18, lineHeight: 25, color: BLUE, selector: '.daily-index', role: 'pagination'
  });

  const artist = makeFrame(frame, 'Artist entry', 979, 134, 418, 520, {
    clip: false, selector: '.artist-entry', role: 'panel'
  });
  const glass = makeFrame(artist, 'Glass card', 0, 0, 418, 450, {
    fill: STONE, opacity: .36, radius: 30, stroke: WHITE, strokeOpacity: .9,
    selector: '.glass-card', role: 'card', effect: shadow(.1, 12, 30)
  });
  await makeImage(glass, 'Artist avatar', IMAGE_URLS.portrait, 34, 36, 78, 78, {
    radius: 39, scaleMode: 'FILL', selector: '.eye-avatar', role: 'avatar'
  });
  await makeText(glass, 'Artist label', 'DIGITAL ARTIST / 01', 34, 130, 250, { size: 11, role: 'label' });
  await makeText(glass, 'Artist title', 'Chat with\nVan Gogh', 34, 156, 350, {
    font: 'serif', size: 64, lineHeight: 54, letterSpacing: -4, selector: '.glass-card h1', role: 'title'
  });
  await makeText(glass, 'Artist description', '从这件作品开始，和梵高聊聊。', 34, 284, 330, {
    font: 'serif', size: 18, lineHeight: 27, selector: '.glass-card p', role: 'body'
  });
  makeRect(glass, 'Prompt underline', 34, 388, 350, 1, { fill: MUTED, opacity: .55, role: 'divider' });
  await makeText(glass, 'Prompt', '你想问他什么？                                      ↗', 34, 365, 350, {
    size: 13, color: MUTED, selector: '.prompt-line', role: 'input'
  });
  await makeButton(artist, 'Start conversation', '开始对话                 ⟶', 0, 466, 418, 54, {
    radius: 27, selector: '.primary-wide', role: 'primary-action'
  });

  makeEllipse(frame, 'Globe preview', -146, 760, 1732, 900, {
    fill: DARK, selector: '.shared-globe', role: 'globe'
  });
  await makeText(frame, 'Globe caption', '芝加哥艺术博物馆 · CHICAGO', 545, 798, 350, {
    size: 11, color: WHITE, align: 'CENTER', selector: '.globe-home-caption span', role: 'label'
  });
  await makeText(frame, 'Globe title', 'CANVAS Library', 365, 846, 710, {
    font: 'serif', size: 70, color: WHITE, align: 'CENTER', selector: '.globe-home-caption strong', role: 'title'
  });
  return frame;
}

async function createMuseum(x, y) {
  const frame = createRootFrame('Canvas / 02 Museum / Desktop', x, y, PAPER);
  await addHeader(frame);
  await makeText(frame, 'Library title', 'CANVAS Library', 43, 78, 1000, {
    font: 'serif', size: 132, lineHeight: 132, letterSpacing: -5,
    selector: '.library-title', role: 'display-title'
  });

  const copy = makeFrame(frame, 'Museum information', 46, 294, 420, 594, {
    clip: false, selector: '.museum-copy', role: 'content-column'
  });
  await makeText(copy, 'Museum overline', "TODAY'S MUSEUM / 01", 0, 0, 320, { size: 10, color: MUTED, role: 'label' });
  await makeText(copy, 'Museum name', '芝加哥艺术博物馆', 0, 45, 420, {
    font: 'serif', size: 43, lineHeight: 48, selector: '.museum-copy h2', role: 'title'
  });
  await makeText(copy, 'Museum official name', 'Art Institute of Chicago', 0, 98, 420, {
    font: 'serif', size: 25, role: 'subtitle'
  });
  await makeText(copy, 'Museum location', 'CHICAGO · UNITED STATES', 0, 142, 420, { size: 11, color: BLUE, role: 'link' });
  await makeText(copy, 'Museum description', '收藏跨越五千年艺术史，以印象派、后印象派及美国现代艺术收藏闻名。', 0, 182, 420, {
    font: 'serif', size: 14, lineHeight: 25, selector: '.museum-copy > p', role: 'body'
  });
  makeRect(copy, 'Description divider', 0, 250, 420, 1, { fill: LINE, role: 'divider' });
  await makeImage(copy, 'Featured artwork', IMAGE_URLS.portrait, 0, 280, 116, 150, {
    selector: '.museum-feature img', role: 'artwork-image'
  });
  await makeText(copy, 'Featured metadata', '今日推荐\n自画像\n文森特·梵高 · 1887\n\n精选馆藏已上线 · 3 件作品', 136, 282, 284, {
    font: 'serif', size: 15, lineHeight: 25, selector: '.museum-feature', role: 'metadata'
  });
  await makeButton(copy, 'Enter digital gallery', '进入数字画廊                    →', 0, 460, 270, 53, {
    selector: '.enter-gallery', role: 'primary-action'
  });
  await makeText(copy, 'Official website', '官方网站  ↗', 0, 548, 180, { size: 12, role: 'link' });

  makeEllipse(frame, 'Museum globe', 560, 178, 870, 870, {
    fill: DARK, selector: '.shared-globe', role: 'globe'
  });
  for (let i = 1; i <= 6; i += 1) {
    makeEllipse(frame, `Globe latitude ${i}`, 560 + i * 42, 178 + i * 42, 870 - i * 84, 870 - i * 84, {
      stroke: WHITE, strokeOpacity: .12, role: 'globe-grid'
    });
  }
  makeEllipse(frame, 'Chicago marker outer', 800, 380, 58, 58, { stroke: '#A68B65', strokeOpacity: .85, role: 'map-marker' });
  makeEllipse(frame, 'Chicago marker core', 822, 402, 14, 14, { fill: '#F5EADB', role: 'map-marker' });
  await makeText(frame, 'Chicago marker label', 'CHICAGO · ART INSTITUTE', 875, 400, 240, {
    size: 11, color: WHITE, selector: '.globe-marker-label', role: 'map-label'
  });
  return frame;
}

async function createGallery(x, y) {
  const frame = createRootFrame('Canvas / 03 Gallery / Desktop', x, y, PAPER_ALT);
  await addHeader(frame);
  await makeText(frame, 'Museum index', 'MUSEUM / 01', 43, 124, 240, { size: 10, color: MUTED, role: 'label' });
  await makeText(frame, 'Museum title', 'Art Institute\nof Chicago', 43, 158, 780, {
    font: 'serif', size: 112, lineHeight: 92, letterSpacing: -6,
    selector: '.museum-title-block h1', role: 'display-title'
  });
  await makeText(frame, 'Museum location', 'CHICAGO · UNITED STATES ↗', 63, 372, 320, {
    size: 10, color: BLUE, selector: '.museum-title-block > a', role: 'link'
  });
  makeRect(frame, 'Location underline', 63, 394, 230, 1, { fill: INK, opacity: .45, role: 'divider' });

  await makeText(frame, 'Museum introduction / English', 'The Art Institute of Chicago brings together art from across centuries and cultures, with celebrated strengths in Impressionism, Post-Impressionism, and modern American art.', 855, 176, 520, {
    font: 'serifSemibold', size: 28, lineHeight: 31,
    selector: '.museum-introduction-en', role: 'body-large'
  });
  await makeText(frame, 'Museum introduction / Chinese', '芝加哥艺术博物馆汇集跨越多个世纪与文化的艺术收藏，尤以印象派、后印象派及美国现代艺术闻名。', 855, 318, 520, {
    size: 16, lineHeight: 29, selector: '.museum-introduction-zh', role: 'body'
  });

  const strip = makeFrame(frame, 'Collection marquee', 0, 476, FRAME_W, 360, {
    clip: true, selector: '.collection-marquee', role: 'artwork-strip'
  });
  await makeImage(strip, 'Artwork / Bedroom', IMAGE_URLS.bedroom, -72, 70, 360, 250, {
    selector: '.artwork-marquee-item:nth-child(1)', role: 'artwork-image'
  });
  await makeImage(strip, 'Artwork / Self-Portrait', IMAGE_URLS.portrait, 322, 18, 280, 330, {
    selector: '.artwork-marquee-item:nth-child(2)', role: 'artwork-image'
  });
  await makeImage(strip, "Artwork / Poet's Garden", IMAGE_URLS.garden, 638, 78, 420, 238, {
    selector: '.artwork-marquee-item:nth-child(3)', role: 'artwork-image'
  });
  await makeImage(strip, 'Artwork / Pearl', IMAGE_URLS.pearl, 1094, 42, 248, 300, {
    selector: '.artwork-marquee-item:nth-child(4)', role: 'artwork-image'
  });
  await makeText(frame, 'Gallery instruction', '悬停查看作品信息 · 点击进入作品', 1090, 902, 305, {
    size: 10, color: MUTED, align: 'RIGHT', selector: '.gallery-instruction', role: 'instruction'
  });
  return frame;
}

async function createArtwork(x, y) {
  const frame = createRootFrame('Canvas / 04 Artwork / Desktop', x, y, PAPER_ALT);
  const close = makeEllipse(frame, 'Close artwork', 43, 42, 62, 62, {
    fill: INK, selector: '.back-gallery', role: 'button'
  });
  await makeText(close, 'Close icon', '×', 16, 6, 30, { font: 'sans', size: 38, color: WHITE, align: 'CENTER', role: 'icon' });

  await makeImage(frame, 'Artwork viewer / Bedroom', IMAGE_URLS.bedroom, 43, 142, 820, 690, {
    selector: '.art-pane', role: 'artwork-viewer', fallback: STONE, scaleMode: 'FIT'
  });
  const controls = makeFrame(frame, 'Viewer controls', 286, 756, 334, 48, {
    fill: INK, opacity: .76, radius: 24, selector: '.viewer-controls', role: 'controls'
  });
  await makeText(controls, 'Viewer control labels', '−     100%     +       复位       全屏 ↗', 16, 15, 302, {
    size: 11, color: WHITE, align: 'CENTER', role: 'controls-label'
  });

  const panel = makeFrame(frame, 'Artwork dialogue pane', 925, 108, 472, 818, {
    clip: false, selector: '.dialogue-pane', role: 'content-column'
  });
  await makeText(panel, 'Artwork index', '01 / 03', 0, 0, 160, { size: 10, color: MUTED, selector: '.artwork-detail-index', role: 'pagination' });
  await makeText(panel, 'Artwork title', '卧室', 0, 34, 455, {
    font: 'serif', size: 78, lineHeight: 72, letterSpacing: -5,
    selector: '.artwork-summary h1', role: 'display-title'
  });
  await makeText(panel, 'Artwork original title', 'The Bedroom', 0, 116, 455, {
    font: 'serif', size: 22, color: MUTED, selector: '.artwork-original-title', role: 'subtitle'
  });
  await makeImage(panel, 'Artist avatar', IMAGE_URLS.portrait, 0, 160, 48, 48, {
    radius: 24, selector: '.artist-meta .eye-avatar', role: 'avatar'
  });
  await makeText(panel, 'Artist metadata', '文森特·梵高 · 1889 · 阿尔勒', 64, 176, 360, {
    size: 12, selector: '.artist-meta b', role: 'metadata'
  });
  await makeText(panel, 'Artwork introduction', '梵高用强烈的色彩和倾斜的透视描绘了他在阿尔勒黄房子里的卧室，让原本安静的室内空间产生一种轻微摇晃的感觉。', 0, 232, 455, {
    size: 12, lineHeight: 20, color: '#4E4B46', selector: '.artwork-introduction', role: 'body'
  });
  makeRect(panel, 'Artwork facts divider top', 0, 314, 455, 1, { fill: LINE, role: 'divider' });
  await makeText(panel, 'Artwork facts', '馆藏\n芝加哥艺术博物馆                 媒介 / 尺寸\n                                             布面油画', 0, 330, 455, {
    size: 10, lineHeight: 20, selector: '.artwork-quick-facts', role: 'metadata'
  });
  makeRect(panel, 'Artwork facts divider bottom', 0, 394, 455, 1, { fill: LINE, role: 'divider' });

  await makeText(panel, 'Conversation title', 'CONVERSATION / 01                                      关闭对话  ×', 0, 428, 455, {
    size: 9, color: MUTED, selector: '.conversation-title', role: 'label'
  });
  makeRect(panel, 'Conversation divider', 0, 454, 455, 1, { fill: LINE, role: 'divider' });
  await makeText(panel, 'Assistant name', '文森特·梵高', 56, 486, 200, { size: 10, role: 'speaker' });
  await makeImage(panel, 'Message avatar', IMAGE_URLS.portrait, 0, 478, 36, 36, {
    radius: 18, selector: '.message.assistant .msg-eye', role: 'avatar'
  });
  await makeText(panel, 'Assistant message', '你看见墙面和家具的线条并不完全平行吗？我并不是想精确复制一个房间，而是想让颜色替我说出这里的安静。', 56, 516, 390, {
    size: 12, lineHeight: 20, selector: '.message.assistant p', role: 'message'
  });
  await makeText(panel, 'Suggestions', '为什么这个房间看起来有些倾斜？\n这些颜色对你意味着什么？', 0, 636, 455, {
    size: 11, lineHeight: 27, selector: '.suggestions', role: 'suggestions'
  });
  const input = makeFrame(panel, 'Chat input', 0, 742, 455, 58, {
    fill: INK, radius: 29, selector: '.chat-form', role: 'input'
  });
  await makeImage(input, 'Input avatar', IMAGE_URLS.portrait, 7, 7, 44, 44, { radius: 22, role: 'avatar' });
  await makeText(input, 'Input placeholder', '继续问梵高…                                           ↗', 68, 20, 365, {
    size: 11, color: WHITE, selector: '.chat-form textarea', role: 'placeholder'
  });
  return frame;
}

function clean(value) {
  return JSON.parse(JSON.stringify(value));
}

function snapshot(node) {
  const data = {
    name: node.name,
    type: node.type,
    x: Number(node.x.toFixed(2)),
    y: Number(node.y.toFixed(2)),
    width: Number(node.width.toFixed(2)),
    height: Number(node.height.toFixed(2)),
    rotation: Number(node.rotation.toFixed(2)),
    visible: node.visible,
    opacity: Number(node.opacity.toFixed(3)),
    selector: node.getPluginData('canvasSelector') || null,
    role: node.getPluginData('canvasRole') || null,
    imageUrl: node.getPluginData('canvasImageUrl') || null
  };
  if ('fills' in node && node.fills !== figma.mixed) data.fills = clean(node.fills);
  if ('strokes' in node && node.strokes !== figma.mixed) data.strokes = clean(node.strokes);
  if ('strokeWeight' in node && typeof node.strokeWeight === 'number') data.strokeWeight = node.strokeWeight;
  if ('cornerRadius' in node && node.cornerRadius !== figma.mixed) data.cornerRadius = node.cornerRadius;
  if ('effects' in node) data.effects = clean(node.effects);
  if ('layoutMode' in node) {
    data.layout = {
      mode: node.layoutMode,
      primaryAxisAlignItems: node.primaryAxisAlignItems,
      counterAxisAlignItems: node.counterAxisAlignItems,
      itemSpacing: node.itemSpacing,
      paddingTop: node.paddingTop,
      paddingRight: node.paddingRight,
      paddingBottom: node.paddingBottom,
      paddingLeft: node.paddingLeft
    };
  }
  if (node.type === 'TEXT') {
    data.text = {
      characters: node.characters,
      fontName: node.fontName === figma.mixed ? 'mixed' : clean(node.fontName),
      fontSize: node.fontSize === figma.mixed ? 'mixed' : node.fontSize,
      lineHeight: node.lineHeight === figma.mixed ? 'mixed' : clean(node.lineHeight),
      letterSpacing: node.letterSpacing === figma.mixed ? 'mixed' : clean(node.letterSpacing),
      textAlignHorizontal: node.textAlignHorizontal,
      textAutoResize: node.textAutoResize
    };
  }
  return data;
}

function storeBaseline(node) {
  node.setPluginData('canvasBaseline', JSON.stringify(snapshot(node)));
  if ('children' in node) node.children.forEach(storeBaseline);
}

function propertyDiff(before, after) {
  const result = {};
  const keys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  keys.forEach(key => {
    if (JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key])) result[key] = after?.[key];
  });
  return result;
}

function serializeNode(node) {
  const current = snapshot(node);
  let baseline = null;
  const baselineString = node.getPluginData('canvasBaseline');
  if (baselineString) {
    try { baseline = JSON.parse(baselineString); } catch (error) { baseline = null; }
  }
  const result = {
    ...current,
    changed: baseline ? propertyDiff(baseline, current) : null
  };
  if ('children' in node) result.children = node.children.map(serializeNode);
  return result;
}

function nextCanvasY() {
  const roots = figma.currentPage.children.filter(node => node.type === 'FRAME');
  if (!roots.length) return 0;
  return Math.max(...roots.map(node => node.y + node.height)) + 200;
}

async function createPages(pageKeys) {
  postStatus('正在准备字体和页面…', true);
  await prepareFonts();
  const creators = { home: createHome, museum: createMuseum, gallery: createGallery, artwork: createArtwork };
  const frames = [];
  const startY = nextCanvasY();
  for (let index = 0; index < pageKeys.length; index += 1) {
    const key = pageKeys[index];
    const creator = creators[key];
    if (!creator) continue;
    postStatus(`正在生成 ${index + 1} / ${pageKeys.length}：${key}…`, true);
    const frame = await creator(index * (FRAME_W + 160), startY);
    storeBaseline(frame);
    frames.push(frame);
  }
  figma.currentPage.selection = frames;
  if (frames.length) figma.viewport.scrollAndZoomIntoView(frames);
  postStatus(`已生成 ${frames.length} 个可编辑页面。\n可以关闭插件，在画布中自由修改。`, false);
  figma.notify(`Canvas Design Bridge：已生成 ${frames.length} 个页面`);
}

function exportSelection() {
  const selected = figma.currentPage.selection.filter(node => node.type === 'FRAME' && node.getPluginData('canvasBridge') === 'root-v1');
  if (!selected.length) {
    postStatus('请先在画布中选中一个或多个由本插件生成的页面 Frame。', false);
    figma.notify('请先选择 Canvas 页面 Frame', { error: true });
    return;
  }
  const payload = {
    schema: 'canvas-design-bridge/v1',
    exportedAt: new Date().toISOString(),
    viewport: { width: FRAME_W, height: FRAME_H },
    frames: selected.map(serializeNode)
  };
  const day = new Date().toISOString().slice(0, 10);
  figma.ui.postMessage({
    type: 'download',
    filename: `canvas-design-export-${day}.json`,
    contents: JSON.stringify(payload, null, 2)
  });
}

figma.ui.onmessage = async message => {
  try {
    if (message.type === 'create') await createPages(message.pages || []);
    if (message.type === 'export') exportSelection();
    if (message.type === 'close') figma.closePlugin();
  } catch (error) {
    console.error(error);
    postStatus(`操作失败：${error?.message || String(error)}`, false);
    figma.notify('Canvas Design Bridge 操作失败', { error: true });
  }
};
