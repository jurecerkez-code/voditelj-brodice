"use strict";
/* Crteži u dnevnoj paleti, kontrast teksta i čitljivost crteža na mobitelu. */
/* v3: SVG ilustracije u papirnoj paleti (dnevni način). Noćni način vraća originalne boje. */
(function(){
  var root=document.documentElement, content=document.getElementById('content'); if(!content) return;
  var EXEMPT='[data-keep-dark], #lightStage, .dnBox, .dsCard, #distressWidget, .wSea';
  var PROPS=['fill','stroke','stop-color'];
  function parse(c){
    if(!c) return null; c=String(c).trim().toLowerCase();
    var m=c.match(/^#([0-9a-f]{3,8})$/), r,g,b,a=1;
    if(m){ var h=m[1]; if(h.length<=4){ r=parseInt(h[0]+h[0],16); g=parseInt(h[1]+h[1],16); b=parseInt(h[2]+h[2],16); if(h.length===4)a=parseInt(h[3]+h[3],16)/255; }
      else { r=parseInt(h.substr(0,2),16); g=parseInt(h.substr(2,2),16); b=parseInt(h.substr(4,2),16); if(h.length===8)a=parseInt(h.substr(6,2),16)/255; } }
    else { m=c.match(/^rgba?\(([^)]+)\)$/); if(!m) return null; var p=m[1].split(',').map(parseFloat); r=p[0];g=p[1];b=p[2]; a=p.length>3?p[3]:1; }
    var R=r/255,G=g/255,B=b/255, mx=Math.max(R,G,B), mn=Math.min(R,G,B), L=(mx+mn)/2, d=mx-mn, S=0, H=0;
    if(d){ S=L>.5?d/(2-mx-mn):d/(mx+mn); H=mx===R?((G-B)/d+(G<B?6:0)):mx===G?((B-R)/d+2):((R-G)/d+4); H*=60; }
    return {r:r,g:g,b:b,a:a,H:H,S:S,L:L};
  }
  function rgba(hex,a){ return a<1? 'rgba('+parseInt(hex.substr(1,2),16)+','+parseInt(hex.substr(3,2),16)+','+parseInt(hex.substr(5,2),16)+','+a+')' : hex; }
  /* iste vrijednosti kao tokeni u app.css: tinta, prigušeno, list, papir-2, crta */
  var INK='#0f171e', INK2='#3b434b', INK3='#6a737b', NAVY='#14507f', PAPER='#e5eaef', PAPER2='#d8dee4', WATER='#d5e6f0', WATER2='#bdd6e6', RULE='#a1a9af';
  function map(val, prop, el){
    var c=parse(val); if(!c) return null;
    var isText=/^(text|tspan|textPath)$/i.test(el.tagName);
    var cool=c.H>=180&&c.H<=250, neutral=c.S<.14;
    if(isText&&prop==='stroke'&&(c.L>.6||(c.L<.36&&(cool||c.S<.35)))) return rgba(PAPER,c.a);
    if(prop==='stop-color'&&(c.L<.25||(cool&&c.L<.62))) return rgba(c.L>.4?WATER2:WATER,c.a);
    // tamno zelene plohe (npr. hladnjak) -> blijedo zelena
    if(!isText&&prop!=='stroke'&&c.L<.25&&c.S>.3&&c.H>=100&&c.H<180) return rgba('#dcebdf',c.a);
    // tamne plave/sive UI pozadine i linije
    if(c.L<.36 && cool && c.S>=.25){
      if(isText) return rgba(INK,c.a);
      if(prop==='stroke') return rgba(swd(el)>=1.5?INK:INK3,c.a);
      if(prop==='stop-color') return rgba(WATER,c.a);
      if(c.L<.11) return rgba(PAPER,c.a);
      if(c.L<.2) return rgba(c.S>.5?WATER:PAPER2,c.a);
      return rgba(WATER2,c.a);
    }
    // svijetli hladni tonovi (tekst, crte na tamnom)
    var sw=parseFloat(el.getAttribute('stroke-width')||(el.style&&el.style.strokeWidth)||1);
    if(c.L>=.62 && cool && c.S<.75){
      if(prop==='stroke'&&sw>3) return null;
      if(isText) return rgba(c.S>.45?NAVY:INK,c.a);
      if(prop==='stroke') return rgba(c.S>.45?NAVY:INK2,c.a);
      return null; // svijetle plohe (voda, trup) ostaju
    }
    // srednje hladni sivoplavi
    if(c.L>=.36 && c.L<.62 && cool){
      if(isText) return rgba(c.S>.55?NAVY:INK2,c.a);
      if(prop==='stroke') return rgba(c.S>.55?NAVY:INK3,c.a);
      return rgba(c.S>.55?NAVY:'#9aa3ab',c.a);
    }
    // bijeli tekst -> tinta
    if(isText && c.L>.9) return rgba(INK,c.a);
    // zasićene svijetle boje: tekst i crte potamni radi kontrasta na papiru
    if((isText||(prop==='stroke'&&swd(el)<=3)) && c.S>.45 && c.L>.5){
      if(c.H<20||c.H>=330) return rgba('#bd1730',c.a);
      if(c.H<50) return rgba('#a34c0e',c.a);
      if(c.H<70) return rgba('#765300',c.a);
      if(c.H<170) return rgba('#0a7446',c.a);
      if(c.H>=250&&c.H<330) return rgba('#6d4a8a',c.a);
    }
    return null;
  }
  function swd(el){ var v=el.getAttribute('stroke-width'); if(!v){ var p=el.closest('[stroke-width]'); v=p&&p.getAttribute('stroke-width'); } return parseFloat(v||1); }
  function styleProp(p){ return p==='stop-color'?'stopColor':p; }
  function apply(el){
    PROPS.forEach(function(p){
      var key='o'+p.replace('-','');
      if(!(key in el.dataset)){
        var v=el.getAttribute(p), sv=el.style&&el.style.getPropertyValue(p);
        el.dataset[key]=(v||'')+'|'+(sv||'');
      }
      var parts=el.dataset[key].split('|'), ov=parts[0], osv=parts[1];
      if(ov){ var n=map(ov,p,el); if(n) el.setAttribute(p,n); }
      if(osv){ var n2=map(osv,p,el); if(n2) el.style.setProperty(p,n2); }
    });
    outline(el);
  }
  function outline(el){
    if(!/^(circle|ellipse|path|rect|polygon)$/i.test(el.tagName)||el.hasAttribute('stroke')||(el.style&&el.style.stroke)||el.closest('defs,clipPath,marker,mask,pattern')) return;
    var f=parse(el.getAttribute('fill')); if(!f||f.L<.9||f.a<.3) return;
    var op=parseFloat(el.getAttribute('opacity')||el.getAttribute('fill-opacity')||1); if(op<.3) return;
    el.setAttribute('stroke','#6b8194'); el.setAttribute('stroke-width',el.getAttribute('stroke-width')||'.8'); el.dataset.pout='1';
  }
  function restore(el){
    if(el.dataset.pout){ el.removeAttribute('stroke'); delete el.dataset.pout; }
    PROPS.forEach(function(p){
      var key='o'+p.replace('-',''); if(!(key in el.dataset)) return;
      var parts=el.dataset[key].split('|');
      if(parts[0]) el.setAttribute(p,parts[0]); if(parts[1]) el.style.setProperty(p,parts[1]);
    });
  }
  function run(scope){
    var night=root.dataset.theme==='night';
    (scope||content).querySelectorAll('svg *').forEach(function(el){
      if(el.closest(EXEMPT)) return;
      if(night) restore(el); else apply(el);
    });
  }
  // Sinkrono u MutationObserver callbacku (mikrotask, prije iscrtavanja): novi kadar animacije
  // nikad se ne prikaže u starim bojama, pa nema treperenja.
  var mo=new MutationObserver(function(ms){
    if(root.dataset.theme==='night') return;
    mo.disconnect();
    ms.forEach(function(m){
      if(m.type==='attributes'){ var el=m.target;
        if(el.closest&&el.closest('svg')&&!el.closest(EXEMPT)){ var key='o'+m.attributeName.replace('-','');
          var parts=(el.dataset[key]||'|').split('|'); el.dataset[key]=(el.getAttribute(m.attributeName)||'')+'|'+(parts[1]||''); apply(el); }
        return; }
      m.addedNodes.forEach(function(n){ if(n.nodeType!==1||!n.isConnected||n.closest(EXEMPT)) return;
        var list=n.closest('svg')? [n].concat([].slice.call(n.querySelectorAll('*'))) : [].slice.call(n.querySelectorAll('svg *'));
        list.forEach(function(el){ if(!el.closest(EXEMPT)) apply(el); });
      });
    });
    observe();
  });
  function observe(){ mo.observe(content,{childList:true,subtree:true,attributes:true,attributeFilter:PROPS}); }
  run(); observe();
  new MutationObserver(function(){ mo.disconnect(); run(); observe(); }).observe(root,{attributes:true,attributeFilter:['data-theme']});
})();

