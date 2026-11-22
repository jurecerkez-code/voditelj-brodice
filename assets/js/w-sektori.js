"use strict";
/* Sektori svjetionika: vježba na karti. */
/* ═══════════════ SEKTORI SVJETIONIKA (vježba na karti) ═══════════════
   Kutovi su azimuti od svjetla (0° = sjever karte, u smjeru kazaljke). Brod vidi boju sektora u kojem se nalazi.
   Ritam: isti zapis kao u „Karakteristici svjetla“ ([početak, trajanje] u sekundama unutar perioda). */
(function(){
  const b=el('sectorLab'); if(!b) return;
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W=560,H=380, L=[280,78], RMAX=300;
  const COLN={B:'bijelo',C:'crveno',Z:'zeleno',P:'zatamnjeno'};
  const COLF={B:'#fff4c4',C:'var(--sig-red)',Z:'var(--sig-green)',P:'#6b7680'};
  const COLA={B:'#c9a227',C:'#d62828',Z:'#1a9e55',P:'#555'};
  // ritam svjetla prema zapisu
  function rhythm(t,n,P){ if(t==='Izo') return [[0,P/2]]; if(t==='Pr') return [[0,P-1]];
    const f=.5,g=.9; return Array.from({length:n},(_,i)=>[i*(f+g),f]); }
  const EX=[
    {ch:'B C Z Bl 5s 18m 12-9 M',t:'Bl',n:1,P:5, sec:[['Z',115,163],['B',163,197],['C',197,245]], rocks:[[222,150]], shoal:[[138,120]],
     pos:[['A',181,190],['B',214,210],['C',136,170]]},
    {ch:'B C Bl(3) 10s 21m 15-10 M',t:'Bl',n:3,P:10, sec:[['B',100,205],['C',205,262]], rocks:[[232,140],[244,190]],
     pos:[['A',150,200],['B',236,165],['C',212,105]]},
    {ch:'B Z Izo 4s 12m 6 M',t:'Izo',n:1,P:4, sec:[['Z',105,168],['B',168,255]], shoal:[[130,150]],
     pos:[['A',128,120],['B',200,205],['C',172,250]]},
    {ch:'B C Z Pr 6s 15m 10-7 M',t:'Pr',n:1,P:6, sec:[['C',100,152],['B',152,178],['Z',178,238]], rocks:[[125,150]], shoal:[[208,160]],
     pos:[['A',165,215],['B',120,200],['C',222,120]]},
    {ch:'B Bl(2) 6s 14m 10 M, Pot',t:'Bl',n:2,P:6, sec:[['B',100,203],['P',203,238],['B',238,262]], islet:[220,70],
     pos:[['A',222,190],['B',170,220],['C',250,170]]},
    {ch:'B C Bl(4) 10s 21m 15-10 M',t:'Bl',n:4,P:10, sec:[['C',108,150],['B',150,200],['C',200,255]], rocks:[[128,130],[232,150]],
     pos:[['A',178,240],['B',140,110],['C',226,215]]}
  ];
  const pt=(brg,d)=>{ const q=brg*Math.PI/180; return [L[0]+Math.sin(q)*d, L[1]-Math.cos(q)*d]; };
  const f1=v=>v.toFixed(1);
  const inSec=(s,brg)=>brg>=s[1]&&brg<s[2];
  let k=0, ans={}, anim=null, vis=true, score=store.get('sectors',{ok:0,n:0});

  function wedge(s,r){ const a=pt(s[1],r), c=pt(s[2],r), big=s[2]-s[1]>180?1:0;
    return `M${L[0]},${L[1]} L${f1(a[0])},${f1(a[1])} A${r},${r} 0 ${big} 1 ${f1(c[0])},${f1(c[1])} Z`; }
  function arc(s,r){ const a=pt(s[1],r), c=pt(s[2],r); return `M${f1(a[0])},${f1(a[1])} A${r},${r} 0 ${s[2]-s[1]>180?1:0} 1 ${f1(c[0])},${f1(c[1])}`; }
  function chart(e){
    let g=`<defs><linearGradient id="slSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7f5"/><stop offset="1" stop-color="#e3edf1"/></linearGradient>
      <linearGradient id="slLand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e39c"/><stop offset="1" stop-color="#e2c56c"/></linearGradient>
      <radialGradient id="slHalo"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset=".3" stop-color="#ffe98a" stop-opacity=".45"/><stop offset="1" stop-color="#ffe98a" stop-opacity="0"/></radialGradient>
      <clipPath id="slClip"><rect width="${W}" height="${H}"/></clipPath></defs>`;
    g+=`<rect width="${W}" height="${H}" fill="url(#slSea)"/><g clip-path="url(#slClip)">`;
    // plićine i obalni pojas < 10 m
    const coast=`M-10,-10 L-10,52 C60,60 120,48 180,58 C220,64 250,60 266,70 C272,74 276,78 280,80 C286,78 292,72 300,68 C330,56 380,62 430,54 C480,46 520,58 570,50 L570,-10 Z`;
    g+=`<path d="${coast}" fill="#cfe6f3" stroke="#cfe6f3" stroke-width="26" stroke-linejoin="round"/>`;
    (e.shoal||[]).forEach(([br,d])=>{ const p=pt(br,d); g+=`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="34" ry="18" fill="#cfe6f3" stroke="#6fa6c8" stroke-width=".9" stroke-dasharray="3 2"/><text x="${f1(p[0])}" y="${f1(p[1]+4)}" font-size="9" fill="#3d5a70" text-anchor="middle" font-style="italic">plićina</text>`; });
    // sektori: blagi ton + granice
    g+=`<g class="slSecs">`+e.sec.map(s=>s[0]==='P'?'':`<path d="${wedge(s,RMAX)}" fill="${COLF[s[0]]}" opacity=".16" class="slTint"/>`).join('')+`</g>`;
    e.sec.forEach(s=>{ [s[1],s[2]].forEach(a=>{ const p=pt(a,RMAX); if(s[0]==='P'){
        const n=[Math.cos(a*Math.PI/180)*2.2, Math.sin(a*Math.PI/180)*2.2];
        g+=`<path d="M${f1(L[0]-n[0])},${f1(L[1]-n[1])} L${f1(p[0]-n[0])},${f1(p[1]-n[1])} M${f1(L[0]+n[0])},${f1(L[1]+n[1])} L${f1(p[0]+n[0])},${f1(p[1]+n[1])}" stroke="#444" stroke-width=".8" stroke-dasharray="6 4"/>`; }
      else g+=`<path d="M${L[0]},${L[1]} L${f1(p[0])},${f1(p[1])}" stroke="#555" stroke-width=".7"/>`; }); });
    e.sec.forEach(s=>{ if(s[0]!=='P') g+=`<path d="${arc(s,56)}" stroke="${COLA[s[0]]}" stroke-width="6" fill="none" stroke-linecap="butt" opacity=".9"/>`;
      const m=pt((s[1]+s[2])/2,68); g+=`<text x="${f1(m[0])}" y="${f1(m[1]+4)}" font-size="11" font-weight="600" fill="${s[0]==='P'?'#444':COLA[s[0]]}" text-anchor="middle" paint-order="stroke" stroke="#f4f7f5" stroke-width="3">${s[0]==='P'?'Pot':s[0]}</text>`; });
    // hridi (križić s točkastim krugom)
    (e.rocks||[]).forEach(([br,d])=>{ const p=pt(br,d); g+=`<g transform="translate(${f1(p[0])},${f1(p[1])})"><circle r="9" fill="none" stroke="#333" stroke-width=".8" stroke-dasharray="1.5 2"/><path d="M-4,0 H4 M0,-4 V4" stroke="#222" stroke-width="1.4"/></g>`; });
    if(e.islet){ const p=pt(e.islet[0],e.islet[1]); g+=`<path d="M${f1(p[0]-16)},${f1(p[1]+2)} C${f1(p[0]-14)},${f1(p[1]-10)} ${f1(p[0]+8)},${f1(p[1]-12)} ${f1(p[0]+15)},${f1(p[1]-2)} C${f1(p[0]+17)},${f1(p[1]+8)} ${f1(p[0]-6)},${f1(p[1]+12)} ${f1(p[0]-16)},${f1(p[1]+2)} Z" fill="url(#slLand)" stroke="#8a7432" stroke-width="1"/><text x="${f1(p[0]-22)}" y="${f1(p[1]+4)}" font-size="9" fill="#6b5a22" font-style="italic" text-anchor="end">hrid Mala</text>`; }
    g+=`<path d="${coast}" fill="url(#slLand)" stroke="#8a7432" stroke-width="1.2" stroke-linejoin="round"/>`;
    g+=`<text x="70" y="30" font-size="12" fill="#6b5a22" font-style="italic">rt Vela glava</text>`;
    // svjetionik: kartografski znak (točka + magenta bljesak), jezgra i halo za bljeskanje
    g+=`<g class="slFlash" opacity="0"><circle cx="${L[0]}" cy="${L[1]}" r="46" fill="url(#slHalo)"/></g>`;
    g+=`<circle cx="${L[0]}" cy="${L[1]}" r="3.2" fill="#222"/><path d="M${L[0]},${L[1]} L${L[0]-7},${L[1]+20} A21,21 0 0 0 ${L[0]+7},${L[1]+20} Z" fill="#c2185b" opacity=".75"/>`;
    g+=`<text x="${L[0]+12}" y="${L[1]-8}" font-size="10.5" fill="#222" font-weight="600">${e.ch}</text>`;
    // brodovi na pozicijama
    e.pos.forEach(([id,br,d])=>{ const p=pt(br,d), a=ans[id];
      if(a) g+=`<path d="M${f1(p[0])},${f1(p[1])} L${L[0]},${L[1]}" stroke="${COLA[a.c]}" stroke-width="1.4" stroke-dasharray="4 3" opacity=".8"/>`;
      g+=`<g transform="translate(${f1(p[0])},${f1(p[1])}) rotate(${(br+180)%360})"><path d="M0,-9 C4,-6 4.5,2 3.5,8 L-3.5,8 C-4.5,2 -4,-6 0,-9 Z" fill="#2a4a66" stroke="#0d1e2c" stroke-width=".8"/></g>
        <circle cx="${f1(p[0]+14)}" cy="${f1(p[1]-12)}" r="9" fill="${a?(a.ok?'#25c26a':'#ef4a5a'):'#0e3350'}" stroke="#fff" stroke-width="1.2"/><text x="${f1(p[0]+14)}" y="${f1(p[1]-8.5)}" font-size="10.5" fill="#fff" font-weight="600" text-anchor="middle">${id}</text>`; });
    g+=`</g><rect x=".5" y=".5" width="${W-1}" height="${H-1}" fill="none" stroke="#222"/>`;
    g+=`<text x="${W-8}" y="${H-8}" font-size="9" fill="#555" text-anchor="end">Vježbovna karta, izmišljeno područje</text>`;
    return g;
  }
  function draw(){ const e=EX[k];
    $('.slSvg',b).innerHTML=chart(e);
    $('.slHead',b).innerHTML=`Vježba <b>${k+1}</b> / ${EX.length}, karakteristika <code>${e.ch}</code>`;
    $('.slRows',b).innerHTML=e.pos.map(([id])=>{ const a=ans[id];
      return `<div class="slRow"><span class="slId">${id}</span>${['B','C','Z','P'].map(c=>`<button class="opt slOpt${a?(c===a.right?' correct':c===a.c&&!a.ok?' wrong':''):''}" data-p="${id}" data-c="${c}" ${a?'disabled':''} type="button">${COLN[c]}</button>`).join('')}</div>`; }).join('');
    $('.slScore',b).textContent=score.n?`Ukupno: ${score.ok} / ${score.n} točnih`:'';
  }
  function explain(e,id,c){ const p=e.pos.find(x=>x[0]===id), s=e.sec.find(x=>inSec(x,p[1])), right=s[0];
    const why={B:'Bijeli sektor pokriva siguran prolaz: ploviš u njemu.',
      C:'Crveni sektor najčešće pokriva područje opasno za plovidbu (ovdje '+((e.rocks||[]).length?'hridi':'plićinu')+'). Promijeni kurs udesno ili ulijevo dok ne izađeš na bijelo svjetlo.',
      Z:'Zeleni sektor je bočna granica sigurnog prolaza: ovdje pokriva plićinu. Vrati se u bijeli sektor.',
      P:'Pozicija je u sektoru zatamnjenja (Pot): hrid zaklanja svjetlo i ne vidiš ga. Na karti je taj sektor omeđen dvostrukim isprekidanim crtama. Zatamnjeni sektor obično pokriva opasno područje.'}[right];
    return {right, ok:c===right, t:`<b>Pozicija ${id}: ${COLN[right]}.</b> Brod je unutar sektora ${right==='P'?'Pot':right} (od ${s[1]}° do ${s[2]}° gledano od svjetla). ${why}`}; }
  b.innerHTML=`<div class="slHead"></div><div class="slWrap"><svg class="slSvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Karta sa sektorima svjetionika"></svg></div>
    <p class="slAsk">Koju boju svjetla vidi brod na svakoj poziciji?</p><div class="slRows"></div><div class="slOut"></div>
    <div class="btnrow"><button class="btn p slNext" type="button">Sljedeća vježba</button><span class="slScore"></span></div>`;
  b.addEventListener('click',ev=>{ const o=ev.target.closest('.slOpt'); if(!o) return; const e=EX[k], id=o.dataset.p;
    if(ans[id]) return; const r=explain(e,id,o.dataset.c); ans[id]={c:r.right,ok:r.ok,right:r.right};
    score.n++; if(r.ok){ score.ok++; if(window.VB) VB.widgetOk('sectors'); } store.set('sectors',score);
    $('.slOut',b).insertAdjacentHTML('beforeend',`<div class="expl ${r.ok?'slG':'slB'}">${r.ok?'✓':'✗'} ${r.t}</div>`); draw(); });
  $('.slNext',b).addEventListener('click',()=>{ k=(k+1)%EX.length; ans={}; $('.slOut',b).innerHTML=''; draw(); });
  draw();
  // bljeskanje prema karakteristici: svi sektori zasvijetle istovremeno, u svojoj boji
  if(!RM){ const t0=performance.now();
    const loop=now=>{ anim=requestAnimationFrame(loop); if(!vis) return; const e=EX[k], t=((now-t0)/1000)%e.P;
      const on=rhythm(e.t,e.n,e.P).some(([s,d])=>t>=s&&t<s+d);
      const fl=$('.slFlash',b); if(fl) fl.setAttribute('opacity',on?1:0);
      $$('.slTint',b).forEach(x=>x.setAttribute('opacity',on?.34:.12)); };
    anim=requestAnimationFrame(loop);
    if('IntersectionObserver' in window) new IntersectionObserver(es=>{ vis=es[0].isIntersecting; }).observe(b); }
  else { const fl=()=>{ const f=$('.slFlash',b); if(f) f.setAttribute('opacity',.8); }; fl(); b.addEventListener('click',()=>setTimeout(fl,0)); }
})();
