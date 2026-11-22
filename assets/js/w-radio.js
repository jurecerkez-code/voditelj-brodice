"use strict";
/* VHF: dijelovi postaje, MAYDAY poziv, sricanje, checkliste. */
/* ═══════════════ VHF PARTS ═══════════════ */
(function(){
  const b=el('vhfWidget'); if(!b) return;
  const W=660,H=280;
  let g=`<rect width="${W}" height="${H}" fill="#0b1a28" rx="10"/>`;
  // radio body
  g+=`<rect x="70" y="76" width="250" height="140" rx="12" fill="url(#vhBody)" stroke="#4a7a9c" stroke-width="2"/>`;
  // V3-VHF: LCD zaslon (klik mijenja kanal); kanali i namjena iz poglavlja
  g+=`<defs><linearGradient id="vhLcd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f4a2c"/><stop offset="1" stop-color="#0c2616"/></linearGradient>
    <linearGradient id="vhBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24394d"/><stop offset="1" stop-color="#14232f"/></linearGradient></defs>`;
  g+=`<g class="vhLcd cur-ptr"><rect x="84" y="92" width="158" height="62" rx="6" fill="url(#vhLcd)" stroke="#2b6b45" stroke-width="1.5"/>
    <rect x="86" y="94" width="154" height="10" rx="4" fill="#fff" opacity=".05"/><g class="vhTxt"></g></g>`;
  g+=`<circle cx="268" cy="120" r="18" fill="#2b4257" stroke="#6b93ae" stroke-width="2"/><text x="268" y="150" text-anchor="middle" font-size="9" fill="${C.txt2}">VOL</text>`;
  g+=`<circle cx="268" cy="178" r="14" fill="#2b4257" stroke="#6b93ae" stroke-width="2"/><text x="268" y="203" text-anchor="middle" font-size="9" fill="${C.txt2}">SQL</text>`;
  g+=`<rect x="90" y="164" width="42" height="20" rx="4" fill="#2b4257" stroke="#6b93ae"/><text x="111" y="178" text-anchor="middle" font-size="9" fill="${C.txt2}">1/25W</text>`;
  g+=`<rect x="140" y="164" width="42" height="20" rx="4" fill="#2b4257" stroke="#6b93ae"/><text x="161" y="178" text-anchor="middle" font-size="9" fill="${C.txt2}">DW</text>`;
  g+=`<rect x="190" y="164" width="42" height="20" rx="4" fill="#2b4257" stroke="#6b93ae"/><text x="211" y="178" text-anchor="middle" font-size="9" fill="${C.txt2}">DIM</text>`;
  // handset
  g+=`<g transform="translate(430,150)"><rect x="-24" y="-58" width="48" height="116" rx="14" fill="#2b4257" stroke="#6b93ae" stroke-width="2"/>
    <circle cy="-36" r="10" fill="#16283a"/><circle cy="40" r="9" fill="#16283a"/>
    <rect x="-30" y="-14" width="10" height="28" rx="4" fill="${C.red}"/></g>`;
  g+=`<path d="M340,180 q40,26 70,10" fill="none" stroke="#6b93ae" stroke-width="3"/>`;
  // antenna
  g+=`<line x1="580" y1="34" x2="580" y2="180" stroke="#c8d6e2" stroke-width="5" stroke-linecap="round"/>`;
  g+=`<circle cx="580" cy="30" r="5" fill="${C.acc}"/>`;
  for(let i=1;i<=3;i++) g+=`<circle cx="580" cy="30" r="${14*i}" fill="none" stroke="${C.acc}" stroke-width="1.4" opacity="${.5/i}"/>`;
  // battery
  g+=`<g transform="translate(150,244)"><rect x="-46" y="-16" width="92" height="30" rx="5" fill="#2b4257" stroke="#6b93ae" stroke-width="2"/>
    <rect x="-30" y="-22" width="12" height="7" fill="#6b93ae"/><rect x="16" y="-22" width="12" height="7" fill="#6b93ae"/>
    <text y="4" text-anchor="middle" font-size="12" fill="#cfe" font-weight="600">12 V DC</text></g>`;
  g+=`<line x1="150" y1="228" x2="150" y2="216" stroke="#6b93ae" stroke-width="3"/>`;
  const lbl=[[196,64,'① Primopredajnik',C.acc],[430,66,'② mikrotelefonska<tspan x="430" dy="14">Kombinacija</tspan>',C.acc],[580,206,'③ antena (360°)',C.acc],[150,282,'④ Izvor napajanja',C.acc]];
  lbl.forEach(l=> g+=`<text x="${l[0]}" y="${l[1]}" text-anchor="middle" font-size="11.5" font-weight="600" fill="${l[3]}">${l[2]}</text>`);
  b.innerHTML=SVG(W,300,g)+`<div class="vhCh" style="font-size:13.5px;color:var(--txt2);margin-top:8px"></div>`;
  const CH=[['16','156.800','Pogibelj, poziv i sigurnost. Neprekidno bdijenje obalnih radijskih postaja.','25W'],['10','156.500','Lučke kapetanije: bdijenje 24 h; ispostave u radno vrijeme.','25W'],
    ['17','156.850','Marine i lučice: izlazna snaga najviše 1 W.','1W'],['09','156.450','Lučke uprave (Lučki operativni centri, LOC).','25W'],['12','156.600','Peljarska društva.','25W'],
    ['06','156.300','Brod-brod: međubrodski promet (i usklađivanje traganja i spašavanja na mjestu nesreće).','25W'],
    ['13','156.650','Sigurnost plovidbe brod-brod: dogovor manevra s mosta na most.','1W'],
    ['70','156.525','DSC: digitalno selektivno pozivanje. Nije za govor.','DSC']]; // V4-B2: dodani 06 i 13
  let ci=0;
  function lcd(){ const c=CH[ci];
    $('.vhTxt',b).innerHTML=`<text x="94" y="112" font-size="9" fill="#8ff0b4" font-family="var(--mono)" opacity=".85">CH</text>
      <text x="206" y="134" text-anchor="end" font-size="34" font-weight="600" fill="#6dffa8" font-family="var(--mono)" style="letter-spacing:1px">${c[0]}</text>
      <text x="234" y="112" text-anchor="end" font-size="9" fill="#8ff0b4" font-family="var(--mono)">${c[3]}</text>
      <text x="163" y="148" text-anchor="middle" font-size="10.5" fill="#8ff0b4" font-family="var(--mono)">${c[1]} MHz</text>`;
    $('.vhCh',b).innerHTML=`<b class="c-acc">Kanal ${c[0]}: ${c[1].replace('.',',')} MHz</b>: ${c[2]} <span class="c-txt3">(klikni zaslon za sljedeći kanal)</span>`; }
  $('.vhLcd',b).addEventListener('click',()=>{ ci=(ci+1)%CH.length; lcd(); });
  lcd();
})();

