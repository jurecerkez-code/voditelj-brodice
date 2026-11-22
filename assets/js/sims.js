"use strict";
/* Simulacije i drilovi: pristajanje, sidrenje, čovjek u moru, požar, MAYDAY redoslijed, fonetska abeceda. */
/* ═══════════════ SIMULACIJE I DRILOVI ═══════════════ */
const SIM={
  RM: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
  // brodica odozgo, pramac prema gore, duljina ~36 px
  boat(x,y,h,o){ o=o||{}; const s=o.s||1;
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${h.toFixed(1)}) scale(${s})">
      <path d="M0,-19 C8,-10 9,6 8,17 L-8,17 C-9,6 -8,-10 0,-19 Z" fill="${o.fill||'#e8eef3'}" stroke="#1d2b36" stroke-width="1.3"/>
      <path d="M-5,-2 h10 v9 h-10 Z" fill="#9fb6c9" stroke="#1d2b36" stroke-width=".8"/>
      ${o.rud!=null?`<line x1="0" y1="17" x2="${Math.sin(o.rud*Math.PI/180)*-7}" y2="${17+Math.cos(o.rud*Math.PI/180)*7}" stroke="#ef4a5a" stroke-width="2.4" stroke-linecap="round"/>`:''}
      ${o.prop?`<circle cx="0" cy="19" r="3" fill="none" stroke="#ffd166" stroke-width="1.5" stroke-dasharray="3 2"><animateTransform attributeName="transform" type="rotate" from="0 0 19" to="${o.prop>0?360:-360} 0 19" dur=".5s" repeatCount="indefinite"/></circle>`:''}
    </g>`; },
  water(W,H,id){ return seaBackground(W,H,{view:'top'}); }, // v4: zajedničko more (ptičja perspektiva)
  ctl(){ return `<div class="knCtl"><button class="btn" data-a="first" aria-label="Na početak" title="Na početak">Početak</button><button class="btn" data-a="prev">Nazad</button><button class="btn p" data-a="play">Reproduciraj</button><button class="btn" data-a="next">Dalje</button></div><div class="knProg"></div>`; }
};

/* ── ČOVJEK U MORU ── */
(function(){
  const b=el('mobSim'); if(!b) return;
  const W=640,H=380;
  /* Putanja nije nacrtana rukom: manevar vozi isti model brodice kao simulator pristajanja (MobPhys.track u fizika.js).
     Brodica 6 m plovi 4 čv prema sjeveru, vjetar 10 čv u pramac. Uzorak svakih 0,05 s; crtež je u mjerilu 6 px = 1 m. */
  const PPM=6, X0=320, Y0=272, DT=MobPhys.DT;
  const TR=MobPhys.track(), LEN=TR.ev.end, FALL=TR.ev.fall, px=o=>[X0+o.x*PPM,Y0+o.y*PPM];
  const at=q=>{ q=Math.max(0,Math.min(LEN,q)); const i=Math.floor(q), f=q-i, a=TR.out[i], c=TR.out[Math.min(LEN,i+1)], m=(u,v)=>u+(v-u)*f, [x,y]=px({x:m(a.x,c.x),y:m(a.y,c.y)});
    return {x,y,h:m(a.h,c.h),rud:m(a.rud,c.rud),thr:a.thr,sp:m(a.sp,c.sp),t:q*DT}; };
  const P0=px({x:TR.per[0],y:TR.per[1]}), PATHPTS=TR.out.filter((_,i)=>i%6===0).map(o=>px(o).map(v=>v.toFixed(1)).join(',')).join(' ');
  const person=q=>q<FALL?null:P0;
  const STEPS=[
    {s:30,t:'Ploviš prema sjeveru brzinom od 4 čv. Vjetar puše sa sjevera, u pramac.'},
    {s:FALL,t:'<b>Čovjek u moru, desno!</b> Viči glasno da svi čuju i s koje je strane pao.'},
    {s:FALL+36,t:'Odmah <b>kormilo sve DESNO</b>, u stranu pada. Pramac ide prema osobi, a <b>krma i vijak bježe od nje</b>.'},
    {s:TR.ev.buoy+30,t:'<b>Baci kolut</b> ili prsluk. Jednoj osobi zadaj samo jedan posao: <b>ne skidati pogled</b> s čovjeka i pokazivati rukom.',buoy:1},
    {s:TR.ev.down,t:'<b>Smanji brzinu</b> i nastavi okret dok ne zaploviš niz vjetar. Osoba ti ostaje s desne strane, daleko od krme.'},
    {s:TR.ev.appr,t:'Prođi osobu <b>niz vjetar</b>, pa okreni natrag: želiš joj prići <b>pramcem u vjetar</b>, jer te tada vjetar koči i brodica sluša kormilo do kraja.'},
    {s:TR.ev.neutral,t:'Priđi <b>polako</b>, tako da osoba dođe uz bok na tvojoj strani, ispred krme.'},
    {s:LEN,t:'Nekoliko metara prije osobe: <b>motor u neutral</b>, vijak mora stajati. Brodica doklizi do nje. Izvuci je, po mogućnosti vodoravno. Ako je izgubiš iz vida: <b>MAYDAY</b>, potraga i obavijest kapetaniji.'}
  ];
  b.innerHTML=`<div class="simHead"><span class="simTitle">Čovjek u moru: okret i prilaz u vjetar, pogled odozgo</span><span class="simInst"><span>Kormilo <b class="mRud">ravno</b></span><span>Stroj <b class="mEng">NAPRIJED</b></span><span>Brzina <b class="mV">4,0 čv</b></span><span>Vrijeme <b class="mT">0 s</b></span></span></div>
    <svg viewBox="176 150 360 214" class="simSvg" role="img" aria-label="Animacija spašavanja čovjeka iz mora"><g class="mBg">${SIM.water(W,H,'mob')}
    <g transform="translate(206,180) scale(.6)"><circle r="22" fill="rgba(0,0,0,.25)" stroke="#9fb6c9"/><path d="M0,-16 L0,12 M-6,4 L0,14 L6,4" stroke="#e6eef5" stroke-width="2.2" fill="none"/><text y="36" text-anchor="middle" font-size="11" fill="#9fb6c9">vjetar</text></g></g>
    <g class="mDyn"></g></svg>${SIM.ctl()}<div class="knStepTxt mTxt" aria-live="polite"></div>`;
  const dyn=$('.mDyn',b); let step=0, cur=0, anim=null, playing=false, trail=[];
  function paint(s,k){ const p=at(s), st=STEPS[k];
    trail.push([p.x,p.y]); if(trail.length>90) trail.shift();
    let g=`<polyline points="${PATHPTS}" fill="none" stroke="#9fb6c9" stroke-width="1" stroke-dasharray="3 5" opacity=".25"/><g data-keep-dark="1"><path d="M500,352 h30" stroke="#1c2430" stroke-width="1.4"/><path d="M500,348 v8 M530,348 v8" stroke="#1c2430" stroke-width="1.4"/><text x="515" y="345" text-anchor="middle" font-size="8" fill="#1c2430">5 m</text></g>`;
    if(trail.length>1) g+=`<polyline points="${trail.map(q=>q.join(',')).join(' ')}" fill="none" stroke="#cfe6f5" stroke-width="5" opacity=".18" stroke-linecap="round"/>`;
    const pr=person(s);
    if(pr){ if(k>=3){ const bt=Math.min(1,(s-STEPS[2].s)/40), bx=pr[0]+10, by=pr[1]-8, sx=at(STEPS[2].s).x, sy=at(STEPS[2].s).y;
        g+=`<g transform="translate(${sx+(bx-sx)*bt},${sy+(by-sy)*bt})"><circle r="6" fill="none" stroke="#ff7a1a" stroke-width="3.2"/><circle r="6" fill="none" stroke="#fff" stroke-width="3.2" stroke-dasharray="2.4 4.3"/></g>`; }
      if(k>=3) g+=`<line x1="${p.x}" y1="${p.y}" x2="${pr[0]}" y2="${pr[1]}" stroke="#ffd166" stroke-width="1" stroke-dasharray="4 4" opacity=".7"/>`;
      g+=`<g transform="translate(${pr[0]},${pr[1]})"><circle r="9" fill="none" stroke="#e6eef5" stroke-width=".8" opacity=".5"><animate attributeName="r" values="6;13;6" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0;.6" dur="2.4s" repeatCount="indefinite"/></circle><g class="mobP"><path d="M-7,1 L-3,-1 M7,1 L3,-1" stroke="#34536f" stroke-width="1.8" stroke-linecap="round"/><path d="M-4.2,-1.6 Q0,-4.4 4.2,-1.6 L3.6,3.6 Q0,5 -3.6,3.6 Z" fill="#ff7a1a" stroke="#8a3a08" stroke-width=".6"/><path d="M-3.9,1.2 L3.9,1.2" stroke="#fff" stroke-width=".8"/><circle cy="-1.9" r="2.1" fill="#e2ae84"/><path d="M-2.1,-2.1 A2.1,2.1 0 0 1 2.1,-2.1 Z" fill="#3a2618"/></g></g>`; // v4: osoba u moru u narančastoj životnoj jakni s reflektirajućom trakom
      if(k===1) g+=`<text x="${pr[0]+12}" y="${pr[1]+4}" font-size="8" font-weight="600" fill="#ffd166">čovjek u moru</text>`; }
    g+=SIM.boat(p.x,p.y,p.h,{rud:p.rud,prop:p.thr>0?1:0});
    if(k===2){ const q=at(Math.max(FALL,s-26)); g+=`<text x="${p.x-70}" y="${p.y+30}" font-size="8" fill="#ffd166" font-weight="600">krma bježi od osobe</text>`; }
    dyn.innerHTML=g;
    $('.mRud',b).textContent=p.rud>28?'sve DESNO':p.rud>4?'desno':p.rud<-4?'lijevo':'ravno'; const eng=p.thr>1?'NAPRIJED':p.thr>0?'POLAKO':'NEUTRAL';
    $('.mEng',b).textContent=eng; $('.mEng',b).classList.toggle('n',eng==='NEUTRAL');
    $('.mV',b).textContent=p.sp.toFixed(1).replace('.',',')+' čv'; $('.mT',b).textContent=Math.round(p.t)+' s';
  }
  function ui(){ $('.mTxt',b).innerHTML=`<span>Korak ${step+1} / ${STEPS.length}</span>${STEPS[step].t}`;
    $('.knProg',b).innerHTML=STEPS.map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('');
    const pb=$('[data-a=play]',b); pb.textContent=playing?'Pauza':(step>=STEPS.length-1?'Ponovi':'Reproduciraj');
    $('[data-a=prev]',b).disabled=step===0; $('[data-a=next]',b).disabled=step>=STEPS.length-1; }
  function go(k,instant){ k=Math.max(0,Math.min(STEPS.length-1,k)); const from=k>step?cur:(k===0?0:STEPS[k-1].s), to=STEPS[k].s;
    if(k<step){ trail=[]; } step=k; ui(); if(anim) cancelAnimationFrame(anim);
    if(instant||SIM.RM||from===to){ if(instant||SIM.RM){ trail=[]; } cur=to; paint(cur,k); if(playing) setTimeout(()=>{ if(playing) next(); },1600); return; }
    const t0=performance.now(), dur=Math.abs(to-from)*DT*1000/3;   // 3 × brže od stvarnog vremena
    const f=n=>{ const t=Math.min(1,(n-t0)/dur); cur=from+(to-from)*t; paint(cur,k); if(t<1) anim=requestAnimationFrame(f); else { anim=null; if(playing) setTimeout(()=>{ if(playing) next(); },1500); } };
    anim=requestAnimationFrame(f); if(k===STEPS.length-1 && window.VB) VB.add(5,'sim_mob'); }
  function next(){ if(step>=STEPS.length-1){ playing=false; ui(); return; } go(step+1); }
  $('.knCtl',b).addEventListener('click',e=>{ const a=e.target.closest('button')?.dataset.a; if(!a) return;
    if(a!=='play') playing=false;
    if(a==='first'){ trail=[]; go(0,true); } if(a==='prev') go(step-1,true); if(a==='next') go(step+1);
    if(a==='play'){ if(playing){ playing=false; ui(); return; } playing=true; if(step>=STEPS.length-1){ trail=[]; step=0; cur=0; go(0,true); } else next(); ui(); } });
  go(0,true);
})();

