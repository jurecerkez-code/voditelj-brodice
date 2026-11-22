"use strict";
/* Motoristika: kako radi klipni motor (četverotaktni i dvotaktni) i shema hlađenja. */
/* ═══════════════ MOTOR ═══════════════
   Mehanika: prava geometrija klipnog mehanizma (koljeno r, klipnjača l), bregasta se vrti upola sporije od koljena.
   Termodinamika: obujam iznad klipa slijedi iz položaja klipa i stupnja kompresije (benzin 9,5 : 1, dizel 18 : 1,
   pa je kompresijski prostor kod dizela vidljivo manji). Tlak i temperatura: politropa p·V^1,35 = konst.,
   izgaranje po Wiebeovoj krivulji. Čestice plina: isti broj u manjem obujmu = veća gustoća = veći tlak.
   Vrtnja nije jednolika: zamašnjak dobije energiju u radnom taktu i troši je u ostala tri (energetska bilanca). */
(function(){
  const stage=el('engineStage'); if(!stage) return;
  const RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let running=false, four=true, th=0, raf=0, last=0, diesel=false;
  const strokes4=()=>[
    ['USIS',`Klip se spušta od GMT prema DMT i širi prostor iznad sebe. Usisni ventil je otvoren, pa u cilindar ulazi ${diesel?'<b>čisti zrak</b>':'<b>smjesa zraka i benzina</b>'}. Tlak je malo ispod atmosferskog.`,C.acc],
    ['KOMPRESIJA',`Oba ventila su zatvorena. Klip se diže i istu količinu plina sabija u ${diesel?'18':'oko 9'} puta manji prostor: čestice su gušće, pa tlak raste na oko ${diesel?'45':'19'} bara, a plin se zagrije na ${diesel?'600 do 700':'oko 450'} °C.${diesel?' Zato se gorivo zapali samo, bez svjećice.':''} Taj rad daje zamašnjak.`,C.yellow],
    ['EKSPANZIJA',`${diesel?'Brizgaljka ubrizga gorivo u vrući zrak i ono se <b>samo zapali</b>':'Svjećica pali smjesu malo prije GMT i plamen se širi od svjećice'}. Tlak naglo skoči i gura klip prema DMT. Jedini <b>RADNI TAKT</b>: samo ovdje plin predaje rad koljenu.`,'#ff7a45'],
    ['ISPUH','Ispušni ventil se otvori, tlak padne i klip na putu prema GMT istisne izgorjele plinove. Zamašnjak ga nosi kroz ovaj i sljedeća dva takta.','#8fa6b8']
  ];
  const strokes2=[
    ['IZMJENA PLINOVA + KOMPRESIJA','Klip ide od DMT prema GMT. Dok su kanali otvoreni, svježa smjesa iz kartera kroz ispirni kanal istiskuje izgorjele plinove. Zatim klip zatvori kanale i sabija smjesu, a ispod klipa se karter puni novom smjesom. Nema ventila ni uljne kade: ulje za podmazivanje je <b>umiješano u gorivo</b>.',C.acc],
    ['IZGARANJE + EKSPANZIJA','Paljenje malo prije GMT, tlak gura klip prema DMT. Klip prvo otvori ispušni kanal (tlak padne), zatim ispirni. Ispod klipa se smjesa u karteru sabija. <b>RADNI TAKT pri svakom okretaju</b>, zato dvotaktni za isti obujam daje više snage, ali troši više i više zagađuje.','#ff7a45']
  ];
  // geometrija (px): provrt BX1..BX2, glava HEAD, koljeno R, klipnjača L
  const DY=66, W=460, HM=380+DY, H=HM+62, BX1=170, BX2=290, CX=(BX1+BX2)/2, HEAD=74, R=36, L=104, PIN=24, PH=40, NEXP=1.35;
  const rad=d=>d*Math.PI/180;
  let G=null; // sve što ovisi o vrsti motora i goriva
  const kin=deg=>{ const t=rad(deg), s=Math.sin(t), c=Math.cos(t), pinY=G.CY-(R*c+Math.sqrt(L*L-R*R*s*s)); return {top:pinY-PIN, pinY, cpx:CX+R*s, cpy:G.CY-R*c}; };
  const wiebe=(a,a0,da)=>a<a0?0:1-Math.exp(-5*Math.pow((a-a0)/da,3));
  // stanje plina u cilindru pri kutu koljena: tlak (bar), temperatura (K), udio izgorjelog, obujam prema kompresijskom
  function gas(a){
    const vr=1+(kin(a%360).top-G.TDC)/(2*R)*(G.CR-1);
    if(four){
      if(a<180) return {p:.9,T:330,xb:0,vr};
      if(a<540){ const f=1+G.k*wiebe(a,G.a0,G.da), q=G.CR/vr; return {p:.9*Math.pow(q,NEXP)*f, T:330*Math.pow(q,NEXP-1)*f, xb:wiebe(a,G.a0,G.da), vr}; }
      const e=Math.exp(-(a-540)/25); return {p:1.1+(.9*(1+G.k)-1.1)*e, T:750+(330*(1+G.k)-750)*e, xb:1, vr};
    }
    const b=a>180?a-360:a;                        // kut oko GMT: negativan prije, pozitivan poslije
    if(vr<=G.vt){ const xb=wiebe(b,-12,40), f=1+G.k*xb, q=G.vt/vr; return {p:1.05*Math.pow(q,NEXP)*f, T:340*Math.pow(q,NEXP-1)*f, xb, vr}; }
    if(a<180){ const e=Math.exp(-(a-G.aOpen)/18); return {p:1.1+(1.05*(1+G.k)-1.1)*e, T:700+(340*(1+G.k)-700)*e, xb:1, vr}; }
    return {p:1.1,T:400,xb:0,vr};
  }
  function setup(){
    const CR=four?(diesel?18:9.5):9, CLR=2*R/(CR-1), CY=HEAD+CLR+PIN+R+L;
    G={CR,CLR,CY,k:four?(diesel?1.6:2.6):2.4,a0:diesel?352:345,da:40}; G.TDC=kin(0).top; G.BDC=kin(180).top;
    // dvotaktni kanali: ispušni viši od ispirnog (otvara se prvi, zatvara zadnji); usisni u karter otvara suknja klipa
    G.EX={y1:G.TDC+44,y2:G.TDC+66}; G.TR={y1:G.TDC+54,y2:G.TDC+70}; G.IN={y1:G.TDC+68,y2:G.TDC+82};
    G.vt=1+44/(2*R)*(CR-1); G.aOpen=0; if(!four){ for(let a=0;a<180;a++) if(kin(a).top>G.EX.y1){ G.aOpen=a; break; } }
    // krivulja tlaka i energetska bilanca zamašnjaka: moment plina na koljenu minus stalni otpor (vijak)
    const span=four?720:360, lam=R/L; G.P=[]; G.pmax=0; let E=[], e=0, mean=0;
    const tq=a=>{ const t=rad(a), s=Math.sin(t); return (gas(a).p-1)*s*(1+lam*Math.cos(t)/Math.sqrt(1-lam*lam*s*s)); };
    for(let a=0;a<=span;a+=2){ const p=gas(Math.min(a,span-1e-6)).p; G.P.push(p); G.pmax=Math.max(G.pmax,p); mean+=tq(a%span)*2; }
    mean/=span+2; let lo=1e9, hi=-1e9;
    for(let a=0;a<=span;a+=2){ E.push(e); lo=Math.min(lo,e); hi=Math.max(hi,e); e+=(tq(a%span)-mean)*2; }
    G.W=E.map(v=>Math.sqrt(1+.5*((v-lo)/(hi-lo)-.5)));   // brzina vrtnje: oko ±12 % oko srednje
    G.span=span;
  }
  // čestice plina: stalan raspored u jediničnom kvadratu, razvlači se na trenutačni obujam
  const PART=(function(){ let s=7; const rnd=()=>{ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    const P=[]; for(let i=0;i<48;i++) P.push({x:(i%8+.15+.7*rnd())/8, y:(Math.floor(i/8)+.15+.7*rnd())/6, f:rnd(), ph:rnd()*6.28, sp:.6+rnd()});
    P.slice().sort((a,b)=>Math.hypot(a.x-.5,a.y)-Math.hypot(b.x-.5,b.y)).forEach((q,i)=>q.burn=(i+.5)/48); // plamen se širi od svjećice
    return P; })();
  const lift=(x,a,b)=> x>a&&x<b ? Math.sin(Math.PI*(x-a)/(b-a)) : 0;
  const stroke=()=> four? Math.floor(th/180)%4 : (th<180?1:0);
  function draw(){
    const k=kin(th%360), st=stroke(), S=four?strokes4()[st]:strokes2[st], gs=gas(th), CY=G.CY, TDC=G.TDC, BDC=G.BDC, EX=G.EX, TR=G.TR, IN=G.IN;
    const now=RM?0:performance.now()/1000;
    let g='<defs><marker id="eArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#fff"/></marker></defs>';
    g+=`<defs><linearGradient id="eMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d8ba3"/><stop offset=".45" stop-color="#d5e1ea"/><stop offset="1" stop-color="#58728a"/></linearGradient>
      <radialGradient id="eFlame"><stop offset="0" stop-color="#fff3b0"/><stop offset=".35" stop-color="#ffb347"/><stop offset=".8" stop-color="#ff6a1a" stop-opacity=".7"/><stop offset="1" stop-color="#ff4a0a" stop-opacity="0"/></radialGradient>
      <marker id="eRot" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ffd166"/></marker>
      <marker id="eF" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#ff7a45"/></marker></defs>`;
    g+=`<rect width="${W}" height="${H}" fill="#0b1a28" rx="10"/><g transform="translate(0,${DY})">`;
    // karter; četverotaktni ima uljnu kadu, dvotaktni u karteru ima smjesu
    g+=`<path d="M${BX1-30},${CY-R-30} L${BX1-30},${CY+R+14} Q${CX},${CY+R+44} ${BX2+30},${CY+R+14} L${BX2+30},${CY-R-30} Z" fill="#102233" stroke="#2d5578"/>`;
    if(four) g+=`<path d="M${BX1-29},${CY+R+2} L${BX1-29},${CY+R+14} Q${CX},${CY+R+43} ${BX2+29},${CY+R+14} L${BX2+29},${CY+R+2} Z" fill="#c9a24a" opacity=".55"/><text x="${BX1-36}" y="${CY+R+18}" text-anchor="end" font-size="10.5" fill="#c9a24a">ulje u karteru</text><text x="${BX1-36}" y="${CY+R+30}" text-anchor="end" font-size="10.5" fill="#c9a24a">(podmazivanje)</text>`;
    const exOpen=!four && k.top>EX.y1, trOpen=!four && k.top>TR.y1;
    // plin u cilindru: boja po stanju, gustoća čestica po obujmu
    const hot=Math.min(1,Math.max(0,(gs.T-600)/1500)), burnt=gs.xb>0;
    const tint=burnt?(four&&st===3||(!four&&exOpen)?'#8fa6b8':'#ff7a45'):'#39b8e8';
    g+=`<rect x="${BX1}" y="${HEAD}" width="${BX2-BX1}" height="${(k.top-HEAD).toFixed(1)}" fill="${tint}" opacity="${(.1+.3*Math.min(1,gs.p/G.pmax)).toFixed(2)}"/>`;
    { // koliko je plina u cilindru (udio pune količine)
      let fill=1, fresh=1;
      if(four){ const res=.45/G.CR; if(st===0) fill=res+(1-res)*(gs.vr-1)/(G.CR-1); else if(st===3) fill=(1-.55*(1-Math.exp(-(th-540)/25)))*gs.vr/G.CR; }
      else if(exOpen){ // ispiranje: svježa smjesa ulazi dolje kroz ispirni kanal i potiskuje izgorjele plinove prema ispuhu
        fresh=th<180?.5*Math.min(1,Math.max(0,(k.top-TR.y1)/(BDC-TR.y1))):.5+.5*Math.min(1,(th-180)/Math.max(1,180-G.aOpen));
        fill=th<180?1-.35*Math.min(1,(th-G.aOpen)/25)*(1-fresh/.5):1; }
      const hgt=k.top-HEAD-6, amp=RM?0:.8+2.2*Math.sqrt(gs.T/2200); let dots='';
      if(hgt>1) PART.forEach(q=>{ if(q.f>fill) return;
        const isB=four?(st>=2&&q.burn<gs.xb)||st===3:(exOpen?!(q.f<fresh&&q.y>1-2*fresh):q.burn<gs.xb);
        const fuel=!isB&&!diesel&&Math.round(q.ph*10)%5===0;
        const col=isB?((four&&st===3)||(!four&&exOpen)?'#6d7f8d':'#ff7a45'):fuel?'#e0a020':'#1f8fc4';
        const x=BX1+7+q.x*(BX2-BX1-14)+Math.sin(now*q.sp*7+q.ph)*amp, y=HEAD+3+q.y*hgt+Math.cos(now*q.sp*6+q.ph*2)*Math.min(amp,hgt/3);
        dots+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${fuel?2.3:2}" fill="${col}"/>`; });
      g+=`<g data-keep-dark="1">${dots}</g>`; }
    // glava i stijenke cilindra
    const wallBot=BDC+PH+6;
    g+=`<rect x="${BX1-14}" y="${HEAD-20}" width="${BX2-BX1+28}" height="20" fill="#13283a" stroke="#2d5578"/>`;
    // plašt hlađenja: kanal s vodom oko stijenki (kod dvotaktnog iznad kanala)
    const jBot=four?wallBot-8:EX.y1-6, flow=RM?0:(performance.now()/60)%16;
    [[BX1-15,-1],[BX2+4,1]].forEach(([jx,sd])=>{ g+=`<rect x="${jx}" y="${HEAD-14}" width="11" height="${jBot-HEAD+14}" rx="3" fill="#0f4f78" stroke="#2f7fb0" stroke-width=".8"/>`;
      g+=`<line x1="${jx+5.5}" y1="${sd<0?jBot:HEAD-12}" x2="${jx+5.5}" y2="${sd<0?HEAD-12:jBot}" stroke="#7fd8f7" stroke-width="2" stroke-dasharray="3 13" stroke-dashoffset="${-flow}" stroke-linecap="round"/>`; });
    g+=`<text x="${BX2+20}" y="${HEAD+26}" font-size="10.5" fill="#7fd8f7">hlađenje vodom</text>`;
    g+=`<line x1="${BX1}" y1="${HEAD}" x2="${BX1}" y2="${wallBot}" stroke="#5b8bab" stroke-width="3"/><line x1="${BX2}" y1="${HEAD}" x2="${BX2}" y2="${wallBot}" stroke="#5b8bab" stroke-width="3"/>`;
    // paljenje (4T: oko 360°, 2T: oko 0°): kut prije (−) ili poslije (+) GMT
    const sp=four?360:0, cyc=G.span, rel=((th-sp)%cyc+cyc*1.5)%cyc-cyc/2;
    if(!diesel){ // benzin: svjećica, iskra malo PRIJE GMT (pretpaljenje)
      g+=`<rect x="${CX-6}" y="${HEAD-46}" width="12" height="10" rx="2" fill="#39434c"/><rect x="${CX-5}" y="${HEAD-36}" width="10" height="16" rx="2" fill="#eef3f6" stroke="#8fa6b8" stroke-width=".8"/><rect x="${CX-2}" y="${HEAD-20}" width="4" height="20" fill="#8fa6b8"/>`;
      g+=`<text x="${CX}" y="${four?HEAD-60:HEAD-50}" text-anchor="middle" font-size="11" fill="${C.txt2}">svjećica</text>`;
      if(rel>-16 && rel<-1){ const k2=1-Math.abs(rel+8)/8;
        g+=`<path d="M${CX},${HEAD+1} l-4,5 l5,1 l-3,6" stroke="#fff6b0" stroke-width="1.6" fill="none"/><circle cx="${CX}" cy="${HEAD+5}" r="${(5+k2*6).toFixed(1)}" fill="#ffe27a" opacity="${(.35+k2*.5).toFixed(2)}"/>`; }
    } else { // dizel: brizgaljka; gorivo se ubrizga u vrući zrak i samo zapali
      g+=`<rect x="${CX-7}" y="${HEAD-48}" width="14" height="28" rx="3" fill="#39434c" stroke="#8fa6b8" stroke-width=".8"/><rect x="${CX-3}" y="${HEAD-20}" width="6" height="20" fill="#8fa6b8"/>`;
      g+=`<text x="${CX}" y="${HEAD-60}" text-anchor="middle" font-size="11" fill="${C.txt2}">brizgaljka</text>`;
      if(rel>-9 && rel<14){ const d=Math.min(15,k.top-HEAD+8); g+=`<path d="M${CX},${HEAD+1} L${CX-20},${HEAD+d} M${CX},${HEAD+1} L${CX},${HEAD+d+2} M${CX},${HEAD+1} L${CX+20},${HEAD+d}" stroke="#ffe8a0" stroke-width="2" stroke-dasharray="2 2" opacity=".95"/>`; }
    }
    if(rel>=-6 && rel<45){ const f2=Math.max(0,1-rel/45)*Math.min(1,gs.xb*3+.25); g+=`<ellipse cx="${CX}" cy="${(HEAD+k.top)/2}" rx="${(BX2-BX1)/2-4}" ry="${Math.max(3,(k.top-HEAD)/2)}" fill="url(#eFlame)" opacity="${(f2*.8).toFixed(2)}"/>`; }
    if(four){
      // idealizirani razvod: usis 0–180°, ispuh 540–720° (bez preklapanja, kao u udžbeniku)
      const li=lift(th,0,180)*12, le=lift(th,540,720)*12;
      const valve=(x,lf,col,lab,sub,side)=>{
        const y=HEAD+lf, open=lf>1, px=side<0?BX1-96:BX2+16;
        let v=`<rect x="${px}" y="${HEAD-34}" width="80" height="26" rx="3" fill="${open?col:'#1d3a52'}" opacity="${open?.55:1}"/>`;
        v+=`<text x="${px+40}" y="${HEAD-23}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${open?'#fff':C.txt2}">${lab}</text><text x="${px+40}" y="${HEAD-12}" text-anchor="middle" font-size="9.5" fill="${open?'#fff':C.txt2}">${sub}</text>`;
        const top=HEAD-41+lf; // vrh čašice: brijeg ga gura dolje
        let spr='M'+(x-8)+','+(HEAD-20); const n=7; for(let q=1;q<=n;q++){ const yy=HEAD-20-(HEAD-20-(top+6))*q/n; spr+=' L'+(x+(q%2?8:-8))+','+yy.toFixed(1); }
        v+=`<path d="${spr}" stroke="#c9a24a" stroke-width="1.6" fill="none"/>`;
        v+=`<line x1="${x}" y1="${top+4}" x2="${x}" y2="${y}" stroke="#9fb6c9" stroke-width="3"/><rect x="${x-9}" y="${top}" width="18" height="6" rx="1.5" fill="url(#eMetal)"/>`;
        v+=`<path d="M${x-13},${y} L${x+13},${y} L${x+5},${y-5} L${x-5},${y-5} Z" fill="${open?col:'#6d8ba3'}"/>`;
        if(lf>3){
          if(side<0) v+=`<path d="M${px+80},${HEAD-18} L${x-16},${HEAD-18} L${x-9},${HEAD+lf+8}" fill="none" stroke="#fff" stroke-width="1.5" marker-end="url(#eArr)" opacity=".85"/>`;
          else v+=`<path d="M${x+9},${HEAD+lf+8} L${x+16},${HEAD-18} L${px+2},${HEAD-18}" fill="none" stroke="#fff" stroke-width="1.5" marker-end="url(#eArr)" opacity=".85"/>`;
        }
        return v;
      };
      g+=valve(CX-34,li,C.green,'USIS',diesel?'samo zrak':'zrak + benzin',-1);
      g+=valve(CX+34,le,'#ff7a45','ISPUH','izgorjeli plinovi',1);
      // bregasta osovina: kut = pola kuta koljena (1 okretaj bregaste = 2 okretaja koljena)
      const cam=th/2, CYc=HEAD-50;
      const lobe=(x,peak)=>{ const a=(cam-peak)*Math.PI/180; // brijeg gleda prema dolje kad je cam = peak
        let d=''; for(let q=0;q<=36;q++){ const t=q/36*2*Math.PI, tt=t>Math.PI?t-2*Math.PI:t, rr=Math.abs(tt)<Math.PI/4?9+12*Math.cos(2*tt):9; // profil: podizaj 12·cos(2δ) kao ventil
          const px=x+Math.sin(t+a)*rr*-1, py=CYc+Math.cos(t+a)*rr; d+=(q?'L':'M')+px.toFixed(1)+','+py.toFixed(1); }
        return `<path d="${d}Z" fill="url(#eMetal)" stroke="#39434c" stroke-width=".8"/><circle cx="${x}" cy="${CYc}" r="2.2" fill="#2a343c"/>`; };
      g+=`<rect x="${CX-64}" y="${CYc-3}" width="128" height="6" rx="3" fill="#58728a"/>`;
      g+=lobe(CX-34,45)+lobe(CX+34,315);
      const mark=(cx,cy,r,ang,col)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="2"/><line x1="${cx}" y1="${cy}" x2="${(cx+Math.sin(ang*Math.PI/180)*r).toFixed(1)}" y2="${(cy-Math.cos(ang*Math.PI/180)*r).toFixed(1)}" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`;
      g+=mark(CX+86,CYc,11,cam,'#ffd166')+`<text x="${CX+102}" y="${CYc-2}" font-size="10.5" fill="#ffd166">bregasta</text><text x="${CX+102}" y="${CYc+9}" font-size="10.5" fill="#ffd166">${Math.round(cam)%360}°</text>`;
      g+=`<text x="${CX}" y="${CYc-28}" text-anchor="middle" font-size="10.5" fill="${C.txt2}">bregasta osovina: 1 okretaj na 2 okretaja koljena</text>`;
    } else {
      const skirt=k.top+PH, inOpen=skirt<IN.y1;
      g+=`<rect x="${BX2-2}" y="${EX.y1}" width="40" height="${EX.y2-EX.y1}" fill="${exOpen?'#8fa6b8':'#1d3a52'}" opacity="${exOpen?.7:1}"/>`;
      g+=`<text x="${BX2+42}" y="${EX.y1+14}" font-size="10.5" font-weight="700" fill="${exOpen?'#cfd9e2':C.txt2}">ispušni</text>`;
      // ispirni kanal (lijevo): vodi iz kartera do stijenke cilindra
      g+=`<path d="M${BX1-30},${CY-R-26} L${BX1-30},${TR.y1} L${BX1+2},${TR.y1} L${BX1+2},${TR.y2} L${BX1-16},${TR.y2} L${BX1-16},${CY-R-26} Z" fill="${trOpen?'#39b8e8':'#1d3a52'}" opacity="${trOpen?.6:1}" stroke="#2d5578"/>`;
      g+=`<text x="${BX1-34}" y="${TR.y1-8}" text-anchor="end" font-size="10.5" font-weight="700" fill="${trOpen?'#7fd8f7':C.txt2}">ispirni</text>`;
      // usisni kanal u karter (desno, nisko): otvara ga suknja klipa kad se klip digne
      g+=`<rect x="${BX2-2}" y="${IN.y1}" width="40" height="${IN.y2-IN.y1}" fill="${inOpen?C.green:'#1d3a52'}" opacity="${inOpen?.6:1}"/>`;
      g+=`<text x="${BX2+42}" y="${IN.y1+12}" font-size="10.5" font-weight="700" fill="${inOpen?'#5fe39b':C.txt2}">usisni</text>`;
      // smjesa u karteru: puni se dok klip ide gore, sabija dok ide dolje
      const cc = th>=180 ? .15+.35*((th-180)/180) : .5-.3*(th/180);
      g+=`<ellipse cx="${CX}" cy="${CY+8}" rx="${R+40}" ry="${R+6}" fill="#39b8e8" opacity="${cc.toFixed(2)}"/>`;
      g+=`<text x="${CX}" y="${CY+R+34}" text-anchor="middle" font-size="10.5" fill="${C.txt2}">karter: smjesa zraka, benzina i ulja</text>`;
      if(exOpen) g+=`<path d="M${BX2-26},${EX.y1+11} L${BX2+34},${EX.y1+11}" stroke="#fff" stroke-width="1.5" marker-end="url(#eArr)"/>`;
      if(trOpen) g+=`<path d="M${BX1+4},${TR.y1+8} Q${BX1+20},${HEAD+10} ${CX},${HEAD+10}" fill="none" stroke="#fff" stroke-width="1.5" marker-end="url(#eArr)"/>`;
      if(inOpen) g+=`<path d="M${BX2+34},${IN.y1+8} L${BX2-8},${IN.y1+8}" stroke="#fff" stroke-width="1.5" marker-end="url(#eArr)"/>`;
    }
    // klip s prstenima i osovinicom
    g+=`<rect x="${BX1+2}" y="${k.top.toFixed(1)}" width="${BX2-BX1-4}" height="${PH}" rx="3" fill="#9fb6c9"/>`;
    g+=`<rect x="${BX1+2}" y="${(k.top+5).toFixed(1)}" width="${BX2-BX1-4}" height="2.5" fill="#6d8ba3"/><rect x="${BX1+2}" y="${(k.top+11).toFixed(1)}" width="${BX2-BX1-4}" height="2.5" fill="#6d8ba3"/>`;
    // sila plina na klip: strelica je dulja što je tlak veći; narančasta dok plin gura klip, siva dok klip sabija plin
    { const F=Math.min(46,(gs.p-1)*1.1), down=Math.sin(rad(th%360))>0; if(F>4) g+=`<line x1="${CX}" y1="${(k.top+4).toFixed(1)}" x2="${CX}" y2="${(k.top+4+F).toFixed(1)}" stroke="${down?'#ff7a45':'#6d7f8d'}" stroke-width="4" ${down?'marker-end="url(#eF)"':''} data-keep-dark="1"/>`; }
    // koljenasto vratilo sa zamašnjakom i protuutegom, klipnjača
    const a=rad(th%360);
    g+=`<circle cx="${CX}" cy="${CY}" r="${R+12}" fill="#15293c" stroke="#37627f" stroke-width="1.5"/>`;
    const cw=(o)=>`${CX+Math.sin(a+Math.PI+o)*(R+8)},${CY-Math.cos(a+Math.PI+o)*(R+8)}`;
    g+=`<path d="M${CX},${CY} L${cw(-.75)} A${R+8},${R+8} 0 0 1 ${cw(.75)} Z" fill="#2d5578"/>`;
    g+=`<line x1="${CX}" y1="${CY}" x2="${k.cpx}" y2="${k.cpy}" stroke="#7f9bb0" stroke-width="11" stroke-linecap="round"/>`;
    g+=`<line x1="${CX}" y1="${k.pinY}" x2="${k.cpx}" y2="${k.cpy}" stroke="#c8d6e2" stroke-width="7" stroke-linecap="round"/>`;
    g+=`<circle cx="${CX}" cy="${k.pinY}" r="5" fill="#0b1a28" stroke="#c8d6e2" stroke-width="2"/>`;
    g+=`<circle cx="${k.cpx}" cy="${k.cpy}" r="5" fill="#0b1a28" stroke="#c8d6e2" stroke-width="2"/><circle cx="${CX}" cy="${CY}" r="6" fill="#c8d6e2"/>`;
    { const rr=R+20, p=(d)=>[(CX+Math.sin(d*Math.PI/180)*rr).toFixed(1),(CY-Math.cos(d*Math.PI/180)*rr).toFixed(1)], a1=p(40), a2=p(120);
      g+=`<path d="M${a1[0]},${a1[1]} A${rr},${rr} 0 0 1 ${a2[0]},${a2[1]}" fill="none" stroke="#ffd166" stroke-width="2" marker-end="url(#eRot)"/><text x="${(CX+rr+6).toFixed(1)}" y="${CY+20}" font-size="10.5" fill="#ffd166">zamašnjak i koljeno</text><text x="${(CX+rr+6).toFixed(1)}" y="${CY+32}" font-size="10.5" fill="#ffd166">${Math.round(th%360)}°</text>`; }
    // GMT / DMT: kod dvotaktnog lijevo od ispirnog kanala
    const tk=(y,t)=> four
      ? `<line x1="${BX1-12}" y1="${y}" x2="${BX1-2}" y2="${y}" stroke="${C.txt2}"/><text x="${BX1-20}" y="${y+4}" text-anchor="end" font-size="10.5" fill="${C.txt2}">${t}</text>`
      : `<line x1="${BX1-44}" y1="${y}" x2="${BX1-34}" y2="${y}" stroke="${C.txt2}"/><text x="${BX1-48}" y="${y+4}" text-anchor="end" font-size="10.5" fill="${C.txt2}">${t}</text>`;
    [TDC,BDC].forEach(y=>{ g+=`<line x1="${BX1-(four?12:44)}" y1="${y}" x2="${BX2+10}" y2="${y}" stroke="#e6eef5" stroke-width="1" stroke-dasharray="5 4" opacity=".55"/>`; });
    g+=tk(TDC,'GMT')+tk(BDC,'DMT');
    g+=`</g>`;
    // naslov takta i očitanja
    const N=four?4:2, span=G.span, bx=18, bw=W-36, by=H-20, ch=44, cy0=by-16;
    g+=`<text x="${W-16}" y="24" text-anchor="end" font-size="14" font-weight="800" fill="${S[2]}">${four?(st+1)+'. ':''}${S[0]}</text>`;
    g+=`<text x="16" y="22" font-size="11" fill="${C.txt2}">tlak u cilindru <tspan font-weight="800" fill="#fff">${gs.p<10?gs.p.toFixed(1).replace('.',','):Math.round(gs.p)} bar</tspan></text>`;
    g+=`<text x="16" y="38" font-size="11" fill="${C.txt2}">plin <tspan font-weight="800" fill="#fff">${Math.round((gs.T-273)/10)*10} °C</tspan></text>`;
    // krivulja tlaka kroz ciklus: površina ispod vrha u radnom taktu je rad koji motor daje
    let pts=''; G.P.forEach((p,i)=>{ pts+=(bx+bw*i*2/span).toFixed(1)+','+(cy0-ch*p/G.pmax).toFixed(1)+' '; });
    g+=`<polyline points="${bx},${cy0} ${pts}${bx+bw},${cy0}" fill="#ff7a45" fill-opacity=".14" stroke="#ff7a45" stroke-width="1.6" stroke-linejoin="round"/>`;
    g+=`<text x="${bx}" y="${cy0-ch-4}" font-size="10.5" fill="${C.txt2}">tlak kroz ciklus (vrh: oko ${Math.round(G.pmax/5)*5} bara)</text>`;
    const lbl=four?['usis','kompresija','ekspanzija','ispuh']:['ekspanzija','izmjena + kompresija'];
    const cols=four?strokes4().map(x=>x[2]):['#ff7a45',C.acc];
    const cur=four?st:(th<180?0:1);
    for(let i=0;i<N;i++){
      const x=bx+bw*i/N, on=cur===i;
      g+=`<rect x="${x+1}" y="${by}" width="${bw/N-2}" height="8" rx="3" fill="${cols[i]}" opacity="${on?1:.25}"/>`;
      g+=`<text x="${x+bw/N/2}" y="${by-4}" text-anchor="middle" font-size="10.5" fill="${on?cols[i]:C.txt2}">${lbl[i]}</text>`;
    }
    const mx=bx+bw*th/span;
    g+=`<line x1="${mx.toFixed(1)}" y1="${cy0-ch}" x2="${mx.toFixed(1)}" y2="${by+10}" stroke="#fff" stroke-width="1.5"/><circle cx="${mx.toFixed(1)}" cy="${(cy0-ch*gs.p/G.pmax).toFixed(1)}" r="3.5" fill="#ff7a45" stroke="#fff" stroke-width="1.2"/>`;
    stage.innerHTML=SVG(W,H,g);
    el('engineInfo').innerHTML=`<div class="note"><b>${four?(st+1)+'. ':''}${S[0]}</b>${S[1]}</div>`;
    const rg=el('engAngle'); if(rg){ rg.max=span-1; if(document.activeElement!==rg) rg.value=Math.round(th); }
  }
  function loop(ts){
    if(!running) return;
    if(!last) last=ts;
    const dt=Math.min(.05,(ts-last)/1000); last=ts;
    // sporo: ciklus oko 9 s (4T) odnosno 7 s (2T); brzina se mijenja kako zamašnjak prima i daje energiju
    th=(th+dt*(four?80:50)*G.W[Math.floor(th/2)%G.W.length])%G.span;
    draw(); raf=requestAnimationFrame(loop);
  }
  const idleTxt=RM?'Sljedeći takt':'Pokreni';
  el('engBtn').parentNode.insertAdjacentHTML('beforeend','<input type="range" id="engAngle" min="0" max="719" step="1" value="0" aria-label="Kut koljenastog vratila: povuci za ručno okretanje motora" style="flex:1;min-width:180px;accent-color:var(--acc);align-self:center">');
  el('engAngle').addEventListener('input',e=>{ running=false; cancelAnimationFrame(raf); el('engBtn').textContent=idleTxt; th=+e.target.value; draw(); });
  el('engBtn').textContent=idleTxt;
  el('engBtn').addEventListener('click',function(){
    if(RM){ th=(Math.floor(th/180)*180+180+10)%G.span; draw(); return; }
    running=!running; this.textContent=running?'Pauza':'Pokreni';
    if(running){ last=0; raf=requestAnimationFrame(loop); } else cancelAnimationFrame(raf);
  });
  el('engType').insertAdjacentHTML('afterend','<button class="btn" id="engFuel" type="button">Gorivo: benzin (svjećica)</button>');
  const fuelTxt=()=>{ const f=el('engFuel'); f.disabled=!four; f.textContent=!four?'Gorivo: benzin s uljem':diesel?'Gorivo: dizel (brizgaljka)':'Gorivo: benzin (svjećica)'; };
  el('engFuel').addEventListener('click',function(){ diesel=!diesel; setup(); fuelTxt(); draw(); });
  // plin se giba i voda teče i kad motor stoji na pauzi (rijetko osvježavanje), osim uz smanjeno kretanje
  if(!RM){ let lastJ=0; const jl=ts=>{ requestAnimationFrame(jl); if(running||ts-lastJ<120) return; lastJ=ts; const r=stage.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight||!stage.offsetParent) return; draw(); }; requestAnimationFrame(jl); }
  el('engType').addEventListener('click',function(){
    four=!four; if(!four) diesel=false; setup(); th=four?0:180; fuelTxt();
    this.textContent=four?'Prebaci na dvotaktni':'Prebaci na četverotaktni';
    draw();
  });
  setup(); draw();
})();

/* ═══════════════ COOLING ═══════════════ */
(function(){
  const b=el('coolingWidget'); if(!b) return;
  const W=680,H=230;
  let g=`<rect width="${W}" height="${H}" fill="#0b1a28" rx="10"/>`;
  // direct
  g+=`<text x="170" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="${C.green}">IZRAVNO (direktno)</text>`;
  g+=`<text x="170" y="44" text-anchor="middle" font-size="11" fill="${C.txt2}">morska voda ULAZI u motor · jeftinije, češće</text>`;
  g+=`<rect x="110" y="88" width="120" height="70" rx="8" fill="#1d3a52" stroke="#37627f" stroke-width="2"/><text x="170" y="128" text-anchor="middle" font-size="13" fill="#cfe" font-weight="700">MOTOR</text>`;
  g+=`<path d="M30,190 L30,123 L108,123" fill="none" stroke="${C.acc}" stroke-width="3" marker-end="url(#ah2)"/>`;
  g+=`<path d="M232,123 L300,123 L300,190" fill="none" stroke="#ff7a45" stroke-width="3" marker-end="url(#ah3)"/>`;
  g+=`<text x="26" y="206" font-size="10.5" fill="${C.acc}">ulaz mora (ventil!)</text>`;
  g+=`<text x="272" y="206" font-size="10.5" fill="#ff7a45">izlaz: mlaz</text>`;
  g+=`<line x1="340" y1="16" x2="340" y2="${H-16}" stroke="${C.line}" stroke-dasharray="6 5"/>`;
  // indirect
  g+=`<text x="510" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="${C.yellow}">NEIZRAVNO (indirektno)</text>`;
  g+=`<text x="510" y="44" text-anchor="middle" font-size="11" fill="${C.txt2}">motor hladi SLATKA voda iz hladnjaka (kilera)</text>`;
  g+=`<rect x="390" y="88" width="105" height="70" rx="8" fill="#1d3a52" stroke="#37627f" stroke-width="2"/><text x="442" y="128" text-anchor="middle" font-size="12" fill="#cfe" font-weight="700">MOTOR</text>`;
  g+=`<rect x="540" y="88" width="105" height="70" rx="8" fill="#153a30" stroke="${C.green}" stroke-width="2"/><text x="592" y="122" text-anchor="middle" font-size="12" fill="#bfe" font-weight="700">HLADNJAK</text><text x="592" y="140" text-anchor="middle" font-size="10" fill="${C.txt2}">(kiler)</text>`;
  g+=`<path d="M495,106 L540,106" stroke="#ff7a45" stroke-width="3" marker-end="url(#ah3)"/>`;
  g+=`<path d="M540,142 L495,142" stroke="${C.acc}" stroke-width="3" marker-end="url(#ah2)"/>`;
  g+=`<text x="517" y="84" font-size="9.5" text-anchor="middle" fill="#ff7a45">topla</text>`; // iznad strelice, vrh strelice ga ne prekriva
  g+=`<text x="517" y="160" font-size="9.5" text-anchor="middle" fill="${C.acc}">hladna</text>`;
  g+=`<path d="M592,190 L592,162" stroke="${C.acc}" stroke-width="3" marker-end="url(#ah2)"/>`;
  g+=`<text x="592" y="206" font-size="10.5" text-anchor="middle" fill="${C.acc}">morska voda hladi kiler</text>`;
  g+=`<text x="442" y="180" font-size="10" text-anchor="middle" fill="${C.green}">zatvoreni krug: slatka voda</text>`;
  const defs=`<defs><marker id="ah2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="${C.acc}"/></marker>
    <marker id="ah3" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="#ff7a45"/></marker></defs>`;
  b.innerHTML=SVG(W,H,defs+g);
})();
