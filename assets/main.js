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
  button.addEventListener("click", async () => {
    const email = button.getAttribute("data-copy-email") || "";
    try {
      await navigator.clipboard.writeText(email);
      button.textContent = "E-posta Kopyalandı";
    } catch {
      button.textContent = email;
    }
  });
});

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
