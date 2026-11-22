"use strict";
/* Izbjegavanje sudara: situacije, rizik sudara, jedrilice, zvučni signali. */
/* ═══════════════ COLREG SCENARIOS ═══════════════ */
const COLREG=[
 {id:'head',t:'Nasuprotni kursovi: pramcem u pramac',a:{x:200,y:300,h:0,type:'motor'},bo:{x:200,y:100,h:180,type:'motor'},
  r:'Nijedan nema prednost. <b>Oba mijenjaju kurs udesno</b> i prolaze lijevi bok uz lijevi bok. Radnja mora biti pravodobna i odlučna.',
  path:'both_right', signal:'· (jedan kratki), mijenjam kurs udesno'},
 {id:'cross_r',t:'Kursovi se sijeku: drugi mi dolazi zdesna',a:{x:120,y:280,h:45,type:'motor'},bo:{x:340,y:150,h:225,type:'motor'},
  r:'Vidim ga preko <b>svoje desne strane</b>, pa <b>ja izbjegavam</b>. Mijenjam kurs udesno i prolazim <b>iza njegove krme</b>. On zadržava kurs i brzinu.',
  path:'a_right', signal:'· (jedan kratki)'},
 {id:'cross_l',t:'Kursovi se sijeku: drugi mi dolazi slijeva',a:{x:340,y:280,h:315,type:'motor'},bo:{x:120,y:150,h:135,type:'motor'},
  r:'Vidim ga preko svoje <b>lijeve</b> strane, pa <b>ja imam prednost</b>. Zadržavam kurs i brzinu i stalno ga pratim. On mora izbjeći.',
  path:'b_right', signal:'nije potreban'},
 {id:'noreact',t:'Imam prednost, ali on ne reagira',a:{x:340,y:280,h:315,type:'motor'},bo:{x:120,y:150,h:135,type:'motor'},
  r:'1) <b>Najmanje 5 kratkih zvučnih signala</b>: upozorenje.<br>2) Ako i dalje ništa: <b>izbjegavam iako imam prednost</b>.<br>3) <b>Puni okret udesno</b> pa zaobilazak. <span class="c-red"><b>Nikad ulijevo.</b></span> Razlog: ako se on „probudi“ i krene udesno, sudarit ćete se.',
  path:'a_circle', signal:'<span class="sg" role="img" aria-label="kratki, kratki, kratki, kratki, kratki"><i></i><i></i><i></i><i></i><i></i></span> (pet ili više kratkih)'},
 {id:'overtake',t:'Pretjecanje',a:{x:200,y:330,h:0,type:'motor'},bo:{x:200,y:170,h:0,type:'motor'},
  r:'<b>Brod koji pretječe uvijek se uklanja</b>: bilo da je motorni, jedrilica ili motorni jedrenjak. Može lijevo ili desno, ali <b>nikad ne smije presjeći kurs</b> brodu kojeg pretječe (ne prolazi mu po pramcu). Pretjecani zadržava kurs i brzinu.',
  path:'a_pass', signal:'<span class="sg" role="img" aria-label="dugi, dugi, kratki"><i class="l"></i><i class="l"></i><i></i></span> s njegove desne, <span class="sg" role="img" aria-label="dugi, dugi, kratki, kratki"><i class="l"></i><i class="l"></i><i></i><i></i></span> s njegove lijeve; pristanak: <span class="sg" role="img" aria-label="dugi, kratki, dugi, kratki"><i class="l"></i><i></i><i class="l"></i><i></i></span>'},
 {id:'sail_motor',t:'Jedrilica × motorni brod',a:{x:130,y:280,h:40,type:'motor'},bo:{x:330,y:160,h:220,type:'sail'},
  r:'<b>Jedrilica ima prednost.</b> Motorni brod mijenja kurs udesno i zaobilazi <b>po krmi</b> jedrilice. Jedrilica zadržava kurs i brzinu.<br><span style="color:var(--yellow)">Iznimke: ako jedrilica pretječe, ako je motorni jedrenjak, ili ako je motorni brod u kategoriji iznad nje.</span>',
  path:'a_right', signal:'· (jedan kratki)'},
 {id:'motsail',t:'Zamka: „jedrilica“ s crnim čunjem vrhom dolje',a:{x:130,y:280,h:40,type:'motor'},bo:{x:330,y:160,h:220,type:'motorsail'},
  r:'Čunj vrhom dolje znači <b>motorni jedrenjak</b>, dakle brod na mehanički pogon. Nema prednost jedrilice.<br>Kad se sijeku kursovi dvaju motornih brodova, vrijedi <b>pravilo desne strane</b>. Ako mi dolazi <b>zdesna</b>: ja izbjegavam. Ako <b>slijeva</b>: ja imam prednost.',
  path:'a_right', signal:'· (jedan kratki)'},
 {id:'anchored',t:'Zamka: jedrilica s crnom kuglom',a:{x:150,y:290,h:20,type:'motor'},bo:{x:310,y:160,h:200,type:'anchored'},
  r:'Crna kugla znači <b>usidreni brod</b>. Uopće nije u plovidbi, pa se pitanje prednosti ne postavlja. <b>Moram ga zaobići.</b><br>Smjer njegova pramca nije bitan: usidreni brod okreće se oko sidra.',
  path:'a_avoid', signal:'nije potreban'},
 {id:'sail_diff',t:'Dvije jedrilice: vjetar u različite bokove',a:{x:140,y:270,h:35,type:'sail',tack:'port'},bo:{x:330,y:170,h:215,type:'sail',tack:'stbd'},
  r:'<b>Izbjegava ona koja prima vjetar u lijevi bok</b> (port tack). Ona s vjetrom u desni bok (starboard tack) ima prednost i zadržava kurs.',
  path:'a_right', signal:'nije potreban', wind:true},
 {id:'sail_same',t:'Dvije jedrilice: vjetar u isti bok',a:{x:150,y:150,h:150,type:'sail'},bo:{x:290,y:270,h:150,type:'sail'},
  r:'<b>Izbjegava ona koja je U privjetrini</b> (bliže vjetru, ima jači vjetar). Ona u <b>zavjetrini</b> ima prednost. Privjetrinska skreće niz vjetar ili prolazi po krmi druge.',
  path:'a_right', signal:'nije potreban', wind:true},
 {id:'harbour',t:'Ulaz i izlaz iz luke',a:{x:200,y:320,h:0,type:'motor'},bo:{x:200,y:150,h:180,type:'motor'},
  r:'<b>Brod koji izlazi iz luke ima prednost</b> pred brodom koji ulazi. Onaj koji ulazi čeka.',
  path:'none', signal:'nije potreban', harbour:true},
 {id:'narrow',t:'Uski kanal: mali i veliki brod',a:{x:150,y:290,h:0,type:'motor'},bo:{x:250,y:150,h:180,type:'big'},
  r:'Plovni objekti <b>duljine do 20 m</b> dužni su <b>sklanjati se s puta većim plovnim objektima</b> u uskim kanalima, pri uplovljenju i isplovljenju te u <b>polukrugu od 1 Nm</b> od ulaza u luku. Ako želiš prijeći kanal: <b>okomito, najkraćim putem</b>. Pretjecanje u pravilu nije dopušteno.',
  path:'a_right', signal:'nije potreban', narrow:true}
];

