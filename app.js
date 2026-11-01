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
const CATS=Object.keys(RAW);
const PROGRAMS=window.FORMA_PROGRAMS||{},DEFP=(window.FORMA_CONFIG&&window.FORMA_CONFIG.defaultProg&&(window.FORMA_PROGRAMS||{})[window.FORMA_CONFIG.defaultProg])?window.FORMA_CONFIG.defaultProg:"fb4",PORDER=window.FORMA_PROGRAM_ORDER||Object.keys(PROGRAMS),ALTS=window.FORMA_ALTS||{},PLAN=window.FORMA_PLAN||{};
const MEALS=["فطور","غداء","عشاء","سناك"];
const ACT=[["خامل","شغل مكتبي، بدون رياضة",1.2],["خفيف","تمرين 1-3 أيام",1.375],["متوسط","تمرين 3-5 أيام",1.55],["عالي","تمرين 6-7 أيام أو شغل بدني",1.725]];
const GOALS=[["خسارة دهون","نزول 0.5-1% بالأسبوع"],["ثبات","تحافظ على وزنك"],["زيادة عضل","زيادة بطيئة ونظيفة"]];
const TIPS=[
"البروتين أول شي في صحنك. إذا قفلته، أغلب شغل اليوم خلص.",
"فوّت تمرين؟ عادي. الجلسة الجاية تنتظرك بنفس مكانها.",
"زد كيلو أو عدة وحدة عن آخر مرة. هذا التقدم كله.",
"الميزان يتغير يوميا بسبب الماي والملح. صدّق متوسط الأسبوع.",
"نومك 7 ساعات يرفع أداءك في الجيم أكثر من أي مكمّل.",
"عندك عزيمة الليلة؟ سجّلها من الحين ورتّب باقي يومك عليها.",
"اللي يوصل مو الأقوى، اللي ما يقطع. حافظ على أيامك.",
"كوب ماي قبل كل وجبة. سهلة وتفرق.",
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
gear:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};

/* ===== الحالة ===== */
const CFG=window.FORMA_CONFIG||{};
const STORE=CFG.store||"forma-v2";
let S=null;
try{S=JSON.parse(localStorage.getItem(STORE)||"null")}catch(e){S=null}
if(!S||typeof S!=="object")S={};
function normalize(){
  S.days=S.days||{};S.recent=S.recent||[];S.custom=S.custom||[];S.meals=S.meals||[];S.history=S.history||[];
  S.sessionIdx=S.sessionIdx||0;S.swaps=S.swaps||{};S.edits=S.edits||{};S.adj=S.adj||0;
  S.prog=(PROGRAMS[S.prog]||(S.prog==="mine"&&S.mine))?S.prog:DEFP;
  if(CFG.seed&&S.seeded!==(CFG.seedVer||true)){S.history=S.history.filter(h=>!(h.seed||(CFG.seedBefore&&h.prog===DEFP&&h.date<CFG.seedBefore)));S.history=CFG.seed.map(h=>({...h,seed:true})).concat(S.history);S.seeded=CFG.seedVer||true;if(CFG.progStart&&S.prog===DEFP&&S.profile)S.progStart=CFG.progStart}
}
normalize();
function save(){try{localStorage.setItem(STORE,JSON.stringify(S))}catch(e){toast("ما قدرنا نحفظ. تأكد إن التخزين مفعّل في المتصفح")}}
const day=k=>(S.days[k]=S.days[k]||{food:[],weight:null});

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
const amtLabel=(f,amt)=>f.u==="g"?`${fmt(amt)} جم`:(amt===0.5?"نص حبة":amt===1?"حبة":amt===2?"حبتين":`${amt} حبات`);
function macrosOf(f,amt){const m=factor(f,amt);return {k:(f.k||0)*m,p:(f.p||0)*m,c:(f.c||0)*m,f:(f.f||0)*m}}
function totals(k){const t={k:0,p:0,c:0,f:0};(S.days[k]?.food||[]).forEach(e=>{const m=macrosOf(eFood(e),e.amt);t.k+=m.k;t.p+=m.p;t.c+=m.c;t.f+=m.f});return t}
const foodName=f=>f.store&&RESTS.includes(f.store)&&!f.n.includes(f.store)?f.n:f.n;
const foodSub=f=>{const unit=f.u==="g"?"لكل 100 جم":"للحبة";return `${f.store&&RESTS.includes(f.store)?f.store+" · ":""}${fmt(f.k)} سعرة ${unit}`};
function srcTag(f){const s=f.store&&SOURCES[f.store];if(!s)return "";const off=s[1].startsWith("رسمي");return `<span class="pill ${off?"":"mute"}">${off?"قيم رسمية":"قيم تقديرية"}</span>`}

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
let deferredPrompt=null,tab="today";
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;if(tab==="today")render()});