/* v3: WCAG AA kontrast u dnevnom načinu. Tekst (HTML i SVG) čija boja nema dovoljan kontrast
   prema podlozi potamni se miješanjem s tintom, zadržavajući ton. Noćni način vraća original. */
(function(){
  var root=document.documentElement, content=document.getElementById('content'); if(!content) return;
  var INK=[11,34,51], SKIP='[data-keep-dark], #lightStage, .dnBox, .dsCard, #distressWidget, .wSea';
  function rgb(c){ var m=String(c).match(/[\d.]+/g); return m?m.map(Number):null; }
  function lin(v){ v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }
  function lum(c){ return .2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]); }
  function ratio(a,b){ var x=lum(a), y=lum(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
  function mix(c,t){ return [0,1,2].map(function(k){ return Math.round(c[k]*(1-t)+INK[k]*t); }); }
  function bgOf(e){ var cur=e, stack=[];
    while(cur&&cur.nodeType===1){ var c=rgb(getComputedStyle(cur).backgroundColor); if(c&&(c[3]===undefined||c[3]>0)) stack.push(c); if(c&&(c[3]===undefined||c[3]>=.95)) break; cur=cur.parentElement; }
    var base=[255,255,255]; for(var i=stack.length-1;i>=0;i--){ var s=stack[i], a=s[3]===undefined?1:s[3]; base=[0,1,2].map(function(k){ return s[k]*a+base[k]*(1-a); }); } return base; }
  function need(cs){ var fs=parseFloat(cs.fontSize), fw=+cs.fontWeight||400; return (fs>=24||(fs>=18.66&&fw>=700))?3:4.5; }
  function fixHTML(e){
    if(e.dataset.occ!=null) return; var cs=getComputedStyle(e); if(cs.display==='none') return;
    var has=false; for(var i=0;i<e.childNodes.length;i++){ var n=e.childNodes[i]; if(n.nodeType===3&&n.textContent.trim()){ has=true; break; } } if(!has) return;
    var fg=rgb(cs.color); if(!fg) return; var a=fg[3]===undefined?1:fg[3]; if(a<.99) return;
    var bg=bgOf(e); if(lum(bg)<.35) return; // tamna podloga: nije dnevni tekst
    var nd=need(cs); if(ratio(fg,bg)>=nd) return;
    var t=0, c=fg; while(ratio(c,bg)<nd && t<1){ t+=.1; c=mix(fg,t); }
    e.dataset.occ=e.style.getPropertyValue('color')||''; e.style.setProperty('color','rgb('+c.join(',')+')','important');
  }
  function fixSVG(e){
    if(e.dataset.ocf!=null) return; var cs=getComputedStyle(e); var fg=rgb(cs.fill); if(!fg||cs.fill==='none') return;
    var bg=[220,235,244]; var nd=parseFloat(cs.fontSize)>=18?3:4.5; if(ratio(fg,bg)>=nd) return;
    var t=0, c=fg; while(ratio(c,bg)<nd && t<1){ t+=.1; c=mix(fg,t); }
    e.dataset.ocf='1'; e.style.setProperty('fill','rgb('+c.join(',')+')','important');
  }
  function restore(scope){ scope.querySelectorAll('[data-occ]').forEach(function(e){ if(e.dataset.occ) e.style.setProperty('color',e.dataset.occ); else e.style.removeProperty('color'); delete e.dataset.occ; });
    scope.querySelectorAll('[data-ocf]').forEach(function(e){ e.style.removeProperty('fill'); delete e.dataset.ocf; }); }
  function scan(scope){
    if(root.dataset.theme==='night') return;
    var list=scope.nodeType===1?[scope].concat([].slice.call(scope.querySelectorAll('*'))):[];
    list.forEach(function(e){ if(e.closest(SKIP)) return;
      if(e.closest('svg')){ if(/^(text|tspan)$/i.test(e.tagName)) fixSVG(e); } else fixHTML(e); });
  }
  var mo=new MutationObserver(function(ms){ mo.disconnect();
    ms.forEach(function(m){ m.addedNodes.forEach(function(n){ if(n.nodeType===1&&n.isConnected) scan(n); }); }); obs(); });
  function obs(){ mo.observe(content,{childList:true,subtree:true}); }
  // stranice su skrivene (display:none) dok nisu aktivne: skeniraj aktivnu i svaku koju otvoriš
  function scanVisible(){ document.querySelectorAll('section.page').forEach(function(s){ if(getComputedStyle(s).display!=='none'&&!s.dataset.ctok){ s.dataset.ctok='1'; scan(s); } }); }
  scan(content); obs();
  new MutationObserver(scanVisible).observe(content,{attributes:true,subtree:true,attributeFilter:['class']});
  window.addEventListener('hashchange',function(){ setTimeout(scanVisible,50); });
  new MutationObserver(function(){ mo.disconnect(); if(root.dataset.theme==='night') restore(content); else scan(content); obs(); }).observe(root,{attributes:true,attributeFilter:['data-theme']});
  scan(document.getElementById('sidebar')||document.createElement('i'));
  var tb=document.getElementById('topbar'); if(tb) scan(tb);
})();

