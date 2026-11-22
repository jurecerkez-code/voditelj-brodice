"use strict";
/* IALA oznake: kartice oznaka, lateralni prolaz. */
/* ═══════════════ IALA MARKS ═══════════════ */
const IALA_DEFS = (function(){
  // ritmovi prema karakteristikama iz teksta: Q = 60 bljeskova/min, LFl = dugi bljesak 2 s
  const Q=[.3,.7], rep=(n,x)=>Array.from({length:n},()=>x.slice());
  const RHYTHM={
    fl4:[[.5,3.5]],                              // lateralne: Fl R / Fl G 4s
    q:[Q],                                       // N: Q, neprekidno
    q3:rep(3,Q).map((x,i,a)=>i===a.length-1?[x[0],10-3+x[1]]:x),          // E: Q(3) 10s
    q6l:rep(6,Q).concat([[2,7]]),                // S: Q(6) + LFl 15s
    q9:rep(9,Q).map((x,i,a)=>i===a.length-1?[x[0],15-9+x[1]]:x),          // W: Q(9) 15s
    fl2:[[.5,1],[.5,3]],                         // usamljena opasnost: Fl(2) 5s
    lfl10:[[2,8]],                               // sigurna voda: LFl 10s
    fly5:[[1,4]]                                 // posebna oznaka: Fl Y 5s
  };
  function buoy(bands, top, lightCol, rh, vertical){
    // bands: array of colors from top of body downward (or left→right if vertical)
    let body='';
    if(vertical){
      const bw=26/bands.length;
      bands.forEach((col,i)=> body+=`<rect x="${-13+i*bw}" y="-4" width="${bw+0.6}" height="64" fill="${col}"/>`);
    } else {
      const bh=64/bands.length;
      bands.forEach((col,i)=> body+=`<rect x="-13" y="${-4+i*bh}" width="26" height="${bh+0.6}" fill="${col}"/>`);
    }
    let t='';
    const T=-14;
    // lateralne: vršna oznaka je iste boje kao oznaka (crveni valjak, zeleni čunj), ne crna
    if(top==='cone_up') t=`<polygon points="0,${T-24} -10,${T-4} 10,${T-4}" fill="${bands[0]}"/>`;
    if(top==='can') t=`<rect x="-9" y="${T-24}" width="18" height="21" fill="${bands[0]}"/>`;
    if(top==='2cone_up') t=`<polygon points="0,${T-48} -9,${T-30} 9,${T-30}" fill="#11161c"/><polygon points="0,${T-26} -9,${T-8} 9,${T-8}" fill="#11161c"/>`;
    if(top==='2cone_down') t=`<polygon points="0,${T-30} -9,${T-48} 9,${T-48}" fill="#11161c"/><polygon points="0,${T-8} -9,${T-26} 9,${T-26}" fill="#11161c"/>`;
    if(top==='2cone_base') t=`<polygon points="0,${T-48} -9,${T-30} 9,${T-30}" fill="#11161c"/><polygon points="0,${T-12} -9,${T-30} 9,${T-30}" fill="#11161c"/>`;
    if(top==='2cone_point') t=`<polygon points="0,${T-30} -9,${T-48} 9,${T-48}" fill="#11161c"/><polygon points="0,${T-30} -9,${T-12} 9,${T-12}" fill="#11161c"/>`;
    if(top==='2ball') t=`<circle cy="${T-40}" r="9" fill="#11161c"/><circle cy="${T-16}" r="9" fill="#11161c"/>`;
    if(top==='ball') t=`<circle cy="${T-16}" r="9" fill="#ef4a5a"/>`;
    if(top==='x') t=`<g stroke="#f5c542" stroke-width="4" stroke-linecap="round"><line x1="-10" y1="${T-26}" x2="10" y2="${T-6}"/><line x1="10" y1="${T-26}" x2="-10" y2="${T-6}"/></g>`;
    let light='';
    if(lightCol){
      // stvarni ritam svjetla: niz [svjetlo, tama] u sekundama (IALA karakteristika)
      const seq=RHYTHM[rh||'fl4'], tot=seq.reduce((a,x)=>a+x[0]+x[1],0);
      const kt=[], va=[], vg=[]; let acc=0;
      seq.forEach(([on,off])=>{ kt.push(acc/tot); va.push(1); vg.push(.3); acc+=on; kt.push(acc/tot); va.push(.08); vg.push(0); acc+=off; });
      const an=(vals)=>`<animate attributeName="opacity" calcMode="discrete" keyTimes="${kt.map(x=>x.toFixed(4)).join(';')}" values="${vals.join(';')}" dur="${tot}s" repeatCount="indefinite"/>`;
      light=`<circle cy="${T-56}" r="6" fill="${lightCol}">${an(va)}</circle><circle cy="${T-56}" r="11" fill="${lightCol}" opacity=".25">${an(vg)}</circle>`;
    }
    // crni dijelovi (vršna oznaka, pojasevi) dobivaju svijetli obrub da se vide na tamnoj pozadini stranice
    t=t.replace(/fill="#11161c"/g,'fill="#11161c" stroke="#b9c8d6" stroke-width="1.2"');
    body+=`<rect x="-13" y="-4" width="26" height="64" fill="none" stroke="#b9c8d6" stroke-width="1.2" opacity=".85"/>`;
    return `<g>${light}${t}<line x1="0" y1="${T-4}" x2="0" y2="${T}" stroke="#8795a1" stroke-width="3"/>${body}<path d="M-13,60 h26 l-6,10 h-14 Z" fill="#3a4a58"/></g>`;
  }
  return [
    {id:'lat_l',name:'Lateralna: LIJEVA strana',short:'Lateralna lijeva',
     svg:buoy(['#ef4a5a','#ef4a5a'],'can',SIG.r,'fl4'),
     desc:'<b>Crvena</b>, vršna oznaka <b>valjak (cilindar)</b>, crveno svjetlo. Označava <b>lijevu stranu</b> plovnog puta gledano u smjeru uplovljavanja. Ostavljam je s <b>lijeve strane</b>.'},
    {id:'lat_r',name:'Lateralna: DESNA strana',short:'Lateralna desna',
     svg:buoy(['#25c26a','#25c26a'],'cone_up',SIG.g,'fl4'),
     desc:'<b>Zelena</b>, vršna oznaka <b>čunj vrhom gore</b>, zeleno svjetlo. Označava <b>desnu stranu</b> plovnog puta pri uplovljavanju. Ostavljam je s <b>desne strane</b>.'},
    {id:'card_n',name:'Kardinalna SJEVERNA (N)',short:'Kardinalna N',
     svg:buoy(['#11161c','#f5c542'],'2cone_up',SIG.w,'q'),
     desc:'Čunjevi <b>oba vrhom GORE</b> ↑↑. Boje: <b>crno gore / žuto dolje</b>. Svjetlo: <b>bijelo, Q ili VQ: neprekidno treperi</b>. Prolazim <b>sa sjeverne strane</b> oznake.'},
    {id:'card_e',name:'Kardinalna ISTOČNA (E)',short:'Kardinalna E',
     svg:buoy(['#11161c','#f5c542','#11161c'],'2cone_base',SIG.w,'q3'),
     desc:'Čunjevi spojeni <b>BAZAMA</b> (oblik jajeta ◇, „<b>E</b>gg = <b>E</b>ast"). Boje: <b>crno / žuto / crno</b>. Svjetlo: <b>bijelo Q(3) 10s</b>. Prolazim <b>s istočne strane</b>.'},
    {id:'card_s',name:'Kardinalna JUŽNA (S)',short:'Kardinalna S',
     svg:buoy(['#f5c542','#11161c'],'2cone_down',SIG.w,'q6l'),
     desc:'Čunjevi <b>oba vrhom DOLJE</b> ↓↓. Boje: <b>žuto gore / crno dolje</b>. Svjetlo: <b>bijelo Q(6) + dugi bljesak, 15s</b>. Prolazim <b>s južne strane</b>.'},
    {id:'card_w',name:'Kardinalna ZAPADNA (W)',short:'Kardinalna W',
     svg:buoy(['#f5c542','#11161c','#f5c542'],'2cone_point',SIG.w,'q9'),
     desc:'Čunjevi spojeni <b>VRHOVIMA</b> (oblik čaše za vino ⧗, „<b>W</b>ine glass = <b>W</b>est"). Boje: <b>žuto / crno / žuto</b>. Svjetlo: <b>bijelo Q(9) 15s</b>. Prolazim <b>sa zapadne strane</b>.'},
    {id:'iso',name:'Usamljena opasnost',short:'Usamljena opasnost',
     svg:buoy(['#11161c','#ef4a5a','#11161c'],'2ball',SIG.w,'fl2'),
     desc:'<b>Crno, crveno, crno</b>, vršna oznaka <b>dvije crne kugle</b>. Svjetlo: <b>bijelo Bl(2)</b>. Postavljena <b>NA</b> opasnost oko koje je duboka voda. <b>Izbjegni je promjenom kursa</b>, ne prolazi blizu.'},
    {id:'safe',name:'Sigurna voda',short:'Sigurna voda',
     svg:buoy(['#ef4a5a','#ffffff','#ef4a5a','#ffffff','#ef4a5a'],'ball',SIG.w,'lfl10',true),
     desc:'<b>Crveno-bijele okomite pruge</b>, vršna oznaka <b>jedna crvena kugla</b>. Svjetlo: <b>bijelo</b>: Izo, Pr, LFl 10s ili Mo(A). Sa svih strana je <b>sigurna plovidba</b>: sredina plovnog puta, prilaz obali, landfall.'},
    {id:'spec',name:'Posebna oznaka',short:'Posebna oznaka',
     svg:buoy(['#f5c542','#f5c542'],'x',SIG.y,'fly5'),
     desc:'<b>Žuta</b>, vršna oznaka <b>žuti X</b>, žuto svjetlo. Označava posebno područje: kupalište, ispust, sidrište, vojnu zonu, mjerni uređaj, kabel. <b>Nije navigacijska opasnost.</b>'}
  ];
})();

