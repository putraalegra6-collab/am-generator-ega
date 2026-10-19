const API_BASE = '/api';
const ACCESS_KEY = 'Egaa';
const isReturn = document.documentElement.getAttribute('data-return') === '1';

// ================= NAVIGASI =================
function go(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + name);
  if (target) target.classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.toggle('on', b.dataset.go === name));
  hideTerm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-go]').forEach(el => {
  el.addEventListener('click', () => go(el.dataset.go));
});

if (location.hash) go(location.hash.replace('#page-', ''));

// ================= LOADING =================
const loader = document.getElementById('loader');
if (loader) {
  if (!isReturn) {
    const textEl = document.getElementById('loaderTyping');
    const barEl = document.getElementById('loaderBar');
    const texts = ['Initializing...', 'Connecting to API...', 'Loading modules...', 'Almost ready...'];
    let i = 0;
    setInterval(() => {
      if (textEl) textEl.textContent = texts[i];
      i = (i + 1) % texts.length;
    }, 500);
    setTimeout(() => { if (barEl) barEl.style.width = '100%'; }, 100);
    setTimeout(() => { loader.classList.add('done'); }, 2000);
  } else {
    loader.style.display = 'none';
  }
}

// ================= PARTIKEL =================
(function () {
  const cv = document.getElementById('fx');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let w, h, pts = [], color = 'rgba(255,255,255,.55)';
  const dpr = Math.min(devicePixelRatio || 1, 1.5);

  function resize() {
    w = cv.width = innerWidth * dpr;
    h = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  const N = innerWidth < 600 ? 14 : 22;
  for (let i = 0; i < N; i++) {
    pts.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.6 + 0.5,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .22
    });
  }

  let running = true, typing = false, rafId = null, last = 0;
  document.addEventListener('focusin', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) typing = true;
  });
  document.addEventListener('focusout', e => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) typing = false;
  });

  function tick(ts) {
    rafId = requestAnimationFrame(tick);
    if (!running || typing) return;
    if (ts - last < 33) return;
    last = ts;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
  rafId = requestAnimationFrame(tick);
})();

window.addEventListener('load', () => {
  document.querySelectorAll('.reveal').forEach(el => {
    if (!isReturn) {
      setTimeout(() => el.classList.add('in'), (el.style.getPropertyValue('--d').replace('s', '') || 0) * 1000);
    } else {
      el.classList.add('in');
    }
  });
});

// ================= TOAST & HELPER =================
let toastTimer = null;
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

function setLoading(btnId, loadId, textId, on) {
  const b = document.getElementById(btnId);
  const l = document.getElementById(loadId);
  const t = document.getElementById(textId);
  if (b) b.disabled = on;
  if (l) l.style.display = on ? 'inline-block' : 'none';
  if (t) t.style.opacity = on ? '.6' : '1';
}

function showTerm(msg, type) {
  const term = document.getElementById('term');
  const body = document.getElementById('termBody');
  if (!term || !body) return;
  body.className = 'term-body ' + (type || '');
  body.textContent = typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg;
  term.classList.add('show');
  body.scrollTop = 0;
}

function hideTerm() {
  const term = document.getElementById('term');
  if (term) term.classList.remove('show');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ================= ACCESS KEY =================
const keyModal = document.getElementById('keyModal');
const keyHint = document.getElementById('keyHint');
const keyErrorTop = document.getElementById('keyErrorTop');
let unlocked = false;
let pendingAction = null;

function setHint(json) {
  if (keyHint) keyHint.textContent = JSON.stringify(json, null, 2);
}

function showTopError(show) {
  if (!keyErrorTop) return;
  keyErrorTop.classList.toggle('show', !!show);
}

function openKeyModal(action) {
  pendingAction = action;
  showTopError(false);
  setHint({ status: 'pending', msg: 'masukkan key untuk melanjutkan' });
  const ki = document.getElementById('keyInput');
  if (ki) ki.value = '';
  if (keyModal) keyModal.classList.add('show');
  if (ki) setTimeout(() => ki.focus(), 100);
}

function closeKeyModal() {
  if (keyModal) keyModal.classList.remove('show');
  showTopError(false);
  setLoading('btnUnlock', 'loaderUnlock', 'btnUnlockText', false);
}

function handleUnlock() {
  const key = document.getElementById('keyInput').value.trim();
  if (!key) {
    setHint({ status: 'denied', code: 400, msg: 'key kosong' });
    toast('Key kosong');
    return;
  }
  setLoading('btnUnlock', 'loaderUnlock', 'btnUnlockText', true);
  setTimeout(() => {
    setLoading('btnUnlock', 'loaderUnlock', 'btnUnlockText', false);
    if (key === ACCESS_KEY) {
      unlocked = true;
      closeKeyModal();
      toast('Akses Diberikan!');
      if (pendingAction === 'verify') handleVerify();
      else handleSend();
    } else {
      showTopError(true);
      toast('Key Salah! Join Channel dulu.');
      document.getElementById('keyInput').value = '';
    }
  }, 600);
}

// ================= TABS =================
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.getElementById('tabSendBtn').classList.toggle('active', tab === 'send');
  document.getElementById('tabVerifyBtn').classList.toggle('active', tab === 'verify');
  document.getElementById('tab-send').classList.toggle('active', tab === 'send');
  document.getElementById('tab-verify').classList.toggle('active', tab === 'verify');
  hideTerm();
}

