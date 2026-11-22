"use strict";
/* Kardinalne oznake: stupovi, kvadranti, noćni i dnevni kviz. */
/* ═══════════════ KARDINALNE OZNAKE: stupovi, kvadranti, noćni i dnevni kviz ═══════════════ */
/* Sadržaj iz poglavlja IALA: vršne oznake (dva crna čunja), boje odozgo, bijelo svjetlo
   N Q neprekidno, E Q(3) 10s, S Q(6) + dugi bljesak 15s, W Q(9) 15s. Ritam je isti kao RHYTHM u galeriji oznaka. */
(function(){
  const b=el('cardinalWidget'); if(!b) return;
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Q=[.3,.7], rep=(n)=>Array.from({length:n},()=>Q.slice());
  const pad=(a,T)=>{ const s=a.reduce((x,y)=>x+y[0]+y[1],0); a[a.length-1][1]+=T-s; return a; };
  const Y='#f5c542', K='#11161c';
  const M=[
    {k:'N',n:'Sjeverna',g:'sjeverne',bands:[K,Y],top:'N',ch:'Q (neprekidno)',rh:pad(rep(10),10),
     cones:'Oba čunja vrhom <b>gore</b> ↑↑',col:'crno gore, žuto dolje',mn:'čunjevi pokazuju gore, prema <b>sjeveru</b> na karti'},
    {k:'E',n:'Istočna',g:'istočne',bands:[K,Y,K],top:'E',ch:'Q(3) 10s',rh:pad(rep(3),10),
     cones:'Čunjevi spojeni <b>bazama</b> ◇',col:'crno, žuto, crno',mn:'oblik jajeta, „<b>E</b>gg = <b>E</b>ast"'},
    {k:'S',n:'Južna',g:'južne',bands:[Y,K],top:'S',ch:'Q(6) + dugi 15s',rh:pad(rep(6).concat([[2,0]]),15),
     cones:'Oba čunja vrhom <b>dolje</b> ↓↓',col:'žuto gore, crno dolje',mn:'čunjevi pokazuju dolje, prema <b>jugu</b>'},
    {k:'W',n:'Zapadna',g:'zapadne',bands:[Y,K,Y],top:'W',ch:'Q(9) 15s',rh:pad(rep(9),15),
     cones:'Čunjevi spojeni <b>vrhovima</b> ⧗',col:'žuto, crno, žuto',mn:'oblik čaše za vino, „<b>W</b>ine glass = <b>W</b>est"'}
  ];
  const period=m=>m.rh.reduce((a,x)=>a+x[0]+x[1],0);
  // v4: točan ritam u cijelim milisekundama (N 1000 ms po bljesku, E 10 000, S i W 15 000 ms po periodu)
  M.forEach(m=>{ m.ms=m.rh.map(([on,off])=>[Math.round(on*1000),Math.round(off*1000)]); m.T=m.ms.reduce((a,x)=>a+x[0]+x[1],0); });
  const lit=(m,t)=>{ let q=Math.floor(t*1000)%m.T; for(const [on,off] of m.ms){ if(q<on) return true; q-=on; if(q<off) return false; q-=off; } return false; };

  let uid=0;
  const DEFS=`<defs>
    <linearGradient id="cdShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".3" stop-color="#fff" stop-opacity=".06"/><stop offset=".7" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
    <linearGradient id="cdCone" data-keep-dark="1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a424a"/><stop offset=".35" stop-color="#1c232a"/><stop offset="1" stop-color="#050709"/></linearGradient>
    <linearGradient id="cdMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9d3db"/><stop offset=".5" stop-color="#8795a1"/><stop offset="1" stop-color="#3c4852"/></linearGradient>
    <radialGradient id="cdGlow"><stop offset="0" stop-color="#fffbe6" stop-opacity="1"/><stop offset=".3" stop-color="#fff2c0" stop-opacity=".45"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></radialGradient>
    <filter id="cdBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter></defs>`;
  // čunj: up = vrh gore; y0 gornji rub, y1 donji rub
  const cone=(y0,y1,up)=>up?`<path data-keep-dark="1" d="M0,${y0} L8,${y1} L-8,${y1} Z" fill="url(#cdCone)" stroke="#050709" stroke-width=".7"/>`
                           :`<path data-keep-dark="1" d="M-8,${y0} L8,${y0} L0,${y1} Z" fill="url(#cdCone)" stroke="#050709" stroke-width=".7"/>`;
  const TOPS={N:cone(-154,-141,1)+cone(-137,-124,1), S:cone(-154,-141,0)+cone(-137,-124,0),
              E:cone(-153,-140,1)+cone(-138,-125,0), W:cone(-154,-141,0)+cone(-139,-126,1)};
  // stup (pillar) s plovkom; ishodište = vodena linija. glow: id grupe svjetla za treptanje
  function pillar(m,o){ o=o||{}; const id='cdC'+(++uid);
    const sil=`M-13,-96 L13,-96 L15,-20 L30,-20 L30,4 L-30,4 L-30,-20 L-15,-20 Z`;
    const n=m.bands.length, y0=-96, y1=4, h=(y1-y0)/n;
    const bands=m.bands.map((c,i)=>`<rect x="-32" y="${y0+i*h}" width="64" height="${h+.5}" fill="${c}"/>`).join('');
    const body=`<clipPath id="${id}"><path d="${sil}"/></clipPath><g clip-path="url(#${id})">${bands}<rect x="-30" y="-20" width="60" height="24" fill="url(#cdShade)"/><rect x="-15" y="-96" width="30" height="76" fill="url(#cdShade)"/>
      <rect x="-32" y="-2" width="64" height="6" fill="#000" opacity=".35"/></g>
      <path d="${sil}" fill="none" stroke="#0a0f14" stroke-opacity=".55" stroke-width=".8"/><ellipse cx="0" cy="-20" rx="30" ry="3.2" fill="none" stroke="#000" stroke-opacity=".35"/>`;
    const lamp=`<ellipse cx="0" cy="-96" rx="15" ry="3" fill="url(#cdMetal)"/><rect x="-1.4" y="-124" width="2.8" height="16" fill="url(#cdMetal)"/>
      <rect x="-4.5" y="-110" width="9" height="13" rx="2" fill="url(#cdMetal)" stroke="#2a343c" stroke-width=".6"/><rect x="-3" y="-108" width="6" height="7" rx="1" fill="#e8f1f6" opacity=".85"/>`;
    const glow=`<g class="cdLamp" data-k="${m.k}" opacity="${o.lit?1:.18}"><circle cy="-104" r="${o.big||18}" fill="url(#cdGlow)"/><circle cy="-104" r="2.6" fill="var(--sig-white)"/></g>`;
    const whole=TOPS[m.top]+lamp+body;
    return `<g transform="translate(${o.x||0},${o.y||0}) scale(${o.s||1})">
      ${o.refl===false?'':`<g transform="scale(1,-1) translate(0,-8)" opacity=".22" filter="url(#cdBlur)">${whole}</g>`}
      <g class="${o.bob===false?'':'cdBob'}">${whole}${glow}</g>
      ${o.ring===false?'':`<ellipse cx="0" cy="5" rx="40" ry="6" fill="none" stroke="#bfe6ff" stroke-width="1" opacity=".5"/><ellipse cx="0" cy="6" rx="52" ry="8" fill="none" stroke="#bfe6ff" stroke-width=".7" opacity=".28"/>`}</g>`; }
  const daySky=(W,H,hor)=>`<defs><linearGradient id="cdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9fc4"/><stop offset="1" stop-color="#cfe2ee"/></linearGradient>
      <linearGradient id="cdSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6f98"/><stop offset=".5" stop-color="#1b4d70"/><stop offset="1" stop-color="#0b2a44"/></linearGradient></defs>
    <rect width="${W}" height="${hor}" fill="url(#cdSky)"/><path d="M0,${hor} L0,${hor-10} C${W*.18},${hor-18} ${W*.3},${hor-8} ${W*.44},${hor-12} C${W*.6},${hor-16} ${W*.8},${hor-6} ${W},${hor-12} L${W},${hor} Z" fill="#4d6f86" opacity=".55"/>
`+seaBackground(W,H,{y:hor}); // v4: zajedničko more

  /* ── 1. dnevni prikaz: četiri stupa ── */
  function strip(){ const W=680,H=318,HOR=150; let g=DEFS+daySky(W,H,HOR);
    M.forEach((m,i)=>{ const x=95+i*163; g+=pillar(m,{x,y:236,s:1.12});
      g+=`<text x="${x}" y="280" text-anchor="middle" font-size="15" font-weight="600" fill="#fff" paint-order="stroke" stroke="#0b2a44" stroke-width="3">${m.k}, ${m.n}</text>
        <text x="${x}" y="298" text-anchor="middle" font-size="11.5" fill="#dfe9f1" font-family="var(--mono)" paint-order="stroke" stroke="#0b2a44" stroke-width="3">bijelo ${m.ch}</text>`; });
    return SVG(W,H,g,'class="cdSvg" role="img" aria-label="Četiri kardinalne oznake: sjeverna, istočna, južna i zapadna, sa stvarnim oblikom stupa, bojama i vršnim oznakama"'); }

  /* ── 2. kvadranti: opasnost u sredini, oznaka stoji u kvadrantu sa sigurne strane ── */
  let qSel='N';
  function quad(){ const S=340,c=S/2; let g=DEFS+`<rect width="${S}" height="${S}" rx="10" fill="#0f3552"/>`;
    for(let y=22;y<S;y+=30) g+=`<path d="M0,${y} q20,-4 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" stroke="#3f7fa8" fill="none" opacity=".25"/>`;
    const sel=M.find(m=>m.k===qSel), ang={N:0,E:90,S:180,W:270}[qSel];
    // sigurni kvadrant (zeleno) za odabranu oznaku
    const wedge=a=>{ const r=c*1.5, p1=(a-45)*Math.PI/180, p2=(a+45)*Math.PI/180; return `M${c},${c} L${c+Math.sin(p1)*r},${c-Math.cos(p1)*r} L${c+Math.sin(a*Math.PI/180)*r*1.2},${c-Math.cos(a*Math.PI/180)*r*1.2} L${c+Math.sin(p2)*r},${c-Math.cos(p2)*r} Z`; };
    g+=`<clipPath id="cdQc"><rect width="${S}" height="${S}" rx="10"/></clipPath><g clip-path="url(#cdQc)"><path d="${wedge(ang)}" fill="#25c26a" opacity=".16"/></g>`;
    g+=`<line x1="0" y1="0" x2="${S}" y2="${S}" stroke="#9fd2f0" stroke-dasharray="5 5" opacity=".6"/><line x1="${S}" y1="0" x2="0" y2="${S}" stroke="#9fd2f0" stroke-dasharray="5 5" opacity=".6"/>`;
    [['NW',16,20,'start'],['NE',S-16,20,'end'],['SE',S-16,S-10,'end'],['SW',16,S-10,'start']].forEach(([t,x,y,a])=>g+=`<text x="${x}" y="${y}" font-size="11" fill="#9fd2f0" text-anchor="${a}" font-family="var(--mono)" font-weight="600">${t}</text>`);
    // opasnost: plićina/hrid
    g+=`<path d="M${c-34},${c+4} C${c-30},${c-24} ${c-6},${c-30} ${c+14},${c-22} C${c+36},${c-14} ${c+34},${c+14} ${c+18},${c+26} C${c},${c+36} ${c-30},${c+28} ${c-34},${c+4} Z" fill="#bfe0f2" stroke="#6fa6c8"/>
      <path d="M${c-12},${c+6} l6,-12 l5,7 l6,-10 l8,15 Z" fill="#6b5a22"/><text x="${c}" y="${c+22}" text-anchor="middle" font-size="10" fill="#0b2a44" font-weight="600">Opasnost</text>`;
    // ruta broda: prolazi sa sigurne strane oznake
    const off=118, R={N:`M18,${c-off} L${S-18},${c-off}`,S:`M${S-18},${c+off} L18,${c+off}`,E:`M${c+off},${S-18} L${c+off},18`,W:`M${c-off},18 L${c-off},${S-18}`}[qSel];
    g+=`<path class="cdRoute" d="${R}" stroke="#ffd166" stroke-width="2.4" fill="none" stroke-dasharray="8 6" marker-end="url(#cdArr)"/><defs><marker id="cdArr" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 Z" fill="#ffd166"/></marker></defs>`;
    const P={N:[c,c-78],E:[c+78,c],S:[c,c+78],W:[c-78,c]};
    M.forEach(m=>{ const [x,y]=P[m.k], on=m.k===qSel;
      g+=`<g class="cdQm" data-k="${m.k}" role="button" tabindex="0" aria-label="${m.n} kardinalna oznaka" style="cursor:pointer">
        <circle cx="${x}" cy="${y}" r="30" fill="${on?'rgba(255,209,102,.16)':'rgba(0,0,0,0)'}" stroke="${on?'#ffd166':'none'}" stroke-width="1.5"/>
        ${pillar(m,{x,y:y+22,s:.3,refl:false,ring:false,bob:false,big:22})}
        <text x="${x+(m.k==='W'?-22:22)}" y="${y+4}" text-anchor="middle" font-size="14" font-weight="600" fill="${on?'#ffd166':'#e6eef5'}" paint-order="stroke" stroke="#0f3552" stroke-width="3">${m.k}</text></g>`; });
    return SVG(S,S,g,'class="cdQuad" role="group" aria-label="Kvadranti kardinalnog sustava oko opasnosti: odaberi oznaku"'); }
  function qInfo(){ const m=M.find(x=>x.k===qSel);
    return `<h4 class="mb6">${m.n} kardinalna (${m.k})</h4>
      <p class="mb6">Stoji u <b>${m.k}</b> kvadrantu opasnosti. Prolaziš sa <b>${m.g}</b> strane oznake: ondje je sigurna, najdublja voda.</p>
      <ul class="cdList"><li>${m.cones}: ${m.mn}.</li><li>Boje odozgo: <b>${m.col}</b>.</li><li>Svjetlo: <b>bijelo ${m.ch}</b>.</li></ul>${tl(m)}`; }
  // vremenska traka ritma (jedan period)
  function tl(m){ const T=period(m), Wd=300; let x=0, g=`<rect width="${Wd}" height="26" rx="5" fill="#050d18"/>`;
    m.rh.forEach(([on,off])=>{ g+=`<rect x="${(x/T*Wd).toFixed(1)}" y="5" width="${Math.max(1.5,on/T*Wd).toFixed(1)}" height="16" rx="1.5" fill="#fff6d8"/>`; x+=on+off; });
    for(let s=0;s<=T;s+=5) g+=`<text x="${s>=T?Wd-1:s/T*Wd+2}" y="38" font-size="9" fill="#9fb6c9" text-anchor="${s>=T?'end':'start'}" font-family="var(--mono)">${s}s</text>`;
    return `<div class="cdTl"><span>Ritam svjetla, jedan period (${T} s):</span>${SVG(Wd,42,g,'role="img" aria-label="Ritam: '+m.ch+'"')}</div>`; }

  /* ── 3. kviz ── */
  let score=store.get('cardinal',{ok:0,n:0}), mode='quad', cur=null, qType='name', answered=false;
  function night(m){ const W=480,H=230,HOR=132;
    let g=`<defs><linearGradient id="cdNs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02060c"/><stop offset="1" stop-color="#0a1a2a"/></linearGradient>
      <linearGradient id="cdNsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2236"/><stop offset="1" stop-color="#02080f"/></linearGradient>
      <radialGradient id="cdNg"><stop offset="0" stop-color="#fffbe6"/><stop offset=".25" stop-color="#fff2c0" stop-opacity=".5"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></radialGradient>
      <linearGradient id="cdNr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c0" stop-opacity=".55"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></linearGradient></defs>
      <rect width="${W}" height="${HOR}" fill="url(#cdNs)"/>${seaBackground(W,H,{y:HOR,night:true,calm:true})}
      <path d="M0,${HOR} L0,${HOR-8} C80,${HOR-16} 150,${HOR-6} 220,${HOR-9} L230,${HOR} Z M${W},${HOR} L${W},${HOR-12} C420,${HOR-18} 360,${HOR-8} 330,${HOR-5} L322,${HOR} Z" fill="#050b12"/>
      ${[[40,20],[120,48],[300,30],[410,60],[460,16],[210,70]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".9" fill="#cfe3ef" opacity=".6"/>`).join('')}
      <g class="cdNL"><circle cx="276" cy="${HOR-6}" r="28" fill="url(#cdNg)"/><circle cx="276" cy="${HOR-6}" r="2.4" fill="var(--sig-white)"/><rect x="273" y="${HOR+3}" width="6" height="60" fill="url(#cdNr)"/></g>
      <text x="12" y="${H-12}" font-size="11" fill="#6f8aa0" font-family="var(--mono)">noć, bijelo svjetlo na obzoru</text>`;
    return SVG(W,H,g,'class="cdNight" role="img" aria-label="Noćni prizor s bijelim svjetlom koje treperi"'); }
  function dayOne(m){ const W=300,H=260,HOR=120; return SVG(W,H,DEFS+daySky(W,H,HOR)+pillar(m,{x:150,y:206,s:1.05}),'class="cdOne" role="img" aria-label="Kardinalna oznaka, prepoznaj je"'); }
  function ask(){ answered=false; cur=rnd(M); qType=mode==='day'&&Math.random()<.5?'side':'name';
    const q=mode==='night'?'Po mraku vidiš ovo svjetlo. Koja je to kardinalna oznaka?':qType==='side'?'S koje strane ove oznake prolaziš?':'Koja je ovo kardinalna oznaka?';
    const opts=qType==='side'?M.map(m=>[m.k,`Sa ${m.g} strane`]):M.map(m=>[m.k,`${m.n} (${m.k})`+(mode==='night'?` <span class="cdCh mono">bijelo ${m.ch}</span>`:'')]);
    $('.cdQ',b).innerHTML=`<div class="cdScene">${mode==='night'?night(cur):dayOne(cur)}${mode==='night'&&RM?`<div class="cdRm">Smanjeno kretanje je uključeno, pa svjetlo ne treperi. Ritam je prikazan trakom:</div>${tl(cur)}`:''}</div>
      <div class="cdAsk"><p class="cdQt">${q}</p>${opts.map(o=>`<button class="opt cdOpt" data-k="${o[0]}" type="button">${o[1]}</button>`).join('')}<div class="cdFb" aria-live="polite"></div></div>`;
    $$('.cdOpt',b).forEach(x=>x.addEventListener('click',()=>answer(x)));
    loop(); }
  function answer(btn){ if(answered) return; answered=true; const ok=btn.dataset.k===cur.k;
    score.n++; if(ok){ score.ok++; if(window.VB) VB.widgetOk('cardinal'); } store.set('cardinal',score);
    $$('.cdOpt',b).forEach(x=>{ x.disabled=true; if(x.dataset.k===cur.k) x.classList.add('correct'); else if(x===btn) x.classList.add('wrong'); });
    $('.cdFb',b).innerHTML=`<div class="expl"><b>${ok?'✓ Točno.':'✗ Nije.'} ${cur.n} kardinalna (${cur.k})</b><br>
      ${cur.cones}, boje odozgo ${cur.col}, svjetlo <b>bijelo ${cur.ch}</b>. Prolaziš sa <b>${cur.g}</b> strane oznake.
      ${mode==='night'?'<br><small>Pomaže brojčanik sata: N je 12 (neprekidno), E je 3, S je 6 i jedan dugi, W je 9.</small>':''}</div>
      ${mode==='night'?`<div class="cdAns">${dayOne(cur)}</div>`:''}
      <div class="btnrow"><button class="btn p cdNext" type="button">Sljedeća</button><span class="cdSc">Točno ${score.ok} od ${score.n}</span></div>`;
    $('.cdNext',b).addEventListener('click',ask); loop(); }

  /* ── treptanje: jedan rAF sat za sve lampe u widgetu (i na traci i u kvizu) ── */
  let raf=null, vis=true, t0=performance.now();
  function frame(now){ raf=null; if(!vis) return; const t=(now-t0)/1000;
    $$('.cdLamp',b).forEach(g=>{ const m=M.find(x=>x.k===g.dataset.k); g.setAttribute('opacity',lit(m,t)?1:.12); });
    const nl=$('.cdNL',b); if(nl&&cur) nl.setAttribute('opacity',lit(cur,t)?1:0);
    raf=requestAnimationFrame(frame); }
  function loop(){ if(RM){ $$('.cdLamp',b).forEach(g=>g.setAttribute('opacity',.9)); const nl=$('.cdNL',b); if(nl) nl.setAttribute('opacity',.25); return; }
    if(!raf) raf=requestAnimationFrame(frame); }
  if('IntersectionObserver' in window) new IntersectionObserver(es=>{ vis=es[0].isIntersecting; if(vis) loop(); }).observe(b);

  b.innerHTML=`<div class="cdStrip">${strip()}</div>
    <div class="cdTabs" role="group" aria-label="Način vježbe"><button class="knTab on" data-m="quad" type="button" aria-pressed="true">Kvadranti</button><button class="knTab" data-m="night" type="button" aria-pressed="false">Noćni kviz: po ritmu</button><button class="knTab" data-m="day" type="button" aria-pressed="false">Dnevni kviz: po izgledu</button></div>
    <div class="cdQ"></div>`;
  function showQuad(){ $('.cdQ',b).innerHTML=`<div class="cdQuadWrap">${quad()}<div class="cdInfo">${qInfo()}<p class="cdHint">Klikni oznaku na shemi.</p></div></div>`;
    $$('.cdQm',b).forEach(x=>{ const f=()=>{ qSel=x.dataset.k; showQuad(); }; x.addEventListener('click',f); x.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); f(); } }); });
    loop(); }
  $('.cdTabs',b).addEventListener('click',e=>{ const t=e.target.closest('[data-m]'); if(!t) return; mode=t.dataset.m;
    $$('.knTab',$('.cdTabs',b)).forEach(x=>{ x.classList.toggle('on',x===t); x.setAttribute('aria-pressed',x===t?'true':'false'); }); cur=null; if(mode==='quad') showQuad(); else ask(); });
  showQuad();
})();
