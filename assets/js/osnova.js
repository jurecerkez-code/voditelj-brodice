"use strict";
/* Sažetak „Osnova“, karta uma i usmeni odgovori na vrhu svakog poglavlja. */
/* ═══════════════ OSNOVA + KARTA UMA (+ USMENO) NA VRHU SVAKOG POGLAVLJA ═══════════════ */
/* Rečenice OSNOVE izvučene su iz teksta poglavlja (bez novih činjenica), napisane kao usmeni odgovor.
   Karta uma: čvor = [natpis, naslov u tekstu do kojeg klik skrola, red, stupac 0 do 1]; veza = [od, do, 'l' za crtu bez strelice]. */
window.VBOsnova=(function(){
  const D={
  'p-nav':{t:'nav',os:[
    'Koordinate čitaš u stupnjevima, minutama i desetinkama minute i uvijek dodaš N ili E: 43° 25,6′ N, 16° 38,7′ E.',
    'Nautička milja je jedna minuta zemljopisne širine: 1852 m, 10 kabela. Udaljenost mjeriš šestarom samo na skali širine, lijevo ili desno.',
    'Kurs određuješ s dva trokuta: hipotenuza na liniju kursa, klizneš do središta ruže i očitaš u smjeru plovidbe.',
    'Na karti je žuto kopno, plavo dubina manja od 10 m, bijelo veća. Crveno prekriženo sidro je zabrana sidrenja.',
    'Vjetar se imenuje po tome odakle puše, a struja po tome kamo ide: razlikuju se za 180°.'],
   map:{n:[['Koordinate N / E','Osnovni pojmovi',0,.17],['Šestar: milje','Mjerenje udaljenosti',0,.5],['Trokuti: kurs','Određivanje kursa',0,.83],
     ['Pozicija','Određivanje pozicije',1,.17],['Boje na karti','Boje i simboli na karti',1,.5],['Svjetla i sektori','Karakteristika pomorskog svjetla',1,.83],
     ['Kompas','Kompas',2,.17],['Publikacije HHI','Pomorske publikacije',2,.5],['Vjetar ≠ struja','Vjetar i struja',2,.83]],
    e:[[0,1],[1,2]]}},
  'p-iala':{t:'iala',os:[
    'Jadran je u zoni A: pri uplovljavanju crvena lateralna oznaka (valjak) ostaje lijevo, zelena (čunj vrhom gore) desno.',
    'Kardinalna oznaka pokazuje sigurnu stranu: prolaziš s one strane po kojoj se zove. Vršna oznaka su uvijek dva crna čunja.',
    'Sve kardinalne svijetle bijelo, a broj bljeskova ide kao brojčanik sata: N neprekidno, E 3, S 6 i dugi, W 9.',
    'Usamljena opasnost je crno-crveno-crna s dvije crne kugle i svjetlom Bl(2). Izbjegni je promjenom kursa.',
    'Posebna oznaka je žuta sa žutim X i nije navigacijska opasnost.'],
   map:{n:[['Zona A','Lateralni (bočni) sustav',0,.17],['Kardinalni sustav','Kardinalni sustav',0,.5],['Ostale oznake','Ostale oznake',0,.83],
     ['Smjer uplovljavanja','Lateralni (bočni) sustav',1,.17],['Dva crna čunja','Kardinalni sustav',1,.5],['Usamljena opasnost','Ostale oznake',1,.83],
     ['Crvena lijevo','Lateralni (bočni) sustav',2,.1],['Zelena desno','Lateralni (bočni) sustav',2,.38],['Bijelo: 12, 3, 6, 9','Mnemonik broja bljeskova',2,.7]],
    e:[[0,3],[3,6],[3,7],[1,4],[4,8],[2,5]]}},
  'p-svjetla':{t:'lights',os:[
    'Svjetla se pokazuju od zalaska do izlaska sunca, a danju u slaboj vidljivosti.',
    'Jarbolno je bijelo, 225° po pramcu. Bočna su crveno lijevo i zeleno desno, po 112,5°. Krmeno je bijelo, 135° po krmi.',
    'Brodica do 12 m: bočna i bijelo kružno. Brod do 50 m: jarbolno, bočna i krmeno. Preko 50 m dva jarbolna, prednje niže.',
    'Dva crvena u okomici: nesposoban za manevriranje. Tri crvena: ograničen gazom. Crveno, bijelo, crveno: ograničene sposobnosti manevriranja.',
    'Crveno iznad bijelog je ribolov, zeleno iznad bijelog koćarenje, bijelo iznad crvenog peljar.'],
   map:{n:[['Jarbolno 225°','Vrste svjetala i njihovi sektori',0,.17],['Bočna 2 × 112,5°','Vrste svjetala i njihovi sektori',0,.5],['Krmeno 135°','Vrste svjetala i njihovi sektori',0,.83],
     ['225 + 135 = 360°','Provjera zbrajanjem',1,.5],
     ['Mehanički pogon','Brodovi na mehanički pogon',2,.17],['Jedra i vesla','Brodovi na jedra i vesla',2,.5],['Posebni brodovi','Posebni brodovi',2,.83]],
    e:[[0,3],[2,3],[1,3,'l']],col:{0:'w',1:'rg',2:'w'}}},
  'p-znakovi':{t:'shapes',os:[
    'Dnevni znakovi su crni i ističu se samo danju, na najvidljivijem mjestu.',
    'Kugle: jedna je usidren brod, dvije nesposoban za manevriranje, tri nasukan.',
    'Čunj vrhom dolje je motorni jedrenjak: tretira se kao motorni brod i nema prednost jedrilice.',
    'Dvočunj spojen vrhovima je ribolov, valjak brod ograničen gazom, a kugla, dvočunj bazama, kugla ograničene sposobnosti manevriranja.'],
   map:{n:[['Kugle','Kugle: brojanje',0,.17],['Čunj vrhom dolje','Scenarij 2',0,.5],['Dvočunj vrhovima','Tablica dnevnih znakova',0,.83],
     ['1 kugla: usidren','Scenarij 1',1,.17],['Motorni jedrenjak','Scenarij 2',1,.5],['Ribolov','Tablica dnevnih znakova',1,.83],
     ['2 kugle: nesposoban','Tablica dnevnih znakova',2,.17],['= motorni brod','Scenarij 2',2,.5],
     ['3 kugle: nasukan','Tablica dnevnih znakova',3,.17]],
    e:[[0,3],[3,6],[6,8],[1,4],[4,7],[2,5]]}},
  'p-sudari':{t:'colreg',os:[
    'Nasuprotni kursevi: oba broda mijenjaju kurs udesno.',
    'Kad se kursevi sijeku, izbjegava onaj koji drugoga vidi preko svoje desne strane: skreće udesno i prolazi mu iza krme. Drugi zadržava kurs i brzinu.',
    'Brod koji pretječe uvijek se uklanja, pa i jedrilica.',
    'Ako drugi ne reagira: najmanje 5 kratkih, pa puni okret udesno. Nikad ulijevo.',
    'Rizik od sudara: kut (azimut) na drugi brod se ne mijenja, a udaljenost se smanjuje.'],
   map:{n:[['Glava u glavu','Motorni brod × motorni brod',0,.17],['Kursevi se sijeku','Motorni brod × motorni brod',0,.5],['Pretjecanje','Motorni brod × motorni brod',0,.83],
     ['Oba udesno','Motorni brod × motorni brod',1,.17],['Zdesna? Izbjegavaš','Motorni brod × motorni brod',1,.5],['Ti se uklanjaš','Motorni brod × motorni brod',1,.83],
     ['Ne reagira?','Pitanje koje je pao',2,.17],['5 kratkih, udesno','Pitanje koje je pao',2,.5],['Kut stalan = rizik','Kako prepoznati rizik',2,.83]],
    e:[[0,3],[1,4],[2,5],[6,7]]}},
  'p-signali':{t:'sound',os:[
    'Kratki signal traje 1 sekundu, dugi 4 do 6 sekundi.',
    'Jedan kratki: mijenjam kurs udesno. Dva: ulijevo. Tri: vozim krmom. Najmanje pet: upozorenje.',
    'Jedan dugi: nailazim iza rta ili zavoja i ne vidim drugu stranu.',
    'U magli brodovi u plovidbi daju signal svake 2 minute, usidreni i nasukani svake 1 minute.',
    'SOS je tri kratka, tri duga, tri kratka, zvukom ili svjetlom.'],
   map:{n:[['Brodovi se vide','Signali za manevar',0,.17],['Magla','Signali pri ograničenoj vidljivosti',0,.5],['Pogibelj','Signali opasnosti',0,.83],
     ['1 D, 2 L, 3 krmom','Signali za manevar',1,.17],['Plovi: 1 dugi','Signali pri ograničenoj vidljivosti',1,.5],['SOS, MAYDAY','Signali opasnosti',1,.83],
     ['5+ upozorenje','Signali za manevar',2,.17],['Svake 2 min / 1 min','Signali pri ograničenoj vidljivosti',2,.5],['Rakete, buktinje','Signali opasnosti',2,.83]],
    e:[[0,3],[3,6,'l'],[1,4],[4,7,'l'],[2,5],[5,8,'l']]}},
  'p-motor':{t:'engine',os:[
    'Četverotaktni motor ima usis, kompresiju, ekspanziju (radni takt) i ispuh. Dvotaktni nema ventile i radni takt ima pri svakom okretaju.',
    'Benzinski motor pali smjesu iskrom svjećice. Dizel nema svjećicu: gorivo se samo zapali u vrućem sabijenom zraku.',
    'Kod vodenog hlađenja prije pokretanja obavezno otvori ventil za ulaz mora.',
    'Instrumenti: manometar (tlak ulja), termometar, ampermetar, voltmetar, obrtomjer i nivokaz goriva.',
    'Pri krcanju goriva iskrcaj sve osim posade, zabrani pušenje, aparat u pripravu i zatvori otvore.'],
   map:{n:[['Usis','Četverotaktni motor',0,.12],['Kompresija','Četverotaktni motor',0,.37],['Ekspanzija','Četverotaktni motor',0,.63],['Ispuh','Četverotaktni motor',0,.88],
     ['Benzin: iskra','Benzinski (Otto)',1,.3],['Dizel: samozapaljenje','Dizel',1,.72],
     ['Ventil za ulaz mora','Hlađenje motora',2,.17],['Instrumenti','Instrumenti za kontrolu',2,.5],['Krcanje goriva','Krcanje goriva',2,.83]],
    e:[[0,1],[1,2],[2,3],[1,4],[1,5]]}},
  'p-propisi':{t:'rules',os:[
    'Brodica je duža od 2,5 m i najviše 15 m, ili ima porivni stroj snage veće od 5 kW, i prevozi najviše 12 putnika.',
    'Na brodici moraju biti upisni list i uvjerenje o osposobljenosti. Uz VHF ide dozvola za postaju, uz motor jači od 15 kW polica osiguranja, a ako brodica nije tvoja, ovjerena punomoć.',
    'Područja plovidbe: II do 20 Nm, III 12, IIIa 6, IIIb 3 i IIIc 1 Nm od obale.',
    'Plovilo kraće od 15 m plovi najmanje 50 m od obale, a do 300 m od obale najviše 8 čvorova (NN 52/2025).',
    'Pomorsku nesreću prijavljuješ odmah, a nezgodu lučkoj kapetaniji najkasnije u roku od 12 sati.'],
   map:{n:[['Brodica','Definicije plovnih objekata',0,.17],['Područja plovidbe','Područja plovidbe',0,.5],['Plovidba uz obalu','Plovidba uz obalu',0,.83],
     ['Isprave','Isprave koje MORAJU',1,.17],['20, 12, 6, 3, 1 Nm','Područja plovidbe',1,.5],['50 m od obale','Plovidba uz obalu',1,.83],
     ['Pregledi','Pregledi brodice',2,.17],['Nezgoda: 12 h','Prijava pomorske nesreće',2,.5],['8 čv do 300 m','Ograničenja brzine',2,.83]],
    e:[[0,3,'l'],[3,6,'l'],[1,4,'l'],[2,5,'l'],[5,8,'l']]}},
  'p-meteo':{t:'meteo',os:[
    'Vjetrovi od sjevera u smjeru kazaljke: tramontana, bura, levanat, jugo, oštro, lebić, pulenat, maestral.',
    'Bura je najopasnija: puše s kopna na refule i u vrlo kratkom vremenu dosegne orkansku snagu.',
    'Jugo puše s mora, toplo i vlažno, jača postupno, pa imaš vremena da se skloniš.',
    'Tri najvažnija elementa su temperatura (termometar), tlak (barometar, hPa) i vlažnost (higrometar).',
    'Ciklona je nizak tlak i ružno vrijeme, anticiklona visok tlak i lijepo vrijeme.'],
   map:{n:[['Visok → nizak tlak','Zašto vjetar puše',0,.17],['Vjetar','Zašto vjetar puše',0,.5],['8 vjetrova','Osam vjetrova Jadrana',0,.83],
     ['Ciklona, anticiklona','Ciklone i anticiklone',1,.17],['Bura: kopno, refuli','Bura: najopasniji vjetar',1,.5],['Jugo: more, postupno','Bura: najopasniji vjetar',1,.83],
     ['T, tlak, vlaga','Meteorološki elementi',2,.17],['Nevera: kratka','Nevera',2,.5],['Izvješća: VHF 07, 21','Vremenska izvješća',2,.83]],
    e:[[0,1],[1,2],[2,4],[2,5]]}},
  'p-manevar':{t:'man',os:[
    'Desnokretni vijak pri vožnji krmom izbija krmu ulijevo, pa pristaješ lijevim bokom. Lijevokretni obrnuto.',
    'Pri vožnji krmom kormilo skoro nema učinka.',
    'Sidreni lanac ili konop: 3 do 4 puta dubina, po lošem vremenu više.',
    'Mjestu sidrenja prilaziš uz vjetar ili uz struju, oboriš sidro i zavoziš krmom da se ukopa.',
    'Čovjek u moru: odmah kormilo sve u stranu pada osobe, smanji brzinu, dobaci kolut, jedna osoba ga stalno gleda.'],
   map:{n:[['Vanjske sile','Sile koje djeluju na brodicu',0,.17],['Unutarnje sile','Sile koje djeluju na brodicu',0,.5],['Sidrenje','Sidrenje',0,.83],
     ['Vjetar, struja','Sile koje djeluju na brodicu',1,.17],['Vijak','Vijak i izboj krme',1,.5],['3 do 4 × dubina','Sidrenje',1,.83],
     ['Čovjek u moru','Čovjek u moru',2,.17],['Izboj krme','Vijak i izboj krme',2,.5],['Uz vjetar ili struju','Postupak sidrenja',2,.83],
     ['Pristajanje bokom','Kako to iskoristiti',3,.5]],
    e:[[0,3,'l'],[1,4],[4,7],[7,9],[2,5],[5,8]]}},
  'p-sigurnost':{t:'safe',os:[
    'Kod sudara ne napuštaš mjesto dok osobe na drugoj brodici nisu na sigurnom. Prvo se spašavaju osobe, pa brodica.',
    'Kod požara odmah gasiš prijenosnim aparatom. U strojarnici ugasi motor i zatvori dovod goriva i zraka.',
    'Za spašavanje osoba ne pripada naknada, a za spašavanje imovine pripada pravična naknada.',
    'SAR: besplatni broj 195, MRCC Rijeka, 24 sata.',
    'Oprema ovisi o području plovidbe. Svaka brodica ima prsluke za sve osobe, sidro, tri užeta za privez, uže za tegalj i aparat za gašenje.',
    'Četiri obavezna čvora: pašnjak, muški, zastavni i vrzni uzao.'],
   map:{n:[['Nezgode','Postupci u nezgodama',0,.17],['Spašavanje','Spašavanje: pravna pravila',0,.5],['SAR: 195','SAR služba',0,.83],
     ['Sudar: osobe prvo','Sudar',1,.17],['Osobe: bez naknade','Spašavanje: pravna pravila',1,.5],['MRCC Rijeka','SAR služba',1,.83],
     ['Požar: gasi odmah','Požar',2,.17],['Imovina: naknada','Spašavanje: pravna pravila',2,.5],['4 obavezna čvora','Konopi i čvorovi',2,.83]],
    e:[[0,3,'l'],[3,6,'l'],[1,4,'l'],[4,7,'l'],[2,5]]}},
  'p-radio':{t:'radio',os:[
    'Kanal 16 (156,800 MHz) je za pogibelj, poziv i sigurnost i pratiš ga cijelo vrijeme plovidbe.',
    'MAYDAY je pogibelj, PAN PAN žurnost, SECURITE sigurnost.',
    'MAYDAY tri puta, OVDJE, ime plovila tri puta, pa poruka: ime, pozicija, vrsta opasnosti i vrsta pomoći.',
    'Pozivanje na kanalu 16 ne smije trajati duže od jedne minute. Nakon uspostave veze odmah prijeđi na radni kanal.',
    'Squelch nikad na maksimum, jer propuštaš slabe signale pogibelji. Najveća snaga je 25 W.'],
   map:{n:[['MAYDAY','Tri signala po prioritetu',0,.17],['PAN PAN','Tri signala po prioritetu',0,.5],['SECURITE','Tri signala po prioritetu',0,.83],
     ['Kanal 16, 156,800','VHF kanali',1,.17],['Kanal 70: DSC','GMDSS i DSC',1,.5],['Kanal 10: kapetanija','VHF kanali',1,.83],
     ['MAYDAY ×3, OVDJE','MAYDAY: točan postupak',2,.17],['Poziv najviše 1 min','Uspostavljanje veze',2,.5],['Squelch ne na max','Kontrole na uređaju',2,.83]],
    e:[[0,1],[1,2],[0,3],[3,6]]}}
  };
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  // karta uma: SVG, čvorovi su gumbi (tab + enter), klik skrola do naslova u tekstu
  function mapSvg(m,uid){ const W=560, RH=64, rows=Math.max(...m.n.map(n=>n[2]))+1, H=rows*RH+8;
    const pos=m.n.map(n=>{ const c=(m.col||{})[m.n.indexOf(n)], w=Math.min(190,Math.max(60,[...n[0]].length*8.1+26))+(c?12:0); return {x:Math.max(w/2+3,Math.min(W-w/2-3,n[3]*W)), y:8+n[2]*RH+RH/2-8, w}; });
    // susjedi u istom redu ne smiju se dodirivati: oba se suze dok razmak nije 10
    pos.forEach(A=>pos.forEach(B=>{ if(A.y!==B.y||B.x<=A.x) return; const g=(B.x-B.w/2)-(A.x+A.w/2); if(g<10){ A.w-=10-g; B.w-=10-g; } }));
    let g=`<defs><marker id="osArr-${uid}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#8fb4cf"/></marker></defs>`;
    m.e.forEach(([a,b,st])=>{ const A=pos[a], B=pos[b]; let x1,y1,x2,y2;
      if(m.n[a][2]===m.n[b][2]){ const s=Math.sign(B.x-A.x); x1=A.x+s*A.w/2; y1=A.y; x2=B.x-s*(B.w/2+(st?0:3)); y2=B.y; }
      else { x1=A.x; y1=A.y+14; x2=B.x; y2=B.y-14-(st?0:3); }
      g+=`<line x1="${x1.toFixed(1)}" y1="${y1}" x2="${x2.toFixed(1)}" y2="${y2}" stroke="#8fb4cf" stroke-width="1.4" ${st?'stroke-dasharray="3 3"':'marker-end="url(#osArr-'+uid+')"'} opacity=".8"/>`; });
    m.n.forEach((n,i)=>{ const p=pos[i], c=(m.col||{})[i];
      const dot=c==='w'?`<circle cx="${p.x-p.w/2+12}" cy="${p.y}" r="4" fill="var(--sig-white)"/>`:c==='rg'?`<circle cx="${p.x-p.w/2+9}" cy="${p.y}" r="3.6" fill="var(--sig-red)"/><circle cx="${p.x-p.w/2+17}" cy="${p.y}" r="3.6" fill="var(--sig-green)"/>`:'';
      const tx=p.x+(c==='rg'?7:c==='w'?5:0);
      g+=`<g class="osNode" data-h="${esc(n[1])}" role="button" tabindex="0" aria-label="${esc(n[0])}: skoči na „${esc(n[1])}"">
        <rect x="${(p.x-p.w/2).toFixed(1)}" y="${p.y-14}" width="${p.w}" height="28" rx="2"/>${dot}
        <text x="${tx.toFixed(1)}" y="${p.y+4.5}" text-anchor="middle">${esc(n[0])}</text></g>`; });
    return `<svg viewBox="0 0 ${W} ${H}" class="osMapSvg" role="group" aria-label="Karta uma poglavlja">${g}</svg>`; }
  function jump(sec,h){ const want=h.toLowerCase(); const cands=$$('h3,h4,h5,summary,b,strong',sec).filter(e=>!e.closest('.osBox'));
    const t=cands.find(e=>e.textContent.trim().toLowerCase().startsWith(want))||cands.find(e=>e.textContent.toLowerCase().includes(want));
    if(!t) return; const blk=t.closest('h3,h4,h5,.card,.note,.warn,.danger,.ok,.mnem,details,table')||t;
    blk.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    blk.classList.remove('osHit'); void blk.offsetWidth; blk.classList.add('osHit'); setTimeout(()=>blk.classList.remove('osHit'),1800); }
  /* usmeni dio: 3 do 5 pitanja iz banke za ovo poglavlje, odgovor skriven dok ga sam ne otvoriš */
  function oral(bx,t,btn){ const tools=$('.osTools',bx), open=tools.classList.toggle('open');
    btn.setAttribute('aria-expanded',open); if(!open){ tools.innerHTML=''; return; }
    const pool=QB.filter(q=>q.t===t), qs=shuffle(pool.slice()).slice(0,Math.min(pool.length,3+Math.floor(Math.random()*3)));
    tools.innerHTML=`<div class="osOral"><div class="osOralHead"><b>Usmeno</b><span>Odgovori naglas, cijelom rečenicom, pa otvori odgovor.</span></div>
      <ol>${qs.map(q=>`<li><div class="osOq">${q.q}</div><button class="osShow" type="button">Pokaži odgovor</button><div class="osAns" hidden><b>${q.o[q.a]}</b>${q.e?`<br><span>${q.e}</span>`:''}</div></li>`).join('')}</ol>
      <div class="osOralFoot"><button class="osNew" type="button">↻ Nova pitanja</button><span class="osOralN"></span></div></div>`;
    const lis=$$('li',tools), upd=()=>{ const n=$$('.osAns:not([hidden])',tools).length; $('.osOralN',tools).textContent=`${n} / ${lis.length} otvoreno`; };
    lis.forEach(li=>$('.osShow',li).addEventListener('click',e=>{ $('.osAns',li).hidden=false; e.currentTarget.remove(); upd(); }));
    $('.osNew',tools).addEventListener('click',()=>{ tools.classList.remove('open'); oral(bx,t,btn); }); upd(); }
  function mount(){ Object.keys(D).forEach(id=>{ const sec=el(id); if(!sec||$('.osBox',sec)) return; const d=D[id], h2=$('h2.ph',sec);
      const box=`<div class="osBox" data-topic="${d.t}"><div class="osHead"><b>Osnova</b><span>ako naučiš samo ovo, prolaziš</span><button class="osOralBtn" type="button" aria-expanded="false">Usmeno</button></div>
        <ul class="osList">${d.os.map(s=>`<li>${s}</li>`).join('')}</ul><div class="osTools"></div>
        <div class="osMap"><div class="osMapTitle">Karta uma <small>klikni pojam za skok u tekst</small></div>${mapSvg(d.map,id)}</div></div>`;
      const sub=h2&&h2.nextElementSibling, at=sub&&sub.classList.contains('phSub')?sub:h2;   // osnova ide ispod naslova i retka s predmetom
      if(at) at.insertAdjacentHTML('afterend',box); else sec.insertAdjacentHTML('afterbegin',box);
      const bx=$('.osBox',sec);
      const ob=$('.osOralBtn',bx); ob.addEventListener('click',()=>oral(bx,d.t,ob));
      $$('.osNode',bx).forEach(n=>{ const f=()=>jump(sec,n.dataset.h); n.addEventListener('click',f); n.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); f(); } }); }); }); }
  mount();
  return {D,mount};
})();
