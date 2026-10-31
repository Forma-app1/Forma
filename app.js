/* FORMA v1 */
(function(){
"use strict";

/* ---------- البيانات الثابتة ---------- */
const FOODS=(window.FORMA_FOODS||[]).map((r,i)=>({fid:"b"+i,n:r[0],cat:r[1],u:r[2],k:r[3],p:r[4],c:r[5],f:r[6]}));
const MEALS=["فطور","غداء","عشاء","سناك"];
const CATS=["الكل","أكلاتي",...Array.from(new Set(FOODS.map(f=>f.cat)))];
const ACT=[["خامل","بدون رياضة",1.2],["خفيف","1-3 أيام",1.375],["متوسط","3-5 أيام",1.55],["عالي","6-7 أيام",1.725]];
const GOALS=[["خسارة دهون","عجز 20%",-0.2],["ثبات","بدون تغيير",0],["زيادة عضل","فائض 10%",0.1]];
const PROGRAMS={
 fb3:{name:"Full Body",days:"3 أيام بالأسبوع",sessions:[
  {n:"Full Body A",ex:[["Back Squat",3,"5-7"],["Bench Press",3,"6-8"],["Chest-Supported Row",3,"8-10"],["Romanian Deadlift",2,"8-10"],["Lateral Raise",3,"12-15"]]},
  {n:"Full Body B",ex:[["Deadlift",3,"4-6"],["Overhead Press",3,"8-10"],["Pull-Up",3,"6-10"],["Leg Press",3,"10-12"],["Hammer Curl",2,"10-12"]]},
  {n:"Full Body C",ex:[["Hack Squat",3,"8-10"],["Incline DB Press",3,"8-10"],["Lat Pulldown",3,"10-12"],["Hip Thrust",3,"8-12"],["Triceps Pushdown",2,"10-12"]]}]},
 ul4:{name:"Upper / Lower",days:"4 أيام بالأسبوع",sessions:[
  {n:"Upper A",ex:[["Bench Press",3,"6-8"],["Chest-Supported Row",3,"8-10"],["Overhead Press",3,"8-10"],["Lat Pulldown",3,"10-12"],["Lateral Raise",3,"12-15"]]},
  {n:"Lower A",ex:[["Back Squat",3,"5-7"],["Romanian Deadlift",3,"8-10"],["Leg Press",3,"10-12"],["Leg Curl",3,"10-12"],["Calf Raise",3,"12-15"]]},
  {n:"Upper B",ex:[["Incline DB Press",3,"8-10"],["Pull-Up",3,"6-10"],["Seated Cable Row",3,"10-12"],["Dips",3,"8-12"],["Hammer Curl",3,"10-12"]]},
  {n:"Lower B",ex:[["Deadlift",3,"4-6"],["Bulgarian Split Squat",3,"8-10"],["Leg Extension",3,"12-15"],["Hip Thrust",3,"8-12"],["Hanging Leg Raise",3,"10-15"]]}]},
 ppl:{name:"Push Pull Legs",days:"5-6 أيام بالأسبوع",sessions:[
  {n:"Push",ex:[["Bench Press",3,"6-8"],["Overhead Press",3,"8-10"],["Incline DB Press",3,"8-10"],["Lateral Raise",3,"12-15"],["Triceps Pushdown",3,"10-12"]]},
  {n:"Pull",ex:[["Pull-Up",3,"6-10"],["Barbell Row",3,"8-10"],["Lat Pulldown",3,"10-12"],["Face Pull",3,"12-15"],["Hammer Curl",3,"10-12"]]},
  {n:"Legs",ex:[["Back Squat",3,"5-7"],["Romanian Deadlift",3,"8-10"],["Leg Press",3,"10-12"],["Leg Curl",3,"10-12"],["Calf Raise",3,"12-15"]]}]}
};
const yt=n=>"https://www.youtube.com/results?search_query="+encodeURIComponent("Jeff Nippard "+n);
const TIPS=[
"اللي يسجّل أكله يوصل لهدفه أسرع. سجّل وجبتك الجاية الحين، تاخذ منك 10 ثواني.",
"البروتين أول شي في الصحن. لو خلصت بروتينك اليوم، نص الشغل خلص.",
"فوّت تمرين؟ عادي. FORMA ما يحسبها عليك، الجلسة الجاية تنتظرك بنفس مكانها.",
"زد كيلو واحد أو تكرار واحد عن المرة الماضية. هذا كل المطلوب اليوم.",
"وزنك يتذبذب من يوم ليوم بسبب الماي والملح. شوف متوسط الأسبوع، مو رقم اليوم.",
"النوم 7 ساعات يرفع أداءك في الجيم أكثر من أي مكمّل.",
"عزيمة الليلة؟ سجّلها من الحين وخطط باقي يومك عليها.",
"اللي يوصل مو الأقوى، هو اللي ما يقطع. حافظ على السلسلة.",
"كوب ماي قبل كل وجبة. سهلة وتفرق.",
"لا تعوّض يوم الغلط بالجوع. ارجع لخطتك من الوجبة الجاية.",
"عضلتك تكبر وقت الراحة. يوم الراحة جزء من البرنامج.",
"الثبات 80% أحسن من الكمال 100% اللي يوقف بعد أسبوعين.",
"صوّر نفسك كل أسبوعين بنفس الإضاءة. الصورة تبين اللي الميزان ما يبينه.",
"آخر مجموعتين في كل تمرين هي اللي تبني. خلها قريبة من الفشل."
];

/* ---------- أدوات ---------- */
const pad=n=>String(n).padStart(2,"0");
const key=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const parseKey=k=>new Date(k+"T12:00:00");
const today=()=>key(new Date());
const fmt=n=>Math.round(n).toLocaleString("en-US");
const r1=n=>Math.round(n*10)/10;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(msg){document.querySelectorAll(".toast").forEach(t=>t.remove());const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2400)}

/* ---------- الحالة ---------- */
const STORE="forma-v1";
let S=null;
try{S=JSON.parse(localStorage.getItem(STORE)||"null")}catch(e){S=null}
if(!S||typeof S!=="object") S={};
S.days=S.days||{};S.recent=S.recent||[];S.custom=S.custom||[];S.history=S.history||[];S.sessionIdx=S.sessionIdx||0;S.prog=S.prog||"ul4";
function save(){try{localStorage.setItem(STORE,JSON.stringify(S))}catch(e){toast("ما قدرنا نحفظ. تأكد إن التخزين مفعّل")}}
const day=k=>(S.days[k]=S.days[k]||{food:[],weight:null});

function calcGoal(p){
  const bmr=10*p.w+6.25*p.h-5*p.age+(p.sex==="أنثى"?-161:5);
  const kcal=Math.round(bmr*ACT[p.act][2]*(1+GOALS[p.goal][2])/10)*10;
  const pr=Math.round(p.w*(p.goal===0?2.2:2.0));
  const fat=Math.round(kcal*0.25/9);
  const carb=Math.max(0,Math.round((kcal-pr*4-fat*9)/4));
  return {kcal,p:pr,c:carb,f:fat};
}
function getFood(fid){if(!fid)return null;return fid[0]==="b"?FOODS[+fid.slice(1)]:S.custom[+fid.slice(1)]}
const entryFood=e=>e.x||getFood(e.fid)||{n:"صنف محذوف",k:0,p:0,c:0,f:0,u:""};
function totals(k){const t={kcal:0,p:0,c:0,f:0};(S.days[k]?.food||[]).forEach(e=>{const f=entryFood(e);t.kcal+=f.k*e.q;t.p+=f.p*e.q;t.c+=f.c*e.q;t.f+=f.f*e.q});return t}
const active=k=>!!(S.days[k]&&((S.days[k].food||[]).length||S.days[k].trained));
function streak(){let n=0,d=new Date();if(!active(key(d)))d=addDays(d,-1);while(active(key(d))){n++;d=addDays(d,-1)}return n}
const prog=()=>PROGRAMS[S.prog]||PROGRAMS.ul4;
const sessIdx=()=>S.sessionIdx%prog().sessions.length;
const tipBase=()=>{const d=new Date();return (d.getDate()+d.getMonth()*31)%TIPS.length};
let tipShift=0;
const isStandalone=()=>window.navigator.standalone===true||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches);
const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;if(tab==="today")render()});

