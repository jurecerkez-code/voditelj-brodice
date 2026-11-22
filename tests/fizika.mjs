// Provjera fizike simulatora pristajanja (assets/js/fizika.js), bez preglednika.
// 1) Ponaša li se brodica kao prava: brzine, zaustavni put, krug okretanja, izboj krme, zanošenje.
// 2) Može li se u svakom zadanom uvjetu pristati: kormilar iz skripte vozi samo ručicom stroja i kormilom, kao korisnik.
import fs from 'node:fs'; import vm from 'node:vm';
const ctx={Math}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../assets/js/fizika.js',import.meta.url),'utf8')+';this.BoatPhys=BoatPhys;this.DockWorld=DockWorld;',ctx);
const P=ctx.BoatPhys, D=ctx.DockWorld, KN=P.KN, PPM=D.PPM, R2D=180/Math.PI, calm={cur:[0,0],wind:[0,0]};
const wrap=a=>((a+540)%360)-180, clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
let fails=0, n=0;
const check=(name,val,lo,hi,unit)=>{ n++; const ok=val>=lo&&val<=hi; if(!ok) fails++;
  console.log(`${ok?'ok  ':'FAIL'} ${name}: ${val.toFixed(2)} ${unit||''} (očekivano ${lo} do ${hi})`); };
const run=(s,env,T,f)=>{ for(let t=0;t<T;t+=1/60){ P.step(s,env,1/60); if(f) f(s,t); } return s; };

// ── 1) ponašanje brodice ──
check('brzina na „polako"',run(P.create({thr:1}),calm,60).u/KN,1.9,2.1,'čv');
check('brzina na „naprijed"',run(P.create({thr:2}),calm,60).u/KN,3.8,4.2,'čv');
{ const s=run(P.create({thr:1}),calm,40), y0=s.y; s.thr=0; run(s,calm,60); check('klizanje u neutralu iz 2 čv',y0-s.y,7,14,'m'); }
{ const s=run(P.create({thr:1}),calm,40), y0=s.y; s.thr=-1; let t=0; while(s.u>.05&&t<60){ P.step(s,calm,1/60); t+=1/60; } check('zaustavni put krmom polako iz 2 čv',y0-s.y,2,6,'m'); }
{ const s=run(P.create({thr:1}),calm,30); s.rud=35; run(s,calm,25); let a=1e9,b=-1e9; run(s,calm,60,q=>{ a=Math.min(a,q.x); b=Math.max(b,q.x); });
  check('promjer kruga okretanja, polako, kormilo 35°',b-a,9,15,'m'); check('točka okretanja ispred sredine brodice',-s.v/s.r,1,2.2,'m'); check('pad brzine u okretu',s.u/KN,1.1,1.8,'čv'); }
{ const s=P.create({rud:35}); run(s,calm,10); check('kormilo bez vode koja struji (brodica stoji)',Math.abs(s.psi),0,.01,'°'); }
{ const s=P.create({rud:35,thr:1}); run(s,calm,3); check('udar gasa 3 s uz kormilo 35°: zakret',s.psi,5,12,'°'); check('udar gasa 3 s: brzina',s.u/KN,0,.8,'čv'); }
{ const s=P.create({thr:-1}); run(s,calm,10); check('izboj krme, krmom polako 10 s: pramac udesno',s.psi,6,20,'°'); }
{ const s=run(P.create({thr:1}),calm,30); s.thr=0; run(s,calm,4); const p=s.psi; s.rud=35; run(s,calm,5); check('kormilo u neutralu pri oko 1 čv: zakret u 5 s',s.psi-p,1,6,'°'); }
{ const env={cur:[0,0],wind:[12*KN,0]}, s=P.create({}); run(s,env,30); const g=P.ground(s,env); check('zanošenje, vjetar 12 čv u bok',Math.hypot(g[0],g[1])/KN,.15,.5,'čv'); check('pramac pada niz vjetar',s.psi,10,60,'°'); }
{ const env={cur:[0,.6*KN],wind:[0,0]}, s=P.create({}); run(s,env,20); check('struja 0,6 čv nosi brodicu koja stoji',s.y/20/KN,.59,.61,'čv'); check('struja ne okreće brodicu',Math.abs(s.psi),0,.01,'°'); }