/* ===== الإعداد ===== */
const welcomeLogo=()=>{const el=document.querySelector("#hdr .logo");return el?el.innerHTML.replace(/fh(bg|gr|or)/g,"fw$1"):"FORMA"};
let ob=null;
function vSetup(){
  const p=S.profile||{};
  if(!ob)ob={name:p.name||"",sex:p.sex||"ذكر",age:p.age||"",h:p.h||"",w:p.w||"",tw:p.tw||"",act:p.act??2,goal:p.goal??0,prog:S.prog||DEFP};
  const edit=!!S.profile;
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
function readSetupFields(){ob.name=$("#obName").value.trim();ob.age=$("#obAge").value;ob.h=$("#obH").value;ob.w=$("#obW").value;ob.tw=$("#obTW").value}
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
  S.profile={name:ob.name,sex:ob.sex,age,h,w,tw,act:+ob.act,goal:+ob.goal,start:old.start||today(),startW:old.startW||w,customKcal:old.customKcal||null};
  if(first){day(today()).weight=w;S.adj=0}
  if(old.goal!==undefined&&old.goal!==+ob.goal)S.adj=0;
  ob=null;save();tab="today";render();
  const g=G();toast(`خطتك: ${fmt(g.kcal)} سعرة و ${g.p} جم بروتين`);
}

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
  const fit=cands.filter(c=>c.k<=Math.min(R+60,1300)&&c.k>=Math.min(250,R*0.35));
  fit.forEach(c=>{const pc=P>0?Math.min(c.p,P)/P:0.5;c.score=pc*0.65+Math.min(c.k/R,1)*0.35});
  fit.sort((a,b)=>b.score-a.score);
  return {R,P,list:fit.slice(0,4)};
}
let sugFilter="all";
function vToday(){
  const T=today(),t=totals(T),g=G(),P=prog(),si=sessIdx(),nx=P.sessions[si],st=streak();
  const left=g.kcal-t.k,over=left<0;
  const hr=new Date().getHours(),greet=hr<12?"صباح الخير":hr<18?"هلا":"مساء الخير";
  const rv=weeklyReview();
  const sg=suggestions(sugFilter);
  let install="";
  if(!isStandalone()){
    if(deferredPrompt)install=`<div class="card install row"><div><h2>ثبّت FORMA</h2><div class="sub">يفتح بشاشة كاملة ويشتغل بدون نت</div></div><button class="primary" id="doInstall">ثبّت</button></div>`;
    else if(isIOS)install=`<div class="card install"><h2>ثبّت FORMA على شاشتك</h2><ol><li>اضغط زر المشاركة في Safari</li><li>اختر "إضافة إلى الشاشة الرئيسية"</li><li>افتح FORMA من الأيقونة</li></ol></div>`;
  }
  const mac=(cls,name,v,goal)=>`<div class="mac ${cls}"><div class="v">${fmt(v)}<span> / ${goal} ${name}</span></div><div class="mbar"><i style="width:${clamp(v/goal*100,0,100)}%"></i></div></div>`;
  return `
  <div><h1>${greet} ${esc(S.profile.name)}</h1><div class="sub">${st?`${st} ${st===1?"يوم":st<=10?"أيام":"يوم"} ورا بعض. خلها تكمل.`:"سجّل أول وجبة اليوم وابدأ سلسلتك."}</div></div>
  ${install}
  <div class="hero">
    <div class="row"><span class="lbl">${over?"زيادة عن هدفك":"باقي لك اليوم"}</span><span class="lbl num">${fmt(t.k)} / ${fmt(g.kcal)}</span></div>
    <div class="big ${over?"over":""}">${fmt(Math.abs(left))}<small>سعرة</small></div>
    <div class="meter"><i class="${over?"over":""}" style="width:${clamp(t.k/g.kcal*100,0,100)}%"></i></div>
    <div class="macros">${mac("p","بروتين",t.p,g.p)}${mac("","كارب",t.c,g.c)}${mac("","دهون",t.f,g.f)}</div>
    <div class="grid2"><button class="primary" data-go="food">سجّل أكلك</button><button class="light" id="openSug">وش آكل؟</button></div>
  </div>
  ${rv?`<div class="card review stack"><div class="row"><h2>مراجعة الأسبوع</h2><span class="pill ${rv.delta?"hot":""}">${rv.delta?(rv.delta>0?"+":"")+rv.delta+" سعرة":"على المسار"}</span></div><p class="note" style="color:var(--ink);font-size:14px">${rv.msg}</p>${rv.delta?`<div class="grid2"><button class="primary" id="rvApply">طبّق التعديل</button><button id="rvSkip">خله زي ما هو</button></div>`:`<button id="rvSkip">تمام</button>`}</div>`:""}
  <div class="card stack" id="sugCard" ${sg.P>15&&t.k>0?"":"hidden"}>
    <div class="row"><h2>باقي ${fmt(Math.max(sg.P,0))} جم بروتين</h2><span class="sub">${fmt(Math.max(sg.R,0))} سعرة متبقية</span></div>
    <div class="chips">${[["all","الكل"],["home","أكل بيت"],["rest","مطاعم"]].map(([k,l])=>`<button class="chip" data-sug="${k}" aria-pressed="${sugFilter===k}">${l}</button>`).join("")}</div>
    <div class="list">${sg.list.length?sg.list.map((c,i)=>`<button class="item" data-sugadd="${i}"><span class="n">${esc(c.label)}<small>${esc(c.sub)}</small></span><span class="m">${fmt(c.k)} · ${fmt(c.p)}ب</span><span class="plus" aria-hidden="true">+</span></button>`).join(""):`<div class="empty">ما فيه خيار يركب على الباقي. جرّب قسم ثاني.</div>`}</div>
  </div>
  <div class="card stack">
    <div class="row"><span class="lbl">تمرينك الجاي</span><span class="pill">${esc(P.ar)}</span></div>
    <div class="row"><div class="num" style="font-size:24px;font-weight:800" dir="auto">${esc(sName(nx.n))}</div><span class="sub">${nx.day?"يومه المقترح "+nx.day+" · ":""}${nx.ex.length} تمارين</span></div>
    <div class="progress"><i style="width:${clamp(progDone()/progTotal()*100,0,100)}%"></i></div>
    <div class="sub">جلسة ${Math.min(progDone()+1,progTotal())} من ${progTotal()} · يمشي بالترتيب، لو ريّحت يوم يبقى ينتظرك</div>
    ${S.days[T]?.trained?`<span class="pill" style="align-self:flex-start">تمرّنت اليوم</span>`:`<button class="ink" data-go="train">ابدأ التمرين</button>`}
  </div>
  <div class="card stack"><div class="row"><h2>وزن اليوم</h2><span class="sub">${trend()?`متوسط الأسبوع ${r1(trend().avg)} كغ`:""}</span></div>
    <div class="row"><input type="number" step="0.1" inputmode="decimal" id="wIn" aria-label="وزن اليوم بالكيلو" placeholder="${r1(currentWeight())}" value="${S.days[T]?.weight??""}"><button class="primary" id="wSave">حفظ</button></div>
    <p class="note">وزّن نفسك الصبح بعد الحمام وقبل الأكل. FORMA يعتمد على متوسط الأسبوع.</p></div>
  <div class="card flat tip"><span class="q">”</span><p id="tipText">${esc(TIPS[(tipBase()+tipShift)%TIPS.length])}</p></div>`;
}
const tipBase=()=>{const d=new Date();return (d.getDate()+d.getMonth()*31)%TIPS.length};
let tipShift=0,lastSug=[];

