"use strict";
/* Fizika brodice za simulator pristajanja. Bez crtanja i bez DOM-a, pa se isti kod vrti i u testu (tests/fizika.mjs).

   Model s tri stupnja slobode u stvarnim jedinicama (m, s, N):
     u  brzina naprijed, v  bočna brzina (+ udesno), r  brzina zakreta (+ u smjeru kazaljke, rad/s)
     m_x·(u̇ − v·r) = X     m_y·(v̇ + u·r) = Y     I_z·ṙ = N
   Sile: poriv vijka, otpor trupa (uzdužno mali, bočno velik), kormilo koje radi samo dok preko njega struji voda
   (brzina brodice + mlaz vijka pri vožnji naprijed), izboj krme pri vožnji krmom (desnokretni vijak: krma ulijevo),
   vjetar na nadvođe (hvatište ispred sredine, pa pramac pada niz vjetar) i struja koja nosi cijelu vodenu masu.

   Položaj je u metrima u koordinatama zaslona: x prema istoku (desno), y prema jugu (dolje).
   Kurs psi je u stupnjevima, 0 = sjever (gore), raste u smjeru kazaljke. */
const BoatPhys=(function(){
  const KN=0.5144, RHO=1025, RHO_A=1.2, D2R=Math.PI/180;
  // brodica 6 m, oko 1,4 t, ugrađeni motor, desnokretni vijak, kormilo iza vijka
  const B={L:6, m:1400, mx:1550, my:2500, Iz:5200,
    Xu:90, Xuu:150,               // uzdužni otpor: 2 čv na „polako“, 4 čv na „naprijed“
    Yv:600, Yuv:900, Yvv:1500, xh:.9,  // bočni otpor: trup se bočno teško gura; pri zanošenju sila djeluje ispred sredine
    Nr:3000, Nur:1500, Nrr:12000, // prigušenje zakreta
    xr:-2.8, Ar:.12, CL:3, kT:1.2,     // kormilo: položaj, površina, uzgon, udio poriva koji mlaz vijka skrene u stranu
    walk:.25,                     // izboj krme: udio poriva koji pri vožnji krmom gura krmu ulijevo
    ArOb:.07, walkOb:.06,         // izvanbrodski motor: mala peraja umjesto kormila, slab izboj krme
    Af:2.5, Al:7, Cx:.8, Cy:.9, xw:.5, // nadvođe: čeona i bočna površina, hvatište vjetra
    T:{'-2':-420,'-1':-160,'0':0,'1':252,'2':821}, // poriv po položaju ručice (N)
    rudMax:35, rudRate:25 };      // kormilo: najveći otklon (°) i brzina zakretanja (°/s)
  const THR=[-2,-1,0,1,2];
  const clamp=(x,a,b)=>x<a?a:x>b?b:x;

  // ob: izvanbrodski motor (zakreće se cijeli poriv); inače ugrađeni motor s kormilom iza vijka
  function create(o){ return Object.assign({x:0,y:0,psi:0,u:0,v:0,r:0,thr:0,rud:0,T:0,del:0,ob:false},o); }
  // sile u sustavu brodice; env={cur:[x,y], wind:[x,y]} u m/s, vektor pokazuje KAMO voda ili zrak ide
  function forces(s,env){
    const q=s.psi*D2R, sn=Math.sin(q), c=Math.cos(q);
    const g=ground(s,env), ax=env.wind[0]-g[0], ay=env.wind[1]-g[1];       // prividni vjetar
    const wa=ax*sn-ay*c, wb=ax*c+ay*sn;                                     // uzduž i poprijeko brodice
    const Xw=.5*RHO_A*B.Cx*B.Af*wa*Math.abs(wa), Yw=.5*RHO_A*B.Cy*B.Al*wb*Math.abs(wb);
    // ugrađeni motor: kormilo skreće mlaz vijka (samo pri vožnji naprijed) i vodu koja struji zbog brzine brodice.
    // izvanbrodski: zakreće se cijeli poriv, i naprijed i krmom; bez poriva ostaje samo mala peraja.
    const d=s.del*D2R, ob=s.ob, sd=Math.sin(d);
    const hyd=.5*RHO*(ob?B.ArOb:B.Ar)*B.CL*s.u*Math.abs(s.u), jet=ob?s.T:(s.T>0?B.kT*s.T:0);
    const Yr=-sd*(jet+hyd);
    const Yp=s.T<0?-(ob?B.walkOb:B.walk)*Math.abs(s.T):0;                   // izboj krme
    const Yl=-B.Yuv*Math.abs(s.u)*s.v;                                      // uzgon trupa kad brodica klizi bočno
    const X=(ob?s.T*Math.cos(d):s.T)-(B.Xu*s.u+B.Xuu*s.u*Math.abs(s.u))-(ob?Math.abs(hyd)*sd*sd*.5:Math.abs(Yr*sd)*.5)+Xw;
    const Y=-(B.Yv*s.v+B.Yvv*s.v*Math.abs(s.v))+Yl+Yr+Yp+Yw;
    const N=-((B.Nr+B.Nur*Math.abs(s.u))*s.r+B.Nrr*s.r*Math.abs(s.r))+Yl*B.xh*Math.sign(s.u)+(Yr+Yp)*B.xr+Yw*B.xw;
    // vanjska sila (npr. privezni konop): s.ext=[Fx,Fy,xf], sila u koordinatama zaslona, hvatište xf metara ispred sredine
    if(s.ext){ const Xe=s.ext[0]*sn-s.ext[1]*c, Ye=s.ext[0]*c+s.ext[1]*sn; return {X:X+Xe,Y:Y+Ye,N:N+Ye*s.ext[2],Yw,Yr,Yp,wa,wb}; }
    return {X,Y,N,Yw,Yr,Yp,wa,wb};
  }
  // brzina nad dnom (m/s) u koordinatama zaslona
  function ground(s,env){ const q=s.psi*D2R, sn=Math.sin(q), c=Math.cos(q);
    return [s.u*sn+s.v*c+env.cur[0], -s.u*c+s.v*sn+env.cur[1]]; }
  function step(s,env,dt){
    const n=Math.max(1,Math.ceil(dt/.02)), h=dt/n;
    for(let i=0;i<n;i++){
      s.T+=(B.T[s.thr]-s.T)*Math.min(1,h/.6);                               // stroj ne mijenja poriv trenutačno
      s.del+=clamp(clamp(s.rud,-B.rudMax,B.rudMax)-s.del,-B.rudRate*h,B.rudRate*h);
      const F=forces(s,env);
      const du=(F.X+B.m*s.v*s.r)/B.mx, dv=(F.Y-B.m*s.u*s.r)/B.my, dr=F.N/B.Iz;
      s.u+=du*h; s.v+=dv*h; s.r+=dr*h;
      const g=ground(s,env); s.x+=g[0]*h; s.y+=g[1]*h; s.psi+=s.r/D2R*h;
    }
    return s;
  }
  return {B,THR,KN,create,step,forces,ground,clamp};
})();

