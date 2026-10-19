const API_BASE = '/api';
const ACCESS_KEY = 'Egaa';
const isReturn = document.documentElement.getAttribute('data-return')==='1';

function go(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target=document.getElementById('page-'+name);
  if(target)target.classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===name));
  
  hideTerm();
  window.scrollTo({top:0,behavior:'auto'});
}
document.querySelectorAll('[data-go]').forEach(el=>{
  el.addEventListener('click',()=>go(el.dataset.go));
});

if(location.hash)go(location.hash.replace('#page-',''));

// ===== PARTIKEL EFFECT =====
(function(){
  const cv=document.getElementById('fx');
  if(!cv) return;
  const ctx=cv.getContext('2d');let w,h,pts=[],color='rgba(255,255,255,.55)';
  const dpr = Math.min(devicePixelRatio||1, 1.5);
  function resize(){w=cv.width=innerWidth*dpr;h=cv.height=innerHeight*dpr;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  resize();addEventListener('resize',resize,{passive:true});
  const N=innerWidth<600?14:22;
  for(let i=0;i<N;i++)pts.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.6+0.5,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22});
  try{color=getComputedStyle(document.documentElement).getPropertyValue('--particle').trim()||color;}catch(e){}
  let running=true, typing=false, rafId=null, last=0;
  document.addEventListener('focusin',e=>{if(e.target && (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))typing=true;});
  document.addEventListener('focusout',e=>{if(e.target && (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))typing=false;});
  document.addEventListener('visibilitychange',()=>{running=!document.hidden; if(running && !rafId) rafId=requestAnimationFrame(tick);});
  function tick(ts){
    rafId=requestAnimationFrame(tick);
    if(!running || typing) return;
    if(ts-last<33) return;
    last=ts;
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(let i=0;i<pts.length;i++){
      const p=pts[i]; p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>innerWidth)p.vx*=-1;
      if(p.y<0||p.y>innerHeight)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fillStyle=color;ctx.fill();
    }
  }
  rafId=requestAnimationFrame(tick);
})();

const glow=document.getElementById('cursorGlow');
if(glow){
  let gx=0,gy=0,rafing=false;
  addEventListener('pointermove',e=>{
    gx=e.clientX;gy=e.clientY;
    if(!rafing){rafing=true;requestAnimationFrame(()=>{glow.style.opacity='1';glow.style.left=gx+'px';glow.style.top=gy+'px';rafing=false;});}
  });
  document.documentElement.addEventListener('pointerleave',()=>glow.style.opacity='0');
}
const prog=document.getElementById('progress');
let progTicking=false;
addEventListener('scroll',()=>{
  if(!prog||progTicking) return;
  progTicking=true;
  requestAnimationFrame(()=>{
    const d=document.documentElement,max=d.scrollHeight-d.clientHeight;
    prog.style.transform='scaleX('+(max? d.scrollTop/max : 0)+')';
    progTicking=false;
  });
},{passive:true});

const loader=document.getElementById('loader');
if(loader){
  if(!isReturn){
    const dots=document.getElementById('loadDots');
    if(dots){let n=0;setInterval(()=>{n=(n+1)%4;dots.textContent='.'.repeat(n)},420);}
    setTimeout(()=>{loader.classList.add('done');setTimeout(()=>{if(loader.parentNode)loader.parentNode.removeChild(loader);},800);},1600);
  }else{
    if(loader.parentNode)loader.parentNode.removeChild(loader);
  }
}

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme',theme);
  document.querySelectorAll('.theme-dot').forEach(d=>d.classList.toggle('on',d.dataset.theme===theme));
  const themeImg='img/avatar-'+theme+'.png';
  const av=document.getElementById('creatorAvatar');
  if(av) av.src=themeImg;
  const navAv=document.getElementById('navAvatar');
  if(navAv) navAv.src=themeImg;
  const loadAv=document.getElementById('loaderAvatar');
  if(loadAv) loadAv.src=themeImg;
  try{localStorage.setItem('amTheme',theme);}catch(e){}
}
document.querySelectorAll('.theme-dot').forEach(dot=>{
  dot.addEventListener('click',()=>applyTheme(dot.dataset.theme));
});

try{applyTheme(document.documentElement.getAttribute('data-theme')||'mono');}catch(e){}

window.addEventListener('load',()=>{
  document.querySelectorAll('.reveal').forEach(el=>{
    if(!isReturn){
      setTimeout(()=>el.classList.add('in'),(el.style.getPropertyValue('--d').replace('s','')||0)*1000);
    }else{
      el.classList.add('in'); 
    }
  });
});

