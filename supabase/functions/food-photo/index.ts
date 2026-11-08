// FORMA: تقدير سعرات الأكل من صورة عبر Claude.
// المفتاح ANTHROPIC_API_KEY ينحط في Secrets حق Supabase، وما يطلع للتطبيق أبد.
// كل طلب يتأكد من الكود والجهاز، وفيه حد يومي (photo_allow في schema.sql).

const ORIGINS = ["https://forma-app1.github.io", "http://localhost:8765", "capacitor://localhost", "https://localhost"];
const MODEL = Deno.env.get("FORMA_MODEL") || "claude-haiku-5-5";
const DAILY = Number(Deno.env.get("FORMA_DAILY") || "8");

function cors(req: Request) {
  const o = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : ORIGINS[0],
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const SYSTEM = `You estimate food nutrition from a single photo for a Saudi fitness app.
Identify each distinct food or drink visible. Estimate the portion in grams from visual cues (plate size, utensils, hands, packaging).
Know Saudi and Gulf dishes well: kabsa, mandi, madfoon, saleeg, jareesh, mutabbaq, shawarma, broast, falafel, foul, tamees, dates, laban, karak, Arabic coffee, and chain meals (Albaik, Herfy, Kudu, Shawarmer, McDonald's, KFC).
Use typical restaurant/home cooking fats for Saudi food (rice dishes are cooked with oil or ghee).
If the image has no food, return {"food": false}.
Reply with ONLY one JSON object, no prose, in this shape:
{"food": true, "items": [{"name": "اسم الأكل بالعربي (قصير)", "grams": 250, "kcal": 400, "protein": 25, "carbs": 40, "fat": 15}], "confidence": "high|medium|low", "note": "ملاحظة قصيرة بالعربي عن أكبر مصدر للخطأ، مثل كمية الزيت"}
Numbers are for the visible portion, rounded. Names in Arabic.`;

function parse(text: string) {
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(text.slice(a, b + 1)); } catch { return null; }
}
const num = (v: unknown, max: number) => { const n = Math.round(Number(v)); return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0; };

Deno.serve(async (req) => {
  const h = cors(req);
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad" }, 400); }
  const { code, device, image } = body || {};
  const type = ["image/jpeg", "image/png", "image/webp"].includes(body?.type) ? body.type : "image/jpeg";
  if (typeof code !== "string" || typeof device !== "string" || typeof image !== "string" || image.length < 100 || image.length > 2_000_000) {
    return json({ error: "bad" }, 400);
  }

  const KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!KEY) return json({ error: "nokey" }, 503);

  const SB = Deno.env.get("SUPABASE_URL")!, SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const gate = await fetch(`${SB}/rest/v1/rpc/photo_allow`, {
    method: "POST",
    headers: { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_code: code, p_device: device, p_max: DAILY }),
  });
  const ok = gate.ok ? await gate.json() : "server";
  if (ok !== "ok") return json({ error: ok }, ok === "limit" ? 429 : ok === "nolic" ? 403 : 500);

  const ai = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: type, data: image } },
          { type: "text", text: "قدّر الأكل اللي في الصورة." },
        ],
      }],
    }),
  });
  if (!ai.ok) { console.error("anthropic", ai.status, await ai.text()); return json({ error: "ai" }, 502); }
  const out = await ai.json();
  const text = (out.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n");
  const r = parse(text);
  if (!r) { console.error("parse", text.slice(0, 500)); return json({ error: "ai" }, 502); }
  if (r.food === false) return json({ food: false, items: [] });

  const items = (Array.isArray(r.items) ? r.items : []).slice(0, 12).map((it: any) => ({
    name: String(it.name || "أكل").slice(0, 60),
    grams: num(it.grams, 3000),
    kcal: num(it.kcal, 5000),
    protein: num(it.protein, 400),
    carbs: num(it.carbs, 800),
    fat: num(it.fat, 400),
  })).filter((it: any) => it.kcal > 0);
  return json({ food: items.length > 0, items, confidence: ["high", "medium", "low"].includes(r.confidence) ? r.confidence : "medium", note: String(r.note || "").slice(0, 160) });
});