/* ── IZBOJ KRME I PRISTAJANJE BOKOM ── */
(function(){
  const b=el('dockSim'); if(!b) return;
  const W=640,H=360;
  let prop='D', side='L', anim=null;
  b.innerHTML=`<div class="simOpts">
     <div class="seg" data-k="prop"><span>Vijak</span><button data-v="D" class="on">desnokretni</button><button data-v="L">lijevokretni</button></div>
     <div class="seg" data-k="side"><span>Obala mi je</span><button data-v="L" class="on">lijevo</button><button data-v="R">desno</button></div>
     <button class="btn p dGo">Pristani</button><button class="btn dRev">Što radi vožnja krmom?</button></div>
    <svg viewBox="0 0 ${W} ${H}" class="simSvg" role="img" aria-label="Animacija izboja krme"><g>${SIM.water(W,H,'dk')}</g><g class="dDyn"></g></svg>
    <div class="knStepTxt dTxt" aria-live="polite"></div>`;
  const dyn=$('.dDyn',b);
  const quay=()=>side==='L'?`<rect x="0" y="0" width="118" height="${H}" fill="#6b7784"/><rect x="112" y="0" width="8" height="${H}" fill="#4a545e"/>${[60,160,260].map(y=>`<rect x="100" y="${y}" width="10" height="16" rx="3" fill="#2a3138"/>`).join('')}<text x="56" y="${H-14}" text-anchor="middle" font-size="12" fill="#dfe6ec">OBALA</text>`
                          :`<rect x="${W-118}" y="0" width="118" height="${H}" fill="#6b7784"/><rect x="${W-120}" y="0" width="8" height="${H}" fill="#4a545e"/>${[60,160,260].map(y=>`<rect x="${W-110}" y="${y}" width="10" height="16" rx="3" fill="#2a3138"/>`).join('')}<text x="${W-56}" y="${H-14}" text-anchor="middle" font-size="12" fill="#dfe6ec">OBALA</text>`;
  const kick=()=>prop==='D'?1:-1; // +1: krma ulijevo (pramac udesno) pri vožnji krmom
  function draw(x,y,h,o,extra){ dyn.innerHTML=quay()+(extra||'')+SIM.boat(x,y,h,{s:1.6,prop:o.prop,rud:0}); }
  function txt(h){ $('.dTxt',b).innerHTML=h; }
  let runGen=0; // novi klik prekida staru animaciju, i u pauzi između koraka
  function run(steps){ if(anim) cancelAnimationFrame(anim); let i=0; const my=++runGen;
    const nx=()=>{ if(my!==runGen||i>=steps.length) return; const s=steps[i++]; if(s.say) txt(s.say);
      if(SIM.RM){ s.f(1); return setTimeout(nx,50); }
      const t0=performance.now(); const f=n=>{ const t=Math.min(1,(n-t0)/s.d); s.f(t); if(t<1) anim=requestAnimationFrame(f); else setTimeout(nx,s.w??300); }; anim=requestAnimationFrame(f); };
    nx(); }
  const qx=()=>side==='L'?120:W-120;
  function dock(){
    const sgn=side==='L'?-1:1, ang=24*sgn, x0=W/2+sgn*40, y0=H+30, stopX=qx()-sgn*22, stopY=150;
    // prilaz pod kutom, pa kratko krmom: izboj okreće krmu (desnokretni: krma ulijevo)
    const dh=24*kick(), good=(side==='L'&&prop==='D')||(side==='R'&&prop==='L');
    const ax=stopX, ay=stopY+10;
    let pos={x:x0,y:y0,h:ang};
    run([
      {say:`Prilaziš obali <b>pod kutom od oko 20° do 30°</b>, malom brzinom.`,d:2600,f:t=>{ pos={x:x0+(ax-x0)*t,y:y0+(ay-y0)*t,h:ang}; draw(pos.x,pos.y,pos.h,{prop:1}); }},
      {say:`Blizu obale daješ kratko <b>krmom</b>. ${prop==='D'?'Desnokretni':'Lijevokretni'} vijak pri vožnji krmom izbija krmu <b>${prop==='D'?'ULIJEVO':'UDESNO'}</b>.`,d:1900,w:200,f:t=>{ const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; draw(ax,ay+6*e,ang+dh*e,{prop:-1},`<path d="M${ax},${ay+46} q${-kick()*30},6 ${-kick()*52},-2" stroke="#ffd166" stroke-width="2.4" fill="none" marker-end="url(#dkA)"/><defs><marker id="dkA" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ffd166"/></marker></defs>`); pos={x:ax,y:ay+6,h:ang+dh}; }},
      {say:good?`<b>Dobro:</b> izboj je privukao krmu uz obalu i brodica je stala usporedno. Zato se s ${prop==='D'?'desnokretnim':'lijevokretnim'} vijkom pristaje <b>${prop==='D'?'LIJEVIM':'DESNIM'} bokom</b>.`
                  :`<b>Loše:</b> izboj je odgurnuo krmu <b>od obale</b>. S ${prop==='D'?'desnokretnim':'lijevokretnim'} vijkom lakše pristaješ <b>${prop==='D'?'LIJEVIM':'DESNIM'} bokom</b>. Promijeni stranu i pokušaj.`,
       d:600,f:t=>{ draw(pos.x,pos.y,pos.h,{prop:0}); }}
    ]);
    if(good && window.VB) VB.add(5,'sim_dock');
  }
  function reverse(){
    // v3: jasna demonstracija u 3 koraka: što je vožnja krmom, kamo bi išla bez izboja, kamo stvarno ode
    const k=kick(), x0=W/2+(side==='L'?60:-60), y0=70, L=230;
    const ghost=`<g data-keep-dark="1" opacity=".55"><line x1="${x0}" y1="${y0+30}" x2="${x0}" y2="${y0+L+40}" stroke="#7b828c" stroke-width="1.5" stroke-dasharray="6 5"/>`+
      `<text x="${x0+(k>0?10:-10)}" y="${y0+L+34}" text-anchor="${k>0?'start':'end'}" font-size="12" fill="#4a5360">bez izboja: ravno natrag</text></g>`;
    const labels=(x,y,h)=>`<g data-keep-dark="1" transform="translate(${x},${y}) rotate(${h})"><text y="-40" text-anchor="middle" font-size="11" font-weight="600" fill="#1c2430">PRAMAC</text><text y="52" text-anchor="middle" font-size="11" font-weight="600" fill="#1c2430">KRMA</text></g>`;
    const back=(x,y)=>`<g data-keep-dark="1"><path d="M${x},${y+58} v34" stroke="#1f4e79" stroke-width="2.4" marker-end="url(#rvA)"/><text x="${x+10}" y="${y+84}" font-size="12" fill="#1f4e79">stroj KRMOM: brodica ide unatrag</text>`+
      `<defs><marker id="rvA" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#1f4e79"/></marker><marker id="rvK" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#b3261e"/></marker></defs></g>`;
    let trail=[];
    const trailPath=()=>trail.length>1?`<path data-keep-dark="1" d="M${trail.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L')}" stroke="#b3261e" stroke-width="2" fill="none" stroke-dasharray="3 4"/>`:'';
    let x=x0,y=y0,h=0;
    run([
      {say:`<b>1. Što je vožnja krmom?</b> Stroj ide u rikverc i brodica plovi <b>unatrag</b>, krmom naprijed. Ovdje stoji na mjestu, kormilo je ravno.`,d:1800,w:900,
       f:t=>{ draw(x0,y0,0,{prop:0},labels(x0,y0,0)+back(x0,y0)); }},
      {say:`<b>2. Da nema izboja</b>, brodica bi išla ravno natrag (siva crtkana linija). Ali vijak koji se vrti unatrag gura krmu u stranu: to je <b>izboj krme</b>.`,d:1600,w:900,
       f:t=>{ draw(x0,y0,0,{prop:-1},ghost+labels(x0,y0,0)); }},
      {say:`<b>3. Stvarno:</b> ${prop==='D'?'desnokretni':'lijevokretni'} vijak pri vožnji krmom izbija krmu <b>${prop==='D'?'ULIJEVO':'UDESNO'}</b>, pa se brodica zakreće (crvena putanja). Kormilo pri vožnji krmom skoro nema učinka, zato izboj prevlada.`,
       d:4200,w:400,f:t=>{ const e=t*t; h=55*k*e; x=x0-k*95*e; y=y0+L*t; const rd=h*Math.PI/180; trail.push([x-30*Math.sin(rd),y+30*Math.cos(rd)]);
         draw(x,y,h,{prop:-1},ghost+trailPath()+`<path data-keep-dark="1" d="M${x+ (k>0?18:-18)},${y+40} q${-k*26},4 ${-k*44},-4" stroke="#b3261e" stroke-width="2.4" fill="none" marker-end="url(#rvK)"/>`+
           `<defs data-keep-dark="1"><marker id="rvK" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#b3261e"/></marker></defs>`); }},
      {say:`<b>Zašto je to važno:</b> kod pristajanja izboj koristiš. ${prop==='D'?'Desnokretnim':'Lijevokretnim'} vijkom pristaješ <b>${prop==='D'?'LIJEVIM':'DESNIM'} bokom</b>: kratko daš krmom i izboj sam privuče krmu uz obalu. Probaj gumb <b>Pristani</b>.`,d:300,f:t=>{}}
    ]);
  }
  $$('.seg',b).forEach(sg=>sg.addEventListener('click',e=>{ const bt=e.target.closest('button'); if(!bt) return;
    $$('button',sg).forEach(x=>x.classList.toggle('on',x===bt)); if(sg.dataset.k==='prop') prop=bt.dataset.v; else side=bt.dataset.v;
    draw(W/2+(side==='L'?-20:20),H-60,(side==='L'?-24:24),{prop:0}); txt('Odaberi i pokreni.'); }));
  $('.dGo',b).addEventListener('click',dock); $('.dRev',b).addEventListener('click',reverse);
  draw(W/2-20,H-60,-24,{prop:0}); txt('Odaberi vrstu vijka i stranu obale, pa klikni <b>Pristani</b>.');
})();