let toastTimer=null;
function toast(msg){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.className='toast';t.id='toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600);
}

// ===== ACCESS KEY MODAL =====
const keyModal=document.getElementById('keyModal');
const keyHint=document.getElementById('keyHint');
const keyErrorTop=document.getElementById('keyErrorTop');
let unlocked=false;
let pendingAction=null;
function setHint(json){if(keyHint)keyHint.textContent=JSON.stringify(json,null,2);}
function showTopError(show){
  if(!keyErrorTop) return;
  if(show){ keyErrorTop.classList.add('show'); keyErrorTop.style.display='block'; }
  else { keyErrorTop.classList.remove('show'); keyErrorTop.style.display='none'; }
}
function openKeyModal(action){
  pendingAction=action;
  showTopError(false);
  setHint({"status":"pending","msg":"masukkan key untuk melanjutkan"});
  const ki=document.getElementById('keyInput');
  if(ki)ki.value='';
  keyModal.classList.add('show');
  if(ki){requestAnimationFrame(()=>{ki.focus();}); setTimeout(()=>{if(keyModal.classList.contains('show')) ki.focus();},120);}
}
function closeKeyModal(){keyModal.classList.remove('show');showTopError(false);setLoading('btnUnlock','loaderUnlock','btnUnlockText',false);}
function handleUnlock(){
  const key=document.getElementById('keyInput').value.trim();
  if(!key){setHint({"status":"denied","code":400,"key":null,"msg":"key kosong"});toast('{"code":400,"msg":"key kosong"}');return;}
  setLoading('btnUnlock','loaderUnlock','btnUnlockText',true);
  setHint({"status":"checking","code":100,"key":key,"msg":"memverifikasi key..."});
  setTimeout(()=>{
    setLoading('btnUnlock','loaderUnlock','btnUnlockText',false);
    if(key===ACCESS_KEY){unlocked=true;closeKeyModal();toast('{"status":"ok","code":200,"access":"granted"}');if(pendingAction==='verify')handleVerify();else handleSend();}
    else{
      showTopError(true);
      setHint({"status":"denied","code":403,"key":key,"msg":"masuk ch dulu bng"});
      toast('masuk ch dulu bng — join channel dulu!');
      document.getElementById('keyInput').value='';
      if(keyHint){
        keyHint.style.borderColor='var(--bad)';
        keyHint.style.color='var(--bad)';
        setTimeout(()=>{keyHint.style.borderColor='';keyHint.style.color='';},1800);
      }
    }
  },600);
}
const keyInputEl=document.getElementById('keyInput');
if(keyInputEl)keyInputEl.addEventListener('keydown',e=>{if(e.key==='Enter')handleUnlock()});

// ===== TABS & TERMINAL =====
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  const ts=document.getElementById('tab-send'),tv=document.getElementById('tab-verify');
  if(ts)ts.classList.toggle('active',tab==='send');
  if(tv)tv.classList.toggle('active',tab==='verify');
  const bs=document.getElementById('tabSendBtn'),bv=document.getElementById('tabVerifyBtn');
  if(bs)bs.classList.toggle('active',tab==='send');
  if(bv)bv.classList.toggle('active',tab==='verify');
  hideTerm();
}

function showTerm(msg,type){
  const term=document.getElementById('term'),body=document.getElementById('termBody');
  if(!term||!body)return;
  body.className='term-body '+(type||'');
  body.textContent=typeof msg==='object'?JSON.stringify(msg,null,2):msg;
  term.classList.add('show');body.scrollTop=0;
}
function hideTerm(){const term=document.getElementById('term');if(term)term.classList.remove('show');}

