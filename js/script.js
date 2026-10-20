const API_BASE = '/api';
const MAIL_API = '/akunlama';
const ACCESS_KEY = 'Egaa';
const isReturn = document.documentElement.getAttribute('data-return') === '1';

// ==========================================
// LAPISAN TAMPILAN (disuntik dari JS)
// ==========================================
function injectUI(){
  if(document.getElementById('am-ui')) return;
  const s = document.createElement('style');
  s.id = 'am-ui';
  s.textContent = `
    /* ---------- Gerak dasar ---------- */
    @keyframes amPageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes amFade{from{opacity:0}to{opacity:1}}
    @keyframes amPop{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
    html{scroll-behavior:smooth;}
    body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
    button,input,a{-webkit-tap-highlight-color:transparent;}

    .page{will-change:opacity,transform;}
    .page.active{animation:amPageIn .5s cubic-bezier(.2,.7,.2,1) both;}

    button{transition:transform .18s ease,background-color .3s ease,border-color .3s ease,color .3s ease,box-shadow .3s ease,opacity .3s ease;}
    button:active:not(:disabled){transform:scale(.97);}
    button:disabled{opacity:.5;cursor:not-allowed;}

    input,textarea{transition:border-color .3s ease,box-shadow .3s ease,background-color .3s ease;}
    input:focus,textarea:focus{outline:none;border-color:rgba(255,255,255,.45)!important;box-shadow:0 0 0 3px rgba(255,255,255,.07);}

    /* ---------- Bottom nav ---------- */
    .bottom-nav button{transition:color .3s ease,opacity .3s ease,transform .25s ease;}
    .bottom-nav button.on{transform:translateY(-2px);}

    /* ---------- Tab Tool / TempMail ---------- */
    .tab{transition:background-color .3s ease,color .3s ease,opacity .3s ease;}
    .tab.active{animation:amFade .35s ease both;}

    /* ---------- Kartu (hover halus di desktop) ---------- */
    @media (hover:hover){
      .page [class*="card"]{transition:transform .35s cubic-bezier(.2,.7,.2,1),border-color .35s ease,background-color .35s ease;}
      .page [class*="card"]:hover{transform:translateY(-3px);border-color:rgba(255,255,255,.18)!important;}
    }

    /* ---------- Loading screen ---------- */
    #loader{transition:opacity .8s ease,visibility .8s ease;}
    #loader.done{opacity:0;visibility:hidden;pointer-events:none;}
    #loaderBar{transition:width 1.8s cubic-bezier(.4,0,.2,1)!important;}
    #loaderTyping{letter-spacing:.16em;text-transform:uppercase;font-size:.7rem;}

    /* ---------- Toast ---------- */
    .toast{transition:opacity .35s ease,transform .35s cubic-bezier(.2,.7,.2,1);letter-spacing:.02em;}

    /* ---------- Modal ---------- */
    #keyModal.show,#premiumModal.show{animation:amFade .3s ease both;}
    #premiumModal.show .pm-card{animation:amPop .45s cubic-bezier(.2,.7,.2,1) both;}

    /* ---------- Inbox ---------- */
    .mail-list{display:flex;flex-direction:column;gap:12px;margin-top:4px;}
    .mail-item{border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.025);overflow:hidden;animation:amPop .4s cubic-bezier(.2,.7,.2,1) both;}
    .mail-item:nth-child(2){animation-delay:.06s;}
    .mail-item:nth-child(3){animation-delay:.12s;}
    .mail-head{padding:16px 16px 14px;display:flex;flex-direction:column;gap:6px;}
    .mail-from{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#8a8a8a);}
    .mail-subject{font-size:.92rem;font-weight:600;color:var(--fg,#fff);line-height:1.4;word-break:break-word;}
    .mail-meta{font-size:.68rem;color:var(--muted,#8a8a8a);}
    .mail-body{border-top:1px solid rgba(255,255,255,.06);padding:14px 16px 16px;}
    .mail-label{font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted,#8a8a8a);margin-bottom:10px;}
    .mail-link{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.7rem;color:var(--accent-2,#a7f3d0);background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:10px 12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .mail-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px;}
    .ib-btn{padding:10px 6px;border-radius:8px;border:1px solid rgba(255,255,255,.16);background:transparent;color:var(--fg,#fff);font-size:.72rem;font-weight:600;letter-spacing:.03em;cursor:pointer;}
    .ib-btn:hover{border-color:rgba(255,255,255,.4);}
    .ib-btn.primary{background:var(--fg,#fff);color:#000;border-color:transparent;}
    .ib-btn.primary:hover{opacity:.9;}
    .mail-empty{padding:18px 16px;border:1px dashed rgba(255,255,255,.12);border-radius:12px;font-size:.76rem;color:var(--muted,#8a8a8a);text-align:center;line-height:1.5;}
    .mail-debug{font-family:ui-monospace,monospace;font-size:.6rem;color:var(--muted,#8a8a8a);word-break:break-all;margin:0 0 10px;}
    .mail-retry{width:100%;padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.16);background:transparent;color:var(--fg,#fff);font-size:.72rem;font-weight:600;cursor:pointer;}
    .mail-retry:hover{border-color:rgba(255,255,255,.4);}

    /* ---------- Modal premium ---------- */
    #premiumModal .pm-card{width:min(92vw,380px);margin:auto;padding:28px 24px 22px;border-radius:16px;background:#0e0e0e;border:1px solid rgba(255,255,255,.1);box-shadow:0 20px 60px rgba(0,0,0,.5);color:#fff;}
    .pm-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;}
    .pm-tag{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:#a7f3d0;border:1px solid rgba(167,243,208,.3);padding:5px 9px;border-radius:999px;}
    .pm-close{background:transparent;border:none;color:var(--muted,#8a8a8a);font-size:.72rem;cursor:pointer;letter-spacing:.04em;}
    .pm-close:hover{color:#fff;}
    .pm-title{margin:0 0 6px;font-size:1.35rem;font-weight:700;letter-spacing:-.01em;}
    .pm-sub{margin:0 0 22px;font-size:.8rem;color:var(--muted,#8a8a8a);line-height:1.5;}
    .pm-list{margin:0;display:flex;flex-direction:column;border-top:1px solid rgba(255,255,255,.08);}
    .pm-row{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08);}
    .pm-row dt{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#8a8a8a);}
    .pm-row dd{margin:0;font-size:.8rem;color:#fff;text-align:right;word-break:break-all;font-family:ui-monospace,monospace;}
    .pm-done{width:100%;margin-top:22px;padding:13px;border-radius:10px;border:none;background:#fff;color:#000;font-size:.82rem;font-weight:700;letter-spacing:.04em;cursor:pointer;}
    .pm-done:hover{opacity:.92;}

    /* ---------- Hormati pengaturan "kurangi gerakan" ---------- */
    @media (prefers-reduced-motion:reduce){
      *{animation:none!important;transition:none!important;}
    }
  `;
  document.head.appendChild(s);
}
injectUI();

