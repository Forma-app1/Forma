// FORMA test runner: node tests/run.js [--no-browser]
// Env: FORMA_ROOT (repo root, default ..), BASE_REF (git ref to check the cache bump against).
const t0 = Date.now(), lib = require("./lib");
(async () => {
  const time = async (name, fn) => { const s = Date.now(); await fn(); console.log(`  (${name}: ${Date.now() - s} ms)`); };
  await time("release", require("./release-checks"));
  await time("unit", require("./smart.test"));
  if (!process.argv.includes("--no-browser")) await time("smoke", require("./smoke"));
  const s = lib.summary();
  console.log(`\n${s.fail ? "FAILED" : "PASSED"}: ${s.pass} passed, ${s.fail} failed in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (s.fail) console.log("failures:\n - " + s.failures.join("\n - "));
  process.exit(s.fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
