/* FORMA: تسجيل الدخول (Supabase Auth).
   الطرق: أبل، قوقل، والإيميل برمز من 6 أرقام. ما نتعامل مع كلمات مرور أبد.
   الجلسة تنحفظ في الجهاز (forma_sess) وتتجدد لحالها.
   لازم يتحمّل قبل gate.js و cloud.js. */
(function () {
  "use strict";
  var BASE = "https://ywqguielxzzpqubgneoa.supabase.co";
  var PUB = "sb_publishable_aq-qeqG_fzGVm88wx1XA5w_tX6-Ddcn";
  var SESS = "forma_sess";
  /* الطرق المفعلة في Supabase (Authentication ← Providers). شيل أي وحدة ما تفعّلت.
     أبل في المتصفح تحتاج حساب Apple Developer: أضف "apple" هنا أول ما تفعّله في Supabase */
  var PROVIDERS = ["google"];

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function load() { try { return JSON.parse(get(SESS) || "null"); } catch (e) { return null; } }
  function save(s) { set(SESS, JSON.stringify(s)); }
  function emit(name) { try { window.dispatchEvent(new Event(name)); } catch (e) {} }

  /* يحوّل رد Supabase لجلسة نحفظها */
  function fromAuth(r) {
    if (!r || !r.access_token || !r.refresh_token) return null;
    var exp = r.expires_at ? r.expires_at * 1000 : Date.now() + (+r.expires_in || 3600) * 1000;
    var email = (r.user && r.user.email) || null;
    if (!email) { try { email = JSON.parse(atob(r.access_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).email || null; } catch (e) {} }
    return { at: r.access_token, rt: r.refresh_token, exp: exp, email: email };
  }

  async function call(path, body, token) {
    var r = await fetch(BASE + "/auth/v1/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: PUB, Authorization: "Bearer " + (token || PUB) },
      body: JSON.stringify(body || {}),
    });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) { var e = new Error(j.error_code || j.msg || j.error_description || ("http " + r.status)); e.status = r.status; e.code = j.error_code || ""; throw e; }
    return j;
  }

  var A = {};
  A.providers = PROVIDERS.slice();
  A.session = load;
  A.email = function () { var s = load(); return s && s.email; };
  A.signedIn = function () { return !!load(); };

  /* توكن صالح، ويتجدد لو باقي له أقل من دقيقة */
  var refreshing = null;
  A.token = async function () {
    var s = load(); if (!s) return null;
    if (s.exp - Date.now() > 60000) return s.at;
    if (!refreshing) refreshing = call("token?grant_type=refresh_token", { refresh_token: s.rt })
      .then(function (r) { var n = fromAuth(r); if (n) { if (!n.email) n.email = s.email; save(n); return n.at; } return null; })
      .catch(function (e) { if (e.status === 400 || e.status === 401) { del(SESS); emit("forma:signedout"); } return null; })
      .then(function (t) { refreshing = null; return t; });
    return refreshing;
  };

  /* RPC بتوكن الحساب */
  A.rpc = async function (name, body) {
    var t = await A.token(); if (!t) return { err: "auth" };
    var r = await fetch(BASE + "/rest/v1/rpc/" + name, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: PUB, Authorization: "Bearer " + t },
      body: JSON.stringify(body || {}),
    });
    if (r.status === 401) return { err: "auth" };
    if (!r.ok) throw new Error("http " + r.status);
    var txt = await r.text(); return txt ? JSON.parse(txt) : null;
  };

  /* الإيميل: نرسل رمز، بعدين نتحقق منه */
  A.emailStart = function (email) { return call("otp", { email: email, create_user: true }); };
  A.emailVerify = async function (email, code) {
    var r = await call("verify", { type: "email", email: email, token: code });
    var s = fromAuth(r); if (!s) throw new Error("bad");
    save(s); emit("forma:signedin"); return s;
  };

  /* أبل وقوقل في المتصفح: نروح صفحة الدخول ونرجع لنفس الصفحة والتوكن في الرابط */
  A.oauth = function (provider) {
    var back = location.origin + location.pathname;
    location.href = BASE + "/auth/v1/authorize?provider=" + encodeURIComponent(provider) + "&redirect_to=" + encodeURIComponent(back);
  };

  A.signOut = async function () {
    var s = load();
    try { if (s) { await A.rpc("acc_signout_device", { p_device: device() }); await call("logout", {}, s.at); } } catch (e) {}
    del(SESS); del("forma_plan"); emit("forma:signedout");
  };

  function device() {
    var d = get("forma_dev");
    if (!d) { d = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2); set("forma_dev", d); }
    return d;
  }
  A.device = device;

  /* الرجوع من أبل أو قوقل: #access_token=...&refresh_token=... */
  (function () {
    var h = location.hash || "";
    if (h.indexOf("access_token=") < 0 && h.indexOf("error") < 0) return;
    var p = new URLSearchParams(h.slice(1));
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (p.get("error")) { A.lastError = p.get("error_description") || p.get("error"); return; }
    var s = fromAuth({ access_token: p.get("access_token"), refresh_token: p.get("refresh_token"), expires_in: p.get("expires_in"), expires_at: p.get("expires_at") });
    if (s) { save(s); A.justSignedIn = true; setTimeout(function () { emit("forma:signedin"); }, 0); }
  })();

  /* ===== واجهة الدخول: تنحط داخل أي عنصر (شاشة القفل أو صفحة ملفي) ===== */
  var ICON = {
    apple: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.5-3.7zM14.1 5.6c.6-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/></svg>',
    google: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8C3.9 20.5 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.7 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.1 4.9l3.6-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.5 2.1 7.1l3.6 2.8C6.6 7.3 9.1 5.4 12 5.4z"/></svg>',
  };
  var NAME = { apple: "أبل", google: "قوقل" };
  var ERR = {
    over_email_send_rate_limit: "أرسلنا رموز كثير. انتظر دقيقة وجرّب",
    otp_expired: "الرمز انتهى أو غلط. اطلب رمز جديد",
    email_address_invalid: "الإيميل غير صحيح",
    validation_failed: "الإيميل غير صحيح",
  };
  var CSS = ".fa{display:flex;flex-direction:column;gap:10px}.fa button{display:flex;align-items:center;justify-content:center;gap:8px}" +
    ".fa .fa-apple{background:#000;color:#fff}.fa .fa-google{background:var(--surface,#fff);color:var(--ink,#0F1513);box-shadow:0 0 0 1px var(--line,#DCE2DF) inset}" +
    ".fa input{direction:ltr;text-align:center}.fa .fa-err{color:var(--hot,#C8501F);font-weight:700;font-size:13px;min-height:18px;text-align:center}" +
    ".fa .fa-or{display:flex;align-items:center;gap:10px;color:var(--muted,#5E6B66);font-size:12px}.fa .fa-or:before,.fa .fa-or:after{content:'';flex:1;height:1px;background:var(--line,#DCE2DF)}" +
    ".fa .fa-note{color:var(--muted,#5E6B66);font-size:12.5px;text-align:center;margin:0}";
  var cssDone = false;

  A.mountLogin = function (el) {
    if (!cssDone) { var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st); cssDone = true; }
    var email = "";
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function stepOne() {
      el.innerHTML = '<div class="fa">' +
        A.providers.map(function (p) { return '<button type="button" class="wide fa-' + p + '" data-p="' + p + '">' + ICON[p] + "<span>المتابعة مع " + NAME[p] + "</span></button>"; }).join("") +
        (A.providers.length ? '<div class="fa-or">أو بالإيميل</div>' : "") +
        '<input type="email" id="faMail" inputmode="email" autocomplete="email" placeholder="name@email.com" aria-label="الإيميل" value="' + esc(email) + '">' +
        '<button type="button" class="primary wide" id="faSend">أرسل لي رمز</button>' +
        '<div class="fa-err" id="faErr" aria-live="polite">' + (A.lastError ? "ما كمل الدخول. جرّب مرة ثانية" : "") + "</div></div>";
      A.lastError = null;
      el.querySelectorAll("[data-p]").forEach(function (b) { b.addEventListener("click", function () { A.oauth(b.dataset.p); }); });
      var inp = el.querySelector("#faMail"), btn = el.querySelector("#faSend"), err = el.querySelector("#faErr");
      async function send() {
        email = inp.value.trim().toLowerCase(); err.textContent = "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "اكتب إيميلك صح"; return; }
        btn.disabled = true; btn.textContent = "لحظة...";
        try { await A.emailStart(email); stepTwo(); }
        catch (e) { err.textContent = ERR[e.code] || (navigator.onLine === false ? "تأكد إنك متصل بالنت" : "ما قدرنا نرسل الرمز. جرّب بعد شوي"); btn.disabled = false; btn.textContent = "أرسل لي رمز"; }
      }
      btn.addEventListener("click", send);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); send(); } });
    }
    function stepTwo() {
      el.innerHTML = '<div class="fa"><p class="fa-note">أرسلنا رمز من 6 أرقام إلى<br><b dir="ltr">' + esc(email) + "</b></p>" +
        '<input type="text" id="faCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="000000" aria-label="الرمز" style="font-size:22px;letter-spacing:.3em">' +
        '<button type="button" class="primary wide" id="faOk">دخول</button>' +
        '<button type="button" class="ghost" id="faBack">غيّر الإيميل أو أرسل رمز جديد</button>' +
        '<div class="fa-err" id="faErr" aria-live="polite"></div><p class="fa-note">ما وصلك؟ شوف مجلد الرسائل غير المرغوبة.</p></div>';
      var inp = el.querySelector("#faCode"), btn = el.querySelector("#faOk"), err = el.querySelector("#faErr");
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
      async function ok() {
        var c = inp.value.replace(/\D/g, ""); err.textContent = "";
        if (c.length !== 6) { err.textContent = "الرمز 6 أرقام"; return; }
        btn.disabled = true; btn.textContent = "لحظة...";
        try { await A.emailVerify(email, c); }
        catch (e) { err.textContent = ERR[e.code] || ERR.otp_expired; btn.disabled = false; btn.textContent = "دخول"; }
      }
      btn.addEventListener("click", ok);
      inp.addEventListener("input", function () { if (inp.value.replace(/\D/g, "").length === 6) ok(); });
      el.querySelector("#faBack").addEventListener("click", stepOne);
    }
    stepOne();
  };

  window.FORMA_AUTH = A;
})();
