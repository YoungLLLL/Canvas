/* eslint-disable @next/next/no-css-tags */
export function DemoStyles() {
  return (
    <>
      <link rel="stylesheet" href="/demo/original.css" />
      <style>{`
        @font-face{font-family:'Otomanopee One';src:url('/fonts/otomanopee-one-v11.ttf') format('truetype');font-style:normal;font-weight:400;font-display:swap}
        :root{--title:'Otomanopee One',var(--font-body-zh),'Noto Sans SC',sans-serif;--serif:var(--font-display),'Cormorant Garamond',var(--font-body-zh),'Noto Sans SC',sans-serif;--sans:var(--font-body-zh),'Noto Sans SC',sans-serif}
        html:has(.collection-experience){scroll-snap-type:none}
        .site-header nav a{display:flex;align-items:baseline;gap:7px;white-space:nowrap;color:inherit;text-decoration:none;font-size:15px}
        .site-header nav a small,.site-header nav button small{color:#77746f;font-size:12px;font-weight:400;letter-spacing:.07em}
        .site-actions{display:flex;align-items:center;justify-self:end;gap:15px}.site-actions>a:first-child{font-size:12px;letter-spacing:.07em;text-decoration:none}
        #globe canvas,.shared-globe.home-globe-focus canvas{filter:none!important}
        .recommendation-main>span,.artist-card-heading span,.artist-card-actions>p small,.globe-home-caption .globe-home-museum b,.globe-home-caption .globe-home-museum small,.globe-marker-label,.globe-marker-label small{font-size:12px!important;line-height:1.35}
        .wordmark,.recommendation-card h2,.home-hero .glass-card h1,.globe-home-caption strong{font-family:'Otomanopee One',var(--font-body-zh),'Noto Sans SC',sans-serif}
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
        .collection-experience{height:auto!important;min-height:100svh;overflow:visible!important;background:#f7f4ee}
        .collection-featured-screen{position:relative;height:100svh;min-height:720px;overflow:hidden;scroll-snap-align:start;scroll-snap-stop:always}
        .collection-featured-screen .museum-introduction-localized{max-width:570px;margin:0;color:#343431;font:400 clamp(16px,1.28vw,19px)/1.72 var(--font-body-en),'Inter',var(--sans);letter-spacing:0}
        :lang(zh) .collection-featured-screen .museum-introduction-localized{font-family:var(--font-body-zh),'Noto Sans SC',sans-serif}
        .collection-featured-screen .artwork-marquee-item{opacity:1}
        .collection-scroll-cue{position:absolute;z-index:10;left:50%;bottom:25px;display:flex;min-height:44px;align-items:center;gap:13px;color:#4f4c47;font:500 12px/1 var(--sans);letter-spacing:.05em;text-decoration:none;transform:translateX(-50%)}
        .collection-scroll-cue i{font-size:19px;font-style:normal;transition:transform 180ms cubic-bezier(.2,.8,.2,1)}
        .collection-scroll-cue:hover i,.collection-scroll-cue:focus-visible i{transform:translateY(4px)}
        .collection-catalog-section{position:relative;min-height:100svh;padding:36px 3vw 72px;background:#f7f4ee;scroll-snap-align:none}
        .collection-experience.has-catalog-query .collection-featured-screen{display:none}
        .collection-catalog-heading{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(340px,.8fr);gap:clamp(48px,8vw,140px);align-items:end;padding-bottom:34px;border-bottom:1px solid rgba(13,14,13,.18)}
        .collection-catalog-heading p{margin:0;color:#706d67;font:500 12px/1.45 var(--sans);letter-spacing:.07em}
        .collection-catalog-heading h2{margin:13px 0 0;font:400 clamp(58px,7vw,108px)/.9 'Otomanopee One',var(--title)!important;letter-spacing:-.055em}
        :lang(zh) .collection-catalog-heading h2{font-family:var(--font-body-zh),'Noto Sans SC',sans-serif!important;font-weight:500!important;letter-spacing:-.045em}
        .collection-catalog-summary{display:grid;grid-template-columns:1fr auto;gap:8px 24px;align-items:end}
        .collection-catalog-summary>p{align-self:start}
        .collection-catalog-summary strong{grid-row:1/span 2;grid-column:2;display:flex;align-items:baseline;gap:7px;color:#0d0e0d;font:400 clamp(38px,4vw,64px)/.9 var(--serif)}
        .collection-catalog-summary strong small{color:#706d67;font:500 12px/1.4 var(--sans);letter-spacing:.04em}
        .collection-catalog-summary>a{width:max-content;color:#343431;font:500 12px/1.4 var(--sans);text-underline-offset:5px}
        .collection-catalog-filters{display:grid;grid-template-columns:minmax(220px,2fr) repeat(4,minmax(105px,1fr)) auto;gap:18px;align-items:end;padding:28px 0 30px}
        .collection-catalog-filters label{display:grid;gap:7px;color:#706d67;font:500 12px/1.35 var(--sans);letter-spacing:.045em}
        .collection-catalog-filters input,.collection-catalog-filters select{width:100%;min-width:0;height:44px;border:0;border-bottom:1px solid rgba(13,14,13,.34);border-radius:0;background:transparent;color:#0d0e0d;outline:0;font:400 14px/1 var(--sans)}
        .collection-catalog-filters input:focus,.collection-catalog-filters select:focus{border-bottom-color:#9a7142}
        .collection-catalog-actions{display:flex;height:44px;align-items:center;gap:14px}
        .collection-catalog-actions a{color:#706d67;font:500 12px/1 var(--sans);text-underline-offset:4px}
        .collection-catalog-actions button{height:44px;border:0;border-radius:999px;background:#0d0e0d;color:#fff;padding:0 19px;font:500 12px/1 var(--sans);white-space:nowrap}
        .collection-results-grid{display:flex;flex-wrap:wrap;align-items:flex-start;gap:44px 20px}
        .collection-flow-grid{min-height:100svh}
        .collection-results-grid:after{content:'';flex-basis:calc(2.2 * 230px);flex-grow:999}
        .collection-result-card{--result-ratio:1.2;position:relative!important;flex-basis:calc(var(--result-ratio) * 230px);flex-grow:var(--result-ratio);min-width:180px;max-width:560px;margin-top:0!important;color:#0d0e0d;text-decoration:none}
        .collection-result-card>figure{position:relative;width:100%;height:260px;max-height:none;aspect-ratio:auto;overflow:hidden;margin:0;background:#ddd7cd}
        .collection-result-card img{display:block;width:100%;height:100%;object-fit:contain;filter:none;transform:none!important;transition:opacity 180ms cubic-bezier(.2,.8,.2,1)}
        .collection-result-card:hover img,.collection-result-card:focus-visible img{opacity:.92}
        .collection-result-open{position:absolute;right:14px;bottom:14px;display:flex;min-height:36px;align-items:center;border-radius:999px;background:rgba(13,14,13,.86);color:#fff;padding:0 14px;font:500 11px/1 var(--sans);opacity:0;transform:translateY(5px);transition:opacity 180ms,transform 260ms cubic-bezier(.2,.8,.2,1)}
        .collection-result-card:hover .collection-result-open,.collection-result-card:focus-visible .collection-result-open{opacity:1;transform:none}
        .collection-result-card>.collection-result-copy{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 14px;padding-top:14px;border-top:1px solid rgba(13,14,13,.76)}
        .collection-result-copy h3{grid-column:1;display:flex;align-items:center;gap:7px;margin:0;overflow:hidden;font:500 clamp(16px,1.25vw,21px)/1.14 var(--font-body-zh),'Noto Sans SC',sans-serif!important;white-space:nowrap}
        .collection-result-title-text{min-width:0;overflow:hidden;text-overflow:ellipsis}
        .collection-result-title-status{flex:0 0 auto;border:1px solid currentColor;border-radius:999px;padding:2px 6px;color:#77736b;font:600 8px/1 var(--sans);letter-spacing:.06em}
        .collection-result-copy p{grid-column:1;margin:0;overflow:hidden;color:#706d67;font:400 11.5px/1.45 var(--sans);text-overflow:ellipsis;white-space:nowrap}
        .collection-result-copy>span{grid-column:2;grid-row:1/span 2;align-self:center;color:#706d67;font:500 11px/1.4 var(--sans)}
        .collection-result-placeholder{display:flex;height:100%;flex-direction:column;justify-content:space-between;padding:24px;color:#343431}
        .collection-result-placeholder small{font:500 12px/1.4 var(--sans);letter-spacing:.06em}
        .collection-result-placeholder strong{max-width:320px;font:500 clamp(22px,2.2vw,34px)/1.05 var(--font-body-zh),'Noto Sans SC',sans-serif}
        .collection-results-empty{display:grid;min-height:300px;place-items:center;border-top:1px solid rgba(13,14,13,.18);border-bottom:1px solid rgba(13,14,13,.18);text-align:center}
        .collection-results-empty h3{margin:0 0 18px;font:500 clamp(27px,3vw,44px)/1.05 var(--font-body-zh),'Noto Sans SC',sans-serif!important}
        .collection-results-empty a{color:#343431;font-size:13px;text-underline-offset:5px}
        .collection-catalog-section .collection-pagination{position:static;display:grid;width:max-content;grid-template-columns:44px auto 44px;gap:14px;margin:58px 0 0 auto}
        .collection-catalog-section .collection-pagination>a,.collection-catalog-section .collection-pagination>span{width:44px;height:44px}
        .collection-catalog-section .collection-pagination>span>a{display:grid;width:100%;height:100%;place-items:center;text-decoration:none}
        .collection-catalog-section .collection-pagination p{gap:7px}
        .collection-catalog-section .collection-pagination strong{font-size:18px}
        .collection-gallery-loading .loading-kicker{width:90px;height:9px}
        .collection-gallery-loading .loading-title{width:min(620px,74vw);height:clamp(112px,14vw,190px);margin-top:14px}
        .collection-gallery-loading .loading-copy{width:100%;height:30px}.collection-gallery-loading .loading-copy.short{width:72%;height:16px;margin-top:14px}
        .loading-marquee{gap:2.1vw}.loading-artwork{flex:none;width:22vw;height:28vh;min-width:210px;min-height:220px}.loading-artwork-2,.loading-artwork-4{width:17vw;height:34vh}.loading-artwork-3{width:28vw;height:25vh}
        @media(max-width:720px){.site-actions{gap:9px}.ai-unavailable{min-height:150px}.ai-unavailable section{padding:8px 4px 14px}.ai-unavailable h2{font-size:24px}.observation-prompts{margin-top:0}}
        @media(max-width:1050px){.collection-catalog-filters{grid-template-columns:2fr repeat(2,1fr)}.collection-catalog-search{grid-column:span 2}.collection-catalog-actions{justify-content:flex-end}}
        @media(max-width:720px){.collection-tools{top:78px;right:18px}.collection-tools form{padding:15px}.collection-pagination{right:18px;bottom:24px}.collection-pagination small{display:none}.gallery-instruction{left:18px!important;right:auto}.marquee-motion-toggle{right:18px;bottom:66px}.loading-marquee{gap:18px}.loading-artwork{min-width:170px;width:44vw}.loading-artwork-2,.loading-artwork-4{width:36vw}.collection-featured-screen{min-height:760px}.collection-featured-screen .museum-introduction-localized{font-size:13px;line-height:1.7}.collection-scroll-cue{right:18px;bottom:17px;left:auto;transform:none}.collection-scroll-cue span{display:none}.collection-catalog-section{padding:24px 18px 48px}.collection-catalog-heading{display:block;padding-bottom:24px}.collection-catalog-heading h2{font-size:clamp(48px,14vw,62px)}.collection-catalog-summary{margin-top:25px}.collection-catalog-summary strong{font-size:38px}.collection-catalog-filters{grid-template-columns:1fr 1fr;gap:16px 14px;padding:24px 0 30px}.collection-catalog-search{grid-column:1/-1}.collection-catalog-actions{grid-column:1/-1}.collection-results-grid{display:grid;grid-template-columns:1fr;gap:42px}.collection-results-grid:after{display:none}.collection-result-card{width:100%;max-width:none;min-width:0}.collection-result-card>figure{height:auto;aspect-ratio:var(--result-ratio)}.collection-catalog-section .collection-pagination{margin-top:42px}}
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
        .home-hero .daily-caption strong i,.home-hero .art-history figcaption strong small,.home-hero .prompt-line small,.globe-home-caption .globe-home-museum b,.globe-home-caption .globe-home-museum small{font-size:12px!important}
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
        .shared-globe:not(.home-globe-focus) .webgl-globe{clip-path:circle(42.5% at 50% 50%)}
        .shared-globe:not(.home-globe-focus) .globe-marker .globe-marker-label{display:flex!important;left:18px!important;top:-14px!important;min-width:0;max-width:150px;min-height:0;flex-direction:column;gap:2px;border:0!important;border-radius:2px;background:rgba(15,16,15,.72)!important;box-shadow:none!important;color:#f5f1e9!important;padding:5px 7px!important;font-size:9px!important;font-weight:500;line-height:1.25!important;letter-spacing:.02em;opacity:.72;transform:none!important}
        .shared-globe:not(.home-globe-focus) .globe-marker:not(.selected) .globe-marker-label small{display:none}
        .shared-globe:not(.home-globe-focus) .globe-marker.selected{z-index:30!important}
        .shared-globe:not(.home-globe-focus) .globe-marker.selected .globe-marker-line{display:block!important;right:7px;left:auto;top:-1px;width:25px;height:1px;background:rgba(245,241,233,.9)}
        .shared-globe:not(.home-globe-focus) .globe-marker.selected .globe-marker-label{right:32px!important;left:auto!important;top:-34px!important;min-width:210px;max-width:none;align-items:flex-end;gap:4px;border:1px solid rgba(183,139,76,.72)!important;border-radius:17px;background:rgba(247,244,238,.98)!important;box-shadow:0 6px 18px rgba(0,0,0,.24)!important;color:#141514!important;padding:8px 12px!important;font-size:12px!important;line-height:1.25!important;text-align:right;opacity:1}
        .shared-globe:not(.home-globe-focus) .globe-marker.selected .globe-marker-label small{display:block;color:#5f5c56!important;font-size:10px!important;line-height:1.2!important;letter-spacing:.045em}
        .shared-globe:not(.home-globe-focus) .globe-marker[data-museum-id="getty"] .globe-marker-label,.shared-globe:not(.home-globe-focus) .globe-marker[data-museum-id="sfmoma"] .globe-marker-label{right:18px!important;left:auto!important;text-align:right}
        .shared-globe:not(.home-globe-focus) .globe-marker[data-museum-id="sfmoma"] .globe-marker-label{top:7px!important}
        .shared-globe:not(.home-globe-focus) .globe-marker[data-museum-id="met"] .globe-marker-label{top:-53px!important}
        .shared-globe:not(.home-globe-focus) .globe-marker[data-museum-id="moma"] .globe-marker-label{top:9px!important}
        .shared-globe:not(.home-globe-focus) .globe-marker[data-museum-id="cleveland"] .globe-marker-label{right:18px!important;left:auto!important;top:18px!important;text-align:right}
        .museum-location-signature,.museum-collection-facts{display:none}
        @media(min-width:1200px){
          .museum-section .museum-copy{top:24.5%;width:min(41vw,780px);height:min(67vh,622px);max-width:none;display:grid;grid-template-columns:minmax(280px,1fr) minmax(270px,.9fr);grid-template-rows:auto auto auto auto auto auto minmax(52px,1fr) auto auto;column-gap:clamp(30px,3vw,56px);align-items:start}
          .museum-section .museum-copy:before{content:'';position:absolute;top:0;bottom:0;left:calc(51.5% + 1px);width:1px;background:linear-gradient(180deg,transparent,rgba(13,14,13,.17) 12%,rgba(13,14,13,.17) 88%,transparent)}
          .museum-section .museum-copy>.overline{grid-column:1;grid-row:1}
          .museum-section .museum-copy>h2{grid-column:1;grid-row:2}
          .museum-section .museum-copy>h3{grid-column:1;grid-row:3}
          .museum-section .museum-copy>a:not(.official){grid-column:1;grid-row:4}
          .museum-section .museum-copy>.museum-type{grid-column:1;grid-row:5}
          .museum-section .museum-copy>p{grid-column:1;grid-row:6}
          .museum-section .museum-copy>.museum-feature{grid-column:2;grid-row:2/span 4;margin-top:8px;align-items:flex-start}
          .museum-section .museum-copy>.museum-feature img{width:142px;height:184px}
          .museum-section .museum-copy>.museum-feature div{padding-top:6px}
          .museum-section .museum-copy>.museum-feature em{margin-top:28px}
          .museum-section .museum-copy>.museum-collection-facts{position:relative;z-index:1;grid-column:1/-1;grid-row:7;display:grid;grid-template-columns:1.35fr 1fr 1fr;align-self:center;margin:0;background:var(--paper);border-top:1px solid rgba(13,14,13,.18);border-bottom:1px solid rgba(13,14,13,.18);padding:18px 0}
          .museum-section .museum-copy>.museum-collection-facts div{display:grid;gap:7px;padding:0 20px;border-left:1px solid rgba(13,14,13,.14)}
          .museum-section .museum-copy>.museum-collection-facts div:first-child{padding-left:0;border-left:0}
          .museum-section .museum-copy>.museum-collection-facts dt{font:400 31px/.9 var(--serif);letter-spacing:-.04em}
          .museum-section .museum-copy>.museum-collection-facts dd{margin:0;color:#77736d;font-size:9px;letter-spacing:.055em}
          .museum-section .museum-copy>.museum-location-signature{grid-column:1;grid-row:8/span 2;display:flex;align-items:flex-end;gap:18px;align-self:end;border-top:1px solid rgba(13,14,13,.18);padding-top:16px}
          .museum-section .museum-copy>.museum-location-signature b{font:400 64px/.75 var(--serif);letter-spacing:-.06em}
          .museum-section .museum-copy>.museum-location-signature span{display:grid;gap:6px;color:#4f4d49;font-size:11px;letter-spacing:.035em}
          .museum-section .museum-copy>.museum-location-signature small{color:#8a867f;font-size:9px;letter-spacing:.075em}
          .museum-section .museum-copy>.enter-gallery{grid-column:2;grid-row:8;width:100%;margin-top:0;align-self:end}
          .museum-section .museum-copy>.official{grid-column:2;grid-row:9;margin-top:14px}
        }
        @media(min-width:721px){.home-hero .daily-art{left:40%;width:calc(52.7vh * .794);max-width:24vw}.museum-section .drag-cue{left:15%;color:#f3efe7;text-shadow:0 1px 5px rgba(0,0,0,.65);white-space:nowrap}}
        @media(max-width:720px){
          .shared-globe:not(.home-globe-focus) .globe-marker:not(.selected) .globe-marker-label{display:none!important}
          .home-hero{min-height:1080px}.home-hero .artist-entry{left:7%;right:auto;top:548px;width:86%;max-width:none;height:auto;min-height:0;grid-template-rows:164px 252px;gap:16px}.recommendation-card{height:164px;padding:18px 20px}.home-hero .glass-card{height:252px;padding:18px 20px 14px}.home-hero .glass-card h1{font-size:32px}.globe-home-caption{display:block}.home-hero .globe-home-caption strong{font-size:clamp(52px,15vw,74px)!important}.home-hero .daily-caption{left:12px;bottom:12px}.home-hero .daily-caption strong{font-size:18px}.home-hero .daily-caption small{font-size:11px}.home-globe-focus .globe-marker.selected .globe-marker-label{min-width:220px;font-size:13px!important}.home-globe-focus .globe-marker.selected .globe-marker-label small{font-size:9px!important}
          .museum-detail-hero{top:88px;left:18px;right:18px}.museum-title-block h1{max-width:350px;font-size:clamp(45px,12.4vw,54px);line-height:.9;letter-spacing:-.05em}.museum-title-block>a{margin-top:15px;font-size:10px}.museum-introduction{padding-top:24px}.museum-introduction-en{font-size:17px;line-height:1.22}.museum-introduction-zh{margin-top:12px!important;font-size:13px;line-height:1.7}.collection-marquee{top:53%;height:31vh}.artwork-marquee-item{--item-height:clamp(180px,24vh,220px)}.artwork-marquee-item.portrait{--item-height:clamp(210px,28vh,255px)}.artwork-marquee-item.wide{--item-height:clamp(168px,22vh,205px)}
          .artwork-view{position:relative;inset:auto;height:auto;min-height:100svh;overflow:visible;padding:1px 0 48px}.back-gallery{position:absolute;top:18px;left:18px}.art-pane{position:relative;inset:auto;width:calc(100% - 36px);height:min(54svh,520px);margin:82px 18px 0;transform:none}.dialogue-pane{position:relative;inset:auto;width:auto;height:auto;margin:24px 18px 0}.artwork-summary h1{font-size:clamp(38px,12vw,48px);line-height:.94}.artwork-original-title{font-size:18px}.artist-meta b{font-size:13px}.artwork-introduction{display:block;max-width:none;margin:14px 0;font-size:14px!important;line-height:1.7;-webkit-line-clamp:unset;overflow:visible}.artwork-quick-facts{grid-template-columns:1fr;gap:12px;padding:14px 0}.artwork-quick-facts dd{overflow:visible;text-overflow:clip}.conversation-title{margin-top:4px;padding:14px 0 10px}.ai-unavailable{min-height:0;overflow:visible;padding:22px 0 18px}.ai-unavailable section{max-width:none;width:100%;padding:0 0 22px}.ai-unavailable h2{font-size:28px;line-height:1.18}.observation-prompts{margin-top:0;padding-top:18px}.viewer-controls{max-width:calc(100% - 16px);height:44px;padding:0 6px;white-space:nowrap}.viewer-controls button{padding:0 8px!important}.viewer-controls span{width:50px}
        }
        /* Collection v3: bilingual editorial hierarchy, natural artwork ratios, infinite flow. */
        .collection-featured-screen .museum-title-block>p{display:flex;align-items:baseline;gap:7px;font-family:var(--font-body-zh),'Noto Sans SC',sans-serif}
        .collection-featured-screen .museum-title-block>p small{font:500 10px/1 var(--font-body-latin),'Inter',sans-serif;letter-spacing:.08em}
        .museum-title-zh{display:block;margin-top:18px;font:500 clamp(24px,2.1vw,34px)/1.1 var(--font-body-zh),'Noto Sans SC',sans-serif!important;letter-spacing:-.035em}
        .collection-featured-screen .museum-introduction{display:grid;gap:15px;padding-top:45px}
        .collection-featured-screen .museum-introduction p{max-width:570px;margin:0!important}
        .collection-featured-screen .museum-introduction-zh{color:#343431;font:400 clamp(15px,1.12vw,17px)/1.75 var(--font-body-zh),'Noto Sans SC',sans-serif!important;letter-spacing:0}
        .collection-featured-screen .museum-introduction-en{color:#5f5b55;font:400 clamp(13px,.95vw,15px)/1.65 var(--font-body-latin),'Inter','Helvetica Neue',sans-serif!important;letter-spacing:0}
        .collection-featured-screen .artwork-marquee-card figure,.collection-featured-screen .artwork-marquee-item img{background:transparent!important}
        .artwork-hover-detail h2{margin-bottom:4px;font-family:var(--font-body-zh),'Noto Sans SC',sans-serif!important}
        .artwork-hover-detail h3{margin:0 0 7px;color:#706d67;font:400 12px/1.25 'Otomanopee One',sans-serif!important;letter-spacing:.025em}
        .collection-scroll-cue{display:grid;grid-template-columns:auto auto;column-gap:9px;row-gap:3px}
        .collection-scroll-cue>span{font-family:var(--font-body-zh),'Noto Sans SC',sans-serif}
        .collection-scroll-cue>small{grid-column:1;color:#8a867f;font:500 8px/1 var(--font-body-latin),'Inter',sans-serif;letter-spacing:.09em}
        .collection-scroll-cue>i{grid-column:2;grid-row:1/span 2}
        .collection-catalog-flow{padding-top:36px}
        .collection-catalog-heading{grid-template-columns:minmax(0,1fr) auto;align-items:end}
        .collection-catalog-heading>div:first-child>p{display:flex;align-items:baseline;gap:7px;font-family:var(--font-body-zh),'Noto Sans SC',sans-serif}
        .collection-catalog-heading>div:first-child>p small{font:500 10px/1 var(--font-body-latin),'Inter',sans-serif;letter-spacing:.09em}
        .collection-catalog-heading h2{display:grid;gap:8px;margin-top:14px!important;line-height:1!important}
        .collection-catalog-heading h2>span{font:500 clamp(56px,6.6vw,100px)/.92 var(--font-body-zh),'Noto Sans SC',sans-serif!important;letter-spacing:-.055em}
        .collection-catalog-heading h2>small{font:400 clamp(17px,1.5vw,23px)/1 'Otomanopee One',sans-serif!important;letter-spacing:.02em}
        .collection-catalog-summary{display:flex;align-items:flex-end;gap:38px}
        .collection-catalog-summary strong{display:flex;align-items:baseline;gap:10px;font:400 clamp(44px,4.2vw,68px)/.9 var(--font-display),'Cormorant Garamond',serif}
        .collection-catalog-summary strong small{display:grid;gap:3px;color:#5f5b55;font-style:normal}
        .collection-catalog-summary strong small span{font:500 12px/1.2 var(--font-body-zh),'Noto Sans SC',sans-serif}
        .collection-catalog-summary strong small i{font:500 8px/1 var(--font-body-latin),'Inter',sans-serif;font-style:normal;letter-spacing:.08em}
        .collection-catalog-summary>a{display:grid;gap:3px;color:#343431;font-family:var(--font-body-zh),'Noto Sans SC',sans-serif;text-decoration:none}
        .collection-catalog-summary>a small{font:500 8px/1 var(--font-body-latin),'Inter',sans-serif;letter-spacing:.08em}
        .collection-results-grid{padding-top:0;gap:54px 20px}
        .collection-results-grid:after{content:'';display:block;flex-basis:calc(2.2 * 230px);flex-grow:999}
        .collection-result-card{flex-basis:calc(var(--result-ratio) * 230px);flex-grow:var(--result-ratio);max-width:560px;margin:0!important}
        .collection-result-card>figure{height:auto!important;max-height:none!important;aspect-ratio:var(--result-ratio)!important;overflow:hidden;background:transparent!important}
        .collection-result-card img{display:block;width:100%;height:100%;object-fit:contain;background:transparent!important}
        .collection-result-card>.collection-result-copy{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 14px;padding-top:13px;border:0!important}
        .collection-result-copy h3{grid-column:1;margin:0;overflow:hidden;font:500 clamp(16px,1.25vw,21px)/1.15 var(--font-body-zh),'Noto Sans SC',sans-serif!important;text-overflow:ellipsis;white-space:nowrap}
        .collection-result-copy h4{grid-column:1;margin:0;overflow:hidden;color:#343431;font:400 clamp(11px,.78vw,13px)/1.32 var(--font-body-latin),'Inter','Helvetica Neue',sans-serif!important;letter-spacing:0;text-overflow:ellipsis;white-space:nowrap}
        .collection-result-copy p{grid-column:1;margin-top:3px!important;font-family:var(--font-body-latin),'Inter','Helvetica Neue',sans-serif}
        .collection-result-copy>span{grid-column:2;grid-row:1/span 3}
        .collection-result-open{display:grid;grid-template-columns:auto auto;gap:2px 9px}
        .collection-result-open>span{font-family:var(--font-body-zh),'Noto Sans SC',sans-serif}
        .collection-result-open>small{grid-column:1;color:rgba(255,255,255,.7);font:500 7px/1 var(--font-body-latin),'Inter',sans-serif;letter-spacing:.08em}
        .collection-load-sentinel{display:grid;min-height:180px;place-items:center;padding:52px 0;color:#706d67;text-align:center}
        .collection-load-sentinel p{display:grid;gap:7px;margin:0;font:400 13px/1.4 var(--font-body-zh),'Noto Sans SC',sans-serif}
        .collection-load-sentinel p small{font:500 8px/1 var(--font-body-latin),'Inter',sans-serif;letter-spacing:.1em}
        .collection-load-sentinel button{min-height:44px;border:1px solid rgba(13,14,13,.32);border-radius:999px;background:transparent;padding:0 18px;font:500 12px/1 var(--font-body-zh),'Noto Sans SC',sans-serif}
        .home-globe-focus .globe-marker.selected .globe-marker-label small{font-size:12px!important}
        @media(max-width:720px){
          .museum-title-zh{margin-top:10px;font-size:21px}
          .collection-featured-screen .museum-introduction{gap:8px;padding-top:18px}
          .collection-featured-screen .museum-introduction-zh{font-size:12px!important;line-height:1.62!important}
          .collection-featured-screen .museum-introduction-en{font-size:10px!important;line-height:1.5!important}
          .collection-featured-screen .collection-marquee{top:58%;height:27vh}
          .collection-scroll-cue>small{display:none}
          .collection-catalog-flow{padding-top:24px}
          .collection-catalog-heading{display:block}
          .collection-catalog-heading h2>span{font-size:50px}
          .collection-catalog-heading h2>small{font-size:14px}
          .collection-catalog-summary{justify-content:space-between;margin-top:28px;gap:18px}
          .collection-catalog-summary strong{font-size:39px}
          .collection-catalog-summary strong small span{font-size:10px}
          .collection-museum-copy{display:grid;grid-template-columns:1fr;gap:14px;margin-top:22px}
          .collection-museum-copy p{font-size:13px;line-height:1.72}
          .collection-museum-copy p[lang="en"]{font-size:12px;line-height:1.62}
          .collection-results-grid{display:grid;grid-template-columns:1fr;padding-top:0;gap:46px}
          .collection-results-grid:after{display:none}
          .collection-result-card{width:100%;max-width:none;min-width:0}
          .collection-result-copy h3{font-size:19px}
          .collection-result-copy h4{font-size:11px}
          .collection-load-sentinel{min-height:140px;padding:40px 0}
        }
        @media(prefers-reduced-motion:reduce){.skeleton{animation:none}.home-hero .daily-art,.home-hero .art-history,.home-hero .artist-entry{transform:none;transition:none}.collection-tools summary,.collection-tools form{backdrop-filter:none}}
      `}</style>
    </>
  );
}
