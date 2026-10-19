const API_BASE = '/api';
const MAIL_API = '/akunlama';
const ACCESS_KEY = 'Egaa'; 
const isReturn = document.documentElement.getAttribute('data-return')==='1';

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
    setInterval(()=>{ textEl.textContent = texts[i]; i = (i+1)%texts.length; }, 500);
    setTimeout(()=>{ barEl.style.width = "100%"; }, 100);
    setTimeout(()=>{ loader.classList.add('done'); }, 2000);
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
      unlocked=true;closeKeyModal();toast('Akses Diberikan!');
      if(pendingAction==='verify')handleVerify();else handleSend();
    } else {
      showTopError(true); toast('Key Salah! Join Channel dulu.');
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
  if(!email || !emailRegex.test(email)){toast('Email tidak valid!');return;}
  
  hideTerm(); setLoading('btnSend','loaderSend','btnSendText',true); toast('Mengirim link...');
  try{
    const res=await fetch(`${API_BASE}/send-link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data=await res.json();
    if(!res.ok || data?.ok===false) throw new Error(data?.msg || data?.error || 'Gagal kirim');
    toast('✅ Link terkirim!');
    showTerm(JSON.stringify({"status":"success","msg":"Link terkirim ke "+email,"data":data},null,2),'success');
  }catch(e){
    toast('❌ Gagal: ' + e.message);
    showTerm(JSON.stringify({"status":"error","msg":e.message},null,2),'error');
  }finally{ setLoading('btnSend','loaderSend','btnSendText',false); }
}

async function handleVerify(){
  const email=document.getElementById('emailInput').value.trim();
  const link=document.getElementById('linkInput').value.trim();
  if(!unlocked){openKeyModal('verify');return;}
  if(!email || !link){toast('Email & Link wajib diisi!');return;}
  
  hideTerm(); setLoading('btnVerify','loaderVerify','btnVerifyText',true); toast('Memvalidasi...');
  try{
    const res=await fetch(`${API_BASE}/verify-link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, magicLink: link }) });
    const data=await res.json();
    if(!res.ok || data?.ok===false) throw new Error(data?.msg || data?.error || 'Gagal validasi');
    toast('🎉 Aktivasi Berhasil!');
    showTerm(JSON.stringify({"status":"success","msg":"Akun berhasil di aktivasi!"},null,2),'success');
    showPremiumModal(data);
  }catch(e){
    toast('❌ Gagal: ' + e.message);
    showTerm(JSON.stringify({"status":"error","msg":e.message},null,2),'error');
  }finally{ setLoading('btnVerify','loaderVerify','btnVerifyText',false); }
}

function showPremiumModal(data) {
  const modal = document.getElementById('premiumModal');
  const email = document.getElementById('emailInput')?.value || "-";
  const uid = data?.data?.uid || data?.uid || "AM-" + Math.floor(Math.random() * 899999 + 100000);
  const nextYear = new Date(); nextYear.setFullYear(nextYear.getFullYear() + 1);
  const dateStr = nextYear.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('pmEmail').textContent = email;
  document.getElementById('pmUid').textContent = uid;
  document.getElementById('pmPlan').textContent = "Premium"; 
  document.getElementById('pmDate').textContent = dateStr;
  
  modal.classList.add('show');
  try { new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000.wav').play().catch(()=>{}); } catch(e){}
}
function closePremiumModal() { document.getElementById('premiumModal').classList.remove('show'); }

// ==========================================
// TEMP MAIL (AKUNLAMA.COM API, lewat proxy /akunlama)
// ==========================================
let currentEmail = "";
let autoInterval = null;

async function handleGenEmail(){
  const user = document.getElementById('emailUser')?.value?.trim();
  setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',true);
  
  try{
    let finalUser = user;
    if(!finalUser){
      finalUser = Math.random().toString(36).substring(2, 10);
    }
    
    const res = await fetch(`${MAIL_API}/list?recipient=${finalUser}`);
    if(!res.ok) throw new Error("Gagal konek ke server.");
    
    currentEmail = `${finalUser}@akunlama.com`;
    document.getElementById('emailOutput').value = currentEmail;
    document.getElementById('emailResult').style.display = 'block';
    
    toast(`Email dibuat!`);
    const ei2=document.getElementById('emailInput');
    if(ei2) ei2.value=currentEmail;
    
  }catch(e){
    toast('Gagal buat email: ' + e.message);
  }finally{ setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',false); }
}

function copyEmail(){
  const v=document.getElementById('emailOutput')?.value;
  if(!v) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(v).then(()=>toast('✅ Email di-copy!')).catch(()=>fallbackCopy(v));
  } else { fallbackCopy(v); }
}
function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast('✅ Link berhasil di-copy!'); } catch(e) { toast('❌ Gagal copy'); }
  document.body.removeChild(ta);
}

