const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

if (navToggle && nav) {
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    if (!open) navToggle.focus();
  };

  navToggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    const target = event.target;
    if (target instanceof Node && !nav.contains(target) && !navToggle.contains(target)) {
      setOpen(false);
    }
  });
}

document.querySelectorAll("[data-copy-email]").forEach((button) => {
  const originalText = button.textContent || "";
  let resetTimer = null;
  button.addEventListener("click", async () => {
    const email = button.getAttribute("data-copy-email") || "";
    try {
      await navigator.clipboard.writeText(email);
      button.textContent = "E-posta Kopyalandı";
    } catch {
      button.textContent = email;
    }
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  });
});

// Web Vitals telemetry stub: logs LCP, CLS, and INP-candidate measurements
// to the console as `[vitals]` lines so the maintainer can spot-check perf
// in DevTools. Nothing is sent anywhere — wire this to an analytics
// endpoint when one exists.
if ("PerformanceObserver" in window) {
  const log = (name, value, unit = "ms") =>
    console.info(`[vitals] ${name}: ${value}${unit ? " " + unit : ""}`);

  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) log("LCP", Math.round(last.startTime));
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch (_) {}

  try {
    let cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) cls += e.value;
      }
      log("CLS", cls.toFixed(4), "");
    }).observe({ type: "layout-shift", buffered: true });
  } catch (_) {}

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.duration > 100) log("INP candidate", Math.round(e.duration));
      }
    }).observe({ type: "event", durationThreshold: 40, buffered: true });
  } catch (_) {}
}

// Expose the canonical URL via a data attribute so the print stylesheet can
// stamp it as a footer on printouts (CSS can't read window.location).
const canonical = document.querySelector('link[rel="canonical"]');
if (canonical && canonical.href) {
  document.body.dataset.canonical = canonical.href;
}

// Auto-update the copyright year so the footer never goes stale.
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

// Highlight the nav link for the page we're currently on, so visitors always
// know where they are in the site.
const currentPath = window.location.pathname.replace(/\/index\.html$/, "/");
document.querySelectorAll(".site-nav a[href]").forEach((link) => {
  const href = link.getAttribute("href") || "";
  if (!href || href.startsWith("#")) return;
  const resolved = new URL(link.href, window.location.origin).pathname.replace(
    /\/index\.html$/,
    "/",
  );
  if (resolved === currentPath) {
    link.setAttribute("aria-current", "page");
  }
});

