const featuredWorks = [
  {
    id:'bedroom',title:'卧室',original:'The Bedroom',year:'1889',place:'阿尔勒',index:'01',ratio:92.3/73.6,
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Bedroom%20-%201926.417%20-%20Art%20Institute%20of%20Chicago.jpg?width=1800',
    source:'https://www.artic.edu/artworks/28560/the-bedroom',
    fact:'芝加哥艺术博物馆馆藏《卧室》，1889 年，布面油画，73.6 × 92.3 厘米。',
    greeting:'哦，你正在看这幅画。这是我住在阿尔勒时画下的房间。那时我很希望能在南方建立一个属于艺术家的家。你愿意在这里停留一会儿，我很高兴。',
    suggestions:['这些颜色对你意味着什么？','这真的是你住过的房间吗？','为什么这个房间看起来有些倾斜？']
  },
  {
    id:'portrait',title:'自画像',original:'Self-Portrait',year:'1887',place:'巴黎',index:'02',ratio:32.5/41,
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%201954.326%20-%20Art%20Institute%20of%20Chicago.jpg?width=1400',
    source:'https://www.artic.edu/artworks/80607/self-portrait',
    fact:'芝加哥艺术博物馆馆藏《自画像》，约 1887 年，画家板上油彩，41 × 32.5 厘米。',
    greeting:'哦，你正在看我的自画像。这是我住在巴黎时画的。那几年我认识了新的艺术家，也在不断试验新的画法；请不起模特时，我自己就是最方便的对象。有人愿意认真看看这张脸，我很高兴。',
    suggestions:['为什么画这么多自画像？','你的眼神为什么这么紧张？','这些短笔触从哪里来？']
  },
  {
    id:'garden',title:'诗人的花园',original:"The Poet's Garden",year:'1888',place:'阿尔勒',index:'03',ratio:92.1/73,
    image:'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Poet%27s%20Garden%20-%201933.433%20-%20Art%20Institute%20of%20Chicago.jpg?width=1800',
    source:'https://www.artic.edu/artworks/14586/the-poet-s-garden',
    fact:'芝加哥艺术博物馆馆藏《诗人的花园》，1888 年，布面油画，73 × 92.1 厘米。',
    greeting:'哦，你正在看《诗人的花园》。我在阿尔勒生活时画下了这座公共花园，也给它取了这个带着想象的名字。那时我对南方的生活和艺术家共同工作的未来抱着很大的期待。',
    suggestions:['为什么叫诗人的花园？','那棵树为什么这么大？','这幅画与高更有关吗？']
  }
];

const museums={
  artic:{id:'artic',name:'芝加哥艺术博物馆',shortName:'芝加哥',officialName:'Art Institute of Chicago',titleHtml:'Art Institute<br>of Chicago',location:'CHICAGO · UNITED STATES',website:'https://www.artic.edu',introEn:'The Art Institute of Chicago brings together art from across centuries and cultures, with celebrated strengths in Impressionism, Post-Impressionism, and modern American art.',introZh:'芝加哥艺术博物馆汇集跨越多个世纪与文化的艺术收藏，尤以印象派、后印象派及美国现代艺术闻名。',word:'CHICAGO LIBRARY',query:null},
  met:{id:'met',name:'大都会艺术博物馆',shortName:'THE MET',officialName:'The Metropolitan Museum of Art',titleHtml:'The Metropolitan<br>Museum of Art',location:'NEW YORK · UNITED STATES',website:'https://www.metmuseum.org',introEn:'The Metropolitan Museum of Art presents more than five thousand years of art from cultures across the globe, connecting history, ideas, and creative practice.',introZh:'大都会艺术博物馆以跨越五千余年的世界性馆藏，连接不同文明的历史、观念与创作实践。',word:'THE MET COLLECTION',query:'Vincent van Gogh'},
  cleveland:{id:'cleveland',name:'克利夫兰艺术博物馆',shortName:'CLEVELAND',officialName:'Cleveland Museum of Art',titleHtml:'Cleveland<br>Museum of Art',location:'CLEVELAND · UNITED STATES',website:'https://www.clevelandart.org',introEn:'The Cleveland Museum of Art is known for an encyclopedic collection spanning continents and centuries, with particular strengths in Asian and European art.',introZh:'克利夫兰艺术博物馆拥有横跨多个大陆与世纪的综合馆藏，尤以亚洲艺术与欧洲艺术见长。',word:'CLEVELAND COLLECTION',query:'Claude Monet'}
};

