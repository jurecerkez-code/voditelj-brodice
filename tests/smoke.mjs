// Dimni test: otvara svaku stranicu i prolazi glavne tokove. Pada na svaku JS grešku.
// Pokretanje:  npx playwright install chromium && node tests/smoke.mjs   (poslužitelj se diže sam)
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const URL0 = `http://localhost:${server.address().port}/index.html`;

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME, args: ['--no-sandbox'] } : {});
const fails = []; let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) fails.push(msg); };

for (const [name, vp, mobile] of [['desktop', { width: 1366, height: 850 }, false], ['mobitel', { width: 390, height: 844 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', e => fails.push(`[${name}] JS greška: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') fails.push(`[${name}] konzola: ${m.text()}`); });
  page.on('requestfailed', r => fails.push(`[${name}] nije učitano: ${r.url()}`));
  await page.goto(URL0, { waitUntil: 'load' });

  // 1. svaka stranica se otvara i ima naslov
  const ids = await page.$$eval('section.page', s => s.map(x => x.id));
  ok(ids.length >= 19, `[${name}] očekivano najmanje 19 stranica, ima ${ids.length}`);
  for (const id of ids) {
    await page.evaluate(i => go(i), id); await page.waitForTimeout(120);
    ok(await page.$eval('#' + id, e => e.classList.contains('active')), `[${name}] ${id} se ne otvara`);
    ok(await page.$eval('#' + id, e => e.scrollWidth <= document.documentElement.clientWidth + 1), `[${name}] ${id} izlazi iz širine zaslona`);
    // izgled po pravilima sustava na svakoj stranici: veličina i debljina teksta, pisma, velika slova, imena crteža, razine naslova
    const tells = await page.$eval('#' + id, pg => { const bad = []; const sig = e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '');
      for (const e of pg.querySelectorAll('*')) { if (e.closest('svg') || e.offsetParent === null) continue; if (![...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim().length > 1)) continue; const c = getComputedStyle(e), fs = parseFloat(c.fontSize);
        if (fs < 13) bad.push('tekst ' + fs + 'px na ' + sig(e)); if (!['400', '500', '600'].includes(c.fontWeight)) bad.push('debljina ' + c.fontWeight + ' na ' + sig(e));
        if (!/^"?(Hanken Grotesk|Newsreader|IBM Plex Mono)/.test(c.fontFamily)) bad.push('pismo ' + c.fontFamily.split(',')[0] + ' na ' + sig(e));
        if (c.textTransform === 'uppercase') bad.push('velika slova na ' + sig(e)); }
      for (const s of pg.querySelectorAll('svg')) if (!s.closest('[aria-hidden="true"]') && !s.getAttribute('role') && !s.getAttribute('aria-label')) bad.push('crtež bez imena u #' + (s.closest('[id]') || pg).id);
      let prev = 1; for (const h of pg.querySelectorAll('h2,h3,h4,h5,h6')) { if (h.offsetParent === null) continue; const l = +h.tagName[1]; if (l > prev + 1) bad.push('preskočena razina naslova prije "' + h.textContent.trim().slice(0, 24) + '"'); prev = l; }
      return [...new Set(bad)].slice(0, 4); });
    ok(tells.length === 0, `[${name}] ${id}: ${tells.join('; ')}`);
  }
  // 2. početna: prizor sa svjetlima ima točan odgovor i objašnjenje
  await page.evaluate(() => go('p-start'));
  await page.locator('#hmScene .hmOpts button[data-i="0"]').click();
  ok(await page.locator('#hmScene .hmWhy').count() === 1, `[${name}] prizor na početnoj ne pokazuje objašnjenje`);
  // 2a. početna: ispitni program je jedna tablica, red sljedećeg poglavlja je označen i vodi u poglavlje
  ok(await page.locator('#hmTables table.hmP tbody tr:not(.grp)').count() >= 12, `[${name}] ispitni program nema sva poglavlja`);
  ok(await page.locator('#hmTables tr.cur').count() === 1, `[${name}] u ispitnom programu nije označen sljedeći red`);
  const curTo = await page.$eval('#hmTables tr.cur button', b => b.dataset.next);
  await page.locator('#hmTables tr.cur button').click(); await page.waitForTimeout(150);
  ok(await page.$eval('#' + curTo, e => e.classList.contains('active')), `[${name}] red u ispitnom programu ne otvara poglavlje`);
  await page.evaluate(() => go('p-start'));
  // 2a'. izgled: pravila sustava vrijede u cijelom dokumentu (docs/KOMPONENTE.md, Boje, pisma i plohe)
  const look = await page.evaluate(async () => { await document.fonts.ready; const bad = [];
    const w = document.createTreeWalker(document.getElementById('app'), NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) if (/\S [·•] \S/.test(n.nodeValue)) { bad.push('točka-razdjelnik: ' + n.nodeValue.trim().slice(0, 50)); break; }
    for (const e of document.querySelectorAll('.btn,.chip,.card,.note,.warn,.danger,.ok,.qcard,table,details,select,input[type=date],.pill,.knTab,.opt')) {
      const c = getComputedStyle(e); if (parseFloat(c.borderTopLeftRadius) > 2) { bad.push('zaobljenje ' + c.borderTopLeftRadius + ' na .' + e.className); break; }
      if (c.boxShadow !== 'none' && !/inset/.test(c.boxShadow)) { bad.push('sjena na .' + e.className); break; } }
    for (const e of document.querySelectorAll('h2,h3,h4,th,.pill,.lbl,.qmeta,.navgrp>span,.btn')) { const c = getComputedStyle(e);
      if (c.textTransform === 'uppercase' || parseFloat(c.letterSpacing) > 0.3) { bad.push('velika ili razmaknuta slova na ' + e.tagName + '.' + e.className); break; } }
    for (const f of ['600 20px "Hanken Grotesk"', '400 17px "Newsreader"', '400 14px "IBM Plex Mono"']) if (!document.fonts.check(f)) bad.push('pismo nije učitano: ' + f);
    return bad; });
  ok(look.length === 0, `[${name}] izgled: ${look.join('; ')}`);
  // 2b. prijenos napretka: spremanje daje datoteku s podacima aplikacije, kriva datoteka se odbija s porukom
  await page.evaluate(() => { document.querySelector('.hmSet').open = true; });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#progSave')]);
  const saved = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(saved.app === 'voditelj-brodice' && Object.keys(saved.podaci).every(k => k.startsWith('vb_')), `[${name}] spremljeni napredak nema očekivani oblik`);
  await page.setInputFiles('#progLoad', { name: 'krivo.json', mimeType: 'application/json', buffer: Buffer.from('{"nesto":1}') });
  await page.waitForTimeout(150);
  ok(/nije napredak/.test(await page.textContent('#progMsg')), `[${name}] kriva datoteka s napretkom nije odbijena`);
  const sumTxt = await page.evaluate(() => new Promise(res => { window.prompt = (_, t) => { res(t); return null; };
    try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: t => { res(t); return Promise.resolve(); } }, configurable: true }); } catch (e) { }
    document.getElementById('progSum').click(); setTimeout(() => res(''), 1500); }));
  ok(/Pročitano poglavlja: \d+ od \d+/.test(sumTxt) && /Kviz po temama/.test(sumTxt), `[${name}] sažetak za instruktora je prazan ili nepotpun`);
  // 3. plan učenja iz kartice "Kad polažeš?"
  const d = new Date(Date.now() + 12 * 864e5).toISOString().slice(0, 10);
  await page.fill('#hmDate', d); await page.locator('#hmPlan button[type=submit]').click();
  ok(await page.evaluate(() => !!JSON.parse(localStorage.getItem('vb_plan') || 'null')), `[${name}] plan se nije spremio`);
  ok(await page.locator('#hmNext .hmToday li').count() > 0, `[${name}] današnje stavke plana se ne vide`);
  // 4. kviz: odgovor, objašnjenje, sljedeće pitanje
  await page.evaluate(() => go('p-kviz')); await page.click('#quizStart');
  await page.locator('.qopt').first().click();
  ok(await page.locator('#qExpl .expl').count() === 1, `[${name}] kviz ne pokazuje objašnjenje`);
  await page.click('#qNext'); ok(await page.locator('.qopt').count() === 4, `[${name}] kviz nema četiri odgovora`);
  // 5. probni ispit se pokreće
  await page.click('#quizExam'); ok((await page.locator('#quizArea').innerText()).length > 50, `[${name}] probni ispit se ne pokreće`);
  // 6. kartice
  await page.evaluate(() => go('p-cards')); await page.click('#cardStart'); await page.click('#fc'); await page.click('#cYes');
  ok(await page.locator('#fc').count() === 1, `[${name}] kartice ne idu na sljedeću`);
  // 7. kraj poglavlja: kviz teme i oznaka pročitanog
  await page.evaluate(() => go('p-iala'));
  await page.locator('#p-iala .chFoot').scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('vb_visited') || '[]').includes('p-iala')), `[${name}] poglavlje nije označeno pročitanim na kraju`);
  await page.locator('#p-iala .chFoot [data-quiz]').click();
  ok(await page.$eval('#p-kviz', e => e.classList.contains('active')) && await page.locator('.qopt').count() === 4, `[${name}] kviz teme se ne pokreće s kraja poglavlja`);
  // 8. pretraga vodi na naslov
  await page.keyboard.press('Escape'); await page.click('#topbar [data-search]');
  await page.fill('#srchIn', 'kardinal'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  ok(await page.$eval('#p-iala', e => e.classList.contains('active')), `[${name}] pretraga "kardinal" ne vodi na IALA oznake`);
  // 9. gumb Natrag vraća prethodnu stranicu
  await page.evaluate(() => go('p-meteo')); await page.goBack(); await page.waitForTimeout(150);
  ok(await page.$eval('#p-iala', e => e.classList.contains('active')), `[${name}] gumb Natrag ne vraća prethodno poglavlje`);
  // 10. mobitel: donja navigacija i ladica s poglavljima
  if (mobile) {
    await page.click('#tabbar [data-tab="learn"]');
    ok(await page.$eval('#sidebar', e => e.classList.contains('open') && !e.inert), `[${name}] ladica s poglavljima se ne otvara`);
    await page.locator('#sidebar .navlink[data-t="p-radio"]').click();
    ok(await page.$eval('#p-radio', e => e.classList.contains('active')) && await page.$eval('#sidebar', e => !e.classList.contains('open')), `[${name}] odabir poglavlja ne zatvara ladicu`);
  }
  // 11. svjetla: brod s pramca ima zeleno lijevo, crveno desno (promatrač)
  await page.evaluate(() => go('p-svjetla')); await page.waitForTimeout(200);
  const xs = await page.$$eval('#lightStage svg circle[r="6.5"]', cs => cs.map(c => [c.getAttribute('fill'), +c.getAttribute('cx')]));
  const g = xs.find(c => /green/.test(c[0])), r = xs.find(c => /red/.test(c[0]));
  ok(g && r && g[1] < r[1], `[${name}] simulator svjetala: zeleno mora biti lijevo od crvenog kad brod ide prema promatraču`);
  // 12. simulator pristajanja: brodica kreće na stroj, klizi u neutralu, pauza je zaustavlja
  await page.evaluate(() => go('p-manevar')); await page.waitForTimeout(200);
  await page.locator('#dockWind [data-t="2"]').click(); await page.waitForTimeout(2600);
  const hud1 = await page.$eval('#dockWind .dwHud', e => e.textContent), kn = t => parseFloat((t.match(/Kroz vodu ([\d,]+)/) || [])[1]?.replace(',', '.'));
  ok(/NAPRIJED/.test(hud1) && kn(hud1) > 0.3 && kn(hud1) < 4.2, `[${name}] simulator pristajanja: brodica ne kreće (${hud1})`);
  await page.locator('#dockWind [data-t="0"]').click(); await page.waitForTimeout(600);
  ok(kn(await page.$eval('#dockWind .dwHud', e => e.textContent)) > 0.2, `[${name}] simulator pristajanja: brodica u neutralu mora klizati, ne stati odmah`);
  await page.locator('#dockWind .dwPause').click(); const h2 = await page.$eval('#dockWind .dwHud', e => e.textContent); await page.waitForTimeout(400);
  ok(h2 === await page.$eval('#dockWind .dwHud', e => e.textContent), `[${name}] simulator pristajanja: pauza ne zaustavlja vrijeme`);
  await page.locator('#dockWind .dwReset').first().click();
  // brodica postavljena na vez, usporedno i mirna: nakon kratkog držanja simulator javlja uspjeh
  await page.locator('#dockWind [data-t="0"]').click();
  await page.evaluate(() => { const s = __DOCK.world().s, D = DockWorld; Object.assign(s, { x: (D.QX + 16) / D.PPM, y: (D.BERTH[0] + D.BERTH[1]) / 2 / D.PPM, psi: 0, u: 0, v: 0, r: 0 }); });
  await page.waitForTimeout(2200);
  ok(/Pristao si/.test(await page.$eval('#dockWind .dwMsg', e => e.textContent)), `[${name}] simulator pristajanja: brodica na vezu ne javlja uspjeh`);
  await page.locator('#dockWind .dwReset').first().click();
  // udarac u obalu punom brzinom mora završiti vožnju
  await page.locator('#dockWind [data-t="2"]').click();
  await page.evaluate(() => { const s = __DOCK.world().s, D = DockWorld; Object.assign(s, { x: (D.QX + 60) / D.PPM, y: (D.BERTH[0] + D.BERTH[1]) / 2 / D.PPM, psi: -90, u: 2, v: 0, r: 0 }); });
  await page.waitForTimeout(3500);
  ok(/Udarac u obalu/.test(await page.$eval('#dockWind .dwMsg', e => e.textContent)), `[${name}] simulator pristajanja: udarac u obalu nije prepoznat`);
  await page.locator('#dockWind .dwReset').first().click();
  // 13. sidrenje: premalo lanca na jakom vjetru ore, dovoljno lanca drži
  const setR = (sel, v) => page.$eval(sel, (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, v);
  await setR('#anchorSim .aW', 30); await setR('#anchorSim .aK', 3);
  ok(/ore/.test(await page.$eval('#anchorSim .aTxt', e => e.textContent)), `[${name}] sidrenje: 3 × dubina na 30 čv mora orati`);
  await setR('#anchorSim .aK', 7);
  ok(/drži/.test(await page.$eval('#anchorSim .aTxt', e => e.textContent)), `[${name}] sidrenje: 7 × dubina na 30 čv mora držati`);
  // 14. motor: klizač okreće koljeno, tlak je najveći u radnom taktu; dizel ima veću kompresiju
  await page.evaluate(() => go('p-motor')); await page.waitForTimeout(200);
  const bar = async a => { await setR('#engAngle', a); return parseFloat((await page.$eval('#engineStage', e => e.textContent)).match(/tlak u cilindru ([\d,]+) bar/)[1].replace(',', '.')); };
  const pIn = await bar(90), pCo = await bar(355), pEx = await bar(372);
  ok(pIn < 1 && pCo > 12 && pCo < 25 && pEx > 35 && pEx < 65, `[${name}] motor: tlak ne prati taktove (usis ${pIn}, kompresija ${pCo}, ekspanzija ${pEx})`);
  await page.click('#engFuel'); ok(await bar(355) > 35, `[${name}] motor: dizel mora imati veći tlak kompresije`); await page.click('#engFuel');
  // 14b. pramčani konop: izdaleka se ne može dati i simulator kaže zašto
  await page.evaluate(() => go('p-manevar')); await page.locator('#dockWind .dwReset').first().click(); await page.locator('#dockWind .dwLine').click();
  ok(/bliže od 2 m/.test(await page.textContent('#dockWind .dwMsg')) && await page.getAttribute('#dockWind .dwLine', 'aria-pressed') === 'false', `[${name}] pramčani konop: nema objašnjenja zašto se ne može dati`);
  await page.evaluate(() => go('p-sigurnost'));
  // 15. čvorovi: klizačem se konop provlači, zadnji korak bitve je zatezanje
  await page.evaluate(() => go('p-sigurnost')); await page.waitForTimeout(200);
  await setR('#knotWidget .knScrub input', 250);
  ok(/Korak 3/.test(await page.$eval('#knotWidget .knStepTxt', e => e.textContent)), `[${name}] čvorovi: klizač ne vodi kroz korake`);
  await page.locator('#knotWidget [data-id="bitva"]').click(); await setR('#knotWidget .knScrub input', 500);
  ok(/Zategni|Povuci kraj/.test(await page.$eval('#knotWidget .knStepTxt', e => e.textContent)), `[${name}] čvorovi: bitva nema korak zatezanja`);
  // svi čvorovi se iscrtaju do zadnjeg koraka, uključujući sidreni i trubni uzao
  const knAll = await page.evaluate(() => __KN.KNOTS.map(k => { __KN.select(k.id); __KN.go(k.steps.length - 1, true);
    return [k.id, document.querySelector('#knotWidget .knSvg').innerHTML.length, /NaN/.test(document.querySelector('#knotWidget .knSvg').innerHTML)]; }));
  ok(knAll.length === 9 && knAll.every(([, n, bad]) => n > 3000 && !bad), `[${name}] čvorovi: neki se čvor ne iscrta do kraja: ${JSON.stringify(knAll)}`);
  ok(['sidreni', 'trubni'].every(id => knAll.some(k => k[0] === id)), `[${name}] čvorovi: nedostaju sidreni ili trubni uzao`);
  // 16. noćni način se pali i pamti
  await page.click('#themeBtn'); ok(await page.evaluate(() => document.documentElement.dataset.theme === 'night' && localStorage.getItem('vbTheme') === 'night'), `[${name}] noćni način se ne pamti`);
  await ctx.close();
}
await browser.close(); server.close();
if (fails.length) { console.error(`NIJE PROŠLO (${fails.length}):\n - ` + [...new Set(fails)].join('\n - ')); process.exit(1); }
console.log(`Prošlo: ${checks} provjera na dva zaslona.`);
