/* FORMA 2 */
(function(){
"use strict";

/* ===== البيانات ===== */
const RAW=window.FORMA_FOODS||{},SOURCES=window.FORMA_SOURCES||{},RESTS=window.FORMA_RESTAURANTS||[];
const FOODS=[];
Object.keys(RAW).forEach(cat=>RAW[cat].forEach(r=>{
  const store=RESTS.includes(cat)?cat:(/الحطب/.test(r[0])?"الحطب":/المراعي/.test(r[0])?"المراعي":/ندى/.test(r[0])?"ندى":null);
  FOODS.push({fid:"b"+FOODS.length,n:r[0],cat,u:r[1],k:r[2],p:r[3],c:r[4],f:r[5],store});
}));
/* مهم: رقم الصنف (fid) هو ترتيبه في القائمة، وبيانات المستخدمين مربوطة فيه.
   أصناف foods.js الأساسية مجمّدة: لا تضيف ولا تحذف ولا ترتب فيها.
   أي صنف جديد ينضاف في آخر FORMA_FOODS_ADD فقط (شوف آخر foods.js). */
(window.FORMA_FOODS_ADD||[]).forEach(([cat,r])=>{if(!RAW[cat])RAW[cat]=[];
  FOODS.push({fid:"b"+FOODS.length,n:r[0],cat,u:r[1],k:r[2],p:r[3],c:r[4],f:r[5],store:RESTS.includes(cat)?cat:null})});
const CATS=Object.keys(RAW);
const PROGRAMS=window.FORMA_PROGRAMS||{},DEFP=(window.FORMA_CONFIG&&window.FORMA_CONFIG.defaultProg&&(window.FORMA_PROGRAMS||{})[window.FORMA_CONFIG.defaultProg])?window.FORMA_CONFIG.defaultProg:"fb4",PORDER=window.FORMA_PROGRAM_ORDER||Object.keys(PROGRAMS),ALTS=window.FORMA_ALTS||{},PLAN=window.FORMA_PLAN||{};
const MEALS=["فطور","غداء","عشاء","سناك"];
const ACT=[["خامل","شغل مكتبي، بدون رياضة",1.2],["خفيف","تمرين 1-3 أيام",1.375],["متوسط","تمرين 3-5 أيام",1.55],["عالي","تمرين 6-7 أيام أو شغل بدني",1.725]];
const GOALS=[["خسارة دهون","نزول 0.5-1% بالأسبوع"],["ثبات","تحافظ على وزنك"],["زيادة عضل","زيادة بطيئة ونظيفة"]];
const TIPS=[
"البروتين أول شي في صحنك. إذا قفلته، أغلب شغل اليوم خلص.",
"فوّت تمرين؟ عادي. الجلسة الجاية تنتظرك بنفس مكانها.",
"زد كيلو أو عدة وحدة عن آخر مرة. هذا التقدم كله.",
"الميزان يتغير يوميا بسبب الماء والملح. صدّق متوسط الأسبوع.",
"نومك 7 ساعات يرفع أداءك في الجيم أكثر من أي مكمّل.",
"عندك عزيمة الليلة؟ سجّلها من الحين ورتّب باقي يومك عليها.",
"اللي يوصل مو الأقوى، اللي ما يقطع. حافظ على أيامك.",
"كوب ماء قبل كل وجبة. سهلة وتفرق.",
"أكلت زيادة أمس؟ لا تجوّع نفسك اليوم. ارجع لخطتك من الوجبة الجاية.",
"العضلة تكبر وقت الراحة. يوم الراحة جزء من البرنامج.",
"التزامك 80% لمدة سنة أحسن من 100% لمدة أسبوعين.",
"صوّر نفسك كل أسبوعين بنفس الإضاءة. الصورة تبين اللي الميزان ما يبينه.",
"آخر مجموعة في تمارين العزل كمّلها للفشل. الباقي وقّف قبل الفشل بعدة أو عدتين.",
"مشيك اليومي يحرق أكثر من ما تتوقع. حاول توصل 7 آلاف خطوة."
];
const yt=n=>"https://www.youtube.com/results?search_query="+encodeURIComponent("Jeff Nippard "+n+" form");

/* ===== أدوات ===== */
const pad=n=>String(n).padStart(2,"0");
const key=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const parseKey=k=>new Date(k+"T12:00:00");
const today=()=>key(new Date());
const daysBetween=(a,b)=>Math.round((parseKey(b)-parseKey(a))/864e5);
const fmt=n=>Math.round(n||0).toLocaleString("en-US");
const r1=n=>Math.round((n||0)*10)/10;
const r5=n=>Math.round(n/5)*5;
const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const dateAr=k=>{try{return parseKey(k).toLocaleDateString("ar-u-nu-latn",{day:"numeric",month:"long"})}catch(e){return k}};
function toast(msg){document.querySelectorAll(".toast").forEach(t=>t.remove());const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}
const ICON={
flame:'<svg viewBox="0 0 24 24" aria-hidden="true"><path class="flame" d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z"/></svg>',
mic:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
scan:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><path d="M8 8v8M11 8v8M13.5 8v8M16 8v8"/></svg>',
chart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5h16"/><path d="M6 15.5l4-5 3 3 5-6.5"/></svg>',
share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M6 12v6.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V12"/></svg>',
search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
camera:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/></svg>',
spark:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
gear:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};

/* ===== الحالة ===== */
const CFG=window.FORMA_CONFIG||{};
const STORE=CFG.store||"forma-v2";
/* طبقة الجهاز والسحابة (lib/). لو ما تحملت، التطبيق يشتغل محلي عادي */
const PF=window.FORMA_PLATFORM||{loadJSON:k=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}},saveJSON:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}},haptic:()=>{},reducedMotion:()=>false};
const CL=window.FORMA_CLOUD||null,COACH=window.FORMA_COACH||null;
let S=PF.loadJSON(STORE);
if(!S||typeof S!=="object")S={};
function normalize(){
  S.days=S.days||{};S.recent=S.recent||[];S.custom=S.custom||[];S.meals=S.meals||[];S.history=S.history||[];
  S.sessionIdx=S.sessionIdx||0;S.swaps=S.swaps||{};S.edits=S.edits||{};S.adj=S.adj||0;S.codes=S.codes||{};S.exNotes=S.exNotes||{};
  S.prog=(PROGRAMS[S.prog]||(S.prog==="mine"&&S.mine))?S.prog:DEFP;
  if(CFG.seed&&S.seeded!==(CFG.seedVer||true)){S.history=S.history.filter(h=>!(h.seed||(CFG.seedBefore&&h.prog===DEFP&&h.date<CFG.seedBefore)));S.history=CFG.seed.map(h=>({...h,seed:true})).concat(S.history);S.seeded=CFG.seedVer||true;if(CFG.progStart&&S.prog===DEFP&&S.profile)S.progStart=CFG.progStart}
}
/* إصلاح 4.3.1: تحديث 9 نوفمبر (8 مساء) أضاف أصناف في نص القائمة، فتغيرت أرقام الأصناف اللي بعدها
   وصارت التسجيلات القديمة تشير لأصناف غلط. هنا نرجّع كل تسجيل قديم لصنفه الصحيح. يشتغل مرة وحدة. */
let fidDirty=false;
function fixFids(){
  if(S.fidFix)return false;S.fidFix=1;
  const CUT="2026-11-09",SH=[[131,5],[179,8],[230,13],[323,30]];
  const isB=x=>typeof x==="string"&&/^b\d+$/.test(x);
  const up=x=>{if(!isB(x))return x;const i=+x.slice(1);let s=0;SH.forEach(([a,b])=>{if(i>=a)s=b});return s?"b"+(i+s):x};
  const fd=x=>FOODS[+x.slice(1)];
  /* كمية منطقية للصنف؟ الجرامات أرقام كبيرة، والحبات أرقام صغيرة */
  const ok=(x,amt)=>{const f=fd(x);if(!f||!(amt>0))return false;return f.u==="g"?amt>12:amt<=12};
  let ch=false,est=false,any=false;
  const ks=Object.keys(S.days||{}).sort();
  /* قبل يوم التحديث: كله مسجل بالأرقام القديمة */
  ks.forEach(k=>{if(k>=CUT)return;(S.days[k].food||[]).forEach(e=>{if(!isB(e.fid))return;est=true;const n=up(e.fid);if(n!==e.fid){e.fid=n;ch=true}})});
  /* يوم التحديث نفسه: اللي قبل 8 مساء قديم واللي بعده جديد. نعرفه من الكمية، وبعدها من الترتيب والوجبة */
  let st="old";((S.days[CUT]||{}).food||[]).forEach(e=>{if(!isB(e.fid))return;any=true;const n=up(e.fid);if(n===e.fid)return;
    const a=ok(e.fid,e.amt),b=ok(n,e.amt);let isNew;
    if(a&&!b)isNew=true;else if(b&&!a)isNew=false;else isNew=st==="new"||e.meal==="عشاء";
    if(isNew)st="new";else{e.fid=n;ch=true}});
  if(!est&&!any)return false;
  const pk=(x,amt)=>{const n=up(x);if(est||n===x)return n;const a=ok(x,amt),b=ok(n,amt);return b&&!a?n:x};
  (S.meals||[]).forEach(ml=>(ml.items||[]).forEach(it=>{if(isB(it.fid)){const n=pk(it.fid,it.amt);if(n!==it.fid){it.fid=n;ch=true}}}));
  if(S.lastAmt){const o={};Object.keys(S.lastAmt).forEach(x=>{const n=isB(x)?pk(x,S.lastAmt[x]):x;if(n!==x)ch=true;if(o[n]==null)o[n]=S.lastAmt[x]});S.lastAmt=o}
  if(est&&S.learned)Object.keys(S.learned).forEach(q=>{const n=up(S.learned[q]);if(n!==S.learned[q]){S.learned[q]=n;ch=true}});
  /* الأخيرة: نبنيها من جديد من آخر الأيام */
  if(ch||est){const rc=[];ks.slice().reverse().forEach(k=>{(S.days[k].food||[]).slice().reverse().forEach(e=>{if(e.fid&&rc.length<12&&!rc.includes(e.fid))rc.push(e.fid)})});
    if(rc.join()!==(S.recent||[]).join()){S.recent=rc;ch=true}}
  return ch;
}
function normalizeFix(){if(fixFids()){S._ts=Date.now();fidDirty=true}}
normalize();normalizeFix();
function saveLocal(){if(!PF.saveJSON(STORE,S))toast("ما قدرنا نحفظ. تأكد إن التخزين مفعّل في المتصفح")}
function save(){S._ts=Date.now();saveLocal();if(CL)CL.sync.changed();pingUsage()}
const day=k=>(S.days[k]=S.days[k]||{food:[],weight:null});
/* عداد الاستخدام: يرسل مرة باليوم، ويتحدث لو سجّل أكل أو تمرين. النسخة الخاصة ما ترسل */
const VER="4.3.3";
function pingUsage(){
  if(!CL||!CL.ping||CFG.store)return;
  try{if(navigator.onLine===false)return;
    const T=key(new Date()),d=S.days[T]||{},o={prof:!!S.profile,food:!!(d.food||[]).length,train:!!d.trained};
    const sig=[T,+!!CL.code(),+o.prof,+o.food,+o.train].join("");
    if(PF.loadJSON("forma_ping")===sig)return;
    PF.saveJSON("forma_ping",sig);
    const ua=navigator.userAgent||"";
    o.os=/iPhone|iPad|iPod/.test(ua)?"ios":/Android/.test(ua)?"android":"web";
    o.pwa=window.navigator.standalone===true||!!(window.matchMedia&&matchMedia("(display-mode: standalone)").matches);
    o.ver=VER;CL.ping(o)}catch(e){}
}

/* ===== حساب الأهداف =====
   الطاقة: معادلة Mifflin-St Jeor × مستوى النشاط
   خسارة: عجز 20% محصور بين 0.5% و 1% من الوزن بالأسبوع
   زيادة: فائض 10% بحد أقصى 350 سعرة
   البروتين: 1.6 جم/كغ (وزن مرجعي عند مؤشر كتلة 30 وفوق)
   الدهون: 25% من السعرات وما تقل عن 0.6 جم/كغ، والباقي كارب */
function targets(p,adj){
  const hM=p.h/100,bmi=p.w/(hM*hM),ref=bmi>=30?27*hM*hM:p.w;
  const bmr=10*p.w+6.25*p.h-5*p.age+(p.sex==="أنثى"?-161:5);
  const tdee=bmr*ACT[p.act][2];
  let kcal=tdee;
  if(p.goal===0)kcal=tdee-clamp(0.2*tdee,0.005*p.w*1100,0.01*p.w*1100);
  else if(p.goal===2)kcal=tdee+Math.min(0.1*tdee,350);
  if(p.customKcal)kcal=p.customKcal;
  kcal+=adj||0;
  kcal=Math.max(kcal,p.sex==="أنثى"?1200:1500);
  kcal=Math.round(kcal/50)*50;
  const pr=r5(1.6*ref);
  const fat=r5(Math.max(0.25*kcal/9,0.6*p.w));
  const carb=Math.max(0,r5((kcal-pr*4-fat*9)/4));
  return {kcal,p:pr,c:carb,f:fat,tdee:Math.round(tdee),bmr:Math.round(bmr),bmi:r1(bmi),ref:r1(ref)};
}
const G=()=>targets(S.profile,S.adj);

/* ===== الأكل ===== */
function getFood(fid){if(!fid)return null;return fid[0]==="b"?FOODS[+fid.slice(1)]:S.custom[+fid.slice(1)]}
const eFood=e=>e.x||getFood(e.fid)||{n:"صنف محذوف",u:"pc",k:0,p:0,c:0,f:0};
const factor=(f,amt)=>f.u==="g"?amt/100:amt;
const amtLabel=(f,amt)=>f.u==="g"?`${fmt(amt)} جم`:f.u==="sp"?(amt===0.5?"نص ملعقة":amt===1?"ملعقة":amt===2?"ملعقتين":`${amt} ملاعق`):(amt===0.5?"نص حبة":amt===1?"حبة":amt===2?"حبتين":`${amt} حبات`);
function macrosOf(f,amt){const m=factor(f,amt);return {k:(f.k||0)*m,p:(f.p||0)*m,c:(f.c||0)*m,f:(f.f||0)*m}}
function totals(k){const t={k:0,p:0,c:0,f:0};(S.days[k]?.food||[]).forEach(e=>{const m=macrosOf(eFood(e),e.amt);t.k+=m.k;t.p+=m.p;t.c+=m.c;t.f+=m.f});return t}
const foodName=f=>f.store&&RESTS.includes(f.store)&&!f.n.includes(f.store)?f.n:f.n;
const foodSub=f=>{const unit=f.u==="g"?"لكل 100 جم":f.u==="sp"?"للملعقة":"للحبة";return `${f.store&&RESTS.includes(f.store)?f.store+" · ":""}${fmt(f.k)} سعرة ${unit}`};
function srcTag(f){if(f.code)return `<span class="pill mute">من الباركود</span>`;const s=f.store&&SOURCES[f.store];if(!s)return "";const off=s[1].startsWith("رسمي");return `<span class="pill ${off?"":"mute"}">${off?"قيم رسمية":"قيم تقديرية"}</span>`}

/* ===== الأيام والسلسلة ===== */
const active=k=>!!(S.days[k]&&((S.days[k].food||[]).length||S.days[k].trained));
function streak(){let n=0,d=new Date();if(!active(key(d)))d=addDays(d,-1);while(active(key(d))){n++;d=addDays(d,-1)}return n}
function weightsSorted(){return Object.keys(S.days).sort().filter(k=>S.days[k].weight).map(k=>[k,S.days[k].weight])}
function avgWindow(endKey,len){const ws=[];for(let i=0;i<len;i++){const w=S.days[key(addDays(parseKey(endKey),-i))]?.weight;if(w)ws.push(w)}return ws.length?{avg:ws.reduce((a,b)=>a+b,0)/ws.length,n:ws.length}:null}
function trend(){
  const T=today(),a=avgWindow(T,7),b=avgWindow(key(addDays(parseKey(T),-7)),7);
  if(!a||!b||a.n<3||b.n<3)return null;
  return {kgWeek:a.avg-b.avg,pct:(a.avg-b.avg)/b.avg*100,avg:a.avg};
}
function currentWeight(){const a=avgWindow(today(),7);if(a)return a.avg;const ws=weightsSorted();return ws.length?ws[ws.length-1][1]:S.profile.w}

/* المراجعة الأسبوعية: تعدل السعرات حسب نزولك أو زيادتك الفعلية */
function weeklyReview(){
  const p=S.profile;if(!p.start)return null;
  if(daysBetween(p.start,today())<14)return null;
  if(S.lastReview&&daysBetween(S.lastReview,today())<7)return null;
  const t=trend();if(!t)return null;
  const pct=t.pct;let delta=0,msg="";
  if(p.goal===0){
    if(pct>-0.25){delta=-150;msg=`وزنك ${pct>0?"زاد":"نزل"} ${Math.abs(r1(t.kgWeek))} كغ هالأسبوع، أبطأ من المطلوب. ننزّل سعراتك 150.`}
    else if(pct<-1.2){delta=150;msg=`نزلت ${Math.abs(r1(t.kgWeek))} كغ، أسرع من اللازم وممكن تخسر عضل. نزيد سعراتك 150.`}
    else msg=`نزلت ${Math.abs(r1(t.kgWeek))} كغ هالأسبوع (${Math.abs(r1(pct))}%). نزولك مثالي، كمّل على نفس الخطة.`;
  }else if(p.goal===2){
    if(pct<0.1){delta=100;msg="وزنك ثابت تقريبا. نزيد سعراتك 100 عشان تبني."}
    else if(pct>0.5){delta=-100;msg=`زدت ${r1(t.kgWeek)} كغ، أسرع من اللازم وأغلبه دهون. ننزّل 100 سعرة.`}
    else msg=`زدت ${r1(t.kgWeek)} كغ هالأسبوع. زيادة نظيفة، كمّل.`;
  }else{
    if(pct>0.35){delta=-100;msg="وزنك يزيد. ننزّل سعراتك 100 عشان تثبت."}
    else if(pct<-0.35){delta=100;msg="وزنك ينزل. نزيد سعراتك 100 عشان تثبت."}
    else msg="وزنك ثابت. كمّل على نفس الخطة.";
  }
  return {delta,msg,pct};
}

/* ===== البرنامج ===== */
const getProg=k=>{
  if(k==="mine")return S.mine?{name:"Custom",ar:S.mine.name||"جدولي",days:S.mine.sessions.length,weeks:S.mine.weeks||8,sessions:S.mine.sessions,mine:true}:null;
  const b=PROGRAMS[k];if(!b)return null;const ed=S.edits[k];
  return ed?{...b,sessions:ed,days:ed.length,edited:true}:b;
};
const prog=()=>getProg(S.prog);
const progList=()=>[...PORDER,...(S.mine?["mine"]:[])];
const progOpt=(k,attrs)=>{const p=getProg(k);return `<button type="button" class="prog-opt" ${attrs} aria-pressed="${(ob&&tab==="setup"?ob.prog:S.prog)===k}"><span>${esc(p.ar)}<small>${dL(p.days)} بالأسبوع · ${wkL(p.weeks)}${p.edited?" · معدّل":""}</small></span><span class="num" style="font-size:12px;opacity:.7" dir="ltr">${esc(p.name)}</span></button>`};
const wkL=n=>n+(n>=3&&n<=10?" أسابيع":" أسبوع");
const dL=n=>n==1?"يوم واحد":n==2?"يومين":n+(n<=10?" أيام":" يوم");
const sName=n=>n.length<=1?"اليوم "+n:n;
const sessIdx=()=>S.sessionIdx%prog().sessions.length;
const exName=(si,i)=>{const sw=S.swaps[S.prog]||{};return sw[si+"|"+i]||prog().sessions[si].ex[i][0]};
function lastFor(ex){for(let i=S.history.length-1;i>=0;i--){const h=S.history[i];if(h.sets&&h.sets[ex])return h.sets[ex]}return null}
function bestFor(ex){let b=0;S.history.forEach(h=>(h.sets?.[ex]||[]).forEach(s=>{if(s[0]>b)b=s[0]}));return b}
const progDone=()=>S.history.filter(h=>h.prog===S.prog&&(!S.progStart||h.date>=S.progStart)).length;
const progTotal=()=>prog().weeks*prog().days;

