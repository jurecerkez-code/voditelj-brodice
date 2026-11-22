# Popis promjena

Sve što je promijenjeno u odnosu na granu `main` (commit 5607e96), po verzijama.

## 5.2: točnost prema propisima, pokrivenost programa, jedan stylesheet

### Ispravljene pogreške u gradivu
- **Što smiješ s B kategorijom** (Prijava i tijek ispita): tablica je složena iznova prema čl. 69. do 82. Pravilnika o
  brodicama i jahtama. Retci o članu posade bili su zamijenjeni. Sada piše gdje upravljaš sam, gdje uz člana posade
  s kategorijom A, a gdje smiješ biti samo član posade.
- **Kratice svjetala**: „Pr (prekidno)" zamijenjeno službenom kraticom **Pk** (na prekide). Dodane DBl, K i VK, ispravljen
  naziv „sektor potamnjenja" (Pot). Izvor: Popis svjetala HHI-a 2026.
- **VHF na brodici za osobne potrebe**: nije točno da nikad nije obvezan. Tablica opreme traži ga u području III.
- **Prijava događaja na moru**: nesreća se prijavljuje odmah, nezgoda u roku 12 sati. Prije je pisao samo rok od 12 sati.
- **Svjetla brodice kraće od 7 m**: bočna svjetla „ako je izvedivo", bez uvjeta da brodica ima kabinu.
- **Hidroavion**: iznimka je 150 do 300 m uz odobrenje kapetanije, a ogradi kupališta ne prilazi bliže od 100 m.
- Dubinomjer pokazuje dubinu ispod sonde. Košara kao znak ribarice kraće od 20 m više ne vrijedi.
- Prolazi s ograničenjem brzine navedeni su prema važećem pravilniku: Mala Proversa 5 čv, Pašmanski tjesnac,
  Mali Ždrelac, ušće Krke i Zrmanja 8 čv, Neretva 5 i 7 čv.

### Novo gradivo
- **Obvezna oprema brodice za osobne potrebe** po područjima plovidbe (Sigurnost), prema tablici iz Pravilnika o
  brodicama, čamcima i jahtama, s rečenicom kojom se odgovor počinje na ispitu.
- **Pravila ispita**: povjerenstvo, obavijest o terminu, pisani dio, prigovor, prva pomoć.
- Isprave na brodici: polica osiguranja i ovjerena punomoć. Oznaka brodice: gdje se ispisuje i koliko je visoka.
- CE projektne kategorije s granicama vjetra i vala.
- Varijacija sa starije karte (godišnja promjena), s primjerom. Što radiš kad svjetionik ne svijetli.
- Lučka kapetanija: nadležnosti. Stabilnost: poprečna i uzdužna, statička i dinamička.
- Plitka voda i valovi, morska doba, vrste oblaka i što najavljuju.
- Radio: red prvenstva, provjera postaje prije isplovljenja, EPIRB, SART, NAVTEX. Održavanje kompasa.
- Brod ograničen gazom i pravilo uskog kanala uz ljestvicu prednosti.

### Pokrivenost službenog programa
Svih 57 stavki programa ispita za kategoriju B (Dodatak 7 Pravilnika o brodicama i jahtama) upareno je s poglavljima.
Svaka stavka ima svoj odlomak u gradivu.

### Pitanja i kartice
- Pitanja: 282 → **312**. Nova pokrivaju ono što kandidati navode da su dobili na ispitu i novo gradivo: varijacija s
  godišnjom promjenom, ugašen svjetionik, kvadrant kursa, oprema po područjima, broj prsluka, ovlasti B kategorije,
  punomoć, nesreća i nezgoda, uski kanal, nasukanje, točenje goriva.
- Popunjena prazna objašnjenja, ispravljena pitanja koja su nosila gore navedene pogreške.
- Kartice: 70 → **76**.

### Čvorovi
- Dva nova čvora s animacijom: **sidreni uzao** i **trubni uzao** (margarita). Ukupno devet.
- Zategnuti oblik koji je dulji od labavog sada se crta s punim pramenovima.

