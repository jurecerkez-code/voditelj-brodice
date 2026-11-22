# Komponente

Izgled svake komponente definiran je jednom, u `assets/css/app.css` (dio „DIZAJN-SUSTAV"). Novi kod ne uvodi vlastite boje,
veličine ni gumbe: koristi klase i funkcije s ovog popisa. Ako nešto nedostaje, dodaje se ovdje i u `app.css`,
a ne u pojedinu vježbu.

## Boje, pisma i plohe

Sustav je Almanac iz Hallmarka: hladni sivoplavi papir (`--bg`), blijedi list (`--panel`) za tablice, crteže i vježbe,
plavocrna tinta (`--txt`), crte u dvije debljine (`--hair` 1 px u `--line`, `--bar` 2 px u `--line2`) i jedna magenta
(`--acc` ispuna, `--acc-t` tekst i podcrta). Sve boje su tokeni u OKLCH na vrhu `app.css`; noćni način ih zamjenjuje
preko `:root[data-theme="night"]`. Izvan bloka tokena nema upisanih boja ni naziva pisama.
Crvena i zelena znače lijevi i desni bok te netočno i točno; ne koriste se kao ukras.

Tri pisma, svako s jednom ulogom: Hanken Grotesk 600 za naslove i 500 za kontrole (`--display`), Newsreader za tekst,
oznake i navigaciju (`--font`), IBM Plex Mono za brojke, mjerne oznake i radijski zapis (`--mono`). Debljine su 400, 500 i 600.
Najmanji tekst je 13 px. Datoteke pisama sadrže samo znakove koje aplikacija koristi: kad u sadržaj dođe novi znak,
pokreni `tools/fontovi.py`. Nakon promjene boja pokreni `tools/kontrast.py`.

Pravila ploha: bez kartica, sjena i zaobljenja (najviše 2 px na kontroli). Blok teksta ima čvrstu crtu gore i nema ispunu.
Napomene su udubljenje (`--bg2`) s crtom. Oznake su u rečeničnom obliku, bez velikih slova i bez razmaknutih slova.
Nema nadnaslova iznad naslova, točaka-razdjelnika ni strelica zalijepljenih uz tekst gumba.
Razmaci (padding, margin, gap) su višekratnici od 4 px. Mjera teksta je 62ch. Natpis kontrole stane u jedan red.
U tekstu: rasponi s „do“, bez crtica kao stanke, navodnici „ “, bez uskličnika.

Provjera izgleda Hallmarkovim alatom (github.com/Nutlope/hallmark), iz mape projekta:

    node PUT/hallmark/skills/hallmark/scripts/sloplint.mjs index.html assets/css/app.css --scope app --genre editorial

Za provjeru u pregledniku pokreni lokalni poslužitelj i dodaj `--url http://localhost:8000/index.html#p-nav`
(treba `puppeteer-core`). Alat piše snimke u `.hallmark/`, koja je u `.gitignore`.

## HTML klase

| Komponenta | Klasa | Napomena |
|---|---|---|
| Gumb | `.btn` | sporedna radnja |
| Glavni gumb | `.btn.p` | najviše jedan po bloku |
| Veliki gumb | `.btn.big` | početna, kraj poglavlja |
| Red gumba | `.btnrow` | razmak i prelamanje |
| Odabir (uključeno/isključeno) | `.chip`, `.chip.on` | teme kviza |
| Segmentirani prekidač | `.seg` s `<button class="on">` | jedan od nekoliko |
| Kartice-prekidači | `.knTab`, `.knTab.on` | načini vježbe |
| Kartica | `.card`, `.card.tight` | |
| Napomena | `.note` | objašnjenje |
| Upozorenje | `.warn` | česta greška |
| Važno | `.danger` | propis, sigurnost |
| Potvrda | `.ok` | važeće stanje |
| Za pamćenje | `.mnem` | mnemonik, formula |
| Oznaka | `.pill.g` `.pill.n` `.pill.r` `.pill.y` `.pill.b` | VAŽEĆE, STARO, TRIK |
| Mjerač | `.meter > i` | širina u postocima |
| Kraj poglavlja | `.chFoot` | dodaje ga `app.js` |
| Pod-navigacija | `.subnav` | vježbe |
| Pomoćne | `.small` `.muted` `.m0` `.mt8` `.center` `.sr` | `.sr` je tekst samo za čitače ekrana |

Prvi `<b>` u napomeni je njezin naslov:

```html
<div class="warn"><b>Klasična greška</b>Koordinata bez oznake N ili E nije potpuna.</div>
```

## Ikone

Sve ikone su u jednom sprite-u na dnu `index.html`.

```html
<svg class="ico" width="20" height="20" aria-hidden="true"><use href="#i-search"/></svg>
```

Dostupne: `home book target flag search close moon sun next repeat play`.

## JavaScript: `UI`

```js
UI.btn('Kviz ove teme', {kind:'p', attrs:{'data-quiz':'nav'}})   // gumb
UI.icon('search', 18)                                            // ikona iz sprite-a
UI.meter(64, 'Spremnost')                                        // mjerač s opisom za čitače ekrana
UI.callout('warn', 'Naslov', 'Tekst')                            // napomena
UI.dialog(element, {initial:'#polje'})                           // modalni dijalog: fokus, Escape, povrat fokusa
UI.toast('Plan je složen', 'Današnje stavke su na početnoj.')    // kratka obavijest
UI.esc(tekst)   UI.fold(tekst)                                   // HTML-escape; tekst bez dijakritike za pretragu
```

Radnje se vežu atributima, a ne zasebnim slušačima po gumbu:

| Atribut | Radnja |
|---|---|
| `class="kuGo" data-go="p-nav"` | otvori poglavlje (`data-to="id"` skrola do elementa) |
| `href="#p-nav"` na poveznici | isto, za poveznice u tekstu |
| `data-quiz="nav"` | kviz od 10 pitanja iz teme |
| `data-exam="1"` | probni ispit |
| `data-search` | otvori pretragu |

## Pravila za crteže

- Brod koji ide prema promatraču pokazuje zeleno promatraču slijeva, crveno zdesna. Test to provjerava.
- Crni znakovi (čunjevi, kugle) i sve što mora zadržati boju u dnevnom načinu dobiva `data-keep-dark="1"`.
- Animacije poštuju `prefers-reduced-motion`.
- Tekst u crtežu najmanje 10 px na mobitelu; inače crtež dobiva vodoravni pomak.

## Simulacije

- Fizika ide u `assets/js/fizika.js`, crtanje u datoteku vježbe. Fizika ne dira DOM i radi u stvarnim
  jedinicama (m, s, N, čvorovi), pa je `tests/fizika.mjs` može provjeriti bez preglednika.
- Uključeno stanje gumba koji se pali i gasi označi s `aria-pressed="true"`: stil dolazi iz `app.css`.
- Klizač uz vježbu: `<label class="simRange">Naziv <input type="range"> <b>vrijednost</b></label>`.
- Crtež koji tvrdi mjerilo mora ga i držati: isto mjerilo vodoravno i okomito, uz oznaku duljine.
- Brodica ima dva pogona: `BoatPhys.create({ob:true})` je izvanbrodski motor, bez toga ugrađeni s kormilom.
  Svaka promjena vladanja brodice mora proći `tests/fizika.mjs` (kormilar iz skripte pristaje u svim uvjetima)
  i `tests/pristajanje.mjs` (pristajanje u pregledniku samo tipkovnicom).
- Novi čvor dodaješ u `KNOTS` u `w-cvorovi.js`: putanja u dijelovima, uz svaki dio visina `z` (veći je bliže
  gledatelju). Ako se zategnuti oblik razlikuje od labavog, zadaj ga u `gt` s istim brojem dijelova.

## Pomoćne klase

Umjesto stila upisanog u element koristi klasu: razmaci `mt4 mt6 mt8 mt10 mt12 mt14 mb6 m0`, boje teksta
`c-acc c-txt2 c-txt3 c-green c-red`, popis koraka `steps` (veći: `steps lg`), sitni tekst `cap` i `fine`,
`w100`, `jcc`, `tl`. Stil u elementu ostaje samo za vrijednosti koje skripta računa (položaj, širina trake).