/* ===== التثبيت ===== */
const isStandalone=()=>window.navigator.standalone===true||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches);
const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
let deferredPrompt=null,tab="today",wEdit=false;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;if(tab==="today"||tab==="setup")render()});
window.addEventListener("appinstalled",()=>{deferredPrompt=null;toast("انثبّت FORMA. افتحه من الأيقونة");render()});
const UA=navigator.userAgent,isAndroid=/Android/i.test(UA);
const inApp=/FBAN|FBAV|FB_IAB|Instagram|BytedanceWebview|musical_ly|TikTok|Snapchat|Twitter|LinkedInApp|Line\/|GSA\/|Telegram/i.test(UA);
const iosOther=isIOS&&/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/i.test(UA);
/* وش نوع التثبيت المناسب لهذا الجهاز */
function instKind(){if(isStandalone())return"";if(inApp&&(isIOS||isAndroid))return"inapp";if(isIOS)return iosOther?"ios-other":"ios";if(deferredPrompt)return"prompt";if(isAndroid)return"android";return""}
const instGet=k=>{try{return+localStorage.getItem("forma-inst-"+k)||0}catch(e){return 0}};
const instSet=k=>{try{localStorage.setItem("forma-inst-"+k,String(Date.now()))}catch(e){}};
/* النسخة العامة: اللي ما فعّل يثبت التطبيق أول، والكود يكتبه داخل التطبيق (مو في سفاري) */
const mustInstall=()=>!!document.querySelector('script[src="gate.js"]')&&!localStorage.getItem("forma_lic");
const needGate=()=>{const k=instKind();return !!k&&(k!=="prompt"||isAndroid)&&(!instGet("skip")||mustInstall())};
const IIC={
  share:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>`,
  dots:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>`,
  vdots:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>`,
  app:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>`,
  book:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/></svg>`,
  tabs:`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="13" height="13" rx="3"/><path d="M4 16V6a2 2 0 0 1 2-2h10"/></svg>`
};
/* سفاري 26 نقل زر المشاركة داخل ⋯ جنب الرابط. نعرف الإصدار من Version/ لأن رقم النظام صار ثابت في UA */
const safariVer=+((UA.match(/Version\/(\d+)/)||[])[1]||0);
const ios26=isIOS&&safariVer>=26;
/* لغة الجوال عربي: واجهة سفاري معكوسة، فزر ⋯ يصير يسار */
const sysRTL=/^ar|^he|^fa|^ur/i.test(navigator.language||"");
/* رسومات صغيرة تشبه شاشة الجوال، والزر المطلوب منوّر */
const MK={
  bar26:()=>`<div class="mk mk-bar" dir="${sysRTL?"rtl":"ltr"}"><span class="mk-url"><i>‹</i>forma-app1.github.io</span><span class="mk-dot hot">⋯</span></div>`,
  bar18:()=>`<div class="mk mk-tb" dir="${sysRTL?"rtl":"ltr"}"><i>‹</i><i>›</i><i class="hot">${IIC.share}</i><i>${IIC.book}</i><i>${IIC.tabs}</i></div>`,
  barTop:()=>`<div class="mk mk-bar" dir="${sysRTL?"rtl":"ltr"}"><span class="mk-url">forma-app1.github.io</span><span class="mk-dot hot">${IIC.share}</span></div>`,
  menu:()=>`<div class="mk mk-list"><div>نسخ</div><div class="hot">${IIC.share}<span>مشاركة<small>Share</small></span></div><div>إضافة إلى المفضلة</div></div>`,
  sheet:()=>`<div class="mk mk-list"><div>نسخ</div><div>إضافة إلى قائمة القراءة</div><div class="hot">${IIC.plus}<span>إضافة إلى الشاشة الرئيسية<small>Add to Home Screen</small></span></div><div class="mk-more">عرض المزيد ⌄</div></div>`,
  add:(ico,web)=>`<div class="mk mk-add" dir="${sysRTL?"rtl":"ltr"}"><div class="mk-top"><span>إلغاء</span><b>إضافة إلى الشاشة الرئيسية</b><span class="hot">إضافة</span></div><div class="mk-app"><img src="${ico}" alt="" width="34" height="34"><span>FORMA</span></div>${web?`<div class="mk-sw"><span>فتح كتطبيق ويب<small>Open as Web App</small></span><i class="on"></i></div>`:""}</div>`,
  inapp:()=>`<div class="mk mk-bar" dir="${sysRTL?"rtl":"ltr"}"><span class="mk-dot">✕</span><span class="mk-url">forma-app1.github.io</span><span class="mk-dot hot">${isIOS?"⋯":"⋮"}</span></div>`,
  open:()=>`<div class="mk mk-list"><div>نسخ الرابط</div><div class="hot">${IIC.share}<span>فتح في ${isIOS?"Safari":"Chrome"}<small>Open in ${isIOS?"Safari":"browser"}</small></span></div></div>`,
  andMenu:()=>`<div class="mk mk-list"><div>علامة جديدة</div><div class="hot">${IIC.plus}<span>تثبيت التطبيق<small>Install app</small></span></div><div>مشاركة</div></div>`
};
function instSteps(k){
  const ico=(document.querySelector('link[rel="apple-touch-icon"]')||{}).href||"apple-touch-icon.png";
  const st=(n,t,mk)=>`<li class="ins-st"><div class="ins-h"><span class="ins-n num">${n}</span><span>${t}</span></div>${mk||""}</li>`;
  const done=n=>st(n,"افتح <b>FORMA</b> من الأيقونة اللي على شاشتك");
  if(k==="inapp")return `<ol class="ins-steps">${st(1,`أنت فاتح الرابط من داخل تطبيق، والتثبيت ما يشتغل منه. اضغط <b>${isIOS?"⋯":"⋮"}</b> فوق`,MK.inapp())}${st(2,`اختر <b>«فتح في ${isIOS?"Safari":"Chrome"}»</b>`,MK.open())}${st(3,"بعدها تطلع لك خطوات التثبيت")}</ol>
    <button type="button" class="ghost wide" id="instCopy">ما لقيتها؟ انسخ الرابط والصقه في ${isIOS?"Safari":"Chrome"}</button>`;
  if(k==="ios"&&ios26)return `<ol class="ins-steps">${st(1,`اضغط زر <b>⋯</b> جنب الرابط تحت`,MK.bar26())}${st(2,"اضغط <b>«مشاركة»</b>",MK.menu())}${st(3,"انزل تحت واختر <b>«إضافة إلى الشاشة الرئيسية»</b>. ما لقيتها؟ اضغط «عرض المزيد»",MK.sheet())}${st(4,"خلّ <b>«فتح كتطبيق ويب»</b> شغال، واضغط <b>«إضافة»</b>",MK.add(ico,true))}${done(5)}</ol>`;
  if(k==="ios")return `<ol class="ins-steps">${st(1,"اضغط زر <b>المشاركة</b> تحت الشاشة. ما شفته؟ اضغط على الرابط تحت مرة",MK.bar18())}${st(2,"انزل تحت واختر <b>«إضافة إلى الشاشة الرئيسية»</b>",MK.sheet())}${st(3,"اضغط <b>«إضافة»</b> فوق",MK.add(ico))}${done(4)}</ol>`;
  if(k==="ios-other")return `<ol class="ins-steps">${st(1,"اضغط زر <b>المشاركة</b> جنب الرابط فوق",MK.barTop())}${st(2,"اختر <b>«إضافة إلى الشاشة الرئيسية»</b>",MK.sheet())}${st(3,"اضغط <b>«إضافة»</b>",MK.add(ico))}${done(4)}</ol>`;
  if(k==="prompt")return `<button type="button" class="primary wide" id="doInstall">ثبّت الحين</button>`;
  if(k==="android")return `<ol class="ins-steps">${st(1,"اضغط <b>⋮</b> فوق في المتصفح",`<div class="mk mk-bar" dir="${sysRTL?"rtl":"ltr"}"><span class="mk-url">forma-app1.github.io</span><span class="mk-dot hot">⋮</span></div>`)}${st(2,"اختر <b>«تثبيت التطبيق»</b> أو «إضافة إلى الشاشة الرئيسية»",MK.andMenu())}${st(3,"اضغط <b>«تثبيت»</b>")}${done(4)}</ol>`;
  return "";
}
/* سهم يتحرك ويأشر على الزر الحقيقي في المتصفح */
function insArrow(k){
  let pos="";
  if(k==="ios")pos=ios26?(sysRTL?"bl":"br"):"bc";
  else if(k==="ios-other"||k==="inapp"||k==="android")pos=sysRTL?"tl":"tr";
  if(!pos)return "";
  const down=pos[0]==="b";
  return `<div class="ins-arrow ${pos}" aria-hidden="true"><span>${k==="inapp"?"افتح من هنا":"ابدأ من هنا"}</span><svg viewBox="0 0 24 24">${down?'<path d="M12 4v15M6 13l6 6 6-6"/>':'<path d="M12 20V5M6 11l6-6 6 6"/>'}</svg></div>`;
}
function vInstall(){
  const k=instKind(),ico=(document.querySelector('link[rel="apple-touch-icon"]')||{}).href||"apple-touch-icon.png";
  const T=window.FORMA_TRIAL,l=T&&T.left();
  return `<div class="ins">
    <img class="ins-logo" src="${ico}" alt="" width="76" height="76">
    <h1>${k==="inapp"?"افتح الرابط في المتصفح":"ثبّت FORMA بأقل من دقيقة"}</h1>
    ${l>0?`<span class="pill ins-free">مجاني للكل لين ${new Date(Date.now()+l).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn",{day:"numeric",month:"long"})}</span>`:""}
    <div class="sub">يصير تطبيق على شاشتك. يفتح بشاشة كاملة ويشتغل بدون نت.</div>
    <div class="card">${instSteps(k)}</div>
    ${isIOS&&k!=="inapp"?`<p class="note">ثبّته قبل تبدأ. اللي تسجله في المتصفح ما ينتقل للتطبيق.</p>`:""}
    ${mustInstall()?`<p class="note center">بعد ما تثبته، افتحه من شاشتك واكتب كود التفعيل هناك.</p>`:`<button type="button" class="ghost wide" id="instSkip">أكمل في المتصفح</button>`}
  </div>${insArrow(k)}`;
}

/* شاشة افتتاحية للآيفون: تنرسم مرة وحدة لمقاس الجهاز وتنقرا وقت الإضافة للشاشة */
function iosSplash(){
  if(!isIOS||isStandalone())return;
  const at=document.querySelector('link[rel="apple-touch-icon"]');if(!at)return;
  const img=new Image();
  img.onload=()=>{try{
    const r=window.devicePixelRatio||1,w=screen.width,h=screen.height;
    const mk=(bg,W,H)=>{const c=document.createElement("canvas");c.width=W*r;c.height=H*r;const x=c.getContext("2d");
      x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);const z=Math.round(Math.min(W,H)*.27*r),X=(c.width-z)/2,Y=(c.height-z)/2-z*.15,rad=z*.225;
      x.save();x.beginPath();x.moveTo(X+rad,Y);x.arcTo(X+z,Y,X+z,Y+z,rad);x.arcTo(X+z,Y+z,X,Y+z,rad);x.arcTo(X,Y+z,X,Y,rad);x.arcTo(X,Y,X+z,Y,rad);x.closePath();x.clip();
      x.drawImage(img,X,Y,z,z);x.restore();return c.toDataURL("image/png")};
    const add=(media,href)=>{const l=document.createElement("link");l.rel="apple-touch-startup-image";l.media=media;l.href=href;document.head.appendChild(l)};
    const base=o=>`screen and (device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: ${o})`;
    const dark=matchMedia("(prefers-color-scheme: dark)").matches,BG={light:"#EEF3F2",dark:"#03080A"};
    [["portrait",w,h],["landscape",h,w]].forEach(([o,W,H])=>{
      add(base(o)+" and (prefers-color-scheme: light)",mk(BG.light,W,H));
      add(base(o)+" and (prefers-color-scheme: dark)",mk(BG.dark,W,H));
      add(base(o),mk(dark?BG.dark:BG.light,W,H))});
  }catch(e){}};
  img.src=at.href.replace(/apple-touch-icon\.png(\?.*)?$/,"icon-512.png");
}
iosSplash();

/* ===== الإعداد ===== */
const welcomeLogo=()=>{const el=document.querySelector("#hdr .logo");return el?el.innerHTML.replace(/fh(bg|gr|or)/g,"fw$1"):"FORMA"};
let ob=null;
function vSetup(){
  const p=S.profile||{};
  if(!ob)ob={name:p.name||"",sex:p.sex||"ذكر",age:p.age||"",h:p.h||"",w:p.w||"",tw:p.tw||"",act:p.act??2,goal:p.goal??0,prog:S.prog||DEFP};
  const edit=!!S.profile;
  if(!edit&&!(ob.step>0)&&needGate())return vInstall();
  if(!edit)return vWizard();
  return `
  <div class="welcome">${edit?"":`<div class="logo" aria-label="FORMA">${welcomeLogo()}</div>`}<h1>${edit?"عدّل بياناتك":"نبدأ بخطتك"}</h1><div class="sub">${edit?"نعيد حساب سعراتك وبروتينك على البيانات الجديدة.":"دقيقة وحدة. نحسب لك السعرات والبروتين ونجهز برنامجك."}</div></div>
  <form id="setup" class="stack" novalidate>
    <div class="card stack">
      <div class="field"><label for="obName">اسمك</label><input type="text" id="obName" autocomplete="given-name" value="${esc(ob.name)}" placeholder="مثال: جواد"></div>
      <div><div class="flabel">الجنس</div><div class="seg" style="grid-template-columns:1fr 1fr;margin-top:6px">${["ذكر","أنثى"].map(s=>`<button type="button" data-ob="sex" data-v="${s}" aria-pressed="${ob.sex===s}">${s}</button>`).join("")}</div></div>
      <div class="grid3">
        <div class="field"><label for="obAge">العمر</label><input type="number" inputmode="numeric" id="obAge" value="${ob.age}" placeholder="24"></div>
        <div class="field"><label for="obH">الطول سم</label><input type="number" inputmode="numeric" id="obH" value="${ob.h}" placeholder="176"></div>
        <div class="field"><label for="obW">وزنك كغ</label><input type="number" inputmode="decimal" step="0.1" id="obW" value="${ob.w}" placeholder="82"></div>
      </div>
      <div class="field"><label for="obTW">الوزن اللي تبي توصله (اختياري)</label><input type="number" inputmode="decimal" step="0.1" id="obTW" value="${ob.tw}" placeholder="75"></div>
    </div>
    <div class="card"><div class="flabel">هدفك</div><div class="seg" style="grid-template-columns:repeat(3,1fr);margin-top:8px">${GOALS.map((g,i)=>`<button type="button" data-ob="goal" data-v="${i}" aria-pressed="${ob.goal==i}">${g[0]}<small>${g[1]}</small></button>`).join("")}</div></div>
    <div class="card"><div class="flabel">نشاطك</div><div class="seg" style="grid-template-columns:repeat(2,1fr);margin-top:8px">${ACT.map((a,i)=>`<button type="button" data-ob="act" data-v="${i}" aria-pressed="${ob.act==i}">${a[0]}<small>${a[1]}</small></button>`).join("")}</div></div>
    <div class="card"><div class="flabel">برنامج التمرين</div><div class="seg" style="grid-template-columns:1fr;margin-top:8px">${progList().map(k=>progOpt(k,`data-ob="prog" data-v="${k}"`)).join("")}</div></div>
    <p class="note">FORMA للأصحاء فوق 18 سنة. إذا عندك مرض مزمن، أو حامل، أو ترضعين، راجع طبيبك قبل تبدأ.</p>
    <button type="submit" class="primary wide">${edit?"احفظ":"جهّز خطتي"}</button>
    ${edit?`<button type="button" class="ghost" data-go="settings">إلغاء</button>`:""}
  </form>`;
}
const WZ=3;
function vWizard(){
  const st=ob.step||0,pct=Math.round((st+1)/WZ*100);
  const head=(t,s)=>`<div class="wz-q"><h1>${t}</h1>${s?`<div class="sub">${s}</div>`:""}</div>`;
  const seg=(k,arr,cols,cur)=>`<div class="seg wz-opts" style="grid-template-columns:repeat(${cols},1fr)">${arr.map((g,i)=>`<button type="button" data-ob="${k}" data-v="${i}" aria-pressed="${cur==i}">${g[0]}<small>${g[1]}</small></button>`).join("")}</div>`;
  let body="";
  if(st===0)body=`${head("هلا! خلنا نعرفك","دقيقة وحدة ونجهز لك خطة أكل وتمرين على مقاسك.")}
    <div class="card stack"><div class="field"><label for="obName">اسمك</label><input type="text" id="obName" autocomplete="given-name" value="${esc(ob.name)}" placeholder="مثال: جواد"></div>
    <div class="grid2"><div><div class="flabel">الجنس</div><div class="seg" style="grid-template-columns:1fr 1fr;margin-top:6px">${["ذكر","أنثى"].map(s=>`<button type="button" data-ob="sex" data-v="${s}" aria-pressed="${ob.sex===s}">${s}</button>`).join("")}</div></div>
    <div class="field"><label for="obAge">العمر</label><input type="number" inputmode="numeric" id="obAge" value="${ob.age}" placeholder="24"></div></div></div>`;
  else if(st===1)body=`${head("أرقامك","نحتاجها عشان نحسب حرقك اليومي بدقة.")}
    <div class="card stack"><div class="grid2">
      <div class="field"><label for="obH">الطول سم</label><input type="number" inputmode="numeric" id="obH" value="${ob.h}" placeholder="176"></div>
      <div class="field"><label for="obW">وزنك كغ</label><input type="number" inputmode="decimal" step="0.1" id="obW" value="${ob.w}" placeholder="82"></div></div>
      <div class="field"><label for="obTW">الوزن اللي تبي توصله (اختياري)</label><input type="number" inputmode="decimal" step="0.1" id="obTW" value="${ob.tw}" placeholder="75"></div></div>`;
  else body=`${head("وش هدفك؟","تقدر تغيّره بعدين من ملفك.")}
    ${seg("goal",GOALS,3,ob.goal)}
    <div class="flabel" style="margin-top:14px">كم تتحرك بالأسبوع؟</div>${seg("act",ACT,2,ob.act)}
    <p class="note">FORMA للأصحاء فوق 18 سنة. إذا عندك مرض مزمن، أو حامل، أو ترضعين، راجع طبيبك قبل تبدأ.</p>`;
  return `<div class="wz-top">${st?`<button type="button" class="ghost wz-back" data-wz="back" aria-label="رجوع">→</button>`:`<div class="logo wz-logo" aria-label="FORMA">${welcomeLogo()}</div>`}<div class="wz-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><span class="sub num">${st+1}/${WZ}</span></div>
  <form id="setup" class="stack wz" novalidate>${body}
    <button type="submit" class="primary wide wz-next">${st<WZ-1?"التالي":"جهّز خطتي"}</button></form>`;
}
function wizNext(){
  readSetupFields();const st=ob.step||0;
  if(st===0){if(!ob.name)return toast("اكتب اسمك");if(!(+ob.age>=18&&+ob.age<=80))return toast("العمر لازم يكون بين 18 و 80")}
  if(st===1){const h=+ob.h,w=+ob.w,tw=ob.tw?+ob.tw:null;
    if(!(h>=130&&h<=230))return toast("اكتب طولك بالسنتيمتر");
    if(!(w>=35&&w<=250))return toast("اكتب وزنك بالكيلو");
    if(tw!==null&&!(tw>=35&&tw<=250))return toast("الوزن المستهدف غير منطقي");
    if(tw!==null&&Math.abs(tw-w)>0.5&&ob.goalTouched!==true)ob.goal=tw<w?0:2}
  PF.haptic("light");
  if(st<WZ-1){ob.step=st+1;render();const f=document.querySelector("#setup input");if(f)f.focus();return}
  if(!CFG.defaultProg&&!ob.progTouched)ob.prog=+ob.act===3&&PROGRAMS.pplap?"pplap":DEFP;
  submitSetup();
}
function readSetupFields(){const v=id=>{const el=document.getElementById(id);return el?el.value:null};const n=v("obName");if(n!==null)ob.name=n.trim();[["age","obAge"],["h","obH"],["w","obW"],["tw","obTW"]].forEach(([k,id])=>{const x=v(id);if(x!==null)ob[k]=x})}
function submitSetup(){
  readSetupFields();
  const age=+ob.age,h=+ob.h,w=+ob.w,tw=ob.tw?+ob.tw:null;
  if(!ob.name)return toast("اكتب اسمك");
  if(!(age>=18&&age<=80))return toast("العمر لازم يكون بين 18 و 80");
  if(!(h>=130&&h<=230))return toast("اكتب طولك بالسنتيمتر");
  if(!(w>=35&&w<=250))return toast("اكتب وزنك بالكيلو");
  if(tw!==null&&!(tw>=35&&tw<=250))return toast("الوزن المستهدف غير منطقي");
  const first=!S.profile,old=S.profile||{};
  if(S.prog!==ob.prog||first){S.prog=ob.prog;S.sessionIdx=0;S.progStart=(CFG.progStart&&ob.prog===DEFP)?CFG.progStart:today()}
  S.profile={name:ob.name,sex:ob.sex,age,h,w,tw,act:+ob.act,goal:+ob.goal,start:old.start||today(),startW:old.startW||w,customKcal:old.customKcal||null};delete S._wiped;
  if(first){day(today()).weight=w;S.adj=0}
  if(old.goal!==undefined&&old.goal!==+ob.goal)S.adj=0;
  ob=null;save();
  if(first){tab="plan";render();return}
  tab="today";render();
  const g=G();toast(`خطتك: ${fmt(g.kcal)} سعرة و ${g.p} جم بروتين`);
}
/* شاشة "خطتك جاهزة" */
function projection(){
  const p=S.profile,w=p.w,rate=p.goal===0?0.0075*w:p.goal===2?0.0025*w:0;
  let weeks=null,tw=p.tw;
  if(rate&&tw&&Math.sign(tw-w)===(p.goal===0?-1:1))weeks=Math.max(1,Math.ceil(Math.abs(tw-w)/rate));
  if(!weeks){weeks=rate?8:4;tw=r1(w+(p.goal===0?-1:1)*rate*weeks)}
  return {w,tw,weeks,rate,date:key(addDays(new Date(),weeks*7))};
}
function vPlan(){
  const p=S.profile,g=G(),P=prog(),pj=projection(),nx=P.sessions[0];
  const W=320,H=150,L=12,R=12,T=24,B=30,n=Math.min(pj.weeks,52);
  const lo=Math.min(pj.w,pj.tw),hi=Math.max(pj.w,pj.tw),pad2=Math.max((hi-lo)*0.25,0.6);
  const X=i=>L+i*(W-L-R)/Math.max(n,1),Y=v=>T+(hi+pad2-v)*(H-T-B)/((hi-lo)+2*pad2||1);
  const pts=[];for(let i=0;i<=n;i++){const t=i/n,e=p.goal===1?0:(1-Math.pow(1-t,1.25));pts.push([X(i),Y(pj.w+(pj.tw-pj.w)*e)])}
  const path=pts.map((q,i)=>(i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1)).join(" ");
  const area=path+` L${X(n)} ${H-B} L${X(0)} ${H-B} Z`;
  const goalTxt=p.goal===1?`تثبت على ${r1(pj.w)} كغ`:p.tw&&pj.tw===p.tw?`توصل ${p.tw} كغ تقريبا ${dateAr(pj.date)}`:`${p.goal===0?"تنزل":"تزيد"} تقريبا ${r1(Math.abs(pj.tw-pj.w))} كغ في ${wkL(pj.weeks)}`;
  return `<div class="plan">
  <div class="plan-h rise" style="--d:0"><span class="pill">خطتك جاهزة</span><h1>يلا يا ${esc(p.name)}، هذي خطتك</h1></div>
  <div class="hero rise" style="--d:1"><span class="lbl">أكلك اليومي</span><div class="big" id="planK" data-to="${g.kcal}">${fmt(g.kcal)}<small>سعرة</small></div>
    <div class="plan-mac"><div><b class="num">${g.p}</b><span>جم بروتين</span></div><div><b class="num">${g.c}</b><span>جم كارب</span></div><div><b class="num">${g.f}</b><span>جم دهون</span></div></div></div>
  <div class="card rise" style="--d:2"><h2>${goalTxt}</h2><div class="sub" style="margin-bottom:6px">${pj.rate?`بمعدل ${r1(pj.rate)} كغ بالأسبوع. أسرع من كذا تخسر عضل.`:"نفس حرقك اليومي، وتبني عضل مع التمرين."}</div>
    <svg viewBox="0 0 ${W} ${H}" class="plan-chart" role="img" aria-label="توقع وزنك"><defs><linearGradient id="pjg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#pjg)"/><path d="${path}" class="pj-line" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="5" fill="var(--ink)"/><circle cx="${pts[n][0]}" cy="${pts[n][1]}" r="6" fill="var(--accent)"/>
      <text x="${pts[0][0]+2}" y="${pts[0][1]-10}" text-anchor="start">${r1(pj.w)}</text><text x="${pts[n][0]-2}" y="${pts[n][1]-12}" text-anchor="end" style="fill:var(--accent);font-weight:800">${r1(pj.tw)}</text>
      <text x="${L}" y="${H-8}" text-anchor="start">اليوم</text><text x="${W-R}" y="${H-8}" text-anchor="end">⁧${dateAr(pj.date)}⁩</text></svg></div>
  <div class="card stack rise" style="--d:3"><div class="row"><h2>تمرينك</h2><button class="ghost" id="planProg">غيّر البرنامج</button></div><div class="sub">${esc(P.ar)} · ${dL(P.days)} بالأسبوع · ${wkL(P.weeks)}. أول جلسة: <b dir="auto">${esc(sName(nx.n))}</b>، ${nx.ex.length} تمارين.</div></div>
  <div class="card stack rise" style="--d:4"><h2>أسبوعك الأول</h2><ol class="plan-steps">
    <li><b>سجّل أكلك كل يوم.</b> اكتب وش أكلت، أو صوّر صحنك، أو امسح الباركود. ما تحتاج دقة 100%.</li>
    <li><b>اوزن نفسك الصبح.</b> 3 مرات بالأسبوع على الأقل. FORMA يعدّل سعراتك كل أسبوع حسب نزولك.</li>
    <li><b>تمرّن ${dL(P.days)}.</b> سجّل الأوزان، وFORMA يقولك متى تزيد.</li></ol></div>
  <button class="primary wide rise" style="--d:5" data-go="today">يلا نبدأ</button></div>`;
}
function openProgPick(){
  sheet((sh,close)=>{sh.setAttribute("aria-label","اختر برنامجك");
    sh.innerHTML=`<div class="grab"></div><h2>اختر برنامجك</h2><p class="note" style="margin:2px 0 10px">كل البرامج مبنية على أحدث الأبحاث. تقدر تعدّلها بعدين.</p><div class="seg" style="grid-template-columns:1fr">${progList().map(k=>progOpt(k,`data-pp="${k}"`)).join("")}</div>`;
    sh.addEventListener("click",e=>{const b=e.target.closest("[data-pp]");if(!b)return;if(S.prog!==b.dataset.pp){S.prog=b.dataset.pp;S.sessionIdx=0;S.progStart=today();live=null;save()}close();render()});
  });
}
function countUp(el){const to=+el.dataset.to;if(!to||matchMedia("(prefers-reduced-motion: reduce)").matches)return;const t0=performance.now(),dur=900,sm=el.querySelector("small").outerHTML;
  const f=t=>{const k=Math.min((t-t0)/dur,1),e=1-Math.pow(1-k,3);el.innerHTML=fmt(to*e)+sm;if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}

/* ===== اليوم ===== */
function suggestions(filter){
  const T=today(),t=totals(T),g=G(),R=g.kcal-t.k,P=g.p-t.p;
  if(R<120)return {R,P,list:[]};
  const scale=g.kcal/2200,cands=[];
  if(filter!=="rest"){
    Object.keys(PLAN).forEach(meal=>PLAN[meal].forEach((opt,i)=>{
      const items=opt.map(([n,gr])=>{const f=FOODS.find(x=>x.n===n);return f?{fid:f.fid,amt:Math.round(gr*scale/5)*5}:null}).filter(Boolean);
      const m=items.reduce((a,it)=>{const x=macrosOf(getFood(it.fid),it.amt);a.k+=x.k;a.p+=x.p;return a},{k:0,p:0});
      cands.push({label:opt.map(o=>o[0]).join(" + "),sub:`خطة FORMA · ${meal}`,items,k:m.k,p:m.p});
    }));
    S.meals.forEach(ml=>{const m=ml.items.reduce((a,it)=>{const f=getFood(it.fid);if(!f)return a;const x=macrosOf(f,it.amt);a.k+=x.k;a.p+=x.p;return a},{k:0,p:0});cands.push({label:ml.n,sub:"من وجباتي",items:ml.items,k:m.k,p:m.p})});
  }
  if(filter!=="home"){
    FOODS.filter(f=>f.store&&RESTS.includes(f.store)&&f.p!=null&&f.k>=250).forEach(f=>cands.push({label:f.n,sub:f.store,items:[{fid:f.fid,amt:1}],k:f.k,p:f.p}));
  }
  /* الترتيب: بروتين يقفل الباقي + بروتين عالي لكل سعرة + حجم يناسب الوجبات الباقية */
  const h=new Date().getHours(),mealsLeft=h<11?3:h<16?2:h<20?1.5:1,budget=R/mealsLeft;
  const fit=cands.filter(c=>c.k<=Math.min(R+50,1300)&&c.k>=Math.min(220,R*0.3)&&c.p>0);
  fit.forEach(c=>{const pc=P>0?Math.min(c.p,P)/P:0.5,dens=clamp((c.p*4/c.k)/0.4,0,1),size=1-clamp(Math.abs(c.k-budget)/Math.max(budget,300),0,1);
    c.dense=c.p*4/c.k>=0.3;c.score=pc*0.45+dens*0.35+size*0.2});
  fit.sort((a,b)=>b.score-a.score);
  const out=[],seen=new Set();for(const c of fit){const kk=c.sub;if(c.sub&&RESTS.includes(c.sub)){if(seen.has(kk))continue;seen.add(kk)}out.push(c);if(out.length===4)break}
  return {R,P,list:out};
}
let sugFilter="all";
function vToday(){
  const T=today(),t=totals(T),g=G(),P=prog(),si=sessIdx(),nx=P.sessions[si],st=streak();
  const left=g.kcal-t.k,over=left<0;
  const hr=new Date().getHours(),greet=hr<12?"صباح الخير":hr<18?"هلا":"مساء الخير";
  const rv=weeklyReview();
  let install="";const ik=instKind();
  if(ik&&Date.now()-instGet("later")>3*864e5){
    if(ik==="prompt")install=`<div class="card install row"><div><h2>ثبّت FORMA</h2><div class="sub">يفتح بشاشة كاملة ويشتغل بدون نت</div></div><button class="primary" id="doInstall">ثبّت</button></div>`;
    else install=`<div class="card install"><div class="row"><h2>ثبّت FORMA على شاشتك</h2><button type="button" class="ins-x" id="instLater" aria-label="لاحقاً">×</button></div>${instSteps(ik)}${isIOS&&ik!=="inapp"?`<p class="note">بياناتك هنا ما تنتقل للتطبيق لحالها. خذ «نسخة احتياطية» من ملفك، واسترجعها بعد ما تفتح التطبيق.</p>`:""}</div>`;
  }
  const ring=(p,cls,inner)=>`<div class="ring ${cls}" style="--p:${p.toFixed(3)}"><div>${inner}</div></div>`;
  const mr=(cls,name,v,goal)=>`<div class="mring ${cls}">${ring(clamp(v/goal,0,1),"sm",`<b class="num">${fmt(v)}</b>`)}<span>${name} <i class="num">/ ${goal}</i></span></div>`;
  const tr=S.days[T]?.trained,pl=clamp(progDone()/progTotal()*100,0,100);
  return `
  <div class="th"><span class="sub">${dateAr(T)}${st?` · <b class="hotc">${st} ${st===1?"يوم":st<=10?"أيام":"يوم"} ورا بعض</b>`:""}</span><h1>${greet} ${esc(S.profile.name)}</h1></div>
  ${install}
  ${trialCard()}
  <div class="card hero2">
    <div class="h2-top">${ring(clamp(t.k/g.kcal,0,1),"lg"+(over?" over":""),`<b class="num">${fmt(Math.abs(left))}</b><span>${over?"سعرة زيادة":"سعرة باقية"}</span>`)}
      <div class="h2-st"><div><span>هدفك</span><b class="num">${fmt(g.kcal)}</b></div><div><span>أكلت</span><b class="num">${fmt(t.k)}</b></div><div><span>باقي بروتين</span><b class="num acc">${fmt(Math.max(0,g.p-t.p))} <small>جم</small></b></div></div></div>
    <div class="h2-m">${mr("p","بروتين",t.p,g.p)}${mr("c","كارب",t.c,g.c)}${mr("f","دهون",t.f,g.f)}</div>
    <button class="ghost h2-sug" id="openSug">محتار وش تاكل؟ ‹</button>
  </div>
  ${quickActs()}
  <div class="wo"><div class="wo-l"><span class="lbl">تمرين اليوم · ${esc(P.ar)}</span><b dir="auto">${esc(sName(nx.n))}</b><span class="sub">${nx.ex.length} تمارين${nx.day?" · "+nx.day:""}</span><div class="wo-p" title="تقدمك في البرنامج"><i style="width:${pl}%"></i></div></div>
    ${tr?`<span class="pill">تمرّنت اليوم ✓</span>`:`<button class="wo-go" data-go="train">ابدأ</button>`}</div>
  ${coachCard()}
  ${rv?`<div class="card review stack"><div class="row"><h2>مراجعة الأسبوع</h2><span class="pill ${rv.delta?"hot":""}">${rv.delta?(rv.delta>0?"+":"")+rv.delta+" سعرة":"على المسار"}</span></div><p class="note" style="color:var(--ink);font-size:14px">${rv.msg}</p>${rv.delta?`<div class="grid2"><button class="primary" id="rvApply">طبّق التعديل</button><button id="rvSkip">خله زي ما هو</button></div>`:`<button id="rvSkip">تمام</button>`}</div>`:""}
  ${S.days[T]?.weight&&!wEdit?`<div class="card wrow"><div><span class="lbl">وزن اليوم</span><div class="nx-t"><b class="num">${r1(S.days[T].weight)} <small>كغ</small></b>${trend()?`<span class="sub">متوسط الأسبوع ${r1(trend().avg)}</span>`:""}</div></div><button class="ghost" id="wEdit">عدّل</button></div>`
  :`<div class="card stack wcard"><div class="row"><h2>وزن اليوم</h2><span class="sub">الصبح، قبل الأكل</span></div>
    <div class="row"><input type="number" step="0.1" inputmode="decimal" id="wIn" aria-label="وزن اليوم بالكيلو" placeholder="${r1(currentWeight())}" value="${S.days[T]?.weight??""}"><button class="primary" id="wSave">حفظ</button></div></div>`}`;
}
const tipBase=()=>{const d=new Date();return (d.getDate()+d.getMonth()*31)%TIPS.length};
let tipShift=0,lastSug=[];
/* أزرار التصوير والباركود: بارزة في الرئيسية وصفحة الأكل */
const quickActs=(food)=>`<div class="qa4"><button id="photoB">${ICON.camera}<span>صوّر أكلك</span></button><button id="scanB">${ICON.scan}<span>باركود</span></button>${food?"":`<button id="qSay">${ICON.mic}<span>تكلم</span></button><button id="qSearch">${ICON.search}<span>ابحث</span></button>`}</div>`;

/* ===== نصايح فورما ===== */
function coachCtx(){
  const T=today(),p=S.profile,g=G(),P=prog(),now=new Date();
  const ks=[];for(let i=1;i<=7;i++)ks.push(key(addDays(now,-i)));
  const logged=ks.filter(k=>(S.days[k]?.food||[]).length);
  const tt=logged.map(totals),avg=f=>tt.length>=2?tt.reduce((a,x)=>a+x[f],0)/tt.length:null;
  const ws=weightsSorted(),lastW=ws.length?ws[ws.length-1][0]:null;
  const hist=S.history.filter(h=>!h.seed||daysBetween(h.date,T)<30),lastT=hist.length?hist.map(h=>h.date).sort().pop():null;
  const prs3=[];hist.filter(h=>daysBetween(h.date,T)<=3).forEach(h=>(h.prs||[]).forEach(n=>{if(!prs3.includes(n))prs3.push(n)}));
  const tdy=totals(T);
  return {name:p.name,goal:p.goal,kcal:g.kcal,prot:g.p,hour:now.getHours(),dayNum:Math.floor(now/864e5),
    daysSinceStart:daysBetween(p.start||T,T),trend:trend(),cw:currentWeight(),tw:p.tw,
    lastWeighDays:lastW?daysBetween(lastW,T):999,log7:logged.length,avgK7:avg("k"),avgP7:avg("p"),
    todayLogged:!!(S.days[T]?.food||[]).length,todayP:tdy.p,anyFood:Object.values(S.days).some(d=>(d.food||[]).length),
    trainedToday:!!S.days[T]?.trained,daysSinceTrain:lastT?daysBetween(lastT,T):999,
    week:{done:hist.filter(h=>daysBetween(h.date,T)<7).length,plan:P.days},prs3,streak:streak(),next:sName(P.sessions[sessIdx()].n)};
}
function trialCard(){const T=window.FORMA_TRIAL,l=T&&T.left();if(l==null)return "";const d=Math.ceil(l/864e5);
  return `<a class="trial" href="${T.buy}" target="_blank" rel="noopener"><span><b>فورما مجاني للكل لمدة أسبوع</b><small>${d<=1?"آخر يوم":d===2?"باقي يومين":"باقي "+d+" أيام"}. اشترِه مرة وحدة بدون اشتراك وكمّل على بياناتك.</small></span><i>اشترِ ‹</i></a>`}
const APP_URL="https://forma-app1.github.io/Forma/";
function shareApp(){const d={title:"FORMA",text:"جرّب فورما: برامج تمرين مبنية على العلم، وسعرات مطاعمنا جاهزة.",url:APP_URL};
  if(navigator.share)navigator.share(d).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(d.text+" "+d.url).then(()=>toast("انسخ الرابط. أرسله لخويك"))}
let coachIdx=0;
const COACH_ACT={food:["سجّل أكلك","food"],train:["ابدأ التمرين","train"],weight:["سجّل وزنك","weight"],setup:["عدّل هدفك","setup"]};
function coachCard(){
  if(!COACH)return "";
  let list;try{list=COACH.tips(coachCtx()).slice(0,4)}catch(e){return ""}
  if(!list.length)return "";
  const t=list[coachIdx%list.length],a=t.act&&COACH_ACT[t.act];
  const av=(document.querySelector("#hdr .mk")||{}).outerHTML||"";
  return `<div class="card coach" id="coach"><div class="coach-av" aria-hidden="true">${av}</div><div class="coach-b"><div class="row"><span class="lbl coach-l">فورما يقول</span>${list.length>1?`<button class="ghost coach-n" id="coachNext" aria-label="النصيحة الثانية">${coachIdx%list.length+1}/${list.length} ‹</button>`:""}</div>
    <p class="coach-t">${esc(t.t)}</p>${a?`<button class="coach-a" data-coach="${a[1]}">${a[0]}</button>`:""}</div></div>`;
}

/* ===== الأكل ===== */
let foodDay=null,cat="الكل",q="";
function dayLabel(k){if(k===today())return "اليوم";if(k===key(addDays(new Date(),-1)))return "أمس";try{return parseKey(k).toLocaleDateString("ar-u-nu-latn",{weekday:"long",day:"numeric",month:"long"})}catch(e){return k}}
/* ماكروز ملونة: P بروتين، C كارب، F دهون */
const mx=(p,c,f)=>`<span class="mx" dir="ltr"><span class="mp">P<b>${p==null?"-":fmt(p)}</b></span><span class="mc">C<b>${c==null?"-":fmt(c)}</b></span><span class="mf">F<b>${f==null?"-":fmt(f)}</b></span></span>`;
const foodRow=f=>`<button class="item fi" data-add="${f.fid}"><span class="n">${esc(f.n)}<small>${f.store&&RESTS.includes(f.store)?esc(f.store)+" · ":""}${f.u==="g"?"لكل 100 جم":f.u==="sp"?"للملعقة":"للحبة"}</small>${mx(f.p,f.c,f.f)}</span><span class="kc num">${fmt(f.k)}<small>سعرة</small></span><span class="plus" aria-hidden="true">+</span></button>`;
let browse=false;
function vFood(){
  foodDay=foodDay||today();
  const t=totals(foodDay),g=G(),label=dayLabel(foodDay),entries=S.days[foodDay]?.food||[];
  const left=g.kcal-t.k,over=left<0,pl=Math.max(g.p-t.p,0);
  const prev=foodDay===today()?"أمس":"اليوم اللي قبله";
  const bar=(cls,v,goal)=>`<div class="fs-m ${cls}"><div class="fs-mt"><i>${cls==="mp"?"P":cls==="mc"?"C":"F"}</i><b class="num">${fmt(v)}</b><span class="num">/${goal}</span></div><div class="fs-mb"><i style="width:${clamp(v/goal*100,0,100)}%"></i></div></div>`;
  const used=MEALS.filter(m=>entries.some(e=>e.meal===m));
  return `
  <div class="fsum">
    <div class="fs-top"><button id="prevD" class="fs-nav" aria-label="اليوم السابق">→</button>
      <div class="fs-c"><div class="fs-big num ${over?"over":""}">${fmt(Math.abs(left))}<small>${over?"سعرة زيادة":"سعرة باقية"}</small></div><div class="fs-sub">${label}${pl>0?` · باقي <b class="num">${fmt(pl)}</b> جم بروتين`:" · قفلت بروتينك"}</div></div>
      <button id="nextD" class="fs-nav" aria-label="اليوم التالي" ${foodDay===today()?"disabled":""}>←</button></div>
    <div class="fs-macs">${bar("mp",t.p,g.p)}${bar("mc",t.c,g.c)}${bar("mf",t.f,g.f)}</div>
  </div>
  <form class="fin" id="sayF" autocomplete="off" role="search">
    <input type="text" id="sayIn" enterkeyhint="done" placeholder="وش أكلت؟ مثال: 3 بيض وخبزة" dir="auto" aria-label="اكتب وش أكلت أو ابحث" value="${esc(q)}">
    ${SR?`<button type="button" id="sayMic" class="fin-b" aria-label="تكلم">${ICON.mic}</button>`:""}
  </form>
  ${quickActs(true)}
  <div id="results"></div>
  <div class="card stack flog">
    <div class="row"><h2>${foodDay===today()?"أكلك اليوم":"أكل "+label}</h2><span class="sub num">${fmt(t.k)} سعرة</span></div>
    ${used.length?used.map(m=>{const es=entries.map((e,i)=>({e,i})).filter(o=>o.e.meal===m),tm=es.reduce((a,o)=>{const x=macrosOf(eFood(o.e),o.e.amt);a.k+=x.k;a.p+=x.p;a.c+=x.c;a.f+=x.f;return a},{k:0,p:0,c:0,f:0});
      return `<div class="meal-g m${MEALS.indexOf(m)}"><div class="meal-h"><h3>${m} <span class="sub num">${fmt(tm.k)}</span> ${mx(tm.p,tm.c,tm.f)}</h3><button class="ghost" data-savemeal="${m}">احفظها كوجبة</button></div>${es.map(o=>{const f=eFood(o.e),mm=macrosOf(f,o.e.amt);
        return `<div class="item fi"><span class="n">${esc(f.n)}<small>${f.src==="photo"?`من صورة${f.g?" · "+fmt(f.g)+" جم":""}`:amtLabel(f,o.e.amt)}${f.store&&RESTS.includes(f.store)?" · "+esc(f.store):""}</small>${mx(mm.p,f.c==null?null:mm.c,f.f==null?null:mm.f)}</span><span class="kc num">${fmt(mm.k)}<small>سعرة</small></span><button class="del" data-del="${o.i}" aria-label="احذف ${esc(f.n)}">×</button></div>`}).join("")}</div>`}).join("")
      :`<div class="empty">ما سجلت شي ${foodDay===today()?"اليوم":""}. اكتب وش أكلت فوق.</div>`}
    <button id="copyY" class="ghost">${entries.length?`أضف أكل ${prev} هنا`:`نفس أكل ${prev}؟ انسخه بضغطة`}</button>
  </div>
  ${browse?"":quickBlock()}`;
}
function renderResults(){
  const box=$("#results");if(!box)return;
  const qq=q.trim(),all=FOODS.concat(S.custom);let html="";
  if(qq){
    const words=qq.split(/\s+/);
    let found=window.FORMA_SAY?FORMA_SAY.search(qq,{foods:all,stores:[...RESTS,"الحطب","المراعي","ندى"],recent:S.recent}):[];
    if(!found.length)found=all.filter(f=>words.every(w=>(f.n+" "+(f.store||"")+" "+f.cat).includes(w)));
    const multi=words.length>2;
    html=`<div class="card rlist"><button class="item fi say-go" data-sayrun="1"><span class="n">سجّل «${esc(qq)}»<small>${multi?"FORMA يفصلها ويحسب الكميات":"أو اختر من تحت"}</small></span><span class="plus" aria-hidden="true">✓</span></button>
      ${found.slice(0,multi?4:8).map(foodRow).join("")}${found.length||multi?"":`<div class="empty">ما لقيناها. <button class="ghost" id="quick" style="padding:0 4px">أضفها بنفسك</button></div>`}</div>`;
  }else if(browse){
    const chips=["وجباتي","أكلاتي","مطاعم",...CATS.filter(c=>!RESTS.includes(c))];if(!chips.includes(cat))cat="مطاعم";
    let rows=[],head="";
    if(cat==="وجباتي"){head=S.meals.length?"":`<div class="empty">سجّل وجبة، وبعدين اضغط "احفظها كوجبة". بعدها تضيفها كلها بضغطة.</div>`;rows=S.meals.map((ml,i)=>mealRow(ml,i,true))}
    else if(cat==="أكلاتي"){head=S.custom.length?"":`<div class="empty">ما عندك أكلات خاصة.</div>`;rows=S.custom.map(foodRow)}
    else if(cat==="مطاعم"){if(!restPick)rows=RESTS.map(r=>`<button class="item" data-rest="${r}"><span class="n">${r}<small>${RAW[r].length} صنف · ${SOURCES[r]&&SOURCES[r][1].startsWith("رسمي")?"قيم رسمية":"قيم تقديرية"}</small></span><span class="plus" aria-hidden="true">‹</span></button>`);
      else{head=`<button class="ghost" data-rest="" style="margin-bottom:4px">→ كل المطاعم</button>`;rows=FOODS.filter(f=>f.cat===restPick).map(foodRow)}}
    else rows=FOODS.filter(f=>f.cat===cat).map(foodRow);
    html=`<div class="row" style="margin-bottom:8px"><h2>تصفح الأكلات</h2><button class="ghost" id="browseB">إغلاق</button></div>
      <div class="chips" role="group" aria-label="الأقسام">${chips.map(c=>`<button class="chip" data-cat="${c}" aria-pressed="${c===cat}">${c}</button>`).join("")}</div>
      <div class="card rlist">${head}<div class="list">${rows.join("")}</div></div>`;
  }
  box.innerHTML=html;
}
function quickBlock(){
    const rec=S.recent.map(getFood).filter(Boolean).slice(0,5);
  return `${S.meals.length?`<div class="card rlist"><div class="row"><h2>وجباتي</h2><span class="sub">ضغطة وتنضاف كلها</span></div><div class="list">${S.meals.slice(0,3).map((ml,i)=>mealRow(ml,i,false)).join("")}</div></div>`:""}
      ${rec.length?`<div class="card rlist"><div class="row"><h2>آخر أكلاتك</h2><span class="sub">ضغطة وتنضاف</span></div><div class="list">${rec.map(foodRow).join("")}</div></div>`:""}
      <div class="flinks"><button class="ghost" id="browseB">تصفح كل الأكلات والمطاعم</button><button class="ghost" id="quick">أكلة مو موجودة؟</button></div>`;
  
}
function mealRow(ml,i,del){const m=ml.items.reduce((a,it)=>{const f=getFood(it.fid);if(!f)return a;const x=macrosOf(f,it.amt);a.k+=x.k;a.p+=x.p;a.c+=x.c;a.f+=x.f;return a},{k:0,p:0,c:0,f:0});
  return `<div class="item fi"><button class="n" style="background:none;padding:0;text-align:right;color:var(--ink);border-radius:0" data-addmeal="${i}">${esc(ml.n)}<small>${ml.items.length} أصناف</small>${mx(m.p,m.c,m.f)}</button><span class="kc num">${fmt(m.k)}<small>سعرة</small></span>${del?`<button class="del" data-delmeal="${i}" aria-label="احذف الوجبة">×</button>`:""}<button class="plus" data-addmeal="${i}" aria-label="أضف ${esc(ml.n)}">+</button></div>`}
let restPick="";
function defaultMeal(){const h=new Date().getHours();return h<11?"فطور":h<16?"غداء":h<20?"سناك":"عشاء"}
function targetDay(){return tab==="food"&&foodDay?foodDay:today()}
function pushRecent(fid){S.recent=[fid,...S.recent.filter(x=>x!==fid)].slice(0,12)}
function afterAdd(k){q="";save();render();PF.haptic("success");const left=G().p-totals(k).p;toast(left>0?`انضافت. باقي ${fmt(left)} جم بروتين`:"قفلت بروتينك اليوم")}
function sheet(build){
  const bg=document.createElement("div");bg.className="sheet-bg";
  const sh=document.createElement("div");sh.className="sheet";sh.setAttribute("role","dialog");sh.setAttribute("aria-modal","true");
  const close=()=>{if(sh._onclose){try{sh._onclose()}catch(e){}sh._onclose=null}bg.remove();sh.remove();document.removeEventListener("keydown",onKey)};
  const onKey=e=>{if(e.key==="Escape")close()};
  bg.addEventListener("click",close);document.addEventListener("keydown",onKey);
  /* اسحب لتحت وتتسكر، زي التطبيقات */
  let y0=null,dy=0;
  sh.addEventListener("touchstart",e=>{if(sh.scrollTop>2||e.target.closest("input,textarea,select"))return;y0=e.touches[0].clientY;dy=0},{passive:true});
  sh.addEventListener("touchmove",e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy>0){sh.style.transition="none";sh.style.transform=`translateY(${dy}px)`}},{passive:true});
  sh.addEventListener("touchend",()=>{if(y0==null)return;y0=null;sh.style.transition="";if(dy>90)close();else sh.style.transform=""});
  document.body.append(bg,sh);build(sh,close);
}
function openFood(fid){
  const f=getFood(fid);if(!f)return;
  const isG=f.u==="g",opts=isG?[50,100,150,200,250,300]:[0.5,1,1.5,2,3,4];
  let amt=isG?(S.lastAmt?.[fid]||100):1,meal=defaultMeal();
  sheet((sh,close)=>{
    sh.setAttribute("aria-label",f.n);
    const draw=()=>{const m=macrosOf(f,amt);sh.innerHTML=`<div class="grab"></div>
      <div class="row"><div><h2>${esc(f.n)}</h2><div class="sub">${f.store&&RESTS.includes(f.store)?f.store+" · ":""}${f.cat}</div></div>${srcTag(f)}</div>
      <div class="amts">${opts.map(v=>`<button data-a="${v}" aria-pressed="${v===amt}">${isG?v+" جم":v===0.5?"½":v}</button>`).join("")}</div>
      <div class="row"><input type="number" inputmode="decimal" id="amtIn" dir="ltr" aria-label="${isG?"الكمية بالجرام":f.u==="sp"?"عدد الملاعق":"عدد الحبات"}" value="${amt}" style="text-align:center"><span class="sub" style="white-space:nowrap">${isG?"جرام":f.u==="sp"?"ملعقة":"حبة"}</span></div>
      <div class="meals">${MEALS.map(x=>`<button data-m="${x}" aria-pressed="${x===meal}">${x}</button>`).join("")}</div>
      <div class="mrow"><div><b>${fmt(m.k)}</b><span>سعرة</span></div><div><b>${fmt(m.p)}</b><span>بروتين</span></div><div><b>${f.c==null?"-":fmt(m.c)}</b><span>كارب</span></div><div><b>${f.f==null?"-":fmt(m.f)}</b><span>دهون</span></div></div>
      ${f.c==null?`<p class="note" style="margin-top:8px">${f.store} ما نشر الكارب والدهون لهذا الصنف.</p>`:""}
      <button class="primary wide" id="addGo" style="margin-top:14px">أضف لل${meal}</button>`};
    draw();
    sh.addEventListener("input",e=>{if(e.target.id==="amtIn"){const v=parseFloat(e.target.value);if(v>0){amt=v;const m=macrosOf(f,amt);const b=sh.querySelectorAll(".mrow b");b[0].textContent=fmt(m.k);b[1].textContent=fmt(m.p);if(f.c!=null){b[2].textContent=fmt(m.c);b[3].textContent=fmt(m.f)}sh.querySelectorAll("[data-a]").forEach(x=>x.setAttribute("aria-pressed",+x.dataset.a===amt))}}});
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.a){amt=+b.dataset.a;draw()}else if(b.dataset.m){meal=b.dataset.m;draw()}
      else if(b.id==="addGo"){if(!(amt>0))return toast("اكتب الكمية");const k=targetDay();day(k).food.push({fid,amt,meal});pushRecent(fid);if(isG){S.lastAmt=S.lastAmt||{};S.lastAmt[fid]=amt}close();afterAdd(k)}});
  });
}
function openQuick(pre){
  pre=pre||{};let meal=defaultMeal();
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","إضافة سريعة");
    sh.innerHTML=`<div class="grab"></div><h2>${pre.code?"منتج جديد":"إضافة سريعة"}</h2><p class="note" style="margin:2px 0 12px">${pre.code?"ما لقينا قيم هذا المنتج. اكتبها من الملصق مرة وحدة، والمرة الجاية تمسحه ويطلع لك على طول.":"أكلة مو موجودة؟ اكتب أرقامها من الملصق أو من موقع المطعم."}</p>
      <div class="stack" style="gap:10px">
      <div class="field"><label for="qkN">الاسم</label><input type="text" id="qkN" placeholder="مثال: ساندويتش حلوم" value="${esc(pre.name||"")}"></div>
      <div class="grid2"><div class="field"><label for="qkK">سعرات</label><input type="number" inputmode="decimal" id="qkK" placeholder="350"></div><div class="field"><label for="qkP">بروتين جم</label><input type="number" inputmode="decimal" id="qkP" placeholder="20"></div></div>
      <div class="grid2"><div class="field"><label for="qkC">كارب جم</label><input type="number" inputmode="decimal" id="qkC" placeholder="اختياري"></div><div class="field"><label for="qkF">دهون جم</label><input type="number" inputmode="decimal" id="qkF" placeholder="اختياري"></div></div>
      </div>
      ${pre.code?`<p class="note">القيم للحبة أو العلبة كاملة، مو لكل 100 جم.</p>`:""}
      <label class="check" ${pre.code?"hidden":""}><input type="checkbox" id="qkSave" checked> احفظها في أكلاتي</label>
      <div class="meals">${MEALS.map(m=>`<button data-m="${m}" aria-pressed="${m===meal}">${m}</button>`).join("")}</div>
      <button class="primary wide" id="qkGo">أضف</button>`;
    sh.querySelector("#qkN").focus();
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.m){meal=b.dataset.m;sh.querySelectorAll("[data-m]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.m===meal))}
      else if(b.id==="qkGo"){
        const n=sh.querySelector("#qkN").value.trim()||"إضافة سريعة",k=+sh.querySelector("#qkK").value,p=+sh.querySelector("#qkP").value||0,c=+sh.querySelector("#qkC").value||0,f=+sh.querySelector("#qkF").value||0;
        if(!(k>0&&k<5000))return toast("اكتب السعرات");
        const dk=targetDay();
        if(pre.code||sh.querySelector("#qkSave").checked){const item={fid:"c"+S.custom.length,n,cat:"أكلاتي",u:"pc",k,p,c,f,store:null};if(pre.code){item.code=pre.code;S.codes[pre.code]=item.fid}S.custom.push(item);day(dk).food.push({fid:item.fid,amt:1,meal});pushRecent(item.fid)}
        else day(dk).food.push({x:{n,u:"pc",k,p,c,f},amt:1,meal});
        close();afterAdd(dk);
      }});
  });
}
/* ===== تصوير الأكل =====
   الصورة تتصغر في الجهاز، وتروح لـ Claude عبر Supabase (food-photo)، وترجع أصناف قابلة للتعديل */
const PHOTO_ERR={nolic:"تصوير الأكل يحتاج كود التفعيل. اربطه من ملفي",limit:"خلصت محاولات التصوير اليوم. ترجع بكرة",nokey:"تصوير الأكل يتجهز، جرّبه بعد شوي",net:"تأكد إنك متصل بالنت وجرّب مرة ثانية",bad:"الصورة ما وصلت صح. جرّب مرة ثانية",ai:"ما قدرنا نقرأ الصورة. جرّب صورة أوضح",server:"صار خطأ عندنا. جرّب بعد شوي"};
const PHOTO_READY=false; /* خله true بعد ما ينحط مفتاح Claude في Supabase */
async function openPhoto(){
  if(!PHOTO_READY)return sheet((sh,close)=>{sh.innerHTML=`<div class="grab"></div><h2>صوّر أكلك</h2><p class="note" style="margin:6px 0 14px">معليش، الميزة ما جهزت للحين. قريب بإذن الله تصوّر صحنك وFORMA يحسب سعراته.</p><button class="primary wide" id="phOk">تمام</button>`;sh.querySelector("#phOk").onclick=close});
  if(!CL)return toast("حدّث الصفحة وجرّب");
  if(!CL.code())return sheet((sh,close)=>{sh.innerHTML=`<div class="grab"></div><h2>صوّر أكلك</h2><p class="note" style="margin:4px 0 14px">صوّر صحنك وFORMA يقدّر سعراته وبروتينه. الميزة تحتاج كود التفعيل عشان نحمي الخدمة.</p><button class="primary wide" id="phLink">اربط كودي</button>`;
    sh.querySelector("#phLink").onclick=()=>{close();tab="settings";render();setTimeout(()=>{const i=$("#licIn");if(i){i.scrollIntoView({block:"center"});i.focus()}},60)}});
  const file=await PF.pickImage();if(!file)return;
  let img;try{img=await PF.shrinkImage(file)}catch(e){return toast("ما قدرنا نفتح الصورة. جرّب صورة ثانية")}
  let meal=defaultMeal(),its=null,info=null,closed=false;
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","تقدير الأكل من الصورة");sh.classList.add("ph-sheet");sh._onclose=()=>{closed=true};
    const draw=()=>{
      if(!its){sh.innerHTML=`<div class="grab"></div><div class="ph-img"><img src="${img.url}" alt=""><div class="ph-scan" aria-hidden="true"></div></div><h2 class="center" style="margin-top:12px">FORMA يحسب...</h2><p class="note center">ثواني ويطلع لك التقدير</p>`;return}
      let t={k:0,p:0,c:0,f:0};its.forEach(it=>{t.k+=it.kcal;t.p+=it.protein;t.c+=it.carbs;t.f+=it.fat});
      sh.innerHTML=`<div class="grab"></div><div class="ph-top"><img src="${img.url}" alt=""><div><h2>${fmt(t.k)} سعرة</h2>${mx(t.p,t.c,t.f)}<span class="pill ${info.confidence==="high"?"":"mute"}">${info.confidence==="high"?"تقدير واثق":info.confidence==="low"?"تقدير تقريبي":"تقدير متوسط"}</span></div></div>
        <p class="note" style="margin:8px 0 10px">عدّل الجرامات إذا تعرف الكمية، والسعرات تتعدل معها.${info.note?" "+esc(info.note):""}</p>
        <div class="stack" style="gap:8px">${its.map((it,i)=>`<div class="ph-row"><div class="ph-n"><b>${esc(it.name)}</b><small class="num">${fmt(it.kcal)} سعرة · ${fmt(it.protein)} بروتين</small></div>
          <div class="ph-g"><input type="number" inputmode="numeric" data-pg="${i}" value="${it.grams||""}" aria-label="جرامات ${esc(it.name)}"><span>جم</span></div><button class="del" data-pd="${i}" aria-label="احذف ${esc(it.name)}">×</button></div>`).join("")}</div>
        <div class="meals" style="margin-top:12px">${MEALS.map(x=>`<button data-m="${x}" aria-pressed="${x===meal}">${x}</button>`).join("")}</div>
        <button class="primary wide" id="phAdd" style="margin-top:12px" ${its.length?"":"disabled"}>أضف لل${meal}</button>`};
    draw();
    CL.photo(img).then(res=>{
      if(closed)return;
      if(!res||res.error){close();return toast(PHOTO_ERR[res&&res.error]||PHOTO_ERR.server)}
      if(!res.food||!res.items||!res.items.length){close();return toast("ما لقينا أكل في الصورة. صوّر الصحن من فوق وبإضاءة زينة")}
      info=res;its=res.items.map(it=>({...it,base:{...it}}));PF.haptic("success");draw();
    });
    sh.addEventListener("change",e=>{const i=e.target.dataset.pg;if(i==null)return;const it=its[+i],v=parseFloat(e.target.value);if(!(v>0)||!it.base.grams)return;
      const k=v/it.base.grams;it.grams=v;["kcal","protein","carbs","fat"].forEach(f=>it[f]=Math.round(it.base[f]*k));draw()});
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.m){meal=b.dataset.m;return draw()}
      if(b.dataset.pd!=null){its.splice(+b.dataset.pd,1);return its.length?draw():close()}
      if(b.id==="phAdd"){const k=targetDay();its.forEach(it=>day(k).food.push({x:{n:it.name,u:"pc",k:it.kcal,p:it.protein,c:it.carbs,f:it.fat,src:"photo",g:it.grams||null},amt:1,meal}));close();afterAdd(k)}});
  });
}

/* ===== الباركود ===== */
const ZX_URL="https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js";
let zxLoad=null;
function loadZX(){if(window.ZXing)return Promise.resolve(window.ZXing);if(!zxLoad)zxLoad=new Promise((res,rej)=>{const s=document.createElement("script");s.src=ZX_URL;s.async=true;s.onload=()=>window.ZXing?res(window.ZXing):rej(new Error("zx"));s.onerror=()=>{zxLoad=null;rej(new Error("zx"))};document.head.appendChild(s)});return zxLoad}
async function makeDetector(){
  if("BarcodeDetector" in window){try{const fm=await BarcodeDetector.getSupportedFormats();if(fm.includes("ean_13")){const d=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128"].filter(x=>fm.includes(x))});return async v=>{const r=await d.detect(v);return r[0]&&r[0].rawValue}}}catch(e){}}
  const ZX=await loadZX();
  const hints=new Map();hints.set(ZX.DecodeHintType.POSSIBLE_FORMATS,[ZX.BarcodeFormat.EAN_13,ZX.BarcodeFormat.EAN_8,ZX.BarcodeFormat.UPC_A,ZX.BarcodeFormat.UPC_E,ZX.BarcodeFormat.CODE_128]);hints.set(ZX.DecodeHintType.TRY_HARDER,true);
  const reader=new ZX.MultiFormatReader();reader.setHints(hints);
  const cv=document.createElement("canvas"),cx=cv.getContext("2d",{willReadFrequently:true});
  return async v=>{const w=v.videoWidth,h=v.videoHeight;if(!w||!h)return null;
    const sx=w*0.08,sy=h*0.28,sw=w*0.84,sh=h*0.44,cw=Math.min(Math.round(sw),900),ch=Math.round(sh*cw/sw);cv.width=cw;cv.height=ch;cx.drawImage(v,sx,sy,sw,sh,0,0,cw,ch);
    try{const src=new ZX.HTMLCanvasElementLuminanceSource(cv);const r=reader.decodeWithState(new ZX.BinaryBitmap(new ZX.HybridBinarizer(src)));return r&&r.getText()}catch(e){return null}};
}
const cleanCode=s=>String(s||"").replace(/\D/g,"");
function openScan(){
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","امسح باركود");sh.classList.add("scan-sheet");
    sh.innerHTML=`<div class="grab"></div><div class="row"><h2>امسح الباركود</h2><span class="pill mute">منتجات مغلفة</span></div>
      <div class="scanbox"><video id="scV" playsinline muted autoplay></video><div class="scanframe"><i></i></div><div class="scanmsg" id="scM">نشغّل الكاميرا…</div></div>
      <form class="row" id="scF" style="margin-top:12px"><input type="text" inputmode="numeric" id="scIn" placeholder="أو اكتب رقم الباركود" aria-label="رقم الباركود" autocomplete="off" dir="ltr"><button class="primary" type="submit">دوّر</button></form>
      <p class="note" style="margin-top:8px">القيم من Open Food Facts، قاعدة مفتوحة. إذا المنتج مو موجود، تكتب قيمه مرة وحدة وFORMA يحفظه لك.</p>`;
    const v=sh.querySelector("#scV"),msg=sh.querySelector("#scM");let stream=null,alive=true,busy=false;
    const stop=()=>{alive=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}};
    sh._onclose=stop;
    const found=code=>{if(busy)return;code=cleanCode(code);if(code.length<6)return;busy=true;stop();if(navigator.vibrate)navigator.vibrate(60);msg.textContent="لقيته: "+code;close();lookupCode(code)};
    sh.querySelector("#scF").addEventListener("submit",e=>{e.preventDefault();const c=cleanCode(sh.querySelector("#scIn").value);if(c.length<6)return toast("اكتب رقم الباركود كامل");found(c)});
    (async()=>{
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg.textContent="الكاميرا ما تشتغل هنا. اكتب الرقم تحت.";return}
      try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}},audio:false})}
      catch(e){msg.textContent=e&&e.name==="NotAllowedError"?"اسمح للكاميرا من إعدادات المتصفح، أو اكتب الرقم تحت.":"ما قدرنا نفتح الكاميرا. اكتب الرقم تحت.";return}
      if(!alive){stop();return}
      v.srcObject=stream;try{await v.play()}catch(e){}
      let detect=null;try{detect=await makeDetector()}catch(e){msg.textContent="محتاج نت أول مرة عشان يشتغل الماسح. اكتب الرقم تحت.";return}
      msg.textContent="وجّه الكاميرا على الباركود";
      const loop=async()=>{if(!alive)return;try{const c=await detect(v);if(c)return found(c)}catch(e){}setTimeout(loop,180)};loop();
    })();
  });
}
async function lookupCode(code){
  const own=S.codes[code]&&getFood(S.codes[code]);
  if(own){pushRecent(own.fid);return openFood(own.fid)}
  if(!navigator.onLine)return openQuick({code});
  toast("ندوّر المنتج…");
  let pr=null;
  try{const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),9000);
    const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,product_name_ar,product_name_en,generic_name,brands,nutriments,serving_quantity,quantity`,{signal:ctl.signal});clearTimeout(tm);
    if(r.ok){const j=await r.json();if(j&&j.status===1)pr=j.product}}catch(e){}
  document.querySelectorAll(".toast").forEach(t=>t.remove());
  const nm=pr?(pr.product_name_ar||pr.product_name||pr.product_name_en||pr.generic_name||"").trim():"";
  const brand=pr&&pr.brands?String(pr.brands).split(",")[0].trim():"";
  const name=(nm&&brand&&!nm.includes(brand)?nm+" - "+brand:nm||brand)||"";
  const N=pr&&pr.nutriments||{};
  let k=N["energy-kcal_100g"];if(k==null&&N["energy_100g"]!=null)k=N["energy_100g"]/4.184;
  if(!pr||k==null||isNaN(+k))return openQuick({code,name});
  const rd=x=>x==null||isNaN(+x)?0:Math.round(+x*10)/10;
  const item={fid:"c"+S.custom.length,n:name||"منتج "+code,cat:"أكلاتي",u:"g",k:rd(k),p:rd(N.proteins_100g),c:rd(N.carbohydrates_100g),f:rd(N.fat_100g),store:null,code};
  S.custom.push(item);S.codes[code]=item.fid;
  const sq=+pr.serving_quantity;if(sq>0&&sq<2000){S.lastAmt=S.lastAmt||{};S.lastAmt[item.fid]=Math.round(sq)}
  save();openFood(item.fid);
}
function openPlan(){
  const g=G(),scale=g.kcal/2200;
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","خطتي المقترحة");
    sh.innerHTML=`<div class="grab"></div><h2>خطتك المقترحة</h2><p class="note" style="margin:2px 0 12px">الكميات محسوبة على ${fmt(g.kcal)} سعرة. اختر خيار من كل وجبة، وأي تركيبة توصلك لنفس الرقم تقريبا.</p>
    <div class="stack">${MEALS.map(m=>`<div><h3 style="margin-bottom:4px">${m}</h3><div class="list">${(PLAN[m]||[]).map((opt,i)=>{const items=opt.map(([n,gr])=>{const f=FOODS.find(x=>x.n===n);return f?{f,amt:Math.round(gr*scale/5)*5}:null}).filter(Boolean);const mm=items.reduce((a,it)=>{const x=macrosOf(it.f,it.amt);a.k+=x.k;a.p+=x.p;return a},{k:0,p:0});return `<button class="item" data-plan="${m}|${i}"><span class="n">${items.map(it=>esc(it.f.n)).join(" + ")}<small>${items.map(it=>it.amt+" جم").join(" · ")}</small></span><span class="m">${fmt(mm.k)} · ${fmt(mm.p)}ب</span><span class="plus" aria-hidden="true">+</span></button>`}).join("")}</div></div>`).join("")}</div>`;
    sh.addEventListener("click",e=>{const b=e.target.closest("[data-plan]");if(!b)return;const [m,i]=b.dataset.plan.split("|");const k=targetDay();
      PLAN[m][+i].forEach(([n,gr])=>{const f=FOODS.find(x=>x.n===n);if(f)day(k).food.push({fid:f.fid,amt:Math.round(gr*scale/5)*5,meal:m})});close();afterAdd(k)});
  });
}
function openSug(){
  sheet((sh,close)=>{
    const draw=()=>{const sg=suggestions(sugFilter);lastSug=sg.list;sh.innerHTML=`<div class="grab"></div><h2>محتار وش تاكل؟</h2><p class="note" style="margin:2px 0 10px">باقي لك ${fmt(Math.max(sg.R,0))} سعرة و ${fmt(Math.max(sg.P,0))} جم بروتين. هذي أقرب خيارات تقفلهم.</p>
      <div class="chips" style="margin-bottom:6px">${[["all","الكل"],["home","أكل بيت"],["rest","مطاعم"]].map(([k,l])=>`<button class="chip" data-sug="${k}" aria-pressed="${sugFilter===k}">${l}</button>`).join("")}</div>
      <div class="list">${sg.list.length?sg.list.map((c,i)=>`<button class="item" data-sugadd="${i}"><span class="n">${esc(c.label)}<small>${esc(c.sub)}${c.dense?' · <b class="hp">بروتين عالي</b>':""}</small></span><span class="m">${fmt(c.k)} · ${fmt(c.p)}ب</span><span class="plus" aria-hidden="true">+</span></button>`).join(""):`<div class="empty">${sg.R<120?"قربت تقفل سعراتك اليوم.":"ما فيه خيار يركب على الباقي. جرّب قسم ثاني."}</div>`}</div>`};
    draw();
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.sug){sugFilter=b.dataset.sug;draw()}
      else if(b.dataset.sugadd!==undefined){addSug(+b.dataset.sugadd);close()}});
  });
}
function addSug(i){const c=lastSug[i];if(!c)return;const k=today(),meal=defaultMeal();c.items.forEach(it=>{day(k).food.push({fid:it.fid,amt:it.amt,meal});pushRecent(it.fid)});afterAdd(k)}