/* ═══════════════ MAYDAY BUILDER ═══════════════ */
(function(){
  const b=el('maydayWidget'); if(!b) return;
  b.innerHTML=`<div class="grid g2">
    <div><label class="fld" for="mdName">Ime / oznaka brodice</label><input class="w100" type="text" id="mdName" value="ST 123456"></div>
    <div><label class="fld" for="mdPos">Pozicija</label><input class="w100" type="text" id="mdPos" value="43° 25,6' N   16° 38,7' E"></div>
    <div><label class="fld" for="mdDanger">Vrsta opasnosti</label>
      <select class="w100" id="mdDanger">
        <option>prodor mora, tonemo</option><option>požar na brodici</option><option>nasukali smo se</option>
        <option>sudar s drugim plovilom</option><option>osoba pala u more</option><option>eksplozija na brodici</option>
      </select></div>
    <div><label class="fld" for="mdHelp">Broj osoba / tražena pomoć</label><input class="w100" type="text" id="mdHelp" value="4 osobe na brodici, tražimo hitno spašavanje"></div>
  </div>
  <div class="btnrow"><button class="btn p" id="mdGo">Sastavi poziv</button><button class="btn" id="mdTimer" type="button">Izgovori naglas (7 s po retku)</button></div><div id="mdTime"></div>
  <div id="mdOut"></div>`;
  function build(){
    const n=el('mdName').value.trim()||'(ime)', p=el('mdPos').value.trim()||'(pozicija)',
          d=el('mdDanger').value, h=el('mdHelp').value.trim()||'(tražena pomoć)';
    el('mdOut').innerHTML=`<div class="mdRadio" role="img" aria-label="Radio: kanal 16, 156,800 MHz, odašiljanje"><span class="mdTx" aria-hidden="true"></span><b>CH 16</b><span>156.800 MHz</span><small>25 W</small></div><div style="font-family:var(--mono);font-size:14.5px;line-height:1.95;background:var(--panel2);border-top:2px solid var(--red);padding:16px;margin-top:6px">
      <span class="c-red fw8">MAYDAY, MAYDAY, MAYDAY</span><br>
      OVDJE<br>
      <span class="c-acc">${n}, ${n}, ${n}</span><br><br>
      <span class="c-red fw8">MAYDAY</span> <span class="c-acc">${n}</span><br>
      pozicija: <span class="c-acc">${p}</span><br>
      ${d.toUpperCase()}<br>
      ${h.toUpperCase()}<br>
      PRIJEM (OVER)
    </div>
    <div class="note mt10"><b>Redoslijed koji ispitivač traži</b>1) MAYDAY ×3 &nbsp; 2) OVDJE &nbsp; 3) ime/oznaka ×3 &nbsp; → zatim poruka: <b>ime, pozicija, vrsta opasnosti, vrsta tražene pomoći</b>.</div>`;
  }
  el('mdGo').addEventListener('click',()=>{ build();
    if(window.VB && el('mdName').value.trim() && el('mdPos').value.trim() && el('mdHelp').value.trim()) VB.flag('md'); });
  build();
  // V3-MDTIMER: neobavezna vježba izgovora: svaki redak poziva ima 7 s; tekst se skriva, vidiš samo što slijedi
  let mdT=null;
  el('mdTimer').addEventListener('click',()=>{ const box=el('mdTime'); if(mdT){ clearInterval(mdT); mdT=null; box.innerHTML=''; el('mdOut').style.display=''; return; }
    const n=el('mdName').value.trim()||'(ime)';
    const L=['MAYDAY, MAYDAY, MAYDAY','OVDJE',`${n}, ${n}, ${n}`,`MAYDAY ${n}`,'Pozicija','Vrsta opasnosti','Tražena pomoć','PRIJEM'];
    let i=0, t=7; el('mdOut').style.display='none';
    const RMd=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show=()=>{ box.innerHTML=`<div class="mdTbox"><div class="mdRadio on"><span class="mdTx" aria-hidden="true"></span><b>CH 16</b><span>156.800 MHz</span><small>25 W</small></div><div class="mdTstep">Redak ${i+1} / ${L.length}, izgovori naglas:</div><div class="mdTline">${i===0?L[0]:'?'}</div>
      <div class="mdTbar"><i style="width:${t/7*100}%;${RMd?'transition:none':''}"></i></div><div class="mdTsec mono">${t} s</div>
      <div class="mdTprev">${L.slice(0,i).map(x=>'<span>'+x+'</span>').join('')}</div></div>`; };
    show();
    mdT=setInterval(()=>{ t--; if(t<=0){ i++; t=7; if(i>=L.length){ clearInterval(mdT); mdT=null; box.innerHTML='<div class="expl"><b>Gotovo</b> Usporedi s ispisanim pozivom ispod. Na ispitu ide istim redom.</div>'; el('mdOut').style.display=''; build(); return; } }
      show(); },1000);
  });
})();

