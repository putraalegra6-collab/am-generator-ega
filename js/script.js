const API_BASE = '/api';
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

// TOAST
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

// API AM
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
  document.getElementById('pmDate').textContent = dateStr;
  
  modal.classList.add('show');
  try { new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000.wav').play().catch(()=>{}); } catch(e){}
}
function closePremiumModal() { document.getElementById('premiumModal').classList.remove('show'); }

// ==========================================
// TEMP MAIL (TEMPMail.PLUS API - Fix 3 Tombol)
// ==========================================
let currentEmail = "";
let autoInterval = null;

async function handleGenEmail(){
  const user = document.getElementById('emailUser')?.value?.trim();
  const domain = document.getElementById('emailDomain')?.value || 'mailto.plus';
  setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',true);
  showEmailTerm('Membuat email sementara...','');
  
  // Bikin random string kalau user kosong
  let finalUser = user;
  if(!finalUser){
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    finalUser = Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  currentEmail = `${finalUser}@${domain}`;
  
  setTimeout(() => {
    document.getElementById('emailOutput').value = currentEmail;
    document.getElementById('emailResult').style.display = 'block';
    showEmailTerm(JSON.stringify({status:"success", email: currentEmail, note:"Email berhasil dibuat. Klik Cek Inbox untuk memantau."}, null, 2),'success');
    toast('Email berhasil dibuat!');
    setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',false);
  }, 800); 
}

function copyEmail(){
  const v=document.getElementById('emailOutput')?.value;
  if(!v) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(v).then(()=>toast('✅ Email di-copy!')).catch(()=>toast('❌ Gagal copy'));
  } else {
    const ta = document.createElement("textarea");
    ta.value = v; ta.style.position = "fixed"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('✅ Email di-copy!'); } catch(e) { toast('❌ Gagal copy'); }
    document.body.removeChild(ta);
  }
}

// FUNGSI CEK INBOX + 3 TOMBOL
async function handleCheckInbox(){
  if(!currentEmail) { toast('Generate email dulu!'); return; }
  setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',true);
  showEmailTerm('Mengecek inbox...','');
  document.getElementById('alightBox').style.display='none';
  
  try{
    const res = await fetch(`https://tempmail.plus/api/mails?email=${currentEmail}&limit=20`);
    const data = await res.json();
    
    if(data.result === false) throw new Error("Inbox belum siap / tidak ditemukan.");
    
    const mails = data.mail_list || [];
    
    if(mails.length > 0){
      toast(`Ada ${mails.length} pesan!`);
      
      const formattedMails = mails.map(m => ({
        subj: m.subject,
        from: m.from_mail,
        time: new Date(m.time).toLocaleTimeString(),
        mail_id: m.mail_id
      }));
      
      const formattedData = { result: { success: true, numMess: mails.length, mails: formattedMails } };
      showEmailTerm(JSON.stringify(formattedData, null, 2),'success');
      updateAlightBox(formattedData, currentEmail);
    }else{
      toast('Inbox kosong.');
      showEmailTerm(JSON.stringify({status:"warning", msg:"Belum ada pesan masuk. Tunggu 10-30 detik."},null,2),'warning');
    }
  }catch(e){
    toast('Gagal cek inbox: ' + e.message);
    showEmailTerm(JSON.stringify({status:"error", msg:e.message},null,2),'error');
  }finally{ setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',false); }
}

function showEmailTerm(msg,type){
  const term=document.getElementById('emailTerm'), body=document.getElementById('emailTermBody');
  if(!term||!body) return;
  body.className='term-body '+(type||'');
  body.textContent = typeof msg==='object'? JSON.stringify(msg,null,2) : msg;
  term.classList.add('show'); body.scrollTop=0;
}

// TAMPILAN KOTAK LINK DENGAN 3 TOMBOL
function updateAlightBox(j, emailAddress) {
  const box=document.getElementById('alightBox'); const list=document.getElementById('alightList');
  if(!box||!list) return;
  
  let mails = j?.result?.mails || [];
  let linksData = mails.map((m) => ({ 
    urlMail: `https://tempmail.plus/api/mails/${m.mail_id}?email=${emailAddress}&epin=`,
    subj: m.subj, 
    time: m.time 
  }));
  
  if(!linksData.length) { box.style.display='none'; return; }
  
  document.getElementById('alightCount').textContent = linksData.length + ' pesan';
  window._viewData = linksData;
  
  renderInboxIdx(0); box.style.display='block';
}

function renderInboxIdx(idx) {
  const list=document.getElementById('alightList'); if(!list) return;
  const viewData = window._viewData || [];
  if(idx < 0) idx = viewData.length - 1;
  if(idx >= viewData.length) idx = 0;
  const item = viewData[idx];
  
  // 3 TOMBOL: Salin (Link API), Buka (Web Asli), Validasi (Otomatis)
  list.innerHTML = `
  <div style="padding:16px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.03);">
    <div style="font-size:.75rem;color:var(--accent);margin-bottom:6px;font-weight:700;">${item.subj || 'No Subject'}</div>
    <div style="font-size:.65rem;color:var(--muted);margin-bottom:12px;">${item.time}</div>
    
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button onclick="copyLinkTxt('${item.urlMail}')" style="flex:1 1 100%;padding:10px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--fg);font-weight:700;font-size:.8rem;cursor:pointer;transition:0.3s;">📋 Salin Link</button>
      
      <button onclick="bukaDiChrome('${item.urlMail}')" style="flex:1;padding:10px;border-radius:8px;border:1px solid var(--accent);background:rgba(255,255,255,.1);color:var(--fg);font-weight:700;font-size:.8rem;cursor:pointer;transition:0.3s;">🌐 Buka</button>
      
      <button onclick="validasiOtomatis('${item.urlMail}', '${currentEmail}')" style="flex:1;padding:10px;border-radius:8px;border:none;background:var(--accent);color:#050505;font-weight:800;font-size:.8rem;cursor:pointer;transition:0.3s;">⚡ Validasi</button>
    </div>
  </div>`;
}

// FUNGSI SALIN LINK (Teks aja)
window.copyLinkTxt = function(url) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(()=>toast('✅ Link berhasil di-copy!')).catch(()=>toast('❌ Gagal copy'));
  } else {
    const ta = document.createElement("textarea");
    ta.value = url; ta.style.position = "fixed"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('✅ Link berhasil di-copy!'); } catch(e) { toast('❌ Gagal copy'); }
    document.body.removeChild(ta);
  }
};

// FUNGSI BUKA DI CHROME (Buka URL API mail untuk liat isi pesan)
window.bukaDiChrome = function(url) {
  window.open(url, '_blank');
};

// FUNGSI VALIDASI OTOMATIS (Kirim email & link ke API Noxxy)
window.validasiOtomatis = async function(urlMail, email) {
  // Pastiin input keisi
  document.getElementById('emailInput').value = email;
  document.getElementById('linkInput').value = urlMail; // Link API tempmail ini yg bakal divalidasi
  
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