/* ===== التمرين ===== */
let live=null,restAt=null,restTimer=null;
function vTrain(){
  const P=prog(),si=sessIdx(),s=P.sessions[si];
  if(!live||live.k!==S.prog+si)live={k:S.prog+si,v:{},open:0,start:null};
  const doneCnt=(n,sets)=>{let c=0;for(let j=0;j<sets;j++)if(live.v[n+"|"+j]&&live.v[n+"|"+j].d)c++;return c};
  const tot=s.ex.reduce((a,e)=>a+e[1],0),dn=s.ex.reduce((a,e,i)=>a+doneCnt(exName(si,i),e[1]),0);
  return `
  <div class="stack" style="gap:6px"><span class="lbl">${P.ar} · ${dL(P.days)} بالأسبوع · ${wkL(P.weeks)}</span><div class="row"><h1 class="num" dir="auto">${esc(sName(s.n))}</h1><span class="sub">جلسة ${Math.min(progDone()+1,progTotal())} من ${progTotal()}</span></div><div class="progress"><i style="width:${clamp(progDone()/progTotal()*100,0,100)}%"></i></div></div>
  <div class="chips" role="group" aria-label="الجلسات">${P.sessions.map((x,i)=>`<button class="chip num" data-sess="${i}" aria-pressed="${i===si}" dir="auto">${esc(sName(x.n))}</button>`).join("")}</div>
  ${live.start?`<div class="wk-stat"><span>المجموعات <b class="num">${dn}/${tot}</b></span><span>بدأت <b class="num" id="wkClock">${clockSince(live.start)}</b></span></div>`:""}
  <div class="card ex-list">${s.ex.map((e,i)=>{const n=exName(si,i),sets=e[1],reps=e[2],top=+String(reps).split("-").pop(),last=lastFor(n),best=bestFor(n);
    const up=last&&last.length>=sets&&last.slice(0,sets).every(x=>x[1]>=top),dc=doneCnt(n,sets),complete=dc>=sets,open=live.open===i;
    if(!open)return `<button class="ex ex-c ${complete?"ok":""}" data-exo="${i}"><span class="ex-ci" aria-hidden="true">${complete?"✓":i+1}</span><span class="ex-cn"><b dir="ltr">${esc(n)}</b>${arN(n)?`<i class="ex-ar">${arN(n)}</i>`:""}<small class="num">${sets} مجموعات · ${esc(reps)} عدات${up?` · <b class="up">زد الوزن</b>`:""}${S.exNotes[n]?" · فيه ملاحظة":""}</small></span><span class="ex-cc num">${complete?"خلص":dc?dc+"/"+sets:""}</span></button>`;
    return `<div class="ex open" id="exOpen"><div class="ex-h"><div style="min-width:0"><a href="${yt(n)}" target="_blank" rel="noopener">${esc(n)} ↗</a>${arN(n)?`<div class="ex-ar">${arN(n)}</div>`:""}
      <div class="meta"><span class="pill mute num">${sets} مجموعات</span><span class="pill mute num">${reps} عدات</span>${up?`<span class="pill">زد الوزن</span>`:""}${n!==e[0]?`<span class="pill mute">بديل</span>`:""}</div></div>
      <div class="ex-tools">${last?`<button class="swap" data-hist="${esc(n)}" aria-label="سجل ${esc(n)}">${ICON.chart}</button>`:""}${ALTS[e[0]]||n!==e[0]?`<button class="swap" data-swap="${i}">بدّل</button>`:""}</div></div>
    <div class="sets"><span class="h">#</span><span class="h">كغ</span><span class="h">عدات</span><span class="h">تم</span>
    ${Array.from({length:sets},(_,j)=>{const v=live.v[n+"|"+j]||{},ph=last&&last[j]?last[j]:["",""],isPr=best&&+v.kg>best;
      return `<span class="h num">${j+1}</span><input type="number" inputmode="decimal" class="${isPr?"pr":""}" aria-label="${esc(n)} مجموعة ${j+1} وزن" data-k="${esc(n)}|${j}|kg" data-best="${best}" placeholder="${ph[0]}" value="${v.kg??""}"><input type="number" inputmode="numeric" aria-label="${esc(n)} مجموعة ${j+1} عدات" data-k="${esc(n)}|${j}|r" placeholder="${ph[1]||String(reps).split("-")[0]}" value="${v.r??""}"><button class="done" data-done="${esc(n)}|${j}" aria-pressed="${!!v.d}" aria-label="تمت المجموعة">✓</button>`}).join("")}</div><textarea class="ex-note" data-note="${esc(n)}" rows="1" placeholder="ملاحظة: رقم الكرسي، المسكة..." aria-label="ملاحظات ${esc(n)}">${esc(S.exNotes[n]||"")}</textarea>${i<s.ex.length-1?`<button class="ghost ex-next" data-exo="${i+1}">التمرين الجاي ‹</button>`:""}</div>`}).join("")}
  </div>
  <button class="primary" id="finish">خلصت التمرين</button>
  <div class="tr-more"><button class="ed-add" id="openEdit">عدّل الجدول</button></div>
  <details class="card flat tr-guide"><summary>طريقة التمرين في FORMA ‹</summary><ul class="guide" style="margin-top:8px">
    <li>اكتب الوزن والعدات لكل مجموعة. الخانة الفاضية تاخذ رقم المرة الماضية، فإذا كررته اضغط ✓ بس.</li>
    <li>وقّف قبل الفشل بعدة أو عدتين. آخر مجموعة في تمارين العزل كمّلها للفشل.</li>
    <li>إذا وصلت أعلى العدات في كل المجموعات، يطلع لك "زد الوزن" المرة الجاية.</li>
    <li>الجهاز مشغول؟ اضغط "بدّل" واختر بديل.</li><li>تبي تغيّر التمارين أو المجموعات أو العدات؟ اضغط "عدّل الجدول".</li></ul></details>`;
}
function openSwap(i){
  const si=sessIdx(),orig=prog().sessions[si].ex[i][0],cur=exName(si,i),opts=[orig,...(ALTS[orig]||[])];
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","بدّل التمرين");
    sh.innerHTML=`<div class="grab"></div><h2>بدّل التمرين</h2><p class="note" style="margin:2px 0 10px">التبديل يثبت لهذي الجلسة في كل الأسابيع الجاية.</p><div class="seg" style="grid-template-columns:1fr">${opts.map(o=>`<button data-alt="${esc(o)}" aria-pressed="${o===cur}" dir="ltr" class="num">${esc(o)}${o===orig?' <small dir="rtl">الأساسي</small>':""}${arN(o)?`<span class="ex-ar" dir="rtl">${arN(o)}</span>`:""}</button>`).join("")}</div>`;
    sh.addEventListener("click",e=>{const b=e.target.closest("[data-alt]");if(!b)return;const sw=S.swaps[S.prog]=S.swaps[S.prog]||{};if(b.dataset.alt===orig)delete sw[si+"|"+i];else sw[si+"|"+i]=b.dataset.alt;save();close();render()});
  });
}
const arN=n=>(window.FORMA_AR||{})[n]||"";
const clockSince=t=>{const s=Math.max(0,Math.floor((Date.now()-t)/1000)),m=Math.floor(s/60);return m>=60?Math.floor(m/60)+":"+pad(m%60)+":"+pad(s%60):m+":"+pad(s%60)};
/* الراحة: التمارين الثقيلة أطول */
const restFor=reps=>{const top=+String(reps).split("-").pop()||10;return top<=8?150:top<=12?120:90};
let restGoal=120,restBuzz=false;
function startRest(goal){
  restAt=Date.now();restGoal=goal||120;restBuzz=false;clearInterval(restTimer);
  let el=$("#rest");if(!el){el=document.createElement("div");el.id="rest";el.className="rest";el.setAttribute("role","timer");document.body.appendChild(el)}
  const tick=()=>{const ck=$("#wkClock");if(ck&&live&&live.start)ck.textContent=clockSince(live.start);
    if(!restAt||tab!=="train"){el.remove();if(!restAt)clearInterval(restTimer);return}
    const s=Math.floor((Date.now()-restAt)/1000),left=restGoal-s,ready=left<=0;
    if(ready&&!restBuzz){restBuzz=true;if(navigator.vibrate)navigator.vibrate([120,80,120])}
    el.classList.toggle("ready",ready);
    el.innerHTML=`<span>${ready?"يلا المجموعة الجاية":"راحة"}</span><b class="num">${ready?"+"+Math.floor(-left/60)+":"+pad(-left%60):Math.floor(left/60)+":"+pad(left%60)}</b><button data-rs="30" aria-label="زد 30 ثانية">+30</button><button data-rs="x" aria-label="أوقف المؤقت">×</button>`;
    el.querySelectorAll("button").forEach(b=>b.onclick=()=>{if(b.dataset.rs==="x"){restAt=null;el.remove()}else{restGoal+=30;restBuzz=false;tick()}})};
  tick();restTimer=setInterval(tick,1000);
}
function exHist(n){
  const rows=[];S.history.forEach(h=>{const ss=h.sets&&h.sets[n];if(!ss||!ss.length)return;const top=ss.reduce((a,b)=>b[0]>a[0]||(b[0]===a[0]&&b[1]>a[1])?b:a,ss[0]);const e1=Math.max(...ss.map(x=>x[0]*(1+Math.min(x[1],12)/30)));rows.push({date:h.date,ss,top,e1:Math.round(e1*10)/10,vol:ss.reduce((a,x)=>a+x[0]*x[1],0)})});
  return rows;
}
function openHist(n){
  const rows=exHist(n);if(!rows.length)return toast("ما فيه سجل لهذا التمرين");
  const best=Math.max(...rows.map(r=>r.top[0])),bestE=Math.max(...rows.map(r=>r.e1));
  let chart="";
  if(rows.length>1){const rs=rows.slice(-12),W=320,H=140,L=34,vals=rs.map(r=>r.e1),mn=Math.floor(Math.min(...vals)*0.95),mx=Math.ceil(Math.max(...vals)*1.03);
    const X=i=>L+i*(W-L-12)/(rs.length-1),Y=v=>12+(mx-v)*(H-40)/((mx-mn)||1);
    chart=`<svg viewBox="0 0 ${W} ${H}" class="plan-chart" role="img" aria-label="تقدمك في ${esc(n)}">${[mn,mx].map(t=>`<line x1="${L}" x2="${W-12}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(t)+4}" text-anchor="end">${t}</text>`).join("")}
      <polyline points="${rs.map((r,i)=>X(i)+","+Y(r.e1)).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${rs.map((r,i)=>`<circle cx="${X(i)}" cy="${Y(r.e1)}" r="3.5" fill="var(--accent)"/>`).join("")}
      <text x="${L}" y="${H-8}">⁧${dateAr(rs[0].date)}⁩</text><text x="${W-12}" y="${H-8}" text-anchor="end">⁧${dateAr(rs[rs.length-1].date)}⁩</text></svg><div class="legend"><span><b style="background:var(--accent)"></b>أقصى تكرار تقديري (1RM)</span></div>`}
  sheet((sh,close)=>{sh.setAttribute("aria-label","سجل "+n);
    sh.innerHTML=`<div class="grab"></div><h2 dir="ltr" style="text-align:right">${esc(n)}</h2><div class="stats" style="margin:10px 0"><div class="stat"><b class="num">${best}</b><span>أثقل وزن كغ</span></div><div class="stat"><b class="num">${bestE}</b><span>1RM تقديري</span></div><div class="stat"><b class="num">${rows.length}</b><span>جلسات</span></div></div>
      ${chart}<div class="list" style="margin-top:8px">${rows.slice(-8).reverse().map(r=>`<div class="item"><span class="n">${dateAr(r.date)}<small class="num" dir="ltr" style="text-align:right">${r.ss.map(x=>x[0]+"×"+x[1]).join("  ·  ")}</small></span><span class="m num">${r.e1}</span></div>`).join("")}</div>`});
}
function finish(){
  const P=prog(),si=sessIdx(),s=P.sessions[si],sets={},prs=[];
  s.ex.forEach((e,i)=>{const n=exName(si,i),cnt=e[1],last=lastFor(n),best=bestFor(n),arr=[];
    for(let j=0;j<cnt;j++){const v=live.v[n+"|"+j]||{},ph=last&&last[j];
      const use=v.d||v.kg||v.r;
      const kg=+(v.kg||(use&&ph?ph[0]:0)),r=+(v.r||(use&&ph?ph[1]:0));
      if(kg>0||r>0)arr.push([kg,r])}
    if(arr.length){sets[n]=arr;const top=Math.max(...arr.map(x=>x[0]));if(best&&top>best)prs.push(n)}});
  if(!Object.keys(sets).length)return toast("سجّل مجموعة وحدة على الأقل");
  const T=today(),dur=live.start?Math.max(1,Math.round((Date.now()-live.start)/60000)):null;
  let vol=0,nsets=0;Object.values(sets).forEach(a=>a.forEach(x=>{vol+=x[0]*x[1];nsets++}));
  const entry={date:T,prog:S.prog,s:si,sets,dur,vol:Math.round(vol),prs};
  S.history.push(entry);day(T).trained=true;
  S.sessionIdx=(si+1)%P.sessions.length;live=null;restAt=null;save();tab="today";render();
  openDone(entry,sName(s.n),P.sessions[S.sessionIdx]);
}
/* احتفال: اهتزاز + قصاصات ملونة */
function confetti(){
  if(PF.reducedMotion())return;
  const box=document.createElement("div");box.className="confetti";box.setAttribute("aria-hidden","true");
  const cols=["var(--accent)","var(--hot)","#E8B931","#5B6CC9","var(--ink)"];
  box.innerHTML=Array.from({length:34},(_,i)=>`<i style="left:${Math.random()*100}%;background:${cols[i%cols.length]};animation-delay:${(Math.random()*.25).toFixed(2)}s;--x:${(Math.random()*120-60).toFixed(0)}px;--r:${(Math.random()*720-360).toFixed(0)}deg"></i>`).join("");
  document.body.appendChild(box);setTimeout(()=>box.remove(),2200);
}
function celebrate(msg){PF.haptic("success");toast(msg);confetti()}
function openDone(h,title,nx){
  const nsets=Object.values(h.sets).reduce((a,x)=>a+x.length,0);
  if(h.prs.length)setTimeout(confetti,250);PF.haptic("success");
  sheet((sh,close)=>{sh.setAttribute("aria-label","خلصت التمرين");
    sh.innerHTML=`<div class="grab"></div><div class="done-h"><span class="pill">${h.prs.length?"رقم قياسي جديد":"انحفظ تمرينك"}</span><h2>كفو! خلصت ${esc(title)}</h2></div>
      <div class="stats" style="margin:12px 0"><div class="stat"><b class="num">${h.dur??"-"}</b><span>دقيقة</span></div><div class="stat"><b class="num">${nsets}</b><span>مجموعة</span></div><div class="stat"><b class="num">${fmt(h.vol)}</b><span>كغ رفعتها</span></div></div>
      ${h.prs.length?`<div class="list">${h.prs.map(n=>`<div class="item"><span class="n" dir="ltr" style="text-align:right">${esc(n)}</span><span class="pill">${Math.max(...h.sets[n].map(x=>x[0]))} كغ</span></div>`).join("")}</div>`:""}
      <p class="note" style="margin:8px 0 12px">الجاي: ${esc(sName(nx.n))}. ريّح العضلة اللي اشتغلت 48 ساعة.</p>
      <div class="grid2"><button class="primary" id="shareW">${ICON.share} شارك</button><button id="doneOk">تم</button></div>`;
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.id==="doneOk")close();if(b.id==="shareW"){close();shareWorkout(h,title)}});
  });
}

