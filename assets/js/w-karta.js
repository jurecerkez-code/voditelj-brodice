"use strict";
/* Karta i navigacija: vježba koordinata, legenda karte, karakteristika svjetla, kompas. */
/* ═══════════════ 1. CHART WIDGET ═══════════════ */
(function(){
  const box=el('chartWidget'); if(!box) return;
  const W=640,H=420,M=44,PADL=64; // PADL: dodatni prostor lijevo za oznake širine
  // geographic frame
  const lat0=43.30, lat1=43.60, lon0=16.20, lon1=16.70; // S->N bottom->top
  function draw(marker,showLbl){
    let g='';
    
    // v3 · karta u kartografskim bojama (kopno žuto, < 10 m plavo, dublje bijelo), mreža s oznakama,
    // dubine i izobate, rubne skale po minutama (crno/bijelo) i mjerilo. Mjerila i koordinate nepromijenjeni.
    const IW=W-2*M, IH=H-2*M, pxM=IH/((lat1-lat0)*60); // px po minuti širine = 1 M
    g+=`<defs><clipPath id="chClip"><rect x="${M}" y="${M}" width="${IW}" height="${IH}"/></clipPath>
      <linearGradient id="chLand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e39c"/><stop offset="1" stop-color="#ead08a"/></linearGradient>
      <filter id="chSh" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".45"/></filter></defs>`;
    g+=`<rect x="${M}" y="${M}" width="${IW}" height="${IH}" fill="#f7f8f4" filter="url(#chSh)"/><g clip-path="url(#chClip)">`;
    const landN=`M${M},${M} L${M},${M+70} Q140,${M+30} 230,${M+62} T${W-M},${M+40} L${W-M},${M} Z`;
    const landSE=`M${W-M-120},${H-M} L${W-M-120},${H-M-60} Q${W-M-60},${H-M-95} ${W-M},${H-M-70} L${W-M},${H-M} Z`;
    const shoal=`M${M},${H-M} L${M},${H-M-90} Q160,${H-M-140} 250,${H-M-80} T${W-M-140},${H-M-50} L${W-M-140},${H-M} Z`;
    // plićine < 10 m (plavo) uz kopno i na jugu; izobata 10 m je rub plavog, 20 m točkasta
    [landN,landSE].forEach(d=>g+=`<path d="${d}" fill="#bfe0f2" stroke="#bfe0f2" stroke-width="34" stroke-linejoin="round"/>`);
    g+=`<path d="${shoal}" fill="#bfe0f2"/><path d="${shoal}" fill="none" stroke="#6fa6c8" stroke-width=".8"/>`;
    g+=`<path d="M${M},${M+118} Q150,${M+76} 240,${M+104} T${W-M},${M+84}" fill="none" stroke="#5a8fb3" stroke-width=".8" stroke-dasharray="1.5 3"/>`;
    g+=`<path d="M${M},${H-M-122} Q160,${H-M-176} 262,${H-M-112} T${W-M-160},${H-M-82}" fill="none" stroke="#5a8fb3" stroke-width=".8" stroke-dasharray="1.5 3"/>`;
    g+=`<text x="${M+64}" y="${H-M-146}" font-size="8" fill="#3d6f93" font-style="italic">20</text><text x="${M+70}" y="${H-M-102}" font-size="8" fill="#3d6f93" font-style="italic">10</text>`;
    // kopno
    [landN,landSE].forEach(d=>g+=`<path d="${d}" fill="url(#chLand)" stroke="#8a7432" stroke-width="1.2" stroke-linejoin="round"/>`);
    // mreža (graticule) svakih 5' s oznakama
    for(let m=0;m<=30;m+=5){ const x=M+IW*m/30; g+=`<line x1="${x}" y1="${M}" x2="${x}" y2="${H-M}" stroke="#7a8a96" stroke-width="${m%10?'.4':'.7'}" ${m%10?'stroke-dasharray="4 4"':''}/>`; }
    for(let m=0;m<=18;m+=3){ const y=M+IH*m/18; g+=`<line x1="${M}" y1="${y}" x2="${W-M}" y2="${y}" stroke="#7a8a96" stroke-width="${m%6?'.4':'.7'}" ${m%6?'stroke-dasharray="4 4"':''}/>`; }
    // dubine (m): plitko uz obalu, dublje prema pučini
    [[74,146,'3'],[128,122,'6'],[210,126,'8'],[330,118,'14'],[470,104,'9'],[578,236,'22'],[118,214,'27'],[250,208,'38'],[420,230,'46'],[520,262,'31'],[160,322,'7'],[296,296,'9'],[455,326,'5'],[94,280,'4'],[380,160,'26']]
      .forEach(([x,y,t])=>g+=`<text x="${x}" y="${y}" font-size="9.5" fill="#46566a" text-anchor="middle" font-style="italic">${t}</text>`);
    // simboli (IHO): svjetionik (magenta bljesak), zelena lateralna, podmorski kabel (magenta), sidrište (magenta sidro)
    g+=`<g transform="translate(200,200)"><circle r="2.6" fill="#222"/><path d="M0,0 L-6,-18 A19,19 0 0 1 6,-18 Z" fill="#c2185b" opacity=".8"/><text x="9" y="-6" font-size="9" fill="#222">Bl 5s</text></g>`;
    g+=`<g transform="translate(330,255)"><path d="M0,-12 L-5,0 L5,0 Z" fill="#1a9e55" stroke="#0e5e33" stroke-width=".8"/><circle cy="3" r="1.8" fill="#222"/><path d="M4,-4 L14,-14 A7,7 0 0 1 17,-6 Z" fill="#1a9e55" opacity=".8"/></g>`;
    g+=`<path d="M100,300 q30,-16 60,0 q30,16 60,0 q30,-16 60,0" fill="none" stroke="#c2185b" stroke-width="1.5"/><text x="104" y="316" font-size="9" fill="#c2185b">podmorski kabel</text>`;
    g+=`<g transform="translate(430,180)"><path d="M0,-8 v14 M-7,2 q7,10 14,0 M-5,-8 h10" stroke="#c2185b" stroke-width="1.8" fill="none"/><text x="10" y="4" font-size="9" fill="#c2185b">sidrište</text></g>`;
    // kompasna ruža
    g+=`<g transform="translate(${W-104},${M+116})"><circle r="34" fill="none" stroke="#6d4a8a" stroke-width="1"/><circle r="26" fill="none" stroke="#6d4a8a" stroke-width=".6"/>`;
    for(let a=0;a<360;a+=10){ const q=a*Math.PI/180, r1=a%90?30:26; g+=`<line x1="${(Math.sin(q)*r1).toFixed(1)}" y1="${(-Math.cos(q)*r1).toFixed(1)}" x2="${(Math.sin(q)*34).toFixed(1)}" y2="${(-Math.cos(q)*34).toFixed(1)}" stroke="#6d4a8a" stroke-width="${a%90?.6:1}"/>`; }
    g+=`<path d="M0,-24 L4,0 L0,5 L-4,0 Z" fill="#6d4a8a"/><text y="-38" font-size="9" fill="#6d4a8a" text-anchor="middle" font-weight="600">N</text>`;
    // V4-C3: magnetska ruža unutra, zakrenuta za deklinaciju (vježbovni podatak), kao na pravoj karti
    g+=`<g transform="rotate(3)"><circle r="18" fill="none" stroke="#6d4a8a" stroke-width=".5" stroke-dasharray="1.5 1.5"/><path d="M0,-18 l-3,6 h6 Z" fill="#fff" stroke="#6d4a8a" stroke-width=".9"/><text x="8" y="-12" font-size="7.5" fill="#6d4a8a" font-weight="600">M</text></g>
      <text y="48" font-size="7.5" fill="#6d4a8a" text-anchor="middle" paint-order="stroke" stroke="#f7f8f4" stroke-width="3">N istinit, M magnetski</text><text y="57" font-size="7.5" fill="#6d4a8a" text-anchor="middle" paint-order="stroke" stroke="#f7f8f4" stroke-width="3">deklinacija 3° E (vježba)</text></g>`;
    // V4-C3: imena obale u hrvatskom stilu i upozorenje kao na pravim kartama
    g+=`<text x="${M+30}" y="${M+50}" font-size="10" fill="#6b5a22" font-style="italic" font-weight="600">rt Zub</text>
      <text x="${W-M-196}" y="${H-M-22}" font-size="9.5" fill="#2f5f86" font-style="italic">uvala Vela luka</text>
      <text x="300" y="${H-M-26}" font-size="8.6" fill="#c2185b" font-style="italic" font-weight="600">OPREZ / CAUTION</text>
      <text x="300" y="${H-M-15}" font-size="8" fill="#c2185b" font-style="italic">Uz obalu plićaci i ribarski alati.</text>`;
    // mjerilo: 1 M = 1' širine
    const sx=M+14, sy=H-M-16;
    g+=`<g><rect x="${sx-6}" y="${sy-16}" width="${3*pxM+30}" height="26" fill="#f7f8f4" opacity=".85"/>`;
    for(let i=0;i<3;i++) g+=`<rect x="${sx+i*pxM}" y="${sy-4}" width="${pxM}" height="5" fill="${i%2?'#fff':'#222'}" stroke="#222" stroke-width=".6"/>`;
    g+=`<text x="${sx}" y="${sy-7}" font-size="8" fill="#222">0</text><text x="${sx+pxM}" y="${sy-7}" font-size="8" fill="#222" text-anchor="middle">1</text><text x="${sx+2*pxM}" y="${sy-7}" font-size="8" fill="#222" text-anchor="middle">2</text><text x="${sx+3*pxM+4}" y="${sy-7}" font-size="8" fill="#222">3 M</text></g>`;
    g+=`</g>`;
    // okvir i rubne skale: minute naizmjence crno/bijelo (širina lijevo i desno, dužina gore i dolje)
    const bw=6;
    g+=`<rect x="${M}" y="${M}" width="${IW}" height="${IH}" fill="none" stroke="#222" stroke-width="1.2"/>`;
    for(let m=0;m<18;m++){ const y=M+IH*m/18, c=m%2?'#222':'#fff'; g+=`<rect x="${M-bw}" y="${y}" width="${bw}" height="${IH/18}" fill="${c}" stroke="#222" stroke-width=".5"/><rect x="${W-M}" y="${y}" width="${bw}" height="${IH/18}" fill="${c}" stroke="#222" stroke-width=".5"/>`; }
    for(let m=0;m<30;m++){ const x=M+IW*m/30, c=m%2?'#222':'#fff'; g+=`<rect x="${x}" y="${H-M}" width="${IW/30}" height="${bw}" fill="${c}" stroke="#222" stroke-width=".5"/><rect x="${x}" y="${M-bw}" width="${IW/30}" height="${bw}" fill="${c}" stroke="#222" stroke-width=".5"/>`; }
    // oznake stupnjeva i minuta
    for(let i=0;i<=6;i++){
      const y=M+IH*i/6, lat=lat1-(lat1-lat0)*i/6, d=Math.floor(lat+1e-9), m=Math.round((lat-d)*60);
      g+=`<text x="${M-bw-4}" y="${y+4}" text-anchor="end" font-size="10" fill="${C.txt2}" font-family="var(--mono)">${d}°${String(m).padStart(2,'0')}'</text>`;
      const x=M+IW*i/6, lon=lon0+(lon1-lon0)*i/6, dd=Math.floor(lon+1e-9), mm=Math.round((lon-dd)*60);
      g+=`<text x="${x}" y="${H-M+bw+13}" text-anchor="middle" font-size="10" fill="${C.txt2}" font-family="var(--mono)">${dd}°${String(mm).padStart(2,'0')}'</text>`;
    }
    g+=`<text x="${M+IW/2}" y="${M-bw-5}" text-anchor="middle" font-size="9" fill="${C.txt2}">Vježbovna karta, dubine u metrima, nije za navigaciju</text>`;
    g+=`<text x="${-PADL+14}" y="${H/2}" font-size="10" fill="${C.acc}" text-anchor="middle" transform="rotate(-90 ${-PADL+14} ${H/2})" font-weight="600">ŠIRINA (N), ovdje mjeriš milje</text>`;
    g+=`<text x="${W/2}" y="${H-8}" font-size="10" fill="${C.txt2}" text-anchor="middle" font-weight="600">DUŽINA (E)</text>`;
    
    if(marker){
      g+=`<g transform="translate(${marker.x},${marker.y})">
        <line class="rdx" x1="-${marker.x-M}" y1="0" x2="0" y2="0" stroke="${C.acc}" stroke-dasharray="4 3" stroke-width="1.4"/>
        <line class="rdy" x1="0" y1="0" x2="0" y2="${H-M-marker.y}" stroke="${C.acc}" stroke-dasharray="4 3" stroke-width="1.4"/>
        <circle class="ping" r="7" fill="none" stroke="${C.acc}" stroke-width="1.5"/>
        <circle r="7" fill="none" stroke="${C.acc}" stroke-width="2.5"/><circle r="2.5" fill="${C.acc}"/></g>`;
    }
    box.innerHTML=SVG(W,H,g,'id="chartSvg" style="cursor:crosshair"').replace(`viewBox="0 0 ${W} ${H}"`,`viewBox="${-PADL} 0 ${W+PADL} ${H}"`);
  }
  function coords(x,y){
    const lat=lat1-(lat1-lat0)*(y-M)/(H-2*M);
    const lon=lon0+(lon1-lon0)*(x-M)/(W-2*M);
    const f=v=>{const d=Math.floor(v);const m=((v-d)*60);return d+'° '+m.toFixed(1).replace('.',',')+"'";};
    return {lat:f(lat)+' N', lon:f(lon)+' E'};
  }
  let mode=0, target=null, score={c:0,t:0};
  draw(null);
  function bind(){
    const svg=el('chartSvg');
    svg.addEventListener('click',e=>{
      const r=svg.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width*(W+PADL)-PADL, y=(e.clientY-r.top)/r.height*H;
      if(x<M||x>W-M||y<M||y>H-M) return;
      const c=coords(x,y);
      if(mode===0){
        draw({x,y}); bind();
        el('chartOut').innerHTML=`<div style="color:var(--acc);font-weight:600;margin-top:8px">${c.lat}, ${c.lon}</div>
        <div style="font-size:13px;color:var(--txt2);font-family:var(--sans)">Širinu očitavaš na lijevoj/desnoj skali, dužinu na gornjoj/donjoj. Uvijek dodaj <b>N</b> i <b>E</b>.</div>`;
      } else {
        score.t++;
        const dx=Math.abs(x-target.x), dy=Math.abs(y-target.y);
        const ok = dx<18 && dy<18;
        if(ok) score.c++;
        if(ok && !target.done && window.VB) VB.widgetOk('chart');
        target.done=true;
        draw({x:target.x,y:target.y}); bind();
        el('chartOut').innerHTML=`<div style="color:${ok?'var(--green)':'var(--red)'};font-weight:600;margin-top:8px">${ok?'✓ Točno!':'✗ Promašaj'}</div>
        <div style="font-size:13px;color:var(--txt2);font-family:var(--sans)">Tražena točka je bila <b class="c-acc">${target.c.lat}, ${target.c.lon}</b></div>`;
        el('chartScore').textContent=`Rezultat: ${score.c}/${score.t}`;
      }
    });
  }
  bind();
  function newTarget(){
    const x=M+30+Math.random()*(W-2*M-60), y=M+30+Math.random()*(H-2*M-60);
    target={x,y,c:coords(x,y)};
    draw(null); bind();
    el('chartOut').innerHTML=`<div style="margin-top:8px;font-family:var(--sans)">Klikni na točku: <b class="c-acc">${target.c.lat} &nbsp; ${target.c.lon}</b></div>`;
  }
  el('chartModeBtn').addEventListener('click',function(){
    mode=mode?0:1;
    this.textContent = mode? 'Izađi iz vježbe' : 'Način vježbe';
    this.classList.toggle('p',!mode);
    el('chartNewBtn').style.display = mode?'':'none';
    if(mode) newTarget(); else { draw(null); bind(); el('chartOut').innerHTML=''; }
  });
  el('chartNewBtn').addEventListener('click',newTarget);
})();

