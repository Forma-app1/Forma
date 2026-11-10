// يتأكد إن أرقام الأصناف ما تغيرت: node tools/fid-check.js  (أو --write بعد إضافة أصناف في FORMA_FOODS_ADD)
const fs=require("fs"),path=require("path"),crypto=require("crypto"),root=path.join(__dirname,"..");
const w={};new Function("window",fs.readFileSync(path.join(root,"foods.js"),"utf8"))(w);
const L=[];Object.keys(w.FORMA_FOODS).forEach(c=>w.FORMA_FOODS[c].forEach(r=>L.push(c+"|"+r[0]+"|"+r[1])));
(w.FORMA_FOODS_ADD||[]).forEach(([c,r])=>L.push(c+"|"+r[0]+"|"+r[1]));
const sha=n=>crypto.createHash("sha256").update(L.slice(0,n).join("\n")).digest("hex").slice(0,16);
const lp=path.join(__dirname,"fids.lock.json");
if(process.argv[2]==="--write"){
  if(fs.existsSync(lp)){const o=JSON.parse(fs.readFileSync(lp,"utf8"));if(L.length<o.n||sha(o.n)!==o.sha){console.error("مرفوض: الأصناف القديمة تغيرت");process.exit(1)}}
  fs.writeFileSync(lp,JSON.stringify({n:L.length,sha:sha(L.length)})+"\n");console.log("locked",L.length);process.exit(0)}
const o=JSON.parse(fs.readFileSync(lp,"utf8"));
if(L.length<o.n||sha(o.n)!==o.sha){console.error("خطأ: ترتيب الأصناف تغير. أرقام الأصناف بتخرب بيانات المستخدمين.");process.exit(1)}
console.log("ok",o.n,"frozen,",L.length-o.n,"new");
