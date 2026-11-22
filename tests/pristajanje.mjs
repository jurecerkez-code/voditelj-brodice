// Može li se u simulatoru pristati samo tipkovnicom?
// Kormilar iz skripte čita stanje brodice i odlučuje što bi čovjek napravio, a simulatoru šalje isključivo
// pritiske tipki: strelice gore i dolje za stroj, lijevo i desno za kormilo. Vozi oba pogona po mirnom moru.
// Pokretanje:  node tests/pristajanje.mjs   (poslužitelj se diže sam)
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
const URL0 = `http://localhost:${server.address().port}/index.html#p-manevar`;

// Odluka kormilara za trenutačno stanje. Izvršava se u stranici, ali ne dira simulator: samo vraća željeni stroj i kormilo.
// Ista logika kao u tests/fizika.mjs, s kormilom zaokruženim na korake od 5° koliko daje jedna tipka.
const decide = o => {
  const P = BoatPhys, D = DockWorld, KN = P.KN, PPM = D.PPM, R2D = 180 / Math.PI, w = __DOCK.world(), s = w.s;
  const wrap = a => ((a + 540) % 360) - 180, clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const m = window.__pilot || (window.__pilot = { ph: 0, wi: 0 });
  const xq = D.QX / PPM, xb = xq + 13.5 / PPM + .3, yb = (D.BERTH[0] + D.BERTH[1]) / 2 / PPM, len = 14;
  const gx = xb + len * Math.sin(o.ang / R2D), gy = yb + len * Math.cos(o.ang / R2D), wps = [[gx + 5, gy + 4], [gx, gy]];
  const steerTo = (tx, ty, gain) => { const g = P.ground(s, w.env), sp = Math.hypot(g[0], g[1]), brg = Math.atan2(tx - s.x, -(ty - s.y)) * R2D;
    const crab = sp > .3 ? clamp(wrap(s.psi - Math.atan2(g[0], -g[1]) * R2D), -30, 30) : 0; return clamp(gain * wrap(brg + crab - s.psi) - 5 * s.r * R2D, -35, 35); };
  const g = P.ground(s, w.env), sog = Math.hypot(g[0], g[1]), gap = Math.min(...D.hull(s).map(p => p[0])) / PPM - xq, along = s.y - yb, va = -g[1];
  let thr, rud;
  if (m.ph === 0) { const [tx, ty] = wps[m.wi], d = Math.hypot(tx - s.x, ty - s.y); rud = steerTo(tx, ty, 1.6); thr = d > 12 && m.wi < wps.length - 1 ? 2 : (sog < 1.7 * KN ? 1 : 0);
    if (o.ob && Math.abs(rud) > 12 && sog < 2.4 * KN) thr = Math.max(thr, 1); if (d < 3.5 && ++m.wi >= wps.length) m.ph = 1; }
  else if (m.ph === 1) { rud = steerTo(xb - .8, yb - 1.5, 2); thr = sog < (gap > 5 ? 1.5 : o.vin) * KN ? 1 : 0; if (o.ob && Math.abs(rud) > 18 && sog < 1.6 * KN) thr = 1; if (gap < o.flare) m.ph = 2; }
  else { const lean = clamp((gap - .5) * 10, 0, o.maxLean), e = wrap(-lean - s.psi);
    rud = clamp(3 * e - 6 * s.r * R2D, -35, 35); const vt = clamp(.3 * along, -.35, .7) + (gap > 1 && along > -1.5 ? .25 : 0);
    thr = va < vt - .12 ? 1 : va > vt + .45 ? -2 : va > vt + .15 ? -1 : 0; if (Math.abs(e) > (o.ob ? 8 : 12) && va < .5 && thr <= 0 && along > -2) thr = 1;
    if (o.ob && thr > 0 && Math.abs(e) > 20) thr = 2; if (o.ob && thr < 0) rud = -rud; }
  return { thr, rud: Math.round(rud / 5) * 5, nowThr: s.thr, nowRud: s.rud, done: document.querySelector('#dockWind .dwMsg .nlRes')?.textContent || '' };
};

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME, args: ['--no-sandbox'] } : {});
const page = await (await browser.newContext({ viewport: { width: 1366, height: 850 }, serviceWorkers: 'block' })).newPage();
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(URL0, { waitUntil: 'load' });
await page.locator('#dockWind').scrollIntoViewIfNeeded();

const fails = [];
for (const [name, ob, o] of [['ugrađeni motor', 0, { ang: 40, flare: 4.5, vin: 1.2, maxLean: 30 }], ['izvanbrodski motor', 1, { ang: 40, flare: 4.5, vin: .8, maxLean: 15, ob: true }]]) {
  let res = '';
  for (let attempt = 1; attempt <= 2 && !/Pristao si/.test(res); attempt++) {
    // sve postavke i pokretanje također idu tipkovnicom: fokus na gumb pa Enter
    await page.focus(`#dockWind .dwDrive [data-ob="${ob}"]`); await page.keyboard.press('Enter');
    await page.focus('#dockWind [data-e="calm"]'); await page.keyboard.press('Enter');
    if (await page.getAttribute('#dockWind .dwSpeed', 'aria-pressed') !== 'true') { await page.focus('#dockWind .dwSpeed'); await page.keyboard.press('Enter'); }
    await page.evaluate(() => { window.__pilot = null; });
    await page.focus('#dockWind .dwStage');
    const t0 = Date.now(); let keys = 0; res = '';
    while (Date.now() - t0 < 80000) {
      const c = await page.evaluate(decide, o);
      if (c.done) { res = c.done; break; }
      for (let i = c.nowThr; i < c.thr; i++) { await page.keyboard.press('ArrowUp'); keys++; }
      for (let i = c.nowThr; i > c.thr; i--) { await page.keyboard.press('ArrowDown'); keys++; }
      for (let r = c.nowRud; r < c.rud; r += 5) { await page.keyboard.press('ArrowRight'); keys++; }
      for (let r = c.nowRud; r > c.rud; r -= 5) { await page.keyboard.press('ArrowLeft'); keys++; }
      await page.waitForTimeout(50);
    }
    console.log(`${/Pristao si/.test(res) ? 'ok  ' : '....'} ${name}, pokušaj ${attempt}: ${((Date.now() - t0) / 1000).toFixed(0)} s, ${keys} pritisaka tipki: ${res.slice(0, 60) || 'isteklo vrijeme'}`);
  }
  if (!/Pristao si/.test(res)) fails.push(`${name}: samo tipkovnicom nije uspjelo pristati (${res.slice(0, 80) || 'isteklo vrijeme'})`);
}
if (errs.length) fails.push('JS greške: ' + errs.join(' | '));
await browser.close(); server.close();
console.log(fails.length ? `\nNIJE PROŠLO:\n - ${fails.join('\n - ')}` : '\nProšlo: pristajanje samo tipkovnicom, oba pogona.');
process.exit(fails.length ? 1 : 0);
