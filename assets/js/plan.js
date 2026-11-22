"use strict";
/* Plan učenja po danima, razmaci u tekstu, poruka „dan gotov". */
/* ═══════════════ v2 · ANIMACIJE, PLAN UČENJA, TIPOGRAFSKI DETALJI ═══════════════ */
(function(){
  const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nbsp između broja i jedinice (samo prikaz, tekst se ne mijenja) ---------- */
  (function(){
    const units='m|km|kn|M|Nm|kW|W|V|s|cm|mm|min|h|°C|MHz|€|EUR|čvorova|čvora|čvor|milja|milje|kabela|sati|godina|dana|minute|sekundi|metara|metra';
    const re=new RegExp('(\\d) (?=(?:'+units+')(?![\\p{L}\\d]))','gu');
    const walker=document.createTreeWalker(document.getElementById('content'),NodeFilter.SHOW_TEXT,{
      acceptNode:n=> (n.parentNode && /^(SCRIPT|STYLE|TEXTAREA|CODE)$/.test(n.parentNode.nodeName)) || n.parentNode.closest('svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{ if(re.test(n.nodeValue)){ re.lastIndex=0; n.nodeValue=n.nodeValue.replace(re,'$1 '); } re.lastIndex=0; });
  })();

  /* ---------- scroll reveal: jedan observer, data-reveal, stagger unutar grida ---------- */
  const SEL='.card,.grid>*,table,.svgbox,details,.timeline .tl,.note,.warn,.danger,.ok,.mnem,.badge,.pday';
  let io=null;
  if(!RM && 'IntersectionObserver' in window){
    io=new IntersectionObserver(ents=>{
      ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{rootMargin:'0px 0px -6% 0px',threshold:.06});
  }
  function reveal(root){
    if(!io) return;
    $$(SEL,root).forEach(n=>{
      if(n.dataset.rv) return;
      if(n.closest('#quizArea,#cardArea,.fcwrap,#sidebar,.hero')) return;
      n.dataset.rv=1; n.setAttribute('data-reveal','');
      const par=n.parentElement;
      if(par && (par.classList.contains('grid')||par.classList.contains('badges')||par.classList.contains('plandays'))){
        const idx=Array.prototype.indexOf.call(par.children,n);
        n.style.setProperty('--rd',Math.min(idx,10)*50+'ms');
      }
      io.observe(n);
    });
  }
  window.VBReveal=reveal;
  function revealPage(p){
    if(!io||!p) return;
    reveal(p);
    // elementi već u viewportu odmah (bez čekanja na scroll)
    requestAnimationFrame(()=> $$('[data-reveal]:not(.in)',p).forEach(n=>{
      const r=n.getBoundingClientRect(); if(r.top<innerHeight*0.98 && r.bottom>0){ n.classList.add('in'); io.unobserve(n);} }));
  }

  /* ---------- count-up ---------- */
  function countUp(root){
    $$('.statnum[data-count]',root).forEach(n=>{
      const to=parseFloat(n.dataset.count), dec=+(n.dataset.dec||0), pre=n.dataset.prefix||'', suf=n.dataset.suffix||'';
      const fmt=v=>pre+v.toFixed(dec).replace('.',',')+suf;
      if(RM){ n.innerHTML=fmt(to); return; }
      const t0=performance.now(), D=800;
      (function step(t){ const k=Math.min(1,(t-t0)/D), e=1-Math.pow(1-k,3);
        n.innerHTML=fmt(to*e); if(k<1) requestAnimationFrame(step); })(t0);
    });
  }
  let countIO=null;
  function armCount(){
    const g=$('#p-start .grid.g4'); if(!g) return;
    if(RM||!('IntersectionObserver' in window)) return countUp(g);
    if(countIO) countIO.disconnect();
    countIO=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ countUp(g); countIO.disconnect(); } },{threshold:.4});
    countIO.observe(g);
  }

  /* ---------- hook na promjenu stranice ---------- */
  window.VBOnGo=function(id){
    const p=el(id);
    // location.hash bi skočio na <section>; vrati na vrh kao što go() namjerava
    setTimeout(()=>window.scrollTo({top:0,behavior:'instant'}),0);
    revealPage(p);
    if(id==='p-start') armCount();
    if(!RM){
      $$('.navlink').forEach((l,i)=>{ l.classList.remove('stag'); void l.offsetWidth; l.style.setProperty('--nd',Math.min(i,20)*18+'ms'); l.classList.add('stag'); });
    }
  };
  const cur=$('section.page.active'); if(cur) window.VBOnGo(cur.id);

  /* reset XP: dvostruki klik unutar 4 s kao potvrda, bez blokirajućeg dijaloga */
  (function(){
    const bt=el('xpReset'), msg=el('xpResetMsg'); if(!bt||!window.VB) return;
    let armed=0, tm=0;
    const idle='Briše značke, pročitana poglavlja, checkliste, plan učenja i rezultate vježbi.';
    bt.addEventListener('click',()=>{
      if(!armed){
        armed=1; bt.classList.add('p'); bt.textContent='Klikni ponovno za potvrdu';
        msg.textContent='Sve se vraća na nulu: poglavlja, kviz, plan i značke.';
        tm=setTimeout(()=>{ armed=0; bt.classList.remove('p'); bt.textContent='Resetiraj sav napredak'; msg.textContent=idle; },4000);
        return;
      }
      clearTimeout(tm); armed=0; VB.reset();
      // potpuni reset: svi ključevi s prefiksom vb_ (poglavlja, checkliste, plan, vježbe)
      try{ Object.keys(localStorage).filter(k=>k.indexOf('vb_')===0).forEach(k=>localStorage.removeItem(k)); }catch(e){}
      try{ sessionStorage.setItem('vb_fresh','1'); }catch(e){}
      location.hash='p-start'; location.reload();
    });
  })();

  /* ═══════════════ ADAPTIVNI PLAN UČENJA ═══════════════ */
  const BLOCKS=[
    {id:'nav1',n:'Karta I: koordinate, kurs, azimut',pg:['p-nav'],qt:'nav',pr:1},
    {id:'nav2',n:'Karta II: udaljenost, pozicija, simboli, karakteristike svjetala',pg:['p-nav'],qt:'nav',pr:1},
    {id:'iala',n:'IALA oznake',pg:['p-iala'],qt:'iala',pr:5},
    {id:'lig1',n:'Svjetla I: sektori, motorni brodovi, jedrenjaci',pg:['p-svjetla'],qt:'lights',pr:2},
    {id:'lig2',n:'Svjetla II: posebni brodovi + dnevni znakovi',pg:['p-svjetla','p-znakovi'],qt:'shapes',pr:2},
    {id:'col',n:'Izbjegavanje sudara + zvučni signali',pg:['p-sudari','p-signali'],qt:'colreg',pr:3},
    {id:'eng',n:'Motoristika (+ manevriranje)',pg:['p-motor','p-manevar'],qt:'engine',pr:6},
    {id:'rul',n:'Propisi + područja plovidbe',pg:['p-propisi'],qt:'rules',pr:6},
    {id:'met',n:'Meteorologija',pg:['p-meteo'],qt:'meteo',pr:7},
    {id:'rad',n:'VHF + MAYDAY (+ sigurnost i čvorovi)',pg:['p-radio','p-sigurnost'],qt:'radio',pr:4},
    {id:'rev',n:'Ponavljanje kvizom: simulacija ispita',pg:['p-kviz','p-pitanja'],qt:null,pr:8},
    {id:'chk',n:'Checklista dan prije',pg:['p-check'],qt:null,pr:9}
  ];
  const REP=[
    {id:'rep_lig',n:'Ponavljanje: svjetla: simulator + kviz svjetala',pg:['p-svjetla'],qt:'lights'},
    {id:'rep_nav',n:'Ponavljanje: karta: vježba koordinata',pg:['p-nav'],qt:'nav'},
    {id:'rep_col',n:'Ponavljanje: sudari: svih 12 COLREG scenarija',pg:['p-sudari'],qt:'colreg'},
    {id:'rep_iala',n:'Ponavljanje: IALA kviz + stvarna pitanja',pg:['p-iala','p-pitanja'],qt:'iala'}
  ];
  const DAYN=['ned','pon','uto','sri','čet','pet','sub'];
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const parse=s=>{ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
  const today=()=>{ const d=new Date(); d.setHours(0,0,0,0); return d; };

  function buildPlan(examStr,h){
    const exam=parse(examStr), t0=today();
    const D=Math.round((exam-t0)/864e5); // broj dana učenja (danas … dan prije ispita)
    if(D<=0) return {err:'Datum ispita mora biti u budućnosti.'};
    let L=BLOCKS.map(b=>Object.assign({},b)), intensive=false;
    if(D<3){
      intensive=true;
      L.sort((a,b)=>a.pr-b.pr);
      const chk=L.findIndex(b=>b.id==='chk'); const c=L.splice(chk,1)[0]; L.push(c);
    } else if(L.length>2*D){
      // spoji srodne blokove
      const merge=(a,b,n)=>{ const i=L.findIndex(x=>x.id===a), j=L.findIndex(x=>x.id===b); if(i<0||j<0) return;
        L[i]={id:a+'+'+b,n,pg:[...new Set(L[i].pg.concat(L[j].pg))],qt:L[i].qt,pr:L[i].pr}; L.splice(j,1); };
      merge('nav1','nav2','Karta i navigacija: sve (sažeto)');
      if(L.length>2*D) merge('lig1','lig2','Svjetla + dnevni znakovi (sažeto)');
      if(L.length>2*D) merge('rul','met','Propisi + meteorologija');
      if(L.length>2*D) merge('eng','iala','Motoristika + IALA oznake');
    } else if(D>L.length){
      const extra=D-L.length, reps=[];
      for(let k=0;k<extra;k++){ const r=Object.assign({},REP[k%REP.length]); r.id+='_'+k; reps.push(r); }
      const pos=L.findIndex(b=>b.id==='rev');
      L.splice(pos,0,...reps);
    }
    const n=L.length, days=[];
    for(let d=0; d<D; d++){
      const a=Math.floor(d*n/D), b=Math.floor((d+1)*n/D);
      const dt=new Date(t0); dt.setDate(t0.getDate()+d);
      days.push({date:iso(dt),items:L.slice(a,b).map(x=>({id:x.id,n:x.n,pg:x.pg,qt:x.qt}))});
    }
    return {exam:examStr,h,intensive,created:iso(t0),days};
  }

  const pOut=el('planOut'), pDate=el('planDate'), pHours=el('planHours');
  function renderPlan(){
    const P=store.get('plan',null);
    el('planClear').style.display=P?'':'none';
    if(!P){ pOut.innerHTML=''; return; }
    pDate.value=P.exam; pHours.value=String(P.h);
    const done=store.get('plan_done',{}); const tISO=iso(today());
    let tot=0, ok=0;
    P.days.forEach((d,di)=>d.items.forEach((it,ii)=>{ tot++; if(done[di+'_'+ii]) ok++; }));
    const left=Math.round((parse(P.exam)-today())/864e5);
    const qn=P.h*5+5;
    let h=`<div class="planhead"><div><b style="font-family:var(--display)">Ispit ${parse(P.exam).toLocaleDateString('hr-HR')}</b>
      <span class="pmeta">&ensp;${left>0?'još '+left+' '+(left===1?'dan':'dana'):left===0?'danas je ispit: sretno!':'ispit je prošao'}, ${P.h}&nbsp;h/dan</span></div>
      <div class="pmeta">${ok}/${tot} blokova, ${tot?Math.round(ok/tot*100):0}%</div></div>
      <div class="xpbar mb6"><i style="width:${tot?ok/tot*100:0}%"></i></div>`;
    if(P.intensive) h+=`<div class="danger" style="margin:12px 0"><b>Kratko vrijeme: intenzivni mod</b>Manje od 3 dana do ispita. Raspored ide po prioritetu: <strong>karta → svjetla → sudari → MAYDAY → ostalo</strong>. Ostalo samo prolistaj i riješi kviz.</div>`;
    h+='<div class="plandays">';
    P.days.forEach((d,di)=>{
      const dt=parse(d.date), all=d.items.every((_,ii)=>done[di+'_'+ii]);
      const cls=(d.date===tISO?' today':'')+(all?' done':'')+(d.date<tISO?' past':'');
      h+=`<div class="pday${cls}"><div class="dh"><b>Dan ${di+1}${d.date===tISO?', danas':''}</b><span>${DAYN[dt.getDay()]} ${dt.getDate()}.${dt.getMonth()+1}.</span></div>`;
      d.items.forEach((it,ii)=>{
        const links=it.pg.map(pg=>{ const pe=el(pg); return pe?`<a href="#${pg}">${pe.dataset.title}</a>`:''; }).join('');
        h+=`<label><input type="checkbox" data-k="${di}_${ii}" ${done[di+'_'+ii]?'checked':''}><span>${it.n}</span></label><div class="plinks">${links}</div>`;
      });
      const qts=d.items.map(x=>x.qt).filter(Boolean);
      if(qts.length) h+=`<div class="pq">Odradi <b>${qn} pitanja</b> iz: ${[...new Set(qts)].map(q=>TOPICS[q]).join(', ')}</div>`;
      else if(d.items.some(x=>x.id==='rev')) h+=`<div class="pq"><b>Simulacija ispita</b> (20 pitanja) + <b>samo trik-pitanja</b></div>`;
      h+='</div>';
    });
    h+='</div>';
    pOut.innerHTML=h;
    $$('input[data-k]',pOut).forEach(inp=>inp.addEventListener('change',()=>{
      const dn=store.get('plan_done',{});
      if(inp.checked){ dn[inp.dataset.k]=1; if(window.VB) VB.add(5,'plan_'+P.created+'_'+P.exam+'_'+inp.dataset.k); } else delete dn[inp.dataset.k];
      store.set('plan_done',dn); renderPlan();
    }));
    reveal(pOut); requestAnimationFrame(()=>$$('[data-reveal]',pOut).forEach(n=>n.classList.add('in')));
  }
  if(pOut){
    if(!store.get('plan',null)){ const d=today(); d.setDate(d.getDate()+14); pDate.value=iso(d); }
    pDate.min=iso(today());
    el('planGo').addEventListener('click',()=>{
      if(!pDate.value){ pOut.innerHTML='<div class="warn"><b>Nedostaje datum</b>Odaberi datum ispita.</div>'; return; }
      const P=buildPlan(pDate.value,+pHours.value);
      if(P.err){ pOut.innerHTML=`<div class="warn"><b>Provjeri datum</b>${P.err}</div>`; return; }
      store.set('plan',P); store.set('plan_done',{}); renderPlan();
    });
    el('planClear').addEventListener('click',()=>{ store.set('plan',null); store.set('plan_done',{}); renderPlan(); });
    renderPlan();
  }
})();

/* ═══════════════ DAN PLANA GOTOV (v4) ═══════════════
   Samo sluša promjene kvačica u #planOut (kod plana ostaje netaknut) i samo čita vb_plan, vb_plan_done, vb_srs i vb_xp.
   Kad su sve kvačice jednog dana označene: jedna poruka po danu plana (vb_daydone), bez ikakvog XP-a. */
(function(){
  const DAY=864e5;
  function tomorrowSrs(){ const S=store.get('srs',null); if(!S) return 0; const d=new Date(); d.setHours(0,0,0,0);
    const end=d.getTime()+2*DAY; // sve što dospijeva do kraja sutrašnjeg dana
    return Object.values(S.q||{}).concat(Object.values(S.c||{})).filter(e=>e&&e.due<end).length; }
  document.addEventListener('change',e=>{
    const t=e.target; if(!t.matches||!t.matches('#planOut input[data-k]')||!t.checked) return;
    const P=store.get('plan',null); if(!P||!P.days) return;
    const di=+t.dataset.k.split('_')[0], day=P.days[di]; if(!day) return;
    const done=store.get('plan_done',{}); done[t.dataset.k]=1; // capture: plan još nije spremio ovu kvačicu
    if(!day.items.every((_,ii)=>done[di+'_'+ii])) return;
    const seen=store.get('daydone',{}), k=P.created+'_'+P.exam+'_'+di; if(seen[k]) return;
    seen[k]=1; store.set('daydone',seen);
    setTimeout(()=>{ const n=tomorrowSrs(), xp=store.get('xp',0); // nakon plana, pa XP već uključuje ovu kvačicu
    if(window.VB) VB.toast('',`Dan ${di+1} gotov`,`SRS ima ${n} ${n%10===1&&n%100!==11?'pitanje':'pitanja'} za sutra. Ukupno: ${xp} XP.`); },0);
  },true);
})();
