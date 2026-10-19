const API_BASE = '/api';
const ACCESS_KEY = 'Egaa'; // ✅ AMAN
const isReturn = document.documentElement.getAttribute('data-return')==='1';

// ===== SMOOTH TAB / PAGE =====
function go(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const target=document.getElementById('page-'+name);
  if(target) target.classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===name));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.querySelectorAll('[data-go]').forEach(el=>{
  el.addEventListener('click',()=>go(el.dataset.go));
});
if(location.hash) go(location.hash.replace('#page-',''));

// ===== LOADING SCREEN BARU =====
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

// ===== TOAST =====
let toastTimer=null;
function toast(msg){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.className='toast';t.id='toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2500);
}

// ===== SET LOADING =====
function setLoading(btnId,loadId,textId,on){
  const b=document.getElementById(btnId),l=document.getElementById(loadId),t=document.getElementById(textId);
  if(b)b.disabled=on; if(l)l.style.display=on?'inline-block':'none'; if(t)t.style.opacity=on?'.6':'1';
}

// ===== TERMINAL =====
function showTerm(msg,type){
  const term=document.getElementById('term'),body=document.getElementById('termBody');
  if(!term||!body)return; body.className='term-body '+(type||'');
  body.textContent=typeof msg==='object'?JSON.stringify(msg,null,2):msg;
  term.classList.add('show');body.scrollTop=0;
}
function hideTerm(){const term=document.getElementById('term');if(term)term.classList.remove('show');}

// ===== AKSES KEY MODAL =====
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

// ===== TAB TOOL =====
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.getElementById('tabSendBtn').classList.toggle('active',tab==='send');
  document.getElementById('tabVerifyBtn').classList.toggle('active',tab==='verify');
  document.getElementById('tab-send').classList.toggle('active',tab==='send');
  document.getElementById('tab-verify').classList.toggle('active',tab==='verify');
  hideTerm();
}

// ===== API AM (NOXXY) =====
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

// ===== MODAL PREMIUM SUKSES =====
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
// TEMP MAIL (TEMPMail.PLUS API)
// ==========================================
let currentEmail = "";

// 1. Tampilkan Domain Tempmail.plus
function loadEmailDomains() {
  const sel = document.getElementById('emailDomain');
  if(!sel) return;
  const domains = ['mailto.plus','fexpost.com','fexbox.org','mailbox.in.ua','rover.info','chitthi.in','fextemp.com','any.pink','merepost.com'];
  sel.innerHTML = domains.map(d => `<option value="${d}">@${d}</option>`).join('');
}
loadEmailDomains();

// 2. Generate Email
async function handleGenEmail(){
  const user = document.getElementById('emailUser')?.value?.trim();
  const domain = document.getElementById('emailDomain')?.value;
  
  setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',true);
  showEmailTerm('Membuat email sementara...','');
  
  // Bikin username random kalau kosong
  let finalUser = user;
  if(!finalUser){
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    finalUser = Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
  
  currentEmail = `${finalUser}@${domain}`;
  
  setTimeout(() => {
    document.getElementById('emailOutput').value = currentEmail;
    document.getElementById('emailResult').style.display = 'block';
    showEmailTerm(JSON.stringify({status:"success", email: currentEmail, note:"Gunakan email ini untuk tes."}, null, 2),'success');
    toast('Email berhasil dibuat!');
    setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',false);
  }, 800); // Delay dikit biar ada efek loading
}

function copyEmail(){
  const v=document.getElementById('emailOutput')?.value;
  if(!v) return;
  navigator.clipboard.writeText(v).then(()=>toast('Copied!')).catch(()=>{});
}

// 3. Cek Inbox & Validasi Otomatis
async function handleCheckInbox(){
  if(!currentEmail) { toast('Generate email dulu!'); return; }
  setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',true);
  showEmailTerm('Mengecek inbox...','');
  document.getElementById('alightBox').style.display='none';
  
  try {
    // API tempmail.plus
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
        mail_id: m.mail_id,
        bodyText: "Buka link di bawah untuk validasi."
      }));
      
      const formattedData = { result: { success: true, numMess: mails.length, mails: formattedMails } };
      showEmailTerm(JSON.stringify(formattedData, null, 2),'success');
      updateAlightBox(formattedData, currentEmail);
    } else {
      toast('Inbox kosong / belum masuk.');
      showEmailTerm(JSON.stringify({status:"warning", msg:"Belum ada pesan masuk. Tunggu 10-30 detik lalu cek lagi."},null,2),'warning');
    }
  } catch(e) {
    toast('Gagal cek inbox: ' + e.message);
    showEmailTerm(JSON.stringify({status:"error", msg:e.message},null,2),'error');
  } finally {
    setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',false);
  }
}

function showEmailTerm(msg,type){
  const term=document.getElementById('emailTerm'), body=document.getElementById('emailTermBody');
  if(!term||!body) return;
  body.className='term-body '+(type||'');
  body.textContent = typeof msg==='object'? JSON.stringify(msg,null,2) : msg;
  term.classList.add('show'); body.scrollTop=0;
}

// 4. Tampilkan Kotak Alight Link
function updateAlightBox(j, emailAddress) {
  const box=document.getElementById('alightBox'); const list=document.getElementById('alightList');
  if(!box||!list) return;
  
  let mails = j?.result?.mails || [];
  let alightLinks = mails.map((m, i) => ({ 
    link: `https://tempmail.plus/api/mails/${m.mail_id}?email=${emailAddress}&epin=`, 
    subj: m.subj, 
    time: m.time 
  }));
  
  if(!alightLinks.length) { box.style.display='none'; return; }
  
  document.getElementById('alightCount').textContent = alightLinks.length + ' link';
  window._viewData = alightLinks;
  
  renderInboxIdx(0); box.style.display='block';
}

function renderInboxIdx(idx) {
  const list=document.getElementById('alightList'); if(!list) return;
  const viewData = window._viewData || [];
  if(idx < 0) idx = viewData.length - 1;
  if(idx >= viewData.length) idx = 0;
  const item = viewData[idx];
  
  // Tombol ini akan buka link asli dari email, lu harus klik manual buat ambil link AM nya
  list.innerHTML = `<div style="padding:16px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.03);">
    <div style="font-size:.75rem;color:var(--accent);margin-bottom:8px">${item.subj || 'No Subject'}</div>
    <div style="font-size:.65rem;color:var(--muted);margin-bottom:12px">${item.time}</div>
    <a href="${item.link}" target="_blank" style="display:block;text-align:center;padding:12px;border-radius:10px;background:var(--fg);color:var(--bg-0);font-weight:800;text-decoration:none;font-size:.85rem">Buka Pesan & Salin Link</a>
  </div>`;
}

// Buka link langsung ke browser
window.bukaLinkPesan = function(url) {
  window.open(url, '_blank');
};
