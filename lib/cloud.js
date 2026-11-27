/* FORMA: السحابة (Supabase).
   كل اتصال بالسيرفر هنا: الحساب، التفعيل، المزامنة، تصوير الأكل.
   البيانات تنحفظ في الجهاز أول، وبعدها تنرفع للسحابة.
   من 5.0: البيانات مربوطة بالحساب (lib/auth.js). الأجهزة اللي مفعلة بكود قديم تبقى شغالة بالكود
   لين صاحبها يسجل دخول، وساعتها الكود ينربط بحسابه تلقائي. */
(function () {
  "use strict";
  const P = window.FORMA_PLATFORM;
  const BASE = "https://ywqguielxzzpqubgneoa.supabase.co";
  const PUB = "sb_publishable_aq-qeqG_fzGVm88wx1XA5w_tX6-Ddcn";
  const LIC = "forma_lic";
  const H = { "Content-Type": "application/json", apikey: PUB, Authorization: "Bearer " + PUB };

  const AU = window.FORMA_AUTH || null;
  const C = {};
  C.code = () => P.kv.get(LIC);
  /* الحساب: مسجل دخول؟ وعنده عضوية؟ */
  C.acc = () => !!(AU && AU.signedIn());
  C.email = () => AU && AU.email();
  const accPlan = () => { const p = C.plan(); return C.acc() && p && p.acc && p.plan !== "none" ? p.plan : null; };
  /* هل التطبيق مفتوح لهالمستخدم (كود أو حساب بعضوية) */
  C.active = () => !!C.code() || !!accPlan();
  const useAcc = () => !!accPlan();
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

  /* عضوية المؤسسين: خطة الكود ورقم المؤسس، ونخزنها عشان تبان بدون نت */
  C.plan = () => { try { return JSON.parse(P.kv.get("forma_plan") || "null"); } catch (e) { return null; } };
  C.info = async () => {
    if (C.acc()) return accInfo();
    const code = C.code(); if (!code) return null;
    try {
      const r = await rpc("lic_info", { p_code: code, p_device: P.deviceId() });
      if (r && !r.err) { P.kv.set("forma_plan", JSON.stringify({ plan: r.plan, n: r.n, t: Date.now() })); return r; }
    } catch (e) {}
    return null;
  };
  /* حالة الحساب. لو الجهاز فيه كود قديم والحساب بدون عضوية، نربطه تلقائي */
  async function accInfo() {
    try {
      let r = await AU.rpc("acc_info", { p_device: P.deviceId() });
      if (!r || r.err === "auth") return null;
      if (r.err) return r;
      if (r.plan === "none" && C.code()) {
        const l = await AU.rpc("acc_link", { p_code: C.code(), p_device: P.deviceId() });
        if (l && l.ok) r = await AU.rpc("acc_info", { p_device: P.deviceId() });
      }
      if (r && !r.err) {
        const was = accPlan();
        P.kv.set("forma_plan", JSON.stringify({ plan: r.plan, n: r.n, t: Date.now(), acc: 1 }));
        if (!was && accPlan()) window.dispatchEvent(new Event("forma:activated"));
        window.dispatchEvent(new Event("forma:account"));
      }
      return r;
    } catch (e) { return null; }
  }
  /* ربط كود زد بالحساب: ok أو invalid أو taken أو slow */
  C.link = async (raw) => {
    const c = C.norm(raw);
    if (c.length !== 10) return "invalid";
    try {
      const r = await AU.rpc("acc_link", { p_code: c, p_device: P.deviceId() });
      if (r && r.ok) { await accInfo(); return "ok"; }
      return (r && r.err) || "invalid";
    } catch (e) { return "net"; }
  };
  /* حذف الحساب نهائيا (البيانات بالجهاز تبقى) */
  C.deleteAccount = async () => {
    try { const r = await AU.rpc("acc_delete", {}); if (!r || !r.ok) return false; } catch (e) { return false; }
    P.kv.del("forma_plan"); await AU.signOut(); return true;
  };
  C.signOut = async () => { await AU.signOut(); P.kv.del("forma_plan"); sync.state = "off"; };
  C.foundersLeft = async () => { try { const n = await rpc("founders_left", {}); return typeof n === "number" ? n : null; } catch (e) { return null; } };

  /* التنبيهات (Web Push) */
  C.pushKey = async () => { try { const k = await rpc("push_pubkey", {}); return typeof k === "string" && k.length > 40 ? k : null; } catch (e) { return null; } };
  C.pushSave = (sub, prefs) => rpc("push_save", { p_device: P.deviceId(), p_endpoint: sub.endpoint, p_p256dh: sub.keys.p256dh, p_auth: sub.keys.auth, p_prefs: prefs });
  C.pushOff = (ep) => rpc("push_off", { p_device: P.deviceId(), p_endpoint: ep }).catch(() => {});
  C.pushTest = async (ep) => { try { const r = await fetch(BASE + "/functions/v1/push-tick", { method: "POST", headers: H, body: JSON.stringify({ test: ep }) }); return await r.json(); } catch (e) { return { err: "net" }; } };

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
        body: JSON.stringify({ p_device: P.deviceId(), p_lic: C.active(), p_prof: !!o.prof, p_food: !!o.food, p_train: !!o.train, p_pwa: !!o.pwa, p_os: o.os || "", p_ver: o.ver || "", p_step: +o.step || 0 }) }).catch(() => {});
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

  /* المزامنة بالحساب لو عنده عضوية، وإلا بالكود */
  const canSync = () => useAcc() || !!C.code();
  const doPull = () => useAcc() ? AU.rpc("acc_pull", { p_device: P.deviceId(), p_slot: cfg.slot })
    : rpc("sync_pull", { p_code: C.code(), p_device: P.deviceId(), p_slot: cfg.slot });
  const doPush = (data, keep) => useAcc() ? AU.rpc("acc_push", { p_device: P.deviceId(), p_slot: cfg.slot, p_data: data, p_ts: data._ts || Date.now() })
    : rpc("sync_push", { p_code: C.code(), p_device: P.deviceId(), p_slot: cfg.slot, p_data: data, p_ts: data._ts || Date.now() }, { keepalive: keep });
  const SYNC_ERR = { nolic: "nolic", auth: "nolic", devices: "devices", big: "big" };

  async function pull() {
    if (!canSync() || !cfg) return;
    const r = await doPull();
    if (!r || r.err) { status(SYNC_ERR[r && r.err] || "error"); return; }
    const local = cfg.get(), flag = (useAcc() ? "forma_synced_acc_" : "forma_synced_") + cfg.slot;
    /* أول مزامنة في جهاز فيه بيانات، والسحابة فيها بيانات بعد: نخلي المستخدم يختار */
    if (r.data && !P.kv.get(flag) && local && local.profile && cfg.choose && r.ts !== (local._ts || 0)) {
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
    if (!canSync() || !cfg) return;
    if (busy) { again = true; return; }
    busy = true;
    try {
      const data = cfg.get();
      if (!data || (!data.profile && !data._wiped)) { status("ok"); return; }
      const r = await doPush(data, new Blob([JSON.stringify(data)]).size < 50000);
      if (r && r.err) status(SYNC_ERR[r.err] || "error");
      else if (r.stale) { await pull(); }
      else if (r.ok) { sync.last = Date.now(); status("ok"); }
      else status("error");
    } catch (e) { status(P.online() ? "error" : "offline"); }
    finally { busy = false; if (again) { again = false; schedule(1500); } }
  }
  function schedule(ms) {
    if (!cfg || !canSync()) return;
    clearTimeout(timer); timer = setTimeout(push, ms == null ? 6000 : ms);
  }

  /* app.js يناديها مرة وحدة: slot اسم النسخة، get يرجع البيانات، apply يستبدلها */
  sync.init = (o) => {
    cfg = o;
    if (C.acc()) accInfo().then(() => { if (canSync()) sync.now(); });
    if (!canSync()) { status("off"); return; }
    status("syncing");
    pull().catch(() => status(P.online() ? "error" : "offline"));
  };
  sync.changed = () => schedule();
  sync.now = () => { if (!canSync()) { status("off"); return Promise.resolve(); } status("syncing"); return pull().catch(() => status(P.online() ? "error" : "offline")); };
  sync.flush = () => { if (timer) { clearTimeout(timer); timer = null; push(); } };

  window.addEventListener("forma:activated", () => { if (cfg) sync.now(); });
  window.addEventListener("online", () => { if (cfg && canSync()) sync.now(); });
  /* بعد الدخول: نجيب العضوية (ونربط الكود القديم لو موجود)، بعدها نزامن */
  window.addEventListener("forma:signedin", () => { accInfo().then(() => { if (cfg && canSync()) sync.now(); }); });
  window.addEventListener("forma:signedout", () => { P.kv.del("forma_plan"); status(C.code() ? "syncing" : "off"); if (cfg && C.code()) sync.now(); window.dispatchEvent(new Event("forma:account")); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") sync.flush();
    else if (cfg && canSync() && Date.now() - sync.last > 60000) sync.now();
  });

  C.sync = sync;
  window.FORMA_CLOUD = C;
})();
