"use strict";
/* Manevriranje: izboj krme, krug zakretanja na sidru, ustroj traganja i spašavanja. */
/* ═══════════════ PROPELLER WALK ═══════════════ */
(function(){
  const b=el('propWidget'); if(!b) return;
  const W=660,H=230;
  // kick: -1 krma izbija ulijevo, +1 udesno. Krma ide u stranu izboja, pramac na suprotnu (brodica se zakreće),
  // a obala je na strani na koju krma ide: tim bokom se lakše pristaje.
  function panel(x,title,kick,dirTxt,col){
    const rot=-kick*14, q=rot*Math.PI/180, cx=x+130, cy=105, sx=cx-30*Math.sin(q), sy=cy+30*Math.cos(q);
    const bx=kick<0?x+34:x+212;
    let g=`<text x="${cx}" y="26" text-anchor="middle" font-size="13" font-weight="600" fill="${col}">${title}</text>`;
    g+=`<rect x="${bx}" y="44" width="14" height="142" fill="#3a4a58"/><rect x="${kick<0?bx+11:bx}" y="44" width="3" height="142" fill="#4a545e"/>`;
    g+=`<text transform="rotate(-90 ${bx+7} 115)" x="${bx+7}" y="119" text-anchor="middle" font-size="10.5" fill="#dfe6ec" font-weight="600" letter-spacing="1">OBALA</text>`;
    g+=`<g transform="translate(${cx},${cy}) rotate(${rot})">
      <path d="M0,-46 C16,-24 19,4 17,36 L-17,36 C-19,4 -16,-24 0,-46 Z" fill="#1d3a52" stroke="#5b8bab" stroke-width="1.6"/>
      <text y="-20" text-anchor="middle" font-size="9" fill="${C.txt2}">pramac</text>
      <circle cy="30" r="7" fill="${col}" opacity=".8"/></g>`;
    g+=`<path d="M${(sx+kick*16).toFixed(1)},${(sy+4).toFixed(1)} q${kick*30},10 ${kick*50},2" fill="none" stroke="${col}" stroke-width="2.6" marker-end="url(#ahw)"/>`;
    g+=`<text x="${cx}" y="216" text-anchor="middle" font-size="11.5" fill="${col}" font-weight="600">${dirTxt}</text>`;
    return g;
  }
  const defs=`<defs><marker id="ahw" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><polygon points="0,0 9,4.5 0,9" fill="#39b8e8"/></marker></defs>`;
  let g=`<clipPath id="seaClip${W}x${H}"><rect width="${W}" height="${H}" rx="10"/></clipPath><g clip-path="url(#seaClip${W}x${H})">${seaBackground(W,H,{view:'top'})}</g>`;
  g+=panel(20,'DESNOKRETNI vijak: vožnja KRMOM',-1,'krma izbija ULIJEVO → pristani LIJEVIM bokom',C.acc);
  g+=`<line x1="${W/2}" y1="14" x2="${W/2}" y2="${H-14}" stroke="${C.line}" stroke-dasharray="6 5"/>`;
  g+=panel(340,'LIJEVOKRETNI vijak: vožnja KRMOM',1,'krma izbija UDESNO → pristani DESNIM bokom',C.acc);
  b.innerHTML=SVG(W,H,defs+g);
})();

