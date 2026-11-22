"use strict";
/* ═══════════════ UI: zajedničke komponente ═══════════════
   Svaki gumb, ikona, mjerač i dijalog gradi se ovdje, jednom. Izgled je definiran jednom,
   u assets/css/app.css. Novi kod ne piše vlastiti <button> ni vlastite boje: zove UI.*.
   Popis komponenti i primjeri: docs/KOMPONENTE.md */
const UI=(function(){
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attrs=o=>Object.entries(o||{}).filter(([,v])=>v!==false&&v!=null).map(([k,v])=>v===true?` ${k}`:` ${k}="${esc(v)}"`).join('');

  /* ikona iz zajedničkog sprite-a u index.html (<symbol id="i-…">) */
  const icon=(name,size)=>`<svg class="ico" width="${size||20}" height="${size||20}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  /* gumb. o.kind: 'p' = glavna radnja (najviše jedna po bloku); o.big; o.icon; o.attrs = data-* i aria-* */
  const btn=(label,o)=>{ o=o||{}; return `<button type="button" class="btn${o.kind?' '+o.kind:''}${o.big?' big':''}${o.cls?' '+o.cls:''}"${attrs(o.attrs)}>${o.icon?icon(o.icon,18):''}<span>${label}</span></button>`; };

  /* mjerač napretka 0 do 100 */
  const meter=(pct,label)=>{ const p=Math.max(0,Math.min(100,Math.round(pct||0))); return `<div class="meter" role="img" aria-label="${esc(label||'Napredak')}: ${p} %"><i style="width:${p}%"></i></div>`; };

  /* istaknuti blok: kind = note | warn | danger | ok | mnem */
  const callout=(kind,title,html)=>`<div class="${kind}"><b>${title}</b>${html}</div>`;

  /* prazan prikaz s jednom radnjom */
  const empty=(text,actionHtml)=>`<div class="empty"><p>${text}</p>${actionHtml||''}</div>`;

  /* modalni dijalog: fokus ulazi unutra, Escape i klik izvan zatvaraju, fokus se vraća na okidač */
  function dialog(root,o){ o=o||{}; let last=null;
    const focusables=()=>Array.from(root.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(e=>e.offsetParent!==null);
    function open(){ if(root.classList.contains('on')) return; last=document.activeElement; root.classList.add('on'); root.removeAttribute('hidden');
      const f=o.initial?root.querySelector(o.initial):focusables()[0]; if(f) f.focus(); if(o.onOpen) o.onOpen(); }
    function close(){ if(!root.classList.contains('on')) return; root.classList.remove('on'); root.setAttribute('hidden',''); if(o.onClose) o.onClose(); if(last&&last.focus) last.focus(); }
    root.addEventListener('mousedown',e=>{ if(e.target===root) close(); });
    root.addEventListener('keydown',e=>{
      if(e.key==='Escape'){ e.preventDefault(); close(); return; }
      if(e.key!=='Tab') return; const f=focusables(); if(!f.length) return;
      const first=f[0], lastEl=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); lastEl.focus(); }
      else if(!e.shiftKey&&document.activeElement===lastEl){ e.preventDefault(); first.focus(); } });
    return {open,close,isOpen:()=>root.classList.contains('on')}; }

  /* kratka obavijest na dnu zaslona (jedna po jedna) */
  const toast=(title,text)=>{ if(window.VB&&VB.toast) VB.toast('',title,text||''); };

  /* tekst bez dijakritike i velikih slova, za pretragu */
  const fold=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');

  return {esc,attrs,icon,btn,meter,callout,empty,dialog,toast,fold};
})();
