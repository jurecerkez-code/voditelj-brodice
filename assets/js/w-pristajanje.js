"use strict";
/* Pristajanje uz vjetar ili struju: simulator s upravljanjem. */
/* ═══════════════ PRISTAJANJE UZ VJETAR ILI STRUJU: upravljaš sam ═══════════════ */
/* Načelo iz poglavlja: pri pristajanju se plovi UZ vjetar ili UZ struju (pramcem u vjetar ili struju),
   brodica bolje sluša kormilo i lakše se zaustavlja. Vijak desnokretni: pri vožnji krmom krma izbija ulijevo.
   Pojednostavljena fizika: brzina kroz vodu + struja (cijela) + zanošenje vjetrom; 10 px/s ≈ 1 čv. */
(function(){
  const ds=el('dockSim'); if(!ds) return;
  (ds.closest('.card')||ds).insertAdjacentHTML('afterend','<div class="card" id="dockWind"></div>');
  const b=el('dockWind');
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W=640,H=400, QX=112, BERTH=[138,222], MOOR=[[QX,34,44,86],[QX,262,44,86]];
  const ENV={
    calm:{n:'Mirno',cur:[0,0],wind:[0,0],into:null},
    curS:{n:'Struja prema jugu',cur:[0,9],wind:[0,0],into:0,what:'struju'},
    curN:{n:'Struja prema sjeveru',cur:[0,-9],wind:[0,0],into:180,what:'struju'},
    windN:{n:'Vjetar sa sjevera',cur:[0,0],wind:[0,7],into:0,what:'vjetar'},
    windS:{n:'Vjetar s juga',cur:[0,0],wind:[0,-7],into:180,what:'vjetar'},
    windOff:{n:'Vjetar s kopna',cur:[0,0],wind:[7,0],into:null,what:'vjetar',cross:'off'},
    windOn:{n:'Vjetar s mora',cur:[0,0],wind:[-7,0],into:null,what:'vjetar',cross:'on'}
  };
  // v4: jačina vjetra ili struje (množi silu); strelice uz brod su dulje što je sila jača
  const STR=[['slab',.5],['umjeren',1],['jak',1.6]]; let str=1;
  const HINT={off:'Vjetar s kopna te odmiče od obale: priđi bliže i pod većim kutom, pa se poravnaj tek uz samu obalu.',
    on:'Vjetar s mora te gura prema obali: stani usporedno s vezom malo dalje od obale i pusti da te vjetar polako primakne.'};
  const THR={'-1':['KRMOM',-8],'0':['STOP',0],'1':['NAPRIJED POLAKO',9],'2':['NAPRIJED',18]};
  let env='calm', s=null, raf=null, last=0, vis=true, t=0, score=store.get('dockwind',{ok:0,n:0});
  const reset=()=>{ s={x:470,y:340,h:-25,v:0,thr:0,rud:0,rudA:0,yr:0,trail:[],hold:0,over:false,tt:0,started:false,chk:{}}; };
  const RUD=[-30,-15,0,15,30], SLOW=6, HOLD=1.2, GAP=12; // kormilo u 5 položaja; "stoji" = ispod 0,6 čv nad dnom
  const force=()=>{ const E=ENV[env], m=STR[str][1]; return {cur:[E.cur[0]*m,E.cur[1]*m], wind:[E.wind[0]*m,E.wind[1]*m]}; };
  const drift=()=>{ const F=force(), q=s.h*Math.PI/180, ax=[Math.sin(q),-Math.cos(q)], lat=[Math.cos(q),Math.sin(q)];
    const wl=F.wind[0]*ax[0]+F.wind[1]*ax[1], wb=F.wind[0]*lat[0]+F.wind[1]*lat[1], keel=1-Math.min(.5,Math.abs(s.v)/36);
    return [F.cur[0]+ax[0]*wl*.3+lat[0]*wb*.7*keel, F.cur[1]+ax[1]*wl*.3+lat[1]*wb*.7*keel]; };
  const sog=()=>{ const q=s.h*Math.PI/180, d=drift(); return [Math.sin(q)*s.v+d[0], -Math.cos(q)*s.v+d[1]]; };
  const hull=()=>{ const q=s.h*Math.PI/180, c=Math.cos(q), n=Math.sin(q);
    return [[-12,-28],[12,-28],[13,20],[-13,20],[0,-31]].map(([x,y])=>[s.x+x*c-y*n, s.y+x*n+y*c]); };

  b.innerHTML=`<h4>Pristani sam: vjetar i struja</h4>
    <p class="dwIntro"><b>Zadatak:</b> dovezi brodicu u <b>žuti okvir VEZ</b> između dviju privezanih brodica i zaustavi je <b>bokom uz obalu</b>, na mjestu prozirne brodice. Pravilo iz poglavlja: prilazi <b>pramcem u vjetar ili struju</b>. Tada te struja koči, kormilo bolje sluša i lakše staneš. Vijak je desnokretni: kad voziš krmom, krma izbija <b>ulijevo</b>.</p>
    <div class="dwCoach knStepTxt" aria-live="polite"></div>
    <div class="dwEnv seg"><span>Uvjeti</span>${Object.keys(ENV).map(k=>`<button type="button" data-e="${k}"${k===env?' class="on"':''}>${ENV[k].n}</button>`).join('')}</div>
    <div class="dwEnv seg dwStr"><span>Jačina</span>${STR.map((x,i)=>`<button type="button" data-s="${i}"${i===str?' class="on"':''}>${x[0]}</button>`).join('')}</div>
    <div class="dwStage" tabindex="0" aria-label="Simulator pristajanja. Strelice gore i dolje: stroj, lijevo i desno: kormilo, razmak: stop.">
      <svg viewBox="0 0 ${W} ${H}" class="simSvg dwSvg" role="img" aria-label="Lučica s obalom lijevo i praznim mjestom za vez"><g class="dwBase"></g><g class="dwFlow"></g><g class="dwDyn"></g></svg>
      <div class="dwHud mono" aria-live="off"></div></div>
    <div class="dwGoal" aria-live="off"></div>
    <div class="dwCtl">
      <div class="dwGrp"><span>Stroj</span><button class="btn" data-t="-1" type="button">◀◀ Krmom</button><button class="btn" data-t="0" type="button">■ Stop</button><button class="btn" data-t="1" type="button">Polako</button><button class="btn" data-t="2" type="button">▶▶ Naprijed</button></div>
      <div class="dwGrp"><span>Kormilo</span>${RUD.map(r=>`<button class="btn" data-r="${r}" type="button">${r<0?`◀ ${-r}°`:r>0?`${r}° ▶`:'● Ravno'}</button>`).join('')}</div>
      <button class="btn dwReset" type="button">↺ Ispočetka</button></div>
    <div class="dwKeys">Tipkovnica (klikni na lučicu): <kbd>↑</kbd> <kbd>↓</kbd> stroj · <kbd>←</kbd> <kbd>→</kbd> kormilo · <kbd>razmak</kbd> stop. Kormilo lijevo okreće pramac ulijevo.</div>
    <div class="dwMsg" aria-live="polite"></div>`;
  const base=$('.dwBase',b), flow=$('.dwFlow',b), dyn=$('.dwDyn',b), hud=$('.dwHud',b), msg=$('.dwMsg',b), goal=$('.dwGoal',b);
  function drawBase(){ let g=SIM.water(W,H,'dw');
    g+=`<rect x="0" y="0" width="${QX}" height="${H}" fill="#6b7784"/><rect x="${QX-6}" y="0" width="6" height="${H}" fill="#4a545e"/>`;
    for(let y=20;y<H;y+=46) g+=`<rect x="${QX-20}" y="${y}" width="10" height="14" rx="3" fill="#2a3138"/>`;
    g+=`<text x="${QX/2}" y="${H-12}" text-anchor="middle" font-size="12" fill="#dfe6ec">OBALA</text>`;
    // privezane brodice (prepreke) i prazan vez
    MOOR.forEach(([x,y,w,h])=>{ g+=`<g transform="translate(${x+w/2},${y+h/2}) rotate(${y<100?0:180})">${SIM.boat(0,0,0,{s:2.2,fill:'#b8c6d2'})}</g>`; });
    g+=`<rect x="${QX}" y="${BERTH[0]}" width="44" height="${BERTH[1]-BERTH[0]}" fill="#ffd166" opacity=".08" stroke="#ffd166" stroke-dasharray="6 5" stroke-opacity=".7"/>
      <g opacity=".32">${SIM.boat(QX+14,(BERTH[0]+BERTH[1])/2,ENV[env].into||0,{s:1.6,fill:'#ffd166'})}</g>
      <text x="${QX+50}" y="${(BERTH[0]+BERTH[1])/2+4}" font-size="15" fill="#ffd166" font-weight="800">VEZ</text>
      <text x="${W-14}" y="22" text-anchor="end" font-size="12" fill="#9fb6c9" font-weight="700">N ↑</text>`;
    const E=ENV[env];
    if(E.wind[0]||E.wind[1]){ const m=STR[str][1], L=16+18*m, ux=Math.sign(E.wind[0]), uy=Math.sign(E.wind[1]);
      g+=`<g transform="translate(${W-70},60)"><line x1="${-ux*L}" y1="${-uy*L}" x2="${ux*(L-8)}" y2="${uy*(L-8)}" stroke="#f5c542" stroke-width="3"/><polygon points="${ux*L+(uy?0:0)},${uy*L} ${ux*(L-12)-uy*7},${uy*(L-12)+ux*7} ${ux*(L-12)+uy*7},${uy*(L-12)-ux*7}" fill="#f5c542"/><text x="0" y="${uy?4:-14}" dx="${uy?-14:0}" text-anchor="${uy?'end':'middle'}" font-size="15" fill="#f5c542" font-weight="800">VJETAR · ${STR[str][0]}</text></g>`; }
    base.innerHTML=g; }
  function drawFlow(){ const E=ENV[env]; if(!E.cur[1]){ flow.innerHTML=''; return; } const dir=Math.sign(E.cur[1]), off=RM?0:(t*E.cur[1]*STR[str][1]*2)%40;
    let g=''; for(let x=210;x<W;x+=90) g+=`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#7fd8f7" stroke-width="1.4" stroke-dasharray="10 30" stroke-dashoffset="${-off}" opacity=".4"/>`;
    g+=`<g transform="translate(${W-60},${H/2})"><line x1="0" y1="${-dir*24}" x2="0" y2="${dir*18}" stroke="#7fd8f7" stroke-width="3"/><polygon points="0,${dir*28} -7,${dir*14} 7,${dir*14}" fill="#7fd8f7"/><text x="-12" y="4" text-anchor="end" font-size="15" fill="#7fd8f7" font-weight="800">STRUJA · ${STR[str][0]}</text></g>`;
    flow.innerHTML=g; }
  function draw(){ const tr=s.trail.length>1?`<polyline points="${s.trail.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#e8f6ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/>`:'';
    const d=drift(), dm=Math.hypot(d[0],d[1]); let fa='';
    if(dm>.2){ const ux=d[0]/dm, uy=d[1]/dm, L=10+dm*5, x0=s.x-ux*(40+L), y0=s.y-uy*(40+L), x1=s.x-ux*40, y1=s.y-uy*40, col=ENV[env].cur[1]?'#7fd8f7':'#f5c542';
      fa=`<g opacity=".95"><line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" stroke="${col}" stroke-width="3.2" stroke-linecap="round"/><polygon points="${(x1+ux*8).toFixed(1)},${(y1+uy*8).toFixed(1)} ${(x1-uy*6).toFixed(1)},${(y1+ux*6).toFixed(1)} ${(x1+uy*6).toFixed(1)},${(y1-ux*6).toFixed(1)}" fill="${col}"/></g>`; }
    dyn.innerHTML=tr+fa+SIM.boat(s.x,s.y,s.h,{s:1.6,rud:-s.rudA}); coach();
    const g=sog(), kn=Math.hypot(g[0],g[1])/10;
    hud.innerHTML=`Stroj <b>${THR[s.thr][0]}</b> · Kormilo <b>${s.rud?Math.abs(s.rud)+'° '+(s.rud>0?'D':'L'):'ravno'}</b> · Brzina nad dnom <b>${kn.toFixed(1).replace('.',',')} čv</b> · Zanošenje <b>${(Math.hypot(...drift())/10).toFixed(1).replace('.',',')} čv</b>`;
    $$('[data-t]',b).forEach(x=>x.classList.toggle('p',+x.dataset.t===s.thr)); $$('[data-r]',b).forEach(x=>x.classList.toggle('on',+x.dataset.r===s.rud));
    // cilj: četiri uvjeta uživo, zeleno kad je ispunjen; traka se puni dok ih držiš
    const c=s.chk, it=(ok,t)=>`<span class="${ok?'ok':''}">${ok?'✓':'○'} ${t}</span>`;
    goal.innerHTML=`<b>Cilj</b>${it(c.berth,'u okviru VEZ')}${it(c.par,'usporedno s obalom')}${it(c.side,'bok uz obalu')}${it(c.slow,'gotovo stoji')}<i class="dwHold"><i style="width:${Math.min(100,s.hold/HOLD*100).toFixed(0)}%"></i></i>`; }
  // v3: trener uživo, jedan jasan sljedeći potez
  let lastTip='';
  function coach(){ const el2=$('.dwCoach',b); if(!el2) return; let tip;
    const tx=QX+26, ty=(BERTH[0]+BERTH[1])/2, dx=tx-s.x, dy=ty-s.y, dist=Math.hypot(dx,dy);
    const brg=(Math.atan2(dx,-dy)*180/Math.PI+360)%360, hn=((s.h%360)+360)%360, off=((brg-hn+540)%360)-180;
    const g=sog(), kn=Math.hypot(g[0],g[1])/10;
    if(s.over) tip='';
    else if(!s.started) tip='<b>Korak 1:</b> klikni <b>Polako</b> (stroj naprijed). Brodica je dolje desno, cilj je žuti okvir <b>VEZ</b> uz obalu lijevo.';
    else if(s.thr<=0&&kn<.3&&dist>90) tip='<b>Stojiš.</b> Klikni <b>Polako</b> da kreneš prema VEZ-u.';
    else if(dist>150&&Math.abs(off)>20) tip='<b>Korak 2:</b> okreni pramac prema VEZ-u: kormilo <b>'+(off<0?'◀ lijevo':'desno ▶')+'</b>. Kad pramac gleda prema okviru, vrati kormilo na <b>Ravno</b>.';
    else if(dist>150) tip='<b>Dobar smjer.</b> Kormilo <b>Ravno</b> i drži <b>Polako</b>. Uspori tek kad budeš blizu.';
    else if(kn>1.1) tip='<b>Korak 3: previše brzo za pristajanje.</b> Stavi <b>Stop</b>, a ako i dalje klizi, kratko <b>Krmom</b> pa opet <b>Stop</b>.';
    else if(!s.chk.par) tip='<b>Korak 4: poravnaj se s obalom.</b> Pramac treba gledati gore ili dolje, usporedno s obalom. Malo kormila ('+(((hn>180?hn-360:hn))>0?'◀ lijevo':'desno ▶')+') i lagano <b>Polako</b>.';
    else if(!s.chk.berth) tip='<b>Poravnat si.</b> Sad polako uđi u žuti okvir: <b>Polako</b> ili kratko <b>Krmom</b>, ovisno gdje si.';
    else if(!s.chk.side) tip='<b>Skoro:</b> priđi bokom bliže obali (malo kormila prema obali uz <b>Polako</b>).';
    else tip='<b>Stani:</b> <b>Stop</b> i drži mirno dok se traka ne napuni.';
    if(tip!==lastTip){ lastTip=tip; el2.innerHTML=tip; el2.style.display=tip?'':'none'; } }
  function end(ok,html){ s.over=true; coach(); score.n++; if(ok){ score.ok++; if(window.VB) VB.widgetOk('dock'); } store.set('dockwind',score);
    msg.innerHTML=`<div class="nlRes ${ok?'rg':'rb'}">${html}</div><div class="btnrow"><button class="btn p dwReset" type="button">↺ Pokušaj ponovno</button></div><div class="dwSc">Uspješnih pristajanja ${score.ok} od ${score.n}</div>`; }
  function step(dt){ const E=ENV[env];
    const vt=THR[s.thr][1]; s.v+=(vt-s.v)*Math.min(1,dt*.7);
    // kormilo se okreće postupno (~60°/s), a brod ima tromost pri okretanju: bez trzaja
    s.rudA+=Math.max(-60*dt,Math.min(60*dt,s.rud-s.rudA));
    let yaw=0; if(s.v>=0) yaw=s.rudA/30*(20*s.v/10+(s.thr>0?10:0)); else yaw=s.rudA/30*(5*s.v/10);
    if(s.thr<0) yaw+=6; // desnokretni vijak, krmom: krma ulijevo, pramac udesno
    s.yr+=(yaw-s.yr)*Math.min(1,dt*2.2);
    s.h+=s.yr*dt; const g=sog(); s.x+=g[0]*dt; s.y+=g[1]*dt;
    s.tt+=dt; if(s.tt>.2){ s.tt=0; s.trail.push([s.x.toFixed(1),s.y.toFixed(1)]); if(s.trail.length>40) s.trail.shift(); }
    // sudari: obala i privezane brodice
    const P=hull(), minX=Math.min(...P.map(p=>p[0])); let touch=false;
    if(minX<QX){ const into=-g[0]; touch=true;
      if(into>8||Math.hypot(g[0],g[1])>12) return end(false,`<b>Udarac u obalu</b> brzinom ${(Math.hypot(g[0],g[1])/10).toFixed(1).replace('.',',')} čv. Priđi pod kutom i uspori na vrijeme: stani s <b>krmom</b>.`);
      s.x+=QX-minX; s.v*=.6; }
    if(minX<QX+.8) touch=true; // leži uz obalu: sila prema obali se poništava
    for(const [x,y,w,h] of MOOR) if(P.some(p=>p[0]>x&&p[0]<x+w&&p[1]>y&&p[1]<y+h)) return end(false,`<b>Udario si u privezanu brodicu.</b> ${E.cur[1]||E.wind[1]?`Pazi: ${E.what==='struju'?'struja':'vjetar'} te nosi ${ (E.cur[1]||E.wind[1])>0?'prema jugu':'prema sjeveru'}.`:'Uspori ranije.'}`);
    if(s.x>W+30||s.y<-40||s.y>H+40) return end(false,'Izašao si iz lučice. Pokušaj ponovno.');
    // uspjeh: bokom uz obalu, na vezu, gotovo stoji
    const hn=((s.h%360)+360)%360, par=Math.min(hn,Math.abs(hn-180),360-hn)<14, gap=Math.max(0,minX-QX), spd=Math.hypot(touch?Math.max(0,g[0]):g[0],g[1]);
    s.chk={berth:s.y>BERTH[0]+4&&s.y<BERTH[1]-4&&s.x<QX+70, par, side:gap<GAP, slow:spd<SLOW};
    if(par && gap<GAP && s.chk.berth && spd<SLOW){ s.hold+=dt; if(s.hold>HOLD){
      const into=E.into==null?null:Math.abs(((hn-E.into+540)%360)-180)<30;
      return end(true, into===null?(E.cross?`✓ <b>Pristao si uz bočni vjetar.</b> ${E.cross==='on'?'Vjetar te gurao prema obali, a ti si ga iskoristio umjesto da udariš.':'Vjetar te odmicao od obale, a ti si ga nadvladao prilazom pod kutom.'}`:`✓ <b>Pristao si.</b> Po mirnom moru svejedno je s koje strane prilaziš. Probaj sad sa strujom ili vjetrom.`)
        : into?`✓ <b>Pristao si pramcem u ${E.what}.</b> ${E.what==='struju'?'Struja te kočila':'Vjetar te kočio'}, a kormilo je slušalo, pa si stao na mjestu. Upravo tako kaže poglavlje.`
        : `✓ Pristao si, ali <b>niz ${E.what}</b>. ${E.what==='struju'?'Struja te gurala':'Vjetar te gurao'} naprijed, pa si morao dugo kočiti krmom. Po pravilu prilaziš <b>pramcem u ${E.what}</b>.`); } }
    else s.hold=0; }
  function frame(now){ raf=null; if(!vis) return; const dt=Math.min(.05,(now-(last||now))/1000); last=now; t+=dt;
    if(!s.over) step(dt); draw(); drawFlow(); if(!s.over) raf=requestAnimationFrame(frame); }
  function run(){ last=0; if(s.started&&!raf&&!s.over) raf=requestAnimationFrame(frame); }
  function restart(){ if(raf){ cancelAnimationFrame(raf); raf=null; } reset(); msg.innerHTML=''; drawBase(); drawFlow(); draw(); const E=ENV[env]; msg.innerHTML=(E.cross?`<div class="dwHint">${HINT[E.cross]}</div>`:'')+'<div class="dwSc">Simulacija kreće kad dirneš stroj ili kormilo.</div>'; }
  b.addEventListener('click',e=>{ const x=e.target.closest('button'); if(!x) return;
    if(x.dataset.e){ env=x.dataset.e; $$('.dwEnv:not(.dwStr) button',b).forEach(y=>y.classList.toggle('on',y===x)); return restart(); }
    if(x.dataset.s){ str=+x.dataset.s; $$('.dwStr button',b).forEach(y=>y.classList.toggle('on',y===x)); return restart(); }
    if(x.classList.contains('dwReset')) return restart();
    if(s.over) return;
    s.started=true; vis=true; // klik znači da je widget na ekranu
    if(x.dataset.t!=null) s.thr=+x.dataset.t;
    if(x.dataset.r!=null) s.rud=+x.dataset.r; // gumb = točan položaj kormila, bez skrivenog zbrajanja
    draw(); run(); });
  const stage=$('.dwStage',b); stage.addEventListener('pointerdown',()=>stage.focus({preventScroll:true}));
  // tipke rade dok je fokus bilo gdje u widgetu (i nakon klika na gumb)
  b.addEventListener('keydown',e=>{ if(s.over||e.target.closest('.dwEnv')) return; const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(k==='ArrowUp'||k==='w') s.thr=Math.min(2,s.thr+1); else if(k==='ArrowDown'||k==='s') s.thr=Math.max(-1,s.thr-1);
    else if(k==='ArrowLeft'||k==='a') s.rud=Math.max(-30,s.rud-15); else if(k==='ArrowRight'||k==='d') s.rud=Math.min(30,s.rud+15);
    else if(k===' ') s.thr=0; else return;
    s.started=true; vis=true; e.preventDefault(); e.stopPropagation(); draw(); run(); });
  if('IntersectionObserver' in window) new IntersectionObserver(es=>{ vis=es[0].isIntersecting; if(vis) run(); }).observe(b);
  restart();
})();