/* ═══════════════ CHART LEGEND ═══════════════ */
(function(){
  const b=el('chartLegend'); if(!b) return;
  const items=[
    ['Kopno','<rect x="0" y="0" width="46" height="30" rx="4" fill="#f2dc8c" stroke="#8a7432"/>'],
    ['&lt; 10 m','<rect x="0" y="0" width="46" height="30" rx="4" fill="#bfe0f2"/>'],
    ['&gt; 10 m','<rect x="0" y="0" width="46" height="30" rx="4" fill="#f7f8f4"/>'],
    ['&lt; 2 m','<rect x="0" y="0" width="46" height="30" rx="4" fill="#bfe0f2"/><circle cx="23" cy="15" r="10" fill="none" stroke="#0a2438" stroke-dasharray="2 2"/><path d="M20,12 l6,6 M26,12 l-6,6" stroke="#0a2438" stroke-width="1.4"/>'],
    ['Kabel','<path d="M2,15 q9,-9 18,0 q9,9 18,0 q5,-5 8,-2" fill="none" stroke="#ef4a5a" stroke-width="2"/>'],
    ['Cjevovod','<path d="M2,15 h42" stroke="#ef4a5a" stroke-width="2" stroke-dasharray="6 4"/><path d="M2,20 h42" stroke="#11161c" stroke-width="2" stroke-dasharray="6 4"/>'],
    ['Sidrište','<g transform="translate(23,7)"><path d="M0,0 v16 M-9,10 q9,12 18,0 M-6,0 h12" stroke="#11161c" stroke-width="2" fill="none"/><circle cy="-3" r="3" fill="none" stroke="#11161c" stroke-width="2"/></g>'],
    ['Zabrana sidrenja','<g transform="translate(23,7)"><path d="M0,0 v16 M-9,10 q9,12 18,0 M-6,0 h12" stroke="#ef4a5a" stroke-width="2" fill="none"/><circle cy="-3" r="3" fill="none" stroke="#ef4a5a" stroke-width="2"/><line x1="-12" y1="20" x2="12" y2="-6" stroke="#ef4a5a" stroke-width="2.4"/></g>'],
    ['Svjetlo','<g transform="translate(23,22)"><circle r="4" fill="#ef4a5a"/><path d="M0,-4 v-14" stroke="#ef4a5a" stroke-width="2"/><path d="M-8,-18 l8,-4 8,4" fill="none" stroke="#ef4a5a" stroke-width="1.6"/></g>'],
    ['Olupina','<g transform="translate(23,15)"><path d="M-12,0 h24 M-6,-6 v12 M0,-8 v16 M6,-6 v12" stroke="#11161c" stroke-width="1.8"/></g>']
  ];
  // znakovi su crtani kao na karti (crno, magenta): svaki dobiva podlogu boje karte da se vidi na tamnoj stranici
  const paper='<rect x="0" y="0" width="46" height="30" rx="4" fill="#f7f8f4" stroke="#c9d3db"/>';
  // mreža u HTML-u: na širokom ekranu 5 u redu, na mobitelu 2, tekst uvijek čitljiv
  b.innerHTML=`<div class="lgGrid">${items.map((it,i)=>`<div class="lgIt"><svg viewBox="0 0 46 30" width="46" height="30" aria-hidden="true">${i>3?paper:''}${it[1]}</svg><span>${it[0]}</span></div>`).join('')}</div>`;
})();