/* ---------- حلقة التقدم ---------- */
function ring(val,goal,label,unit){
  const r=48,C=2*Math.PI*r,pct=goal?Math.min(val/goal,1):0,left=goal-val;
  const col=left<0?"var(--warm)":"var(--accent)";
  return `<div class="ring"><svg viewBox="0 0 116 116" role="img" aria-label="${label}: ${fmt(val)} من ${fmt(goal)}">
  <circle cx="58" cy="58" r="${r}" fill="none" stroke="var(--track)" stroke-width="10"/>
  <circle class="v" cx="58" cy="58" r="${r}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}" transform="rotate(-90 58 58)"/>
  <text x="58" y="56" text-anchor="middle" style="font-size:20px;font-weight:700;fill:var(--ink);font-family:var(--display)">${fmt(Math.abs(left))}</text>
  <text x="58" y="74" text-anchor="middle">${left<0?"زيادة":"باقي"} ${unit}</text></svg>
  <div class="sub">${label} · ${fmt(val)} / ${fmt(goal)}</div></div>`;
}

/* ---------- الإعداد الأول ---------- */
let ob=null;
function vSetup(){
  if(!ob){const p=S.profile||{};ob={name:p.name||"",sex:p.sex||"ذكر",age:p.age||"",h:p.h||"",w:p.w||"",act:p.act??2,goal:p.goal??0,prog:S.prog||"ul4"}}
  const edit=!!S.profile;
  return `
  <div class="hero">${edit?"":`<div class="brand">FORMA</div>`}<h1>${edit?"عدّل بياناتك":"خلنا نجهز خطتك"}</h1><div class="sub">${edit?"نحسب أهدافك من جديد على البيانات الجديدة.":"دقيقة وحدة، ونحسب لك السعرات والبروتين ونختار برنامجك."}</div></div>
  <form id="setup" class="stack" novalidate>
    <div class="card stack">
      <div class="field"><label for="obName">اسمك</label><input type="text" id="obName" autocomplete="given-name" value="${esc(ob.name)}" placeholder="مثال: جواد"></div>
      <div><div class="flabel">الجنس</div><div class="seg" style="grid-template-columns:1fr 1fr;margin-top:6px">${["ذكر","أنثى"].map(s=>`<button type="button" data-ob="sex" data-v="${s}" aria-pressed="${ob.sex===s}">${s}</button>`).join("")}</div></div>
      <div class="grid3">
        <div class="field"><label for="obAge">العمر</label><input type="number" inputmode="numeric" id="obAge" value="${ob.age}" placeholder="24"></div>
        <div class="field"><label for="obH">الطول سم</label><input type="number" inputmode="numeric" id="obH" value="${ob.h}" placeholder="175"></div>
        <div class="field"><label for="obW">الوزن كجم</label><input type="number" inputmode="decimal" step="0.1" id="obW" value="${ob.w}" placeholder="80"></div>
      </div>
    </div>
    <div class="card"><div class="flabel">نشاطك اليومي</div><div class="seg" style="grid-template-columns:repeat(2,1fr);margin-top:8px">${ACT.map((a,i)=>`<button type="button" data-ob="act" data-v="${i}" aria-pressed="${ob.act==i}">${a[0]}<small>${a[1]}</small></button>`).join("")}</div></div>
    <div class="card"><div class="flabel">هدفك</div><div class="seg" style="grid-template-columns:repeat(3,1fr);margin-top:8px">${GOALS.map((g,i)=>`<button type="button" data-ob="goal" data-v="${i}" aria-pressed="${ob.goal==i}">${g[0]}<small>${g[1]}</small></button>`).join("")}</div></div>
    <div class="card"><div class="flabel">برنامج التمرين</div><div class="seg" style="grid-template-columns:1fr;margin-top:8px">${Object.entries(PROGRAMS).map(([k,p])=>`<button type="button" data-ob="prog" data-v="${k}" aria-pressed="${ob.prog===k}" dir="ltr">${p.name}<small dir="rtl">${p.days}</small></button>`).join("")}</div></div>
    <button type="submit" class="primary wide">${edit?"احفظ واحسب من جديد":"ابدأ مع FORMA"}</button>
    ${edit?`<button type="button" class="ghost" data-go="settings">إلغاء</button>`:""}
  </form>`;
}
function submitSetup(){
  ob.name=$("#obName").value.trim();ob.age=+$("#obAge").value;ob.h=+$("#obH").value;ob.w=+$("#obW").value;
  if(!ob.name){toast("اكتب اسمك");return}
  if(!(ob.age>=13&&ob.age<=90)){toast("اكتب عمر بين 13 و 90");return}
  if(!(ob.h>=120&&ob.h<=230)){toast("اكتب الطول بالسنتيمتر");return}
  if(!(ob.w>=35&&ob.w<=250)){toast("اكتب الوزن بالكيلو");return}
  const first=!S.profile;
  if(S.prog!==ob.prog){S.sessionIdx=0}
  S.profile={name:ob.name,sex:ob.sex,age:ob.age,h:ob.h,w:ob.w,act:+ob.act,goal:+ob.goal};
  S.prog=ob.prog;S.goal=calcGoal(S.profile);
  if(first){day(today()).weight=ob.w}
  ob=null;save();tab="today";render();
  toast(`خطتك جاهزة: ${fmt(S.goal.kcal)} سعرة و ${S.goal.p} جم بروتين`);
}

