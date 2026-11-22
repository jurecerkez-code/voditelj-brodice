# Popis promjena

Sve što je promijenjeno u odnosu na granu `main` (commit 5607e96), po verzijama.

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