/* v3: čitljivost crteža na mobitelu. Ako bi najmanji tekst u SVG-u bio manji od 10 px,
   crtež dobije minimalnu širinu, a okvir vodoravni pomak (kao široke tablice). */
(function(){
  var content=document.getElementById('content'); if(!content) return;
  var MIN=10;
  function fix(svg){
    var vb=svg.viewBox&&svg.viewBox.baseVal; if(!vb||!vb.width) return;
    if(vb.width/vb.height<1.6){ svg.style.minWidth=''; return; } // okrugli/kvadratni crteži moraju stati cijeli
    if(svg.closest('.osMap,.osMapWrap,[data-no-legible],#chartWidget,#navLab,#dockWind,#dockSim,#mobSim,#anchorSim,.dsCard,.ialaCard,#lateralWidget,#cardinalWidget,#otherMarksWidget,#anchorWidget,.wSea,#lightStage')) return;
    var fs=Infinity; svg.querySelectorAll('text').forEach(function(t){ var f=parseFloat(t.getAttribute('font-size')||getComputedStyle(t).fontSize); if(f>0&&f<fs) fs=f; });
    if(fs===Infinity) return;
    var need=Math.min(vb.width, Math.ceil(vb.width*MIN/fs));
    var host=svg.parentElement; if(!host) return;
    var avail=host.clientWidth||0;
    if(avail && avail<need){ svg.style.minWidth=need+'px'; svg.style.maxWidth='none'; host.style.overflowX='auto'; host.classList.add('lgScroll');
      if(!(host.nextElementSibling&&host.nextElementSibling.classList.contains('lgHint'))&&!host.querySelector(':scope > .lgHint')){ var h=document.createElement('div'); h.className='lgHint'; h.textContent='↔ Povuci vodoravno za cijeli crtež'; if(host===svg.parentElement&&host.tagName!=='svg') host.insertAdjacentElement('afterend',h); } }
    else { svg.style.minWidth=''; var nx=host.nextElementSibling; if(nx&&nx.classList.contains('lgHint')) nx.remove(); }
  }
  function all(scope){ (scope||content).querySelectorAll('svg').forEach(fix); }
  var t=null; function later(){ clearTimeout(t); t=setTimeout(function(){ all(); },120); }
  window.addEventListener('resize',later);
  new MutationObserver(function(ms){ ms.forEach(function(m){ m.addedNodes.forEach(function(n){ if(n.nodeType!==1) return; if(n.tagName&&n.tagName.toLowerCase()==='svg') fix(n); else if(n.querySelectorAll) n.querySelectorAll('svg').forEach(fix); }); }); })
    .observe(content,{childList:true,subtree:true});
  new MutationObserver(later).observe(content,{attributes:true,subtree:true,attributeFilter:['class']});
  all();
})();