/* ═══════════════ PHONETIC SPELLER ═══════════════ */
const PHON={A:'Alfa',B:'Bravo',C:'Čarli',Č:'Čarli',Ć:'Čarli',D:'Delta',Đ:'Delta',E:'Eko',F:'Fokstrot',G:'Golf',H:'Hotel',I:'Indija',J:'Džulijet',K:'Kilo',L:'Lima',M:'Majk',N:'November',O:'Oskar',P:'Papa',Q:'Kvibek',R:'Romio',S:'Siera',Š:'Siera',T:'Tango',U:'Juniform',V:'Viktor',W:'Viski',X:'Iksrej',Y:'Jenki',Z:'Zulu',Ž:'Zulu',
'0':'Nada / Ziro','1':'Una / Uan','2':'Biso / Tu','3':'Tera / Tri','4':'Karte / For','5':'Panta / Fajv','6':'Soksi / Siks','7':'Sete / Seven','8':'Okto / Eit','9':'Nove / Najn'};
(function(){
  const btn=el('spellBtn'); if(!btn) return;
  const words=['ISPITANIKA','JADRAN','KAPETANIJA','BRODICA','MAYDAY','SPLIT','9A3425','KOĆARENJE','PLOVPUT','ŠIBENIK','VODITELJ','DUBROVNIK'];
  function spell(){
    const w=(el('spellIn').value||'').toUpperCase().replace(/\s+/g,'');
    if(!w){ el('spellOut').innerHTML=''; return; }
    let h='<div class="chips mt12">';
    for(const ch of w){
      const p=PHON[ch];
      h+=`<span class="chip on"><b>${ch}</b>: ${p||'?'}</span>`;
    }
    h+='</div>';
    el('spellOut').innerHTML=h;
  }
  const userSpell=()=>{ spell(); if(window.VB && (el('spellIn').value||'').trim()) VB.flag('spell'); };
  btn.addEventListener('click',userSpell);
  el('spellIn').addEventListener('keydown',e=>{ if(e.key==='Enter') userSpell(); });
  el('spellRnd').addEventListener('click',()=>{ el('spellIn').value=rnd(words); userSpell(); });
  el('spellIn').value='ISPITANIKA'; spell();
})();