function go(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target=document.getElementById('page-'+name);
  if(target) target.classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===name));

  hideTerm();
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('[data-go]').forEach(el=>{
  el.addEventListener('click',()=>go(el.dataset.go));
});
if(location.hash) go(location.hash.replace('#page-',''));

// LOADING
const loader = document.getElementById('loader');
if(loader){
  if(!isReturn){
    const textEl = document.getElementById('loaderTyping');
    const barEl = document.getElementById('loaderBar');
    const texts = ["Initializing...", "Connecting to API...", "Loading modules...", "Almost ready..."];
    let i = 0;
    const typing = setInterval(()=>{ if(textEl){ textEl.textContent = texts[i]; i = (i+1)%texts.length; } }, 550);
    setTimeout(()=>{ if(barEl) barEl.style.width = "100%"; }, 100);
    setTimeout(()=>{ clearInterval(typing); loader.classList.add('done'); }, 2200);
  } else {
    loader.style.display = 'none';
  }
}

// PARTIKEL
(function(){
  const cv=document.getElementById('fx'); if(!cv) return;
  const ctx=cv.getContext('2d');let w,h,pts=[],color='rgba(255,255,255,.55)';
  const dpr = Math.min(devicePixelRatio||1, 1.5);
  function resize(){w=cv.width=innerWidth*dpr;h=cv.height=innerHeight*dpr;cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  resize();addEventListener('resize',resize,{passive:true});
  const N=innerWidth<600?14:22;
  for(let i=0;i<N;i++)pts.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.6+0.5,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22});
  let running=true, typing=false, rafId=null, last=0;
  document.addEventListener('focusin',e=>{if(e.target && (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))typing=true;});
  document.addEventListener('focusout',e=>{if(e.target && (e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))typing=false;});
  function tick(ts){ rafId=requestAnimationFrame(tick); if(!running || typing) return; if(ts-last<33) return; last=ts; ctx.clearRect(0,0,innerWidth,innerHeight); for(let i=0;i<pts.length;i++){ const p=pts[i]; p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>innerWidth)p.vx*=-1; if(p.y<0||p.y>innerHeight)p.vy*=-1; ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fillStyle=color;ctx.fill(); } }
  rafId=requestAnimationFrame(tick);
})();

