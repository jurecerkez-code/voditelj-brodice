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
  }
  // 2. početna: prizor sa svjetlima ima točan odgovor i objašnjenje
  await page.evaluate(() => go('p-start'));
  await page.locator('#hmScene .hmOpts button[data-i="0"]').click();
  ok(await page.locator('#hmScene .hmWhy').count() === 1, `[${name}] prizor na početnoj ne pokazuje objašnjenje`);
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
  // 12. noćni način se pali i pamti
  await page.click('#themeBtn'); ok(await page.evaluate(() => document.documentElement.dataset.theme === 'night' && localStorage.getItem('vbTheme') === 'night'), `[${name}] noćni način se ne pamti`);
  await ctx.close();
}
await browser.close(); server.close();
if (fails.length) { console.error(`NIJE PROŠLO (${fails.length}):\n - ` + [...new Set(fails)].join('\n - ')); process.exit(1); }
console.log(`Prošlo: ${checks} provjera na dva zaslona.`);