/* ═══════════════ CHECKLISTS ═══════════════ */
const CHECKS={
  preStartList:['Količina goriva (uključujući rezervu)','Dovod goriva od spremnika do motora','Količina ulja za podmazivanje: baždarenom šipkom','Sustav za hlađenje motora','Ako je hlađenje vodeno: <b>otvoren ventil za ulaz mora</b>','Ako je hlađenje zračno: je li ventilator slobodan','Akumulator (ako je pokretanje električno)','Pregled brodskog vijka: je li slobodan (nema konopa, mreže)','Provjetriti prostor benzinskog motora zračnim ventilatorom'],
  clAdmin:['Poslana poruka kapetaniji ili Ministarstvu i dobiven termin','Ispunjen i poslan prijavni obrazac','Uplaćena pristojba 58,40 € i poslana potvrda','Poslana kopija osobne iskaznice','Poslana kopija vozačke dozvole (ili plan za polaganje prve pomoći)','Pripremljene dvije fotografije 3×3,5 cm','Znam gdje je i u koliko sati ispit: dolazim <b>sat ranije</b>'],
  clChart:['Znam očitati širinu i dužinu i <b>uvijek dodam N i E</b>','Znam odrediti kurs s dva trokuta preko ruže kompasa','Znam izmjeriti udaljenost šestarom <b>po skali širine</b>','Znam četiri načina određivanja pozicije','Znam boje karte: žuto je kopno, plavo dubina manja od 10 m, bijelo veća od 10 m','Prepoznajem kabele, cjevovode, sidrišta i zabranu sidrenja','Znam pročitati karakteristiku svjetla (Bl(4) 10s 21m 15 M)','Znam kratice dna: M, P, K, Š, Šk, Kor, T, Hr','Nautička milja ima 1852 m, odnosno 10 kabela'],
  clLights:['Znam četiri kardinalne oznake: čunjeve, boje i broj bljeskova','Znam lateralne oznake: crvena lijevo (valjak), zelena desno (čunj gore)','Znam usamljenu opasnost, sigurnu vodu i posebnu oznaku','Znam sektore: jarbolno 225°, krmeno 135°, bočna 112,5°','Znam svjetla motornog broda kraćeg i duljeg od 50 m','Znam svjetla jedrenjaka i trobojnu svjetiljku','Znam da je <b>brod s čunjem vrhom dolje motorni jedrenjak, dakle motorni brod</b>','Znam znakove usidrenog, nesposobnog, nasukanog i broda ograničenog gazom','Razlikujem ribolov (C-B), koćarenje (Z-B) i peljara (B-C)','Znam sve dnevne znakove i što znače za prednost'],
  clColreg:['Nasuprotni kursovi: <b>oba udesno</b>','Kursovi se sijeku: <b>izbjegava onaj koji drugoga vidi zdesna</b>','Onaj s prednošću <b>zadržava kurs i brzinu</b>','Ako drugi ne reagira: <b>pet kratkih, pa puni okret udesno</b>','Pretjecanje: onaj koji pretječe uvijek se uklanja i ne presijeca kurs','Jedrilice, različiti bokovi: izbjegava <b>lijevi bok</b>','Jedrilice, isti bok: izbjegava <b>privjetrina</b>','Brod koji izlazi iz luke ima prednost','Uski kanal: plovila do 20 m sklanjaju se većima; prelazak okomito','Znam hijerarhiju: nesposoban i ograničen, zatim ribolov, jedra, pa motor'],
  clEngine:['Četiri takta: usis, kompresija, ekspanzija, ispuh','Dva takta: izmjena medija i kompresija, izgaranje i ekspanzija','Dvotaktni nema ventile, ima kanale','Benzinski: rasplinjač i svjećica. Dizelski: bez njih, samozapaljenje na oko 700 °C','Hlađenje: zračno ili vodeno (izravno i neizravno)','Podmazivanje: tlačno, zapljuskivanjem, mješavinom','Šest instrumenata: manometar, termometar, ampermetar, voltmetar, brojilo okretaja, pokazivač razine goriva','Pet koraka krcanja goriva','Akumulator: olovni (sumporna kiselina) ili čelični (kalijeva lužina), 2 V po ćeliji, samo istosmjerna struja','Gašenje požara: prah, CO₂, pjena, voda, pokrivač'],
  clRules:['Brodica: 2,5 do 15 m ili više od 5 kW. Jahta: dulja od 15 m. Brod: dulji od 15 m ili više od 12 putnika','Područja plovidbe: I, II (20), III (12), IIIa (6), IIIb (3), IIIc (1), IV','Isprave na brodici: upisni list, uvjerenje, dozvola za VHF, polica (motor jači od 15 kW), punomoć ako brodica nije tvoja','Pregledi: osnovni, redoviti (svake 2 godine ili svakih 5 godina), izvanredni','Nesreća se prijavljuje odmah, nezgoda u roku od <b>12 sati</b>','Udaljenosti od obale po duljini: 30 m i više 300 m, od 15 do 30 m 150 m, manje od 15 m 50 m','Brzina do 300 m od obale: <b>najviše 8 čvorova</b>','Glisiranje: samo dalje od 300 m od obale','Sidreni konop: 3 do 4 × dubina','Osam vjetrova; zašto je bura najopasnija','Broj 195: MRCC Rijeka','Oprema ovisi o području: prsluci za sve, sidro, tri užeta, uže za tegalj, aparat'],
  clRadio:['Četiri dijela VHF postaje','Kanal 16 je 156,8 MHz; kapetanije 10; marine 17 (1 W); DSC 70','Postupak MAYDAY <b>napamet</b>: 3× MAYDAY, OVDJE, 3× ime, pa četiri podatka','Razlika između MAYDAY, PAN PAN i SECURITE, s primjerima','Fonetska abeceda: mogu sricati bilo koju riječ','Squelch nikad na maksimum i zašto','Najveća snaga 25 W, domet 20 do 30 M','Dozvolu izdaje HAKOM; radiodnevnik ovjerava kapetanija','Pozivanje na kanalu 16 najdulje <b>jednu minutu</b>'],
  clDay:['Naspavan sam','Osobna iskaznica sa sobom','Fotografije 3×3,5 cm','Potvrda o uplati','Dolazim sat vremena ranije i predajem dokumente','Ako ne znam odgovor, <b>ne šutim</b>, nego objašnjavam logiku i ono što znam','Govorim <b>potpune definicije</b> (npr. „kurs je kut koji…“)','Uz koordinate uvijek dodajem N ili E']
};
Object.keys(CHECKS).forEach(k=>{
  const box=el(k); if(!box) return;
  const saved=store.get('chk_'+k,[]);
  box.innerHTML=CHECKS[k].map((t,i)=>
    `<label><input type="checkbox" data-k="${k}" data-i="${i}" ${saved.includes(i)?'checked':''}><span>${t}</span></label>`).join('');
  $$('input',box).forEach(inp=>inp.addEventListener('change',()=>{
    const arr=$$('input',box).map((x,i)=>x.checked?i:null).filter(x=>x!==null);
    store.set('chk_'+k,arr);
    if(inp.checked && window.VB) VB.check(k,+inp.dataset.i);
  }));
});
if(el('clReset')) el('clReset').addEventListener('click',()=>{
  Object.keys(CHECKS).forEach(k=>{ store.set('chk_'+k,[]); const b=el(k); if(b) $$('input',b).forEach(i=>i.checked=false); });
});