// ================= API AM (NOXXY) =================
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleSend() {
  const email = document.getElementById('emailInput').value.trim();
  if (!unlocked) { openKeyModal('send'); return; }
  if (!email || !emailRegex.test(email)) { toast('Email tidak valid!'); return; }

  hideTerm();
  setLoading('btnSend', 'loaderSend', 'btnSendText', true);
  toast('Mengirim link...');
  try {
    const res = await fetch(`${API_BASE}/send-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok || data?.ok === false) throw new Error(data?.msg || data?.error || 'Gagal kirim');
    toast('✅ Link terkirim!');
    showTerm({ status: 'success', msg: 'Link terkirim ke ' + email, data }, 'success');
  } catch (e) {
    toast('❌ Gagal: ' + e.message);
    showTerm({ status: 'error', msg: e.message }, 'error');
  } finally {
    setLoading('btnSend', 'loaderSend', 'btnSendText', false);
  }
}

async function handleVerify() {
  const email = document.getElementById('emailInput').value.trim();
  const link = document.getElementById('linkInput').value.trim();
  if (!unlocked) { openKeyModal('verify'); return; }
  if (!email || !link) { toast('Email & Link wajib diisi!'); return; }

  hideTerm();
  setLoading('btnVerify', 'loaderVerify', 'btnVerifyText', true);
  toast('Memvalidasi...');
  try {
    const res = await fetch(`${API_BASE}/verify-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, magicLink: link })
    });
    const data = await res.json();
    if (!res.ok || data?.ok === false) throw new Error(data?.msg || data?.error || 'Gagal validasi');
    toast('🎉 Aktivasi Berhasil!');
    showTerm({ status: 'success', msg: 'Akun berhasil di aktivasi!' }, 'success');
    showPremiumModal(data);
  } catch (e) {
    toast('❌ Gagal: ' + e.message);
    showTerm({ status: 'error', msg: e.message }, 'error');
  } finally {
    setLoading('btnVerify', 'loaderVerify', 'btnVerifyText', false);
  }
}

function showPremiumModal(data) {
  const modal = document.getElementById('premiumModal');
  const email = document.getElementById('emailInput')?.value || '-';
  const uid = data?.data?.uid || data?.uid || 'AM-' + Math.floor(Math.random() * 899999 + 100000);
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const dateStr = nextYear.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('pmEmail').textContent = email;
  document.getElementById('pmUid').textContent = uid;
  document.getElementById('pmPlan').textContent = 'Premium';
  document.getElementById('pmDate').textContent = dateStr;

  if (modal) modal.classList.add('show');
  try {
    new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000.wav').play().catch(() => {});
  } catch (e) {}
}

function closePremiumModal() {
  const m = document.getElementById('premiumModal');
  if (m) m.classList.remove('show');
}

// ==========================================
// TEMP MAIL (MAIL.GW API)
// ==========================================
let currentEmail = '';
let mailGwToken = '';
let autoInterval = null;
let mailDomains = [];

async function loadDomains() {
  try {
    const res = await fetch('https://api.mail.gw/domains?page=1');
    const data = await res.json();
    mailDomains = (data['hydra:member'] || []).map(d => d.domain);
    const sel = document.getElementById('emailDomain');
    if (sel && mailDomains.length) {
      sel.innerHTML = mailDomains.map(d => `<option value="${escapeHtml(d)}">@${escapeHtml(d)}</option>`).join('');
    }
  } catch (e) {
    toast('Gagal ambil domain: ' + e.message);
  }
}

async function createAccount(address, password) {
  const r = await fetch('https://api.mail.gw/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, password })
  });
  return r.ok;
}