/* ===== الأكل ===== */
let foodDay=null,cat="الكل",q="";
function dayLabel(k){if(k===today())return "اليوم";if(k===key(addDays(new Date(),-1)))return "أمس";try{return parseKey(k).toLocaleDateString("ar-u-nu-latn",{weekday:"long",day:"numeric",month:"long"})}catch(e){return k}}
function vFood(){
  foodDay=foodDay||today();
  const t=totals(foodDay),g=G(),label=dayLabel(foodDay),entries=S.days[foodDay]?.food||[];
  const prev=foodDay===today()?"أمس":"اليوم اللي قبله";
  return `
  <div class="daybar"><button id="prevD" aria-label="اليوم السابق">→</button><div class="center" style="min-width:0"><div class="d">${label}</div><div class="sub num">${fmt(t.k)} / ${fmt(g.kcal)} سعرة · ${fmt(t.p)} / ${g.p} بروتين</div></div><button id="nextD" aria-label="اليوم التالي" ${foodDay===today()?"disabled":""}>←</button></div>
  <div class="progress"><i style="width:${clamp(t.k/g.kcal*100,0,100)}%"></i></div>
  <form class="card stack say" id="sayF" autocomplete="off"><div class="row"><h2>قول وش أكلت</h2><span class="pill">جديد</span></div>
    <div class="say-in"><input type="text" id="sayIn" enterkeyhint="done" placeholder="مثال: ٣ بيض وخبزة وكوب لبن" dir="auto" aria-label="اكتب وش أكلت">${SR?`<button type="button" id="sayMic" class="mic" aria-label="تكلم">${ICON.mic}</button>`:""}<button type="submit" class="primary">تم</button></div>
    <p class="note">${SR?"اكتب أو اضغط المايك وتكلم. FORMA يفهم الكميات: كوب، صحن، ملعقة، حبة، جرام.":"اكتب، أو اضغط مايك الكيبورد وتكلم. FORMA يفهم الكميات: كوب، صحن، ملعقة، حبة، جرام."}</p></form>
  <div class="row"><input type="search" id="q" placeholder="ابحث: كبسة، بيض، البيك…" value="${esc(q)}" autocomplete="off" aria-label="ابحث عن أكلة"><button id="quick" style="white-space:nowrap">+ سريعة</button></div>
  <div class="chips" role="group" aria-label="الأقسام">${["الكل","وجباتي","أكلاتي","مطاعم",...CATS.filter(c=>!RESTS.includes(c))].map(c=>`<button class="chip" data-cat="${c}" aria-pressed="${c===cat}">${c}</button>`).join("")}</div>
  <div class="card"><div id="results"></div></div>
  <div class="card stack"><div class="row"><h2>سجل ${label}</h2><button class="ghost" id="openPlan">خطتي المقترحة</button></div>${MEALS.map(m=>{const es=entries.map((e,i)=>({e,i})).filter(o=>o.e.meal===m);
    const mk=es.reduce((a,o)=>a+macrosOf(eFood(o.e),o.e.amt).k,0);
    return `<div><div class="meal-h"><h3>${m} <span class="sub num">${fmt(mk)}</span></h3>${es.length?`<button class="ghost" data-savemeal="${m}">احفظها كوجبة</button>`:""}</div>${es.length?es.map(o=>{const f=eFood(o.e),mm=macrosOf(f,o.e.amt);return `<div class="item"><span class="n">${esc(f.n)}<small>${amtLabel(f,o.e.amt)}${f.store&&RESTS.includes(f.store)?" · "+f.store:""}</small></span><span class="m">${fmt(mm.k)} · ${fmt(mm.p)}ب</span><button class="del" data-del="${o.i}" aria-label="احذف ${esc(f.n)}">×</button></div>`}).join(""):`<div class="empty">ما سجلت شي</div>`}</div>`}).join("")}
  <button id="copyY">${entries.length?`أضف أكل ${prev} هنا`:`نفس أكل ${prev}؟ انسخه بضغطة`}</button></div>`;
}
function renderResults(){
  const box=$("#results");if(!box)return;
  const qq=q.trim();let head="",rows=[];
  const all=FOODS.concat(S.custom);
  const row=f=>`<button class="item" data-add="${f.fid}"><span class="n">${esc(f.n)}<small>${foodSub(f)}</small></span><span class="m">${f.p!=null?r1(f.p)+"ب":""}</span><span class="plus" aria-hidden="true">+</span></button>`;
  if(qq){
    const words=qq.split(/\s+/);
    let found=window.FORMA_SAY?FORMA_SAY.search(qq,{foods:all,stores:[...RESTS,"الحطب","المراعي","ندى"],recent:S.recent}):[];
    if(!found.length)found=all.filter(f=>words.every(w=>(f.n+" "+(f.store||"")+" "+f.cat).includes(w)));
    rows=found.slice(0,60).map(row);
    if(!rows.length)head=`<div class="empty">ما لقينا "${esc(qq)}". جرّب كلمة ثانية، أو أضفها من "+ سريعة".</div>`;
  }else if(cat==="الكل"){
    const rec=S.recent.map(getFood).filter(Boolean);
    head=rec.length?`<div class="row" style="margin-bottom:2px"><h2>آخر أكلاتك</h2><span class="sub">ضغطة وتنضاف</span></div>`:`<div class="empty">اختر قسم أو ابحث. آخر أكلاتك بتطلع هنا.</div>`;
    rows=rec.map(row);
  }else if(cat==="وجباتي"){
    head=S.meals.length?"":`<div class="empty">سجّل وجبة كاملة، وبعدين اضغط "احفظها كوجبة" تحت. بعدها تضيفها كلها بضغطة.</div>`;
    rows=S.meals.map((ml,i)=>{const k=ml.items.reduce((a,it)=>{const f=getFood(it.fid);return a+(f?macrosOf(f,it.amt).k:0)},0),p=ml.items.reduce((a,it)=>{const f=getFood(it.fid);return a+(f?macrosOf(f,it.amt).p:0)},0);return `<div class="item"><button class="n" style="background:none;padding:0;text-align:right;color:var(--ink)" data-addmeal="${i}">${esc(ml.n)}<small>${ml.items.length} أصناف · ${fmt(k)} سعرة · ${fmt(p)}ب</small></button><button class="del" data-delmeal="${i}" aria-label="احذف الوجبة">×</button><button class="plus" data-addmeal="${i}" aria-label="أضف ${esc(ml.n)}">+</button></div>`});
  }else if(cat==="أكلاتي"){
    head=S.custom.length?"":`<div class="empty">ما عندك أكلات خاصة. اضغط "+ سريعة" وفعّل حفظها.</div>`;
    rows=S.custom.map(row);
  }else if(cat==="مطاعم"){
    if(!restPick){rows=RESTS.map(r=>`<button class="item" data-rest="${r}"><span class="n">${r}<small>${RAW[r].length} صنف · ${SOURCES[r]?SOURCES[r][1].startsWith("رسمي")?"قيم رسمية":"قيم تقديرية":""}</small></span><span class="plus" aria-hidden="true">‹</span></button>`)}
    else{head=`<div class="row" style="margin-bottom:4px"><button class="ghost" data-rest="">→ كل المطاعم</button><span class="sub">${esc(restPick)}</span></div>`;rows=FOODS.filter(f=>f.cat===restPick).map(row)}
  }else{
    rows=FOODS.filter(f=>f.cat===cat).map(row);
  }
  box.innerHTML=head+`<div class="list">${rows.join("")}</div>`;
}
let restPick="";
function defaultMeal(){const h=new Date().getHours();return h<11?"فطور":h<16?"غداء":h<20?"سناك":"عشاء"}
function targetDay(){return tab==="food"&&foodDay?foodDay:today()}
function pushRecent(fid){S.recent=[fid,...S.recent.filter(x=>x!==fid)].slice(0,12)}
function afterAdd(k){save();render();const left=G().p-totals(k).p;toast(left>0?`انضافت. باقي ${fmt(left)} جم بروتين`:"قفلت بروتينك اليوم")}
function sheet(build){
  const bg=document.createElement("div");bg.className="sheet-bg";
  const sh=document.createElement("div");sh.className="sheet";sh.setAttribute("role","dialog");sh.setAttribute("aria-modal","true");
  const close=()=>{bg.remove();sh.remove();document.removeEventListener("keydown",onKey)};
  const onKey=e=>{if(e.key==="Escape")close()};
  bg.addEventListener("click",close);document.addEventListener("keydown",onKey);
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
      <div class="row"><input type="number" inputmode="decimal" id="amtIn" aria-label="${isG?"الكمية بالجرام":"عدد الحبات"}" value="${amt}" style="text-align:center"><span class="sub" style="white-space:nowrap">${isG?"جرام":"حبة"}</span></div>
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
function openQuick(){
  let meal=defaultMeal();
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","إضافة سريعة");
    sh.innerHTML=`<div class="grab"></div><h2>إضافة سريعة</h2><p class="note" style="margin:2px 0 12px">أكلة مو موجودة؟ اكتب أرقامها من الملصق أو من موقع المطعم.</p>
      <div class="stack" style="gap:10px">
      <div class="field"><label for="qkN">الاسم</label><input type="text" id="qkN" placeholder="مثال: ساندويتش حلوم"></div>
      <div class="grid2"><div class="field"><label for="qkK">سعرات</label><input type="number" inputmode="decimal" id="qkK" placeholder="350"></div><div class="field"><label for="qkP">بروتين جم</label><input type="number" inputmode="decimal" id="qkP" placeholder="20"></div></div>
      <div class="grid2"><div class="field"><label for="qkC">كارب جم</label><input type="number" inputmode="decimal" id="qkC" placeholder="اختياري"></div><div class="field"><label for="qkF">دهون جم</label><input type="number" inputmode="decimal" id="qkF" placeholder="اختياري"></div></div>
      </div>
      <label class="check"><input type="checkbox" id="qkSave" checked> احفظها في أكلاتي</label>
      <div class="meals">${MEALS.map(m=>`<button data-m="${m}" aria-pressed="${m===meal}">${m}</button>`).join("")}</div>
      <button class="primary wide" id="qkGo">أضف</button>`;
    sh.querySelector("#qkN").focus();
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.m){meal=b.dataset.m;sh.querySelectorAll("[data-m]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.m===meal))}
      else if(b.id==="qkGo"){
        const n=sh.querySelector("#qkN").value.trim()||"إضافة سريعة",k=+sh.querySelector("#qkK").value,p=+sh.querySelector("#qkP").value||0,c=+sh.querySelector("#qkC").value||0,f=+sh.querySelector("#qkF").value||0;
        if(!(k>0&&k<5000))return toast("اكتب السعرات");
        const dk=targetDay();
        if(sh.querySelector("#qkSave").checked){const item={fid:"c"+S.custom.length,n,cat:"أكلاتي",u:"pc",k,p,c,f,store:null};S.custom.push(item);day(dk).food.push({fid:item.fid,amt:1,meal});pushRecent(item.fid)}
        else day(dk).food.push({x:{n,u:"pc",k,p,c,f},amt:1,meal});
        close();afterAdd(dk);
      }});
  });
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
    const draw=()=>{const sg=suggestions(sugFilter);lastSug=sg.list;sh.innerHTML=`<div class="grab"></div><h2>وش آكل؟</h2><p class="note" style="margin:2px 0 10px">باقي لك ${fmt(Math.max(sg.R,0))} سعرة و ${fmt(Math.max(sg.P,0))} جم بروتين. هذي أقرب خيارات تقفلهم.</p>
      <div class="chips" style="margin-bottom:6px">${[["all","الكل"],["home","أكل بيت"],["rest","مطاعم"]].map(([k,l])=>`<button class="chip" data-sug="${k}" aria-pressed="${sugFilter===k}">${l}</button>`).join("")}</div>
      <div class="list">${sg.list.length?sg.list.map((c,i)=>`<button class="item" data-sugadd="${i}"><span class="n">${esc(c.label)}<small>${esc(c.sub)}</small></span><span class="m">${fmt(c.k)} · ${fmt(c.p)}ب</span><span class="plus" aria-hidden="true">+</span></button>`).join(""):`<div class="empty">${sg.R<120?"قربت تقفل سعراتك اليوم.":"ما فيه خيار يركب على الباقي. جرّب قسم ثاني."}</div>`}</div>`};
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
  if(!live||live.k!==S.prog+si)live={k:S.prog+si,v:{}};
  return `
  <div class="stack" style="gap:6px"><span class="lbl">${P.ar} · ${dL(P.days)} بالأسبوع · ${wkL(P.weeks)}</span><div class="row"><h1 class="num" dir="auto">${esc(sName(s.n))}</h1><span class="sub">جلسة ${Math.min(progDone()+1,progTotal())} من ${progTotal()}</span></div><div class="progress"><i style="width:${clamp(progDone()/progTotal()*100,0,100)}%"></i></div></div>
  ${P.note?`<p class="note">${esc(P.note)}</p>`:""}
  <div class="chips" role="group" aria-label="الجلسات">${P.sessions.map((x,i)=>`<button class="chip num" data-sess="${i}" aria-pressed="${i===si}" dir="auto">${esc(sName(x.n))}</button>`).join("")}</div>
  <button class="ed-add" id="openEdit">عدّل الجدول</button>
  <details class="card flat"><summary>طريقة التمرين في FORMA ‹</summary><ul class="guide" style="margin-top:8px">
    <li>اكتب الوزن والعدات لكل مجموعة. الخانة الفاضية تاخذ رقم المرة الماضية، فإذا كررته اضغط ✓ بس.</li>
    <li>وقّف قبل الفشل بعدة أو عدتين. آخر مجموعة في تمارين العزل كمّلها للفشل.</li>
    <li>إذا وصلت أعلى العدات في كل المجموعات، يطلع لك "زد الوزن" المرة الجاية.</li>
    <li>الجهاز مشغول؟ اضغط "بدّل" واختر بديل.</li><li>تبي تغيّر التمارين أو المجموعات أو العدات؟ اضغط "عدّل الجدول".</li></ul></details>
  <div class="card">${s.ex.map((e,i)=>{const n=exName(si,i),sets=e[1],reps=e[2],top=+String(reps).split("-").pop(),last=lastFor(n),best=bestFor(n);
    const up=last&&last.length>=sets&&last.slice(0,sets).every(x=>x[1]>=top);
    return `<div class="ex"><div class="ex-h"><div style="min-width:0"><a href="${yt(n)}" target="_blank" rel="noopener">${esc(n)} ↗</a>
      <div class="meta"><span class="pill mute num">${sets} مجموعات</span><span class="pill mute num">${reps} عدات</span>${up?`<span class="pill">زد الوزن</span>`:""}${n!==e[0]?`<span class="pill mute">بديل</span>`:""}</div></div>
      ${ALTS[e[0]]||n!==e[0]?`<button class="swap" data-swap="${i}">بدّل</button>`:""}</div>
    <div class="last num">${last?`آخر مرة: ${last.map(x=>x[0]+"×"+x[1]).join("  ·  ")}${best?`  ·  أفضل ${best}`:""}`:"أول مرة: ابدأ بوزن مريح، وآخر عدتين تكون صعبة"}</div>
    <div class="sets"><span class="h">#</span><span class="h">كغ</span><span class="h">عدات</span><span class="h">تم</span>
    ${Array.from({length:sets},(_,j)=>{const v=live.v[n+"|"+j]||{},ph=last&&last[j]?last[j]:["",""],isPr=best&&+v.kg>best;
      return `<span class="h num">${j+1}</span><input type="number" inputmode="decimal" class="${isPr?"pr":""}" aria-label="${esc(n)} مجموعة ${j+1} وزن" data-k="${esc(n)}|${j}|kg" data-best="${best}" placeholder="${ph[0]}" value="${v.kg??""}"><input type="number" inputmode="numeric" aria-label="${esc(n)} مجموعة ${j+1} عدات" data-k="${esc(n)}|${j}|r" placeholder="${ph[1]||String(reps).split("-")[0]}" value="${v.r??""}"><button class="done" data-done="${esc(n)}|${j}" aria-pressed="${!!v.d}" aria-label="تمت المجموعة">✓</button>`}).join("")}</div></div>`}).join("")}
  </div>
  <button class="primary" id="finish">خلصت التمرين</button>`;
}
function openSwap(i){
  const si=sessIdx(),orig=prog().sessions[si].ex[i][0],cur=exName(si,i),opts=[orig,...(ALTS[orig]||[])];
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","بدّل التمرين");
    sh.innerHTML=`<div class="grab"></div><h2>بدّل التمرين</h2><p class="note" style="margin:2px 0 10px">التبديل يثبت لهذي الجلسة في كل الأسابيع الجاية.</p><div class="seg" style="grid-template-columns:1fr">${opts.map(o=>`<button data-alt="${esc(o)}" aria-pressed="${o===cur}" dir="ltr" class="num">${esc(o)}${o===orig?' <small dir="rtl">الأساسي</small>':""}</button>`).join("")}</div>`;
    sh.addEventListener("click",e=>{const b=e.target.closest("[data-alt]");if(!b)return;const sw=S.swaps[S.prog]=S.swaps[S.prog]||{};if(b.dataset.alt===orig)delete sw[si+"|"+i];else sw[si+"|"+i]=b.dataset.alt;save();close();render()});
  });
}
function startRest(){
  restAt=Date.now();clearInterval(restTimer);
  let el=$("#rest");if(!el){el=document.createElement("div");el.id="rest";el.className="rest";el.setAttribute("role","timer");document.body.appendChild(el)}
  const tick=()=>{if(!restAt||tab!=="train"){el.remove();clearInterval(restTimer);return}const s=Math.floor((Date.now()-restAt)/1000);el.innerHTML=`راحة ${Math.floor(s/60)}:${pad(s%60)} <button aria-label="أوقف المؤقت">×</button>`;el.querySelector("button").onclick=()=>{restAt=null;tick()}};
  tick();restTimer=setInterval(tick,1000);
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
  const T=today();
  S.history.push({date:T,prog:S.prog,s:si,sets});day(T).trained=true;
  S.sessionIdx=(si+1)%P.sessions.length;live=null;restAt=null;save();tab="today";render();
  toast(prs.length?`رقم جديد في ${prs[0]}. الجاي ${sName(P.sessions[S.sessionIdx].n)}`:`انحفظ تمرينك. الجاي ${sName(P.sessions[S.sessionIdx].n)}`);
}

