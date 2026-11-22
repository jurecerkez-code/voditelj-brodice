"use strict";
/* Svjetla: sektori svjetala, simulator „prepoznaj brod“, dnevni znakovi. */
/* ═══════════════ LIGHT SECTORS ═══════════════ */
(function(){
  const b=el('sectorWidget'); if(!b) return;
  const S=420,c=S/2,R=150, OR=188; // OR: radijus putanje promatrača
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let brg=40, playing=false, raf=0, t0=0, b0=0;
  // brg: položaj promatrača, u stupnjevima od pramca, u smjeru kazaljke na satu
  function arc(a1,a2,col,r,op){
    const p=(a)=>[c+Math.sin(a*Math.PI/180)*r, c-Math.cos(a*Math.PI/180)*r];
    const [x1,y1]=p(a1),[x2,y2]=p(a2);
    const large=((a2-a1+360)%360)>180?1:0;
    return `<path d="M${c},${c} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z" fill="${col}" opacity="${op}" style="transition:opacity .25s"/>`;
  }
  function seen(x){
    x=((x%360)+360)%360;
    return { mast: x<=112.5||x>=247.5, stbd: x<=112.5, port: x>=247.5||x===0, stern: x>=112.5&&x<=247.5 };
  }
  function draw(){
    const v=seen(brg);
    let g=`<clipPath id="secSeaClip"><circle cx="${c}" cy="${c}" r="${OR+16}"/></clipPath><circle cx="${c}" cy="${c}" r="${OR+16}" fill="#071320"/><g clip-path="url(#secSeaClip)" opacity=".55">${seaBackground(S,S,{view:'top',night:true})}</g>`; // v4
    g+=`<circle cx="${c}" cy="${c}" r="${OR}" fill="none" stroke="#1d3a52" stroke-dasharray="2 6"/>`;
    // v3: vanjska skala: crtice svakih 22,5° i oznake 0/90/180/270 (od pramca)
    for(let d=0;d<360;d+=22.5){ const q=d*Math.PI/180, r1=OR+(d%90?9:4), r2=OR+16; g+=`<line x1="${(c+Math.sin(q)*r1).toFixed(1)}" y1="${(c-Math.cos(q)*r1).toFixed(1)}" x2="${(c+Math.sin(q)*r2).toFixed(1)}" y2="${(c-Math.cos(q)*r2).toFixed(1)}" stroke="#5b8bab" stroke-width="${d%90?1:1.6}" opacity="${d%90?.6:.9}"/>`; }
    [0,90,180,270].forEach(d=>{ const q=d*Math.PI/180, x=c+Math.sin(q)*(OR+26), y=c-Math.cos(q)*(OR+26)+4; if(d===90||d===270) return;
      g+=`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="10" fill="${C.txt2}" font-family="var(--mono)">${d}°</text>`; });
    g+=`<text x="${c+OR+20}" y="${c+4}" text-anchor="start" font-size="10" fill="${C.txt2}" font-family="var(--mono)">90°</text><text x="${c-OR-20}" y="${c+4}" text-anchor="end" font-size="10" fill="${C.txt2}" font-family="var(--mono)">270°</text>`;
    g+=arc(247.5,112.5,SIG.w,R,v.mast?.24:.07);
    g+=arc(112.5,247.5,'#cfd9e2',R*0.72,v.stern?.26:.12); // i kad ga ne vidiš, sektor ostaje uočljiv
    g+=arc(0,112.5,SIG.g,R*0.88,v.stbd?.42:.1);
    g+=arc(247.5,360,SIG.r,R*0.88,v.port?.42:.1);
    // V4-B3: poprečnica (90° i 270°) i kut od 22,5° iza nje do granice sektora
    [[90,112.5,1],[270,247.5,-1]].forEach(([bm,a,sg])=>{ const P=(d,r)=>[c+Math.sin(d*Math.PI/180)*r, c-Math.cos(d*Math.PI/180)*r], e=P(bm,OR+6), s1=P(bm,R+18), s2=P(a,R+18), m=P((bm+a)/2,R+32);
      g+=`<line x1="${c}" y1="${c}" x2="${e[0].toFixed(1)}" y2="${e[1].toFixed(1)}" stroke="#ffd166" stroke-width="1" stroke-dasharray="1.5 3" opacity=".7"/>
        <path d="M${s1[0].toFixed(1)},${s1[1].toFixed(1)} A${R+18},${R+18} 0 0 ${sg>0?1:0} ${s2[0].toFixed(1)},${s2[1].toFixed(1)}" fill="none" stroke="#ffd166" stroke-width="2"/>
        <text x="${m[0].toFixed(1)}" y="${(m[1]+4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="#ffd166" paint-order="stroke" stroke="#071320" stroke-width="3">22,5°</text>`; });

    // granice sektora
    [112.5,247.5].forEach(a=>{ const x=c+Math.sin(a*Math.PI/180)*(OR+10), y=c-Math.cos(a*Math.PI/180)*(OR+10);
      g+=`<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="#5b8bab" stroke-opacity=".35" stroke-dasharray="3 4"/>`;
      g+=`<text x="${c+Math.sin(a*Math.PI/180)*(OR+22)}" y="${c-Math.cos(a*Math.PI/180)*(OR+22)+4}" text-anchor="middle" font-size="10" fill="${C.txt2}" font-family="var(--mono)">${String(a).replace('.',',')}°</text>`; });
    g+=`<text x="${c}" y="${c-R+2}" text-anchor="middle" font-size="12" fill="#fff" font-weight="600" paint-order="stroke" stroke="#071320" stroke-width="3" opacity="${v.mast?1:.6}">JARBOLNO 225°</text>`;
    g+=`<text x="${c}" y="${c+R*0.72+16}" text-anchor="middle" font-size="12" fill="#cfd9e2" font-weight="600" paint-order="stroke" stroke="#071320" stroke-width="3" opacity="${v.stern?1:.6}">KRMENO 135°</text>`;
    g+=`<text x="${c+R*0.62}" y="${c-30}" text-anchor="middle" font-size="12" fill="${SIG.g}" font-weight="600" paint-order="stroke" stroke="#071320" stroke-width="3" opacity="${v.stbd?1:.6}">112,5°</text>`;
    g+=`<text x="${c-R*0.62}" y="${c-30}" text-anchor="middle" font-size="12" fill="${SIG.r}" font-weight="600" paint-order="stroke" stroke="#071320" stroke-width="3" opacity="${v.port?1:.6}">112,5°</text>`;
    // linija pogleda
    const ox=c+Math.sin(brg*Math.PI/180)*OR, oy=c-Math.cos(brg*Math.PI/180)*OR;
    g+=`<line x1="${ox}" y1="${oy}" x2="${c}" y2="${c}" stroke="${C.acc}" stroke-width="1.2" stroke-dasharray="5 4" opacity=".8"/>`;
    // brod odozgo
    g+=`<g transform="translate(${c},${c})">
      <path d="M0,-46 C14,-26 17,0 15,32 L-15,32 C-17,0 -14,-26 0,-46 Z" fill="#1d3a52" stroke="#5b8bab" stroke-width="1.5"/>
      <circle cx="-15" cy="-6" r="5" fill="${SIG.r}" opacity="${v.port?1:.3}"/><circle cx="15" cy="-6" r="5" fill="${SIG.g}" opacity="${v.stbd?1:.3}"/>
      <circle cx="0" cy="-16" r="5" fill="${SIG.w}" opacity="${v.mast?1:.3}"/><circle cx="0" cy="30" r="5" fill="${SIG.w}" opacity="${v.stern?1:.3}"/>
      <text y="-54" text-anchor="middle" font-size="11" fill="${C.acc}" font-weight="600">PRAMAC</text>
      <text y="50" text-anchor="middle" font-size="11" fill="${C.acc}" font-weight="600">KRMA</text></g>`;
    // promatrač (tvoja brodica), pramcem prema brodu
    g+=`<g transform="translate(${ox},${oy}) rotate(${brg+180})">
      <path d="M0,-11 L6,2 L6,9 L-6,9 L-6,2 Z" fill="${C.acc}" stroke="#0a1420"/></g>
      <text x="${ox}" y="${oy+(oy>c?24:-16)}" text-anchor="middle" font-size="11" font-weight="600" fill="${C.acc}">TI</text>`;
    b.querySelector('.secsvg').innerHTML=SVG(S,S,g).replace(`viewBox="0 0 ${S} ${S}"`,`viewBox="-40 -28 ${S+80} ${S+56}"`); // v3: mjesta za vanjsku skalu
    // tumačenje
    const L=[]; if(v.mast) L.push('<b style="color:var(--txt)">jarbolno</b>'); if(v.port) L.push('<b class="c-red">crveno bočno</b>');
    if(v.stbd) L.push('<b class="c-green">zeleno bočno</b>'); if(v.stern) L.push('<b class="c-txt2">krmeno</b>');
    let m;
    if(v.stern && !v.mast) m='Gledaš mu krmu. Ako ga sustižeš, ti si brod koji pretječe i <b>ti se uklanjaš</b>.';
    else if(v.port && v.stbd) m='Gledaš ga ravno u pramac. Nasuprotni kursevi: <b>oba skreću udesno</b>.';
    else if(v.port) m='Vidiš njegov lijevi bok, on ti je s desne strane. Ako vam se kursevi sijeku, <b>ti izbjegavaš</b>.';
    else m='Vidiš njegov desni bok, on ti je s lijeve strane. Ako vam se kursevi sijeku, <b>on izbjegava</b>, ti zadržavaš kurs i brzinu.';
    if((v.mast&&v.stern)) m='Na samoj granici sektora (112,5° ili 247,5°) svjetla se smjenjuju; u praksi vidiš jedno ili drugo.';
    b.querySelector('.secinfo').innerHTML=`<div class="cap">položaj promatrača: ${Math.round(brg)}° od pramca</div>
      <div class="mt4">Vidiš: ${L.join(' + ')}</div><div class="mt4 c-txt2">${m}</div>`;
    const r=b.querySelector('input[type=range]'); if(r && document.activeElement!==r) r.value=Math.round(brg)%360;
  }
  function loop(t){
    if(!playing) return;
    if(!t0){ t0=t; b0=brg; }
    brg=(b0+(t-t0)/1000*24)%360; // 24° u sekundi: jedan krug za 15 s
    draw(); raf=requestAnimationFrame(loop);
  }
  b.innerHTML=`<div class="secsvg"></div>
    <div class="secctl" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px;text-align:left">
      <button class="btn p" type="button">Obiđi brod</button>
      <input type="range" min="0" max="359" step="1" value="${brg}" aria-label="Položaj promatrača u stupnjevima od pramca" style="flex:1;min-width:180px;accent-color:var(--acc)">
    </div>
    <div class="secinfo" style="text-align:left;margin-top:10px;font-size:14px"></div>`;
  const btn=b.querySelector('button'), rng=b.querySelector('input');
  btn.addEventListener('click',()=>{
    if(RM){ brg=(Math.round(brg/45)*45+45)%360; draw(); return; } // bez animacije: korak od 45°
    playing=!playing; btn.textContent=playing?'Zaustavi':'Obiđi brod';
    if(playing){ t0=0; raf=requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
  });
  rng.addEventListener('input',()=>{ playing=false; cancelAnimationFrame(raf); btn.textContent='Obiđi brod'; brg=+rng.value; draw(); });
  if(RM) btn.textContent='Sljedećih 45°';
  draw();
})();

/* ═══════════════ LIGHT SIMULATOR ═══════════════ */
const VESSELS = [
  {id:'mot50',n:'Motorni brod < 50 m (u plovidbi)',cat:'motor',
   L:[{t:'mast',c:'w'},{t:'side'},{t:'stern'}],
   note:'Jedno jarbolno + bočna + krmeno. Brod kraći od 50 m nije obvezan isticati drugo jarbolno svjetlo, ali smije.'},
  {id:'mot50p',n:'Motorni brod > 50 m (u plovidbi)',cat:'motor',
   L:[{t:'mast2'},{t:'side'},{t:'stern'}],
   note:'Dva jarbolna svjetla: prednje je NIŽE, stražnje VIŠE. Plus bočna i krmeno.'},
  {id:'mot12',n:'Motorna brodica do 12 m',cat:'motor',
   L:[{t:'allround',c:'w'},{t:'side'}],
   note:'Bijelo kružno svjetlo (360°) + bočna svjetla.'},
  {id:'mot7',n:'Motorna brodica < 7 m, brzina < 7 čv',cat:'motor',
   L:[{t:'allround',c:'w'}],
   note:'Jedno bijelo kružno svjetlo i, ako je izvedivo, bočna svjetla.'},
  {id:'sail20',n:'Jedrenjak > 20 m',cat:'sail',
   L:[{t:'side'},{t:'stern'},{t:'opt2',c:['r','g']}],
   note:'Bočna + krmeno. NEMA jarbolnog. Može (ne mora) pri vrhu jarbola dva kružna: CRVENO iznad ZELENOG.'},
  {id:'sail20m',n:'Jedrilica do 20 m: trobojna svjetiljka',cat:'sail',
   L:[{t:'tricolor'}],
   note:'Kombinirana trobojna svjetiljka pri vrhu jarbola (bočna + krmeno u jednoj). Tada NE SMIJE pokazivati nikakva druga svjetla.'},
  {id:'motsail',n:'Motorni jedrenjak (jedra + motor)',cat:'motor',
   L:[{t:'mast',c:'w'},{t:'side'},{t:'stern'}],day:'cone_down',
   note:'TRIK: smatra se BRODOM NA MEHANIČKI POGON: pokazuje sva svjetla motornog broda. Danju: CRNI ČUNJ VRHOM DOLJE. NEMA prednost jedrilice.'},
  {id:'anchor',n:'Usidreni brod',cat:'spec',
   L:[{t:'allround',c:'w'}],day:'ball',
   note:'Jedno bijelo kružno svjetlo na pramčanom dijelu. >50 m: još jedno bijelo na krmi, niže. >100 m: pali i sva palubna svjetla. Danju: JEDNA CRNA KUGLA.'},
  {id:'nuc',n:'Brod nesposoban za manevriranje',cat:'spec',
   L:[{t:'vert',c:['r','r']}],day:'2ball',
   note:'Dva CRVENA kružna svjetla u okomici. Danju: DVIJE CRNE KUGLE. Svi ga izbjegavaju.'},
  {id:'aground',n:'Nasukani brod',cat:'spec',
   L:[{t:'vert',c:['r','r']},{t:'allround',c:'w'}],day:'3ball',
   note:'Dva crvena u okomici + svjetla usidrenog broda (prema duljini). Danju: TRI CRNE KUGLE.'},
  {id:'ram',n:'Ograničene sposobnosti manevriranja',cat:'spec',
   L:[{t:'vert',c:['r','w','r']}],day:'ball_dbl_ball',
   note:'CRVENO, BIJELO, CRVENO u okomici. Kad se kreće kroz vodu, uz to nosi i jarbolno, bočna i krmeno svjetlo. Danju: kugla, dvočunj spojen bazama, kugla.'},
  {id:'cbd',n:'Brod ograničen svojim gazom',cat:'spec',
   L:[{t:'vert',c:['r','r','r']}],day:'cylinder',
   note:'TRI CRVENA kružna svjetla u okomici, uz svjetla motornog broda u plovidbi (jarbolno, bočna, krmeno). Danju: CRNI VALJAK (cilindar).'},
  {id:'mine',n:'Brod vrši razminiranje',cat:'spec',
   L:[{t:'cross',c:'g'}],day:'3ball_cross',
   note:'TRI ZELENA kružna svjetla u KRIŽ pri vrhu jarbola, uz svjetla motornog broda (ili usidrenog). Ne prilazi bliže od 1000 m, s bilo koje strane (stare skripte: 1000 m po krmi, 500 m po bokovima).'},
  {id:'trawl',n:'Brod zauzet koćarenjem',cat:'fish',
   L:[{t:'vert',c:['g','w']},{t:'side'},{t:'stern'}],day:'2cone_point',
   note:'ZELENO iznad BIJELOG. Danju: dvočunj spojen vrhovima. (Kad se kreće kroz vodu, i bočna i krmeno.)'},
  {id:'fish',n:'Brod zauzet ribolovom (osim koćarenja)',cat:'fish',
   L:[{t:'vert',c:['r','w']},{t:'side'},{t:'stern'}],day:'2cone_point',
   note:'CRVENO iznad BIJELOG. Danju: dvočunj spojen vrhovima; ako je kraći od 20 m: može znak oblika KOŠARE.'},
  {id:'pilot',n:'Peljarski brod (pilotina) u službi',cat:'spec',
   L:[{t:'vert',c:['w','r']},{t:'side'},{t:'stern'}],day:'flagH',
   note:'BIJELO iznad CRVENOG. Danju: zastavica „H“ (bijelo-crvena). Zapamti obrnuto od ribara.'},
  {id:'tow',n:'Tegljač: tegalj < 200 m',cat:'motor',
   L:[{t:'mast2v'},{t:'side'},{t:'stern'},{t:'towyellow'}],
   note:'Dva jarbolna u okomici na prednjem jarbolu + bočna + krmeno + ŽUTO svjetlo za tegljenje IZNAD krmenog.'},
  {id:'tow200',n:'Tegljač: tegalj > 200 m',cat:'motor',
   L:[{t:'mast3'},{t:'side'},{t:'stern'},{t:'towyellow'}],day:'2cone_base',
   note:'TRI jarbolna u okomici (jer je tegalj > 200 m) + bočna + krmeno + žuto. Danju: dvočunj spojen bazama na tegljaču I na tegljenom.'}
];

(function(){
  const stage=el('lightStage'); if(!stage) return;
  let cur=VESSELS[0], quiz=false, score={c:0,t:0};
  const cats={motor:'Mehanički pogon',sail:'Jedra',fish:'Ribolov',spec:'Posebni'};

  let view='ahead';
  const VIEWS={ahead:'S pramca (ide prema tebi)',stbd:'S desnog boka',port:'S lijevog boka',astern:'S krme (udaljava se)',top:'Pogled odozgo (sektori)'};
  function lightsFor(v,vw){
    // shematski noćni prikaz; vw = odakle gledaš (pramac, desni bok, lijevi bok, krma)
    vw=vw||'ahead';
    const out=[], side=vw==='stbd'?1:vw==='port'?-1:0; // side: bok prema promatraču, +1 = pramac desno
    const ax=side*30;
    v.L.forEach(l=>{
      if(l.t==='mast' && vw!=='astern'){ out.push({x:ax,y:36,c:SIG.w,l:'jarbolno (bijelo, 225°)'}); }
      if(l.t==='mast2' && vw!=='astern'){
        if(side){ out.push({x:-side*40,y:20,c:SIG.w,l:'stražnje jarbolno: VIŠE'}); out.push({x:side*52,y:56,c:SIG.w,l:'prednje jarbolno: NIŽE'}); }
        else { out.push({x:0,y:20,c:SIG.w,l:'stražnje jarbolno: VIŠE'}); out.push({x:0,y:56,c:SIG.w,l:'prednje jarbolno: NIŽE'}); } }
      // v3: tegljač nosi dva jarbolna u okomici na istom (prednjem) jarbolu
      if(l.t==='mast2v' && vw!=='astern'){ out.push({x:ax,y:20,c:SIG.w,l:'jarbolno (gornje)'}); out.push({x:ax,y:48,c:SIG.w,l:'jarbolno (donje)'}); }
      if(l.t==='mast3' && vw!=='astern'){ out.push({x:ax,y:8,c:SIG.w,l:'jarbolno 3'}); out.push({x:ax,y:36,c:SIG.w,l:'jarbolno 2'}); out.push({x:ax,y:64,c:SIG.w,l:'jarbolno 1'}); }
      if(l.t==='side'){
        // brod ide PREMA tebi: njegov desni bok (zeleno) tebi je slijeva, lijevi bok (crveno) zdesna
        if(vw==='ahead'){ out.push({x:-74,y:104,c:SIG.g,l:'bočno desno (zeleno): tebi slijeva'}); out.push({x:74,y:104,c:SIG.r,l:'bočno lijevo (crveno): tebi zdesna'}); }
        if(vw==='stbd') out.push({x:40,y:104,c:SIG.g,l:'bočno desno (zeleno)'});
        if(vw==='port') out.push({x:-40,y:104,c:SIG.r,l:'bočno lijevo (crveno)'}); }
      if(l.t==='stern' && vw==='astern'){ out.push({x:0,y:132,c:'#dfe8ef',l:'krmeno (bijelo, 135°)'}); }
      if(l.t==='allround'){ const ag=v.id==='aground'; out.push({x:ag?ax+(side?side*90:60):ax,y:ag?70:44,c:SIG.w,l:ag?'sidreno bijelo kružno (pramac)':'bijelo kružno (360°)'}); }
      if(l.t==='tricolor'){
        if(vw==='ahead'){ out.push({x:-8,y:26,c:SIG.g,l:'trobojna: zeleno (tebi slijeva)'}); out.push({x:8,y:26,c:SIG.r,l:'trobojna: crveno (tebi zdesna)'}); }
        if(vw==='stbd') out.push({x:ax,y:26,c:SIG.g,l:'trobojna: zeleno'});
        if(vw==='port') out.push({x:ax,y:26,c:SIG.r,l:'trobojna: crveno'});
        if(vw==='astern') out.push({x:0,y:26,c:'#dfe8ef',l:'trobojna: bijelo prema krmi'}); }
      if(l.t==='vert'){ l.c.forEach((cc,i)=> out.push({x:ax,y:24+i*34,c:cc==='r'?SIG.r:cc==='g'?SIG.g:'#fff',l:'kružno '+(cc==='r'?'crveno':cc==='g'?'zeleno':'bijelo')})); }
      if(l.t==='opt2'){ out.push({x:ax,y:6,c:SIG.r,l:'opcijsko crveno'}); out.push({x:ax,y:32,c:SIG.g,l:'opcijsko zeleno'}); }
      if(l.t==='cross'){ out.push({x:ax,y:14,c:SIG.g,l:'zeleno (vrh)'}); out.push({x:ax-26,y:44,c:SIG.g,l:'zeleno (lijevo)'}); out.push({x:ax+26,y:44,c:SIG.g,l:'zeleno (desno)'}); }
      if(l.t==='towyellow' && vw==='astern'){ out.push({x:0,y:108,c:SIG.y,l:'žuto za tegljenje: iznad krmenog'}); }
    });
    return out;
  }
  function dayShape(k){
    const S={
      ball:'<circle cy="0" r="13" fill="#11161c" stroke="#5b8bab"/>',
      '2ball':'<circle cy="-16" r="12" fill="#11161c" stroke="#5b8bab"/><circle cy="14" r="12" fill="#11161c" stroke="#5b8bab"/>',
      '3ball':'<circle cy="-30" r="11" fill="#11161c" stroke="#5b8bab"/><circle cy="0" r="11" fill="#11161c" stroke="#5b8bab"/><circle cy="30" r="11" fill="#11161c" stroke="#5b8bab"/>',
      '3ball_cross':'<circle cy="-26" r="11" fill="#11161c" stroke="#5b8bab"/><circle cx="-26" cy="4" r="11" fill="#11161c" stroke="#5b8bab"/><circle cx="26" cy="4" r="11" fill="#11161c" stroke="#5b8bab"/>',
      cone_down:'<polygon points="0,16 -15,-14 15,-14" fill="#11161c" stroke="#5b8bab"/>',
      cylinder:'<rect x="-12" y="-18" width="24" height="36" fill="#11161c" stroke="#5b8bab"/>',
      '2cone_point':'<polygon points="0,0 -14,-26 14,-26" fill="#11161c" stroke="#5b8bab"/><polygon points="0,0 -14,26 14,26" fill="#11161c" stroke="#5b8bab"/>',
      '2cone_base':'<polygon points="0,-26 -14,0 14,0" fill="#11161c" stroke="#5b8bab"/><polygon points="0,26 -14,0 14,0" fill="#11161c" stroke="#5b8bab"/>',
      ball_dbl_ball:'<circle cy="-40" r="10" fill="#11161c" stroke="#5b8bab"/><polygon points="0,-22 -12,-2 12,-2" fill="#11161c" stroke="#5b8bab"/><polygon points="0,18 -12,-2 12,-2" fill="#11161c" stroke="#5b8bab"/><circle cy="38" r="10" fill="#11161c" stroke="#5b8bab"/>',
      flagH:'<rect x="-20" y="-14" width="20" height="28" fill="#fff"/><rect x="0" y="-14" width="20" height="28" fill="#ef4a5a"/><line x1="-20" y1="-18" x2="-20" y2="26" stroke="#5b8bab" stroke-width="2"/>'
    };
    return S[k]||'';
  }
  /* V4-B3 */
  /* v3 · noćni prizor: silueta brodice (bok ili pramac/krma), jarboli ispod jarbolnih svjetala, more s odsjajima.
     Položaji svjetala dolaze iz lightsFor() (nepromijenjeno); mijenja se samo crtež oko njih. */
  const LS_RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LS_SMALL={mot12:1,mot7:1,sail20m:1};
  let DAY=false; // V4-DAYNIGHT: isti brod i kut danju (svjetla ugašena, dnevni znak na jarbolu)
  function lsDefs(){ return `<defs>
      <linearGradient id="lsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030812"/><stop offset="1" stop-color="#0b1c2e"/></linearGradient>
      <linearGradient id="lsSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2238"/><stop offset="1" stop-color="#02070d"/></linearGradient>
      <linearGradient id="lsHull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3a52"/><stop offset=".5" stop-color="#132a3e"/><stop offset="1" stop-color="#0a1826"/></linearGradient>
      <linearGradient id="lsCab" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#23425c"/><stop offset="1" stop-color="#0f2233"/></linearGradient>
      <radialGradient id="lsGlow"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".35" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <filter id="lsBlur" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>
      <linearGradient id="lsSkyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9fc4"/><stop offset="1" stop-color="#d3e4ef"/></linearGradient>
      <linearGradient id="lsSeaD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6f98"/><stop offset="1" stop-color="#0f3a5a"/></linearGradient>
      <linearGradient id="lsHullD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset=".55" stop-color="#c3ccd4"/><stop offset="1" stop-color="#7d8a96"/></linearGradient>
      <linearGradient id="lsCabD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6ecf1"/><stop offset="1" stop-color="#9aa7b2"/></linearGradient></defs>`; }
  function render(v,hideName){
    const W=560,H=250, WL=204;
    const vw=hideName?'ahead':view;
    if(vw==='top') return renderTop(v,hideName);
    const sd=vw==='stbd'?1:vw==='port'?-1:0, cx=W/2, sm=LS_SMALL[v.id]?.72:1;
    let g=lsDefs()+`<rect width="${W}" height="${WL}" fill="url(#${DAY?'lsSkyD':'lsSky'})"/>`;
    if(!DAY) [[40,30],[120,70],[210,20],[330,50],[420,24],[500,64],[84,120],[470,110]].forEach(([x,y])=>g+=`<circle cx="${x}" cy="${y}" r=".8" fill="#cfe0ff" opacity=".5"/>`);
    else g+=`<path d="M0,${WL} L0,${WL-12} C90,${WL-22} 170,${WL-8} 260,${WL-14} C360,${WL-20} 460,${WL-6} ${W},${WL-12} L${W},${WL} Z" fill="#8aa6b8" opacity=".55"/>`;
    g+=seaBackground(W,H,{y:WL,night:!DAY}); // v4: zajedničko more
    const L=lightsFor(v,vw);
    // trup i nadgrađe (bok: pramac je na strani sd; pramac/krma: simetrično)
    let hull;
    const HU=DAY?'lsHullD':'lsHull', CA=DAY?'lsCabD':'lsCab';
    if(sd){ const X=x=>cx+x*sd*sm;
      hull=`<path d="M${X(-150)},186 L${X(112)},186 Q${X(152)},184 ${X(170)},172 L${X(150)},${WL+2} L${X(-138)},${WL+2} Q${X(-150)},198 ${X(-150)},186 Z" fill="url(#${HU})" stroke="#2c5474" stroke-width="1"/>
        <path d="M${X(-146)},196 L${X(158)},196" stroke="#2c5474" stroke-width="1" opacity=".6"/>
        <path d="M${X(-70)},186 L${X(-64)},128 L${X(36)},128 L${X(66)},186 Z" fill="url(#${CA})" stroke="#2c5474" stroke-width="1"/>
        <path d="M${X(-58)},138 L${X(30)},138 L${X(50)},164 L${X(-58)},164 Z" fill="#0a1522" stroke="#1d3a52" stroke-width=".8"/>`; }
    else { const X=x=>cx+x; // pramac/krma: bočna svjetla (±74) sjede na rubovima krova kormilarnice
      hull=vw==='ahead'
        ? `<path d="M${X(-120)},178 L${X(120)},178 L${X(64)},${WL+2} L${X(-64)},${WL+2} Z" fill="url(#${HU})" stroke="#2c5474"/><path d="M${cx},178 L${cx},${WL+2}" stroke="#2c5474" stroke-width="1.2"/>
           <path d="M${X(-86)},178 L${X(-80)},126 L${X(80)},126 L${X(86)},178 Z" fill="url(#${CA})" stroke="#2c5474"/><path d="M${X(-66)},136 L${X(66)},136 L${X(70)},158 L${X(-70)},158 Z" fill="#0a1522" stroke="#1d3a52" stroke-width=".8"/>`
        : `<path d="M${X(-118)},178 L${X(118)},178 L${X(108)},${WL+2} L${X(-108)},${WL+2} Z" fill="url(#${HU})" stroke="#2c5474"/>
           <path d="M${X(-84)},178 L${X(-78)},126 L${X(78)},126 L${X(84)},178 Z" fill="url(#${CA})" stroke="#2c5474"/><rect x="${X(-56)}" y="142" width="112" height="24" fill="#0a1522" stroke="#1d3a52" stroke-width=".8"/>`; }
    // jarboli: ispod svakog visokog svjetla (ne bočna, ne krmeno, ne žuto)
    const masts={}; L.forEach(p=>{ if(/bočno|krmeno|žuto/.test(p.l)) return; const x=Math.round(p.x); masts[x]=Math.min(masts[x]??999,p.y+16); });
    let mg=''; Object.keys(masts).forEach(k=>{ const x=cx+ +k; mg+=`<rect x="${x-1.6}" y="${masts[k]+6}" width="3.2" height="${Math.max(0,128-masts[k]-6)}" fill="#35607f"/>`; });
    // odsjaji u moru ispod svakog svjetla
    let rf='';
    L.forEach((p,i)=>{ const x=cx+p.x;
      rf+=`<g class="lsRef" style="animation-delay:${-i*.37}s" filter="url(#lsBlur)" opacity="${p.dim?.2:.45}"><rect x="${x-3}" y="${WL+2}" width="6" height="${H-WL}" fill="${p.c}" opacity=".5"/>
        <path d="M${x-9},${WL+9} h18 M${x-7},${WL+19} h14 M${x-10},${WL+30} h20 M${x-6},${WL+40} h12" stroke="${p.c}" stroke-width="2"/></g>`; });
    if(DAY){ g+=`<g>${mg.replace(/#35607f/g,'#5d6b77')}${hull}</g>`;
      // ugašene svjetiljke: tamna leća, bez sjaja
      L.forEach(p=>{ const x=cx+p.x, y=p.y+16; g+=`<circle cx="${x}" cy="${y}" r="5.5" fill="#3a4550" stroke="#9aa7b2" stroke-width="1.2"/><circle cx="${x-1.4}" cy="${y-1.4}" r="1.5" fill="#cfd8df" opacity=".6"/>`; });
      if(v.day){ // dnevni znak: kugla usidrenog na pramcu, ostali na jarbolu (najvidljivije mjesto)
        const bow=v.day==='ball', mx=bow?(sd?cx+sd*112*sm:cx):cx+(L.filter(p=>!/bočno|krmeno|žuto/.test(p.l)).map(p=>p.x)[0]||0), top=bow?84:18;
        g+=`<line x1="${mx}" y1="${top}" x2="${mx}" y2="${bow?180:128}" stroke="#5d6b77" stroke-width="2"/><g transform="translate(${mx},${top+48}) scale(.78)">${dayShape(v.day).replace(/stroke="#5b8bab"/g,'stroke="#11161c"')}</g>`; }
      else g+=`<text x="${W/2}" y="40" text-anchor="middle" font-size="13" fill="#0b2a44" font-weight="600">Danju ovaj brod ne nosi dnevni znak</text>`;
      if(!hideName) g+=`<text x="${W/2}" y="242" text-anchor="middle" font-size="14" fill="#fff" font-weight="600" paint-order="stroke" stroke="#0b2a44" stroke-width="3">${v.n}</text>`;
      stage.innerHTML=SVG(W,H,g);
      return v.day?[{c:'#11161c',l:'dnevni znak (crn)'}]:[]; }
    g+=rf+`<g opacity=".92">${mg}${hull}</g>`;
    L.forEach((p,i)=>{
      const x=cx+p.x, y=p.y+16;
      g+=`<g class="lin" style="animation-delay:${i*40}ms"><circle cx="${x}" cy="${y}" r="26" fill="url(#lsGlow)" opacity="${p.dim?.3:.8}"/><circle cx="${x}" cy="${y}" r="13" fill="${p.c}" opacity=".22"/>`;
      g+=`<circle cx="${x}" cy="${y}" r="6.5" fill="${p.c}" opacity="${p.dim?.55:1}"/><circle cx="${x-1.6}" cy="${y-1.6}" r="2.2" fill="#fff" opacity=".85"/></g>`;
    });
    if(!L.length) g+=`<text x="${W/2}" y="110" text-anchor="middle" font-size="13" fill="${C.txt2}">S ovog kuta ne vidiš nijedno svjetlo</text>`;
    if(!hideName) g+=`<text x="${W/2}" y="242" text-anchor="middle" font-size="14" fill="${C.acc}" font-weight="600" paint-order="stroke" stroke="#02070d" stroke-width="3">${v.n}</text>`;
    stage.innerHTML=SVG(W,H,g);
    return L;
  }
  /* pogled odozgo: lukovi sektora prema COLREG pravilu 21 (jarbolno 225°, bočna 112,5°, krmeno 135°, kružno 360°);
     granice su 22,5° iza poprečnice (112,5° i 247,5° od pramca). */
  function renderTop(v){
    const W=560,H=250, cx=W/2, cy=128;
    const P=(a,r)=>[cx+Math.sin(a*Math.PI/180)*r, cy-Math.cos(a*Math.PI/180)*r];
    const arc=(a1,a2,r,col,op)=>{ const s=P(a1,r), e=P(a2,r), d=((a2-a1)%360+360)%360||360;
      if(d>=359.9) return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-opacity=".7" stroke-dasharray="4 3"/>`;
      return `<path d="M${cx},${cy} L${s[0].toFixed(1)},${s[1].toFixed(1)} A${r},${r} 0 ${d>180?1:0} 1 ${e[0].toFixed(1)},${e[1].toFixed(1)} Z" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-opacity=".75" stroke-dasharray="4 3"/>`; };
    const WH='var(--sig-white)', leg=[]; let g=lsDefs()+`<rect width="${W}" height="${H}" fill="url(#lsSea)"/>`, r=104;
    const add=(a1,a2,col,lab,op)=>{ g+=arc(a1,a2,r,col,op||.16); leg.push({c:col,l:lab}); r-=12; };
    v.L.forEach(l=>{
      if(l.t==='mast'||l.t==='mast2'||l.t==='mast2v'||l.t==='mast3') add(247.5,112.5,WH,'jarbolno: 225° po pramcu'+(l.t!=='mast'?' ('+(l.t==='mast3'?'3':'2')+' svjetla)':''));
      if(l.t==='side'){ add(0,112.5,SIG.g,'bočno desno: zeleno 112,5°',.22); r+=12; add(247.5,360,SIG.r,'bočno lijevo: crveno 112,5°',.22); }
      if(l.t==='stern') add(112.5,247.5,'#dfe8ef','krmeno: bijelo 135°');
      if(l.t==='towyellow') add(112.5,247.5,SIG.y,'žuto za tegljenje: 135° po krmi');
      if(l.t==='allround') add(0,360,WH,'bijelo kružno 360°',.08);
      if(l.t==='vert') l.c.forEach(cc=>add(0,360,cc==='r'?SIG.r:cc==='g'?SIG.g:WH,'kružno '+(cc==='r'?'crveno':cc==='g'?'zeleno':'bijelo')+' 360°',.06));
      if(l.t==='cross') add(0,360,SIG.g,'3 zelena kružna 360°',.08);
      if(l.t==='opt2'){ add(0,360,SIG.r,'opcijsko kružno crveno',.05); add(0,360,SIG.g,'opcijsko kružno zeleno',.05); }
      if(l.t==='tricolor'){ add(0,112.5,SIG.g,'trobojna: zeleno 112,5°',.22); r+=12; add(247.5,360,SIG.r,'trobojna: crveno 112,5°',.22); r+=12; add(112.5,247.5,'#dfe8ef','trobojna: bijelo 135°'); }
    });
    { const has=f=>v.L.some(f), sect=has(l=>['mast','mast2','mast2v','mast3','side','stern','tricolor'].includes(l.t)), tow=has(l=>l.t==='towyellow');
      const lab=(a,rr,t,col)=>{ const p=P(a,rr); g+=`<text x="${p[0].toFixed(1)}" y="${(p[1]+4).toFixed(1)}" text-anchor="middle" font-size="11.5" font-weight="600" fill="${col}" paint-order="stroke" stroke="#02070d" stroke-width="3">${t}</text>`; };
      if(has(l=>/^mast/.test(l.t))) lab(0,86,'225°',SIG.w);
      if(has(l=>l.t==='side'||l.t==='tricolor')){ lab(60,70,'112,5°',SIG.g); lab(300,70,'112,5°',SIG.r); }
      if(has(l=>l.t==='stern'||l.t==='tricolor')) lab(180,62,tow?'2 × 135°':'135°',tow?SIG.y:'#dfe8ef');
      if(sect) [[90,112.5,1],[270,247.5,0]].forEach(([bm,a,sw])=>{ const e=P(bm,112), s1=P(bm,92), s2=P(a,92), m=P((bm+a)/2,78);
        g+=`<path d="M${cx},${cy} L${e[0].toFixed(1)},${e[1].toFixed(1)}" stroke="#ffd166" stroke-width=".9" stroke-dasharray="1.5 3" opacity=".75"/>
          <path d="M${s1[0].toFixed(1)},${s1[1].toFixed(1)} A92,92 0 0 ${sw} ${s2[0].toFixed(1)},${s2[1].toFixed(1)}" fill="none" stroke="#ffd166" stroke-width="2"/>`;
        lab((bm+a)/2,78,'22,5°','#ffd166'); });
      if(sect) g+=`<text x="${W-12}" y="${H-10}" font-size="10" fill="#ffd166" text-anchor="end">točkasto: poprečnica, granica je 22,5° iza nje</text>`; }
    [112.5,247.5].forEach(a=>{ const e=P(a,118), t=P(a,130); g+=`<path d="M${cx},${cy} L${e[0].toFixed(1)},${e[1].toFixed(1)}" stroke="#7fa8c8" stroke-width=".9" stroke-dasharray="2 3"/>
      <text x="${t[0].toFixed(1)}" y="${(t[1]+4).toFixed(1)}" font-size="10" fill="${C.txt2}" text-anchor="middle" font-family="var(--mono)">${String(a).replace('.',',')}°</text>`; });
    g+=`<path d="M${cx},${cy} L${cx},${cy-120}" stroke="#7fa8c8" stroke-width=".7" opacity=".5"/><text x="${cx}" y="${cy-122}" font-size="10" fill="${C.txt2}" text-anchor="middle">0° pramac</text>`;
    g+=`<g transform="translate(${cx},${cy})"><path d="M0,-30 C9,-18 11,0 10,24 L-10,24 C-11,0 -9,-18 0,-30 Z" fill="url(#lsCab)" stroke="#7fa8c8" stroke-width="1.2"/><rect x="-6" y="-6" width="12" height="14" rx="2" fill="#0a1522"/></g>`;
    g+=`<text x="16" y="22" font-size="12" fill="${C.acc}" font-weight="600">Pogled odozgo: sektori svjetala</text>`;
    stage.innerHTML=SVG(W,H,g);
    return leg;
  }
  
  function info(v,L){
    let h='<div class="lightlegend">';
    L.forEach(p=> h+=`<span><i class="swatch" style="background:${p.c}"></i>${p.l}</span>`);
    h+='</div>';
    h+=`<div class="note mt12"><b>${v.n}</b>${v.note}</div>`;
    if(DAY&&view!=='top') h+=`<div class="mono hint12">Dan: svjetla su ugašena. ${v.day?'Brod nosi crni dnevni znak na najvidljivijem mjestu.':'Ovaj brod danju nema dnevni znak, prepoznaješ ga po obliku.'}</div>`;
    if(view==='top') h+=`<div class="mono hint12">Pogled odozgo: lukovi pokazuju odakle se koje svjetlo vidi. Granice bočnih i krmenog svjetla su 22,5° iza poprečnice (112,5° i 247,5° od pramca).</div>`;
    else if(view!=='ahead') h+=`<div class="mono hint12">Prikaz: ${VIEWS[view].toLowerCase()}. Bočna svjetla vidiš samo sa svoje strane, jarbolno ne vidiš s krme, krmeno samo s krme.</div>`;
    el('lightInfo').innerHTML=h;
  }
  function controls(){
    let h=`<div style="margin:6px 0 10px"><div class="lbl">Odakle gledaš</div><div class="chips">`+
      Object.keys(VIEWS).map(k=>`<span class="chip vwchip${k===view?' on':''}" data-v="${k}">${VIEWS[k]}</span>`).join('')+'</div></div>';
    Object.keys(cats).forEach(k=>{
      h+=`<div style="margin:6px 0"><div class="lbl">${cats[k]}</div><div class="chips">`;
      VESSELS.filter(v=>v.cat===k).forEach(v=> h+=`<span class="chip vchip${v.id===cur.id?' on':''}" data-id="${v.id}">${v.n}</span>`);
      h+='</div></div>';
    });
    el('lightControls').innerHTML=h;
    $$('.vwchip').forEach(c=>c.addEventListener('click',()=>{ view=c.dataset.v; controls(); info(cur,render(cur)); }));
    $$('.vchip').forEach(c=>c.addEventListener('click',()=>{
      cur=VESSELS.find(v=>v.id===c.dataset.id);
      controls(); info(cur,render(cur));
    }));
  }
  function askQ(){
    const POOL=DAY?VESSELS.filter(x=>x.day):VESSELS;
    const v=rnd(POOL);
    const opts=shuffle([v].concat(shuffle(POOL.filter(x=>x.id!==v.id)).slice(0,3)));
    render(v,true);
    let h=`<p style="font-weight:600;font-size:17px;margin-top:14px">${DAY?'Danju vidiš ovaj znak. O kakvom se brodu radi?':'O kakvom se brodu radi?'}</p>`;
    opts.forEach(o=> h+=`<button class="opt vopt" data-id="${o.id}">${o.n}</button>`);
    el('lightInfo').innerHTML=h;
    el('lightControls').innerHTML='';
    $$('.vopt').forEach(b=>b.addEventListener('click',()=>{
      score.t++; const ok=b.dataset.id===v.id; if(ok)score.c++;
      if(ok && window.VB) VB.widgetOk('lights');
      $$('.vopt').forEach(x=>{x.disabled=true; if(x.dataset.id===v.id)x.classList.add('correct'); else if(x===b)x.classList.add('wrong');});
      el('lightScore').textContent=`Rezultat: ${score.c}/${score.t}`;
      const L=render(v);
      el('lightInfo').insertAdjacentHTML('beforeend',`<div class="expl"><b>${v.n}</b><br>${v.note}</div><div class="btnrow"><button class="btn p" id="lqNext">Sljedeće</button></div>`);
      el('lqNext').addEventListener('click',askQ);
    }));
  }
  (function(){ const box=stage.closest('.svgbox'); if(!box) return; box.classList.add('dnBox');
    box.insertAdjacentHTML('afterbegin','<div class="dnToggle" role="group" aria-label="Doba dana"><button type="button" data-dn="n" class="on" aria-pressed="true">Noć</button><button type="button" data-dn="d" aria-pressed="false">Dan</button></div>');
    $$('.dnToggle button',box).forEach(bt=>bt.addEventListener('click',()=>{ DAY=bt.dataset.dn==='d'; box.classList.toggle('night',!DAY); box.classList.toggle('isDay',DAY);
      $$('.dnToggle button',box).forEach(x=>{ x.classList.toggle('on',x===bt); x.setAttribute('aria-pressed',x===bt); });
      if(quiz) askQ(); else info(cur,render(cur)); })); })();
  controls(); info(cur,render(cur));
  el('lightQuizBtn').addEventListener('click',function(){
    quiz=!quiz;
    this.textContent=quiz?'Natrag na simulator':'Kviz svjetala';
    this.classList.toggle('p',!quiz);
    if(quiz){score={c:0,t:0};el('lightScore').textContent='';askQ();}
    else {el('lightScore').textContent='';controls();info(cur,render(cur));}
  });
})();

/* ═══════════════ DAY SHAPES ═══════════════ */
(function(){
  const b=el('dayShapesWidget'); if(!b) return;
  const items=[
    ['KUGLA','<circle r="20" fill="#11161c" stroke="#5b8bab" stroke-width="1.5"/>','Usidreni brod'],
    ['ČUNJ ▲ gore','<polygon points="0,-22 -20,18 20,18" fill="#11161c" stroke="#5b8bab" stroke-width="1.5"/>','Ribolovni alat > 150 m'],
    ['ČUNJ ▼ dolje','<polygon points="0,22 -20,-18 20,-18" fill="#11161c" stroke="#5b8bab" stroke-width="1.5"/>','MOTORNI JEDRENJAK'],
    ['DVOČUNJ: baze','<polygon points="0,-32 -18,0 18,0" fill="#11161c" stroke="#5b8bab" stroke-width="1.5"/><polygon points="0,32 -18,0 18,0" fill="#11161c" stroke="#5b8bab" stroke-width="1.5"/>','Tegalj > 200 m'],
    ['DVOČUNJ: vrhovi','<polygon points="0,0 -18,-32 18,-32" fill="#11161c" stroke="#5b8bab" stroke-width="1.5"/><polygon points="0,0 -18,32 18,32" fill="#11161c" stroke="#5b8bab" stroke-width="1.5"/>','RIBOLOV'],
    ['VALJAK','<rect x="-15" y="-24" width="30" height="48" fill="#11161c" stroke="#5b8bab" stroke-width="1.5"/>','Ograničen gazom'],
    ['KOŠARA','<path d="M-16,-16 L16,-16 L11,18 L-11,18 Z" fill="none" stroke="#11161c" stroke-width="3"/><path d="M-14,-6 h28 M-12,4 h24" stroke="#11161c" stroke-width="2.5"/><path d="M-16,-16 h32" stroke="#11161c" stroke-width="4"/>','Ribar < 20 m']
  ];
  // dnevni znakovi su crni i vide se danju: svaki stoji na svijetlom komadu neba, kao što ga vidiš s mora
  let g='<defs><linearGradient id="dsSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd9ee"/><stop offset="1" stop-color="#e3eff7"/></linearGradient></defs>';
  items.forEach((it,i)=>{
    const x=70+(i%4)*168, y=56+Math.floor(i/4)*142;
    g+=`<rect x="${x-46}" y="${y-42}" width="92" height="84" fill="url(#dsSky)" stroke="#2d5578"/>`;
    g+=`<g transform="translate(${x},${y})">${it[1].replace(/stroke="#5b8bab"/g,'stroke="#11161c"')}</g>`;
    g+=`<text x="${x}" y="${y+60}" text-anchor="middle" font-size="12.5" font-weight="600" fill="${C.txt}">${it[0]}</text>`;
    g+=`<text x="${x}" y="${y+78}" text-anchor="middle" font-size="11" fill="${C.acc}">${it[2]}</text>`;
  });
  b.innerHTML=SVG(700,296,g);
})();
