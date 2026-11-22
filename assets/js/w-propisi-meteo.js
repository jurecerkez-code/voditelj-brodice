"use strict";
/* Propisi i meteo: područja plovidbe, tipovi brodica, ruža vjetrova. */
/* ═══════════════ AREAS ═══════════════ */
(function(){
  const b=el('areaWidget'); if(!b) return;
  const W=700,H=250;
  let g=`<rect width="${W}" height="${H}" fill="#0e3350" rx="10"/>`;
  g+=`<path d="M0,${H} L0,60 Q90,26 190,58 T400,52 T${W},70 L${W},${H} Z" fill="#0e3350"/>`;
  g+=`<path d="M0,0 L0,60 Q90,26 190,58 T400,52 T${W},70 L${W},0 Z" fill="#c9a227" opacity=".85"/>`;
  const bands=[[1,'IIIc','1 Nm','#39b8e8'],[3,'IIIb','3 Nm','#25c26a'],[6,'IIIa','6 Nm','#f5c542'],[12,'III','12 Nm','#f08a3c'],[20,'II','20 Nm','#ef4a5a']];
  const scale=7.5;
  bands.slice().reverse().forEach(bd=>{
    const off=bd[0]*scale;
    g+=`<path d="M0,${60+off} Q90,${26+off} 190,${58+off} T400,${52+off} T${W},${70+off}" fill="none" stroke="${bd[3]}" stroke-width="2" stroke-dasharray="7 5" opacity=".9"/>`;
    g+=`<text x="${W-10}" y="${66+off}" text-anchor="end" font-size="11.5" fill="${bd[3]}" font-weight="800" paint-order="stroke" stroke="#0e3350" stroke-width="4">${bd[1]}: ${bd[2]}</text>`;
  });
  // V3-AREA: mjerilo udaljenosti od obale u istom mjerilu kao pojasevi (7,5 px = 1 Nm)
  { const x=96, y0=41; // obala kod x≈96
    g+=`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0+20*scale}" stroke="#e6eef5" stroke-width="1.4" opacity=".8"/>`;
    [[0,'0'],[1,'1'],[3,'3'],[6,'6'],[12,'12'],[20,'20']].forEach(([n,t])=>{ const y=y0+n*scale, L=n===0; // 0 lijevo od crte, da se ne preklopi s 1
      g+=`<line x1="${x-5}" y1="${y}" x2="${x+5}" y2="${y}" stroke="#e6eef5" stroke-width="1.4"/><text x="${L?x-9:x+9}" y="${y+4}"${L?' text-anchor="end"':''} font-size="10" fill="#e6eef5" font-family="var(--mono)" paint-order="stroke" stroke="#0e3350" stroke-width="3">${t}</text>`; });
    g+=`<text x="${x+34}" y="${y0+20*scale+18}" font-size="10.5" fill="${C.txt2}">Nm od obale (u mjerilu)</text>`; }
  g+=`<text x="10" y="${H-12}" font-size="11.5" fill="${C.txt2}"><tspan font-weight="800" fill="${C.txt}">I</tspan> = bez ograničenja,  <tspan font-weight="800" fill="${C.txt}">IV</tspan> = luke, zaljevi, ušća rijeka</text>`;
  g+=`<text x="14" y="30" font-size="12" fill="#5a4508" font-weight="800">KOPNO / OTOK</text>`;
  b.innerHTML=SVG(W,H,g);
})();

