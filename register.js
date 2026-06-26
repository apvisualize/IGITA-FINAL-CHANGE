// ============================================================
// IGITA 2026 — REGISTRATION SYSTEM
// Validasi diperkuat: HP, Email, Instagram, Nama, File
// ============================================================
(function() {
  const overlay   = document.getElementById('reg-overlay');
  const modal     = document.getElementById('reg-modal');
  const closeBtn  = document.getElementById('reg-close-btn');
  const btnNext   = document.getElementById('btn-next');
  const btnBack   = document.getElementById('btn-back');
  const btnSubmit = document.getElementById('btn-submit');
  const regFooter = document.getElementById('reg-footer');
  const stepText  = document.getElementById('step-indicator-text');

  let currentStep = 1;
  const TOTAL_STEPS = 3;

  // ============================================================
  // ATURAN VALIDASI
  // ============================================================

  // No HP: wajib diawali 08, panjang 10-13 digit, hanya angka & strip
  function isValidHP(v) {
    const clean = v.replace(/[\s\-]/g, '');
    return /^08\d{8,11}$/.test(clean);
  }

  // Email: harus ada @ dan domain yang umum dipakai
  const VALID_EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'yahoo.co.id',
    'outlook.com', 'hotmail.com', 'live.com',
    'icloud.com', 'me.com',
    'kwikkiangie.ac.id', 'binus.ac.id',
    'student.kwikkiangie.ac.id',
  ];
  function isValidEmail(v) {
    const lower = v.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower)) return false;
    const domain = lower.split('@')[1];
    // Izinkan semua domain .ac.id dan .edu secara otomatis
    if (domain.endsWith('.ac.id') || domain.endsWith('.edu')) return true;
    return VALID_EMAIL_DOMAINS.includes(domain);
  }

  // Twibbon link: harus URL instagram yang valid (post/reel/foto)
  function isValidTwibbonLink(v) {
    const val = v.trim();
    return /^https?:\/\/(www\.)?instagram\.com\/.+/.test(val);
  }

  // Nama: min 3 karakter, hanya huruf & spasi (tidak boleh angka/simbol)
  function isValidNama(v) {
    return v.trim().length >= 3 && /^[a-zA-Z\s'.\-]+$/.test(v.trim());
  }

  // Nama Tim: min 3 karakter, bebas
  function isValidNamaTim(v) {
    return v.trim().length >= 3;
  }

  // File: jpg/png/pdf, max 2MB
  function isValidFile(file) {
    if (!file) return { ok: false, msg: 'Bukti pembayaran wajib diunggah.' };
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) return { ok: false, msg: 'Format file tidak valid. Gunakan JPG, PNG, atau PDF.' };
    if (file.size > 2 * 1024 * 1024) return { ok: false, msg: 'Ukuran file melebihi 2MB. Kompres atau pilih file lain.' };
    return { ok: true };
  }

  // ============================================================
  // PESAN ERROR DETAIL
  // ============================================================
  const ERR_MSG = {
    nama    : 'Nama harus min. 3 huruf, tidak boleh mengandung angka atau simbol.',
    email   : 'Email tidak valid. Gunakan Gmail, Yahoo, Outlook, atau email kampus.',
    hp      : 'No. HP harus diawali 08 dan terdiri dari 10–13 digit.',
    twibbon : 'Link twibbon tidak valid. Contoh: https://www.instagram.com/p/xxxxx',
    namaTim : 'Nama tim minimal 3 karakter.',
    institusi: 'Asal sekolah/institusi wajib diisi (min. 3 karakter).',
  };

  // ============================================================
  // HELPER FUNGSI
  // ============================================================
  function showErr(id, show, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('visible', show);
    if (show && msg) el.textContent = msg;
  }
  function setInputErr(id, hasErr) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('error', hasErr);
  }
  function setInputOk(id, isOk) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('valid', isOk);
  }


  // ============================================================
  // PREMIUM NOTIFICATION MODAL — replaces native alert()
  // ============================================================
  function showNotif({ type = 'info', title, message, code = null, onClose = null } = {}) {
    const CONFIGS = {
      warning: {
        color : '#f59e0b',
        glow  : 'rgba(245,158,11,0.22)',
        border: 'rgba(245,158,11,0.35)',
        label : '// PERINGATAN',
        icon  : `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      },
      error: {
        color : '#ef4444',
        glow  : 'rgba(239,68,68,0.22)',
        border: 'rgba(239,68,68,0.35)',
        label : '// ERROR',
        icon  : `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      },
      timeout: {
        color : '#00d4ff',
        glow  : 'rgba(0,212,255,0.22)',
        border: 'rgba(0,212,255,0.35)',
        label : '// PERHATIAN',
        icon  : `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      },
      info: {
        color : '#00d4ff',
        glow  : 'rgba(0,212,255,0.22)',
        border: 'rgba(0,212,255,0.35)',
        label : '// INFO',
        icon  : `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      },
    };
    const cfg = CONFIGS[type] || CONFIGS.info;

    // Build overlay once, reuse on repeat calls
    let overlay = document.getElementById('igita-notif-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'igita-notif-overlay';
      overlay.innerHTML = `
        <div class="igita-notif-modal" id="igita-notif-modal">
          <div class="notif-accent-bar"  id="notif-accent-bar"></div>
          <div class="notif-bg-grid"></div>
          <div class="notif-glow-orb"   id="notif-glow-orb"></div>
          <div class="notif-icon-ring"  id="notif-icon-ring">
            <span id="notif-icon-inner"></span>
          </div>
          <div class="notif-type-label" id="notif-type-label"></div>
          <div class="notif-title-el"   id="notif-title-el"></div>
          <div class="notif-message-el" id="notif-message-el"></div>
          <div class="notif-code-wrap"  id="notif-code-wrap">
            <div class="notif-code-label">// Kode Registrasi — Simpan dan hubungi panitia</div>
            <div class="notif-code-val" id="notif-code-val"></div>
          </div>
          <button class="notif-ok-btn"  id="notif-ok-btn">OK</button>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    const accentBar = document.getElementById('notif-accent-bar');
    const glowOrb   = document.getElementById('notif-glow-orb');
    const iconRing  = document.getElementById('notif-icon-ring');
    const iconInner = document.getElementById('notif-icon-inner');
    const typeLabel = document.getElementById('notif-type-label');
    const titleEl   = document.getElementById('notif-title-el');
    const msgEl     = document.getElementById('notif-message-el');
    const codeWrap  = document.getElementById('notif-code-wrap');
    const codeVal   = document.getElementById('notif-code-val');
    const okBtn     = document.getElementById('notif-ok-btn');

    accentBar.style.background = `linear-gradient(90deg, ${cfg.color} 0%, transparent 80%)`;
    glowOrb.style.background   = `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)`;
    iconRing.style.borderColor = cfg.border;
    iconRing.style.boxShadow   = `0 0 24px ${cfg.glow}, inset 0 0 14px ${cfg.glow}`;
    iconInner.style.color      = cfg.color;
    iconInner.innerHTML        = cfg.icon;
    typeLabel.textContent      = cfg.label;
    typeLabel.style.color      = cfg.color;
    titleEl.textContent        = title || '';
    msgEl.textContent          = message || '';
    okBtn.style.background     = `linear-gradient(135deg, ${cfg.glow}, rgba(0,0,0,0.2))`;
    okBtn.style.borderColor    = cfg.border;
    okBtn.style.boxShadow      = `0 0 18px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`;
    okBtn.style.color          = cfg.color;

    if (code) {
      codeWrap.style.display = 'block';
      codeVal.textContent    = code;
      codeVal.style.color    = cfg.color;
      codeVal.style.borderColor = cfg.border;
      codeVal.style.boxShadow   = `0 0 10px ${cfg.glow}`;
    } else {
      codeWrap.style.display = 'none';
    }

    okBtn.onclick = () => {
      overlay.classList.remove('open');
      if (typeof onClose === 'function') onClose();
    };

    // Trigger reflow for animation
    overlay.classList.remove('open');
    void overlay.offsetWidth;
    overlay.classList.add('open');
  }

  // ============================================================
  // AUTO-FORMAT INPUT SAAT USER MENGETIK
  // ============================================================

  // Auto-format HP: hanya izinkan angka dan awalan 08
  function setupHPInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      // Hapus semua kecuali angka
      let val = el.value.replace(/[^\d]/g, '');
      // Batasi maks 13 digit
      if (val.length > 13) val = val.slice(0, 13);
      el.value = val;
    });
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (val.length > 0 && !val.startsWith('08')) {
        showErr('err-' + id, true, 'No. HP harus diawali 08. Contoh: 081234567890');
        setInputErr(id, true);
        setInputOk(id, false);
      } else if (val.length > 0 && isValidHP(val)) {
        showErr('err-' + id, false);
        setInputErr(id, false);
        setInputOk(id, true);
      } else if (val.length > 0) {
        showErr('err-' + id, true, ERR_MSG.hp);
        setInputErr(id, true);
        setInputOk(id, false);
      }
    });
  }

  // Setup validasi real-time link twibbon (hanya untuk Ketua)
  function setupTwibbonInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('spellcheck', 'false');
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (val.length > 0) {
        const valid = isValidTwibbonLink(val);
        showErr('err-' + id, !valid, valid ? '' : ERR_MSG.twibbon);
        setInputErr(id, !valid);
        setInputOk(id, valid);
      }
    });
  }

  // Real-time email feedback
  function setupEmailInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('autocapitalize', 'off');
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (val.length > 0) {
        const valid = isValidEmail(val);
        showErr('err-' + id, !valid, valid ? '' : ERR_MSG.email);
        setInputErr(id, !valid);
        setInputOk(id, valid);
      }
    });
  }

  // Real-time nama feedback
  function setupNamaInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (val.length > 0) {
        const valid = isValidNama(val);
        showErr('err-' + id, !valid, valid ? '' : ERR_MSG.nama);
        setInputErr(id, !valid);
        setInputOk(id, valid);
      }
    });
  }

  // Inisialisasi semua real-time input setup
  function initInputSetup() {
    // Ketua: nama, email, HP, twibbon
    setupNamaInput('m1-nama');
    setupEmailInput('m1-email');
    setupHPInput('m1-hp');
    setupTwibbonInput('m1-twibbon');
    // Wakil: nama, email, HP (tanpa twibbon)
    setupNamaInput('m2-nama');
    setupEmailInput('m2-email');
    setupHPInput('m2-hp');
    // Anggota 3-4: hanya nama
    for (let i = 3; i <= 4; i++) {
      setupNamaInput(`m${i}-nama`);
    }
  }

  // ============================================================
  // CATEGORY CARD SELECTION — with animated SVG checkmark
  // ============================================================

  // Inject SVG + pulse ring into every .cat-check on load
  (function injectCheckSVGs() {
    document.querySelectorAll('.cat-check').forEach(el => {
      if (el.querySelector('.cat-check-svg')) return;
      const ring = document.createElement('span');
      ring.className = 'cat-check-ring';
      Object.assign(ring.style, {
        position: 'absolute', inset: '-6px', borderRadius: '50%',
        border: '1.5px solid rgba(0,212,255,0.45)', pointerEvents: 'none',
      });
      el.insertBefore(ring, el.firstChild);
      el.insertAdjacentHTML('beforeend',
        `<svg class="cat-check-svg" viewBox="0 0 14 14" width="14" height="14"
             xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
           <polyline class="cat-check-path"
             points="2,7 5.5,10.5 12,3"
             stroke="#fff" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" fill="none"/>
         </svg>`
      );
    });
  })();

  // Replay draw animation on each selection
  function replayCheckAnim(card) {
    const path  = card.querySelector('.cat-check-path');
    const ring  = card.querySelector('.cat-check-ring');
    const check = card.querySelector('.cat-check');
    [path, check, ring].forEach(el => {
      if (!el) return;
      el.style.animation = 'none';
      if (el === path) el.style.opacity = '0';
      void el.offsetWidth;
      el.style.animation = '';
      if (el === path) el.style.opacity = '';
    });
  }

  document.querySelectorAll('.cat-select-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.cat-select-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      replayCheckAnim(card);
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        const rowInst = document.getElementById('row-asal-institusi');
        const jurusanRows = document.querySelectorAll('.jurusan-row');
        if (radio.value === 'internal') {
          if (rowInst) { rowInst.style.display = 'none'; setInputErr('asal-institusi', false); showErr('err-asal-institusi', false); }
          jurusanRows.forEach(r => r.style.display = '');
        } else {
          if (rowInst) rowInst.style.display = '';
          jurusanRows.forEach(r => r.style.display = 'none');
          // Clear jurusan errors when switching to external
          for (let i = 1; i <= 4; i++) {
            setInputErr(`m${i}-jurusan`, false);
            showErr(`err-m${i}-jurusan`, false);
          }
        }
      }
    });
  });

  // ============================================================
  // VALIDASI PER STEP
  // ============================================================
  function validateStep1() {
    let ok = true;

    const kat = document.querySelector('input[name="kategori"]:checked');
    showErr('err-kategori', !kat);
    if (!kat) ok = false;

    const namaTimVal = document.getElementById('nama-tim').value.trim();
    const badNamaTim = !isValidNamaTim(namaTimVal);
    setInputErr('nama-tim', badNamaTim);
    setInputOk('nama-tim', !badNamaTim && namaTimVal.length > 0);
    showErr('err-nama-tim', badNamaTim, badNamaTim ? ERR_MSG.namaTim : '');
    if (badNamaTim) ok = false;

    if (kat && kat.value === 'external') {
      const instVal = document.getElementById('asal-institusi').value.trim();
      const badInst = instVal.length < 3;
      setInputErr('asal-institusi', badInst);
      setInputOk('asal-institusi', !badInst);
      showErr('err-asal-institusi', badInst, badInst ? ERR_MSG.institusi : '');
      if (badInst) ok = false;
    } else {
      setInputErr('asal-institusi', false);
      showErr('err-asal-institusi', false);
    }

    return ok;
  }

  function validateStep2() {
    let ok = true;
    let firstErrEl = null;

    const kat = document.querySelector('input[name="kategori"]:checked')?.value;
    const isInternal = kat === 'internal';

    // --- Anggota 1 (Ketua): nama, email, HP, twibbon link ---
    {
      const i = 1;
      const namId     = 'm1-nama';
      const emId      = 'm1-email';
      const hpId      = 'm1-hp';
      const twibbonId = 'm1-twibbon';

      const namVal     = document.getElementById(namId)?.value.trim() || '';
      const emVal      = document.getElementById(emId)?.value.trim()  || '';
      const hpVal      = document.getElementById(hpId)?.value.trim()  || '';
      const twibbonVal = document.getElementById(twibbonId)?.value.trim() || '';

      const badNam = !isValidNama(namVal);
      setInputErr(namId, badNam); setInputOk(namId, !badNam);
      showErr(`err-${namId}`, badNam, badNam ? ERR_MSG.nama : '');
      if (badNam) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(namId); }

      const badEm = !isValidEmail(emVal);
      setInputErr(emId, badEm); setInputOk(emId, !badEm);
      showErr(`err-${emId}`, badEm, badEm ? ERR_MSG.email : '');
      if (badEm) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(emId); }

      const badHp = !isValidHP(hpVal);
      setInputErr(hpId, badHp); setInputOk(hpId, !badHp);
      showErr(`err-${hpId}`, badHp, badHp ? ERR_MSG.hp : '');
      if (badHp) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(hpId); }

      const badTwibbon = !isValidTwibbonLink(twibbonVal);
      setInputErr(twibbonId, badTwibbon); setInputOk(twibbonId, !badTwibbon);
      showErr(`err-${twibbonId}`, badTwibbon, badTwibbon ? ERR_MSG.twibbon : '');
      if (badTwibbon) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(twibbonId); }

      // Jurusan — wajib jika internal
      if (isInternal) {
        const jurId  = `m${i}-jurusan`;
        const jurVal = document.getElementById(jurId)?.value.trim() || '';
        const badJur = jurVal.length < 3;
        setInputErr(jurId, badJur); setInputOk(jurId, !badJur);
        showErr(`err-${jurId}`, badJur, badJur ? 'Jurusan wajib diisi (min. 3 karakter).' : '');
        if (badJur) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(jurId); }
      }
    }

    // --- Anggota 2 (Wakil): nama, email, HP (tanpa twibbon) ---
    {
      const i = 2;
      const namId = 'm2-nama';
      const emId  = 'm2-email';
      const hpId  = 'm2-hp';

      const namVal = document.getElementById(namId)?.value.trim() || '';
      const emVal  = document.getElementById(emId)?.value.trim()  || '';
      const hpVal  = document.getElementById(hpId)?.value.trim()  || '';

      const badNam = !isValidNama(namVal);
      setInputErr(namId, badNam); setInputOk(namId, !badNam);
      showErr(`err-${namId}`, badNam, badNam ? ERR_MSG.nama : '');
      if (badNam) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(namId); }

      const badEm = !isValidEmail(emVal);
      setInputErr(emId, badEm); setInputOk(emId, !badEm);
      showErr(`err-${emId}`, badEm, badEm ? ERR_MSG.email : '');
      if (badEm) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(emId); }

      const badHp = !isValidHP(hpVal);
      setInputErr(hpId, badHp); setInputOk(hpId, !badHp);
      showErr(`err-${hpId}`, badHp, badHp ? ERR_MSG.hp : '');
      if (badHp) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(hpId); }

      // Jurusan — wajib jika internal
      if (isInternal) {
        const jurId  = `m${i}-jurusan`;
        const jurVal = document.getElementById(jurId)?.value.trim() || '';
        const badJur = jurVal.length < 3;
        setInputErr(jurId, badJur); setInputOk(jurId, !badJur);
        showErr(`err-${jurId}`, badJur, badJur ? 'Jurusan wajib diisi (min. 3 karakter).' : '');
        if (badJur) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(jurId); }
      }
    }

    // --- Anggota 3: wajib nama saja ---
    {
      const namId = 'm3-nama';
      const namVal = document.getElementById(namId)?.value.trim() || '';

      const badNam = !isValidNama(namVal);
      setInputErr(namId, badNam); setInputOk(namId, !badNam);
      showErr(`err-${namId}`, badNam, badNam ? ERR_MSG.nama : '');
      if (badNam) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(namId); }

      // Jurusan — wajib jika internal
      if (isInternal) {
        const jurId  = 'm3-jurusan';
        const jurVal = document.getElementById(jurId)?.value.trim() || '';
        const badJur = jurVal.length < 3;
        setInputErr(jurId, badJur); setInputOk(jurId, !badJur);
        showErr(`err-${jurId}`, badJur, badJur ? 'Jurusan wajib diisi (min. 3 karakter).' : '');
        if (badJur) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(jurId); }
      }
    }

    // --- Anggota 4: opsional — skip jika kosong, validasi jika nama diisi ---
    {
      const namId = 'm4-nama';
      const namVal = document.getElementById(namId)?.value.trim() || '';

      if (namVal) {
        const badNam = !isValidNama(namVal);
        setInputErr(namId, badNam); setInputOk(namId, !badNam);
        showErr(`err-${namId}`, badNam, badNam ? ERR_MSG.nama : '');
        if (badNam) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(namId); }

        // Jurusan — wajib jika internal dan nama diisi
        if (isInternal) {
          const jurId  = 'm4-jurusan';
          const jurVal = document.getElementById(jurId)?.value.trim() || '';
          const badJur = jurVal.length < 3;
          setInputErr(jurId, badJur); setInputOk(jurId, !badJur);
          showErr(`err-${jurId}`, badJur, badJur ? 'Jurusan wajib diisi jika nama diisi.' : '');
          if (badJur) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(jurId); }
        }
      } else {
        setInputErr(namId, false); setInputOk(namId, false); showErr(`err-${namId}`, false);
        setInputErr('m4-jurusan', false); showErr('err-m4-jurusan', false);
      }
    }

    // ---- Cek duplikat email (Ketua & Wakil saja) ----
    let firstDupEl = null;
    const emailVals = [1, 2].map(i => ({ id: i, val: document.getElementById(`m${i}-email`)?.value.trim().toLowerCase() || '' })).filter(e => e.val);
    emailVals.forEach((a, i) => emailVals.forEach((b, j) => {
      if (i !== j && a.val === b.val) {
        const id = `m${a.id}-email`;
        setInputErr(id, true); setInputOk(id, false);
        showErr(`err-${id}`, true, `Email sama dengan Anggota ${b.id}. Pakai email berbeda.`);
        ok = false; if (!firstDupEl) firstDupEl = document.getElementById(id);
      }
    }));

    // ---- Cek duplikat HP (Ketua & Wakil saja) ----
    const hpVals = [1, 2].map(i => ({ id: i, val: document.getElementById(`m${i}-hp`)?.value.trim().replace(/[\s\-]/g, '') || '' })).filter(h => h.val);
    hpVals.forEach((a, i) => hpVals.forEach((b, j) => {
      if (i !== j && a.val === b.val) {
        const id = `m${a.id}-hp`;
        setInputErr(id, true); setInputOk(id, false);
        showErr(`err-${id}`, true, `No. HP sama dengan Anggota ${b.id}. Pakai nomor berbeda.`);
        ok = false; if (!firstDupEl) firstDupEl = document.getElementById(id);
      }
    }));

    const scrollTarget = firstDupEl || firstErrEl;
    if (scrollTarget) { scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' }); scrollTarget.focus(); }

    return ok;
  }

  function validateStep4() {
    let ok = true;

    // Bukti bayar (image)
    const buktiInput = document.getElementById('bukti-bayar');
    const buktiFile  = buktiInput?.files[0];
    const hasBukti   = buktiFile && buktiFile.size > 0 && buktiFile.size <= 5 * 1024 * 1024;
    setInputErr('bukti-bayar', !hasBukti);
    showErr('err-bukti-bayar', !hasBukti, !hasBukti
      ? (buktiFile && buktiFile.size > 5 * 1024 * 1024
          ? 'Ukuran file terlalu besar. Maks. 5MB.'
          : 'Screenshot bukti pembayaran wajib diunggah.')
      : '');
    if (!hasBukti) ok = false;

    const agreed = document.getElementById('agree-check').checked;
    showErr('err-agree', !agreed);
    document.getElementById('agree-wrap').style.borderColor = agreed ? '' : 'rgba(255,80,80,0.4)';
    if (!agreed) ok = false;

    return ok;
  }

  // ============================================================
  // STEP SVG INJECTION — animated checkmark for done steps
  // ============================================================
  const STEP_CHECK_SVG = `
    <svg class="step-done-svg" viewBox="0 0 14 14" width="13" height="13"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <polyline class="step-done-path"
        points="2,7 5.5,10.5 12,3"
        stroke="#fff" stroke-width="2.6"
        stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`;

  function injectStepSVGs() {
    document.querySelectorAll('.step-num').forEach(el => {
      if (!el.querySelector('.step-done-svg')) {
        el.insertAdjacentHTML('beforeend', STEP_CHECK_SVG);
      }
    });
  }

  function replayStepCheckAnim(stepEl) {
    const path = stepEl.querySelector('.step-done-path');
    const num  = stepEl.querySelector('.step-num');
    if (path) {
      path.style.animation = 'none'; path.style.opacity = '0';
      void path.offsetWidth;
      path.style.animation = ''; path.style.opacity = '';
    }
    if (num) {
      num.style.animation = 'none';
      void num.offsetWidth;
      num.style.animation = '';
    }
  }

  // ============================================================
  // STEP NAVIGATION UI
  // ============================================================
  function updateStepUI() {
    document.querySelectorAll('.reg-panel').forEach((p, i) => {
      p.classList.toggle('active', i + 1 === currentStep);
    });
    document.querySelectorAll('.reg-step').forEach((s, i) => {
      const n = i + 1;
      s.classList.remove('active', 'done');
      if (n < currentStep) {
        s.classList.add('done');
        replayStepCheckAnim(s);
      }
      if (n === currentStep) s.classList.add('active');
    });
    document.getElementById('conn-1-2').classList.toggle('done', currentStep > 1);
    document.getElementById('conn-2-3').classList.toggle('done', currentStep > 2);

    btnBack.style.display = currentStep > 1 ? 'inline-flex' : 'none';
    const isLast = currentStep === TOTAL_STEPS;
    btnNext.style.display   = isLast ? 'none' : 'inline-flex';
    btnSubmit.classList.toggle('visible', isLast);

    stepText.textContent = 'Langkah ' + currentStep + ' dari ' + TOTAL_STEPS;

    // Scroll modal ke atas
    const regBody = modal.querySelector('.reg-body') || modal;
    regBody.scrollTop = 0;
  }

  btnNext.addEventListener('click', async () => {
    let valid = false;
    if (currentStep === 1) valid = validateStep1();
    else if (currentStep === 2) valid = validateStep2();
    if (!valid) return;

    // ── QUOTA RE-CHECK saat mau lanjut dari step 1 ─────────────
    // Dilakukan setelah pilih kategori, sebelum user mulai isi data.
    if (currentStep === 1) {
      btnNext.disabled = true;
      const origText   = btnNext.textContent;
      btnNext.textContent = 'Memeriksa kuota...';

      const quotaCheck = await verifyQuotaBeforeSubmit();

      btnNext.disabled = false;
      btnNext.textContent = origText;

      if (!quotaCheck.ok) {
        showNotif({ type: 'warning', title: 'Pendaftaran Ditutup', message: quotaCheck.reason + '\n\nSilakan hubungi panitia untuk informasi lebih lanjut.' });
        return;
      }
    }
    // ────────────────────────────────────────────────────────────

    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      updateStepUI();
      saveDraft(); // simpan step terbaru
    }
  });

  btnBack.addEventListener('click', () => {
    if (currentStep > 1) { currentStep--; updateStepUI(); saveDraft(); }
  });

  // ============================================================
  // GENERATE KODE REGISTRASI
  // ============================================================
  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'IGITA-2026-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  // ============================================================
  // SUBMIT — KIRIM KE GOOGLE SHEETS
  // ============================================================
  // ============================================================
  // CONFIRM MODAL
  // ============================================================
  const confirmOverlay = document.getElementById('confirm-overlay');
  const confirmEdit    = document.getElementById('confirm-edit');
  const confirmSend    = document.getElementById('confirm-send');

  function openConfirmModal() {
    const get = (id) => (document.getElementById(id)?.value || '').trim();
    const kat      = document.querySelector('input[name="kategori"]:checked')?.value;
    const katLabel = kat === 'internal' ? 'Internal – Mahasiswa KKG' : 'Eksternal – SMA/SMK';
    const institusi = kat === 'internal' ? 'Internal KKG' : get('asal-institusi');
    const isInternal = kat === 'internal';

    document.getElementById('cf-kategori').textContent  = katLabel;
    document.getElementById('cf-nama-tim').textContent  = get('nama-tim');
    document.getElementById('cf-institusi').textContent = institusi;

    // Render anggota
    const cfMembers = document.getElementById('cf-members');
    cfMembers.innerHTML = '';
    const labels = ['Anggota 1 (Ketua)', 'Anggota 2 (Wakil)', 'Anggota 3', 'Anggota 4'];
    for (let i = 1; i <= 4; i++) {
      const nama = get(`m${i}-nama`);
      if (!nama) continue;
      const block = document.createElement('div');
      block.className = 'confirm-member-block';

      const isLeader = i === 1;
      let html = `
        <div class="confirm-member-title">${labels[i-1]}</div>
        <div class="confirm-row"><span class="confirm-key">Nama</span><span class="confirm-val">${nama}</span></div>
      `;
      if (isLeader) {
        html += `
        <div class="confirm-row"><span class="confirm-key">Email</span><span class="confirm-val">${get(`m${i}-email`)}</span></div>
        <div class="confirm-row"><span class="confirm-key">No. HP</span><span class="confirm-val">${get(`m${i}-hp`)}</span></div>
        <div class="confirm-row"><span class="confirm-key">Link Twibbon</span><span class="confirm-val">${get('m1-twibbon')}</span></div>
        `;
      } else if (i === 2) {
        html += `
        <div class="confirm-row"><span class="confirm-key">Email</span><span class="confirm-val">${get(`m${i}-email`)}</span></div>
        <div class="confirm-row"><span class="confirm-key">No. HP</span><span class="confirm-val">${get(`m${i}-hp`)}</span></div>
        `;
      }
      if (isInternal) {
        html += `<div class="confirm-row"><span class="confirm-key">Jurusan</span><span class="confirm-val">${get(`m${i}-jurusan`) || '—'}</span></div>`;
      }
      block.innerHTML = html;
      cfMembers.appendChild(block);
    }

    // Bukti bayar
    const buktiFile = document.getElementById('bukti-bayar')?.files[0];
    document.getElementById('cf-bukti-bayar').textContent = buktiFile ? buktiFile.name : '—';

    confirmOverlay.classList.add('open');
    confirmOverlay.setAttribute('aria-hidden', 'false');
    confirmSend.disabled = false;
  }

  function closeConfirmModal() {
    confirmOverlay.classList.remove('open');
    confirmOverlay.setAttribute('aria-hidden', 'true');
  }

  confirmEdit.addEventListener('click', closeConfirmModal);
  confirmOverlay.addEventListener('click', e => {
    if (e.target === confirmOverlay) closeConfirmModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && confirmOverlay.classList.contains('open')) closeConfirmModal();
  });

  btnSubmit.addEventListener('click', () => {
    if (!validateStep4()) return;
    openConfirmModal();
  });

  confirmSend.addEventListener('click', async () => {
    confirmSend.disabled = true;
    confirmSend.textContent = 'Memeriksa kuota...';

    // ── PRE-SUBMIT QUOTA CHECK ──────────────────────────────────
    // Re-fetch kuota langsung dari server sebelum kirim data,
    // untuk cegah race condition (dua orang submit hampir bersamaan).
    const quotaCheck = await verifyQuotaBeforeSubmit();
    if (!quotaCheck.ok) {
      confirmSend.disabled = false;
      confirmSend.textContent = 'Kirim Sekarang ✓';
      closeConfirmModal();
      showNotif({ type: 'warning', title: 'Pendaftaran Ditutup', message: quotaCheck.reason + '\n\nSilakan hubungi panitia untuk informasi lebih lanjut.' });
      return;
    }
    // ────────────────────────────────────────────────────────────

    confirmSend.textContent = 'Mengirim...';
    closeConfirmModal();

    btnSubmit.classList.add('loading');
    btnSubmit.disabled = true;
    btnBack.disabled   = true;

    try {
      const get = (id) => (document.getElementById(id)?.value || '').trim();
      const kat      = document.querySelector('input[name="kategori"]:checked')?.value;
      const katLabel = kat === 'internal' ? 'Internal – Mahasiswa KKG' : 'Eksternal – SMA/SMK';
      const kode     = generateCode();

      const formData = {
        kodeRegistrasi : kode,
        timestamp      : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        kategori       : katLabel,
        namaTim        : get('nama-tim'),
        institusi      : kat === 'internal' ? 'Internal KKG' : get('asal-institusi'),
        a1_nama    : get('m1-nama'),  a1_email   : get('m1-email'),
        a1_hp      : get('m1-hp'),    a1_twibbon : get('m1-twibbon'),
        a1_jurusan : kat === 'internal' ? get('m1-jurusan') : '',
        a2_nama    : get('m2-nama'),  a2_email   : get('m2-email'),
        a2_hp      : get('m2-hp'),
        a2_jurusan : kat === 'internal' ? get('m2-jurusan') : '',
        a3_nama    : get('m3-nama'),
        a3_jurusan : kat === 'internal' ? get('m3-jurusan') : '',
        a4_nama    : get('m4-nama'),
        a4_jurusan : kat === 'internal' ? get('m4-jurusan') : '',
      };

      // Bukti transfer ke base64
      const buktiInput = document.getElementById('bukti-bayar');
      const buktiFile  = buktiInput?.files[0];
      if (buktiFile) {
        const base64Bukti = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload  = () => res(reader.result.split(',')[1]);
          reader.onerror = () => rej(new Error('Gagal membaca file bukti'));
          reader.readAsDataURL(buktiFile);
        });
        formData.buktiTransfer = { base64: base64Bukti, mimeType: buktiFile.type, fileName: buktiFile.name };
      }

      // Kirim ke Apps Script via fetch dengan CORS
      const url = typeof APPS_SCRIPT_URL !== 'undefined' ? APPS_SCRIPT_URL : '';
      if (url) {
        const payload = new FormData();
        payload.append('data', JSON.stringify(formData));

        let berhasil = false;
        let pesanError = 'Gagal mengirim data ke server.';

        // Timeout 90 detik — Apps Script butuh waktu upload file ke Drive
        // (upload PDF + gambar bisa 30-60 detik tergantung ukuran & koneksi)
        const SUBMIT_TIMEOUT_MS = 90000;
        let   timedOut = false;

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => {
            timedOut = true;
            controller.abort();
          }, SUBMIT_TIMEOUT_MS);

          const res = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            body: payload,
            signal: controller.signal,
          });
          clearTimeout(timeout);

          const json = await res.json();

          if (json.status === 'ok') {
            berhasil = true;
          } else {
            pesanError = 'Server menolak data: ' + (json.message || 'Unknown error');
          }
        } catch (fetchErr) {
          if (fetchErr.name === 'AbortError' && timedOut) {
            // Timeout bukan berarti gagal — Apps Script mungkin masih proses
            // dan data sudah masuk ke spreadsheet. Tampilkan pesan khusus
            // dengan kode registrasi supaya user bisa konfirmasi ke panitia.
            showNotif({
              type   : 'timeout',
              title  : 'Koneksi Lambat',
              message: 'Respon server melebihi batas waktu. Data kamu kemungkinan sudah masuk ke sistem. Hubungi panitia dengan kode di bawah untuk konfirmasi — jangan submit ulang sebelum dikonfirmasi.',
              code   : kode,
            });
            // Anggap berhasil — tampilkan success screen dengan kode yang sama
            berhasil = true;
          } else {
            pesanError = 'Gagal terhubung ke server. Periksa koneksi internet kamu.';
          }
        }

        if (!berhasil) {
          showNotif({ type: 'error', title: 'Pendaftaran Gagal', message: pesanError + '\n\nSilakan coba lagi atau hubungi panitia.' });
          btnSubmit.classList.remove('loading');
          btnSubmit.disabled = false;
          btnBack.disabled   = false;
          return;
        }
      }

      // Submit berhasil — hapus draft tersimpan
      clearDraft();

      // Tampilkan success screen
      document.getElementById('success-code').textContent = kode;
      document.getElementById('suc-team').textContent     = formData.namaTim;
      document.getElementById('suc-cat').textContent      = katLabel;
      document.getElementById('suc-inst').textContent     = formData.institusi;
      document.getElementById('suc-email').textContent    = formData.a1_email;

      document.querySelectorAll('.reg-panel').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
      });
      document.getElementById('reg-steps').style.display = 'none';
      regFooter.style.display = 'none';
      document.getElementById('reg-success').classList.add('active');
      const regBody = modal.querySelector('.reg-body') || modal;
      regBody.scrollTop = 0;

    } catch (err) {
      console.error('Gagal kirim:', err);
      showNotif({ type: 'error', title: 'Gagal Mengirim', message: 'Pastikan koneksi internet aktif dan coba lagi.\n\nDetail: ' + err.message });
      btnSubmit.classList.remove('loading');
      btnSubmit.disabled = false;
      btnBack.disabled   = false;
      confirmSend.disabled = false;
      confirmSend.textContent = 'Kirim Sekarang ✓';
    }
  });

  // ============================================================
  // RESET MODAL
  // ============================================================
  function resetModal() {
    currentStep = 1;
    document.querySelectorAll('.reg-panel').forEach(p => { p.style.display = ''; p.classList.remove('active'); });
    document.getElementById('panel-1').classList.add('active');
    document.getElementById('reg-steps').style.display = '';
    regFooter.style.display = '';
    document.getElementById('reg-success').classList.remove('active');
    document.querySelectorAll('.reg-modal input, .reg-modal textarea, .reg-modal select').forEach(el => {
      if (el.type === 'radio' || el.type === 'checkbox') el.checked = false;
      else if (el.type === 'file') el.value = '';
      else el.value = '';
    });
    document.querySelectorAll('.cat-select-card').forEach(c => {
      c.classList.remove('selected');
      const path = c.querySelector('.cat-check-path');
      if (path) { path.style.animation = 'none'; path.style.opacity = '0'; }
    });
    document.querySelectorAll('.form-error').forEach(e => e.classList.remove('visible'));
    document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(i => {
      i.classList.remove('error', 'valid');
    });
    document.getElementById('agree-wrap').style.borderColor = '';
    // Hide jurusan rows on reset
    document.querySelectorAll('.jurusan-row').forEach(r => r.style.display = 'none');
    btnSubmit.classList.remove('loading');
    btnSubmit.disabled = false;
    btnBack.disabled   = false;
    updateStepUI();
  }

  // Tombol sukses kembali ke beranda
  document.getElementById('btn-success-close').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // ============================================================
  // AUTO-SELECT KATEGORI DARI URL PARAM
  // ============================================================
  const urlParams = new URLSearchParams(window.location.search);
  const katParam  = urlParams.get('kategori');
  if (katParam === 'internal' || katParam === 'external') {
    const targetCard = document.getElementById(`card-${katParam}`);
    if (targetCard) { targetCard.click(); }
  }

  // ============================================================
  // QUOTA CHECK — Auto-disable form jika kuota TOTAL penuh
  // Kuota global: internal + external ≤ 20 tim (tidak ada batas per kategori)
  // ============================================================
  const TOTAL_QUOTA_MAX = 20;

  /**
   * updateQuotaDisplay — update UI kedua kartu berdasarkan kuota TOTAL
   * @param {number} internalCount  jumlah tim internal terdaftar (-1 = gagal fetch)
   * @param {number} externalCount  jumlah tim external terdaftar (-1 = gagal fetch)
   */
  function updateQuotaDisplay(internalCount, externalCount) {
    const fetchFailed = internalCount < 0 || externalCount < 0;
    const totalUsed   = fetchFailed ? 0 : (internalCount + externalCount);
    const totalFull   = !fetchFailed && totalUsed >= TOTAL_QUOTA_MAX;
    const slotsLeft   = Math.max(0, TOTAL_QUOTA_MAX - totalUsed);

    ['internal', 'external'].forEach(function(category) {
      const card   = document.getElementById('card-' + category);
      const radio  = document.getElementById('radio-' + category);
      const infoEl = document.getElementById('quota-info-' + category);
      if (!card) return;

      // Stop loading animation
      if (infoEl) infoEl.classList.remove('loading');

      // Fetch gagal → tampilkan teks fallback, jangan disable apapun
      if (fetchFailed) {
        if (infoEl) infoEl.textContent = 'Kuota terbatas';
        return;
      }

      // Counter text — cukup tampilkan status kuota, tanpa angka pendaftar
      if (infoEl) {
        infoEl.textContent = totalFull ? 'Kuota habis' : 'Kuota terbatas';
        infoEl.classList.toggle('full', totalFull);
      }

      if (totalFull) {
        card.classList.add('quota-full');
        card.setAttribute('aria-disabled', 'true');
        if (radio) {
          if (radio.checked) { radio.checked = false; }
          radio.disabled = true;
        }
        // Tambah badge "KUOTA PENUH" jika belum ada
        if (!card.querySelector('.quota-full-badge')) {
          const badge = document.createElement('div');
          badge.className = 'quota-full-badge';
          badge.innerHTML =
            '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
            ' stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg> KUOTA PENUH';
          const bar = card.querySelector('.cat-card-quota-bar');
          if (bar) card.insertBefore(badge, bar);
          else card.appendChild(badge);
        }
      } else {
        card.classList.remove('quota-full');
        card.removeAttribute('aria-disabled');
        if (radio) radio.disabled = false;
        const badge = card.querySelector('.quota-full-badge');
        if (badge) badge.remove();
      }
    });
  }

  /**
   * fetchQuotaCount — ambil data kuota dari Apps Script, return { internal, external }.
   * Throw jika gagal / response tidak valid.
   * Dipakai oleh checkQuota() (display) dan pre-submit re-check.
   */
  async function fetchQuotaCount() {
    const url = typeof APPS_SCRIPT_URL !== 'undefined' ? APPS_SCRIPT_URL : '';
    if (!url) throw new Error('APPS_SCRIPT_URL tidak terdefinisi');
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url + '?action=checkQuota', {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(t);
    const data = await res.json();
    if (typeof data.internal !== 'number' || typeof data.external !== 'number') {
      throw new Error('unexpected quota response');
    }
    return { internal: data.internal, external: data.external };
  }

  /**
   * checkQuota — fetch dan update tampilan kuota di kartu kategori.
   * Dipanggil saat halaman dimuat.
   */
  async function checkQuota() {
    try {
      const { internal, external } = await fetchQuotaCount();
      updateQuotaDisplay(internal, external);
    } catch (err) {
      console.warn('[IGITA] Quota check failed:', err.message);
      updateQuotaDisplay(-1, -1);
    }
  }

  /**
   * verifyQuotaBeforeSubmit — re-check kuota langsung ke server sesaat sebelum submit.
   * Return { ok: true } jika masih ada slot, { ok: false, reason } jika sudah penuh.
   * Jika jaringan gagal → izinkan lanjut (jangan block user karena masalah koneksi).
   */
  async function verifyQuotaBeforeSubmit() {
    try {
      const { internal, external } = await fetchQuotaCount();
      const total = internal + external;
      updateQuotaDisplay(internal, external);
      if (total >= TOTAL_QUOTA_MAX) {
        return { ok: false, reason: 'Kuota pendaftaran sudah penuh' };
      }
      return { ok: true };
    } catch (err) {
      console.warn('[IGITA] Pre-submit quota check failed:', err.message);
      return { ok: true, warn: true }; // fallback: tetap izinkan submit
    }
  }


  // ============================================================
  // DRAFT AUTO-SAVE — localStorage persistence antar sesi
  // Semua teks tersimpan otomatis; file upload perlu ulang.
  // Draft kadaluarsa otomatis setelah 24 jam.
  // ============================================================
  const DRAFT_KEY = 'igita2026_reg_draft';

  const DRAFT_TEXT_FIELDS = [
    'nama-tim', 'asal-institusi',
    'm1-nama', 'm1-email', 'm1-hp', 'm1-twibbon', 'm1-jurusan',
    'm2-nama', 'm2-email', 'm2-hp', 'm2-jurusan',
    'm3-nama', 'm3-jurusan',
    'm4-nama', 'm4-jurusan',
  ];

  /** Simpan semua field + step ke localStorage */
  function saveDraft() {
    try {
      const draft = {
        savedAt : Date.now(),
        step    : currentStep,
        kategori: document.querySelector('input[name="kategori"]:checked')?.value || '',
        agree   : document.getElementById('agree-check')?.checked || false,
      };
      DRAFT_TEXT_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) draft[id] = el.value;
      });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) { /* localStorage disabled — abaikan */ }
  }

  /** Baca draft dari localStorage; return null jika tidak ada / rusak */
  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /** Hapus draft — dipanggil setelah submit berhasil */
  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
  }

  /** Isi semua form field dari data draft */
  function applyDraft(draft) {
    // Restore kategori via card.click() supaya side-effects jalan
    // (jurusan rows visibility, selected class, radio state, dll)
    if (draft.kategori === 'internal' || draft.kategori === 'external') {
      const card = document.getElementById('card-' + draft.kategori);
      if (card) card.click();
    }
    // Restore semua text field
    DRAFT_TEXT_FIELDS.forEach(function(id) {
      const el = document.getElementById(id);
      if (el && draft[id] !== undefined && draft[id] !== '') {
        el.value = draft[id];
        // Trigger input event supaya valid/error class ikut update
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    // Restore checkbox agree
    const agreeCheck = document.getElementById('agree-check');
    if (agreeCheck && draft.agree) agreeCheck.checked = true;
    // Restore step — langsung buka step terakhir yang diisi
    if (draft.step && draft.step >= 1 && draft.step <= TOTAL_STEPS) {
      currentStep = draft.step;
      updateStepUI();
    }
  }

  /** Pasang auto-save listener ke semua field */
  function initDraftAutoSave() {
    DRAFT_TEXT_FIELDS.forEach(function(id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', saveDraft);
    });
    document.querySelectorAll('input[name="kategori"]').forEach(function(r) {
      r.addEventListener('change', saveDraft);
    });
    const agree = document.getElementById('agree-check');
    if (agree) agree.addEventListener('change', saveDraft);
  }

  /** Tampilkan banner "Draft ditemukan" di atas form */
  function showDraftBanner(draft) {
    const banner = document.createElement('div');
    banner.id        = 'draft-banner';
    banner.className = 'draft-banner';

    const stepStr = (draft.step && draft.step > 1)
      ? 'Terakhir di step ' + draft.step + ' dari ' + TOTAL_STEPS
      : 'Mulai dari step 1';

    const timeStr = draft.savedAt
      ? ' &middot; ' + new Date(draft.savedAt).toLocaleString('id-ID', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        })
      : '';

    banner.innerHTML =
      '<div class="draft-banner-icon">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
        ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
          '<polyline points="14 2 14 8 20 8"/>' +
          '<line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' +
        '</svg>' +
      '</div>' +
      '<div class="draft-banner-text">' +
        '<strong>Draft ditemukan' + timeStr + '</strong>' +
        '<span>' + stepStr + ' &middot; File upload perlu diunggah ulang</span>' +
      '</div>' +
      '<div class="draft-banner-actions">' +
        '<button id="draft-restore-btn" class="draft-btn-restore">Lanjutkan</button>' +
        '<button id="draft-clear-btn"   class="draft-btn-clear">Mulai Baru</button>' +
      '</div>';

    const regBody = document.querySelector('.reg-body');
    if (regBody) regBody.insertAdjacentElement('afterbegin', banner);

    document.getElementById('draft-restore-btn').addEventListener('click', function() {
      banner.remove();
      applyDraft(draft);
    });
    document.getElementById('draft-clear-btn').addEventListener('click', function() {
      clearDraft();
      banner.remove();
    });
  }

  /** Cek localStorage saat load; tampilkan banner jika ada draft valid */
  function initDraftRestore() {
    const draft = loadDraft();
    if (!draft) return;
    // Draft > 24 jam → hapus otomatis
    if (draft.savedAt && Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
      clearDraft();
      return;
    }
    // Hanya restore kalau ada data bermakna
    const hasData = draft.kategori || draft['nama-tim'] || draft['m1-nama'];
    if (!hasData) { clearDraft(); return; }
    showDraftBanner(draft);
  }

  // ============================================================
  // INIT
  // ============================================================
  initInputSetup();
  injectStepSVGs();
  updateStepUI();
  checkQuota();        // cek kuota saat halaman dimuat
  initDraftAutoSave(); // pasang auto-save listener ke semua field
  initDraftRestore();  // cek & tampilkan banner jika ada draft tersimpan
})();