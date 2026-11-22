"use strict";
/* Radni stol: šestar, trokuti, put-brzina-vrijeme, pozicija iz dva azimuta. */
/* ═══════════════ NAV LAB (šestar, trokuti, put-brzina-vrijeme, pozicija) ═══════════════ */
/* Vježbovna Merkatorova karta: 43°20'–43°30' N, 16°20'–16°40' E.
   1' širine = 32 px = 1 M. 1' dužine = 32·cos(43,42°) px. Kursevi i azimuti su pravi (prema sjeveru karte). */
(function(){
  const b=el('navLab'); if(!b) return;
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const K=32, KX=K*Math.cos(43.417*Math.PI/180), X0=64, Y0=42, NLON=20, NLAT=10;
  const W=X0*2+NLON*KX, H=Y0*2+NLAT*K;
  const px=(lo,la)=>[X0+lo*KX, Y0+(NLAT-la)*K];
  const ll=(x,y)=>[(x-X0)/KX, NLAT-(y-Y0)/K];
  const fmtLat=la=>`43° ${(20+la).toFixed(1).replace('.',',')}' N`;
  const fmtLon=lo=>`16° ${(20+lo).toFixed(1).replace('.',',')}' E`;
  const f1=v=>v.toFixed(1).replace('.',',');
  const pad3=v=>String(Math.round(v)%360).padStart(3,'0');

  /* kopno (u minutama: [dužina, širina] od 16°20' E / 43°20' N) */
  const LAND=[
    [[-1,10.6],[-1,8.6],[1.5,8.95],[3,8.35],[4.2,8.85],[6,8.55],[7.1,7.7],[7.55,7.35],[8.1,7.55],[8.6,8.4],[9.6,8.75],[11,8.9],[13,8.35],[15,8.85],[17,8.5],[19,9.05],[21,8.9],[21,10.6]],
    [[2,3.65],[2.6,4.2],[3.4,4.5],[5,4.85],[7,4.65],[9,4.25],[10.2,3.65],[9.6,3.05],[7.5,2.9],[5.5,3.15],[3.5,2.9],[2.4,3.15]],
    [[15.2,5.65],[15.8,6.05],[16.4,6.1],[17,5.6],[16.7,4.95],[15.9,4.85],[15.35,5.1]]
  ];
  const MARKS=[
    {id:'vela',n:'svjetionik Vela',s:'Bl 5s',p:[2,3.65]},
    {id:'zvonik',n:'zvonik na rtu',s:'',p:[7.8,7.85]},
    {id:'mali',n:'svjetionik Mali',s:'Bl(2) 6s',p:[16.4,6.1]}
  ];
  const ROSE={lo:15.4,la:2.1,r:56};
  const RC=px(ROSE.lo,ROSE.la);
  function inPoly(p,poly){ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i],d=poly[j];
    if((a[1]>p[1])!==(d[1]>p[1]) && p[0]<(d[0]-a[0])*(p[1]-a[1])/(d[1]-a[1])+a[0]) c=!c; } return c; }
  const onLand=(lo,la)=>LAND.some(P=>inPoly([lo,la],P));
  const wet=(lo,la,m=0.45)=>{ for(let a=0;a<8;a++){ const q=a*Math.PI/4; if(onLand(lo+Math.cos(q)*m/.73,la+Math.sin(q)*m)) return false; } return !onLand(lo,la); };
  const clearPath=(A,B)=>{ for(let i=0;i<=40;i++){ const t=i/40; if(!wet(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,.3)) return false; } return true; };
  const nearRose=(lo,la)=>{ const p=px(lo,la); return Math.hypot(p[0]-RC[0],p[1]-RC[1])<ROSE.r+14; };
  function randWater(){ for(let k=0;k<400;k++){ const lo=1+Math.random()*18, la=.6+Math.random()*7.4;
      if(wet(lo,la) && !nearRose(lo,la)) return [lo,la]; } return [12,1.5]; }
  // udaljenost u M i kurs između točaka u px
  const distM=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1])/K;
  const brg=(a,b)=>(Math.atan2(b[0]-a[0],-(b[1]-a[1]))*180/Math.PI+360)%360;

  /* ── statična karta ── */
  function chartBase(){
    let g=`<defs><pattern id="nlHatch" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0,6 L6,0" stroke="#b89c4a" stroke-width=".6" opacity=".5"/></pattern>
      <clipPath id="nlClip"><rect x="${X0}" y="${Y0}" width="${NLON*KX}" height="${NLAT*K}"/></clipPath></defs>`;
    g+=`<rect width="${W}" height="${H}" fill="#e9eef0"/>`;
    g+=`<rect x="${X0}" y="${Y0}" width="${NLON*KX}" height="${NLAT*K}" fill="#f7f8f4"/>`;
    // plitko more uz obalu (plavo < 10 m)
    g+=`<g clip-path="url(#nlClip)">`;
    LAND.forEach(P=>{ const d='M'+P.map(p=>px(p[0],p[1]).map(v=>v.toFixed(1)).join(',')).join('L')+'Z';
      g+=`<path d="${d}" fill="#bfe0f2" stroke="#bfe0f2" stroke-width="22" stroke-linejoin="round"/>`; });
    LAND.forEach(P=>{ const d='M'+P.map(p=>px(p[0],p[1]).map(v=>v.toFixed(1)).join(',')).join('L')+'Z';
      g+=`<path d="${d}" fill="none" stroke="#7fb7d8" stroke-width="22" stroke-linejoin="round" stroke-dasharray="2 3" opacity=".0"/>`;
      g+=`<path d="${d}" fill="#f2dc8c" stroke="#8a7432" stroke-width="1.2" stroke-linejoin="round"/>`; });
    // dubine
    [[4,6.6,'27'],[11,6.2,'38'],[13.5,7.3,'19'],[5.6,1.4,'46'],[9.8,1.9,'52'],[1.2,6,'31'],[18.3,3.3,'44'],[12.4,4.4,'41'],[18.8,6.9,'15'],[3,1.2,'49']]
      .forEach(([lo,la,t])=>{ const p=px(lo,la); g+=`<text x="${p[0]}" y="${p[1]}" font-size="9" fill="#50606c" text-anchor="middle" font-style="italic">${t}</text>`; });
    // mreža svakih 5'
    for(let m=0;m<=NLON;m+=5){ const x=px(m,0)[0]; g+=`<line x1="${x}" y1="${Y0}" x2="${x}" y2="${Y0+NLAT*K}" stroke="#7a8a96" stroke-width=".6"/>`; }
    for(let m=0;m<=NLAT;m+=5){ const y=px(0,m)[1]; g+=`<line x1="${X0}" y1="${y}" x2="${X0+NLON*KX}" y2="${y}" stroke="#7a8a96" stroke-width=".6"/>`; }
    // ruža
    g+=`<g transform="translate(${RC[0]},${RC[1]})"><circle r="${ROSE.r}" fill="none" stroke="#6d4a8a" stroke-width="1"/><circle r="${ROSE.r-9}" fill="none" stroke="#6d4a8a" stroke-width=".6"/>`;
    for(let a=0;a<360;a+=5){ const r1=a%30===0?ROSE.r-9:ROSE.r-5, q=a*Math.PI/180;
      g+=`<line x1="${Math.sin(q)*r1}" y1="${-Math.cos(q)*r1}" x2="${Math.sin(q)*ROSE.r}" y2="${-Math.cos(q)*ROSE.r}" stroke="#6d4a8a" stroke-width="${a%30===0?1:.6}"/>`;
      if(a%30===0) g+=`<text x="${Math.sin(q)*(ROSE.r-17)}" y="${-Math.cos(q)*(ROSE.r-17)+3}" font-size="8" fill="#6d4a8a" text-anchor="middle">${a}</text>`; }
    g+=`<path d="M0,${-ROSE.r+22} L4,0 L0,6 L-4,0 Z" fill="#6d4a8a"/><circle r="1.8" fill="#6d4a8a"/></g>`;
    // oznake na kopnu
    MARKS.forEach(m=>{ const p=px(m.p[0],m.p[1]);
      if(m.id==='zvonik') g+=`<g transform="translate(${p[0]},${p[1]})"><circle r="3" fill="none" stroke="#222" stroke-width="1.1"/><path d="M0,-3 v-7 M-3,-7 h6" stroke="#222" stroke-width="1.1"/></g>`;
      else g+=`<g transform="translate(${p[0]},${p[1]})"><circle r="2.4" fill="#222"/><path d="M0,0 L-6,-16 A17,17 0 0 1 6,-16 Z" fill="#c2185b" opacity=".75"/></g>`;
      g+=`<text x="${p[0]+(m.id==='mali'?-10:6)}" y="${p[1]+(m.id==='zvonik'?-12:m.id==='mali'?-6:14)}" font-size="9" fill="#333" text-anchor="${m.id==='mali'?'end':'start'}">${m.n}${m.s?', '+m.s:''}</text>`; });
    g+=`<text x="${px(4.8,3.8)[0]}" y="${px(4.8,3.8)[1]}" font-size="11" fill="#6b5a22" font-style="italic">o. Vela</text>`;
    g+=`<text x="${px(15.5,5.4)[0]}" y="${px(15.5,5.4)[1]+2}" font-size="9" fill="#6b5a22" font-style="italic">o. Mali</text>`;
    g+=`</g>`;
    // okvir i skale: minute naizmjence crno/bijelo, crtice svakih 0,2'
    const bw=10;
    g+=`<rect x="${X0}" y="${Y0}" width="${NLON*KX}" height="${NLAT*K}" fill="none" stroke="#222" stroke-width="1.2"/>`;
    for(let m=0;m<NLAT;m++){ const y1=px(0,m+1)[1], c=m%2?'#222':'#fff';
      g+=`<rect x="${X0-bw}" y="${y1}" width="${bw}" height="${K}" fill="${c}" stroke="#222" stroke-width=".6"/><rect x="${X0+NLON*KX}" y="${y1}" width="${bw}" height="${K}" fill="${c}" stroke="#222" stroke-width=".6"/>`; }
    for(let t=0;t<=NLAT*5;t++){ const y=Y0+NLAT*K-t*K/5, L=t%5===0?8:4;
      g+=`<line x1="${X0-bw-L}" y1="${y}" x2="${X0-bw}" y2="${y}" stroke="#222" stroke-width=".6"/><line x1="${X0+NLON*KX+bw}" y1="${y}" x2="${X0+NLON*KX+bw+L}" y2="${y}" stroke="#222" stroke-width=".6"/>`; }
    for(let m=0;m<=NLAT;m++){ const y=px(0,m)[1];
      g+=`<text x="${X0-bw-10}" y="${y+3}" font-size="8.5" fill="#222" text-anchor="end">${m%5===0?'43°':''}${20+m}'</text>`; }
    for(let m=0;m<NLON;m++){ const x1=px(m,0)[0], c=m%2?'#222':'#fff';
      g+=`<rect x="${x1}" y="${Y0-bw}" width="${KX}" height="${bw}" fill="${c}" stroke="#222" stroke-width=".6"/><rect x="${x1}" y="${Y0+NLAT*K}" width="${KX}" height="${bw}" fill="${c}" stroke="#222" stroke-width=".6"/>`; }
    for(let m=0;m<=NLON;m+=1){ const x=px(m,0)[0]; if(m%5===0||m%1===0)
      g+=`<text x="${x}" y="${Y0+NLAT*K+bw+11}" font-size="8" fill="#222" text-anchor="middle">${m%5===0?'16°':''}${20+m}'</text>`; }
    g+=`<text x="${X0+4}" y="${Y0-bw-6}" font-size="9" fill="#555">Vježbovna karta, izmišljeno područje. Nije za navigaciju.</text>`;
    g+=`<text x="${X0+NLON*KX}" y="${Y0-bw-6}" font-size="9" fill="#555" text-anchor="end">Merkator, dubine u metrima</text>`;
    return g;
  }

  /* ── crtanje pribora ── */
  function dividers(t1,t2,op){ // šestar: dva kraka i zglob
    const mx=(t1[0]+t2[0])/2, my=(t1[1]+t2[1])/2, d=Math.hypot(t2[0]-t1[0],t2[1]-t1[1]), L=Math.max(d/2+26,96);
    let nx=-(t2[1]-t1[1])/(d||1), ny=(t2[0]-t1[0])/(d||1); if(ny>0.01){nx=-nx;ny=-ny;}
    const h=Math.sqrt(Math.max(0,L*L-d*d/4));
    if(mx+nx*h<12||mx+nx*h>W-12||my+ny*h<12){ nx=-nx; ny=-ny; }
    const hx=mx+nx*h, hy=my+ny*h;
    const leg=(t)=>`<path d="M${hx},${hy} L${t[0]},${t[1]}" stroke="#39434c" stroke-width="5.5" stroke-linecap="round"/><path d="M${hx},${hy} L${t[0]},${t[1]}" stroke="#c9d3db" stroke-width="3" stroke-linecap="round"/><circle cx="${t[0]}" cy="${t[1]}" r="1.6" fill="#111"/>`;
    return `<g opacity="${op??1}">${leg(t1)}${leg(t2)}<circle cx="${hx}" cy="${hy}" r="6" fill="#8a96a0" stroke="#39434c" stroke-width="1.5"/><path d="M${hx},${hy} l${nx*14},${ny*14}" stroke="#39434c" stroke-width="4" stroke-linecap="round"/></g>`;
  }
  function tri(p,ang,sz,flip){ // trokut 45°: p je vrh pravog kuta? ne: p je sredina hipotenuze, ang smjer hipotenuze
    const q=ang*Math.PI/180, ux=Math.sin(q), uy=-Math.cos(q), s=flip?-1:1, nx=-uy*s, ny=ux*s;
    const a=[p[0]-ux*sz,p[1]-uy*sz], c=[p[0]+ux*sz,p[1]+uy*sz], v=[p[0]+nx*sz,p[1]+ny*sz];
    let g=`<path d="M${a[0]},${a[1]} L${c[0]},${c[1]} L${v[0]},${v[1]} Z" fill="rgba(120,190,230,.16)" stroke="#2a6f9e" stroke-width="1.3"/>`;
    for(let i=1;i<20;i++){ const t=i/20, x=a[0]+(c[0]-a[0])*t, y=a[1]+(c[1]-a[1])*t, l=i%5?3:6; g+=`<line x1="${x}" y1="${y}" x2="${x+nx*l}" y2="${y+ny*l}" stroke="#2a6f9e" stroke-width=".6"/>`; }
    return g;
  }

  /* ── UI ── */
  const MODES=[['sestar','Šestar: udaljenost'],['kurs','Trokuti: kurs'],['pbv','Put, brzina, vrijeme'],['fix','Pozicija iz 2 azimuta']];
  let mode='sestar', st={}, anim=null, score=store.get('navlab',{ok:0,n:0});
  b.innerHTML=`<div class="nlTabs">${MODES.map(m=>`<button class="knTab" data-m="${m[0]}">${m[1]}</button>`).join('')}<button class="knTab nlBig" type="button" aria-pressed="false" title="Karta preko cijele širine, zadatak ispod nje">⤢ Veća karta</button></div>
    <div class="nlWrap"><div class="nlChart"><svg viewBox="0 0 ${W.toFixed(0)} ${H}" class="nlSvg"><g class="nlBase">${chartBase()}</g><g class="nlDyn"></g><g class="nlHand"></g></svg></div>
    <div class="nlPanel"><div class="nlTask"></div><div class="nlIn"></div><div class="nlOut" aria-live="polite"></div>
    <div class="btnrow"><button class="btn p nlCheck">Provjeri</button><button class="btn nlShow">Pokaži postupak</button><button class="btn nlNew">Novi zadatak</button><button class="btn nlHandBtn" type="button" aria-pressed="false">Pribor rukom</button></div>
    <div class="nlHandTip" hidden></div>
    <div class="nlScore"></div></div></div>`;
  const svg=$('.nlSvg',b), dyn=$('.nlDyn',b);
  const sp=()=>{ $('.nlScore',b).textContent=score.n?`Točno ${score.ok} od ${score.n} zadataka na radnom stolu`:''; };
  const mark=(p,lab,col)=>`<g><circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="none" stroke="${col||'#c62828'}" stroke-width="2"/><circle cx="${p[0]}" cy="${p[1]}" r="1.3" fill="${col||'#c62828'}"/>${lab?`<text x="${p[0]+7}" y="${p[1]-7}" font-size="12" font-weight="600" fill="${col||'#c62828'}">${lab}</text>`:''}</g>`;
  function tween(dur,fn,done){ if(anim) cancelAnimationFrame(anim);
    if(RM){ fn(1); done&&done(); return; }
    const t0=performance.now(); const f=n=>{ const t=Math.min(1,(n-t0)/dur), e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; fn(e); if(t<1) anim=requestAnimationFrame(f); else { anim=null; done&&done(); } }; anim=requestAnimationFrame(f); }
  let seqGen=0; // novi postupak prekida stari (i u pauzi između koraka)
  function seq(steps){ let i=0; const my=++seqGen; const next=()=>{ if(my!==seqGen||i>=steps.length) return; const s=steps[i++]; if(s.say) out(s.say,true); tween(s.d||1000,s.f,()=>setTimeout(next,s.wait??350)); }; next(); }
  let outBuf='';
  function out(h,append){ outBuf=append?outBuf+`<div>${h}</div>`:h; $('.nlOut',b).innerHTML=outBuf; }
  function result(ok,msg){ score.n++; if(ok){score.ok++; if(window.VB) VB.widgetOk('navlab');} store.set('navlab',score); sp();
    out(`<div class="nlRes ${ok?'rg':'rb'}">${ok?'✓ Točno.':'✗ Nije točno.'} ${msg}</div>`); }
  const num=v=>parseFloat(String(v).replace(',','.'));

  /* ═ ŠESTAR ═ */
  const M={};
  M.sestar={
    task(){ let A,B; do{ A=randWater(); B=randWater(); }while(!(distM(px(...A),px(...B))>1.6 && distM(px(...A),px(...B))<7.2 && clearPath(A,B)));
      st={A:px(...A),B:px(...B)}; st.d=distM(st.A,st.B);
      return {t:'Izmjeri udaljenost od točke <b>A</b> do točke <b>B</b> šestarom i skalom <b>geografske širine</b>. Upiši u miljama s jednom decimalom.',
        i:`<label>Udaljenost <input class="nlI" data-k="d" inputmode="decimal" placeholder="npr. 4,6"> M</label>`}; },
    draw(){ dyn.innerHTML=`<line x1="${st.A[0]}" y1="${st.A[1]}" x2="${st.B[0]}" y2="${st.B[1]}" stroke="#c62828" stroke-width="1" stroke-dasharray="4 3"/>`+mark(st.A,'A')+mark(st.B,'B'); },
    check(v){ const d=num(v.d); if(isNaN(d)) return out('Upiši broj milja.');
      const ok=Math.abs(d-st.d)<=0.15; result(ok,`Udaljenost je <b>${f1(st.d)} M</b> (${Math.round(st.d*10)} kabela). ${ok?'':'Pogledaj postupak.'}`); if(!ok) this.show(true); },
    show(keep){ const {A,B,d}=st; const base=dyn.innerHTML.split('<g class="tool">')[0];
      // cilj na lijevoj skali: donji vrh na najbližoj cijeloj minuti ispod sredine udaljenosti
      const sx=X0-5, midLa=Math.max(0,Math.min(NLAT-d, Math.round(ll(0,(A[1]+B[1])/2)[1]-d/2)));
      const T1=[sx,px(0,midLa)[1]], T2=[sx,px(0,midLa+d)[1]];
      const closed=[[A[0]-6,A[1]+2],[A[0]+6,A[1]+2]];
      const lerp=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
      const draw=(t1,t2,extra)=>dyn.innerHTML=base+`<g class="tool">${extra||''}${dividers(t1,t2)}</g>`;
      if(!keep) out('');
      seq([
        {say:'1. Jedan krak šestara na <b>A</b>, drugi na <b>B</b>.',d:1100,f:e=>draw(lerp(closed[0],A,e),lerp(closed[1],B,e))},
        {say:'2. <b>Ne mijenjajući razmak</b>, prenesi šestar na <b>lijevu skalu širine</b>, u visini zadatka. Donji krak stavi na cijelu minutu.',d:1500,wait:500,f:e=>draw(lerp(A,T1,e),lerp(B,T2,e))},
        {say:`3. Broji: svaka minuta širine je <b>1 milja</b>, crtica je <b>0,2 M</b> (2 kabela). Ovdje: <b>${f1(d)} M</b>.`,d:500,f:e=>draw(T1,T2,`<rect x="${X0-10}" y="${T2[1]}" width="10" height="${T1[1]-T2[1]}" fill="#ffd166" opacity="${.65*e}"/><text x="${X0+8}" y="${(T1[1]+T2[1])/2+4}" font-size="13" font-weight="600" fill="#b3261e" opacity="${e}" paint-order="stroke" stroke="#f7f8f4" stroke-width="4">${f1(d)} M</text>`)}
      ]); }
  };

  /* ═ KURS ═ */
  M.kurs={
    task(){ let A,B; do{ A=randWater(); B=randWater(); }while(!(distM(px(...A),px(...B))>2.2 && clearPath(A,B)));
      st={A:px(...A),B:px(...B)}; st.c=brg(st.A,st.B);
      return {t:'Odredi <b>pravi kurs</b> od <b>A</b> prema <b>B</b> pomoću dva trokuta i ruže na karti. Upiši u stupnjevima (0–359).',
        i:`<label>Kurs <input class="nlI" data-k="c" inputmode="numeric" placeholder="npr. 047"> °</label>`}; },
    draw(){ dyn.innerHTML=`<line x1="${st.A[0]}" y1="${st.A[1]}" x2="${st.B[0]}" y2="${st.B[1]}" stroke="#c62828" stroke-width="1.4"/>`+mark(st.A,'A')+mark(st.B,'B'); },
    check(v){ const c=num(v.c); if(isNaN(c)) return out('Upiši kurs u stupnjevima.');
      const e=Math.abs(((c-st.c+540)%360)-180), ok=e<=2;
      result(ok,`Pravi kurs je <b>${pad3(st.c)}°</b>.${!ok&&Math.abs(e-180)<=3?' Očitao si <b>suprotni smjer</b>: s ruže čitaj od središta <b>u smjeru plovidbe</b>.':''}`); if(!ok) this.show(true); },
    show(keep){ const {A,B,c}=st, base=dyn.innerHTML.split('<g class="tool">')[0];
      const mid=[(A[0]+B[0])/2,(A[1]+B[1])/2], q=c*Math.PI/180, ux=Math.sin(q), uy=-Math.cos(q), nx=-uy, ny=ux;
      // okomiti pomak od pravca A–B do središta ruže
      const off=(RC[0]-mid[0])*nx+(RC[1]-mid[1])*ny, flip=off<0, sz=62;
      const lerp=(p,r,t)=>[p[0]+(r[0]-p[0])*t,p[1]+(r[1]-p[1])*t];
      const P2=[mid[0]+nx*off,mid[1]+ny*off];
      // vodilica: drugi trokut s hipotenuzom duž puta kojim klizi kraj prvoga
      const a0=[mid[0]-ux*sz,mid[1]-uy*sz], gs=Math.max(60,Math.abs(off)/2+34);
      const guide=`<g opacity=".95">${tri([a0[0]+nx*off/2,a0[1]+ny*off/2],(c+90)%360,gs,false)}</g>`;
      const draw=(p,t,g)=>dyn.innerHTML=base+`<g class="tool">${g?guide:''}${tri(p,c,sz,flip)}${t||''}</g>`;
      const ray=e=>{ const r=ROSE.r*e; return `<line x1="${RC[0]}" y1="${RC[1]}" x2="${RC[0]+ux*r}" y2="${RC[1]+uy*r}" stroke="#c62828" stroke-width="2"/><circle cx="${RC[0]+ux*ROSE.r}" cy="${RC[1]+uy*ROSE.r}" r="${5*e}" fill="none" stroke="#c62828" stroke-width="2"/>`; };
      if(!keep) out('');
      seq([
        {say:'1. Prvi trokut položi <b>hipotenuzom točno na liniju kursa</b> A–B.',d:700,f:e=>draw(mid,'',false)},
        {say:'2. Drugi trokut prisloni uz prvi kao vodilicu i drži ga čvrsto. Prvi trokut <b>kliži</b> uz vodilicu: hipotenuza ostaje usporedna s kursom.',d:1900,wait:400,f:e=>draw(lerp(mid,P2,e),'',true)},
        {say:'3. Kad hipotenuza prođe <b>središtem ruže</b>, stani. (Ako je ruža daleko, trokute naizmjence „hodaš" jedan uz drugi.)',d:800,f:e=>draw(lerp(P2,RC,e),'',true)},
        {say:`4. Očitaj na obodu ruže <b>u smjeru plovidbe</b> (od A prema B): <b>${pad3(c)}°</b>.`,d:700,f:e=>draw(RC,ray(e),false)}
      ]); }
  };

  /* ═ PUT, BRZINA, VRIJEME ═ */
  const hm=h=>{ let H=Math.floor(h), m=Math.round((h-H)*60); if(m===60){H++;m=0;} return {H,m}; };
  const hmTxt=h=>{ const {H,m}=hm(h); return (H?H+' h ':'')+(m||!H?m+' min':''); };
  M.pbv={
    task(){ let A,B; do{ A=randWater(); B=randWater(); }while(!(distM(px(...A),px(...B))>3 && clearPath(A,B)));
      st={A:px(...A),B:px(...B)};
      const types=['t','v','s','eta']; st.type=rnd(types);
      const v=rnd([4,5,6,7.5,8,10,12,15,16,18,20]);
      let d=Math.round(distM(st.A,st.B)*10)/10;
      if(st.type==='t'||st.type==='eta'){ // vrijeme u cijelim minutama
        const tMin=Math.max(6,Math.round(d/v*60/3)*3); d=Math.round(v*tMin/60*10)/10; st.v=v; st.d=d; st.t=tMin/60; }
      else if(st.type==='v'){ const tMin=rnd([15,20,24,30,36,40,45,48,54,60,75,90]); st.t=tMin/60; st.v=Math.round(d/st.t*10)/10; st.d=d; }
      else { const tMin=rnd([12,18,20,24,30,36,40,45]); st.v=v; st.t=tMin/60; st.d=Math.round(v*st.t*10)/10; }
      // B postavi točno na izračunati put, u smjeru A–B
      const u=[(st.B[0]-st.A[0])/Math.hypot(st.B[0]-st.A[0],st.B[1]-st.A[1]),(st.B[1]-st.A[1])/Math.hypot(st.B[0]-st.A[0],st.B[1]-st.A[1])];
      const nb=[st.A[0]+u[0]*st.d*K, st.A[1]+u[1]*st.d*K], nbl=ll(...nb);
      if(!(nbl[0]>.5&&nbl[0]<19.5&&nbl[1]>.4&&nbl[1]<9.6&&wet(...nbl,.3)&&clearPath(ll(...st.A),nbl))) return this.task();
      st.B=nb;
      st.dep=8*60+rnd([0,10,15,20,30,40,45,50]);
      const hhmm=m=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
      st.hhmm=hhmm;
      const T={t:[`Put od A do B je <b>${f1(st.d)} M</b>. Plovimo brzinom <b>${f1(st.v)} čv</b>. Koliko traje plovidba?`,`<label>Vrijeme <input class="nlI w54" data-k="h" inputmode="numeric"> h <input class="nlI w54" data-k="m" inputmode="numeric"> min</label>`],
        eta:[`Isplovio si iz A u <b>${hhmm(st.dep)}</b>. Put do B je <b>${f1(st.d)} M</b>, brzina <b>${f1(st.v)} čv</b>. U koliko sati stižeš u B?`,`<label>Dolazak <input class="nlI" data-k="eta" placeholder="hh:mm" style="width:84px"></label>`],
        v:[`Put od A do B je <b>${f1(st.d)} M</b> i prešao si ga za <b>${hmTxt(st.t)}</b>. Kolika je bila prosječna brzina?`,`<label>Brzina <input class="nlI" data-k="v" inputmode="decimal"> čv</label>`],
        s:[`Ploviš <b>${hmTxt(st.t)}</b> brzinom <b>${f1(st.v)} čv</b>. Koliki put prijeđeš?`,`<label>Put <input class="nlI" data-k="s" inputmode="decimal"> M</label>`]}[st.type];
      return {t:T[0]+'<div class="nlTri"><svg viewBox="0 0 150 92"><path d="M75,4 L146,88 L4,88 Z" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="36" y1="50" x2="114" y2="50" stroke="currentColor" stroke-width="1.2"/><line x1="75" y1="50" x2="75" y2="88" stroke="currentColor" stroke-width="1.2"/><text x="75" y="40" text-anchor="middle" font-size="17" font-weight="600" fill="currentColor">P</text><text x="46" y="76" text-anchor="middle" font-size="17" font-weight="600" fill="currentColor">B</text><text x="104" y="76" text-anchor="middle" font-size="17" font-weight="600" fill="currentColor">V</text></svg><span>Pokrij ono što tražiš.<br>P = B × V, B = P ÷ V, V = P ÷ B<br><small>P put (M), B brzina (čv), V vrijeme (h)</small></span></div>',i:T[1]}; },
    draw(){ dyn.innerHTML=`<line x1="${st.A[0]}" y1="${st.A[1]}" x2="${st.B[0]}" y2="${st.B[1]}" stroke="#c62828" stroke-width="1.2"/>`+mark(st.A,'A')+mark(st.B,'B'); },
    explain(){ const s=st;
      if(s.type==='t'||s.type==='eta'){ const h=s.d/s.v, {H,m}=hm(h);
        return `V = P ÷ B = ${f1(s.d)} ÷ ${f1(s.v)} = <b>${h.toFixed(2).replace('.',',')} h</b>. Decimalni dio × 60: ${(h-H).toFixed(2).replace('.',',')} × 60 = ${m} min, dakle <b>${hmTxt(h)}</b>.`+(s.type==='eta'?` Dolazak: ${s.hhmm(s.dep)} + ${hmTxt(h)} = <b>${s.hhmm(s.dep+Math.round(h*60))}</b>.`:''); }
      if(s.type==='v') return `Minute pretvori u sate: ${Math.round(s.t*60)} min ÷ 60 = ${s.t.toFixed(2).replace('.',',')} h. B = P ÷ V = ${f1(s.d)} ÷ ${s.t.toFixed(2).replace('.',',')} = <b>${f1(s.d/s.t)} čv</b>.`;
      return `Minute pretvori u sate: ${Math.round(s.t*60)} min ÷ 60 = ${s.t.toFixed(2).replace('.',',')} h. P = B × V = ${f1(s.v)} × ${s.t.toFixed(2).replace('.',',')} = <b>${f1(s.v*s.t)} M</b>.`; },
    check(v){ const s=st; let ok=false;
      if(s.type==='t'){ const t=(num(v.h)||0)+(num(v.m)||0)/60; ok=Math.abs(t-s.d/s.v)*60<=1.5; }
      else if(s.type==='eta'){ const m=(v.eta||'').match(/(\d{1,2})\D+(\d{2})/); if(!m) return out('Upiši vrijeme kao hh:mm.');
        const got=+m[1]*60+ +m[2], want=s.dep+Math.round(s.d/s.v*60); ok=Math.abs(got-want)<=1; }
      else if(s.type==='v') ok=Math.abs(num(v.v)-s.d/s.t)<=0.15;
      else ok=Math.abs(num(v.s)-s.v*s.t)<=0.1;
      result(ok,this.explain()); this.show(true); },
    show(silent){ const {A,B}=st, base=dyn.innerHTML.split('<g class="tool">')[0], T=st.type==='s'||st.type==='v'?st.t:st.d/st.v;
      if(!silent) out(this.explain());
      const q=brg(A,B)*Math.PI/180;
      tween(2600,e=>{ const x=A[0]+(B[0]-A[0])*e, y=A[1]+(B[1]-A[1])*e, mins=Math.round(T*60*e);
        dyn.innerHTML=base+`<g class="tool"><g transform="translate(${x},${y}) rotate(${q*180/Math.PI})"><path d="M0,-9 C4,-4 4,4 3.5,8 L-3.5,8 C-4,4 -4,-4 0,-9 Z" fill="#0b3954" stroke="#fff" stroke-width="1"/></g>
          <rect x="${x+10}" y="${y-24}" width="${st.type==='eta'?58:48}" height="17" rx="4" fill="#0b3954"/><text x="${x+14}" y="${y-12}" font-size="11" fill="#fff" font-family="var(--mono)">${st.type==='eta'?st.hhmm(st.dep+mins):'+'+mins+' min'}</text></g>`; }); }
  };

  /* ═ POZICIJA IZ DVA AZIMUTA ═ */
  M.fix={
    task(){ let P,pr; for(let k=0;k<500;k++){ P=randWater(); const pp=px(...P);
        const c=MARKS.map(m=>({m,b:brg(pp,px(...m.p)),d:distM(pp,px(...m.p))})).filter(o=>o.d<9&&o.d>1);
        for(let i=0;i<c.length;i++) for(let j=i+1;j<c.length;j++){ const a=Math.abs(((c[i].b-c[j].b+540)%360)-180); if(a>45&&a<135){ pr=[c[i],c[j]]; break; } }
        if(pr) break; }
      if(!pr) return this.task();
      pr.forEach(o=>o.b=Math.round(o.b));
      // stvarna pozicija iz zaokruženih azimuta: sjecište dvaju pravaca kroz objekte
      const L=pr.map(o=>{ const m=px(...o.m.p), q=(o.b+180)*Math.PI/180; return {m,u:[Math.sin(q),-Math.cos(q)]}; });
      const [a,c]=L, det=a.u[0]*(-c.u[1])-a.u[1]*(-c.u[0]), t=((c.m[0]-a.m[0])*(-c.u[1])-(c.m[1]-a.m[1])*(-c.u[0]))/det;
      st={pr,L,fix:[a.m[0]+a.u[0]*t,a.m[1]+a.u[1]*t],click:null};
      return {t:`Smjernim kompasom si snimio dva objekta:<br><b>${pr[0].m.n}</b>: azimut <b>${pad3(pr[0].b)}°</b><br><b>${pr[1].m.n}</b>: azimut <b>${pad3(pr[1].b)}°</b><br>Klikni na kartu gdje si. Zatim upiši koordinate.`,
        i:`<label>Širina 43° <input class="nlI w64" data-k="la" inputmode="decimal">' N</label><label>Dužina 16° <input class="nlI w64" data-k="lo" inputmode="decimal">' E</label>`}; },
    draw(){ dyn.innerHTML=st.pr.map(o=>{ const p=px(...o.m.p); return `<circle cx="${p[0]}" cy="${p[1]}" r="9" fill="none" stroke="#c62828" stroke-width="1.6" stroke-dasharray="3 2"/>`; }).join('')+(st.click?mark(st.click,'?','#0b3954'):''); },
    check(v){ const la=num(v.la)-20, lo=num(v.lo)-20, F=ll(...st.fix);
      if(isNaN(la)||isNaN(lo)){ if(!st.click) return out('Klikni na kartu ili upiši koordinate.'); }
      const guess=!isNaN(la)&&!isNaN(lo)?px(lo,la):st.click, e=distM(guess,st.fix);
      const ok=e<=0.3;
      result(ok,`Pozicija: <b>${fmtLat(F[1])}, ${fmtLon(F[0])}</b>. Tvoja je ${f1(e)} M ${ok?'od nje (unutar 3 kabela).':'daleko.'}`); this.show(true); },
    show(silent){ const base=dyn.innerHTML.split('<g class="tool">')[0], F=ll(...st.fix);
      if(!silent) out('');
      const line=(o,e)=>{ const len=Math.hypot(st.fix[0]-o.m[0],st.fix[1]-o.m[1])+40; return `<line x1="${o.m[0]}" y1="${o.m[1]}" x2="${o.m[0]+o.u[0]*len*e}" y2="${o.m[1]+o.u[1]*len*e}" stroke="#c62828" stroke-width="1.6"/>`; };
      const [a,c]=st.L, [p1,p2]=st.pr;
      seq([
        {say:`1. Azimut je smjer <b>od broda prema objektu</b>. Zato kroz objekt crtaš pravac u <b>suprotnom smjeru</b>: ${pad3(p1.b)}° ± 180° = <b>${pad3((p1.b+180)%360)}°</b>.`,d:1300,f:e=>dyn.innerHTML=base+`<g class="tool">${line(a,e)}</g>`},
        {say:`2. Isto za drugi objekt: ${pad3(p2.b)}° ± 180° = <b>${pad3((p2.b+180)%360)}°</b>. Kurs pravca prenosiš trokutima s ruže, kao kod kursa.`,d:1300,f:e=>dyn.innerHTML=base+`<g class="tool">${line(a,1)}${line(c,e)}</g>`},
        {say:`3. Sjecište je pozicija: <b>${fmtLat(F[1])}, ${fmtLon(F[0])}</b>. Upiši je s vremenom opažanja.`,d:600,f:e=>dyn.innerHTML=base+`<g class="tool">${line(a,1)}${line(c,1)}<circle cx="${st.fix[0]}" cy="${st.fix[1]}" r="${7*e}" fill="none" stroke="#0b7a3e" stroke-width="2.2"/><path d="M${st.fix[0]-11},${st.fix[1]} h22 M${st.fix[0]},${st.fix[1]-11} v22" stroke="#0b7a3e" stroke-width="1" opacity="${e}"/></g>`}
      ]); }
  };

  /* ═ PRIBOR RUKOM: šestar i trokut koje korisnik sam vuče (mišem ili prstom) ═ */
  const hl=$('.nlHand',b), HT=$('.nlHandTip',b), HB=$('.nlHandBtn',b);
  // pribor rukom je uključen odmah (šestar i trokut leže na karti); izbor se pamti
  let hand=store.get('navlabHand',true)!==false, drag=null, hs=null, hk=null;
  const XL=X0-5, XR=X0+NLON*KX+5, YT=Y0, YB=Y0+NLAT*K;   // sredine lijeve i desne skale širine
  const sc=()=>{ const r=svg.getBoundingClientRect(); return r.width?r.width/W:1; };
  const SR=()=>Math.max(8,14/sc());                          // radijus prianjanja: ~14 px na ekranu
  const KR=()=>Math.min(22,Math.max(11,17/sc()));            // ručice dovoljno velike i za prst
  const TIPS={
    sestar:'<b>Šestar rukom.</b> ① Povuci <b>vrhove</b> (plavi krugovi) na <b>A</b> i <b>B</b>, sami se prilijepe. ② Uhvati šestar za <b>zglob ✥</b> ili za <b>krak</b> i odnesi ga na <b>skalu širine</b> (lijevo ili desno): sam se uspravi, razmak ostaje isti. ③ Očitaj: 1&#8242; = 1 M, crtica = 0,2 M.',
    kurs:'<b>Trokut rukom.</b> Okreni trokut ručicom <b>⟳</b> (ili gumbima ispod) dok hipotenuza ne legne na liniju A–B. Zatim ga <b>vuci</b>: kut ostaje isti, kao klizanje uz vodilicu. Kad isprekidani pravac prođe <b>središtem ruže</b>, očitaj kurs na obodu u smjeru plovidbe.'};
  const hinge=(t1,t2)=>{ const mx=(t1[0]+t2[0])/2, my=(t1[1]+t2[1])/2, d=Math.hypot(t2[0]-t1[0],t2[1]-t1[1]), L=Math.max(d/2+26,96);
    let nx=-(t2[1]-t1[1])/(d||1), ny=(t2[0]-t1[0])/(d||1); if(ny>0.01){nx=-nx;ny=-ny;}
    const h=Math.sqrt(Math.max(0,L*L-d*d/4)); if(mx+nx*h<12||mx+nx*h>W-12||my+ny*h<12){ nx=-nx; ny=-ny; } return [mx+nx*h,my+ny*h]; };
  const near=(p,q,r)=>q&&Math.hypot(p[0]-q[0],p[1]-q[1])<(r||.6);
  // očitanje: oba vrha na istoj skali širine -> udaljenost u minutama = miljama
  function scaleRead(t1,t2){ const on=x=>Math.abs(x-XL)<.6?'L':Math.abs(x-XR)<.6?'R':null, s1=on(t1[0]);
    const inY=y=>y>=YT-3&&y<=YB+3;
    if(s1&&s1===on(t2[0])&&inY(t1[1])&&inY(t2[1])) return {side:s1,d:Math.abs(t1[1]-t2[1])/K};
    const lon=y=>(y>YT-14&&y<YT+3)||(y>YB-3&&y<YB+14);
    if(lon(t1[1])&&lon(t2[1])&&Math.abs(t1[1]-t2[1])<6&&Math.abs(t1[0]-t2[0])>4) return {lon:true};
    return null; }
  function handStat(){ const s=$('.nlHandStat',b); if(!s) return; if(mode!=='sestar'){ s.innerHTML=''; return; }
    const {t1,t2}=hs, r=scaleRead(t1,t2), onAB=(near(t1,st.A)&&near(t2,st.B))||(near(t1,st.B)&&near(t2,st.A));
    s.className='nlHandStat'+(r&&r.lon?' bad':r?' good':'');
    s.innerHTML=r&&r.lon?'✗ To je skala <b>DUŽINE</b> (gore/dolje). Milje se mjere samo na skali <b>ŠIRINE</b>, lijevo ili desno.'
      :r?`Na skali širine: <b>${f1(r.d)}&#8242; = ${f1(r.d)} M</b> (${Math.round(r.d*10)} kabela). Upiši i klikni <b>Provjeri</b>.`
      :onAB?'✓ Vrhovi su na <b>A</b> i <b>B</b>. Sad uhvati šestar za <b>zglob ✥</b> i odnesi ga na <b>skalu širine</b>.'
      :'Korak 1: povuci vrhove šestara na točke <b>A</b> i <b>B</b>.'; }
  function handReset(){ const A=st.A||[W/2,H/2], B=st.B||A;
    const cx=Math.max(X0+30,Math.min(XR-40,A[0])), cy=A[1]+54<YB-8?A[1]+54:A[1]-40;
    hs={t1:[cx-24,cy],t2:[cx+24,cy]};
    const c=brg(A,B), q=c*Math.PI/180, nx=Math.cos(q), ny=Math.sin(q), mid=[(A[0]+B[0])/2,(A[1]+B[1])/2];
    let p=[mid[0]+nx*70,mid[1]+ny*70]; if(p[0]<X0+60||p[0]>X0+NLON*KX-60||p[1]<Y0+60||p[1]>Y0+NLAT*K-60) p=[mid[0]-nx*70,mid[1]-ny*70];
    hk={p,ang:(c+(Math.random()<.5?-1:1)*(25+Math.random()*30)+360)%360}; }
  function handDraw(){ if(!hand||!(mode in TIPS)){ hl.innerHTML=''; return; }
    const kr=KR(), knob=(x,y,k,lab,r)=>`<circle class="nlH" data-h="${k}" cx="${x}" cy="${y}" r="${r||kr}" fill="rgba(57,184,232,.12)" stroke="#39b8e8" stroke-width="1.4" stroke-dasharray="3 2"/>${lab?`<text x="${x}" y="${y+4}" font-size="11" text-anchor="middle" fill="#0b5c82" font-weight="600" pointer-events="none">${lab}</text>`:''}`;
    if(mode==='sestar'){ const {t1,t2}=hs, hg=hinge(t1,t2), r=scaleRead(t1,t2);
      let rd='';
      if(r&&!r.lon){ const y1=Math.min(t1[1],t2[1]), y2=Math.max(t1[1],t2[1]), L=r.side==='L';
        rd=`<rect x="${L?X0-10:XR-5}" y="${y1}" width="10" height="${y2-y1}" fill="#ffd166" opacity=".6" pointer-events="none"/>`
          +`<text x="${L?X0+8:XR-13}" y="${(y1+y2)/2+5}" text-anchor="${L?'start':'end'}" font-size="14" font-weight="600" fill="#b3261e" paint-order="stroke" stroke="#f7f8f4" stroke-width="4" pointer-events="none">${f1(r.d)} M</text>`; }
      else if(r&&r.lon) rd=`<text x="${(t1[0]+t2[0])/2}" y="${t1[1]<YT+4?YT+18:YB-8}" text-anchor="middle" font-size="12" font-weight="600" fill="#b3261e" paint-order="stroke" stroke="#f7f8f4" stroke-width="4" pointer-events="none">✗ skala dužine</text>`;
      // cijeli krak je hvatište za nošenje šestara (nevidljiva debela crta)
      const grip=t=>`<line class="nlH" data-h="hinge" x1="${hg[0]}" y1="${hg[1]}" x2="${t[0]}" y2="${t[1]}" stroke="rgba(0,0,0,0)" stroke-width="${Math.max(12,kr)}" stroke-linecap="round"/>`;
      hl.innerHTML=rd+dividers(t1,t2)+grip(t1)+grip(t2)+knob(t1[0],t1[1],'t1')+knob(t2[0],t2[1],'t2')+knob(hg[0],hg[1],'hinge','✥',Math.max(kr,12)); handStat(); }
    else { const {p,ang}=hk, sz=62, q=ang*Math.PI/180, ux=Math.sin(q), uy=-Math.cos(q);
      const ext=`<g clip-path="url(#nlClip)"><line x1="${p[0]-ux*1400}" y1="${p[1]-uy*1400}" x2="${p[0]+ux*1400}" y2="${p[1]+uy*1400}" stroke="#2a6f9e" stroke-width=".9" stroke-dasharray="6 4" opacity=".75" pointer-events="none"/></g>`;
      const a=[p[0]-ux*sz,p[1]-uy*sz], c=[p[0]+ux*sz,p[1]+uy*sz], v=[p[0]-uy*sz,p[1]+ux*sz];
      const rk=[p[0]+ux*(sz+18),p[1]+uy*(sz+18)];
      hl.innerHTML=ext+tri(p,ang,sz,false)+`<path class="nlH" data-h="body" d="M${a[0]},${a[1]} L${c[0]},${c[1]} L${v[0]},${v[1]} Z" fill="rgba(0,0,0,0)" style="cursor:move"/>`
        +`<line x1="${c[0]}" y1="${c[1]}" x2="${rk[0]}" y2="${rk[1]}" stroke="#39b8e8" stroke-width="1.2"/>`+knob(rk[0],rk[1],'rot','⟳'); } }
  const toSvg=e=>{ const m=svg.getScreenCTM(); if(!m) return [0,0]; const p=svg.createSVGPoint(); p.x=e.clientX; p.y=e.clientY; const r=p.matrixTransform(m.inverse()); return [r.x,r.y]; };
  const clampP=p=>[Math.max(4,Math.min(W-4,p[0])),Math.max(4,Math.min(H-4,p[1]))];
  const snap=pt=>{ const r=SR(); for(const q of [st.A,st.B]) if(q&&Math.hypot(pt[0]-q[0],pt[1]-q[1])<r) return q.slice();
    const rs=Math.min(r,12); // skala je uz rub karte: manji radijus da ne "ukrade" točku blizu ruba
    if(Math.abs(pt[0]-XL)<rs) return [XL,pt[1]]; if(Math.abs(pt[0]-XR)<rs) return [XR,pt[1]]; return clampP(pt); };
  // nošenje cijelog šestara: blizu skale širine sam se uspravi (razmak isti), donji vrh prione na cijelu minutu
  function carry(s,dx,dy){ const m=[(s.t1[0]+s.t2[0])/2+dx,(s.t1[1]+s.t2[1])/2+dy], d=Math.hypot(s.t2[0]-s.t1[0],s.t2[1]-s.t1[1]), r=SR()*1.8;
    const side=Math.abs(m[0]-XL)<r?XL:Math.abs(m[0]-XR)<r?XR:null;
    if(side&&d>2){ let low=Math.min(YB,m[1]+d/2); if(low-d<YT&&d<=YB-YT) low=YT+d; // ostaje unutar skale
      const whole=YB-Math.round((YB-low)/K)*K; if(Math.abs(whole-low)<SR()*.7&&whole-d>=YT-.5) low=whole;
      return {t1:[side,low],t2:[side,low-d]}; }
    return {t1:clampP([s.t1[0]+dx,s.t1[1]+dy]),t2:clampP([s.t2[0]+dx,s.t2[1]+dy])}; }
  svg.addEventListener('pointerdown',e=>{ if(!hand) return; const h=e.target.closest('[data-h]'); if(!h) return;
    e.preventDefault(); drag={h:h.dataset.h,p0:toSvg(e),s:JSON.parse(JSON.stringify(mode==='sestar'?hs:hk))}; try{ svg.setPointerCapture(e.pointerId); }catch(_){}
    b.classList.add('nlDragging'); });
  svg.addEventListener('pointermove',e=>{ if(!drag) return; const pt=toSvg(e), dx=pt[0]-drag.p0[0], dy=pt[1]-drag.p0[1];
    if(mode==='sestar'){ if(drag.h==='hinge') hs=carry(drag.s,dx,dy);
      else hs[drag.h]=snap([drag.s[drag.h][0]+dx,drag.s[drag.h][1]+dy]); }
    else if(drag.h==='body') hk.p=[drag.s.p[0]+dx,drag.s.p[1]+dy];
    else hk.ang=brg(hk.p,pt);
    handDraw(); });
  const endDrag=()=>{ if(drag){ drag=null; b.classList.remove('nlDragging'); } };
  svg.addEventListener('pointerup',endDrag); svg.addEventListener('pointercancel',endDrag);
  function handUI(){ const ok=mode in TIPS; HB.hidden=!ok; HB.classList.toggle('p',hand&&ok); HB.setAttribute('aria-pressed',hand&&ok);
    b.classList.toggle('nlHandOn',hand&&ok); HT.hidden=!(hand&&ok);
    HT.innerHTML=ok?TIPS[mode]+(mode==='kurs'?`<div class="btnrow"><button class="btn nlRot" data-d="-1" type="button">↺ 1°</button><button class="btn nlRot" data-d="-0.25" type="button">↺ ¼°</button><button class="btn nlRot" data-d="0.25" type="button">↻ ¼°</button><button class="btn nlRot" data-d="1" type="button">↻ 1°</button></div>`:'<div class="nlHandStat" aria-live="polite"></div>'):'';
    hl.style.opacity=''; handDraw(); }
  HB.addEventListener('click',()=>{ hand=!hand; store.set('navlabHand',hand); if(hand&&!hs) handReset(); handUI(); });
  svg.addEventListener('pointerdown',()=>{ hl.style.opacity=''; },true);
  // veličina ručica ovisi o širini karte na ekranu: preračunaj kad se karta prikaže ili promijeni širinu
  if('ResizeObserver' in window) new ResizeObserver(()=>{ if(hand&&!drag) handDraw(); }).observe(svg);
  HT.addEventListener('click',e=>{ const r=e.target.closest('.nlRot'); if(!r||!hk) return; hk.ang=(hk.ang+ +r.dataset.d+360)%360; handDraw(); });

  function start(){ if(anim) cancelAnimationFrame(anim); const t=M[mode].task(); $('.nlTask',b).innerHTML=t.t; $('.nlIn',b).innerHTML=t.i; out(''); M[mode].draw();
    $$('.knTab[data-m]',$('.nlTabs',b)).forEach(x=>x.classList.toggle('on',x.dataset.m===mode)); handReset(); handUI(); }
  $('.nlTabs',b).addEventListener('click',e=>{ const t=e.target.closest('[data-m]'); if(t){ mode=t.dataset.m; start(); }});
  const BG=$('.nlBig',b), setBig=on=>{ b.classList.toggle('nlBigOn',on); BG.classList.toggle('on',on); BG.setAttribute('aria-pressed',on); BG.textContent=on?'⤡ Manja karta':'⤢ Veća karta'; };
  setBig(store.get('navlabBig',false)===true);
  BG.addEventListener('click',()=>{ const on=!b.classList.contains('nlBigOn'); store.set('navlabBig',on); setBig(on); handDraw(); });
  $('.nlNew',b).addEventListener('click',start);
  $('.nlShow',b).addEventListener('click',()=>{ if(hand) hl.style.opacity='.25'; M[mode].draw(); M[mode].show(); }); // pribor rukom se povuče u pozadinu dok traje postupak
  const doCheck=()=>{ const v={}; $$('.nlI',b).forEach(i=>v[i.dataset.k]=i.value.trim()); M[mode].draw(); M[mode].check(v); };
  $('.nlCheck',b).addEventListener('click',doCheck);
  $('.nlIn',b).addEventListener('keydown',e=>{ if(e.key==='Enter') doCheck(); });
  svg.addEventListener('click',e=>{ if(mode!=='fix') return; const r=svg.getBoundingClientRect(), x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*H;
    if(x<X0||x>X0+NLON*KX||y<Y0||y>Y0+NLAT*K) return; st.click=[x,y]; const q=ll(x,y);
    const la=$('.nlI[data-k=la]',b), lo=$('.nlI[data-k=lo]',b); if(la) la.value=f1(20+q[1]); if(lo) lo.value=f1(20+q[0]); M.fix.draw(); });
  // samostalni trokut za drugu kartu (Stol 1 simulacije ispita): vuci tijelo, okreći ručicom ⟳ ili gumbima
  function triTool(svg2,clipId,p0,ang0){ const g=document.createElementNS('http://www.w3.org/2000/svg','g'); svg2.appendChild(g);
    const t={p:p0.slice(),ang:ang0}; let dr=null;
    const sc2=()=>{ const r=svg2.getBoundingClientRect(); return r.width?r.width/W:1; };
    const pt=e=>{ const m=svg2.getScreenCTM(); if(!m) return [0,0]; const p=svg2.createSVGPoint(); p.x=e.clientX; p.y=e.clientY; const r=p.matrixTransform(m.inverse()); return [r.x,r.y]; };
    function draw(){ const {p,ang}=t, sz=62, q=ang*Math.PI/180, ux=Math.sin(q), uy=-Math.cos(q), kr=Math.min(22,Math.max(11,17/sc2()));
      const a=[p[0]-ux*sz,p[1]-uy*sz], c=[p[0]+ux*sz,p[1]+uy*sz], v=[p[0]-uy*sz,p[1]+ux*sz], rk=[p[0]+ux*(sz+18),p[1]+uy*(sz+18)];
      g.innerHTML=`<g clip-path="url(#${clipId})"><line x1="${p[0]-ux*1400}" y1="${p[1]-uy*1400}" x2="${p[0]+ux*1400}" y2="${p[1]+uy*1400}" stroke="#2a6f9e" stroke-width=".9" stroke-dasharray="6 4" opacity=".75" pointer-events="none"/></g>`
        +tri(p,ang,sz,false)+`<path data-t="body" d="M${a[0]},${a[1]} L${c[0]},${c[1]} L${v[0]},${v[1]} Z" fill="rgba(0,0,0,0)" style="cursor:move"/>`
        +`<line x1="${c[0]}" y1="${c[1]}" x2="${rk[0]}" y2="${rk[1]}" stroke="#39b8e8" stroke-width="1.2"/><circle data-t="rot" cx="${rk[0]}" cy="${rk[1]}" r="${kr}" fill="rgba(57,184,232,.12)" stroke="#39b8e8" stroke-width="1.4" stroke-dasharray="3 2" style="cursor:grab"/><text x="${rk[0]}" y="${rk[1]+4}" font-size="11" text-anchor="middle" fill="#0b5c82" font-weight="600" pointer-events="none">⟳</text>`; }
    svg2.style.touchAction='none';
    svg2.addEventListener('pointerdown',e=>{ const h=e.target.closest('[data-t]'); if(!h||!g.contains(h)) return;
      e.preventDefault(); dr={h:h.dataset.t,p0:pt(e),s:t.p.slice()}; try{ svg2.setPointerCapture(e.pointerId); }catch(_){} });
    svg2.addEventListener('pointermove',e=>{ if(!dr) return; const q=pt(e);
      if(dr.h==='body') t.p=[dr.s[0]+q[0]-dr.p0[0],dr.s[1]+q[1]-dr.p0[1]]; else t.ang=brg(t.p,q); draw(); });
    const end=()=>{ dr=null; }; svg2.addEventListener('pointerup',end); svg2.addEventListener('pointercancel',end);
    draw(); return {rot(d){ t.ang=(t.ang+d+360)%360; draw(); }}; }
  // samostalni šestar za drugu kartu (Stol 1, očitavanje pozicije): vrhovi prianjaju na zadane točke i crte mreže,
  // uz bočnu skalu se uspravi (minute širine), uz gornju/donju legne vodoravno (minute dužine)
  function divTool(svg2,p0,opts){ opts=opts||{}; const g=document.createElementNS('http://www.w3.org/2000/svg','g'); svg2.appendChild(g);
    let t={t1:[p0[0]-24,p0[1]],t2:[p0[0]+24,p0[1]]}, dr=null;
    const YTs=Y0-5, YBs=YB+5; // sredine gornje i donje skale dužine
    const GX=[0,5,10,15,20].map(m=>px(m,0)[0]), GY=[0,5,10].map(m=>px(0,m)[1]); // crte mreže (meridijani, paralele)
    const sc2=()=>{ const r=svg2.getBoundingClientRect(); return r.width?r.width/W:1; };
    const SR2=()=>Math.max(8,14/sc2()), KR2=()=>Math.min(22,Math.max(11,17/sc2()));
    const pt=e=>{ const m=svg2.getScreenCTM(); if(!m) return [0,0]; const p=svg2.createSVGPoint(); p.x=e.clientX; p.y=e.clientY; const r=p.matrixTransform(m.inverse()); return [r.x,r.y]; };
    const clampP=p=>[Math.max(4,Math.min(W-4,p[0])),Math.max(4,Math.min(H-4,p[1]))];
    function snapTip(p){ const r=SR2(), rs=Math.min(r,12);
      let x=p[0], y=p[1];
      // crta mreže ima prednost (i rubni meridijan/paralela), skala tek izvan nje; na skalu šestar ionako nosiš za zglob
      const gx=GX.find(v=>Math.abs(x-v)<rs*.7), gy=GY.find(v=>Math.abs(y-v)<rs*.7);
      const dg=Math.min(gx!=null?Math.abs(x-gx):1e9, gy!=null?Math.abs(y-gy):1e9);
      for(const q of (opts.snap||[])){ const dq=Math.hypot(p[0]-q[0],p[1]-q[1]); if(dq<r&&dq<=dg) return q.slice(); } // bliži cilj pobjeđuje
      if(gx!=null) x=gx; else if(Math.abs(x-XL)<rs) x=XL; else if(Math.abs(x-XR)<rs) x=XR;
      if(gy!=null) y=gy; else if(Math.abs(y-YTs)<rs) y=YTs; else if(Math.abs(y-YBs)<rs) y=YBs;
      return clampP([x,y]); }
    function carry(s,dx,dy){ const m=[(s.t1[0]+s.t2[0])/2+dx,(s.t1[1]+s.t2[1])/2+dy], d=Math.hypot(s.t2[0]-s.t1[0],s.t2[1]-s.t1[1]), r=SR2()*1.8;
      let sx=Math.abs(m[0]-XL)<r?XL:Math.abs(m[0]-XR)<r?XR:null, sy=Math.abs(m[1]-YTs)<r?YTs:Math.abs(m[1]-YBs)<r?YBs:null;
      if(sx!=null&&sy!=null){ if(Math.abs(m[0]-sx)<Math.abs(m[1]-sy)) sy=null; else sx=null; } // u kutu karte: bliža skala
      if(sx!=null&&d>2){ let low=Math.min(YB,m[1]+d/2); if(low-d<YT&&d<=YB-YT) low=YT+d;
        const whole=YB-Math.round((YB-low)/K)*K; if(Math.abs(whole-low)<SR2()*.7&&whole-d>=YT-.5) low=whole; return {t1:[sx,low],t2:[sx,low-d]}; }
      if(sy!=null&&d>2){ let left=Math.max(X0,m[0]-d/2); if(left+d>XR-5&&d<=XR-5-X0) left=XR-5-d;
        const whole=X0+Math.round((left-X0)/KX)*KX; if(Math.abs(whole-left)<SR2()*.7&&whole>=X0-.5&&whole+d<=XR-4.5) left=whole; return {t1:[left,sy],t2:[left+d,sy]}; }
      return {t1:clampP([s.t1[0]+dx,s.t1[1]+dy]),t2:clampP([s.t2[0]+dx,s.t2[1]+dy])}; }
    function read(){ const {t1,t2}=t, on=(v,a)=>Math.abs(v-a)<.6;
      if(((on(t1[0],XL)&&on(t2[0],XL))||(on(t1[0],XR)&&on(t2[0],XR)))&&Math.min(t1[1],t2[1])>=YT-3&&Math.max(t1[1],t2[1])<=YB+3) return {k:'lat',side:on(t1[0],XL)?'L':'R',d:Math.abs(t1[1]-t2[1])/K};
      if(((on(t1[1],YTs)&&on(t2[1],YTs))||(on(t1[1],YBs)&&on(t2[1],YBs)))&&Math.abs(t1[0]-t2[0])>1) return {k:'lon',top:on(t1[1],YTs),d:Math.abs(t1[0]-t2[0])/KX};
      return null; }
    function draw(){ const {t1,t2}=t, hg=hinge(t1,t2), kr=KR2(), r=read(); let rd='';
      if(r&&opts.readout!==false){ const lab=(x,y,a)=>`<text x="${x}" y="${y}" text-anchor="${a}" font-size="14" font-weight="600" fill="#b3261e" paint-order="stroke" stroke="#f7f8f4" stroke-width="4" pointer-events="none">${f1(r.d)}&#8242;</text>`;
        if(r.k==='lat'){ const y1=Math.min(t1[1],t2[1]), y2=Math.max(t1[1],t2[1]), L=r.side==='L';
          rd=`<rect x="${L?X0-10:XR-5}" y="${y1}" width="10" height="${y2-y1}" fill="#ffd166" opacity=".6" pointer-events="none"/>`+lab(L?X0+8:XR-13,(y1+y2)/2+5,L?'start':'end'); }
        else { const x1=Math.min(t1[0],t2[0]), x2=Math.max(t1[0],t2[0]);
          rd=`<rect x="${x1}" y="${r.top?Y0-10:YB}" width="${x2-x1}" height="10" fill="#ffd166" opacity=".6" pointer-events="none"/>`+lab((x1+x2)/2,r.top?Y0+18:YB-8,'middle'); } }
      const knob=(p,k,lab)=>`<circle data-d="${k}" cx="${p[0]}" cy="${p[1]}" r="${kr}" fill="rgba(57,184,232,.12)" stroke="#39b8e8" stroke-width="1.4" stroke-dasharray="3 2" style="cursor:grab"/>${lab?`<text x="${p[0]}" y="${p[1]+4}" font-size="11" text-anchor="middle" fill="#0b5c82" font-weight="600" pointer-events="none">${lab}</text>`:''}`;
      const grip=p=>`<line data-d="hinge" x1="${hg[0]}" y1="${hg[1]}" x2="${p[0]}" y2="${p[1]}" stroke="rgba(0,0,0,0)" stroke-width="${Math.max(12,kr)}" stroke-linecap="round" style="cursor:move"/>`;
      g.innerHTML=rd+dividers(t1,t2)+grip(t1)+grip(t2)+knob(t1,'t1')+knob(t2,'t2')+knob(hg,'hinge','✥');
      if(opts.onRead) opts.onRead(r); }
    svg2.style.touchAction='none';
    svg2.addEventListener('pointerdown',e=>{ const h=e.target.closest('[data-d]'); if(!h||!g.contains(h)) return;
      e.preventDefault(); dr={h:h.dataset.d,p0:pt(e),s:JSON.parse(JSON.stringify(t))}; try{ svg2.setPointerCapture(e.pointerId); }catch(_){} });
    svg2.addEventListener('pointermove',e=>{ if(!dr) return; const q=pt(e), dx=q[0]-dr.p0[0], dy=q[1]-dr.p0[1];
      if(dr.h==='hinge') t=carry(dr.s,dx,dy); else t[dr.h]=snapTip([dr.s[dr.h][0]+dx,dr.s[dr.h][1]+dy]); draw(); });
    const end=()=>{ dr=null; }; svg2.addEventListener('pointerup',end); svg2.addEventListener('pointercancel',end);
    if('ResizeObserver' in window) new ResizeObserver(()=>{ if(!dr) draw(); }).observe(svg2);
    draw(); return {draw}; }
  // karta i mjerni alati dostupni i simulaciji ispita (Stol 1)
  window.__NL={chartBase,px,ll,W,H,randWater,clearPath,brg,distM,fmtLat,fmtLon,X0,Y0,K,KX,NLAT,NLON,pad3,triTool,divTool};
  sp(); start();
})();
