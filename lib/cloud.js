/* FORMA: السحابة (Supabase).
   كل اتصال بالسيرفر هنا: التفعيل، المزامنة، تصوير الأكل.
   البيانات تنحفظ في الجهاز أول، وبعدها تنرفع للسحابة مربوطة بكود التفعيل.
   لو غيّر المستخدم جواله: يكتب نفس الكود، وترجع بياناته كلها. */
(function () {
  "use strict";
  const P = window.FORMA_PLATFORM;
  const BASE = "https://ywqguielxzzpqubgneoa.supabase.co";
  const PUB = "sb_publishable_aq-qeqG_fzGVm88wx1XA5w_tX6-Ddcn";
  const LIC = "forma_lic";
  const H = { "Content-Type": "application/json", apikey: PUB, Authorization: "Bearer " + PUB };

  const C = {};
  C.code = () => P.kv.get(LIC);
  C.setCode = c => P.kv.set(LIC, c);
  C.norm = s => { s = String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); if (s.indexOf("FM") === 0 && s.length === 12) s = s.slice(2); return s; };

  async function rpc(name, body, opts) {
    const r = await fetch(BASE + "/rest/v1/rpc/" + name, Object.assign({ method: "POST", headers: H, body: JSON.stringify(body) }, opts || {}));
    if (!r.ok) throw new Error("http " + r.status);
    return r.json();
  }

  /* التفعيل: يرجع ok أو used أو invalid */
  C.activate = async (raw) => {
    const c = C.norm(raw);
    if (c.length !== 10) return "invalid";
    const res = await rpc("activate", { p_code: c, p_device: P.deviceId() });
    if (res === "ok") { C.setCode(c); window.dispatchEvent(new Event("forma:activated")); }
    return res;
  };

  /* تصوير الأكل */
  C.photo = async (img) => {
    const code = C.code();
    if (!code) return { error: "nolic" };
    try {
      const r = await fetch(BASE + "/functions/v1/food-photo", {
        method: "POST", headers: H,
        body: JSON.stringify({ code, device: P.deviceId(), image: img.b64, type: img.type }),
      });
      const j = await r.json().catch(() => ({ error: "server" }));
      return j;
    } catch (e) { return { error: "net" }; }
  };

  /* عداد الاستخدام: سطر واحد للجهاز في اليوم. رقم عشوائي وعلامات فقط، بدون اسم ولا بيانات شخصية */
  C.ping = (o) => {
    try {
      fetch(BASE + "/rest/v1/rpc/ping", { method: "POST", headers: H, keepalive: true,
        body: JSON.stringify({ p_device: P.deviceId(), p_lic: !!C.code(), p_prof: !!o.prof, p_food: !!o.food, p_train: !!o.train, p_pwa: !!o.pwa, p_os: o.os || "", p_ver: o.ver || "", p_step: +o.step || 0 }) }).catch(() => {});
    } catch (e) {}
  };
  /* لوحة المستخدمين: للكود اللي خطته admin فقط */
  C.stats = async () => {
    const code = C.code(); if (!code) return { err: "no" };
    try { return await rpc("admin_stats", { p_code: code, p_device: P.deviceId() }); } catch (e) { return { err: "net" }; }
  };

  /* ===== المزامنة =====
     كل تعديل يحط وقت (ts). اللي وقته أحدث يفوز. */
  const sync = { state: "off", last: 0 };
  let cfg = null, timer = null, busy = false, again = false;
  const status = s => { sync.state = s; if (cfg && cfg.onStatus) try { cfg.onStatus(s); } catch (e) {} };

  async function pull() {
    const code = C.code(); if (!code || !cfg) return;
    const r = await rpc("sync_pull", { p_code: code, p_device: P.deviceId(), p_slot: cfg.slot });
    if (r.err) { status("nolic"); return; }
    const local = cfg.get(), flag = "forma_synced_" + cfg.slot;
    /* أول مزامنة في جهاز فيه بيانات، والسحابة فيها بيانات بعد: نخلي المستخدم يختار */
    if (r.data && !P.kv.get(flag) && local && local.profile && cfg.choose) {
      const pick = await cfg.choose(r.data, r.ts);
      P.kv.set(flag, "1");
      if (pick === "local") { local._ts = Date.now(); await push(); return; }
      cfg.apply(r.data); sync.last = Date.now(); status("ok"); return "pulled";
    }
    const lts = local && local._ts || 0;
    if (r.data && r.ts > lts) { cfg.apply(r.data); P.kv.set(flag, "1"); sync.last = Date.now(); status("ok"); return "pulled"; }
    P.kv.set(flag, "1");
    if (!r.data || lts > r.ts) await push();
    else status("ok");
  }
  async function push() {
    const code = C.code(); if (!code || !cfg) return;
    if (busy) { again = true; return; }
    busy = true;
    try {
      const data = cfg.get();
      if (!data || (!data.profile && !data._wiped)) { status("ok"); return; }
      const r = await rpc("sync_push", { p_code: code, p_device: P.deviceId(), p_slot: cfg.slot, p_data: data, p_ts: data._ts || Date.now() }, { keepalive: new Blob([JSON.stringify(data)]).size < 50000 });
      if (r.err === "nolic") status("nolic");
      else if (r.err === "big") status("big");
      else if (r.stale) { await pull(); }
      else if (r.ok) { sync.last = Date.now(); status("ok"); }
      else status("error");
    } catch (e) { status(P.online() ? "error" : "offline"); }
    finally { busy = false; if (again) { again = false; schedule(1500); } }
  }
  function schedule(ms) {
    if (!cfg || !C.code()) return;
    clearTimeout(timer); timer = setTimeout(push, ms == null ? 6000 : ms);
  }

  /* app.js يناديها مرة وحدة: slot اسم النسخة، get يرجع البيانات، apply يستبدلها */
  sync.init = (o) => {
    cfg = o;
    if (!C.code()) { status("off"); return; }
    status("syncing");
    pull().catch(() => status(P.online() ? "error" : "offline"));
  };
  sync.changed = () => schedule();
  sync.now = () => { if (!C.code()) return Promise.resolve(); status("syncing"); return pull().catch(() => status(P.online() ? "error" : "offline")); };
  sync.flush = () => { if (timer) { clearTimeout(timer); timer = null; push(); } };

  window.addEventListener("forma:activated", () => { if (cfg) sync.now(); });
  window.addEventListener("online", () => { if (cfg && C.code()) sync.now(); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sync.flush();
    else if (cfg && C.code() && Date.now() - sync.last > 60000) sync.now();
  });

  C.sync = sync;
  window.FORMA_CLOUD = C;
})();
