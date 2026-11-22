"use strict";
/* Izbjegavanje sudara: situacije, rizik sudara, jedrilice, zvučni signali. */
/* ═══════════════ COLREG SCENARIOS ═══════════════ */
const COLREG=[
 {id:'head',t:'Nasuprotni kursevi: glava u glavu',a:{x:200,y:300,h:0,type:'motor'},bo:{x:200,y:100,h:180,type:'motor'},
  r:'Nijedan nema prednost. <b>OBA mijenjaju kurs UDESNO</b> i prolaze lijevi bok uz lijevi bok. Radnja mora biti pravovremena i odlučna.',
  path:'both_right', signal:'· (jedan kratki), mijenjam kurs udesno'},
 {id:'cross_r',t:'Kursevi se sijeku: drugi mi dolazi ZDESNA',a:{x:120,y:280,h:45,type:'motor'},bo:{x:340,y:150,h:225,type:'motor'},
  r:'Vidim ga preko <b>svoje desne strane</b> → <b>JA IZBJEGAVAM</b>. Mijenjam kurs UDESNO i prolazim <b>iza njegove krme</b>. On zadržava kurs i brzinu.',
  path:'a_right', signal:'· (jedan kratki)'},
 {id:'cross_l',t:'Kursevi se sijeku: drugi mi dolazi SLIJEVA',a:{x:340,y:280,h:315,type:'motor'},bo:{x:120,y:150,h:135,type:'motor'},
  r:'Vidim ga preko svoje <b>lijeve</b> strane → <b>JA IMAM PREDNOST.</b> Zadržavam kurs i brzinu i stalno ga pratim. On mora izbjeći.',
  path:'b_right', signal:'nije potreban'},
 {id:'noreact',t:'Imam prednost, ali on ne reagira',a:{x:340,y:280,h:315,type:'motor'},bo:{x:120,y:150,h:135,type:'motor'},
  r:'1) <b>Najmanje 5 kratkih zvučnih signala</b>: upozorenje.<br>2) Ako i dalje ništa: <b>izbjegavam iako imam prednost</b>.<br>3) <b>Puni okret UDESNO</b> pa zaobilazak. <span style="color:var(--red)"><b>NIKAD ulijevo!</b></span> Razlog: ako se on „probudi" i krene udesno, sudarit ćete se.',
  path:'a_circle', signal:'<span class="sg" role="img" aria-label="kratki, kratki, kratki, kratki, kratki"><i></i><i></i><i></i><i></i><i></i></span> (pet ili više kratkih)'},
 {id:'overtake',t:'Pretjecanje',a:{x:200,y:330,h:0,type:'motor'},bo:{x:200,y:170,h:0,type:'motor'},
  r:'<b>Brod koji pretječe UVIJEK se uklanja</b>: bilo da je motorni, jedrilica ili motorni jedrenjak. Može lijevo ili desno, ali <b>nikad ne smije presjeći kurs</b> brodu kojeg pretječe (ne prolazi mu po pramcu). Pretjecani zadržava kurs i brzinu.',
  path:'a_pass', signal:'<span class="sg" role="img" aria-label="dugi, dugi, kratki"><i class="l"></i><i class="l"></i><i></i></span> s njegove desne, <span class="sg" role="img" aria-label="dugi, dugi, kratki, kratki"><i class="l"></i><i class="l"></i><i></i><i></i></span> s njegove lijeve; pristanak: <span class="sg" role="img" aria-label="dugi, kratki, dugi, kratki"><i class="l"></i><i></i><i class="l"></i><i></i></span>'},
 {id:'sail_motor',t:'Jedrilica × motorni brod',a:{x:130,y:280,h:40,type:'motor'},bo:{x:330,y:160,h:220,type:'sail'},
  r:'<b>Jedrilica ima prednost.</b> Motorni brod mijenja kurs UDESNO i zaobilazi <b>po krmi</b> jedrilice. Jedrilica zadržava kurs i brzinu.<br><span style="color:var(--yellow)">Iznimke: ako jedrilica pretječe, ako je motorni jedrenjak, ili ako je motorni brod u kategoriji iznad nje.</span>',
  path:'a_right', signal:'· (jedan kratki)'},
 {id:'motsail',t:'TRIK: „jedrilica" s crnim čunjem vrhom dolje',a:{x:130,y:280,h:40,type:'motor'},bo:{x:330,y:160,h:220,type:'motorsail'},
  r:'Čunj vrhom dolje = <b>MOTORNI JEDRENJAK</b> = brod na mehanički pogon. Nema prednost jedrilice!<br>Dva motorna broda, kursevi se sijeku → <b>pravilo desne strane</b>. Ako mi dolazi <b>zdesna</b>: ja izbjegavam. Ako <b>slijeva</b>: ja imam prednost.',
  path:'a_right', signal:'· (jedan kratki)'},
 {id:'anchored',t:'TRIK: jedrilica s crnom kuglom',a:{x:150,y:290,h:20,type:'motor'},bo:{x:310,y:160,h:200,type:'anchored'},
  r:'Crna kugla = <b>USIDRENI BROD</b>. Uopće nije u plovidbi: pitanje prednosti se ne postavlja. <b>Ja ga moram zaobići.</b><br>Smjer njegovog pramca je nebitan: usidreni brod se okreće oko sidra.',
  path:'a_avoid', signal:'nije potreban'},
 {id:'sail_diff',t:'Dvije jedrilice: vjetar u RAZLIČITI bok',a:{x:140,y:270,h:35,type:'sail',tack:'port'},bo:{x:330,y:170,h:215,type:'sail',tack:'stbd'},
  r:'<b>Izbjegava ona koja prima vjetar u LIJEVI bok</b> (port tack). Ona s vjetrom u desni bok (starboard tack) ima prednost i zadržava kurs.',
  path:'a_right', signal:'nije potreban', wind:true},
 {id:'sail_same',t:'Dvije jedrilice: vjetar u ISTI bok',a:{x:150,y:150,h:150,type:'sail'},bo:{x:290,y:270,h:150,type:'sail'},
  r:'<b>Izbjegava ona koja je U PRIVJETRINI</b> (bliže vjetru, ima jači vjetar). Ona u <b>zavjetrini</b> ima prednost. Privjetrinska skreće niz vjetar ili prolazi po krmi druge.',
  path:'a_right', signal:'nije potreban', wind:true},
 {id:'harbour',t:'Ulaz i izlaz iz luke',a:{x:200,y:320,h:0,type:'motor'},bo:{x:200,y:150,h:180,type:'motor'},
  r:'<b>Brod koji IZLAZI iz luke ima prednost</b> pred brodom koji ulazi. Onaj koji ulazi čeka.',
  path:'none', signal:'nije potreban', harbour:true},
 {id:'narrow',t:'Uski kanal: mali i veliki brod',a:{x:150,y:290,h:0,type:'motor'},bo:{x:250,y:150,h:180,type:'big'},
  r:'Plovni objekti <b>duljine 20 m i manji</b> dužni su <b>sklanjati se s puta većim plovnim objektima</b> u uskim kanalima, pri uplovljenju/isplovljenju i u <b>polukrugu od 1 Nm</b> od ulaza u luku. Ako želiš prijeći kanal: <b>okomito, najkraćim putem</b>. Pretjecanje u pravilu nije dopušteno.',
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
      <text x="${x}" y="${y+(type==='big'?42:34)}" text-anchor="middle" font-size="12" font-weight="800" fill="${c}" paint-order="stroke" stroke="#0b2135" stroke-width="3"${lab}>${label}</text>`;
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
        g+=`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="${t==='N'?C.red:'#7fa8c8'}" transform="rotate(${-ROT} ${x.toFixed(1)} ${(y-4).toFixed(1)})">${t}</text>`; }); }
    if(sc.harbour){ g+=`<rect x="120" y="0" width="230" height="70" fill="#2a3d4d"/><text x="235" y="42" text-anchor="middle" font-size="13" fill="${C.txt2}" font-weight="700" transform="rotate(${-ROT} 235 38)">LUKA</text>`; }
    if(sc.narrow){ g+=`<rect x="0" y="0" width="90" height="${H}" fill="#2a3d4d"/><rect x="${W-90}" y="0" width="90" height="${H}" fill="#2a3d4d"/><text x="45" y="200" text-anchor="middle" font-size="12" fill="${C.txt2}" transform="rotate(-90 45 200)">USKI KANAL</text>`; }
    if(sc.wind){ g+=`<g opacity=".8">${arrow(40,40,40,110,C.yellow)}<text x="52" y="80" font-size="12" fill="${C.yellow}" font-weight="700">VJETAR</text></g>`; }
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
      const lab=(x,y,t,col)=>{ const X=Math.max(60,Math.min(W-60,x)), Y=Math.max(14,Math.min(H-8,y)); return `<text x="${X}" y="${Y}" text-anchor="middle" font-size="11" fill="${col}" font-weight="700" paint-order="stroke" stroke="#0b2135" stroke-width="3" transform="rotate(${-ROT} ${X} ${Y})">${t}</text>`; };
      const [ax,ay]=bow(A), [bx,by]=bow(B);
      if(p==='both_right'){ g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.green); g+=arrow(bx,by,bx+onV[0],by+onV[1],C.green); }
      if(p==='a_right'){ g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.green); g+=lab(ax+tiV[0]*1.15,ay+tiV[1]*1.15-6,sc.wind?'udesno, niz vjetar':sc.narrow?'udesno, prema rubu kanala':'udesno, iza krme',C.green); }
      if(p==='b_right'){ g+=arrow(bx,by,bx+onV[0],by+onV[1],C.green); g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.acc,'5 4'); g+=lab(ax+tiV[0]*1.2,ay+tiV[1]*1.2-6,'zadržavam kurs i brzinu',C.acc); }
      if(p==='a_circle'){
        // puni okret udesno: krug sa središtem desno od pramca
        const r=46, cxy=V(A.h+90,r), cx=A.x+cxy[0], cy=A.y+cxy[1];
        const st=[A.x,A.y], en=V(A.h+90-8,1);
        g+=`<path d="M${st[0]},${st[1]} A${r},${r} 0 1 1 ${(cx-Math.sin((A.h+90-12)*Math.PI/180)*r).toFixed(1)},${(cy+Math.cos((A.h+90-12)*Math.PI/180)*r).toFixed(1)}" fill="none" stroke="${C.green}" stroke-width="2.4" marker-end="url(#ahg)"/>`;
        g+=lab(cx,cy-r-10,'puni okret UDESNO',C.green);
      }
      if(p==='a_pass'){ g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.green); g+=lab(ax+tiV[0],ay+tiV[1]-10,'obilazim, ne presijecam',C.green); }
      if(p==='a_avoid'){ g+=arrow(ax,ay,ax+tiV[0],ay+tiV[1],C.green); g+=lab(ax+tiV[0],ay+tiV[1]-10,'zaobilazim usidreni brod',C.green); }
    }
    g+=`</g>`;
    if(myView) g+=`<text x="${W-12}" y="20" text-anchor="end" font-size="11" fill="${C.acc}" font-weight="700">pogled s mog broda: pramac gore</text>`;
    stage.innerHTML=SVG(W,H,g);
  }
  function show(){
    const sc=COLREG[idx];
    draw(sc,solved);
    el('colregInfo').innerHTML=`<h4 style="margin-top:14px">${idx+1}/${COLREG.length} · ${sc.t}</h4>`+
      (solved?`<div class="expl"><b>Rješenje</b><br>${sc.r}<div style="margin-top:8px;font-size:13.5px;color:var(--txt2)"><b>Zvučni signal:</b> <code>${sc.signal}</code></div></div>`
       :`<p style="color:var(--txt2)">Tko ima prednost i kojim putem prolaziš? Razmisli, pa otkrij rješenje.</p>`)+
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

/* ═══════════════ RISK / BEARING ═══════════════ */
(function(){
  const b=el('riskWidget'); if(!b) return;
  const W=340,H=300;
  let g=`<clipPath id="seaClip${W}x${H}"><rect width="${W}" height="${H}" rx="10"/></clipPath><g clip-path="url(#seaClip${W}x${H})">${seaBackground(W,H,{view:'top'})}</g>`;
  g+=`<g transform="translate(${W/2},${H-50})"><path d="M0,-20 L10,-4 L10,14 L-10,14 L-10,-4 Z" fill="${C.acc}"/></g>`;
  g+=`<text x="${W/2}" y="${H-16}" text-anchor="middle" font-size="12" fill="${C.acc}" font-weight="700">TI</text>`;
  const other=[[250,60],[228,105],[206,150]];
  other.forEach((p,i)=>{
    g+=`<g transform="translate(${p[0]},${p[1]}) rotate(215)"><path d="M0,-14 L7,-3 L7,10 L-7,10 L-7,-3 Z" fill="#e6eef5" stroke="#1c2430" stroke-width="1.4" opacity="${.4+i*.3}"/></g>`;
    if(i===2) g+=`<text x="${p[0]+14}" y="${p[1]+4}" font-size="12" font-weight="700" fill="${C.txt2}">ON</text>`;
    g+=`<line x1="${W/2}" y1="${H-50}" x2="${p[0]}" y2="${p[1]}" stroke="${C.red}" stroke-width="1.6" stroke-dasharray="4 3" opacity="${.45+i*.25}"/>`;
  });
  g+=`<text x="140" y="40" font-size="12.5" fill="${C.red}" font-weight="800">AZIMUT SE NE MIJENJA</text>`;
  g+=`<text x="150" y="58" font-size="11.5" fill="${C.txt2}">→ rizik od sudara</text>`;
  g+=`<text x="16" y="${H-90}" font-size="11" fill="${C.txt2}">Kut ↓ → prolazi po pramcu</text>`;
  g+=`<text x="16" y="${H-74}" font-size="11" fill="${C.txt2}">Kut ↑ → prolazi po krmi</text>`;
  b.innerHTML=SVG(W,H,g);
})();

/* ═══════════════ SAIL RIGHT OF WAY ═══════════════ */
(function(){
  const b=el('sailWidget'); if(!b) return;
  const W=680,H=290;
  function sail(x,y,rot,c,lbl,sub){
    return `<g transform="translate(${x},${y}) rotate(${rot})">
      <path d="M0,-26 L12,-4 L12,18 L-12,18 L-12,-4 Z" fill="#12354e" stroke="${c}" stroke-width="1.6"/>
      <path d="M0,-30 L0,16 L17,10 Z" fill="${c}" opacity=".55"/></g>
      <text x="${x}" y="${y+42}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${c}">${lbl}</text>
      <text x="${x}" y="${y+58}" text-anchor="middle" font-size="11" fill="${C.txt2}">${sub}</text>`;
  }
  let g=`<clipPath id="seaClip${W}x${H}"><rect width="${W}" height="${H}" rx="10"/></clipPath><g clip-path="url(#seaClip${W}x${H})">${seaBackground(W,H,{view:'top'})}</g>`;
  g+=`<line x1="${W/2}" y1="14" x2="${W/2}" y2="${H-14}" stroke="${C.line}" stroke-dasharray="6 5"/>`;
  // left: different tacks
  g+=`<text x="${W/4}" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="${C.txt}">RAZLIČITI BOK</text>`;
  g+=`<g opacity=".85"><line x1="30" y1="52" x2="30" y2="108" stroke="${C.yellow}" stroke-width="2"/><polygon points="30,116 25,104 35,104" fill="${C.yellow}"/><text x="46" y="86" font-size="11" fill="${C.yellow}" font-weight="700">VJETAR</text></g>`;
  g+=sail(110,140,40,C.red,'Vjetar u LIJEVI bok','IZBJEGAVA');
  g+=sail(250,140,-40,C.green,'Vjetar u DESNI bok','IMA PREDNOST');
  // right: same tack
  g+=`<text x="${W*3/4}" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="${C.txt}">ISTI BOK</text>`;
  g+=`<g opacity=".85"><line x1="382" y1="52" x2="382" y2="108" stroke="${C.yellow}" stroke-width="2"/><polygon points="382,116 377,104 387,104" fill="${C.yellow}"/><text x="398" y="86" font-size="11" fill="${C.yellow}" font-weight="700">VJETAR</text></g>`;
  g+=sail(470,112,30,C.red,'PRIVJETRINA','IZBJEGAVA');
  g+=sail(590,192,30,C.green,'ZAVJETRINA','IMA PREDNOST');
  b.innerHTML=SVG(W,H,g);
})();

/* ═══════════════ SOUND SIGNALS ═══════════════ */
(function(){
  const b=el('soundWidget'); if(!b) return;
  const sigs=[
    ['Jedan kratki','Mijenjam kurs UDESNO',[1]],
    ['Dva kratka','Mijenjam kurs ULIJEVO',[1,1]],
    ['Tri kratka','Vozim KRMOM',[1,1,1]],
    ['Pet kratkih','UPOZORENJE: ne razumijem namjere',[1,1,1,1,1]],
    ['Jedan dugi','Nailazim iza rta / u plovidbi u magli',[4]],
    ['Dva duga','Plovim, ali se ne krećem kroz vodu (magla)',[4,4]],
    ['Dugi + dva kratka','Jedra, tegljenje, ribolov, nesposoban, ograničen (magla)',[4,1,1]],
    ['Četiri kratka','Peljarski brod u službi (magla)',[1,1,1,1]],
    ['Dva duga + kratki','Pretječem s TVOJE DESNE strane',[4,4,1]],
    ['Dva duga + dva kratka','Pretječem s TVOJE LIJEVE strane',[4,4,1,1]],
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
    `<button type="button" class="card tight sndCard" data-i="${i}">
      <span class="sndRow"><span class="sndMark" aria-hidden="true">${mark(s[2])}</span>
        <span class="sndTxt"><span class="sr">Pusti zvuk: </span><b>${s[0]}</b><span>${s[1]}</span></span>
        <span class="sndPlay" aria-hidden="true">${UI.icon('play',20)}</span></span>
      <span class="sgtrack"></span></button>`).join('')+'</div>'+
    '<p class="small muted">Reprodukcija je skraćena radi slušanja. Na moru kratki traje 1 s, a dugi 4 do 6 s.</p>';
  $$('.sndCard',b).forEach(c=>{
    const go=()=>{ const pat=sigs[+c.dataset.i][2]; play(pat); track(c,pat); };
    c.addEventListener('click',go);
  });
})();