/* ── SIDRENJE: DUBINA, LANAC I VJETAR ── */
/* Crtež je u mjerilu (vodoravno i okomito isto), a oblik lanca računa AnchorPhys (fizika.js). */
(function(){
  const b=el('anchorSim'); if(!b) return;
  const W=680,H=216, SEA=74, XA=W-64, A=AnchorPhys, num=(x,d)=>x.toFixed(d==null?1:d).replace('.',',');
  let D=6, K=4, WK=15, anim=null, runGen=0;
  b.innerHTML=`<div class="simOpts">
    <label class="simRange">Dubina <input type="range" min="2" max="12" step="1" value="6" class="aD"><b class="aDv"></b></label>
    <label class="simRange">Lanac <input type="range" min="1.5" max="8" step="0.5" value="4" class="aK"><b class="aKv"></b></label>
    <label class="simRange">Vjetar <input type="range" min="5" max="40" step="5" value="15" class="aW"><b class="aWv"></b></label>
    <button class="btn p aGo" type="button">Usidri korak po korak</button></div>
    <svg viewBox="0 0 ${W} ${H}" class="simSvg" role="img" aria-label="Sidrenje u presjeku, u mjerilu: brodica, lanac i sidro na dnu"><g class="aDyn"></g></svg>
    <div class="knStepTxt aTxt" aria-live="polite"></div>`;
  const dyn=$('.aDyn',b), txt=h=>$('.aTxt',b).innerHTML=h;
  const Lf=()=>K*D, ppm=()=>Math.min(7,(W-190)/(Lf()+A.B.len+4));
  /* st: {X: vodoravna udaljenost pramca od sidra (m), g: rješenje lančanice ili null, drop: visina sidra iznad dna dok pada (m) ili null,
          dig: 0..1 koliko je sidro ukopano, final: prikaži ocjenu} */
  function scene(st){ const s=ppm(), bed=SEA+D*s, bowX=XA-st.X*s, bowY=SEA-A.B.bow*s, len=A.B.len*s, wb=A.beaufort(WK), fk=fitText(dyn.ownerSVGElement,W), sm=fk>1.3, fs=x=>(x*fk).toFixed(1);
    let g=`<rect width="${W}" height="${SEA}" fill="#0b1e30"/>`+seaBackground(W,H,{y:SEA,view:'section'});
    g+=`<rect data-keep-dark="1" x="0" y="${bed.toFixed(1)}" width="${W}" height="${(H-bed).toFixed(1)}" fill="#d9c48a"/>`;
    { const L=26+WK*1.4; g+=`<g transform="translate(${30+L},34)"><path d="M0,0 H${-L} M${-L+9},-6 L${-L},0 L${-L+9},6" stroke="#e6eef5" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="${-L}" y="${12+10*fk}" font-size="${fs(11.5)}" fill="#9fb6c9">vjetar ${WK} čv${sm?'':` (${wb} Bf)`}</text></g>`; }
    // brodica u mjerilu: pramac desno, u vjetar; gaz ispod vodene linije
    const dk=A.B.bow*s, dr=.45*s;
    g+=`<g transform="translate(${bowX.toFixed(1)},${SEA})"><path d="M0,${-dk} L${(-len).toFixed(1)},${(-dk*.85).toFixed(1)} L${(-len).toFixed(1)},${(dr*.7).toFixed(1)} L${(-len*.2).toFixed(1)},${dr.toFixed(1)} Q${(-len*.05).toFixed(1)},${(dr*.4).toFixed(1)} 0,${-dk} Z" fill="#e6eef5" stroke="#1d2b36" stroke-width="1.2"/>
      <rect x="${(-len*.68).toFixed(1)}" y="${(-dk*.85-1.1*s).toFixed(1)}" width="${(len*.34).toFixed(1)}" height="${(1.1*s).toFixed(1)}" fill="#9fb6c9" stroke="#1d2b36" stroke-width="1"/></g>`;
    const ax=XA, ay=st.drop!=null?bed-st.drop*s:bed;
    if(st.g){ const P=A.shape(st.g,28).map(([x,y])=>[(XA-x*s).toFixed(1),(bed-y*s-1.5).toFixed(1)]), pts=P.map(p=>p.join(',')).join(' ');
      g+=`<g data-keep-dark="1"><polyline points="${pts}" fill="none" stroke="#1d2b36" stroke-width="4.2" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${pts}" fill="none" stroke="#e6eef5" stroke-width="2.2" stroke-dasharray="5 3" stroke-linejoin="round"/>`;
      if(st.g.lie>.3) g+=`<line x1="${XA}" y1="${bed+7}" x2="${(XA-st.g.lie*s).toFixed(1)}" y2="${bed+7}" stroke="#14532d" stroke-width="3"/>`;
      g+=`</g>`;
    } else if(st.drop!=null) g+=`<line data-keep-dark="1" x1="${bowX.toFixed(1)}" y1="${bowY.toFixed(1)}" x2="${ax}" y2="${ay.toFixed(1)}" stroke="#1d2b36" stroke-width="2.4" stroke-dasharray="5 3"/>`;
    if(st.drop!=null||st.g){ const th=st.g&&st.final?Math.min(40,st.g.theta):0, rot=(st.drop!=null&&!st.g)?0:-78+st.dig*62+th;
      g+=`<g data-keep-dark="1" transform="translate(${ax},${(ay-2+st.dig*3).toFixed(1)}) rotate(${rot.toFixed(1)})"><path d="M0,-16 v22 M-12,2 q12,14 24,0 M-7,-14 h14" stroke="#1d2b36" stroke-width="5.4" fill="none" stroke-linecap="round"/><circle cy="-19" r="3.5" fill="none" stroke="#1d2b36" stroke-width="4.8"/><path d="M0,-16 v22 M-12,2 q12,14 24,0 M-7,-14 h14" stroke="#e6eef5" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cy="-19" r="3.5" fill="none" stroke="#e6eef5" stroke-width="2"/></g>`; }
    // dubina
    g+=`<path d="M${W-26},${SEA} h12 M${W-20},${SEA} V${bed.toFixed(1)} M${W-26},${bed.toFixed(1)} h12" stroke="#39b8e8" stroke-width="1.4" fill="none"/><text transform="translate(${W-6},${((SEA+bed)/2).toFixed(1)}) rotate(-90)" font-size="${fs(12)}" font-weight="600" fill="#39b8e8" text-anchor="middle">${sm?'':'dubina '}${D} m</text>`;
    if(st.final&&st.g){ const q=st.g, ok=q.theta<=1, mid=q.theta<8, col=ok?'#14532d':mid?'#7a4a00':'#8a1c1c', my=Math.min(H-10,bed+30);
      g+=`<g data-keep-dark="1"><text x="${XA+6}" y="${Math.min(H-8,bed+16+14*fk)}" font-size="${fs(13)}" font-weight="600" fill="${col}" text-anchor="end">${ok?`drži, na dnu leži ${num(q.lie)} m${sm?'':' lanca'}`:mid?`na granici, ${sm?'':'lanac vuče '}pod ${num(q.theta,0)}°`:`ore, ${sm?'vuče gore':'lanac vuče prema gore'} pod ${num(q.theta,0)}°`}</text>
</g><path d="M${(bowX-len).toFixed(1)},${SEA-dk-16} v-7 M${(bowX-len).toFixed(1)},${SEA-dk-19.5} H${XA} M${XA},${SEA-dk-16} v-7" stroke="#9fb6c9" stroke-width="1.5" fill="none"/>
        <text x="${XA}" y="${SEA-dk-25}" text-anchor="end" font-size="${fs(11.5)}" fill="#9fb6c9">${sm?'krug':'krug zakretanja: polumjer'} ${Math.round(st.X+A.B.len)} m${sm?'':' oko sidra'}</text>`; }
    dyn.innerHTML=g; }
  const dist=q=>q.lie+q.span;
  function verdict(){ const F=A.windForce(WK), q=A.solve(D,Lf(),F), nd=A.need(D,WK), ok=q.theta<=1;
    return `Dubina <b>${D} m</b>, lanac <b>${num(Lf(),Lf()%1?1:0)} m</b> (${num(K,K%1?1:0)} × dubina), vjetar <b>${WK} čv</b>. `+
      (ok?`<b>Sidro drži:</b> na dnu leži ${num(q.lie)} m lanca, pa ga brodica vuče vodoravno, onako kako je sidro građeno da drži.`
        :q.theta<8?`<b>Na granici:</b> vjetar je podigao cijeli lanac s dna i vuče sidro prema gore pod ${num(q.theta,0)}°. Prvi jači udar vjetra može ga iščupati.`
        :`<b>Sidro ore, ne drži:</b> lanac je prekratak, cijeli je podignut i vuče sidro prema gore pod ${num(q.theta,0)}°.`)+
      (ok?'':` Za ovaj vjetar ovdje treba najmanje <b>${Math.ceil(nd)} m</b> lanca (${num(nd/D)} × dubina).`)+
      ` Oko sidra ti treba slobodan krug polumjera oko ${Math.round(dist(q)+A.B.len)} m.`; }
  function show(){ const q=A.solve(D,Lf(),A.windForce(WK)); scene({X:dist(q),g:q,dig:1,final:true}); txt(verdict()); }
  function labels(){ $('.aDv',b).textContent=D+' m'; $('.aKv',b).textContent=`${num(K,K%1?1:0)} × = ${num(Lf(),Lf()%1?1:0)} m`; $('.aWv',b).textContent=`${WK} čv`; }
  function run(steps){ if(anim) cancelAnimationFrame(anim); let i=0; const my=++runGen;
    const nx=()=>{ if(my!==runGen||i>=steps.length) return; const s=steps[i++]; if(s.say) txt(s.say);
      if(SIM.RM){ s.f(1); return setTimeout(nx,50); }
      const t0=performance.now(); const f=n=>{ if(my!==runGen) return; const t=Math.min(1,(n-t0)/s.d); s.f(t); if(t<1) anim=requestAnimationFrame(f); else setTimeout(nx,s.w??350); }; anim=requestAnimationFrame(f); };
    nx(); }
  function go(){ const h=D+A.B.bow, w=A.B.w, aw=A.windForce(WK)/w, far=Math.min(Lf()*.9,(XA-120)/ppm());
    const pay=t=>A.solve(D,h+.01+(Lf()-h)*t,(1.2+(aw*.5-1.2)*t)*w);
    run([
      {say:'<b>1.</b> Prilaziš odabranom mjestu <b>pramcem u vjetar</b> (ili u struju), malom brzinom, i zaustaviš brodicu.',d:2000,f:t=>scene({X:far*Math.pow(1-t,2),g:null,dig:0})},
      {say:'<b>2.</b> Obaraš sidro dok ne dotakne dno. Brodica pritom stoji ili lagano ide krmom, nikad naprijed preko lanca.',d:1300,f:t=>scene({X:0,g:null,drop:h*(1-t),dig:0})},
      {say:`<b>3.</b> Vjetar i lagana vožnja <b>krmom</b> odmiču brodicu, a ti ispuštaš lanac da se slaže po dnu, ne na hrpu. Ukupno <b>${num(Lf(),Lf()%1?1:0)} m</b>.`,d:3000,f:t=>{ const q=pay(t); scene({X:dist(q),g:q,dig:0}); }},
      {say:'<b>4.</b> Kratko <b>zavozi krmom</b>: lanac se zategne i sidro se <b>ukopa</b>. Uzmi dvije oznake na obali i provjeri da se ne pomiču.',d:1500,f:t=>{ const q=A.solve(D,Lf(),(aw*.5+aw*2*Math.sin(t*Math.PI))*w); scene({X:dist(q),g:q,dig:t}); }},
      {d:500,f:t=>{ const q=A.solve(D,Lf(),(aw*(.5+.5*t))*w); scene({X:dist(q),g:q,dig:1}); if(t===1) show(); }}
    ]);
    if(window.VB) VB.add(5,'sim_anchor');
  }
  const stop=()=>{ runGen++; if(anim) cancelAnimationFrame(anim); };
  $('.aD',b).addEventListener('input',e=>{ stop(); D=+e.target.value; labels(); show(); });
  $('.aK',b).addEventListener('input',e=>{ stop(); K=+e.target.value; labels(); show(); });
  $('.aW',b).addEventListener('input',e=>{ stop(); WK=+e.target.value; labels(); show(); });
  $('.aGo',b).addEventListener('click',go);
  labels(); show(); onWidth(dyn.ownerSVGElement,()=>{ if(!anim) show(); });
})();