function setLoading(btnId,loadId,textId,on){
  const b=document.getElementById(btnId),l=document.getElementById(loadId),t=document.getElementById(textId);
  if(b)b.disabled=on;
  if(l)l.style.display=on?'inline-block':'none';
  if(t)t.style.opacity=on?'.6':'1';
}
const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== API AM: KIRIM LINK =====
async function handleSend(){
  const email=document.getElementById('emailInput').value.trim();
  if(!unlocked){openKeyModal('send');return;}
  if(!email){showTerm(JSON.stringify({"status":"warning","code":400,"field":"email","msg":"email kosong"},null,2),'warning');toast('{"code":400,"msg":"email kosong"}');return;}
  if(!emailRegex.test(email)){showTerm(JSON.stringify({"status":"warning","code":422,"field":"email","msg":"format email tidak valid"},null,2),'warning');toast('{"code":422,"msg":"format email tidak valid"}');return;}
  
  hideTerm();
  setLoading('btnSend','loaderSend','btnSendText',true);
  toast('{"code":100,"msg":"mengirim link..."}');
  
  try{
    // Ubah ke POST
    const res=await fetch(`${API_BASE}/send-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    });
    
    const data=await res.json();
    
    if(!res.ok || data?.ok===false){
      const errMsg = data?.error || data?.message || data?.msg || 'gagal kirim link';
      toast(`{"status":"error","code":${res.status},"msg":"${errMsg}"}`);
      showTerm(JSON.stringify({"status":"error","code":res.status,"email":email,"data":data},null,2),'error');
      return;
    }
    toast('{"status":"ok","code":200,"msg":"link terkirim"}');
    showTerm(JSON.stringify({"status":"success","code":res.status,"email":email,"data":data},null,2),'success');
  }catch(e){
    toast('{"status":"error","code":500,"msg":"gagal kirim"}');
    showTerm(JSON.stringify({"status":"error","code":500,"email":email,"error":e.message,"hint":"periksa koneksi"},null,2),'error');
  }finally{
    setLoading('btnSend','loaderSend','btnSendText',false);
  }
}

// ===== API AM: VALIDASI LINK =====
async function handleVerify(){
  const email=document.getElementById('emailInput').value.trim();
  const link=document.getElementById('linkInput').value.trim();
  if(!unlocked){openKeyModal('verify');return;}
  if(!email){showTerm(JSON.stringify({"status":"warning","code":400,"field":"email","msg":"isi email di halaman Tool terlebih dahulu"},null,2),'warning');toast('{"code":400,"msg":"isi email di Tool"}');return;}
  if(!link){showTerm(JSON.stringify({"status":"warning","code":400,"field":"link","msg":"link wajib diisi"},null,2),'warning');toast('{"code":400,"msg":"link kosong"}');return;}
  if(!emailRegex.test(email)){showTerm(JSON.stringify({"status":"warning","code":422,"field":"email","msg":"format email tidak valid"},null,2),'warning');toast('{"code":422,"msg":"format email tidak valid"}');return;}
  if(!/^https?:\/\//i.test(link)){showTerm(JSON.stringify({"status":"warning","code":422,"field":"link","msg":"link harus http(s)://"},null,2),'warning');toast('{"code":422,"msg":"link tidak valid"}');return;}
  
  hideTerm();
  setLoading('btnVerify','loaderVerify','btnVerifyText',true);
  toast('{"code":100,"msg":"memvalidasi link..."}');
  
  try{
    // Ubah ke POST
    const res=await fetch(`${API_BASE}/verify-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, magicLink: link })
    });
    
    const data=await res.json();
    
    if(!res.ok || data?.ok===false){
      const errMsg = data?.error || data?.message || data?.msg || 'gagal validasi';
      toast(`{"status":"error","code":${res.status},"msg":"${errMsg}"}`);
      showTerm(JSON.stringify({"status":"error","code":res.status,"email":email,"link":link,"data":data},null,2),'error');
      return;
    }
    toast('{"status":"ok","code":200,"msg":"validasi sukses"}');
    showTerm(JSON.stringify({"status":"success","code":res.status,"email":email,"link":link,"data":data},null,2),'success');
  }catch(e){
    toast('{"status":"error","code":500,"msg":"gagal validasi"}');
    showTerm(JSON.stringify({"status":"error","code":500,"email":email,"link":link,"error":e.message,"hint":"periksa koneksi"},null,2),'error');
  }finally{
    setLoading('btnVerify','loaderVerify','btnVerifyText',false);
  }
}

const ei=document.getElementById('emailInput'),li=document.getElementById('linkInput');
if(ei)ei.addEventListener('keydown',e=>{if(e.key==='Enter')handleSend();});
if(li)li.addEventListener('keydown',e=>{if(e.key==='Enter')handleVerify();});

// ===== EMAIL GENERATOR (Ega) =====
// (Tetap dipertahankan, tapi ingat API Noxxy gak ada endpoint temp mail)
let currentEmail = "";
let currentAlightLink = "";
let autoInterval = null;

