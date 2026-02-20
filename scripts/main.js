// ===== Главный файл инициализации =====

async function inject(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      el.innerHTML = await res.text();
    }
  } catch (e) {
    console.error(`Ошибка загрузки ${url}:`, e);
  }
}

function setActiveNavLink() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle("active", href === path);
  });
}

// Функция для инициализации всего с задержкой
function initAll() {
  console.log("🚀 Инициализация TAIPrompts...");
  
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
    // Переинициализируем карточки через небольшую задержку
    setTimeout(() => {
      if (window.TAIPrompts.generator.reinitCards) {
        window.TAIPrompts.generator.reinitCards();
      }
    }, 500);
  }
  
  if (window.TAIPrompts?.pages) {
    // Задержка для FAQ, чтобы убедиться что DOM готов
    setTimeout(() => {
      window.TAIPrompts.pages.initFaq();
      window.TAIPrompts.pages.initIndex();
    }, 300);
  }
  
  if (window.TAIPrompts?.debug) {
    window.TAIPrompts.debug.run();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM загружен, начинаем загрузку компонентов...");
  
  // Загружаем компоненты
  await inject("site-header", "components/header.html");
  await inject("site-footer", "components/footer.html");
  
  // Даем время на отрисовку компонентов
  setTimeout(initAll, 200);

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

// Дополнительная инициализация после полной загрузки страницы
window.addEventListener('load', function() {
  console.log("Страница полностью загружена");
  
  // Еще раз пробуем инициализировать FAQ и карточки
  if (window.TAIPrompts?.pages) {
    window.TAIPrompts.pages.initFaq();
  }
  
  if (window.TAIPrompts?.generator?.reinitCards) {
    window.TAIPrompts.generator.reinitCards();
  }
});