/* ===== بطاقات المشاركة ===== */
function svgImg(el,w,h,color){return new Promise(res=>{if(!el)return res(null);const c=el.cloneNode(true);c.setAttribute("xmlns","http://www.w3.org/2000/svg");c.setAttribute("width",w);c.setAttribute("height",h);c.removeAttribute("class");
  let t=new XMLSerializer().serializeToString(c).replace(/currentColor/g,color);const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(t)})}
async function cardBase(){
  const W=1080,H=1920,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");
  try{await Promise.all(["800 90px Alexandria","700 40px Alexandria","700 40px Almarai","400 36px Almarai"].map(f=>document.fonts.load(f)))}catch(e){}
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,"#010101");g.addColorStop(1,"#162329");x.fillStyle=g;x.fillRect(0,0,W,H);
  const rg=x.createRadialGradient(W*0.85,H*0.12,10,W*0.85,H*0.12,700);rg.addColorStop(0,"rgba(141,169,173,.34)");rg.addColorStop(1,"rgba(141,169,173,0)");x.fillStyle=rg;x.fillRect(0,0,W,H);
  const lg=document.querySelector("#hdr .logo");const mk=await svgImg(lg&&lg.querySelector(".mk"),150,150,"#fff"),wm=await svgImg(lg&&lg.querySelector(".wm"),348,60,"#DBEAE5");
  if(mk)x.drawImage(mk,90,110,150,150);if(wm)x.drawImage(wm,270,155,348,60);
  x.direction="rtl";x.textAlign="right";
  return {cv,x,W,H};
}
const F1='"Alexandria","Almarai",sans-serif',F2='"Almarai","Alexandria",sans-serif';
function txt(x,s,px,y,o){o=o||{};x.font=`${o.w||700} ${px}px ${o.f||F1}`;x.fillStyle=o.c||"#DBEAE5";x.direction=o.dir||"rtl";x.textAlign=o.al||"right";x.fillText(s,o.x??990,y,o.max||900)}
function rr(x,X,Y,w,h,r,fill){x.beginPath();x.roundRect?x.roundRect(X,Y,w,h,r):x.rect(X,Y,w,h);x.fillStyle=fill;x.fill()}
function statBoxes(x,y,items){const w=280,gap=30;items.forEach((it,i)=>{const X=990-w-(i*(w+gap));rr(x,X,y,w,200,36,"rgba(255,255,255,.06)");txt(x,it[0],76,y+105,{x:X+w/2,al:"center",dir:"ltr",w:800});txt(x,it[1],34,y+160,{x:X+w/2,al:"center",c:"#8DA9AD",f:F2,w:400})})}
function cardFoot(x,H){txt(x,"سجّل أكلك وتمرينك بالعربي",40,H-210,{c:"#8DA9AD",f:F2,w:700});txt(x,"forma-app1.github.io/Forma",40,H-150,{c:"#5FD8CB",dir:"ltr",w:700})}
async function shareWorkout(h,title){
  const {cv,x,W,H}=await cardBase();
  txt(x,dateAr(h.date),40,400,{c:"#8DA9AD",f:F2});
  txt(x,"خلصت "+title,96,510,{w:800});
  txt(x,(getProg(h.prog)||{ar:""}).ar,40,580,{c:"#5FD8CB"});
  const nsets=Object.values(h.sets).reduce((a,s)=>a+s.length,0);
  statBoxes(x,650,[[String(h.dur??"-"),"دقيقة"],[String(nsets),"مجموعة"],[fmt(h.vol),"كغ رفعتها"]]);
  let y=960;
  if(h.prs&&h.prs.length){rr(x,90,y-70,900,110,30,"rgba(95,216,203,.16)");txt(x,"رقم قياسي جديد: ",44,y,{c:"#5FD8CB",w:800});txt(x,h.prs[0]+" · "+Math.max(...h.sets[h.prs[0]].map(s=>s[0]))+" kg",40,y,{x:130,al:"left",dir:"ltr",max:560});y+=140}
  Object.entries(h.sets).slice(0,7).forEach(([n,ss])=>{const top=ss.reduce((a,b)=>b[0]>a[0]?b:a,ss[0]);
    x.fillStyle="rgba(255,255,255,.08)";x.fillRect(90,y+34,900,2);
    txt(x,n,40,y,{x:90,al:"left",dir:"ltr",w:700,max:640});txt(x,top[0]?top[0]+"×"+top[1]:top[1]+" reps",40,y,{x:990,al:"right",dir:"ltr",c:"#8DA9AD"});y+=96});
  cardFoot(x,H);openShare(cv,"forma-workout.png","خلصت تمريني مع FORMA");
}
async function shareProgress(){
  const p=S.profile,cw=currentWeight(),startW=p.startW||p.w,diff=r1(cw-startW),days=Math.max(1,daysBetween(p.start||today(),today())+1);
  const {cv,x,W,H}=await cardBase();
  txt(x,"من "+dateAr(p.start||today())+" لليوم",40,400,{c:"#8DA9AD",f:F2});
  const big=diff===0?"ثابت":(diff<0?"نزلت ":"زدت ")+Math.abs(diff)+" كغ";
  txt(x,big,130,560,{w:800,c:"#5FD8CB"});
  txt(x,"في "+dL(days),56,650,{w:700});
  const trained=S.history.filter(h=>!p.start||h.date>=p.start).length;
  statBoxes(x,740,[[String(r1(cw)),"وزني الحين"],[String(trained),"تمرين"],[String(streak()),"يوم متتالي"]]);
  const ws=weightsSorted().filter(w=>!p.start||w[0]>=p.start).slice(-30);
  if(ws.length>1){const X0=90,X1=990,Y0=1050,Y1=1500,v=ws.map(w=>w[1]),mn=Math.min(...v)-0.5,mx=Math.max(...v)+0.5;
    const X=i=>X0+i*(X1-X0)/(ws.length-1),Y=val=>Y0+(mx-val)*(Y1-Y0)/(mx-mn);
    x.strokeStyle="#5FD8CB";x.lineWidth=10;x.lineCap="round";x.lineJoin="round";x.beginPath();ws.forEach((w,i)=>{const sl=v.slice(Math.max(0,i-6),i+1),a=sl.reduce((q,b)=>q+b,0)/sl.length;i?x.lineTo(X(i),Y(a)):x.moveTo(X(i),Y(a))});x.stroke();
    txt(x,"متوسط وزني",34,Y1+80,{c:"#8DA9AD",f:F2,w:400})}
  cardFoot(x,H);openShare(cv,"forma-progress.png","تقدمي مع FORMA");
}
function openShare(cv,name,title){
  cv.toBlob(blob=>{if(!blob)return toast("ما قدرنا نسوي الصورة");
    const url=URL.createObjectURL(blob),file=new File([blob],name,{type:"image/png"});
    const can=navigator.canShare&&navigator.canShare({files:[file]});
    sheet((sh,close)=>{sh.setAttribute("aria-label","شارك");sh._onclose=()=>setTimeout(()=>URL.revokeObjectURL(url),500);
      sh.innerHTML=`<div class="grab"></div><h2>جاهزة للسناب والانستا</h2><img src="${url}" alt="بطاقة FORMA" class="share-img">
        <div class="grid2" style="margin-top:12px">${can?`<button class="primary" id="shGo">${ICON.share} شارك</button>`:""}<a class="btn ${can?"":"primary"}" id="shDl" href="${url}" download="${name}">احفظ الصورة</a></div>
        <p class="note" style="margin-top:8px">${can?"":"على الآيفون: اضغط مطول على الصورة واختر حفظ."}</p>`;
      const go=sh.querySelector("#shGo");if(go)go.onclick=async()=>{try{await navigator.share({files:[file],title})}catch(e){}};
    });
  },"image/png");
}

