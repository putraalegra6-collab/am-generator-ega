const API_BASE = '/api';
const ACCESS_KEY = 'Egaa'; // ✅ AMAN, GAK GW UBAH
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

// PARTIKEL & THEME
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

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme',theme);
  document.querySelectorAll('.theme-dot').forEach(d=>d.classList.toggle('on',d.dataset.theme===theme));
  const themeImg='img/avatar-'+theme+'.png';
  const av=document.getElementById('creatorAvatar'); if(av) av.src=themeImg;
  const navAv=document.getElementById('navAvatar'); if(navAv) navAv.src=themeImg;
  const loadAv=document.getElementById('loaderAvatar'); if(loadAv) loadAv.src=themeImg;
  try{localStorage.setItem('amTheme',theme);}catch(e){}
}
document.querySelectorAll('.theme-dot').forEach(dot=>{ dot.addEventListener('click',()=>applyTheme(dot.dataset.theme)); });
try{applyTheme(document.documentElement.getAttribute('data-theme')||'mono');}catch(e){}

window.addEventListener('load',()=>{ document.querySelectorAll('.reveal').forEach(el=>{ if(!isReturn){ setTimeout(()=>el.classList.add('in'),(el.style.getPropertyValue('--d').replace('s','')||0)*1000); }else{ el.classList.add('in'); } }); });

let toastTimer=null;
function toast(msg){
  let t=document.getElementById('toast');
  if(!t){t=document.createElement('div');t.className='toast';t.id='toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600);
}

// ACCESS KEY
const keyModal=document.getElementById('keyModal');
const keyHint=document.getElementById('keyHint');
const keyErrorTop=document.getElementById('keyErrorTop');
let unlocked=false; let pendingAction=null;
function setHint(json){if(keyHint)keyHint.textContent=JSON.stringify(json,null,2);}
function showTopError(show){ if(!keyErrorTop) return; if(show){ keyErrorTop.classList.add('show'); keyErrorTop.style.display='block'; } else { keyErrorTop.classList.remove('show'); keyErrorTop.style.display='none'; } }
function openKeyModal(action){
  pendingAction=action; showTopError(false); setHint({"status":"pending","msg":"masukkan key untuk melanjutkan"});
  const ki=document.getElementById('keyInput'); if(ki)ki.value='';
  keyModal.classList.add('show'); if(ki){requestAnimationFrame(()=>{ki.focus();});}
}
function closeKeyModal(){keyModal.classList.remove('show');showTopError(false);setLoading('btnUnlock','loaderUnlock','btnUnlockText',false);}
function handleUnlock(){
  const key=document.getElementById('keyInput').value.trim();
  if(!key){setHint({"status":"denied","code":400,"msg":"key kosong"});toast('{"code":400,"msg":"key kosong"}');return;}
  setLoading('btnUnlock','loaderUnlock','btnUnlockText',true);
  setTimeout(()=>{
    setLoading('btnUnlock','loaderUnlock','btnUnlockText',false);
    if(key===ACCESS_KEY){unlocked=true;closeKeyModal();toast('{"status":"ok","code":200,"access":"granted"}');if(pendingAction==='verify')handleVerify();else handleSend();}
    else{ showTopError(true); toast('masuk ch dulu bng — join channel dulu!'); document.getElementById('keyInput').value=''; }
  },600);
}
const keyInputEl=document.getElementById('keyInput');
if(keyInputEl)keyInputEl.addEventListener('keydown',e=>{if(e.key==='Enter')handleUnlock()});

// TABS & TERMINAL
function switchTab(tab){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  const ts=document.getElementById('tab-send'),tv=document.getElementById('tab-verify');
  if(ts)ts.classList.toggle('active',tab==='send'); if(tv)tv.classList.toggle('active',tab==='verify');
  const bs=document.getElementById('tabSendBtn'),bv=document.getElementById('tabVerifyBtn');
  if(bs)bs.classList.toggle('active',tab==='send'); if(bv)bv.classList.toggle('active',tab==='verify');
  hideTerm();
}
function showTerm(msg,type){
  const term=document.getElementById('term'),body=document.getElementById('termBody');
  if(!term||!body)return; body.className='term-body '+(type||'');
  body.textContent=typeof msg==='object'?JSON.stringify(msg,null,2):msg;
  term.classList.add('show');body.scrollTop=0;
}
function hideTerm(){const term=document.getElementById('term');if(term)term.classList.remove('show');}
function setLoading(btnId,loadId,textId,on){
  const b=document.getElementById(btnId),l=document.getElementById(loadId),t=document.getElementById(textId);
  if(b)b.disabled=on; if(l)l.style.display=on?'inline-block':'none'; if(t)t.style.opacity=on?'.6':'1';
}
const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==========================================
// MODAL PREMIUM SUKSES
// ==========================================
function showPremiumModal(data) {
  const modal = document.getElementById('premiumModal');
  if (!modal) return;

  const email = document.getElementById('emailInput')?.value || "user@gmail.com";
  const uid = data?.data?.uid || data?.uid || data?.user_id || "AM-" + Math.floor(Math.random() * 899999 + 100000);
  
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const dateStr = nextYear.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('pmEmail').textContent = email;
  document.getElementById('pmUid').textContent = uid;
  document.getElementById('pmDate').textContent = dateStr;
  
  modal.classList.add('show');
  
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000.wav');
    audio.volume = 0.5;
    audio.play().catch(()=>{});
  } catch(e){}
}
function closePremiumModal() {
  document.getElementById('premiumModal').classList.remove('show');
}

