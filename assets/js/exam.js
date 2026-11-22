"use strict";
/* Probni ispit u tri stola i poveznice vodiča „Kako učiti". */
/* ═══════════════ SIMULACIJA ISPITA: TRI STOLA ═══════════════
   Pitanja se vuku iz postojeće banke (QB) po temama. Stol 1 je eliminacijski i ima 2 zadatka na karti
   (karta i alati iz Radnog stola: window.__NL). Prag po stolu 80 %. Rezultat: store 'examsim' (vb_examsim). */
window.VBExam=(function(){
  const TABLES=[
    {n:1,name:'Kartografija',tag:'Eliminacijski',topics:['nav','iala'],q:7,chart:2,
     d:'Kurs, pozicija, koordinate, oznake na karti.'},
    {n:2,name:'Motoristika, svjetla, sudari',tag:'Razumijevanje',topics:['engine','lights','shapes','colreg','sound'],q:7,chart:0,
     d:'Motor, svjetla i dnevni znakovi, izbjegavanje sudara, zvučni signali.'},
    {n:3,name:'Sigurnost, propisi, radio',tag:'Širok raspon',topics:['safe','rules','meteo','man','radio'],q:6,chart:0,
     d:'Sigurnost i spašavanje, propisi, meteorologija, manevriranje, VHF i MAYDAY, sricanje.'}
  ];
  const PASS=.8, LIMIT=[10,7,6]; // režim ispita: minute po stolu
  let area=null, S=null, tick=null;
  const mmss=ms=>{ const t=Math.max(0,Math.ceil(ms/1000)); return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'); };
  const stopTick=()=>{ if(tick){ clearInterval(tick); tick=null; } };
  const f1=v=>v.toFixed(1).replace('.',',');
  const num=v=>parseFloat(String(v).replace(',','.'));
  function pick(t){ // ravnomjerno po temama stola, bez ponavljanja
    const per={}; t.topics.forEach(k=>per[k]=shuffle(QB.filter(q=>q.t===k)));
    const out=[]; let i=0; while(out.length<t.q && i<500){ const k=t.topics[i%t.topics.length]; if(per[k].length) out.push({kind:'q',q:per[k].pop()}); i++; }
    return shuffle(out); }
  function chartItems(){ const N=window.__NL; if(!N) return [];
    const P=N.randWater(); let A,B,tries=0;
    do{ A=N.randWater(); B=N.randWater(); tries++; }while(tries<200 && (N.distM(N.px(A[0],A[1]),N.px(B[0],B[1]))<3 || !N.clearPath(A,B)));
    return [{kind:'pos',p:P},{kind:'course',a:A,b:B}]; }
  function start(opts){
    area=el('quizArea'); if(!area) return; stopTick();
    S={t:0,i:0,items:[],res:TABLES.map(()=>({ok:0,n:0,wrong:[]})),elim:false,strict:!!(opts&&opts.strict),times:[0,0,0],t0:0};
    intro(); }
  function intro(){
    area.innerHTML=`<div class="qcard exIntro"><div class="qmeta"><span>${S.strict?'Režim ispita':'Simulacija ispita'}</span><span>3 stola, 22 zadatka</span></div>
      <p style="margin:6px 0 12px">Kao na pravom ispitu: tri ispitivača, jedan po jedan. Za prolaz simulacije na svakom stolu treba <b>80 % točnih</b> (pravi ispit je usmeni i ocjenjuje ga ispitivač). <b>Stol 1 je eliminacijski</b>: ako na njemu padneš, pao je cijeli ispit.</p>
      ${S.strict?`<div class="exStrict"><b>Strogo kao na ispitu.</b> Nema povratne informacije dok ne završiš stol. Vrijeme po stolu: <b>10, 7 i 6 min</b>. Kad vrijeme istekne, neodgovorena pitanja broje se kao netočna.</div>`:''}
      <div class="exTables">${TABLES.map(t=>`<div class="exT"><h4>Stol ${t.n}: ${t.name}</h4><p><strong>${t.tag}.</strong> ${t.d}</p><p class="exN">${t.q} pitanja${t.chart?` + ${t.chart} zadatka na karti`:''}${S.strict?`, ${LIMIT[t.n-1]} min`:''}</p></div>`).join('')}</div>
      <div class="btnrow"><button class="btn p" id="exGo" type="button">Sjedni za Stol 1</button></div></div>`;
    el('exGo').addEventListener('click',()=>table(0)); }
  function table(t){ S.t=t; S.i=0; const T=TABLES[t]; S.items=pick(T).concat(T.chart?chartItems():[]); S.t0=Date.now();
    stopTick(); if(S.strict){ const end=S.t0+LIMIT[t]*60000;
      tick=setInterval(()=>{ const c=el('exClock'); if(!c || !area.contains(c)){ if(!$('.exRun',area)) stopTick(); return; }
        const left=end-Date.now(); c.textContent=mmss(left); c.classList.toggle('low',left<60000); if(left<=0) timeUp(); },250); }
    show(); }
  function timeUp(){ stopTick(); const r=S.res[S.t]; // sve što nije odgovoreno ide kao netočno
    for(let k=r.n;k<S.items.length;k++){ r.n++; r.wrong.push(S.items[k]); }
    S.i=S.items.length; tableDone(true); }
  function head(){ const T=TABLES[S.t], r=S.res[S.t];
    const right=S.strict?`<span class="exClock mono" id="exClock">${mmss(S.t0+LIMIT[S.t]*60000-Date.now())}</span>`:`<span>${r.ok} točnih</span>`;
    return `<div class="qmeta exRun"><span>Stol ${T.n}: ${T.name}, ${S.i+1} / ${S.items.length}</span>${right}</div>`; }
  function next(){ S.i++; if(S.i>=S.items.length) tableDone(); else show(); }
  function nextBtn(){ return `<div class="btnrow"><button class="btn p" id="exNext" type="button">${S.i+1>=S.items.length?'Kraj stola':'Sljedeće'}</button></div>`; }
  function score(ok,item){ const r=S.res[S.t]; r.n++; if(ok) r.ok++; else r.wrong.push(item); }
  function show(){ const it=S.items[S.i];
    if(it.kind==='q') return showQ(it);
    return showChart(it); }
  function showQ(it){ const q=it.q, order=shuffle(q.o.map((t,idx)=>({t,idx})));
    area.innerHTML=`<div class="qcard">${head()}<div class="qtext">${q.q}</div>${order.map(o=>`<button class="opt exOpt" data-i="${o.idx}" type="button">${o.t}</button>`).join('')}<div id="exExpl"></div></div>`;
    $$('.exOpt',area).forEach(b=>b.addEventListener('click',()=>{ const ok=+b.dataset.i===q.a; score(ok,it); if(ok && window.VB) VB.quizOk();
      if(S.strict){ $$('.exOpt',area).forEach(x=>{ x.disabled=true; if(x===b) x.classList.add('exPicked'); });
        el('exExpl').innerHTML=`<div class="exRec">Odgovor zabilježen.</div>`+nextBtn(); el('exNext').addEventListener('click',next); return; }
      $$('.exOpt',area).forEach(x=>{ x.disabled=true; if(+x.dataset.i===q.a) x.classList.add('correct'); else if(x===b) x.classList.add('wrong'); });
      el('exExpl').innerHTML=`<div class="expl"><b>${ok?'✓ Točno':'✗ Netočno'}</b> ${q.e||''}</div>`+nextBtn();
      el('exNext').addEventListener('click',next); }));
    area.scrollIntoView({behavior:'smooth',block:'nearest'}); }
  function chartSvg(extra){ const N=window.__NL;
    const base=N.chartBase().replace(/nlClip/g,'exClip').replace(/nlHatch/g,'exHatch');
    return `<svg class="exChart" viewBox="0 0 ${N.W.toFixed(0)} ${N.H.toFixed(0)}" role="img" aria-label="Vježbovna karta">${base}${extra}</svg>`; }
  const mark=(p,l,c)=>`<g transform="translate(${p[0].toFixed(1)},${p[1].toFixed(1)})"><circle r="6" fill="none" stroke="${c}" stroke-width="2"/><circle r="1.8" fill="${c}"/><text x="9" y="-8" font-size="12" font-weight="600" fill="${c}" paint-order="stroke" stroke="#fff" stroke-width="3">${l}</text></g>`;
  function showChart(it){ const N=window.__NL; let task,inp,extra;
    if(it.kind==='pos'){ const p=N.px(it.p[0],it.p[1]); extra=mark(p,'P','#c2185b');
      task='Zadatak na karti: <b>očitaj koordinate pozicije P</b> (širina na lijevoj ili desnoj skali, dužina na gornjoj ili donjoj).';
      inp=`<label>Širina 43° <input class="nlI exIn" data-k="la" inputmode="decimal" placeholder="npr. 24,6"> ' N</label><label>Dužina 16° <input class="nlI exIn" data-k="lo" inputmode="decimal" placeholder="npr. 31,2"> ' E</label>`; }
    else { const a=N.px(it.a[0],it.a[1]), b=N.px(it.b[0],it.b[1]); extra=mark(a,'A','#0b5fa5')+mark(b,'B','#0b5fa5');
      task='Zadatak na karti: <b>odredi pravi kurs od A do B</b> (trokutima prenosiš smjer s ruže).';
      inp=`<label>Kurs <input class="nlI exIn" data-k="c" inputmode="numeric" placeholder="npr. 047"> °</label>`; }
    const dtools=it.kind==='pos'&&N.divTool?`<div class="nlHandTip exTools"><b>Šestar.</b> ① Jedan vrh na <b>P</b>, drugi na najbližu <b>paralelu</b> (vodoravna crta mreže). ② Uhvati zglob <b>✥</b> i prenesi šestar na <b>bočnu skalu</b>: to su minute širine koje dodaješ ili oduzimaš od paralele. ③ Isto za dužinu: od P do najbližeg <b>meridijana</b>, pa na <b>gornju ili donju skalu</b>.<div class="nlHandStat exDivStat" aria-live="polite"></div></div>`:'';
    const tools=it.kind==='course'&&N.triTool?`<div class="nlHandTip exTools"><b>Trokut.</b> Okreni ga ručicom <b>⟳</b> (ili gumbima) dok hipotenuza ne legne na A–B, zatim ga <b>vuci</b> do središta ruže: kut ostaje isti. Očitaj kurs na obodu u smjeru plovidbe.<div class="btnrow"><button class="btn exRot" data-d="-1" type="button">↺ 1°</button><button class="btn exRot" data-d="-0.25" type="button">↺ ¼°</button><button class="btn exRot" data-d="0.25" type="button">↻ ¼°</button><button class="btn exRot" data-d="1" type="button">↻ 1°</button></div></div>`:'';
    area.innerHTML=`<div class="qcard">${head()}<div class="qtext">${task}</div><div class="exChartWrap">${chartSvg(extra)}</div>${tools}${dtools}
      <div class="nlIn exInRow">${inp}<button class="btn p" id="exChk" type="button">Provjeri</button></div><div id="exExpl"></div></div>`;
    if(tools){ const a=N.px(it.a[0],it.a[1]), b=N.px(it.b[0],it.b[1]), c=N.brg(a,b), m=[(a[0]+b[0])/2,(a[1]+b[1])/2], q=c*Math.PI/180;
      let p=[m[0]+Math.cos(q)*70,m[1]+Math.sin(q)*70]; if(p[0]<N.X0+60||p[0]>N.X0+N.NLON*N.KX-60||p[1]<N.Y0+60||p[1]>N.Y0+N.NLAT*N.K-60) p=[m[0]-Math.cos(q)*70,m[1]-Math.sin(q)*70];
      const tt=N.triTool($('.exChart',area),'exClip',p,(c+(Math.random()<.5?-1:1)*(25+Math.random()*30)+360)%360);
      $('.exTools',area).addEventListener('click',e=>{ const r=e.target.closest('.exRot'); if(r) tt.rot(+r.dataset.d); }); }
    if(dtools){ const p=N.px(it.p[0],it.p[1]), stat=$('.exDivStat',area), start=[p[0]+(p[0]>N.X0+N.NLON*N.KX-90?-50:50),p[1]+(p[1]>N.Y0+N.NLAT*N.K-70?-44:44)];
      // u strogom režimu nema očitanja brojem, kao na pravom ispitu: broji crtice sam
      N.divTool($('.exChart',area),start,{snap:[p],readout:!S.strict,onRead:r=>{ if(!stat) return;
        stat.className='nlHandStat exDivStat'+(r?' good':'');
        stat.innerHTML=!r?'Vrhove stavi na P i na crtu mreže, zatim šestar prenesi na skalu.'
          :S.strict?`Šestar je na skali ${r.k==='lat'?'<b>širine</b>':'<b>dužine</b>'}. Izbroji minute i desetinke.`
          :r.k==='lat'?`Na skali širine: <b>${f1(r.d)}&#8242;</b>. Dodaj ili oduzmi od paralele.`:`Na skali dužine: <b>${f1(r.d)}&#8242;</b>. Dodaj ili oduzmi od meridijana.`; }}); }
    const check=()=>{ if(el('exChk').disabled) return; const v={}; $$('.exIn',area).forEach(i=>v[i.dataset.k]=i.value.trim()); let ok,msg,sol;
      if(it.kind==='pos'){ const la=20+it.p[1], lo=20+it.p[0]; ok=Math.abs(num(v.la)-la)<=.25 && Math.abs(num(v.lo)-lo)<=.25;
        msg=`Pozicija P: <b>${N.fmtLat(it.p[1])}, ${N.fmtLon(it.p[0])}</b>. Dopušteno odstupanje ±0,2'. Širinu uvijek čitaš na bočnoj skali, dužinu na gornjoj ili donjoj.`;
        const p=N.px(it.p[0],it.p[1]); sol=`<path d="M${N.X0-10},${p[1].toFixed(1)} H${p[0].toFixed(1)} V${(N.Y0+N.NLAT*N.K+10).toFixed(1)}" stroke="#0b7a3e" stroke-width="1.4" stroke-dasharray="5 3" fill="none"/>`; }
      else { const a=N.px(it.a[0],it.a[1]), b=N.px(it.b[0],it.b[1]), c=N.brg(a,b), got=num(v.c); const d=Math.abs(((got-c)%360+540)%360-180);
        ok=!isNaN(got) && d<=3; msg=`Pravi kurs A → B je <b>${N.pad3(c)}°</b> (dopušteno ±3°). Put je ${f1(N.distM(a,b))} M. Kurs je <b>kut</b> između sjevera (meridijana) i smjera plovidbe, u smjeru kazaljke na satu.`;
        sol=`<path d="M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}" stroke="#0b7a3e" stroke-width="2" marker-end="url(#exArr)"/><defs><marker id="exArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0b7a3e"/></marker></defs>`; }
      score(ok,it); if(ok && window.VB) VB.widgetOk('navlab');
      el('exChk').disabled=true; $$('.exIn',area).forEach(i=>i.disabled=true);
      if(S.strict){ el('exExpl').innerHTML=`<div class="exRec">Odgovor zabilježen.</div>`+nextBtn(); el('exNext').addEventListener('click',next); return; }
      $('.exChart',area).insertAdjacentHTML('beforeend',sol);
      el('exExpl').innerHTML=`<div class="expl"><b>${ok?'✓ Točno':'✗ Netočno'}</b> ${msg}</div>`+nextBtn(); el('exNext').addEventListener('click',next); };
    el('exChk').addEventListener('click',check); $('.exInRow',area).addEventListener('keydown',e=>{ if(e.key==='Enter') check(); });
    area.scrollIntoView({behavior:'smooth',block:'nearest'}); }
  const passed=r=>r.n>0 && r.ok/r.n>=PASS;
  function tableDone(late){ stopTick(); const T=TABLES[S.t], r=S.res[S.t], ok=passed(r); if(S.t===0 && !ok) S.elim=true;
    const last=S.t===TABLES.length-1; S.times[S.t]=Math.min(Date.now()-S.t0,LIMIT[S.t]*60000);
    if(S.strict){ // bez ocjene do kraja, kao kod ispitivača koji samo skupi papir
      area.innerHTML=`<div class="qcard scorebox"><div class="qmeta"><span>Stol ${T.n}: ${T.name}</span><span class="mono">${mmss(S.times[S.t])}</span></div>
        <div class="exVerdict n">STOL ${T.n} ZAVRŠEN</div>
        <p class="c-txt2">${late?'Vrijeme je isteklo. ':''}Vrijeme: <b class="mono">${mmss(S.times[S.t])}</b> od ${LIMIT[S.t]}:00. Ocjenu vidiš na kraju ispita.</p>
        <div class="btnrow jcc"><button class="btn p" id="exOn" type="button">${last?'Rezultat ispita':`Stol ${T.n+1}`}</button></div></div>`;
      el('exOn').addEventListener('click',()=>last?finish():table(S.t+1)); return; }
    area.innerHTML=`<div class="qcard scorebox"><div class="qmeta"><span>Stol ${T.n}: ${T.name}</span><span>${r.ok} / ${r.n}</span></div>
      <div class="exVerdict ${ok?'g':'b'}">${ok?'Zadovoljio':'Nije zadovoljio'}</div>
      <p class="c-txt2">${r.ok} od ${r.n} točno (${Math.round(r.ok/r.n*100)} %). Prag je 80 %.</p>
      ${S.t===0&&!ok?`<div class="danger tl"><b>Eliminacija</b>Stol 1 je eliminacijski: na pravom ispitu ovdje bi završio i cijeli ispit bi bio pao. Stolove 2 i 3 možeš odraditi za vježbu.</div>`:''}
      <div class="btnrow jcc"><button class="btn p" id="exOn" type="button">${last?'Rezultat ispita':`Stol ${T.n+1}`}</button></div></div>`;
    el('exOn').addEventListener('click',()=>last?finish():table(S.t+1)); }
  function finish(){
    const pass=S.res.every(passed), tot=S.res.reduce((a,r)=>a+r.ok,0), n=S.res.reduce((a,r)=>a+r.n,0);
    const why=S.elim?'Pao je Stol 1 (eliminacijski), pa je pao cijeli ispit, bez obzira na ostale stolove.':pass?'Svi stolovi su zadovoljeni.':'Barem jedan stol nije zadovoljen: na pravom ispitu taj dio ponavljaš.';
    const rec={ok:tot,n,pass,elim:S.elim,strict:S.strict,times:S.times.slice(),tables:S.res.map(r=>[r.ok,r.n]),at:Date.now()};
    const st=store.get('examsim',{}); st.last=rec; if(!st.best || tot/n>st.best.ok/st.best.n) st.best=rec; st.runs=(st.runs||0)+1; store.set('examsim',st);
    let h=`<div class="qcard scorebox"><div class="qmeta"><span>${S.strict?'Rezultat u režimu ispita':'Rezultat simulacije'}</span><span>${tot} / ${n}</span></div>
      <div class="exVerdict ${pass?'g':'b'}">${pass?'Prolaz':'Pad'}</div><p class="c-txt2">${why}</p>
      <table class="exRes"><thead><tr><th>Stol</th><th>Točno</th>${S.strict?'<th>Vrijeme</th>':''}<th>Ocjena</th></tr></thead><tbody>${TABLES.map((T,i)=>{ const r=S.res[i];
        return `<tr><td>${T.n}. ${T.name}${T.n===1?' <span class="pill r">elim.</span>':''}</td><td class="mono">${r.ok} / ${r.n}</td>${S.strict?`<td class="mono">${mmss(S.times[i])}</td>`:''}<td><b style="color:var(${passed(r)?'--green':'--red'})">${passed(r)?'ZADOVOLJIO':'NIJE'}</b></td></tr>`; }).join('')}</tbody></table>
      <div class="btnrow jcc"><button class="btn p" id="exAgain" type="button">↻ Ponovi</button></div></div>`;
    const wrong=S.res.flatMap((r,i)=>r.wrong.map(w=>[i,w]));
    if(wrong.length){ h+='<h3>Što si promašio</h3>'; wrong.forEach(([i,w])=>{
      if(w.kind==='q') h+=`<details><summary>Stol ${i+1}: ${w.q.q}</summary><p><b class="c-green">${w.q.o[w.q.a]}</b><br>${w.q.e||''}</p></details>`;
      else h+=`<details><summary>Stol 1: zadatak na karti (${w.kind==='pos'?'koordinate':'kurs'})</summary><p>Vježbaj na <a href="#p-nav" data-go="p-nav">Radnom stolu</a> u poglavlju Karta i navigacija.</p></details>`; }); }
    area.innerHTML=h; const again=S.strict; el('exAgain').addEventListener('click',()=>start({strict:again}));
    $$('[data-go]',area).forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); go(a.dataset.go); }));
    renderLast(); }
  function renderLast(){ const box=el('examSimLast'); if(!box) return; const st=store.get('examsim',{});
    if(!st.last){ box.innerHTML=`<div class="exLast"><span>Simulacija ispita (3 stola) još nije odrađena.</span><span class="exLastAct"><a href="#p-kviz" data-go="p-kviz">Pokreni u Kvizu</a><button class="btn exStrictGo" type="button">Režim ispita</button></span></div>`; }
    else { const L=st.last, B=st.best;
      box.innerHTML=`<div class="exLast"><span>Zadnja simulacija: <b class="mono">${L.ok}/${L.n}</b>, <b style="color:var(${L.pass?'--green':'--red'})">${L.pass?'Prolaz':'Pad'}</b>${L.elim?' (Stol 1)':''}${L.strict?' <span class="pill y">režim ispita</span>':''}, najbolja ${B.ok}/${B.n}</span><span class="exLastAct"><a href="#p-kviz" data-go="p-kviz">Nova simulacija</a><button class="btn exStrictGo" type="button">Režim ispita</button></span></div>`; }
    $$('[data-go]',box).forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); go(a.dataset.go); if(a.dataset.go==='p-kviz') setTimeout(start,0); }));
    $$('.exStrictGo',box).forEach(b=>b.addEventListener('click',()=>{ go('p-kviz'); setTimeout(()=>start({strict:true}),0); })); }
  document.addEventListener('DOMContentLoaded',renderLast); if(document.readyState!=='loading') setTimeout(renderLast,0);
  return {start,renderLast};
})();

/* ═══════════════ KAKO UČITI + interne poveznice ═══════════════
   Poveznice oblika <a href="#p-…"> u sadržaju otvaraju stranicu preko go(); data-to skrolira do widgeta. */
(function(){
  function jump(id,to,exam){ go(id); if(exam && window.VBExam) setTimeout(()=>VBExam.start(),0);
    if(to) setTimeout(()=>{ const t=el(to); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); },80); }
  document.addEventListener('click',e=>{
    const b=e.target.closest('.kuGo'); if(b){ jump(b.dataset.go,b.dataset.to,b.dataset.exam); return; }
    const a=e.target.closest('a[href^="#p-"]'); if(!a || a.dataset.go) return;
    const id=a.getAttribute('href').slice(1); if(!el(id)) return;
    e.preventDefault(); jump(id,a.dataset.to);
  });
})();
