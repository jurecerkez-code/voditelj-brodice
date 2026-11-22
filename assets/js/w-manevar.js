"use strict";
/* Manevriranje: izboj krme, shema sidrenja, ustroj traganja i spašavanja. */
/* ═══════════════ PROPELLER WALK ═══════════════ */
(function(){
  const b=el('propWidget'); if(!b) return;
  const W=660,H=230;
  // kick: -1 krma izbija ulijevo, +1 udesno. Krma ide u stranu izboja, pramac na suprotnu (brodica se zakreće),
  // a obala je na strani na koju krma ide: tim bokom se lakše pristaje.
  function panel(x,title,kick,dirTxt,col){
    const rot=-kick*14, q=rot*Math.PI/180, cx=x+130, cy=105, sx=cx-30*Math.sin(q), sy=cy+30*Math.cos(q);
    const bx=kick<0?x+34:x+212;
    let g=`<text x="${cx}" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="${col}">${title}</text>`;
    g+=`<rect x="${bx}" y="44" width="14" height="142" fill="#3a4a58"/><rect x="${kick<0?bx+11:bx}" y="44" width="3" height="142" fill="#4a545e"/>`;
    g+=`<text transform="rotate(-90 ${bx+7} 115)" x="${bx+7}" y="119" text-anchor="middle" font-size="10.5" fill="#dfe6ec" font-weight="700" letter-spacing="1">OBALA</text>`;
    g+=`<g transform="translate(${cx},${cy}) rotate(${rot})">
      <path d="M0,-46 C16,-24 19,4 17,36 L-17,36 C-19,4 -16,-24 0,-46 Z" fill="#1d3a52" stroke="#5b8bab" stroke-width="1.6"/>
      <text y="-20" text-anchor="middle" font-size="9" fill="${C.txt2}">pramac</text>
      <circle cy="30" r="7" fill="${col}" opacity=".8"/></g>`;
    g+=`<path d="M${(sx+kick*16).toFixed(1)},${(sy+4).toFixed(1)} q${kick*30},10 ${kick*50},2" fill="none" stroke="${col}" stroke-width="2.6" marker-end="url(#ahw)"/>`;
    g+=`<text x="${cx}" y="216" text-anchor="middle" font-size="11.5" fill="${col}" font-weight="700">${dirTxt}</text>`;
    return g;
  }
  const defs=`<defs><marker id="ahw" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><polygon points="0,0 9,4.5 0,9" fill="#39b8e8"/></marker></defs>`;
  let g=`<clipPath id="seaClip${W}x${H}"><rect width="${W}" height="${H}" rx="10"/></clipPath><g clip-path="url(#seaClip${W}x${H})">${seaBackground(W,H,{view:'top'})}</g>`;
  g+=panel(20,'DESNOKRETNI vijak: vožnja KRMOM',-1,'krma izbija ULIJEVO → pristani LIJEVIM bokom',C.acc);
  g+=`<line x1="${W/2}" y1="14" x2="${W/2}" y2="${H-14}" stroke="${C.line}" stroke-dasharray="6 5"/>`;
  g+=panel(340,'LIJEVOKRETNI vijak: vožnja KRMOM',1,'krma izbija UDESNO → pristani DESNIM bokom',C.acc);
  b.innerHTML=SVG(W,H,defs+g);
})();

