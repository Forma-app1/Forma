// Release checks: shared app files, cache bump, frozen food ids, syntax, referenced files exist.
// BASE_REF (e.g. origin/main or a commit sha) enables the "cache was bumped" check.
const fs = require("fs"), path = require("path"), vm = require("vm"), cp = require("child_process");
const { ROOT, check } = require("./lib");
const rd = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = p => fs.existsSync(path.join(ROOT, p));
const git = args => cp.execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

module.exports = function releaseChecks() {
  console.log("\n[release checks] root=" + ROOT);

  // 1. jawad/ uses the shared app.js and plus.css (one source of truth, no copies)
  const jh = rd("jawad/index.html");
  check("jawad/index.html loads ../app.js", jh.includes('src="../app.js"'));
  check("jawad/index.html loads ../plus.css", jh.includes('href="../plus.css"'));
  for (const f of ["app.js", "plus.css"]) check(`no stale copy jawad/${f}`, !fs.existsSync(path.join(ROOT, "jawad", f)));

  // 2. cache strings parse and carry the same version
  const cacheOf = src => (src.match(/const CACHE="([^"]+)"/) || [])[1];
  const cRoot = cacheOf(rd("sw.js")), cJ = cacheOf(rd("jawad/sw.js"));
  check("sw.js CACHE found", !!cRoot, cRoot);
  check("jawad/sw.js CACHE found", !!cJ, cJ);
  const ver = c => c && c.replace(/^forma-(j-)?v/, "");
  check(`CACHE versions match (${cRoot} / ${cJ})`, ver(cRoot) && ver(cRoot) === ver(cJ));

  // 3. cache bumped vs base, if anything shipped changed
  const base = process.env.BASE_REF;
  if (base) {
    let changed = [];
    try { changed = git(["diff", "--name-only", base, "--"]).split("\n").filter(Boolean); } catch (e) { console.log("  skip cache-bump: cannot diff against " + base); }
    const shipped = changed.filter(f => !/^(tests|tools|supabase|\.github)\/|\.md$/.test(f));
    if (shipped.length) {
      let old = {};
      try { old.root = cacheOf(git(["show", base + ":sw.js"])); old.j = cacheOf(git(["show", base + ":jawad/sw.js"])); } catch (e) {}
      check(`sw.js CACHE bumped (${old.root} -> ${cRoot})`, old.root !== cRoot, "changed: " + shipped.join(", "));
      check(`jawad/sw.js CACHE bumped (${old.j} -> ${cJ})`, old.j !== cJ);
    } else console.log("  skip cache-bump: no shipped files differ from " + base);
  } else console.log("  skip cache-bump: BASE_REF not set");

  // 4. frozen food id order (existing tool)
  const r = cp.spawnSync(process.execPath, [path.join(ROOT, "tools/fid-check.js")], { encoding: "utf8" });
  check("tools/fid-check.js passes", r.status === 0, (r.stdout + r.stderr).trim());

  // 5. every JS file compiles
  const jsFiles = ["app.js", "gate.js", "foods.js", "programs.js", "smart.js", "sw.js", "jawad/config.js", "jawad/sw.js"]
    .concat(fs.readdirSync(path.join(ROOT, "lib")).filter(f => f.endsWith(".js")).map(f => "lib/" + f));
  for (const f of jsFiles) {
    let err = null; try { new vm.Script(rd(f), { filename: f }); } catch (e) { err = e.message; }
    check("syntax " + f, !err, err);
  }

  // 6. every service-worker SHELL entry exists (a 404 here makes sw install fail = no offline)
  for (const sw of ["sw.js", "jawad/sw.js"]) {
    const shell = JSON.parse((rd(sw).match(/const SHELL=(\[[^\]]*\])/) || [, "[]"])[1]);
    const dir = path.dirname(sw);
    const missing = shell.filter(p => p !== "./" && !exists(path.join(dir, p)));
    check(`${sw} SHELL files exist (${shell.length})`, shell.length && !missing.length, "missing: " + missing.join(", "));
  }

  // 7. every local <script src>/<link href> in both index.html exists
  for (const html of ["index.html", "jawad/index.html"]) {
    const refs = [...rd(html).matchAll(/(?:src|href)="([^"#?]+)"/g)].map(m => m[1]).filter(u => !/^(https?:|data:|mailto:)/.test(u));
    const missing = refs.filter(u => !exists(path.join(path.dirname(html), u)));
    check(`${html} local references exist (${refs.length})`, !missing.length, "missing: " + missing.join(", "));
  }

  // 8. warn (not fail) about the gate's free-period deadline
  const fu = (rd("gate.js").match(/FREE_UNTIL=Date\.parse\("([^"]+)"\)/) || [])[1];
  if (fu) { const d = (Date.parse(fu) - Date.now()) / 864e5; if (d < 7) console.log(`  WARN gate.js FREE_UNTIL ${fu} is ${d < 0 ? "past" : "in " + d.toFixed(1) + " days"}`); }
};
if (require.main === module) { module.exports(); const s = require("./lib").summary(); process.exit(s.fail ? 1 : 0); }