/* ── MAYDAY: SLOŽI REDOSLIJED ── */
(function(){
  const b=el('mdOrder'); if(!b) return;
  const SETS={
    call:{n:'MAYDAY poziv',items:['MAYDAY, MAYDAY, MAYDAY','OVDJE','Ime / oznaka plovila, 3 puta','MAYDAY + ime / oznaka plovila','POZICIJA','VRSTA OPASNOSTI','VRSTA POMOĆI KOJA SE TRAŽI','PRIJEM']},
    recv:{n:'Kad TI primiš MAYDAY',items:['Potvrdi prijem','Odmah kreni u pomoć','Javi plovilu da kreneš i približno vrijeme dolaska','Izvijesti najbližu lučku kapetaniju (izravno ili preko obalne postaje)']},
    fuel:{n:'Krcanje goriva',items:['Iskrcaj sve osobe osim posade','Postavi natpis o zabrani pušenja','Protupožarni aparat u pripravu','Zatvori otvore na palubi','Voditelj je u blizini cijelo vrijeme']}
  };
  let key='call', pos=0, t0=0, miss=0, order=[];
  const best=store.get('mdbest',{});
  b.innerHTML=`<div class="nlTabs">${Object.entries(SETS).map(([k,v])=>`<button class="knTab" data-s="${k}">${v.n}</button>`).join('')}</div>
    <p class="ordHint">Klikni stavke <b>redom</b>, od prve do zadnje. Pogrešan klik se broji.</p>
    <div class="ordGrid"></div><ol class="ordDone"></ol><div class="ordRes" aria-live="polite"></div><div class="btnrow"><button class="btn ordNew">Ispočetka</button></div>`;
  function start(){ const S=SETS[key]; pos=0; miss=0; t0=0; order=shuffle(S.items.map((_,i)=>i));
    $$('.knTab',b).forEach(x=>x.classList.toggle('on',x.dataset.s===key));
    $('.ordGrid',b).innerHTML=order.map(i=>`<button class="ordItem" data-i="${i}">${S.items[i]}</button>`).join('');
    $('.ordDone',b).innerHTML=''; $('.ordRes',b).innerHTML=best[key]?`Najbolje vrijeme: <b>${best[key]} s</b>`:''; }
  $('.nlTabs',b).addEventListener('click',e=>{ const t=e.target.closest('[data-s]'); if(t){ key=t.dataset.s; start(); }});
  $('.ordNew',b).addEventListener('click',start);
  $('.ordGrid',b).addEventListener('click',e=>{ const it=e.target.closest('.ordItem'); if(!it||it.disabled) return; if(!t0) t0=performance.now();
    const S=SETS[key];
    if(+it.dataset.i===pos){ it.disabled=true; it.classList.add('dn'); $('.ordDone',b).insertAdjacentHTML('beforeend',`<li>${S.items[pos]}</li>`); pos++;
      if(pos===S.items.length){ const sec=((performance.now()-t0)/1000).toFixed(1).replace('.',',');
        const clean=miss===0; if(clean && (!best[key] || parseFloat(sec.replace(',','.'))<parseFloat(String(best[key]).replace(',','.')))){ best[key]=sec; store.set('mdbest',best); }
        $('.ordRes',b).innerHTML=clean?`<div class="nlRes rg">✓ Bez greške, ${sec} s. ${best[key]===sec?'Novi rekord.':''}</div>`:`<div class="nlRes rb">Složeno uz ${miss} ${miss===1?'grešku':'greške'}. Ponovi dok ne ide bez greške.</div>`;
        if(clean && window.VB){ VB.add(5,'order_'+key); if(key==='call') VB.flag('md'); } } }
    else { miss++; it.classList.remove('bad'); void it.offsetWidth; it.classList.add('bad'); } });
  start();
})();

