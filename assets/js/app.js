"use strict";
/* ═══════════════ APP: ljuska, početna, pretraga, napredak po poglavljima ═══════════════
   Ovisi o: core.js (go, pages, store, el, $, $$, shuffle), ui.js (UI), data.js (QB, TOPICS), practice.js (VBQuiz), srs.js (VBSrs). */
(function(){
  const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CH=window.VB_CH_MAP||[];                  // [{id,t,stol}] definiran u core.js
  const chOf=id=>CH.find(c=>c.id===id);
  const title=id=>{ const p=el(id); return p?p.dataset.title:''; };
  const isMobile=()=>matchMedia('(max-width:1020px)').matches;

  /* ---------- uspjeh u kvizu po temi (zadnjih 20 odgovora) ---------- */
  const tstat=store.get('tstat',{});
  function record(t,ok){ const s=tstat[t]||(tstat[t]={r:[]}); s.r.push(ok?1:0); if(s.r.length>20) s.r.shift(); store.set('tstat',tstat); }
  const mastery=t=>{ const s=tstat[t]; if(!s||s.r.length<5) return null; return Math.round(s.r.reduce((a,b)=>a+b,0)/s.r.length*100); };
  if(window.VBSrs&&VBSrs.q){ const orig=VBSrs.q; VBSrs.q=function(q,ok){ try{ if(q&&q.t) record(q.t,ok); }catch(e){} return orig.apply(this,arguments); }; }
  const isRead=id=>store.get('visited',[]).includes(id);

  /* ---------- kviz jedne teme ---------- */
  function quizTopic(t,n){ if(!window.VBQuiz||typeof QB==='undefined') return; const list=shuffle(QB.filter(q=>q.t===t)).slice(0,n||10);
    go('p-kviz'); VBQuiz.start(list,TOPICS[t]); const a=el('quizArea'); if(a) a.scrollIntoView({block:'start'}); }
  function quizWeak(){ const weak=CH.map(c=>[c.t,mastery(c.t)]).filter(x=>x[1]!==null).sort((a,b)=>a[1]-b[1])[0]; if(weak) quizTopic(weak[0],10); }

  /* ---------- prijenos napretka: datoteka za drugi uređaj i sažetak za instruktora ---------- */
  (function(){ const msg=t=>{ const m=el('progMsg'); if(m) m.textContent=t; }, save=el('progSave'), load=el('progLoad'), sum=el('progSum'); if(!save||!load||!sum) return;
    const dump=()=>{ const d={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith('vb_')) d[k]=localStorage.getItem(k); } return d; };
    const today=()=>new Date().toISOString().slice(0,10);
    save.addEventListener('click',()=>{ const blob=new Blob([JSON.stringify({app:'voditelj-brodice',spremljeno:today(),podaci:dump()})],{type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='voditelj-brodice-napredak-'+today()+'.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
      msg('Napredak je spremljen u datoteku. Na drugom uređaju otvori ovu stranicu i odaberi Učitaj napredak.'); });
    el('progLoadBtn').addEventListener('click',()=>load.click());
    load.addEventListener('change',()=>{ const f=load.files[0]; if(!f) return; const r=new FileReader();
      r.onload=()=>{ try{ const j=JSON.parse(r.result); if(!j||j.app!=='voditelj-brodice'||typeof j.podaci!=='object') throw 0;
          const keys=Object.keys(j.podaci).filter(k=>k.startsWith('vb_')&&typeof j.podaci[k]==='string'); if(!keys.length) throw 0;
          if(!confirm('Učitati napredak spremljen '+(j.spremljeno||'ranije')+'? Zamijenit će napredak na ovom uređaju.')){ load.value=''; return; }
          Object.keys(dump()).forEach(k=>localStorage.removeItem(k)); keys.forEach(k=>localStorage.setItem(k,j.podaci[k])); location.reload();
        }catch(e){ msg('Ta datoteka nije napredak iz ove aplikacije. Odaberi datoteku koju si spremio gumbom Spremi napredak u datoteku.'); load.value=''; } };
      r.readAsText(f); });
    sum.addEventListener('click',()=>{ const read=CH.filter(c=>(store.get('visited',[])||[]).includes(c.id)).length, ex=store.get('examsim',{}), dk=store.get('dockwind',{ok:0,n:0});
      const rows=CH.map(c=>{ const m=mastery(c.t); return '- '+title(c.id)+': '+(m===null?'još nema dovoljno odgovora':m+' % točnih'); });
      const txt=['Voditelj brodice B: sažetak napretka ('+new Date().toLocaleDateString('hr-HR')+')','Pročitano poglavlja: '+read+' od '+CH.length,
        'Probni ispit: '+(ex.best?'najbolji rezultat '+ex.best.ok+' od '+ex.best.n+', pokušaja '+(ex.runs||1):'još nije rješavan'),
        'Simulator pristajanja: '+dk.ok+' uspješnih od '+dk.n,'Kviz po temama:',...rows].join('\n');
      const done=()=>msg('Sažetak je kopiran. Zalijepi ga u poruku instruktoru.');
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done,()=>{ window.prompt('Kopiraj sažetak:',txt); }); else window.prompt('Kopiraj sažetak:',txt); });
  })();

  /* Prijava greške: otvara obrazac s upisanim poglavljem i verzijom. Za prijave e-poštom zamijeni adresu s 'mailto:...'
     (tada ?title= treba promijeniti u ?subject=). */
  const REPORT='https://github.com/jurecerkez-code/voditelj-brodice/issues/new', VER=(document.querySelector('link[href*="app.css?v="]')||{href:''}).href.split('v=')[1]||'';
  /* ---------- dno svakog poglavlja: provjera + sljedeće; tu se poglavlje i označi pročitanim ---------- */
  CH.forEach((c,i)=>{ const p=el(c.id); if(!p) return; const nx=CH[i+1], n=typeof QB!=='undefined'?QB.filter(q=>q.t===c.t).length:0;
    p.insertAdjacentHTML('beforeend',`<aside class="chFoot" aria-label="Kraj poglavlja"><div><h4>Kraj poglavlja</h4><p>Odmah se provjeri: 10 od ${n} pitanja iz ove teme. Cilj je 80 % prije nego što kreneš dalje.</p></div>
      <div class="btnrow">${UI.btn('Kviz ove teme',{kind:'p',attrs:{'data-quiz':c.t}})}${nx?UI.btn('Dalje: '+title(nx.id),{icon:'next',cls:'icoEnd',attrs:{'data-next':nx.id}}):UI.btn('Probni ispit',{attrs:{'data-exam':'1'}})}</div></aside>
      <p class="fine report"><a href="${REPORT}?title=${encodeURIComponent('Greška u poglavlju: '+title(c.id))}&body=${encodeURIComponent('Što je krivo i gdje (naslov odlomka ili tekst pitanja):\n\n\nIzvor, ako ga imaš:\n\n(verzija '+VER+')')}" target="_blank" rel="noopener">Našao si grešku u ovom poglavlju? Prijavi je.</a></p>`); });
  document.addEventListener('click',e=>{ const b=e.target.closest('[data-quiz],[data-next],[data-exam],[data-weak]'); if(!b||b.classList.contains('kuGo')) return;
    if(b.dataset.quiz) quizTopic(b.dataset.quiz,10);
    else if(b.dataset.next) go(b.dataset.next);
    else if(b.dataset.weak) quizWeak();
    else if(b.dataset.exam){ go('p-kviz'); if(window.VBExam) VBExam.start(); } });
  if('IntersectionObserver' in window){ const io=new IntersectionObserver(es=>es.forEach(e=>{ if(!e.isIntersecting) return; const p=e.target.closest('section.page'); if(p&&p.classList.contains('active')&&window.VBRead) VBRead(p.id); }),{threshold:.6});
    $$('.chFoot').forEach(f=>io.observe(f)); }
  else CH.forEach(c=>window.VBRead&&VBRead(c.id));

  /* ---------- pod-navigacija vježbi ---------- */
  const PRACTICE=[['p-kviz','Kviz'],['p-cards','Kartice'],['p-pitanja','Pitanja s ispita'],['p-check','Checklista']];
  PRACTICE.forEach(([id])=>{ const p=el(id), h=p&&$('h2.ph',p); if(!h) return;
    h.insertAdjacentHTML('beforebegin',`<nav class="subnav" aria-label="Vježba">${PRACTICE.map(([i,n])=>`<a href="#${i}"${i===id?' aria-current="page"':''}>${n}</a>`).join('')}</nav>`); });

  /* ---------- donja navigacija i ladica s poglavljima (mobitel) ---------- */
  const side=el('sidebar'), scrim=el('scrim'), tabs=el('tabbar');
  const TAB={home:['p-start'],learn:CH.map(c=>c.id),practice:['p-kviz','p-cards','p-pitanja'],exam:['p-ispit','p-check','p-vodic-ucenja']};
  let drawerBtn=null;
  function drawer(open){ if(!side) return; side.classList.toggle('open',open); if(scrim) scrim.classList.toggle('on',open);
    if(isMobile()) side.inert=!open; else side.inert=false;
    const b=tabs&&$('[data-tab="learn"]',tabs); if(b) b.setAttribute('aria-expanded',open?'true':'false');
    if(open){ const cur=$('.navlink.active',side)||$('.navlink',side); if(cur) cur.focus({preventScroll:false}); }
    else if(drawerBtn){ drawerBtn.focus(); drawerBtn=null; } }
  if(tabs) tabs.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; const k=b.dataset.tab;
    if(k==='learn'){ drawerBtn=b; drawer(!side.classList.contains('open')); return; }
    drawer(false); go(k==='home'?'p-start':k==='practice'?'p-kviz':'p-ispit'); });
  if(scrim) scrim.addEventListener('click',()=>drawer(false));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&side&&side.classList.contains('open')&&isMobile()) drawer(false); });
  if(side) side.addEventListener('click',e=>{ if(e.target.closest('.navlink,.brand')&&isMobile()) drawer(false); });
  const syncDrawer=()=>{ if(side) side.inert=isMobile()&&!side.classList.contains('open'); if(!isMobile()&&scrim) scrim.classList.remove('on'); };
  window.addEventListener('resize',syncDrawer); syncDrawer();

  /* ---------- tema ---------- */
  (function(){ const b=el('themeBtn'), r=document.documentElement; if(!b) return;
    const paint=()=>{ const n=r.dataset.theme==='night'; b.innerHTML=UI.icon(n?'sun':'moon')+`<span>${n?'Dnevni način':'Noćni način'}</span>`; b.setAttribute('aria-pressed',n?'true':'false'); b.setAttribute('aria-label',n?'Uključi dnevni način':'Uključi noćni način (crveno svjetlo)'); };
    b.addEventListener('click',()=>{ const n=r.dataset.theme==='night'; if(n) delete r.dataset.theme; else r.dataset.theme='night'; try{ localStorage.setItem('vbTheme',n?'day':'night'); }catch(e){} paint(); });
    paint(); })();

  /* ---------- pretraga gradiva ---------- */
  (function(){ const root=el('srch'); if(!root) return; const inp=el('srchIn'), res=el('srchRes'); let idx=null, sel=0, hits=[];
    function build(){ idx=[]; pages.forEach(p=>{ const pt=p.dataset.title; idx.push({pg:p.id,el:null,t:pt,sub:'Poglavlje',w:3});
        $$('h3,h4',p).forEach(h=>{ if(h.closest('.chFoot,.osBox,.hmCard,.hmH,.hmQ')) return; const t=h.textContent.trim(); if(t.length>2) idx.push({pg:p.id,el:h,t,sub:pt,w:h.tagName==='H3'?2:1}); });
        $$('.note>b:first-child,.warn>b:first-child,.danger>b:first-child,.ok>b:first-child,.mnem>b:first-child,td:first-child>strong,details>summary',p).forEach(h=>{ const t=h.textContent.trim(); if(t.length>2&&t.length<90) idx.push({pg:p.id,el:h,t,sub:pt,w:0}); }); });
      idx.forEach(x=>x.f=UI.fold(x.t)); }
    function run(){ if(!idx) build(); const q=UI.fold(inp.value.trim()); sel=0;
      if(q.length<2){ hits=[]; res.innerHTML=`<p class="srchEmpty">Upiši pojam, na primjer <b>bura</b>, <b>MAYDAY</b>, <b>kardinalna</b> ili <b>sidrenje</b>.</p>`; return; }
      const words=q.split(/\s+/);
      hits=idx.map(x=>{ if(!words.every(w=>x.f.includes(w))) return null; return {x,s:x.w*10+(x.f.startsWith(q)?8:0)+(x.f.includes(q)?4:0)-x.f.length/40}; }).filter(Boolean).sort((a,b)=>b.s-a.s).slice(0,14).map(h=>h.x);
      if(!hits.length){ res.innerHTML=`<p class="srchEmpty">Nema naslova s „${UI.esc(inp.value.trim())}“. Pokušaj kraći pojam ili drugu riječ.</p>`; return; }
      const mark=t=>{ const f=UI.fold(t), i=f.indexOf(words[0]); return i<0?UI.esc(t):UI.esc(t.slice(0,i))+'<mark>'+UI.esc(t.slice(i,i+words[0].length))+'</mark>'+UI.esc(t.slice(i+words[0].length)); };
      res.innerHTML=hits.map((h,i)=>`<button type="button" role="option" data-i="${i}" aria-selected="${i===0}"${i===0?' class="sel"':''}>${mark(h.t)}<small>${UI.esc(h.sub)}</small></button>`).join(''); }
    function pick(i){ const h=hits[i]; if(!h) return; dlg.close(); go(h.pg);
      if(h.el) setTimeout(()=>{ const d=h.el.closest('details'); if(d) d.open=true; h.el.scrollIntoView({block:'start',behavior:RM?'auto':'smooth'}); h.el.classList.add('srchHit'); setTimeout(()=>h.el.classList.remove('srchHit'),2200); },60); }
    function move(d){ const b=$$('button',res); if(!b.length) return; sel=(sel+d+b.length)%b.length; b.forEach((x,i)=>{ x.classList.toggle('sel',i===sel); x.setAttribute('aria-selected',i===sel); }); b[sel].scrollIntoView({block:'nearest'}); }
    const dlg=UI.dialog(root,{initial:'#srchIn',onOpen(){ inp.value=''; run(); }});
    inp.addEventListener('input',run);
    inp.addEventListener('keydown',e=>{ if(e.key==='ArrowDown'){ e.preventDefault(); move(1); } else if(e.key==='ArrowUp'){ e.preventDefault(); move(-1); } else if(e.key==='Enter'){ e.preventDefault(); pick(sel); } });
    res.addEventListener('click',e=>{ const b=e.target.closest('button'); if(b) pick(+b.dataset.i); });
    $('#srchClose').addEventListener('click',()=>dlg.close());
    document.addEventListener('click',e=>{ if(e.target.closest('[data-search]')){ drawer(false); dlg.open(); } });
    document.addEventListener('keydown',e=>{ const tag=(e.target.tagName||''); const typing=/INPUT|TEXTAREA|SELECT/.test(tag)||e.target.isContentEditable;
      if((e.key==='/'&&!typing&&!e.ctrlKey&&!e.metaKey)||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')){ e.preventDefault(); dlg.open(); } }); })();

  /* ---------- kalkulator kompasnog kursa ---------- */
  (function(){ const out=el('kkOut'); if(!out) return; const K=el('kkK'), D=el('kkD'), V=el('kkV');
    const part=v=>(v<0?'− ':'+ ')+Math.abs(v)+'°'+(v>0?' E':v<0?' W':'');
    function calc(){ const k=+K.value, d=+D.value, v=+V.value; if(K.value===''||D.value===''||V.value===''||[k,d,v].some(isNaN)){ out.textContent='Upiši sva tri broja.'; return; }
      const kp=Math.round(((k+d+v)%360+360)%360), uk=d+v;
      out.innerHTML=`Pravi kurs <b>${String(kp).padStart(3,'0')}°</b><small>${k}° ${part(d)} ${part(v)} = ${String(kp).padStart(3,'0')}°. Ukupna korekcija: ${uk>0?'+':uk<0?'−':''}${Math.abs(uk)}°.</small>`; }
    [K,D,V].forEach(i=>i.addEventListener('input',calc)); calc(); })();

  /* ═══════════════ POČETNA ═══════════════ */
  /* noćni prizor: što vidiš i što radiš. Položaji svjetala su iz pogleda promatrača:
     brod koji ide prema tebi pokazuje zeleno tebi slijeva, crveno zdesna. */
  const LIGHT={w:'#fff6dc',r:'#ff4d5e',g:'#35e08a',y:'#ffd166'};
  const SCENES=[
    {at:.5,L:[[0,-50,'w'],[-36,-12,'g'],[36,-12,'r']],hull:[-52,52],
     q:'Ravno ispred tebe: bijelo gore, ispod njega zeleno lijevo i crveno desno. Što radiš?',
     o:['Skrećem udesno','Skrećem ulijevo','Zadržavam kurs i brzinu'],
     why:'Vidiš oba bočna svjetla i jarbolno: motorni brod ide ravno na tebe. Pri nasuprotnim kursovima <b>oba broda skreću udesno</b> i prolaze lijevim bokom uz lijevi bok.',pg:'p-sudari'},
    {at:.74,L:[[-14,-46,'w'],[-4,-12,'r']],hull:[-46,58],
     q:'S desne strane prilazi ti bijelo i crveno svjetlo. Kursovi vam se sijeku. Što radiš?',
     o:['Ustupam: skrećem udesno i prolazim mu iza krme','Imam prednost: zadržavam kurs i brzinu','Dodajem gas i prolazim mu ispred pramca'],
     why:'Crveno je njegov lijevi bok, a vidiš ga preko svoje desne strane. Po pravilu desne strane <b>izbjegavaš ti</b>: udesno i iza njegove krme.',pg:'p-sudari'},
    {at:.26,L:[[14,-46,'w'],[4,-12,'g']],hull:[-58,46],
     q:'S lijeve strane prilazi ti bijelo i zeleno svjetlo. Kursovi vam se sijeku. Što radiš?',
     o:['Zadržavam kurs i brzinu i pratim ga','Skrećem ulijevo, prema njemu','Stajem i čekam da prođe'],
     why:'Zeleno je njegov desni bok: on tebe vidi preko svoje desne strane, pa <b>izbjegava on</b>. Ti držiš kurs i brzinu i pratiš ga. Ako ne reagira, daješ najmanje pet kratkih signala.',pg:'p-sudari'},
    {at:.5,L:[[0,-16,'w']],hull:[-40,40],
     q:'Ispred tebe je jedno bijelo svjetlo, nisko nad morem, i sve je bliže. Tko se uklanja?',
     o:['Ja: to je krmeno svjetlo, sustižem ga','On: to je jarbolno svjetlo','Nitko: to je svjetionik'],
     why:'Jedno nisko bijelo svjetlo bez bočnih <b>krmeno je svjetlo</b> broda koji sustižeš (ili usidreni brod). Tko pretječe, taj se uklanja i ne siječe kurs po pramcu.',pg:'p-svjetla'},
    {at:.5,L:[[0,-64,'r'],[0,-42,'w'],[-34,-10,'g'],[34,-10,'r']],hull:[-50,50],
     q:'Crveno iznad bijelog, a ispod njih bočna svjetla. Kakav je to brod?',
     o:['Brod zauzet ribolovom: uklanjam mu se','Peljarski brod u službi','Brod nesposoban za manevriranje'],
     why:'<b>Crveno iznad bijelog</b> je ribolov (koćarenje je zeleno iznad bijelog). Peljar je obrnuto: bijelo iznad crvenog. Motorni brod i jedrilica ribaru se uklanjaju.',pg:'p-svjetla'},
    {at:.5,L:[[0,-60,'r'],[0,-36,'r']],hull:[-56,56],
     q:'Dva crvena svjetla, jedno iznad drugog. Što to znači?',
     o:['Brod nesposoban za manevriranje: zaobilazim ga','Brod ograničen svojim gazom','Peljarski brod u službi'],
     why:'<b>Dva crvena u okomici</b>: brod ne može manevrirati i svi ga zaobilaze. Tri crvena značila bi brod ograničen gazom.',pg:'p-svjetla'},
    {at:.5,L:[[-24,-12,'g'],[24,-12,'r']],hull:[-34,34],sail:1,
     q:'Ravno ispred tebe samo zeleno i crveno, bez bijelog svjetla. Voziš na motor. Što radiš?',
     o:['To je jedrilica: uklanjam joj se','To je motorni brod: oba skrećemo udesno','Zadržavam kurs, imam prednost'],
     why:'Bočna svjetla bez jarbolnog pokazuje <b>brod na jedra</b>. Motorni brod ustupa jedrilici, osim kad ga ona pretječe.',pg:'p-sudari'}
  ];
  /* ploča sa svjetlima: ravna noć, obzor, jedva vidljiva silueta i svjetla. Boje podloge su u CSS-u (.hsSky, .hsSea, .hsHull). */
  function sceneSvg(sc){ const W=560,H=280,HOR=186, cx=W*sc.at, cy=HOR-4, uid='hs';
    let g=`<defs>${Object.entries(LIGHT).map(([k,c])=>`<radialGradient id="${uid}${k}"><stop offset="0" stop-color="${c}" stop-opacity=".9"/><stop offset=".35" stop-color="${c}" stop-opacity=".25"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')}</defs>
      <rect class="hsSky" width="${W}" height="${HOR}"/><rect class="hsSea" y="${HOR}" width="${W}" height="${H-HOR}"/>
      <g class="hsHull"><path d="M${cx+sc.hull[0]},${cy-6} L${cx+sc.hull[1]},${cy-6} L${cx+sc.hull[1]-12},${cy+3} L${cx+sc.hull[0]+12},${cy+3} Z"/>${sc.sail?`<path d="M${cx},${cy-6} L${cx},${cy-74} L${cx+26},${cy-10} Z"/>`:`<path d="M${cx+sc.hull[0]*.5},${cy-6} L${cx+sc.hull[0]*.42},${cy-22} L${cx+sc.hull[1]*.42},${cy-22} L${cx+sc.hull[1]*.5},${cy-6} Z"/>`}</g>`;
    sc.L.forEach(([dx,dy,c])=>{ const x=cx+dx, y=cy+dy, col=LIGHT[c];
      g+=`<path d="M${x-10},${HOR+14} h20 M${x-8},${HOR+30} h16 M${x-12},${HOR+50} h24" stroke="${col}" stroke-width="2" opacity=".3"/><circle cx="${x}" cy="${y}" r="24" fill="url(#${uid}${c})"/><circle cx="${x}" cy="${y}" r="5" fill="${col}"/>`; });
    return `<svg class="diagram" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${g}</svg>`; }
  let scI=(store.get('hmScene',-1)+1)%SCENES.length;
  function renderScene(){ const box=el('hmScene'); if(!box) return; const sc=SCENES[scI]; store.set('hmScene',scI);
    const order=shuffle(sc.o.map((t,i)=>({t,i})));
    box.innerHTML=sceneSvg(sc)+`<div class="hmQ"><h4 id="hmQt">${sc.q}</h4><div class="hmOpts" role="group" aria-labelledby="hmQt">${order.map(o=>`<button type="button" data-i="${o.i}">${o.t}</button>`).join('')}</div><div class="hmAfter" aria-live="polite"></div></div>`;
    $$('.hmOpts button',box).forEach(b=>b.addEventListener('click',()=>{ const ok=+b.dataset.i===0;
      $$('.hmOpts button',box).forEach(x=>{ x.disabled=true; if(+x.dataset.i===0) x.classList.add('ok'); else if(x===b) x.classList.add('no'); });
      $('.hmAfter',box).innerHTML=`<p class="hmWhy"><b>${ok?'Točno.':'Netočno.'}</b> ${sc.why}</p><div class="hmMore"><button type="button" data-more>Još jedan prizor</button><a href="#${sc.pg}">${title(sc.pg)}</a></div>`;
      if(ok&&window.VB) VB.add(5); const m=$('[data-more]',box); m.addEventListener('click',()=>{ scI=(scI+1)%SCENES.length; renderScene(); const f=$('.hmOpts button',box); if(f) f.focus(); }); })); }

  /* sljedeći korak: plan za danas ili unos datuma ispita */
  const parseD=s=>{ const a=s.split('-').map(Number); return new Date(a[0],a[1]-1,a[2]); };
  const isoD=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  function renderNext(){ const box=el('hmNext'); if(!box) return; const P=store.get('plan',null), done=store.get('plan_done',{}), today=new Date(); today.setHours(0,0,0,0);
    const last=store.get('last',null), started=CH.some(c=>isRead(c.id))||Object.keys(tstat).length>0;
    let left='';
    if(P&&P.days){ const di=P.days.findIndex(d=>d.date===isoD(today)), days=Math.round((parseD(P.exam)-today)/864e5);
      if(days<0) left=`<div class="hmCard pri"><h3>Ispit je prošao</h3><p>Plan je bio složen do ${parseD(P.exam).toLocaleDateString('hr-HR')}. Ako polažeš ponovno, složi novi.</p><div class="btnrow">${UI.btn('Novi plan',{kind:'p',cls:'kuGo',attrs:{'data-go':'p-start','data-to':'planCard'}})}</div></div>`;
      else if(di<0) left=`<div class="hmCard pri"><h3>${days===0?'Danas je ispit':'Ispit je za '+days+' '+(days===1?'dan':'dana')}</h3><p>${days===0?'Ne uči ništa novo. Prođi checklistu i kreni na vrijeme.':'Za danas u planu nema stavki.'}</p><div class="btnrow">${UI.btn('Checklista pred ispit',{kind:'p',cls:'kuGo',attrs:{'data-go':'p-check'}})}</div></div>`;
      else { const items=P.days[di].items, firstOpen=items.find((_,ii)=>!done[di+'_'+ii]), pg=firstOpen?firstOpen.pg[0]:null;
        left=`<div class="hmCard pri"><h3>Danas po planu</h3><p>Dan ${di+1} od ${P.days.length}. Ispit je za ${days} ${days===1?'dan':'dana'}.</p>
          <ul class="hmToday">${items.map((it,ii)=>`<li${done[di+'_'+ii]?' class="done"':''}>${UI.esc(it.n)}</li>`).join('')}</ul>
          <div class="btnrow">${pg?UI.btn('Otvori: '+title(pg),{kind:'p',cls:'kuGo',attrs:{'data-go':pg}}):UI.btn('Probni ispit',{kind:'p',attrs:{'data-exam':'1'}})}${UI.btn('Cijeli plan',{cls:'kuGo',attrs:{'data-go':'p-start','data-to':'planCard'}})}</div></div>`; } }
    else left=`<div class="hmCard pri"><h3>Kad polažeš?</h3><p>Upiši datum ispita i koliko dnevno možeš učiti. Dobit ćeš raspored po danima, s najtežim gradivom na početku.</p>
        <form class="hmForm" id="hmPlan"><label>Datum ispita<input type="date" id="hmDate" min="${isoD(new Date(today.getTime()+864e5))}" required></label>
          <label>Dnevno<select id="hmHours"><option value="1">1 sat</option><option value="2" selected>2 sata</option><option value="3">3 sata</option></select></label>
          <button type="submit" class="btn p"><span>Složi plan</span></button></form>
        <p class="small muted" id="hmPlanMsg" aria-live="polite">Još nemaš termin? <a href="#p-ispit" data-to="prijava">Ovako se prijavljuješ.</a></p></div>`;
    let right;
    if(started){ const weak=CH.map(c=>[c,mastery(c.t)]).filter(x=>x[1]!==null).sort((a,b)=>a[1]-b[1])[0];
      const due=window.VBSrs?VBSrs.dueQ().length+VBSrs.dueC().length:0, nextCh=CH.find(c=>!isRead(c.id));
      const rows=[];
      if(last&&chOf(last)) rows.push(`<li><b>${UI.icon('book',15)}</b><span><strong>Zadnje otvoreno</strong><a href="#${last}">${title(last)}</a></span></li>`);
      else if(nextCh) rows.push(`<li><b>${UI.icon('book',15)}</b><span><strong>Sljedeće poglavlje</strong><a href="#${nextCh.id}">${title(nextCh.id)}</a></span></li>`);
      if(weak&&weak[1]<80) rows.push(`<li><b>${UI.icon('target',15)}</b><span><strong>Najslabija tema: ${weak[1]} %</strong><a href="#p-kviz" data-quiz="${weak[0].t}">${TOPICS[weak[0].t]}: 10 pitanja</a></span></li>`);
      rows.push(`<li><b>${UI.icon('repeat',15)}</b><span><strong>Ponavljanje danas</strong>${due?`<a href="#p-kviz" data-srs="1">${due} ${due===1?'stavka čeka':'stavki čeka'}</a>`:'Ništa ne čeka.'}</span></li>`);
      right=`<div class="hmCard"><h3>Nastavi</h3><ul class="hmSteps">${rows.join('')}</ul></div>`; }
    else right=`<div class="hmCard"><h3>Kako se ovdje uči</h3><ol class="hmSteps">
        <li><b>1</b><span><strong>Pročitaj poglavlje</strong>Na vrhu svakog je sažetak: ono bez čega se ne prolazi.</span></li>
        <li><b>2</b><span><strong>Odmah riješi kviz te teme</strong>Dalje ideš kad imaš 80 %.</span></li>
        <li><b>3</b><span><strong>Pred ispit odradi probni</strong>Tri stola, kao u kapetaniji. Karta je eliminacijska.</span></li></ol></div>`;
    box.innerHTML=left+right;
    const ps=el('planSec'); if(ps) ps.hidden=!P;   // dok plana nema, datum se unosi samo u kartici gore
    const f=el('hmPlan'); if(f) f.addEventListener('submit',e=>{ e.preventDefault(); const d=el('hmDate').value, pd=el('planDate'), ph=el('planHours'), pg=el('planGo');
      if(!d||!pd||!pg) return; pd.value=d; ph.value=el('hmHours').value; pg.click();
      if(store.get('plan',null)){ renderNext(); UI.toast('Plan je složen','Današnje stavke su na početnoj.'); const n=$('#hmNext .btn.p'); if(n) n.focus(); }
      else el('hmPlanMsg').textContent='Datum ispita mora biti u budućnosti.'; });
    const hg=el('hmGo'); if(hg){ const nextCh=CH.find(c=>!isRead(c.id)); const tgt=(last&&chOf(last))?last:(nextCh?nextCh.id:'p-kviz');
      hg.dataset.go=tgt; hg.querySelector('span').textContent=started?('Nastavi: '+title(tgt)):'Počni od karte'; } }
  document.addEventListener('click',e=>{ const a=e.target.closest('a[data-quiz],a[data-srs]'); if(!a) return; e.preventDefault(); e.stopPropagation();
    if(a.dataset.quiz) quizTopic(a.dataset.quiz,10); else if(window.VBSrs){ const q=VBSrs.dueQ(); if(q.length){ go('p-kviz'); VBQuiz.start(shuffle(q),'Ponavljanje'); } else if(window.VBCards){ go('p-cards'); VBCards.deck(shuffle(VBSrs.dueC())); } } },true);

  /* spremnost po ispitnim stolovima */
  const STOL=[[1,'Stol 1: karta','Eliminacijski. Koordinate, kurs, udaljenost, oznake.'],[2,'Stol 2: motor, svjetla, sudari','Traži se razumijevanje, ne definicije.'],[3,'Stol 3: sigurnost, propisi, radio','Najviše pitanja. MAYDAY i jedan čvor.']];
  function renderTables(){ const box=el('hmTables'); if(!box) return; const nx=CH.find(c=>!isRead(c.id));
    box.innerHTML=`<table class="hmP"><caption class="sr">Ispitni program po stolovima</caption><thead><tr><th scope="col">Poglavlje</th><th scope="col" class="n">Pročitano</th><th scope="col" class="n">Kviz</th></tr></thead>`+STOL.map(([n,name,sub])=>{ const list=CH.filter(c=>c.stol===n); let sum=0;
      const rows=list.map(c=>{ const r=isRead(c.id), m=mastery(c.t); sum+=(r?40:0)+(m===null?0:m*.6);
        return `<tr${nx&&nx.id===c.id?' class="cur"':''}><td><button type="button" data-next="${c.id}">${title(c.id)}</button></td><td class="n" data-l="Pročitano">${r?'<span class="rd">da</span>':'ne'}</td><td class="n${m===null?'':m>=80?' good':m<60?' low':''}" data-l="Kviz">${m===null?'<span class="sr">nije rješavan</span>':m+' %'}</td></tr>`; }).join('');
      return `<tbody><tr class="grp"><th scope="rowgroup" colspan="3"><div class="hmG"><b>${name}</b><i>spremnost <span>${Math.round(sum/list.length)} %</span></i><span>${sub}</span></div></th></tr>${rows}</tbody>`; }).join('')+'</table>'; }

  function renderNavStats(){ $$('.navlink').forEach(l=>{ const c=chOf(l.dataset.t); if(!c) return; const m=mastery(c.t); let s=$('.pct',l);
      if(m===null){ if(s) s.remove(); return; } if(!s){ s=document.createElement('span'); s.className='pct'; l.insertBefore(s,$('.dot',l)); } s.textContent=m+' %'; }); }

  function refreshHome(){ renderNext(); renderTables(); renderNavStats(); }
  window.VB5={refresh:refreshHome,mastery,quizTopic};

  /* ---------- vodoravno pomične tablice i crteži: dostupni i tipkovnicom ---------- */
  function markScrollable(){ const p=$('section.page.active'); if(!p) return;
    $$('table,.lgScroll,.osMap',p).forEach(n=>{ const sc=n.scrollWidth>n.clientWidth+2 && !n.querySelector('a[href],button,input,select,[tabindex]');
      if(sc&&!n.dataset.sc){ n.dataset.sc='1'; n.setAttribute('tabindex','0'); if(n.tagName!=='TABLE'&&!n.getAttribute('role')&&!n.getAttribute('aria-label')){ n.dataset.scr='1'; n.setAttribute('role','group'); n.setAttribute('aria-label','Crtež se pomiče vodoravno'); } }
      else if(!sc&&n.dataset.sc){ n.removeAttribute('tabindex'); delete n.dataset.sc; if(n.dataset.scr){ n.removeAttribute('role'); n.removeAttribute('aria-label'); delete n.dataset.scr; } } }); }
  let scT=0; const scLater=()=>{ clearTimeout(scT); scT=setTimeout(markScrollable,250); };
  window.addEventListener('resize',scLater);

  /* ---------- reakcija na promjenu stranice ---------- */
  let userNav=false; document.addEventListener('click',()=>{ userNav=true; },true); document.addEventListener('keydown',()=>{ userNav=true; },true);
  const prevOnGo=window.VBOnGo;
  window.VBOnGo=function(id){ if(prevOnGo) try{ prevOnGo(id); }catch(e){ console.error(e); }
    const p=el(id); document.title='Voditelj brodice B'+(p&&id!=='p-start'?': '+p.dataset.title:'');
    if(chOf(id)) store.set('last',id);
    if(tabs) $$('button',tabs).forEach(b=>{ const on=(TAB[b.dataset.tab]||[]).includes(id); if(on) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    if(id==='p-start') refreshHome();
    scLater();
    if(userNav&&p){ const h=$('h2',p); if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); } } };

  renderScene(); refreshHome();
  const cur=$('section.page.active'); if(cur) window.VBOnGo(cur.id);

  /* ---------- rad bez interneta ---------- */
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
