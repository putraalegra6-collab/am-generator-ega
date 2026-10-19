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
  document.getElementById('pmPlan').textContent = "Premium"; 
  document.getElementById('pmDate').textContent = dateStr;
  
  modal.classList.add('show');
  try { new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000.wav').play().catch(()=>{}); } catch(e){}
}
function closePremiumModal() { document.getElementById('premiumModal').classList.remove('show'); }

// ==========================================
// TEMP MAIL (TEMPMAIL.ING API)
// ==========================================
let currentEmail = "";
let autoInterval = null;

async function handleGenEmail(){
  setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',true);
  
  try{
    const res = await fetch('https://api.tempmail.ing/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: 10 })
    });
    const data = await res.json();
    
    let emailStr = "";
    if (typeof data.email === 'object' && data.email !== null) {
      emailStr = data.email.address;
    } else if (typeof data.email === 'string') {
      emailStr = data.email;
    }

    if(!emailStr) throw new Error("Gagal dapet email.");
    
    currentEmail = emailStr;
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
  try { document.execCommand('copy'); toast('✅ Email di-copy!'); } catch(e) { toast('❌ Gagal copy'); }
  document.body.removeChild(ta);
}

// ==========================================
// UI INBOX BARU (GANTIIN JSON)
// ==========================================
async function handleCheckInbox(){
  if(!currentEmail) { toast('Generate email dulu!'); return; }
  setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',true);
  
  document.getElementById('inboxContainer').style.display = 'none';
  document.getElementById('alightBox').style.display='none';
  
  try{
    const encodedEmail = encodeURIComponent(currentEmail);
    const res = await fetch(`https://api.tempmail.ing/api/emails/${encodedEmail}`);
    const data = await res.json();
    
    if(data && data.emails && data.emails.length > 0){
      toast(`Ada ${data.emails.length} pesan!`);
      renderInboxUI(data.emails);
    }else{
      toast('Inbox kosong.');
      const list = document.getElementById('inboxList');
      list.innerHTML = `<div style="text-align:center; padding:20px; color:var(--muted); font-size:.8rem; border:1px dashed var(--line); border-radius:12px;">Belum ada pesan masuk. Tunggu 10-30 detik.</div>`;
      document.getElementById('inboxContainer').style.display = 'block';
    }
  }catch(e){
    toast('Gagal cek inbox: ' + e.message);
  }finally{ setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',false); }
}

// FUNGSI RENDER UI INBOX (BUKAN JSON)
function renderInboxUI(emails) {
  const list = document.getElementById('inboxList');
  list.innerHTML = '';
  
  emails.forEach((m, i) => {
    const textBody = m.body_text || m.text || m.html || "";
    const links = extractLinksFromText(textBody);
    
    // Card UI persis kayak gambar
    let card = `
    <div style="background:rgba(255,255,255,.03); border:1px solid var(--line); border-radius:12px; overflow:hidden;">
      <div style="padding:12px 16px; border-bottom:1px solid var(--line); background:rgba(255,255,255,.02); display:flex; align-items:center; gap:8px;">
        <span style="font-size:1rem;">📩</span>
        <span style="font-weight:700; font-size:.8rem; color:var(--fg); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.subject || 'No Subject'}</span>
      </div>
      <div style="padding:12px 16px; font-size:.75rem; color:var(--muted); display:flex; flex-direction:column; gap:4px;">
        <div><b>Pengirim:</b> ${m.from}</div>
        <div><b>Waktu:</b> ${new Date(m.created_at || Date.now()).toLocaleTimeString()}</div>
      </div>`;
      
    if(links.length > 0) {
      card += `
      <div style="padding:12px 16px; border-top:1px dashed var(--line);">
        <div style="font-size:.65rem; font-weight:800; color:var(--accent); margin-bottom:8px;">LINK VERIFIKASI:</div>`;
        
      links.forEach(l => {
        card += `
        <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
          <input type="text" readonly value="${l}" style="flex:1 1 100%; background:rgba(0,0,0,.4); border:1px solid var(--line); border-radius:8px; padding:10px; color:var(--accent-2); font-size:.65rem; font-family:monospace; outline:none;">
          <button onclick="fallbackCopy('${l}')" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--line); background:transparent; color:var(--fg); font-size:.75rem; font-weight:700; cursor:pointer;">Salin</button>
          <button onclick="window.open('${l}', '_blank')" style="flex:1; padding:8px; border-radius:8px; border:1px solid var(--line); background:transparent; color:var(--fg); font-size:.75rem; font-weight:700; cursor:pointer;">Buka</button>
          <button onclick="validasiOtomatis('${l}', '${currentEmail}')" style="flex:1; padding:8px; border-radius:8px; border:none; background:var(--accent); color:#000; font-size:.75rem; font-weight:800; cursor:pointer;">Pakai</button>
        </div>`;
      });
      card += `</div>`;
    } else {
      card += `
      <div style="padding:12px 16px; border-top:1px dashed var(--line);">
        <div style="font-size:.7rem; color:var(--muted); font-style:italic; margin-bottom:8px;">Tidak ada link terdeteksi di body text.</div>
        <button onclick="window.open('https://tempmail.ing', '_blank')" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--line); background:transparent; color:var(--fg); font-size:.75rem; font-weight:700; cursor:pointer;">Lihat di Web TempMail</button>
      </div>`;
    }
    
    card += `</div>`;
    list.innerHTML += card;
  });
  
  document.getElementById('inboxContainer').style.display = 'block';
  document.getElementById('inboxContainer').scrollIntoView({behavior:'smooth', block:'nearest'});
}

function extractLinksFromText(text) {
  if(!text) return [];
  // Regex buat cari link
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  return text.match(urlRegex) || [];
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
