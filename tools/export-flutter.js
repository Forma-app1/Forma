// يصدّر قاعدة الأكل من foods.js إلى flutter_app/assets/foods.json بنفس ترتيب الأرقام (fid)
// الاستخدام: node tools/export-flutter.js
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"foods.js"),"utf8"),ctx);
const W=ctx.window,RAW=W.FORMA_FOODS||{},RESTS=W.FORMA_RESTAURANTS||[],SOURCES=W.FORMA_SOURCES||{};
const foods=[];
Object.keys(RAW).forEach(cat=>RAW[cat].forEach(r=>{
  const store=RESTS.includes(cat)?cat:(/الحطب/.test(r[0])?"الحطب":/المراعي/.test(r[0])?"المراعي":/ندى/.test(r[0])?"ندى":null);
  foods.push([r[0],cat,r[1],r[2],r[3],r[4],r[5],store]);
}));
(W.FORMA_FOODS_ADD||[]).forEach(([cat,r])=>foods.push([r[0],cat,r[1],r[2],r[3],r[4],r[5],RESTS.includes(cat)?cat:null]));
const est=W.FORMA_EST||[];
const estStores=Object.keys(SOURCES).filter(s=>!String((SOURCES[s]||[])[1]||"").startsWith("رسمي"));
const out={v:1,foods,cats:Object.keys(RAW),rests:RESTS,est,estStores};
fs.writeFileSync(path.join(root,"flutter_app/assets/foods.json"),JSON.stringify(out));
console.log("foods:",foods.length,"cats:",out.cats.length,"rests:",RESTS.length);