/* ---------- اليوم ---------- */
function vToday(){
  const T=today(),t=totals(T),G=S.goal,P=prog(),nx=P.sessions[sessIdx()],st=streak();
  const lastW=Object.keys(S.days).sort().reverse().map(k=>S.days[k].weight).find(w=>w);
  const remP=G.p-t.p,remK=G.kcal-t.kcal;
  let hint="";
  if(remP>15){
    const best=FOODS.concat(S.custom).filter(f=>f.p>=12&&f.k<=Math.max(remK,250)).sort((a,b)=>(b.p/b.k)-(a.p/a.k)).slice(0,3);
    if(best.length) hint=`<div class="card"><div class="row"><h2>باقي لك ${fmt(remP)} جم بروتين</h2><span class="pill warm">اقتراح</span></div>
    <p class="sub" style="margin:4px 0 8px">أخف طريق تكمله وباقي لك ${fmt(Math.max(remK,0))} سعرة:</p>
    <div class="list">${best.map(f=>`<button class="item" data-add="${f.fid}"><span class="n">${esc(f.n)} <span class="m">· ${esc(f.u)}</span></span><span class="m">${r1(f.p)}ب · ${f.k} سعرة</span><span class="plus" aria-hidden="true">+</span></button>`).join("")}</div></div>`;
  } else if(t.kcal>0&&remP<=0){hint=`<div class="card"><div class="row"><h2>كملت بروتينك اليوم</h2><span class="pill good">كفو</span></div><p class="sub" style="margin:4px 0 0">هذا أهم رقم في يومك. باقي بس تمشي على السعرات.</p></div>`}
  let install="";
  if(!isStandalone()){
    if(deferredPrompt) install=`<div class="card install"><div class="row"><h2>ثبّت FORMA على جوالك</h2><button class="primary" id="doInstall">ثبّت</button></div><p class="sub" style="margin:4px 0 0">يفتح بشاشة كاملة ويشتغل بدون نت.</p></div>`;
    else if(isIOS) install=`<div class="card install"><h2>ثبّت FORMA على شاشتك</h2><ol class="sub"><li>اضغط زر المشاركة تحت في Safari</li><li>اختر "إضافة إلى الشاشة الرئيسية"</li><li>افتح FORMA من الأيقونة الجديدة</li></ol></div>`;
  }
  const hr=new Date().getHours(),greet=hr<12?"صباح الخير":hr<17?"هلا":"مساء الخير";
  return `
  <div><h1>${greet} ${esc(S.profile.name)}</h1><div class="sub">${st?`${st} ${st===1?"يوم":"أيام"} ورا بعض. لا تقطعها اليوم.`:"ابدأ سلسلتك اليوم بأول وجبة تسجلها."}</div></div>
  ${install}
  <div class="card tip"><div class="lbl">نصيحة FORMA</div><p id="tipText">${esc(TIPS[(tipBase()+tipShift)%TIPS.length])}</p><button id="nextTip">نصيحة ثانية</button></div>
  <div class="card"><div class="rings">${ring(t.kcal,G.kcal,"السعرات","سعرة")}${ring(t.p,G.p,"البروتين","جم")}</div>
    <div class="macro-row"><div class="macro"><b>${fmt(t.c)}</b><span>كارب / ${G.c}</span></div><div class="macro"><b>${fmt(t.f)}</b><span>دهون / ${G.f}</span></div><div class="macro"><b>${(S.days[T]?.food||[]).length}</b><span>أصناف اليوم</span></div></div>
    <button class="primary wide" style="margin-top:12px" data-go="food">سجّل أكلك</button></div>
  ${hint}
  <div class="card next"><div class="row"><span class="sub">تمرينك الجاي</span><span class="pill" dir="ltr">${P.name}</span></div>
    <div class="name" dir="ltr" style="text-align:right">${nx.n}</div>
    <div class="order">${P.sessions.map((s,i)=>`<span class="${i===sessIdx()?"on":""}" dir="ltr">${s.n}</span>`).join("")}</div>
    <div class="sub">يمشي بالترتيب، مو بالتاريخ. لو ريّحت يوم، تلقاه هنا ينتظرك.</div>
    ${S.days[T]?.trained?`<span class="pill good" style="align-self:flex-start">تمرّنت اليوم</span>`:`<button class="primary" data-go="train">ابدأ ${nx.n}</button>`}</div>
  <div class="card"><div class="row"><h2>وزن اليوم</h2><span class="sub">آخر وزن: ${lastW??"-"} كجم</span></div>
    <div class="row" style="margin-top:10px"><input type="number" step="0.1" inputmode="decimal" id="wIn" aria-label="وزن اليوم بالكيلو" placeholder="مثال 84.2" value="${S.days[T]?.weight??""}"><button class="primary" id="wSave">حفظ</button></div></div>`;
}

