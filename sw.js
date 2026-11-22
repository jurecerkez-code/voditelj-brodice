/* Rad bez interneta. Pri prvom posjetu sprema cijeli vodič; kasnije ga otvara iz spremišta
   i u pozadini povlači novu verziju (stale-while-revalidate). Kod nove verzije promijeni VERSION. */
const VERSION='vb-5.2.1';
const FILES=[
 "./",
 "index.html",
 "favicon.svg",
 "manifest.webmanifest",
 "assets/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2",
 "assets/fonts/atkinson-hyperlegible-next-latin-ext-wght-normal.woff2",
 "assets/css/app.css?v=5.2.1",
 "assets/js/core.js?v=5.2.1",
 "assets/js/ui.js?v=5.2.1",
 "assets/js/w-karta.js?v=5.2.1",
 "assets/js/w-iala.js?v=5.2.1",
 "assets/js/w-svjetla.js?v=5.2.1",
 "assets/js/w-sudari.js?v=5.2.1",
 "assets/js/w-motor.js?v=5.2.1",
 "assets/js/w-propisi-meteo.js?v=5.2.1",
 "assets/js/w-manevar.js?v=5.2.1",
 "assets/js/navlab.js?v=5.2.1",
 "assets/js/sims.js?v=5.2.1",
 "assets/js/w-pogibelj.js?v=5.2.1",
 "assets/js/w-sektori.js?v=5.2.1",
 "assets/js/exam.js?v=5.2.1",
 "assets/js/w-kardinalne.js?v=5.2.1",
 "assets/js/srs.js?v=5.2.1",
 "assets/js/w-zvuk.js?v=5.2.1",
 "assets/js/fizika.js?v=5.2.1",
 "assets/js/w-pristajanje.js?v=5.2.1",
 "assets/js/osnova.js?v=5.2.1",
 "assets/js/w-cvorovi.js?v=5.2.1",
 "assets/js/w-radio.js?v=5.2.1",
 "assets/js/data.js?v=5.2.1",
 "assets/js/practice.js?v=5.2.1",
 "assets/js/plan.js?v=5.2.1",
 "assets/js/svg-theme.js?v=5.2.1",
 "assets/js/app.js?v=5.2.1"
];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  e.respondWith(caches.open(VERSION).then(async c=>{ const hit=await c.match(r,{ignoreSearch:r.mode==='navigate'});
    const net=fetch(r).then(res=>{ if(res&&res.ok) c.put(r,res.clone()); return res; }).catch(()=>hit);
    return hit||net; })); });