/* ===== قل وش أكلت ===== */
const SRC=window.SpeechRecognition||window.webkitSpeechRecognition,SR=!!SRC;
let rec=null;
function listen(btn){
  if(rec){try{rec.stop()}catch(e){}return}
  try{rec=new SRC();rec.lang="ar-SA";rec.interimResults=true;rec.continuous=false}catch(e){rec=null;return toast("المايك ما اشتغل. استخدم مايك الكيبورد")}
  const inp=$("#sayIn");btn.classList.add("on");
  rec.onresult=e=>{let t="";for(const r of e.results)t+=r[0].transcript;inp.value=t};
  rec.onerror=e=>{toast(e.error==="not-allowed"?"اسمح للمايك من إعدادات المتصفح":"ما سمعتك زين. جرّب مرة ثانية")};
  rec.onend=()=>{btn.classList.remove("on");rec=null;if(inp.value.trim())openSay(inp.value)};
  try{rec.start()}catch(e){rec=null;btn.classList.remove("on")}
}
function openSay(text){
  text=String(text||"").trim();if(!text)return toast("اكتب وش أكلت");
  if(!window.FORMA_SAY)return toast("حدّث الصفحة وجرّب");
  const res=FORMA_SAY.parse(text,{foods:FOODS.concat(S.custom),stores:[...RESTS,"الحطب","المراعي","ندى"],recent:S.recent,lastAmt:S.lastAmt,learned:S.learned||{}});
  if(!res.items.length){q=res.miss[0]||text;const qi=$("#sayIn");if(qi)qi.value=q;renderResults();return toast("ما عرفتها. اختر من القائمة أو أضفها بنفسك")}
  let meal=res.meal||defaultMeal();
  const its=res.items.map(it=>({...it,fid:it.f.fid}));
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","تأكيد الأكل");
    const draw=()=>{
      let tk=0,tp=0;its.forEach(it=>{const m=macrosOf(getFood(it.fid),it.amt);tk+=m.k;tp+=m.p});
      sh.innerHTML=`<div class="grab"></div><h2>فهمت كذا</h2><p class="note" style="margin:2px 0 10px">تأكد من الأكلة والكمية. اضغط الاسم إذا تبي غيره.</p>
      <div class="stack" style="gap:10px">${its.map((it,i)=>{const f=getFood(it.fid),m=macrosOf(f,it.amt);return `<div class="say-row">
        <select class="say-sel" data-si="${i}" aria-label="الأكلة">${it.alts.map(a=>`<option value="${a.fid}" ${a.fid===it.fid?"selected":""}>${esc(a.n)}</option>`).join("")}</select>
        <div class="row" style="gap:8px"><input type="number" inputmode="decimal" class="say-amt" data-sa="${i}" value="${it.amt}" aria-label="الكمية"><span class="sub" style="white-space:nowrap">${f.u==="g"?"جم":"حبة"}</span><span class="m num say-m" style="margin-inline-start:auto;white-space:nowrap" data-sm="${i}"><span><b>${fmt(m.k)}</b> سعرة</span>${mx(m.p,f.c==null?null:m.c,f.f==null?null:m.f)}</span><button class="del" data-sd="${i}" aria-label="احذف">×</button></div>
      </div>`}).join("")}
      ${res.miss.map(x=>`<div class="note">ما عرفت "${esc(x)}". <button class="ghost" data-sq="${esc(x)}" style="padding:0 4px">دوّرها</button></div>`).join("")}</div>
      <div class="meals" style="margin-top:12px">${MEALS.map(x=>`<button data-m="${x}" aria-pressed="${x===meal}">${x}</button>`).join("")}</div>
      <button class="primary wide" id="sayAdd" style="margin-top:12px" ${its.length?"":"disabled"}>أضف ${fmt(tk)} سعرة · ${fmt(tp)} بروتين</button>`};
    draw();
    sh.addEventListener("change",e=>{const i=e.target.dataset.si;if(i==null)return;const it=its[+i],f=getFood(e.target.value);if(!f)return;
      it.fid=f.fid;it.amt=Math.round(FORMA_SAY.amtFor(f,{...it.q,last:S.lastAmt&&S.lastAmt[f.fid]})*100)/100;S.learned=S.learned||{};S.learned[it.key]=f.fid;draw()});
    sh.addEventListener("input",e=>{const i=e.target.dataset.sa;if(i==null)return;const v=parseFloat(e.target.value);if(!(v>0))return;its[+i].amt=v;
      const ff=getFood(its[+i].fid),m=macrosOf(ff,v);sh.querySelector(`[data-sm="${i}"]`).innerHTML=`<span><b>${fmt(m.k)}</b> سعرة</span>${mx(m.p,ff.c==null?null:m.c,ff.f==null?null:m.f)}`;
      let tk=0,tp=0;its.forEach(it=>{const mm=macrosOf(getFood(it.fid),it.amt);tk+=mm.k;tp+=mm.p});sh.querySelector("#sayAdd").textContent=`أضف ${fmt(tk)} سعرة · ${fmt(tp)} بروتين`});
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.m){meal=b.dataset.m;return draw()}
      if(b.dataset.sd!=null){its.splice(+b.dataset.sd,1);if(!its.length&&!res.miss.length)return close();return draw()}
      if(b.dataset.sq!=null){close();q=b.dataset.sq;const qi=$("#sayIn");if(qi)qi.value=q;renderResults();qi&&qi.focus();return}
      if(b.id==="sayAdd"){const k=targetDay();its.forEach(it=>{if(it.amt>0){day(k).food.push({fid:it.fid,amt:it.amt,meal});pushRecent(it.fid)}});
        close();afterAdd(k)}});
  });
}