/* Lučica za vježbu pristajanja: obala lijevo, dvije privezane brodice i prazan vez između njih.
   Geometrija je u pikselima crteža (640 × 460), 9,6 px = 1 m: lučica je 67 × 48 m, a brodica duga 6 m. */
const DockWorld=(function(){
  const PPM=9.6, W=640, H=460, QX=112, BERTH=[168,252], D2R=Math.PI/180;
  const HULL=[[0,-30.4],[9.5,-16],[13.5,0],[13.3,14],[12.8,27.2],[-12.8,27.2],[-13.3,14],[-13.5,0],[-9.5,-16]];
  const moorPoly=(cx,cy,flip)=>HULL.map(([x,y])=>[cx+x*1.375*(flip?-1:1), cy+y*1.375*(flip?-1:1)]);
  const MOORC=[[QX+22,107,0],[QX+22,335,180]], MOOR=MOORC.map(([x,y,h])=>moorPoly(x,y,h===180));
  const LIM={hit:.36, gap:1.25, par:12, slow:.26, hold:1.2};   // udarac (m/s), razmak od obale (m), kut (°), „stoji“ (m/s), koliko dugo (s)
  const KN=BoatPhys.KN;
  // jačine: vjetar u čvorovima, struja u čvorovima
  const STR=[{n:'slab',wind:6,cur:.3},{n:'umjeren',wind:12,cur:.6},{n:'jak',wind:20,cur:1}];
  const ENV={
    calm:{n:'Mirno',cur:[0,0],wind:[0,0],into:null},
    curS:{n:'Struja prema jugu',cur:[0,1],wind:[0,0],into:0,what:'struju'},
    curN:{n:'Struja prema sjeveru',cur:[0,-1],wind:[0,0],into:180,what:'struju'},
    windN:{n:'Vjetar sa sjevera',cur:[0,0],wind:[0,1],into:0,what:'vjetar'},
    windS:{n:'Vjetar s juga',cur:[0,0],wind:[0,-1],into:180,what:'vjetar'},
    windOff:{n:'Vjetar s kopna',cur:[0,0],wind:[1,0],into:null,what:'vjetar',cross:'off'},
    windOn:{n:'Vjetar s mora',cur:[0,0],wind:[-1,0],into:null,what:'vjetar',cross:'on'}
  };
  const env=(key,str)=>{ const E=ENV[key], S=STR[str]; return {cur:E.cur.map(c=>c*S.cur*KN), wind:E.wind.map(w=>w*S.wind*KN)}; };
  const start=()=>BoatPhys.create({x:480/PPM,y:400/PPM,psi:-25});
  const hull=s=>{ const q=s.psi*D2R, c=Math.cos(q), n=Math.sin(q); return HULL.map(([x,y])=>[s.x*PPM+x*c-y*n, s.y*PPM+x*n+y*c]); };
  const inside=(p,poly)=>{ let ok=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i], b=poly[j];
    if((a[1]>p[1])!==(b[1]>p[1]) && p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) ok=!ok; } return ok; };
  /* Jedan korak svijeta. w={s,env,hold,chk}; vraća null dok traje, inače {ok, why, ...}. */
  function tick(w,dt){
    const s=w.s; s.ext=null;
    if(w.line){ // pramčani konop: ne gura, samo zateže kad je napet (opruga s prigušenjem)
      const q=s.psi*D2R, sn=Math.sin(q), c=Math.cos(q), bx=s.x+BOW*sn, by=s.y-BOW*c, dx=w.line.x-bx, dy=w.line.y-by, d=Math.hypot(dx,dy)||1e-6;
      if(d>w.line.L){ const g=BoatPhys.ground(s,w.env), vx=g[0]+BOW*c*s.r, vy=g[1]+BOW*sn*s.r, ux=dx/d, uy=dy/d, T=Math.max(0,4000*(d-w.line.L)-3000*(vx*ux+vy*uy));
        s.ext=[T*ux,T*uy,BOW]; w.line.T=T; } else w.line.T=0; }
    BoatPhys.step(s,w.env,dt);
    let P=hull(s), k=0; for(let i=1;i<P.length;i++) if(P[i][0]<P[k][0]) k=i;
    w.touch=false;
    if(P[k][0]<QX){
      // dodir s obalom: točka trupa koja je prva dotakla obalu
      const g=BoatPhys.ground(s,w.env), py=(P[k][1]-s.y*PPM)/PPM, vn=g[0]-s.r*py, sp=Math.hypot(g[0],g[1]);
      if(-vn>LIM.hit||sp>3*LIM.hit) return {ok:false,why:'quay',kn:sp/KN};
      s.x+=(QX-P[k][0])/PPM; w.touch=true;
      if(vn<0){ // bokobrani upiju udarac: brzina prema obali u točki dodira nestaje, a brodica se oko te točke zakrene
        const B=BoatPhys.B, J=-vn/(1/B.m+py*py/B.Iz), q=s.psi*D2R, sn=Math.sin(q), c=Math.cos(q), dvx=J/B.m;
        s.u+=dvx*sn; s.v+=dvx*c; s.r+=-py*J/B.Iz; s.u*=.985; }
      P=hull(s);
    }
    for(const M of MOOR) if(P.some(p=>inside(p,M))||M.some(p=>inside(p,P))) return {ok:false,why:'boat'};
    if(s.x*PPM>W+30||s.y*PPM<-40||s.y*PPM>H+40) return {ok:false,why:'out'};
    const hn=((s.psi%360)+360)%360, par=Math.min(hn,Math.abs(hn-180),360-hn)<LIM.par;
    const gap=Math.max(0,Math.min(...P.map(p=>p[0]))-QX)/PPM, g=BoatPhys.ground(s,w.env), sp=Math.hypot(w.touch?Math.max(0,g[0]):g[0],g[1]);
    const cy=s.y*PPM;
    w.chk={berth:cy>BERTH[0]+6&&cy<BERTH[1]-6&&s.x*PPM<QX+70, par, side:gap<LIM.gap, slow:sp<LIM.slow};
    w.gap=gap; w.sog=Math.hypot(g[0],g[1]);
    if(w.chk.berth&&par&&w.chk.side&&w.chk.slow){ w.hold+=dt; if(w.hold>=LIM.hold) return {ok:true,heading:hn}; } else w.hold=0;
    return null;
  }
  // konop se može dati na obalu kad je pramac bliže od 2 m i brodica ide sporije od 1 čv; veže se za najbližu točku obale
  const BOW=3, bowAt=s=>{ const q=s.psi*D2R; return [s.x+BOW*Math.sin(q), s.y-BOW*Math.cos(q)]; };
  function attach(w){ const [bx,by]=bowAt(w.s), d=bx-QX/PPM, g=BoatPhys.ground(w.s,w.env); if(d>2||Math.hypot(g[0],g[1])>1*KN) return false;
    w.line={x:QX/PPM,y:by,L:Math.max(.5,d+.2),T:0}; return true; }
  const detach=w=>{ w.line=null; w.s.ext=null; };
  const world=(key,str,ob)=>({s:Object.assign(start(),{ob:!!ob}),env:env(key,str),hold:0,chk:{},touch:false,gap:99,sog:0});
  return {PPM,W,H,QX,BERTH,HULL,MOOR,MOORC,LIM,STR,ENV,env,start,hull,tick,world,attach,detach,bowAt};
})();