### Simulator pristajanja
- Izbor pogona: **ugrađeni motor s kormilom** ili **izvanbrodski motor**. Izvanbrodski zakreće cijeli poriv, i naprijed
  i krmom, bez gasa skreće slabije, a izboj krme mu je slab. Savjeti uz vožnju prate odabrani pogon.
- Kormilar iz skripte pristaje s oba pogona u svim uvjetima osim jednog: izvanbrodski motor i jak vjetar s kopna.
  Taj je slučaj u simulatoru označen kao najteži, s objašnjenjem što se na pravom moru tada radi.
- Novi test `tests/pristajanje.mjs`: u pregledniku pristaje s oba pogona isključivo pritiscima tipki.

### Čovjek u moru
- Putanja više nije nacrtana rukom. Cijeli manevar vozi isti model brodice kao simulator pristajanja (`MobPhys.track`
  u `fizika.js`): okret u stranu pada, plovidba niz vjetar pokraj osobe, okret u vjetar i prilaz u neutralu.
  Crtež je u mjerilu, prikazuje brzinu i proteklo vrijeme (manevar traje oko 85 s, prikaz je 3 × ubrzan).
- Test provjerava da brodica stane uz osobu pramcem u vjetar, da krma nikad nije bliže od 1,5 m i da u prilazu vijak
  ne radi dok je krma unutar 4 m od osobe.
- Shema izboja krme označena je kao shema: nije u stvarnom vremenu i izboj je namjerno naglašen.

### Prijava greške
- Na dnu svakog poglavlja je poveznica „Našao si grešku? Prijavi je." Otvara obrazac s upisanim poglavljem i verzijom.
  Odredište je jedna konstanta (`REPORT` u `app.js`), trenutačno GitHub Issues.

### Provjera izgleda usred vježbi
- Uz početno stanje svake stranice, prije i poslije spajanja CSS-a uspoređeno je i 12 stanja usred vježbi (točan i
  krivi odgovor u kvizu, fokus tipkovnicom, probni ispit, okrenuta kartica, pretraga, ladica na mobitelu, čvor,
  checklista), na računalu i mobitelu, u obje teme. Razlika nema.

### Kod
- `base.css` i `ui.css` spojeni su u jedan `assets/css/app.css`. Uklonjeno je 548 deklaracija koje je kasnije pravilo
  s istim selektorom ionako nadjačavalo: 104,6 kB → 91,6 kB, jedan zahtjev manje pri učitavanju.
- Stilovi upisani u HTML: 40 → 3 (dva stanja koja mijenja skripta i poruka za preglednik bez JavaScripta).
  U predlošcima vježbi 54 upisana stila zamijenjena su pomoćnim klasama.
- Provjera: snimke svih 19 stranica na računalu i mobitelu, u dnevnoj i noćnoj temi, prije i poslije spajanja
  jednake su piksel po piksel. Namjerna je jedina razlika ujednačen prored u tri popisa koraka.

### Što i dalje vrijedi kao ograničenje
- U `app.css` ostaju oznake `!important` kojima dizajn-sustav nadjačava starije stilove vježbi. Uklanjanje traži
  prolaz kroz svako stanje svake vježbe i nije rađeno naslijepo.
- U predlošcima vježbi ostaje 47 jednokratnih upisanih stilova (širine i razmaci pojedinih crteža).
- Najavljeni novi pravilnik o osposobljavanju (ispit na računalu, obvezna praksa) do 22. 11. 2026. nije objavljen.
  Do objave vrijedi usmeni ispit opisan u aplikaciji.

## 5.1: simulacije i fizika

### Nova datoteka `assets/js/fizika.js`
Sva fizika na jednom mjestu, bez crtanja, u stvarnim jedinicama (m, s, N, čvorovi). Zato je test može
provjeriti bez preglednika.

