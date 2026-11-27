// FORMA: شاشة القفل. نسخة جواد تحمّله بعد، بس بدون الفترة المجانية.
// من 5.0: الدخول بحساب (أبل، قوقل، الإيميل)، وبعده تفعيل العضوية بكود الشراء مرة وحدة.
// الأجهزة اللي مفعلة بكود قديم (forma_lic) تبقى مفتوحة بدون دخول.
(function(){
  var API="https://ywqguielxzzpqubgneoa.supabase.co/rest/v1/rpc/";
  var PUB="sb_publishable_aq-qeqG_fzGVm88wx1XA5w_tX6-Ddcn";
  var KEY="forma_lic", DEV="forma_dev";
  var TRIAL="forma_trial",BUY="https://1oxoxu.zid.store/";
  /* فترة مجانية للكل لين هذا التاريخ. بعدها لازم عضوية. غيّر التاريخ لو تبي تمددها */
  var FREE_UNTIL=Date.parse("2026-11-19T23:59:59+03:00");
  var PRIV=!!(window.FORMA_CONFIG&&window.FORMA_CONFIG.store);
  function trialLeft(){return PRIV?0:Math.max(0,FREE_UNTIL-Date.now())}
  function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
  function plan(){try{return JSON.parse(get("forma_plan")||"null")}catch(e){return null}}
  function signedIn(){return !!get("forma_sess")}
  /* مفتوح: كود قديم على الجهاز، أو حساب عنده عضوية */
  function unlocked(){if(get(KEY))return true;var p=plan();return signedIn()&&!!p&&!!p.acc&&p.plan!=="none"}
  window.FORMA_TRIAL={left:function(){return unlocked()?null:trialLeft()},buy:BUY};
  function device(){
    var d=get(DEV);
    if(!d){d=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);set(DEV,d)}
    return d;
  }
  function esc(s){return String(s||"").replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
  var MSG={invalid:"الكود غير صحيح، تأكد منه وجرب مرة ثانية",taken:"هذا الكود مربوط بحساب ثاني. سجّل دخول بنفس الحساب اللي ربطته فيه",slow:"محاولات كثيرة. انتظر شوي وجرّب",devices:"حسابك مفتوح على 3 أجهزة. اطلع من جهاز قديم من صفحة «ملفي»",net:"تأكد إنك متصل بالنت وجرب مرة ثانية"};
  var css=".fg{position:fixed;inset:0;z-index:1000;background:var(--bg,#F1F3F1);color:var(--ink,#0F1513);display:flex;align-items:center;justify-content:center;padding:24px max(16px,env(safe-area-inset-left,0px));font-family:var(--body,system-ui);overflow:auto}"+
  ".fg-in{width:100%;max-width:400px;display:flex;flex-direction:column;gap:14px;text-align:center;margin:auto}"+
  ".fg-wm{font-family:var(--display,system-ui);font-weight:800;font-size:30px;letter-spacing:.06em;direction:ltr;color:var(--accent,#0E7A5A)}"+
  ".fg h1{font-size:22px;margin:0}.fg p{margin:0;color:var(--muted,#5E6B66);font-size:14px;line-height:1.7}"+
  ".fg input.fg-code{direction:ltr;text-align:center;letter-spacing:.08em;font-family:var(--display,system-ui);font-size:18px;text-transform:uppercase}"+
  ".fg .fg-err{color:var(--hot,#C8501F);font-weight:700;font-size:13px;min-height:20px}"+
  ".fg .fg-or{margin-top:6px;font-size:13px;font-weight:700;color:var(--muted,#5E6B66)}"+
  ".fg a.fg-buy{display:block;padding:15px;border-radius:16px;text-decoration:none;font-weight:800;text-align:center}";
  var box=null,cssDone=false;

  function render(){
    var d=box,exp=trialLeft()===0,AU=window.FORMA_AUTH,CL=window.FORMA_CLOUD;
    if(!signedIn()){
      d.innerHTML='<div class="fg-in"><div class="fg-wm">FORMA</div><h1>'+(exp?"سجّل دخولك":"هلا بك في فورما")+'</h1><p>'+
        (exp?"حسابك يحفظ بياناتك ويفتحها لك من أي جهاز.":"جرّبه مجانا، وسجّل دخولك عشان تنحفظ بياناتك.")+'</p>'+
        (exp?"":'<button class="primary wide" type="button" id="fgTrial">ابدأ التجربة المجانية</button><div class="fg-or">أو سجّل دخول</div>')+
        '<div id="fgLogin"></div><p>اشتريت من زد؟ سجّل دخول، بعدها تدخل كود الشراء مرة وحدة.</p></div>';
      if(AU)AU.mountLogin(d.querySelector("#fgLogin"));
      var tb=d.querySelector("#fgTrial");
      if(tb)tb.addEventListener("click",function(){set(TRIAL,String(Date.now()));gone();window.dispatchEvent(new Event("forma:trial"));
        fetch(API+"trial_start",{method:"POST",headers:{"Content-Type":"application/json","apikey":PUB,"Authorization":"Bearer "+PUB},body:JSON.stringify({p_device:device()})}).then(function(r){return r.json()}).then(function(t){if(+t>0&&+t<Date.now())set(TRIAL,String(t))}).catch(function(){})});
      return;
    }
    var p=plan(),mail=AU&&AU.email();
    if(!p||!p.acc){
      d.innerHTML='<div class="fg-in"><div class="fg-wm">FORMA</div><h1>لحظة...</h1><p>نجهز حسابك</p></div>';
      if(CL&&CL.info)CL.info().then(function(r){if(!r&&box&&!plan())box.querySelector("p").textContent=MSG.net});
      return;
    }
    d.innerHTML='<form class="fg-in"><div class="fg-wm">FORMA</div><h1>باقي خطوة وحدة</h1><p>'+(mail?'<span dir="ltr">'+esc(mail)+'</span><br>':"")+
      'فعّل عضويتك: انضم للمؤسسين بـ 34.99 مرة وحدة مدى الحياة، وكل اللي سجلته يبقى معك.</p>'+
      '<a class="primary fg-buy" href="'+BUY+'" target="_blank" rel="noopener">انضم للمؤسسين</a><div class="fg-or">عندك كود الشراء؟</div>'+
      '<input type="text" class="fg-code" id="fgCode" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" placeholder="FM-XXXXX-XXXXX" aria-label="كود الشراء">'+
      '<button class="wide" type="submit">فعّل</button><div class="fg-err" id="fgErr" aria-live="polite"></div>'+
      '<p>الكود يوصل إيميلك بعد الدفع مباشرة.</p><button type="button" class="ghost" id="fgOut">دخول بحساب ثاني</button></form>';
    var inp=d.querySelector("#fgCode"),err=d.querySelector("#fgErr"),btn=d.querySelector('button[type="submit"]');
    try{var q=new URLSearchParams(location.search).get("code");if(q)inp.value=q}catch(e){}
    d.querySelector("#fgOut").addEventListener("click",function(){if(CL)CL.signOut();else if(AU)AU.signOut()});
    d.querySelector("form").addEventListener("submit",async function(e){
      e.preventDefault();err.textContent="";
      if(!CL||CL.norm(inp.value).length!==10){err.textContent=MSG.invalid;return}
      btn.disabled=true;btn.textContent="لحظة...";
      var res=await CL.link(inp.value);
      if(res==="ok"){check();return}
      err.textContent=MSG[res]||MSG.invalid;btn.disabled=false;btn.textContent="فعّل";
    });
  }
  function show(){
    if(!cssDone){var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);cssDone=true}
    if(!box){box=document.createElement("div");box.className="fg";box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");document.body.appendChild(box);render()}
    box.hidden=false;document.documentElement.style.overflow="hidden";
  }
  // لو شاشة التثبيت ظاهرة نخليه يثبت أول، والقفل يطلع داخل التطبيق المثبت.
  function hide(){if(box){box.hidden=true;document.documentElement.style.overflow=""}}
  function gone(){if(box){box.remove();box=null;document.documentElement.style.overflow=""}}
  function check(){if(unlocked()||trialLeft()>0)return gone();if(document.querySelector("#view .ins"))hide();else show()}
  /* تغيّر الحساب: نعيد رسم الشاشة */
  function again(){if(box)render();check()}
  ["forma:signedin","forma:signedout","forma:account","forma:activated"].forEach(function(n){window.addEventListener(n,again)});
  var mo=null;
  function start(){
    if(get(KEY))return;
    check();
    document.addEventListener("visibilitychange",check);setInterval(check,60000);
    if(window.MutationObserver){mo=new MutationObserver(check);mo.observe(document.getElementById("view")||document.body,{childList:true,subtree:true})}
  }
  if(document.body)start();else document.addEventListener("DOMContentLoaded",start);
})();
