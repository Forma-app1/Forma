// FORMA: تأكيد الشراء من أبل وربطه بالحساب.
// التطبيق يرسل رقم العملية، واحنا نسأل أبل مباشرة (App Store Server API) عن العملية،
// فما نثق بأي شي يجي من الجوال. إذا العملية صحيحة وغير مسترجعة، نعطي الحساب العضوية (iap_grant).
//
// الأسرار (Supabase ← Edge Functions ← Secrets)، يضيفها جواد:
//   APPLE_ISSUER_ID    من App Store Connect ← Users and Access ← Integrations ← In-App Purchase
//   APPLE_KEY_ID       رقم المفتاح
//   APPLE_PRIVATE_KEY  محتوى ملف .p8 كامل
//   APPLE_BUNDLE_ID    اختياري، الافتراضي com.alageel.forma
// SUPABASE_URL و SUPABASE_ANON_KEY و SUPABASE_SERVICE_ROLE_KEY يحطها Supabase تلقائي.

const BUNDLE = Deno.env.get("APPLE_BUNDLE_ID") || "com.alageel.forma";
const PRODUCTS = ["sa.forma.app.founder"];
const SB = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
const b64url = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));

// توكن قصير لـ App Store Server API (ES256 بمفتاح .p8)
let cached: { t: string; exp: number } | null = null;
async function appleToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 60 > now) return cached.t;
  const pem = (Deno.env.get("APPLE_PRIVATE_KEY") || "").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = enc({ alg: "ES256", kid: Deno.env.get("APPLE_KEY_ID"), typ: "JWT" });
  const body = enc({ iss: Deno.env.get("APPLE_ISSUER_ID"), iat: now, exp: now + 900, aud: "appstoreconnect-v1", bid: BUNDLE });
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(head + "." + body));
  cached = { t: head + "." + body + "." + b64url(sig), exp: now + 900 };
  return cached.t;
}

// يجيب العملية من أبل: الإنتاج أول، وبعدها sandbox (TestFlight)
async function appleTx(id: string): Promise<Record<string, unknown> | null> {
  const t = await appleToken();
  for (const host of ["api.storekit.itunes.apple.com", "api.storekit-sandbox.itunes.apple.com"]) {
    const r = await fetch(`https://${host}/inApps/v1/transactions/${encodeURIComponent(id)}`, { headers: { Authorization: "Bearer " + t } });
    if (r.status === 404) continue;
    if (!r.ok) throw new Error("apple " + r.status);
    const { signedTransactionInfo } = await r.json();
    // الرد جاي من أبل مباشرة عبر TLS، فنقرأ محتواه بدون إعادة تحقق من التوقيع
    const p = String(signedTransactionInfo || "").split(".")[1] || "";
    return JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ err: "method" }, 405);
  // من المستخدم؟ من توكن حسابه
  const auth = req.headers.get("authorization") || "";
  const u = await fetch(SB + "/auth/v1/user", { headers: { apikey: ANON, Authorization: auth } });
  if (!u.ok) return json({ err: "auth" }, 401);
  const user = await u.json();
  let id = "";
  try { id = String((await req.json()).transaction_id || "").replace(/\D/g, ""); } catch { /* */ }
  if (!id) return json({ err: "bad" }, 400);
  try {
    const tx = await appleTx(id);
    if (!tx) return json({ err: "notfound" });
    if (tx.bundleId !== BUNDLE || !PRODUCTS.includes(String(tx.productId))) return json({ err: "product" });
    if (tx.revocationDate) return json({ err: "revoked" });
    const r = await fetch(SB + "/rest/v1/rpc/iap_grant", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SERVICE, Authorization: "Bearer " + SERVICE },
      body: JSON.stringify({ p_user: user.id, p_ref: String(tx.originalTransactionId), p_source: "apple" }),
    });
    return json(await r.json());
  } catch (e) {
    console.error("iap-apple", (e as Error).message);
    return json({ err: "server" }, 502);
  }
});
