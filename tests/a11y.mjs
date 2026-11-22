// Provjera pristupačnosti (axe-core, WCAG 2.1 A i AA) na svakoj stranici: desktop, mobitel i noćni način.
// Pokretanje: node tests/a11y.mjs
import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const URL0 = `http://localhost:${server.address().port}/index.html`;
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME, args: ['--no-sandbox'] } : {});
const found = {};
for (const [name, vp, mobile, theme] of [['desktop', { width: 1366, height: 850 }, false, 'day'], ['mobitel', { width: 390, height: 844 }, true, 'day'], ['noćni način', { width: 1366, height: 850 }, false, 'night']]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, serviceWorkers: 'block' });
  await ctx.addInitScript(t => { try { localStorage.setItem('vbTheme', t); } catch (e) {} }, theme);
  const page = await ctx.newPage(); await page.goto(URL0, { waitUntil: 'load' }); await page.addScriptTag({ content: AXE });
  for (const id of await page.$$eval('section.page', s => s.map(x => x.id))) {
    await page.evaluate(i => go(i), id); await page.waitForTimeout(450);
    const r = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }));
    for (const v of r.violations) (found[`${v.id} (${v.impact}): ${v.help}`] ||= []).push(`${name} › ${id} › ${v.nodes[0].html.slice(0, 110)}`);
  }
  await ctx.close();
}
await browser.close(); server.close();
const keys = Object.keys(found);
if (keys.length) { for (const k of keys) console.error(`\n${k}\n   ` + found[k].slice(0, 4).join('\n   ')); console.error(`\nNIJE PROŠLO: ${keys.length} vrsta problema.`); process.exit(1); }
console.log('Prošlo: nijedan problem pristupačnosti na 19 stranica, u tri prikaza.');