/* Sidreni lanac kao lančanica. Brodica na sidru stoji pramcem u vjetar; vjetar je gura vodoravnom silom F,
   a lanac težine w po metru visi u krivulji y = a·(cosh(x/a) − 1), a = F/w. Dok je ispušteno dovoljno lanca,
   dio leži na dnu i sidro se vuče vodoravno (tako drži). Kad ga je premalo, cijeli lanac se podigne i vuče
   sidro prema gore pod kutom theta: sidro ore. Odatle pravilo 3 do 4 × dubina, a po jakom vjetru 5 do 7 ×. */
const AnchorPhys=(function(){
  const KN=0.5144;
  // brodica oko 6,5 m: površina koju vjetar hvata (m²), lanac 6 mm u vodi (N/m), visina pramca nad morem (m)
  const B={A:4, Cd:1, w:6.8, bow:.8, len:6.5};
  const windForce=kn=>.5*1.2*B.Cd*B.A*Math.pow(kn*KN,2);
  // D dubina (m), L ispušteni lanac (m), F vodoravna sila (N)
  function solve(D,L,F){ const h=D+B.bow, a=Math.max(.05,F/B.w), s0=Math.sqrt(h*h+2*a*h);
    if(L<=h) return {h,a,s0,lie:0,span:0,theta:90,x1:0,short:true};
    if(L>=s0) return {h,a,s0,lie:L-s0,span:a*Math.acosh(1+h/a),theta:0,x1:0};
    const d=a*Math.acosh(1+(L*L-h*h)/(2*a*a)), A=Math.asinh((h/a)/(2*Math.sinh(d/a/2)))-d/a/2;
    return {h,a,s0,lie:0,span:d,theta:Math.atan(Math.sinh(A))*180/Math.PI,x1:a*A}; }
  // točke lanca od sidra (0,0) do pramca: x vodoravna udaljenost, y visina iznad dna (m)
  function shape(g,n){ const P=[[0,0]]; if(g.short) return [[0,0],[0,g.h]]; if(g.lie>0) P.push([g.lie,0]); const c0=Math.cosh(g.x1/g.a);
    for(let i=1;i<=n;i++){ const x=g.span*i/n; P.push([g.lie+x, g.a*(Math.cosh((x+g.x1)/g.a)-c0)]); } return P; }
  // najmanja duljina lanca uz koju se sidro još vuče vodoravno
  const need=(D,kn)=>{ const h=D+B.bow, a=windForce(kn)/B.w; return Math.sqrt(h*h+2*a*h); };
  const beaufort=kn=>[1,4,7,11,17,22,28,34,41,48,56,64].filter(x=>kn>=x).length;
  return {B,windForce,solve,shape,need,beaufort};
})();