- `BoatPhys`: brodica s tri stupnja slobode (naprijed, bočno, zakret). Poriv vijka, otpor trupa, kormilo,
  izboj krme, vjetar na nadvođe, struja.
- `DockWorld`: lučica, privezane brodice, vez, pravila dodira s obalom i uvjeti uspjeha.
- `AnchorPhys`: sidreni lanac kao lančanica.

### Simulator pristajanja (`w-pristajanje.js`, pisan iznova)
- Brodica od 6 m i oko 1,4 t u lučici 67 × 48 m. Vrijeme teče stvarnom brzinom, brzine su u pravim čvorovima
  (prije je 1 čv na ekranu bio oko 2 čv u mjerilu crteža).
- Tromost: do 2 čv treba desetak sekundi, u neutralu klizi oko 10 m, krmom staje za 2 do 3,5 m. Prije je
  brzina pratila ručicu za sekundu i pol.
- Kormilo radi samo dok preko njega struji voda. Dok brodica stoji, ne čini ništa. Kratki udar gasa zakrene
  krmu, a brodica jedva krene.
- Brodica se okreće oko točke blizu pramca, pa krma u okretu zanosi van. Prije se vrtjela oko sredine.
- Krug okretanja oko 11 m na „polako" s kormilom 35°, uz pad brzine u okretu.
- Izboj krme: krmom iz mirovanja pramac ide udesno oko 13° u 10 s. Kad brodica dobije brzinu krmom, kormilo
  ga može nadvladati.
- Vjetar: sila ovisi o prividnom vjetru i kutu, nosi brodicu i okreće pramac niz vjetar. Jačine su stvarne:
  6, 12 i 20 čv. Struja: 0,3, 0,6 i 1 čv, nosi brodicu zajedno s vodom.
