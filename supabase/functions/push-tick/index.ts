// FORMA: يرسل التنبيهات اليومية (وزن الصبح، الماء، تسجيل الأكل).
// يشتغل كل 15 دقيقة من pg_cron. ينشر بدون JWT (verify_jwt=false): أي نداء يرسل بس اللي جا وقته، مرة وحدة باليوم لكل نوع.
// مفاتيح VAPID تنولد أول مرة وتنحفظ في push_keys (مقفل، الخدمة بس توصله).
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const APP = "https://forma-app1.github.io/Forma/";

/* الوقت بتوقيت الرياض: [ساعة، دقيقة] */
const SLOTS: Record<string, [number, number]> = { weigh: [7, 30], water: [14, 0], food: [21, 0] };
const MSG: Record<string, { title: string; body: string[]; go: string }> = {
  weigh: { title: "صباح الخير", go: "weight", body: ["اوزن نفسك قبل الفطور. ثواني وتخلص.", "وزن الصبح يعطيك أدق رقم. سجّله الحين.", "قبل الأكل والموية: وقت الميزان."] },
  water: { title: "كوب ماء؟", go: "today", body: ["نص اليوم راح. اشرب كوب ماء وسجّله.", "العطش أحيانا يحس مثل الجوع. كوب ماء الحين.", "قارورة جنبك؟ كوب واحد ويقرب هدفك."] },
  food: { title: "سجّلت أكلك؟", go: "food", body: ["دقيقة وتكون أرقام اليوم صح.", "اكتب وش أكلت بجملة وحدة، وفورما يحسبه.", "باقي لك بروتين اليوم؟ شيّك قبل تنام."] },
};

async function keys() {
  const { data } = await db.from("push_keys").select("pub,priv").eq("id", 1).maybeSingle();
  if (data) return data;
  const k = webpush.generateVAPIDKeys();
  await db.from("push_keys").insert({ id: 1, pub: k.publicKey, priv: k.privateKey });
  const again = await db.from("push_keys").select("pub,priv").eq("id", 1).single();
  return again.data!;
}

function riyadh() {
  const d = new Date(Date.now() + 3 * 3600e3);
  return { day: d.toISOString().slice(0, 10), min: d.getUTCHours() * 60 + d.getUTCMinutes(), dayNum: Math.floor(d.getTime() / 864e5) };
}

async function send(sub: any, kind: string, dayNum: number) {
  const m = MSG[kind];
  const payload = JSON.stringify({ title: m.title, body: m.body[dayNum % m.body.length], url: APP + "?go=" + m.go, tag: "forma-" + kind });
  try {
    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, { TTL: 3 * 3600, urgency: "normal" });
    return "ok";
  } catch (e: any) {
    const code = e && e.statusCode;
    if (code === 404 || code === 410) { await db.from("push_subs").delete().eq("endpoint", sub.endpoint); return "gone"; }
    console.log("push fail", code);
    return "fail";
  }
}

Deno.serve(async (req) => {
  const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const k = await keys();
  webpush.setVapidDetails("mailto:formafitsa@gmail.com", k.pub, k.priv);
  const t = riyadh();
  const body = await req.json().catch(() => ({}));

  /* تجربة: يرسل تنبيه واحد لاشتراك محدد، مرة كل دقيقة بالكثير */
  if (body && typeof body.test === "string") {
    const { data: s } = await db.from("push_subs").select("*").eq("endpoint", body.test).maybeSingle();
    if (!s) return Response.json({ err: "nosub" }, { headers: cors });
    const last = Number((s.last_sent || {}).test || 0);
    if (Date.now() - last < 60e3) return Response.json({ err: "wait" }, { headers: cors });
    await db.from("push_subs").update({ last_sent: { ...(s.last_sent || {}), test: Date.now() } }).eq("endpoint", s.endpoint);
    const payload = JSON.stringify({ title: "FORMA", body: "التنبيهات شغالة. نذكرك بالوزن والماء والأكل بأوقاتها.", url: APP, tag: "forma-test" });
    try { await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 600 }); return Response.json({ ok: true }, { headers: cors }); }
    catch (e: any) { return Response.json({ err: "send", code: e && e.statusCode }, { headers: cors }); }
  }

  /* الأنواع اللي جا وقتها (خلال 3 ساعات من موعدها عشان لو فات نداء) */
  const due = Object.entries(SLOTS).filter(([, [h, m]]) => t.min >= h * 60 + m && t.min < h * 60 + m + 180).map(([kind]) => kind);
  let sent = 0, gone = 0;
  for (const kind of due) {
    let from = 0;
    for (;;) {
      const { data: subs } = await db.from("push_subs").select("*").order("endpoint").range(from, from + 499);
      if (!subs || !subs.length) break;
      for (const s of subs) {
        if (!(s.prefs || {})[kind]) continue;
        if ((s.last_sent || {})[kind] === t.day) continue;
        const r = await send(s, kind, t.dayNum);
        if (r === "gone") { gone++; continue; }
        if (r === "ok") sent++;
        await db.from("push_subs").update({ last_sent: { ...(s.last_sent || {}), [kind]: t.day } }).eq("endpoint", s.endpoint);
      }
      if (subs.length < 500) break;
      from += 500;
    }
  }
  return Response.json({ due, sent, gone }, { headers: cors });
});