window.addEventListener('load',()=>{ document.querySelectorAll('.reveal').forEach(el=>{ if(!isReturn){ setTimeout(()=>el.classList.add('in'),(el.style.getPropertyValue('--d').replace('s','')||0)*1000); }else{ el.classList.add('in'); } }); });

// TOAST & LOADING
let toastTimer=null;
function toast(msg){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.className='toast';t.id='toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2500);
}
function setLoading(btnId,loadId,textId,on){
  const b=document.getElementById(btnId),l=document.getElementById(loadId),t=document.getElementById(textId);
  if(b)b.disabled=on; if(l)l.style.display=on?'inline-block':'none'; if(t)t.style.opacity=on?'.6':'1';
}
function showTerm(msg,type){
  const term=document.getElementById('term'),body=document.getElementById('termBody');
  if(!term||!body)return; body.className='term-body '+(type||'');
  body.textContent=typeof msg==='object'?JSON.stringify(msg,null,2):msg;
  term.classList.add('show');body.scrollTop=0;
}
function hideTerm(){const term=document.getElementById('term');if(term)term.classList.remove('show');}

// ACCESS KEY
const keyModal=document.getElementById('keyModal');
const keyHint=document.getElementById('keyHint');
const keyErrorTop=document.getElementById('keyErrorTop');
let unlocked=false; let pendingAction=null;
function setHint(json){if(keyHint)keyHint.textContent=JSON.stringify(json,null,2);}
function showTopError(show){ if(!keyErrorTop) return; if(show){ keyErrorTop.classList.add('show'); } else { keyErrorTop.classList.remove('show'); } }
function openKeyModal(action){
  pendingAction=action; showTopError(false); setHint({"status":"pending","msg":"masukkan key untuk melanjutkan"});
  const ki=document.getElementById('keyInput'); if(ki)ki.value='';
  keyModal.classList.add('show'); if(ki){setTimeout(()=>ki.focus(), 100);}
}
function closeKeyModal(){keyModal.classList.remove('show');showTopError(false);setLoading('btnUnlock','loaderUnlock','btnUnlockText',false);}
function handleUnlock(){
  const key=document.getElementById('keyInput').value.trim();
  if(!key){setHint({"status":"denied","code":400,"msg":"key kosong"});toast('Key kosong');return;}
  setLoading('btnUnlock','loaderUnlock','btnUnlockText',true);
  setTimeout(()=>{
    setLoading('btnUnlock','loaderUnlock','btnUnlockText',false);
    if(key===ACCESS_KEY){
      unlocked=true;closeKeyModal();toast('Akses diberikan');
      if(pendingAction==='verify')handleVerify();else handleSend();
    } else {
      showTopError(true); toast('Key salah. Join channel dulu.');
      document.getElementById('keyInput').value='';
    }
  },600);
}

// TABS
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.getElementById('tabSendBtn').classList.toggle('active',tab==='send');
  document.getElementById('tabVerifyBtn').classList.toggle('active',tab==='verify');
  document.getElementById('tab-send').classList.toggle('active',tab==='send');
  document.getElementById('tab-verify').classList.toggle('active',tab==='verify');
  hideTerm();
}

