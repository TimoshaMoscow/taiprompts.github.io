// ===== Главный файл инициализации =====

const TAIPrompts = window.TAIPrompts || {};

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
  
  // Инициализируем модули (проверяем их наличие)
  if (TAIPrompts.core) {
    TAIPrompts.core.initCookieBanner();
    TAIPrompts.core.initNav();
    setActiveNavLink();
    TAIPrompts.core.incPathView(location.pathname);
  }
  
  if (TAIPrompts.ui) {
    TAIPrompts.ui.initAnimations();
    TAIPrompts.ui.initLightbox();
    TAIPrompts.ui.initSearch();
  }
  
  if (TAIPrompts.generator) {
    TAIPrompts.generator.init();
  }
  
  if (TAIPrompts.pages) {
    TAIPrompts.pages.initFaq();
    TAIPrompts.pages.initIndex();
  }
  
  if (TAIPrompts.debug) {
    TAIPrompts.debug.run();
  }

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.error("SW error:", err));
  }
  
  // Защита от закрытия на странице генератора
  if (window.location.pathname.includes('generator.html') || 
      window.location.pathname.endsWith('generator.html') ||
      window.location.pathname.endsWith('/generator')) {
    window.addEventListener('beforeunload', function(event) {
      // Проверяем, открыта ли модалка с несохраненными изменениями
      const modal = document.querySelector('.customization-modal.active');
      if (modal) {
        event.preventDefault();
        event.returnValue = '';
      }
    });
  }
});
