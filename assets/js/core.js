"use strict";
/* Jezgra: pomoćne funkcije, spremanje napretka, bodovi i značke, navigacija među poglavljima, zajedničko more za crteže. */
/* ═══════════════ v2 · GAMIFIKACIJA (XP, leveli, značke, streak) ═══════════════
   Samostalni modul: koristi iste vb_ localStorage ključeve kao `store`.
   Postojeći kod ga zove preko window.VB.* (sigurno ako modul nije učitan). */
window.VB=(function(){
  const S={
    get(k,d){ try{ const v=localStorage.getItem('vb_'+k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
    set(k,v){ try{ localStorage.setItem('vb_'+k,JSON.stringify(v)); }catch(e){} }
  };
  const LEVELS=[[0,'Kandidat'],[100,'Pitoma voda'],[250,'Priobalje'],[500,'Navigator'],[900,'Skiper'],[1400,'Kapetan'],[2000,'Admiral']];
  const BADGES=[
    {id:'kartograf',ic:'🧭',n:'Kartograf',d:'10 točnih u vježbi koordinata na karti',need:10,cnt:'chart'},
    {id:'svjetlar',ic:'💡',n:'Svjetlar',d:'10 točnih u kvizu svjetala',need:10,cnt:'lights'},
    {id:'iala',ic:'🔺',n:'IALA majstor',d:'10 točnih u kvizu IALA oznaka',need:10,cnt:'iala'},
    {id:'radio',ic:'📻',n:'Radiooperater',d:'Sastavi MAYDAY poziv i sricaj riječ fonetskom abecedom'},
    {id:'trik',ic:'🔥',n:'Trikovi savladani',d:'Završi kviz „Samo trik-pitanja“ s više od 80 %'},
    {id:'ispit',ic:'🎓',n:'Ispit dan',d:'Checklista pred ispit: sve kvačice'}
  ];
  let xp=S.get('xp',0), badges=S.get('badges',[]), once=S.get('xp_once',{}), cnt=S.get('cnt',{});
  function level(x){ let i=0; for(let k=0;k<LEVELS.length;k++) if(x>=LEVELS[k][0]) i=k; return i; }
  function render(boost,gain){
    const i=level(xp), cur=LEVELS[i][0], nxt=LEVELS[i+1]?LEVELS[i+1][0]:null;
    const pct=nxt?Math.round((xp-cur)/(nxt-cur)*100):100;
    const q=id=>document.getElementById(id);
    if(q('xpLvl')){
      q('xpLvl').innerHTML='<b>'+i+'</b>'; q('xpName').textContent=LEVELS[i][1];
      q('xpSub').textContent=nxt? xp+' / '+nxt+' XP → '+LEVELS[i+1][1] : xp+' XP · maksimalni level';
      q('xpBar').style.width=pct+'%';
    }
    if(q('topXp')){
      q('topLvl').textContent='Lv '+i; q('topXpTxt').textContent=xp+' XP'; q('topXpBar').style.width=pct+'%';
      if(boost){
        const t=q('topXp'); t.classList.remove('boost'); void t.offsetWidth; t.classList.add('boost');
        const f=document.createElement('span'); f.className='xpfloat'; f.textContent='+'+gain; t.appendChild(f);
        setTimeout(()=>f.remove(),1200);
      }
    }
  }
  function add(n,key){
    if(key){ if(once[key]) return false; once[key]=1; S.set('xp_once',once); }
    const before=level(xp);
    xp+=n; S.set('xp',xp); render(true,n);
    const after=level(xp);
    if(false&&after>before) toast('⚓','Novi level '+after,LEVELS[after][1]);
    return true;
  }
  /* toast: max 1 istovremeno, ostali čekaju u redu */
  const queue=[]; let busy=false;
  function toast(ic,label,title){ queue.push([ic,label,title]); if(!busy) nextToast(); }
  function nextToast(){
    const box=document.getElementById('toast'); const t=queue.shift();
    if(!box||!t){ busy=false; return; }
    busy=true;
    box.innerHTML=`<div class="toast"><div class="tic">${t[0]}</div><div><b>${t[1]}</b><span>${t[2]}</span></div></div>`;
    setTimeout(()=>{ const e=box.firstChild; if(e) e.classList.add('out'); },3000);
    setTimeout(()=>{ box.innerHTML=''; nextToast(); },3500);
  }
  function award(id){
    if(badges.includes(id)) return;
    badges.push(id); S.set('badges',badges);
    const b=BADGES.find(x=>x.id===id);
    if(b) toast(b.ic,'Značka osvojena',b.n);
    renderBadges();
  }
  function count(k){
    cnt[k]=(cnt[k]||0)+1; S.set('cnt',cnt);
    BADGES.forEach(b=>{ if(b.cnt===k && cnt[k]>=b.need) award(b.id); });
  }
  function flag(k){
    const f=S.get('flags',{}); f[k]=1; S.set('flags',f);
    if(f.md && f.spell) award('radio');
  }
  function renderBadges(){
    const g=document.getElementById('badgeGrid'); if(!g) return;
    g.innerHTML=BADGES.map(b=>{
      const won=badges.includes(b.id);
      const prog=b.need&&!won?` <span class="mono" style="color:var(--txt3)">(${Math.min(cnt[b.cnt]||0,b.need)}/${b.need})</span>`:'';
      return `<div class="badge ${won?'won':'locked'}" data-reveal><div class="bic">${b.ic}</div><div><h5>${b.n}</h5><p>${won?'Osvojeno ✓':b.d+prog}</p></div></div>`;
    }).join('');
    if(window.VBReveal) window.VBReveal(g);
  }
  document.addEventListener('DOMContentLoaded',()=>{ render(false); renderBadges(); });
  render(false);
  function reset(){
    xp=0; badges=[]; once={}; cnt={};
    ['xp','badges','xp_once','cnt','flags'].forEach(k=>{ try{ localStorage.removeItem('vb_'+k); }catch(e){} });
    render(false); renderBadges();
  }
  return {
    add, award, count, flag, toast, renderBadges, reset, store:S,
    /* pomoćne prečice za postojeći kod */
    chapter(id){ add(20,'ch_'+id); },
    quizOk(){ add(5); },
    cardKnown(){ add(10); },
    check(k,i){ add(5,'chk_'+k+'_'+i); checkExamDay(); },
    widgetOk(kind){ add(5); count(kind); }
  };
  function checkExamDay(){
    const ids=['clAdmin','clChart','clLights','clColreg','clEngine','clRules','clRadio','clDay'];
    const all=ids.every(k=>{ const box=document.getElementById(k); if(!box) return true;
      const n=box.querySelectorAll('input').length; return n>0 && S.get('chk_'+k,[]).length>=n; });
    if(all) award('ispit');
  }
})();

/* ═══════════════ HELPERS ═══════════════ */
const $ = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const el = id => document.getElementById(id);
// Crtež koji mora stati cijeli i na mobitel: fitText vraća koliko treba povećati natpise da ostanu čitljivi
// (1 na širokom zaslonu, do 1,9 na uskom), a onWidth zove fn kad se širina crteža promijeni.
const fitText=(node,W)=>{ const w=node.getBoundingClientRect().width; return w?Math.max(1,Math.min(1.9,.78*W/w)):1; };
const onWidth=(node,fn)=>{ if(!('ResizeObserver' in window)) return; let w0=0; new ResizeObserver(es=>{ const w=Math.round(es[0].contentRect.width); if(w&&Math.abs(w-w0)>8){ w0=w; fn(); } }).observe(node); };
const SVG=(w,h,inner,extra)=>`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${extra||''}>${inner}</svg>`;
const rnd = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
const store = {
  get(k,d){ try{ const v=localStorage.getItem('vb_'+k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem('vb_'+k,JSON.stringify(v)); }catch(e){} }
};
const SIG={r:'var(--sig-red)',g:'var(--sig-green)',w:'var(--sig-white)',y:'var(--sig-yellow)'}; // v4: jedna paleta signalnih svjetala
const C={red:'#ef4a5a',green:'#25c26a',white:'#ffffff',yellow:'#f5c542',black:'#11161c',
  acc:'#39b8e8',line:'#22415c',txt:'#e6eef5',txt2:'#9fb6c9',blue:'#2a6f9e'};

/* ═══════════════ NAVIGATION ═══════════════ */
const pages = $$('section.page');
/* Poglavlja gradiva: tema u kvizu (t) i ispitni stol (stol). Jedan izvor istine za izbornik,
   početnu stranicu i napredak. Raspored po stolovima isti je kao u probnom ispitu (exam.js). */
window.VB_CH_MAP=[
  {id:'p-nav',t:'nav',stol:1},{id:'p-iala',t:'iala',stol:1},
  {id:'p-svjetla',t:'lights',stol:2},{id:'p-znakovi',t:'shapes',stol:2},{id:'p-sudari',t:'colreg',stol:2},{id:'p-signali',t:'sound',stol:2},{id:'p-motor',t:'engine',stol:2},
  {id:'p-propisi',t:'rules',stol:3},{id:'p-meteo',t:'meteo',stol:3},{id:'p-manevar',t:'man',stol:3},{id:'p-sigurnost',t:'safe',stol:3},{id:'p-radio',t:'radio',stol:3}
].filter(c=>el(c.id));
const NAV_GROUPS=[
  ['Početak',['p-start','p-ispit','p-vodic-ucenja']],
  ['Stol 1: karta',['p-nav','p-iala']],
  ['Stol 2: motor, svjetla, sudari',['p-svjetla','p-znakovi','p-sudari','p-signali','p-motor']],
  ['Stol 3: sigurnost, propisi, radio',['p-propisi','p-meteo','p-manevar','p-sigurnost','p-radio']],
  ['Vježba',['p-kviz','p-cards','p-pitanja','p-check']]
];
(function(){ const used=new Set(); let h='';
  const link=p=>{ used.add(p.id); return `<button type="button" class="navlink" data-t="${p.id}"><span>${p.dataset.title}</span><span class="dot" aria-hidden="true"></span></button>`; };
  NAV_GROUPS.forEach(([g,ids])=>{ const list=ids.map(id=>el(id)).filter(Boolean); if(list.length) h+=`<div class="navgrp" role="group" aria-label="${g}"><span>${g}</span>${list.map(link).join('')}</div>`; });
  const rest=pages.filter(p=>!used.has(p.id)); if(rest.length) h+=`<div class="navgrp" role="group" aria-label="Ostalo"><span>Ostalo</span>${rest.map(link).join('')}</div>`;
  el('navlist').innerHTML=h; })();

let visited = store.get('visited',[]);
function updateProgress(){
  const ch=window.VB_CH_MAP.map(c=>c.id), n=ch.filter(id=>visited.includes(id)).length;
  el('progtxt').textContent=`${n} / ${ch.length}`;
  el('progtxt').setAttribute('aria-label',`Pročitano ${n} od ${ch.length} poglavlja`);
  el('progbar').style.width=(ch.length?n/ch.length*100:0)+'%';
  $$('.navlink').forEach(l=> l.classList.toggle('done', ch.includes(l.dataset.t)&&visited.includes(l.dataset.t)));
}
/* Poglavlje se označi pročitanim kad kandidat dođe do njegova kraja (zove app.js), a ne čim ga otvori. */
window.VBRead=function(id){ if(visited.includes(id)) return; visited.push(id); store.set('visited',visited); if(window.VB) VB.chapter(id); updateProgress(); if(window.VB5) VB5.refresh(); };
function go(id){
  if(!el(id)||!el(id).classList.contains('page')) id='p-start';
  pages.forEach(p=>p.classList.toggle('active',p.id===id));
  $$('.navlink').forEach(l=>{ const on=l.dataset.t===id; l.classList.toggle('active',on); if(on) l.setAttribute('aria-current','page'); else l.removeAttribute('aria-current'); });
  el('crumb').textContent=el(id).dataset.title;
  try{ sessionStorage.removeItem('vb_fresh'); }catch(e){}
  updateProgress();
  if(window.VBOnGo) window.VBOnGo(id);
  window.scrollTo({top:0,behavior:'instant'});
  el('sidebar').classList.remove('open');
  if(location.hash!=='#'+id) location.hash=id;
}
$$('.navlink').forEach(l=> l.addEventListener('click',()=>go(l.dataset.t)));
/* gumb Natrag u pregledniku vraća na prethodno poglavlje */
window.addEventListener('hashchange',()=>{ const h=location.hash.slice(1), p=el(h); if(p&&p.classList.contains('page')&&!p.classList.contains('active')) go(h); });

/* ═══════════════ JEDNO MORE ZA SVE WIDGETE (v4) ═══════════════ */
/* seaBackground(w,h,opts) vraća SVG: gradijent dubine + 3 sloja valova (daleki, srednji, bliski) + odsjaje svjetala.
   opts.view: 'side' (pogled s broda, obzor na opts.y), 'top' (ptičja perspektiva), 'section' (presjek: površina na opts.y, voda do dna)
   opts.night: noćna paleta · opts.lights: [{x, c}] odsjaji ispod svjetala (samo 'side') · opts.calm: niži valovi.
   Valovi se sporo pomiču CSS animacijom (.seaL0–2); prefers-reduced-motion ih zaustavlja. Deklaracija funkcije je
   podignuta (hoisting), pa je mogu zvati i widgeti koji su u kodu iznad ovog modula. */
function seaBackground(w,h,o){
  o=o||{}; seaBackground.n=(seaBackground.n||0)+1;
  const id='sea'+seaBackground.n, N=!!o.night, view=o.view||'side', y0=o.y||0, k=o.calm?.6:1, f=v=>+v.toFixed(1);
  const P=N?{t:'#0e2a44',m:'#081c2e',b:'#02070d',line:'#2c5a82',glint:'#6f9cc0'}:{t:'var(--sea-t)',m:'var(--sea-m)',b:'var(--sea-b)',line:'var(--sea-line)',glint:'#ffffff'}; // v3: boje mora iz tema (dan: papir, noć: tamno)
  let g='';
  const row=(y,amp,len,op,sw)=>{ let d=`M${f(-2*len)},${f(y)}`; for(let x=-2*len;x<w+2*len;x+=len) d+=` q${f(len/4)},${f(-amp)} ${f(len/2)},0 t${f(len/2)},0`; return `<path d="${d}" stroke="${P.line}" stroke-width="${sw}" fill="none" opacity="${op}"/>`; };
  if(view==='top'){
    g+=`<defs><radialGradient id="${id}G" cx=".5" cy=".42" r=".8"><stop offset="0" stop-color="${P.t}"/><stop offset=".6" stop-color="${P.m}"/><stop offset="1" stop-color="${P.b}"/></radialGradient></defs><rect width="${w}" height="${h}" fill="url(#${id}G)"/>`;
    [[96,1.3,.16,30],[64,1,.2,22],[42,.8,.24,14]].forEach(([sp,sw,op,len],i)=>{ let a=''; const am=len*.09*k;
      for(let y=sp*.4,r=0;y<h+sp;y+=sp*.62,r++) for(let x=-sp*2+(r%2)*sp*.5+((r*37)%11);x<w+sp*2;x+=sp) a+=`M${f(x)},${f(y)} q${f(len/4)},${f(-am)} ${f(len/2)},0 t${f(len/2)},0 `;
      g+=`<g class="seaL${i}" style="--sp:${-sp}px"><path d="${a}" stroke="${P.line}" stroke-width="${sw}" fill="none" style="opacity:calc(${op} * var(--sea-k,1))" stroke-linecap="round"/></g>`; });
    return g; }
  const H=h-y0;
  g+=`<defs><linearGradient id="${id}G" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.t}"/><stop offset=".45" stop-color="${P.m}"/><stop offset="1" stop-color="${P.b}"/></linearGradient></defs>
    <rect y="${y0}" width="${w}" height="${H}" fill="url(#${id}G)"/>`;
  if(view==='section'){ // presjek: jedna živa linija površine i svjetlosne zrake u vodi
    g+=`<g opacity=".12">${[.15,.4,.7].map(p=>`<path d="M${f(w*p)},${y0} l${f(-H*.35)},${f(H)} l18,0 Z" fill="${P.glint}"/>`).join('')}</g>`;
    [[0,1.4,34,.55,1.2],[1,2.2,60,.35,1],[2,3,90,.22,.9]].forEach(([i,amp,len,op,sw])=>{ g+=`<g class="seaL${i}" style="--sp:${-len}px">${row(y0+i*1.5,amp*k,len,op,sw)}</g>`; });
    return g; }
  // pogled s broda: izmaglica obzora, 3 sloja valova u perspektivi (dalje manji i gušći)
  g+=`<rect y="${y0}" width="${w}" height="2" fill="${P.glint}" opacity="${N?.08:.22}"/>`;
  const L=[{p:[.06,.16],amp:1,len:18,op:.28,sw:.6,d:30},{p:[.3,.46],amp:2.2,len:34,op:.3,sw:.9,d:22},{p:[.66,.88],amp:3.8,len:60,op:.34,sw:1.2,d:16}];
  L.forEach((l,i)=>{ g+=`<g class="seaL${i}" style="--sp:${-l.len}px">`+l.p.map(p=>row(y0+H*p,l.amp*k,l.len,l.op,l.sw)).join('')+`</g>`; });
  if(!N) g+=`<g class="seaL0" style="--sp:-18px" opacity=".5">${[.1,.28,.47,.63,.81].map((p,i)=>`<path d="M${f(w*p)},${f(y0+H*(.05+i%3*.05))} h${6+i*2}" stroke="#fff" stroke-width=".8"/>`).join('')}</g>`;
  (o.lights||[]).forEach((l,i)=>{ const x=l.x, c=l.c||'var(--sig-white)';
    g+=`<g class="seaRef" opacity="${N?.5:.3}"><rect x="${f(x-2.5)}" y="${y0+1}" width="5" height="${f(H*.8)}" fill="${c}" opacity=".35"/>`
      +[.08,.2,.34,.5,.66].map((p,j)=>`<path d="M${f(x-(6+j*2))},${f(y0+H*p)} h${12+j*4}" stroke="${c}" stroke-width="${1.6+j*.3}" opacity="${.8-j*.12}"/>`).join('')+`</g>`; });
  return g;
}