// ==========================================
// API AM (NOXXY)
// ==========================================
async function handleSend(){
  const email=document.getElementById('emailInput').value.trim();
  if(!unlocked){openKeyModal('send');return;}
  if(!email){showTerm(JSON.stringify({"status":"warning","msg":"email kosong"},null,2),'warning');toast('Email kosong');return;}
  if(!emailRegex.test(email)){showTerm(JSON.stringify({"status":"warning","msg":"format email salah"},null,2),'warning');toast('Email tidak valid');return;}
  
  hideTerm(); setLoading('btnSend','loaderSend','btnSendText',true); toast('Mengirim link...');
  try{
    const res=await fetch(`${API_BASE}/send-link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const data=await res.json();
    if(!res.ok || data?.ok===false){ throw new Error(data?.error || data?.msg || 'Gagal kirim'); }
    toast('✅ Link terkirim! Cek Inbox/Spam email lu.');
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
  if(!email){showTerm(JSON.stringify({"status":"warning","msg":"isi email dulu di tab kirim"},null,2),'warning');toast('Email kosong');return;}
  if(!link){showTerm(JSON.stringify({"status":"warning","msg":"link kosong"},null,2),'warning');toast('Link kosong');return;}
  if(!/^https?:\/\//i.test(link)){showTerm(JSON.stringify({"status":"warning","msg":"link harus http(s)"},null,2),'warning');toast('Link tidak valid');return;}
  
  hideTerm(); setLoading('btnVerify','loaderVerify','btnVerifyText',true); toast('Memvalidasi...');
  try{
    const res=await fetch(`${API_BASE}/verify-link`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, magicLink: link }) });
    const data=await res.json();
    
    if(!res.ok || data?.ok===false){ throw new Error(data?.error || data?.msg || 'Gagal validasi'); }
    
    toast('🎉 Aktivasi Berhasil!');
    showTerm(JSON.stringify({"status":"success","msg":"Akun berhasil di aktivasi!"},null,2),'success');
    showPremiumModal(data);
    
  }catch(e){
    toast('❌ Gagal: ' + e.message);
    showTerm(JSON.stringify({"status":"error","msg":e.message},null,2),'error');
  }finally{ setLoading('btnVerify','loaderVerify','btnVerifyText',false); }
}

const ei=document.getElementById('emailInput'),li=document.getElementById('linkInput');
if(ei)ei.addEventListener('keydown',e=>{if(e.key==='Enter')handleSend();});
if(li)li.addEventListener('keydown',e=>{if(e.key==='Enter')handleVerify();});

// ==========================================
// TEMP MAIL (API TEMP-MAIL.IO)
// ==========================================
let currentEmail = "";
let autoInterval = null;

async function handleGenEmail(){
  setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',true);
  showEmailTerm('Membuat email sementara...','');
  
  try{
    const res = await fetch('https://api.internal.temp-mail.io/api/v3/email/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Application-Name': 'web', 'Application-Version': '4.0.0' },
      body: JSON.stringify({ min_name_length: 10, max_name_length: 10 })
    });
    const data = await res.json();
    
    currentEmail = data.email;
    document.getElementById('emailOutput').value = currentEmail;
    document.getElementById('emailResult').style.display='block';
    
    toast(`Email dibuat!`);
    showEmailTerm(JSON.stringify({status:"success", email: currentEmail, note:"Gunakan email ini di menu Tool."}, null, 2),'success');
    
    const ei2=document.getElementById('emailInput');
    if(ei2) ei2.value=currentEmail;
    
  }catch(e){
    toast('Gagal buat email: ' + e.message);
    showEmailTerm(JSON.stringify({status:"error", msg:e.message},null,2),'error');
  }finally{ setLoading('btnGenEmail','loaderGenEmail','btnGenEmailText',false); }
}
window.handleGenEmail=handleGenEmail;

window.copyEmail=function(){
  const v=document.getElementById('emailOutput')?.value;
  if(!v) return;
  navigator.clipboard.writeText(v).then(()=>toast('Copied: '+v)).catch(()=>{});
}

async function handleCheckInbox(){
  if(!currentEmail) { toast('Generate email dulu!'); return; }
  setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',true);
  showEmailTerm('Mengecek inbox...','');
  document.getElementById('alightBox').style.display='none';
  
  try{
    const res = await fetch(`https://api.internal.temp-mail.io/api/v3/email/${currentEmail}/messages`, {
      headers: { 'Application-Name': 'web', 'Application-Version': '4.0.0' }
    });
    const messages = await res.json();
    
    if(messages && messages.length > 0){
      toast(`Ada ${messages.length} pesan!`);
      
      const formattedMails = messages.map(m => ({
        subj: m.subject,
        from: m.from,
        time: new Date(m.created_at).toLocaleTimeString(),
        bodyText: m.body_text,
        links: extractLinksFromText(m.body_text)
      }));
      
      const formattedData = { result: { success: true, numMess: messages.length, mails: formattedMails } };
      showEmailTerm(JSON.stringify(formattedData, null, 2),'success');
      updateAlightBox(formattedData);
    }else{
      toast('Inbox kosong.');
      showEmailTerm(JSON.stringify({status:"warning", msg:"Belum ada pesan masuk."},null,2),'warning');
    }
  }catch(e){
    toast('Gagal cek inbox: ' + e.message);
    showEmailTerm(JSON.stringify({status:"error", msg:e.message},null,2),'error');
  }finally{ setLoading('btnCheckInbox','loaderCheckInbox','btnCheckInboxText',false); }
}
window.handleCheckInbox=handleCheckInbox;