(function(){
  const box=el('ialaWidget'); if(!box) return;
  let quiz=false, cur=null, score={c:0,t:0};
  function gallery(){
    let h='<div class="grid g4">';
    IALA_DEFS.forEach(m=>{
      h+=`<div class="card tight ialaCard" data-id="${m.id}" style="cursor:pointer;text-align:center">
        ${SVG(70,160,`<g transform="translate(35,88)">${m.svg}</g>`,'style="height:150px"')}
        <div style="font-size:12px;font-weight:700;margin-top:4px">${m.short}</div></div>`;
    });
    h+='</div><div id="ialaDet"></div>';
    box.innerHTML=h;
    $$('.ialaCard',box).forEach(c=>c.addEventListener('click',()=>{
      const m=IALA_DEFS.find(x=>x.id===c.dataset.id);
      el('ialaDet').innerHTML=`<div class="note mt14"><b>${m.name}</b>${m.desc}</div>`;
      el('ialaDet').scrollIntoView({behavior:'smooth',block:'nearest'});
    }));
  }
  function ask(){
    cur=rnd(IALA_DEFS);
    const opts=shuffle([cur].concat(shuffle(IALA_DEFS.filter(x=>x.id!==cur.id)).slice(0,3)));
    let h=`<div class="split"><div class="svgbox">${SVG(120,220,`<g transform="translate(60,120)">${cur.svg}</g>`,'style="height:220px"')}</div><div><p style="font-weight:700;font-size:17px">Koja je ovo oznaka?</p>`;
    opts.forEach(o=> h+=`<button class="opt ialaOpt" data-id="${o.id}">${o.name}</button>`);
    h+='</div></div><div id="ialaDet"></div>';
    box.innerHTML=h;
    $$('.ialaOpt',box).forEach(b=>b.addEventListener('click',()=>{
      score.t++;
      const ok=b.dataset.id===cur.id; if(ok)score.c++;
      if(ok && window.VB) VB.widgetOk('iala');
      $$('.ialaOpt',box).forEach(x=>{ x.disabled=true;
        if(x.dataset.id===cur.id) x.classList.add('correct');
        else if(x===b) x.classList.add('wrong'); });
      el('ialaScore').textContent=`Rezultat: ${score.c}/${score.t}`;
      el('ialaDet').innerHTML=`<div class="expl"><b>${cur.name}</b><br>${cur.desc}</div>
        <div class="btnrow"><button class="btn p" id="ialaNext">Sljedeća</button></div>`;
      el('ialaNext').addEventListener('click',ask);
    }));
  }
  gallery();
  el('ialaQuizBtn').addEventListener('click',function(){
    quiz=!quiz;
    this.textContent=quiz?'Natrag na pregled':'Kviz oznaka';
    this.classList.toggle('p',!quiz);
    if(quiz){score={c:0,t:0};el('ialaScore').textContent='';ask();} else {el('ialaScore').textContent='';gallery();}
  });
})();