- Dodir s obalom do oko 0,7 čv bokobrani upiju i brodica se zakrene oko točke dodira. Brže od toga je udarac.
- Upravljanje: pet položaja ručice stroja (dodano „krmom polako"), kormilo klizačem u koracima od 5° do 35°
  (prije pet gumba), tipke strelice, razmak, R i P.
- Novo: predviđanje položaja za 10 s (žuta crta i obris), pauza, vrijeme 2×, mjerilo 10 m, mlaz vijka koji
  se vidi kako ga kormilo skreće, očitanje brzine kroz vodu, brzine nad dnom i udaljenosti od obale.
- Trener daje jedan sljedeći potez prema stanju brodice, uključujući upozorenje kad prilaziš niz vjetar
  ili struju.
- Sklopivi odlomak „Kako se brodica ponaša" s pet pravila koja simulator stvarno poštuje.

### Motor (`w-motor.js`, animacija pisana iznova)
- Kompresijski prostor slijedi stupanj kompresije: benzin 9,5 : 1, dizel 18 : 1. Dizel vidljivo jače sabija.
  Prije je prostor bio isti za oba, u omjeru 5 : 1.
- Tlak i temperatura računaju se iz obujma (politropa) i izgaranja (Wiebeova krivulja). Očitanja su uživo:
  benzin oko 19 bara i 450 °C na kraju kompresije, vrh oko 50 bara; dizel oko 45 bara i 630 °C, vrh oko 60.
- Čestice plina: plave zrak, žute gorivo, narančaste izgaranje, sive ispuh. Isti broj čestica u manjem
  prostoru znači veći tlak. Plamen se širi od svjećice.
- Strelica sile plina na klipu, narančasta dok plin gura klip, siva dok klip sabija plin.
- Krivulja tlaka kroz cijeli ciklus s pokazivačem.
- Brzina vrtnje nije stalna: zamašnjak ubrza u radnom taktu i uspori u kompresiji (energetska bilanca).
- Četverotaktni ima ulje u karteru, dvotaktni smjesu zraka, benzina i ulja. Dvotaktni više ne nudi dizel.
- Kod dvotaktnog se vidi ispiranje: svježa smjesa ulazi dolje i potiskuje izgorjele plinove.
- Natpisi na ventilima govore što prolazi (zrak i benzin, samo zrak, izgorjeli plinovi).
- Legenda iznad animacije. Crtež je ograničen na 540 px širine da cijeli stane na zaslon. Veća slova.

### Sidrenje (`sims.js`, `w-manevar.js`)
- Oblik lanca je izračunata lančanica, crtež je u mjerilu (vodoravno i okomito isto), brodica ima gaz.
- Tri klizača: dubina, lanac (× dubina) i vjetar u čvorovima. Vidi se koliko lanca leži na dnu, pod kojim
  kutom lanac vuče sidro i drži li sidro.
- Iz računa izlazi pravilo iz gradiva: na 6 m dubine 20 čv traži oko 4 × dubina, 30 čv oko 6 ×.
- Ispis: treba li još lanca i koliki je krug zakretanja.
- Postupak sidrenja korak po korak ostao je, sada s izračunatim lancem u svakom trenutku.
- Stara nepomična slika imala je ravan lanac izvan mjerila i krug zakretanja nacrtan u presjeku. Zamijenjena
  je pogledom odozgo: krug zakretanja tvoje brodice i susjeda.
- Tekst poglavlja objašnjava zašto se ispušta više lanca od dubine i za koju brodicu vrijedi račun.

### Čvorovi (`w-cvorovi.js`)
- Klizač „Povuci i veži sam": konop se provlači kako vučeš, naprijed i natrag.
- Žuti trag označava dio konopa položen u trenutačnom koraku.
- Legenda ispod crteža (žuti trag, plava crta, tko je gore na križanju).
- Bitva: novi zadnji korak „Zategni". Petlja sjedne pod rog, kraj ostane ispod zadnjeg kosog dijela.
  Prije je čvor završavao labavom petljom oko vrha roga.

### Rizik sudara (`w-sudari.js`)
- Stara slika imala je tvoj brod nepomičan. Sada oba broda plove stalnim kursom i brzinom, a azimut se računa
  iz njihovih položaja. Tri slučaja: azimut se ne mijenja (sudar), smanjuje se (prolazi ispred), povećava se
  (prolazi iza). Vide se tri uzastopna mjerenja i udaljenost.

### Ostalo
- `core.js`: `fitText` i `onWidth`, natpisi u crtežima ostaju čitljivi na mobitelu (pristajanje, sidrenje,
  rizik sudara).
- `ui.css`: stil za gumbe s `aria-pressed`, stilovi simulatora i klizača.
- Testovi: novi `tests/fizika.mjs` (42 provjere: ponašanje brodice, račun lanca i može li se pristati u svakom
  od 19 zadanih uvjeta). Dimni test ima 22 nove provjere (ukupno 128).
- Verzija 5.1.0 u `sw.js`, `index.html` i `package.json`. `README.md` i `docs/KOMPONENTE.md` dopunjeni.

## 5.0: točnost, gradivo, dizajn, struktura

### Ispravljene greške
- Simulator svjetala: brod koji ide prema tebi imao je crveno lijevo i zeleno desno. Ispravljeno, i za
  trobojno svjetlo. Jasniji nazivi pogleda.
- Kardinalne oznake: u dnevnom prikazu čunjevi su bili bijeli umjesto crnih.
- Poglavlje se brojilo kao pročitano čim se otvori. Sada kad dođeš do kraja.
- Gumb Natrag u pregledniku nije vraćao prethodno poglavlje.
- Sidrenje i izboj krme: nečitljivi natpisi i natpis lanca izvan okvira.
- Dvostruki obrazac plana učenja na početnoj.

### Propisi usklađeni s NN 52/2025 i izmjenama NN 40/2026
- Privez uz obalu: zabranjen ako je bilo koji dio 70 m ili više od obale (prije 50 m).
- Brod koji čisti mine: 1000 m (čl. 30. st. 6.), uz oznaku što je važeće, a što stara skripta.
- Ulaz u luku (čl. 46.): plovila do 20 m sklanjaju se u polukrugu od 1 M; tko ulazi ne smeta onome tko izlazi.
- Udaljenosti od obale, ograda kupališta, tender do 500 m, ronilac 50 m, najviše 8 čv unutar 300 m,
  glisiranje samo izvan 300 m, hidroavioni, sidrenje uz kupalište i plažu.
- Kviz: ispravljena pitanja o minama, košari i izlasku iz luke.

### Dodano gradivo (prema Dodatku 7 Pravilnika o brodicama i jahtama)
- Varijacija i devijacija s kalkulatorom, brzinomjer i dubinomjer, pozicija s jednim objektom, zbrojena pozicija.
- Plan plovidbe, opća pravila, ponašanje u magli, plitka voda.
- Kvarovi motora, tankovi.
- Preživljavanje u moru, prva pomoć.
- Nova stranica „Prijava i tijek ispita": uvjeti, naknada, ovlasti, koraci prijave, tri ispitna stola, izvori,
  napomena o najavljenoj reformi koja još nije usvojena.
- 33 nova pitanja (ukupno 282).

### Dizajn i korištenje
- Boje s pomorske karte, noćni način u crvenoj paleti, jedno pismo (Atkinson Hyperlegible Next) učitano lokalno.
- Bočni izbornik po ispitnim stolovima, donja navigacija na mobitelu, traka napretka.
- Početna: noćni prizor „što vidiš i što radiš", sljedeći korak, spremnost po tri stola, plan učenja iz datuma ispita.
- Pretraga (tipka / ili Ctrl+K).
- Na kraju svakog poglavlja: kviz iz te teme i sljedeće poglavlje.
- Naslovi bez verzala, 121 inline stil zamijenjen zajedničkim klasama.

### Kod
- Jedna datoteka od 800 KB razdvojena u `index.html`, 26 modula i dvije CSS datoteke.
- Zajedničke komponente u `ui.css` i `ui.js` (gumb, čip, segment, kartica, napomene, mjerač, dijalog, obavijest,
  ikone), popis u `docs/KOMPONENTE.md`.
- Uklonjeno 36 CSS pravila koja se nisu koristila.
- Praćenje točnosti po temi (zadnjih 20 odgovora).
- Rad bez interneta (service worker), manifest, ikona.
- `README.md`, `package.json`, `.gitignore`.

### Pristupačnost
- Orijentiri stranice, redoslijed naslova, preskakanje na sadržaj.
- Kartice sa zvučnim signalima su gumbi, polja MAYDAY obrasca imaju oznake, dijalog drži fokus.
- Ladica s poglavljima ne prima fokus dok je zatvorena, tablice koje se pomiču dostupne su tipkovnicom.
- Kontrast u dnevnom i noćnom načinu.

### Testovi
- `tests/smoke.mjs`: sve stranice i glavni tokovi na dva zaslona.
- `tests/a11y.mjs`: axe-core na 19 stranica u tri prikaza.
- Pokreću se na svaki push (`.github/workflows/test.yml`).

## Što nije mijenjano i gdje su granice

- Čovjek u moru i demonstracija izboja krme i dalje idu po unaprijed zadanoj putanji. Točni su kao postupak,
  ali nisu fizikalna simulacija.
- Simulator ima jednu brodicu: 6 m, ugrađeni motor, kormilo. Nema izvanbrodskog motora, konopa, valova.
  Koeficijenti su ugođeni na tipične vrijednosti, nisu izmjereni na stvarnoj brodici.
- Motor: jedan cilindar, razvod bez preklapanja ventila, tlakovi tipični za male motore.
- Sidrenje: mirno stanje, bez valova i udara vjetra, lanac 6 mm.
- Čvorovi su crtež odozgo s točnim redoslijedom iznad i ispod, ne simulacija užeta.
- Svjetla, IALA oznake, zvučni signali, radio i rad na karti nisu dirani u 5.1.
