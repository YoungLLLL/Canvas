/* eslint-disable @next/next/no-css-tags */
export function DemoStyles() {
  return (
    <>
      <link rel="stylesheet" href="/demo/original.css" />
      <style>{`
        @font-face{font-family:'Otomanopee One';src:url('/fonts/otomanopee-one-v11.ttf') format('truetype');font-style:normal;font-weight:400;font-display:swap}
        :root{--title:'Otomanopee One',var(--font-display-zh),'Noto Serif SC','Songti SC',serif;--serif:var(--font-display),'Cormorant Garamond',var(--font-display-zh),'Noto Serif SC','Songti SC',serif;--sans:var(--font-body-zh),'Noto Sans SC','PingFang SC',sans-serif}
        .site-header nav a{display:flex;align-items:baseline;gap:7px;white-space:nowrap;color:inherit;text-decoration:none;font-size:15px}
        .site-header nav a small,.site-header nav button small{color:#77746f;font-size:12px;font-weight:400;letter-spacing:.07em}
        .site-actions{display:flex;align-items:center;justify-self:end;gap:15px}.site-actions>a:first-child{font-size:12px;letter-spacing:.07em;text-decoration:none}
        #globe canvas,.shared-globe.home-globe-focus canvas{filter:none!important}
        .side-label,.today-note b,.today-note span,.recommendation-main>span,.recommendation-details strong,.recommendation-details span,.recommendation-details small,.artist-card-heading span,.artist-card-actions>p small,.globe-home-caption .globe-home-museum b,.globe-home-caption .globe-home-museum small,.globe-marker-label,.globe-marker-label small{font-size:12px!important;line-height:1.35}
        .wordmark,.recommendation-card h2,.home-hero .glass-card h1,.globe-home-caption strong{font-family:'Otomanopee One',var(--font-body-zh),'PingFang SC',sans-serif}
        .globe-home-caption strong{font-size:clamp(74px,8.8vw,128px)!important}
        .home-hero .prompt-line{font-size:14px}.home-hero .primary-wide{font-size:14px}.home-hero .primary-wide small{font-size:12px}
        .overline,.museum-copy>a,.museum-feature small,.museum-feature em,.museum-type,.drag-cue,.globe-legend,.region-stats{font-size:12px!important;line-height:1.45}
        .museum-copy>p{font-size:16px!important;font-weight:400}.museum-feature span{font-size:16px!important}.official{font-size:14px!important}
        .museum-title-block>p,.museum-title-block>a,.artwork-open-pill,.artwork-hover-detail p,.artwork-hover-detail span,.gallery-instruction{font-size:12px!important;line-height:1.4}
        .home-hero{--pointer-x:0;--pointer-y:0}.home-hero .daily-art{transform:translate3d(calc(var(--pointer-x) * 7px),calc(var(--pointer-y) * 5px),0);transition:transform 420ms cubic-bezier(.2,.8,.2,1),box-shadow 260ms}.home-hero .art-history{transform:translate3d(calc(var(--pointer-x) * -4px),calc(var(--pointer-y) * -3px),0);transition:transform 480ms cubic-bezier(.2,.8,.2,1)}.home-hero .artist-entry{transform:translate3d(calc(var(--pointer-x) * -5px),calc(var(--pointer-y) * -4px),0);transition:transform 520ms cubic-bezier(.2,.8,.2,1)}
        body:has(.demo-faithful) #siteHeader,body:has(.artwork-view) #siteHeader{opacity:0;pointer-events:none}
        .ai-unavailable{display:flex;align-items:center;overflow:auto;padding:18px 4px 14px 0}
        .ai-unavailable section{max-width:36rem;padding:18px 0;border-bottom:1px solid #d7d2ca}
        .ai-status-label{display:block;margin-bottom:12px;color:#77746f;font-size:12px;letter-spacing:.07em}
        .ai-unavailable h2{max-width:28rem;margin:0 0 12px;font:500 clamp(24px,2.2vw,36px)/1.04 var(--serif);letter-spacing:-.025em}
        .ai-unavailable p{max-width:34rem;margin:0 0 18px;color:#57534d;font:400 14px/1.7 var(--sans)}
        .ai-unavailable .evidence-button{font-size:12px}
        .loading,.artwork-detail-index,.artwork-quick-facts dt,.artwork-quick-facts dd,.conversation-title,.source-drawer>span,.source-drawer article em,.source-drawer article a,.viewer-controls button,.viewer-controls span{font-size:12px!important;line-height:1.45}.artwork-introduction,.source-drawer article p{font-size:14px!important;font-weight:400}
        .observation-prompts{flex:none;margin-top:auto;padding:14px 0 2px;border-top:1px solid #d0ccc5}
        .observation-prompts>span{display:block;margin-bottom:8px;color:#77746f;font-size:12px;letter-spacing:.04em}
        .observation-prompts ul{display:grid;gap:7px;margin:0;padding-left:18px;font:400 13px/1.5 var(--sans)}
        .artwork-marquee-item img{object-fit:contain;background:#ddd8cf}
        .metadata-artwork-card,.metadata-artwork-card figure{background:#ded9d0}
        .metadata-artwork-content{display:flex;width:100%;height:100%;flex-direction:column;justify-content:space-between;padding:22px;color:#282725}
        .metadata-artwork-content small{font-size:12px;letter-spacing:.07em;text-transform:uppercase}
        .metadata-artwork-content strong{font:500 clamp(19px,2vw,30px)/1.02 var(--serif)}
        .metadata-artwork-content>span{font-size:12px;color:#67635d}
        .artwork-no-image{display:flex;width:100%;height:100%;align-items:center;justify-content:center;flex-direction:column;padding:28px;text-align:center}
        .artwork-no-image span{color:#77746f;font-size:12px;letter-spacing:.07em}
        .artwork-no-image strong{margin-top:12px;font:500 clamp(22px,3vw,38px)/1 var(--serif)}
        .artwork-no-image p{max-width:380px;margin:13px 0 0;color:#625f59;font:400 14px/1.65 var(--sans)}
        .collection-tools{position:absolute;z-index:12;top:96px;right:3vw;width:min(340px,calc(100vw - 36px));font-family:var(--sans)}
        .collection-tools summary{display:flex;width:max-content;min-height:40px;align-items:center;margin-left:auto;border:1px solid rgba(13,14,13,.35);border-radius:999px;background:rgba(247,244,238,.86);padding:0 16px;backdrop-filter:blur(14px);cursor:pointer;font-size:12px;letter-spacing:.05em;list-style:none}
        .collection-tools summary::-webkit-details-marker{display:none}
        .collection-tools[open] summary{background:#0d0e0d;color:#fff}
        .collection-tools form{margin-top:10px;border:1px solid rgba(13,14,13,.18);background:rgba(247,244,238,.96);box-shadow:0 18px 45px rgba(25,22,18,.12);padding:18px;backdrop-filter:blur(18px)}
        .collection-tools label{display:grid;gap:5px;color:#716d67;font-size:12px;letter-spacing:.04em;text-transform:uppercase}
        .collection-tools input,.collection-tools select{width:100%;min-width:0;height:38px;border:0;border-bottom:1px solid #bdb8b0;border-radius:0;background:transparent;color:#0d0e0d;outline:0;font-size:14px;text-transform:none}
        .collection-tools-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px 16px;margin-top:14px}
        .collection-tools-actions{display:flex;align-items:center;justify-content:flex-end;gap:14px;margin-top:18px}
        .collection-tools-actions a{color:#716d67;font-size:12px;text-underline-offset:3px}
        .collection-tools-actions button{min-height:38px;border:0;border-radius:999px;background:#0d0e0d;color:#fff;padding:0 17px;cursor:pointer;font-size:12px}
        .collection-pagination{position:absolute;z-index:8;right:3vw;bottom:3.1vh;display:grid;grid-template-columns:30px auto 30px;align-items:center;gap:10px;color:#5d5953;font-family:var(--sans)}
        .collection-pagination>a,.collection-pagination>span{display:grid;width:30px;height:30px;place-items:center;border:1px solid rgba(13,14,13,.22);border-radius:50%;text-decoration:none}
        .collection-pagination i{opacity:.28;font-style:normal}
        .collection-pagination p{display:flex;align-items:baseline;gap:8px;margin:0}
        .collection-pagination strong{font:500 16px/1 var(--serif)}
        .collection-pagination small{font-size:12px;letter-spacing:.03em}
        .gallery-view:has(.collection-pagination) .gallery-instruction{right:auto;left:3vw}
        .artwork-hover-detail.visible+.gallery-instruction{opacity:0}
        .marquee-motion-toggle{position:absolute;z-index:9;right:3vw;bottom:8.2vh;border:0;border-bottom:1px solid rgba(13,14,13,.38);background:transparent;color:#6e6a64;padding:4px 0;cursor:pointer;font:500 12px/1 var(--sans);letter-spacing:.04em;text-transform:uppercase}
        .collection-gallery-loading .loading-kicker{width:90px;height:9px}
        .collection-gallery-loading .loading-title{width:min(620px,74vw);height:clamp(112px,14vw,190px);margin-top:14px}
        .collection-gallery-loading .loading-copy{width:100%;height:30px}.collection-gallery-loading .loading-copy.short{width:72%;height:16px;margin-top:14px}
        .loading-marquee{gap:2.1vw}.loading-artwork{flex:none;width:22vw;height:28vh;min-width:210px;min-height:220px}.loading-artwork-2,.loading-artwork-4{width:17vw;height:34vh}.loading-artwork-3{width:28vw;height:25vh}
        @media(max-width:720px){.site-actions{gap:9px}.ai-unavailable{min-height:150px}.ai-unavailable section{padding:8px 4px 14px}.ai-unavailable h2{font-size:24px}.observation-prompts{margin-top:0}}
        @media(max-width:720px){.collection-tools{top:78px;right:18px}.collection-tools form{padding:15px}.collection-pagination{right:18px;bottom:24px}.collection-pagination small{display:none}.gallery-instruction{left:18px!important;right:auto}.marquee-motion-toggle{right:18px;bottom:66px}.loading-marquee{gap:18px}.loading-artwork{min-width:170px;width:44vw}.loading-artwork-2,.loading-artwork-4{width:36vw}}
        /* Stage 8 layout convergence: one final geometry layer for the Demo-derived routes. */
        .home-hero .recommendation-card,.home-hero .glass-card{border-radius:20px}.home-hero .globe-home-caption{display:none}
        .museum-detail-hero{top:118px;grid-template-columns:minmax(0,1.08fr) minmax(360px,.92fr);gap:clamp(48px,6vw,96px)}
        .museum-title-block h1{font-size:clamp(64px,7vw,108px);line-height:.86;letter-spacing:-.055em}
        .museum-introduction{max-width:580px;padding-top:48px}
        .museum-introduction-en{font-size:clamp(20px,1.65vw,27px);line-height:1.12}
        .museum-introduction-zh{max-width:540px;font-size:15px;line-height:1.75}
        .collection-marquee{top:51%;height:35vh}
        .collection-marquee-set{gap:24px;padding-right:24px}
        .gallery-instruction,.collection-pagination{bottom:28px}
        .marquee-motion-toggle{bottom:68px}
        @media(max-width:1050px) and (min-width:721px){.museum-detail-hero{grid-template-columns:minmax(0,1fr) minmax(330px,.9fr)}.museum-title-block h1{font-size:clamp(58px,7vw,84px)}}
        @media(max-width:720px){
          .home-hero{min-height:1080px}.home-hero .artist-entry{top:548px;gap:16px}.recommendation-card{height:164px;padding:18px 20px}.home-hero .glass-card{height:238px;padding:18px 20px 14px}.home-hero .glass-card h1{font-size:32px}.globe-home-caption{display:none}
          .museum-detail-hero{top:88px;left:18px;right:18px}.museum-title-block h1{max-width:350px;font-size:clamp(45px,12.4vw,54px);line-height:.9;letter-spacing:-.05em}.museum-title-block>a{margin-top:15px;font-size:10px}.museum-introduction{padding-top:24px}.museum-introduction-en{font-size:17px;line-height:1.22}.museum-introduction-zh{margin-top:12px!important;font-size:13px;line-height:1.7}.collection-marquee{top:53%;height:31vh}.artwork-marquee-item{--item-height:clamp(180px,24vh,220px)}.artwork-marquee-item.portrait{--item-height:clamp(210px,28vh,255px)}.artwork-marquee-item.wide{--item-height:clamp(168px,22vh,205px)}
          .artwork-view{position:relative;inset:auto;height:auto;min-height:100svh;overflow:visible;padding:1px 0 48px}.back-gallery{position:absolute;top:18px;left:18px}.art-pane{position:relative;inset:auto;width:calc(100% - 36px);height:min(54svh,520px);margin:82px 18px 0;transform:none}.dialogue-pane{position:relative;inset:auto;width:auto;height:auto;margin:24px 18px 0}.artwork-summary h1{font-size:clamp(38px,12vw,48px);line-height:.94}.artwork-original-title{font-size:18px}.artist-meta b{font-size:13px}.artwork-introduction{display:block;max-width:none;margin:14px 0;font-size:14px!important;line-height:1.7;-webkit-line-clamp:unset;overflow:visible}.artwork-quick-facts{grid-template-columns:1fr;gap:12px;padding:14px 0}.artwork-quick-facts dd{overflow:visible;text-overflow:clip}.conversation-title{margin-top:4px;padding:14px 0 10px}.ai-unavailable{min-height:0;overflow:visible;padding:22px 0 18px}.ai-unavailable section{max-width:none;width:100%;padding:0 0 22px}.ai-unavailable h2{font-size:28px;line-height:1.18}.observation-prompts{margin-top:0;padding-top:18px}.viewer-controls{max-width:calc(100% - 16px);height:44px;padding:0 6px;white-space:nowrap}.viewer-controls button{padding:0 8px!important}.viewer-controls span{width:50px}
        }
        @media(prefers-reduced-motion:reduce){.skeleton{animation:none}.home-hero .daily-art,.home-hero .art-history,.home-hero .artist-entry{transform:none;transition:none}.collection-tools summary,.collection-tools form{backdrop-filter:none}}
      `}</style>
    </>
  );
}
