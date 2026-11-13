// FORMA: شاشة كود التفعيل. نسخة جواد ما تحمّل هذا الملف.
// كل كود يشتغل على جهازين بحد أقصى. التحقق من Supabase، وبعد التفعيل يشتغل بدون نت.
(function(){
  var API="https://ywqguielxzzpqubgneoa.supabase.co/rest/v1/rpc/activate";
  var PUB="sb_publishable_aq-qeqG_fzGVm88wx1XA5w_tX6-Ddcn";
  var KEY="forma_lic", DEV="forma_dev";
  /* التجربة المجانية: 3 أيام بدون كود */
  var TRIAL="forma_trial",DAYS=3,BUY="https://1oxoxu.zid.store/";
  /* فترة مجانية للكل لين هذا التاريخ. بعدها لازم كود. غيّر التاريخ لو تبي تمددها */
  var FREE_UNTIL=Date.parse("2026-11-19T23:59:59+03:00");
  function trialLeft(){return Math.max(0,FREE_UNTIL-Date.now())}
  window.FORMA_TRIAL={left:function(){return get(KEY)?null:trialLeft()},buy:BUY};
  function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function norm(s){s=String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"");if(s.indexOf("FM")===0&&s.length===12)s=s.slice(2);return s}
  function device(){
    var d=get(DEV);
    if(!d){d=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);set(DEV,d)}
    return d;
  }
  async function activate(code){
    var r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json","apikey":PUB,"Authorization":"Bearer "+PUB},
      body:JSON.stringify({p_code:code,p_device:device()})});
    if(!r.ok)throw new Error("http "+r.status);
    return await r.json();
  }
  var MSG={invalid:"الكود غير صحيح، تأكد منه وجرب مرة ثانية",used:"الكود مستخدم على جهازين قبل. تواصل معنا لو تحتاج مساعدة",net:"تأكد إنك متصل بالنت وجرب مرة ثانية"};
  var css=".fg{position:fixed;inset:0;z-index:1000;background:var(--bg,#F1F3F1);color:var(--ink,#0F1513);display:flex;align-items:center;justify-content:center;padding:24px max(16px,env(safe-area-inset-left,0px));font-family:var(--body,system-ui)}"+
  ".fg-in{width:100%;max-width:400px;display:flex;flex-direction:column;gap:14px;text-align:center}"+
  ".fg-wm{font-family:var(--display,system-ui);font-weight:800;font-size:30px;letter-spacing:.06em;direction:ltr;color:var(--accent,#0E7A5A)}"+
  ".fg h1{font-size:22px;margin:0}.fg p{margin:0;color:var(--muted,#5E6B66);font-size:14px;line-height:1.7}"+
  ".fg input{direction:ltr;text-align:center;letter-spacing:.08em;font-family:var(--display,system-ui);font-size:18px;text-transform:uppercase}"+
  ".fg .fg-err{color:var(--hot,#C8501F);font-weight:700;font-size:13px;min-height:20px}"+
  ".fg .fg-or{margin-top:10px;font-size:13px;font-weight:700;color:var(--muted,#5E6B66)}"+
  ".fg a.fg-buy{display:block;padding:15px;border-radius:16px;text-decoration:none;font-weight:800;text-align:center}";
  var box=null;
  function show(){
    if(box){box.hidden=false;document.documentElement.style.overflow="hidden";return}
    var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
    var d=document.createElement("div");d.className="fg";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");
    var exp=trialLeft()===0;
    d.innerHTML='<form class="fg-in"><div class="fg-wm">FORMA</div><h1>'+(exp?"خلصت الفترة المجانية":"هلا بك في فورما")+'</h1><p>'+(exp?"عجبك فورما؟ اشتره مرة وحدة بدون اشتراك، وكل اللي سجلته يبقى.":"جرّبه 3 أيام مجانا. بدون كود وبدون بطاقة.")+'</p>'+
      (exp?'<a class="primary fg-buy" href="'+BUY+'" target="_blank" rel="noopener">اشترِ فورما</a>':'<button class="primary wide" type="button" id="fgTrial">ابدأ التجربة المجانية</button>')+'<div class="fg-or">عندك كود تفعيل؟</div>'+
      '<input type="text" id="fgCode" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" placeholder="FM-XXXXX-XXXXX" aria-label="كود التفعيل">'+
      '<button class="wide" type="submit">تفعيل</button><div class="fg-err" id="fgErr" aria-live="polite"></div>'+
      '<p>الكود يوصلك على الواتساب أو الإيميل بعد الشراء من متجر فورما.</p></form>';
    box=d;document.body.appendChild(d);document.documentElement.style.overflow="hidden";
    var inp=d.querySelector("#fgCode"),err=d.querySelector("#fgErr"),btn=d.querySelector('button[type="submit"]'),tb=d.querySelector("#fgTrial");
    if(tb)tb.addEventListener("click",function(){set(TRIAL,String(Date.now()));gone();window.dispatchEvent(new Event("forma:trial"));
      fetch(API.replace("activate","trial_start"),{method:"POST",headers:{"Content-Type":"application/json","apikey":PUB,"Authorization":"Bearer "+PUB},body:JSON.stringify({p_device:device()})}).then(function(r){return r.json()}).then(function(t){if(+t>0&&+t<Date.now())set(TRIAL,String(t))}).catch(function(){})});
    try{var q=new URLSearchParams(location.search).get("code");if(q)inp.value=q}catch(e){}
    d.querySelector("form").addEventListener("submit",async function(e){
      e.preventDefault();err.textContent="";
      var c=norm(inp.value);if(c.length!==10){err.textContent=MSG.invalid;return}
      btn.disabled=true;btn.textContent="لحظة...";
      try{
        var res=window.FORMA_CLOUD?await window.FORMA_CLOUD.activate(c):await activate(c);
        if(res==="ok"){set(KEY,c);if(mo)mo.disconnect();d.remove();box=null;document.documentElement.style.overflow="";if(!window.FORMA_CLOUD)window.dispatchEvent(new Event("forma:activated"));return}
        err.textContent=MSG[res]||MSG.invalid;
      }catch(x){err.textContent=MSG.net}
      btn.disabled=false;btn.textContent="تفعيل";
    });
  }
  // لو شاشة التثبيت ظاهرة نخليه يثبت أول، والكود يطلع داخل التطبيق المثبت.
  // لو ضغط «أكمل في المتصفح» تطلع شاشة الكود.
  function hide(){if(box){box.hidden=true;document.documentElement.style.overflow=""}}
  function gone(){if(box){box.remove();box=null;document.documentElement.style.overflow=""}}
  function check(){if(get(KEY))return;if(trialLeft()>0)return gone();if(document.querySelector("#view .ins"))hide();else show()}
  var mo=null;
  function start(){
    if(get(KEY))return;
    check();
    document.addEventListener("visibilitychange",check);setInterval(check,60000);
    if(window.MutationObserver){mo=new MutationObserver(check);mo.observe(document.getElementById("view")||document.body,{childList:true,subtree:true})}
  }
  if(document.body)start();else document.addEventListener("DOMContentLoaded",start);
})();