// API AM (NOXXY)
const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
async function handleSend(){
  const email=document.getElementById('emailInput').value.trim();
  if(!unlocked){openKeyModal('send');return;}
  if(!email || !emailRegex.test(email)){toast('Email tidak valid');return;}

  hideTerm(); setLoading('btnSend','loaderSend','btnSendText',true); toast('Mengirim link...');
  try{
    const res=await fetch(`${API_BASE}/send-link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data=await res.json();
    if(!res.ok || data?.ok===false) throw new Error(data?.msg || data?.error || 'Gagal kirim');
    toast('Link terkirim');
    showTerm(JSON.stringify({"status":"success","msg":"Link terkirim ke "+email,"data":data},null,2),'success');
  }catch(e){
    toast('Gagal: ' + e.message);
    showTerm(JSON.stringify({"status":"error","msg":e.message},null,2),'error');
  }finally{ setLoading('btnSend','loaderSend','btnSendText',false); }
}

async function handleVerify(){
  const email=document.getElementById('emailInput').value.trim();
  const link=document.getElementById('linkInput').value.trim();
  if(!unlocked){openKeyModal('verify');return;}
  if(!email || !link){toast('Email dan link wajib diisi');return;}

  hideTerm(); setLoading('btnVerify','loaderVerify','btnVerifyText',true); toast('Memvalidasi...');
  try{
    const res=await fetch(`${API_BASE}/verify-link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, magicLink: link }) });
    const data=await res.json();
    if(!res.ok || data?.ok===false) throw new Error(data?.msg || data?.error || 'Gagal validasi');
    toast('Aktivasi berhasil');
    showTerm(JSON.stringify({"status":"success","msg":"Akun berhasil diaktivasi"},null,2),'success');
    showPremiumModal(data);
  }catch(e){
    toast('Gagal: ' + e.message);
    showTerm(JSON.stringify({"status":"error","msg":e.message},null,2),'error');
  }finally{ setLoading('btnVerify','loaderVerify','btnVerifyText',false); }
}

// MODAL BERHASIL PREMIUM (dirender ulang dari JS)
function showPremiumModal(data){
  const modal=document.getElementById('premiumModal');
  if(!modal) return;

  const email=document.getElementById('emailInput')?.value || '-';
  const uid=data?.data?.uid || data?.uid || 'AM-' + Math.floor(Math.random()*899999 + 100000);
  const nextYear=new Date(); nextYear.setFullYear(nextYear.getFullYear()+1);
  const dateStr=nextYear.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});

  modal.innerHTML = `
    <div class="pm-card">
      <div class="pm-top">
        <span class="pm-tag">Premium</span>
        <button type="button" class="pm-close" id="pmClose">Tutup</button>
      </div>
      <h2 class="pm-title">Aktivasi berhasil</h2>
      <p class="pm-sub">Akun kamu sudah aktif. Simpan detail di bawah ini.</p>
      <dl class="pm-list">
        <div class="pm-row"><dt>Email</dt><dd id="pmEmail"></dd></div>
        <div class="pm-row"><dt>UID</dt><dd id="pmUid"></dd></div>
        <div class="pm-row"><dt>Paket</dt><dd id="pmPlan"></dd></div>
        <div class="pm-row"><dt>Berlaku sampai</dt><dd id="pmDate"></dd></div>
      </dl>
      <button type="button" class="pm-done" id="pmDone">Selesai</button>
    </div>`;

  document.getElementById('pmEmail').textContent=email;
  document.getElementById('pmUid').textContent=uid;
  document.getElementById('pmPlan').textContent='Premium';
  document.getElementById('pmDate').textContent=dateStr;

  document.getElementById('pmClose').addEventListener('click', closePremiumModal);
  document.getElementById('pmDone').addEventListener('click', closePremiumModal);

  modal.classList.add('show');
  try{ new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000.wav').play().catch(()=>{}); }catch(e){}
}
function closePremiumModal(){ document.getElementById('premiumModal')?.classList.remove('show'); }

// ==========================================
// TEMP MAIL (AKUNLAMA.COM, lewat proxy /akunlama)
// ==========================================
let currentEmail="";
let autoInterval=null;

async function handleGenEmail(){
  const user=document.getElementById('emailUser')?.value?.trim();
  setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',true);

  try{
    let finalUser=user;
    if(!finalUser){
      finalUser=Math.random().toString(36).substring(2,10);
    }

    const res=await fetch(`${MAIL_API}/list?recipient=${finalUser}`);
    if(!res.ok) throw new Error('Gagal konek ke server');

    currentEmail=`${finalUser}@akunlama.com`;
    document.getElementById('emailOutput').value=currentEmail;
    document.getElementById('emailResult').style.display='block';

    toast('Email dibuat');
    const ei2=document.getElementById('emailInput');
    if(ei2) ei2.value=currentEmail;

  }catch(e){
    toast('Gagal membuat email: ' + e.message);
  }finally{ setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',false); }
}

function copyEmail(){
  const v=document.getElementById('emailOutput')?.value;
  if(!v) return;
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(v).then(()=>toast('Email disalin')).catch(()=>fallbackCopy(v));
  } else { fallbackCopy(v); }
}
function fallbackCopy(text){
  const ta=document.createElement('textarea');
  ta.value=text; ta.style.position='fixed'; ta.style.left='-9999px';
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); toast('Tersalin'); }catch(e){ toast('Gagal menyalin'); }
  document.body.removeChild(ta);
}

