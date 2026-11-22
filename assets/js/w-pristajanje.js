"use strict";
/* Simulator pristajanja: voziš sam, sa strojem i kormilom. Fizika i pravila lučice su u fizika.js (BoatPhys, DockWorld);
   ovdje je samo crtanje i upravljanje. Vrijeme teče stvarnom brzinom, brzine su u pravim čvorovima. */
(function(){
  const ds=el('dockSim'); if(!ds) return;
  (ds.closest('.card')||ds).insertAdjacentHTML('afterend','<div class="card" id="dockWind"></div>');
  const b=el('dockWind'), RM=SIM.RM;
  const {PPM,W,H,QX,BERTH,ENV,STR,LIM}=DockWorld, KN=BoatPhys.KN, R2D=180/Math.PI;
  const THR={'-2':'KRMOM','-1':'KRMOM POLAKO','0':'NEUTRAL','1':'POLAKO','2':'NAPRIJED'};
  const HINT={off:'Vjetar s kopna odmiče te od obale: priđi pod većim kutom i malo brže, pa se poravnaj tek uz samu obalu.',
    on:'Vjetar s mora gura te prema obali: stani usporedno s vezom dva do tri metra od obale i pusti da te vjetar primakne.'};
  const num=(x,d)=>x.toFixed(d==null?1:d).replace('.',','), wrap=a=>((a+540)%360)-180;
  let env='calm', str=1, w=null, over=false, started=false, paused=false, raf=null, last=0, vis=true, t=0, speed=1, ghost=true, trail=[], tt=0;
  let score=store.get('dockwind',{ok:0,n:0}), ob=!!store.get('dockdrive',0);

  b.innerHTML=`<h4>Simulator pristajanja: vozi sam</h4>
    <p class="dwIntro"><b>Zadatak:</b> dovezi brodicu u <b>žuti okvir VEZ</b> između dviju privezanih brodica i zaustavi je <b>bokom uz obalu</b>. Brodica je duga 6 m. Biraš pogon: ugrađeni motor s kormilom ili izvanbrodski motor. Vrijeme teče stvarnom brzinom.</p>
    <details class="dwPhys"><summary>Kako se brodica ponaša (pročitaj prije prve vožnje)</summary><ul>
      <li><b>Nema kočnice.</b> Iz 2 čv u neutralu klizi još desetak metara. Zaustavljaš je kratkom vožnjom krmom.</li>
      <li><b>Kormilo radi samo dok preko njega struji voda.</b> Kad stojiš, okret kormila ne čini ništa. Kratki udar gasa naprijed baci mlaz vijka na kormilo i zakrene krmu, a brodica jedva krene.</li>
      <li><b>Okreće se krma, ne pramac.</b> Brodica se vrti oko točke blizu pramca, pa krma u okretu zanosi van. Pazi na nju uz obalu.</li>
      <li><b>Ugrađeni motor: krmom krma bježi ulijevo</b> (desnokretni vijak), a kormilo krmom gotovo ne pomaže. Zato je lakše pristati lijevim bokom: kočenje krmom samo privuče krmu obali.</li>
      <li><b>Izvanbrodski motor: zakreće se cijeli vijak.</b> Bez gasa skreće slabo, pa se upravlja kratkim udarima gasa. Krmom vuče krmu onamo kamo okreneš kormilo, pa krmu možeš privući obali s bilo koje strane.</li>
      <li><b>Vjetar nosi cijelu brodicu i okreće pramac niz vjetar</b>, najviše kad ideš sporo. Struja nosi brodicu zajedno s vodom, bez obzira na to kamo gleda pramac.</li></ul></details>
    <div class="dwCoach knStepTxt" aria-live="polite"></div>
    <div class="dwEnv seg dwDrive"><span>Pogon</span><button type="button" data-ob="0"${ob?'':' class="on"'}>Ugrađeni motor i kormilo</button><button type="button" data-ob="1"${ob?' class="on"':''}>Izvanbrodski motor</button></div>
    <div class="dwEnv seg"><span>Uvjeti</span>${Object.keys(ENV).map(k=>`<button type="button" data-e="${k}"${k===env?' class="on"':''}>${ENV[k].n}</button>`).join('')}</div>
    <div class="dwEnv seg dwStr"><span>Jačina</span>${STR.map((x,i)=>`<button type="button" data-s="${i}"${i===str?' class="on"':''}>${x.n}</button>`).join('')}</div>
    <div class="dwStage" tabindex="0" aria-label="Simulator pristajanja. Strelice gore i dolje: stroj. Strelice lijevo i desno: kormilo. Razmak: neutral. R: kormilo ravno.">
      <svg viewBox="0 0 ${W} ${H}" class="simSvg dwSvg" role="img" aria-label="Lučica odozgo: obala je lijevo, prazan vez je između dviju privezanih brodica"><g class="dwBase"></g><g class="dwFlow"></g><g class="dwDyn"></g></svg>
      <div class="dwHud" aria-live="off"></div></div>
    <div class="dwGoal" aria-live="off"></div>
    <div class="dwCtl">
      <div class="dwGrp dwThr"><span id="dwThrL">Stroj</span><div class="dwLever" role="group" aria-labelledby="dwThrL">${[-2,-1,0,1,2].map(v=>`<button class="btn" data-t="${v}" type="button">${{'-2':'Krmom','-1':'Krmom polako','0':'Neutral','1':'Polako','2':'Naprijed'}[v]}</button>`).join('')}</div></div>
      <div class="dwGrp dwRud"><label for="dwRudIn">Kormilo</label>
        <div class="dwRudRow"><button class="btn" data-rd="-5" type="button" aria-label="Kormilo 5 stupnjeva ulijevo">←</button>
        <input id="dwRudIn" type="range" min="-35" max="35" step="5" value="0" aria-describedby="dwRudV">
        <button class="btn" data-rd="5" type="button" aria-label="Kormilo 5 stupnjeva udesno">→</button></div>
        <b id="dwRudV" class="dwRudV">ravno</b><button class="btn" data-r="0" type="button">Ravno</button></div>
      <div class="dwGrp dwOpt"><button class="btn dwPause" type="button">Pauza</button><button class="btn dwReset" type="button">Ispočetka</button>
        <button class="btn dwLine" type="button" aria-pressed="false">Pramčani konop</button><button class="btn dwGhost" type="button" aria-pressed="true">Predviđanje 10 s</button><button class="btn dwSpeed" type="button" aria-pressed="false">Vrijeme 2×</button></div></div>
    <div class="dwKeys">Tipkovnica (klikni na lučicu): <kbd>↑</kbd> <kbd>↓</kbd> stroj, <kbd>←</kbd> <kbd>→</kbd> kormilo, <kbd>razmak</kbd> neutral, <kbd>R</kbd> kormilo ravno, <kbd>K</kbd> pramčani konop, <kbd>P</kbd> pauza</div>
    <div class="dwMsg" aria-live="polite"></div>`;
  const base=$('.dwBase',b), flow=$('.dwFlow',b), dyn=$('.dwDyn',b), hud=$('.dwHud',b), msg=$('.dwMsg',b), goal=$('.dwGoal',b), rudIn=el('dwRudIn');
  const arrow=(x,y,ux,uy,L,col,sw)=>`<line x1="${(x-ux*L/2).toFixed(1)}" y1="${(y-uy*L/2).toFixed(1)}" x2="${(x+ux*(L/2-7)).toFixed(1)}" y2="${(y+uy*(L/2-7)).toFixed(1)}" stroke="${col}" stroke-width="${sw||3}" stroke-linecap="round"/><polygon points="${(x+ux*L/2).toFixed(1)},${(y+uy*L/2).toFixed(1)} ${(x+ux*(L/2-11)-uy*6).toFixed(1)},${(y+uy*(L/2-11)+ux*6).toFixed(1)} ${(x+ux*(L/2-11)+uy*6).toFixed(1)},${(y+uy*(L/2-11)-ux*6).toFixed(1)}" fill="${col}"/>`;

  function drawBase(){ const E=ENV[env], S=STR[str], fk=fitText(base.ownerSVGElement,W), fs=x=>(x*fk).toFixed(1); let g=SIM.water(W,H,'dw');
    g+=`<rect x="0" y="0" width="${QX}" height="${H}" fill="#6b7784"/><rect x="${QX-6}" y="0" width="6" height="${H}" fill="#4a545e"/>`;
    for(let y=20;y<H;y+=46) g+=`<rect x="${QX-20}" y="${y}" width="10" height="14" rx="3" fill="#2a3138"/>`;
    g+=`<text x="${QX/2}" y="${H-12}" text-anchor="middle" font-size="${fs(12)}" fill="#dfe6ec">OBALA</text>`;
    DockWorld.MOORC.forEach(([x,y,h])=>{ g+=SIM.boat(x,y,h,{s:2.2,fill:'#b8c6d2'}); });
    const by=(BERTH[0]+BERTH[1])/2;
    g+=`<rect x="${QX}" y="${BERTH[0]}" width="44" height="${BERTH[1]-BERTH[0]}" fill="#ffd166" opacity=".1" stroke="#ffd166" stroke-dasharray="6 5" stroke-opacity=".8"/>
      <g opacity=".32">${SIM.boat(QX+15,by,E.into||0,{s:1.6,fill:'#ffd166'})}</g>
      <text x="${QX+52}" y="${by+5*fk}" font-size="${fs(15)}" fill="#ffd166" font-weight="600">VEZ</text>
      <text x="${QX+12}" y="${8+14*fk}" font-size="${fs(12)}" fill="#9fb6c9" font-weight="600">N ↑</text>
      <g transform="translate(${W-124},${H-16})"><path d="M0,-5 V0 H${10*PPM} V-5" fill="none" stroke="#9fb6c9" stroke-width="1.5"/><text x="${5*PPM}" y="-7" text-anchor="middle" font-size="${fs(11)}" fill="#9fb6c9">10 m</text></g>`;
    if(E.wind[0]||E.wind[1]){ const L=30+S.wind*1.6;
      g+=`<g>${arrow(W-78,70,E.wind[0],E.wind[1],L,'#f5c542',3.4)}<text x="${W-78}" y="${E.wind[1]?74:70-L/2-12}" dx="${E.wind[1]?-14:0}" text-anchor="${E.wind[1]?'end':'middle'}" font-size="${fs(14)}" fill="#f5c542" font-weight="600">VJETAR ${S.wind} čv</text></g>`; }
    base.innerHTML=g; }
  function drawFlow(){ const E=ENV[env], S=STR[str]; if(!E.cur[1]){ if(flow.innerHTML) flow.innerHTML=''; return; } const fk=fitText(base.ownerSVGElement,W);
    const dir=E.cur[1], off=RM?0:(t*dir*S.cur*KN*PPM)%40;
    let g=''; for(let x=210;x<W;x+=90) g+=`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#7fd8f7" stroke-width="1.4" stroke-dasharray="10 30" stroke-dashoffset="${(-off).toFixed(1)}" opacity=".4"/>`;
    g+=`<g>${arrow(W-60,H/2,0,dir,30+S.cur*26,'#7fd8f7',3.4)}<text x="${W-74}" y="${H/2+5}" text-anchor="end" font-size="${(14*fk).toFixed(1)}" fill="#7fd8f7" font-weight="600">STRUJA ${num(S.cur)} čv</text></g>`;
    flow.innerHTML=g; }
  // gdje će brodica biti za 10 s ako ništa ne diraš: ista fizika, bez sudara
  function predict(){ const p=Object.assign({},w.s); let pts=''; for(let i=0;i<20;i++){ BoatPhys.step(p,w.env,.5); pts+=(p.x*PPM).toFixed(1)+','+(p.y*PPM).toFixed(1)+' '; }
    return `<polyline points="${(w.s.x*PPM).toFixed(1)},${(w.s.y*PPM).toFixed(1)} ${pts}" fill="none" stroke="#ffd166" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" opacity=".9"/><g opacity=".3">${SIM.boat(p.x*PPM,p.y*PPM,p.psi,{s:1.6,fill:'#ffd166'})}</g>`; }
  function draw(){ const s=w.s, x=s.x*PPM, y=s.y*PPM, q=s.psi/R2D, sn=Math.sin(q), c=Math.cos(q);
    let g=trail.length>1?`<polyline points="${trail.join(' ')}" fill="none" stroke="#e8f6ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".2"/>`:'';
    if(ghost&&!over&&started) g+=predict();
    // mlaz vijka: naprijed ga kormilo skreće u stranu (zato udar gasa okreće krmu), krmom ide prema pramcu
    if(Math.abs(s.T)>20){ const L=Math.min(46,10+Math.abs(s.T)/18), sx=x-sn*27, sy=y+c*27;
      if(s.T>0){ const a=q+Math.PI+s.del/R2D*.9, ux=Math.sin(a), uy=-Math.cos(a);
        g+=`<polygon points="${(sx-c*4).toFixed(1)},${(sy-sn*4).toFixed(1)} ${(sx+c*4).toFixed(1)},${(sy+sn*4).toFixed(1)} ${(sx+ux*L-uy*9).toFixed(1)},${(sy+uy*L+ux*9).toFixed(1)} ${(sx+ux*L+uy*9).toFixed(1)},${(sy+uy*L-ux*9).toFixed(1)}" fill="#ffffff" opacity=".4"/>`; }
      else g+=[-1,1].map(k=>`<line x1="${(sx+c*k*9).toFixed(1)}" y1="${(sy+sn*k*9).toFixed(1)}" x2="${(sx+c*k*13+sn*L*.6).toFixed(1)}" y2="${(sy+sn*k*13-c*L*.6).toFixed(1)}" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".4"/>`).join(''); }
    g+=SIM.boat(x,y,s.psi,{s:1.6,rud:-s.del});
    // strelica zanošenja: kamo vjetar i struja nose brodicu
    const F=BoatPhys.forces(s,w.env), cur=w.env.cur, wy=F.Yw/600, dx=cur[0]+c*wy, dy=cur[1]+sn*wy, dm=Math.hypot(dx,dy);
    if(dm>.06){ const ux=dx/dm, uy=dy/dm; g+=arrow(x-ux*52,y-uy*52,ux,uy,18+dm*40,cur[1]?'#7fd8f7':'#f5c542',3); }
    if(w.line){ const [bx,by]=DockWorld.bowAt(w.s); g+=`<line x1="${(bx*PPM).toFixed(1)}" y1="${(by*PPM).toFixed(1)}" x2="${(w.line.x*PPM).toFixed(1)}" y2="${(w.line.y*PPM).toFixed(1)}" stroke="#f2c14e" stroke-width="${w.line.T>5?2.6:1.6}" stroke-linecap="round"/><circle cx="${(w.line.x*PPM-3).toFixed(1)}" cy="${(w.line.y*PPM).toFixed(1)}" r="3.2" fill="#2a3138"/>`; }
    dyn.innerHTML=g;
    const sg=BoatPhys.ground(s,w.env);
    hud.innerHTML=`Stroj <b>${THR[s.thr]}</b>&emsp;Kormilo <b>${rudTxt(s.rud)}</b>, Kroz vodu <b>${num(Math.abs(s.u)/KN)} čv</b>, Nad dnom <b>${num(Math.hypot(sg[0],sg[1])/KN)} čv</b>, Do obale <b>${num(Math.max(0,w.gap))} m</b>`;
    $$('[data-t]',b).forEach(e=>{ const on=+e.dataset.t===s.thr; e.classList.toggle('p',on); e.setAttribute('aria-pressed',on); });
    if(document.activeElement!==rudIn) rudIn.value=s.rud; el('dwRudV').textContent=rudTxt(s.rud);
    const k=w.chk, it=(ok,tx)=>`<span class="${ok?'met':''}">${ok?'✓':'○'} ${tx}</span>`;
    goal.innerHTML=`<b>Cilj</b>${it(k.berth,'u okviru VEZ')}${it(k.par,'usporedno s obalom')}${it(k.side,'bok uz obalu')}${it(k.slow,'gotovo stoji')}<i class="dwHold"><i style="width:${Math.min(100,w.hold/LIM.hold*100).toFixed(0)}%"></i></i>`;
    coach(); }
  const rudTxt=r=>r?Math.abs(r)+'° '+(r>0?'desno':'lijevo'):'ravno';

  // trener: jedan jasan sljedeći potez
  let lastTip='';
  function coach(){ const box=$('.dwCoach',b), s=w.s, E=ENV[env], k=w.chk; let tip;
    const tx=(QX+24)/PPM, ty=(BERTH[0]+BERTH[1])/2/PPM, dx=tx-s.x, dy=ty-s.y, dist=Math.hypot(dx,dy);
    const hn=((s.psi%360)+360)%360, off=wrap(Math.atan2(dx,-dy)*R2D-hn), kn=w.sog/KN, north=Math.abs(wrap(hn))<90, away=north?'desno':'lijevo', to=north?'lijevo':'desno';
    const down=E.into!=null&&Math.abs(wrap(hn-E.into))>110&&dist<24&&dist>7&&Math.abs(off)<50;
    if(over) tip='';
    else if(!started) tip='<b>Kreni:</b> stroj na <b>Polako</b>. Brodica je teška tonu i pol, pa joj treba desetak sekundi da dobije brzinu. Vez je uz obalu lijevo.';
    else if(paused) tip='<b>Pauza.</b> Pogledaj žutu crtu: tamo će brodica biti za 10 s ako ništa ne promijeniš.';
    else if(w.line&&!(k.par&&k.side)) tip=ob?`<b>Konop drži pramac.</b> Kormilo ${to} (prema obali) i <b>Krmom</b>: konop se napne, a motor vuče krmu obali.`:`<b>Konop drži pramac.</b> Kormilo ${away} i kratko <b>Polako</b>: mlaz vijka gura krmu obali, a konop ne da brodici naprijed.`;
    else if(s.thr===0&&kn<.25&&dist>9) tip='<b>Stojiš.</b> Dok stojiš, kormilo ne radi. Daj <b>Polako</b>.';
    else if(ob&&s.thr<0&&Math.abs(s.rud)>=10) tip=`<b>Krmom te vodi motor.</b> Krma ide ${s.rud>0?'udesno':'ulijevo'}, na stranu na koju je kormilo. Za ravno krmom vrati kormilo na <b>Ravno</b>.`;
    else if(ob&&s.thr===0&&Math.abs(s.rud)>=15&&kn<1.3&&dist>4) tip='<b>Izvanbrodski bez gasa skreće slabo.</b> Ostavi kormilo zakrenuto i daj kratko <b>Polako</b>: mlaz vijka zakrene krmu.';
    else if(down) tip=`<b>Prilaziš niz ${E.what}.</b> ${E.what==='struju'?'Struja te gura':'Vjetar te gura'} naprijed i teže ćeš stati. Lakše je proći vez, okrenuti se i prići <b>pramcem u ${E.what}</b>.`;
    else if(dist>17&&Math.abs(off)>25) tip=`<b>Okreni pramac prema vezu:</b> kormilo ${off<0?'lijevo':'desno'}. Vrati ga na <b>Ravno</b> malo prije nego pramac dođe na cilj, jer se brodica još kratko zakreće.`;
    else if(dist>17) tip='<b>Dobar smjer.</b> Na pola puta stavi <b>Neutral</b> i pusti je da klizi. Prema obali ciljaj pod kutom od 20 do 30°.';
    else if(kn>1.4&&!k.side) tip=`<b>Prebrzo za prilaz (${num(kn)} čv).</b> <b>Neutral</b>, a ako i dalje klizi, kratko <b>Krmom polako</b>.`;
    else if(!k.par&&w.gap<4) tip=`<b>Poravnaj se:</b> kormilo ${away} i kratko <b>Polako</b>. Mlaz vijka zakrene krmu prema obali, a brodica jedva krene.`;
    else if(!k.par) tip='<b>Priđi pod kutom od 20 do 30°</b>, pramcem prema početku veza, brzinom oko 1 čv.';
    else if(!k.berth) tip='<b>Usporedan si s obalom.</b> Dođi u žuti okvir: kratko <b>Polako</b> ili <b>Krmom polako</b>.';
    else if(!k.side) tip=E.cross==='on'?`<b>Još ${num(w.gap)} m do obale.</b> Stani i pusti da te vjetar primakne.`:`<b>Još ${num(w.gap)} m do obale.</b> Kormilo ${to} i kratko <b>Polako</b>, pa odmah kormilo ${away} da se krma primakne.`;
    else if(!k.slow) tip='<b>Zakoči:</b> <b>Krmom polako</b> dok ne staneš, pa <b>Neutral</b>.';
    else tip='<b>Drži tako</b> dok se traka ne napuni.';
    if(tip!==lastTip){ lastTip=tip; box.innerHTML=tip; box.style.display=tip?'':'none'; } }

  function end(r){ over=true; coach(); score.n++; const E=ENV[env]; let ok=r.ok, html;
    if(!ok) html=r.why==='quay'?`<b>Udarac u obalu</b> brzinom ${num(r.kn)} čv. Uz obalu se dolazi najviše s oko 0,7 čv: ranije u <b>Neutral</b> i zakoči <b>krmom</b>.`
      :r.why==='boat'?`<b>Udario si u privezanu brodicu.</b> ${E.what?`Računaj da te ${E.what==='struju'?'struja':'vjetar'} cijelo vrijeme nosi${E.cur[1]||E.wind[1]?((E.cur[1]||E.wind[1])>0?' prema jugu':' prema sjeveru'):E.cross==='on'?' prema obali':' od obale'}.`:'Okreći ranije: krma u okretu zanosi van.'}`
      :'Izašao si iz lučice. Pokušaj ponovno.';
    else { score.ok++; if(window.VB) VB.widgetOk('dock');
      const into=E.into==null?null:Math.abs(wrap(r.heading-E.into))<30, port=Math.abs(wrap(r.heading))<90;
      html=into===null?(E.cross?`✓ <b>Pristao si uz bočni vjetar.</b> ${E.cross==='on'?'Vjetar te gurao prema obali, a ti si ga pustio da odradi zadnji metar.':'Vjetar te odmicao od obale, a ti si ga nadvladao prilazom pod kutom.'}`:`✓ <b>Pristao si.</b> Po mirnom moru svejedno je s koje strane prilaziš. ${port?'Pristao si lijevim bokom, pa ti je izboj krme pomogao.':'Pristao si desnim bokom: izboj krme te pri kočenju odmicao od obale.'}`)
        :into?`✓ <b>Pristao si pramcem u ${E.what}.</b> ${E.what==='struju'?'Struja te kočila':'Vjetar te kočio'}, a kormilo je slušalo do kraja jer je preko njega stalno strujala voda.`
        :`✓ Pristao si, ali <b>niz ${E.what}</b>. ${E.what==='struju'?'Struja te gurala':'Vjetar te gurao'} naprijed, pa si morao jače kočiti krmom. Po pravilu se prilazi <b>pramcem u ${E.what}</b>.`; }
    store.set('dockwind',score);
    msg.innerHTML=`<div class="nlRes ${ok?'rg':'rb'}">${html}</div><div class="btnrow"><button class="btn p dwReset" type="button">Pokušaj ponovno</button></div><div class="dwSc">Uspješnih pristajanja ${score.ok} od ${score.n}</div>`; }
  function frame(now){ raf=null; if(!vis||paused||over) return; let dt=Math.min(.05,(now-(last||now))/1000)*speed; last=now; t+=dt;
    while(dt>1e-6&&!over){ const h=Math.min(.025,dt); dt-=h; const r=DockWorld.tick(w,h); if(r) end(r); }
    tt+=1; if(tt%8===0){ const s=w.s, q=s.psi/R2D; trail.push((s.x*PPM-Math.sin(q)*24).toFixed(1)+','+(s.y*PPM+Math.cos(q)*24).toFixed(1)); if(trail.length>70) trail.shift(); }
    draw(); drawFlow(); if(!over) raf=requestAnimationFrame(frame); }
  function run(){ last=0; if(started&&!paused&&!over&&!raf) raf=requestAnimationFrame(frame); }
  function restart(){ if(raf){ cancelAnimationFrame(raf); raf=null; } w=DockWorld.world(env,str,ob); DockWorld.tick(w,0); over=false; started=false; paused=false; trail=[]; lastTip=null;
    $('.dwPause',b).textContent='Pauza'; $('.dwLine',b).setAttribute('aria-pressed','false'); drawBase(); drawFlow(); draw();
    const E=ENV[env], hard=ob&&env==='windOff'&&str===2;
    msg.innerHTML=(hard?'<div class="dwHint"><b>Najteži slučaj.</b> Izvanbrodski motor nema čime držati brodicu uz obalu protiv jakog vjetra s kopna. Bez konopa je ne možeš zadržati uz obalu. Priđi pramcem pod kutom, kad je pramac na manje od 2 m daj <b>Pramčani konop</b> (tipka K), zatim kormilo prema obali i <b>Krmom</b>: konop se napne, a motor privuče krmu.</div>':E.cross?`<div class="dwHint">${HINT[E.cross]}</div>`:'')+'<div class="dwSc">Simulacija kreće kad dirneš stroj ili kormilo.</div>'; }
  function act(f){ if(over) return; f(w.s); started=true; vis=true; if(paused) togglePause(); draw(); run(); }
  function togglePause(){ if(over||!started) return; paused=!paused; $('.dwPause',b).textContent=paused?'Nastavi':'Pauza'; draw(); run(); }
  const setRud=v=>act(s=>{ s.rud=BoatPhys.clamp(v,-35,35); });
  function toggleLine(){ if(over) return; const btn=$('.dwLine',b);
    if(w.line){ DockWorld.detach(w); } else if(!DockWorld.attach(w)){ msg.innerHTML='<div class="dwHint">Konop možeš dati na obalu kad je <b>pramac bliže od 2 m</b> i ideš <b>sporije od 1 čv</b>.</div>'; return; }
    else msg.innerHTML='<div class="dwHint">Pramčani konop je na obali. Drži pramac, a krmu primičeš motorom.</div>';
    btn.setAttribute('aria-pressed',!!w.line); draw(); }
  b.addEventListener('click',e=>{ const x=e.target.closest('button'); if(!x) return;
    if(x.dataset.ob){ ob=x.dataset.ob==='1'; store.set('dockdrive',ob?1:0); $$('.dwDrive button',b).forEach(y=>y.classList.toggle('on',y===x)); return restart(); }
    if(x.dataset.e){ env=x.dataset.e; $$('.dwEnv:not(.dwStr):not(.dwDrive) button',b).forEach(y=>y.classList.toggle('on',y===x)); return restart(); }
    if(x.dataset.s){ str=+x.dataset.s; $$('.dwStr button',b).forEach(y=>y.classList.toggle('on',y===x)); return restart(); }
    if(x.classList.contains('dwReset')) return restart();
    if(x.classList.contains('dwLine')) return toggleLine();
    if(x.classList.contains('dwPause')) return togglePause();
    if(x.classList.contains('dwGhost')){ ghost=!ghost; x.setAttribute('aria-pressed',ghost); return draw(); }
    if(x.classList.contains('dwSpeed')){ speed=speed===1?2:1; x.setAttribute('aria-pressed',speed===2); return; }
    if(x.dataset.t!=null) act(s=>{ s.thr=+x.dataset.t; });
    if(x.dataset.r!=null) setRud(+x.dataset.r);
    if(x.dataset.rd!=null) setRud(w.s.rud+ +x.dataset.rd); });
  rudIn.addEventListener('input',()=>setRud(+rudIn.value));
  const stage=$('.dwStage',b); stage.addEventListener('pointerdown',()=>stage.focus({preventScroll:true}));
  // tipke rade dok je fokus bilo gdje u simulatoru, osim na izboru uvjeta i na klizaču kormila (njega strelice već pomiču)
  b.addEventListener('keydown',e=>{ if(over||e.target.closest('.dwEnv')||e.target===rudIn||e.altKey||e.ctrlKey||e.metaKey) return; const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(k==='ArrowUp'||k==='w') act(s=>{ s.thr=Math.min(2,s.thr+1); }); else if(k==='ArrowDown'||k==='s') act(s=>{ s.thr=Math.max(-2,s.thr-1); });
    else if(k==='ArrowLeft'||k==='a') setRud(w.s.rud-5); else if(k==='ArrowRight'||k==='d') setRud(w.s.rud+5);
    else if(k===' '){ if(e.target.closest('button')) return; act(s=>{ s.thr=0; }); } else if(k==='k') toggleLine(); else if(k==='r') setRud(0); else if(k==='p') togglePause(); else return;
    e.preventDefault(); e.stopPropagation(); });
  if('IntersectionObserver' in window) new IntersectionObserver(es=>{ vis=es[0].isIntersecting; if(vis) run(); }).observe(b);
  restart(); onWidth(base.ownerSVGElement,()=>{ drawBase(); drawFlow(); });
  window.__DOCK={world:()=>w}; // za testove: stanje brodice
})();