const defaultMuseumImage='https://commons.wikimedia.org/wiki/Special:FilePath/The%20British%20Museum%20from%20the%20air.jpg?width=500';
const globeMuseums=[
  {id:'artic',museumId:'artic',name:'芝加哥艺术博物馆',officialName:'Art Institute of Chicago',label:'CHICAGO · AIC',city:'CHICAGO',country:'UNITED STATES',region:'NORTH AMERICA',lat:41.8796,lng:-87.6237,status:'today',priority:'primary',type:'综合艺术博物馆',works:'03',artists:'01',website:'https://www.artic.edu',description:'收藏跨越五千年艺术史，以印象派、后印象派及美国现代艺术收藏闻名。',featureTitle:'自画像',featureMeta:'文森特·梵高 · 1887',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%201954.326%20-%20Art%20Institute%20of%20Chicago.jpg?width=500'},
  {id:'met',museumId:'met',name:'大都会艺术博物馆',officialName:'The Metropolitan Museum of Art',label:'NEW YORK · THE MET',city:'NEW YORK',country:'UNITED STATES',region:'NORTH AMERICA',lat:40.7794,lng:-73.9632,status:'open',priority:'primary',type:'综合艺术博物馆',works:'12+',artists:'多位',website:'https://www.metmuseum.org',description:'从古代文明到现代艺术，跨越五千余年的世界性馆藏构成其核心。',featureTitle:'麦田里的柏树',featureMeta:'文森特·梵高 · 1889',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Van%20Gogh%20-%20Zypressen%20mit%20zwei%20weiblichen%20Figuren.jpeg?width=500'},
  {id:'cleveland',museumId:'cleveland',name:'克利夫兰艺术博物馆',officialName:'Cleveland Museum of Art',label:'CLEVELAND · CMA',city:'CLEVELAND',country:'UNITED STATES',region:'NORTH AMERICA',lat:41.5089,lng:-81.6116,status:'open',priority:'secondary',type:'综合艺术博物馆',works:'12+',artists:'多位',website:'https://www.clevelandart.org',description:'以亚洲艺术、欧洲绘画与装饰艺术见长，馆藏开放程度也格外出色。',featureTitle:'睡莲',featureMeta:'克劳德·莫奈 · 约 1920',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Water%20Lilies%20-%201960.81%20-%20Cleveland%20Museum%20of%20Art.jpg?width=500'},
  {id:'moma',name:'纽约现代艺术博物馆',officialName:'The Museum of Modern Art',label:'NEW YORK · MoMA',city:'NEW YORK',country:'UNITED STATES',region:'NORTH AMERICA',lat:40.7614,lng:-73.9776,priority:'secondary',type:'现代与当代艺术',website:'https://www.moma.org',description:'以现代主义与当代艺术史中的关键作品、摄影、设计和影像收藏著称。',featureTitle:'星夜',featureMeta:'文森特·梵高 · 1889',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Van%20Gogh%20-%20Starry%20Night%20-%20Google%20Art%20Project.jpg?width=500'},
  {id:'guggenheim',name:'古根海姆博物馆',officialName:'Solomon R. Guggenheim Museum',label:'NEW YORK · GUGGENHEIM',city:'NEW YORK',country:'UNITED STATES',region:'NORTH AMERICA',lat:40.783,lng:-73.959,priority:'secondary',type:'现代与当代艺术',website:'https://www.guggenheim.org',description:'以螺旋形建筑和现代艺术收藏闻名，展览沿连续坡道展开。',featureTitle:'现代艺术馆藏',featureMeta:'20 世纪至当代',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Solomon%20R.%20Guggenheim%20Museum.jpg?width=500'},
  {id:'getty',name:'盖蒂中心',officialName:'Getty Center',label:'LOS ANGELES · GETTY',city:'LOS ANGELES',country:'UNITED STATES',region:'NORTH AMERICA',lat:34.078,lng:-118.474,type:'欧洲艺术与摄影',website:'https://www.getty.edu',description:'汇集欧洲绘画、雕塑、装饰艺术与摄影，并拥有重要的艺术研究资源。',featureTitle:'鸢尾花',featureMeta:'文森特·梵高 · 1889',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Irises-Vincent%20van%20Gogh.jpg?width=500'},
  {id:'sfmoma',name:'旧金山现代艺术博物馆',officialName:'San Francisco Museum of Modern Art',label:'SAN FRANCISCO · SFMOMA',city:'SAN FRANCISCO',country:'UNITED STATES',region:'NORTH AMERICA',lat:37.7857,lng:-122.4011,type:'现代与当代艺术',website:'https://www.sfmoma.org',description:'美国西海岸重要的现代与当代艺术机构，覆盖绘画、摄影、建筑与媒体艺术。',featureTitle:'现代艺术馆藏',featureMeta:'20 世纪至当代',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/San%20Francisco%20Museum%20of%20Modern%20Art.jpg?width=500'},
  {id:'louvre',name:'卢浮宫博物馆',officialName:'Musée du Louvre',label:'PARIS · LOUVRE',city:'PARIS',country:'FRANCE',region:'EUROPE',lat:48.8606,lng:2.3376,type:'综合艺术与考古',website:'https://www.louvre.fr',description:'从古代文明到十九世纪艺术，收藏横跨多个文明与历史时期。',featureTitle:'蒙娜丽莎',featureMeta:'列奥纳多·达·芬奇 · 约 1503',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Mona%20Lisa%2C%20by%20Leonardo%20da%20Vinci%2C%20from%20C2RMF%20retouched.jpg?width=500'},
  {id:'orsay',name:'奥赛博物馆',officialName:'Musée d’Orsay',label:'PARIS · MUSÉE D’ORSAY',city:'PARIS',country:'FRANCE',region:'EUROPE',lat:48.86,lng:2.3266,priority:'secondary',type:'十九世纪艺术',website:'https://www.musee-orsay.fr',description:'以印象派与后印象派收藏著称，串联十九世纪中叶至二十世纪初的艺术变革。',featureTitle:'煎饼磨坊的舞会',featureMeta:'皮埃尔-奥古斯特·雷诺阿 · 1876',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Pierre-Auguste%20Renoir%2C%20Le%20Moulin%20de%20la%20Galette.jpg?width=500'},
  {id:'pompidou',name:'蓬皮杜中心',officialName:'Centre Pompidou',label:'PARIS · POMPIDOU',city:'PARIS',country:'FRANCE',region:'EUROPE',lat:48.8607,lng:2.3522,priority:'secondary',type:'现代与当代艺术',website:'https://www.centrepompidou.fr',description:'欧洲重要的现代与当代艺术收藏机构，同时关注设计、建筑与影像。',featureTitle:'现代艺术馆藏',featureMeta:'1905 年至当代',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Centre%20Pompidou%20from%20Notre-Dame%20de%20Paris%202011.jpg?width=500'},
  {id:'british',name:'大英博物馆',officialName:'The British Museum',label:'LONDON · BRITISH MUSEUM',city:'LONDON',country:'UNITED KINGDOM',region:'EUROPE',lat:51.5194,lng:-0.127,type:'世界历史与考古',website:'https://www.britishmuseum.org',description:'通过跨越两百万年的人类文物，呈现世界文明与文化交流的历史。',featureTitle:'罗塞塔石碑',featureMeta:'古埃及 · 公元前 196 年',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Rosetta%20Stone.JPG?width=500'},
  {id:'national-gallery',name:'英国国家美术馆',officialName:'The National Gallery',label:'LONDON · NATIONAL GALLERY',city:'LONDON',country:'UNITED KINGDOM',region:'EUROPE',lat:51.5089,lng:-0.1283,priority:'secondary',type:'欧洲绘画',website:'https://www.nationalgallery.org.uk',description:'以十三至二十世纪初的欧洲绘画为核心，重要作品向公众免费开放。',featureTitle:'向日葵',featureMeta:'文森特·梵高 · 1888',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Sunflowers%20-%20VGM%20F458.jpg?width=500'},
  {id:'tate',name:'泰特现代美术馆',officialName:'Tate Modern',label:'LONDON · TATE MODERN',city:'LONDON',country:'UNITED KINGDOM',region:'EUROPE',lat:51.5076,lng:-0.0994,priority:'secondary',type:'现代与当代艺术',website:'https://www.tate.org.uk/visit/tate-modern',description:'在改造后的发电站中呈现全球现代与当代艺术，并强调跨文化叙事。',featureTitle:'现代与当代馆藏',featureMeta:'1900 年至当代',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Tate%20Modern%20London%20March%202006.jpg?width=500'},
  {id:'prado',name:'普拉多国家博物馆',officialName:'Museo Nacional del Prado',label:'MADRID · PRADO',city:'MADRID',country:'SPAIN',region:'EUROPE',lat:40.4138,lng:-3.6921,type:'欧洲古典绘画',website:'https://www.museodelprado.es',description:'以西班牙、意大利和佛兰德斯绘画著称，是理解欧洲古典艺术的重要入口。',featureTitle:'宫娥',featureMeta:'迭戈·委拉斯开兹 · 1656',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Las%20Meninas%2C%20by%20Diego%20Vel%C3%A1zquez%2C%20from%20Prado%20in%20Google%20Earth.jpg?width=500'},
  {id:'uffizi',name:'乌菲齐美术馆',officialName:'Gallerie degli Uffizi',label:'FLORENCE · UFFIZI',city:'FLORENCE',country:'ITALY',region:'EUROPE',lat:43.7678,lng:11.2553,type:'文艺复兴艺术',website:'https://www.uffizi.it',description:'以意大利文艺复兴绘画与美第奇家族收藏为核心。',featureTitle:'维纳斯的诞生',featureMeta:'桑德罗·波提切利 · 约 1485',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Sandro%20Botticelli%20-%20La%20nascita%20di%20Venere%20-%20Google%20Art%20Project%20-%20edited.jpg?width=500'},
  {id:'vatican',name:'梵蒂冈博物馆',officialName:'Musei Vaticani',label:'VATICAN CITY · VATICAN',city:'VATICAN CITY',country:'VATICAN CITY',region:'EUROPE',lat:41.9065,lng:12.4536,type:'艺术与考古博物馆群',website:'https://www.museivaticani.va',description:'由多个博物馆与历史空间组成，收藏横跨古典文明、文艺复兴与宗教艺术。',featureTitle:'创造亚当',featureMeta:'米开朗基罗 · 约 1512',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Michelangelo%20-%20Creation%20of%20Adam%20%28cropped%29.jpg?width=500'},
  {id:'rijksmuseum',name:'荷兰国立博物馆',officialName:'Rijksmuseum',label:'AMSTERDAM · RIJKSMUSEUM',city:'AMSTERDAM',country:'NETHERLANDS',region:'EUROPE',lat:52.36,lng:4.8852,type:'荷兰艺术与历史',website:'https://www.rijksmuseum.nl',description:'以荷兰黄金时代艺术、工艺与国家历史收藏著称。',featureTitle:'夜巡',featureMeta:'伦勃朗 · 1642',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Nightwatch%20by%20Rembrandt%20-%20Rijksmuseum.jpg?width=500'},
  {id:'palace',name:'故宫博物院',officialName:'The Palace Museum',label:'BEIJING · PALACE MUSEUM',city:'BEIJING',country:'CHINA',region:'ASIA',lat:39.9163,lng:116.3972,type:'中国古代艺术与宫廷文化',website:'https://www.dpm.org.cn',description:'依托紫禁城建筑群，收藏与呈现中国古代宫廷艺术、器物与历史文献。',featureTitle:'千里江山图',featureMeta:'王希孟 · 北宋',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Wang%20Ximeng.%20A%20Thousand%20Li%20of%20Rivers%20and%20Mountains.%20%28Complete%2C%2051%2C3x1191%2C5%20cm%29.%201113.%20Palace%20museum%2C%20Beijing.jpg?width=500'},
  {id:'namoc',name:'中国国家博物馆',officialName:'National Museum of China',label:'BEIJING · NMC',city:'BEIJING',country:'CHINA',region:'ASIA',lat:39.9051,lng:116.4011,priority:'secondary',type:'中国历史与文化',website:'https://www.chnmuseum.cn',description:'以中国历史与文化为核心，系统呈现中华文明的发展脉络。',featureTitle:'古代中国基本陈列',featureMeta:'远古至明清',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/National%20Museum%20of%20China%20on%20Tiananmen%20Square.jpg?width=500'},
  {id:'shanghai',name:'上海博物馆',officialName:'Shanghai Museum',label:'SHANGHAI · SHANGHAI MUSEUM',city:'SHANGHAI',country:'CHINA',region:'ASIA',lat:31.2303,lng:121.4706,type:'中国古代艺术',website:'https://www.shanghaimuseum.net',description:'以中国古代青铜器、陶瓷、书画与工艺美术收藏见长。',featureTitle:'中国古代艺术馆藏',featureMeta:'青铜、陶瓷与书画',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Shanghai_Museum_2006-01.jpg?width=500'},
  {id:'mplus',name:'M+ 博物馆',officialName:'M+',label:'HONG KONG · M+',city:'HONG KONG',country:'CHINA',region:'ASIA',lat:22.3001,lng:114.1597,type:'视觉文化',website:'https://www.mplus.org.hk',description:'聚焦二十与二十一世纪视觉艺术、设计、建筑和流动影像，立足亚洲视角。',featureTitle:'M+ Collection',featureMeta:'20–21 世纪视觉文化',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/M%2B%20museum%20Hong%20Kong%202021.jpg?width=500'},
  {id:'tokyo-national',name:'东京国立博物馆',officialName:'Tokyo National Museum',label:'TOKYO · TNM',city:'TOKYO',country:'JAPAN',region:'ASIA',lat:35.7188,lng:139.7765,type:'日本与亚洲古代艺术',website:'https://www.tnm.jp',description:'系统收藏日本及亚洲各地艺术与考古文物，是日本历史最悠久的博物馆之一。',featureTitle:'日本美术馆藏',featureMeta:'古代至近世',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Tokyo%20National%20Museum%2C%20Honkan%202010.jpg?width=500'},
  {id:'mori',name:'森美术馆',officialName:'Mori Art Museum',label:'TOKYO · MORI',city:'TOKYO',country:'JAPAN',region:'ASIA',lat:35.6605,lng:139.7292,priority:'secondary',type:'当代艺术',website:'https://www.mori.art.museum',description:'以国际当代艺术展览为核心，关注亚洲城市、社会与新兴创作。',featureTitle:'当代艺术展览',featureMeta:'亚洲与全球视角',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Mori%20Art%20Museum%20Tokyo.jpg?width=500'},
  {id:'national-korea',name:'韩国国立中央博物馆',officialName:'National Museum of Korea',label:'SEOUL · NMK',city:'SEOUL',country:'SOUTH KOREA',region:'ASIA',lat:37.5239,lng:126.9802,type:'韩国历史与亚洲艺术',website:'https://www.museum.go.kr',description:'系统呈现韩国历史、考古与艺术，同时收藏重要的亚洲文化遗产。',featureTitle:'韩国艺术与历史馆藏',featureMeta:'史前至近现代',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/National%20Museum%20of%20Korea%202011.jpg?width=500'},
  {id:'national-singapore',name:'新加坡国家美术馆',officialName:'National Gallery Singapore',label:'SINGAPORE · NGS',city:'SINGAPORE',country:'SINGAPORE',region:'ASIA',lat:1.2903,lng:103.8516,type:'东南亚现代艺术',website:'https://www.nationalgallery.sg',description:'拥有重要的东南亚现代艺术公共收藏，连接区域历史与当代议题。',featureTitle:'东南亚艺术馆藏',featureMeta:'19 世纪至当代',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/National%20Gallery%20Singapore.jpg?width=500'},
  {id:'egyptian',name:'埃及博物馆',officialName:'The Egyptian Museum',label:'CAIRO · EGYPTIAN MUSEUM',city:'CAIRO',country:'EGYPT',region:'AFRICA',lat:30.0478,lng:31.2336,type:'古埃及考古',website:'https://egymonuments.gov.eg',description:'收藏大量古埃及文物，是理解法老时代历史与物质文化的重要机构。',featureTitle:'古埃及馆藏',featureMeta:'前王朝至希腊罗马时期',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Egyptian%20Museum%20in%20Cairo.jpg?width=500'},
  {id:'masp',name:'圣保罗艺术博物馆',officialName:'Museu de Arte de São Paulo',label:'SÃO PAULO · MASP',city:'SÃO PAULO',country:'BRAZIL',region:'SOUTH AMERICA',lat:-23.5614,lng:-46.6559,type:'国际艺术',website:'https://masp.org.br',description:'以标志性建筑和横跨欧洲、非洲、亚洲与美洲的收藏闻名。',featureTitle:'国际艺术馆藏',featureMeta:'古代至当代',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/Museu%20de%20Arte%20de%20S%C3%A3o%20Paulo%20%28MASP%29.jpg?width=500'},
  {id:'nga-australia',name:'澳大利亚国家美术馆',officialName:'National Gallery of Australia',label:'CANBERRA · NGA',city:'CANBERRA',country:'AUSTRALIA',region:'OCEANIA',lat:-35.3004,lng:149.1368,type:'澳大利亚与国际艺术',website:'https://nga.gov.au',description:'收藏澳大利亚原住民艺术、澳大利亚艺术以及亚洲、欧洲与美洲艺术。',featureTitle:'原住民与国际艺术馆藏',featureMeta:'古代至当代',featureImage:'https://commons.wikimedia.org/wiki/Special:FilePath/National%20Gallery%20of%20Australia%2C%20Canberra.jpg?width=500'}
].map(museum=>({status:'soon',priority:['artic','met','louvre','palace','egyptian','masp','nga-australia'].includes(museum.id)?'primary':'secondary',works:'--',artists:'--',featureImage:defaultMuseumImage,...museum,color:museum.status==='today'?'#f3e6d2':museum.status==='open'?'#f1ede5':'#8f918e',radius:museum.status==='today'?.5:museum.status==='open'?.32:.2}));
featuredWorks.forEach(work=>Object.assign(work,{museumId:'artic',museumName:museums.artic.name,artistName:'Vincent van Gogh',dialogueEnabled:true,thumbnail:work.image}));
const collections=new Map([['artic',featuredWorks]]);
let works=featuredWorks;
let eyeImage=featuredWorks[1].image;
const state={view:'home',page:0,museumId:'artic',collectionLoading:false,current:0,scale:1,x:0,y:0,drag:null,globe:null,toastTimer:null,conversation:[],chatRequest:null,flowLocked:false,wheelDelta:0,wheelReset:null};
const galleryMotion={raf:null,last:0,offset:0,setWidth:0,paused:false,speed:40,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];

function init(){
  $('#detailEye').src=$('#inputEye').src=eyeImage;
  bindNavigation();
  bindPageFlow();
  bindGallery();
  bindViewer();
  bindChat();
  renderMuseumSwitcher();
  initGlobe();
  initReveals();
  renderGallery();
  selectArtwork(0,false);
  const requestedView=location.hash.slice(1);
  if(['gallery','artwork'].includes(requestedView)) setTimeout(()=>showView(requestedView,false),0);
  if(requestedView==='museum')setTimeout(()=>{state.page=1;scrollTo(0,$('#museum').offsetTop)},0);
  window.addEventListener('scroll',onPageScroll,{passive:true});
  onPageScroll();
  hydrateArtworkCatalog();
}

async function hydrateArtworkCatalog(){
  try{
    const response=await fetch('/api/catalog/artworks?source=artic&ids=28560,80607,14586&publicDomainOnly=true');
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||'馆藏数据暂时不可用');
    const byId=new Map(result.items.map(item=>[item.sourceId,item]));
    const sourceIds=['28560','80607','14586'];
    featuredWorks.forEach((work,index)=>{
      const item=byId.get(sourceIds[index]);if(!item)return;
      work.fallbackImage=work.fallbackImage||work.image;
      work.officialImage=item.images?.preferred?.url||null;
      work.source=item.sourceUrl||work.source;
      work.medium=item.medium||work.medium;
      work.dimensions=item.dimensions||work.dimensions;
      work.creditLine=item.creditLine||work.creditLine;
      work.fact=[
        `芝加哥艺术博物馆馆藏《${work.title}》`,
        item.date?.display,
        item.medium,
        item.dimensions,
      ].filter(Boolean).join('，')+'。';
      work.catalog=item;
    });
    collections.set('artic',featuredWorks);
    eyeImage=featuredWorks[1].image;
    $('#detailEye').src=$('#inputEye').src=eyeImage;
    if(state.museumId==='artic'){works=featuredWorks;renderGallery();selectArtwork(state.current,false)}
  }catch(error){
    console.warn('Using bundled artwork fallback data',error);
  }
}

function onPageScroll(){
  $('#siteHeader').classList.toggle('scrolled',scrollY>30);
  if(state.view==='home'&&!state.flowLocked)state.page=scrollY>innerHeight*.45?1:0;
  updateGlobeTransition();
}

function bindPageFlow(){
  window.addEventListener('wheel',handlePageWheel,{passive:false,capture:true});
  window.addEventListener('keydown',event=>{
    if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
    if(event.key==='PageDown'||event.key==='ArrowDown'){event.preventDefault();goToPage(Math.min(3,state.page+1))}
    if(event.key==='PageUp'||event.key==='ArrowUp'){event.preventDefault();goToPage(Math.max(0,state.page-1))}
  });
}

function handlePageWheel(event){
  if(event.ctrlKey||Math.abs(event.deltaY)<2)return;
  if(state.page===1&&event.target.closest('#globe'))return;
  const scrollable=event.target.closest('.messages,.source-drawer');
  if(scrollable){
    const canMove=event.deltaY>0?scrollable.scrollTop+scrollable.clientHeight<scrollable.scrollHeight-2:scrollable.scrollTop>2;
    if(canMove)return;
  }
  event.preventDefault();
  if(state.flowLocked)return;
  state.wheelDelta+=event.deltaY;
  clearTimeout(state.wheelReset);
  state.wheelReset=setTimeout(()=>state.wheelDelta=0,140);
  if(Math.abs(state.wheelDelta)<34)return;
  const direction=state.wheelDelta>0?1:-1;
  state.wheelDelta=0;
  goToPage(Math.max(0,Math.min(3,state.page+direction)));
}

function lockFlow(duration=950){
  state.flowLocked=true;
  setTimeout(()=>state.flowLocked=false,duration);
}

function goToPage(page){
  if(page===state.page||state.flowLocked)return;
  if(page===1&&state.view==='gallery'){
    state.page=1;transitionWithCurtain('home','#museum',1);return;
  }
  if(page<=1){
    lockFlow(820);
    if(state.view!=='home')activateView('home',false);
    state.page=page;
    requestAnimationFrame(()=>scrollTo({top:page?$('#museum').offsetTop:0,behavior:'smooth'}));
    history.replaceState({},'',page?'#museum':'#home');
    return;
  }
  if(page===2){state.page=2;transitionToGallery();return}
  state.page=3;transitionToArtwork();
}

function updateGlobeTransition(){
  const host=$('#globe');
  if(!host||state.view!=='home')return;
  const heroHeight=$('#home')?.offsetHeight||innerHeight;
  const raw=Math.max(0,Math.min(1,scrollY/(heroHeight*.92)));
  const progress=raw*raw*(3-2*raw);
  const mobile=innerWidth<720;
  const base=state.globeBase||(mobile?620:900);
  const startDiameter=mobile?Math.max(innerWidth*1.5,620):Math.max(innerWidth*1.22,1080);
  const endDiameter=mobile?Math.min(innerWidth*1.34,innerHeight*.96,900):Math.min(innerWidth*.86,innerHeight*1.48,1700);
  const startLeft=(innerWidth-startDiameter)/2;
  const startTop=mobile?Math.max(innerHeight*.70,920):innerHeight*.70;
  const endLeft=mobile?innerWidth-endDiameter*.82:innerWidth*.39;
  const endTop=mobile?innerHeight*.51:Math.max(innerHeight*.1,68);
  const diameter=startDiameter+(endDiameter-startDiameter)*progress;
  const left=startLeft+(endLeft-startLeft)*progress;
  const top=startTop+(endTop-startTop)*progress;
  host.style.left=`${left}px`;
  host.style.top=`${top}px`;
  host.style.transform=`scale(${diameter/base})`;
  host.style.setProperty('--globe-ui-scale',String(base/diameter));
  host.style.opacity=String(1);
  state.layoutGlobeLabels?.();
  const caption=$('.globe-home-caption');
  if(caption)caption.style.opacity=String(Math.max(0,1-progress*1.7));
}

function bindNavigation(){
  $$('[data-go="home"]').forEach(el=>el.addEventListener('click',()=>showView('home')));
  $$('[data-scroll]').forEach(el=>el.addEventListener('click',()=>{
    if(state.view!=='home') showView('home',false);
    setTimeout(()=>document.getElementById(el.dataset.scroll).scrollIntoView({behavior:'smooth'}),30);
  }));
  $$('[data-toast]').forEach(el=>el.addEventListener('click',()=>toast(el.dataset.toast)));
  $('#enterGallery').addEventListener('click',async()=>{
    const selected=state.globeSelection;
    if(!selected?.museumId){toast('这家博物馆的数字馆藏正在整理中');return}
    await switchMuseum(selected.museumId);state.page=2;transitionToGallery();
  });
  $('#backGallery').addEventListener('click',()=>{state.page=2;transitionToGallery()});
  $('#dailyArt').addEventListener('click',openFeaturedPortrait);
  $('#startChat').addEventListener('click',openFeaturedPortrait);
  $('#quickQuestion').addEventListener('click',openFeaturedPortrait);
  window.addEventListener('popstate',()=>{
    const target=location.hash.slice(1)||'home';
    if(target==='museum'){activateView('home',false);state.page=1;requestAnimationFrame(()=>scrollTo(0,$('#museum').offsetTop));return}
    showView(target,false);
  });
}

function openFeaturedPortrait(){
  state.museumId='artic';works=featuredWorks;state.current=1;renderMuseumSwitcher();openArtwork();
}

function showView(name,history=true){
  if(!['home','gallery','artwork'].includes(name)) name='home';
  if(state.view===name){if(name==='home')scrollTo({top:0,behavior:'smooth'});return;}
  activateView(name,history);
  if(name==='gallery'){state.page=2;renderGallery()}
  if(name==='artwork'){state.page=3;selectArtwork(state.current,true)}
  if(name==='home'){state.page=0;requestAnimationFrame(updateGlobeTransition)}
}

function activateView(name,updateHistory=true){
  $$('.view').forEach(view=>view.classList.toggle('active',view.dataset.view===name));
  state.view=name;
  scrollTo(0,0);
  $('#siteHeader').classList.remove('dark');
  $('#siteHeader').classList.toggle('detail-mode',name==='artwork');
  $('#siteHeader').classList.remove('scrolled');
  if(name!=='gallery')stopGalleryMotion();
  if(updateHistory)window.history.pushState({},'',name==='home'?'#home':`#${name}`);
}

function transitionToGallery(){
  if(state.view==='gallery')return;
  if(state.view==='artwork'){transitionArtworkToGallery();return}
  if(state.view==='home'){
    if(state.museumId==='artic')state.current=1;
    transitionWithCurtain('gallery','#gallery');return;
  }
  showView('gallery');
}

async function transitionToArtwork(preferredCard=null){
  if(state.view!=='gallery'){showView('artwork');return}
  if(galleryMotion.reduced){showView('artwork');return}
  if(state.flowLocked)return;
  const sourceCard=getVisibleGalleryCard(state.current,preferredCard);
  const sourceFigure=sourceCard?.querySelector('figure');
  const sourceImage=sourceCard?.querySelector('img');
  if(!sourceFigure||!sourceImage){showView('artwork');return}
  state.current=Number(sourceCard.dataset.index);
  lockFlow(920);stopGalleryMotion();galleryMotion.paused=true;
  const start=sourceFigure.getBoundingClientRect();
  const clone=sourceImage.cloneNode(true);clone.className='artwork-shared-clone';
  Object.assign(clone.style,{left:`${start.left}px`,top:`${start.top}px`,width:`${start.width}px`,height:`${start.height}px`});
  document.body.appendChild(clone);sourceFigure.style.visibility='hidden';

  const artworkView=$('#artworkView');const galleryView=$('#galleryView');
  selectArtwork(state.current,true);
  artworkView.classList.add('transition-layer','opening');
  $('#siteHeader').classList.add('detail-mode');
  const target=$('#detailImage');target.style.visibility='hidden';
  const end=fittedArtworkRect($('#artViewport').getBoundingClientRect(),works[state.current].ratio||start.width/start.height);
  document.body.classList.add('artwork-transitioning');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{galleryView.classList.add('transitioning-out');artworkView.classList.add('transition-visible')}));
  artworkView.animate([{backgroundColor:'rgba(247,244,238,0)'},{backgroundColor:'rgba(247,244,238,1)'}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'});
  const animation=clone.animate([
    {left:`${start.left}px`,top:`${start.top}px`,width:`${start.width}px`,height:`${start.height}px`,filter:'brightness(1)'},
    {offset:.2,filter:'brightness(.96)'},
    {left:`${end.left}px`,top:`${end.top}px`,width:`${end.width}px`,height:`${end.height}px`,filter:'brightness(1)'}
  ],{duration:780,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
  try{await animation.finished}catch(error){}
  galleryView.classList.remove('active','transitioning-out');
  artworkView.classList.remove('transition-layer','opening','transition-visible');artworkView.classList.add('active');
  state.view='artwork';state.page=3;target.style.visibility='';sourceFigure.style.visibility='';
  await fadeOutClone(clone);document.body.classList.remove('artwork-transitioning');
  history.pushState({},'','#artwork');
}

async function transitionArtworkToGallery(){
  if(state.flowLocked)return;
  if(galleryMotion.reduced){showView('gallery');return}
  lockFlow(920);resetView();
  const artworkView=$('#artworkView');const galleryView=$('#galleryView');
  galleryView.classList.add('return-underlay');
  const targetCard=getVisibleGalleryCard(state.current);
  const targetFigure=targetCard?.querySelector('figure');
  if(!targetFigure){galleryView.classList.remove('return-underlay');showView('gallery');return}
  const start=fittedArtworkRect($('#artViewport').getBoundingClientRect(),works[state.current].ratio||1);
  const end=targetFigure.getBoundingClientRect();
  const clone=$('#detailImage').cloneNode(true);clone.className='artwork-shared-clone';clone.style.transform='none';
  Object.assign(clone.style,{left:`${start.left}px`,top:`${start.top}px`,width:`${start.width}px`,height:`${start.height}px`});
  document.body.appendChild(clone);$('#detailImage').style.visibility='hidden';targetFigure.style.visibility='hidden';
  document.body.classList.add('artwork-transitioning');artworkView.classList.add('closing');
  requestAnimationFrame(()=>requestAnimationFrame(()=>galleryView.classList.add('return-visible')));
  const animation=clone.animate([
    {left:`${start.left}px`,top:`${start.top}px`,width:`${start.width}px`,height:`${start.height}px`,filter:'brightness(1)'},
    {offset:.8,filter:'brightness(.96)'},
    {left:`${end.left}px`,top:`${end.top}px`,width:`${end.width}px`,height:`${end.height}px`,filter:'brightness(1)'}
  ],{duration:780,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});
  try{await animation.finished}catch(error){}
  artworkView.classList.remove('active','closing');galleryView.classList.remove('return-underlay','return-visible');galleryView.classList.add('active');
  $('#detailImage').style.visibility='';targetFigure.style.visibility='';state.view='gallery';state.page=2;
  $$('.artwork-marquee-item.selected').forEach(card=>card.classList.remove('selected'));hideGalleryArtworkDetail();galleryMotion.paused=false;
  $('#siteHeader').classList.remove('detail-mode');await fadeOutClone(clone);document.body.classList.remove('artwork-transitioning');startGalleryMotion();
  history.pushState({},'','#gallery');
}

function getVisibleGalleryCard(index,preferred=null){
  if(preferred?.isConnected)return preferred;
  const candidates=$$(`.artwork-marquee-item[data-index="${index}"]`).filter(card=>{const r=card.getBoundingClientRect();return r.right>0&&r.left<innerWidth});
  if(candidates.length)return candidates.sort((a,b)=>Math.abs(a.getBoundingClientRect().left+a.offsetWidth/2-innerWidth/2)-Math.abs(b.getBoundingClientRect().left+b.offsetWidth/2-innerWidth/2))[0];
  const visible=$$('.artwork-marquee-item').find(card=>{const r=card.getBoundingClientRect();return r.right>0&&r.left<innerWidth});
  if(visible)state.current=Number(visible.dataset.index);
  return visible;
}

function fittedArtworkRect(frame,ratio){
  let width=frame.width,height=width/ratio;
  if(height>frame.height){height=frame.height;width=height*ratio}
  return {left:frame.left+(frame.width-width)/2,top:frame.top+(frame.height-height)/2,width,height};
}

async function fadeOutClone(clone){
  const fade=clone.animate([{opacity:1},{opacity:0}],{duration:140,easing:'ease-out',fill:'forwards'});
  try{await fade.finished}catch(error){}clone.remove();
}

function transitionWithCurtain(targetView,historyHash,targetPage=null){
  if(state.flowLocked)return;
  lockFlow(1450);
  const curtain=$('#curtain');
  curtain.classList.remove('run');void curtain.offsetWidth;curtain.classList.add('run');
  setTimeout(()=>{
    activateView(targetView,false);
    if(targetView==='gallery'){state.page=2;renderGallery()}
    if(targetView==='artwork'){state.page=3;selectArtwork(state.current,true)}
    if(targetView==='home'){
      state.page=targetPage??0;
      scrollTo(0,state.page===1?$('#museum').offsetTop:0);
      updateGlobeTransition();
    }
    history.pushState({},'',historyHash);
  },680);
  setTimeout(()=>curtain.classList.remove('run'),1420);
}

function bindGallery(){
  window.addEventListener('resize',()=>{if(state.view==='gallery')measureGalleryTrack(false)});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){hideGalleryArtworkDetail();closeSources()}});
}

function renderMuseumSwitcher(){
  const host=$('#museumSwitcher');host.innerHTML='';
  Object.values(museums).forEach(museum=>{
    const button=document.createElement('button');button.type='button';button.textContent=museum.shortName;
    button.classList.toggle('active',museum.id===state.museumId);button.disabled=state.collectionLoading;
    button.addEventListener('click',()=>switchMuseum(museum.id));host.appendChild(button);
  });
}

function catalogItemToWork(item,museum,index){
  const preferred=item.images?.preferred;
  const thumbnail=preferred?.thumbnailUrl||preferred?.url;
  return {
    id:item.id,title:item.title||'Untitled',original:item.artist?.name||museum.name,artistName:item.artist?.name||'Unknown artist',
    year:item.date?.display||'年代不详',place:item.origin||museum.name,index:String(index+1).padStart(2,'0'),
    image:thumbnail,thumbnail,officialImage:preferred?.url||thumbnail,fallbackImage:thumbnail,source:item.sourceUrl,
    museumId:museum.id,museumName:museum.name,dialogueEnabled:false,catalog:item,
    medium:item.medium,dimensions:item.dimensions,creditLine:item.creditLine,
    fact:[`${museum.name}馆藏《${item.title||'Untitled'}》`,item.artist?.name,item.date?.display,item.medium,item.dimensions].filter(Boolean).join('，')+'。'
  };
}

async function switchMuseum(museumId){
  if(state.collectionLoading||!museums[museumId])return;
  const museum=museums[museumId];state.museumId=museumId;state.current=0;
  if(collections.has(museumId)){works=collections.get(museumId);renderMuseumSwitcher();renderGallery();return}
  state.collectionLoading=true;renderMuseumSwitcher();$('#museumStatus').textContent=`正在读取${museum.name}开放馆藏…`;
  try{
    const params=new URLSearchParams({source:museum.id,q:museum.query,limit:'12',publicDomainOnly:'true'});
    const response=await fetch(`/api/catalog/artworks?${params}`);const result=await response.json();
    if(!response.ok)throw new Error(result.error||'馆藏读取失败');
    const collection=(result.items||[]).filter(item=>item.images?.preferred?.url).map((item,index)=>catalogItemToWork(item,museum,index));
    if(!collection.length)throw new Error('暂时没有可展示的开放图片');
    collections.set(museumId,collection);works=collection;renderGallery();
  }catch(error){
    state.museumId='artic';works=featuredWorks;state.current=0;toast(error.message);renderGallery();
  }finally{state.collectionLoading=false;renderMuseumSwitcher()}
}

function renderGallery(){
  const museum=museums[state.museumId];
  const track=$('#carouselTrack');
  stopGalleryMotion();
  galleryMotion.offset=0;galleryMotion.paused=false;galleryMotion.setWidth=0;
  track.innerHTML='';
  $('#galleryMuseumTitle').innerHTML=museum.titleHtml||escapeHtml(museum.officialName||museum.name);
  $('#galleryMuseumIndex').textContent=String(Object.keys(museums).indexOf(museum.id)+1).padStart(2,'0');
  $('#galleryMuseumIntroEn').textContent=museum.introEn||museum.name;
  $('#galleryMuseumIntroZh').textContent=museum.introZh||museum.name;
  const location=$('#galleryMuseumLocation');location.textContent=`${museum.location||museum.shortName} ↗`;location.href=museum.website||'#';

  for(let copy=0;copy<3;copy++){
    const set=document.createElement('div');set.className='collection-marquee-set';set.setAttribute('aria-hidden',copy?'true':'false');
    works.forEach((work,index)=>set.appendChild(createGalleryArtwork(work,index,copy)));
    track.appendChild(set);
  }

  hideGalleryArtworkDetail();
  $('#galleryView').setAttribute('aria-label',`${museum.name}数字画廊`);
  $('#museumStatus').textContent=`${museum.name} · ${works.length} 件开放馆藏`;
  requestAnimationFrame(()=>measureGalleryTrack(true));
}

function createGalleryArtwork(work,index,copy){
  const ratio=work.ratio||1.2;
  const card=document.createElement('button');
  card.type='button';card.className=`artwork-marquee-item ${artworkRatioClass(ratio)}`;card.dataset.index=index;card.style.setProperty('--item-ratio',ratio);
  card.tabIndex=copy?-1:0;
  card.setAttribute('aria-label',`${work.artistName}《${work.title}》，${work.year}。点击进入作品`);
  card.innerHTML=`<span class="artwork-marquee-card"><figure><img src="${escapeHtml(work.thumbnail||work.image)}" alt="${escapeHtml(work.artistName)}《${escapeHtml(work.title)}》" draggable="false" ${copy?'loading="lazy"':'loading="eager"'}><span class="artwork-open-pill">进入作品 <i>→</i></span></figure></span>`;
  const image=card.querySelector('img');
  const syncRatio=()=>{
    if(!image.naturalWidth||!image.naturalHeight)return;
    work.ratio=image.naturalWidth/image.naturalHeight;
    card.style.setProperty('--item-ratio',work.ratio);card.classList.remove('portrait','landscape','wide');card.classList.add(artworkRatioClass(work.ratio));
    requestAnimationFrame(()=>measureGalleryTrack(false));
  };
  if(image.complete)syncRatio();else image.addEventListener('load',syncRatio,{once:true});
  const select=()=>{state.current=index;galleryMotion.paused=true;card.classList.add('selected');showGalleryArtworkDetail(work)};
  const release=()=>{galleryMotion.paused=false;card.classList.remove('selected');hideGalleryArtworkDetail()};
  card.addEventListener('pointerenter',select);card.addEventListener('focus',select);
  card.addEventListener('pointermove',event=>{const rect=card.getBoundingClientRect();card.style.setProperty('--cursor-x',`${event.clientX-rect.left}px`);card.style.setProperty('--cursor-y',`${event.clientY-rect.top}px`)});
  card.addEventListener('pointerleave',release);card.addEventListener('blur',release);
  card.addEventListener('click',()=>{state.current=index;state.page=3;transitionToArtwork(card)});
  return card;
}

function artworkRatioClass(ratio){return ratio<.9?'portrait':ratio>1.5?'wide':'landscape'}

function showGalleryArtworkDetail(work){
  const detail=$('#galleryArtworkDetail');
  $('#galleryArtworkType').textContent=[work.medium||'COLLECTION',work.place].filter(Boolean).join(' / ').toUpperCase();
  $('#galleryArtworkTitle').textContent=work.title;
  $('#galleryArtworkMeta').textContent=[work.original&&work.original!==work.artistName?work.original:null,work.artistName,work.year].filter(Boolean).join(' · ');
  detail.classList.add('visible');detail.setAttribute('aria-hidden','false');
  $('#galleryInstruction').classList.add('quiet');
}

function hideGalleryArtworkDetail(){
  const detail=$('#galleryArtworkDetail');if(!detail)return;
  detail.classList.remove('visible');detail.setAttribute('aria-hidden','true');
  $('#galleryInstruction')?.classList.remove('quiet');
}

function measureGalleryTrack(resetOffset){
  const first=$('.collection-marquee-set');const track=$('#carouselTrack');if(!first||!track)return;
  const width=first.getBoundingClientRect().width;if(!width)return;
  galleryMotion.setWidth=width;
  if(resetOffset)galleryMotion.offset=-Math.min(width*.28,innerWidth*.24);
  else while(galleryMotion.offset<=-width)galleryMotion.offset+=width;
  track.style.transform=`translate3d(${galleryMotion.offset}px,0,0)`;
  startGalleryMotion();
}

function startGalleryMotion(){
  stopGalleryMotion();
  if(galleryMotion.reduced||state.view!=='gallery')return;
  galleryMotion.last=performance.now();
  const tick=now=>{
    if(state.view!=='gallery'){galleryMotion.raf=null;return}
    const elapsed=Math.min((now-galleryMotion.last)/1000,.05);galleryMotion.last=now;
    if(!galleryMotion.paused&&galleryMotion.setWidth){
      galleryMotion.offset-=galleryMotion.speed*elapsed;
      if(galleryMotion.offset<=-galleryMotion.setWidth)galleryMotion.offset+=galleryMotion.setWidth;
      $('#carouselTrack').style.transform=`translate3d(${galleryMotion.offset}px,0,0)`;
    }
    galleryMotion.raf=requestAnimationFrame(tick);
  };
  galleryMotion.raf=requestAnimationFrame(tick);
}

function stopGalleryMotion(){if(galleryMotion.raf)cancelAnimationFrame(galleryMotion.raf);galleryMotion.raf=null}

function openArtwork(){if(state.view==='gallery'){state.page=3;transitionToArtwork()}else showView('artwork')}

function selectArtwork(index,resetChat=true){
  state.current=index;const work=works[index];resetView();
  $('#artworkView').style.setProperty('--detail-ratio',work.ratio||1.2);
  const image=$('#detailImage');const loading=$('#artLoading');loading.classList.remove('hidden');loading.textContent='正在展开高清作品…';image.alt=`${work.artistName}《${work.title}》，${work.year}`;
  image.onload=()=>loading.classList.add('hidden');
  image.onerror=()=>{
    if(work.fallbackImage&&image.src!==work.fallbackImage){image.src=work.fallbackImage;return}
    loading.textContent='高清图片暂时无法加载，请稍后重试';
  };
  image.src=work.officialImage||work.image;
  $('#detailIndex').textContent=`${work.index} / ${String(works.length).padStart(2,'0')}`;
  $('#detailHeading').textContent=work.title;
  $('#detailOriginal').textContent=work.original||work.title;
  $('#detailMeta').textContent=`${work.artistName} · ${work.year} · ${work.place}`;
  $('#detailIntro').textContent=work.catalog?.description||work.fact;
  $('#detailMuseum').textContent=work.museumName;
  $('#detailMaterial').textContent=[work.medium,work.dimensions].filter(Boolean).join(' · ')||'馆方资料整理中';
  $('#backGallery').setAttribute('aria-label',`关闭作品详情，返回${work.museumName}`);
  $('#detailPane').classList.toggle('catalog-mode',!work.dialogueEnabled);
  $('#collectionInfo').innerHTML=work.dialogueEnabled?'':`<dl><dt>艺术家</dt><dd>${escapeHtml(work.artistName)}</dd><dt>年代</dt><dd>${escapeHtml(work.year)}</dd><dt>材料</dt><dd>${escapeHtml(work.medium||'馆方未提供')}</dd><dt>尺寸</dt><dd>${escapeHtml(work.dimensions||'馆方未提供')}</dd><dt>图片许可</dt><dd>${escapeHtml(work.catalog?.rights?.code||'请见馆方页面')}</dd></dl><a href="${escapeHtml(work.source)}" target="_blank" rel="noreferrer">查看馆方原始记录 ↗</a>`;
  if(!work.dialogueEnabled){state.chatRequest?.abort();$('#messages').innerHTML='';renderSuggestions(false);return}
  if(resetChat)startConversation(work);
}

function bindViewer(){
  $('#zoomIn').addEventListener('click',()=>setScale(state.scale+.25));
  $('#zoomOut').addEventListener('click',()=>setScale(state.scale-.25));
  $('#resetView').addEventListener('click',resetView);
  $('#fullscreen').addEventListener('click',()=>document.fullscreenElement?document.exitFullscreen():$('#artViewport').requestFullscreen?.());
  const viewport=$('#artViewport');
  viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;state.drag={px:e.clientX,py:e.clientY,x:state.x,y:state.y,moved:false};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging')});
  viewport.addEventListener('pointermove',e=>{if(!state.drag)return;if(Math.hypot(e.clientX-state.drag.px,e.clientY-state.drag.py)>5)state.drag.moved=true;if(state.scale===1)return;state.x=state.drag.x+e.clientX-state.drag.px;state.y=state.drag.y+e.clientY-state.drag.py;applyView()});
  const end=e=>{const clickToZoom=state.drag&&!state.drag.moved&&e?.target=== $('#detailImage');state.drag=null;viewport.classList.remove('dragging');if(clickToZoom){if(state.scale===1)setScale(2);else resetView()}};
  viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
}
function setScale(value){state.scale=Math.max(1,Math.min(4,value));if(state.scale===1){state.x=0;state.y=0}applyView()}
function resetView(){state.scale=1;state.x=0;state.y=0;applyView()}
function applyView(){$('#detailImage').style.transform=`translate(${state.x}px,${state.y}px) scale(${state.scale})`;$('#zoomValue').textContent=`${Math.round(state.scale*100)}%`;$('#artViewport').classList.toggle('zoomed',state.scale>1)}

function bindChat(){
  $('#chatForm').addEventListener('submit',e=>{e.preventDefault();askQuestion($('#chatInput').value)});
  $('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.currentTarget.form.requestSubmit()}});
  $('#clearChat').addEventListener('click',()=>startConversation(works[state.current]));
  $('#closeSources').addEventListener('click',closeSources);$('#sourceBackdrop').addEventListener('click',closeSources);
}

function renderSuggestions(show=true){const box=$('#suggestions');box.innerHTML='';const suggestions=works[state.current]?.suggestions||[];if(!show)return;suggestions.slice(0,2).forEach(q=>{const b=document.createElement('button');b.textContent=q;b.addEventListener('click',()=>askQuestion(q));box.appendChild(b)})}

function fallbackEvidence(work){
  return [{type:'馆藏记录',title:`芝加哥艺术博物馆：《${work.title}》`,summary:work.fact,url:work.source}];
}

function addMessage(role,text,disclosure='基于艺术家书信与生平资料塑造，并非艺术家原话。',evidence=[]){
  const node=document.createElement('div');node.className=`message ${role}`;
  const evidenceButton=evidence.length?`<button class="evidence-button">查看依据 · ${evidence.length} ↗</button>`:'';
  node.innerHTML=role==='user'?`<small>你</small><p>${escapeHtml(text)}</p>`:`<span class="eye-avatar msg-eye"><img src="${eyeImage}" alt=""></span><b>VAN GOGH</b><p>${escapeHtml(text)}</p><div class="evidence-row"><span>${escapeHtml(disclosure)}</span>${evidenceButton}</div>`;
  node.querySelector('.evidence-button')?.addEventListener('click',()=>openSources(evidence));$('#messages').appendChild(node);$('#messages').scrollTop=$('#messages').scrollHeight;
}

function addTyping(){const typing=document.createElement('div');typing.className='typing';typing.innerHTML='<i></i><i></i><i></i>';$('#messages').appendChild(typing);$('#messages').scrollTop=$('#messages').scrollHeight;return typing}

async function requestDialogue(payload){
  state.chatRequest?.abort();state.chatRequest=new AbortController();
  const response=await fetch('/api/dialogue',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),signal:state.chatRequest.signal});
  const result=await response.json();if(!response.ok)throw new Error(result.error||'AI 对话暂时不可用');return result;
}

async function startConversation(work){
  if(!work?.dialogueEnabled)return;
  state.chatRequest?.abort();state.conversation=[];$('#messages').innerHTML='';renderSuggestions(false);const typing=addTyping();
  try{
    const result=await requestDialogue({artistId:'van-gogh',artworkId:work.id,mode:'introduction',history:[]});
    typing.remove();addMessage('assistant',result.answer,result.disclosure,result.evidence||[]);state.conversation.push({role:'assistant',content:result.answer});
  }catch(error){
    typing.remove();if(error.name==='AbortError')return;addMessage('assistant',work.greeting,'AI 未连接，当前显示本地备用开场。',fallbackEvidence(work));toast(error.message);
    state.conversation.push({role:'assistant',content:work.greeting});
  }
}

async function askQuestion(question){
  if(!works[state.current]?.dialogueEnabled)return;
  const clean=String(question||'').trim();if(!clean)return;addMessage('user',clean);$('#chatInput').value='';renderSuggestions(false);
  const history=state.conversation.slice(-8);state.conversation.push({role:'user',content:clean});const typing=addTyping();
  try{
    const result=await requestDialogue({artistId:'van-gogh',artworkId:works[state.current].id,mode:'dialogue',message:clean,history});
    typing.remove();addMessage('assistant',result.answer,result.disclosure,result.evidence||[]);state.conversation.push({role:'assistant',content:result.answer});renderSuggestions(true);
  }catch(error){
    typing.remove();if(error.name==='AbortError')return;state.conversation.pop();addMessage('assistant','我现在没能好好回答你。可以稍后再问一次。','AI 对话请求失败。');toast(error.message);
  }
}

function openSources(evidence=[]){
  $('#sourceCount').textContent=`SOURCES / ${String(evidence.length).padStart(2,'0')}`;
  const list=$('#sourceList');list.innerHTML='';
  evidence.forEach(source=>{
    const article=document.createElement('article');
    const link=source.url?`<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">查看原始资料 ↗</a>`:'';
    article.innerHTML=`<em>${escapeHtml(source.type||'资料')}</em><b>${escapeHtml(source.title||'回答依据')}</b><p>${escapeHtml(source.summary||'')}</p>${link}`;
    list.appendChild(article);
  });
  $('#sourceDrawer').classList.add('open');$('#sourceBackdrop').classList.add('open');
}
function closeSources(){$('#sourceDrawer').classList.remove('open');$('#sourceBackdrop').classList.remove('open')}

function initGlobe(){
  const host=$('#globe');
  const statusText=museum=>museum.status==='today'?"TODAY'S MUSEUM · 今日推荐":museum.status==='open'?'OPEN COLLECTION · 已开放':'COMING SOON · 即将开放';
  const updateMuseumCard=museum=>{
    state.globeSelection=museum;
    $('#globeMuseumStatus').textContent=statusText(museum);
    $('#globeMuseumName').textContent=museum.name;
    $('#globeMuseumCity').textContent=`${museum.city} · ${museum.country}`;
    $('#globeMuseumWorks').textContent=museum.works;
    $('#globeMuseumArtists').textContent=museum.artists;
    $('#globeRegionName').textContent=museum.region;
    const regionMuseums=globeMuseums.filter(item=>item.region===museum.region);
    $('#globeOpenCount').textContent=regionMuseums.filter(item=>item.museumId).length;
    $('#globeIndexedCount').textContent=regionMuseums.length;
    const action=$('#globeMuseumAction');action.disabled=!museum.museumId;action.textContent=museum.museumId?'进入馆藏画廊　→':'馆藏即将开放';
    $('#selectedMuseumEyebrow').textContent=museum.status==='today'?"TODAY'S MUSEUM / 01":'CURRENT EXPLORATION / 当前探索';
    $('#selectedMuseumName').textContent=museum.name;
    $('#selectedMuseumOfficialName').textContent=museum.officialName;
    const location=$('#selectedMuseumLocation');location.textContent=`${museum.city} · ${museum.country}`;location.href=museum.website;
    $('#selectedMuseumType').textContent=`${museum.type} · ${museum.museumId?'数字馆藏已开放':'资料已收录'}`;
    $('#selectedMuseumDescription').textContent=museum.description;
    const image=$('#selectedMuseumImage');image.src=museum.featureImage;image.alt=`${museum.name}馆藏亮点：${museum.featureTitle}`;
    $('#selectedMuseumFeatureLabel').textContent=museum.status==='today'?'今日推荐':'馆藏亮点';
    $('#selectedMuseumFeatureTitle').textContent=museum.featureTitle;
    $('#selectedMuseumFeatureMeta').textContent=museum.featureMeta;
    $('#selectedMuseumAvailability').textContent=museum.museumId?`精选馆藏已上线 · ${museum.works} 件作品 · ${museum.artists} 位艺术家`:'CANVAS 资料已收录 · 数字馆藏整理中';
    const enter=$('#enterGallery');enter.disabled=!museum.museumId;enter.innerHTML=museum.museumId?'探索馆藏 <span>→</span>':'数字馆藏即将开放';
    const official=$('#selectedMuseumOfficial');official.href=museum.website;official.setAttribute('aria-label',`访问${museum.name}官方网站`);
    $$('.globe-marker').forEach(tag=>tag.classList.toggle('selected',tag.dataset.museumId===museum.id));
    state.layoutGlobeLabels?.();
  };
  updateMuseumCard(globeMuseums[0]);
  $('#globeMuseumAction').addEventListener('click',async()=>{
    const museum=state.globeSelection;if(!museum?.museumId)return;
    await switchMuseum(museum.museumId);state.page=2;transitionToGallery();
  });
  if(typeof window.Globe!=='function'){host.classList.add('fallback-active');return}
  host.innerHTML='';
  const size=()=>innerWidth<720?820:1200;
  try{
    state.globeBase=size();
    host.style.width=host.style.height=`${state.globeBase}px`;
    const applyMarkerOffset=(marker,offsetX=0,offsetY=0)=>{
      marker.style.setProperty('--label-x',`${offsetX}px`);marker.style.setProperty('--label-y',`${offsetY}px`);
    };
    let markerLayoutFrame=0;
    const scheduleMarkerLayout=()=>{
      cancelAnimationFrame(markerLayoutFrame);
      markerLayoutFrame=requestAnimationFrame(()=>{markerLayoutFrame=requestAnimationFrame(()=>{
        const markers=$$('.globe-marker');
        markers.forEach(marker=>applyMarkerOffset(marker,0,0));
        const viewportWidth=document.documentElement.clientWidth;
        const viewportHeight=innerHeight;
        markers.forEach(marker=>{
          const label=marker.querySelector('.globe-marker-label');const dot=marker.querySelector('.globe-marker-dot');
          const dotRect=dot.getBoundingClientRect();
          if(!dotRect.width||getComputedStyle(marker).display==='none')return;
          const anchorX=dotRect.left+dotRect.width/2;const anchorY=dotRect.top+dotRect.height/2;
          if(!marker.classList.contains('selected'))return;
          const labelRect=label.getBoundingClientRect();
          const showOnRight=anchorX+labelRect.width+34<viewportWidth;
          let offsetX=(labelRect.width/2+17)*(showOnRight?1:-1);let offsetY=-18;
          applyMarkerOffset(marker,offsetX,offsetY);
          const adjusted=label.getBoundingClientRect();
          offsetX+=Math.max(10-adjusted.left,Math.min(0,viewportWidth-10-adjusted.right));
          offsetY+=Math.max(96-adjusted.top,Math.min(0,viewportHeight-12-adjusted.bottom));
          applyMarkerOffset(marker,offsetX,offsetY);
        });
      })});
    };
    state.layoutGlobeLabels=scheduleMarkerLayout;
    const globe=window.Globe()(host)
      .width(state.globeBase).height(state.globeBase)
      .backgroundColor('rgba(0,0,0,0)')
      .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg')
      .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
      .showAtmosphere(true).atmosphereColor('#a7aaa7').atmosphereAltitude(.08)
      .htmlElementsData(globeMuseums).htmlLat('lat').htmlLng('lng').htmlAltitude(.012).htmlElement(d=>{
        const marker=document.createElement('button');marker.type='button';marker.dataset.museumId=d.id;marker.className=`globe-marker ${d.status}${state.globeSelection?.id===d.id?' selected':''}`;
        applyMarkerOffset(marker);
        marker.innerHTML=`<span class="globe-marker-callout"><span class="globe-marker-dot" aria-hidden="true"></span><span class="globe-marker-label">${d.name}</span></span>`;marker.title=d.name;
        marker.addEventListener('pointerdown',event=>event.stopPropagation());
        marker.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();updateMuseumCard(d);globe.pointOfView({lat:d.lat,lng:d.lng,altitude:1.72},760)});
        return marker;
      })
      .htmlElementVisibilityModifier((marker,isFacingCamera)=>{
        const wasFacingCamera=marker.dataset.frontVisible==='true';
        marker.dataset.frontVisible=String(isFacingCamera);
        marker.style.display=isFacingCamera?'block':'none';
        marker.disabled=!isFacingCamera;
        marker.setAttribute('aria-hidden',String(!isFacingCamera));
        if(isFacingCamera!==wasFacingCamera)scheduleMarkerLayout();
      });
    globe.pointOfView({lat:30,lng:-72,altitude:1.72},0);
    const controls=globe.controls();controls.autoRotate=false;controls.enableZoom=false;controls.enablePan=false;controls.minPolarAngle=.35;controls.maxPolarAngle=Math.PI-.35;
    controls.addEventListener('change',scheduleMarkerLayout);
    state.globe=globe;
    updateGlobeTransition();
    scheduleMarkerLayout();
    setTimeout(scheduleMarkerLayout,420);
    document.fonts?.ready.then(scheduleMarkerLayout);
    const markerResizeObserver=new ResizeObserver(scheduleMarkerLayout);
    setTimeout(()=>$$('.globe-marker-label').forEach(label=>markerResizeObserver.observe(label)),0);
    addEventListener('resize',()=>{state.globeBase=size();host.style.width=host.style.height=`${state.globeBase}px`;globe.width(state.globeBase).height(state.globeBase);updateGlobeTransition();scheduleMarkerLayout()});
  }catch(error){host.classList.add('fallback-active');console.warn('Globe fallback enabled',error)}
}

function initReveals(){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.2});$$('.reveal').forEach(el=>io.observe(el))}
function toast(message){clearTimeout(state.toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');state.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2200)}
function escapeHtml(text){return String(text??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

init();
