// FORMA: شاشة كود التفعيل. نسخة جواد ما تحمّل هذا الملف.
// كل كود يشتغل على جهازين بحد أقصى. التحقق من Supabase، وبعد التفعيل يشتغل بدون نت.
(function(){
  var API="https://ywqguielxzzpqubgneoa.supabase.co/rest/v1/rpc/activate";
  var PUB="sb_publishable_aq-qeqG_fzGVm88wx1XA5w_tX6-Ddcn";
  var KEY="forma_lic", DEV="forma_dev";
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
  ".fg .fg-err{color:var(--hot,#C8501F);font-weight:700;font-size:13px;min-height:20px}";
  function show(){
    var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
    var d=document.createElement("div");d.className="fg";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");
    d.innerHTML='<form class="fg-in"><div class="fg-wm">FORMA</div><h1>فعّل فورما</h1><p>اكتب كود التفعيل اللي وصلك بعد الشراء.</p>'+
      '<input type="text" id="fgCode" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" placeholder="FM-XXXXX-XXXXX" aria-label="كود التفعيل">'+
      '<button class="primary wide" type="submit">تفعيل</button><div class="fg-err" id="fgErr" aria-live="polite"></div>'+
      '<p>الكود يوصلك على إيميلك بعد الشراء من متجر فورما.</p></form>';
    document.body.appendChild(d);document.documentElement.style.overflow="hidden";
    var inp=d.querySelector("#fgCode"),err=d.querySelector("#fgErr"),btn=d.querySelector("button");
    try{var q=new URLSearchParams(location.search).get("code");if(q)inp.value=q}catch(e){}
    d.querySelector("form").addEventListener("submit",async function(e){
      e.preventDefault();err.textContent="";
      var c=norm(inp.value);if(c.length!==10){err.textContent=MSG.invalid;return}
      btn.disabled=true;btn.textContent="لحظة...";
      try{
        var res=await activate(c);
        if(res==="ok"){set(KEY,c);d.remove();document.documentElement.style.overflow="";return}
        err.textContent=MSG[res]||MSG.invalid;
      }catch(x){err.textContent=MSG.net}
      btn.disabled=false;btn.textContent="تفعيل";
    });
  }
  function start(){if(!get(KEY))show()}
  if(document.body)start();else document.addEventListener("DOMContentLoaded",start);
})();
