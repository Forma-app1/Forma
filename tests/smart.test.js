// Unit tests for smart.js (voice/text food parsing and search). Pure node, no DOM.
const fs = require("fs"), path = require("path");
const { ROOT, check } = require("./lib");

function load() {
  const w = {};
  for (const f of ["foods.js", "smart.js"]) new Function("window", fs.readFileSync(path.join(ROOT, f), "utf8"))(w);
  // Same FOODS construction as app.js (fid = position). Keep in sync with app.js lines 6-16.
  const RAW = w.FORMA_FOODS, RESTS = w.FORMA_RESTAURANTS || [], F = [];
  Object.keys(RAW).forEach(cat => RAW[cat].forEach(r => {
    const store = RESTS.includes(cat) ? cat : (/الحطب/.test(r[0]) ? "الحطب" : /المراعي/.test(r[0]) ? "المراعي" : /ندى/.test(r[0]) ? "ندى" : null);
    F.push({ fid: "b" + F.length, n: r[0], cat, u: r[1], k: r[2], p: r[3], c: r[4], f: r[5], store });
  }));
  (w.FORMA_FOODS_ADD || []).forEach(([cat, r]) => F.push({ fid: "b" + F.length, n: r[0], cat, u: r[1], k: r[2], p: r[3], c: r[4], f: r[5], store: RESTS.includes(cat) ? cat : null }));
  const ctx = { foods: F, stores: [...RESTS, "الحطب", "المراعي", "ندى"], recent: [], lastAmt: {}, learned: {} };
  return { SAY: w.FORMA_SAY, ctx };
}

// [input, expected meal (undefined = don't care), [[name regex, amount], ...]]
const PARSE = [
  ["تغديت صحن كبسة دجاج", "غداء", [[/^كبسة دجاج$/, 350]]],
  ["فطرت ٣ بيض وخبز", "فطور", [[/^بيض/, 150], [/^خبز/, 60]]],
  ["اكلت 2 موز", null, [[/^موز$/, 240]]],
  ["شربت كوب حليب", null, [[/^حليب/, 240]]],
  ["تعشيت مندي لحم", "عشاء", [[/^مندي لحم$/, 300]]],
  ["بيج ماك", null, [[/^بيق ماك$/, 1]]],
  ["سكوب واي بروتين", null, [[/واي بروتين/, 30]]],
  ["قهوة عربية وتمر", null, [[/^قهوة عربية$/], [/^تمر$/]]],
  ["٢٠٠ جرام صدر دجاج", null, [[/^صدر دجاج/, 200]]],
  ["حبتين تمر", null, [[/^تمر$/, 16]]],
  ["نص صحن رز", null, [[/^رز/, 175]]],
  ["ستاربكس لاتيه", null, [[/لاتيه/]]],
  ["شوكولاتة ساخنة", null, [[/هوت شوكولاته/]]],   // 4.3.5 added hot chocolate; expected to resolve to it
];
const SEARCH = [
  ["كبسه", /^كبسة/],
  ["ماك", /ماك/],
  ["هوت شوكليت", /^هوت شوكولاته/],                  // spelling variant from 4.3.5
];

module.exports = function smartTests() {
  console.log("\n[smart.js unit]");
  const { SAY, ctx } = load();
  for (const [text, meal, want] of PARSE) {
    const r = SAY.parse(text, ctx), got = r.items.map(i => `${i.f.n}=${i.amt}`).join(", ");
    let ok = r.items.length === want.length && want.every(([re, amt], i) => re.test(r.items[i].f.n) && (amt == null || r.items[i].amt === amt));
    if (meal !== null && meal !== undefined) ok = ok && r.meal === meal;
    check(`parse "${text}"`, ok, `got meal=${r.meal} items=[${got}] miss=${JSON.stringify(r.miss)}`);
  }
  const junk = SAY.parse("xyzzy", ctx);
  check(`parse "xyzzy" -> no items, reported as miss`, junk.items.length === 0 && junk.miss.length === 1);
  for (const [text, re] of SEARCH) {
    const top = SAY.search(text, ctx).slice(0, 3).map(f => f.n);
    check(`search "${text}" top hit`, top.length && re.test(top[0]), "got " + top.join(" | "));
  }
  check("norm folds Arabic digits/hamza/taa marbuta", SAY.norm("أكلة ٣") === "اكله 3", SAY.norm("أكلة ٣"));
};
if (require.main === module) { module.exports(); process.exit(require("./lib").summary().fail ? 1 : 0); }