/* ═══════════════ KRUG ZAKRETANJA NA SIDRU (pogled odozgo) ═══════════════ */
(function(){
  const b=el('anchorWidget'); if(!b) return;
  const W=560,H=236, R=84;
  const anchor=(x,y)=>`<g transform="translate(${x},${y}) scale(.7)"><path d="M0,-14 v20 M-13,2 q13,16 26,0 M-8,-14 h16" stroke="#c8d6e2" stroke-width="3" fill="none"/><circle cy="-18" r="4" fill="none" stroke="#c8d6e2" stroke-width="3"/></g>`;
  // brodica na sidru uvijek gleda pramcem prema sidru (u vjetar); kut a = smjer iz kojeg puše
  const boatAt=(cx,cy,a,ghost)=>{ const q=a*Math.PI/180, x=cx-Math.sin(q)*(R-18), y=cy+Math.cos(q)*(R-18);
    return `<line x1="${cx}" y1="${cy}" x2="${(cx-Math.sin(q)*(R-36)).toFixed(1)}" y2="${(cy+Math.cos(q)*(R-36)).toFixed(1)}" stroke="#c8d6e2" stroke-width="1.6" stroke-dasharray="5 3" opacity="${ghost?.45:1}"/><g opacity="${ghost?.4:1}" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a})"><path d="M0,-19 C8,-10 9,6 8,17 L-8,17 C-9,6 -8,-10 0,-19 Z" fill="#e8eef3" stroke="#1d2b36" stroke-width="1.3"/><path d="M-5,-2 h10 v9 h-10 Z" fill="#9fb6c9" stroke="#1d2b36" stroke-width=".8"/></g>`; };
  let g=`<clipPath id="swClip"><rect width="${W}" height="${H}" rx="10"/></clipPath><g clip-path="url(#swClip)">${seaBackground(W,H,{view:'top'})}</g>`;
  [[130,132,'tvoja brodica'],[430,132,'susjed']].forEach(([cx,cy,n],i)=>{
    g+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${C.yellow}" fill-opacity=".07" stroke="${C.yellow}" stroke-width="1.6" stroke-dasharray="6 4"/>`;
    g+=boatAt(cx,cy,115,true)+boatAt(cx,cy,235,true)+boatAt(cx,cy,0,false)+anchor(cx,cy);
    g+=`<text x="${cx}" y="${cy-R-8}" text-anchor="middle" font-size="16" font-weight="600" fill="${C.txt2}">${n}</text>`; });
  g+=`<g transform="translate(280,96)"><path d="M0,-22 V16 M-8,6 L0,18 L8,6" stroke="#e6eef5" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text y="40" text-anchor="middle" font-size="15" fill="#9fb6c9">vjetar</text></g>`;
  g+=`<path d="M130,132 h${R}" stroke="${C.acc}" stroke-width="2.4"/><text x="${130+R/2+6}" y="124" text-anchor="middle" font-size="15" font-weight="600" fill="${C.acc}">polumjer</text>`;
  b.innerHTML=SVG(W,H,g);
})();

/* ═══════════════ SAR HIERARCHY ═══════════════ */
(function(){
  const b=el('sarWidget'); if(!b) return;
  const W=680,H=280;
  const boxes=[
    {x:W/2-115,y:14,w:230,h:46,t:'STOŽER: ZAGREB',s:'Ministarstvo mora + zamjenik + 5 članova',c:C.txt2},
    {x:W/2-140,y:80,w:280,h:52,t:'MRCC RIJEKA: tel. 195',s:'Nacionalna središnjica za traganje i spašavanje',c:C.red},
    {x:W/2-190,y:152,w:380,h:46,t:'POD-SREDIŠNJICE (MRSC)',s:'8 lučkih kapetanija: PU, RI, SE, ZD, ŠI, ST, PL, DU',c:C.acc},
    {x:24,y:220,w:300,h:46,t:'OBALNE PROMATRAČKE JEDINICE',s:'sve ispostave lučkih kapetanija',c:C.green},
    {x:356,y:220,w:300,h:46,t:'JEDINICE TRAGANJA I SPAŠAVANJA',s:'pomorske, zračne, kopnene',c:C.yellow}
  ];
  let g=`<rect width="${W}" height="${H}" fill="#0b1a28" rx="10"/>`;
  g+=`<line x1="${W/2}" y1="60" x2="${W/2}" y2="80" stroke="${C.line}" stroke-width="2"/>`;
  g+=`<line x1="${W/2}" y1="132" x2="${W/2}" y2="152" stroke="${C.line}" stroke-width="2"/>`;
  g+=`<path d="M${W/2},198 v10 M174,208 h332 M174,208 v12 M506,208 v12" stroke="${C.line}" stroke-width="2" fill="none"/>`;
  boxes.forEach(bx=>{
    g+=`<rect x="${bx.x}" y="${bx.y}" width="${bx.w}" height="${bx.h}" rx="8" fill="#132738" stroke="${bx.c}" stroke-width="1.8"/>`;
    g+=`<text x="${bx.x+bx.w/2}" y="${bx.y+20}" text-anchor="middle" font-size="12.5" font-weight="600" fill="${bx.c}">${bx.t}</text>`;
    g+=`<text x="${bx.x+bx.w/2}" y="${bx.y+bx.h-10}" text-anchor="middle" font-size="10.5" fill="${C.txt2}">${bx.s}</text>`;
  });
  b.innerHTML=SVG(W,H,g);
})();
