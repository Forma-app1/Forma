/* FORMA: سجّل أكلك بالكلام. يشتغل على الجهاز، بدون نت وبدون تكلفة */
(function(){
"use strict";
const norm=s=>String(s||"")
  .replace(/[ً-ٰٟـ]/g,"")
  .replace(/[٠-٩]/g,d=>d.charCodeAt(0)-1632).replace(/[۰-۹]/g,d=>d.charCodeAt(0)-1776)
  .replace(/½/g," 0.5 ").replace(/¼/g," 0.25 ").replace(/٫/g,".")
  .replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي")
  .replace(/(\d)([^\d\s.,،])/g,"$1 $2").replace(/([^\d\s.,،])(\d)/g,"$1 $2")
  .toLowerCase();
const stem=w=>{if(w.length>4&&w.startsWith("ال"))w=w.slice(2);if(w.length>4&&w.endsWith("ات"))w=w.slice(0,-2);if(w.length>2&&w.endsWith("ه"))w=w.slice(0,-1);return w};
const SYN={بيج:"بيق",تيستي:"تيستي",عيش:"رز",ارز:"رز",شاهي:"شاي",فراخ:"دجاج",جاج:"دجاج",بيبسي:"غازي",كولا:"غازي",ببسي:"غازي",سفن:"غازي",ردبل:"طاقه",كوفي:"لاتيه",بروتين:"واي",صدور:"صدر",افخاذ:"فخذ",بيضات:"بيض",توستات:"توست",فول:"فول",سلطه:"سلطه",شوربه:"شوربه",بطاطا:"بطاطا",بطاطس:"بطاطس",فرايز:"بطاطس",جبنه:"جبن",حليب:"حليب",لبن:"لبن"};
const NUM={واحد:1,وحده:1,وحد:1,اثنين:2,ثنتين:2,اثنتين:2,ثنين:2,ثلاث:3,ثلاثه:3,ثلث:1/3,اربع:4,اربعه:4,خمس:5,خمسه:5,ست:6,سته:6,سبع:7,سبعه:7,ثمان:8,ثمانيه:8,ثمنيه:8,تسع:9,تسعه:9,عشر:10,عشره:10,نص:0.5,نصف:0.5,ربع:0.25,ثلثين:2/3};
const UNIT={جرام:"g",جم:"g",غرام:"g",غ:"g",g:"g",gm:"g",جرامات:"g",غرامات:"g",كيلو:"kg",كجم:"kg",مل:"g",ملي:"g",لتر:"kg",
  كوب:"cup",كاس:"cup",كاسه:"cup",اكواب:"cup",كاسات:"cup",ملعقه:"tbsp",معلقه:"tbsp",ملاعق:"tbsp",صحن:"plate",صحون:"plate",طبق:"plate",
  سكوب:"scoop",سكوبات:"scoop",علبه:"can",علب:"can",فنجان:"fin",فناجين:"fin",شريحه:"slice",شرايح:"slice",حبه:"pc",حبات:"pc",قطعه:"pc",قطع:"pc",حبتين:"pc2",قطعتين:"pc2",
  كوبين:"cup2",كاستين:"cup2",صحنين:"plate2",ملعقتين:"tbsp2",علبتين:"can2",شريحتين:"slice2",فنجانين:"fin2",سكوبين:"scoop2"};
const MEALW={فطرت:"فطور",فطور:"فطور",الفطور:"فطور",ريوق:"فطور",تريقت:"فطور",تغديت:"غداء",غدا:"غداء",غداء:"غداء",الغدا:"غداء",الغداء:"غداء",تعشيت:"عشاء",عشا:"عشاء",عشاء:"عشاء",العشا:"عشاء",العشاء:"عشاء",سناك:"سناك",تصبيره:"سناك",تسالي:"سناك"};
const FILL=new Set(["اكلت","كلت","شربت","تسحرت","تناولت","اليوم","الصبح","الظهر","العصر","المغرب","الليل","بالليل","تقريبا","يعني","حوالي","او","في","على","من","شوي","شويه","كذا","بعد","قبل","انا","و","مع","ثم","بعدين","وبعدين","فيه","فيها","له","لها","عليه","وجبه","حق","تبع","حقي","بس","كمان","برضو","زياده"].concat(Object.keys(MEALW)));
const PIECE=[["بياض",33],["بيض",50],["خبز عربي",60],["صامولي",70],["تميس",130],["توست",30],["كرواسون",60],["تنور",90],["موز",120],["تمر",8],["تفاح",180],["برتقال",150],["مانجو",250],["رمان",250],["افوكادو",150],["فراوله",12],["صدر دجاج",170],["فخذ دجاج",130],["شوايه",550],["ستيك",220],["سالمون",150],["برجر",200],["ساندويتش فلافل",250],["فلافل",17],["سمبوسه",40],["فطيره",110],["بيتزا",110],["دونات",60],["بطاطا حلوه",150],["بطاطس مسلوقه",170],["خيار",120],["طماطم",120],["جزر",70],["كرواسون",60],["لوز",1.2],["كاجو",1.5],["جوز",5]];
const SERVE={"رز وأطباق شعبية":300,"خبز ونشويات":60,"لحوم ودجاج وسمك":150,"بيض وبقوليات":100,"ساندويتشات ومعجنات":150,"ألبان وبروتين":200,"فواكه":120,"خضار":100,"دهون ومكسرات وصوصات":15,"حلويات وسناكات":40,"مشروبات":240};

const STORE={ماك:"ماكدونالدز",ماكدونالدز:"ماكدونالدز",مكدونالدز:"ماكدونالدز",بيك:"البيك",كنتاكي:"كنتاكي",هرفي:"هرفي",كنج:"برجر كنج",ستاربكس:"ستاربكس",شاورمر:"شاورمر",فايف:"فايف قايز",حطب:"الحطب",مراعي:"المراعي",ندي:"ندى",شاورما:"شاورما"};
const STORE_SYN={"البيك":{دجاج:"بروست"},"كنتاكي":{دجاج:"قطع"}};
const DEF={خبز:"خبز عربي",رز:"رز ابيض",بيض:"بيض مسلوق",حليب:"حليب كامل",دجاج:"صدر دجاج",لحم:"لحم غنم",تون:"تونه بالماء",زبادي:"زبادي يوناني",جبن:"جبن"};
let cache=null;
function prep(foods){
  if(cache&&cache.n===foods.length)return cache;
  const vocab=new Set(),list=foods.map(f=>{const nn=norm(f.n).replace(/[()\-–_/]/g," ");const toks=nn.split(/\s+/).filter(t=>t&&!/^\d/.test(t)&&t!=="مل").map(stem);toks.forEach(t=>vocab.add(t));return {f,nn,toks}});
  cache={n:foods.length,vocab,list};return cache;
}
const pieceG=f=>{const n=norm(f.n);for(const [k,g] of PIECE)if(n.includes(k))return g;return null};
const serveG=f=>{const n=norm(f.n);if(n.includes("واي"))return 30;if(n.includes("لبن")||n.includes("حليب")||n.includes("روب"))return 240;if(n.includes("قهوه"))return 60;if(n.includes("شاي"))return 150;if(n.includes("زيت"))return 10;if(n.includes("عسل")||n.includes("سكر"))return 10;return SERVE[f.cat]||100};
function amtFor(f,q){
  const n=q.num;
  if(f.u!=="g"){if(q.unit==="g"||q.unit==="kg")return 1;if(q.unit==="pc"&&/\d/.test(f.n))return 1;return n||1}
  const nm=norm(f.n),pg=pieceG(f);
  switch(q.unit){
    case "g":return n||serveG(f);
    case "kg":return (n||1)*1000;
    case "cup":return (n||1)*(nm.includes("شاي")?150:f.cat==="رز وأطباق شعبية"||nm.includes("رز")||nm.includes("مكرونه")?200:nm.includes("شوفان")?80:nm.includes("زبادي")?240:240);
    case "tbsp":return (n||1)*(q.small?5:15);
    case "plate":return (n||1)*(f.cat==="رز وأطباق شعبية"?350:f.cat==="خضار"?150:250);
    case "scoop":return (n||1)*30;
    case "can":return (n||1)*(nm.includes("تون")?120:170);
    case "fin":return (n||1)*60;
    case "slice":return (n||1)*(nm.includes("جبن")?20:nm.includes("بيتزا")?110:30);
    case "pc":return (n||1)*(pg||serveG(f));
  }
  if(n!=null){if(pg)return n*pg;if(n>=20)return n;return n*serveG(f)}
  if(q.one&&pg)return pg;
  return q.last||serveG(f);
}
function splitSegs(text,vocab){
  const t=norm(text);
  const parts=t.split(/[،,+\n؛;.!?؟]+|\s(?:مع|ثم|وبعدين|بعدين|وكمان|وايضا)\s/);
  const segs=[];
  parts.forEach(p=>{
    let cur=[];
    p.split(/\s+/).filter(Boolean).forEach(w=>{
      if(w==="و"){if(cur.length)segs.push(cur);cur=[];return}
      if(w==="ونص"||w==="ونصف"||w==="وربع"){const hasFood=cur.some(x=>vocab.has(stem(x))||SYN[x]);if(hasFood){segs.push(cur);cur=[w.slice(1)];}else cur.push(w);return}
      if(w.length>1&&w[0]==="و"&&!vocab.has(stem(w))&&!SYN[w]){
        const r=w.slice(1);
        if(/^\d/.test(r)||NUM[r]!=null||UNIT[r]||vocab.has(stem(r))||SYN[r]||vocab.has(stem(r.replace(/تين$/,"")))||/^ال/.test(r)||cur.length){if(cur.length)segs.push(cur);cur=[r];return}
      }
      cur.push(w);
    });
    if(cur.length)segs.push(cur);
  });
  return segs;
}
function parse(text,ctx){
  ctx=ctx||{};const foods=ctx.foods||[];const P=prep(foods);
  const raw=norm(text);let meal=null;
  raw.split(/\s+/).some(w=>{const m=MEALW[w]||MEALW[w.replace(/^و/,"")];if(m){meal=m;return true}return false});
    const items=[],miss=[];
  splitSegs(text,P.vocab).forEach(seg=>{
    const q={num:null,unit:null,small:false,one:false};const Q=[];let segRaw=seg.join(" ");
    seg.forEach((w,i)=>{
      if(/^\d+(\.\d+)?$/.test(w)){const v=parseFloat(w);if(q.num!=null&&q.unit==null&&v<1)q.num+=v;else q.num=v;return}
      if(w==="ونص"||w==="ونصف"){q.num=(q.num||1)+0.5;return}
      if(w==="وربع"){q.num=(q.num||1)+0.25;return}
      if(NUM[w]!=null){q.num=q.num!=null&&NUM[w]<1?q.num*NUM[w]:NUM[w];return}
      const u=UNIT[w];
      if(u){if(u.endsWith("2")){q.unit=u.slice(0,-1);q.num=(q.num||1)*2}else{q.unit=u}return}
      if(w==="صغيره"||w==="صغيرة"){if(q.unit==="tbsp")q.small=true;return}
      if(w==="كبيره"&&q.unit==="tbsp")return;
      if(FILL.has(w))return;
      let s=SYN[w]||w;
      if(/تين$/.test(s)&&s.length>4){const b=stem(s.slice(0,-3));if(P.vocab.has(b)||SYN[b]){Q.push(SYN[b]||b);q.num=(q.num||1)*2;if(!q.unit)q.unit="pc";return}}
      const st=stem(s);
      if(s.endsWith("ه")&&s.length>2&&P.vocab.has(st)&&q.num==null&&!q.unit)q.one=true;
      if(st.length>=2)Q.push(SYN[st]||st);
    });
    if(!Q.length)return;
    const valid=new Set(ctx.stores||[]);let sname=null;
    const Q1=Q.filter(x=>{const s=STORE[x];if(s&&valid.has(s)&&!sname){sname=s;return false}return true});
    const store=sname?[sname]:null;
    const ss=sname&&STORE_SYN[sname]||{};
    const Qn=Q1.map(x=>ss[x]||x);
    if(!Qn.length&&!store){miss.push(segRaw);return}
    const key=Qn.join(" ");
    const scored=[];
    P.list.forEach(({f,toks})=>{
      let s=0,matched=0;
      Qn.forEach(qw=>{let b=0;toks.forEach(t=>{if(t===qw)b=3;else if(qw.length>=3&&t.startsWith(qw))b=Math.max(b,2);else if(t.length>=3&&qw.startsWith(t))b=Math.max(b,1.5)});s+=b;if(b)matched++});
      if(!matched)return;
      s-=0.35*(toks.length-matched);s-=1.2*(Qn.length-matched);
      if(f.store){if(store&&f.store===store[0]){s+=2.5;if(q.num&&norm(f.n).includes(String(q.num)))s+=1.5}else s-=1.5}
      if(ctx.recent&&ctx.recent.includes(f.fid))s+=0.4;
      if(f.fid&&f.fid[0]==="c")s+=0.3;
      if(ctx.learned&&ctx.learned[key]===f.fid)s+=6;
      if(Qn.length===1&&DEF[Qn[0]]&&norm(f.n).startsWith(DEF[Qn[0]]))s+=0.5;
      scored.push([s,f]);
    });
    scored.sort((a,b)=>b[0]-a[0]);
    if(!scored.length||scored[0][0]<1.5){miss.push(segRaw);return}
    const alts=scored.slice(0,6).map(x=>x[1]);const f=alts[0];
    q.last=ctx.lastAmt&&ctx.lastAmt[f.fid];
    items.push({key,q,alts,f,amt:Math.round(amtFor(f,q)*100)/100,text:segRaw});
  });
  return {meal,items,miss};
}
window.FORMA_SAY={parse,amtFor,norm};
})();
