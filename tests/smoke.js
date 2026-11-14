// Browser smoke test: both variants, seeded user, walk tabs, log food, finish a set, reload, verify.
const fs = require("fs"), path = require("path"), http = require("http");
const { ROOT, check } = require("./lib");
const SEED = fs.readFileSync(path.join(__dirname, "fixtures/seed.json"), "utf8");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png", ".svg": "image/svg+xml" };

function serve() {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(ROOT, path.normalize(p));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, "127.0.0.1", () => r(srv)));
}

const VARIANTS = [
  { name: "public /", path: "/", key: "forma-v2", extra: { forma_lic: "CI-TEST" } }, // license so the gate never blocks (free period ends 2026-11-19)
  { name: "jawad /jawad/", path: "/jawad/", key: "forma-jawad", extra: {} },
];
const TABS = ["today", "food", "train", "progress"];

async function runVariant(browser, base, v) {
  console.log(`\n[smoke ${v.name}]`);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ar-SA", isMobile: true, hasTouch: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|ERR_FAILED|net::/.test(m.text())) errors.push("console: " + m.text()); });
  await page.route(/fonts\.googleapis|fonts\.gstatic|jsdelivr|supabase\.co/, r => r.abort());
  await page.addInitScript(([key, seed, extra]) => {
    if (sessionStorage.getItem("__seeded")) return;
    localStorage.clear(); localStorage.setItem(key, seed); localStorage.setItem("forma-inst-skip", String(Date.now()));
    for (const k in extra) localStorage.setItem(k, extra[k]);
    sessionStorage.setItem("__seeded", "1");
  }, [v.key, SEED, v.extra]);

  const state = () => page.evaluate(k => JSON.parse(localStorage.getItem(k) || "null"), v.key);
  const foodCount = S => Object.values(S.days || {}).reduce((n, d) => n + ((d && d.food) || []).length, 0);
  const dismiss = async () => { for (const id of ["#instSkip", "#instLater"]) { const b = await page.$(id); if (b && await b.isVisible()) await b.click(); } };

  await page.goto(base + v.path, { waitUntil: "load" });
  await page.waitForSelector('nav button[data-tab="today"]', { timeout: 5000 });
  await dismiss();
  check("no activation gate shown", !(await page.$(".fg")) || !(await page.isVisible(".fg")));

  for (const t of TABS) {
    await page.click(`nav button[data-tab="${t}"]`); await page.waitForTimeout(150);
    const len = await page.$eval("#view", e => e.innerText.trim().length).catch(() => 0);
    check(`tab ${t} renders`, len > 20, "view text length " + len);
  }

  // log food through the text parser
  const before = foodCount(await state());
  await page.click('nav button[data-tab="food"]');
  await page.fill("#sayIn", "حبتين تمر");
  await page.press("#sayIn", "Enter");
  await page.waitForSelector("#sayAdd:not([disabled])", { timeout: 3000 }).catch(() => {});
  const canAdd = !!(await page.$("#sayAdd:not([disabled])"));
  check("food parse sheet offers an add button", canAdd);
  if (canAdd) await page.click("#sayAdd");
  await page.waitForTimeout(200);
  check("food entry saved", foodCount(await state()) === before + 1, `before ${before} after ${foodCount(await state())}`);

  // complete one workout set
  await page.click('nav button[data-tab="train"]'); await page.waitForTimeout(200);
  const kgSel = '#exOpen input[data-k$="|0|kg"]';
  const hasEx = !!(await page.$(kgSel));
  check("workout has an open exercise", hasEx);
  let setKey = null;
  if (hasEx) {
    setKey = await page.$eval(kgSel, e => e.dataset.k);
    await page.fill(kgSel, "77.5"); await page.fill('#exOpen input[data-k$="|0|r"]', "9");
    await page.click('#exOpen button[data-done$="|0"]'); await page.waitForTimeout(200);
    check("set marked done", (await page.$eval('#exOpen button[data-done$="|0"]', e => e.getAttribute("aria-pressed"))) === "true");
  }

  // reload = app killed and reopened
  await page.reload({ waitUntil: "load" }); await page.waitForSelector('nav button[data-tab="today"]'); await dismiss();
  check("food entry persisted after reload", foodCount(await state()) === before + 1);
  if (setKey) {
    await page.click('nav button[data-tab="train"]'); await page.waitForTimeout(200);
    const kg = await page.$eval(`#exOpen input[data-k="${setKey}"]`, e => e.value).catch(() => "(missing)");
    const done = await page.$eval('#exOpen button[data-done$="|0"]', e => e.getAttribute("aria-pressed")).catch(() => null);
    check("workout set persisted after reload", kg === "77.5" && done === "true", `kg=${kg} done=${done}`);
  }
  check("no page errors", errors.length === 0, errors.slice(0, 5).join("\n       "));
  await ctx.close();
}

module.exports = async function smoke() {
  let chromium;
  try { ({ chromium } = require("playwright")); } catch (e) { console.log("\n[smoke] SKIP: playwright not installed"); return; }
  const srv = await serve(), base = "http://127.0.0.1:" + srv.address().port;
  const browser = await chromium.launch();
  try { for (const v of VARIANTS) await runVariant(browser, base, v); }
  finally { await browser.close(); srv.close(); }
};
if (require.main === module) module.exports().then(() => process.exit(require("./lib").summary().fail ? 1 : 0));
