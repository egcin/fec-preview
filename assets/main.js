const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
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
