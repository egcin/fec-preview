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

// Expose the canonical URL via a data attribute so the print stylesheet can
// stamp it as a footer on printouts (CSS can't read window.location).
const canonical = document.querySelector('link[rel="canonical"]');
if (canonical && canonical.href) {
  document.body.dataset.canonical = canonical.href;
}

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
  const shareRow = document.createElement("div");
  shareRow.className = "share-row";
  shareRow.innerHTML =
    '<span>Paylaş:</span>' +
    `<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` +
    `<a href="${mail}">E-posta</a>` +
    '<button type="button" data-share-copy>Bağlantıyı kopyala</button>';
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

if (filterButtons.length && guideCards.length) {
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
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
    });
  });
}
