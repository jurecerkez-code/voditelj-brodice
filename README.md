# Voditelj brodice B: priprema za ispit

Interaktivni vodič za ispit voditelja brodice kategorije B u Hrvatskoj. Cijelo gradivo po pet ispitnih
predmeta, vježbe za kartu, svjetla i izbjegavanje sudara, više od 300 pitanja s objašnjenjima, probni
ispit u tri stola i plan učenja po danima. Radi u pregledniku, bez prijave i bez poslužitelja; napredak
ostaje na uređaju korisnika.

Propisi su usklađeni sa stanjem u studenom 2026. (Pravilnik o sigurnosti pomorske plovidbe, NN 52/25 i 40/26).

## Pokretanje

Bilo koji statički poslužitelj:

```
npx serve .
```

Radi i dvoklikom na `index.html`, ali tada nema rada bez interneta (service worker traži http ili https).

## Struktura

```
index.html                sadržaj svih poglavlja i ljuska aplikacije
assets/css/app.css        jedini stylesheet: stilovi vježbi, pa dizajn-sustav (boje, pismo, ljuska, komponente)
assets/js/core.js         pomoćne funkcije, spremanje napretka, navigacija, popis poglavlja
assets/js/ui.js           zajedničke komponente u JS-u (gumb, ikona, mjerač, dijalog)
assets/js/data.js         banka pitanja i kartice
assets/js/w-*.js          vježbe, jedna datoteka po području (karta, svjetla, sudari, čvorovi ...)
assets/js/fizika.js       fizika simulatora (brodica, lučica, sidreni lanac), bez crtanja, pa se testira bez preglednika
assets/js/practice.js     kviz i kartice;  exam.js probni ispit;  srs.js ponavljanje s razmakom
assets/js/plan.js         plan učenja;  app.js početna, pretraga, donja navigacija
assets/fonts/             Atkinson Hyperlegible Next (SIL OFL), učitava se lokalno
sw.js                     rad bez interneta
tests/                    provjera fizike, dimni test glavnih tokova, pristajanje samo tipkovnicom, provjera pristupačnosti
docs/KOMPONENTE.md        popis komponenti i pravila za novi kod
docs/PROMJENE.md          popis svih promjena po verzijama
```

Datoteke u `assets/js` učitavaju se redom navedenim u `index.html`. Greška u jednoj vježbi ne ruši ostale.

## Kako se mijenja sadržaj

**Novo pitanje u kvizu:** dodaj redak u `QB` u `assets/js/data.js`.

```js
{t:'colreg', q:'Pitanje?', o:['točan odgovor','krivi','krivi','krivi'], a:0, e:'Objašnjenje.', h:1}
```

`t` je tema (popis je u `TOPICS`), točan odgovor je uvijek prvi u `o` (redoslijed se miješa pri prikazu),
`h:1` označava trik-pitanje.

**Promjena propisa:** ispravi tekst u poglavlju u `index.html`, pitanja u `data.js` i, ako se broj spominje,
šalabahter u poglavlju „Checklista". Staru vrijednost ostavi uz oznaku `STARO: iz skripti`, jer je ispitivači
još znaju pitati.

**Novo poglavlje:** dodaj `<section class="page" id="p-ime" data-title="Naslov">` u `index.html`, pa ga upiši
u `VB_CH_MAP` i `NAV_GROUPS` u `assets/js/core.js`. Izbornik, početna i napredak čitaju ga odande.

## Testovi

```
npm install
npx playwright install chromium
npm test
```

`tests/fizika.mjs` radi bez preglednika. Provjerava da se brodica u simulatoru ponaša kao prava (brzine,
klizanje u neutralu, krug okretanja, izboj krme, zanošenje na vjetru), da račun sidrenog lanca daje poznata
pravila, i da se u svakom zadanom vjetru i struji može pristati: kormilar iz skripte vozi samo ručicom
stroja i kormilom, kao korisnik. Ako promijeniš koeficijente u `fizika.js`, ovaj test kaže je li simulator
ostao realan i rješiv.

`tests/smoke.mjs` otvara svaku stranicu na dva zaslona i prolazi glavne tokove (plan, kviz, probni ispit,
kartice, pretraga, gumb Natrag, ladica na mobitelu). Provjerava i da simulator svjetala pokazuje zeleno
slijeva i crveno zdesna kad brod ide prema promatraču. `tests/a11y.mjs` pokreće axe-core na svakoj stranici.
Isto se vrti na svaki push (`.github/workflows/test.yml`).

## Objava

Repozitorij je spreman za GitHub Pages iz korijena grane. Kod svake objave povećaj broj verzije na tri mjesta:
`VERSION` u `sw.js`, `?v=` u `index.html` i `version` u `package.json`. Tako korisnici dobiju novu verziju,
a ne onu iz spremišta.

## Točnost

Vodič je pripremni materijal, ne službeni izvor. Gradivo prati program ispita iz Pravilnika o brodicama i
jahtama (Dodatak 7) i važeće propise navedene u poglavlju „Checklista", pod „Izvori". Prije svake sezone
provjeri Narodne novine i praksu kapetanije u kojoj se polaže.