/* ---------- الأكل ---------- */
let foodDay=null,cat="الكل",q="";
function dayLabel(k){
  if(k===today())return "اليوم";
  if(k===key(addDays(new Date(),-1)))return "أمس";
  try{return parseKey(k).toLocaleDateString("ar-u-nu-latn",{weekday:"long",day:"numeric",month:"long"})}catch(e){return k}
}
function vFood(){
  foodDay=foodDay||today();
  const t=totals(foodDay),G=S.goal,label=dayLabel(foodDay),entries=S.days[foodDay]?.food||[];
  const prevLabel=foodDay===today()?"أمس":"اليوم السابق";
  return `
  <div class="daybar"><button id="prevD" aria-label="اليوم السابق">→</button><div style="text-align:center;min-width:0"><div class="d">${label}</div><div class="sub">${fmt(t.kcal)} / ${fmt(G.kcal)} سعرة · ${fmt(t.p)} / ${G.p} بروتين</div></div><button id="nextD" aria-label="اليوم التالي" ${foodDay===today()?"disabled":""}>←</button></div>
  <div class="bar" aria-hidden="true"><i style="width:${Math.min(t.kcal/G.kcal*100,100)}%"></i></div>
  <div class="row"><input type="search" id="q" placeholder="دوّر أكلة… كبسة، بيض، شاورما" value="${esc(q)}" autocomplete="off" aria-label="بحث عن أكلة"><button id="quick" style="white-space:nowrap">+ سريعة</button></div>
  <div class="chips" role="group" aria-label="الأقسام">${CATS.map(c=>`<button class="chip" data-cat="${c}" aria-pressed="${c===cat}">${c}</button>`).join("")}</div>
  <div class="card"><div id="results"></div></div>
  <div class="card stack"><h2>سجل ${label}</h2>${MEALS.map(m=>{const es=entries.map((e,i)=>({e,i})).filter(o=>o.e.meal===m);
    const mk=es.reduce((a,o)=>a+entryFood(o.e).k*o.e.q,0);
    return `<div class="meal"><div class="row"><h3>${m}</h3><span class="sub">${fmt(mk)} سعرة</span></div>${es.length?es.map(o=>{const f=entryFood(o.e);return `<div class="item"><span class="n">${esc(f.n)} <span class="m">× ${o.e.q} ${esc(f.u||"")}</span></span><span class="m">${fmt(f.k*o.e.q)} · ${fmt(f.p*o.e.q)}ب</span><button class="del" data-del="${o.i}" aria-label="احذف ${esc(f.n)}">×</button></div>`}).join(""):`<div class="empty">ما سجلت شي</div>`}</div>`}).join("")}
  <button id="copyY">${entries.length?`أضف أكل ${prevLabel} لهذا اليوم`:`نفس أكل ${prevLabel}؟ انسخه بضغطة`}</button></div>`;
}
function renderResults(){
  const box=$("#results");if(!box)return;
  const qq=q.trim();let list,head="";
  const all=FOODS.concat(S.custom);
  if(!qq&&cat==="الكل"){
    list=S.recent.map(getFood).filter(Boolean);
    head=`<div class="row" style="margin-bottom:4px"><h2>الأخيرة</h2><span class="sub">ضغطة وحدة وتنضاف</span></div>`;
    if(!list.length)head=`<div class="empty">ابحث عن أكلة أو اختر قسم. أكلاتك الأخيرة بتطلع هنا.</div>`;
  } else {
    list=all.filter(f=>(cat==="الكل"||f.cat===cat)&&(!qq||f.n.includes(qq)));
    if(cat==="أكلاتي"&&!list.length&&!qq) head=`<div class="empty">ما عندك أكلات خاصة. اضغط "+ سريعة" وفعّل حفظها.</div>`;
  }
  box.innerHTML=head+`<div class="list">${list.map(f=>`<button class="item" data-add="${f.fid}"><span class="n">${esc(f.n)} <span class="m">· ${esc(f.u)}</span></span><span class="m">${f.k} سعرة · ${r1(f.p)}ب</span><span class="plus" aria-hidden="true">+</span></button>`).join("")}${qq&&!list.length?`<div class="empty">ما لقينا "${esc(qq)}". جرّب اسم ثاني، أو أضفها من "+ سريعة".</div>`:""}</div>`;
}
function defaultMeal(){const h=new Date().getHours();return h<11?"فطور":h<16?"غداء":h<20?"سناك":"عشاء"}
function targetDay(){return tab==="food"&&foodDay?foodDay:today()}
function pushRecent(fid){S.recent=[fid,...S.recent.filter(x=>x!==fid)].slice(0,10)}
function afterAdd(k){
  save();render();
  const left=S.goal.p-totals(k).p;
  toast(left>0?`انضافت. باقي ${fmt(left)} جم بروتين`:"كملت بروتينك. كفو!");
}
function sheet(build){
  const bg=document.createElement("div");bg.className="sheet-bg";
  const sh=document.createElement("div");sh.className="sheet";sh.setAttribute("role","dialog");sh.setAttribute("aria-modal","true");
  const close=()=>{bg.remove();sh.remove();document.removeEventListener("keydown",esc_)};
  const esc_=e=>{if(e.key==="Escape")close()};
  bg.addEventListener("click",close);document.addEventListener("keydown",esc_);
  document.body.append(bg,sh);build(sh,close);
}
function openFood(fid){
  const f=getFood(fid);if(!f)return;let qty=1,meal=defaultMeal();
  sheet((sh,close)=>{
    sh.setAttribute("aria-label",f.n);
    const draw=()=>{sh.innerHTML=`<div class="row"><h2>${esc(f.n)}</h2><span class="sub">${esc(f.u)}</span></div>
      <div class="qty">${[0.5,1,1.5,2,3].map(v=>`<button data-q="${v}" aria-pressed="${v===qty}">${v===0.5?"½":v}</button>`).join("")}</div>
      <div class="meals">${MEALS.map(m=>`<button data-m="${m}" aria-pressed="${m===meal}">${m}</button>`).join("")}</div>
      <div class="macro-row" style="margin-top:0"><div class="macro"><b>${fmt(f.k*qty)}</b><span>سعرة</span></div><div class="macro"><b>${fmt(f.p*qty)}</b><span>بروتين</span></div><div class="macro"><b>${fmt(f.c*qty)}</b><span>كارب</span></div></div>
      <button class="primary wide" id="addGo" style="margin-top:14px">أضف لل${meal}</button>`;sh.querySelector("#addGo").focus()};
    draw();
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.q){qty=+b.dataset.q;draw()}else if(b.dataset.m){meal=b.dataset.m;draw()}
      else if(b.id==="addGo"){const k=targetDay();day(k).food.push({fid,q:qty,meal});pushRecent(fid);close();afterAdd(k)}});
  });
}
function openQuick(){
  let meal=defaultMeal();
  sheet((sh,close)=>{
    sh.setAttribute("aria-label","إضافة سريعة");
    sh.innerHTML=`<h2>إضافة سريعة</h2><p class="sub" style="margin:2px 0 12px">أكلة مو موجودة؟ اكتب أرقامها من الملصق أو من المطعم.</p>
      <div class="stack" style="gap:10px">
      <div class="field"><label for="qkN">الاسم</label><input type="text" id="qkN" placeholder="مثال: ساندويتش حلوم"></div>
      <div class="grid2"><div class="field"><label for="qkK">سعرات</label><input type="number" inputmode="decimal" id="qkK" placeholder="350"></div><div class="field"><label for="qkP">بروتين جم</label><input type="number" inputmode="decimal" id="qkP" placeholder="20"></div></div>
      <div class="grid2"><div class="field"><label for="qkC">كارب جم (اختياري)</label><input type="number" inputmode="decimal" id="qkC"></div><div class="field"><label for="qkF">دهون جم (اختياري)</label><input type="number" inputmode="decimal" id="qkF"></div></div>
      </div>
      <label class="check"><input type="checkbox" id="qkSave" checked> احفظها في أكلاتي عشان أضيفها بضغطة بعدين</label>
      <div class="meals">${MEALS.map(m=>`<button data-m="${m}" aria-pressed="${m===meal}">${m}</button>`).join("")}</div>
      <button class="primary wide" id="qkGo">أضف</button>`;
    sh.querySelector("#qkN").focus();
    sh.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.m){meal=b.dataset.m;sh.querySelectorAll("[data-m]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.m===meal))}
      else if(b.id==="qkGo"){
        const n=sh.querySelector("#qkN").value.trim()||"إضافة سريعة",k=+sh.querySelector("#qkK").value,p=+sh.querySelector("#qkP").value||0,c=+sh.querySelector("#qkC").value||0,f=+sh.querySelector("#qkF").value||0;
        if(!(k>0&&k<5000)){toast("اكتب السعرات");return}
        const dk=targetDay();
        if(sh.querySelector("#qkSave").checked){const item={fid:"c"+S.custom.length,n,cat:"أكلاتي",u:"حصة",k,p,c,f};S.custom.push(item);day(dk).food.push({fid:item.fid,q:1,meal});pushRecent(item.fid)}
        else day(dk).food.push({x:{n,u:"حصة",k,p,c,f},q:1,meal});
        close();afterAdd(dk);
      }});
  });
}

