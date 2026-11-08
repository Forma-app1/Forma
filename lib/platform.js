/* FORMA: طبقة الجهاز.
   كل شي يعتمد على المتصفح أو الجوال هنا: التخزين، رقم الجهاز، الاهتزاز، الصور.
   لما نحوّل FORMA لتطبيق (Capacitor) نغيّر هذا الملف بس، والباقي يبقى زي ما هو. */
(function () {
  "use strict";
  const P = {};

  /* التخزين: مفتاح وقيمة نصية */
  P.kv = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  P.loadJSON = k => { try { return JSON.parse(P.kv.get(k) || "null"); } catch (e) { return null; } };
  P.saveJSON = (k, v) => P.kv.set(k, JSON.stringify(v));

  /* رقم ثابت لهذا الجهاز (يستخدم مع كود التفعيل) */
  P.deviceId = () => {
    let d = P.kv.get("forma_dev");
    if (!d) {
      d = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
      P.kv.set("forma_dev", d);
    }
    return d;
  };

  /* الاهتزاز: أندرويد عبر vibrate، وآيفون (سفاري 18) عبر مفتاح switch مخفي */
  let sw = null;
  const iosSwitch = () => {
    if (sw) return sw;
    const l = document.createElement("label"), i = document.createElement("input");
    i.type = "checkbox"; i.setAttribute("switch", ""); i.tabIndex = -1; i.setAttribute("aria-hidden", "true");
    l.style.cssText = "position:fixed;left:-99px;top:-99px;width:1px;height:1px;opacity:0;pointer-events:none";
    l.appendChild(i); document.body.appendChild(l); sw = l; return l;
  };
  P.haptic = (kind) => {
    try {
      const cap = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
      if (cap) { kind === "success" ? cap.notification({ type: "SUCCESS" }) : cap.impact({ style: kind === "heavy" ? "HEAVY" : "LIGHT" }); return; }
      if (navigator.vibrate) { navigator.vibrate(kind === "success" ? [14, 60, 22] : kind === "heavy" ? 30 : 9); return; }
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) { iosSwitch().click(); if (kind === "success") setTimeout(() => iosSwitch().click(), 110); }
    } catch (e) {}
  };

  /* اختيار صورة: يفتح الكاميرا أو الألبوم */
  P.pickImage = (opts) => new Promise(res => {
    const i = document.createElement("input");
    i.type = "file"; i.accept = "image/*";
    if (opts && opts.camera) i.setAttribute("capture", "environment");
    i.style.cssText = "position:fixed;left:-99px;opacity:0";
    let done = false;
    const finish = f => { if (done) return; done = true; i.remove(); res(f || null); };
    i.addEventListener("change", () => finish(i.files && i.files[0]));
    i.addEventListener("cancel", () => finish(null));
    document.body.appendChild(i); i.click();
  });

  /* تصغير الصورة قبل الإرسال: أسرع وأرخص، وكافي لتمييز الأكل */
  P.shrinkImage = async (file, max, quality) => {
    max = max || 896; quality = quality || 0.8;
    let src, w, h;
    try { src = await createImageBitmap(file, { imageOrientation: "from-image" }); w = src.width; h = src.height; }
    catch (e) {
      src = await new Promise((ok, bad) => { const im = new Image(); im.onload = () => ok(im); im.onerror = bad; im.src = URL.createObjectURL(file); });
      w = src.naturalWidth; h = src.naturalHeight;
    }
    const k = Math.min(1, max / Math.max(w, h)), cw = Math.round(w * k), ch = Math.round(h * k);
    const cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
    cv.getContext("2d").drawImage(src, 0, 0, cw, ch);
    const url = cv.toDataURL("image/jpeg", quality);
    return { url, b64: url.split(",")[1], type: "image/jpeg", w: cw, h: ch };
  };

  P.online = () => navigator.onLine !== false;
  P.isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  P.reducedMotion = () => !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  window.FORMA_PLATFORM = P;
})();
