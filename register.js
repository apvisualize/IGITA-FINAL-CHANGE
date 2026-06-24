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
  const TOTAL_STEPS = 4;

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

  // Instagram: wajib diawali @, min 4 karakter total, hanya huruf/angka/titik/underscore
  function isValidIG(v) {
    return /^@[a-zA-Z0-9._]{1,}$/.test(v.trim()) && v.trim().length >= 4;
  }

  // Nama: min 3 karakter, hanya huruf & spasi (tidak boleh angka/simbol)
  function isValidNama(v) {
    return v.trim().length >= 3 && /^[a-zA-Z\s'.\-]+$/.test(v.trim());
  }

  // Nama Tim: min 3 karakter, bebas
  function isValidNamaTim(v) {
    return v.trim().length >= 3;
  }

  // Link IG: harus URL instagram yang valid
  function isValidLinkIG(v) {
    const val = v.trim();
    return /^https?:\/\/(www\.)?instagram\.com\/.+/.test(val);
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
    ig      : 'Akun Instagram harus diawali @ (contoh: @namaakun).',
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

  // Auto-format IG: otomatis tambahkan @ di depan jika belum ada
  function setupIGInput(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('autocorrect', 'off');
    el.setAttribute('autocapitalize', 'off');
    el.setAttribute('spellcheck', 'false');

    el.addEventListener('blur', () => {
      let val = el.value.trim();
      if (val.length > 0 && !val.startsWith('@')) {
        val = '@' + val;
        el.value = val;
      }
      if (val.length > 0) {
        const valid = isValidIG(val);
        showErr('err-' + id, !valid, valid ? '' : ERR_MSG.ig);
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

  // File proposal feedback
  function isValidProposal(file) {
    if (!file) return { ok: false, msg: 'File proposal wajib diunggah.' };
    if (file.type !== 'application/pdf') return { ok: false, msg: 'Format file tidak valid. Gunakan PDF.' };
    if (file.size > 10 * 1024 * 1024) return { ok: false, msg: 'Ukuran file melebihi 10MB. Kompres atau pilih file lain.' };
    return { ok: true };
  }

  function setupProposalInput() {
    const fileInput = document.getElementById('proposal-file');
    const nameDisp  = document.getElementById('proposal-file-name');
    const helper    = fileInput?.closest('.form-group')?.querySelector('.form-helper');
    if (!fileInput) return;
    fileInput.addEventListener('change', () => {
      const file   = fileInput.files[0];
      const result = isValidProposal(file);
      // Truncate long names for display (max 40 chars)
      const shortName = file
        ? (file.name.length > 40 ? file.name.slice(0, 37) + '…' : file.name)
        : 'Belum ada file dipilih';
      if (nameDisp) {
        nameDisp.textContent = shortName;
        nameDisp.classList.toggle('has-file', !!file);
      }
      if (!result.ok) {
        showErr('err-proposal-file', true, result.msg);
        setInputErr('proposal-file', true);
        if (helper) { helper.textContent = 'Format: PDF · Maks. 10MB.'; helper.style.color = ''; }
        fileInput.value = '';
        if (nameDisp) { nameDisp.textContent = 'Belum ada file dipilih'; nameDisp.classList.remove('has-file'); }
      } else {
        showErr('err-proposal-file', false);
        setInputErr('proposal-file', false);
        const kb = (file.size / 1024).toFixed(0);
        if (helper) {
          const displayName = file.name.length > 32 ? file.name.slice(0, 29) + '…' : file.name;
          helper.textContent = '✓ ' + displayName + ' (' + kb + ' KB)';
          helper.style.color = 'var(--accent, #00d4ff)';
        }
      }
    });
  }

  // Inisialisasi semua real-time input setup
  function initInputSetup() {
    // Ketua dan Wakil: semua field
    for (let i = 1; i <= 2; i++) {
      setupNamaInput(`m${i}-nama`);
      setupEmailInput(`m${i}-email`);
      setupHPInput(`m${i}-hp`);
      setupIGInput(`m${i}-ig`);
    }
    // Anggota 3-4: hanya nama (tidak ada IG)
    for (let i = 3; i <= 4; i++) {
      setupNamaInput(`m${i}-nama`);
    }
    setupProposalInput();
    setupLinkIGInput();
  }

  // Setup validasi real-time link IG
  function setupLinkIGInput() {
    const el = document.getElementById('link-ig-post');
    if (!el) return;
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (val.length > 0) {
        const valid = isValidLinkIG(val);
        showErr('err-link-ig', !valid, valid ? '' : 'Link tidak valid. Contoh: https://www.instagram.com/username');
        setInputErr('link-ig-post', !valid);
        setInputOk('link-ig-post', valid);
      }
    });
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

    // --- Anggota 1 (Ketua) & 2 (Wakil): wajib semua field ---
    [1, 2].forEach(i => {
      const namId = `m${i}-nama`;
      const emId  = `m${i}-email`;
      const hpId  = `m${i}-hp`;
      const igId  = `m${i}-ig`;

      const namVal = document.getElementById(namId)?.value.trim() || '';
      const emVal  = document.getElementById(emId)?.value.trim()  || '';
      const hpVal  = document.getElementById(hpId)?.value.trim()  || '';
      const igVal  = document.getElementById(igId)?.value.trim()  || '';

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

      let igFinal = igVal;
      if (igFinal.length > 0 && !igFinal.startsWith('@')) {
        igFinal = '@' + igFinal;
        const igEl = document.getElementById(igId);
        if (igEl) igEl.value = igFinal;
      }
      const badIg = !isValidIG(igFinal);
      setInputErr(igId, badIg); setInputOk(igId, !badIg);
      showErr(`err-${igId}`, badIg, badIg ? ERR_MSG.ig : '');
      if (badIg) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(igId); }

      // Jurusan — wajib jika internal
      if (isInternal) {
        const jurId  = `m${i}-jurusan`;
        const jurVal = document.getElementById(jurId)?.value.trim() || '';
        const badJur = jurVal.length < 3;
        setInputErr(jurId, badJur); setInputOk(jurId, !badJur);
        showErr(`err-${jurId}`, badJur, badJur ? 'Jurusan wajib diisi (min. 3 karakter).' : '');
        if (badJur) { ok = false; if (!firstErrEl) firstErrEl = document.getElementById(jurId); }
      }
    });

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

    // ---- Cek duplikat Instagram (Ketua & Wakil saja, karena hanya mereka punya IG) ----
    const igVals = [1, 2].map(i => ({ id: i, val: document.getElementById(`m${i}-ig`)?.value.trim().toLowerCase() || '' })).filter(g => g.val);
    igVals.forEach((a, i) => igVals.forEach((b, j) => {
      if (i !== j && a.val === b.val) {
        const id = `m${a.id}-ig`;
        setInputErr(id, true); setInputOk(id, false);
        showErr(`err-${id}`, true, `Akun Instagram sama dengan Anggota ${b.id}. Pakai akun berbeda.`);
        ok = false; if (!firstDupEl) firstDupEl = document.getElementById(id);
      }
    }));

    const scrollTarget = firstDupEl || firstErrEl;
    if (scrollTarget) { scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' }); scrollTarget.focus(); }

    return ok;
  }

  function validateStep3() {
    let ok = true;

    const fileInput = document.getElementById('proposal-file');
    const file      = fileInput?.files[0];
    const fileCheck = isValidProposal(file);
    setInputErr('proposal-file', !fileCheck.ok);
    showErr('err-proposal-file', !fileCheck.ok, fileCheck.msg || '');
    if (!fileCheck.ok) ok = false;

    // Link IG
    const linkIG = (document.getElementById('link-ig-post')?.value || '').trim();
    const badLinkIG = !isValidLinkIG(linkIG);
    setInputErr('link-ig-post', badLinkIG);
    setInputOk('link-ig-post', !badLinkIG);
    showErr('err-link-ig', badLinkIG, badLinkIG ? 'Link profil Instagram wajib diisi. Contoh: https://www.instagram.com/username' : '');
    if (badLinkIG) ok = false;

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
    document.getElementById('conn-3-4').classList.toggle('done', currentStep > 3);

    btnBack.style.display = currentStep > 1 ? 'inline-flex' : 'none';
    const isLast = currentStep === TOTAL_STEPS;
    btnNext.style.display   = isLast ? 'none' : 'inline-flex';
    btnSubmit.classList.toggle('visible', isLast);

    stepText.textContent = 'Langkah ' + currentStep + ' dari ' + TOTAL_STEPS;

    // Scroll modal ke atas
    const regBody = modal.querySelector('.reg-body') || modal;
    regBody.scrollTop = 0;
  }

  btnNext.addEventListener('click', () => {
    let valid = false;
    if (currentStep === 1) valid = validateStep1();
    else if (currentStep === 2) valid = validateStep2();
    else if (currentStep === 3) valid = validateStep3();
    if (valid && currentStep < TOTAL_STEPS) {
      currentStep++;
      updateStepUI();
    }
  });

  btnBack.addEventListener('click', () => {
    if (currentStep > 1) { currentStep--; updateStepUI(); }
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

      const isLeader = i <= 2;
      let html = `
        <div class="confirm-member-title">${labels[i-1]}</div>
        <div class="confirm-row"><span class="confirm-key">Nama</span><span class="confirm-val">${nama}</span></div>
      `;
      if (isLeader) {
        html += `
        <div class="confirm-row"><span class="confirm-key">Email</span><span class="confirm-val">${get(`m${i}-email`)}</span></div>
        <div class="confirm-row"><span class="confirm-key">No. HP</span><span class="confirm-val">${get(`m${i}-hp`)}</span></div>
        <div class="confirm-row"><span class="confirm-key">Instagram</span><span class="confirm-val">${get(`m${i}-ig`)}</span></div>
        `;
      }
      if (isInternal) {
        html += `<div class="confirm-row"><span class="confirm-key">Jurusan</span><span class="confirm-val">${get(`m${i}-jurusan`) || '—'}</span></div>`;
      }
      block.innerHTML = html;
      cfMembers.appendChild(block);
    }

    // File & Link IG
    const fileInput = document.getElementById('proposal-file');
    const file = fileInput?.files[0];
    document.getElementById('cf-file').textContent = file ? file.name : '—';
    document.getElementById('cf-link-ig').textContent = get('link-ig-post') || '—';
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
        a1_hp      : get('m1-hp'),    a1_ig      : get('m1-ig'),
        a1_jurusan : kat === 'internal' ? get('m1-jurusan') : '',
        a2_nama    : get('m2-nama'),  a2_email   : get('m2-email'),
        a2_hp      : get('m2-hp'),    a2_ig      : get('m2-ig'),
        a2_jurusan : kat === 'internal' ? get('m2-jurusan') : '',
        a3_nama    : get('m3-nama'),
        a3_jurusan : kat === 'internal' ? get('m3-jurusan') : '',
        a4_nama    : get('m4-nama'),
        a4_jurusan : kat === 'internal' ? get('m4-jurusan') : '',
        linkIGPost : get('link-ig-post'),
      };

      // Proposal ke base64
      const fileInput = document.getElementById('proposal-file');
      const file = fileInput?.files[0];
      if (file) {
        const base64 = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload  = () => res(reader.result.split(',')[1]);
          reader.onerror = () => rej(new Error('Gagal membaca file'));
          reader.readAsDataURL(file);
        });
        formData.buktiBayar = { base64, mimeType: file.type, fileName: file.name };
      }

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

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000); // timeout 15 detik

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
          if (fetchErr.name === 'AbortError') {
            pesanError = 'Koneksi timeout (15 detik). Periksa koneksi internet kamu dan coba lagi.';
          } else {
            pesanError = 'Gagal terhubung ke server. Periksa koneksi internet kamu.';
          }
        }

        if (!berhasil) {
          // Tampilkan error ke user, aktifkan kembali tombol
          alert('❌ Pendaftaran gagal.\n\n' + pesanError + '\n\nData kamu belum masuk. Silakan coba lagi atau hubungi panitia.');
          btnSubmit.classList.remove('loading');
          btnSubmit.disabled = false;
          btnBack.disabled   = false;
          return;
        }
      }

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
      alert('Gagal mengirim pendaftaran. Pastikan koneksi aktif dan coba lagi.\n\nDetail: ' + err.message);
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
    const helper = document.querySelector('#proposal-file ~ .form-helper, #proposal-file + .form-helper');
    if (helper) { helper.textContent = 'Format: PDF · Maks. 10MB · Gunakan template proposal resmi IGITA 2026.'; helper.style.color = ''; }
    const proposalName = document.getElementById('proposal-file-name');
    if (proposalName) proposalName.textContent = 'Belum ada file dipilih';
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
  // QUOTA CHECK — Auto-disable form jika kuota per kategori penuh
  // ============================================================
  const QUOTA_MAX = 10;

  /**
   * updateQuotaDisplay — update UI per kategori
   * @param {'internal'|'external'} category
   * @param {number} count  -1 = gagal fetch (fallback text)
   */
  function updateQuotaDisplay(category, count) {
    const card   = document.getElementById('card-' + category);
    const radio  = document.getElementById('radio-' + category);
    const infoEl = document.getElementById('quota-info-' + category);
    if (!card) return;

    // Stop loading animation
    if (infoEl) infoEl.classList.remove('loading');

    // Fetch gagal → tampilkan teks fallback, jangan disable apapun
    if (count < 0) {
      if (infoEl) infoEl.textContent = 'Kuota terbatas';
      return;
    }

    const isFull = count >= QUOTA_MAX;
    const used   = Math.min(count, QUOTA_MAX);

    // Counter text
    if (infoEl) {
      infoEl.textContent = isFull
        ? QUOTA_MAX + '/' + QUOTA_MAX + ' Tim · Kuota habis'
        : used + '/' + QUOTA_MAX + ' Tim terdaftar · ' + (QUOTA_MAX - used) + ' slot tersisa';
      infoEl.classList.toggle('full', isFull);
    }

    if (isFull) {
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
  }

  /**
   * checkQuota — fetch jumlah pendaftar dari Apps Script
   * Apps Script perlu doGet() yang menerima ?action=getQuota dan return:
   *   { "status": "ok", "internal": N, "external": M }
   */
  async function checkQuota() {
    const url = typeof APPS_SCRIPT_URL !== 'undefined' ? APPS_SCRIPT_URL : '';
    if (!url) {
      updateQuotaDisplay('internal', -1);
      updateQuotaDisplay('external', -1);
      return;
    }
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url + '?action=checkQuota', {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
      });
      clearTimeout(t);
      const data = await res.json();
      if (typeof data.internal === 'number' && typeof data.external === 'number') {
        updateQuotaDisplay('internal', data.internal);
        updateQuotaDisplay('external', data.external);
      } else {
        throw new Error('unexpected quota response');
      }
    } catch (err) {
      console.warn('[IGITA] Quota check failed:', err.message);
      updateQuotaDisplay('internal', -1);
      updateQuotaDisplay('external', -1);
    }
  }

  // ============================================================
  // INIT
  // ============================================================
  initInputSetup();
  injectStepSVGs();
  updateStepUI();
  checkQuota(); // cek kuota saat halaman dimuat

  // File upload nama file display
  // proposal file name display handled by setupProposalInput
})();