async function handleGenEmail() {
  const userEl = document.getElementById('emailUser');
  const domainEl = document.getElementById('emailDomain');
  if (!userEl || !domainEl) {
    toast('ID input (emailUser / emailDomain) gak ketemu di HTML');
    return;
  }

  const raw = userEl.value.trim();
  const domain = domainEl.value || mailDomains[0];
  if (!domain) { toast('Domain belum kebaca, refresh halaman'); return; }

  const base = raw.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  if (raw && !base) { toast('Username cuma boleh huruf, angka, titik, strip'); return; }

  setLoading('btnGenEmail', 'loaderGenEmail', 'btnGenEmailText', true);
  try {
    const password = 'Password123!';
    let emailStr = '';

    if (base) {
      emailStr = `${base}@${domain}`;
      if (!await createAccount(emailStr, password)) {
        throw new Error(`"${base}" sudah dipakai, coba nama lain`);
      }
    } else {
      for (let i = 0; i < 5 && !emailStr; i++) {
        const cand = `${Math.random().toString(36).substring(2, 10)}@${domain}`;
        if (await createAccount(cand, password)) emailStr = cand;
      }
      if (!emailStr) throw new Error('Gagal bikin email random');
    }

    const loginRes = await fetch('https://api.mail.gw/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: emailStr, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) throw new Error('Login email gagal');

    mailGwToken = loginData.token;
    currentEmail = emailStr;
    document.getElementById('emailOutput').value = currentEmail;
    document.getElementById('emailResult').style.display = 'block';
    const ei2 = document.getElementById('emailInput');
    if (ei2) ei2.value = currentEmail;
    toast('Email dibuat: ' + currentEmail);
  } catch (e) {
    toast('Gagal buat email: ' + e.message);
  } finally {
    setLoading('btnGenEmail', 'loaderGenEmail', 'btnGenEmailText', false);
  }
}

function copyEmail() {
  const v = document.getElementById('emailOutput')?.value;
  if (!v) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(v)
      .then(() => toast('✅ Email di-copy!'))
      .catch(() => fallbackCopy(v));
  } else {
    fallbackCopy(v);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    toast('✅ Berhasil di-copy!');
  } catch (e) {
    toast('❌ Gagal copy');
  }
  document.body.removeChild(ta);
}

function openAlightApp(url) {
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (isAndroid) {
    toast('Membuka Alight Motion...');
    const cleanUrl = url.replace(/^https?:\/\//, '');
    const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.alightcreative.motion;end`;
    window.location.href = intentUrl;
    setTimeout(() => window.open(url, '_blank'), 1000);
  } else {
    window.open(url, '_blank');
  }
}

// ================= CEK INBOX =================
async function handleCheckInbox() {
  if (!currentEmail || !mailGwToken) { toast('Generate email dulu!'); return; }
  setLoading('btnCheckInbox', 'loaderCheckInbox', 'btnCheckInboxText', true);
  document.getElementById('inboxContainer').style.display = 'none';

  try {
    const res = await fetch('https://api.mail.gw/messages', {
      headers: { Authorization: `Bearer ${mailGwToken}` }
    });
    const data = await res.json();
    const messages = data['hydra:member'];

    if (messages && messages.length > 0) {
      toast('Mendownload isi pesan...');
      const fullEmails = [];
      for (const msg of messages) {
        const detailRes = await fetch(`https://api.mail.gw/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${mailGwToken}` }
        });
        const detail = await detailRes.json();
        fullEmails.push({
          subject: detail.subject,
          from: detail.from?.address,
          date: detail.createdAt,
          html: Array.isArray(detail.html) ? detail.html.join('') : detail.html,
          text: detail.text
        });
      }
      renderInboxUI(fullEmails);
    } else {
      toast('Inbox kosong. Tunggu 10 detik.');
      document.getElementById('inboxList').innerHTML = `
        <div style="text-align:center; padding:20px; color:var(--muted); font-size:.8rem; border:1px dashed var(--line); border-radius:12px;">
          Belum ada pesan masuk. Tunggu 10-30 detik.
        </div>`;
      document.getElementById('inboxContainer').style.display = 'block';
    }
  } catch (e) {
    toast('Gagal cek inbox: ' + e.message);
  } finally {
    setLoading('btnCheckInbox', 'loaderCheckInbox', 'btnCheckInboxText', false);
  }
}