/* lateral / cardinal / other galleries */
function markStrip(target, ids, extra){
  const b=el(target); if(!b) return;
  let g='', x=0, W=ids.length*130;
  ids.forEach((id,i)=>{
    const m=IALA_DEFS.find(x=>x.id===id);
    g+=`<g transform="translate(${65+i*130},130)">${m.svg}</g>`;
    g+=`<text x="${65+i*130}" y="215" text-anchor="middle" font-size="12" fill="${C.txt}" font-weight="700">${m.short}</text>`;
  });
  b.innerHTML=SVG(W,228,(extra||'')+g);
}
markStrip('cardinalWidget',['card_n','card_e','card_s','card_w']);
markStrip('otherMarksWidget',['iso','safe','spec']);

(function(){
  /* v3 · lateralne oznake u perspektivi: crvena = VALJAK (lijevo), zelena = ČUNJ (desno), obojene vršne oznake,
     svjetiljka blješti po ritmu Bl 4s (isti RHYTHM.fl4 kao u galeriji oznaka), voda s refleksijama, brodica s tragom. */
  const b=el('lateralWidget'); if(!b) return;
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W=680,H=300, HOR=78;
  const flash=(on,dur,begin)=>RM?'':`<animate attributeName="opacity" calcMode="discrete" keyTimes="0;${(on/dur).toFixed(3)};1" values="1;.12;.12" dur="${dur}s" begin="${begin||0}s" repeatCount="indefinite"/>`;
  const defs=`<defs>
    <linearGradient id="lwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c3a55"/><stop offset="1" stop-color="#3f6a8a"/></linearGradient>
    <linearGradient id="lwSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a6186"/><stop offset=".45" stop-color="#1a4a6c"/><stop offset="1" stop-color="#0b2a44"/></linearGradient>
    <linearGradient id="lwRed" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8a86"/><stop offset=".35" stop-color="#e8414a"/><stop offset="1" stop-color="#8e1a24"/></linearGradient>
    <linearGradient id="lwGrn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7fe8a8"/><stop offset=".35" stop-color="#22b562"/><stop offset="1" stop-color="#0e5e33"/></linearGradient>
    <linearGradient id="lwMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9d3db"/><stop offset=".5" stop-color="#8795a1"/><stop offset="1" stop-color="#3c4852"/></linearGradient>
    <linearGradient id="lwHull" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f7fa"/><stop offset=".6" stop-color="#cfd8df"/><stop offset="1" stop-color="#8d9aa6"/></linearGradient>
    <radialGradient id="lwHR"><stop offset="0" stop-color="var(--sig-red)" stop-opacity=".95"/><stop offset=".35" stop-color="var(--sig-red)" stop-opacity=".35"/><stop offset="1" stop-color="var(--sig-red)" stop-opacity="0"/></radialGradient>
    <radialGradient id="lwHG"><stop offset="0" stop-color="var(--sig-green)" stop-opacity=".95"/><stop offset=".35" stop-color="var(--sig-green)" stop-opacity=".35"/><stop offset="1" stop-color="var(--sig-green)" stop-opacity="0"/></radialGradient>
    <radialGradient id="lwHW"><stop offset="0" stop-color="#fffbe6" stop-opacity=".95"/><stop offset=".4" stop-color="#fff2c0" stop-opacity=".3"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></radialGradient>
    <linearGradient id="lwRefR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sig-red)" stop-opacity=".5"/><stop offset="1" stop-color="var(--sig-red)" stop-opacity="0"/></linearGradient>
    <linearGradient id="lwRefG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sig-green)" stop-opacity=".5"/><stop offset="1" stop-color="var(--sig-green)" stop-opacity="0"/></linearGradient>
    <filter id="lwBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="lwSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  // oznaka: s = mjerilo (perspektiva), crvena = valjak, zelena = čunj; ishodište = vodena linija
  function mark(x,y,s,red,begin){
    const r=red?13:15;
    const body=red
      ? `<path d="M-13,-44 L-13,12 A13,4 0 0 0 13,12 L13,-44 Z" fill="url(#lwRed)"/><ellipse cx="0" cy="-44" rx="13" ry="4" fill="#ff9c96" stroke="#8e1a24" stroke-width=".8"/>`
      : `<path d="M-4,-50 L-15,12 A15,4.4 0 0 0 15,12 L4,-50 Z" fill="url(#lwGrn)"/><ellipse cx="0" cy="-50" rx="4" ry="1.3" fill="#9af0bd"/>`;
    const wet=`<path d="M-${r},2 L-${r},12 A${r},4 0 0 0 ${r},12 L${r},2 A${r},4 0 0 1 -${r},2 Z" fill="#000" opacity=".35"/>`;
    const lamp=`<rect x="-1.4" y="${red?-66:-70}" width="2.8" height="18" fill="url(#lwMetal)"/><rect x="-4" y="${red?-76:-80}" width="8" height="10" rx="2" fill="url(#lwMetal)" stroke="#2a343c" stroke-width=".6"/>`;
    const ly=red?-72:-76;
    const light=`<g>${flash(.5,4,begin)}<circle cy="${ly}" r="16" fill="url(#${red?'lwHR':'lwHG'})"/><circle cy="${ly}" r="3" fill="${red?'#ffd2cf':'#d4ffe6'}"/></g>`;
    const top=red?`<rect x="-1.2" y="-96" width="2.4" height="20" fill="url(#lwMetal)"/><path d="M-7,-108 L-7,-94 A7,2.2 0 0 0 7,-94 L7,-108 Z" fill="url(#lwRed)"/><ellipse cx="0" cy="-108" rx="7" ry="2.2" fill="#ff9c96"/>`
                  :`<rect x="-1.2" y="-100" width="2.4" height="20" fill="url(#lwMetal)"/><path d="M0,-116 L-8,-98 A8,2.4 0 0 0 8,-98 Z" fill="url(#lwGrn)"/>`;
    return `<g transform="translate(${x},${y}) scale(${s})">
      <g transform="scale(1,-1) translate(0,-8)" opacity=".25" filter="url(#lwBlur)">${top}${lamp}${body}</g>
      <rect x="-3" y="4" width="6" height="60" fill="url(#${red?'lwRefR':'lwRefG'})" opacity=".8">${flash(.5,4,begin)}</rect>
      <g class="lwBob">${top}${lamp}${body}${wet}${light}</g>
      <ellipse cx="0" cy="12" rx="${r+9}" ry="5" fill="none" stroke="#bfe6ff" stroke-width="1" opacity=".55"/><ellipse cx="0" cy="13" rx="${r+17}" ry="7" fill="none" stroke="#bfe6ff" stroke-width=".7" opacity=".3"/></g>`;
  }
  let g=defs+`<rect width="${W}" height="${HOR}" fill="url(#lwSky)"/>`;
  // obala s ulazom u luku (lukobrani) na obzoru
  g+=`<path d="M0,${HOR} L0,58 C60,52 120,56 170,50 C220,44 250,52 290,60 L300,${HOR} Z M${W},${HOR} L${W},54 C620,48 560,54 500,50 C460,47 420,54 390,60 L380,${HOR} Z" fill="#20364a"/>
    <path d="M290,${HOR-2} L318,${HOR-6} M362,${HOR-6} L390,${HOR-2}" stroke="#6a8397" stroke-width="3" stroke-linecap="round"/>
    <text x="${W/2}" y="30" text-anchor="middle" font-size="12" fill="${C.txt2}" letter-spacing=".08em">ULAZ U LUKU ▲</text>`;
  g+=seaBackground(W,H,{y:HOR}); // v4: zajedničko more
  g+=`<path d="M${W/2-30},${HOR} L${W/2+30},${HOR} L${W-120},${H} L120,${H} Z" fill="#6fb6e0" opacity=".07"/>`;
  // udaljeni par (manji), bliži par (veći)
  g+=mark(262,128,.42,true,.6)+mark(418,128,.42,false,.6);
  g+=mark(150,212,.95,true,0)+mark(530,212,.95,false,0);
  g+=`<text x="150" y="258" text-anchor="middle" font-size="13" fill="${C.red}" font-weight="800" paint-order="stroke" stroke="#0b2a44" stroke-width="3">CRVENA, lijevo, valjak</text>
      <text x="150" y="274" text-anchor="middle" font-size="11" fill="#ffb4b0" font-family="var(--mono)">C Bl 4s</text>
      <text x="530" y="258" text-anchor="middle" font-size="13" fill="${C.green}" font-weight="800" paint-order="stroke" stroke="#0b2a44" stroke-width="3">ZELENA, desno, čunj</text>
      <text x="530" y="274" text-anchor="middle" font-size="11" fill="#b4f5cf" font-family="var(--mono)">Z Bl 4s</text>`;
  // brodica (<12 m) odozgo-straga: trag pjene, sveokružno bijelo + crveno lijevo + zeleno desno
  g+=`<g transform="translate(340,226)">
      <path class="lwWake" d="M-10,22 L-58,80 L-40,80 L-4,30 Z M10,22 L58,80 L40,80 L4,30 Z" fill="#e8f6ff" opacity=".35" filter="url(#lwSoft)"/>
      <path d="M-9,24 C-6,48 6,48 9,24 Z" fill="#fff" opacity=".45" filter="url(#lwSoft)"/>
      <ellipse cx="0" cy="6" rx="18" ry="30" fill="#000" opacity=".25" filter="url(#lwSoft)"/>
      <path d="M0,-30 C10,-20 13,-4 12,20 L-12,20 C-13,-4 -10,-20 0,-30 Z" fill="url(#lwHull)" stroke="#3d4953" stroke-width="1"/>
      <path d="M-7,-6 L7,-6 L6,10 L-6,10 Z" fill="#2c4a66" stroke="#1a2c3c" stroke-width=".6"/>
      <circle cx="-11.5" cy="-8" r="7" fill="url(#lwHR)"/><circle cx="-11.5" cy="-8" r="2" fill="#ffd2cf"/>
      <circle cx="11.5" cy="-8" r="7" fill="url(#lwHG)"/><circle cx="11.5" cy="-8" r="2" fill="#d4ffe6"/>
      <circle cx="0" cy="-16" r="8" fill="url(#lwHW)"/><circle cx="0" cy="-16" r="2.2" fill="#fff"/></g>`;
  g+=`<text x="${W/2}" y="${H-6}" text-anchor="middle" font-size="12" fill="${C.acc}" font-weight="700" paint-order="stroke" stroke="#0b2a44" stroke-width="3">▲ SMJER UPLOVLJAVANJA (s mora prema luci)</text>`;
  b.innerHTML=SVG(W,H,g,'class="lwSvg" role="img" aria-label="Lateralne oznake pri uplovljavanju: crvena lijevo, zelena desno"');
})();