(function(){
  const stage=el('colregStage'); if(!stage) return;
  let idx=0, solved=false, myView=false, ROT=0; // V3-COLREG
  // silueta odozgo: trup s pramcem, palubna linija, kabina; jedrilica ima jarbol i jedro; trag iza krme
  function boat(x,y,h,type,label,col){
    const c = col || (type==='sail'||type==='motorsail'?'#7fd8f7':type==='big'?'#f5c542':'#e6eef5');
    const sc = type==='big'?1.7:1, sail=type==='sail'||type==='motorsail';
    let extra='';
    if(sail) extra=`<circle cy="-6" r="1.8" fill="#0a1420"/><path d="M0,-6 C9,0 12,10 10,22" fill="none" stroke="#0a1420" stroke-width="1.4"/><path d="M0,-6 C10,-1 15,9 12,21 L0,-6 Z" fill="#f4f7fa" opacity=".85"/>`;
    else extra=`<rect x="-6" y="-6" width="12" height="13" rx="2.5" fill="#0f2233" opacity=".85"/><rect x="-4.5" y="-5" width="9" height="4" rx="1" fill="#6fb6e0" opacity=".7"/>`;
    if(type==='motorsail') extra+=`<polygon points="0,-38 -8,-26 8,-26" fill="#11161c" stroke="#7fd8f7" stroke-width="1.2"/>`;
    if(type==='anchored') extra+=`<circle cy="-34" r="8" fill="#11161c" stroke="#7fd8f7" stroke-width="1.5"/>`;
    const wake = type==='anchored' ? `<path d="M0,-22 l0,-6" stroke="#9fb6c9" stroke-width="1" stroke-dasharray="2 2"/>`
      : `<g class="crWake" filter="url(#crBlur)"><path d="M-9,14 Q-18,44 -30,${type==='big'?96:74}" stroke="#e8f6ff" stroke-width="4" fill="none" opacity=".5"/><path d="M9,14 Q18,44 30,${type==='big'?96:74}" stroke="#e8f6ff" stroke-width="4" fill="none" opacity=".5"/>
          <path d="M0,16 L0,${type==='big'?84:62}" stroke="#e8f6ff" stroke-width="9" opacity=".22"/></g>`;
    const lab=ROT?` transform="rotate(${-ROT} ${x} ${y+(type==='big'?42:34)})"`:'';
    return `<g transform="translate(${x},${y}) rotate(${h})">
      <g transform="scale(${sc})">${wake}
      <path d="M0,-24 C8,-15 11,-3 10.5,16 L-10.5,16 C-11,-3 -8,-15 0,-24 Z" fill="url(#crHull)" stroke="#0a1420" stroke-width="1.2"/>
      <path d="M0,-20 C6,-12 8,-2 7.6,13 L-7.6,13 C-8,-2 -6,-12 0,-20 Z" fill="none" stroke="${c}" stroke-width="1.2" opacity=".9"/>
      ${extra}
      <circle cx="-10.5" cy="-4" r="5" fill="url(#crGR)"/><circle cx="-10.5" cy="-4" r="1.8" fill="var(--sig-red)"/>
      <circle cx="10.5" cy="-4" r="5" fill="url(#crGG)"/><circle cx="10.5" cy="-4" r="1.8" fill="var(--sig-green)"/></g></g>
      <text x="${x}" y="${y+(type==='big'?42:34)}" text-anchor="middle" font-size="12" font-weight="600" fill="${c}" paint-order="stroke" stroke="#0b2135" stroke-width="3"${lab}>${label}</text>`;
  }
  function arrow(x1,y1,x2,y2,col,dash){
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="2" stroke-dasharray="${dash||'0'}" marker-end="url(#ah)"/>`;
  }
  function draw(sc,show){
    const W=470,H=400;
    let g=`<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><polygon points="0,0 9,4.5 0,9" fill="${C.acc}"/></marker>
      <marker id="ahg" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><polygon points="0,0 9,4.5 0,9" fill="${C.green}"/></marker></defs>`;
    ROT=myView?-sc.a.h:0;
    g+=`<defs><linearGradient id="crHull" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fa"/><stop offset="1" stop-color="#8d9aa6"/></linearGradient>
      <radialGradient id="crGR"><stop offset="0" stop-color="var(--sig-red)" stop-opacity=".8"/><stop offset="1" stop-color="var(--sig-red)" stop-opacity="0"/></radialGradient>
      <radialGradient id="crGG"><stop offset="0" stop-color="var(--sig-green)" stop-opacity=".8"/><stop offset="1" stop-color="var(--sig-green)" stop-opacity="0"/></radialGradient>
      <radialGradient id="crSea" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#11324d"/><stop offset="1" stop-color="#081a2a"/></radialGradient>
      <filter id="crBlur" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>`;
    g+=`<g><clipPath id="crClipSea"><rect width="${W}" height="${H}" rx="10"/></clipPath><g clip-path="url(#crClipSea)">${seaBackground(W,H,{view:'top'})}</g></g>`; // v4: zajedničko more
    // scena (po potrebi zakrenuta tako da TI gleda gore); tekstovi se vraćaju u vodoravni položaj
    g+=`<g transform="rotate(${ROT} ${W/2} ${H/2})">`;
    for(let i=-3;i<11;i++) g+=`<path class="crWave" d="M-200,${40+i*56} q60,-9 120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0" fill="none" stroke="#14405f" stroke-width="1"/>`;
    // kompasni obruč s oznakama 0/90/180/270 (N/E/S/W)
    { const rr=Math.min(W,H)/2-8, cx=W/2, cy=H/2; g+=`<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="#2d5578" stroke-width="1" opacity=".8"/>`;
      for(let d=0;d<360;d+=10){ const q=d*Math.PI/180, r1=rr-(d%90?5:11); g+=`<line x1="${(cx+Math.sin(q)*r1).toFixed(1)}" y1="${(cy-Math.cos(q)*r1).toFixed(1)}" x2="${(cx+Math.sin(q)*rr).toFixed(1)}" y2="${(cy-Math.cos(q)*rr).toFixed(1)}" stroke="#4d7a9c" stroke-width="${d%90?.7:1.6}"/>`; }
      [['N',0],['E',90],['S',180],['W',270]].forEach(([t,d])=>{ const q=d*Math.PI/180, x=cx+Math.sin(q)*(rr-20), y=cy-Math.cos(q)*(rr-20)+4;
        g+=`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="${t==='N'?C.red:'#7fa8c8'}" transform="rotate(${-ROT} ${x.toFixed(1)} ${(y-4).toFixed(1)})">${t}</text>`; }); }
    if(sc.harbour){ g+=`<rect x="120" y="0" width="230" height="70" fill="#2a3d4d"/><text x="235" y="42" text-anchor="middle" font-size="13" fill="${C.txt2}" font-weight="600" transform="rotate(${-ROT} 235 38)">Luka</text>`; }
    if(sc.narrow){ g+=`<rect x="0" y="0" width="90" height="${H}" fill="#2a3d4d"/><rect x="${W-90}" y="0" width="90" height="${H}" fill="#2a3d4d"/><text x="45" y="200" text-anchor="middle" font-size="12" fill="${C.txt2}" transform="rotate(-90 45 200)">Uski kanal</text>`; }
    if(sc.wind){ g+=`<g opacity=".8">${arrow(40,40,40,110,C.yellow)}<text x="52" y="80" font-size="12" fill="${C.yellow}" font-weight="600">Vjetar</text></g>`; }
    // putanje se računaju iz stvarnog kursa: "udesno" = kurs + 40°
    const V=(h,len)=>[Math.sin(h*Math.PI/180)*len,-Math.cos(h*Math.PI/180)*len];
    const TURN={both_right:40,a_right:40,a_pass:20,a_avoid:50};
    const p=sc.path, A=sc.a, B=sc.bo;
    const tiV = TURN[p]!=null ? V(A.h+TURN[p], p==='a_pass'?120:95) : p==='b_right' ? V(A.h,70) : null;
    const onV = p==='both_right'||p==='b_right' ? V(B.h+40,95) : null;
    const gl=(v,html)=> show&&v ? `<g class="glide" style="--gx:${(v[0]*.55).toFixed(1)}px;--gy:${(v[1]*.55).toFixed(1)}px">${html}</g>` : html;
    g+=gl(tiV,boat(A.x,A.y,A.h,A.type,'TI',C.acc));
    g+=gl(onV,boat(B.x,B.y,B.h,B.type,'ON'));
    if(show){
      const bow=(o)=>{ const v=V(o.h,24); return [o.x+v[0],o.y+v[1]]; };
      const lab=(x,y,t,col)=>{ const X=Math.max(60,Math.min(W-60,x)), Y=Math.max(14,Math.min(H-8,y)); return `<text x="${X}" y="${Y}" text-anchor="middle" font-size="11" fill="${col}" font-weight="600" paint-order="stroke" stroke="#0b2135" stroke-width="3" transform="rotate(${-ROT} ${X} ${Y})">${t}</text>`; };
      const [ax,ay]=bow(A), [bx,by]=bow(B);
      if(p==='both_right'){ g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.green); g+=arrow(bx,by,bx+onV[0],by+onV[1],C.green); }
      if(p==='a_right'){ g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.green); g+=lab(ax+tiV[0]*1.15,ay+tiV[1]*1.15-6,sc.wind?'udesno, niz vjetar':sc.narrow?'udesno, prema rubu kanala':'udesno, iza krme',C.green); }
      if(p==='b_right'){ g+=arrow(bx,by,bx+onV[0],by+onV[1],C.green); g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.acc,'5 4'); g+=lab(ax+tiV[0]*1.2,ay+tiV[1]*1.2-6,'zadržavam kurs i brzinu',C.acc); }
      if(p==='a_circle'){
        // puni okret udesno: krug sa središtem desno od pramca
        const r=46, cxy=V(A.h+90,r), cx=A.x+cxy[0], cy=A.y+cxy[1];
        const st=[A.x,A.y], en=V(A.h+90-8,1);
        g+=`<path d="M${st[0]},${st[1]} A${r},${r} 0 1 1 ${(cx-Math.sin((A.h+90-12)*Math.PI/180)*r).toFixed(1)},${(cy+Math.cos((A.h+90-12)*Math.PI/180)*r).toFixed(1)}" fill="none" stroke="${C.green}" stroke-width="2.4" marker-end="url(#ahg)"/>`;
        g+=lab(cx,cy-r-10,'puni okret udesno',C.green);
      }
      if(p==='a_pass'){ g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.green); g+=lab(ax+tiV[0],ay+tiV[1]-10,'obilazim, ne presijecam',C.green); }
      if(p==='a_avoid'){ g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.green); g+=lab(ax+tiV[0],ay+tiV[1]-10,'zaobilazim usidreni brod',C.green); }
    }
    g+=`</g>`;
    if(myView) g+=`<text x="${W-12}" y="20" text-anchor="end" font-size="11" fill="${C.acc}" font-weight="600">pogled s mog broda: pramac gore</text>`;
    stage.innerHTML=SVG(W,H,g);
  }
  function show(){
    const sc=COLREG[idx];
    draw(sc,solved);
    el('colregInfo').innerHTML=`<h4 class="mt14">${idx+1}/${COLREG.length}, ${sc.t}</h4>`+
      (solved?`<div class="expl"><b>Rješenje</b><br>${sc.r}<div style="margin-top:8px;font-size:13.5px;color:var(--txt2)"><b>Zvučni signal:</b> <code>${sc.signal}</code></div></div>`
       :`<p class="c-txt2">Tko ima prednost i kojim putem prolaziš? Razmisli, pa otkrij rješenje.</p>`)+
      (myView?`<div class="note"><b>Moj pramac gore</b>${(((sc.a.h%360)+360)%360)===0?'Tvoj brod (TI) ovdje već plovi prema sjeveru, pa je slika ista kao prije. Razlika se vidi u situacijama gdje TI plovi u drugom smjeru (npr. 3, 4, 5).':'Slika je zakrenuta tako da TI plovi prema gore, kao da stojiš na svom brodu i gledaš naprijed. Sad odmah vidiš je li drugi brod s tvoje <b>desne</b> ili <b>lijeve</b> strane.'}</div>`:`<p style="font-size:13.5px;color:var(--txt3)">Savjet: gumb <b>Okreni: moj pramac gore</b> zakrene sliku kao da gledaš sa svog broda, pa lakše vidiš dolazi li drugi brod zdesna ili slijeva.</p>`);
    $$('.crchip').forEach(c=>c.classList.toggle('on',+c.dataset.i===idx));
  }
  el('colregControls').innerHTML=COLREG.map((s,i)=>`<span class="chip crchip" data-i="${i}">${i+1}</span>`).join('');
  $$('.crchip').forEach(c=>c.addEventListener('click',()=>{idx=+c.dataset.i;solved=false;show();}));
  el('colregSolve').addEventListener('click',()=>{solved=true;show();});
  el('colregNext').addEventListener('click',()=>{idx=(idx+1)%COLREG.length;solved=false;show();});
  el('colregNext').insertAdjacentHTML('afterend','<button class="btn" id="colregView" type="button" aria-pressed="false">Okreni: moj pramac gore</button>');
  el('colregView').addEventListener('click',function(){ myView=!myView; this.classList.toggle('p',myView); this.setAttribute('aria-pressed',myView); show(); });
  show();
})();

/* ═══════════════ RIZIK SUDARA: AZIMUT ═══════════════
   Oba broda plove stalnim kursom i brzinom. Azimut se računa iz njihovih stvarnih položaja:
   ako se ne mijenja dok se udaljenost smanjuje, brodovi stižu u istu točku u isto vrijeme. */
(function(){
  const b=el('riskWidget'); if(!b) return;
  const W=520,H=330, RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const A0=[150,296], X=[150,96], B0=[470,160], PX=120; // 120 px = 1 M
  const CASES={same:{n:'Ne mijenja se',k:1,end:.93,txt:'<b>Azimut ostaje isti, a udaljenost pada: sudar.</b> Oba broda stižu u istu točku u isto vrijeme. To je znak da moraš djelovati po pravilima, i to na vrijeme.'},
    ahead:{n:'Smanjuje se',k:1.4,end:.86,txt:'<b>Azimut se smanjuje:</b> drugi brod izmiče prema tvom pramcu i <b>prolazi ispred tebe</b>. Što se azimut brže mijenja, to je prolaz sigurniji.'},
    astern:{n:'Povećava se',k:.66,end:1.12,txt:'<b>Azimut se povećava:</b> drugi brod zaostaje prema tvojoj krmi i <b>prolazi iza tebe</b>.'}};
  let key='same', t=0, raf=0, last=0, playing=false, fk=1;
  b.innerHTML=`<div class="seg" role="group" aria-label="Kako se mijenja azimut na drugi brod"><span>Azimut</span>${Object.keys(CASES).map(k=>`<button type="button" data-k="${k}"${k===key?' class="on"':''}>${CASES[k].n}</button>`).join('')}</div>
    <div class="rkStage"></div><div class="knStepTxt rkTxt" aria-live="polite"></div>`;
  const stage=$('.rkStage',b);
  const at=u=>{ const c=CASES[key]; return {a:[A0[0]+(X[0]-A0[0])*u, A0[1]+(X[1]-A0[1])*u], o:[B0[0]+(X[0]-B0[0])*u*c.k, B0[1]+(X[1]-B0[1])*u*c.k]}; };
  const brg=p=>(Math.atan2(p.o[0]-p.a[0],-(p.o[1]-p.a[1]))*180/Math.PI+360)%360, rng=p=>Math.hypot(p.o[0]-p.a[0],p.o[1]-p.a[1])/PX;
  const f3=x=>String(Math.round(x)%360).padStart(3,'0')+'°', hB=Math.atan2(X[0]-B0[0],-(X[1]-B0[1]))*180/Math.PI;
  const hull=(p,h,col,op)=>`<g transform="translate(${p[0].toFixed(1)},${p[1].toFixed(1)}) rotate(${h.toFixed(1)})" opacity="${op}"><path d="M0,-15 L8,-3 L8,11 L-8,11 L-8,-3 Z" fill="${col}" stroke="#1c2430" stroke-width="1.3"/></g>`;
  function draw(){ const c=CASES[key];
    let g=`<clipPath id="rkClip"><rect width="${W}" height="${H}" rx="10"/></clipPath><g clip-path="url(#rkClip)">${seaBackground(W,H,{view:'top'})}`;
    const e=at(c.end);
    g+=`<line x1="${A0[0]}" y1="${A0[1]}" x2="${e.a[0]}" y2="${e.a[1].toFixed(1)}" stroke="#9fb6c9" stroke-width="1.2" stroke-dasharray="2 5"/><line x1="${B0[0]}" y1="${B0[1]}" x2="${e.o[0].toFixed(1)}" y2="${e.o[1].toFixed(1)}" stroke="#9fb6c9" stroke-width="1.2" stroke-dasharray="2 5"/>`;
    // tri ranija mjerenja: crta azimuta i očitanje
    [0,.3,.6].forEach((u,i)=>{ if(u>t+.001) return; const p=at(u), mx=(p.a[0]+p.o[0])/2, my=(p.a[1]+p.o[1])/2;
      g+=hull(p.a,0,C.acc,.3)+hull(p.o,hB,'#e6eef5',.3)+`<line x1="${p.a[0].toFixed(1)}" y1="${p.a[1].toFixed(1)}" x2="${p.o[0].toFixed(1)}" y2="${p.o[1].toFixed(1)}" stroke="${C.red}" stroke-width="1.4" stroke-dasharray="4 4" opacity=".55"/>
        <text x="${(mx+6).toFixed(1)}" y="${(my+16).toFixed(1)}" font-size="${(11.5*fk).toFixed(1)}" font-weight="600" fill="${C.red}" paint-order="stroke" stroke="#0b2135" stroke-width="3">${i+1}. ${f3(brg(p))}</text>`; });
    const p=at(t), hit=key==='same'&&t>=c.end-.001;
    g+=`<line x1="${p.a[0].toFixed(1)}" y1="${p.a[1].toFixed(1)}" x2="${p.o[0].toFixed(1)}" y2="${p.o[1].toFixed(1)}" stroke="${C.red}" stroke-width="2.2"/>`;
    g+=hull(p.a,0,C.acc,1)+hull(p.o,hB,'#e6eef5',1);
    if(!hit) g+=`<text x="${(p.a[0]-16).toFixed(1)}" y="${(p.a[1]+5).toFixed(1)}" text-anchor="end" font-size="${(12*fk).toFixed(1)}" font-weight="600" fill="${C.acc}">TI</text><text x="${(p.o[0]+14).toFixed(1)}" y="${(p.o[1]-10).toFixed(1)}" font-size="${(12*fk).toFixed(1)}" font-weight="600" fill="${C.txt2}">ON</text>`;
    if(hit) g+=`<circle cx="${X[0]}" cy="${X[1]+10}" r="26" fill="none" stroke="${C.red}" stroke-width="3"/><text x="${X[0]+36}" y="${X[1]+14}" font-size="${(14*fk).toFixed(1)}" font-weight="600" fill="${C.red}">Sudar</text>`;
    g+=`</g><text x="${W-14}" y="${8+16*fk}" text-anchor="end" font-size="${(12*fk).toFixed(1)}" fill="${C.txt2}">azimut <tspan font-weight="600" font-size="${(15*fk).toFixed(1)}" fill="#fff">${f3(brg(p))}</tspan></text>
      <text x="${W-14}" y="${8+34*fk}" text-anchor="end" font-size="${(12*fk).toFixed(1)}" fill="${C.txt2}">udaljenost <tspan font-weight="600" fill="#fff">${rng(p).toFixed(1).replace('.',',')} M</tspan></text>`;
    stage.innerHTML=SVG(W,H,g); }
  function loop(ts){ if(!playing) return; if(!last) last=ts; const c=CASES[key]; t=Math.min(c.end,t+(ts-last)/1000/6); last=ts; draw();
    if(t>=c.end){ playing=false; setTimeout(()=>{ if(!playing){ t=0; start(); } },2600); return; } raf=requestAnimationFrame(loop); }
  function start(){ cancelAnimationFrame(raf); $('.rkTxt',b).innerHTML=CASES[key].txt; if(RM){ t=CASES[key].end; draw(); return; } playing=true; last=0; raf=requestAnimationFrame(loop); }
  $('.seg',b).addEventListener('click',e=>{ const x=e.target.closest('button'); if(!x) return; key=x.dataset.k; $$('.seg button',b).forEach(y=>y.classList.toggle('on',y===x)); t=0; start(); });
  // vrti se samo dok je na ekranu
  if('IntersectionObserver' in window && !RM) new IntersectionObserver(es=>{ if(es[0].isIntersecting){ if(!playing){ t=0; start(); } } else { playing=false; cancelAnimationFrame(raf); } }).observe(b);
  $('.rkTxt',b).innerHTML=CASES[key].txt; t=RM?CASES[key].end:0; draw(); onWidth(stage,()=>{ fk=fitText(stage,W); draw(); });
})();

/* ═══════════════ SAIL RIGHT OF WAY ═══════════════ */
(function(){
  const b=el('sailWidget'); if(!b) return;
  const W=680,H=290;
  function sail(x,y,rot,c,lbl,sub){
    return `<g transform="translate(${x},${y}) rotate(${rot})">
      <path d="M0,-26 L12,-4 L12,18 L-12,18 L-12,-4 Z" fill="#12354e" stroke="${c}" stroke-width="1.6"/>
      <path d="M0,-30 L0,16 L17,10 Z" fill="${c}" opacity=".55"/></g>
      <text x="${x}" y="${y+42}" text-anchor="middle" font-size="12.5" font-weight="600" fill="${c}">${lbl}</text>
      <text x="${x}" y="${y+58}" text-anchor="middle" font-size="11" fill="${C.txt2}">${sub}</text>`;
  }
  let g=`<clipPath id="seaClip${W}x${H}"><rect width="${W}" height="${H}" rx="10"/></clipPath><g clip-path="url(#seaClip${W}x${H})">${seaBackground(W,H,{view:'top'})}</g>`;
  g+=`<line x1="${W/2}" y1="14" x2="${W/2}" y2="${H-14}" stroke="${C.line}" stroke-dasharray="6 5"/>`;
  // left: different tacks
  g+=`<text x="${W/4}" y="26" text-anchor="middle" font-size="13" font-weight="600" fill="${C.txt}">Različiti bok</text>`;
  g+=`<g opacity=".85"><line x1="30" y1="52" x2="30" y2="108" stroke="${C.yellow}" stroke-width="2"/><polygon points="30,116 25,104 35,104" fill="${C.yellow}"/><text x="46" y="86" font-size="11" fill="${C.yellow}" font-weight="600">Vjetar</text></g>`;
  g+=sail(110,140,40,C.red,'Vjetar u lijevi bok','Izbjegava');
  g+=sail(250,140,-40,C.green,'Vjetar u desni bok','Ima prednost');
  // right: same tack
  g+=`<text x="${W*3/4}" y="26" text-anchor="middle" font-size="13" font-weight="600" fill="${C.txt}">Isti bok</text>`;
  g+=`<g opacity=".85"><line x1="382" y1="52" x2="382" y2="108" stroke="${C.yellow}" stroke-width="2"/><polygon points="382,116 377,104 387,104" fill="${C.yellow}"/><text x="398" y="86" font-size="11" fill="${C.yellow}" font-weight="600">Vjetar</text></g>`;
  g+=sail(470,112,30,C.red,'Privjetrina','Izbjegava');
  g+=sail(590,192,30,C.green,'Zavjetrina','Ima prednost');
  b.innerHTML=SVG(W,H,g);
})();

/* ═══════════════ SOUND SIGNALS ═══════════════ */
(function(){
  const b=el('soundWidget'); if(!b) return;
  const sigs=[
    ['Jedan kratki','Mijenjam kurs udesno',[1]],
    ['Dva kratka','Mijenjam kurs ulijevo',[1,1]],
    ['Tri kratka','Vozim krmom',[1,1,1]],
    ['Pet kratkih','Upozorenje: ne razumijem namjere',[1,1,1,1,1]],
    ['Jedan dugi','Nailazim iza rta ili plovim u magli',[4]],
    ['Dva duga','Plovim, ali se ne krećem kroz vodu (magla)',[4,4]],
    ['Dugi i dva kratka','Jedra, tegljenje, ribolov, nesposoban, ograničen (magla)',[4,1,1]],
    ['Četiri kratka','Peljarski brod u službi (magla)',[1,1,1,1]],
    ['Dva duga i kratki','Pretječem s tvoje desne strane',[4,4,1]],
    ['Dva duga i dva kratka','Pretječem s tvoje lijeve strane',[4,4,1,1]],
    ['Dugi, kratki, dugi, kratki','Slažem se s pretjecanjem',[4,1,4,1]]
  ];
  // isti raspored kao u play(): kratki 0,28 s, dugi 1,1 s, razmak 0,22 s (skraćeno radi slušanja)
  const DUR=u=>u===1?0.28:1.1, GAP=0.22;
  function plan(pattern){ let t=0; return pattern.map(u=>{ const seg={t,d:DUR(u),u}; t+=DUR(u)+GAP; return seg; }); }
  const total=pattern=>{ const p=plan(pattern), l=p[p.length-1]; return l.t+l.d; };
  const mark=pattern=>'<span class="sg" aria-hidden="true">'+pattern.map(u=>u===1?'<i></i>':'<i class="l"></i>').join('')+'</span>';
  let ctx=null;
  function play(pattern){
    try{
      ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
      if(ctx.state==='suspended') ctx.resume();
      let t=ctx.currentTime+.05;
      pattern.forEach(u=>{
        const d = u===1?0.28:1.1;
        const o=ctx.createOscillator(), g2=ctx.createGain();
        o.type='sawtooth'; o.frequency.value=175;
        g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(.19,t+.02);
        g2.gain.setValueAtTime(.19,t+d-.03); g2.gain.linearRampToValueAtTime(0,t+d);
        o.connect(g2); g2.connect(ctx.destination); o.start(t); o.stop(t+d+.02);
        t+=d+0.22;
      });
    }catch(e){}
  }
  // vremenska traka: segmenti proporcionalni trajanju, svijetle u trenutku kad zvuk svira
  function track(card,pattern){
    const tr=card.querySelector('.sgtrack'), T=total(pattern);
    tr.innerHTML=plan(pattern).map(sg=>`<b style="left:${sg.t/T*100}%;width:${sg.d/T*100}%"></b>`).join('')+'<em></em>';
    const segs=[...tr.querySelectorAll('b')], head=tr.querySelector('em');
    card.classList.add('playing');
    const t0=performance.now()+50;
    (function step(now){
      const t=(now-t0)/1000;
      head.style.left=Math.max(0,Math.min(1,t/T))*100+'%';
      plan(pattern).forEach((sg,i)=>segs[i].classList.toggle('on',t>=sg.t&&t<sg.t+sg.d));
      if(t<T+.1) requestAnimationFrame(step); else { card.classList.remove('playing'); segs.forEach(x=>x.classList.remove('on')); }
    })(performance.now());
  }
  b.innerHTML='<div class="grid g2">'+sigs.map((s,i)=>
    `<div class="card tight sndCard" data-i="${i}">
      <span class="sndRow"><span class="sndMark" aria-hidden="true">${mark(s[2])}</span>
        <span class="sndTxt"><button type="button" class="sndBtn"><span class="sr">Pusti zvuk: </span>${s[0]}</button><span>${s[1]}</span></span>
        <span class="sndPlay" aria-hidden="true">${UI.icon('play',20)}</span></span>
      <span class="sgtrack"></span></div>`).join('')+'</div>'+
    '<p class="small muted">Reprodukcija je skraćena radi slušanja. Na moru kratki traje 1 s, a dugi 4 do 6 s.</p>';
  $$('.sndCard',b).forEach(c=>{
    const go=()=>{ const pat=sigs[+c.dataset.i][2]; play(pat); track(c,pat); };
    c.addEventListener('click',go);
  });
})();
