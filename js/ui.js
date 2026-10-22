/* UI LAYER: tema (Mono / Liquid Glass) dan tampilan response log yang rapi.
   Dimuat setelah js/script.js. Tidak mengubah logika API. */
(function(){
  var root = document.documentElement;
  var KEY = 'am-theme';

  function label(t){
    var b = document.getElementById('themeBtn');
    if(!b) return;
    var s = b.querySelector('span');
    if(s) s.textContent = (t === 'glass') ? 'Liquid Glass' : 'Mono';
  }
  function setTheme(t){
    root.setAttribute('data-theme', t);
    label(t);
    try{ localStorage.setItem(KEY, t); }catch(e){}
  }
  label(root.getAttribute('data-theme') || 'mono');

  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('#themeBtn');
    if(!b) return;
    setTheme(root.getAttribute('data-theme') === 'glass' ? 'mono' : 'glass');
  });

  /* RESPONSE LOG: tampilkan kartu hasil, bukan JSON mentah */
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function parse(msg){
    if(typeof msg === 'string'){
      try{ return JSON.parse(msg); }catch(e){ return { msg: msg }; }
    }
    return msg || {};
  }
  var ICON_OK  = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>';
  var ICON_BAD = '<svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  window.showTerm = function(msg, type){
    var term = document.getElementById('term');
    var body = document.getElementById('termBody');
    if(!term || !body) return;

    var d = parse(msg);
    var ok = (type === 'success') || (d.status === 'success');
    var text = d.msg || (d.data && d.data.message) || '';
    var email = (d.data && d.data.email) || '';
    if(!email){
      var m = String(d.msg || '').match(/[^\s]+@[^\s]+/);
      if(m) email = m[0];
    }
    var info = (d.data && d.data.message && d.data.message !== text) ? d.data.message : '';

    body.className = 'term-body ' + (ok ? 'success' : 'error');
    body.innerHTML =
      '<div class="rl-card ' + (ok ? 'ok' : 'bad') + '">' +
        '<div class="rl-icon">' + (ok ? ICON_OK : ICON_BAD) + '</div>' +
        '<div class="rl-main">' +
          '<div class="rl-status">' + (ok ? 'Berhasil' : 'Gagal') + '</div>' +
          '<div class="rl-text">' + esc(text || (ok ? 'Permintaan berhasil diproses.' : 'Terjadi kesalahan.')) + '</div>' +
          (email ? '<div class="rl-email">' + esc(email) + '</div>' : '') +
          (info ? '<div class="rl-info">' + esc(info) + '</div>' : '') +
        '</div>' +
      '</div>';
    term.classList.add('show');
    body.scrollTop = 0;
  };
})();
