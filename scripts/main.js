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
  
  // Инициализируем модули (проверяем их наличие)
  if (window.TAIPrompts?.core) {
    window.TAIPrompts.core.initCookieBanner();
    window.TAIPrompts.core.initNav();
    setActiveNavLink();
    window.TAIPrompts.core.incPathView(location.pathname);
  }
  
  if (window.TAIPrompts?.ui) {
    window.TAIPrompts.ui.initAnimations();
    window.TAIPrompts.ui.initLightbox();
    window.TAIPrompts.ui.initSearch();
  }
  
  if (window.TAIPrompts?.generator) {
    window.TAIPrompts.generator.init();
  }
  
  if (window.TAIPrompts?.pages) {
    window.TAIPrompts.pages.initFaq();
    window.TAIPrompts.pages.initIndex();
  }
  
  if (window.TAIPrompts?.debug) {
    window.TAIPrompts.debug.run();
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