// ── 2) kormilar iz skripte ──
function pilot(key,str,o){
  const w=D.world(key,str), s=w.s, xq=D.QX/PPM, xb=xq+13.5/PPM+.3, yb=(D.BERTH[0]+D.BERTH[1])/2/PPM;
  const dir=o.north?1:-1, psi0=o.north?0:180, side=o.north?-1:1, len=14;
  const gx=xb+len*Math.sin(o.ang/R2D), gy=yb+dir*len*Math.cos(o.ang/R2D);
  const wps=o.north?[[gx+5,gy+4],[gx,gy]]:[[gx+16,gy+10],[gx+9,gy-1],[gx,gy]];
  // kormilo prema točki: ispravlja se kurs nad dnom, ne pramac (tako se poništava zanošenje)
  const steerTo=(tx,ty,gain)=>{ const g=P.ground(s,w.env), sp=Math.hypot(g[0],g[1]), brg=Math.atan2(tx-s.x,-(ty-s.y))*R2D;
    const crab=sp>.3?clamp(wrap(s.psi-Math.atan2(g[0],-g[1])*R2D),-30,30):0; return clamp(gain*wrap(brg+crab-s.psi)-5*s.r*R2D,-35,35); };
  let ph=0, wi=0, t=0, res=null;
  while(t<300&&!res){
    const g=P.ground(s,w.env), sog=Math.hypot(g[0],g[1]), gap=Math.min(...D.hull(s).map(p=>p[0]))/PPM-xq, along=dir*(s.y-yb), va=-dir*g[1];
    if(ph===0){ const [tx,ty]=wps[wi], d=Math.hypot(tx-s.x,ty-s.y); s.rud=steerTo(tx,ty,1.6); s.thr=d>12&&wi<wps.length-1?2:(sog<1.7*KN?1:0); if(d<3.5&&++wi>=wps.length) ph=1; }
    else if(ph===1){ s.rud=steerTo(xb-.8,yb-dir*1.5,2); s.thr=sog<(gap>5?1.5:o.vin)*KN?1:0; if(gap<o.flare) ph=2; }   // prilaz pod kutom
    else { const lean=clamp((gap-.5)*10,0,o.maxLean), h=psi0+side*lean, e=wrap(h-s.psi);                         // poravnanje i zaustavljanje
      s.rud=clamp(3*e-6*s.r*R2D,-35,35); const vt=clamp(.3*along,-.35,.7)+(gap>1&&along>-1.5?.25:0);
      s.thr=va<vt-.12?1:va>vt+.45?-2:va>vt+.15?-1:0; if(Math.abs(e)>12&&va<.5&&s.thr<=0&&along>-2) s.thr=1; }
    res=D.tick(w,1/30); t+=1/30;
  }
  return res&&res.ok?t:0;
}
for(const key of Object.keys(D.ENV)) for(let str=0;str<D.STR.length;str++){ if(key==='calm'&&str) continue;
  const E=D.ENV[key]; let ok=0, tries=0, best=1e9;
  for(const north of (E.into==null?[true,false]:[E.into===0])) for(const ang of [30,40,50]) for(const flare of [1.8,2.4,3.2,4.5]) for(const vin of [.8,1.2]) for(const maxLean of [15,30]){
    tries++; const t=pilot(key,str,{north,ang,flare,vin,maxLean}); if(t){ ok++; best=Math.min(best,t); } }
  n++; if(!ok) fails++;
  console.log(`${ok?'ok  ':'FAIL'} pristajanje: ${E.n}${key==='calm'?'':', '+D.STR[str].n}: uspjelo ${ok} od ${tries} prilaza${ok?', najbrži '+best.toFixed(0)+' s':''}`);
}
console.log(fails?`\nPalo: ${fails} od ${n} provjera fizike.`:`\nProšlo: ${n} provjera fizike.`);
process.exit(fails?1:0);
