// Tiny zero-dependency test helpers shared by all FORMA tests.
const path = require("path");
const ROOT = path.resolve(process.env.FORMA_ROOT || path.join(__dirname, ".."));
let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log("  ok   " + name); }
  else { fail++; failures.push(name); console.log("  FAIL " + name + (detail ? "\n       " + detail : "")); }
}
function summary(label) { return { label, pass, fail, failures: failures.slice() }; }
function reset() { pass = 0; fail = 0; failures.length = 0; }
module.exports = { ROOT, check, summary, reset };
