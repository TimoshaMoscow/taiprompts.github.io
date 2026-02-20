// ===== Главный файл инициализации =====

async function inject(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  const res = await fetch(url, { cache: "no-store" });
  el.innerHTML = await res.text();
}

function setActiveNavLink() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle("active", href === path);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Загружаем компоненты
  await inject("site-header", "components/header.html");
  await inject("site-footer", "components/footer.html");
  
  // Инициализируем модули
  if (window.TAIPrompts) {
    TAIPrompts.core.initCookieBanner();
    TAIPrompts.core.initNav();
    setActiveNavLink();
    TAIPrompts.core.incPathView(location.pathname);
    
    TAIPrompts.ui.initAnimations();
    TAIPrompts.ui.initLightbox();
    TAIPrompts.ui.initSearch();
    
    TAIPrompts.generator.init();
    
    TAIPrompts.pages.initFaq();
    TAIPrompts.pages.initIndex();
    
    TAIPrompts.debug.run();
  }

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.error("SW error:", err));
  }
});