/* ═══════════════ LIGHT CHARACTERISTIC ═══════════════ */
(function(){
  const b=el('lightCharWidget'); if(!b) return;
  const rows=[
    ['Bl (Fl)','Bljeskavo','svjetlo &lt; tama',[[0,.4]]],
    ['Bl(3)','Grupno bljeskavo','3 bljeska u grupi',[[0,.18],[.28,.18],[.56,.18]]],
    ['Izo','Izofazno','svjetlo = tama',[[0,2]]],
    ['Pr (Oc)','Prekidno','tama &lt; svjetlo',[[0,3.2]]],
    ['Tr (Q)','Treptavo','brzo, neprekidno',[[0,.22],[1,.22],[2,.22],[3,.22]]]
  ];
  let g='';
  const W=680, x0=150, len=470, per=4;
  rows.forEach((r,i)=>{
    const y=26+i*44;
    g+=`<text x="8" y="${y+4}" font-size="13" font-weight="600" fill="${C.acc}" font-family="var(--mono)">${r[0]}</text>`;
    g+=`<text x="8" y="${y+20}" font-size="10.5" fill="${C.txt2}">${r[1]}</text>`;
    g+=`<line x1="${x0}" y1="${y+6}" x2="${x0+len}" y2="${y+6}" stroke="${C.line}" stroke-width="12"/>`;
    r[3].forEach(seg=>{
      const sx=x0+seg[0]/per*len, w=seg[1]/per*len;
      g+=`<line x1="${sx}" y1="${y+6}" x2="${sx+w}" y2="${y+6}" stroke="${C.yellow}" stroke-width="12"/>`;
    });
    g+=`<text x="${x0+len+6}" y="${y+10}" font-size="10" fill="${C.txt2}">${r[2]}</text>`;
  });
  g+=`<line x1="${x0}" y1="248" x2="${x0+len}" y2="248" stroke="${C.txt2}" stroke-width="1"/>`;
  g+=`<text x="${x0+len/2}" y="264" font-size="11" fill="${C.txt2}" text-anchor="middle">← jedan PERIOD (npr. 4 s) →</text>`;
  b.innerHTML=SVG(820,275,g);
})();

