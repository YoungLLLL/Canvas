/* eslint-disable @next/next/no-css-tags */
export function DemoStyles() {
  return (
    <>
      <link rel="stylesheet" href="/demo/original.css" />
      <style>{`
        @font-face{font-family:'Otomanopee One';src:url('/fonts/otomanopee-one-v11.ttf') format('truetype');font-style:normal;font-weight:400;font-display:swap}
        :root{--title:'Otomanopee One',var(--font-body-zh),'PingFang SC',sans-serif;--serif:var(--font-display),'Songti SC','SimSun',serif;--sans:var(--font-body-zh),'PingFang SC',sans-serif}
        .site-header nav a{display:flex;align-items:baseline;gap:7px;white-space:nowrap;color:inherit;text-decoration:none;font-size:15px}
        .site-header nav a small{color:#77746f;font-size:8px;font-weight:400;letter-spacing:.09em}
        body:has(.demo-faithful) #siteHeader,body:has(.artwork-view) #siteHeader{opacity:0;pointer-events:none}
      `}</style>
    </>
  );
}