// ================= EKSTRAK LINK =================
function decodeQP(s) {
  if (!s) return '';
  return s
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function decodeEntities(s) {
  const t = document.createElement('textarea');
  t.innerHTML = s;
  return t.value;
}

function extractLinksFromText(raw) {
  if (!raw) return [];
  const text = decodeEntities(decodeQP(raw));
  const matches = text.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  const clean = [...new Set(matches.map(u => u.replace(/[)\].,;]+$/, '')))];
  const verif = clean.filter(l => /alight|firebase|auth_action|verify|magic|oob/i.test(l));
  const rest = clean.filter(l => !verif.includes(l));
  return [...verif, ...rest];
}

// ================= RENDER INBOX =================
function renderInboxUI(emails) {
  const list = document.getElementById('inboxList');
  list.innerHTML = '';

  emails.forEach(m => {
    const links = extractLinksFromText((m.html || '') + '\n' + (m.text || ''));
    const timeStr = m.date ? new Date(m.date).toLocaleString('id-ID') : '-';

    let card = `
    <div style="background:rgba(255,255,255,.03); border:1px solid var(--line); border-radius:12px; overflow:hidden; margin-bottom:12px;">
      <div style="padding:12px 16px; border-bottom:1px solid var(--line); display:flex; gap:10px;">
        <div style="flex:1;">
          <div style="font-weight:800; font-size:.85rem; color:var(--fg);">${escapeHtml(m.subject || '(tanpa subjek)')}</div>
          <div style="font-size:.7rem; color:var(--muted); margin-top:4px;">Pengirim: ${escapeHtml(m.from || '-')}</div>
          <div style="font-size:.65rem; color:var(--muted);">Waktu: ${escapeHtml(timeStr)}</div>
        </div>
      </div>`;

    if (links.length) {
      card += `<div style="padding:12px 16px;">`;
      links.forEach(l => {
        const safe = escapeHtml(l);
        card += `
        <div style="background:rgba(0,0,0,.3); border:1px solid var(--line); border-radius:8px; padding:10px; margin-bottom:8px;">
          <div style="font-family:monospace; font-size:.65rem; color:var(--accent-2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:8px;">${safe}</div>
          <div style="display:flex; gap:6px;">
            <button type="button" data-act="copy" data-link="${safe}" style="flex:1; padding:8px; border-radius:6px; border:1px solid var(--line); background:transparent; color:var(--fg); font-size:.7rem; font-weight:700; cursor:pointer;">📋 Salin</button>
            <button type="button" data-act="open" data-link="${safe}" style="flex:1; padding:8px; border-radius:6px; border:1px solid var(--line); background:transparent; color:var(--fg); font-size:.7rem; font-weight:700; cursor:pointer;">🌐 Buka</button>
            <button type="button" data-act="use" data-link="${safe}" style="flex:1; padding:8px; border-radius:6px; border:none; background:var(--accent); color:#000; font-size:.7rem; font-weight:800; cursor:pointer;">⚡ Pakai</button>
          </div>
        </div>`;
      });
      card += `</div>`;
    } else {
      card += `
      <div style="padding:12px 16px; border-top:1px dashed var(--line);">
        <div style="font-size:.7rem; color:var(--muted); font-style:italic; margin-bottom:8px;">Link tidak ditemukan di email ini.</div>
        <button type="button" data-act="refresh" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--line); background:transparent; color:var(--fg); font-size:.75rem; font-weight:700; cursor:pointer;">🔄 Refresh Cek Inbox</button>
      </div>`;
    }

    card += `</div>`;
    list.innerHTML += card;
  });

  document.getElementById('inboxContainer').style.display = 'block';
}

// Event delegation: tombol di inbox ngirim aksi lewat data-act
document.getElementById('inboxList')?.addEventListener('click', e => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const link = b.dataset.link;
  switch (b.dataset.act) {
    case 'copy':    fallbackCopy(link); break;
    case 'open':    openAlightApp(link); break;
    case 'use':     validasiOtomatis(link, currentEmail); break;
    case 'refresh': handleCheckInbox(); break;
  }
});

window.validasiOtomatis = async function (link, email) {
  document.getElementById('emailInput').value = email;
  document.getElementById('linkInput').value = link;
  go('tool');
  switchTab('verify');
  setTimeout(() => handleVerify(), 500);
};

window.startAutoCheck = function () {
  const st = document.getElementById('autoStatus');
  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
    if (st) st.textContent = 'idle';
    toast('Auto OFF');
    return;
  }
  if (!currentEmail) { toast('Generate email dulu'); return; }
  if (st) st.textContent = 'auto ON (5s)';
  toast('Auto ON');
  autoInterval = setInterval(handleCheckInbox, 5000);
  handleCheckInbox();
};

// Ambil domain dari API pas halaman kebuka
loadDomains();