/* ===== قول وش أكلت ===== */
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
  if(!res.items.length){q=text;cat="الكل";const qi=$("#q");if(qi){qi.value=res.miss[0]||text}q=res.miss[0]||text;renderResults();return toast("ما عرفتها. دوّرها في البحث أو أضفها سريعة")}
  let meal=res.meal||defaultMeal();
  const its=res.items.map(it=>({...it,fid:it.f.fid}));
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","تأكيد الأكل");
    const draw=()=>{
      let tk=0,tp=0;its.forEach(it=>{const m=macrosOf(getFood(it.fid),it.amt);tk+=m.k;tp+=m.p});
      sh.innerHTML=`<div class="grab"></div><h2>فهمت كذا</h2><p class="note" style="margin:2px 0 10px">تأكد من الأكلة والكمية. اضغط الاسم إذا تبي غيره.</p>
      <div class="stack" style="gap:10px">${its.map((it,i)=>{const f=getFood(it.fid),m=macrosOf(f,it.amt);return `<div class="say-row">
        <select class="say-sel" data-si="${i}" aria-label="الأكلة">${it.alts.map(a=>`<option value="${a.fid}" ${a.fid===it.fid?"selected":""}>${esc(a.n)}</option>`).join("")}</select>
        <div class="row" style="gap:8px"><input type="number" inputmode="decimal" class="say-amt" data-sa="${i}" value="${it.amt}" aria-label="الكمية"><span class="sub" style="white-space:nowrap">${f.u==="g"?"جم":"حبة"}</span><span class="m num" style="margin-inline-start:auto;white-space:nowrap" data-sm="${i}">${fmt(m.k)} · ${fmt(m.p)}ب</span><button class="del" data-sd="${i}" aria-label="احذف">×</button></div>
      </div>`}).join("")}
      ${res.miss.map(x=>`<div class="note">ما عرفت "${esc(x)}". <button class="ghost" data-sq="${esc(x)}" style="padding:0 4px">دوّرها</button></div>`).join("")}</div>
      <div class="meals" style="margin-top:12px">${MEALS.map(x=>`<button data-m="${x}" aria-pressed="${x===meal}">${x}</button>`).join("")}</div>
      <button class="primary wide" id="sayAdd" style="margin-top:12px" ${its.length?"":"disabled"}>أضف ${fmt(tk)} سعرة · ${fmt(tp)} بروتين</button>`};
    draw();
    sh.addEventListener("change",e=>{const i=e.target.dataset.si;if(i==null)return;const it=its[+i],f=getFood(e.target.value);if(!f)return;
      it.fid=f.fid;it.amt=Math.round(FORMA_SAY.amtFor(f,{...it.q,last:S.lastAmt&&S.lastAmt[f.fid]})*100)/100;S.learned=S.learned||{};S.learned[it.key]=f.fid;draw()});
    sh.addEventListener("input",e=>{const i=e.target.dataset.sa;if(i==null)return;const v=parseFloat(e.target.value);if(!(v>0))return;its[+i].amt=v;
      const m=macrosOf(getFood(its[+i].fid),v);sh.querySelector(`[data-sm="${i}"]`).textContent=`${fmt(m.k)} · ${fmt(m.p)}ب`;
      let tk=0,tp=0;its.forEach(it=>{const mm=macrosOf(getFood(it.fid),it.amt);tk+=mm.k;tp+=mm.p});sh.querySelector("#sayAdd").textContent=`أضف ${fmt(tk)} سعرة · ${fmt(tp)} بروتين`});
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.m){meal=b.dataset.m;return draw()}
      if(b.dataset.sd!=null){its.splice(+b.dataset.sd,1);if(!its.length&&!res.miss.length)return close();return draw()}
      if(b.dataset.sq!=null){close();q=b.dataset.sq;cat="الكل";const qi=$("#q");if(qi)qi.value=q;renderResults();qi&&qi.focus();return}
      if(b.id==="sayAdd"){const k=targetDay();its.forEach(it=>{if(it.amt>0){day(k).food.push({fid:it.fid,amt:it.amt,meal});pushRecent(it.fid)}});
        its.forEach(it=>{S.learned=S.learned||{};S.learned[it.key]=it.fid});close();afterAdd(k)}});
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
function vProgress(){
  const p=S.profile,ws=weightsSorted().slice(-28),tr=trend(),cw=currentWeight();
  let chart='<div class="empty">سجّل وزنك يومين وتطلع لك الرسمة.</div>';
  if(ws.length>1){
    const W=320,H=160,L=36,vals=ws.map(x=>x[1]),tv=p.tw&&Math.abs(p.tw-cw)<8?p.tw:null;
    const mn=Math.floor(Math.min(...vals,tv??Infinity)-0.4),mx=Math.ceil(Math.max(...vals,tv??-Infinity)+0.4);
    const X=i=>L+i*(W-L-10)/(ws.length-1),Y=v=>12+(mx-v)*(H-44)/(mx-mn);
    const avg=ws.map((w,i)=>{const sl=vals.slice(Math.max(0,i-6),i+1);return [X(i),Y(sl.reduce((a,b)=>a+b,0)/sl.length)]});
    const ticks=[mn,(mn+mx)/2,mx];
    chart=`<div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:260px" role="img" aria-label="رسم الوزن">
      ${ticks.map(t=>`<line x1="${L}" x2="${W-10}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="${L-6}" y="${Y(t)+4}" text-anchor="end">${t.toFixed(1)}</text>`).join("")}
      ${tv?`<line x1="${L}" x2="${W-10}" y1="${Y(tv)}" y2="${Y(tv)}" stroke="var(--hot)" stroke-dasharray="4 4"/><text x="${W-10}" y="${Y(tv)-5}" text-anchor="end" style="fill:var(--hot)">هدفك ${tv}</text>`:""}
      ${ws.map((w,i)=>`<circle cx="${X(i)}" cy="${Y(w[1])}" r="2.6" fill="var(--muted)" opacity=".55"/>`).join("")}
      <polyline points="${avg.map(a=>a.join(",")).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${avg[avg.length-1][0]}" cy="${avg[avg.length-1][1]}" r="5" fill="var(--accent)"/>
      <text x="${L}" y="${H-10}">${dateAr(ws[0][0])}</text><text x="${W-10}" y="${H-10}" text-anchor="end">${dateAr(ws[ws.length-1][0])}</text></svg></div>
      <div class="legend"><span><b style="background:var(--accent)"></b>متوسط 7 أيام</span><span><b style="background:var(--muted)"></b>وزنك اليومي</span></div>`;
  }
  let eta="";
  if(p.tw&&tr&&Math.abs(cw-p.tw)>0.3){const need=p.tw-cw,rate=tr.kgWeek;if(rate&&Math.sign(rate)===Math.sign(need)){const wk=Math.ceil(Math.abs(need/rate));eta=`${dateAr(key(addDays(new Date(),wk*7)))} تقريبا`}}
  const startW=p.startW||p.w,doneKg=startW-cw,goalKg=p.tw?startW-p.tw:0,pct=goalKg?clamp(doneKg/goalKg*100,0,100):0;
  const cells=[];for(let i=27;i>=0;i--){const k=key(addDays(new Date(),-i)),d=S.days[k];cells.push(`<i class="${d&&d.trained?"w":d&&(d.food||[]).length?"f":""} ${i===0?"t":""}" title="${k}"></i>`)}
  const lifts={};S.history.forEach(h=>Object.entries(h.sets||{}).forEach(([n,ss])=>ss.forEach(s=>{if(!lifts[n]||s[0]>lifts[n])lifts[n]=s[0]})));
  const top=Object.entries(lifts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const wkTrain=S.history.filter(h=>daysBetween(h.date,today())<7).length;
  return `<div><h1>تقدمي</h1><div class="sub">من ${dateAr(p.start||today())}</div></div>
  <div class="stats"><div class="stat"><b class="num">${r1(cw)}</b><span>وزنك الحالي</span></div><div class="stat"><b class="num">${tr?(tr.kgWeek>0?"+":"")+r1(tr.kgWeek):"-"}</b><span>كغ بالأسبوع</span></div><div class="stat"><b class="num">${G().bmi}</b><span>مؤشر الكتلة</span></div></div>
  ${p.tw?`<div class="card stack"><div class="row"><h2>هدفك ${p.tw} كغ</h2><span class="pill">${Math.round(pct)}%</span></div><div class="progress"><i style="width:${pct}%"></i></div><div class="row sub"><span>بدأت ${startW}</span><span>${eta?`توصل ${eta}`:"نحسب موعد وصولك بعد أسبوعين وزن"}</span></div></div>`:""}
  <div class="card"><h2 style="margin-bottom:8px">الوزن</h2>${chart}</div>
  <div class="card"><div class="row"><h2>آخر 4 أسابيع</h2><span class="pill">${streak()} يوم متتالي</span></div>
    <div class="grid28" style="margin-top:12px">${cells.join("")}</div>
    <div class="legend"><span><b style="background:var(--accent)"></b>تمرّنت</span><span><b style="background:color-mix(in srgb,var(--accent) 40%,var(--track))"></b>سجلت أكل</span><span><b style="background:var(--track)"></b>ما سجلت</span></div>
    <p class="note" style="margin-top:8px">تمارين هالأسبوع: ${wkTrain} من ${prog().days}</p></div>
  <div class="card"><h2>أقوى أرقامك</h2><div class="list">${top.length?top.map(([n,kg])=>`<div class="item"><span class="n num" dir="ltr" style="text-align:right">${esc(n)}</span><span class="m">${kg} كغ</span></div>`).join(""):`<div class="empty">أول تمرين تخلصه يطلع هنا.</div>`}</div></div>`;
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
  <div class="card stack"><h2>بياناتي</h2><button data-go="setup">عدّل الطول والوزن والهدف</button>
    <div class="grid2"><button id="exportB">نسخة احتياطية</button><button id="importB">استرجاع نسخة</button></div><input type="file" id="importF" accept="application/json,.json" hidden>
    <p class="note">بياناتك محفوظة على جهازك بس. خذ نسخة احتياطية قبل ما تغيّر جوالك.</p>
    <button id="cycleB">${cycleArmed?"متأكد؟ اضغط مرة ثانية":"ابدأ دورة جديدة"}</button>
    <p class="note">الدورة الجديدة تمسح سجل الأكل والوزن والتمارين وتبدأك من اليوم. ملفك وأكلاتي ووجباتي تبقى.</p></div>
  <div class="card stack"><h2>مصادر القيم</h2><div class="list">${Object.entries(SOURCES).map(([s,v])=>`<div class="item"><span class="n">${s}<small>${esc(v[0])}</small></span><span class="pill ${v[1].startsWith("رسمي")?"":"mute"}">${v[1]}</span></div>`).join("")}</div><p class="note">رسمي = منشور في موقع المتجر السعودي. تقديري = محسوب من مصادر مشابهة.</p></div>
  <button class="danger" id="resetB">${resetArmed?"متأكد؟ اضغط مرة ثانية ويتمسح كل شي":"امسح كل بياناتي"}</button>
  <p class="note center">FORMA 2.4 · للاستخدام الشخصي فقط. © 2026 FORMA</p>`;
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
function render(){
  const setup=tab==="setup";
  $("nav").hidden=setup;$("#hdr").hidden=setup&&!S.profile;
  document.querySelectorAll("nav button").forEach(b=>{if(b.dataset.tab===tab)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  $("#streakN").textContent=S.profile?streak():0;
  const views={setup:vSetup,today:vToday,food:vFood,train:vTrain,progress:vProgress,settings:vSettings,edit:vEdit};
  $("#view").innerHTML=(views[tab]||vToday)();
  if(tab==="today"){const sg=suggestions(sugFilter);lastSug=sg.list}
  if(tab==="food")renderResults();
  if(tab!=="train"&&$("#rest"))$("#rest").remove();
  window.scrollTo(0,0);
}
$("#gearB").innerHTML=ICON.gear;$("#streakIco").innerHTML=ICON.flame;
document.querySelector("nav").addEventListener("click",e=>{const b=e.target.closest("button");if(b){tab=b.dataset.tab;ed=null;resetArmed=cycleArmed=false;if(tab==="food"){foodDay=today()}render()}});
$("#gearB").addEventListener("click",()=>{tab="settings";ed=null;resetArmed=cycleArmed=false;render()});
$("#view").addEventListener("submit",e=>{e.preventDefault();if(e.target.id==="setup")submitSetup();if(e.target.id==="sayF")openSay($("#sayIn").value)});
$("#view").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  const d=b.dataset;
  if(d.ob){readSetupFields();ob[d.ob]=d.v;render();return}
  if(d.go){tab=d.go;if(tab!=="setup")ob=null;if(tab!=="edit")ed=null;if(tab==="food")foodDay=today();render();return}
  if(d.add!==undefined)return openFood(d.add);
  if(d.cat){cat=d.cat;restPick="";q="";const qi=$("#q");if(qi)qi.value="";document.querySelectorAll(".chip[data-cat]").forEach(c=>c.setAttribute("aria-pressed",c.dataset.cat===cat));return renderResults()}
  if(d.rest!==undefined){restPick=d.rest;return renderResults()}
  if(d.del!==undefined){day(foodDay).food.splice(+d.del,1);save();return render()}
  if(d.savemeal){const items=(S.days[foodDay]?.food||[]).filter(x=>x.meal===d.savemeal&&x.fid).map(x=>({fid:x.fid,amt:x.amt}));if(!items.length)return toast("ما فيه أصناف تنحفظ");const n=items.slice(0,2).map(it=>getFood(it.fid)?.n).filter(Boolean).join(" + ")+(items.length>2?" +"+(items.length-2):"");S.meals.unshift({n,items});save();return toast("انحفظت في وجباتي")}
  if(d.addmeal!==undefined){const ml=S.meals[+d.addmeal];if(!ml)return;const k=targetDay(),meal=defaultMeal();ml.items.forEach(it=>day(k).food.push({fid:it.fid,amt:it.amt,meal}));return afterAdd(k)}
  if(d.delmeal!==undefined){S.meals.splice(+d.delmeal,1);save();return renderResults()}
  if(d.sess!==undefined){S.sessionIdx=+d.sess;live=null;save();return render()}
  if(d.swap!==undefined)return openSwap(+d.swap);
  if(d.prog){if(S.prog!==d.prog){S.prog=d.prog;S.sessionIdx=0;S.progStart=today();live=null;save();render();toast("برنامجك الحين: "+prog().ar)}return}
  if(d.done){const v=live.v[d.done]=live.v[d.done]||{};v.d=!v.d;b.setAttribute("aria-pressed",v.d);if(v.d)startRest();return}
  if(d.sug){sugFilter=d.sug;return render()}
  if(d.sugadd!==undefined)return addSug(+d.sugadd);
  if(d.edx)return edAction(d.edx);
  switch(b.id){
    case "openEdit":return openEditor(S.prog);
    case "newMine":return openEditor("mine");
    case "edSave":return edSave();
    case "edReset":return edReset();
    case "openSug":return openSug();
    case "openPlan":return openPlan();
    case "doInstall":if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.finally(()=>{deferredPrompt=null;render()})}return;
    case "rvApply":{const rv=weeklyReview();if(rv){S.adj+=rv.delta;S.lastReview=today();save();render();toast(`سعراتك الحين ${fmt(G().kcal)}`)}return}
    case "rvSkip":S.lastReview=today();save();return render();
    case "wSave":{const v=parseFloat($("#wIn").value);if(v>=35&&v<=250){day(today()).weight=v;save();render();toast("انحفظ وزنك")}else toast("اكتب وزن صحيح بالكيلو");return}
    case "prevD":foodDay=key(addDays(parseKey(foodDay),-1));return render();
    case "nextD":if(foodDay!==today()){foodDay=key(addDays(parseKey(foodDay),1));render()}return;
    case "quick":return openQuick();
    case "sayMic":return listen(b);
    case "copyY":{const src=S.days[key(addDays(parseKey(foodDay),-1))];if(src&&src.food.length){day(foodDay).food.push(...src.food.map(x=>({...x})));save();render();toast("انضاف أكل اليوم السابق")}else toast("ما فيه أكل مسجل في اليوم السابق");return}
    case "finish":return finish();
    case "saveCk":{const v=+$("#ck").value;if(!$("#ck").value){S.profile.customKcal=null;save();render();return toast("رجعنا للحساب التلقائي")}if(v>=1200&&v<=6000){S.profile.customKcal=v;S.adj=0;save();render();toast("انحفظت سعراتك")}else toast("اكتب رقم بين 1200 و 6000");return}
    case "resetAdj":S.adj=0;save();return render();
    case "exportB":return exportData();
    case "importB":return $("#importF").click();
    case "cycleB":if(!cycleArmed){cycleArmed=true;return render()}S.days={};S.history=[];S.adj=0;S.lastReview=null;S.sessionIdx=0;S.progStart=today();S.profile.start=today();S.profile.startW=currentWeight();cycleArmed=false;save();tab="today";render();return toast("بدأت دورة جديدة");
    case "resetB":if(!resetArmed){resetArmed=true;return render()}try{localStorage.removeItem(STORE)}catch(e){}S={};normalize();resetArmed=false;ob=null;tab="setup";return render();
  }
});
$("#view").addEventListener("change",e=>{if(e.target.id==="importF"&&e.target.files[0])importData(e.target.files[0])});
$("#view").addEventListener("input",e=>{
  if(e.target.id==="q"){q=e.target.value;return renderResults()}
  if(e.target.dataset.ed&&ed){const [f,si,i]=e.target.dataset.ed.split("|");const v=e.target.value;
    if(f==="sn")ed.sessions[+si].n=v;else if(f==="r")ed.sessions[+si].ex[+i][2]=v;else if(f==="pn")ed.name=v;else if(f==="wk")ed.weeks=v;return}
  const k=e.target.dataset.k;
  if(k){const parts=k.split("|"),f=parts.pop(),j=parts.pop(),n=parts.join("|");const v=live.v[n+"|"+j]=live.v[n+"|"+j]||{};v[f]=e.target.value;
    if(f==="kg"){const best=+e.target.dataset.best;e.target.classList.toggle("pr",best>0&&+e.target.value>best)}}
});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&tab==="today")render()});
render();

/* ===== بدون نت ===== */
if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{})})}
})();