let alightLinks=[];
let inboxMails=[];
let currentInboxIdx=0;
function updateAlightBox(j){
  const box=document.getElementById('alightBox');
  const list=document.getElementById('alightList');
  const countEl=document.getElementById('alightCount');
  const nav=document.getElementById('inboxNav');
  const navCounter=document.getElementById('inboxNavCounter');
  if(!box||!list) return;
  let mails = j?.result?.mails || [];
  if(!mails.length && j?.result?.links?.length) {
    mails = [{ links: j.result.links, subj: j.result.subject||'Alight Mail', time: j.result.time||'', from: j.result.from||'', bodyText: j.result.body||'' }];
  }
  inboxMails=mails.slice(0,20);
  alightLinks=[];
  inboxMails.forEach(m=>{
    const links = m.links || [];
    links.forEach(l=>{
      if(l.includes('alight-creative.firebaseapp.com') || l.includes('alightcreative.com')){
        alightLinks.push({ link:l, subj:m.subj, time:m.time, from:m.from, bodyText:m.bodyText });
      }
    });
    if(!links.length && m.bodyText){
      const mm=m.bodyText.match(/(https:\/\/alight-creative\.firebaseapp\.com\/__\/auth\/links\?link=[^\s"']+)/gi);
      if(mm) mm.forEach(l=> alightLinks.push({ link:l, subj:m.subj, time:m.time, from:m.from, bodyText:m.bodyText }));
    }
  });
  if(!alightLinks.length && inboxMails.length){
    inboxMails.forEach(m=> (m.links||[]).forEach(l=> alightLinks.push({ link:l, subj:m.subj, time:m.time, from:m.from, bodyText:m.bodyText })));
  }
  alightLinks = alightLinks.slice(0,20);
  let viewData = alightLinks.length ? alightLinks : inboxMails;
  if(countEl) countEl.textContent = alightLinks.length ? alightLinks.length+' link' : inboxMails.length+' pesan';
  if(!viewData.length){
    box.style.display='none';
    if(nav) nav.style.display='none';
    currentAlightLink="";
    return;
  }
  currentInboxIdx=0;
  window._viewData=viewData;
  window._isAlightView=!!alightLinks.length;
  if(nav){ nav.style.display = viewData.length>1 ? 'flex' : 'none'; }
  if(navCounter) navCounter.textContent = `1 / ${viewData.length}`;
  renderInboxIdx(0);
  box.style.display='block';
  setTimeout(()=> box.scrollIntoView({behavior:'smooth', block:'nearest'}), 200);
}
function renderInboxIdx(idx){
  const list=document.getElementById('alightList');
  const navCounter=document.getElementById('inboxNavCounter');
  if(!list) return;
  const viewData=window._viewData||[];
  const isAlight=window._isAlightView;
  if(idx<0) idx=viewData.length-1;
  if(idx>=viewData.length) idx=0;
  currentInboxIdx=idx;
  const item=viewData[idx];
  if(navCounter) navCounter.textContent = `${idx+1} / ${viewData.length}`;
  list.innerHTML="";
  const card=document.createElement('div');
  card.style.cssText='padding:12px;border:1px solid var(--line);border-radius:12px;background:rgba(0,0,0,.28)';
  if(isAlight){
    card.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:.68rem;font-weight:800;letter-spacing:.06em;color:var(--accent)">#${idx+1} ${item.subj?item.subj.slice(0,28):'Alight Link'}</span>
        <span style="font-size:.60rem;color:var(--muted)">${item.time||''}</span>
      </div>
      <div style="font-size:.62rem;color:var(--muted);margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.from||''}</div>
      <div style="font-size:.70rem;color:var(--muted);margin-bottom:6px;padding:8px;background:rgba(0,0,0,.2);border-radius:8px;border:1px solid var(--line);max-height:70px;overflow:auto;word-break:break-word">${item.bodyText?item.bodyText.slice(0,200):''}</div>
      <code style="display:block;padding:10px;background:rgba(0,0,0,.38);border:1px solid var(--line);border-radius:8px;font-size:.64rem;color:var(--accent-2);word-break:break-all;line-height:1.5;max-height:80px;overflow:auto">${item.link}</code>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <button onclick="verifyAlightLinkIdx(${idx})" style="flex:1 1 100%;padding:11px;border-radius:10px;border:none;background:var(--accent);color:#050505;font-weight:800;font-size:.80rem;cursor:pointer;letter-spacing:.04em">⚡ Validasi Otomatis (Tanpa Captcha)</button>
        <button onclick="openAlightLinkIdx(${idx})" style="flex:1;padding:10px;border-radius:10px;border:1px solid var(--accent);background:rgba(255,255,255,.06);color:var(--fg);font-weight:700;font-size:.76rem;cursor:pointer">Buka di Chrome</button>
        <button onclick="copyAlightLinkIdx(${idx})" style="flex:0 0 92px;padding:10px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--fg);font-weight:700;font-size:.76rem;cursor:pointer">Salin</button>
      </div>`;
  }else{
    card.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:.68rem;font-weight:800;letter-spacing:.06em;color:var(--accent)">#${idx+1} ${item.subj?item.subj.slice(0,32):'Mail'}</span>
        <span style="font-size:.60rem;color:var(--muted)">${item.time||''}</span>
      </div>
      <div style="font-size:.62rem;color:var(--muted);margin-bottom:6px">${item.from||''}</div>
      <div style="font-size:.70rem;color:var(--fg);padding:10px;background:rgba(0,0,0,.25);border-radius:8px;border:1px solid var(--line);max-height:120px;overflow:auto;word-break:break-word;white-space:pre-wrap">${item.bodyText||'Pesan full akan muncul di sini. Untuk link alight, cek pesan 1 per 1.'}</div>`;
  }
  list.appendChild(card);
  if(isAlight) currentAlightLink=item.link;
}
window.prevInbox=function(){ renderInboxIdx(currentInboxIdx-1); }
window.nextInbox=function(){ renderInboxIdx(currentInboxIdx+1); }
window.openAlightLink=function(){ window.openAlightLinkIdx(0); }
window.openAlightLinkIdx=function(idx){
  const item=alightLinks[idx];
  if(!item){ toast('link belum ada'); return; }
  const link=item.link;
  toast('membuka di Chrome... #' + (idx+1));
  const isAndroid=/Android/i.test(navigator.userAgent);
  if(isAndroid){
    const intentUrl = `intent://${link.replace(/^https?:\/\//,'')}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
    setTimeout(()=> window.open(link, '_blank'), 800);
  }else{
    window.open(link, '_blank', 'noopener');
  }
}
window.copyAlightLink=function(){ window.copyAlightLinkIdx(0); }
window.copyAlightLinkIdx=function(idx){
  const item=alightLinks[idx];
  if(!item){ toast('link kosong'); return; }
  navigator.clipboard.writeText(item.link).then(()=>toast('link #' + (idx+1) + ' copied!')).catch(()=>{
    const ta=document.createElement('textarea'); ta.value=item.link; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('copied'); 
  });
}

// ===== VALIDASI OTOMATIS DARI EMAIL =====
window.verifyAlightLinkIdx=async function(idx){
  const item=alightLinks[idx];
  if(!item || !item.link){ toast('link belum ada'); return; }
  const email = currentEmail || document.getElementById('emailOutput')?.value?.trim() || document.getElementById('emailInput')?.value?.trim();
  if(!email){ toast('email belum ada'); return; }
  const eiEl = document.getElementById('emailInput');
  const liEl = document.getElementById('linkInput');
  if(eiEl) eiEl.value = email;
  if(liEl) liEl.value = item.link;
  
  toast('memvalidasi link #' + (idx+1) + '...');
  showEmailTerm({ status: 'processing', msg: 'Memvalidasi magic link ke server...', email, link: item.link }, '');
  
  try {
    // Ubah ke POST
    const res = await fetch(`${API_BASE}/verify-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, magicLink: item.link })
    });
    const data = await res.json();
    
    if(!res.ok || data?.ok===false){
      const errMsg = data?.error || data?.message || data?.msg || 'gagal validasi';
      toast('validasi gagal: ' + errMsg);
      showEmailTerm({ status: 'error', code: res.status, email, data }, 'error');
      return;
    }
    toast('✅ Validasi AM Berhasil!');
    showEmailTerm({ status: 'success', code: res.status, email, data }, 'success');
  } catch (e) {
    toast('gagal validasi: ' + e.message);
    showEmailTerm({ status: 'error', error: e.message }, 'error');
  }
}