// BUKA LINK (Android: coba buka app Alight dulu, fallback ke browser)
function openAlightApp(url){
  const isAndroid=/Android/i.test(navigator.userAgent);
  if(isAndroid){
    toast('Membuka link...');
    const cleanUrl=url.replace(/^https?:\/\//,'').replace(/#.*$/,'');
    const fallback=encodeURIComponent(url);
    window.location.href=`intent://${cleanUrl}#Intent;scheme=https;package=com.alightcreative.motion;S.browser_fallback_url=${fallback};end`;
  } else {
    window.open(url,'_blank','noopener');
  }
}

// CEK INBOX
const linkStore=[];

function escHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function decodeQP(s){
  return s.replace(/=\r?\n/g,'').replace(/=([0-9A-Fa-f]{2})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
}

function decodeEntities(s){
  let out=s;
  for(let i=0;i<3 && /&(lt|gt|quot|amp|#39|#x27);/i.test(out);i++){
    const t=document.createElement('textarea');
    t.innerHTML=out;
    out=t.value;
  }
  return out;
}

function decodeJsonEscapes(s){
  return s
    .replace(/\\\//g,'/')
    .replace(/\\u0026/gi,'&')
    .replace(/\\u003d/gi,'=')
    .replace(/\\u003c/gi,'<')
    .replace(/\\u003e/gi,'>');
}

function cleanUrl(u){
  return u
    .split(/&quot;|&gt;|&lt;|&#39;|"|'|<|>/)[0]
    .replace(/&amp;/gi,'&')
    .replace(/[.,;)\]]+$/,'');
}

function extractLinksFromHtml(raw){
  if(!raw) return [];
  let src=typeof raw==='string' ? raw : JSON.stringify(raw);
  src=decodeJsonEscapes(src);
  src=decodeEntities(src);
  if(/=3D|=20|=\r?\n/i.test(src)) src=decodeQP(src);
  src=decodeEntities(decodeJsonEscapes(src));

  const found=new Set();

  try{
    const doc=new DOMParser().parseFromString(src,'text/html');
    doc.querySelectorAll('a[href]').forEach(a=>{
      const h=a.getAttribute('href');
      if(h && /^https?:\/\//i.test(h)) found.add(cleanUrl(h));
    });
  }catch(e){ console.log('DOMParser gagal', e); }

  (src.match(/https?:\/\/[^\s"'<>\\]+/gi) || []).forEach(u=>found.add(cleanUrl(u)));

  const all=[...found].filter(u=>u.length>12 && !/\.(png|jpe?g|gif|css|svg|webp|ico)(\?|$)/i.test(u));
  const verify=all.filter(u=>/alight|firebaseapp|auth|verif|oobcode|mode=|magic|token|signin|confirm|activ/i.test(u));
  return [...new Set(verify.length ? verify : all)].slice(0,5);
}

async function handleCheckInbox(){
  if(!currentEmail){ toast('Buat email dulu'); return; }
  setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',true);
  try{
    const username=currentEmail.split('@')[0];
    const res=await fetch(`${MAIL_API}/list?recipient=${username}`);
    const data=await res.json();
    const messages=data.data || data.messages || (Array.isArray(data) ? data : []);

    if(messages && messages.length>0){
      const fullEmails=[];
      for(const msg of messages){
        let html=typeof msg.message==='string'
          ? msg.message
          : (msg.message ? JSON.stringify(msg.message) : '');

        const st=msg.storage;
        const key=(typeof st==='string' ? st : (st && (st.key || st.id || st.storageKey))) || msg.storageKey || msg.key || msg.id || null;

        let note='';

        if(!extractLinksFromHtml(html).length && key){
          try{
            const r=await fetch(`${MAIL_API}/getHtml?region=us&key=${encodeURIComponent(key)}`);
            const t=await r.text();
            if(t) html+='\n'+t;
            note+=`getHtml ${r.status}`;
          }catch(e){ note+=`getHtml gagal: ${e.message}`; }
        }

        if(!extractLinksFromHtml(html).length && key){
          try{
            const r=await fetch(`${MAIL_API}/getKey?region=us&key=${encodeURIComponent(key)}`);
            const t=await r.text();
            if(t) html+='\n'+t;
            note+=` | getKey ${r.status}`;
          }catch(e){ note+=` | getKey gagal: ${e.message}`; }
        }

        fullEmails.push({
          subject: msg.message?.headers?.subject || msg.subject || msg.title || 'Tanpa subjek',
          from: msg.message?.headers?.from || msg.from || 'Tidak diketahui',
          date: msg.timestamp ? new Date(msg.timestamp*1000) : (msg.date || new Date()),
          html,
          text: msg.preview || '',
          debug: note || '-'
        });
      }
      renderInboxUI(fullEmails);
    }else{
      document.getElementById('inboxList').innerHTML=`<div class="mail-empty">Belum ada pesan masuk.<br>Tunggu 10 sampai 30 detik, lalu cek lagi.</div>`;
      document.getElementById('inboxContainer').style.display='block';
      toast('Inbox kosong');
    }
  }catch(e){
    toast('Gagal cek inbox: ' + e.message);
  }finally{ setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',false); }
}

function renderInboxUI(emails){
  const list=document.getElementById('inboxList');
  linkStore.length=0;
  list.innerHTML='';
  list.className='mail-list';

  emails.forEach(m=>{
    const links=extractLinksFromHtml(m.html);
    if(links.length===0 && m.text) links.push(...extractLinksFromHtml(m.text));
    const timeStr=m.date instanceof Date
      ? m.date.toLocaleString('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})
      : (m.date ? new Date(m.date).toLocaleString('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '-');

    let card=`
    <div class="mail-item">
      <div class="mail-head">
        <div class="mail-from">${escHtml(m.from)}</div>
        <div class="mail-subject">${escHtml(m.subject)}</div>
        <div class="mail-meta">${escHtml(timeStr)}</div>
      </div>`;

    if(links.length>0){
      card+=`<div class="mail-body"><div class="mail-label">Link verifikasi</div>`;
      links.forEach((link,i)=>{
        const idx=linkStore.push(link)-1;
        card+=`
        <div class="mail-link">${escHtml(link)}</div>
        <div class="mail-actions">
          <button type="button" class="ib-btn" data-act="copy" data-idx="${idx}">Salin</button>
          <button type="button" class="ib-btn" data-act="open" data-idx="${idx}">Buka</button>
          <button type="button" class="ib-btn primary" data-act="use" data-idx="${idx}">Pakai</button>
        </div>${i<links.length-1?'<div style="height:10px"></div>':''}`;
      });
      card+=`</div>`;
    } else {
      card+=`
      <div class="mail-body">
        <p class="mail-debug">${escHtml(m.debug)}</p>
        <div class="mail-label">Link verifikasi belum ditemukan</div>
        <button type="button" class="mail-retry" data-act="refresh">Refresh inbox</button>
      </div>`;
    }
    card+=`</div>`;
    list.innerHTML+=card;
  });

  document.getElementById('inboxContainer').style.display='block';
  document.getElementById('inboxContainer').scrollIntoView({behavior:'smooth',block:'nearest'});
}

// Event delegation untuk tombol di inbox
document.addEventListener('click',(e)=>{
  const btn=e.target.closest('#inboxList button[data-act]');
  if(!btn) return;
  const act=btn.dataset.act;
  if(act==='refresh'){ handleCheckInbox(); return; }
  const link=linkStore[Number(btn.dataset.idx)];
  if(!link) return;
  if(act==='copy') copyText(link);
  if(act==='open') openAlightApp(link);
  if(act==='use') validasiOtomatis(link,currentEmail);
});

function copyText(text){
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text).then(()=>toast('Link disalin')).catch(()=>fallbackCopy(text));
  } else { fallbackCopy(text); }
}

window.validasiOtomatis=async function(link,email){
  document.getElementById('emailInput').value=email;
  document.getElementById('linkInput').value=link;
  go('tool');
  switchTab('verify');
  setTimeout(()=>handleVerify(),500);
};

window.startAutoCheck=function(){
  const st=document.getElementById('autoStatus');
  if(autoInterval){ clearInterval(autoInterval); autoInterval=null; if(st) st.textContent='idle'; toast('Auto refresh mati'); return; }
  if(!currentEmail){ toast('Buat email dulu'); return; }
  if(st) st.textContent='auto aktif (5 detik)';
  toast('Auto refresh aktif');
  autoInterval=setInterval(handleCheckInbox,5000);
  handleCheckInbox();
};