// FUNGSI BUKA LINK (Android: coba buka app Alight dulu, fallback ke browser)
function openAlightApp(url) {
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid) {
    toast('Membuka link...');
    const cleanUrl = url.replace(/^https?:\/\//, '').replace(/#.*$/, '');
    const fallback = encodeURIComponent(url);
    window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.alightcreative.motion;S.browser_fallback_url=${fallback};end`;
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

// CEK INBOX
const linkStore = [];

function escHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Decode Quoted-Printable (=3D, =20, soft line break =\n)
function decodeQP(s){
  return s.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

// Decode HTML entity (&lt;a href=&quot;...) jadi HTML asli, sampai tidak ada lagi
function decodeEntities(s){
  let out = s;
  for(let i = 0; i < 3 && /&(lt|gt|quot|amp|#39|#x27);/i.test(out); i++){
    const t = document.createElement('textarea');
    t.innerHTML = out;
    out = t.value;
  }
  return out;
}

// Normalisasi escape JSON (\/ \u0026 \u003d) supaya link di dalam JSON tetap terbaca
function decodeJsonEscapes(s){
  return s
    .replace(/\\\//g, '/')
    .replace(/\\u0026/gi, '&')
    .replace(/\\u003d/gi, '=')
    .replace(/\\u003c/gi, '<')
    .replace(/\\u003e/gi, '>');
}

// Bersihkan sisa karakter di ujung URL (mis. &quot; atau ")
function cleanUrl(u){
  return u
    .split(/&quot;|&gt;|&lt;|&#39;|"|'|<|>/)[0]
    .replace(/&amp;/gi, '&')
    .replace(/[.,;)\]]+$/, '');
}

// Ambil semua link verifikasi dari teks apa pun (HTML / QP / entity / JSON)
function extractLinksFromHtml(raw){
  if(!raw) return [];
  let src = typeof raw === 'string' ? raw : JSON.stringify(raw);
  src = decodeJsonEscapes(src);
  src = decodeEntities(src);
  if(/=3D|=20|=\r?\n/i.test(src)) src = decodeQP(src);
  src = decodeEntities(decodeJsonEscapes(src));

  const found = new Set();

  try{
    const doc = new DOMParser().parseFromString(src, 'text/html');
    doc.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if(h && /^https?:\/\//i.test(h)) found.add(cleanUrl(h));
    });
  }catch(e){ console.log('DOMParser gagal', e); }

  (src.match(/https?:\/\/[^\s"'<>\\]+/gi) || []).forEach(u => found.add(cleanUrl(u)));

  const all = [...found].filter(u => u.length > 12 && !/\.(png|jpe?g|gif|css|svg|webp|ico)(\?|$)/i.test(u));

  const verify = all.filter(u => /alight|firebaseapp|auth|verif|oobcode|mode=|magic|token|signin|confirm|activ/i.test(u));
  return [...new Set(verify.length ? verify : all)].slice(0, 5);
}

async function handleCheckInbox(){
  if(!currentEmail) { toast('Generate email dulu!'); return; }
  setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',true);
  try{
    const username = currentEmail.split('@')[0];
    const res = await fetch(`${MAIL_API}/list?recipient=${username}`);
    const data = await res.json();
    const messages = data.data || data.messages || (Array.isArray(data) ? data : []);

    if(messages && messages.length > 0){
      const fullEmails = [];
      for(const msg of messages){
        let html = typeof msg.message === 'string'
          ? msg.message
          : (msg.message ? JSON.stringify(msg.message) : '');
        let note = `preview ${html.length}`;

        const st = msg.storage;
        const key = (typeof st === 'string' ? st : (st && (st.key || st.id || st.storageKey))) || msg.storageKey || msg.key || msg.id || null;

        // 1. Ambil isi email lengkap lewat getHtml (via proxy)
        if(!extractLinksFromHtml(html).length && key){
          try{
            const r = await fetch(`${MAIL_API}/getHtml?region=us&key=${encodeURIComponent(key)}`);
            const t = await r.text();
            if(t) html += '\n' + t;
            note += ` | getHtml ${r.status} (${t.length})`;
          }catch(e){ note += ` | getHtml gagal: ${e.message}`; }
        }

        // 2. Cadangan: getKey (JSON)
        if(!extractLinksFromHtml(html).length && key){
          try{
            const r = await fetch(`${MAIL_API}/getKey?region=us&key=${encodeURIComponent(key)}`);
            const t = await r.text();
            if(t) html += '\n' + t;
            note += ` | getKey ${r.status} (${t.length})`;
          }catch(e){ note += ` | getKey gagal: ${e.message}`; }
        }

        if(!key) note += ' | storage kosong';

        fullEmails.push({
          subject: msg.subject || msg.title || 'Aktivasi Akun',
          from: msg.from || 'Alight Creative',
          date: msg.timestamp || msg.date || new Date().toISOString(),
          html,
          text: msg.preview || '',
          debug: note
        });
      }
      renderInboxUI(fullEmails);
    }else{
      document.getElementById('inboxList').innerHTML = `<div style="text-align:center; padding:20px; color:var(--muted); font-size:.8rem; border:1px dashed var(--line); border-radius:12px;">Belum ada pesan masuk. Tunggu 10-30 detik.</div>`;
      document.getElementById('inboxContainer').style.display = 'block';
      toast('Inbox kosong. Tunggu 10 detik.');
    }
  }catch(e){
    toast('Gagal cek inbox: ' + e.message);
  }finally{ setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',false); }
}

function renderInboxUI(emails) {
  const list = document.getElementById('inboxList');
  linkStore.length = 0;
  list.innerHTML = '';

  emails.forEach((m) => {
    const links = extractLinksFromHtml(m.html);
    if (links.length === 0 && m.text) links.push(...extractLinksFromHtml(m.text));
    const timeStr = m.date ? new Date(m.date).toLocaleTimeString() : '-';

    let card = `
    <div style="background:rgba(255,255,255,.03); border:1px solid var(--line); border-radius:12px; overflow:hidden; margin-bottom:12px; box-shadow:0 4px 12px rgba(0,0,0,0.2);">
      <div style="padding:12px 16px; border-bottom:1px solid var(--line); background:rgba(255,255,255,.02); display:flex; align-items:flex-start; gap:10px;">
        <div style="background:rgba(74,222,128,.1); padding:6px; border-radius:8px; color:var(--accent);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <div style="flex:1;">
          <div style="font-weight:800; font-size:.85rem; color:var(--fg); line-height:1.3;">${escHtml(m.subject)}</div>
          <div style="font-size:.7rem; color:var(--muted); margin-top:4px;">Pengirim: ${escHtml(m.from)}</div>
          <div style="font-size:.65rem; color:var(--muted);">Waktu: ${escHtml(timeStr)}</div>
        </div>
      </div>`;

    if(links.length > 0){
      card += `
      <div style="padding:12px 16px; border-top:1px dashed var(--line);">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
          <span style="color:var(--warn); font-size:.8rem;">⚡</span>
          <span style="font-size:.65rem; font-weight:800; color:var(--muted); letter-spacing:.1em;">LINK VERIFIKASI:</span>
        </div>`;
      links.forEach(link => {
        const idx = linkStore.push(link) - 1;
        card += `
        <div style="background:rgba(0,0,0,.3); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">
          <div style="font-family:monospace; font-size:.65rem; color:var(--accent-2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:8px;">${escHtml(link)}</div>
          <div style="display:flex; gap:6px;">
            <button data-act="copy" data-idx="${idx}" style="flex:1; padding:8px; border-radius:6px; border:1px solid var(--line); background:transparent; color:var(--fg); font-size:.7rem; font-weight:700; cursor:pointer;">📋 Salin</button>
            <button data-act="open" data-idx="${idx}" style="flex:1; padding:8px; border-radius:6px; border:1px solid var(--line); background:transparent; color:var(--fg); font-size:.7rem; font-weight:700; cursor:pointer;">🌐 Buka</button>
            <button data-act="use" data-idx="${idx}" style="flex:1; padding:8px; border-radius:6px; border:none; background:var(--accent); color:#000; font-size:.7rem; font-weight:800; cursor:pointer;">⚡ Pakai</button>
          </div>
        </div>`;
      });
      card += `</div>`;
    } else {
      card += `
      <div style="padding:12px 16px; border-top:1px dashed var(--line);">
        <div style="font-size:.7rem; color:var(--muted); font-style:italic; margin-bottom:8px;">Link tidak ditemukan. Coba klik Cek Inbox lagi.</div>
        <div style="font-size:.6rem; color:var(--accent-2); font-family:monospace; margin-bottom:8px; word-break:break-all;">DEBUG: ${escHtml(m.debug || '-')}</div>
        <button data-act="refresh" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--line); background:transparent; color:var(--fg); font-size:.75rem; font-weight:700; cursor:pointer;">🔄 Refresh Cek Inbox</button>
      </div>`;
    }
    card += `</div>`;
    list.innerHTML += card;
  });

  document.getElementById('inboxContainer').style.display = 'block';
  document.getElementById('inboxContainer').scrollIntoView({behavior:'smooth', block:'nearest'});
}

// Event delegation: tombol di kartu inbox, aman dari masalah quote di URL
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#inboxList button[data-act]');
  if(!btn) return;
  const act = btn.dataset.act;
  if(act === 'refresh'){ handleCheckInbox(); return; }
  const link = linkStore[Number(btn.dataset.idx)];
  if(!link) return;
  if(act === 'copy') copyText(link);
  if(act === 'open') openAlightApp(link);
  if(act === 'use') validasiOtomatis(link, currentEmail);
});

function copyText(text){
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text).then(()=>toast('✅ Link berhasil di-copy!')).catch(()=>fallbackCopy(text));
  } else { fallbackCopy(text); }
}

window.validasiOtomatis = async function(link, email) {
  document.getElementById('emailInput').value = email;
  document.getElementById('linkInput').value = link;
  go('tool');
  switchTab('verify');
  setTimeout(() => handleVerify(), 500); 
};

window.startAutoCheck=function(){
  const st=document.getElementById('autoStatus');
  if(autoInterval){ clearInterval(autoInterval); autoInterval=null; if(st) st.textContent='idle'; toast('Auto OFF'); return; }
  if(!currentEmail){ toast('Generate email dulu'); return; }
  if(st) st.textContent='auto ON (5s)';
  toast('Auto ON');
  autoInterval=setInterval(handleCheckInbox, 5000);
  handleCheckInbox();
};
