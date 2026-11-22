"use strict";
/* Zvučni signali: čuj i prepoznaj, zatrubi sam, ritam u magli. */
/* ═══════════════ ZVUČNI SIGNALI: ČUJ I PREPOZNAJ · ZATRUBI SAM · RITAM U MAGLI ═══════════════ */
/* Signali i značenja iz poglavlja „Zvučni signali" (isti popis kao u kartici za reprodukciju).
   Zvuk: vlastiti Web Audio kontekst, isti ton kao postojeći (pila 175 Hz); postojeća logika zvuka se ne dira. */
(function(){
  const sw=el('soundWidget'); if(!sw) return;
  const host=sw.closest('.card')||sw;
  host.insertAdjacentHTML('afterend','<div class="card" id="soundQuiz"></div>');
  const b=el('soundQuiz');
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SIG=[
    ['Jedan kratki','Mijenjam kurs UDESNO',[1]],
    ['Dva kratka','Mijenjam kurs ULIJEVO',[1,1]],
    ['Tri kratka','Vozim KRMOM (stroj radi nazad)',[1,1,1]],
    ['Pet kratkih','UPOZORENJE: ne razumijem tvoje namjere',[1,1,1,1,1]],
    ['Jedan dugi','Nailazim iza rta (punte) ili zavoja; u magli: brod na mehanički pogon koji se kreće',[4]],
    ['Dva duga','U magli: plovim, ali se ne krećem kroz vodu',[4,4]],
    ['Dugi + dva kratka','U magli: jedrilica, tegljenje, ribolov, nesposoban za manevriranje, ograničen',[4,1,1]],
    ['Četiri kratka','U magli: peljarski brod u službi',[1,1,1,1]],
    ['Dva duga + kratki','Želim pretjecati s TVOJE DESNE strane',[4,4,1]],
    ['Dva duga + dva kratka','Želim pretjecati s TVOJE LIJEVE strane',[4,4,1,1]],
    ['Dugi, kratki, dugi, kratki','Slažem se (odgovor na pretjecanje)',[4,1,4,1]]
  ];
  const mark=p=>'<span class="sg" aria-hidden="true">'+p.map(u=>u===1?'<i></i>':'<i class="l"></i>').join('')+'</span>';
  const words=p=>p.map(u=>u===1?'kratki':'dugi').join(', ');
  let real=false; // stvarno trajanje: kratki 1 s, dugi 4 s (poglavlje: dugi 4–6 s)
  const DUR=u=>real?(u===1?1:4):(u===1?.28:1.1), GAP=()=>real?1:.22;
  let ctx=null;
  const AC=()=>{ try{ ctx=ctx||new (window.AudioContext||window.webkitAudioContext)(); if(ctx.state==='suspended') ctx.resume(); }catch(e){ ctx=null; } return ctx; };
  function tone(t,d){ const c=AC(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type='sawtooth'; o.frequency.value=175;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.19,t+.02); g.gain.setValueAtTime(.19,t+d-.03); g.gain.linearRampToValueAtTime(0,t+d);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+d+.02); }
  let playTimer=[];
  function play(p,onSeg){ playTimer.forEach(clearTimeout); playTimer=[]; const c=AC(); let t=0;
    p.forEach((u,i)=>{ const d=DUR(u), at=t; if(c) tone(c.currentTime+.05+at,d);
      playTimer.push(setTimeout(()=>onSeg&&onSeg(i,true,u),50+at*1000),setTimeout(()=>onSeg&&onSeg(i,false,u),50+(at+d)*1000)); t+=d+GAP(); });
    return t; }
  // truba s valovima zvuka: svijetli dok signal traje
  const hornSvg=`<svg viewBox="0 0 220 120" class="sqHorn" role="img" aria-label="Truba"><defs><linearGradient id="sqBr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a0"/><stop offset=".5" stop-color="#d4a13c"/><stop offset="1" stop-color="#7a5616"/></linearGradient></defs>
    <rect x="18" y="50" width="30" height="20" rx="4" fill="#39434c"/><path d="M48,54 L104,34 L104,86 L48,66 Z" fill="url(#sqBr)" stroke="#5a3f10"/><ellipse cx="104" cy="60" rx="7" ry="26" fill="#b5842b" stroke="#5a3f10"/>
    <g class="sqWaves" opacity=".12">${[0,1,2].map(i=>`<path d="M${122+i*22},${30-i*8} Q${140+i*26},60 ${122+i*22},${90+i*8}" stroke="#ffd166" stroke-width="${4-i}" fill="none" stroke-linecap="round"/>`).join('')}</g></svg>`;
  let score=store.get('soundquiz',{ok:0,n:0}), mode='hear', cur=null, done=false;
  b.innerHTML=`<h4>Vježba: čuj i prepoznaj, zatrubi sam</h4>
    <div class="sqTop"><div class="sqTabs"><button class="knTab on" data-m="hear" type="button">Čuj i prepoznaj</button><button class="knTab" data-m="blow" type="button">Zatrubi sam</button><button class="knTab" data-m="fog" type="button">Ritam u magli</button></div>
    <label class="sqReal"><input type="checkbox" class="sqRealCb"> stvarno trajanje (kratki 1 s, dugi 4 s)</label></div>
    <div class="sqBody"></div>`;
  const body=$('.sqBody',b);
  const waves=on=>{ const w=$('.sqWaves',b); if(w) w.setAttribute('opacity',on?1:.12); const h=$('.sqHorn',b); if(h) h.classList.toggle('on',on); };
  const sc=()=>`<span class="sqSc">Točno ${score.ok} od ${score.n}</span>`;
  function result(ok,html){ score.n++; if(ok){ score.ok++; if(window.VB) VB.widgetOk('sound'); } store.set('soundquiz',score);
    $('.sqFb',b).innerHTML=`<div class="expl"><b>${ok?'✓ Točno.':'✗ Nije.'}</b> ${html}</div><div class="btnrow"><button class="btn p sqNext" type="button">Sljedeći</button>${sc()}</div>`;
    $('.sqNext',b).addEventListener('click',()=>mode==='hear'?hear():blow()); }

  /* ── 1. čuj i prepoznaj ── */
  function hear(){ done=false; cur=rnd(SIG); const opts=shuffle([cur].concat(shuffle(SIG.filter(s=>s!==cur)).slice(0,3)));
    body.innerHTML=`<div class="sqGrid"><div class="sqStage">${hornSvg}<div class="sqLive" aria-live="polite"></div><button class="btn sqPlay" type="button">Pusti ponovno</button></div>
      <div><p class="sqQ">Što znači ovaj signal?</p>${opts.map(o=>`<button class="opt sqOpt" data-i="${SIG.indexOf(o)}" type="button">${o[1]}</button>`).join('')}<div class="sqFb"></div></div></div>`;
    const go=()=>{ const live=$('.sqLive',b); live.innerHTML=''; play(cur[2],(i,on,u)=>{ waves(on); if(on) live.insertAdjacentHTML('beforeend',`<i class="${u===1?'':'l'}"></i>`); }); };
    $('.sqPlay',b).addEventListener('click',go);
    $$('.sqOpt',b).forEach(x=>x.addEventListener('click',()=>{ if(done) return; done=true; const ok=SIG[+x.dataset.i]===cur;
      $$('.sqOpt',b).forEach(y=>{ y.disabled=true; if(SIG[+y.dataset.i]===cur) y.classList.add('correct'); else if(y===x) y.classList.add('wrong'); });
      result(ok,`<b>${cur[0]}</b> ${mark(cur[2])} = ${cur[1]}.`); }));
    go(); }

  /* ── 2. zatrubi sam: drži tipku (miš, prst ili razmaknica) ── */
  let rec=[], downAt=0, osc=null, idle=null;
  const LONG=()=>real?2.5:.7; // granica kratki/dugi u sekundama
  function hornOn(){ if(done||downAt) return; const c=AC(); downAt=performance.now(); clearTimeout(idle); waves(true);
    if(c){ const o=c.createOscillator(), g=c.createGain(); o.type='sawtooth'; o.frequency.value=175; g.gain.setValueAtTime(0,c.currentTime); g.gain.linearRampToValueAtTime(.19,c.currentTime+.02);
      o.connect(g); g.connect(c.destination); o.start(); osc={o,g}; } }
  function hornOff(){ if(!downAt) return; const d=(performance.now()-downAt)/1000; downAt=0; waves(false);
    if(osc&&ctx){ const t=ctx.currentTime; osc.g.gain.cancelScheduledValues(t); osc.g.gain.setValueAtTime(osc.g.gain.value,t); osc.g.gain.linearRampToValueAtTime(0,t+.03); osc.o.stop(t+.05); osc=null; }
    if(d<.08) return; rec.push(d>=LONG()?4:1); drawRec(); clearTimeout(idle); idle=setTimeout(judge,real?2600:1400); }
  function drawRec(){ const r=$('.sqRec',b); if(r) r.innerHTML=rec.length?mark(rec)+`<span>${words(rec)}</span>`:'<span>Još ništa. Pritisni i drži trubu.</span>'; }
  function blow(){ done=false; rec=[]; cur=rnd(SIG);
    body.innerHTML=`<div class="sqGrid"><div class="sqStage"><button class="sqBtn" type="button" aria-label="Truba: drži za zvuk">${hornSvg}<span>Drži za zvuk</span></button>
      <p class="sqHint">Kratki: kratko pritisni. Dugi: drži ${real?'barem 2,5 s (na moru 4–6 s)':'barem 0,7 s (skraćeno)'}. Radi i razmaknica.</p></div>
      <div><p class="sqQ">Daj zvučni signal:</p><div class="sqTask">${cur[1]}</div><div class="sqRec"></div>
      <div class="btnrow"><button class="btn sqClr" type="button">Obriši</button><button class="btn p sqDone" type="button">Gotovo</button></div><div class="sqFb"></div></div></div>`;
    drawRec(); const btn=$('.sqBtn',b);
    btn.addEventListener('pointerdown',e=>{ e.preventDefault(); try{ btn.setPointerCapture(e.pointerId); }catch(_){ } hornOn(); });
    ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>btn.addEventListener(ev,hornOff));
    btn.addEventListener('keydown',e=>{ if((e.key===' '||e.key==='Enter')&&!e.repeat){ e.preventDefault(); hornOn(); } });
    btn.addEventListener('keyup',e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); hornOff(); } });
    $('.sqClr',b).addEventListener('click',()=>{ if(done) return; rec=[]; clearTimeout(idle); drawRec(); });
    $('.sqDone',b).addEventListener('click',judge); }
  function judge(){ if(done||!rec.length) return; done=true; clearTimeout(idle);
    const want=cur[2], ok=cur[0]==='Pet kratkih'? rec.length>=5&&rec.every(u=>u===1) : rec.join()===want.join();
    result(ok,`Traženo: <b>${cur[0]}</b> ${mark(want)}${cur[0]==='Pet kratkih'?' (najmanje pet)':''}. Ti si dao: ${mark(rec)} ${words(rec)}.`); }

  /* ── 3. ritam u magli: kad se signal ponavlja (vremenska traka 0–6 min) ── */
  function fog(){ const W=640, H=210, X0=196, X1=620, T=6, px=m=>X0+(X1-X0)*m/T;
    const rows=[['U plovidbi, kreće se','svake 2 min',2,[4]],['Plovi, ne kreće se','svake 2 min',2,[4,4]],['Jedrilica, tegalj, ribolov…','svake 2 min',2,[4,1,1]],['Usidren (zvono 5 s)','svake 1 min',1,'bell']];
    let g=`<rect width="${W}" height="${H}" rx="10" fill="#0b2135"/>`;
    for(let m=0;m<=T;m++) g+=`<line x1="${px(m)}" y1="18" x2="${px(m)}" y2="${H-26}" stroke="#22415c" stroke-dasharray="${m%2?'2 4':'0'}"/><text x="${px(m)}" y="${H-10}" text-anchor="middle" font-size="11" fill="#9fb6c9" font-family="var(--mono)">${m} min</text>`;
    rows.forEach(([n,ev,step,p],i)=>{ const y=40+i*40;
      g+=`<text x="12" y="${y+4}" font-size="12" fill="#e6eef5" font-weight="600">${n}</text><text x="12" y="${y+18}" font-size="10.5" fill="#9fb6c9">${ev}</text>`;
      for(let m=0;m<T;m+=step){ let x=px(m)+3;
        if(p==='bell') g+=`<rect x="${x}" y="${y-6}" width="${(X1-X0)/T/12}" height="12" rx="2" fill="#ffd166"/><text x="${x+14}" y="${y+4}" font-size="11" fill="#ffd166">zvono</text>`;
        else p.forEach(u=>{ const w=u===1?5:16; g+=`<rect x="${x}" y="${y-5}" width="${w}" height="10" rx="3" fill="#39b8e8"/>`; x+=w+4; }); } });
    body.innerHTML=`<div class="sqFog">${SVG(W,H,g,'role="img" aria-label="Vremenska traka: brodovi u plovidbi daju signal svake 2 minute, usidreni svake 1 minute"')}
      <p class="sqHint">Iz poglavlja: svi brodovi u plovidbi daju signal <b>svake 2 minute</b>, usidreni i nasukani <b>svake 1 minute</b>. Nasukani uz zvonjavu daje i po tri odvojena udarca zvonom prije i poslije.</p></div>`; }

  $('.sqTabs',b).addEventListener('click',e=>{ const t=e.target.closest('[data-m]'); if(!t) return; mode=t.dataset.m; playTimer.forEach(clearTimeout); hornOff();
    $$('.knTab',$('.sqTabs',b)).forEach(x=>x.classList.toggle('on',x===t)); ({hear,blow,fog})[mode](); });
  $('.sqRealCb',b).addEventListener('change',e=>{ real=e.target.checked; if(mode==='blow') blow(); });
  // prvi prikaz bez automatskog zvuka (preglednik ga ionako blokira prije klika)
  body.innerHTML=`<div class="sqIntro"><p>Signal se pusti, a ti biraš značenje. Ili dobiješ značenje i sam zatrubiš. Zvuk kreće tek na tvoj klik.</p><button class="btn p sqStart" type="button">Počni</button> ${sc()}</div>`;
  $('.sqStart',b).addEventListener('click',hear);
})();
