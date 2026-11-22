"use strict";
/* Znakovi pogibelji: galerija i kviz. */
/* ═══════════════ ZNAKOVI POGIBELJI (galerija + kviz u oba smjera) ═══════════════
   Sadržaj je popis iz poglavlja „Zvučni signali → Signali opasnosti (pogibelji)".
   Prizori su inline SVG; zajednički gradijenti su u jednom skrivenom <svg> (dsDefs). */
(function(){
  const box=el('distressWidget'); if(!box) return;
  const W=220,H=150, SEA=112;
  const defs=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="dsNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b16"/><stop offset="1" stop-color="#132a44"/></linearGradient>
    <linearGradient id="dsDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9fc4"/><stop offset="1" stop-color="#c9dcea"/></linearGradient>
    <linearGradient id="dsSeaN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f2a44"/><stop offset="1" stop-color="#050d18"/></linearGradient>
    <linearGradient id="dsSeaD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6f98"/><stop offset="1" stop-color="#123a5a"/></linearGradient>
    <linearGradient id="dsHull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset=".55" stop-color="#c3ccd4"/><stop offset="1" stop-color="#7d8a96"/></linearGradient>
    <linearGradient id="dsCab" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6ecf1"/><stop offset="1" stop-color="#9aa7b2"/></linearGradient>
    <radialGradient id="dsHaloR"><stop offset="0" stop-color="var(--sig-red)" stop-opacity=".9"/><stop offset=".35" stop-color="var(--sig-red)" stop-opacity=".35"/><stop offset="1" stop-color="var(--sig-red)" stop-opacity="0"/></radialGradient>
    <radialGradient id="dsHaloW"><stop offset="0" stop-color="#fff6cf" stop-opacity=".95"/><stop offset=".35" stop-color="#ffe9a0" stop-opacity=".35"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
    <radialGradient id="dsHaloO"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset=".4" stop-color="#ff8a2a" stop-opacity=".4"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/></radialGradient>
    <linearGradient id="dsReflR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sig-red)" stop-opacity=".55"/><stop offset="1" stop-color="var(--sig-red)" stop-opacity="0"/></linearGradient>
    <linearGradient id="dsReflW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0" stop-opacity=".55"/><stop offset="1" stop-color="#fff0b0" stop-opacity="0"/></linearGradient>
    <linearGradient id="dsCan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b54a10"/><stop offset=".45" stop-color="#ff8a3a"/><stop offset="1" stop-color="#8a3508"/></linearGradient>
    <radialGradient id="dsSmokeO"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".95"/><stop offset=".7" stop-color="#ff8a2a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient>
    <radialGradient id="dsSmokeK"><stop offset="0" stop-color="#1a1a1a" stop-opacity=".95"/><stop offset=".7" stop-color="#2a2a2a" stop-opacity=".75"/><stop offset="1" stop-color="#3a3a3a" stop-opacity="0"/></radialGradient>
    <filter id="dsBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>
  </defs></svg>`;

  /* ── gradivni blokovi ── */
  const night=(n)=>`<rect width="${W}" height="${SEA}" fill="url(#dsNight)"/>`+[[20,18],[64,30],[150,14],[190,40],[110,24],[34,52],[172,62]].slice(0,n||7).map(([x,y])=>`<circle cx="${x}" cy="${y}" r=".8" fill="#dfe8ff" opacity=".7"/>`).join('');
  const day=()=>`<rect width="${W}" height="${SEA}" fill="url(#dsDay)"/><path d="M0,${SEA} L0,${SEA-10} C30,${SEA-16} 52,${SEA-8} 80,${SEA-12} L${W},${SEA-9} L${W},${SEA} Z" fill="#8aa6b8" opacity=".6"/>`;
  const sea=(dark)=>seaBackground(W,H,{y:SEA,night:dark}); // v4: zajedničko more
  // motorna brodica s boka: trup (gradijent), kabina, vodena linija, zrcaljenje u moru
  const boat=(x,f)=>{ const s=`<path d="M${x-44},${SEA-10} L${x+40},${SEA-10} C${x+46},${SEA-10} ${x+50},${SEA-14} ${x+54},${SEA-18} L${x+46},${SEA+2} L${x-40},${SEA+2} C${x-43},${SEA-2} ${x-44},${SEA-6} ${x-44},${SEA-10} Z" fill="url(#dsHull)" stroke="#3d4953" stroke-width=".8"/>
      <path d="M${x-40},${SEA-1} L${x+46},${SEA-1}" stroke="#2c4a66" stroke-width="1.6"/>
      <path d="M${x-20},${SEA-10} L${x-16},${SEA-24} L${x+12},${SEA-24} L${x+20},${SEA-10} Z" fill="url(#dsCab)" stroke="#3d4953" stroke-width=".8"/>
      <path d="M${x-12},${SEA-21} L${x+9},${SEA-21} L${x+14},${SEA-12} L${x-14},${SEA-12} Z" fill="#274a66"/>`;
    return `<g>${s}</g><g transform="translate(0,${2*SEA+4}) scale(1,-1)" opacity="${f?.18:.22}" filter="url(#dsBlur)">${s}</g>`; };
  // osoba na palubi, sprijeda: visina ~1,8 m u mjerilu brodice (stopala na palubi), glava ≈ 1/7 visine.
  // ruke: [kut nadlaktice, kut podlaktice, css klasa]; kut 0 = ravno dolje, 90 = vodoravno u stranu, 180 = gore.
  // vraća {svg, hl, hr}: položaj lijeve i desne šake (gledano od nas) za rekvizite.
  const person=(x,o)=>{ o=o||{}; const y=SEA-10, k=.9, N=o.night;
    const C=N?{v:'#b4561c',j:'#2a4258',t:'#161d25',s:'#a07a5c',h:'#20150e',f:'#0b1016'}
             :{v:'#ff7a1a',j:'#34536f',t:'#22303c',s:'#e2ae84',h:'#3a2618',f:'#141c24'};
    const rad=d=>d*Math.PI/180, W2=v=>+(v).toFixed(2);
    const arm=(side,a)=>{ if(!a) a=[8,4]; const sx=side*3.3, sy=-20.3;
      const ex=sx+side*Math.sin(rad(a[0]))*5.8, ey=sy+Math.cos(rad(a[0]))*5.8, hx=ex+side*Math.sin(rad(a[1]))*5.4, hy=ey+Math.cos(rad(a[1]))*5.4;
      return {svg:`<g class="${a[2]||''}"><path d="M${W2(sx)},${sy} L${W2(ex)},${W2(ey)} L${W2(hx)},${W2(hy)}" stroke="${C.j}" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${W2(hx)}" cy="${W2(hy)}" r="1.15" fill="${C.s}"/></g>`,
        h:[W2(x+hx*k),W2(y+hy*k)]}; };
    const L=arm(-1,o.l), Rr=arm(1,o.r);
    const body=`<path d="M-1.4,-12.4 L-1.9,-.9 M1.4,-12.4 L1.9,-.9" stroke="${C.t}" stroke-width="2.7" stroke-linecap="round"/>
      <path d="M-3.4,0 L-.9,0 M.9,0 L3.4,0" stroke="${C.f}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M-2.9,-13.4 L2.9,-13.4 L2.7,-11.6 L-2.7,-11.6 Z" fill="${C.t}"/>
      <path d="M-3.6,-20.6 Q0,-21.8 3.6,-20.6 L3,-12.8 Q0,-12.2 -3,-12.8 Z" fill="${C.v}"/>
      <path d="M-3.2,-15.6 L3.2,-15.6" stroke="#e8eef3" stroke-width=".7" opacity=".75"/><path d="M0,-21 L0,-13" stroke="#000" stroke-width=".4" opacity=".35"/>
      <rect x="-.8" y="-22.4" width="1.6" height="1.8" fill="${C.s}"/>
      <circle cx="0" cy="-24.3" r="2.3" fill="${C.s}"/><path d="M-2.35,-24.4 A2.35,2.35 0 0 1 2.35,-24.4 Q0,-25.3 -2.35,-24.4 Z" fill="${C.h}"/>`;
    return {svg:`<g transform="translate(${x},${y}) scale(${k})">${body}${L.svg}${Rr.svg}</g>`, hl:L.h, hr:Rr.h}; };
  const light=(x,y,halo,r,cls)=>`<g class="${cls||''}"><circle cx="${x}" cy="${y}" r="${r*6}" fill="url(#${halo})"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/></g>`;
  const refl=(x,g,cls)=>`<g class="${cls||''}"><rect x="${x-3}" y="${SEA+1}" width="6" height="${H-SEA}" fill="url(#${g})"/>
      <path d="M${x-8},${SEA+8} h16 M${x-6},${SEA+16} h12 M${x-9},${SEA+25} h18" stroke="url(#${g})" stroke-width="1.6" opacity=".8"/></g>`;
  // Morse traka: • kratko, ▬ dugo
  const morse=(pat,y,col)=>{ let x=W/2-((pat.length-1)*9+6)/2, g=''; for(const c of pat){ g+=c==='.'?`<circle cx="${x+3}" cy="${y}" r="2.6" fill="${col}"/>`:`<rect x="${x-3}" y="${y-2.6}" width="12" height="5.2" rx="2.6" fill="${col}"/>`; x+=c==='.'?9:15; } return g; };
  const horn=(x,y)=>`<g><rect x="${x-4}" y="${y-3}" width="8" height="6" rx="1" fill="#39434c"/><path d="M${x+4},${y-2} L${x+16},${y-8} L${x+16},${y+8} L${x+4},${y+2} Z" fill="url(#dsCab)" stroke="#39434c" stroke-width=".8"/></g>`;
  const arcs=(x,y,cls)=>`<g class="${cls||''}" stroke="#ffd166" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M${x},${y-7} q6,7 0,14"/><path d="M${x+7},${y-12} q10,12 0,24"/><path d="M${x+14},${y-17} q14,17 0,34"/></g>`;

  const SIG=[
    {id:'raketa',n:'Crvena raketa s padobranom',k:'vizualni',
     d:'Vizualni signal pogibelji: crvena raketa s padobranom.',
     svg:()=>night()+`<path d="M70,${SEA} C74,86 84,54 104,30" stroke="#c9d3db" stroke-width="1.4" fill="none" opacity=".35" stroke-dasharray="2 3"/>
       <g class="dsFall"><path d="M112,14 q12,-12 24,0 z" fill="#e8eef3" opacity=".9"/><path d="M112,14 L124,30 M136,14 L124,30" stroke="#cfd8df" stroke-width=".7"/>
       ${light(124,33,'dsHaloR',2.6,'dsGlow')}</g>`+sea(1)+refl(124,'dsReflR','dsFlick')},
    {id:'buktinja',n:'Ručna buktinja',k:'vizualni',
     d:'Vizualni signal pogibelji: ručna buktinja.',
     svg:()=>{ const p=person(70,{night:1,l:[10,4],r:[152,172]}), [hx,hy]=p.hr;
       return night()+boat(100,1)+p.svg+`<rect x="${hx-1.4}" y="${hy-11}" width="2.8" height="12" rx="1" fill="#8a1f16" transform="rotate(8 ${hx} ${hy})"/>`+light(hx+1.6,hy-13,'dsHaloR',3,'dsFlick')+sea(1)+refl(hx+1.6,'dsReflR','dsFlick'); }},
    {id:'dim',n:'Dimna kutija: žuti ili narančasti dim',k:'vizualni',
     d:'Vizualni signal pogibelji: dimna kutija sa <b>žutim ili narančastim</b> dimom.',
     svg:()=>day()+sea(0)+`<g class="dsSmoke">${[0,1,2,3,4].map(i=>`<circle class="dsPuff dsP${i}" cx="${118+i*10}" cy="${SEA-8-i*14}" r="${8+i*4}" fill="url(#dsSmokeO)"/>`).join('')}</g>
       <rect x="108" y="${SEA-6}" width="14" height="10" rx="2" fill="url(#dsCan)" stroke="#5a2505" stroke-width=".8"/><ellipse cx="115" cy="${SEA+4}" rx="12" ry="2.2" fill="none" stroke="#e8f4fb" stroke-width=".9" opacity=".7"/>`},
    {id:'ruke',n:'Ritmičko dizanje i spuštanje raširenih ruku',k:'vizualni',
     d:'Vizualni signal pogibelji: ritmičko dizanje i spuštanje raširenih ruku.',
     svg:()=>day()+sea(0)+boat(104)+person(72,{l:[90,90,'dsArmL'],r:[90,90,'dsArmR']}).svg},
    {id:'vatra',n:'Vatra s gustim crnim dimom',k:'vizualni',
     d:'Improvizirani vizualni signal pogibelji: vatra s <b>gustim crnim dimom</b>. Ne pali se benzinom.',
     svg:()=>day()+sea(0)+boat(92)+`<g class="dsSmoke">${[0,1,2,3,4].map(i=>`<circle class="dsPuff dsP${i}" cx="${80+i*9}" cy="${SEA-34-i*13}" r="${9+i*4}" fill="url(#dsSmokeK)"/>`).join('')}</g>
       <path d="M70,${SEA-10} L72,${SEA-22} L86,${SEA-22} L88,${SEA-10} Z" fill="#4a5058" stroke="#23282e" stroke-width=".8"/>
       <g class="dsFlick"><circle cx="79" cy="${SEA-28}" r="16" fill="url(#dsHaloO)"/><path d="M72,${SEA-22} C71,${SEA-30} 76,${SEA-32} 75,${SEA-40} C80,${SEA-34} 83,${SEA-36} 82,${SEA-44} C88,${SEA-36} 88,${SEA-28} 86,${SEA-22} Z" fill="#ff8a2a"/><path d="M75,${SEA-22} C75,${SEA-28} 79,${SEA-29} 79,${SEA-34} C83,${SEA-28} 84,${SEA-26} 83,${SEA-22} Z" fill="#ffd166"/></g>`},
    {id:'sosLight',n:'SOS svjetiljkom',k:'vizualni',
     d:'Vizualni signal pogibelji: SOS Morseovim znakovima, <b>tri kratka, tri duga, tri kratka</b> bljeska.',
     svg:()=>{ const p=person(70,{night:1,l:[8,4],r:[62,100]}), [hx,hy]=p.hr;
       return night()+boat(104,1)+p.svg+`<rect x="${hx-1}" y="${hy-2.6}" width="6.5" height="4.6" rx="1" fill="#39434c"/>`+
       light(hx+7.5,hy-.3,'dsHaloW',2.4,'dsSos')+sea(1)+refl(hx+7.5,'dsReflW','dsSos')+`<rect x="40" y="${H-17}" width="140" height="13" rx="6.5" fill="#050d18" opacity=".7"/>`+morse('...---...',H-10.5,'#fff0b0'); }},
    {id:'sosSound',n:'SOS zvučnom napravom',k:'zvučni',
     d:'Zvučni signal pogibelji: SOS, <b>tri kratka, tri duga, tri kratka</b> zvuka.',
     svg:()=>day()+sea(0)+boat(84)+horn(112,SEA-30)+arcs(132,SEA-30,'dsSos')+`<rect x="40" y="${H-17}" width="140" height="13" rx="6.5" fill="#050d18" opacity=".7"/>`+morse('...---...',H-10.5,'#ffd166')},
    {id:'neprekidan',n:'Neprekidan zvuk bilo kojom napravom',k:'zvučni',
     d:'Zvučni signal pogibelji: <b>neprekidan zvuk</b> bilo kojom napravom.',
     svg:()=>day()+sea(0)+boat(84)+horn(112,SEA-30)+arcs(132,SEA-30,'dsPulse')+`<rect x="40" y="${H-17}" width="140" height="13" rx="6.5" fill="#050d18" opacity=".7"/><rect x="52" y="${H-13}" width="116" height="5.2" rx="2.6" fill="#ffd166"/>`},
    {id:'pucnji',n:'Pucnji iz vatrenog oružja svake minute',k:'zvučni',
     d:'Zvučni signal pogibelji: pojedinačna pucnjava iz vatrenog oružja <b>u razmacima od jedne minute</b>.',
     svg:()=>day()+sea(0)+boat(80)+`<g class="dsBang"><path d="M128,${SEA-44} l4,8 l9,-3 l-5,8 l8,5 l-9,1 l1,9 l-6,-7 l-6,7 l1,-9 l-9,-1 l8,-5 l-5,-8 l9,3 z" fill="#ffd166" stroke="#e8801a" stroke-width=".8"/></g>
       <rect x="24" y="${H-19}" width="172" height="16" rx="8" fill="#050d18" opacity=".7"/>`+[46,110,174].map(x=>`<path d="M${x},${H-16} l2,4 l4,-1 l-2,4 l4,2 l-4,1 l1,4 l-3,-3 l-3,3 l1,-4 l-4,-1 l4,-2 l-2,-4 l4,1 z" fill="#ffd166"/>`).join('')+
       [78,142].map(x=>`<text x="${x}" y="${H-7.5}" font-size="8.5" fill="#e6eef5" text-anchor="middle" font-weight="700">1 min</text>`).join('')}
  ];
  const scene=(s,h)=>`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${s.n}" class="dsSvg" style="${h?'height:'+h+'px':''}">${s.svg()}</svg>`;

  // SOS ritam: točka 1, crta 3, razmak u znaku 1, razmak slova 3, pauza 7 jedinica (1 j = 0,2 s)
  (function(){ const seq=[]; const add=(on,n)=>seq.push([on,n]);
    const letter=p=>p.split('').forEach((c,i)=>{ add(1,c==='.'?1:3); if(i<p.length-1) add(0,1); });
    letter('...'); add(0,3); letter('---'); add(0,3); letter('...'); add(0,7);
    const T=seq.reduce((a,b)=>a+b[1],0); let t=0, k='';
    seq.forEach(([on,n])=>{ const a=(t/T*100).toFixed(2), b=((t+n)/T*100-.01).toFixed(2); k+=`${a}%,${b}%{opacity:${on?1:.08}}`; t+=n; });
    const st=document.createElement('style'); st.textContent=`@keyframes dsSos{${k}}.dsSos{animation:dsSos ${(T*.2).toFixed(1)}s linear infinite}`; document.head.appendChild(st); })();
  let quiz=false, score={c:0,t:0}, last=null;
  const area=document.createElement('div'); box.innerHTML=defs; box.appendChild(area);
  const scoreEl=el('distScore');
  function gallery(){
    const grp=k=>`<h4 class="dsGrp">${k==='vizualni'?'Vizualni znakovi':'Zvučni znakovi'} <span>(${SIG.filter(s=>s.k===k).length})</span></h4><div class="dsGal">${SIG.filter(s=>s.k===k).map(s=>`<div class="dsCard dsStatic" data-id="${s.id}">${scene(s)}<span class="dsName">${s.n}</span></div>`).join('')}</div>`;
    area.innerHTML=grp('vizualni')+grp('zvučni')+'<div class="dsDet"></div>'; return;
    $$('.dsCard',area).forEach(c=>c.addEventListener('click',()=>{ const s=SIG.find(x=>x.id===c.dataset.id);
      $$('.dsCard',area).forEach(x=>x.classList.toggle('on',x===c));
      $('.dsDet',area).innerHTML=`<div class="note mt12"><b>${s.n}</b>${s.d}</div>`; }));
  }
  function done(ok,s){ score.t++; if(ok){ score.c++; if(window.VB) VB.widgetOk('distress'); }
    if(scoreEl) scoreEl.textContent=`Rezultat: ${score.c}/${score.t}`;
    $('.dsDet',area).innerHTML=`<div class="expl"><b>${ok?'✓ Točno':'✗ Netočno'}: ${s.n}</b><br>${s.d}</div><div class="btnrow"><button class="btn p dsNext" type="button">Sljedeće</button></div>`;
    $('.dsNext',area).addEventListener('click',ask); }
  function ask(){
    let s; do{ s=rnd(SIG); }while(SIG.length>1 && s===last); last=s;
    const opts=shuffle([s].concat(shuffle(SIG.filter(x=>x!==s)).slice(0,3)));
    if(Math.random()<.5){ // a) prizor → značenje
      area.innerHTML=`<div class="split"><div class="svgbox" style="margin:0">${scene(s,200)}</div><div><p class="dsQ">Što ovo znači?</p>
        ${opts.map(o=>`<button class="opt dsOpt" data-id="${o.id}" type="button">${o.n}</button>`).join('')}</div></div><div class="dsDet"></div>`;
      $$('.dsOpt',area).forEach(b=>b.addEventListener('click',()=>{ const ok=b.dataset.id===s.id;
        $$('.dsOpt',area).forEach(x=>{ x.disabled=true; if(x.dataset.id===s.id) x.classList.add('correct'); else if(x===b) x.classList.add('wrong'); });
        done(ok,s); }));
    } else { // b) značenje → prizor
      area.innerHTML=`<p class="dsQ">Koji prizor prikazuje: <span class="c-acc">${s.n}</span>?</p>
        <div class="dsPick">${opts.map(o=>`<button class="dsCard dsOpt" data-id="${o.id}" type="button" aria-label="prizor">${scene(o)}</button>`).join('')}</div><div class="dsDet"></div>`;
      $$('.dsOpt',area).forEach(b=>b.addEventListener('click',()=>{ const ok=b.dataset.id===s.id;
        $$('.dsOpt',area).forEach(x=>{ x.disabled=true; if(x.dataset.id===s.id) x.classList.add('correct'); else if(x===b) x.classList.add('wrong');
          x.insertAdjacentHTML('beforeend',`<span class="dsName">${SIG.find(q=>q.id===x.dataset.id).n}</span>`); });
        done(ok,s); }));
    }
  }
  gallery();
  el('distQuizBtn').addEventListener('click',function(){
    quiz=!quiz; this.textContent=quiz?'Natrag na popis znakova':'Provjeri se'; this.classList.toggle('p',!quiz);
    score={c:0,t:0}; if(scoreEl) scoreEl.textContent='';
    quiz?ask():gallery();
  });
})();
