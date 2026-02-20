// ===== Cookie, согласие, статистика, навигация =====

const TAIPrompts = window.TAIPrompts || {};
TAIPrompts.core = {};

// Cookie utils
TAIPrompts.core.setCookie = function(name, value, days = 365) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; samesite=lax`;
};

TAIPrompts.core.getCookie = function(name) {
  const n = encodeURIComponent(name) + "=";
  const parts = document.cookie.split("; ");
  for (const p of parts) {
    if (p.startsWith(n)) return decodeURIComponent(p.slice(n.length));
  }
  return null;
};

// Consent
const CONSENT_COOKIE = "tp_consent";
const STATS_COOKIE = "tp_stats";

TAIPrompts.core.hasConsent = function() {
  return TAIPrompts.core.getCookie(CONSENT_COOKIE) === "accepted";
};

TAIPrompts.core.getStats = function() {
  const raw = TAIPrompts.core.getCookie(STATS_COOKIE);
  if (!raw) return { v: 1, pageViews: {}, categoryClicks: {}, generations: 0 };
  try {
    return JSON.parse(raw);
  } catch {
    return { v: 1, pageViews: {}, categoryClicks: {}, generations: 0 };
  }
};

TAIPrompts.core.saveStats = function(stats) {
  TAIPrompts.core.setCookie(STATS_COOKIE, JSON.stringify(stats), 365);
};

TAIPrompts.core.incPathView = function(path) {
  if (!TAIPrompts.core.hasConsent()) return;
  const stats = TAIPrompts.core.getStats();
  stats.pageViews[path] = (stats.pageViews[path] || 0) + 1;
  TAIPrompts.core.saveStats(stats);
};

TAIPrompts.core.incCategory = function(type) {
  if (!TAIPrompts.core.hasConsent()) return;
  const stats = TAIPrompts.core.getStats();
  stats.categoryClicks[type] = (stats.categoryClicks[type] || 0) + 1;
  TAIPrompts.core.saveStats(stats);
};

TAIPrompts.core.incGeneration = function() {
  if (!TAIPrompts.core.hasConsent()) return;
  const stats = TAIPrompts.core.getStats();
  stats.generations = (stats.generations || 0) + 1;
  TAIPrompts.core.saveStats(stats);
};

// Cookie banner
TAIPrompts.core.initCookieBanner = function() {
  const existing = TAIPrompts.core.getCookie(CONSENT_COOKIE);
  if (existing === "accepted") return;

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.innerHTML = `
    <div class="cookie-banner__inner">
      <div class="cookie-banner__text">
        Мы используем файлы cookies, чтобы улучшить Ваши впечатления от использования сайта. 
        Нажимая на кнопку 'Принять', вы даете нам разрешение на их использование.
      </div>
      <div class="cookie-banner__actions">
        <button class="btn btn-primary cookie-accept">Принять</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  banner.querySelector(".cookie-accept").addEventListener("click", () => {
    TAIPrompts.core.setCookie(CONSENT_COOKIE, "accepted", 365);
    banner.remove();
    TAIPrompts.core.incPathView(location.pathname);
  });
};

// Navigation
TAIPrompts.core.initNav = function() {
  const burger = document.querySelector(".burger");
  const navList = document.querySelector(".nav-list");
  const navLinks = document.querySelectorAll(".nav-link");

  if (burger && navList) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      navList.classList.toggle("active");
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (navList?.classList.contains("active")) {
        navList.classList.remove("active");
        burger?.classList.remove("active");
      }
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
        }
      }
    });
  });

  const sections = document.querySelectorAll("section[id]");
  if (sections.length) {
    window.addEventListener("scroll", () => {
      let current = "";
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 100) current = section.id;
      });
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          link.classList.toggle("active", href === `#${current}`);
        }
      });
    });
  }
};

window.TAIPrompts = TAIPrompts;