/* ═══════════════ HULL TYPES ═══════════════ */
(function(){
  const b=el('hullWidget'); if(!b) return;
  const types=[
    ['PASARA','odsječena krma (zrcalo)','M0,0 C24,-16 56,-18 78,-14 L78,14 C56,18 24,16 0,0 Z'],
    ['GAJETA','oštar pramac i krma, široka','M0,0 C22,-20 56,-20 78,0 C56,20 22,20 0,0 Z'],
    ['GUC','kao gajeta, ali uži','M0,0 C22,-13 56,-13 78,0 C56,13 22,13 0,0 Z'],
    ['LEUT','oštri pramac i krma, škaf oba','M0,0 C20,-17 58,-17 78,0 C58,17 20,17 0,0 Z'],
    ['BATANA','ravno dno i ravna krma','M4,-13 L74,-13 L78,0 L74,13 L4,13 Z'],
    ['GLISER','široko ravno dno: klizi','M0,-4 L58,-14 L78,-6 L78,6 L58,14 L0,4 Z']
  ];
  let g='';
  types.forEach((t,i)=>{
    const x=40+(i%3)*220, y=48+Math.floor(i/3)*118;
    g+=`<g transform="translate(${x},${y})"><path d="${t[2]}" fill="#1d3a52" stroke="#5b8bab" stroke-width="2"/></g>`;
    g+=`<text x="${x+39}" y="${y+42}" text-anchor="middle" font-size="13" font-weight="800" fill="${C.txt}">${t[0]}</text>`;
    g+=`<text x="${x+39}" y="${y+58}" text-anchor="middle" font-size="10.5" fill="${C.txt2}">${t[1]}</text>`;
  });
  b.innerHTML=SVG(700,240,g);
})();

/* ═══════════════ WIND ROSE ═══════════════ */
const WINDS=[
  {n:'TRAMONTANA',d:0,dir:'N',it:'Nord',c:'#7fd8f7',t:'Hladan i suh sjeverni vjetar. Puše iz sjevera, često nakon prolaska hladne fronte. Donosi vedro ali hladno vrijeme.'},
  {n:'BURA',d:45,dir:'NE',it:'Nordist / Grego',c:'#ef4a5a',t:'<b>NAJOPASNIJI VJETAR NA JADRANU.</b> Hladan, puše <b>na refule</b> (u naglim udarima) <b>s kopna prema moru</b>. U vrlo kratkom vremenu dosiže <b>orkansku snagu</b>. Stvara morsku prašinu koja smanjuje vidljivost.<br><b>Predznaci:</b> kapa od bijelih oblaka iznad primorskih planina (kapa raste → bura jača), suhi zrak, <b>oseka</b>, <b>porast tlaka</b>.<br><b>Postupak:</b> čim uočiš znakove: odmah u najbližu uvalu ili luku.'},
  {n:'LEVANAT',d:90,dir:'E',it:'Ist / Levante',c:'#8fa6b8',t:'Istočni vjetar, ujednačen, donosi oblake i pogoršanje vremena. Često prethodi jugu.'},
  {n:'JUGO (ŠILOKO)',d:135,dir:'SE',it:'Saudist / Scirocco',c:'#f08a3c',t:'Topao i vlažan, puše <b>ujednačeno s mora prema obali</b>, donosi kišu i visoke valove. <b>Jača postupno</b>, imaš dovoljno vremena da se sigurno zakloniš.<br><b>Predznaci:</b> sumaglica na <b>jugoistočnom</b> dijelu obzora, povećana vlažnost, <b>plima</b>, <b>pad tlaka</b>, povećana oblačnost.'},
  {n:'OŠTRO',d:180,dir:'S',it:'Saud / Ostro',c:'#f5c542',t:'Južni vjetar, topao i vlažan. Rjeđi na Jadranu, obično prelazi u jugo ili lebić.'},
  {n:'LEBIĆ',d:225,dir:'SW',it:'Saudvest / Libeccio',c:'#c07ae8',t:'Jugozapadni. Jak, donosi velike valove prema obali. Obično kratkotrajan, ali može biti opasan u lukama otvorenim prema SW.'},
  {n:'PONENTE (PULENAT)',d:270,dir:'W',it:'Vest / Ponente',c:'#25c26a',t:'Zapadni vjetar. Umjeren, često popodnevni. Može donijeti nagle promjene vremena.'},
  {n:'MAESTRAL',d:315,dir:'NW',it:'Nordvest / Maestrale',c:'#39b8e8',t:'Ugodan ljetni vjetar. <b>Puše isključivo danju</b>: jača oko podneva, slabi predvečer. Osvježava. U uskim kanalima (Hvarski, Pelješki) zna biti dosta jak: omiljen kod jedriličara i jedrenja na dasci.'}
];

