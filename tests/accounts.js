// Browser test for 5.0 accounts: login gate, email code, OAuth return, linking a Zid code, old-code auto link, settings card.
// Supabase is mocked with page.route, so no network and no real accounts.
const fs = require("fs"), path = require("path"), http = require("http");
const { ROOT, check } = require("./lib");
const SEED = fs.readFileSync(path.join(__dirname, "fixtures/seed.json"), "utf8");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png" };

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

const JWT = "h." + Buffer.from(JSON.stringify({ email: "jawad@test.sa" })).toString("base64url") + ".s";

// fake Supabase: state per test
function mock(page, st) {
  st.calls = [];
  return page.route(/supabase\.co/, async (route) => {
    const u = new URL(route.request().url()), name = u.pathname.split("/").pop();
    let body = {}; try { body = JSON.parse(route.request().postData() || "{}"); } catch (e) {}
    st.calls.push(name);
    const json = (o, s) => route.fulfill({ status: s || 200, contentType: "application/json", body: JSON.stringify(o) });
    if (u.pathname.startsWith("/auth/v1/otp")) return json({});
    if (u.pathname.startsWith("/auth/v1/verify")) return body.token === "123456" ? json({ access_token: JWT, refresh_token: "r1", expires_in: 3600, user: { email: body.email } }) : json({ error_code: "otp_expired" }, 403);
    if (u.pathname.startsWith("/auth/v1/logout")) return json({});
    if (name === "acc_info") return json({ plan: st.plan, n: st.plan === "founder" ? 7 : null, email: "jawad@test.sa" });
    if (name === "acc_link") { st.linked = body.p_code; if (body.p_code === "ABCDE12345") { st.plan = "founder"; return json({ ok: true, moved: false, plan: "founder" }); } return json({ err: "invalid" }); }
    if (name === "acc_pull") return json({ empty: true });
    if (name === "acc_push") return json({ ok: true, ts: Date.now() });
    if (name === "acc_signout_device") return json(null);
    if (name === "acc_delete") return json({ ok: true });
    return json(null);
  });
}

async function newPage(browser, extra, seed) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ar-SA", isMobile: true, hasTouch: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", e => page.errors.push(e.message));
  await page.route(/fonts\.googleapis|fonts\.gstatic|jsdelivr/, r => r.abort());
  await page.addInitScript(([seed, extra]) => {
    if (sessionStorage.getItem("__seeded")) return;
    localStorage.clear(); if (seed) localStorage.setItem("forma-v2", seed); localStorage.setItem("forma-inst-skip", String(Date.now()));
    for (const k in extra) localStorage.setItem(k, extra[k]);
    sessionStorage.setItem("__seeded", "1");
  }, [seed, extra || {}]);
  return { ctx, page };
}
const gateUp = page => page.isVisible(".fg").catch(() => false);
const ls = (page, k) => page.evaluate(k => localStorage.getItem(k), k);

module.exports = async function accounts() {
  let chromium;
  try { ({ chromium } = require("playwright")); } catch (e) { console.log("\n[accounts] SKIP: playwright not installed"); return; }
  const srv = await serve(), base = "http://127.0.0.1:" + srv.address().port + "/";
  const browser = await chromium.launch();
  try {
    console.log("\n[accounts]");
    // 1) new user: email login → no membership → link code → unlocked
    {
      const st = { plan: "none" }, { ctx, page } = await newPage(browser, {}, SEED);
      await mock(page, st);
      await page.goto(base, { waitUntil: "load" }); await page.waitForTimeout(300);
      check("gate shows for a new user", await gateUp(page));
      check("gate offers Apple and Google", !!(await page.$('.fg [data-p="apple"]')) && !!(await page.$('.fg [data-p="google"]')));
      await page.fill("#faMail", "Jawad@Test.sa"); await page.click("#faSend");
      await page.waitForSelector("#faCode", { timeout: 3000 });
      await page.fill("#faCode", "111111"); await page.click("#faOk"); await page.waitForTimeout(200);
      check("wrong code shows an error", (await page.$eval("#faErr", e => e.textContent)).length > 0);
      await page.fill("#faCode", "123456"); await page.waitForTimeout(600);
      check("session saved after email code", !!(await ls(page, "forma_sess")));
      await page.waitForSelector("#fgCode", { timeout: 3000 }).catch(() => {});
      check("signed in without membership asks for the purchase code", !!(await page.$("#fgCode")) && await gateUp(page));
      await page.fill("#fgCode", "ABCDE-12345"); await page.click('.fg button[type="submit"]'); await page.waitForTimeout(600);
      check("linking the code unlocks the app", !(await gateUp(page)), "calls: " + st.calls.join(","));
      check("code sent normalized", st.linked === "ABCDE12345");
      check("no page errors (email flow)", page.errors.length === 0, page.errors.join(" | "));
      await ctx.close();
    }
    // 2) back from Apple/Google with tokens in the URL hash, already a founder
    {
      const st = { plan: "founder" }, { ctx, page } = await newPage(browser, {}, SEED);
      await mock(page, st);
      await page.goto(base + "#access_token=" + JWT + "&refresh_token=r2&expires_in=3600&token_type=bearer", { waitUntil: "load" });
      await page.waitForTimeout(800);
      check("oauth return stores the session", JSON.parse((await ls(page, "forma_sess")) || "{}").email === "jawad@test.sa");
      check("oauth return cleans the URL", !(await page.evaluate(() => location.hash)));
      check("founder account is unlocked", !(await gateUp(page)));
      check("account sync used", st.calls.includes("acc_pull"), st.calls.join(","));
      await page.click('#gearB').catch(() => {}); await page.waitForTimeout(300);
      const txt = await page.$eval("#view", e => e.innerText).catch(() => "");
      check("settings shows the account email", txt.includes("jawad@test.sa"));
      await page.click("#accOut"); await page.waitForTimeout(500);
      check("sign out clears the session", !(await ls(page, "forma_sess")));
      check("sign out locks again", await gateUp(page));
      check("no page errors (oauth flow)", page.errors.length === 0, page.errors.join(" | "));
      await ctx.close();
    }
    // 3) old code device logs in from settings → code auto-links to the account
    {
      const st = { plan: "none" }, { ctx, page } = await newPage(browser, { forma_lic: "ABCDE12345" }, SEED);
      await mock(page, st);
      await page.goto(base, { waitUntil: "load" }); await page.waitForTimeout(300);
      check("old code device opens without login", !(await gateUp(page)));
      await page.click('#gearB').catch(() => {}); await page.waitForTimeout(300);
      check("settings offers login to link the code", !!(await page.$("#accLogin #faMail")));
      await page.fill("#faMail", "jawad@test.sa"); await page.click("#faSend");
      await page.waitForSelector("#faCode", { timeout: 3000 }); await page.fill("#faCode", "123456"); await page.waitForTimeout(1000);
      check("old code linked automatically", st.linked === "ABCDE12345", st.calls.join(","));
      const txt = await page.$eval("#view", e => e.innerText).catch(() => "");
      check("settings now shows the account", txt.includes("jawad@test.sa") && !!(await page.$("#accDel")));
      check("no page errors (link flow)", page.errors.length === 0, page.errors.join(" | "));
      await ctx.close();
    }
  } finally { await browser.close(); srv.close(); }
};
if (require.main === module) module.exports().then(() => process.exit(require("./lib").summary().fail ? 1 : 0));