/* Ime svakog crteža za čitač zaslona. Crtež bez imena dobije ga po najbližem naslovu iznad sebe:
   onaj s dijelovima koji primaju fokus postaje skupina, ostali slika. Ukrasni (aria-hidden) se ne diraju. */
(function(){
  var content=document.getElementById('content'); if(!content) return;
  var SEL='svg:not([role]):not([aria-label]):not([aria-labelledby]):not([aria-hidden])';
  function nameFor(svg){ var pg=svg.closest('section.page'); if(!pg) return '';
    var hs=pg.querySelectorAll('h2,h3,h4,.osHead b,.simTitle'), t='';
    for(var i=0;i<hs.length;i++){ if(hs[i].compareDocumentPosition(svg)&Node.DOCUMENT_POSITION_FOLLOWING) t=hs[i].textContent; else if(!hs[i].contains(svg)) break; }
    return t.replace(/\s+/g,' ').trim(); }
  /* svaki crtež u gradivu je shema stvarne stvari (svjetla, oznake, more, motor): tako se i zove u kodu */
  function kind(){ content.querySelectorAll('svg:not(.ico):not([data-kind])').forEach(function(s){ s.setAttribute('data-kind','diagram'); }); }
  function label(){ pending=0; kind(); content.querySelectorAll(SEL).forEach(function(s){
      if(s.closest('[aria-hidden="true"],button,a,[role="img"]')){ s.setAttribute('aria-hidden','true'); return; }
      var t=nameFor(s); if(!t){ s.setAttribute('aria-hidden','true'); return; }
      s.setAttribute('role',s.querySelector('[tabindex]:not([tabindex="-1"]),a[href],button,[role="button"]')?'group':'img'); s.setAttribute('aria-label','Crtež: '+t); }); }
  var pending=0; label();
  new MutationObserver(function(){ if(!pending) pending=requestAnimationFrame(label); }).observe(content,{childList:true,subtree:true});
})();