/* ---------- التمرين ---------- */
let live=null;
function lastFor(ex){for(let i=S.history.length-1;i>=0;i--){const h=S.history[i];if(h.sets&&h.sets[ex])return h.sets[ex]}return null}
function vTrain(){
  const P=prog(),idx=sessIdx(),s=P.sessions[idx];
  if(!live||live.k!==S.prog+idx) live={k:S.prog+idx,v:{}};
  return `
  <div><h1 dir="ltr" style="text-align:right">${s.n}</h1><div class="sub">جلسة ${idx+1} من ${P.sessions.length} · <span dir="ltr">${P.name}</span></div></div>
  <div class="chips" role="group" aria-label="بدّل الجلسة">${P.sessions.map((x,i)=>`<button class="chip" data-sess="${i}" aria-pressed="${i===idx}" dir="ltr">${x.n}</button>`).join("")}</div>
  <div class="card">${s.ex.map(([n,sets,reps])=>{const last=lastFor(n);
    return `<div class="ex"><div class="row"><a href="${yt(n)}" target="_blank" rel="noopener" dir="ltr">${n} ↗</a><span class="pill">${sets} × ${reps}</span></div>
    <div class="last">${last?`المرة الماضية: ${last.map(x=>x[0]+"×"+x[1]).join("  ·  ")}`:"أول مرة. ابدأ بوزن مريح وخلي آخر تكرارين صعبة"}</div>
    <div class="sets"><span class="h">#</span><span class="h">كجم</span><span class="h">تكرار</span><span class="h">تم</span>
    ${Array.from({length:sets},(_,i)=>{const v=live.v[n+"|"+i]||{};const ph=last&&last[i]?last[i]:["",""];
      return `<span class="h">${i+1}</span><input type="number" inputmode="decimal" aria-label="${n} مجموعة ${i+1} وزن" data-k="${n}|${i}|kg" placeholder="${ph[0]}" value="${v.kg??""}"><input type="number" inputmode="numeric" aria-label="${n} مجموعة ${i+1} تكرار" data-k="${n}|${i}|r" placeholder="${ph[1]}" value="${v.r??""}"><button class="done" data-done="${n}|${i}" aria-pressed="${!!v.d}" aria-label="تمت المجموعة">✓</button>`}).join("")}</div></div>`}).join("")}
  </div>
  <button class="primary" id="finish">خلصت التمرين</button>
  <p class="note">لو كررت نفس أرقام المرة الماضية، اضغط تم بس. الخانة الفاضية تاخذ رقمها تلقائيا.</p>`;
}
function finish(){
  const P=prog(),idx=sessIdx(),s=P.sessions[idx],sets={},prs=[];
  s.ex.forEach(([n,cnt])=>{const last=lastFor(n),arr=[];
    for(let i=0;i<cnt;i++){const v=live.v[n+"|"+i]||{},ph=last&&last[i];
      const kg=+(v.kg||((v.d||v.r)&&ph?ph[0]:0)),r=+(v.r||((v.d||v.kg)&&ph?ph[1]:0));
      if(kg>0||r>0)arr.push([kg,r])}
    if(arr.length){sets[n]=arr;const best=Math.max(...arr.map(x=>x[0])),prev=last?Math.max(...last.map(x=>x[0])):0;if(prev&&best>prev)prs.push(n)}});
  if(!Object.keys(sets).length){toast("سجّل مجموعة وحدة على الأقل");return}
  const T=today();
  S.history.push({date:T,prog:S.prog,s:idx,sets});day(T).trained=true;
  S.sessionIdx=(idx+1)%P.sessions.length;live=null;save();tab="today";render();
  toast(prs.length?`رقم جديد في ${prs[0]}! الجاي: ${P.sessions[S.sessionIdx].n}`:`كفو. الجلسة الجاية: ${P.sessions[S.sessionIdx].n}`);
}