(function(){
  /* v3 · ruža vjetrova: strelica pokazuje KAMO zrak ide (prema središtu), PERNATICA je na strani ODAKLE vjetar puše
     (meteorološka konvencija). Ispod: kartice jadranskih vjetrova (tekst iz poglavlja) i Beaufortova ljestvica
     koja mijenja valove u pozadini. */
  const b=el('windWidget'); if(!b) return;
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S=380,c=S/2,R=140;
  let cur=45, bf=4;
  b.innerHTML=`<div class="wRose"></div>
    <div class="wAdr"><div class="wLbl">Jadranski vjetrovi: klikni karticu</div><div class="wCards"></div></div>
    <div class="wBf"><div class="wLbl">Beaufortova ljestvica (snaga vjetra), klikni stupanj</div><div class="wSea"></div><div class="wBfRow"></div><div class="wBfTxt"></div></div>`;
  const ADR=[ // opisi iz teksta poglavlja
    {d:45,t:'Najopasniji vjetar na Jadranu. Hladan, puše na refule s kopna prema moru i u vrlo kratkom vremenu dosiže orkansku snagu.'},
    {d:135,t:'Topao i vlažan, puše ujednačeno s mora prema obali, donosi kišu i visoke valove. Jača postupno, pa imaš vremena da se sigurno zakloniš.'},
    {d:315,t:'Ugodan ljetni vjetar koji puše isključivo danju: jača oko podneva, slabi predvečer. U uskim kanalima zna biti dosta jak.'},
    {d:225,t:'Jugozapadni, jak, donosi velike valove prema obali. Obično kratkotrajan, ali opasan u lukama otvorenim prema SW.'}
  ];
  // WMO Beaufortova ljestvica: [naziv, brzina u čvorovima, opis mora]
  const BF=[['tišina','< 1','more kao zrcalo'],['lahor','1–3','sitno mreškanje'],['povjetarac','4–6','mali valići, ne lome se'],['slab vjetar','7–10','valići, ponegdje bijela kapica'],
    ['umjeren vjetar','11–16','manji valovi, česte bijele kapice'],['umjereno jak','17–21','umjereni valovi, mnogo bijelih kapica'],['jak vjetar','22–27','veći valovi, pjena posvuda'],
    ['žestok vjetar','28–33','more se gomila, pjena u prugama'],['olujni vjetar','34–40','visoki valovi, pjena u gustim prugama'],['jak olujni','41–47','visoki valovi, rasprskavanje smanjuje vidljivost'],
    ['orkanski vjetar','48–55','vrlo visoki valovi, more bijelo'],['jak orkanski','56–63','iznimno visoki valovi'],['orkan','≥ 64','zrak pun pjene i rasprskavanja']];
  function draw(sel){
    let g=`<defs><radialGradient id="wBg"><stop offset="0" stop-color="#12304a"/><stop offset="1" stop-color="#0b1d2e"/></radialGradient></defs>`;
    g+=`<circle cx="${c}" cy="${c}" r="${R+18}" fill="url(#wBg)" stroke="${C.line}"/>`;
    for(let d=0;d<360;d+=10){ const a=(d-90)*Math.PI/180, r1=R+18, r2=R+(d%45===0?10:14); g+=`<line x1="${c+Math.cos(a)*r1}" y1="${c+Math.sin(a)*r1}" x2="${c+Math.cos(a)*r2}" y2="${c+Math.sin(a)*r2}" stroke="#2d5578" stroke-width="${d%45===0?1.4:.8}"/>`; }
    g+=`<circle cx="${c}" cy="${c}" r="${R-56}" fill="#0a1a2a" stroke="${C.line}"/>`;
    const ws=WINDS.find(x=>x.d===sel);
    if(ws){
      const r=R-58, gust=ws.d===45, cls=gust?'wfl gust':'wfl';
      const dur={0:3.2,45:1.6,90:3.6,135:2.6,180:3.8,225:2.8,270:3.8,315:3.0}[ws.d]||3.2;
      g+=`<defs><clipPath id="wclip"><circle cx="${c}" cy="${c}" r="${r}"/></clipPath></defs><g clip-path="url(#wclip)" opacity=".75"><g transform="rotate(${ws.d} ${c} ${c})">`;
      for(let i=-4;i<=4;i++){
        const x=c+i*17, d=(dur*(0.85+((i*37+100)%7)/20)).toFixed(2), dl=(((i*53+200)%10)/10*-dur).toFixed(2);
        g+=`<line class="${cls}" x1="${x}" y1="${c-r-10}" x2="${x}" y2="${c+r+10}" stroke="${ws.c}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="14 34" style="animation-duration:${d}s;animation-delay:${dl}s"/>`;
      }
      g+=`</g></g>`;
    }
    WINDS.forEach(w=>{
      const a=(w.d-90)*Math.PI/180, on=sel===w.d, op=on?1:.5, sw=on?6:3.5;
      const ux=Math.cos(a), uy=Math.sin(a), px=-uy, py=ux; // u: prema van (odakle puše), p: okomito
      const x1=c+ux*(R-54), y1=c+uy*(R-54), x2=c+ux*(R-19), y2=c+uy*(R-19);
      g+=`<line x1="${x1+ux*8}" y1="${y1+uy*8}" x2="${x2}" y2="${y2}" stroke="${w.c}" stroke-width="${sw}" opacity="${op}" stroke-linecap="round"/>`;
      // vrh strelice: KAMO vjetar ide (prema središtu)
      g+=`<polygon points="${x1},${y1} ${x1+ux*14+px*7},${y1+uy*14+py*7} ${x1+ux*14-px*7},${y1+uy*14-py*7}" fill="${w.c}" opacity="${op}"/>`;
      // pernatica: 3 pera na vanjskom kraju (ODAKLE puše)
      for(let k=0;k<3;k++){ const bx=x2-ux*k*7, by=y2-uy*k*7, L=on?13:10;
        g+=`<line x1="${bx}" y1="${by}" x2="${bx+px*L+ux*L*.55}" y2="${by+py*L+uy*L*.55}" stroke="${w.c}" stroke-width="${on?2.4:1.8}" opacity="${op}" stroke-linecap="round"/>`; }
      const lx=c+ux*(R+2), ly=c+uy*(R+2);
      g+=`<circle class="wdot" data-d="${w.d}" cx="${lx}" cy="${ly}" r="15" fill="${on?w.c:'#132738'}" stroke="${w.c}" stroke-width="2" style="cursor:pointer"/>`;
      g+=`<text x="${lx}" y="${ly+4}" text-anchor="middle" font-size="10.5" font-weight="800" fill="${on?'#06121c':w.c}" style="pointer-events:none">${w.dir}</text>`;
    });
    g+=`<text x="${c}" y="${c-8}" text-anchor="middle" paint-order="stroke" stroke="#0b1a28" stroke-width="4" stroke-linejoin="round" font-size="12" fill="${C.txt2}">vjetar puše</text>`;
    g+=`<text x="${c}" y="${c+8}" text-anchor="middle" paint-order="stroke" stroke="#0b1a28" stroke-width="4" stroke-linejoin="round" font-size="12" font-weight="800" fill="${C.acc}">IZ smjera pernatica</text>`;
    g+=`<text x="${c}" y="${c+24}" text-anchor="middle" paint-order="stroke" stroke="#0b1a28" stroke-width="4" stroke-linejoin="round" font-size="10" fill="${C.txt2}">strelica: kamo zrak ide</text>`;
    $('.wRose',b).innerHTML=SVG(S,S,g,'class="wSvg" role="img" aria-label="Ruža vjetrova"');
    $$('.wdot',b).forEach(d=>d.addEventListener('click',()=>pick(+d.dataset.d)));
  }
  function cards(){ $('.wCards',b).innerHTML=ADR.map(a=>{ const w=WINDS.find(x=>x.d===a.d);
      return `<button class="wCard${a.d===cur?' on':''}" data-d="${a.d}" type="button" style="--wc:${w.c}"><b>${w.n.split(' ')[0]}</b><span class="mono">${w.dir}, ${w.d}°</span><small>${a.t}</small></button>`; }).join('');
    $$('.wCard',b).forEach(x=>x.addEventListener('click',()=>pick(+x.dataset.d))); }
  function pick(d){
    cur=d; const w=WINDS.find(x=>x.d===d);
    draw(d); cards();
    el('windInfo').innerHTML=`<div class="card" style="border-color:${w.c}">
      <h4 style="margin-top:0">${w.n} <span style="font-weight:400;color:var(--txt2);font-size:14px">${w.dir}, ${w.d}°, ${w.it}</span></h4>
      <p style="margin:0;font-size:14.5px">${w.t}</p></div>`;
  }
  // more: amplituda, valna duljina, bijele kapice i brzina ovise o stupnju
  function sea(){
    const W=640,H=96, A=bf===0?0:1.2+bf*1.9, Lw=60+bf*9, caps=bf>=3?Math.min(1,(bf-2)/6):0, sp=Math.max(2.2,12-bf*.8);
    let g=`<defs><linearGradient id="wSeaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bf>=8?'#2a4458':'#2f6f98'}"/><stop offset="1" stop-color="#0b2a44"/></linearGradient>
      <linearGradient id="wSkyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bf>=8?'#3a4652':'#6f9fc4'}"/><stop offset="1" stop-color="${bf>=8?'#5a6670':'#c9dcea'}"/></linearGradient></defs>`;
    g+=`<rect width="${W}" height="${H}" fill="url(#wSkyG)"/>`;
    const row=(y,amp,len,op,cls,dl)=>{ let d=`M${-2*len},${H}L${-2*len},${y}`; for(let x=-2*len;x<W+2*len;x+=len) d+=` q${len/4},${-amp} ${len/2},0 t${len/2},0`; d+=` L${W+2*len},${H}Z`;
      return `<path class="${cls}" style="animation-duration:${sp}s;animation-delay:${dl}s;--wl:${len}px" d="${d}" fill="url(#wSeaG)" opacity="${op}"/>`; };
    g+=row(40,A*.6,Lw*.8,.55,'wRow',-.7)+row(52,A*.8,Lw,.8,'wRow',-1.3)+row(64,A,Lw*1.15,1,'wRow',0);
    if(caps>0){ for(let i=0;i<Math.round(6+caps*18);i++){ const x=(i*97)%W, y=48+((i*37)%40); g+=`<ellipse class="wCap" style="animation-delay:${-(i%7)*.4}s" cx="${x}" cy="${y}" rx="${4+caps*8}" ry="1.6" fill="#fff" opacity="${.35+caps*.5}"/>`; } }
    if(bf>=9) g+=`<rect width="${W}" height="${H}" fill="#e8eef3" opacity="${(bf-8)*.08}"/>`;
    $('.wSea',b).innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" class="wSeaSvg" role="img" aria-label="Stanje mora za Beaufort ${bf}">${g}</svg>`;
    $('.wBfTxt',b).innerHTML=`<b>${bf} Bf, ${BF[bf][0]}</b>, ${BF[bf][1]} čv, ${BF[bf][2]}`;
    $$('.wBfB',b).forEach(x=>x.classList.toggle('on',+x.dataset.bf===bf));
  }
  $('.wBfRow',b).innerHTML=BF.map((x,i)=>`<button class="wBfB" data-bf="${i}" type="button" title="${x[0]}" style="--h:${10+i*3}px">${i}</button>`).join('');
  $$('.wBfB',b).forEach(x=>x.addEventListener('click',()=>{ bf=+x.dataset.bf; sea(); }));
  pick(45); sea();
})();