/* ===== تعديل الجدول ===== */
let ed=null;
const LIB=(()=>{const s=new Set();Object.values(PROGRAMS).forEach(p=>p.sessions.forEach(x=>x.ex.forEach(e=>s.add(e[0]))));Object.entries(ALTS).forEach(([k,v])=>{s.add(k);v.forEach(x=>s.add(x))});return [...s].sort((a,b)=>a.localeCompare(b))})();
function openEditor(k){
  let sessions,name="",weeks=8;
  if(k==="mine"&&!S.mine){sessions=[{n:"اليوم 1",ex:[]}];name="جدولي"}
  else{const p=getProg(k);weeks=p.weeks;name=p.ar;sessions=p.sessions}
  if(k===S.prog)sessions=sessions.map((s,si)=>({...s,ex:s.ex.map((e,i)=>[exName(si,i),e[1],e[2]])}));
  ed={k,name,weeks,sessions:JSON.parse(JSON.stringify(sessions))};
  tab="edit";render();
}
function vEdit(){
  if(!ed)openEditor(S.prog);
  const mine=ed.k==="mine",base=mine?null:PROGRAMS[ed.k];
  return `<div><h1>${mine?"جدولك الخاص":"عدّل الجدول"}</h1><div class="sub">${mine?"حط التمارين اللي تبيها، بالترتيب اللي يناسبك.":esc(base.ar)+". غيّر التمارين والمجموعات والعدات على كيفك."}</div></div>
  ${mine?`<div class="card grid2"><div class="field"><label for="edPn">اسم الجدول</label><input type="text" id="edPn" data-ed="pn" value="${esc(ed.name)}"></div><div class="field"><label for="edWk">كم أسبوع</label><input type="number" inputmode="numeric" id="edWk" data-ed="wk" value="${esc(ed.weeks)}"></div></div>`:""}
  ${ed.sessions.map((s,si)=>`<div class="card stack ed-day">
    <div class="row"><input type="text" class="ed-sn" data-ed="sn|${si}" aria-label="اسم اليوم" value="${esc(s.n)}" dir="auto">${ed.sessions.length>1?`<button class="swap" data-edx="delS|${si}">احذف اليوم</button>`:""}</div>
    ${s.ex.length?s.ex.map((e,i)=>`<div class="ed-ex">
      <div class="ed-top"><button class="ed-name num" data-edx="rep|${si}|${i}" dir="ltr">${esc(e[0])}</button>
        <div class="ed-move"><button data-edx="up|${si}|${i}" aria-label="فوق" ${i?"":"disabled"}>↑</button><button data-edx="dn|${si}|${i}" aria-label="تحت" ${i<s.ex.length-1?"":"disabled"}>↓</button><button data-edx="rm|${si}|${i}" aria-label="احذف التمرين" class="ed-rm">×</button></div></div>
      <div class="ed-ctl"><span class="flabel">مجموعات</span><div class="ed-step"><button data-edx="sm|${si}|${i}" aria-label="أنقص مجموعة">−</button><b class="num">${e[1]}</b><button data-edx="sp|${si}|${i}" aria-label="زد مجموعة">+</button></div>
        <span class="flabel">عدات</span><input type="text" inputmode="text" class="ed-reps num" data-ed="r|${si}|${i}" aria-label="العدات" value="${esc(e[2])}" placeholder="8-12" dir="ltr"></div>
    </div>`).join(""):`<div class="empty">ما فيه تمارين. أضف أول تمرين.</div>`}
    <button class="ed-add" data-edx="add|${si}">+ أضف تمرين</button>
  </div>`).join("")}
  ${ed.sessions.length<7?`<button data-edx="addS">+ أضف يوم</button>`:""}
  <button class="primary wide" id="edSave">احفظ الجدول</button>
  ${!mine&&S.edits[ed.k]?`<button class="ghost" id="edReset">رجّع جدول FORMA الأصلي</button>`:""}
  ${mine&&S.mine?`<button class="ghost" id="edReset">احذف جدولي الخاص</button>`:""}
  <button class="ghost" data-go="${mine?"settings":"train"}">إلغاء</button>`;
}
function keepScroll(){const y=window.scrollY;render();window.scrollTo(0,y)}
function renderTrainKeep(){const y=window.scrollY;render();window.scrollTo(0,y)}
function renderTrainAt(){render();const el=$("#exOpen");if(el){const top=el.getBoundingClientRect().top+window.scrollY-80;window.scrollTo({top:Math.max(0,top),behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})}}
function edAction(x){
  const [a,si,i]=x.split("|"),s=ed.sessions[+si];
  if(a==="sm"){s.ex[+i][1]=Math.max(1,s.ex[+i][1]-1)}
  else if(a==="sp"){s.ex[+i][1]=Math.min(10,s.ex[+i][1]+1)}
  else if(a==="up"&&+i>0){const t=s.ex[+i];s.ex[+i]=s.ex[+i-1];s.ex[+i-1]=t}
  else if(a==="dn"&&+i<s.ex.length-1){const t=s.ex[+i];s.ex[+i]=s.ex[+i+1];s.ex[+i+1]=t}
  else if(a==="rm"){s.ex.splice(+i,1)}
  else if(a==="delS"){ed.sessions.splice(+si,1)}
  else if(a==="addS"){ed.sessions.push({n:"اليوم "+(ed.sessions.length+1),ex:[]});keepScroll();return window.scrollTo(0,document.body.scrollHeight)}
  else if(a==="add")return pickEx(n=>{s.ex.push([n,3,"8-12"]);keepScroll()});
  else if(a==="rep")return pickEx(n=>{s.ex[+i][0]=n;keepScroll()},s.ex[+i][0]);
  keepScroll();
}
function pickEx(cb,cur){
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","اختر تمرين");
    sh.innerHTML=`<div class="grab"></div><h2>${cur?"بدّل التمرين":"أضف تمرين"}</h2><p class="note" style="margin:2px 0 10px">ابحث بالإنجليزي، أو اكتب اسم أي تمرين تبيه.</p>
      <input type="search" id="exQ" placeholder="مثال: Row أو Curl" dir="auto" autocomplete="off"><div class="list" id="exL" style="max-height:48vh;overflow:auto;margin-top:8px"></div>`;
    const q=sh.querySelector("#exQ"),L=sh.querySelector("#exL");
    const draw=()=>{const t=q.value.trim(),tl=t.toLowerCase(),m=LIB.filter(n=>!tl||n.toLowerCase().includes(tl)).slice(0,60);
      const exact=LIB.some(n=>n.toLowerCase()===tl);
      L.innerHTML=(t&&!exact?`<button class="item" data-pick="${esc(t)}"><span class="n">أضف "${esc(t)}"<small>تمرين جديد باسمك</small></span><span class="plus" aria-hidden="true">+</span></button>`:"")+
        m.map(n=>`<button class="item" data-pick="${esc(n)}"><span class="n num" dir="ltr" style="text-align:right">${esc(n)}</span>${n===cur?'<span class="pill mute">الحالي</span>':'<span class="plus" aria-hidden="true">+</span>'}</button>`).join("")||`<div class="empty">اكتب اسم التمرين وأضفه.</div>`};
    q.addEventListener("input",draw);draw();
    L.addEventListener("click",e=>{const b=e.target.closest("[data-pick]");if(!b)return;close();cb(b.dataset.pick)});
  });
}
function edSave(){
  const ss=ed.sessions.filter(s=>s.ex.length);
  if(!ss.length)return toast("أضف تمرين واحد على الأقل");
  if(ss.length<ed.sessions.length)return toast("فيه يوم بدون تمارين. أضف له تمرين أو احذفه");
  ss.forEach((s,i)=>{s.n=String(s.n||"").trim()||("اليوم "+(i+1));s.ex.forEach(e=>{e[2]=String(e[2]||"").replace(/\s/g,"")||"8-12"})});
  if(ed.k==="mine"){
    const wk=clamp(Math.round(+ed.weeks||8),1,52);
    const first=!S.mine;S.mine={name:String(ed.name||"").trim()||"جدولي",weeks:wk,sessions:ss};
    if(first||S.prog!=="mine"){S.prog="mine";S.sessionIdx=0;S.progStart=today()}
  }else S.edits[ed.k]=ss;
  delete S.swaps[ed.k];
  if(S.prog===ed.k)S.sessionIdx=Math.min(S.sessionIdx,ss.length-1);
  live=null;ed=null;save();tab="train";render();toast("انحفظ جدولك");
}
function edReset(){
  if(ed.k==="mine"){S.mine=null;if(S.prog==="mine"){S.prog=DEFP;S.sessionIdx=0;S.progStart=today()}ed=null;save();tab="settings";render();return toast("انحذف جدولك الخاص")}
  delete S.edits[ed.k];delete S.swaps[ed.k];if(S.prog===ed.k)S.sessionIdx=Math.min(S.sessionIdx,PROGRAMS[ed.k].sessions.length-1);
  live=null;ed=null;save();tab="train";render();toast("رجع الجدول الأصلي");
}