/* ---------- تقدمي ---------- */
function vProgress(){
  const ws=Object.keys(S.days).sort().map(k=>[k,S.days[k].weight]).filter(x=>x[1]).slice(-21);
  let chart='<div class="empty">سجّل وزنك يومين وتطلع لك الرسمة.</div>';
  if(ws.length>1){
    const W=320,H=150,P=34,vals=ws.map(x=>x[1]),mn=Math.floor(Math.min(...vals)-0.3),mx=Math.ceil(Math.max(...vals)+0.3);
    const X=i=>P+i*(W-P-10)/(ws.length-1),Y=v=>10+(mx-v)*(H-P-10)/(mx-mn);
    const avg=ws.map((w,i)=>{const sl=vals.slice(Math.max(0,i-6),i+1);return [X(i),Y(sl.reduce((a,b)=>a+b,0)/sl.length)]});
    const ticks=[mn,(mn+mx)/2,mx];
    chart=`<div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:260px" role="img" aria-label="رسم الوزن">
      ${ticks.map(t=>`<line x1="${P}" x2="${W-10}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--line)"/><text x="${P-6}" y="${Y(t)+4}" text-anchor="end">${t.toFixed(1)}</text>`).join("")}
      <polyline points="${ws.map((w,i)=>X(i)+","+Y(w[1])).join(" ")}" fill="none" stroke="var(--track)" stroke-width="2"/>
      ${ws.map((w,i)=>`<circle cx="${X(i)}" cy="${Y(w[1])}" r="2.5" fill="var(--muted)"/>`).join("")}
      <polyline points="${avg.map(a=>a.join(",")).join(" ")}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${avg[avg.length-1][0]}" cy="${avg[avg.length-1][1]}" r="5" fill="var(--accent)"/>
      <text x="${P}" y="${H-8}">${ws[0][0].slice(5)}</text><text x="${W-10}" y="${H-8}" text-anchor="end">${ws[ws.length-1][0].slice(5)}</text></svg></div>
      <div class="legend"><span><b style="background:var(--accent)"></b>متوسط 7 أيام</span><span><b style="background:var(--muted)"></b>الوزن اليومي</span></div>`;
  }
  const cells=[];for(let i=27;i>=0;i--){const k=key(addDays(new Date(),-i)),d=S.days[k];cells.push(`<i class="${d&&d.trained?"w":d&&(d.food||[]).length?"f":""}" title="${k}"></i>`)}
  const diff=ws.length>1?ws[ws.length-1][1]-ws[0][1]:0,st=streak();
  const hist=S.history.slice(-6).reverse();
  return `<div><h1>تقدمي</h1><div class="sub">${ws.length>1?`${diff<=0?"نزلت":"زدت"} ${Math.abs(diff).toFixed(1)} كجم من ${ws[0][0].slice(5)}`:"ابدأ سجّل وزنك من صفحة اليوم"}</div></div>
  <div class="card"><h2 style="margin-bottom:8px">الوزن</h2>${chart}</div>
  <div class="card"><div class="row"><h2>آخر 4 أسابيع</h2><span class="pill good">${st} ${st===1?"يوم":"أيام"} متتالية</span></div>
    <div class="grid28" style="margin-top:12px">${cells.join("")}</div>
    <div class="legend"><span><b style="background:var(--accent)"></b>تمرّنت</span><span><b style="background:color-mix(in srgb,var(--accent) 45%,var(--track))"></b>سجلت أكل</span><span><b style="background:var(--track)"></b>ما سجلت</span></div></div>
  <div class="card"><h2>آخر التمارين</h2><div class="list">${hist.length?hist.map(h=>{const pp=PROGRAMS[h.prog];const nm=pp&&pp.sessions[h.s]?pp.sessions[h.s].n:"تمرين";return `<div class="item"><span class="n" dir="ltr" style="text-align:right">${nm}</span><span class="m">${h.date}</span></div>`}).join(""):`<div class="empty">أول تمرين تخلصه بيطلع هنا.</div>`}</div></div>`;
}

