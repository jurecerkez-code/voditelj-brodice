"use strict";
/* Ponavljanje s razmakom (1, 3 i 7 dana). */
/* ═══════════════ PONAVLJANJE S RAZMAKOM (Leitner: 1 → 3 → 7 dana) ═══════════════ */
/* Krivo odgovoreno pitanje i kartica „Ne znam" ulaze u sustav i vraćaju se sutra. Točan odgovor na DOSPJELO
   pitanje pomiče ga na 3 pa 7 dana; nakon toga je naučeno i izlazi. Pogreška ga vraća na 1 dan.
   Ključ je sažetak teksta pitanja, pa banka i kartice ostaju netaknute. Spremanje: vb_srs. */
window.VBSrs=(function(){
  const DAY=864e5, GAP=[1,3,7];
  let S=store.get('srs',null); if(!S||!S.q) S={q:{},c:{},done:0};
  const key=str=>{ let x=5381; str=String(str); for(let i=0;i<str.length;i++) x=((x<<5)+x+str.charCodeAt(i))|0; return (x>>>0).toString(36); };
  const midnight=()=>{ const d=new Date(); d.setHours(0,0,0,0); return d.getTime(); };
  function rec(kind,k,ok){ const box=S[kind], e=box[k];
    if(!ok) box[k]={b:0,due:midnight()+GAP[0]*DAY};
    else if(e && e.due<=Date.now()){ if(e.b>=GAP.length-1){ delete box[k]; S.done=(S.done||0)+1; } else { e.b++; e.due=midnight()+GAP[e.b]*DAY; } }
    else return;
    store.set('srs',S); render(); }
  const dueQ=()=>{ const n=Date.now(); return (typeof QB!=='undefined'?QB:[]).filter(q=>{ const e=S.q[key(q.q)]; return e&&e.due<=n; }); };
  const dueC=()=>{ const n=Date.now(); return (typeof CARDS!=='undefined'?CARDS:[]).filter(c=>{ const e=S.c[key(c[1])]; return e&&e.due<=n; }); };
  const soon=()=>{ const t=midnight()+2*DAY; return Object.values(S.q).concat(Object.values(S.c)).filter(e=>e.due>Date.now()&&e.due<t).length; };
  const total=()=>Object.keys(S.q).length+Object.keys(S.c).length;
  function startQ(){ const l=dueQ(); if(!l.length||!window.VBQuiz) return; go('p-kviz'); VBQuiz.start(shuffle(l),'PONAVLJANJE'); }
  function startC(){ const l=dueC(); if(!l.length||!window.VBCards) return; go('p-cards'); VBCards.deck(shuffle(l)); }
  function html(where){ const q=dueQ().length, c=dueC().length, s=soon(), t=total();
    const pips=[0,1,2].map(i=>{ const n=Object.values(S.q).concat(Object.values(S.c)).filter(e=>e.b===i).length; return `<span class="srsPip" title="${GAP[i]} ${GAP[i]===1?'dan':'dana'}">${GAP[i]} d · <b>${n}</b></span>`; }).join('');
    if(!t && !S.done) return `<div class="srsBox"><span><b>Ponavljanje s razmakom.</b> Krivo odgovorena pitanja iz kviza i kartice označene „Ne znam" vraćat će se ovdje nakon 1, 3 i 7 dana.</span></div>`;
    const btnQ=where!=='cards'&&q?`<button class="btn p srsGoQ" type="button">Ponovi pitanja (${q})</button>`:'';
    const btnC=where!=='quiz'&&c?`<button class="btn${btnQ?'':' p'} srsGoC" type="button">Ponovi kartice (${c})</button>`:'';
    const now=where==='quiz'?q:where==='cards'?c:q+c;
    return `<div class="srsBox${now?' due':''}"><span><b>Ponavljanje s razmakom:</b> ${now?`danas na redu <b>${where==='cards'?c+' kartica':where==='quiz'?q+' pitanja':q+' pitanja i '+c+' kartica'}</b>.`:'danas je sve ponovljeno.'}
      ${s?` Sutra i prekosutra: ${s}.`:''} <span class="srsMeta">${pips}<span class="srsPip">naučeno · <b>${S.done||0}</b></span></span></span>
      ${btnQ||btnC?`<span class="btnrow">${btnQ}${btnC}</span>`:''}</div>`; }
  const SLOTS=[['srsHome','home','examSimLast','afterend'],['srsQuiz','quiz','quizArea','beforebegin'],['srsCards','cards','cardArea','beforebegin']];
  function render(){ SLOTS.forEach(([id,where,anchor,pos])=>{ let box=el(id); const a=el(anchor); if(!a) return;
      if(!box){ a.insertAdjacentHTML(pos,`<div id="${id}" class="srsSlot"></div>`); box=el(id); }
      box.innerHTML=html(where); const bq=$('.srsGoQ',box), bc=$('.srsGoC',box);
      if(bq) bq.addEventListener('click',startQ); if(bc) bc.addEventListener('click',startC); }); }
  document.addEventListener('DOMContentLoaded',render); if(document.readyState!=='loading') setTimeout(render,0);
  // poziva se iz kviza i kartica
  return { q(q,ok){ rec('q',key(q.q),ok); }, c(c,ok){ rec('c',key(c[1]),ok); }, render, dueQ, dueC };
})();
