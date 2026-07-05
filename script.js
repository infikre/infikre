const navShell = document.querySelector(".nav-shell");
const menuToggle = document.querySelector(".menu-toggle");
const dropdownTriggers = document.querySelectorAll(".has-menu > button");
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const tabLinks = document.querySelectorAll("[data-tab-link]");

function closeDropdowns(except) {
  document.querySelectorAll(".has-menu").forEach((item) => {
    if (item !== except) {
      item.classList.remove("is-open");
      const trigger = item.querySelector("button");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    }
  });
}

menuToggle?.addEventListener("click", () => {
  const isOpen = navShell.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

dropdownTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.closest(".has-menu");
    const isOpen = item.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
    closeDropdowns(item);
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-shell")) {
    closeDropdowns();
  }
});

function activateTab(tabId, shouldFocus = false) {
  const nextTab = tabs.find((tab) => tab.dataset.tab === tabId);
  const nextPanel = panels.find((panel) => panel.dataset.panel === tabId);
  if (!nextTab || !nextPanel) return;

  tabs.forEach((tab) => {
    const isActive = tab === nextTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isActive = panel === nextPanel;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  nextTab.scrollIntoView({ block: "nearest", inline: "center" });
  if (shouldFocus) nextTab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab.dataset.tab));

  tab.addEventListener("keydown", (event) => {
    const lastIndex = tabs.length - 1;
    let nextIndex = null;

    if (event.key === "ArrowRight") nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === "ArrowLeft") nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;

    if (nextIndex !== null) {
      event.preventDefault();
      activateTab(tabs[nextIndex].dataset.tab, true);
    }
  });
});

tabLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const tabId = link.dataset.tabLink === "future" ? "lab" : link.dataset.tabLink;
    activateTab(tabId);
    navShell.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    closeDropdowns();
  });
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.Lenis && !prefersReducedMotion) {
  const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

const revealItems = document.querySelectorAll(".reveal-on-scroll");
if (revealItems.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const counters = document.querySelectorAll("[data-counter]");
if (counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.counter);
      const suffix = target === 3 ? "" : "";
      const duration = prefersReducedMotion ? 1 : 1100;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(node);
    });
  }, { threshold: 0.6 });

  counters.forEach((counter) => counterObserver.observe(counter));
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
    document.querySelectorAll(".brand-portfolio-grid article").forEach((item) => {
      const categories = item.dataset.category || "";
      item.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

document.querySelectorAll("[data-tilt]").forEach((card) => {
  if (prefersReducedMotion) return;

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `rotateX(${y * -8}deg) rotateY(${x * 10}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.querySelectorAll("[data-parallax]").forEach((node) => {
  if (prefersReducedMotion) return;

  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 18;
    const y = (event.clientY / window.innerHeight - 0.5) * 18;
    node.style.translate = `${x}px ${y}px`;
  }, { passive: true });
});

const particleCanvas = document.querySelector("[data-particles]");
if (particleCanvas) {
  const ctx = particleCanvas.getContext("2d");
  const particles = Array.from({ length: 58 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.8 + 0.6,
    vx: (Math.random() - 0.5) * 0.00055,
    vy: (Math.random() - 0.5) * 0.00055
  }));

  function sizeCanvas() {
    const rect = particleCanvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    particleCanvas.width = Math.round(rect.width * ratio);
    particleCanvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawParticles() {
    const width = particleCanvas.clientWidth;
    const height = particleCanvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0, 199, 255, 0.82)";

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > 1) particle.vx *= -1;
      if (particle.y < 0 || particle.y > 1) particle.vy *= -1;

      ctx.beginPath();
      ctx.arc(particle.x * width, particle.y * height, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!prefersReducedMotion) requestAnimationFrame(drawParticles);
  }

  sizeCanvas();
  drawParticles();
  window.addEventListener("resize", sizeCanvas, { passive: true });
}

if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".timeline li", {
    scrollTrigger: { trigger: ".timeline", start: "top 78%" },
    y: 24,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: "power2.out"
  });
}

const labLoader = document.querySelector("[data-lab-loader]");
if (labLoader) {
  window.addEventListener("load", () => {
    window.setTimeout(() => labLoader.classList.add("is-hidden"), 350);
  });
}

const labProgress = document.querySelector("[data-lab-progress]");
const backTop = document.querySelector("[data-back-top]");
function updateLabScrollUi() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  if (labProgress) labProgress.style.width = `${progress}%`;
  if (backTop) backTop.classList.toggle("is-visible", window.scrollY > 700);
}
if (labProgress || backTop) {
  updateLabScrollUi();
  window.addEventListener("scroll", updateLabScrollUi, { passive: true });
}

backTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const cursorGlow = document.querySelector("[data-cursor-glow]");
if (cursorGlow && !prefersReducedMotion) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });
}

document.querySelectorAll(".magnetic").forEach((button) => {
  if (prefersReducedMotion) return;

  button.addEventListener("pointermove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
    button.style.transform = `translate(${x}px, ${y}px)`;
  });

  button.addEventListener("pointerleave", () => {
    button.style.transform = "";
  });
});

document.querySelectorAll("[data-billing]").forEach((button) => {
  button.addEventListener("click", () => {
    const billing = button.dataset.billing;
    document.querySelectorAll("[data-billing]").forEach((item) => item.classList.toggle("is-active", item === button));
    document.querySelectorAll(".price-card b[data-monthly]").forEach((price) => {
      price.textContent = price.dataset[billing];
      const suffix = price.parentElement.querySelector("small");
      if (suffix) suffix.textContent = billing === "yearly" ? "/yr" : "/mo";
    });
  });
});

const labSearchInput = document.querySelector("[data-lab-search]");
const labSearchSelect = document.querySelector("[data-lab-select]");
const labSearchForm = document.querySelector("[data-lab-search-form]");
function filterLabCategories() {
  const query = (labSearchInput?.value || "").trim().toLowerCase();
  const category = labSearchSelect?.value || "all";
  document.querySelectorAll("[data-lab-category]").forEach((card) => {
    const text = card.textContent.toLowerCase();
    const matchesText = !query || text.includes(query);
    const matchesCategory = category === "all" || card.dataset.labCategory === category;
    card.classList.toggle("is-hidden", !matchesText || !matchesCategory);
  });
}
labSearchInput?.addEventListener("input", filterLabCategories);
labSearchSelect?.addEventListener("change", filterLabCategories);
labSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  filterLabCategories();
  document.querySelector("#categories")?.scrollIntoView({ behavior: "smooth" });
});

const newsletter = document.querySelector("[data-newsletter]");
const toast = document.querySelector("[data-toast]");
newsletter?.addEventListener("submit", (event) => {
  event.preventDefault();
  toast?.classList.add("is-visible");
  window.setTimeout(() => toast?.classList.remove("is-visible"), 2600);
  newsletter.reset();
});

if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
  gsap.from(".lab-feature-bar article, .lab-steps li, .price-card, .lab-category-grid article, .security-grid article", {
    scrollTrigger: { trigger: ".lab-feature-bar", start: "top 82%" },
    y: 20,
    opacity: 0,
    duration: 0.65,
    stagger: 0.045,
    ease: "power2.out"
  });
}