/* ---------- الإعدادات ---------- */
let resetArmed=false;
function vSettings(){
  const G=S.goal,p=S.profile;
  return `<div><h1>الإعدادات</h1><div class="sub">${esc(p.name)} · ${p.w} كجم · ${GOALS[p.goal][0]}</div></div>
  <div class="card stack"><div class="row"><h2>أهدافك اليومية</h2><button class="ghost" id="recalc">احسب تلقائي</button></div>
    <div class="grid2"><div class="field"><label for="gK">سعرات</label><input type="number" inputmode="numeric" id="gK" value="${G.kcal}"></div><div class="field"><label for="gP">بروتين جم</label><input type="number" inputmode="numeric" id="gP" value="${G.p}"></div></div>
    <div class="grid2"><div class="field"><label for="gC">كارب جم</label><input type="number" inputmode="numeric" id="gC" value="${G.c}"></div><div class="field"><label for="gF">دهون جم</label><input type="number" inputmode="numeric" id="gF" value="${G.f}"></div></div>
    <button class="primary" id="saveGoal">احفظ الأهداف</button></div>
  <div class="card stack"><h2>البرنامج</h2><div class="seg" style="grid-template-columns:1fr">${Object.entries(PROGRAMS).map(([k,pp])=>`<button data-prog="${k}" aria-pressed="${S.prog===k}" dir="ltr">${pp.name}<small dir="rtl">${pp.days}</small></button>`).join("")}</div><p class="note" style="text-align:right">تغيير البرنامج يبدأك من أول جلسة. سجلّك القديم يبقى.</p></div>
  <div class="card stack"><h2>بياناتي</h2><button data-go="setup">عدّل الطول والوزن والهدف</button>
    <div class="grid2"><button id="exportB">نسخة احتياطية</button><button id="importB">استرجاع نسخة</button></div><input type="file" id="importF" accept="application/json,.json" hidden>
    <p class="note" style="text-align:right">بياناتك محفوظة على جهازك بس. خذ نسخة احتياطية قبل ما تغيّر جوالك.</p></div>
  <button class="danger" id="resetB">${resetArmed?"متأكد؟ اضغط مرة ثانية ويتمسح كل شي":"امسح كل بياناتي"}</button>
  <p class="note">FORMA نسخة 1.0 · القيم الغذائية تقريبية للتجربة</p>`;
}
function exportData(){
  const blob=new Blob([JSON.stringify(S)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="forma-backup-"+today()+".json";
  document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
  toast("جهزنا النسخة. احفظها في الملفات");
}
function importData(file){
  const fr=new FileReader();
  fr.onload=()=>{try{const d=JSON.parse(fr.result);if(!d||!d.days||!d.profile)throw 0;S=d;S.custom=S.custom||[];S.history=S.history||[];S.recent=S.recent||[];save();tab="today";render();toast("رجعت بياناتك")}catch(e){toast("الملف هذا مو نسخة FORMA")}};
  fr.readAsText(file);
}

/* ---------- التنقل والرسم ---------- */
let tab=S.profile?"today":"setup";
function render(){
  const setup=tab==="setup";
  $("nav").hidden=setup;$("#hdr").hidden=setup&&!S.profile;
  document.querySelectorAll("nav button").forEach(b=>{if(b.dataset.tab===tab)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  $("#streakN").textContent=streak();
  const views={setup:vSetup,today:vToday,food:vFood,train:vTrain,progress:vProgress,settings:vSettings};
  $("#view").innerHTML=(views[tab]||vToday)();
  if(tab==="food")renderResults();
  window.scrollTo(0,0);
}
document.querySelector("nav").addEventListener("click",e=>{const b=e.target.closest("button");if(b){tab=b.dataset.tab;resetArmed=false;render()}});
$("#gearB").addEventListener("click",()=>{tab="settings";resetArmed=false;render()});
$("#view").addEventListener("submit",e=>{e.preventDefault();if(e.target.id==="setup")submitSetup()});
$("#view").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.ob){ob[b.dataset.ob]=b.dataset.v;ob.name=$("#obName").value;ob.age=$("#obAge").value;ob.h=$("#obH").value;ob.w=$("#obW").value;render()}
  else if(b.dataset.go){tab=b.dataset.go;if(tab!=="setup")ob=null;if(tab==="food")foodDay=today();render()}
  else if(b.dataset.add!==undefined)openFood(b.dataset.add);
  else if(b.dataset.cat){cat=b.dataset.cat;document.querySelectorAll(".chip[data-cat]").forEach(c=>c.setAttribute("aria-pressed",c.dataset.cat===cat));renderResults()}
  else if(b.dataset.del!==undefined){day(foodDay).food.splice(+b.dataset.del,1);save();render()}
  else if(b.dataset.sess!==undefined){S.sessionIdx=+b.dataset.sess;live=null;save();render()}
  else if(b.dataset.prog){if(S.prog!==b.dataset.prog){S.prog=b.dataset.prog;S.sessionIdx=0;live=null;save();render();toast("تغيّر البرنامج إلى "+prog().name)}}
  else if(b.dataset.done){const v=live.v[b.dataset.done]=live.v[b.dataset.done]||{};v.d=!v.d;b.setAttribute("aria-pressed",v.d)}
  else switch(b.id){
    case "nextTip":tipShift++;$("#tipText").textContent=TIPS[(tipBase()+tipShift)%TIPS.length];break;
    case "doInstall":if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.finally(()=>{deferredPrompt=null;render()})}break;
    case "wSave":{const v=parseFloat($("#wIn").value);if(v>=35&&v<=250){day(today()).weight=v;S.profile.w=v;save();render();toast("انحفظ وزنك. شوف المتوسط في تقدمي")}else toast("اكتب وزن صحيح بالكيلو");break}
    case "prevD":foodDay=key(addDays(parseKey(foodDay),-1));render();break;
    case "nextD":if(foodDay!==today()){foodDay=key(addDays(parseKey(foodDay),1));render()}break;
    case "quick":openQuick();break;
    case "copyY":{const src=S.days[key(addDays(parseKey(foodDay),-1))];if(src&&src.food.length){day(foodDay).food.push(...src.food.map(x=>({...x})));save();render();toast("تمت الإضافة من اليوم السابق")}else toast("ما فيه أكل مسجل في اليوم السابق");break}
    case "finish":finish();break;
    case "recalc":{const g=calcGoal(S.profile);["gK","gP","gC","gF"].forEach((id,i)=>$("#"+id).value=[g.kcal,g.p,g.c,g.f][i]);toast("حسبناها من بياناتك. اضغط احفظ");break}
    case "saveGoal":{const g={kcal:+$("#gK").value,p:+$("#gP").value,c:+$("#gC").value,f:+$("#gF").value};if(g.kcal>=1000&&g.kcal<=6000&&g.p>=30&&g.p<=400){S.goal=g;save();toast("انحفظت أهدافك")}else toast("السعرات بين 1000 و 6000، والبروتين بين 30 و 400");break}
    case "exportB":exportData();break;
    case "importB":$("#importF").click();break;
    case "resetB":if(!resetArmed){resetArmed=true;render()}else{try{localStorage.removeItem(STORE)}catch(e){}S={days:{},recent:[],custom:[],history:[],sessionIdx:0,prog:"ul4"};resetArmed=false;ob=null;tab="setup";render()}break;
  }
});
$("#view").addEventListener("change",e=>{if(e.target.id==="importF"&&e.target.files[0])importData(e.target.files[0])});
$("#view").addEventListener("input",e=>{
  if(e.target.id==="q"){q=e.target.value;renderResults()}
  else if(e.target.dataset.k){const [n,i,f]=e.target.dataset.k.split("|");const v=live.v[n+"|"+i]=live.v[n+"|"+i]||{};v[f]=e.target.value}
});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&tab==="today")render()});
render();

/* ---------- العمل بدون نت ---------- */
if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{})})}
})();