function showEmailTerm(msg,type){
  const term=document.getElementById('emailTerm'), body=document.getElementById('emailTermBody');
  if(!term||!body) return;
  body.className='term-body '+(type||'');
  body.textContent = typeof msg==='object'? JSON.stringify(msg,null,2) : msg;
  term.classList.add('show');
  body.scrollTop=0;
}

async function loadEmailDomains(){
  const sel=document.getElementById('emailDomain');
  if(!sel) return;
  try{
    const r=await fetch(`${API_BASE}/email?action=domains`);
    const j=await r.json();
    const domains=j.domains||[];
    sel.innerHTML="";
    domains.slice(0,30).forEach(d=>{
      const o=document.createElement('option'); o.value=d; o.textContent=d; sel.appendChild(o);
    });
    if(!domains.length) sel.innerHTML='<option value="">Gagal load domain</option>';
  }catch(e){
    sel.innerHTML='<option value="">Error load</option>';
  }
}
loadEmailDomains();
document.addEventListener('DOMContentLoaded', loadEmailDomains);
window.addEventListener('load', ()=>{ if(document.getElementById('page-email')) loadEmailDomains(); });

async function handleGenEmail(){
  const domainSel=document.getElementById('emailDomain')?.value?.trim();
  const domainCustom=document.getElementById('emailDomainCustom')?.value?.trim().toLowerCase();
  const domain=domainCustom || domainSel;
  const user=document.getElementById('emailUser')?.value?.trim();
  setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',true);
  if(domainCustom==='gmail.com' || domainCustom==='googlemail.com'){
    showEmailTerm('Generate xxxx@gmail.com (custom) — inbox tidak bisa dicek di sini, cek Gmail asli ya','warning');
  }else{
    showEmailTerm('Generate email...','');
  }
  try{
    const url=`${API_BASE}/email?action=generate${domain?`&domain=${encodeURIComponent(domain)}`:''}${user?`&user=${encodeURIComponent(user)}`:''}`;
    const r=await fetch(url); const j=await r.json();
    if(j.status!=="success") throw new Error(j.msg||"gagal generate");
    currentEmail=j.email;
    document.getElementById('emailOutput').value=currentEmail;
    document.getElementById('emailResult').style.display='block';
    toast(`Email: ${currentEmail}`);
    const isGmail = currentEmail.endsWith('@gmail.com') || currentEmail.endsWith('@googlemail.com');
    if(isGmail){
      showEmailTerm({status:"success", email:currentEmail, domain:j.domain, user:j.user, note:"Ini Gmail asli — cek inbox di aplikasi Gmail (bukan di sini). Untuk cek di sini, pakai domain temp seperti codzy.net / nichaoxing.cc", domains:j.domains?.slice(0,5)},'success');
    }else{
      showEmailTerm({status:"success", email:currentEmail, domain:j.domain, user:j.user, domains:j.domains?.slice(0,5)},'success');
    }
    const ei2=document.getElementById('emailInput');
    if(ei2 && !ei2.value) ei2.value=currentEmail;
  }catch(e){
    toast('gagal generate email');
    showEmailTerm({status:"error", error:e.message},'error');
  }finally{ setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',false); }
}
window.handleGenEmail=handleGenEmail;

window.copyEmail=function(){
  const v=document.getElementById('emailOutput')?.value;
  if(!v) return;
  navigator.clipboard.writeText(v).then(()=>toast('copied: '+v)).catch(()=>{ const el=document.getElementById('emailOutput'); el.select(); document.execCommand('copy'); toast('copied'); });
}

async function handleCheckInbox(){
  if(!currentEmail) { const v=document.getElementById('emailOutput')?.value; if(v) currentEmail=v; }
  if(!currentEmail) { toast('generate email dulu'); showEmailTerm({status:"warning", msg:"generate email dulu"},'warning'); document.getElementById('alightBox').style.display='none'; return; }
  setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',true);
  showEmailTerm('Mengecek inbox '+currentEmail+'...','');
  document.getElementById('alightBox').style.display='none';
  try{
    const r=await fetch(`${API_BASE}/email?action=check&email=${encodeURIComponent(currentEmail)}`);
    const j=await r.json();
    if(j.result?.success){
      toast('ada '+j.result.numMess+' pesan');
      showEmailTerm(j,'success');
      updateAlightBox(j);
    }else{
      toast('inbox kosong');
      showEmailTerm(j,'warning');
      updateAlightBox(j);
    }
  }catch(e){
    toast('gagal cek inbox');
    showEmailTerm({status:"error", error:e.message},'error');
  }finally{ setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',false); }
}
window.handleCheckInbox=handleCheckInbox;

window.startAutoCheck=function(){
  const st=document.getElementById('autoStatus');
  if(autoInterval){
    clearInterval(autoInterval); autoInterval=null;
    if(st) st.textContent='idle'; toast('auto OFF'); return;
  }
  if(!currentEmail){ toast('generate email dulu'); return; }
  if(st) st.textContent='auto ON (5s)';
  toast('auto ON tiap 5 detik');
  autoInterval=setInterval(handleCheckInbox, 5000);
  handleCheckInbox();
}