/* ═══════════════ ANCHOR SCOPE ═══════════════ */
(function(){
  const b=el('anchorWidget'); if(!b) return;
  const W=660,H=280;
  let g=`<rect width="${W}" height="60" fill="#0b1e30"/>`+seaBackground(W,H,{y:60,view:'section'});
  g+=`<path data-keep-dark="1" d="M0,238 q120,-14 260,4 t400,-8 L${W},${H} L0,${H} Z" fill="#d9c48a"/>`;
  g+=`<text data-keep-dark="1" x="${W-14}" y="${H-10}" text-anchor="end" font-size="11.5" font-weight="700" fill="#4d3d0c">dno: mulj ili pijesak drže najbolje</text>`;
  // boat
  g+=`<g transform="translate(480,44)"><path d="M-44,0 q44,-20 88,0 l-12,16 q-32,7 -64,0 Z" fill="#e6eef5"/><rect x="-8" y="-22" width="16" height="22" fill="#9fb6c9"/></g>`;
  // chain
  g+=`<path d="M440,52 Q300,150 130,236" fill="none" stroke="#c8d6e2" stroke-width="3" stroke-dasharray="7 4"/>`;
  // anchor
  g+=`<g transform="translate(126,232)"><path d="M0,-14 v20 M-13,2 q13,16 26,0 M-8,-14 h16" stroke="#c8d6e2" stroke-width="3" fill="none"/><circle cy="-18" r="4" fill="none" stroke="#c8d6e2" stroke-width="3"/></g>`;
  // depth
  g+=`<line x1="560" y1="60" x2="560" y2="234" stroke="${C.acc}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
  g+=`<text x="568" y="150" font-size="13" fill="${C.acc}" font-weight="800">dubina D</text>`;
  g+=`<text data-keep-dark="1" x="300" y="128" font-size="13" fill="#14532d" font-weight="800" text-anchor="middle" transform="rotate(-31 300 128)">lanac = 3 do 4 × D</text>`;
  // swing circle
  g+=`<circle cx="126" cy="232" r="60" fill="none" stroke="${C.yellow}" stroke-dasharray="5 4" opacity=".6"/>`;
  g+=`<text data-keep-dark="1" x="126" y="164" font-size="11.5" font-weight="700" fill="#7a4a00" text-anchor="middle">lazni prostor: puni krug</text>`;
  b.innerHTML=SVG(W,H,g);
})();

/* ═══════════════ SAR HIERARCHY ═══════════════ */
(function(){
  const b=el('sarWidget'); if(!b) return;
  const W=680,H=280;
  const boxes=[
    {x:W/2-115,y:14,w:230,h:46,t:'STOŽER: ZAGREB',s:'Ministarstvo mora + zamjenik + 5 članova',c:C.txt2},
    {x:W/2-140,y:80,w:280,h:52,t:'MRCC RIJEKA: tel. 195',s:'Nacionalna središnjica za traganje i spašavanje',c:C.red},
    {x:W/2-190,y:152,w:380,h:46,t:'POD-SREDIŠNJICE (MRSC)',s:'8 lučkih kapetanija: PU · RI · SE · ZD · ŠI · ST · PL · DU',c:C.acc},
    {x:24,y:220,w:300,h:46,t:'OBALNE PROMATRAČKE JEDINICE',s:'sve ispostave lučkih kapetanija',c:C.green},
    {x:356,y:220,w:300,h:46,t:'JEDINICE TRAGANJA I SPAŠAVANJA',s:'pomorske · zračne · kopnene',c:C.yellow}
  ];
  let g=`<rect width="${W}" height="${H}" fill="#0b1a28" rx="10"/>`;
  g+=`<line x1="${W/2}" y1="60" x2="${W/2}" y2="80" stroke="${C.line}" stroke-width="2"/>`;
  g+=`<line x1="${W/2}" y1="132" x2="${W/2}" y2="152" stroke="${C.line}" stroke-width="2"/>`;
  g+=`<path d="M${W/2},198 v10 M174,208 h332 M174,208 v12 M506,208 v12" stroke="${C.line}" stroke-width="2" fill="none"/>`;
  boxes.forEach(bx=>{
    g+=`<rect x="${bx.x}" y="${bx.y}" width="${bx.w}" height="${bx.h}" rx="8" fill="#132738" stroke="${bx.c}" stroke-width="1.8"/>`;
    g+=`<text x="${bx.x+bx.w/2}" y="${bx.y+20}" text-anchor="middle" font-size="12.5" font-weight="800" fill="${bx.c}">${bx.t}</text>`;
    g+=`<text x="${bx.x+bx.w/2}" y="${bx.y+bx.h-10}" text-anchor="middle" font-size="10.5" fill="${C.txt2}">${bx.s}</text>`;
  });
  b.innerHTML=SVG(W,H,g);
})();
