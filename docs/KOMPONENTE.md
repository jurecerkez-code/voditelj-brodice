# Komponente

Izgled svake komponente definiran je jednom, u `assets/css/ui.css`. Novi kod ne uvodi vlastite boje,
veličine ni gumbe: koristi klase i funkcije s ovog popisa. Ako nešto nedostaje, dodaje se ovdje i u `ui.css`,
a ne u pojedinu vježbu.

## Boje i pismo

Sve boje su CSS varijable (`--bg`, `--txt`, `--acc`, `--green`, `--red`, `--sea`, `--land` ...). Noćni način
ih zamjenjuje preko `:root[data-theme="night"]`. Crvena i zelena znače lijevi i desni bok te netočno i točno;
ne koriste se kao ukras. Glavna radnja je `--acc` (magenta s pomorske karte).

Jedno pismo: Atkinson Hyperlegible Next. Brojke su tablične (`font-variant-numeric: tabular-nums`).

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