/* ═══════════════ COMPASS ═══════════════ */
(function(){
  const b=el('compassWidget'); if(!b) return;
  const S=300,c=S/2,R=125;
  let g=`<circle cx="${c}" cy="${c}" r="${R+12}" fill="#0d2033" stroke="${C.line}"/>`;
  g+=`<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="${C.line}" stroke-width="1.5"/>`;
  for(let d=0;d<360;d+=5){
    const a=(d-90)*Math.PI/180, big=d%30===0, len=big?13:(d%10===0?8:5);
    g+=`<line x1="${c+Math.cos(a)*R}" y1="${c+Math.sin(a)*R}" x2="${c+Math.cos(a)*(R-len)}" y2="${c+Math.sin(a)*(R-len)}" stroke="${big?C.txt:C.txt2}" stroke-width="${big?1.6:.8}" opacity="${big?1:.6}"/>`;
    if(d%30===0) g+=`<text x="${c+Math.cos(a)*(R-26)}" y="${c+Math.sin(a)*(R-26)+4}" font-size="11" text-anchor="middle" fill="${C.txt2}" font-family="var(--mono)">${d}</text>`;
  }
  // quadrant shading
  const quad=[[0,90,'I','#39b8e8'],[90,180,'II','#25c26a'],[180,270,'III','#f5c542'],[270,360,'IV','#ef4a5a']];
  quad.forEach(q=>{
    const a1=(q[0]-90)*Math.PI/180,a2=(q[1]-90)*Math.PI/180;
    g+=`<path d="M${c},${c} L${c+Math.cos(a1)*(R-40)},${c+Math.sin(a1)*(R-40)} A${R-40},${R-40} 0 0 1 ${c+Math.cos(a2)*(R-40)},${c+Math.sin(a2)*(R-40)} Z" fill="${q[3]}" opacity=".1"/>`;
    const am=((q[0]+q[1])/2-90)*Math.PI/180;
    g+=`<text x="${c+Math.cos(am)*(R-62)}" y="${c+Math.sin(am)*(R-62)+5}" font-size="14" font-weight="600" text-anchor="middle" fill="${q[3]}" opacity=".8">${q[2]}</text>`;
  });
  const card=[['N',0,C.red],['E',90,C.txt],['S',180,C.txt],['W',270,C.txt]];
  card.forEach(k=>{
    const a=(k[1]-90)*Math.PI/180;
    g+=`<text x="${c+Math.cos(a)*(R-52)}" y="${c+Math.sin(a)*(R-52)+6}" font-size="18" font-weight="600" text-anchor="middle" fill="${k[2]}">${k[0]}</text>`; // dalje od brojeva: „270” i „W” se ne dodiruju
  });
  // pramčanica: nepomična oznaka na kućištu, u smjeru pramca (ovdje gore); na njoj se očitava kurs
  g+=`<line x1="${c}" y1="${c-R-12}" x2="${c}" y2="${c-R+14}" stroke="${C.acc}" stroke-width="3"/><polygon points="${c},${c-R-2} ${c-7},${c-R-13} ${c+7},${c-R-13}" fill="${C.acc}"/>`;
  g+=`<polygon points="${c},${c-72} ${c-9},${c} ${c},${c+18} ${c+9},${c}" fill="${C.red}" opacity=".9"/>`;
  g+=`<polygon points="${c},${c+72} ${c-9},${c} ${c},${c-18} ${c+9},${c}" fill="#8aa" opacity=".55"/>`;
  g+=`<circle cx="${c}" cy="${c}" r="5" fill="${C.txt}"/>`;
  g+=`<text x="${c}" y="${S-6}" font-size="11" text-anchor="middle" fill="${C.acc}" font-weight="600">Pramčanica (plava oznaka gore): ovdje očitavaš kurs</text>`;
  b.innerHTML=SVG(S,S,g);
})();
