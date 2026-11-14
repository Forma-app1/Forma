/* FORMA: سجّل أكلك بالكلام. يشتغل على الجهاز، بدون نت وبدون تكلفة */
(function(){
"use strict";
const norm=s=>String(s||"")
  .replace(/[ً-ٰٟـ]/g,"")
  .replace(/[٠-٩]/g,d=>d.charCodeAt(0)-1632).replace(/[۰-۹]/g,d=>d.charCodeAt(0)-1776)
  .replace(/½/g," 0.5 ").replace(/¼/g," 0.25 ").replace(/٫/g,".")
  .replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي")
  .replace(/(\d)([^\d\s.,،])/g,"$1 $2").replace(/([^\d\s.,،])(\d)/g,"$1 $2")
  .toLowerCase()
  /* "شوكولاته ساخنه" و"كاكاو ساخن" = هوت شوكولاته. وكلمة ساخن لحالها ما تغير الأكلة */
  .replace(/(^|\s)(شوكو\S*|شوكل\S*|شكول\S*|تشوك\S*|كاكاو)\s+(ساخن|ساخنه|دافي|دافيه)(?=\s|$)/g,"$1هوت شوكولاته")
  .replace(/(^|\s)(ساخن|ساخنه|دافي|دافيه)(?=\s|$)/g,"$1");
const stem=w=>{if(w.length>4&&w.startsWith("ال"))w=w.slice(2);if(w.length>4&&w.endsWith("ات"))w=w.slice(0,-2);if(w.length>2&&w.endsWith("ه"))w=w.slice(0,-1);return w};
const SYN={"عيش":"رز","ارز":"رز","رزز":"رز","rice":"رز","كبسات":"كبسه","kabsa":"كبسه","mandi":"مندي","مضغوطه":"مضغوط","بيرياني":"برياني","biryani":"برياني","مجبوس":"مكبوس","مجبوسه":"مكبوس","مكبوسه":"مكبوس","مطبك":"مطبق","مطبّق":"مطبق","مطبقه":"مطبق","هريسه":"هريس","معكرونه":"مكرونه","باستا":"مكرونه","سباغيتي":"مكرونه","اسباجيتي":"مكرونه","سباقيتي":"مكرونه","سباجيتي":"مكرونه","pasta":"مكرونه","spaghetti":"مكرونه","لازانيه":"لازانيا","lasagna":"لازانيا","نودلز":"اندومي","indomie":"اندومي","noodles":"اندومي","حساء":"شوربه","soup":"شوربه","مرقه":"صالونه","مرق":"صالونه","جاج":"دجاج","فراخ":"دجاج","دياي":"دجاج","تشكن":"دجاج","تشيكن":"دجاج","دجاجه":"دجاج","chicken":"دجاج","بروستد":"بروست","بروستيد":"بروست","نقرز":"ناجتس","نجتس":"ناجتس","ناقتس":"ناجتس","nuggets":"ناجتس","جوانح":"اجنحه","وينجز":"اجنحه","جناح":"اجنحه","wings":"اجنحه","طاوق":"طاووق","شيش":"طاووق","tawook":"طاووق","جمل":"حاشي","بعير":"حاشي","خروف":"غنم","ضان":"غنم","طلي":"غنم","عجل":"بقر","بقري":"بقر","beef":"بقر","ستيكه":"ستيك","steak":"ستيك","كبد":"كبده","liver":"كبده","جمبري":"روبيان","ربيان":"روبيان","شرمب":"روبيان","شريمب":"روبيان","shrimp":"روبيان","سلمون":"سالمون","سلامون":"سالمون","salmon":"سالمون","تونا":"تونه","tuna":"تونه","حوت":"سمك","fish":"سمك","حبار":"كاليماري","calamari":"كاليماري","سجق":"نقانق","سوسيس":"نقانق","sausage":"نقانق","مرتدلا":"مرتديلا","مورتاديلا":"مرتديلا","تركي":"تيركي","turkey":"تيركي","برقر":"برجر","برغر":"برجر","بيرجر":"برجر","همبرجر":"برجر","هامبرجر":"برجر","همبرقر":"برجر","هامبرغر":"برجر","burger":"برجر","egg":"بيض","eggs":"بيض","بيضه":"بيض","عجه":"اومليت","امليت":"اومليت","omelette":"اومليت","omelet":"اومليت","مدمس":"فول","فوول":"فول","حمّص":"حمص","hummus":"حمص","طعميه":"فلافل","falafel":"فلافل","lentils":"عدس","bread":"خبز","خبزه":"خبز","صمون":"صامولي","صاموليه":"صامولي","toast":"توست","توستات":"توست","تميسه":"تميس","اسمر":"بر","brown":"بر","كرواسان":"كرواسون","كروسان":"كرواسون","كرواسو":"كرواسون","croissant":"كرواسون","بيجل":"بيقل","بيغل":"بيقل","bagel":"بيقل","مناقيش":"زعتر","منقوشه":"زعتر","فطاير":"فطيره","سمبوسك":"سمبوسه","sambosa":"سمبوسه","samosa":"سمبوسه","بانكيك":"بان","pancake":"بان","pancakes":"بان","وافلز":"وافل","waffle":"وافل","اوتس":"شوفان","اوتميل":"شوفان","oats":"شوفان","oatmeal":"شوفان","كورنفليكس":"كورن","سيريال":"كورن","cornflakes":"كورن","cereal":"كورن","بطاطا":"بطاطس","فرايز":"بطاطس","fries":"بطاطس","potato":"بطاطس","تشيبس":"شيبس","تشبس":"شيبس","ليز":"شيبس","chips":"شيبس","بيزا":"بيتزا","بيتزه":"بيتزا","pizza":"بيتزا","سندويش":"ساندويتش","ساندوتش":"ساندويتش","سندوتش":"ساندويتش","سندويتش":"ساندويتش","صندويش":"ساندويتش","sandwich":"ساندويتش","wrap":"راب","تورتيلا":"راب","corn":"ذره","milk":"حليب","حليبي":"حليب","laban":"لبن","yogurt":"زبادي","yoghurt":"زبادي","labneh":"لبنه","جبنه":"جبن","cheese":"جبن","كيري":"مثلثات","مثلث":"مثلثات","بوك":"كريمي","فيلادلفيا":"كريمي","قيمر":"قشطه","cream":"كريمه","whey":"واي","casein":"كازين","موتزاريلا":"موزاريلا","مزاريلا":"موزاريلا","mozzarella":"موزاريلا","شيدار":"شيدر","cheddar":"شيدر","حلومي":"حلوم","halloumi":"حلوم","banana":"موز","موزه":"موز","apple":"تفاح","تفاحه":"تفاح","بردقان":"برتقال","orange":"برتقال","مندرين":"يوسفي","كلمنتينا":"يوسفي","يوسفيه":"يوسفي","جح":"بطيخ","حبحب":"بطيخ","watermelon":"بطيخ","grapes":"عنب","strawberry":"فراوله","منجا":"مانجو","منقا":"مانجو","مانقو":"مانجو","مانجا":"مانجو","mango":"مانجو","انناس":"اناناس","pineapple":"اناناس","اجاص":"كمثري","عرموط":"كمثري","pear":"كمثري","تمرات":"تمر","سكري":"تمر","عجوه":"تمر","خلاص":"تمر","dates":"تمر","رطبه":"رطب","بلوبيري":"توت","blueberry":"توت","طماط":"طماطم","بندوره":"طماطم","tomato":"طماطم","بادنجان":"باذنجان","بيتنجان":"باذنجان","eggplant":"باذنجان","زهره":"قرنبيط","قرنبيطه":"قرنبيط","مشروم":"فطر","mushroom":"فطر","بزاليا":"بازلاء","بازيلا":"بازلاء","cucumber":"خيار","lettuce":"خس","salad":"سلطه","افوكاتو":"افوكادو","avocado":"افوكادو","سمنه":"سمن","butter":"زبده","oil":"زيت","مايو":"مايونيز","مايونيس":"مايونيز","mayo":"مايونيز","كتشب":"كاتشب","كاتشاب":"كاتشب","ketchup":"كاتشب","tahini":"طحينه","bbq":"باربيكيو","باربكيو":"باربيكيو","باربيكو":"باربيكيو","ثوم":"ثوميه","garlic":"ثوميه","مسترد":"خردل","مسترده":"خردل","mustard":"خردل","نوتلا":"نوتيلا","nutella":"نوتيلا","honey":"عسل","مربا":"مربي","jam":"مربي","sugar":"سكر","فسدق":"فستق","pistachio":"فستق","كاشو":"كاجو","cashew":"كاجو","walnut":"جوز","almond":"لوز","almonds":"لوز","nuts":"مكسرات","chia":"شيا","flax":"كتان","كيكه":"كيك","cake":"كيك","تشيزكيك":"تشيز","cheesecake":"تشيز","كوكي":"كوكيز","cookies":"كوكيز","براوني":"براونيز","brownie":"براونيز","لقيمه":"لقيمات","كليجه":"كليجا","baklava":"بقلاوه","شوكولا":"شوكولاته","شوكلاته":"شوكولاته","شكولاته":"شوكولاته","شوكلت":"شوكولاته","chocolate":"شوكولاته","شوكولاطه":"شوكولاته","شوكولاط":"شوكولاته","شكولاطه":"شوكولاته","شوكلاطه":"شوكولاته","شوكولاتات":"شوكولاته","شوكولت":"شوكولاته","شوكولات":"شوكولاته","شوكليت":"شوكولاته","تشوكلت":"شوكولاته","تشوكليت":"شوكولاته","تشوكولت":"شوكولاته","تشاكلت":"شوكولاته","شاكلت":"شوكولاته","hot":"هوت","بابكه":"بابكا","babka":"بابكا","cocoa":"كاكاو","جلاكسي":"جالكسي","جالاكسي":"جالكسي","galaxy":"جالكسي","كيندر":"كندر","kinder":"كندر","كاردز":"كاردز","كارد":"كاردز","كاردس":"كاردز","cards":"كاردز","بيونو":"بوينو","بوينوا":"بوينو","bueno":"بوينو","سبرايز":"سربرايز","سيربرايز":"سربرايز","surprise":"سربرايز","joy":"جوي","ديليس":"ديلايس","delice":"ديلايس","pingui":"بينجوي","بنجوي":"بينجوي","مارز":"مارس","mars":"مارس","bounty":"باونتي","بونتي":"باونتي","مالتيزر":"مالتيزرز","مالتيزرس":"مالتيزرز","maltesers":"مالتيزرز","فريرو":"فيريرو","فيررو":"فيريرو","ferrero":"فيريرو","روشيه":"فيريرو","رافاييلو":"رافايلو","رافيلو":"رافايلو","raffaello":"رافايلو","lindt":"لينت","ليندت":"لينت","ليندور":"لينت","توبلرون":"توبليرون","toblerone":"توبليرون","milka":"ميلكا","ملكا":"ميلكا","cadbury":"كادبوري","كدبوري":"كادبوري","هيرشي":"هيرشيز","hersheys":"هيرشيز","ريسيز":"ريسز","reeses":"ريسز","lion":"ليون","تشنكي":"تشانكي","chunky":"تشانكي","m&m":"امز","m&ms":"امز","mms":"امز","ماجنم":"ماجنوم","مقنوم":"ماجنوم","ماغنوم":"ماجنوم","magnum":"ماجنوم","lotus":"لوتس","بسكوف":"لوتس","biscoff":"لوتس","برنجلز":"برينجلز","برينقلز":"برينجلز","برنقلز":"برينجلز","pringles":"برينجلز","دوريتو":"دوريتوس","doritos":"دوريتوس","شيتوز":"شيتوس","cheetos":"شيتوس","تاكس":"تاكيس","takis":"تاكيس","بيربلز":"بيربيلز","باربيلز":"بيربيلز","barebells":"بيربيلز","quest":"كويست","قرينيد":"جرينيد","غرينيد":"جرينيد","grenade":"جرينيد","light":"لايت","لايتي":"لايت","كتكات":"كيت","كيتكات":"كيت","بوظه":"ايسكريم","جيلاتو":"ايسكريم","icecream":"ايسكريم","popcorn":"فشار","زلابيه":"عوامه","دونتس":"دونات","دونت":"دونات","دوناتس":"دونات","donut":"دونات","donuts":"دونات","doughnut":"دونات","مفن":"مافن","muffin":"مافن","oreo":"اوريو","coffee":"قهوه","كوفي":"قهوه","لاتي":"لاتيه","لاته":"لاتيه","latte":"لاتيه","كابوتشينو":"كابتشينو","كابتشينه":"كابتشينو","cappuccino":"كابتشينو","americano":"امريكانو","اسبرسو":"اسبريسو","espresso":"اسبريسو","موكه":"موكا","mocha":"موكا","فرابيه":"فرابتشينو","فرابي":"فرابتشينو","frappuccino":"فرابتشينو","اسبانش":"سبانش","spanish":"سبانش","شاهي":"شاي","tea":"شاي","chai":"كرك","نسكافي":"نسكافيه","nescafe":"نسكافيه","بيبسي":"غازي","ببسي":"غازي","كولا":"غازي","كوكاكولا":"غازي","سفن":"غازي","ميرندا":"غازي","فانتا":"غازي","ديو":"غازي","pepsi":"غازي","cola":"غازي","زيرو":"دايت","diet":"دايت","zero":"دايت","ردبل":"طاقه","ريدبول":"طاقه","كودرد":"طاقه","مونستر":"طاقه","redbull":"طاقه","juice":"عصير","smoothie":"سموذي","milkshake":"شيك","بيج":"بيق","صدور":"صدر","افخاذ":"فخذ"};
const NUM={واحد:1,وحده:1,وحد:1,اثنين:2,ثنتين:2,اثنتين:2,ثنين:2,ثلاث:3,ثلاثه:3,ثلث:1/3,اربع:4,اربعه:4,خمس:5,خمسه:5,ست:6,سته:6,سبع:7,سبعه:7,ثمان:8,ثمانيه:8,ثمنيه:8,تسع:9,تسعه:9,عشر:10,عشره:10,نص:0.5,نصف:0.5,ربع:0.25,ثلثين:2/3};
const UNIT={جرام:"g",جم:"g",غرام:"g",غ:"g",g:"g",gm:"g",جرامات:"g",غرامات:"g",كيلو:"kg",كجم:"kg",مل:"g",ملي:"g",لتر:"kg",
  كوب:"cup",كاس:"cup",كاسه:"cup",اكواب:"cup",كاسات:"cup",ملعقه:"tbsp",معلقه:"tbsp",ملاعق:"tbsp",صحن:"plate",صحون:"plate",طبق:"plate",
  سكوب:"scoop",سكوبات:"scoop",علبه:"can",علب:"can",فنجان:"fin",فناجين:"fin",شريحه:"slice",شرايح:"slice",حبه:"pc",حبات:"pc",لوح:"pc",الواح:"pc",كيس:"pc",باكيت:"pc",ظرف:"pc",قطعه:"pc",قطع:"pc",حبتين:"pc2",قطعتين:"pc2",
  كوبين:"cup2",كاستين:"cup2",صحنين:"plate2",ملعقتين:"tbsp2",علبتين:"can2",شريحتين:"slice2",فنجانين:"fin2",سكوبين:"scoop2"};
const MEALW={فطرت:"فطور",فطور:"فطور",الفطور:"فطور",ريوق:"فطور",تريقت:"فطور",تغديت:"غداء",غدا:"غداء",غداء:"غداء",الغدا:"غداء",الغداء:"غداء",تعشيت:"عشاء",عشا:"عشاء",عشاء:"عشاء",العشا:"عشاء",العشاء:"عشاء",سناك:"سناك",تصبيره:"سناك",تسالي:"سناك"};
const FILL=new Set(["اكلت","كلت","شربت","تسحرت","تناولت","اليوم","الصبح","الظهر","العصر","المغرب","الليل","بالليل","تقريبا","يعني","حوالي","او","في","على","من","شوي","شويه","كذا","بعد","قبل","انا","و","مع","ثم","بعدين","وبعدين","فيه","فيها","له","لها","عليه","وجبه","حق","تبع","حقي","بس","كمان","برضو","زياده","مويه","موية","ماء","ماي","مويا","water","طلبت","جبت","سويت","حطيت","عليها","فوقه","فوقها","كامل","كامله","بدون","تقريبا"].concat(Object.keys(MEALW)));
const PIECE=[["بياض",33],["اومليت",60],["بيض",50],["خبز عربي",60],["صامولي",70],["تميس",130],["توست",30],["كرواسون",60],["تنور",90],["باقيت",120],["بيقل",100],["تورتيلا",45],["رقاق",30],["موز",120],["تمر",8],["رطب",12],["تفاح",180],["برتقال",150],["يوسفي",90],["مانجو",250],["رمان",250],["كيوي",75],["خوخ",150],["مشمش",35],["كمثري",180],["جوافه",100],["تين",50],["افوكادو",150],["فراوله",12],["زيتون",4],["صدر دجاج",170],["فخذ دجاج",130],["شوايه",550],["ستيك",220],["سالمون",150],["برجر",200],["ساندويتش فلافل",250],["فلافل",17],["سمبوسه",40],["فطيره",110],["مناقيش",120],["بيتزا",110],["دونات",60],["بان كيك",40],["وافل",75],["لقيمات",15],["كليجا",40],["معمول",40],["بقلاوه",30],["كوكيز",30],["براونيز",60],["كبه",60],["نقانق",40],["ناجتس",17],["اجنحه",35],["كباب",50],["كفته",50],["بطاطا حلوه",150],["بطاطس مسلوقه",170],["خيار",120],["طماطم",120],["جزر",70],["لوز",1.2],["كاجو",1.5],["جوز",5],["بندق",1.5]];
const SERVE={"رز وأطباق شعبية":300,"خبز ونشويات":60,"لحوم ودجاج وسمك":150,"بيض وبقوليات":100,"ساندويتشات ومعجنات":150,"ألبان وبروتين":200,"فواكه":120,"خضار":100,"دهون ومكسرات وصوصات":15,"حلويات وسناكات":40,"مشروبات":240};

const STORE={ماك:"ماكدونالدز",ماكدونالدز:"ماكدونالدز",مكدونالدز:"ماكدونالدز",بيك:"البيك",كنتاكي:"كنتاكي",kfc:"كنتاكي",هرفي:"هرفي",كنج:"برجر كنج",ستاربكس:"ستاربكس",starbucks:"ستاربكس",شاورمر:"شاورمر",فايف:"فايف قايز",حطب:"الحطب",مراعي:"المراعي",ندي:"ندى",شاورما:"شاورما",دانكن:"دانكن",دنكن:"دانكن",دانكين:"دانكن",dunkin:"دانكن",رايق:"رايق",رائق:"رايق",رايج:"رايق",raik:"رايق"};
const STORE_SYN={"البيك":{دجاج:"بروست"},"كنتاكي":{دجاج:"قطع"}};
const DEF={كيك:"كيك ساده",بطاطس:"بطاطس مقليه",زبادي:"زبادي عادي",سلط:"سلطه خضار",قهو:"قهوه عربيه",فول:"فول مدمس",حمص:"حمص مطبوخ",برجر:"برجر لحم",كريم:"كريمه طبخ",شوفان:"شوفان",ذر:"ذره مسلوقه",دون:"دونات",خبز:"خبز عربي",رز:"رز ابيض",بيض:"بيض مسلوق",حليب:"حليب كامل",دجاج:"صدر دجاج",لحم:"لحم غنم",تون:"تونه بالماء",جبن:"جبن",كندر:"كندر شوكولاته",جالكسي:"جالكسي ساده",شوكولات:"شوكولاته حليب"};
let cache=null;
function prep(foods){
  if(cache&&cache.n===foods.length)return cache;
  const vocab=new Set(),list=foods.map(f=>{const nn=norm(f.n).replace(/[()\-–_/]/g," ");const raw=nn.split(/\s+/).filter(t=>t&&!/^\d/.test(t)&&t!=="مل");const toks=raw.map(mapT);toks.forEach(t=>vocab.add(t));return {f,nn,toks,raw}});
  cache={n:foods.length,vocab,list};return cache;
}
const mapT=w=>{const a=SYN[w]||w,st=stem(a);return SYN[st]?stem(SYN[st]):st};
const hasW=(n,k)=>k.includes(" ")?n.includes(k):n.split(/\s+/).some(t=>t===k||t===k+"ه"||t==="ال"+k||(k.length>=4&&t.startsWith(k)));
const pieceG=f=>{const n=norm(f.n).replace(/[()\-]/g," ");for(const [k,g] of PIECE)if(hasW(n,k))return g;return null};
const serveG=f=>{const n=norm(f.n).replace(/[()\-]/g," ").trim(),t0=n.split(/\s+/)[0],st=w=>n.startsWith(w);
  if(t0==="واي"||t0==="كازين"||st("بروتين نباتي"))return 30;if(t0==="كريمه"||t0==="قشطه")return 30;
  if(["حليب","لبن","روب","كفير"].includes(t0))return 240;if(t0==="اسبريسو")return 30;if(t0==="قهوه"&&!hasW(n,"بالحليب"))return 60;
  if(t0==="شاي")return 150;if(t0==="زيت"||t0==="سمن")return 10;if(["عسل","سكر","دبس","مربي"].includes(t0))return 15;if(t0==="صوص"||t0==="شطه"||t0==="خردل"||t0==="كاتشب"||t0==="مايونيز")return 20;
  if(st("بطاطس مقليه"))return 120;return SERVE[f.cat]||100};
function amtFor(f,q){
  const n=q.num;
  if(f.u!=="g"){if(q.unit==="g"||q.unit==="kg")return 1;if(q.unit==="pc"&&q.num&&norm(f.n).includes(String(q.num)))return 1;return n||1}
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
  if(pg&&(q.one||["حلويات وسناكات","ساندويتشات ومعجنات","خبز ونشويات"].includes(f.cat)))return pg;
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
    const items=[],miss=[];let ctxStore=null;
  splitSegs(text,P.vocab).forEach(seg=>{
    const q={num:null,unit:null,small:false,one:false};const Q=[],RW=new Set();let segRaw=seg.join(" ");
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
      if(/تين$/.test(s)&&s.length>4&&!P.vocab.has(stem(s))){const b=stem(s.slice(0,-3));if(P.vocab.has(b)||SYN[b]){Q.push(SYN[b]||b);q.num=(q.num||1)*2;if(!q.unit)q.unit="pc";return}}
      const st=stem(s);RW.add(s);RW.add(w);
      if(s.endsWith("ه")&&s.length>2&&P.vocab.has(st)&&q.num==null&&!q.unit)q.one=true;
      if(st.length>=2)Q.push(mapT(w));
    });
    if(!Q.length)return;
    const valid=new Set(ctx.stores||[]);let sname=null;
    const sw=Q.filter(x=>STORE[x]&&valid.has(STORE[x])),pick=sw.find(x=>STORE[x]!=="شاورما")||sw[0];if(pick)sname=STORE[pick];
    const Q1=pick&&STORE[pick]!=="شاورما"?Q.filter(x=>x!==pick):Q;
    if(sname)ctxStore=sname;
    const store=sname?[sname]:(ctxStore?[ctxStore]:null);
    const ss=sname&&STORE_SYN[sname]||{};
    const Qn=Q1.map(x=>ss[x]||x);
    if(!Qn.length&&!store){miss.push(segRaw);return}
    if(!Qn.length){const c=q.num?P.list.filter(({f})=>f.store===store[0]&&norm(f.n).includes(String(q.num))).map(x=>x.f):[];if(!c.length){miss.push(segRaw);return}q.last=ctx.lastAmt&&ctx.lastAmt[c[0].fid];items.push({key:store[0]+" "+q.num,q,alts:c.slice(0,6),f:c[0],amt:Math.round(amtFor(c[0],{...q,unit:q.unit||"pc"})*100)/100,text:segRaw});return}
    const key=Qn.join(" ");
    const scored=[];
    P.list.forEach(({f,toks,raw})=>{
      let s=0,matched=0;raw.forEach(r=>{if(RW.has(r))s+=0.8});
      Qn.forEach(qw=>{let b=0;toks.forEach(t=>{if(t===qw)b=3;else if(qw.length>=3&&t.startsWith(qw))b=Math.max(b,2);else if(t.length>=3&&qw.startsWith(t))b=Math.max(b,1.5)});s+=b;if(b)matched++});
      if(!matched)return;
      s-=0.35*(toks.length-matched);s-=1.2*(Qn.length-matched);
      if(f.store){if(store&&f.store===store[0]){s+=2.5;if(q.num&&norm(f.n).includes(String(q.num)))s+=2.5}else s-=1.5}
      if(segRaw.includes(" ")&&norm(f.n).replace(/[()\-]/g," ").startsWith(segRaw))s+=1;
      if(q.unit==="pc"&&q.num&&/(^|\s)قطعه(\s|$)/.test(norm(f.n)))s+=1;
      if(ctx.recent&&ctx.recent.includes(f.fid))s+=0.4;
      if(f.fid&&f.fid[0]==="c")s+=0.3;
      if(ctx.learned&&ctx.learned[key]===f.fid&&matched===Qn.length)s+=6;
      if(Qn.length===1&&DEF[Qn[0]]&&norm(f.n).startsWith(DEF[Qn[0]]))s+=1.2;
      scored.push([s,f]);
    });
    scored.sort((a,b)=>b[0]-a[0]);
    if((!scored.length||scored[0][0]<1.5)&&Qn.length>1){
      let best=null;Qn.forEach(qw=>P.list.forEach(({f,toks})=>{if(f.store&&!(store&&f.store===store[0]))return;let b=0;toks.forEach(t=>{if(t===qw)b=3});if(!b)return;const sc=b-0.35*(toks.length-1);if(!best||sc>best[0])best=[sc,f]}));
      if(best&&best[0]>=2.5){scored.length=0;scored.push(best)}
    }
    if(!scored.length||scored[0][0]<1.5){miss.push(segRaw);return}
    const alts=scored.slice(0,6).map(x=>x[1]);const f=alts[0];
    q.last=ctx.lastAmt&&ctx.lastAmt[f.fid];
    items.push({key,q,alts,f,amt:Math.round(amtFor(f,q)*100)/100,text:segRaw});
  });
  return {meal,items,miss};
}
function search(text,ctx){
  const foods=ctx.foods||[];const P=prep(foods);
  const raw=norm(text).replace(/[()\-]/g," ").split(/\s+/).filter(Boolean);
  const valid=new Set(ctx.stores||[]);let sname=null;
  const Q=[];raw.forEach(w=>{if(FILL.has(w)&&w.length<3)return;let s=SYN[w]||w;const st=stem(s);const st2=mapT(w);Q.push(st2)});
  const sw=Q.filter(x=>STORE[x]&&valid.has(STORE[x])),pick=sw.find(x=>STORE[x]!=="شاورما")||sw[0];if(pick){sname=STORE[pick];Q.splice(Q.indexOf(pick),1)}
  if(!Q.length&&!sname)return [];
  const out=[];
  const RWs=new Set(raw.map(w=>SYN[w]||w).concat(raw));const qn=raw.join(" ");
  P.list.forEach(({f,toks,raw:fr})=>{
    if(sname&&f.store!==sname&&f.cat!==sname)return;
    let s=0,m=0;fr.forEach(r=>{if(RWs.has(r))s+=0.8});Q.forEach(q=>{let b=0;toks.forEach(t=>{if(t===q)b=3;else if(t.startsWith(q))b=Math.max(b,2);else if(q.length>=3&&q.startsWith(t)&&t.length>=3)b=Math.max(b,1.2)});s+=b;if(b)m++});
    if(Q.length&&m<Q.length)return;
    s-=0.2*(toks.length-m);if(f.store&&!sname)s-=0.8;if(Q.length===1&&DEF[Q[0]]&&norm(f.n).startsWith(DEF[Q[0]]))s+=1;if(toks.slice(0,Q.length).join(" ")===Q.join(" "))s+=0.6;if(qn.includes(" ")&&norm(f.n).replace(/[()\-]/g," ").startsWith(qn))s+=1.5;if(ctx.recent&&ctx.recent.includes(f.fid))s+=0.5;
    out.push([s,f]);
  });
  return out.sort((a,b)=>b[0]-a[0]).map(x=>x[1]);
}
window.FORMA_SAY={parse,amtFor,norm,search};
})();