/* ── FONETSKA ABECEDA: DRIL ── */
(function(){
  const b=el('phonDrill'); if(!b) return;
  const A={A:['ALFA','ALPHA'],B:['BRAVO'],C:['CHARLIE','CARLI','CHARLI'],D:['DELTA'],E:['ECHO','EKO'],F:['FOXTROT','FOKSTROT'],G:['GOLF'],H:['HOTEL'],I:['INDIA','INDIJA'],J:['JULIETT','JULIET','DZULIJET','DZULIET'],K:['KILO'],L:['LIMA'],M:['MIKE','MAJK'],
    N:['NOVEMBER'],O:['OSCAR','OSKAR'],P:['PAPA'],Q:['QUEBEC','KVIBEK','KEBEK'],R:['ROMEO','ROMIO'],S:['SIERRA','SIERA'],T:['TANGO'],U:['UNIFORM','JUNIFORM'],V:['VICTOR','VIKTOR'],W:['WHISKEY','WHISKY','VISKI'],X:['XRAY','IKSREJ','EKSREJ'],Y:['YANKEE','JENKI'],Z:['ZULU']};
  const MAIN={A:'Alfa',B:'Bravo',C:'Čarli',D:'Delta',E:'Eko',F:'Fokstrot',G:'Golf',H:'Hotel',I:'Indija',J:'Džulijet',K:'Kilo',L:'Lima',M:'Majk',N:'November',O:'Oskar',P:'Papa',Q:'Kvibek',R:'Romio',S:'Siera',T:'Tango',U:'Juniform',V:'Viktor',W:'Viski',X:'Iksrej',Y:'Jenki',Z:'Zulu'};
  const norm=s=>s.toUpperCase().replace(/Č|Ć/g,'C').replace(/Š/g,'S').replace(/Ž/g,'Z').replace(/Đ|DŽ/g,'DZ').replace(/[^A-Z]/g,'');
  const N=10; let q=[], i=0, ok=0, t0=0, mode='l2w';
  b.innerHTML=`<div class="nlTabs"><button class="knTab on" data-m="l2w">Slovo → riječ</button><button class="knTab" data-m="w2l">Riječ → slovo</button></div>
    <div class="phBox"><div class="phQ" aria-live="polite"></div><input class="phIn" aria-label="Odgovor: riječ fonetske abecede" autocomplete="off" spellcheck="false" placeholder="upiši i Enter"><div class="phFb"></div></div>
    <div class="phBar"></div><div class="btnrow"><button class="btn p phGo">Novi krug (10)</button></div>`;
  const inp=$('.phIn',b);
  function show(){ const L=q[i]; $('.phQ',b).innerHTML=mode==='l2w'?`<span class="phBig">${L}</span>`:`<span class="phBig w">${MAIN[L]}</span>`;
    $('.phBar',b).innerHTML=q.map((_,k)=>`<i class="${k<i?'d':''} ${k===i?'c':''}"></i>`).join(''); inp.value=''; inp.focus({preventScroll:true}); }
  function start(){ q=shuffle(Object.keys(A)).slice(0,N); i=0; ok=0; t0=performance.now(); $('.phFb',b).innerHTML=''; inp.disabled=false; show(); }
  function answer(){ if(!q.length||i>=N) return; const L=q[i], v=norm(inp.value); if(!v) return;
    const good=mode==='l2w'?A[L].includes(v):v===L;
    if(good) ok++;
    $('.phFb',b).innerHTML=good?`<span class="g">✓ ${L}: ${MAIN[L]}</span>`:`<span class="r">✗ ${L}: <b>${MAIN[L]}</b> (${A[L][0].charAt(0)+A[L][0].slice(1).toLowerCase()})</span>`;
    $$('.phBar i',b)[i].classList.add(good?'g':'r'); i++;
    if(i>=N){ const s=((performance.now()-t0)/1000).toFixed(0); inp.disabled=true;
      $('.phQ',b).innerHTML=`<span class="phBig ${ok>=9?'okc':''}">${ok}/${N}</span><div class="phSum">${s} s. ${ok===N?'Savršeno. Sad naglas, bez gledanja.':ok>=8?'Dobro. Ponovi dok ne bude 10/10.':'Još vježbe: čitaj tablicu ispod naglas pa ponovi.'}</div>`;
      if(ok>=9 && window.VB){ VB.add(5); VB.flag('spell'); } }
    else setTimeout(show,450); }
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter') answer(); });
  $('.phGo',b).addEventListener('click',start);
  $('.nlTabs',b).addEventListener('click',e=>{ const t=e.target.closest('[data-m]'); if(!t) return; mode=t.dataset.m; $$('.knTab',b).forEach(x=>x.classList.toggle('on',x===t)); start(); });
  $('.phQ',b).innerHTML='<span class="phSum">Deset nasumičnih slova. Piši hrvatski ili engleski oblik (Čarli ili Charlie).</span>'; inp.disabled=true;
})();

