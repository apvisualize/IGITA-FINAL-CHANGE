// ============================================================
// REGISTRATION DEADLINE — 19 Agustus 2026 23:59:59 WIB
// WIB = UTC+7  →  23:59:59 WIB = 16:59:59 UTC
// ============================================================
const REG_DEADLINE = new Date('2026-08-19T16:59:59Z');

function isRegistrationClosed() {
  return Date.now() >= REG_DEADLINE.getTime();
}

// ============================================================
// NOTIFICATION SYSTEM — showNotif()
// Dipanggil saat user klik link pendaftaran setelah deadline
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
    info: {
      color : '#00d4ff',
      glow  : 'rgba(0,212,255,0.22)',
      border: 'rgba(0,212,255,0.35)',
      label : '// INFO',
      icon  : `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    },
  };
  const cfg = CONFIGS[type] || CONFIGS.info;

  const overlay   = document.getElementById('igita-notif-overlay');
  if (!overlay) return; // guard — modal belum di DOM
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
  titleEl.textContent        = title   || '';
  msgEl.textContent          = message || '';
  okBtn.style.background     = `linear-gradient(135deg, ${cfg.glow}, rgba(0,0,0,0.2))`;
  okBtn.style.borderColor    = cfg.border;
  okBtn.style.boxShadow      = `0 0 18px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`;
  okBtn.style.color          = cfg.color;

  if (code) {
    codeWrap.style.display    = 'block';
    codeVal.textContent       = code;
    codeVal.style.color       = cfg.color;
    codeVal.style.borderColor = cfg.border;
    codeVal.style.boxShadow   = `0 0 10px ${cfg.glow}`;
  } else {
    codeWrap.style.display = 'none';
  }

  okBtn.onclick = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (typeof onClose === 'function') onClose();
  };

  overlay.classList.remove('open');
  void overlay.offsetWidth; // reflow — reset transition
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('open');
}

// ============================================================
// APPLY CLOSED STATE — intercept semua link ke daftar.html
// ============================================================
function applyRegistrationClosed() {
  const CLOSED_MSG =
    'Batas akhir pendaftaran IGITA 2026 telah terlewati pada\n' +
    '19 Agustus 2026 pukul 23:59 WIB.\n\n' +
    'Untuk informasi lebih lanjut, hubungi panitia:\n' +
    '• igitaofficial@gmail.com\n' +
    '• Instagram: @igita.ibikkg';

  const regLinks = document.querySelectorAll(
    'a[href="daftar.html"], ' +
    'a[href="daftar.html?kategori=external"], ' +
    'a[href="daftar.html?kategori=internal"]'
  );

  regLinks.forEach(link => {
    // Intercept klik biasa
    link.addEventListener('click', e => {
      e.preventDefault();
      showNotif({ type: 'warning', title: 'Pendaftaran Ditutup', message: CLOSED_MSG });
    });
    // Intercept klik tengah / buka tab baru
    link.addEventListener('auxclick', e => { if (e.button === 1) e.preventDefault(); });

    link.classList.add('reg-closed-btn');

    if (link.classList.contains('nav-cta') || link.classList.contains('mobile-cta')) {
      // Navbar & mobile nav — ganti teks dalam <span>
      const span = link.querySelector('span');
      if (span) span.textContent = 'Ditutup';
      else link.textContent = 'Ditutup';

    } else if (link.classList.contains('btn-primary')) {
      // Hero & CTA section button
      link.textContent = 'Pendaftaran Ditutup';

    }
    // Category card <a> wrappers: hanya class + interception, visual via CSS ::after
  });
}

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // LOADING SCREEN — HUD Ring + Counter
  // ============================================================
  const loaderScreen = document.getElementById('loader-screen');
  const loaderBar    = document.getElementById('loader-bar');
  const loaderText   = document.getElementById('loader-text');
  const loaderPct    = document.getElementById('loader-pct');
  const loaderPctSm  = document.getElementById('loader-pct-sm');
  const ringProgress = document.getElementById('loader-ring-progress');

  // 2 * π * 66 = 414.69
  const CIRCUMFERENCE = 414.69;

  const loadSteps = [
    { pct: 18,  text: 'Menyiapkan tampilan...' },
    { pct: 45,  text: 'Memuat konten...' },
    { pct: 74,  text: 'Menginisialisasi...' },
    { pct: 100, text: 'Siap!' },
  ];

  let currentPct = 0;

  function setProgress(pct) {
    if (ringProgress) {
      ringProgress.style.strokeDashoffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    }
    if (loaderBar) loaderBar.style.width = pct + '%';

    // Smooth counter
    const from = currentPct;
    const to   = pct;
    const steps = Math.max(1, Math.ceil((to - from) / 6));
    let val = from;
    const tick = setInterval(() => {
      val = Math.min(val + steps, to);
      if (loaderPct)   loaderPct.innerHTML  = val + '<span>%</span>';
      if (loaderPctSm) loaderPctSm.textContent = val + '%';
      if (val >= to) { clearInterval(tick); currentPct = to; }
    }, 24);
  }

  if (loaderScreen) {
    document.body.classList.add('is-loading');
    let step = 0;

    function nextStep() {
      if (step >= loadSteps.length) return;
      const { pct, text } = loadSteps[step];
      setProgress(pct);
      if (loaderText) loaderText.textContent = text;
      step++;
    }

    nextStep();
    const stepInterval = setInterval(() => {
      nextStep();
      if (step >= loadSteps.length) clearInterval(stepInterval);
    }, 330);

    setTimeout(() => {
      loaderScreen.classList.add('hidden');
      document.body.classList.remove('is-loading');
    }, 1600);
  }

  // ============================================================
  // NAVBAR + STATUS BAR SCROLL
  // Status bar collapses; nav slides from top:32px → top:0
  // ============================================================
  const navbar    = document.getElementById('navbar');
  const statusBar = document.querySelector('.status-bar');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Collapse status bar after user scrolls past its height
    if (statusBar) statusBar.classList.toggle('collapsed', y > 40);

    // Nav slides up once status bar is gone; also shrink padding
    navbar.classList.toggle('scrolled', y > 60);

    // Keep mobile-nav top in sync with navbar position
    if (mobileNav) mobileNav.classList.toggle('nav-scrolled', y > 60);
  }, { passive: true });

  // Close mobile nav on orientation change
  window.addEventListener('orientationchange', () => {
    const mobileNav = document.getElementById('mobile-nav');
    const burger = document.getElementById('nav-burger');
    if (mobileNav && mobileNav.classList.contains('open')) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Buka menu navigasi');
      mobileNav.classList.remove('open');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  // ============================================================
  // HAMBURGER / MOBILE NAV (FIX #2)
  // ============================================================
  const burger    = document.getElementById('nav-burger');
  const mobileNav = document.getElementById('mobile-nav');
  const backdrop  = document.getElementById('mobile-nav-backdrop');

  function openMenu() {
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Tutup menu navigasi');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Stagger fade-in each link after panel opens
    mobileNav.querySelectorAll('a').forEach((link, i) => {
      link.style.opacity = '0';
      link.style.transition = 'none';
      setTimeout(() => {
        link.style.transition = `opacity 0.2s ease`;
        link.style.opacity = '1';
      }, 120 + i * 45);
    });
    const firstLink = mobileNav.querySelector('a');
    if (firstLink) setTimeout(() => firstLink.focus(), 100);
  }

  function closeMenu() {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Buka menu navigasi');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
    // Reset stagger styles
    mobileNav.querySelectorAll('a').forEach(link => {
      link.style.opacity = '';
      link.style.transition = '';
    });
    burger.focus();
  }

  // Close button inside mobile nav
  const mobileNavClose = document.getElementById('mobile-nav-close');
  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMenu);

  burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when any mobile nav link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
  });

  // Close when clicking outside the nav (on overlay area)
  mobileNav.addEventListener('click', e => {
    if (e.target === mobileNav) closeMenu();
  });
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // ============================================================
  // DESKTOP DROPDOWN "LAINNYA"
  // ============================================================
  const dropBtn   = document.getElementById('nav-dropdown-btn');
  const dropPanel = document.getElementById('nav-dropdown-panel');

  function openDropdown() {
    dropBtn.setAttribute('aria-expanded', 'true');
    dropPanel.classList.add('open');
    dropPanel.setAttribute('aria-hidden', 'false');
  }

  function closeDropdown() {
    dropBtn.setAttribute('aria-expanded', 'false');
    dropPanel.classList.remove('open');
    dropPanel.setAttribute('aria-hidden', 'true');
  }

  if (dropBtn && dropPanel) {
    dropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropBtn.getAttribute('aria-expanded') === 'true' ? closeDropdown() : openDropdown();
    });

    dropPanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDropdown);
    });

    document.addEventListener('click', (e) => {
      if (!dropBtn.contains(e.target) && !dropPanel.contains(e.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropBtn.getAttribute('aria-expanded') === 'true') {
        closeDropdown();
        dropBtn.focus();
      }
    });

    burger.addEventListener('click', closeDropdown);
  }

  // ============================================================
  // COUNTDOWN — Otomatis berganti target sesuai fase IGITA 2026
  // Semua waktu dalam UTC (WIB = UTC+7, jadi jam 08.00 WIB = 01.00 UTC)
  // ============================================================
  const IDS = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'];

  const PHASES = [
    {
      label    : 'Open Registration dalam',
      deadline : new Date('2026-08-01T01:00:00Z'), // 1 Agu 08.00 WIB
    },
    {
      label    : 'Close Registration & Batas Proposal dalam',
      deadline : new Date('2026-08-19T16:59:59Z'), // 19 Agu 23:59 WIB
    },
    {
      label    : 'Technical Meeting dalam',
      deadline : new Date('2026-08-20T11:30:00Z'), // 20 Agu 18.30 WIB
    },
    {
      label    : 'Batas Pengumpulan Proposal dalam',
      deadline : new Date('2026-09-10T17:00:00Z'), // 10 Sep 24.00 WIB
    },
    {
      label    : 'Pre Event berakhir dalam',
      deadline : new Date('2026-09-22T17:00:00Z'), // 22 Sep 24.00 WIB
    },
    {
      label    : 'Awarding dalam',
      deadline : new Date('2026-09-23T02:15:00Z'), // 23 Sep 09.15 WIB
    },
  ];

  function getCurrentPhase() {
    const now = Date.now();
    // Cari fase pertama yang deadlinenya belum lewat
    for (const phase of PHASES) {
      if (phase.deadline.getTime() > now) return phase;
    }
    return null; // semua fase sudah lewat
  }

  function updateCountdown() {
    const phase = getCurrentPhase();
    const labelEl = document.querySelector('.countdown-label');

    if (!phase) {
      // Semua fase selesai — IGITA 2026 sudah berakhir
      if (labelEl) labelEl.textContent = 'IGITA 2026 Telah Selesai';
      IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      // Sembunyikan separator jika mau (opsional)
      return;
    }

    // Update label sesuai fase aktif
    if (labelEl && labelEl.textContent !== phase.label) {
      labelEl.textContent = phase.label;
    }

    const diff = phase.deadline.getTime() - Date.now();
    if (diff <= 0) {
      IDS.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '00'; });
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    const vals = [d, h, m, s];
    IDS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(vals[i]).padStart(2, '0');
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============================================================
  // TIMELINE AUTO-STATUS
  // ============================================================
  function updateTimelineStatus() {
    const now = Date.now();
    document.querySelectorAll('.tl-item').forEach(item => {
      const startStr = item.getAttribute('data-start');
      const endStr   = item.getAttribute('data-end');
      if (!startStr || !endStr) return;

      const start = new Date(startStr).getTime();
      const end   = new Date(endStr);
      end.setHours(23, 59, 59, 999);

      const statusEl = item.querySelector('.tl-status');
      if (!statusEl) return;

      if (now >= start && now <= end.getTime()) {
        item.classList.add('active');
        statusEl.classList.add('open');
      } else if (now > end.getTime()) {
        statusEl.classList.add('closed');
      } else {
        statusEl.classList.add('upcoming');
      }
    });
  }
  updateTimelineStatus();

  // ============================================================
  // SCROLL REVEAL
  // ============================================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // NOTE: Child stagger animation is now handled entirely by CSS
  // (FIX #6: removed the JS stagger that set inline opacity/transform
  //  directly on children, which conflicted with the parent reveal).

  // ============================================================
  // STATUS BAR TICKER — rAF, zero reset-flash, float-precise
  // ============================================================
  function initStatusTicker() {
    const scroll = document.querySelector('.status-scroll');
    if (!scroll) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) return;

    document.fonts.ready.then(() => {
      // 2× rAF: tunggu browser selesai layout setelah font load
      requestAnimationFrame(() => requestAnimationFrame(() => {

        // Ambil span pertama sebagai template, buang sisanya
        const original = scroll.querySelector('span');
        if (!original) return;
        scroll.innerHTML = '';
        scroll.appendChild(original);

        // Float-precise width — bukan offsetWidth yang integer
        const singleW = original.getBoundingClientRect().width;
        if (singleW === 0) return;

        // Clone sampai cukup isi layar × 3 (safety)
        const copies = Math.ceil((window.innerWidth * 3) / singleW) + 1;
        for (let i = 0; i < copies; i++) {
          scroll.appendChild(original.cloneNode(true));
        }

        const PX_PER_SEC = 45; // kecepatan tetap 45px/detik di semua refresh rate
        let pos      = 0;
        let lastTime = null;
        let rafId    = null;

        function tick(timestamp) {
          if (lastTime !== null) {
            const delta = Math.min(timestamp - lastTime, 50); // cap 50ms (tab switch protection)
            pos -= PX_PER_SEC * (delta / 1000);
            if (pos <= -singleW) pos += singleW;
            // translate3d → GPU compositing, tidak ada re-rasterize teks tiap frame
            scroll.style.transform = `translate3d(${pos}px, 0, 0)`;
          }
          lastTime = timestamp;
          rafId = requestAnimationFrame(tick);
        }

        rafId = requestAnimationFrame(tick);

        // Pause saat tab tidak aktif
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            cancelAnimationFrame(rafId); rafId = null;
          } else if (!rafId) {
            rafId = requestAnimationFrame(tick);
          }
        });

        // Recalculate jika resize (font/layout bisa berubah)
        window.addEventListener('resize', () => {
          cancelAnimationFrame(rafId);
          scroll.innerHTML = '';
          scroll.appendChild(original.cloneNode(true));
          initStatusTicker();
        }, { once: true, passive: true });

      }));
    });
  }

  initStatusTicker();

  // ============================================================
  // PARTICLE CANVAS
  // ============================================================
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    const mouse  = { x: null, y: null, radius: 140 };
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const count  = mobile ? 20 : 45;
    const colors = ['rgba(0,212,255,0.35)', 'rgba(6,182,212,0.25)', 'rgba(224,231,255,0.18)'];

    function resize() {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
    resize();

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    class Particle {
      constructor() {
        this.x     = Math.random() * width;
        this.y     = Math.random() * height;
        this.vx    = (Math.random() - 0.5) * 0.3;
        this.vy    = (Math.random() - 0.5) * 0.3;
        this.size  = Math.random() * 1.8 + 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = width;
        if (this.x > width)  this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        if (mouse.x !== null) {
          const dx   = mouse.x - this.x;
          const dy   = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 1.8;
            this.y -= Math.sin(angle) * force * 1.8;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function init() { particles = []; for (let i = 0; i < count; i++) particles.push(new Particle()); }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!prefersReduced.matches) {
      init(); animate();
    } else {
      init(); particles.forEach(p => p.draw());
    }
  }

  initParticles();

  // ============================================================
  // REGISTRATION CLOSED — aktifkan jika deadline sudah lewat
  // ============================================================
  if (isRegistrationClosed()) {
    applyRegistrationClosed();
  }

  // Backdrop click untuk tutup notif modal
  const notifOverlay = document.getElementById('igita-notif-overlay');
  if (notifOverlay) {
    notifOverlay.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('open');
        this.setAttribute('aria-hidden', 'true');
      }
    });
    // Tutup dengan Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && notifOverlay.classList.contains('open')) {
        notifOverlay.classList.remove('open');
        notifOverlay.setAttribute('aria-hidden', 'true');
      }
    });
  }
});