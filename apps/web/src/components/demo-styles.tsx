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
        .recommendation-main>span,.artist-card-heading span,.artist-card-actions>p small,.globe-home-caption .globe-home-museum b,.globe-home-caption .globe-home-museum small,.globe-marker-label,.globe-marker-label small{font-size:12px!important;line-height:1.35}
        .wordmark,.recommendation-card h2,.home-hero .glass-card h1,.globe-home-caption strong{font-family:'Otomanopee One',var(--font-body-zh),'PingFang SC',sans-serif}
        .globe-home-caption strong{font-size:clamp(92px,11.2vw,180px)!important}
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
        .home-hero .recommendation-card,.home-hero .glass-card{border-radius:20px}.home-hero .globe-home-caption{display:block}
        .search-pill{display:flex;align-items:baseline;gap:6px}.search-pill small{font-size:9px;letter-spacing:.08em;opacity:.62}.search-pill b{font-weight:400}
        .home-hero .daily-art{background:transparent;box-shadow:0 8px 20px rgba(25,22,18,.16)}.home-hero .daily-art>img{object-fit:contain}
        .home-hero .daily-caption{position:absolute;z-index:2;left:16px;bottom:16px;display:grid;gap:5px;max-width:calc(100% - 32px);color:#fff;padding:0;text-align:left;text-shadow:0 1px 10px rgba(0,0,0,.9)}
        .home-hero .daily-caption strong{display:flex;align-items:baseline;gap:8px;font:500 21px/1.05 var(--serif)}.home-hero .daily-caption strong i{font:500 11px/1 var(--sans);letter-spacing:.07em}.home-hero .daily-caption small{font:500 13px/1.35 var(--sans);letter-spacing:.025em}
        .home-hero .art-history figure{overflow:visible;box-shadow:none;background:transparent}.home-hero .art-history figure img{display:block;box-shadow:none}
        .home-hero .art-history figcaption{display:grid;gap:6px;margin-top:11px;text-align:left}.home-hero .art-history figcaption strong{display:grid;gap:4px;font:500 18px/1.15 var(--serif)}.home-hero .art-history figcaption strong small{color:#585550;font:500 11px/1.25 var(--sans);letter-spacing:.05em}.home-hero .art-history figcaption>span{color:#6f6c67;font:500 12px/1.4 var(--sans);letter-spacing:.02em}
        .home-hero .artist-entry{right:3.5vw;width:30.5vw;max-width:none;height:52.7vh;min-height:0;grid-template-rows:minmax(0,.82fr) minmax(0,1.18fr);gap:18px}
        .home-hero .recommendation-card,.home-hero .glass-card{height:100%;min-height:0}
        .home-hero .recommendation-details{gap:4px}.home-hero .recommendation-details strong{font-size:17px!important;line-height:1.25}.home-hero .recommendation-details span{font-size:15px!important;line-height:1.35}.home-hero .recommendation-details small{font-size:12px!important;line-height:1.35}
        .home-hero .artist-card-actions>p{font-size:17px;font-weight:400}.home-hero .artist-card-actions>p small{font-size:12px!important}.home-hero .prompt-line{display:grid;grid-template-columns:auto 1fr auto;align-items:baseline;gap:7px;font-size:15px;font-weight:400}.home-hero .prompt-line small{font-size:9px;letter-spacing:.06em}.home-hero .prompt-line i{float:none}.home-hero .primary-wide{font-size:14px}
        .home-globe-focus .globe-marker.selected{z-index:20}.home-globe-focus .globe-marker.selected .globe-marker-dot{top:-6px;left:-6px;width:12px;height:12px;border-width:2px;background:#f5f1e9;box-shadow:0 0 0 5px rgba(245,241,233,.14),0 2px 7px rgba(0,0,0,.38)}.home-globe-focus .globe-marker.selected .globe-marker-line{display:block;position:absolute;z-index:2;left:7px;top:-1px;width:48px;height:1px;background:rgba(245,241,233,.88);box-shadow:0 1px 2px rgba(0,0,0,.32)}.shared-globe.home-globe-focus .globe-marker.selected .globe-marker-label{display:flex!important;left:55px;top:-20px;min-width:270px;min-height:40px;justify-content:flex-start;gap:5px;border:0!important;background:transparent!important;color:#f5f1e9;padding:4px 0;box-shadow:none!important;text-shadow:0 2px 7px rgba(0,0,0,.9);font-size:16px!important;line-height:1.2!important;transform:none!important}.home-globe-focus .globe-marker.selected .globe-marker-label small{color:#e2ded6;font-size:11px!important;line-height:1.2!important;letter-spacing:.055em}
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
        @media(min-width:721px){.home-hero .daily-art{left:40%;width:calc(52.7vh * .794);max-width:24vw}}
        @media(max-width:720px){
          .home-hero{min-height:1080px}.home-hero .artist-entry{left:7%;right:auto;top:548px;width:86%;max-width:none;height:auto;min-height:0;grid-template-rows:164px 252px;gap:16px}.recommendation-card{height:164px;padding:18px 20px}.home-hero .glass-card{height:252px;padding:18px 20px 14px}.home-hero .glass-card h1{font-size:32px}.globe-home-caption{display:block}.home-hero .globe-home-caption strong{font-size:clamp(52px,15vw,74px)!important}.home-hero .daily-caption{left:12px;bottom:12px}.home-hero .daily-caption strong{font-size:18px}.home-hero .daily-caption small{font-size:11px}.home-globe-focus .globe-marker.selected .globe-marker-label{min-width:220px;font-size:13px!important}.home-globe-focus .globe-marker.selected .globe-marker-label small{font-size:9px!important}
          .museum-detail-hero{top:88px;left:18px;right:18px}.museum-title-block h1{max-width:350px;font-size:clamp(45px,12.4vw,54px);line-height:.9;letter-spacing:-.05em}.museum-title-block>a{margin-top:15px;font-size:10px}.museum-introduction{padding-top:24px}.museum-introduction-en{font-size:17px;line-height:1.22}.museum-introduction-zh{margin-top:12px!important;font-size:13px;line-height:1.7}.collection-marquee{top:53%;height:31vh}.artwork-marquee-item{--item-height:clamp(180px,24vh,220px)}.artwork-marquee-item.portrait{--item-height:clamp(210px,28vh,255px)}.artwork-marquee-item.wide{--item-height:clamp(168px,22vh,205px)}
          .artwork-view{position:relative;inset:auto;height:auto;min-height:100svh;overflow:visible;padding:1px 0 48px}.back-gallery{position:absolute;top:18px;left:18px}.art-pane{position:relative;inset:auto;width:calc(100% - 36px);height:min(54svh,520px);margin:82px 18px 0;transform:none}.dialogue-pane{position:relative;inset:auto;width:auto;height:auto;margin:24px 18px 0}.artwork-summary h1{font-size:clamp(38px,12vw,48px);line-height:.94}.artwork-original-title{font-size:18px}.artist-meta b{font-size:13px}.artwork-introduction{display:block;max-width:none;margin:14px 0;font-size:14px!important;line-height:1.7;-webkit-line-clamp:unset;overflow:visible}.artwork-quick-facts{grid-template-columns:1fr;gap:12px;padding:14px 0}.artwork-quick-facts dd{overflow:visible;text-overflow:clip}.conversation-title{margin-top:4px;padding:14px 0 10px}.ai-unavailable{min-height:0;overflow:visible;padding:22px 0 18px}.ai-unavailable section{max-width:none;width:100%;padding:0 0 22px}.ai-unavailable h2{font-size:28px;line-height:1.18}.observation-prompts{margin-top:0;padding-top:18px}.viewer-controls{max-width:calc(100% - 16px);height:44px;padding:0 6px;white-space:nowrap}.viewer-controls button{padding:0 8px!important}.viewer-controls span{width:50px}
        }
        @media(prefers-reduced-motion:reduce){.skeleton{animation:none}.home-hero .daily-art,.home-hero .art-history,.home-hero .artist-entry{transform:none;transition:none}.collection-tools summary,.collection-tools form{backdrop-filter:none}}
      `}</style>
    </>
  );
}