function extractLinksFromText(text) {
  if(!text) return [];
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  return text.match(urlRegex) || [];
}

function updateAlightBox(j) {
  const box=document.getElementById('alightBox'); const list=document.getElementById('alightList');
  const countEl=document.getElementById('alightCount');
  if(!box||!list) return;
  
  let mails = j?.result?.mails || [];
  let alightLinks = [];
  mails.forEach(m => {
    (m.links || []).forEach(l => alightLinks.push({ link: l, subj: m.subj, time: m.time, from: m.from, bodyText: m.bodyText }));
  });
  
  if(!alightLinks.length) { box.style.display='none'; return; }
  
  if(countEl) countEl.textContent = alightLinks.length + ' link';
  window._viewData = alightLinks;
  
  renderInboxIdx(0); box.style.display='block';
}

function renderInboxIdx(idx) {
  const list=document.getElementById('alightList'); if(!list) return;
  const viewData = window._viewData || [];
  if(idx < 0) idx = viewData.length - 1;
  if(idx >= viewData.length) idx = 0;
  const item = viewData[idx];
  list.innerHTML = `<div style="padding:12px;border:1px solid var(--line);border-radius:12px;background:rgba(0,0,0,.28)">
    <div style="font-size:.68rem;color:var(--accent);margin-bottom:5px">${item.subj || 'No Subject'}</div>
    <code style="display:block;padding:10px;background:rgba(0,0,0,.38);border:1px solid var(--line);border-radius:8px;font-size:.64rem;color:var(--accent-2);word-break:break-all;margin-bottom:10px">${item.link}</code>
    <button onclick="verifyAlightLinkIdx(${idx})" style="width:100%;padding:10px;border-radius:10px;border:none;background:var(--accent);color:#050505;font-weight:800;cursor:pointer">⚡ Validasi Otomatis</button>
  </div>`;
}

window.verifyAlightLinkIdx = async function(idx) {
  const item = (window._viewData || [])[idx];
  if(!item) return;
  document.getElementById('emailInput').value = currentEmail;
  document.getElementById('linkInput').value = item.link;
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

loadEmailDomains();