/* ── POŽAR: TROKUT GORENJA I IZBOR SREDSTVA ── */
(function(){
  const b=el('fireDrill'); if(!b) return;
  const AG=[['prah','Prah'],['co2','CO₂'],['pjena','Pjena'],['voda','Voda'],['pokrivac','Pokrivač']];
  const SC=[
    {t:'Gori proliveno gorivo u prostoru motora.',ok:['prah','co2','pjena'],why:{voda:'Voda na gorivu raznosi plamen. Nikad voda na gorivo.',pokrivac:'Pokrivač je za male požare, npr. u kuhinji.'},pre:'Prvo <b>ugasi motor i zatvori dovod goriva i zraka</b>.'},
    {t:'Iskri i gori električna ploča.',ok:['prah','co2'],why:{voda:'Voda vodi struju. Nikad voda na električne uređaje.',pjena:'Pjena je za gorive tekućine, ne za struju.',pokrivac:'Pokrivač nije za električnu ploču.'},pre:'Ako možeš, <b>isključi struju</b>.'},
    {t:'U kuhinji se zapalilo ulje u tavi.',ok:['pokrivac','prah'],why:{voda:'Voda na vrelom ulju izaziva eksploziju plamena. Nikad!',co2:'CO₂ može raspršiti ulje, bolji je pokrivač.',pjena:'Pokrivač je ovdje brži i sigurniji.'},pre:'Ugasi plamenik i <b>poklopi</b>: bez zraka nema gorenja.'},
    {t:'Tinja madrac u kabini.',ok:['voda','prah'],why:{co2:'CO₂ ne hladi dovoljno: krute tvari se opet zapale.',pjena:'Pjena je za gorive tekućine.',pokrivac:'Pokrivač je za male požare, madrac treba ohladiti vodom.'},pre:'Krute tvari gase se <b>hlađenjem</b>.'}
  ];
  let si=0, first=true, score=0, done=0;
  b.innerHTML=`<div class="frWrap"><div class="frTri">
    <svg viewBox="0 0 260 230" class="frSvg"><g class="frSides"></g><g class="frFlame" transform="translate(130,150)"></g></svg>
    <div class="frBtns"><button class="btn" data-x="g">Zatvori dovod goriva</button><button class="btn" data-x="k">Pokrij / zatvori otvore</button><button class="btn" data-x="t">Hladi</button><button class="btn" data-x="r" aria-label="Ispočetka" title="Ispočetka">Ispočetka</button></div>
    <div class="frTxt">Vatri trebaju tri stvari: <b>gorivo</b>, <b>kisik</b> i <b>toplina</b>. Makni jednu i vatra se gasi.</div></div>
    <div class="frQ"><div class="frScen"></div><div class="frAg">${AG.map(a=>`<button class="ordItem" data-a="${a[0]}">${a[1]}</button>`).join('')}</div><div class="frFb" aria-live="polite"></div>
    <div class="btnrow"><button class="btn frNext">Sljedeći požar</button></div>
    <div class="knI"><h5>Aparat: kako se koristi</h5>Izvuci osigurač. Stani na sigurnu udaljenost, s izlazom iza sebe. Mlaznicu usmjeri u <b>podnožje plamena</b>, ne u vrh. Pritisni ručicu i pomiči mlaz lijevo-desno.</div></div></div>`;
  let off={g:0,k:0,t:0};
  function tri(){ const sides=[['g','GORIVO',[40,190],[220,190]],['k','KISIK',[40,190],[130,30]],['t','TOPLINA',[130,30],[220,190]]];
    let g=''; sides.forEach(([k,n,a,c])=>{ const on=!off[k], mx=(a[0]+c[0])/2, my=(a[1]+c[1])/2;
      g+=`<line x1="${a[0]}" y1="${a[1]}" x2="${c[0]}" y2="${c[1]}" stroke="${on?'#f5c542':'#3a4a58'}" stroke-width="7" stroke-linecap="round" ${on?'':'stroke-dasharray="4 10"'}/>`;
      g+=`<text x="${mx+(k==='g'?0:k==='k'?-34:34)}" y="${my+(k==='g'?24:0)}" text-anchor="middle" font-size="12" font-weight="600" fill="${on?'#f5c542':'#6d8ba3'}">${n}</text>`; });
    $('.frSides',b).innerHTML=g;
    const alive=!off.g&&!off.k&&!off.t;
    $('.frFlame',b).innerHTML=alive?`<path d="M0,-58 C18,-34 30,-18 22,4 C16,20 -16,20 -22,4 C-30,-18 -8,-30 0,-58 Z" fill="#ff7a1a" class="fl1"/><path d="M0,-30 C9,-18 14,-8 10,4 C6,12 -6,12 -10,4 C-14,-8 -4,-16 0,-30 Z" fill="#ffd166" class="fl2"/>`
      :`<path d="M-6,4 C-10,-8 4,-14 0,-26 M6,2 C10,-10 -2,-18 4,-32" stroke="#6d8ba3" stroke-width="2.5" fill="none" opacity=".7" class="smk"/><text y="30" text-anchor="middle" font-size="12" fill="#b8f0cf" font-weight="600">ugašeno</text>`; }
  $('.frBtns',b).addEventListener('click',e=>{ const x=e.target.closest('button')?.dataset.x; if(!x) return; if(x==='r') off={g:0,k:0,t:0}; else off[x]=1; tri(); });
  function scen(){ const s=SC[si]; first=true; $('.frScen',b).innerHTML=`<span class="phSum">Požar ${si+1} / ${SC.length}</span><b>${s.t}</b><br>Čime gasiš?`; $('.frFb',b).innerHTML='';
    $$('.frAg .ordItem',b).forEach(x=>{ x.disabled=false; x.className='ordItem'; }); }
  $('.frAg',b).addEventListener('click',e=>{ const bt=e.target.closest('.ordItem'); if(!bt||bt.disabled) return; const s=SC[si], a=bt.dataset.a, good=s.ok.includes(a);
    bt.classList.add(good?'dn':'bad'); bt.disabled=true;
    if(first){ first=false; done++; if(good) score++; }
    $('.frFb',b).innerHTML=good?`<div class="nlRes rg">✓ Da. ${s.pre} Dobra sredstva: ${s.ok.map(k=>AG.find(z=>z[0]===k)[1]).join(', ')}.</div>`:`<div class="nlRes rb">✗ ${s.why[a]||'Nije dobar izbor.'}</div>`;
    if(good && done===SC.length && si===SC.length-1){ $('.frFb',b).insertAdjacentHTML('beforeend',`<div class="phSum">Prvi izbor točan u ${score} od ${SC.length} slučajeva.</div>`); if(score===SC.length && window.VB) VB.add(5,'sim_fire'); } });
  $('.frNext',b).addEventListener('click',()=>{ si=(si+1)%SC.length; if(si===0){ score=0; done=0; } scen(); });
  tri(); scen();
})();