// Guide-page enhancements: reading-time pill at the top, share row near the
// disclaimer, and a 3px scroll-progress bar pinned to the viewport. All gated
// on the presence of .guide-content so other page types are unaffected.
const guideContent = document.querySelector(".guide-content");
const guideH1 = guideContent && guideContent.querySelector("h1");
if (guideContent && guideH1) {
  const text = guideContent.innerText || guideContent.textContent || "";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const rt = document.createElement("p");
  rt.className = "reading-time";
  rt.textContent = `~${minutes} dk okuma · ${words.toLocaleString("tr-TR")} kelime`;
  guideH1.parentNode.insertBefore(rt, guideH1.nextSibling);

  const shareUrl = (canonical && canonical.href) || window.location.href;
  const shareTitle = document.title;
  const wa = `https://wa.me/?text=${encodeURIComponent(shareTitle + " — " + shareUrl)}`;
  const mail = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareTitle + "\n\n" + shareUrl)}`;
  const nativeShareSupported = typeof navigator.share === "function";
  const shareRow = document.createElement("div");
  shareRow.className = "share-row";
  shareRow.innerHTML =
    '<span>Paylaş:</span>' +
    `<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` +
    `<a href="${mail}">E-posta</a>` +
    '<button type="button" data-share-copy>Bağlantıyı kopyala</button>' +
    (nativeShareSupported ? '<button type="button" data-share-native>Daha fazla seçenek…</button>' : "");
  const disclaimer = guideContent.querySelector(".guide-disclaimer");
  if (disclaimer) {
    disclaimer.parentNode.insertBefore(shareRow, disclaimer);
  } else {
    guideContent.appendChild(shareRow);
  }
  const copyBtn = shareRow.querySelector("[data-share-copy]");
  if (copyBtn) {
    const original = copyBtn.textContent || "";
    let resetTimer = null;
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        copyBtn.textContent = "Kopyalandı";
      } catch {
        copyBtn.textContent = shareUrl;
      }
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { copyBtn.textContent = original; }, 2000);
    });
  }

  const nativeBtn = shareRow.querySelector("[data-share-native]");
  if (nativeBtn) {
    nativeBtn.addEventListener("click", async () => {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch (err) {
        // User cancelled the share sheet — nothing to do.
      }
    });
  }

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);
  const updateProgress = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const ratio = scrollable > 0 ? doc.scrollTop / scrollable : 0;
    progress.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();
}

// Back-to-top floating button, site-wide on pages with <main>.
const mainEl = document.getElementById("main");
if (mainEl) {
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.type = "button";
  btn.setAttribute("aria-label", "Sayfanın başına dön");
  btn.textContent = "↑";
  document.body.appendChild(btn);
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainEl.focus();
  });
  const toggle = () => btn.classList.toggle("is-visible", window.scrollY > 600);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

// Surface a success banner when FormSubmit redirects back with ?sent=1, so the
// visitor sees an acknowledgement instead of an empty form.
const contactForm = document.getElementById("contact-form");
const formSuccess = document.querySelector("[data-form-success]");
if (contactForm && formSuccess) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
    contactForm.reset();
    const cleanUrl = window.location.pathname + window.location.hash;
    history.replaceState(null, "", cleanUrl);
  }
  contactForm.addEventListener("submit", () => {
    const submit = contactForm.querySelector('button[type="submit"]');
    if (submit) {
      submit.disabled = true;
      submit.dataset.originalText = submit.textContent || "";
      submit.textContent = "Gönderiliyor…";
    }
  });
}

const filterButtons = document.querySelectorAll(".filter-bar .filter");
const guideCards = document.querySelectorAll(".guide-grid .guide-card");
const searchInput = document.getElementById("guide-search");
const searchStatus = document.querySelector("[data-search-status]");

const applyChipFilter = (btn) => {
  const filter = btn.dataset.filter || "all";
  const matchers = filter === "all" ? null : filter.split("|");
  filterButtons.forEach((b) => {
    const active = b === btn;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  guideCards.forEach((card) => {
    const span = card.querySelector("span");
    const cat = span ? span.textContent.trim() : "";
    const visible = !matchers || matchers.includes(cat);
    card.classList.toggle("is-hidden", !visible);
  });
};

if (filterButtons.length && guideCards.length) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (searchInput && searchInput.value) {
        searchInput.value = "";
        if (searchStatus) searchStatus.textContent = "";
      }
      applyChipFilter(btn);
    });
  });
}

// Client-side guide search on /rehberler.html. Index is lazy-loaded the first
// time the visitor focuses the input, so the JSON only ships when needed.
if (searchInput && guideCards.length) {
  const normalize = (s) =>
    (s || "")
      .toLowerCase()
      .replace(/ı/g, "i").replace(/İ/g, "i")
      .replace(/ş/g, "s").replace(/Ş/g, "s")
      .replace(/ç/g, "c").replace(/Ç/g, "c")
      .replace(/ğ/g, "g").replace(/Ğ/g, "g")
      .replace(/ü/g, "u").replace(/Ü/g, "u")
      .replace(/ö/g, "o").replace(/Ö/g, "o");

  let index = null;
  let indexPromise = null;
  const loadIndex = () => {
    if (indexPromise) return indexPromise;
    indexPromise = fetch("../assets/search-index.json")
      .then((r) => r.json())
      .then((d) => { index = d; return d; })
      .catch(() => { indexPromise = null; });
    return indexPromise;
  };

  const runSearch = (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      if (searchStatus) searchStatus.textContent = "";
      const activeChip = document.querySelector(".filter-bar .filter.is-active")
        || document.querySelector('.filter-bar .filter[data-filter="all"]');
      if (activeChip) applyChipFilter(activeChip);
      return;
    }
    if (!index) {
      if (searchStatus) searchStatus.textContent = "Yükleniyor…";
      loadIndex().then(() => runSearch(trimmed));
      return;
    }
    const q = normalize(trimmed);
    const matching = new Set();
    for (const item of index.items) {
      const hay = normalize(`${item.title} ${item.excerpt} ${item.tag}`);
      if (hay.includes(q)) matching.add(item.url);
    }
    let visibleCount = 0;
    guideCards.forEach((card) => {
      const href = card.getAttribute("href") || "";
      const matched = matching.has(href);
      card.classList.toggle("is-hidden", !matched);
      if (matched) visibleCount++;
    });
    filterButtons.forEach((b) => {
      const isAll = b.dataset.filter === "all";
      b.classList.toggle("is-active", isAll);
      b.setAttribute("aria-pressed", String(isAll));
    });
    if (searchStatus) {
      searchStatus.textContent =
        visibleCount === 0 ? "Sonuç bulunamadı." :
        visibleCount === 1 ? "1 rehber bulundu." :
        `${visibleCount.toLocaleString("tr-TR")} rehber bulundu.`;
    }
  };

  searchInput.addEventListener("focus", loadIndex);
  searchInput.addEventListener("input", (e) => runSearch(e.target.value));
}