/* ===== تقدمي ===== */
function weekSummary(){
  const T=today(),ks=[];for(let i=0;i<7;i++)ks.push(key(addDays(new Date(),-i)));
  const tt=ks.filter(k=>(S.days[k]?.food||[]).length).map(totals),avg=f=>tt.length?tt.reduce((a,x)=>a+x[f],0)/tt.length:null;
  const hs=S.history.filter(h=>!h.seed&&daysBetween(h.date,T)<7),tr=trend();
  return {train:hs.length,plan:prog().days,k:avg("k"),p:avg("p"),dw:tr?tr.kgWeek:null,prs:hs.reduce((a,h)=>a+(h.prs||[]).length,0),days:tt.length};
}
function vProgress(){
  const p=S.profile,ws=weightsSorted().slice(-28),tr=trend(),cw=currentWeight();
  let chart='<div class="empty">سجّل وزنك يومين وتطلع لك الرسمة.</div>';
  if(ws.length>1){
    const W=320,H=160,L=36,vals=ws.map(x=>x[1]),tv=p.tw&&Math.abs(p.tw-cw)<8?p.tw:null;
    const mn=Math.floor(Math.min(...vals,tv??Infinity)-0.4),mx=Math.ceil(Math.max(...vals,tv??-Infinity)+0.4);
    const X=i=>L+i*(W-L-10)/(ws.length-1),Y=v=>12+(mx-v)*(H-44)/(mx-mn);
    const avg=ws.map((w,i)=>{const sl=vals.slice(Math.max(0,i-6),i+1);return [X(i),Y(sl.reduce((a,b)=>a+b,0)/sl.length)]});
    const ticks=[mn,(mn+mx)/2,mx];
    chart=`<div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:260px;direction:ltr" role="img" aria-label="رسم الوزن">
      ${ticks.map(t=>`<line x1="${L}" x2="${W-10}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(t)+4}" text-anchor="end">${t.toFixed(1)}</text>`).join("")}
      ${tv?`<line x1="${L}" x2="${W-10}" y1="${Y(tv)}" y2="${Y(tv)}" stroke="var(--hot)" stroke-dasharray="4 4"/><text x="${W-10}" y="${Y(tv)-5}" text-anchor="end" style="fill:var(--hot)">هدفك ${tv}</text>`:""}
      ${ws.map((w,i)=>`<circle cx="${X(i)}" cy="${Y(w[1])}" r="2.6" fill="var(--muted)" opacity=".55"/>`).join("")}
      <polyline points="${avg.map(a=>a.join(",")).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${avg[avg.length-1][0]}" cy="${avg[avg.length-1][1]}" r="5" fill="var(--accent)"/>
      <text x="${L}" y="${H-10}">\u2067${dateAr(ws[0][0])}\u2069</text><text x="${W-10}" y="${H-10}" text-anchor="end">\u2067${dateAr(ws[ws.length-1][0])}\u2069</text></svg></div>
      <div class="legend"><span><b style="background:var(--accent)"></b>متوسط 7 أيام</span><span><b style="background:var(--muted)"></b>وزنك اليومي</span></div>`;
  }
  let eta="";
  if(p.tw&&tr&&Math.abs(cw-p.tw)>0.3){const need=p.tw-cw,rate=tr.kgWeek;if(rate&&Math.sign(rate)===Math.sign(need)){const wk=Math.ceil(Math.abs(need/rate));eta=`${dateAr(key(addDays(new Date(),wk*7)))} تقريبا`}}
  const startW=p.startW||p.w,doneKg=startW-cw,goalKg=p.tw?startW-p.tw:0,pct=goalKg?clamp(doneKg/goalKg*100,0,100):0;
  const cells=[];for(let i=27;i>=0;i--){const k=key(addDays(new Date(),-i)),d=S.days[k];cells.push(`<i class="${d&&d.trained?"w":d&&(d.food||[]).length?"f":""} ${i===0?"t":""}" title="${k}"></i>`)}
  const lifts={};S.history.forEach(h=>Object.entries(h.sets||{}).forEach(([n,ss])=>ss.forEach(s=>{if(!lifts[n]||s[0]>lifts[n])lifts[n]=s[0]})));
  const top=Object.entries(lifts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const wkTrain=S.history.filter(h=>daysBetween(h.date,today())<7).length;
  const nW=weightsSorted().length,nT=S.history.length,nF=Object.values(S.days).filter(d=>(d.food||[]).length).length,anyDay=cells.some(c=>/class="[wf]/.test(c));
  const fresh=nW<2&&!nT&&nF<3;
  const stp=(ok,t,sub)=>`<li class="${ok?"ok":""}"><span class="st-c" aria-hidden="true">${ok?"✓":""}</span><span><b>${t}</b><small>${sub}</small></span></li>`;
  const starter=fresh?`<div class="card starter"><h2>صفحتك تكبر معك</h2><p class="sub">كل ما سجلت أكثر، تطلع لك هنا الرسمة وأرقامك وموعد وصولك لهدفك.</p>
    <ol class="st-list">${stp(nW>=2,"سجّل وزنك يومين",`${Math.min(nW,2)} من 2 · من الرئيسية`)}${stp(nT>0,"خلّص أول تمرين","أرقامك القوية تطلع هنا")}${stp(nF>=3,"سجّل أكلك 3 أيام",`${Math.min(nF,3)} من 3`)}</ol>
    ${(()=>{const nx=nW<2&&!S.days[today()]?.weight?["today","سجّل وزنك"]:!nT?["train","ابدأ التمرين"]:nF<3?["food","سجّل أكلك"]:["today","سجّل وزنك"];return `<button class="primary wide" data-go="${nx[0]}">${nx[1]}</button>`})()}</div>`:"";
  return `<div class="row"><div><h1>تقدمي</h1><div class="sub">من ${dateAr(p.start||today())}</div></div>${fresh?"":`<button class="shareb" id="shareP">${ICON.share} شارك</button>`}</div>
  ${starter}
  <div class="stats"><div class="stat"><b class="num">${r1(cw)}</b><span>وزنك الحالي</span></div><div class="stat"><b class="num ${tr?"":"soon"}">${tr?(tr.kgWeek>0?"+":"")+r1(tr.kgWeek):"بعد أسبوع"}</b><span>كغ بالأسبوع</span></div><div class="stat"><b class="num">${G().bmi}</b><span>مؤشر الكتلة</span></div></div>
  ${fresh?"":(()=>{const w=weekSummary(),g=G();return `<div class="card stack"><div class="row"><h2>أسبوعك</h2><span class="sub">آخر 7 أيام</span></div>
    <div class="wk-g"><div><b class="num">${w.train}/${w.plan}</b><span>تمارين</span></div><div><b class="num ${w.k!=null&&g.kcal&&Math.abs(w.k-g.kcal)/g.kcal<=0.1?"ok":""}">${w.k==null?"-":fmt(w.k)}</b><span>متوسط السعرات</span></div><div><b class="num ${w.p!=null&&w.p>=g.p*0.9?"ok":""}">${w.p==null?"-":fmt(w.p)}</b><span>متوسط البروتين</span></div><div><b class="num" dir="ltr">${w.dw==null?"-":(w.dw>0?"+":"")+r1(w.dw)}</b><span>الوزن كغ</span></div></div>
    ${w.prs?`<p class="note">كسرت ${w.prs===1?"رقم قياسي واحد":w.prs===2?"رقمين قياسيين":w.prs+" أرقام قياسية"} هالأسبوع. كفو!</p>`:w.days<4?`<p class="note">سجّلت أكلك ${w.days} من 7 أيام. كل ما زاد التسجيل، صارت الأرقام أدق.</p>`:""}</div>`})()}
  ${p.tw?`<div class="card stack"><div class="row"><h2>هدفك ${p.tw} كغ</h2><span class="pill">${Math.round(pct)}%</span></div><div class="progress"><i style="width:${pct}%"></i></div><div class="row sub"><span>بدأت ${startW}</span><span>${eta?`توصل ${eta}`:"نحسب موعد وصولك بعد أسبوعين وزن"}</span></div></div>`:""}
  ${fresh&&nW<2?"":`<div class="card"><h2 style="margin-bottom:8px">الوزن</h2>${chart}</div>`}
  ${!anyDay?"":`<div class="card"><div class="row"><h2>آخر 4 أسابيع</h2><span class="pill">${streak()} يوم متتالي</span></div>
    <div class="grid28" style="margin-top:12px">${cells.join("")}</div>
    <div class="legend"><span><b style="background:var(--accent)"></b>تمرّنت</span><span><b style="background:color-mix(in srgb,var(--accent) 40%,var(--track))"></b>سجلت أكل</span><span><b style="background:var(--track)"></b>ما سجلت</span></div>
    <p class="note" style="margin-top:8px">تمارين هالأسبوع: ${wkTrain} من ${prog().days}</p></div>`}
  ${!top.length&&fresh?"":`<div class="card"><h2>أقوى أرقامك</h2><div class="list">${top.length?top.map(([n,kg])=>`<button class="item" data-hist="${esc(n)}"><span class="n num" dir="ltr" style="text-align:right">${esc(n)}</span><span class="m">${kg} كغ</span><span class="plus" aria-hidden="true">‹</span></button>`).join(""):`<div class="empty">أول تمرين تخلصه يطلع هنا.</div>`}</div></div>`}`;
}

/* ===== الإعدادات ===== */
let resetArmed=false,cycleArmed=false;
function vSettings(){
  const p=S.profile,g=G();
  return `<div><h1>ملفي</h1><div class="sub">${esc(p.name)} · ${r1(currentWeight())} كغ · ${GOALS[p.goal][0]}</div></div>
  <div class="card stack"><div class="row"><h2>أهدافك اليومية</h2><span class="pill">${p.customKcal?"مخصصة":"محسوبة تلقائي"}</span></div>
    <div class="mrow"><div><b>${fmt(g.kcal)}</b><span>سعرة</span></div><div><b>${g.p}</b><span>بروتين</span></div><div><b>${g.c}</b><span>كارب</span></div><div><b>${g.f}</b><span>دهون</span></div></div>
    <div class="field"><label for="ck">سعرات مخصصة (اختياري)</label><div class="row"><input type="number" inputmode="numeric" id="ck" placeholder="فاضي = FORMA يحسبها" value="${p.customKcal||""}"><button id="saveCk">حفظ</button></div></div>
    ${S.adj?`<p class="note">معدّلة ${S.adj>0?"+":""}${S.adj} سعرة من المراجعات الأسبوعية. <button class="ghost" id="resetAdj" style="padding:0 4px">ألغِ التعديل</button></p>`:""}
    <details><summary>كيف نحسبها؟ ‹</summary><ul class="guide" style="margin-top:8px">
      <li>حرقك اليومي ${fmt(g.tdee)} سعرة: معادلة Mifflin-St Jeor (${fmt(g.bmr)}) مضروبة في مستوى نشاطك. هذي أدق معادلة للناس العاديين.</li>
      <li>${p.goal===0?"للتنشيف: عجز 20% بحيث ينزل وزنك 0.5 إلى 1% بالأسبوع. النزول البطيء يحافظ على عضلك أكثر.":p.goal===2?"للتضخيم: فائض بسيط (10% وأقصاه 350) عشان أغلب الزيادة تكون عضل.":"للثبات: نفس حرقك اليومي."}</li>
      <li>البروتين 1.6 جم لكل كغ${g.ref!==p.w?` من وزن مرجعي ${g.ref} كغ`:""}. الدراسات لقت إن الفايدة للعضل توقف تقريبا عند هالرقم، فما تحتاج تتعب نفسك بأكثر.</li>
      <li>الدهون 25% من سعراتك، والباقي كارب.</li>
      <li>كل أسبوع يراجع FORMA متوسط وزنك، ويقترح تعديل إذا نزولك أو زيادتك طلعت عن المطلوب.</li></ul></details>
  </div>
  <div class="card stack"><h2>البرنامج</h2><div class="seg" style="grid-template-columns:1fr">${progList().map(k=>progOpt(k,`data-prog="${k}"`)).join("")}</div><p class="note">تغيير البرنامج يبدأك من أول جلسة. أرقامك القديمة تبقى.</p>
    <div class="grid2"><button id="openEdit">عدّل جدولي الحالي</button><button id="newMine">${S.mine?"عدّل جدولي الخاص":"سو جدولك من الصفر"}</button></div></div>
  ${cloudCard()}
  <div class="card stack"><h2>عط خويك فورما</h2><p class="note">أرسل له الرابط وخله يجربه.</p><button id="shareApp">شارك فورما</button></div>
  <div class="card stack"><h2>بياناتي</h2><button data-go="setup">عدّل الطول والوزن والهدف</button>
    <div class="grid2"><button id="exportB">نسخة احتياطية</button><button id="importB">استرجاع نسخة</button></div><input type="file" id="importF" accept="application/json,.json" hidden>
    <p class="note">${CL&&CL.code()?"بياناتك محفوظة بالسحابة. النسخة الاحتياطية أمان زيادة.":"بياناتك محفوظة على جهازك بس. خذ نسخة احتياطية قبل ما تغيّر جوالك."}</p>
    <button id="cycleB">${cycleArmed?"متأكد؟ اضغط مرة ثانية":"ابدأ دورة جديدة"}</button>
    <p class="note">الدورة الجديدة تمسح سجل الأكل والوزن والتمارين وتبدأك من اليوم. ملفك وأكلاتي ووجباتي تبقى.</p></div>
  <div class="card stack"><h2>مصادر القيم</h2><div class="list">${Object.entries(SOURCES).map(([s,v])=>`<div class="item"><span class="n">${s}<small>${esc(v[0])}</small></span><span class="pill ${v[1].startsWith("رسمي")?"":"mute"}">${v[1]}</span></div>`).join("")}</div><p class="note">رسمي = منشور في موقع المتجر السعودي. تقديري = محسوب من مصادر مشابهة.</p></div>
  <button class="danger" id="resetB">${resetArmed?"متأكد؟ اضغط مرة ثانية ويتمسح كل شي":"امسح كل بياناتي"}</button>
  <p class="note center">FORMA 3.0 · للاستخدام الشخصي فقط. © 2026 FORMA</p>`;
}
/* ===== السحابة ===== */
let syncState="off";
const SYNC_L={ok:"محفوظة ✓",syncing:"يزامن...",offline:"بدون نت",error:"ما تزامنت",nolic:"الكود موقف",off:"مو مربوط"};
function cloudCard(){
  if(!CL)return "";
  const c=CL.code();
  if(!c)return `<div class="card stack" id="cloudCard"><h2>احفظ بياناتك بالسحابة</h2><p class="note">اربط كود التفعيل، وبياناتك تنحفظ وترجع لك لو غيّرت جوالك. ويفتح لك تصوير الأكل.</p>
    <div class="row"><input type="text" id="licIn" placeholder="FM-XXXXX-XXXXX" dir="ltr" autocomplete="off" autocapitalize="characters" spellcheck="false" class="lic-in" aria-label="كود التفعيل"><button class="primary" id="licGo">اربط</button></div></div>`;
  return `<div class="card stack" id="cloudCard"><div class="row"><h2>بياناتك بالسحابة</h2><span class="pill ${syncState==="ok"?"":"mute"}" id="syncSt">${SYNC_L[syncState]||""}</span></div>
    <p class="note">كل تعديل ينحفظ في جهازك ويترفع لحاله. لو غيّرت جوالك، اكتب نفس الكود وترجع لك بياناتك.</p>
    <div class="row"><span class="sub num" dir="ltr">FM-${esc(c.slice(0,5))}-•••••</span><button class="ghost" id="syncNow">زامن الحين</button></div>${CFG.store&&CL.stats?`<button class="wide" id="statsB">لوحة المستخدمين</button>`:""}</div>`;
}
/* لوحة المستخدمين (نسخة جواد فقط): أرقام مجمعة من جدول usage */
function openStats(){
  sheet((sh,close)=>{sh.setAttribute("aria-label","لوحة المستخدمين");
    sh.innerHTML=`<div class="stack"><div class="row"><h2>لوحة المستخدمين</h2><button class="ghost" data-x>إغلاق</button></div><p class="note" id="stB">لحظة...</p></div>`;
    sh.addEventListener("click",e=>{if(e.target.closest("[data-x]"))close()});
    CL.stats().then(r=>{const el=sh.querySelector("#stB");if(!el)return;
      if(!r||r.err){el.textContent=r&&r.err==="net"?"ما فيه اتصال. جرّب بعد شوي":"هذي اللوحة لكودك الخاص فقط";return}
      const ds=r.days||[],td=ds[ds.length-1]||{},pc=(a,b)=>b?Math.round(a/b*100)+"%":"--",mx=Math.max(1,...ds.map(d=>d.act));
      const st=(l,v,s)=>`<div class="stat"><span class="lbl">${l}</span><b class="num">${v}</b>${s?`<span class="sub">${s}</span>`:""}</div>`;
      el.outerHTML=`<div class="grid2">
        ${st("نشطين اليوم",td.act||0,`${td.licd||0} مفعّل`)}
        ${st("نشطين آخر 7 أيام",r.wau)}
        ${st("جدد اليوم",td.newd||0)}
        ${st("كل الأجهزة",r.devices,`آيفون ${r.ios} · أندرويد ${r.android}`)}
        ${st("كمّلوا التسجيل",pc(r.onboarded,r.devices),`${r.onboarded} من ${r.devices}`)}
        ${st("رجعوا بعد أول يوم",pc(r.ret_back,r.ret_base),`${r.ret_back} من ${r.ret_base}`)}
        ${st("سجّلوا أكل",pc(r.used_food,r.devices),`${r.used_food} جهاز`)}
        ${st("سجّلوا تمرين",pc(r.used_train,r.devices),`${r.used_train} جهاز`)}
        ${st("مجاني تحوّل لمشتري",pc(r.converted,r.free_devices),`${r.converted} من ${r.free_devices}`)}
        ${st("أكواد مفعّلة",r.codes_active,`${r.codes_7d} آخر 7 أيام`)}
      </div>
      <div class="card stack"><span class="lbl">النشطين آخر 14 يوم</span>
        <div class="ubars">${ds.map(d=>`<i title="${d.day}: ${d.act}"><b style="height:calc((100% - 14px) * ${(d.act/mx).toFixed(3)})"></b><em class="num">${d.act}</em></i>`).join("")}</div>
        <div class="row" dir="ltr"><span class="sub num">${esc(String(ds[0]?.day||"").slice(5))}</span><span class="sub num">${esc(String(td.day||"").slice(5))}</span></div></div>
      <p class="note">الأرقام تبدأ من تحديث 4.3. كل جهاز ينحسب مرة باليوم لما يفتح التطبيق وفيه نت.</p>`;
    });
  });
}
function chooseData(remote,ts){
  return new Promise(res=>{let done=false;const fin=v=>{if(!done){done=true;res(v)}};
    const nd=Object.values(remote.days||{}).filter(d=>(d.food||[]).length).length,nt=(remote.history||[]).length;
    sheet((sh,close)=>{sh._onclose=()=>fin("local");sh.setAttribute("aria-label","بيانات محفوظة");
      sh.innerHTML=`<div class="grab"></div><h2>لقينا بيانات محفوظة بالسحابة</h2><p class="note" style="margin:4px 0 12px">${esc(remote.profile?.name||"")} · ${nd} يوم أكل · ${nt} تمرين · آخر تعديل ${dateAr(key(new Date(ts)))}. وش تبي نسوي؟</p>
        <div class="stack"><button class="primary wide" data-ch="remote">استرجع بيانات السحابة</button><button data-ch="local">خل بيانات هذا الجهاز</button></div>`;
      sh.addEventListener("click",e=>{const b=e.target.closest("[data-ch]");if(!b)return;fin(b.dataset.ch);close()})});
  });
}
function initSync(){
  if(!CL)return;
  CL.sync.init({slot:STORE,get:()=>S,choose:chooseData,
    apply:d=>{S=d&&typeof d==="object"?d:{};normalize();normalizeFix();saveLocal();ob=null;live=null;ed=null;if(S.profile&&(tab==="setup"||tab==="plan"))tab="today";if(!S.profile)tab="setup";render();toast("رجعت بياناتك من السحابة")},
    onStatus:st=>{syncState=st;const el=$("#syncSt");if(el){el.textContent=SYNC_L[st]||"";el.classList.toggle("mute",st!=="ok")}}});
}
async function linkCode(){
  const i=$("#licIn"),b=$("#licGo");if(!i||!CL)return;
  const v=i.value.trim();if(CL.norm(v).length!==10)return toast("اكتب الكود كامل، مثل FM-XXXXX-XXXXX");
  b.disabled=true;b.textContent="لحظة...";
  try{const r=await CL.activate(v);
    if(r==="ok"){PF.haptic("success");render();return toast("انربط كودك. بياناتك صارت تنحفظ بالسحابة")}
    toast(r==="used"?"الكود مستخدم على جهازين. تواصل معنا":"الكود غير صحيح، تأكد منه")}
  catch(e){toast("تأكد إنك متصل بالنت وجرّب")}
  b.disabled=false;b.textContent="اربط";
}
function exportData(){
  const blob=new Blob([JSON.stringify(S)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="forma-backup-"+today()+".json";
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
  toast("جهزنا النسخة. احفظها في الملفات");
}
function importData(file){
  const fr=new FileReader();
  fr.onload=()=>{try{const d=JSON.parse(fr.result);if(!d||!d.days||!d.profile)throw 0;S=d;normalize();save();tab="today";render();toast("رجعت بياناتك")}catch(e){toast("هذا الملف مو نسخة FORMA")}};
  fr.readAsText(file);
}

/* ===== التنقل ===== */
if(!S.profile)tab="setup";
let lastTab=null;
function render(){
  if(!S.profile&&tab!=="setup")tab="setup";
  const setup=tab==="setup";
  $("nav").hidden=setup||tab==="plan";$("#hdr").hidden=setup&&!S.profile;
  document.querySelectorAll("nav button").forEach(b=>{if(b.dataset.tab===tab)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  $("#streakN").textContent=S.profile?streak():0;
  const views={setup:vSetup,today:vToday,food:vFood,train:vTrain,progress:vProgress,settings:vSettings,edit:vEdit,plan:vPlan};
  const V=$("#view");V.innerHTML=(views[tab]||vToday)();
  if(tab!==lastTab){V.classList.remove("vin");void V.offsetWidth;V.classList.add("vin");lastTab=tab}
  if(tab==="plan"){const k=$("#planK");if(k)countUp(k)}
  if(tab==="food")renderResults();
  if(tab!=="train"&&$("#rest"))$("#rest").remove();
  window.scrollTo(0,0);
}
$("#gearB").innerHTML=ICON.gear;$("#streakIco").innerHTML=ICON.flame;
/* زر + في نص الشريط */
(()=>{const n=document.querySelector("nav .in");if(!n||n.querySelector(".fab"))return;const f=document.createElement("button");f.className="fab";f.id="fabAdd";f.setAttribute("aria-label","أضف");f.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';n.insertBefore(f,n.children[2])})();
function openAdd(){
  sheet((sh,close)=>{sh.setAttribute("aria-label","أضف");
    sh.innerHTML=`<div class="grab"></div><h2>وش تبي تضيف؟</h2><div class="addg">
      <button data-a="photo">${ICON.camera}<b>صوّر أكلك</b><small>FORMA يحسب سعراته</small></button>
      <button data-a="scan">${ICON.scan}<b>امسح باركود</b><small>للمنتجات المغلفة</small></button>
      <button data-a="type">${ICON.search}<b>اكتب أو تكلم</b><small>مثال: 3 بيض وخبزة</small></button>
      <button data-a="weight">${ICON.chart}<b>سجّل وزنك</b><small>الصبح قبل الأكل</small></button>
      <button data-a="train" class="wide"><b>ابدأ تمرين اليوم</b><small dir="auto">${esc(sName(prog().sessions[sessIdx()].n))}</small></button></div>`;
    sh.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;close();
      if(a==="photo")return openPhoto();if(a==="scan")return openScan();
      if(a==="type"){tab="food";foodDay=today();q="";render();const i=$("#sayIn");if(i)i.focus();return}
      if(a==="weight"){tab="today";wEdit=true;render();const w=$("#wIn");if(w){w.scrollIntoView({block:"center"});w.focus()}return}
      if(a==="train"){tab="train";render()}});
  });
}
document.querySelector("nav").addEventListener("click",e=>{const b=e.target.closest("button");if(b&&b.id==="fabAdd"){PF.haptic("light");return openAdd()}if(b){tab=b.dataset.tab;ed=null;wEdit=false;resetArmed=cycleArmed=false;if(tab==="food"){foodDay=today();q="";browse=false}render()}});
$("#gearB").addEventListener("click",()=>{tab="settings";ed=null;resetArmed=cycleArmed=false;render()});
$("#view").addEventListener("submit",e=>{e.preventDefault();if(e.target.id==="setup"){if(S.profile)submitSetup();else wizNext()}if(e.target.id==="sayF")openSay($("#sayIn").value)});
$("#view").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  const d=b.dataset;
  if(d.ob){readSetupFields();ob[d.ob]=d.v;if(d.ob==="goal")ob.goalTouched=true;
    if(d.ob==="prog")ob.progTouched=true;
    if(!S.profile){document.querySelectorAll(`[data-ob="${d.ob}"]`).forEach(x=>x.setAttribute("aria-pressed",x===b));PF.haptic("light");return}
    render();return}
  if(d.wz==="back"){readSetupFields();ob.step=Math.max(0,(ob.step||0)-1);return render()}
  if(d.go){tab=d.go;if(tab!=="setup")ob=null;if(tab!=="edit")ed=null;if(tab==="food")foodDay=today();render();return}
  if(d.add!==undefined)return openFood(d.add);
  if(d.cat){cat=d.cat;restPick="";return renderResults()}
  if(d.sayrun){return openSay(q)}
  if(d.rest!==undefined){restPick=d.rest;return renderResults()}
  if(d.del!==undefined){day(foodDay).food.splice(+d.del,1);save();return render()}
  if(d.savemeal){const items=(S.days[foodDay]?.food||[]).filter(x=>x.meal===d.savemeal&&x.fid).map(x=>({fid:x.fid,amt:x.amt}));if(!items.length)return toast("ما فيه أصناف تنحفظ");const n=items.slice(0,2).map(it=>getFood(it.fid)?.n).filter(Boolean).join(" + ")+(items.length>2?" +"+(items.length-2):"");S.meals.unshift({n,items});save();return toast("انحفظت في وجباتي")}
  if(d.addmeal!==undefined){const ml=S.meals[+d.addmeal];if(!ml)return;const k=targetDay(),meal=defaultMeal();ml.items.forEach(it=>day(k).food.push({fid:it.fid,amt:it.amt,meal}));return afterAdd(k)}
  if(d.delmeal!==undefined){S.meals.splice(+d.delmeal,1);save();return renderResults()}
  if(d.sess!==undefined){S.sessionIdx=+d.sess;live=null;save();return render()}
  if(d.swap!==undefined)return openSwap(+d.swap);
  if(d.prog){if(S.prog!==d.prog){S.prog=d.prog;S.sessionIdx=0;S.progStart=today();live=null;save();render();toast("برنامجك الحين: "+prog().ar)}return}
  if(d.done){const v=live.v[d.done]=live.v[d.done]||{};v.d=!v.d;
    const parts=d.done.split("|"),j=+parts.pop(),n=parts.join("|"),si=sessIdx(),ex=prog().sessions[si].ex,i=ex.findIndex((e,x)=>exName(si,x)===n);
    if(v.d){if(!live.start)live.start=Date.now();const last=lastFor(n),ph=last&&last[j];const reps=i>=0?ex[i][2]:"8";
      if(!v.kg&&ph)v.kg=String(ph[0]);if(!v.r)v.r=String(ph?ph[1]:String(reps).split("-")[0]);
      startRest(restFor(reps));PF.haptic("light");
      const best=bestFor(n);live.prs=live.prs||{};if(best&&+v.kg>best&&!live.prs[n]){live.prs[n]=1;celebrate(`رقم قياسي جديد! \u2068${n}\u2069 ${v.kg} كغ`)}
      const sets=i>=0?ex[i][1]:0;let all=true;for(let x=0;x<sets;x++)if(!(live.v[n+"|"+x]&&live.v[n+"|"+x].d))all=false;
      if(all&&i>=0){const nxt=ex.findIndex((e,x)=>{if(x<=i)return false;const nn=exName(si,x);for(let y=0;y<e[1];y++)if(!(live.v[nn+"|"+y]&&live.v[nn+"|"+y].d))return true;return false});
        if(nxt>=0){live.open=nxt;renderTrainAt();return}}}
    renderTrainKeep();return}
  if(d.exo!==undefined){live.open=+d.exo;return renderTrainAt()}
  if(d.hist!==undefined)return openHist(d.hist);
  if(d.sug){sugFilter=d.sug;return render()}
  if(d.sugadd!==undefined)return addSug(+d.sugadd);
  if(d.edx)return edAction(d.edx);
  if(d.coach){const a=d.coach;if(a==="weight"){wEdit=true;render();const w=$("#wIn");if(w){w.scrollIntoView({block:"center",behavior:"smooth"});w.focus()}return}tab=a;if(a==="food"){foodDay=today();q=""}if(a==="setup")ob=null;return render()}
  switch(b.id){
    case "openEdit":return openEditor(S.prog);
    case "newMine":return openEditor("mine");
    case "edSave":return edSave();
    case "edReset":return edReset();
    case "openSug":return openSug();
    case "openPlan":return openPlan();
    case "instSkip":instSet("skip");return render();
    case "instLater":instSet("later");return render();
    case "instCopy":{const u=location.href.split("#")[0];(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast("انتسخ الرابط. الصقه في المتصفح"),()=>toast(u));return}
    case "doInstall":if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.finally(()=>{deferredPrompt=null;render()})}return;
    case "rvApply":{const rv=weeklyReview();if(rv){S.adj+=rv.delta;S.lastReview=today();save();render();toast(`سعراتك الحين ${fmt(G().kcal)}`)}return}
    case "rvSkip":S.lastReview=today();save();return render();
    case "wEdit":wEdit=true;render();{const w=$("#wIn");if(w)w.focus()}return;
    case "wSave":{const v=parseFloat($("#wIn").value);if(v>=35&&v<=250){day(today()).weight=v;wEdit=false;save();render();PF.haptic("success");toast("انحفظ وزنك")}else toast("اكتب وزن صحيح بالكيلو");return}
    case "prevD":foodDay=key(addDays(parseKey(foodDay),-1));return render();
    case "nextD":if(foodDay!==today()){foodDay=key(addDays(parseKey(foodDay),1));render()}return;
    case "quick":return openQuick({name:q.trim()&&q.trim().split(/\s+/).length<5?q.trim():""});
    case "browseB":browse=!browse;cat=browse?"مطاعم":cat;restPick="";render();if(browse){const r=$("#results");if(r)window.scrollTo({top:r.getBoundingClientRect().top+window.scrollY-200})}return;
    case "scanB":return openScan();
    case "photoB":return openPhoto();
    case "qSay":{tab="food";foodDay=today();q="";render();const m=$("#sayMic");if(m)listen(m);else{const i=$("#sayIn");if(i)i.focus()}return}
    case "qSearch":{tab="food";foodDay=today();q="";render();const i=$("#sayIn");if(i)i.focus();return}
    case "coachNext":{coachIdx++;const c=$("#coach");if(c){const tmp=document.createElement("div");tmp.innerHTML=coachCard();c.replaceWith(tmp.firstElementChild)}PF.haptic("light");return}
    case "planProg":return openProgPick();
    case "licGo":return linkCode();
    case "statsB":return openStats();
    case "shareApp":return shareApp();
    case "syncNow":if(CL){CL.sync.now().then(()=>toast(syncState==="ok"?"تمت المزامنة":"ما قدرنا نزامن، جرّب بعد شوي"))}return;
    case "sayMic":return listen(b);
    case "copyY":{const src=S.days[key(addDays(parseKey(foodDay),-1))];if(src&&src.food.length){day(foodDay).food.push(...src.food.map(x=>({...x})));save();render();toast("انضاف أكل اليوم السابق")}else toast("ما فيه أكل مسجل في اليوم السابق");return}
    case "finish":return finish();
    case "shareP":return shareProgress();
    case "saveCk":{const v=+$("#ck").value;if(!$("#ck").value){S.profile.customKcal=null;save();render();return toast("رجعنا للحساب التلقائي")}if(v>=1200&&v<=6000){S.profile.customKcal=v;S.adj=0;save();render();toast("انحفظت سعراتك")}else toast("اكتب رقم بين 1200 و 6000");return}
    case "resetAdj":S.adj=0;save();return render();
    case "exportB":return exportData();
    case "importB":return $("#importF").click();
    case "cycleB":if(!cycleArmed){cycleArmed=true;return render()}S.days={};S.history=[];S.adj=0;S.lastReview=null;S.sessionIdx=0;S.progStart=today();S.profile.start=today();S.profile.startW=currentWeight();cycleArmed=false;save();tab="today";render();return toast("بدأت دورة جديدة");
    case "resetB":if(!resetArmed){resetArmed=true;return render()}S={_wiped:true};normalize();save();resetArmed=false;ob=null;tab="setup";return render();
  }
});
$("#view").addEventListener("change",e=>{if(e.target.id==="importF"&&e.target.files[0])importData(e.target.files[0])});
$("#view").addEventListener("input",e=>{
  if(e.target.id==="sayIn"){q=e.target.value;return renderResults()}
  if(e.target.dataset.ed&&ed){const [f,si,i]=e.target.dataset.ed.split("|");const v=e.target.value;
    if(f==="sn")ed.sessions[+si].n=v;else if(f==="r")ed.sessions[+si].ex[+i][2]=v;else if(f==="pn")ed.name=v;else if(f==="wk")ed.weeks=v;return}
  if(e.target.dataset.note!=null){const nn=e.target.dataset.note,vv=e.target.value;e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px";if(vv.trim())S.exNotes[nn]=vv;else delete S.exNotes[nn];save();return}
  const k=e.target.dataset.k;
  if(k){const parts=k.split("|"),f=parts.pop(),j=parts.pop(),n=parts.join("|");const v=live.v[n+"|"+j]=live.v[n+"|"+j]||{};v[f]=e.target.value;
    if(f==="kg"){const best=+e.target.dataset.best;e.target.classList.toggle("pr",best>0&&+e.target.value>best)}}
});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&tab==="today")render()});
/* خانات الأرقام: تحديد الرقم كامل أول ما تضغط، عشان تكتب الجديد على طول بدون ما تمسح */
document.addEventListener("focusin",e=>{const t=e.target;if(t.tagName==="INPUT"&&t.type==="number"&&t.value!==""){setTimeout(()=>{try{t.select()}catch(x){}},0)}});
render();
if(fidDirty)saveLocal();
initSync();
pingUsage();

/* ===== بدون نت ===== */
if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{})})}
})();
