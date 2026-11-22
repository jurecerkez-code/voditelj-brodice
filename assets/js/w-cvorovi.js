"use strict";
/* Čvorovi korak po korak. */
/* ═══════════════ KNOTS ═══════════════ */
/* Svaki čvor ima JEDAN konačni oblik užeta. Korak ne mijenja oblik: već položeni dio stoji,
   a radni kraj putuje dalje po svojoj putanji (kao kad ruka provlači kraj). Nijedan dio užeta
   zato ne prolazi kroz drugi. z na dijelu putanje: veći broj je bliže gledatelju (iznad). */
(function(){
  const b=el('knotWidget'); if(!b) return;
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W=560,H=380;
  const COL={
    cream:{body:'#d6c197',dark:'#4a3a1e',shade:'#7c6438',hi:'#fff4d6',groove:'rgba(74,56,26,.72)',ridge:'rgba(255,246,220,.55)',whip:'#f2f2ee'},
    blue:{body:'#3574b8',dark:'#0c2240',shade:'#1c4476',hi:'#b9dcff',groove:'rgba(8,26,50,.75)',ridge:'rgba(190,225,255,.5)',whip:'#f2f2ee'},
    orange:{body:'#e0763a',dark:'#4a1f07',shade:'#9a4418',hi:'#ffd6b3',groove:'rgba(70,28,6,.7)',ridge:'rgba(255,220,190,.55)',whip:'#f2f2ee'}
  };
  const NS='http://www.w3.org/2000/svg';
  const msvg=document.createElementNS(NS,'svg');
  msvg.setAttribute('width','0'); msvg.setAttribute('height','0');
  msvg.style.cssText='position:absolute;left:-9999px;top:0;visibility:hidden';
  const mp=document.createElementNS(NS,'path'); msvg.appendChild(mp); document.body.appendChild(msvg);

  // gusto uzorkovanje (svakih ~1,5 px), s granicama dijelova radi „do dijela n“
  // alt: zategnuti oblik istog užeta; ako mu je neki dio dulji, taj se dio uzorkuje gušće da se pramenovi ne razrijede
  function dense(pieces,alt){
    const X=[],Y=[],Z=[],S=[],CL=[],ends=[],cnt=[]; let s=0;
    const altL=alt?alt.map(([d])=>{ mp.setAttribute('d',d); return mp.getTotalLength(); }):null;
    pieces.forEach(([d,z,cl],pi)=>{
      mp.setAttribute('d',d); const L=mp.getTotalLength(), n=Math.max(2,Math.ceil(Math.max(L,altL?altL[pi]:0)/1.5)), n0=X.length;
      for(let i=X.length?1:0;i<=n;i++){ const p=mp.getPointAtLength(L*i/n);
        if(X.length){ s+=Math.hypot(p.x-X[X.length-1],p.y-Y[Y.length-1]); }
        X.push(p.x); Y.push(p.y); Z.push(z); CL.push(cl||''); S.push(s); }
      ends.push(s); cnt.push(X.length-n0);
    });
    return {X,Y,Z,S,CL,ends,cnt,L:s};
  }
  // zategnuti oblik zadan vlastitom putanjom: isti dijelovi i isti broj točaka kao labavi, pa se jedan pretapa u drugi
  function denseLike(pieces,R){ const X=[],Y=[],Z=[],CL=[];
    pieces.forEach(([d,z,cl],pi)=>{ mp.setAttribute('d',d); const L=mp.getTotalLength(), c=R.cnt[pi], n=pi?c:c-1;
      for(let i=pi?1:0;i<=n;i++){ const p=mp.getPointAtLength(L*i/n); X.push(p.x); Y.push(p.y); Z.push(z); CL.push(cl||''); } });
    return {...R,X,Y,Z,CL,own:true,_P:null}; }
  // „upto“ 3.5 = do polovice dijela 3; vraća duljinu po užetu
  const lenAt=(R,u)=>{ if(u>=R.ends.length) return R.L; const i=Math.floor(u), f=u-i, a=i?R.ends[i-1]:0; return a+(R.ends[i]-a)*f; };
  function tighten(R,cx,cy,rad,k){ const X=R.X.slice(), Y=R.Y.slice();
    for(let i=0;i<X.length;i++){ const dx=X[i]-cx, dy=Y[i]-cy, d=Math.hypot(dx,dy); if(d<rad){ const f=k*Math.pow(1-d/rad,.9); X[i]-=dx*f; Y[i]-=dy*f; } }
    return {...R,X,Y}; }
  const mix=(A,B,t)=>({...A,X:A.X.map((x,i)=>x+(B.X[i]-x)*t),Y:A.Y.map((y,i)=>y+(B.Y[i]-y)*t),Z:B.own&&t>.5?B.Z:A.Z,_P:null});

  /* ── crtanje: valjkasto sjenčanje + pramenovi po stvarnoj duljini (bez šavova na spojevima) ── */
  const LX=-.55, LY=-.83; // svjetlo odozgo lijevo
  // „duljina za pramenove“: na oštrom zavoju (npr. konop preko prečke gledan sprijeda) vanjski rub je
  // mnogo dulji od osi, pa se dodaje kut zakreta · pola debljine. Tako zavoj ostaje pun pramenova.
  function plen(R,w){ if(R._P && R._Pw===w) return R._P; const P=[0], X=R.X, Y=R.Y;
    for(let i=1;i<X.length;i++){ const ds=Math.hypot(X[i]-X[i-1],Y[i]-Y[i-1]); let da=0;
      if(i>1){ da=Math.atan2(Y[i]-Y[i-1],X[i]-X[i-1])-Math.atan2(Y[i-1]-Y[i-2],X[i-1]-X[i-2]); da=Math.abs(Math.atan2(Math.sin(da),Math.cos(da))); }
      P.push(P[i-1]+ds+da*w*.5); }
    R._P=P; R._Pw=w; return P; }
  function run(R,i0,i1,col,w,shadow,t0,t1){ t0=t0||5; t1=t1||5;
    // uže od tri pramena: niz kosih „zrna“ (svaki vidljivi dio pramena) preko tamne jezgre
    let pts='', sh='', hl='';
    const T=[];
    for(let i=i0;i<=i1;i++){ const a=Math.max(0,i-2), c=Math.min(R.X.length-1,i+2);
      let tx=R.X[c]-R.X[a], ty=R.Y[c]-R.Y[a]; const l=Math.hypot(tx,ty)||1; tx/=l; ty/=l; T.push([tx,ty]);
      const nx=-ty, ny=tx, lit=nx*LX+ny*LY;
      pts+=R.X[i].toFixed(1)+','+R.Y[i].toFixed(1)+' ';
      if(i>i0+t0&&i<i1-t1) sh+=(R.X[i]+2.6).toFixed(1)+','+(R.Y[i]+3.8).toFixed(1)+' ';
      hl+=(R.X[i]+nx*lit*w*.24).toFixed(1)+','+(R.Y[i]+ny*lit*w*.24).toFixed(1)+' '; }
    let g='';
    if(shadow&&sh) g+=`<polyline points="${sh}" stroke="rgba(0,0,0,.42)" stroke-width="${w+1}" fill="none" stroke-linejoin="round"/>`;
    g+=`<polyline points="${pts}" stroke="${col.dark}" stroke-width="${w+1.6}" fill="none" stroke-linejoin="round"/>`;
    g+=`<polyline points="${pts}" stroke="${col.shade}" stroke-width="${(w*.86).toFixed(1)}" fill="none" stroke-linejoin="round"/>`;
    const sp=w*.44, rx=w*.6, ry=w*.29; let grains='', shine='';
    const P=plen(R,w);
    for(let i=i0+1;i<=i1;i++){ const k0=Math.floor(P[i-1]/sp), k1=Math.floor(P[i]/sp); if(k0===k1) continue;
      const [tx,ty]=T[i-i0], ang=Math.atan2(ty,tx)*180/Math.PI+58, x=R.X[i].toFixed(1), y=R.Y[i].toFixed(1);
      const nx=-ty, ny=tx, lit=nx*LX+ny*LY;
      grains+=`<ellipse cx="${x}" cy="${y}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${ang.toFixed(0)} ${x} ${y})"/>`;
      const hx=(R.X[i]+nx*lit*w*.16-tx*1).toFixed(1), hy=(R.Y[i]+ny*lit*w*.16-ty*1).toFixed(1);
      shine+=`<ellipse cx="${hx}" cy="${hy}" rx="${(rx*.52).toFixed(1)}" ry="${(ry*.34).toFixed(1)}" transform="rotate(${ang.toFixed(0)} ${hx} ${hy})"/>`; }
    // pramenovi se režu obrisom užeta: na oštrim zavojima ne strše van
    const mid='knm'+(MID++);
    g+=`<mask id="${mid}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1000" height="800"><polyline points="${pts}" stroke="#fff" stroke-width="${(w+.6).toFixed(1)}" fill="none" stroke-linejoin="round"/></mask>`;
    g+=`<g mask="url(#${mid})"><g fill="${col.body}" stroke="${col.dark}" stroke-width=".9" stroke-opacity=".75">${grains}</g><g fill="${col.hi}" fill-opacity=".5">${shine}</g></g>`;
    g+=`<polyline points="${hl}" stroke="${col.hi}" stroke-width="${(w*.14).toFixed(1)}" stroke-opacity=".22" fill="none" stroke-linejoin="round"/>`;
    return g;
  }
  function tipG(R,n,col,w,moving){ // obrubljeni kraj užeta
    const m=Math.max(0,n-4); let tx=R.X[n]-R.X[m], ty=R.Y[n]-R.Y[m]; const l=Math.hypot(tx,ty)||1; tx/=l; ty/=l; const nx=-ty, ny=tx, x=R.X[n], y=R.Y[n];
    let g='';
    // obruč (whipping): bijela traka omotana oko kraja, s tamnim rubom i navojima konca
    const q=(d,s)=>[(x-tx*d+nx*w*s).toFixed(1),(y-ty*d+ny*w*s).toFixed(1)].join(',');
    g+=`<polygon points="${q(3,.53)} ${q(12,.53)} ${q(12,-.53)} ${q(3,-.53)}" fill="${col.whip}" stroke="${col.dark}" stroke-width=".9"/>`;
    for(let k=0;k<4;k++){ const d=4.6+k*2.1; g+=`<line x1="${q(d,.5).split(',')[0]}" y1="${q(d,.5).split(',')[1]}" x2="${q(d+.9,-.5).split(',')[0]}" y2="${q(d+.9,-.5).split(',')[1]}" stroke="#9a9a92" stroke-width=".7"/>`; }
    g+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(w*.5).toFixed(1)}" ry="${(w*.26).toFixed(1)}" transform="rotate(${(Math.atan2(ny,nx)*180/Math.PI).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${col.shade}" stroke="${col.dark}" stroke-width="1"/>`;
    if(moving) g+=`<path d="M${(x+tx*10+nx*6).toFixed(1)},${(y+ty*10+ny*6).toFixed(1)} L${(x+tx*17).toFixed(1)},${(y+ty*17).toFixed(1)} L${(x+tx*10-nx*6).toFixed(1)},${(y+ty*10-ny*6).toFixed(1)}" stroke="#ffd166" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    return g;
  }
  // indeks zadnje točke do duljine L
  const idxAt=(R,L)=>{ let lo=0,hi=R.S.length-1; while(lo<hi){ const m=(lo+hi+1)>>1; if(R.S[m]<=L) lo=m; else hi=m-1; } return lo; };
  let MID=0;
  function render(geo,Ls,moving){
    MID=(MID+1000)%1e9;
    const layers=[], zmin=Math.min(...geo.map(R=>Math.min(...R.Z)));
    let ground='';
    // mreža vidljivih točaka svih užeta: za „presjek“ (tamni rub oko gornjeg užeta samo gdje leži na donjem)
    const GR=12, grid=new Map();
    geo.forEach((R,ri)=>{ const n=idxAt(R,Ls[ri]), w=cur.ropes[ri].w; for(let i=0;i<=n;i+=2){ const k=Math.floor(R.X[i]/GR)+','+Math.floor(R.Y[i]/GR);
      let c=grid.get(k); if(!c) grid.set(k,c=[]); c.push([R.X[i],R.Y[i],R.Z[i],w,ri,R.S[i]]); } });
    const isOver=(x,y,z,w,ri,s)=>{ const cx=Math.floor(x/GR), cy=Math.floor(y/GR);
      for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++){ const c=grid.get((cx+dx)+','+(cy+dy)); if(!c) continue;
        for(const p of c){ if(p[2]>=z) continue; if(p[4]===ri && Math.abs(p[5]-s)<w*2) continue;
          if(Math.hypot(p[0]-x,p[1]-y)<(w+p[3])/2-1.5) return true; } } return false; };
    function contact(R,a,e,w,z,ri){ let g='', seg=[];
      const flush=()=>{ if(seg.length>1) g+=`<polyline points="${seg.join(' ')}" stroke="#07121d" stroke-opacity=".85" stroke-width="${w+5}" fill="none" stroke-linejoin="round" stroke-linecap="butt"/>`; seg=[]; };
      for(let i=a;i<=e;i++){ if(isOver(R.X[i],R.Y[i],z,w,ri,R.S[i])) seg.push(R.X[i].toFixed(1)+','+R.Y[i].toFixed(1)); else flush(); }
      flush(); return g; }
    geo.forEach((R,ri)=>{ const rope=cur.ropes[ri], col=COL[rope.c], n=idxAt(R,Ls[ri]); if(n<1) return;
      // početak izvan platna preskoči
      let s=0; while(s<n-2 && (R.X[s]<-40||R.X[s]>W+40||R.Y[s]<-40||R.Y[s]>H+40)) s++;
      let gp=''; for(let i=s;i<=n;i+=2) gp+=(R.X[i]+3).toFixed(1)+','+(R.Y[i]+4.5).toFixed(1)+' ';
      ground+=`<polyline points="${gp}" stroke="rgba(0,0,0,.22)" stroke-width="${rope.w+7}" fill="none" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${gp}" stroke="rgba(0,0,0,.2)" stroke-width="${rope.w+1}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
      // dijelovi po sloju (z) i maski; susjedni dijelovi istog sloja ne bacaju sjenu jedan na drugog
      const RS=[]; let i0=s;
      for(let i=s+1;i<=n+1;i++) if(i===n+1 || R.Z[i]!==R.Z[i0] || R.CL[i]!==R.CL[i0]){ RS.push([i0,i]); i0=i; }
      RS.forEach(([b0,b1],k)=>{ const a=Math.max(s,b0-2), e=Math.min(n,b1+1), z=R.Z[b0];
        const tA=k>0&&R.Z[RS[k-1][0]]===z?22:5, tB=k<RS.length-1&&R.Z[RS[k+1][0]]===z?22:5;
        let g=(z>zmin&&!R.CL[b0]?contact(R,a,e,rope.w,z,ri):'')+run(R,a,e,col,rope.w,z>zmin,tA,tB);
        // dio iza prečke/stupa: isti sloj, ali odrezan maskom predmeta (nema šava na prijelazu)
        if(R.CL[b0]) g=`<g clip-path="url(#${R.CL[b0]})">${g}</g>`;
        if(b1===n+1) g+=tipG(R,n,col,rope.w,moving);
        layers.push({z,g}); });
    });
    (cur.objs||[]).forEach(o=>layers.push({z:o.z,g:o.g,o:1}));
    layers.sort((a,c)=>a.z-c.z);
    const under=layers.filter(l=>l.o&&l.z<=0.5), rest=layers.filter(l=>!(l.o&&l.z<=0.5));
    return under.map(l=>l.g).join('')+ground+rest.map(l=>l.g).join('');
  }
  function ghost(geo,L0,L1){ // isprekidana putanja idućeg poteza
    let g='';
    geo.forEach((R,ri)=>{ if(L1[ri]-L0[ri]<4) return; const a=idxAt(R,L0[ri]), c=idxAt(R,L1[ri]); let p='';
      for(let i=a;i<=c;i+=2) p+=R.X[i].toFixed(1)+','+R.Y[i].toFixed(1)+' ';
      const m=Math.max(a,c-6), ang=Math.atan2(R.Y[c]-R.Y[m],R.X[c]-R.X[m])*180/Math.PI;
      g+=`<polyline points="${p}" stroke="#39b8e8" stroke-width="2.2" fill="none" stroke-dasharray="6 6" stroke-linecap="round" class="knGhost"/>
        <path d="M-7,-6 L2,0 L-7,6" transform="translate(${R.X[c].toFixed(1)},${R.Y[c].toFixed(1)}) rotate(${ang.toFixed(1)})" stroke="#39b8e8" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; });
    return g;
  }
  /* ── podloge (bitva, stup, prečka) ── */
  const POST=(x,y1,y2,r,z)=>({z,g:`<defs><linearGradient id="kpg" x1="0" x2="1"><stop offset="0" stop-color="#3b2b1c"/><stop offset=".35" stop-color="#8a6a48"/><stop offset=".6" stop-color="#6a4f33"/><stop offset="1" stop-color="#2a1e13"/></linearGradient></defs>
    <rect x="${x-r}" y="${y1}" width="${2*r}" height="${y2-y1}" fill="url(#kpg)"/><ellipse cx="${x}" cy="${y1}" rx="${r}" ry="${r*.32}" fill="#9b7b56" stroke="#2a1e13"/>`});
  const BAR=(y,x1,x2,r,z)=>({z,g:`<defs><clipPath id="kbarOut"><path clip-rule="evenodd" d="M-60,-60 H660 V480 H-60 Z M${x1},${y-r} H${x2} V${y+r} H${x1} Z"/></clipPath><linearGradient id="kbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8eef3"/><stop offset=".35" stop-color="#aab6c0"/><stop offset="1" stop-color="#46525c"/></linearGradient></defs>
    <rect x="${x1}" y="${y-r}" width="${x2-x1}" height="${2*r}" rx="${r}" fill="url(#kbg)" stroke="#2a343c"/>`});
  const CLEAT=(cx,cy,z)=>({z,g:`<defs><linearGradient id="kcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3e9ee"/><stop offset=".5" stop-color="#9aa7b2"/><stop offset="1" stop-color="#4a5660"/></linearGradient></defs>
    <path d="M${cx-150},${cy} C${cx-150},${cy-15} ${cx-126},${cy-18} ${cx-70},${cy-16} C${cx-34},${cy-15} ${cx+34},${cy-15} ${cx+70},${cy-16} C${cx+126},${cy-18} ${cx+150},${cy-15} ${cx+150},${cy} C${cx+150},${cy+15} ${cx+126},${cy+18} ${cx+70},${cy+16} C${cx+34},${cy+15} ${cx-34},${cy+15} ${cx-70},${cy+16} C${cx-126},${cy+18} ${cx-150},${cy+15} ${cx-150},${cy} Z" fill="url(#kcg)" stroke="#27313a" stroke-width="1.5"/>
    <circle cx="${cx-26}" cy="${cy}" r="4" fill="#5b6770"/><circle cx="${cx+26}" cy="${cy}" r="4" fill="#5b6770"/>`});
  const CLEATBASE=(cx,cy,z)=>({z,g:`<rect x="${cx-58}" y="${cy-24}" width="116" height="48" rx="10" fill="#39434c" stroke="#1d242a"/>`});

  /* ═══ ČVOROVI ═══
     z: veći broj = bliže gledatelju. Na svakom križanju dijel s većim z je IZNAD. */
  // zrcaljenje po vodoravnoj osi + zamjena iznad/ispod = isti čvor gledan s druge strane
  const flipY=(pieces,cy)=>pieces.map(([d,z])=>[d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,(m,x,y)=>`${x},${(2*cy-y).toFixed(1)}`),3-z]);
  const flipH=(hs,cy)=>hs.map(h=>({...h,y:2*cy-h.y}));

  const bowFinal=[
    ['M210,-20 L210,100 C210,125 222,145 245,165',1],
    ['M245,165 C270,188 318,192 332,160 C346,126 322,98 292,98 C272,98 258,110 250,122',1],
    ['M250,122 C244,132 236,144 224,156 C214,166 204,176 198,190',3],
    ['M198,190 C180,225 176,275 198,310 C222,348 300,346 322,308 C342,272 330,232 312,214',1],
    ['M312,214 C302,204 296,192 294,172',0],
    ['M294,172 C292,150 292,125 292,82',2],
    ['M292,82 C292,50 262,34 232,34 C212,34 190,40 188,56',0],
    ['M188,56 C187,72 200,78 222,80 C244,82 262,90 270,104 C274,112 268,124 266,140',2],
    ['M266,140 L266,168',2],
    ['M266,168 L265,196',0],
    ['M265,196 C264,212 262,226 258,238',1]
  ];

  // osmica
  const O8=[
    ['M-20,200 L320,200',1],
    ['M320,200 C352,200 372,178 372,150 C372,118 346,100 314,102 C286,104 268,124 266,152 L266,170',1],
    ['M266,170 L266,230',3],
    ['M266,230 C266,262 244,274 222,268 C200,262 194,240 198,222',1],
    ['M198,222 C200,212 202,200 206,188',0],
    ['M206,188 C214,162 232,148 250,147',1],
    ['M250,147 C262,146 274,148 286,154',3],
    ['M286,154 C296,160 302,170 303,184',2],
    ['M303,184 L304,216',0],
    ['M304,216 C305,232 308,246 314,258',1]
  ];

  // muški uzao: dvije petlje (uvoja) jedna iznad druge, pa složeni oblik
  const rfA0=[['M-20,300 L140,300 C190,300 215,275 240,258',2],['M240,258 C255,248 285,230 300,222',2],['M300,222 C318,212 312,194 294,190',1],['M294,190 C282,187 266,182 256,172',0]];
  const rfB0=[['M580,300 L410,300 C360,300 335,275 310,258',1],['M310,258 C295,248 265,230 250,222',0],['M250,222 C232,212 238,194 256,190',1],['M256,190 C268,187 284,182 294,172',2]];

  // zastavni uzao: simetrična omča debljeg konopa (U), tanji kroz nju, iza oba kraka, ispod sebe
  const SBk=[['M600,236 L330,236',2],['M330,236 L210,236 C190,236 174,220 174,200 C174,180 190,164 210,164',2],['M210,164 L400,164 C422,164 438,159 452,150',2]];
  const SBt=[['M-20,352 C80,346 196,330 224,296 C230,288 232,278 232,262',1],['M232,262 L232,222',1],['M232,222 L232,150',3],
    ['M232,150 C232,128 254,116 281,116 C308,116 330,128 330,150',3],['M330,150 L330,252',1],
    ['M330,252 C330,272 318,280 305,280 C292,280 280,272 280,252',1],['M280,252 L280,140',3],['M280,140 L280,100',1],
    ['M280,100 C280,78 262,68 238,66 C222,65 210,68 200,74',1]];

  // zavojnica oko okomitog stupa: x = cx + R·sin(φ), visina glatko po ključnim točkama
  const crom=(K,t)=>{ let i=0; while(i<K.length-2&&t>K[i+1][0]) i++;
    const p0=K[i-1]||K[i], p1=K[i], p2=K[i+1], p3=K[i+2]||K[i+1], h=p2[0]-p1[0], s=(t-p1[0])/h;
    const m1=(p2[1]-p0[1])/(p2[0]-p0[0]), m2=(p3[1]-p1[1])/(p3[0]-p1[0]);
    return (2*s*s*s-3*s*s+1)*p1[1]+(s*s*s-2*s*s+s)*h*m1+(-2*s*s*s+3*s*s)*p2[1]+(s*s*s-s*s)*h*m2; };
  const helix=(cx,R,K,a,b)=>{ let d=''; for(let f=a;;f+=3){ if(f>b) f=b; d+=(d?'L':'M')+(cx+R*Math.sin(f*Math.PI/180)).toFixed(1)+','+crom(K,f).toFixed(1); if(f===b) break; } return d; };
  // vrzni uzao (stup x=280, r=30): stojeći i kraj leže usporedno, kosi dio (križ) prelazi preko oba
  const CHK=[[-90,138],[0,138],[90,143],[200,176],[270,170],[360,131],[450,92],[540,86],[630,119],[720,124],[810,124]];
  const CH=[['M-20,138 L280,138',3],[helix(280,36,CHK,0,90),3],[helix(280,36,CHK,90,270),1],[helix(280,36,CHK,270,450),4],
    [helix(280,36,CHK,450,630),1],[helix(280,36,CHK,630,720),3],['M280,124 L400,127 C418,128 432,133 444,141',3]];

  // okret i dva poluuzla (prečka y=110, r=13; stojeći dio x=250): namotaji kao zavojnica, stražnji dio skriven iza prečke
  // zavojnica oko vodoravne prečke: prednji dio preko prečke, stražnji dio je maskiran prečkom (kbarOut)
  const hbar=(xa,p,cy,R,t0,t1)=>{ let d=''; for(let t=t0;;t+=Math.PI/48){ if(t>t1) t=t1;
      d+=(d?'L':'M')+(xa+p*t/(2*Math.PI)).toFixed(1)+','+(cy+R*Math.cos(t)).toFixed(1); if(t===t1) break; } return d; };
  const PI=Math.PI, RP=28, RXA=252-RP*.5/(2*PI), RY0=110+19*Math.cos(.5);
  const RT=[['M249,420 L249,152',3],[`M249,152 C249,142 ${(252-3.6).toFixed(1)},${(RY0+7.3).toFixed(1)} 252,${RY0.toFixed(1)}`,3],[hbar(RXA,RP,110,19,.5,PI),3],[hbar(RXA,RP,110,19,PI,2*PI),3,'kbarOut'],
    [hbar(RXA,RP,110,19,2*PI,3*PI),3],[hbar(RXA,RP,110,19,3*PI,4*PI),3,'kbarOut'],['M305.8,129 C310,129 312,138 312,150',3]];
  const HH1=[['M312,150 C313,170 300,184 292,192 C284,202 274,203 262,203',3.5],['M262,203 L238,203',1],
    ['M238,203 C220,203 210,196 210,184 C210,172 222,168 238,168',4],['M238,168 L262,168',4],['M262,168 L284,169',4],['M284,169 L322,176',3.2]];
  const HH2=[['M322,176 C338,180 346,196 340,214 C334,232 318,244 300,252 C290,256 276,258 262,258',3.5],['M262,258 L238,258',1],
    ['M238,258 C220,258 210,251 210,239 C210,227 222,223 238,223',4],['M238,223 L262,223',4],['M262,223 L320,224',4],['M320,224 L352,230',3.2],
    ['M352,230 C364,236 370,250 372,268',4]];

  // bitva, pogled odozgo (središte 280,190; rogovi x 130 do 430; z bitve=2, ispod roga=1)
  const CL={
    s:['M-20,360 C70,322 160,240 240,230 L320,229 C336,229 346,224 350,216',1],
    uR:['M350,216 C360,208 360,172 350,164',1],
    top:['M350,164 C344,156 334,153 320,153 L240,153 C226,153 216,156 210,164',1],
    uL:['M210,164 C200,172 200,208 210,216',1],
    bl:['M210,216 C214,222 222,224 230,220',1],
    d1:['M230,220 L330,160',3],
    tr:['M330,160 C350,146 386,142 402,152',3],
    uR2:['M402,152 C416,162 416,218 402,228',1],
    br:['M402,228 C386,238 352,236 330,222',3],
    d2:['M330,222 L230,160',4],
    lockA:['M230,160 C214,150 176,140 150,146',5],
    lockB:['M150,146 C126,152 112,170 112,190 C112,212 128,228 152,232',5],
    lockC:['M152,232 C176,236 196,228 206,216',5],
    tuck:['M206,216 C212,200 216,176 220,162',4.5],
    tail:['M220,162 C222,154 226,146 232,138',4.5]
  };
  const CLbase=[CL.s,CL.uR,CL.top,CL.uL,CL.bl,CL.d1,CL.tr,CL.uR2,CL.br,CL.d2];
  // zategnuto: petlja ide ISPOD roga, kraj leži preko bitve usporedno s prvim kosim dijelom i prolazi ispod drugog
  const CLtight=[...CLbase,['M230,160 C222,155 210,154 200,158',5],['M200,158 C194,164 192,176 192,190 C192,204 194,214 200,220',1],
    ['M200,220 C204,224 210,224 216,220',3.5],['M216,220 L262,188',3.5],['M262,188 L318,150',3.5]];

  const rfA=[...rfA0,['M256,172 C250,166 248,160 252,152',1],['M252,152 C262,142 285,128 300,122',0],['M300,122 C318,112 312,94 294,90',1],['M294,90 C282,87 266,82 256,72',2],['M256,72 C248,62 246,40 248,10',1]];
  const rfB=[...rfB0,['M294,172 C300,166 302,160 298,152',1],['M298,152 C288,142 265,128 250,122',2],['M250,122 C232,112 238,94 256,90',1],['M256,90 C268,87 284,82 294,72',0],['M294,72 C302,62 304,40 302,10',1]];

  const _sy=(p,k)=>p.map(([s,z])=>[s.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,(m,x,y)=>`${x},${(244+(y-244)*k).toFixed(1)}`),z]);
  const RA=_sy([['M-20,256 L240,256 C265,256 280,282 305,282',2],['M305,282 C345,282 372,270 372,244 C372,218 345,206 305,206',0],['M305,206 C280,206 265,232 240,232 L150,232 C125,232 108,224 96,212',2]],1.6);
  const RB=_sy([['M580,232 L350,232',1],['M350,232 L310,232 C285,232 270,206 245,206',1],['M245,206 C205,206 178,218 178,244 C178,270 205,282 245,282',1],['M245,282 C270,282 285,256 310,256 L350,256',1],['M350,256 L420,256 C444,256 460,264 472,276',1]],1.6);
  // sidreni uzao: puni okret (RT), kraj iza stojećeg dijela, pa ISPOD oba namotaja (iznad prečke), i poluuzao za osiguranje
  const AB1=[['M312,150 C313,168 304,180 292,185 C284,188 274,189 262,189',3.5],['M262,189 L238,189',1],
    ['M238,189 C218,189 204,174 204,152 C204,130 214,114 230,111',3.5],['M230,111 L326,111',2.5],['M326,111 C344,111 354,120 356,136',3.5]];
  const AB2=[['M356,136 C360,172 350,206 332,226 C318,241 290,250 262,250',3.5],['M262,250 L238,250',1],
    ['M238,250 C220,250 210,243 210,231 C210,219 222,215 238,215',4],['M238,215 L262,215',4],['M262,215 L312,216',4],['M312,216 L352,223',3.2],
    ['M352,223 C366,228 374,242 376,262',4]];
  // trubni uzao (margarita): tri usporedna dijela; labavo = ravni krajevi, zategnuto = petlja (poluuzao) preko svakog pregiba
  const SHmid=[['M230,176 L414,176 C432,176 438,182 438,188 C438,194 432,200 414,200',2],['M414,200 L146,200',2],
    ['M146,200 C128,200 122,206 122,212 C122,218 128,224 146,224',2],['M146,224 L330,224',2]];
  const SH0=[['M-20,176 L150,176',2],['M150,176 L170,176',2],['M170,176 L190,176',2],['M190,176 L210,176',2],['M210,176 L230,176',2],...SHmid,
    ['M330,224 L350,224',2],['M350,224 L370,224',2],['M370,224 L390,224',2],['M390,224 L410,224',2],['M410,224 L580,224',2]];
  const SH1=[['M-20,160 L140,160 C165,160 182,172 182,194',4],['M182,194 L182,228',4],['M182,228 C182,246 158,246 158,228',4],['M158,228 L158,194',0],
    ['M158,194 C158,180 168,176 184,176 L230,176',2],...SHmid,
    ['M330,224 L376,224 C392,224 402,220 402,206',2],['M402,206 L402,172',0],['M402,172 C402,154 378,154 378,172',4],['M378,172 L378,206',4],
    ['M378,206 C378,228 395,240 420,240 L580,240',4]];
  /* u: dokle je svako uže položeno (3.5 = do pola 4. dijela putanje; 99 = cijelo) */
  const KNOTS=[
  {id:'pasnjak',n:'Pašnjak',en:'bowline',tag:'Najčešće na ispitu',
   use:'Petlja na kraju konopa koja se <b>ne steže i ne klizi</b>. Spašavanje osobe iz mora (petlja ispod pazuha), privez na bitvu ili kolut, petlja za bacanje.',
   exam:'Ispitivač ti da konop i traži pašnjak. Veži ga mirno i reci za što služi.',
   check:'Petlja ne mijenja veličinu kad povučeš stojeći dio. Kratki kraj završava <b>unutar</b> velike petlje.',
   err:'U prvom koraku radni dio mora ići <b>preko</b> stojećeg. Ako omču napraviš obrnuto, nakon provlačenja ne dobiješ pašnjak.',
   ropes:[{c:'cream',w:14,g:bowFinal}], lab:[{t:'stojeći dio (prema teretu)',x:222,y:22}],
   steps:[
    {s:'Početak',t:'Lijevom rukom drži <b>stojeći dio</b> (ide gore, prema teretu). Desnom rukom vodiš <b>radni kraj</b>, s bijelim obručem (obrubom) na vrhu.',u:[0.55]},
    {s:'Mala omča, radni dio preko',t:'Na stojećem dijelu napravi <b>malu omču</b>, tako da radni dio prijeđe <b>PREKO</b> stojećeg. To je „rupa“.',u:[2.999],h:[{x:230,y:150,t:'radni dio iznad'}]},
    {s:'Velika petlja i kroz omču odozdo',t:'Kraj spusti dolje: tu nastaje <b>velika petlja</b> (njenu veličinu biraš sada). Zatim kraj provuci kroz malu omču <b>odozdo prema gore</b> („zec izlazi iz rupe“).',u:[5.999],h:[{x:294,y:184,t:'ulazi odozdo'},{x:292,y:98,t:'izlazi gore'}]},
    {s:'Iza stojećeg dijela',t:'Kraj obiđe <b>iza stojećeg dijela</b> („zec obilazi drvo“).',u:[6.999],h:[{x:210,y:36,t:'iza'}]},
    {s:'Natrag kroz istu omču',t:'Kraj se vrati <b>natrag kroz istu malu omču</b>, odozgo prema dolje („zec se vraća u rupu“). Završi unutar velike petlje, uz njen lijevi krak.',u:[99],h:[{x:268,y:104,t:'ulazi odozgo'},{x:266,y:180,t:'izlazi dolje'}]},
    {s:'Zategni',t:'Zategni: kraj i krak petlje uz njega drži zajedno u jednoj ruci, drugom povuci stojeći dio.',u:[99],tight:[252,128,112,.26]}
   ]},

  {id:'osmica',n:'Osmica',en:'figure-eight',tag:'Stoper',
   use:'Čvor na <b>kraju konopa</b> da ne izleti kroz koloturnik, kroz oko ili kroz ruke. Stavlja se na krajeve škota i konopa za vezanje.',
   check:'Gotov čvor izgleda kao <b>broj 8</b>. Lako se odveže i nakon jakog opterećenja.',
   err:'Ako preskočiš obilazak iza stojećeg dijela, dobiješ obični jednostruki čvor. On se pod teretom zategne toliko da se teško odveže.',
   ropes:[{c:'cream',w:14,g:O8}], lab:[{t:'stojeći dio',x:20,y:184}],
   steps:[
    {s:'Početak',t:'Stojeći dio je lijevo, radni kraj ti je u desnoj ruci.',u:[0.72]},
    {s:'Omča preko stojećeg',t:'Kraj savij natrag u omču i položi ga <b>preko</b> stojećeg dijela.',u:[2.999],h:[{x:266,y:200,t:'preko'}]},
    {s:'Iza stojećeg dijela',t:'Kraj obiđe <b>iza stojećeg dijela</b>.',u:[4.999],h:[{x:202,y:200,t:'iza'}]},
    {s:'Kroz omču sprijeda',t:'Kraj provuci <b>kroz omču sprijeda</b>: preko njenog kraka, pa ispod stojećeg dijela.',u:[99],h:[{x:266,y:148,t:'preko'},{x:304,y:200,t:'ispod'}]},
    {s:'Zategni',t:'Zategni oba kraja. Gledaj oblik: to je osmica.',u:[99],tight:[272,196,110,.24]}
   ]},

  {id:'muski',n:'Muški uzao',en:'reef knot',tag:'Spajanje iste debljine',
   use:'Spajanje <b>dvaju konopa jednake debljine</b> (ili dvaju krajeva istog konopa, npr. vezanje jedra ili vreće).',
   exam:'Brzo pravilo: <b>lijevi preko desnog i ispod, pa desni preko lijevog i ispod</b>. Ovdje ga vežeš provlačenjem da vidiš kako je građen: rezultat je isti čvor.',
   check:'Svaki konop stvara „U“ koji obuhvaća drugi. Oba kraja istog konopa izlaze <b>s iste strane</b>, uz svoj stojeći dio, i čvor leži ravno.',
   err:'Ako krajevi izađu na suprotne strane ili se čvor iskrivi, dobio si <b>babski čvor</b> (granny). On klizi i nije siguran. Muški nije za teret koji visi ni za konope različite debljine.',
   ropes:[{c:'cream',w:13,g:RA,tip:'kraj A'},{c:'blue',w:13,g:RB,tip:'kraj B',tipDy:-30}],
   steps:[
    {s:'Početak',t:'Konop A (svijetli) dolazi slijeva, konop B (plavi) zdesna.',u:[0.55,0.45]},
    {s:'A u omču (U)',t:'Kraj A savij natrag u <b>omču oblika U</b>: kraj se vraća lijevo, uz svoj stojeći dio.',u:[99,0.45]},
    {s:'B preko luka omče A',t:'Kraj B uvedi u omču A <b>preko njenog luka</b>.',u:[99,0.999],h:[{x:372,y:225,t:'B preko luka'}]},
    {s:'B ispod oba kraka A',t:'Kraj B obiđe <b>ispod oba kraka</b> konopa A i okrene se natrag.',u:[99,2.999],h:[{x:178,y:225,t:'ispod'},{x:178,y:263,t:'ispod'}]},
    {s:'B natrag preko luka',t:'Kraj B izađe <b>opet preko luka</b> omče A i legne uz svoj stojeći dio.',u:[99,99],h:[{x:372,y:263,t:'B preko luka'}]},
    {s:'Zategni',t:'Zategni povlačeći oba stojeća dijela. Dva „U“ su se obuhvatila, krajevi leže uz svoje stojeće dijelove.',u:[99,99],tight:[275,244,150,.16]}
   ]},

  {id:'zastavni',n:'Zastavni uzao',en:'sheet bend',tag:'Različite debljine',
   use:'Spajanje <b>dvaju konopa različite debljine</b>. Deblji konop stvara omču (U), tanji se oko nje veže.',
   check:'Oba kratka kraja izlaze <b>s iste strane</b> čvora (ovdje oba gore). Tanki konop steže oba kraka omče debljeg konopa, a omča debljeg obuhvaća tanki.',
   err:'Ako tanki kraj provučeš preko sebe umjesto ispod, čvor se raspada pod opterećenjem. Omču uvijek radi od <b>debljeg</b> konopa.',
   ropes:[{c:'orange',w:10,g:SBt,tip:'tanki kraj'},{c:'blue',w:17,g:SBk,tip:null}], lab:[{t:'deblji konop',x:420,y:262},{t:'tanji konop',x:20,y:330}],
   steps:[
    {s:'Omča od debljeg konopa',t:'Deblji konop (plavi) savij u omču oblika „U“. Tanji (narančasti) dolazi odozdo.',u:[0.7,99]},
    {s:'Tanji kroz omču odozdo',t:'Tanji kraj provuci <b>kroz omču debljeg, odozdo prema gore</b>: ispod donjeg kraka, preko gornjeg.',u:[2.999,99],h:[{x:232,y:236,t:'ispod'},{x:232,y:164,t:'preko'}]},
    {s:'Iza oba kraka',t:'Tankim krajem obiđi <b>iza oba kraka</b> debljeg konopa.',u:[5.999,99],h:[{x:330,y:164,t:'iza'},{x:330,y:236,t:'iza'}]},
    {s:'Preko, pa ispod samog sebe',t:'Kraj se vrati <b>sprijeda, preko oba kraka</b>, pa ga provuci <b>ispod samog sebe</b> (ispod svog luka, ne ispod debljeg konopa).',u:[99,99],h:[{x:280,y:200,t:'preko'},{x:280,y:116,t:'ispod sebe'}]},
    {s:'Zategni',t:'Zategni. Provjeri: oba kratka kraja su s iste strane.',u:[99,99],tight:[270,200,120,.18]}
   ]},

  {id:'vrzni',n:'Vrzni uzao',en:'clove hitch',tag:'Na stup ili bitvu',
   use:'Brzo vezanje za <b>stup, bitvu, prečku ili ogradu</b>. Npr. bokobran na ogradu. Lako se veže i odvezuje.',
   check:'Sprijeda se vidi <b>kosi dio</b> koji prelazi preko dva usporedna dijela: stojećeg i kraja. Krajevi izlaze na suprotne strane.',
   err:'Ako drugi namotaj ide u suprotnom smjeru, dobiješ čvor koji se odmota. Kad se smjer vuče mijenja (ljuljanje broda), vrzni može popustiti: za dugi privez dodaj poluuzao.',
   ropes:[{c:'cream',w:12,g:CH}], objs:[POST(280,40,352,30,2)], lab:[{t:'stojeći dio',x:20,y:124}],
   steps:[
    {s:'Početak',t:'Konop dolazi s lijeve strane prema stupu.',u:[0.8]},
    {s:'Oko stupa',t:'Kraj vodi <b>ispred stupa</b>, oko desnog ruba i <b>iza</b>. Izlazi na lijevom rubu, malo niže.',u:[2.999],h:[{x:262,y:138,t:'ispred'}]},
    {s:'Koso preko stojećeg',t:'Kraj ide <b>koso prema gore, preko stojećeg dijela</b>.',u:[3.999],h:[{x:270,y:138,t:'preko'}]},
    {s:'Još jednom oko stupa',t:'Obiđi stup <b>još jednom, u istom smjeru</b> (iza stupa), iznad prvog namotaja.',u:[4.999]},
    {s:'Ispod križa',t:'Kraj provuci <b>ispod kosog dijela</b>. Stojeći dio i kraj sad leže jedan uz drugi i izlaze na suprotne strane.',u:[99],h:[{x:284,y:124,t:'ispod križa'}]},
    {s:'Zategni',t:'Zategni oba kraja.',u:[99],tight:[280,131,85,.12]}
   ]},

  {id:'bitva',n:'Vezanje na bitvu',en:'cleat hitch',tag:'Privez',
   use:'Privez konopa na <b>bitvu</b> (rogati okov na palubi ili rivi). Drži jako, a odvezuje se jednim potezom i pod opterećenjem.',
   check:'Jedan puni okret oko podnožja, jedna osmica preko rogova (na vrhu se vidi <b>križ</b>), jedna zaključna petlja. Odozgo: <b>dvije usporedne crte i jedna preko njih</b>.',
   err:'Nemoj namotavati više osmica i petlji: bitva se tada ne može brzo odvezati. Konop prvo vodi prema <b>daljem rogu</b>, gledano od tereta.',
   ropes:[{c:'cream',w:12,tipDy:-34,tipDx:40,g:[...CLbase,CL.lockA,CL.lockB,CL.lockC,CL.tuck,CL.tail],gt:CLtight}], objs:[CLEATBASE(280,190,0),CLEAT(280,190,2)], lab:[{t:'prema brodu (teret)',x:16,y:350}],
   steps:[
    {s:'Prilaz bitvi',t:'Pogled odozgo. Konop dolazi od broda prema bitvi.',u:[0.8]},
    {s:'Puni okret oko podnožja',t:'Vodi konop <b>prema daljem rogu</b> i napravi <b>puni okret oko podnožja</b>, ispod oba roga.',u:[3.999],h:[{x:356,y:190,t:'ispod roga',side:'r'},{x:204,y:190,t:'ispod roga',side:'l'}]},
    {s:'Koso preko bitve',t:'Prijeđi <b>koso preko</b> bitve i provuci konop ispod suprotnog roga.',u:[7.999],h:[{x:280,y:190,t:'preko'}]},
    {s:'Koso natrag: križ',t:'Vrati se <b>koso preko</b> u drugom smjeru: na vrhu nastaje <b>križ</b> (osmica).',u:[9.999],h:[{x:280,y:190,t:'križ'}]},
    {s:'Zaključna petlja',t:'Zaključna petlja: napravi petlju tako da je kraj <b>ispod</b>, preokreni je i natakni na rog.',u:[99],h:[{x:222,y:170,t:'kraj ispod petlje'}]},
    {s:'Zategni',t:'Povuci kraj. Petlja sjedne <b>pod rog</b>, a kraj ostane ukliješten <b>ispod zadnjeg kosog dijela</b>, usporedno s prvim. Gotova bitva: dvije usporedne crte i jedna preko njih.',u:[99],tight:true,h:[{x:268,y:184,t:'kraj ispod'}]}
   ]},

  {id:'poluuzli',n:'Okret i dva poluuzla',en:'round turn & two half hitches',tag:'Kolut, prsten, ograda',
   use:'Privez za <b>kolut, prsten, plutaču ili ogradu</b>. Puni okret preuzima teret, poluuzli ga samo osiguravaju. Može se odvezati i pod opterećenjem.',
   check:'Oko prečke su <b>dva puna namotaja</b>. Oba poluuzla idu <b>u istom smjeru</b> (zajedno čine vrzni uzao oko stojećeg dijela).',
   err:'Poluuzli u suprotnim smjerovima se odmotavaju. Samo jedan namotaj oko prečke se trlja i troši konop.',
   ropes:[{c:'cream',w:12,g:[...RT,...HH1,...HH2]}], objs:[BAR(110,40,520,13,2)], lab:[{t:'stojeći dio (teret)',x:258,y:370}],
   steps:[
    {s:'Početak',t:'Stojeći dio ide dolje prema teretu, kraj dovedeš do prečke.',u:[0.8]},
    {s:'Puni okret',t:'Kraj <b>dvaput obiđe prečku</b>: to je puni okret.',u:[6.999],h:[{x:278,y:110,t:'2 namotaja'}]},
    {s:'Prvi poluuzao',t:'Prvi poluuzao: kraj obiđe <b>iza stojećeg dijela</b> i vrati se <b>preko</b> njega.',u:[10.999],h:[{x:250,y:203,t:'iza'},{x:250,y:168,t:'preko'}]},
    {s:'Ispod samog sebe',t:'... pa ga provuci <b>ispod samog sebe</b>. Prvi poluuzao je gotov.',u:[12.999],h:[{x:309,y:172,t:'ispod sebe'}]},
    {s:'Drugi poluuzao',t:'Drugi poluuzao <b>u istom smjeru</b>: iza stojećeg, preko njega, ispod sebe.',u:[99],h:[{x:337,y:227,t:'ispod sebe'}]},
    {s:'Zategni',t:'Zategni i pogurni poluuzle do okreta.',u:[99],tight:[262,200,80,.12]}
   ]},

  {id:'sidreni',n:'Sidreni uzao',en:'anchor bend',tag:'Konop na sidro',
   use:'Vezanje sidrenog konopa za <b>prsten sidra</b> ili za plutaču, kad veza ostaje dugo pod teretom i u moru. Sigurniji je od okreta s dva poluuzla jer namotaji sami stežu kraj.',
   check:'Oko prstena su <b>dva namotaja</b>, a kraj prolazi <b>ispod oba</b>, između konopa i prstena. Na stojećem dijelu je još jedan poluuzao.',
   err:'Ako kraj provučeš samo ispod jednog namotaja ili ga uopće ne provučeš, dobio si običan okret s poluuzlom, koji se na sidru s vremenom razlabavi. Na sidru kraj još osiguraj tankim konopom.',
   ropes:[{c:'cream',w:12,g:[...RT,...AB1,...AB2]}], objs:[BAR(110,40,520,13,2)], lab:[{t:'stojeći dio (prema brodici)',x:258,y:370},{t:'prsten sidra (ovdje prečka)',x:384,y:92}],
   steps:[
    {s:'Početak',t:'Stojeći dio ide dolje prema brodici. Kraj dovedeš do prstena sidra, koji je ovdje nacrtan kao prečka.',u:[0.8]},
    {s:'Puni okret',t:'Kraj <b>dvaput obiđe prsten</b>. Namotaje ostavi labave, trebat će ti prostor ispod njih.',u:[6.999],h:[{x:278,y:110,t:'2 namotaja'}]},
    {s:'Iza stojećeg dijela',t:'Kraj vodi <b>iza stojećeg dijela</b> i podigni ga do prstena, lijevo od namotaja.',u:[9.999],h:[{x:250,y:189,t:'iza'}]},
    {s:'Ispod oba namotaja',t:'Provuci kraj <b>ispod oba namotaja</b>, između konopa i prstena. Po ovome se sidreni uzao razlikuje od okreta s poluuzlima.',u:[11.999],h:[{x:273,y:111,t:'ispod oba namotaja'}]},
    {s:'Poluuzao za osiguranje',t:'Na stojećem dijelu veži <b>jedan poluuzao</b>: iza stojećeg dijela, preko njega, pa ispod samog sebe.',u:[99],h:[{x:333,y:219,t:'ispod sebe'}]},
    {s:'Zategni',t:'Zategni namotaje i pogurni poluuzao do njih. Što jače sidro vuče, namotaji jače drže kraj.',u:[99],tight:[262,205,80,.12]}
   ]},

  {id:'trubni',n:'Trubni uzao',en:'sheepshank',tag:'Skraćivanje konopa',
   use:'Zove se i <b>margarita</b>. Skraćuje predug konop bez rezanja. Njime se može i premostiti oštećeno mjesto na konopu: ono mora doći u <b>srednji</b> od tri dijela.',
   check:'Tri usporedna dijela, a na svakom kraju <b>petlja koja steže pregib</b>. Vrh svakog pregiba viri kroz svoju petlju.',
   err:'Drži samo dok je konop <b>napet</b>. Kad teret popusti, petlje skliznu s pregiba i uzao se raspadne. Nije za trajan privez.',
   ropes:[{c:'cream',w:11,g:SH0,gt:SH1,tip:null}], lab:[{t:'prema teretu',x:16,y:150},{t:'prema teretu',x:470,y:270}],
   steps:[
    {s:'Predug konop',t:'Konop je napet između dvije točke, a predug je. Uhvati ga na mjestu koje želiš skratiti.',u:[4.6]},
    {s:'Prvi pregib',t:'Presavij konop natrag: nastaje <b>desni pregib</b>.',u:[6.999],h:[{x:436,y:188,t:'pregib',side:'r'}]},
    {s:'Drugi pregib: slovo S',t:'Presavij ga još jednom, u suprotnom smjeru. Imaš <b>tri usporedna dijela</b> i po jedan pregib na svakoj strani.',u:[99],h:[{x:124,y:212,t:'pregib',side:'l'}]},
    {s:'Petlja na svaki pregib',t:'Na konopu koji ulazi u čvor napravi <b>malu petlju</b> (poluuzao) i natakni je na pregib. Isto ponovi na drugoj strani. Zategni povlačeći oba kraja: petlje stegnu pregibe.',u:[99],tight:true,h:[{x:170,y:240,t:'petlja oko pregiba'},{x:390,y:160,t:'petlja oko pregiba'}]}
   ]}
  ];
  KNOTS.forEach(k=>{ if(!k.flip) return;
    k.ropes.forEach(r=>r.g=flipY(r.g,k.flip));
    k.steps.forEach(f=>{ if(f.h) f.h=flipH(f.h,k.flip); if(f.tight) f.tight=[f.tight[0],2*k.flip-f.tight[1],f.tight[2],f.tight[3]]; });
  });

  /* ── UI ── */
  let cur=null, step=0, Ls=[], tk=0, anim=null, playing=false, playT=null, speed=1;
  b.innerHTML=`<div class="knTabs" role="tablist"></div>
   <div class="knStage">
     <div class="knHead"><div><span class="knName"></span><span class="knEn"></span></div><span class="knTag"></span></div>
     <svg class="knSvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Animacija vezanja čvora"><defs>
       <radialGradient id="knBg" cx=".5" cy=".42" r=".8"><stop offset="0" stop-color="#1a3144"/><stop offset="1" stop-color="#0a1522"/></radialGradient>
       <pattern id="knGrain" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M0,30 C40,26 80,34 120,30 M0,78 C40,74 80,84 120,78" stroke="#ffffff" stroke-opacity=".025" stroke-width="10" fill="none"/></pattern></defs>
       <rect width="${W}" height="${H}" fill="url(#knBg)"/><rect width="${W}" height="${H}" fill="url(#knGrain)"/>
       <g class="knGlow"></g><g class="knRope"></g><g class="knGh"></g><g class="knHint"></g></svg>
     <label class="knScrub"><span>Povuci i veži sam</span><input type="range" min="0" max="100" step="1" value="0" aria-label="Tijek vezanja: povuci da provlačiš konop"></label>
     <div class="knCtl">
       <button class="btn" data-a="first" title="Početak" aria-label="Na početak">Početak</button>
       <button class="btn" data-a="prev">Nazad</button>
       <button class="btn p" data-a="play">Reproduciraj</button>
       <button class="btn" data-a="next">Dalje</button>
       <label class="knSpd">Brzina <select><option value="0.55">sporo</option><option value="1" selected>normalno</option><option value="1.7">brzo</option></select></label>
     </div>
     <div class="knProg"></div>
     <p class="knLegend">Žuti trag je potez ovog koraka, plava crtkana crta sljedeći potez. Na križanju je gore onaj konop koji baca sjenu na drugi.</p>
   </div>
   <div class="knSide">
     <div class="knStepTxt" aria-live="polite"></div>
     <ol class="knSteps"></ol>
     <div class="knInfo"></div>
   </div>`;
  const svg=$('.knSvg',b), gR=$('.knRope',b), gH=$('.knHint',b), gG=$('.knGh',b), gW=$('.knGlow',b), scrub=$('.knScrub input',b);
  $('.knTabs',b).innerHTML=KNOTS.map(k=>`<button class="knTab" role="tab" data-id="${k.id}">${k.n}<small>${k.en}</small></button>`).join('');

  function prep(k){ if(k._R) return; k._R=k.ropes.map(r=>dense(r.g,r.gt));
    const tf=k.steps.find(s=>s.tight); if(tf) k._T=k._R.map((R,i)=>k.ropes[i].gt?denseLike(k.ropes[i].gt,R):Array.isArray(tf.tight)?tighten(R,...tf.tight):R); }
  const target=i=>cur.steps[i].u.map((u,ri)=>lenAt(cur._R[ri],u));
  const tkOf=i=>cur.steps[i].tight?1:0;
  const geoNow=()=>tk>0&&cur._T?cur._R.map((R,i)=>mix(R,cur._T[i],tk)):cur._R;
  function labels(geo){ let g='';
    (cur.lab||[]).forEach(l=> g+=`<text x="${l.x}" y="${l.y}" font-size="12" fill="#9fb6c9" paint-order="stroke" stroke="#0a1522" stroke-width="4">${l.t}</text>`);
    geo.forEach((R,ri)=>{ const lb=cur.ropes[ri].tip; if(lb===null) return; const n=idxAt(R,Ls[ri]); if(n<1) return;
      const rp=cur.ropes[ri]; g+=`<text x="${(R.X[n]-14+(rp.tipDx||0)).toFixed(1)}" y="${(R.Y[n]+20+(rp.tipDy||0)).toFixed(1)}" text-anchor="end" font-size="11.5" fill="#ffb4a8" font-weight="600" paint-order="stroke" stroke="#0a1522" stroke-width="4">${lb||'radni kraj'}</text>`; });
    return g; }
  function paint(moving){ const geo=geoNow(); gR.innerHTML=render(geo,Ls,moving)+labels(geo); }
  function idle(){ // savjeti i isprekidani prikaz idućeg poteza
    const f=cur.steps[step]; let g='';
    (f.h||[]).forEach(h=>{ const r=h.side?h.side==="l":h.x>W*.6, lx=h.x+(r?-20:20);
      g+=`<g class="knH"><circle cx="${h.x}" cy="${h.y}" r="11" fill="none" stroke="#ffd166" stroke-width="2.2"/>
        <line x1="${h.x+(r?-11:11)}" y1="${h.y}" x2="${lx}" y2="${h.y}" stroke="#ffd166" stroke-width="1.6"/>
        <text x="${lx+(r?-4:4)}" y="${h.y+4}" font-size="13" font-weight="600" fill="#ffd166" text-anchor="${r?'end':'start'}" paint-order="stroke" stroke="#0a1522" stroke-width="4">${h.t}</text></g>`; });
    gH.innerHTML=g;
    gG.innerHTML=step<cur.steps.length-1&&!cur.steps[step+1].tight?ghost(geoNow(),Ls,target(step+1)):'';
    gW.innerHTML=step>0&&!f.tight?glow(geoNow(),target(step-1),Ls):'';
    scrub.max=(cur.steps.length-1)*100; scrub.value=step*100;
  }
  function glow(geo,L0,L1){ let g='';
    geo.forEach((R,ri)=>{ if(L1[ri]-L0[ri]<4) return; const a=idxAt(R,L0[ri]), c=idxAt(R,L1[ri]); let p='';
      for(let i=a;i<=c;i+=2) p+=R.X[i].toFixed(1)+','+R.Y[i].toFixed(1)+' ';
      g+=`<polyline data-keep-dark="1" points="${p}" stroke="#ffb703" stroke-opacity=".75" stroke-width="${cur.ropes[ri].w+13}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`; });
    return g; }
  // ručno provlačenje: p = korak + udio puta do sljedećeg koraka
  function setPos(p){ const n=cur.steps.length-1, i=Math.min(n,Math.floor(p)), f=i<n?p-i:0, A=target(i), B=i<n?target(i+1):A;
    if(anim){ cancelAnimationFrame(anim); anim=null; } playing=false; clearTimeout(playT);
    Ls=A.map((a,k)=>a+(B[k]-a)*f); tk=tkOf(i)+((i<n?tkOf(i+1):tkOf(i))-tkOf(i))*f;
    if(i!==step){ step=i; ui(); }
    if(f<.005){ paint(false); idle(); return; }
    paint(B.some((v,k)=>v!==A[k])); gH.innerHTML=''; gW.innerHTML=''; gG.innerHTML=cur.steps[i+1].tight?'':ghost(geoNow(),Ls,B); }
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  function go(k,instant){
    k=Math.max(0,Math.min(cur.steps.length-1,k));
    const L0=Ls.slice(), L1=target(k), t0k=tk, t1k=tkOf(k), k0=step;
    step=k; ui(); gH.innerHTML=''; gG.innerHTML=''; gW.innerHTML='';
    if(anim) cancelAnimationFrame(anim);
    const dist=Math.max(...L1.map((v,i)=>Math.abs(v-(L0[i]??v))));
    if(instant||RM||(!dist&&t0k===t1k)){ Ls=L1; tk=t1k; paint(false); idle(); if(playing) schedule(); return; }
    // zatezanje: kratko i mekano (400 ms, ease-out); provlačenje: prema duljini puta
    const tight=t0k!==t1k&&!dist, dur=(tight?400:Math.min(4200,Math.max(700,dist*7+(t0k!==t1k?900:0))))/speed, st=performance.now();
    const tick=now=>{ const t=Math.min(1,(now-st)/dur), e=tight?1-Math.pow(1-t,3):ease(t);
      Ls=L0.map((a,i)=>a+(L1[i]-a)*e); tk=t0k+(t1k-t0k)*e; paint(t<1&&dist>0); scrub.value=(k0+(k-k0)*e)*100;
      if(t<1) anim=requestAnimationFrame(tick); else { anim=null; Ls=L1; tk=t1k; paint(false); idle(); if(playing) schedule(); } };
    anim=requestAnimationFrame(tick);
    if(k===cur.steps.length-1 && window.VB) VB.add(5,'knot_'+cur.id);
  }
  function schedule(){ clearTimeout(playT);
    if(step>=cur.steps.length-1){ playing=false; ui(); return; }
    playT=setTimeout(()=>go(step+1),1900/speed); }
  function ui(){
    $$('.knTab',b).forEach(t=>{ const on=t.dataset.id===cur.id; t.classList.toggle('on',on); t.setAttribute('aria-selected',on); });
    $('.knName',b).textContent=cur.n; $('.knEn',b).textContent=cur.en; $('.knTag',b).textContent=cur.tag||'';
    $('.knStepTxt',b).innerHTML=`<span>Korak ${step+1} / ${cur.steps.length}</span>${cur.steps[step].t}`;
    $('.knSteps',b).innerHTML=cur.steps.map((f,i)=>`<li class="${i===step?'on':i<step?'done':''}" data-i="${i}">${f.s}</li>`).join('');
    $('.knProg',b).innerHTML=cur.steps.map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('');
    $('[data-a=play]',b).textContent=playing?'Pauza':(step>=cur.steps.length-1?'Ponovi':'Reproduciraj');
    $('[data-a=prev]',b).disabled=step===0; $('[data-a=next]',b).disabled=step>=cur.steps.length-1;
    $('.knInfo',b).innerHTML=`<div class="knI"><h5>Za što služi</h5>${cur.use}</div>
      <div class="knI"><h5>Provjera</h5>${cur.check}</div><div class="knI warnI"><h5>Česta greška</h5>${cur.err}</div>
      ${cur.exam?`<div class="knI"><h5>Na ispitu</h5>${cur.exam}</div>`:''}`;
  }
  function select(id){
    cur=KNOTS.find(k=>k.id===id)||KNOTS[0]; prep(cur);
    playing=false; clearTimeout(playT); if(anim) cancelAnimationFrame(anim);
    step=0; Ls=target(0); tk=0; ui(); paint(false); idle();
  }
  $('.knTabs',b).addEventListener('click',e=>{ const t=e.target.closest('.knTab'); if(t) select(t.dataset.id); });
  $('.knSteps',b).addEventListener('click',e=>{ const li=e.target.closest('li'); if(li){ playing=false; clearTimeout(playT); go(+li.dataset.i); }});
  $('.knCtl',b).addEventListener('click',e=>{
    const a=e.target.closest('button')?.dataset.a; if(!a) return;
    if(a!=='play'){ playing=false; clearTimeout(playT); }
    if(a==='first') go(0); if(a==='prev') go(step-1); if(a==='next') go(step+1);
    if(a==='play'){
      if(playing){ playing=false; clearTimeout(playT); ui(); return; }
      playing=true;
      if(step>=cur.steps.length-1) go(0,true); else { ui(); go(step+1); }
    }
  });
  $('.knSpd select',b).addEventListener('change',e=>speed=+e.target.value);
  scrub.addEventListener('input',()=>setPos(scrub.value/100));
  svg.setAttribute('tabindex','0');
  svg.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'){go(step+1);e.preventDefault();} if(e.key==='ArrowLeft'){go(step-1);e.preventDefault();} });
  window.__KN={KNOTS,select,go};
  select('pasnjak');
})();