/* Čovjek u moru: cijeli manevar odvozi isti model brodice. Brodica plovi 4 čv prema sjeveru, vjetar 10 čv u pramac,
   osoba padne s desnog boka. Vraća uzorke stanja svakih DT sekundi, položaj osobe i redne brojeve ključnih trenutaka. */
const MobPhys=(function(){
  const DT=.05;
  function track(){ const P=BoatPhys, KN=P.KN, R2D=180/Math.PI, wrap=a=>((a+540)%360)-180, clamp=P.clamp;
    const env={cur:[0,0],wind:[0,10*KN]}, s=P.create({psi:0,u:4*KN,thr:2,T:P.B.T[2]}), out=[], ev={};
    let t=0, per=null, ph=0, turned=0, lastPsi=0, tStop=0;
    const rec=()=>out.push({x:s.x,y:s.y,h:s.psi,rud:s.del,thr:s.thr,sp:Math.hypot(s.u,s.v)/KN});
    while(t<150){ rec();
      if(ph===0&&t>=3){ per=[s.x+2,s.y]; ev.fall=out.length-1; ph=1; }
      if(ph===1){ s.rud=35; if(t>=5&&!ev.buoy) ev.buoy=out.length-1; if(t>=6.5){ s.thr=1; if(!ev.slow) ev.slow=out.length-1; }
        if(turned>168){ ph=2; ev.down=out.length-1; } }
      else if(ph===2){ // niz vjetar, osoba ostaje daleko s desne strane
        s.rud=clamp(2*wrap(180-s.psi)-4*s.r*R2D,-35,35); s.thr=Math.hypot(s.u,s.v)<1.6*KN?1:0;
        if(s.y>=per[1]+6.5){ ph=3; ev.round=out.length-1; turned=0; } }
      else if(ph===3){ s.rud=35; s.thr=1; if(turned>138){ ph=4; ev.appr=out.length-1; } }   // okret u vjetar
      else if(ph===4){ // prilaz pramcem u vjetar. Bez vožnje krmom: vijak ne smije raditi blizu čovjeka, zadnje metre brodica klizi u neutralu.
        const ax=per[0]-2, ay=per[1]-1.5, brg=Math.atan2(ax-s.x,-(ay-s.y))*R2D, along=s.y-per[1], v=Math.hypot(s.u,s.v);
        s.rud=clamp(2.2*wrap(brg-s.psi)-4*s.r*R2D,-35,35);
        s.thr=along>4.2?(v<.62?1:0):(v<.1&&along>1.3?1:0); if(along<=4.2&&!ev.neutral) ev.neutral=out.length-1;
        if(along<1.1&&v<.16){ s.thr=0; s.rud=0; ph=5; ev.stop=out.length-1; tStop=t; } }
      else if(ph===5&&t>tStop+1.5) break;
      P.step(s,env,DT); t+=DT; turned+=wrap(s.psi-lastPsi); lastPsi=s.psi; }
    rec(); ev.end=out.length-1; return {out,ev,per}; }
  return {track,DT};
})();
