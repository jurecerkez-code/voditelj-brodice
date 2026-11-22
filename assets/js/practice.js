"use strict";
/* Kviz, kartice i pokretanje aplikacije. */
/* ═══════════════ QUIZ ENGINE ═══════════════ */
(function(){
  const area=el('quizArea'); if(!area) return;
  let sel=new Set(Object.keys(TOPICS)), deck=[], i=0, correct=0, answers=[], streak=0, best=0;
  const stk=()=> streak>=2?`, <span class="streak${streak>=5?' hot':''}" title="uzastopno točnih">streak ${streak}</span>`:'';
  function renderTopics(){
    el('quizTopics').innerHTML=Object.keys(TOPICS).map(k=>
      `<span class="chip qtc${sel.has(k)?' on':''}" data-k="${k}">${TOPICS[k]} <span class="cnt">${QB.filter(q=>q.t===k).length}</span></span>`).join('')
      +`<span class="chip" id="qtAll" style="border-style:dashed">Sve ili ništa</span>`;
    $$('.qtc').forEach(c=>c.addEventListener('click',()=>{
      const k=c.dataset.k; sel.has(k)?sel.delete(k):sel.add(k); renderTopics();
    }));
    el('qtAll').addEventListener('click',()=>{
      sel = sel.size===Object.keys(TOPICS).length ? new Set() : new Set(Object.keys(TOPICS));
      renderTopics();
    });
  }
  renderTopics();
  function start(list,label){
    deck=list; i=0; correct=0; answers=[]; streak=0; best=0;
    if(!deck.length){ area.innerHTML='<div class="warn"><b>Nema pitanja</b>Odaberi barem jednu temu.</div>'; return; }
    show(label);
  }
  function show(label){
    if(i>=deck.length) return finish(label);
    const q=deck[i];
    const order=shuffle(q.o.map((t,idx)=>({t,idx})));
    let h=`<div class="qcard"><div class="qmeta"><span>${label||TOPICS[q.t]}, ${i+1} / ${deck.length}</span><span id="qScore">${correct} točnih${stk()}</span></div>
      <div class="qtext">${q.q} ${q.h?'<span class="pill r vam">Zamka</span>':''}</div>`;
    order.forEach(o=> h+=`<button class="opt qopt" data-i="${o.idx}">${o.t}</button>`);
    h+='<div id="qExpl"></div></div>';
    area.innerHTML=h;
    $$('.qopt').forEach(b=>b.addEventListener('click',()=>{
      const chosen=+b.dataset.i, ok=chosen===q.a;
      if(ok)correct++;
      streak=ok?streak+1:0; best=Math.max(best,streak);
      if(el('qScore')) el('qScore').innerHTML=`${correct} točnih${stk()}`;
      if(ok && window.VB) VB.quizOk();
      answers.push({q,ok});
      if(window.VBSrs) VBSrs.q(q,ok);
      $$('.qopt').forEach(x=>{ x.disabled=true;
        if(+x.dataset.i===q.a){x.classList.add('correct'); x.insertAdjacentHTML('beforeend','<span class="mk">✓</span>');}
        else if(x===b){x.classList.add('wrong'); x.insertAdjacentHTML('beforeend','<span class="mk">✗</span>');}
      });
      el('qExpl').innerHTML=`<div class="expl"><b>${ok?'✓ Točno':'✗ Netočno'}</b> ${q.e||''}</div>
        <div class="btnrow"><button class="btn p" id="qNext">${i+1>=deck.length?'Rezultat':'Sljedeće pitanje'}</button></div>`;
      el('qNext').addEventListener('click',()=>{ i++; show(label); });
    }));
    area.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function finish(label){
    const pct=Math.round(correct/deck.length*100);
    const good=pct>=80, mid=pct>=60;
    const wrong=answers.filter(a=>!a.ok);
    let h=`<div class="qcard scorebox">
      <div class="scorebig" style="color:${good?'var(--green)':mid?'var(--yellow)':'var(--red)'}">${pct}%</div>
      <p style="margin-top:10px;font-size:18px">${correct} / ${deck.length} točnih${best>=2?`, <span class="streak">najdulji niz ${best}</span>`:''}</p>
      <p class="c-txt2">${good?'Spreman si za ovaj dio.':mid?'Dobro, ali ponovi pitanja na koja si pogrešno odgovorio.':'Treba još učiti. Prođi gradivo pa se vrati.'}</p>
      <div class="btnrow jcc"><button class="btn p" id="qAgain">Ponovi</button>${wrong.length?'<button class="btn" id="qWrong">Samo netočna ('+wrong.length+')</button>':''}</div></div>`;
    if(wrong.length){
      h+='<h3>Pitanja koja si promašio</h3>';
      wrong.forEach(a=> h+=`<details><summary>${a.q.q}</summary><p><b class="c-green">${a.q.o[a.q.a]}</b><br>${a.q.e||''}</p></details>`);
    }
    area.innerHTML=h;
    if(label==='Varljiva pitanja' && pct>80 && window.VB) VB.award('trik');
    el('qAgain').addEventListener('click',()=>start(shuffle(deck),label));
    if(el('qWrong')) el('qWrong').addEventListener('click',()=>start(shuffle(wrong.map(a=>a.q)),'Ponavljanje'));
  }
  el('quizStart').addEventListener('click',()=>start(shuffle(QB.filter(q=>sel.has(q.t))),null));
  el('quizExam').addEventListener('click',()=>{
    // v3: simulacija u formatu tri stola (modul VBExam); stari 20-pitanjski test ostaje kao rezerva
    if(window.VBExam) return VBExam.start();
    // balanced draw across topics
    const per={}; Object.keys(TOPICS).forEach(k=>per[k]=shuffle(QB.filter(q=>q.t===k)));
    const picks=[]; const keys=Object.keys(TOPICS);
    let ki=0; while(picks.length<20){ const k=keys[ki%keys.length]; if(per[k].length) picks.push(per[k].pop()); ki++; if(ki>200)break; }
    start(shuffle(picks),'Simulacija ispita');
  });
  el('quizHard').addEventListener('click',()=>start(shuffle(QB.filter(q=>q.h)),'Varljiva pitanja'));
  window.VBQuiz={start};
})();
(function(){
  const area=el('cardArea'); if(!area) return;
  let sel=new Set(Object.keys(TOPICS)), deck=[], i=0, known=0;
  function topics(){
    el('cardTopics').innerHTML=Object.keys(TOPICS).filter(k=>CARDS.some(c=>c[0]===k)).map(k=>
      `<span class="chip ctc${sel.has(k)?' on':''}" data-k="${k}">${TOPICS[k]}</span>`).join('');
    $$('.ctc').forEach(c=>c.addEventListener('click',()=>{const k=c.dataset.k;sel.has(k)?sel.delete(k):sel.add(k);topics();}));
  }
  topics();
  function start(){
    deck=shuffle(CARDS.filter(c=>sel.has(c[0]))); i=0; known=0;
    if(!deck.length){ area.innerHTML='<div class="warn"><b>Nema kartica</b>Odaberi barem jednu temu.</div>'; return; }
    show();
  }
  function show(){
    if(i>=deck.length){
      area.innerHTML=`<div class="qcard scorebox"><div class="scorebig c-green">${known}/${deck.length}</div>
        <p class="mt10">Znao si ${known} od ${deck.length} kartica.</p>
        <div class="btnrow jcc"><button class="btn p" id="cAgain">Ponovi špil</button></div></div>`;
      el('cAgain').addEventListener('click',start); return;
    }
    const c=deck[i];
    area.innerHTML=`<div class="lbl">${TOPICS[c[0]]}, ${i+1} / ${deck.length}</div>
    <div class="fcwrap"><div class="fc" id="fc">
      <div class="fcside fcfront"><div class="fcq">${c[1]}</div><div class="fchint">klikni za odgovor</div></div>
      <div class="fcside fcback"><div class="fca">${c[2]}</div><div class="fchint">klikni za pitanje</div></div>
    </div></div>
    <div class="btnrow"><button class="btn" id="cNo" style="border-color:var(--red)">✗ Ne znam</button><button class="btn p" id="cYes">✓ Znam</button></div>`;
    el('fc').addEventListener('click',()=>el('fc').classList.toggle('flip'));
    el('cYes').addEventListener('click',()=>{known++;i++; if(window.VB) VB.cardKnown(); if(window.VBSrs) VBSrs.c(c,true); show();});
    el('cNo').addEventListener('click',()=>{ deck.push(c); i++; if(window.VBSrs) VBSrs.c(c,false); show(); });
  }
  el('cardStart').addEventListener('click',start);
  window.VBCards={deck(list){ deck=list; i=0; known=0; if(deck.length) show(); }};
  el('cardShuffle').addEventListener('click',start);
})();

/* ═══════════════ INIT ═══════════════ */
(function(){
  const h=(location.hash||'').replace('#','');
  go(pages.some(p=>p.id===h)?h:'p-start');
  window.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA') return;
    // strelice unutar widgeta (animacija čvorova, simulatori, gumbi u kartici) ne listaju stranicu
    if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||(e.target.closest&&e.target.closest('button,a,[role=button],.card,.qcard,.svgbox,svg,[tabindex]'))) return;
    const cur=pages.findIndex(p=>p.classList.contains('active'));
    if(e.key==='ArrowRight'&&cur<pages.length-1) go(pages[cur+1].id);
    if(e.key==='ArrowLeft'&&cur>0) go(pages[cur-1].id);
  });
})();
