/* ============================================================
   INFIKRE — GLOBAL INTERACTIONS
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// Page Loader
// ─────────────────────────────────────────────────────────────
(function initPageLoader() {
  const loader = document.querySelector('[data-page-loader]');
  const bar    = document.querySelector('.loader-bar');
  if (!loader) return;

  let progress = 0;
  const fakeDuration = 420;

  function tick() {
    progress += Math.random() * 28 + 12;
    if (progress > 94) progress = 94;
    if (bar) bar.style.width = progress + '%';
    if (progress < 94) requestAnimationFrame(tick);
  }

  tick();

  function hideLoader() {
    if (bar) bar.style.width = '100%';
    setTimeout(() => loader.classList.add('is-done'), 180);
    setTimeout(() => loader.remove?.(), 700);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }
})();

// ─────────────────────────────────────────────────────────────
// Mobile Nav
// ─────────────────────────────────────────────────────────────
(function initMobileNav() {
  const navShell   = document.querySelector('.nav-shell');
  const toggle     = document.querySelector('.menu-toggle');
  const hasMenus   = document.querySelectorAll('.has-menu');

  toggle?.addEventListener('click', () => {
    const isOpen = navShell.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  hasMenus.forEach(menu => {
    const btn = menu.querySelector('button');
    btn?.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
      // close siblings
      hasMenus.forEach(m => {
        if (m !== menu) {
          m.classList.remove('is-open');
          const b = m.querySelector('button');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  // close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-shell')) {
      hasMenus.forEach(m => {
        m.classList.remove('is-open');
        const b = m.querySelector('button');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (navShell) navShell.classList.remove('is-open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      }
    }
  });
})();

// ─────────────────────────────────────────────────────────────
// Tabs (Index Page)
// ─────────────────────────────────────────────────────────────
(function initTabs() {
  const wrap      = document.querySelector('.tabs-wrap');
  const tabBtns   = Array.from(document.querySelectorAll('.tab-btn'));
  const panels    = Array.from(document.querySelectorAll('.tab-panel'));
  const tabLinks  = document.querySelectorAll('[data-tab-link]');

  function activateTab(tabId) {
    // Update buttons
    tabBtns.forEach(btn => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active);
      btn.tabIndex = active ? 0 : -1;
    });
    // Update panels
    panels.forEach(p => {
      const active = p.dataset.panel === tabId;
      p.classList.toggle('active', active);
      p.hidden = !active;
    });
    // Set --active via CSS hook on container
    if (wrap) {
      wrap.dataset.active = tabId;
    }
    // Scroll tab button into view
    const activeBtn = tabBtns.find(b => b.dataset.tab === tabId);
    activeBtn?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));

    btn.addEventListener('keydown', e => {
      const lastIndex = tabBtns.length - 1;
      let nextIndex = null;

      if (e.key === 'ArrowRight') nextIndex = i === lastIndex ? 0 : i + 1;
      if (e.key === 'ArrowLeft')  nextIndex = i === 0 ? lastIndex : i - 1;
      if (e.key === 'Home')       nextIndex = 0;
      if (e.key === 'End')        nextIndex = lastIndex;

      if (nextIndex !== null) {
        e.preventDefault();
        activateTab(tabBtns[nextIndex].dataset.tab);
        tabBtns[nextIndex].focus();
      }
    });
  });

  // external tab links (from dropdown)
  tabLinks.forEach(link => {
    link.addEventListener('click', () => {
      let tabId = link.dataset.tabLink;
      if (tabId && tabId !== 'future') {
        activateTab(tabId);
      }
    });
  });
})();

// ─────────────────────────────────────────────────────────────
// Reveal on Scroll
// ─────────────────────────────────────────────────────────────
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

// ─────────────────────────────────────────────────────────────
// Counter animation
// ─────────────────────────────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.counter);
      const duration = prefersReduced ? 1 : 1100;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(node);
    });
  }, { threshold: 0.65 });

  counters.forEach(el => observer.observe(el));
})();

// ─────────────────────────────────────────────────────────────
// Particles (Canvas)
// ─────────────────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.querySelector('.particle-canvas');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.9 + 0.6,
    vx: (Math.random() - 0.5) * 0.00055,
    vy: (Math.random() - 0.5) * 0.00055
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,200,255,.8)';

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!prefersReduced) requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });
})();

// ─────────────────────────────────────────────────────────────
// Page progress bar (optional)
// ─────────────────────────────────────────────────────────────
(function initPageProgress() {
  const bar = document.querySelector('.page-progress');
  if (!bar) return;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ─────────────────────────────────────────────────────────────
// Back to top
// ─────────────────────────────────────────────────────────────
(function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  function update() {
    btn.classList.toggle('visible', window.scrollY > 600);
  }

  window.addEventListener('scroll', update, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  update();
})();

// ─────────────────────────────────────────────────────────────
// Cursor glow (optional, lab page)
// ─────────────────────────────────────────────────────────────
(function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    glow.remove();
    return;
  }

  function move(e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }

  window.addEventListener('pointermove', move, { passive: true });
})();

// ─────────────────────────────────────────────────────────────
// Tilt effect on cards
// ─────────────────────────────────────────────────────────────
(function initTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  if (!cards.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${y * -10}deg) rotateY(${x * 14}deg)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
})();

// ─────────────────────────────────────────────────────────────
// Filter (Brand page)
// ─────────────────────────────────────────────────────────────
(function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items      = document.querySelectorAll('[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.toggle('active', b === btn));
      items.forEach(item => {
        const cats = (item.dataset.category || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        item.classList.toggle('hidden', !show);
      });
    });
  });
})();

// ─────────────────────────────────────────────────────────────
// Billing toggle (Lab page)
// ─────────────────────────────────────────────────────────────
(function initBillingToggle() {
  const wrap = document.querySelector('.billing-toggle');
  const prices = document.querySelectorAll('[data-monthly]');
  if (!wrap) return;

  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.billing-btn');
    if (!btn) return;

    const billing = btn.dataset.billing;
    wrap.querySelectorAll('.billing-btn').forEach(b => b.classList.toggle('active', b === btn));

    prices.forEach(p => {
      p.textContent = p.dataset[billing];
      const suffix = p.parentElement.querySelector('small');
      if (suffix) suffix.textContent = billing === 'yearly' ? '/yr' : '/mo';
    });
  });
})();

// ─────────────────────────────────────────────────────────────
// Lab search + category filtering
// ─────────────────────────────────────────────────────────────
(function initLabFilters() {
  const input   = document.querySelector('[data-lab-search]');
  const select  = document.querySelector('[data-lab-select]');
  const cards   = document.querySelectorAll('[data-lab-category]');

  function filter() {
    const query = (input?.value || '').trim().toLowerCase();
    const cat   = select?.value || 'all';

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const matchQ = !query || text.includes(query);
      const matchC = cat === 'all' || card.dataset.labCategory === cat;
      card.classList.toggle('hidden', !matchQ || !matchC);
    });
  }

  input?.addEventListener('input', filter);
  select?.addEventListener('change', filter);

  const form = document.querySelector('[data-lab-search-form]');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    filter();
    document.querySelector('#categories')?.scrollIntoView({ behavior: 'smooth' });
  });
})();

// ─────────────────────────────────────────────────────────────
// Product actions (Buy + Like) — Lab PSD products
// ─────────────────────────────────────────────────────────────
(function initProductActions() {
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalTitle   = document.querySelector('.modal-product-name');
  const modalBrand   = document.querySelector('.modal-product-brand');
  const modalPrice   = document.querySelector('.modal-product-price');

  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-buy, .btn-buy-sm, [data-buy]');
    if (btn) {
      e.preventDefault();
      // Pull data attributes or fallback to card text
      const card = btn.closest('.product-card') || btn.closest('article');
      const name   = btn.dataset.name || card?.querySelector('.product-title')?.textContent || 'Premium PSD Template';
      const brand  = btn.dataset.brand || card?.querySelector('.product-brand')?.textContent || 'ramarts';
      const price  = btn.dataset.price || card?.querySelector('.product-price')?.textContent?.split(' ')[0] || 'Custom pricing';

      if (modalTitle) modalTitle.textContent = name;
      if (modalBrand) modalBrand.textContent = brand.split(' ')[0].toUpperCase();
      if (modalPrice) modalPrice.textContent = price;

      openModal();
    }
  });

  // Like button toggles
  document.addEventListener('click', e => {
    const likeBtn = e.target.closest('.btn-like');
    if (!likeBtn) return;
    e.preventDefault();

    likeBtn.classList.toggle('liked');
  });

  // Close modal
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target === el) closeModal();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
})();

// ─────────────────────────────────────────────────────────────
// Simple "magnetic" hover effect
// ─────────────────────────────────────────────────────────────
(function initMagnetic() {
  const buttons = document.querySelectorAll('.magnetic');
  if (!buttons.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  buttons.forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.18;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
    });
  });
})();

// ─────────────────────────────────────────────────────────────
// Newsletter form toast
// ─────────────────────────────────────────────────────────────
(function initNewsletter() {
  const form  = document.querySelector('[data-newsletter]');
  const toast = document.querySelector('.toast');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    toast?.classList.add('visible');
    setTimeout(() => toast?.classList.remove('visible'), 2600);
    form.reset();
  });
})();

// ─────────────────────────────────────────────────────────────
// Download count mock (Lab page)
// ─────────────────────────────────────────────────────────────
(function initDownloadCount() {
  const el = document.querySelector('[data-download-count]');
  if (!el) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let current = 0;
  const target = 12480;
  const dur = 1400;
  const start = performance.now();

  function tick(now) {
    const pct = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - pct, 3);
    current = Math.round(target * eased);
    el.textContent = current.toLocaleString() + ' downloads';
    if (pct < 1) requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      requestAnimationFrame(tick);
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(el);
})();

// ─────────────────────────────────────────────────────────────
// Smooth scroll for anchor links
// ─────────────────────────────────────────────────────────────
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
})();

// ─────────────────────────────────────────────────────────────
// Parallax on mouse move
// ─────────────────────────────────────────────────────────────
(function initParallax() {
  const nodes = document.querySelectorAll('[data-parallax]');
  if (!nodes.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - 0.5) * 18;
    const y = (e.clientY / window.innerHeight - 0.5) * 18;
    nodes.forEach(n => {
      n.style.translate = `${x}px ${y}px`;
    });
  }, { passive: true });
})();

// ─────────────────────────────────────────────────────────────
// Logo Intro Animation
// ─────────────────────────────────────────────────────────────
(function initLogoIntro() {
  const intro = document.querySelector('[data-logo-intro]');
  if (!intro) return;

  // Hide intro after animation completes
  const hideIntro = () => {
    intro.classList.add('is-hidden');
    setTimeout(() => intro.remove?.(), 800);
  };

  // Wait for intro animation to complete
  setTimeout(hideIntro, 3300);
})();

// ─────────────────────────────────────────────────────────────
// Subscription Modal & Payment
// ─────────────────────────────────────────────────────────────
(function initSubscriptionModal() {
  const modal = document.querySelector('.modal-overlay');
  const subscribeBtns = document.querySelectorAll('[data-plan]');
  const downloadBtns = document.querySelectorAll('[data-subscribe]');
  const closeBtn = document.querySelector('.modal-close');
  const termsCheckbox = document.querySelector('#agree-terms');
  const payBtn = document.querySelector('.modal-pay-btn');
  const paymentOptions = document.querySelectorAll('.payment-option');
  const planName = document.querySelector('.modal-plan-name');
  const planPrice = document.querySelector('.modal-plan-price');
  const planFeatures = document.querySelector('.modal-plan-features');

  if (!modal) return;

  const planDetails = {
    weekly: { name: 'Weekly Plan', price: '₹199/week', features: '5 PSD downloads/day • Google Drive access' },
    monthly: { name: 'Monthly Plan', price: '₹499/month', features: '10 PSD downloads/day • Google Drive access' },
    yearly: { name: 'Yearly Plan', price: '₹3,999/year', features: '15+ PSD downloads/day • Google Drive access' }
  };

  let selectedPlan = null;
  let selectedPayment = null;

  function openModal(plan) {
    selectedPlan = plan;
    if (planName) planName.textContent = planDetails[plan].name;
    if (planPrice) planPrice.textContent = planDetails[plan].price;
    if (planFeatures) planFeatures.textContent = planDetails[plan].features;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    selectedPayment = null;
    paymentOptions.forEach(opt => opt.classList.remove('active'));
    if (termsCheckbox) termsCheckbox.checked = false;
    if (payBtn) payBtn.disabled = true;
  }

  subscribeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      openModal(plan);
    });
  });

  // Download buttons scroll to pricing
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pricingSection = document.querySelector('#pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // Payment selection
  paymentOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      paymentOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedPayment = opt.dataset.method;
      updatePayButton();
    });
  });

  // Terms checkbox
  termsCheckbox?.addEventListener('change', updatePayButton);

  function updatePayButton() {
    if (payBtn) {
      payBtn.disabled = !(termsCheckbox?.checked && selectedPayment);
    }
  }

  // Pay button - show toast (in real implementation, this would redirect to payment gateway)
  payBtn?.addEventListener('click', () => {
    if (payBtn.disabled) return;

    const toast = document.querySelector('.toast');
    if (toast) {
      toast.textContent = `Redirecting to ${selectedPayment === 'gpay' ? 'Google Pay' : 'UPI'}...`;
      toast.classList.add('show');
    }

    // Simulate payment redirect
    setTimeout(() => {
      if (toast) {
        toast.textContent = 'Payment successful! Check your email for Google Drive access.';
        toast.classList.add('show');
      }
      closeModal();
    }, 2000);

    setTimeout(() => {
      toast?.classList.remove('show');
    }, 5000);
  });
})();

