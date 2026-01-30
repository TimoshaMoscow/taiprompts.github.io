// ===== Push Notifications =====
const publicVapidKey = 'BCBq3QR9iEjgOXLnElnkvjdEnIkgeBLoff5E_S6k9G7NXB7xOfyNdAaQhAz7nb9qr4e7aZg6S4yvbEu7hllX_8E';

async function inject(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  const res = await fetch(url, { cache: "no-store" });
  el.innerHTML = await res.text();
}

// ===== Cookie Utils =====
function setCookie(name, value, days = 365) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; samesite=lax`;
}

function getCookie(name) {
  const n = encodeURIComponent(name) + "=";
  const parts = document.cookie.split("; ");
  for (const p of parts) {
    if (p.startsWith(n)) return decodeURIComponent(p.slice(n.length));
  }
  return null;
}

// ===== Consent + Stats =====
const CONSENT_COOKIE = "tp_consent"; // accepted | declined
const STATS_COOKIE = "tp_stats";     // json

function hasConsent() {
  return getCookie(CONSENT_COOKIE) === "accepted";
}

function getStats() {
  const raw = getCookie(STATS_COOKIE);
  if (!raw) return { v: 1, pageViews: {}, categoryClicks: {}, generations: 0 };
  try {
    return JSON.parse(raw);
  } catch {
    return { v: 1, pageViews: {}, categoryClicks: {}, generations: 0 };
  }
}

function saveStats(stats) {
  // Важно: cookies ограничены по размеру, поэтому храним компактно
  setCookie(STATS_COOKIE, JSON.stringify(stats), 365);
}

function incPathView(path) {
  if (!hasConsent()) return;
  const stats = getStats();
  stats.pageViews[path] = (stats.pageViews[path] || 0) + 1;
  saveStats(stats);
}

function incCategory(type) {
  if (!hasConsent()) return;
  const stats = getStats();
  stats.categoryClicks[type] = (stats.categoryClicks[type] || 0) + 1;
  saveStats(stats);
}

function incGeneration() {
  if (!hasConsent()) return;
  const stats = getStats();
  stats.generations = (stats.generations || 0) + 1;
  saveStats(stats);
}

// ===== Cookie Banner (создаётся JS-ом, HTML менять не надо) =====
function initCookieBanner() {
  const existing = getCookie(CONSENT_COOKIE);
  if (existing === "accepted" || existing === "declined") return;

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.innerHTML = `
    <div class="cookie-banner__inner">
      <div class="cookie-banner__text">
        Мы используем cookies для простой статистики и сводки.
        Никаких сторонних сервисов.
      </div>
      <div class="cookie-banner__actions">
        <button class="btn btn-secondary cookie-decline">Отказаться</button>
        <button class="btn btn-primary cookie-accept">Принять</button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  banner.querySelector(".cookie-accept").addEventListener("click", () => {
    setCookie(CONSENT_COOKIE, "accepted", 365);
    banner.remove();

    // Сразу запишем просмотр текущей страницы после согласия
    incPathView(location.pathname);
  });

  banner.querySelector(".cookie-decline").addEventListener("click", () => {
    setCookie(CONSENT_COOKIE, "declined", 365);
    banner.remove();
  });
}

function setActiveNavLink() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle("active", href === path);
  });
}

function initNav() {
  const burger = document.querySelector(".burger");
  const navList = document.querySelector(".nav-list");
  const navLinks = document.querySelectorAll(".nav-link");

  // Бургер меню
  if (burger && navList) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      navList.classList.toggle("active");
    });
  }

  // Навигация + закрытие меню на мобилке
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      if (navList?.classList.contains("active")) {
        navList.classList.remove("active");
        burger?.classList.remove("active");
      }

      // Якоря (#)
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });
        }
      }
    });
  });

  // ScrollSpy (только для якорей)
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
}

function initAnimations() {
  const animatedElements = document.querySelectorAll(
    ".card, .section-title, .type-card, .gallery-item, .possibility-card"
  );

  function checkScroll() {
    animatedElements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      if (elementPosition < screenPosition) element.classList.add("fade-in");
    });
  }

  window.addEventListener("scroll", checkScroll);
  window.addEventListener("load", checkScroll);

  // delay-* для карточек типов
  document.querySelectorAll(".type-card").forEach((card, index) => {
    card.classList.add(`delay-${index % 3}`);
  });

  checkScroll();
}

function initLightbox() {
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.querySelector(".lightbox-caption");
  const closeLightbox = document.querySelector(".close-lightbox");

  if (!galleryItems.length || !lightbox || !lightboxImg || !closeLightbox) return;

  galleryItems.forEach((item) => {
    item.addEventListener("click", function () {
      const img = this.querySelector("img");
      const imgSrc = img?.getAttribute("data-full") || img?.getAttribute("src");
      const caption = this.querySelector("h4")?.textContent || "";

      if (imgSrc) lightboxImg.setAttribute("src", imgSrc);
      if (lightboxCaption) lightboxCaption.textContent = caption;

      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  closeLightbox.addEventListener("click", () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });
}

function initGenerator() {

  const typeCards = document.querySelectorAll(".type-card");
  const generationSection = document.querySelector(".generation");

  if (typeCards.length === 0 || !generationSection) {
    console.log("Генератор не найден на этой странице");
    return;
  }

  console.log("🚀 Инициализация генератора промптов...");

  // В main.js, в начале initGenerator()
const censorDictionary = {
    // Русский мат
    'хуй': '*',
    'пизда': '*', 
    'ебал': '*',
    'блядь': '*',
    'блять': '*',
    'трах': '*',
    'ебанат': '**',
    'пиздец': '*',
    'охуен': '*',
    'хуев': '*',
    'нахуй': '*',
    'похуй': '*',
    'сука': '*',
    'заеб': '*',
    'выебал': '*',
    'долбоеб': '**',
    'ебать': '*',
    'секс': '*',
    'сексуальн': '*',
  
    // Производные и варианты
    'жопа': '*',
    'срака': '*',
    'хер': '*',
    'мудак': '**',
    'гандон': '*',
    'петух': '**',
    'шлюха': '*',
    
    // Английский мат
    'fuck': '*',
    'shit': '*',
    'bitch': '*',
    'asshole': '*',
    'dick': '*',
    'pussy': '*',
    'cock': '*',
    'cum': '*',
};

// Ценз
function censorText(text) {
    if (!text) return text;
    
    let censored = text.toLowerCase();
    
    // Сортируем ключи от самых длинных к коротким
    const sortedKeys = Object.keys(censorDictionary).sort((a, b) => b.length - a.length);
    
    sortedKeys.forEach(badWord => {
        const regex = new RegExp(badWord, 'gi');
        censored = censored.replace(regex, censorDictionary[badWord]);
    });
    
    if (censored !== text.toLowerCase()) {
        return censored.charAt(0).toUpperCase() + censored.slice(1);
    }
    
    return text;
}

// ===== Функция для обновления цвета в select =====
function updateColorSelect(select) {
  if (!select) return;
  const selectedValue = select.value;
  select.setAttribute('data-value', selectedValue);
  
  const colorMatch = selectedValue.match(/\((#[\da-f]{6})\)/i);
  if (colorMatch) {
    select.style.setProperty('--selected-color', colorMatch[1]);
  }
}

// Инициализация при загрузке
window.addEventListener('load', function() {
  document.querySelectorAll('.color-select').forEach(updateColorSelect);
});

const promptTemplates = {
  recipes: {
    name: "Рецепты",
    template: function(params, idea, tone) {
      const { cuisine, dietary, complexity } = params;
      
      // Логика для измерений
      let measurements = "в граммах и миллилитрах";
      if (cuisine.includes("русской") || cuisine.includes("американской")) {
        measurements = "в стаканах, ложках и граммах";
      }
      
      // Логика для сложности
      let timeNote = "";
      if (complexity.includes("Простое")) {
        timeNote = "Время приготовления до 30 минут. ";
      } else if (complexity.includes("Сложное")) {
        timeNote = "Время приготовления 1.5-3 часа. ";
      }
      
      // Логика для диеты
      let dietNote = "";
      if (dietary.includes("Веган")) {
        dietNote = "Исключите все продукты животного происхождения. ";
      } else if (dietary.includes("Высокобелковое")) {
        dietNote = "Акцент на белковые ингредиенты. ";
      }
      
      let tonePrefix = "";
      switch (tone) {
        case "professional": tonePrefix = "Используй профессиональный кулинарный язык. "; break;
        case "friendly": tonePrefix = "Будь дружелюбным и приветливым. "; break;
        case "creative": tonePrefix = "Прояви креативность и оригинальность. "; break;
        case "technical": tonePrefix = "Сфокусируйся на технических деталях. "; break;
        case "detailed": tonePrefix = "Дай максимально детализированный ответ. "; break;
      }
      
      return `${tonePrefix}Создай подробный рецепт ${cuisine} кухни, блюда с описанием: '${idea}'. 
Ограничения: ${dietary}, Сложность: ${complexity}. 
${timeNote}${dietNote}
Включи ингредиенты ${measurements}, пошаговое приготовление, время готовки и полезную информацию, например КБЖУ.

Промпт создан с помощью TAIPrompts`;
    },
    params: {
      cuisine: {
        type: "select",
        label: "Тип кухни",
        options: ["любой", "итальянской", "азиатской", "мексиканской", "русской", "французской", "средиземноморской"],
        default: "любой",
      },
      dietary: {
        type: "select",
        label: "Диетические требования",
        options: ["Без ограничений", "Веганское", "Вегетарианское", "Без глютена", "Низкоуглеводное", "Высокобелковое"],
        default: "Без ограничений",
      },
      complexity: {
        type: "select",
        label: "Сложность",
        options: ["Простое", "Средней сложности", "Сложное", "Шеф-повар"],
        default: "Средней сложности",
      },
    },
  },

  websites: {
    name: "Веб-сайты",
    template: function(params, idea, tone) {
      const { type, stack, style, color, features, additionally } = params;
      
      // Автоподстановка языка и фреймворков
      let stackDetails = stack;
      let backendLang = "";
      
      if (stack === "React") {
        stackDetails = "React (JavaScript/TypeScript)";
        backendLang = "Node.js (JavaScript)";
      } else if (stack === "Vue.js") {
        stackDetails = "Vue.js (JavaScript)";
        backendLang = "Node.js (JavaScript)";
      } else if (stack === "Angular") {
        stackDetails = "Angular (TypeScript)";
        backendLang = "Node.js (TypeScript)";
      } else if (stack === "Node.js") {
        stackDetails = "Node.js (JavaScript) с Express.js";
        backendLang = "Node.js (JavaScript)";
      } else if (stack === "Python/Django") {
        stackDetails = "Django (Python)";
        backendLang = "Django (Python)";
      } else if (stack === "Ruby on Rails") {
        stackDetails = "Ruby on Rails (Ruby)";
        backendLang = "Ruby on Rails (Ruby)";
      }
      
      // Логика для бекенда
      let backendNote = "";
      if (features.includes("Бекенд")) {
        backendNote = `Бекенд: ${backendLang} с REST API. `;
      }
      
      // Логика для PWA
      let pwaDetails = "";
      if (features.includes("PWA")) {
        pwaDetails = "Service Worker для оффлайн-режима, манифест, добавление на главный экран. ";
      }
      
      // Логика для адаптивности
      let responsiveDetails = "";
      if (features.includes("Адаптивный дизайн")) {
        responsiveDetails = "Адаптация под мобильные устройства, планшеты и десктоп. ";
      }
      
      // Логика для SEO
      let seoDetails = "";
      if (features.includes("SEO оптимизация")) {
        seoDetails = "Семантическая разметка, мета-теги, скорость загрузки. ";
      }
      
      let tonePrefix = "";
      switch (tone) {
        case "professional": tonePrefix = "Используй профессиональный технический язык. "; break;
        case "friendly": tonePrefix = "Будь дружелюбным и приветливым. "; break;
        case "creative": tonePrefix = "Прояви креативность и оригинальность. "; break;
        case "technical": tonePrefix = "Сфокусируйся на технических деталях. "; break;
        case "detailed": tonePrefix = "Дай максимально детализированный ответ. "; break;
      }
      
      return `${tonePrefix}Разработай веб-сайт типа "${type}" на ${stackDetails} по описанию: "${idea}". 
${backendNote}${responsiveDetails}${pwaDetails}${seoDetails}
Основная палитра: ${color}. Стиль сайта: ${style}.

Включи: ${additionally}, ${features}.

Промпт создан с помощью TAIPrompts`;
    },
    params: {
      type: {
        type: "select",
        label: "Тип сайта",
        options: ["Лендинг", "Интернет-магазин", "Блог", "Портфолио", "Социальная сеть", "Панель управления", "Многостраничное приложение"],
        default: "Лендинг",
      },
      stack: {
        type: "select",
        label: "Технологический стек",
        options: ["HTML/CSS/JS", "React", "Vue.js", "Angular", "Node.js", "PHP", "Python/Django", "Ruby on Rails"],
        default: "HTML/CSS/JS",
      },
      style: {
        type: "select",
        label: "Стиль сайта",
        options: ["Минимализм", "Матовое стекло", "Брутализм", "Ретро", "Киберпанк", "PHP", "Аниме-фэнтези"],
        default: "Матовое стекло",
      },
      color: {
        type: "select",
        label: "Основная палитра",
        options: ["Тайский тип (#5c71e5)", "Убразный (#db0f00)", "Прочитка (#f58631)", "Глубокие прятки (#276fdb)", "Лимонный (#f5ee22)", "Обнаружение (#26d13c)", "Угольный (#000000)", "Ванильный (#fffff7)", "Подход звезды (#e431f5)", "Другой"],
        default: "Тайский тип (#5c71e5)",
      },
      features: {
        type: "multiselect",
        label: "Функции",
        options: ["Адаптивный дизайн", "PWA", "SEO оптимизация", "Корзина покупок", "Блог", "Комментарии", "Поиск", "Код в одном файле", "Смена темы", "Бекенд", "Аккаунты и подписки"],
        default: "Адаптивный дизайн",
      },
      additionally: {
        type: "multiselect",
        label: "Дополнительно",
        options: [
          "Полный код",
          "Структура проекта",
          "Объяснение ключевых понятий",
        ],
        default: "Полный код",
      },
    },
  },

  bots: {
    name: "Боты и автоматизация",
    template: function(params, idea, tone) {
      const { platform, language, functionality, additionally } = params;
      
      // Автоподстановка библиотек
      let libraries = "";
      if (platform === "Telegram" && language === "Python") {
        libraries = "Библиотека: python-telegram-bot или aiogram. ";
      } else if (platform === "Telegram" && language === "JavaScript") {
        libraries = "Библиотека: Telegraf.js. ";
      } else if (platform === "Telegram" && language === "PHP") {
        libraries = "Библиотека: Telegram Bot API SDK. ";
      } else if (platform === "Discord" && language === "Python") {
        libraries = "Библиотека: discord.py. ";
      } else if (platform === "Discord" && language === "JavaScript") {
        libraries = "Библиотека: discord.js. ";
      } else if (platform === "Discord" && language === "Java") {
        libraries = "Библиотека: JDA (Java Discord API). ";
      }
      
      // Логика для базы данных
      let dbDetails = "";
      if (functionality.includes("База данных")) {
        if (language === "Python") {
          dbDetails = "База данных: SQLite для простоты или PostgreSQL для продакшена. ";
        } else if (language === "JavaScript") {
          dbDetails = "База данных: SQLite или PostgreSQL с Prisma ORM. ";
        } else if (language === "Java") {
          dbDetails = "База данных: H2 (встроенная) или PostgreSQL с Hibernate. ";
        }
      }
      
      // Логика для асинхронности
      let asyncNote = "";
      if (language === "Python") {
        asyncNote = "Используй асинхронное программирование (async/await). ";
      } else if (language === "JavaScript") {
        asyncNote = "Используй асинхронное программирование (async/await). ";
      }
      
      // Логика для API
      let apiNote = "";
      if (functionality.includes("API интеграции")) {
        apiNote = "Интеграция с внешними API через асинхронные запросы. ";
      }
      
      let tonePrefix = "";
      switch (tone) {
        case "professional": tonePrefix = "Используй профессиональный технический язык. "; break;
        case "friendly": tonePrefix = "Будь дружелюбным и приветливым. "; break;
        case "creative": tonePrefix = "Прояви креативность и оригинальность. "; break;
        case "technical": tonePrefix = "Сфокусируйся на технических деталях. "; break;
        case "detailed": tonePrefix = "Дай максимально детализированный ответ. "; break;
      }
      
      return `${tonePrefix}Создай бота на ${language} для платформы ${platform}, с функционалом '${idea}'. 
${libraries}${dbDetails}${asyncNote}${apiNote}
Включи: описание функций, ${functionality}, ${additionally}, обработку сообщений и установочные инструкции.

Промпт создан с помощью TAIPrompts`;
    },
    params: {
      platform: {
        type: "select",
        label: "Платформа",
        options: ["Telegram", "Discord", "Внешний", "Minecraft", "MAX", "Другой", "Любой"],
        default: "Telegram",
      },
      language: {
        type: "select",
        label: "Язык программирования",
        options: ["Python", "JavaScript", "TypeScript", "Java", "PHP", "Go", "Любой"],
        default: "Python",
      },
      functionality: {
        type: "multiselect",
        label: "Особенности",
        options: [
          "Админ-панель",
          "Платежи",
          "База данных",
          "API интеграции",
          "Модерация",
          "Игры",
          "Уведомления",
          "Работа с файлами",
          "Inline клавиатуры",
          "Команды",
        ],
        default: "Модерация",
      },
      additionally: {
        type: "multiselect",
        label: "Дополнительно",
        options: [
          "Полный код",
          "Структура проекта",
          "Объяснение ключевых понятий",
        ],
        default: "Полный код",
      },
    },
  },

  minecraft: {
    name: "Моды Minecraft",
    template: function(params, idea, tone) {
      const { type, version, loader, compatibility, features, additionally } = params;
      
      // Автоподстановка API
      let apiDetails = "";
      if (loader === "Forge") {
        apiDetails = "Используй Forge MDK и Forge API. ";
      } else if (loader === "Fabric") {
        apiDetails = "Используй Fabric Loader и Fabric API. ";
      } else if (loader === "Paper") {
        apiDetails = "Используй Paper API для плагинов. ";
      } else if (loader === "Spigot" || loader === "Bukkit") {
        apiDetails = "Используй Spigot/Bukkit API. ";
      }
      
      // Логика для версии
      let versionDetails = "";
      if (version.includes("1.12") || version.includes("1.8")) {
        versionDetails = "Учти особенности старых версий (Minecraft 1.12.2 или 1.8.9). ";
      } else if (version.includes("1.20") || version.includes("1.21")) {
        versionDetails = "Используй актуальные фичи новых версий. ";
      }
      
      // Логика для Java
      let javaVersion = "";
      if (version.includes("1.17") || version.includes("1.18") || version.includes("1.19") || version.includes("1.20") || version.includes("1.21")) {
        javaVersion = "Требуется Java 17+. ";
      } else {
        javaVersion = "Требуется Java 8. ";
      }
      
      // Логика для GUI
      let guiDetails = "";
      if (features.includes("GUI")) {
        guiDetails = "Добавь графический интерфейс (Container, Screen). ";
      }
      
      // Логика для конфига
      let configDetails = "";
      if (features.includes("Конфиг")) {
        configDetails = "Конфигурация через JSON/TOML файлы. ";
      }
      
      // Логика для оптимизации
      let optimizationNote = "";
      if (features.includes("Оптимизация")) {
        optimizationNote = "Оптимизируй производительность, используй кэширование. ";
      }
      
      return `Разработай ${type} для Minecraft ${version} ${loader} для ${compatibility} с описанием: '${idea}'. 
${apiDetails}${versionDetails}${javaVersion}${guiDetails}${configDetails}${optimizationNote}
Особенности: ${features} и ${additionally}. 
Детально опиши функционал и механики.

Промпт создан с помощью TAIPrompts`;
    },
    params: {
      type: {
        type: "select",
        label: "Тип контента",
        options: ["Мод", "Ресурспак", "Датапак", "Плагин", "Аддон"],
        default: "Мод",
      },
      version: {
        type: "select",
        label: "Версия Minecraft",
        options: ["1.21.8", "1.21.4", "1.21", "1.20.1", "1.19.2", "1.18.2", "1.17", "1.16.5", "1.12.2", "1.8.9", "Любая"],
        default: "1.20.1",
      },
      loader: {
        type: "select",
        label: "Загрузчик",
        options: ["Forge", "Fabric", "Paper", "Spigot", "Bukkit"],
        default: "Forge",
      },
      compatibility: {
        type: "select",
        label: "Совместимость",
        options: ["Сервер", "Клиент"],
        default: "Клиент",
      },
      features: {
        type: "multiselect",
        label: "Особенности",
        options: [
          "Новые блоки",
          "Новые мобы",
          "Новые предметы",
          "Генерация структур",
          "Изменение мира",
          "Магическая система",
          "Технологии",
          "Квесты",
          "Боссы",
          "GUI",
          "Рецепты",
          "Оптимизация",
          "Клиентские фишки",
          "Конфиг",
          "Технические функции",
        ],
        default: "Оптимизация",
      },
      additionally: {
        type: "multiselect",
        label: "Дополнительно",
        options: [
          "Полный код",
          "Структура проекта",
          "Объяснение ключевых понятий",
        ],
        default: "Полный код",
      },
    },
  },

  images: {
    name: "Генерация изображений",
    template: function(params, idea, tone) {
      const { style, aspect_ratio, quality } = params;
      
      // Логика для аспекта
      let aspectDetails = "";
      if (aspect_ratio.includes("16:9")) {
        aspectDetails = "Широкоэкранный формат для обоев. ";
      } else if (aspect_ratio.includes("9:16")) {
        aspectDetails = "Вертикальный формат для Stories/Reels. ";
      } else if (aspect_ratio.includes("1:1")) {
        aspectDetails = "Квадратный формат для соцсетей. ";
      }
      
      // Логика для качества
      let qualityDetails = "";
      if (quality.includes("4K")) {
        qualityDetails = "Высокое разрешение 3840x2160. ";
      } else if (quality.includes("HD")) {
        qualityDetails = "Стандартное HD 1920x1080. ";
      }
      
      // Логика для стиля
      let styleDetails = "";
      if (style.includes("реалистичное")) {
        styleDetails = "Фотореалистичная детализация. ";
      } else if (style.includes("анимешное")) {
        styleDetails = "Стиль аниме/манга. ";
      } else if (style.includes("фэнтези")) {
        styleDetails = "Фэнтезийная атмосфера. ";
      }
      
      let tonePrefix = "";
      switch (tone) {
        case "professional": tonePrefix = "Используй профессиональный язык. "; break;
        case "creative": tonePrefix = "Прояви креативность и оригинальность. "; break;
        case "detailed": tonePrefix = "Дай максимально детализированный ответ. "; break;
      }
      
      return `${tonePrefix}Сгенерируй ${style} изображение по описанию: '${idea}'. 
${aspectDetails}${qualityDetails}${styleDetails}
Аспект: ${aspect_ratio}. Качество: ${quality}.

С детальным описанием: композиция, цвета, освещение, настроение и детали.

Промпт создан с помощью TAIPrompts`;
    },
    params: {
      style: {
        type: "select",
        label: "Стиль изображения",
        options: ["реалистичное", "мультяшное", "фэнтези", "футуристическое", "минималистичное", "абстрактное", "анимешное"],
        default: "реалистичное",
      },
      aspect_ratio: {
        type: "select",
        label: "Соотношение сторон",
        options: ["1:1 (квадрат)", "16:9 (широкоэкранное)", "9:16 (вертикальное)", "4:3 (стандартное)", "21:9 (кинематографическое)"],
        default: "1:1 (квадрат)",
      },
      quality: {
        type: "select",
        label: "Качество",
        options: ["Высокое (4K)", "Среднее (HD)", "Низкое (для web)"],
        default: "Высокое (4K)",
      },
    },
  },

    stickers: {
      name: "Стикеры и аватары",
      template:
        "Создай {style} стикерпак для {platform} с описанием: '{idea}'. Нужные эмоции: {emotions}. Включи разнообразные эмоции, действия и ситуации. Сделай всё на прозрачном фоне, чтобы можно было удобно вставить в любой мессенджер.",
      params: {
        style: {
          type: "select",
          label: "Стиль стикеров",
          options: ["мультяшный", "минималистичный", "реалистичный", "кавайный", "мемный", "абстрактный", "анимешный"],
          default: "мультяшный",
        },
        platform: {
          type: "select",
          label: "Платформа",
          options: ["Telegram", "WhatsApp", "Discord", "Signal", "Любая"],
          default: "Telegram",
        },
        emotions: {
          type: "multiselect",
          label: "Эмоции и действия",
          options: ["Радость", "Грусть", "Удивление", "Смех", "Любовь", "Приветствие", "Прощание", "Одобрение"],
          default: "Приветствие",
        },
      },
    },

    "3d": {
      name: "3D модели",
      template:
        "Создай {style} 3D модель {type} на тему '{idea}'. ПО: {software} Полигональность: {polygons}. Детально опиши: геометрию, материалы, текстуры, освещение и рендеринг.",
      params: {
        style: {
          type: "select",
          label: "Стиль модели",
          options: ["реалистичный", "low-poly", "стилизованный", "мультяшный", "футуристический"],
          default: "реалистичный",
        },
        type: {
          type: "select",
          label: "Тип модели",
          options: ["персонажа", "окружения", "предмета", "архитектуры", "транспорта"],
          default: "персонажа",
        },
        software: {
          type: "select",
          label: "Программа",
          options: ["Blender", "Maya", "3ds Max", "ZBrush", "Любая"],
          default: "Blender",
        },
        polygons: {
          type: "select",
          label: "Полигональность",
          options: ["Low-poly (<10k)", "Medium (10-50k)", "High (50-200k)", "Ultra (>200k)"],
          default: "Medium (10-50k)",
        },
      },
    },

    toys: {
      name: "Игрушки",
      template:
        "Разработай концепцию {type} игрушки для {age_group} с описанием: '{idea}'. Материалы: {materials}. Включи описание: внешний вид, функционал, материалы и образовательную ценность.",
      params: {
        type: {
          type: "select",
          label: "Тип игрушки",
          options: ["развивающей", "интерактивной", "конструктора", "мягкой", "коллекционной", "настольной игры"],
          default: "развивающей",
        },
        materials: {
          type: "select",
          label: "Материалы",
          options: ["пластик", "дерево", "текстиль", "металл", "комбинированные", "экологичные"],
          default: "пластик",
        },
        age_group: {
          type: "select",
          label: "Возрастная группа",
          options: ["0-1 год", "1-3 года", "3-6 лет", "6-12 лет", "12+ лет", "взрослые"],
          default: "6-12 лет",
        },
      },
    },

    characterai: {
      name: "Character AI",
      template:
        "Создай персонажа для Character AI с описанием '{idea}'. Характеристики: {personality} {appearance}, Тип имени: {name}, Тон общения: {tone2}.",
      params: {
        name: {
          type: "select",
          label: "Тип имени",
          options: ["Реалистичное", "Фэнтези", "Научно-фантастическое", "Историческое", "Аниме", "Уникальное", "Другое"],
          default: "Реалистичное",
        },
        personality: {
          type: "multiselect",
          label: "Черты характера",
          options: ["Дружелюбный", "Застенчивый", "Энергичный", "Серьезный", "Юмористический", "Загадочный", "Мудрый", "Наивный"],
          default: "Дружелюбный",
        },
        appearance: {
          type: "multiselect",
          label: "Внешность",
          options: ["Человек", "Животное", "Робот", "Мифическое существо", "Инопланетянин", "Аниме персонаж", "Историческая личность"],
          default: "Человек",
        },
        tone2: {
          type: "select",
          label: "Тон общения",
          options: ["Формальный", "Неформальный", "Дружеский", "Профессиональный", "Поэтический", "Драматический"],
          default: "Дружеский",
        },
      },
    },

    suno: {
      name: "Suno AI",
      template:
        "Создай текст песни для Suno AI по описанию: '{idea}'. Жанр: {genre}, Стиль: {style}, Структура: {structure}, Особенности: {tempo} темп, {instruments}. Оформление типа: [Verse], [Chorus], [Verse 2] и тд.",
      params: {
        genre: {
          type: "select",
          label: "Музыкальный жанр",
          options: ["Поп", "Рок", "Хип-хоп", "Электроника", "Джаз", "Классика", "Фолк", "R&B", "Кантри", "Метал"],
          default: "Поп",
        },
        style: {
          type: "select",
          label: "Стиль исполнение",
          options: ["Веселый", "Грустный", "Романтический", "Эпический", "Расслабляющий", "Энергичный", "Ностальгический"],
          default: "Веселый",
        },
        tempo: {
          type: "select",
          label: "Темп",
          options: ["Медленный", "Умеренный", "Быстрый", "Очень быстрый"],
          default: "Умеренный",
        },
        instruments: {
          type: "multiselect",
          label: "Инструменты",
          options: ["Гитара", "Фортепиано", "Барабаны", "Синтезатор", "Скрипка", "Бас", "Духовые", "Вокал"],
          default: ["Гитара", "Фортепиано"],
        },
        structure: {
          type: "select",
          label: "Структура песни",
          options: ["Куплет-Припев", "Куплет-Припев-Мост", "ABAB", "Свободная форма", "Поэтическая"],
          default: "Куплет-Припев",
        },
      },
    },

    setup: {
      name: "Приложения",
      template:
        "Разработай {type} на {lang} для {oc} с функционалом {hang}, включи {additionally}, и инструкцией по сборке для {setupper}. Подробное описание идеи: '{idea}'",
      params: {
        type: {
          type: "select",
          label: "Тип приложения",
          options: [
            "Игра",
            "Мессенджер",
            "Утилита",
            "Приложение для видеоконференций",
            "Стриминговый сервис",
            "Видеохостинг",
            "Конструктор сайтов/приложений",
            "Цифровая визитка",
            "Учебное приложение",
            "Другое",
          ],
          default: "Игра",
        },
        lang: {
          type: "select",
          label: "Язык программирования",
          options: [
            "C#",
            "C++",
            "Python",
            "Java",
            "JavaScript",
            "TypeScript",
            "Rust",
            "Go",
            "Dart",
            "Swift",
            "Kotlin",
            "Objective-C",
            "PHP",
            "Ruby",
            "Scala",
            "Perl",
            "Lua",
            "Haskell",
            "Elixir",
            "Clojure",
            "F#",
            "VB.NET",
            "Delphi",
            "Assembly",
            "SQL",
            "R",
            "MATLAB",
            "Bash",
            "PowerShell",
            "Groovy",
            "Julia",
            "Fortran",
            "COBOL",
            "Lisp",
            "Prolog",
            "Ada",
            "Scheme",
            "Verilog",
            "VHDL",
            "CMD-скрипты",
            "Другое",
          ],
          default: "JavaScript",
        },
        hang: {
          type: "multiselect",
          label: "Особенности",
          options: [
            "Смена темы",
            "Сохранение чего-то в собственный формат файла (пример: название.тип_файла)",
            "Автозагрузка",
            "Горячие клавиши",
            "Ассоциации файлов",
            "Уведомления",
            "Системные службы",
            "Разрешения доступа",
            "Иконка приложения",
            "Экраны загрузки",
            "Фоновые режимы",
            "Меню",
            "Хранилище данных",
          ],
          default: "Меню",
        },
        setupper: {
          type: "select",
          label: "Установщики",
          options: [
            "Inno Setup",
            "WiX Toolset",
            "NSIS",
            "Advanced Installer",
            "InstallShield",
            "MSIX",
            "DMG",
            "PKG",
            "Mac App Store",
            "Homebrew Cask",
            "APT",
            "RPM",
            "Pacman",
            "Snap",
            "Flatpak",
            "AppImage",
            "Make install",
            "APK",
            "AAB",
            "Google Play",
            "F-Droid",
            "Side loading",
            "TestFlight",
            "Enterprise distribution",
            "Ad-hoc",
            "SFX архив",
            "Другой",
            "Свой установщик",
          ],
          default: "Inno Setup",
        },
        oc: {
          type: "select",
          label: "Система",
          options: ["Windows", "Linux", "Android", "IOS", "MacOS", "Другое"],
          default: "Windows",
        },
        additionally: {
          type: "multiselect",
          label: "Дополнительно",
          options: [
            "Полный код",
            "Структура проекта",
            "Объяснение ключевых понятий",
          ],
          default: "Полный код",
        },
      },
    },

    school: {
      name: "Учёба и школа",
      template: "Помоги с заданием по предмету {subj}, Тип задания: {task}, Учусь в {class}. Подробности по заданию: '{idea}'.",
      params: {
        subj: {
          type: "select",
          label: "Предмет",
          options: ["Математика", "Русский", "Литература", "Информатика", "География", "Биология", "Физика", "История", "Химия", "Технология", "Другое"],
          default: "Математика",
        },
        task: {
          type: "select",
          label: "Задание",
          options: ["Задача", "Чертёж", "Сочинение", "Изложение", "Код", "Сочинение-рассуждение", "Поделка", "Другое"],
          default: "Задача",
        },
        class: {
          type: "select",
          label: "Класс",
          options: ["1 класс", "2 класс", "3 класс", "5 класс", "6 класс", "7 класс", "8 класс", "9 класс", "10 класс", "11 класс", "Колледж", "Университет", "1 курс", "2 курс", "3 курс", "Другой"],
          default: "1 класс",
        },
      },
    },

    youtube: {
      name: "YouTube",
      template:
        "Создай контент для YouTube канала на тему '{idea}'. Формат контента: {content_type}, Целевая аудитория: {audience}, Частота выпуска: {frequency}, Превью: {thumbnail_style}, Монетизация контента: {monetization}",
      params: {
        content_type: {
          type: "select",
          label: "Тип контента",
          options: ["Обзоры", "Образовательный", "Развлекательный", "Влоги", "Гейминг", "Кулинария", "Музыка", "Новости", "Спорт"],
          default: "Развлекательный",
        },
        audience: {
          type: "select",
          label: "Целевая аудитория",
          options: ["Дети", "Подростки", "Взрослые", "Семейная", "Профессиональная", "Нишевая"],
          default: "Взрослые",
        },
        frequency: {
          type: "select",
          label: "Частота выпуска",
          options: ["Ежедневно", "2-3 раза в неделю", "Еженедельно", "Раз в две недели", "Ежемесячно"],
          default: "Еженедельно",
        },
        thumbnail_style: {
          type: "select",
          label: "Стиль превью",
          options: ["Яркий и контрастный", "Минималистичный", "Текстовый", "Эмоциональный", "Загадочный", "Профессиональный"],
          default: "Яркий и контрастный",
        },
        monetization: {
          type: "select",
          label: "Монетизация",
          options: ["Реклама", "Спонсорство", "Краудфандинг", "Мерч", "Платная подписка", "Бесплатный контент", "Нет", "Другой"],
          default: "Реклама",
        },
      },
    },
    
    plugin: {
      name: "Плагины и расширения",
      template:
        "Разработай {type} на {lang} для {browser} с функционалом {func}, включи {additionally}, и инструкцию по сборке. Подробное описание идеи: '{idea}'",
      params: {
        type: {
          type: "select",
          label: "Тип",
          options: [
            "Плагин",
            "Расширение",
            "Локализация",
          ],
          default: "Плагин",
        },
        browser: {
          type: "select",
          label: "ПО",
          options: [
            "Chromium-браузер",
            "Firefox",
            "Safari",
            "Adobe",
            "Figma",
            "Blender",
            "VS Code",
            "Сайт",
            "Электронная коммерция",
            "Google Workspace",
            "Office 365",
            "Корпоративная или облачная платформа",
            "Roblox",
            "Мобильное приложение",
            "Крипто-кошелёк",
            "Roblox",
            "OBS Studio",
            "Медиаплеер",
            "Другое",
          ],
          default: "Chromium-браузер",
        },
        lang: {
          type: "select",
          label: "Язык программирования",
          options: [
            "HTML/CSS/JS",
            "C++",
            "Python",
            "Java",
            "TypeScript",
            "React",
            "WebView",
            "C#",
            "Kotlin",
            "PHP",
            "Lua",
          ],
          default: "HTML/CSS/JS",
        },
        func: {
          type: "multiselect",
          label: "Особенности",
          options: [
            "Смена темы",
            "Горячие клавиши",
            "Уведомления",
            "Разрешения доступа",
            "Иконка приложения",
            "Экраны загрузки",
            "Меню",
            "Хранилище данных",
            "Нейросеть",
            "Админ панель",
          ],
          default: "Смена темы",
        },
        additionally: {
          type: "multiselect",
          label: "Дополнительно",
          options: [
            "Полный код",
            "Структура проекта",
            "Объяснение ключевых понятий",
          ],
          default: "Полный код",
        },
      },
    },
  };

// ===== КРОСС-РЕКОМЕНДАЦИИ =====
const crossRecommendations = {
  // Если выбрал X категорию, рекомендовать Y
  websites: [
    {
      triggerKeywords: ['ресторан', 'кафе', 'еда', 'меню', 'блюд', 'кухн'],
      recommendCategory: 'recipes',
      message: 'Хотите также создать меню для сайта?',
      presetParams: {
        cuisine: 'русской',
        complexity: 'Средней сложности'
      }
    },
    {
      triggerKeywords: ['портфолио', 'дизайн', 'иллюстрац', 'арт', 'худож', 'творч'],
      recommendCategory: 'images',
      message: 'Добавьте изображения для портфолио!',
      presetParams: {
        style: 'реалистичное',
        quality: 'Высокое (4K)'
      }
    },
    {
      triggerKeywords: ['магазин', 'товар', 'прода', 'купи', 'товар', 'ассортимент'],
      recommendCategory: 'youtube',
      message: 'Создайте контент для продвижения магазина!',
      presetParams: {
        content_type: 'Обзоры',
        audience: 'Взрослые'
      }
    }
  ],
  
  recipes: [
    {
      triggerKeywords: ['ресторан', 'кафе', 'меню', 'заведен'],
      recommendCategory: 'websites',
      message: 'Создайте сайт для вашего ресторана!',
      presetParams: {
        type: 'Лендинг',
        style: 'Минимализм',
        color: 'Прочитка (#f58631)'
      }
    }
  ],
  
  minecraft: [
    {
      triggerKeywords: ['сервер', 'игрок', 'сообщество', 'мультиплеер'],
      recommendCategory: 'bots',
      message: 'Добавьте бота для управления сервером!',
      presetParams: {
        platform: 'Discord',
        language: 'Python'
      }
    }
  ],
  
  bots: [
    {
      triggerKeywords: ['магазин', 'заказ', 'товар', 'покуп'],
      recommendCategory: 'websites',
      message: 'Создайте сайт для вашего магазина!',
      presetParams: {
        type: 'Интернет-магазин',
        features: ['Корзина покупок', 'Поиск']
      }
    }
  ],
  
  images: [
    {
      triggerKeywords: ['стикер', 'аватар', 'эмодзи', 'смайл'],
      recommendCategory: 'stickers',
      message: 'Превратите изображения в стикеры!',
      presetParams: {
        style: 'мультяшный',
        platform: 'Telegram'
      }
    }
  ],
  
  youtube: [
    {
      triggerKeywords: ['обучен', 'туториал', 'инструкц', 'как сделать'],
      recommendCategory: 'school',
      message: 'Создайте учебные материалы по теме!',
      presetParams: {
        subj: 'Информатика',
        task: 'Код'
      }
    }
  ]
};

// Функция для анализа текста и показа рекомендаций:
function checkCrossRecommendations(category, userText) {
  const recommendations = crossRecommendations[category];
  if (!recommendations || !userText) return null;
  
  const userTextLower = userText.toLowerCase();
  const matched = [];
  
  recommendations.forEach(rec => {
    // Проверяем каждое ключевое слово
    rec.triggerKeywords.forEach(keyword => {
      if (userTextLower.includes(keyword.toLowerCase())) {
        matched.push({
          ...rec,
          matchedKeyword: keyword
        });
      }
    });
  });
  
  return matched.length > 0 ? matched : null;
}

// ===== КОНТЕКСТУАЛЬНЫЕ ПАРАМЕТРЫ =====
const contextRules = {
  websites: [
    {
      triggers: ['ресторан', 'кафе', 'бар', 'кофейн', 'пиццер'],
      autoSet: {
        type: 'Лендинг',
        color: 'Прочитка (#f58631)',
        features: ['Адаптивный дизайн', 'SEO оптимизация'],
        style: 'Минимализм'
      },
      suggestions: [
        "Добавьте раздел 'Меню'",
        "Интегрируйте систему онлайн-заказа",
        "Фотогалерея блюд"
      ]
    },
    {
      triggers: ['магазин', 'интернет-магазин', 'экоммерц', 'товар', 'продаж'],
      autoSet: {
        type: 'Интернет-магазин',
        color: 'Ты трубка (#db0f00)',
        features: ['Корзина покупок', 'Поиск', 'SEO оптимизация'],
        style: 'Матовое стекло'
      },
      suggestions: [
        "Система фильтрации товаров",
        "Отзывы покупателей",
        "Сравнение товаров"
      ]
    },
    {
      triggers: ['портфолио', 'художник', 'дизайнер', 'фотограф', 'арт'],
      autoSet: {
        type: 'Портфолио',
        color: 'Тайский промпт (#5c71e5)',
        style: 'Матовое стекло',
        features: ['Адаптивный дизайн', 'Смена темы']
      },
      suggestions: [
        "Слайдер работ",
        "Биография автора",
        "Контактная форма"
      ]
    }
  ],
  
  recipes: [
    {
      triggers: ['быстр', 'просто', 'легк', 'на скорую'],
      autoSet: {
        complexity: 'Простое',
        dietary: 'Без ограничений'
      },
      suggestions: [
        "Используйте простые ингредиенты",
        "Время готовки до 30 минут"
      ]
    },
    {
      triggers: ['здоров', 'диет', 'фитнес', 'пп'],
      autoSet: {
        dietary: 'Низкоуглеводное',
        cuisine: 'средиземноморской'
      },
      suggestions: [
        "Укажите калорийность",
        "Добавьте альтернативные ингредиенты"
      ]
    }
  ],
  
  images: [
    {
      triggers: ['лого', 'бренд', 'фирменн', 'компани'],
      autoSet: {
        style: 'минималистичное',
        aspect_ratio: '1:1 (квадрат)'
      },
      suggestions: [
        "Создайте несколько вариантов",
        "Используйте цвета бренда"
      ]
    }
  ]
};

// Функция автоподстановки
function applyContextualParams(category, userText) {
  const rules = contextRules[category];
  if (!rules || !userText) return { autoParams: {}, suggestions: [] };
  
  const userTextLower = userText.toLowerCase();
  const autoParams = {};
  const suggestions = [];
  
  rules.forEach(rule => {
    const hasTrigger = rule.triggers.some(trigger => 
      userTextLower.includes(trigger.toLowerCase())
    );
    
    if (hasTrigger) {
      // Автоподстановка параметров
      Object.assign(autoParams, rule.autoSet);
      
      // Собираем suggestions
      if (rule.suggestions) {
        suggestions.push(...rule.suggestions);
      }
    }
  });
  
  return { autoParams, suggestions };
}

// Функция для показа suggestions
function showContextSuggestions(suggestions) {
  const container = document.getElementById('contextSuggestions');
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.id = 'contextSuggestions';
    newContainer.className = 'context-suggestions';
    // Вставляем перед сгенерированным промптом
    const generatedPrompt = modal.querySelector('.generated-prompt');
    if (generatedPrompt) {
      generatedPrompt.parentNode.insertBefore(newContainer, generatedPrompt);
    }
  }
  
  if (suggestions.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.innerHTML = `
    <div class="suggestions-header">
      <i class="fas fa-lightbulb"></i>
      <span>Идеи для вашего промпта:</span>
    </div>
    <ul class="suggestions-list">
      ${suggestions.map(s => `<li>${s}</li>`).join('')}
    </ul>
  `;
  container.style.display = 'block';
}

// Дебаунс функция
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== ВАЛИДАЦИЯ КОМБИНАЦИЙ =====
const validationRules = {
  websites: {
    // "Код в одном файле" не работает для фреймворков
    incompatible: [
      {
        when: { stack: ["React", "Vue.js", "Angular", "Node.js", "Python/Django", "Ruby on Rails"] },
        cannotHave: ["Код в одном файле"],
        message: "Для фреймворков невозможно сгенерировать код в одном файле"
      },
      {
        when: { type: ["Интернет-магазин", "Социальная сеть", "Панель управления", "Многостраничное приложение"] },
        cannotHave: ["Код в одном файле"],
        message: "Для сложных проектов рекомендуется структура проекта, а не один файл"
      }
    ],
    
    // Рекомендации по стилям
    recommendations: [
      {
        when: { type: ["Интернет-магазин", "Панель управления"] },
        recommendedStyle: ["Минимализм", "Матовое стекло"],
        message: "Для {type} лучше подходит {style}"
      },
      {
        when: { type: ["Портфолио", "Блог"] },
        recommendedStyle: ["Минимализм", "Матовое стекло", "Аниме-фэнтези"],
        message: "Для творческих проектов можно использовать креативные стили"
      },
      {
        when: { type: ["Лендинг"] },
        recommendedFeatures: ["SEO оптимизация", "Адаптивный дизайн"],
        message: "Для лендинга обязательно нужны: {features}"
      }
    ],
    
    // Цветовые рекомендации
    colorWarnings: [
      {
        when: { style: ["PHP"] },
        warningFor: ["Чёрный (#000000)", "Белый (#ffffff)"],
        message: "Для стиля 'PHP' лучше подходят яркие цвета из 2000-х"
      },
      {
        when: { style: ["Киберпанк"] },
        recommendedColors: ["Тайский промпт (#5c71e5)", "Подход звезды (#e431f5)"],
        message: "Для киберпанк стиля лучше подходят неоновые цвета"
      },
      {
        when: { type: ["Интернет-магазин"] },
        recommendedColors: ["Ты трубка (#db0f00)", "Обнаружение (#26d13c)"],
        message: "Для магазина рекомендуем яркие цвета для призыва к действию"
      }
    ]
  },
  
  bots: {
    incompatible: [
      {
        when: { platform: ["Minecraft"] },
        cannotHave: ["API интеграции", "Платежи"],
        message: "Для Minecraft ботов некоторые функции недоступны"
      },
      {
        when: { language: ["PHP"] },
        cannotHave: ["Админ-панель", "Inline клавиатуры"],
        message: "Для PHP сложно реализовать некоторые функции ботов"
      }
    ],
    
    recommendations: [
      {
        when: { platform: ["Telegram", "Discord"] },
        recommendedFeatures: ["Команды", "Модерация"],
        message: "Для чат-ботов рекомендуем функции: {features}"
      },
      {
        when: { functionality: ["Платежи"] },
        recommendedLanguage: ["Python", "JavaScript", "TypeScript"],
        message: "Для платежей рекомендуем языки: {languages}"
      }
    ]
  },
  
  images: {
    recommendations: [
      {
        when: { style: ["анимешное"] },
        recommendedAspect: ["16:9 (широкоэкранное)", "9:16 (вертикальное)"],
        message: "Для аниме стиля рекомендуем широкоэкранные форматы"
      },
      {
        when: { style: ["реалистичное", "футуристическое"] },
        recommendedQuality: ["Высокое (4K)"],
        message: "Для детализированных стилей рекомендуем высокое качество 4K"
      },
      {
        when: { aspect_ratio: ["9:16 (вертикальное)"] },
        recommendedStyle: ["реалистичное", "мультяшное", "анимешное"],
        message: "Для вертикального формата лучше подходят эти стили"
      }
    ]
  },
  
  stickers: {
    recommendations: [
      {
        when: { platform: ["WhatsApp"] },
        recommendedStyle: ["мультяшный", "минималистичный"],
        message: "Для WhatsApp лучше подходят простые стили"
      },
      {
        when: { style: ["анимешный"] },
        recommendedPlatform: ["Telegram", "Discord"],
        message: "Аниме стикеры популярны в Telegram и Discord"
      },
      {
        when: { emotions: ["Радость", "Смех"] },
        recommendedStyle: ["мультяшный", "мемный"],
        message: "Для весёлых эмоций подходят мультяшные и мемные стили"
      }
    ]
  },
  
  minecraft: {
    incompatible: [
      {
        when: { version: ["1.8.9", "1.12.2"] },
        cannotHave: ["Оптимизация", "Технические функции"],
        message: "Для старых версий Minecraft некоторые функции недоступны"
      }
    ],
    
    recommendations: [
      {
        when: { type: ["Мод"] },
        recommendedLoader: ["Forge", "Fabric"],
        message: "Для модов рекомендуем: {loader}"
      },
      {
        when: { type: ["Плагин"] },
        recommendedLoader: ["Paper", "Spigot", "Bukkit"],
        message: "Для плагинов рекомендуем: {loader}"
      },
      {
        when: { features: ["Новые мобы", "Боссы"] },
        recommendedVersion: ["1.20.1", "1.21"],
        message: "Для сложных мобов нужны современные версии"
      }
    ]
  },
  
  "3d": {
    recommendations: [
      {
        when: { style: ["low-poly"] },
        recommendedPolygons: ["Low-poly (<10k)", "Medium (10-50k)"],
        message: "Для low-poly стиля рекомендуем низкую полигональность"
      },
      {
        when: { type: ["персонажа"] },
        recommendedSoftware: ["Blender", "Maya", "ZBrush"],
        message: "Для персонажей рекомендуем: {software}"
      },
      {
        when: { software: ["Blender"] },
        recommendedStyle: ["реалистичный", "стилизованный", "мультяшный"],
        message: "Blender хорошо подходит для этих стилей"
      }
    ]
  },
  
  characterai: {
    recommendations: [
      {
        when: { appearance: ["Аниме персонаж"] },
        recommendedPersonality: ["Дружелюбный", "Юмористический", "Наивный"],
        message: "Для аниме персонажей подходят: {personality}"
      },
      {
        when: { appearance: ["Робот", "Инопланетянин"] },
        recommendedTone: ["Формальный", "Профессиональный"],
        message: "Для неорганических существ подходит формальный тон"
      },
      {
        when: { personality: ["Загадочный", "Мудрый"] },
        recommendedName: ["Фэнтези", "Уникальное", "Историческое"],
        message: "Для таких персонажей подходят необычные имена"
      }
    ]
  },
  
  suno: {
    recommendations: [
      {
        when: { genre: ["Метал", "Рок"] },
        recommendedTempo: ["Быстрый", "Очень быстрый"],
        message: "Для рока и метала рекомендуем быстрый темп"
      },
      {
        when: { genre: ["Джаз", "Классика"] },
        recommendedInstruments: ["Фортепиано", "Скрипка", "Духовые"],
        message: "Для этих жанров рекомендуем классические инструменты"
      },
      {
        when: { style: ["Грустный", "Ностальгический"] },
        recommendedTempo: ["Медленный", "Умеренный"],
        message: "Для грустных песен подходит медленный темп"
      }
    ]
  },
  
  recipes: {
    incompatible: [
      {
        when: { dietary: ["Веганское"] },
        cannotHave: ["Высокобелковое"], // веганское ≠ высокобелковое по умолчанию
        message: "Для веганских блюд сложно достичь высокого содержания белка"
      }
    ],
    
    recommendations: [
      {
        when: { cuisine: ["итальянской"] },
        recommendedComplexity: ["Простое", "Средней сложности"],
        message: "Итальянская кухня обычно простая в приготовлении"
      },
      {
        when: { dietary: ["Низкоуглеводное"] },
        recommendedCuisine: ["азиатской", "средиземноморской"],
        message: "Для низкоуглеводной диеты подходят эти кухни"
      }
    ]
  },
  
  setup: {
    incompatible: [
      {
        when: { oc: ["IOS", "MacOS"] },
        cannotHave: ["Inno Setup", "WiX Toolset", "NSIS"],
        message: "Для MacOS/iOS нужны другие установщики (DMG, PKG)"
      },
      {
        when: { oc: ["Android"] },
        cannotHave: ["Inno Setup", "MSIX", "DMG"],
        message: "Для Android нужны APK, AAB или Google Play"
      }
    ],
    
    recommendations: [
      {
        when: { type: ["Игра"] },
        recommendedLang: ["C#", "C++", "Python"],
        message: "Для игр рекомендуем: {lang}"
      },
      {
        when: { lang: ["JavaScript", "TypeScript"] },
        recommendedOC: ["Windows", "Linux", "MacOS"],
        message: "Эти языки кроссплатформенны"
      },
      {
        when: { setupper: ["Google Play", "App Store"] },
        recommendedOC: ["Android", "IOS"],
        message: "Эти установщики для мобильных платформ"
      }
    ]
  },
  
  plugin: {
    recommendations: [
      {
        when: { browser: ["Chromium-браузер", "Firefox"] },
        recommendedLang: ["HTML/CSS/JS", "TypeScript"],
        message: "Для браузерных расширений рекомендуем: {lang}"
      },
      {
        when: { browser: ["VS Code", "Figma"] },
        recommendedLang: ["TypeScript", "JavaScript"],
        message: "Для этих программ рекомендуем: {lang}"
      },
      {
        when: { func: ["Нейросеть"] },
        recommendedLang: ["Python", "JavaScript"],
        message: "Для нейросетей рекомендуем: {lang}"
      }
    ]
  },
  
  youtube: {
    recommendations: [
      {
        when: { content_type: ["Образовательный"] },
        recommendedAudience: ["Взрослые", "Профессиональная"],
        message: "Для образовательного контента подходит аудитория: {audience}"
      },
      {
        when: { audience: ["Дети"] },
        recommendedContent: ["Развлекательный", "Образовательный"],
        message: "Для детской аудитории рекомендуем: {content}"
      },
      {
        when: { monetization: ["Реклама", "Спонсорство"] },
        recommendedFrequency: ["Еженедельно", "2-3 раза в неделю"],
        message: "Для монетизации важна регулярность: {frequency}"
      }
    ]
  },
  
  school: {
    recommendations: [
      {
        when: { class: ["1 класс", "2 класс", "3 класс"] },
        recommendedTask: ["Поделка", "Сочинение"],
        message: "Для младших классов подходят: {task}"
      },
      {
        when: { subj: ["Информатика"] },
        recommendedTask: ["Код", "Задача"],
        message: "Для информатики рекомендуем: {task}"
      },
      {
        when: { task: ["Сочинение-рассуждение"] },
        recommendedSubj: ["Литература", "История"],
        message: "Для сочинений-рассуждений подходят предметы: {subj}"
      }
    ]
  },
  
  toys: {
    recommendations: [
      {
        when: { age_group: ["0-1 год", "1-3 года"] },
        recommendedMaterials: ["текстиль", "пластик", "экологичные"],
        message: "Для малышей рекомендуем безопасные материалы: {materials}"
      },
      {
        when: { type: ["развивающей"] },
        recommendedAge: ["1-3 года", "3-6 лет", "6-12 лет"],
        message: "Развивающие игрушки для возрастов: {age}"
      },
      {
        when: { materials: ["металл"] },
        recommendedAge: ["6-12 лет", "12+ лет"],
        message: "Металлические игрушки для детей старше 6 лет"
      }
    ]
  }
};

// Функция проверки валидации (универсальная версия)
function validateCombination(type, selectedParams) {
  const rules = validationRules[type];
  if (!rules) return { valid: true, warnings: [], errors: [] };
  
  const warnings = [];
  const errors = [];
  
  // Проверка несовместимых комбинаций
  if (rules.incompatible) {
    rules.incompatible.forEach(rule => {
      let conditionMet = true;
      Object.keys(rule.when).forEach(paramKey => {
        const paramValue = selectedParams[paramKey];
        // Поддержка как одиночных значений, так и массивов
        if (!paramValue || !rule.when[paramKey].includes(paramValue)) {
          conditionMet = false;
        }
      });
      
      if (conditionMet) {
        rule.cannotHave.forEach(forbidden => {
          // Проверяем в features, functionality, или других массивах
          let hasForbidden = false;
          
          // Проверяем все возможные массивы параметров
          Object.keys(selectedParams).forEach(key => {
            const value = selectedParams[key];
            if (Array.isArray(value) && value.includes(forbidden)) {
              hasForbidden = true;
            }
          });
          
          // Также проверяем одиночные значения
          if (Object.values(selectedParams).includes(forbidden)) {
            hasForbidden = true;
          }
          
          if (hasForbidden) {
            errors.push(`❌ ${rule.message}`);
          }
        });
      }
    });
  }
  
  // Проверка рекомендаций (универсальная)
  if (rules.recommendations) {
    rules.recommendations.forEach(rule => {
      let conditionMet = true;
      Object.keys(rule.when).forEach(paramKey => {
        const paramValue = selectedParams[paramKey];
        if (!paramValue || !rule.when[paramKey].includes(paramValue)) {
          conditionMet = false;
        }
      });
      
      if (conditionMet) {
        // Ищем все recommended* поля в правиле
        Object.keys(rule).forEach(ruleKey => {
          if (ruleKey.startsWith('recommended')) {
            // Извлекаем имя параметра из ключа (recommendedStyle → style)
            const paramName = ruleKey.replace('recommended', '').toLowerCase();
            
            // Пробуем найти значение в selectedParams
            let actualValue = selectedParams[paramName];
            
            // Если не нашли напрямую, ищем варианты (aspect_ratio, content_type и т.д.)
            if (!actualValue) {
              // Пробуем найти похожие ключи
              Object.keys(selectedParams).forEach(key => {
                if (key.toLowerCase().includes(paramName.toLowerCase())) {
                  actualValue = selectedParams[key];
                }
              });
            }
            
            // Если нашли значение и оно не входит в рекомендованные
            if (actualValue && !rule[ruleKey].includes(actualValue)) {
              const recommendations = rule[ruleKey].join(', ');
              let message = rule.message;
              
              // Заменяем плейсхолдеры
              message = message.replace('{type}', selectedParams.type || '')
                               .replace('{style}', recommendations)
                               .replace('{features}', recommendations)
                               .replace('{loader}', recommendations)
                               .replace('{lang}', recommendations)
                               .replace('{languages}', recommendations)
                               .replace('{software}', recommendations)
                               .replace('{personality}', recommendations)
                               .replace('{tone}', recommendations)
                               .replace('{tempo}', recommendations)
                               .replace('{instruments}', recommendations)
                               .replace('{complexity}', recommendations)
                               .replace('{cuisine}', recommendations)
                               .replace('{audience}', recommendations)
                               .replace('{content}', recommendations)
                               .replace('{frequency}', recommendations)
                               .replace('{task}', recommendations)
                               .replace('{subj}', recommendations)
                               .replace('{materials}', recommendations)
                               .replace('{age}', recommendations)
                               .replace('{values}', recommendations);
              
              warnings.push(`💡 ${message}`);
            }
          }
        });
      }
    });
  }
  
  // Проверка цветовых рекомендаций (только для websites)
  if (rules.colorWarnings && type === 'websites') {
    rules.colorWarnings.forEach(rule => {
      let conditionMet = true;
      Object.keys(rule.when).forEach(paramKey => {
        if (!selectedParams[paramKey] || !rule.when[paramKey].includes(selectedParams[paramKey])) {
          conditionMet = false;
        }
      });
      
      if (conditionMet) {
        if (rule.warningFor && rule.warningFor.includes(selectedParams.color)) {
          warnings.push(`🎨 ${rule.message}`);
        }
        if (rule.recommendedColors && !rule.recommendedColors.includes(selectedParams.color)) {
          warnings.push(`🎨 Для стиля '${selectedParams.style}' рекомендуем: ${rule.recommendedColors.join(', ')}`);
        }
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}

// Функция для отображения валидационных сообщений
function showValidationMessages(validation) {
  const container = document.getElementById('validationMessages');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (validation.errors.length > 0) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.innerHTML = `
      <strong>⚠️ Проблемы с комбинацией:</strong>
      <ul>${validation.errors.map(e => `<li>${e}</li>`).join('')}</ul>
    `;
    container.appendChild(errorDiv);
  }
  
  if (validation.warnings.length > 0) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'validation-warning';
    warningDiv.innerHTML = `
      <strong>💡 Рекомендации:</strong>
      <ul>${validation.warnings.map(w => `<li>${w}</li>`).join('')}</ul>
    `;
    container.appendChild(warningDiv);
  }
  
  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    const successDiv = document.createElement('div');
    successDiv.className = 'validation-success';
    successDiv.textContent = '✅ Все параметры совместимы';
    container.appendChild(successDiv);
  }
}

// ===== КРОСС-РЕКОМЕНДАЦИИ =====
function showCrossRecommendations() {
  const recommendationsContainer = document.getElementById('crossRecommendations');
  if (!recommendationsContainer) {
    // Создаём контейнер если его нет
    const container = document.createElement('div');
    container.id = 'crossRecommendations';
    container.className = 'cross-recommendations';
    // Вставляем перед формой
    const form = modal.querySelector('#prompt-form');
    if (form) {
      form.parentNode.insertBefore(container, form);
    }
  }
  
  const userText = customInput.value.trim();
  if (!userText || userText.length < 5) {
    recommendationsContainer.style.display = 'none';
    return;
  }
  
  // Проверяем рекомендации для текущей категории
  const matchedRecommendations = checkCrossRecommendations(selectedType, userText);
  
  if (!matchedRecommendations || matchedRecommendations.length === 0) {
    recommendationsContainer.style.display = 'none';
    return;
  }
  
  // Показываем рекомендации
  recommendationsContainer.innerHTML = `
    <div class="recommendations-header">
      <i class="fas fa-lightbulb"></i>
      <span>Связанные возможности</span>
    </div>
    ${matchedRecommendations.map(rec => `
      <div class="recommendation-card" data-category="${rec.recommendCategory}">
        <div class="recommendation-text">${rec.message}</div>
        <div class="recommendation-actions">
          <button class="btn btn-sm btn-secondary try-recommendation" 
                  data-category="${rec.recommendCategory}"
                  data-preset='${JSON.stringify(rec.presetParams || {})}'>
            Попробовать
          </button>
        </div>
      </div>
    `).join('')}
  `;
  
  recommendationsContainer.style.display = 'block';
  
  // Обработчики для кнопок
  recommendationsContainer.querySelectorAll('.try-recommendation').forEach(btn => {
    btn.addEventListener('click', function() {
      const newCategory = this.getAttribute('data-category');
      const presetParams = JSON.parse(this.getAttribute('data-preset') || '{}');
      
      // Переключаем категорию
      switchToCategory(newCategory, presetParams);
    });
  });
}

// Функция переключения категории
function switchToCategory(newCategory, presetParams = {}) {
  selectedType = newCategory;
  incCategory(newCategory);
  
  // Обновляем модалку
  const modalTitle = modal.querySelector(".modal-title");
  modalTitle.textContent = `Кастомизация: ${promptTemplates[newCategory]?.name || newCategory}`;
  
  // Сохраняем текст пользователя
  const currentText = customInput.value;
  renderTechnicalParams(newCategory);
  customInput.value = currentText;
  
  // Применяем пресет параметры
  if (Object.keys(presetParams).length > 0) {
    setTimeout(() => applyPresetParams(presetParams), 100);
  }
  
  // Показываем новые рекомендации
  setTimeout(showCrossRecommendations, 300);
}

  // ===== МОДАЛКА =====
  let selectedType = "recipes";

  const modal = document.createElement("div");
  modal.className = "customization-modal";
  modal.innerHTML = `
    <div class="modal-content" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3 class="modal-title">Кастомизация промпта</h3>
        <button class="modal-close" aria-label="Закрыть">&times;</button>
      </div>
      <div class="modal-body">
        <form id="prompt-form">
          <div id="technical-params" class="technical-params"></div>

          <div class="form-group">
            <label for="custom-input">Ваша идея или описание</label>
            <textarea id="custom-input" placeholder="Опишите вашу идею детально..." required></textarea>
          </div>

          <div class="form-group">
            <label for="tone-select">Стиль промпта</label>
            <select id="tone-select">
              <option value="professional">Профессиональный</option>
              <option value="friendly">Дружеский</option>
              <option value="creative">Креативный</option>
              <option value="technical">Технический</option>
              <option value="detailed">Детализированный</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary">Сгенерировать промпт</button>
        </form>

<div class="generated-prompt">
  <h4>Ваш промпт:</h4>
  <div id="final-prompt" class="prompt-output"></div>

  <div class="example-actions" style="margin-top:12px; justify-content:flex-start;">
    <button id="copy-prompt" class="btn btn-secondary" type="button">Копировать</button>
    <button id="download-prompt" class="btn btn-primary" type="button">Скачать</button>
  </div>
</div>

      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // ===== ЗАЩИТА МОДАЛКИ ОТ ЗАКРЫТИЯ =====
  let isPromptGenerated = false;
  let isFormDirty = false;
  
  // Функция проверки перед закрытием модалки
  function checkBeforeModalClose() {
    // Если промпт уже сгенерирован или форма заполнена
    if (isPromptGenerated || isFormDirty) {
      return confirm('У вас есть несохранённый промпт. Вы уверены, что хотите закрыть?');
    }
    return true;
  }
  
  // Переопределяем закрытие модалки
  function closeModalWithCheck() {
    if (checkBeforeModalClose()) {
      closeModal();
      // Сброс флагов после закрытия
      isPromptGenerated = false;
      isFormDirty = false;
    }
  }

// Модифицируем renderTechnicalParams для добавления валидации
function renderTechnicalParams(type) {
  const container = modal.querySelector("#technical-params");
  const params = promptTemplates[type]?.params || {};
  let html = `<h4 style="margin-bottom: 1.5rem; color: var(--accent-color);">${promptTemplates[type]?.name || type}</h4>`;
  
  // Добавляем контейнер для валидационных сообщений
  html += `<div id="validationMessages" style="margin-bottom: 20px;"></div>`;
  
  // Функция для обновления валидации при изменении параметров
  const updateValidation = () => {
    const selectedParams = {};
    for (const [key, param] of Object.entries(params)) {
      const element = container.querySelector(`#param-${key}`);
      if (element) {
        if (param.type === "select") {
          selectedParams[key] = element.value;
        } else if (param.type === "multiselect") {
          const checked = element.querySelectorAll('input[type="checkbox"]:checked');
          selectedParams[key] = Array.from(checked).map(cb => cb.value);
        }
      }
    }
    
    const validation = validateCombination(type, selectedParams);
    showValidationMessages(validation);
  };

  for (const [key, param] of Object.entries(params)) {
    html += `<div class="param-group">`;
    html += `<label>${param.label}</label>`;

    // тут
    if (param.type === "select") {
      if (key === 'color') {
        // Особый случай для color с классом color-select
        html += `<select id="param-${key}" class="tech-param color-select" data-param="${key}">`;
        param.options.forEach((option) => {
          const selected = option === param.default ? "selected" : "";
          html += `<option value="${option}" ${selected}>${option}</option>`;
        });
        html += `</select>`;
      } else {
        // Обычный select для остальных
        html += `<select id="param-${key}" class="tech-param" data-param="${key}">`;
        param.options.forEach((option) => {
          const selected = option === param.default ? "selected" : "";
          html += `<option value="${option}" ${selected}>${option}</option>`;
        });
        html += `</select>`;
      }
      // тут
    } else if (param.type === "multiselect") {
      html += `<div class="multi-select" id="param-${key}" data-param="${key}">`;
      const defaultValues = Array.isArray(param.default) ? param.default : [param.default];
      param.options.forEach((option) => {
        const checked = defaultValues.includes(option) ? "checked" : "";
        html += `
          <label class="checkbox-label">
            <input type="checkbox" value="${option}" ${checked} data-param="${key}">
            ${option}
          </label>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;
  }

  container.innerHTML = html || "<p>Для этого типа промпта не требуется дополнительных параметров.</p>";
  
  // Добавляем обработчики событий для валидации
  container.querySelectorAll('select.tech-param, .multi-select input[type="checkbox"]').forEach(element => {
    element.addEventListener('change', updateValidation);
  });
  
  // Инициализируем валидацию с текущими значениями
  setTimeout(updateValidation, 100);

// Обновляем цветной select если он есть
setTimeout(() => {
  const colorSelect = container.querySelector('.color-select');
  if (colorSelect) {
    // Устанавливаем начальное значение data-value
    updateColorSelect(colorSelect);
    
    colorSelect.addEventListener('change', function() {
      updateColorSelect(this);
    });
    
    // Также обновляем при инициализации модалки
    updateColorSelect(colorSelect);
  }
 }, 50);
}

typeCards.forEach((card) => {
    card.addEventListener("click", function () {
        // Сброс флагов при выборе новой категории
        isPromptGenerated = false;
        isFormDirty = false;
        
        selectedType = this.getAttribute("data-type") || "recipes";
        incCategory(selectedType);
        renderExamples(selectedType);

        const modalTitle = modal.querySelector(".modal-title");
        modalTitle.textContent = `Кастомизация: ${promptTemplates[selectedType]?.name || selectedType}`;

        renderTechnicalParams(selectedType);

        const form = modal.querySelector("#prompt-form");
        form.reset();
        modal.querySelector("#final-prompt").textContent = "";

        // === ДОБАВИТЬ ЭТО ===
        // Сброс стадий анимации
        const stages = document.querySelectorAll('.stage');
        if (stages.length > 0) {
            stages.forEach(stage => {
                stage.classList.remove('active', 'completed');
            });
            stages[0].classList.add('active');
        }
        // === КОНЕЦ ДОБАВЛЕНИЯ ===

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    });
});

  // Закрытие
  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  modal.querySelector(".modal-close").addEventListener("click", closeModalWithCheck);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalWithCheck();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      e.preventDefault(); // Предотвращаем мгновенное закрытие
      closeModalWithCheck();
    }
  });

  // ===== Генерация =====
  const promptForm = modal.querySelector("#prompt-form");
  const customInput = modal.querySelector("#custom-input");
  const toneSelect = modal.querySelector("#tone-select");
  const finalPrompt = modal.querySelector("#final-prompt");
  const copyButton = modal.querySelector("#copy-prompt");

  // Отслеживаем изменения в текстовом поле
customInput.addEventListener('input', () => {
  if (customInput.value.trim()) {
    isFormDirty = true;
  }
  
  // Анализируем текст для кросс-рекомендаций
  if (customInput.value.trim().length > 10) {
    showCrossRecommendations();
  }
});

// ДОБАВЬТЕ ДЕБАУНС ДЛЯ КОНТЕКСТУАЛЬНЫХ ПАРАМЕТРОВ (после вышеуказанного кода)
customInput.addEventListener('input', debounce(() => {
  const text = customInput.value.trim();
  if (text.length < 15) return;
  
  const result = applyContextualParams(selectedType, text);
  
  // Применяем автопараметры
  if (Object.keys(result.autoParams).length > 0) {
    applyPresetParams(result.autoParams);
    
    // Показываем уведомление
    showContextToast(`Автоматически настроены параметры для "${promptTemplates[selectedType]?.name || selectedType}"`);
  }
  
  // Показываем suggestions
  showContextSuggestions(result.suggestions);
}, 800));

// Функция для показа toast-уведомлений
function showContextToast(message) {
  // Удаляем старый toast если есть
  const oldToast = document.querySelector('.context-toast');
  if (oldToast) oldToast.remove();
  
  // Создаём новый toast
  const toast = document.createElement('div');
  toast.className = 'context-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas fa-magic"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Анимация появления
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Удаление через 3 секунды
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
  
  // Отслеживаем изменения в селектах
  toneSelect.addEventListener('change', () => {
    isFormDirty = true;
  });

function buildPromptText(type, idea, tone = "professional", overrideParams = {}) {
  if (!promptTemplates[type]) return "";

  const tpl = promptTemplates[type];
  const params = {};

  // Сначала копируем значения из overrideParams (это переменные из примера)
  for (const [key, value] of Object.entries(overrideParams)) {
    params[key] = value;
  }

  // Затем заполняем оставшиеся параметры из формы
  const tplParams = tpl.params || {};
  for (const [key, param] of Object.entries(tplParams)) {
    // Если параметр уже есть в overrideParams, пропускаем
    if (params[key] !== undefined) continue;
    
    if (param.type === "select") {
      const el = modal.querySelector(`#param-${key}`);
      if (el) params[key] = el.value;
    } else if (param.type === "multiselect") {
      const box = modal.querySelector(`#param-${key}`);
      if (box) {
        const checked = box.querySelectorAll('input[type="checkbox"]:checked');
        params[key] = Array.from(checked).map(cb => cb.value);
      }
    }
  }

  // Если шаблон - функция, вызываем её с параметрами
  if (typeof tpl.template === 'function') {
    return tpl.template(params, idea, tone);
  }

  // Иначе используем старый строковый шаблон
  let text = tpl.template;
  text = text.replace("{idea}", idea);

  // Заменяем все параметры в шаблоне
  for (const [key, value] of Object.entries(params)) {
    const paramValue = Array.isArray(value) ? value.join(", ") : value || "";
    text = text.replace(new RegExp(`\\{${key}\\}`, "g"), paramValue);
  }

  // Удаляем оставшиеся неиспользованные параметры {param}
  text = text.replace(/\{[^}]+\}/g, "").replace(/\s{2,}/g, " ").trim();
  
  // Добавляем тон в начало для строковых шаблонов
  let tonePrefix = "";
  switch (tone) {
    case "professional": tonePrefix = "Используй профессиональный язык. "; break;
    case "friendly": tonePrefix = "Будь дружелюбным и приветливым. "; break;
    case "creative": tonePrefix = "Прояви креативность и оригинальность. "; break;
    case "technical": tonePrefix = "Сфокусируйся на технических деталях. "; break;
    case "detailed": tonePrefix = "Дай максимально детализированный ответ. "; break;
  }
  
  text = tonePrefix + text + "\n\nПромпт создан с помощью TAIPrompts";

  return text;
}

const promptExamples = {
  recipes: [
    {
      title: "Быстрый ужин",
      idea: "Быстрый ужин из курицы и овощей на сковороде",
      cuisine: "мексиканской",
      dietary: "Высокобелковое",
      complexity: "Простое",
      tone: "friendly"
    }
  ],

  websites: [
    {
      title: "Портфолио дизайнера",
      idea: "Портфолио UI/UX дизайнера в стиле матового стекла",
      type: "Портфолио",
      stack: "React",
      style: "Матовое стекло",
      color: "Тайский тип (#5c71e5)",
      features: "Адаптивный дизайн, PWA, SEO оптимизация",
      tone: "creative"
    }
  ],

  images: [
    {
      title: "Киберпанк-город",
      idea: "Ночной киберпанк город под дождём с неоновыми вывесками",
      style: "футуристическое",
      aspect_ratio: "16:9 (широкоэкранное)",
      quality: "Высокое (4K)",
      tone: "creative"
    }
  ],

  stickers: [
    {
      title: "Мем-пак",
      idea: "Мемные стикеры для чата друзей",
      style: "мемный",
      platform: "Telegram",
      emotions: "Радость, Смех, Удивление, Одобрение",
      tone: "creative"
    }
  ],

  school: [
    {
      title: "Сочинение",
      idea: "Сочинение на тему дружбы для 7 класса",
      subj: "Литература",
      task: "Сочинение",
      class: "5-8 класс",
      tone: "friendly"
    }
  ],

  toys: [
    {
      title: "Настольная игра",
      idea: "Настольная игра для всей семьи",
      type: "настольной игры",
      materials: "комбинированные",
      age_group: "6-12 лет",
      tone: "creative"
    }
  ],

  "3d": [
    {
      title: "Персонаж",
      idea: "Фэнтези персонаж — аниме девушка, по стилю напоминает Genshin Impact",
      style: "стилизованный",
      type: "персонажа",
      software: "Blender",
      polygons: "Medium (10-50k)",
      tone: "detailed"
    }
  ],

  bots: [
    {
      title: "Telegram-бот",
      idea: "Telegram-бот для напоминаний и заметок",
      platform: "Telegram",
      language: "Python",
      functionality: "Команды, Уведомления, База данных",
      ai: "Нет",
      tone: "professional"
    }
  ],

  minecraft: [
    {
      title: "Квесты",
      idea: "Датапак с системой квестов и наград",
      type: "Датапак",
      version: "1.20.1",
      loader: "Fabric",
      compatibility: "Сервер",
      features: "Квесты, Награды, GUI, Конфиг",
      tone: "professional"
    }
  ],

  characterai: [
    {
      title: "Аниме девушка",
      idea: "Дружелюбный, соблазнительная аниме девушка",
      name: "Аниме",
      personality: "Дружелюбный, Юмористический, Наивный",
      appearance: "Аниме персонаж, Человек",
      tone2: "Дружеский",
      tone: "friendly"
    }
  ],

  suno: [
    {
      title: "Ностальгия",
      idea: "Ностальгичная песня про школьные годы",
      genre: "Поп",
      style: "Ностальгический",
      tempo: "Медленный",
      instruments: "Фортепиано, Гитара, Вокал",
      structure: "Куплет-Припев-Мост",
      tone: "detailed"
    }
  ],

  youtube: [
    {
      title: "Идея видео",
      idea: "Видео про изучение программирования с нуля",
      content_type: "Образовательный",
      audience: "Взрослые",
      frequency: "Еженедельно",
      thumbnail_style: "Профессиональный",
      monetization: "Реклама",
      tone: "professional"
    }
  ],

  plugin: [
    {
      title: "Плагин для ютуба",
      idea: "Плагин, который показывает всю информацию о видео на ютубе",
      type: "Плагин",
      browser: "Chromium-браузер",
      func: "Нейросеть",
      additionally: "Полный код",
      tone: "professional"
    }
  ],

  setup: [
    {
      title: "Десктоп-приложение",
      idea: "Приложение для учёта личных задач",
      type: "Утилита",
      lang: "Python",
      hang: "Смена темы, Горячие клавиши, Сохранение чего-то в собственный формат файла",
      setupper: "Inno Setup",
      oc: "Windows",
      tone: "technical"
    }
  ]
};

function renderExamples(type) {
  const grid = document.getElementById("examplesGrid");
  if (!grid) return;

  const examples = promptExamples[type] || [];
  const firstExample = examples[0];
  
  if (!firstExample) {
    grid.innerHTML = `<div class="examples-placeholder">
      Выбери категорию, чтобы увидеть пример.
    </div>`;
    return;
  }

  // Извлекаем все параметры из примера
  const { title, idea, tone, ...exampleParams } = firstExample;
  
  // Генерируем промпт с параметрами из примера
  const text = buildPromptText(type, idea, tone || "professional", exampleParams);
  
  grid.innerHTML = `
    <div class="example-card">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom: 15px;">
        <strong style="font-size: 1.1rem;">${title || "Пример промпта"}</strong>
        <span class="tag" style="margin:0; background: rgba(94, 114, 228, 0.2); color: var(--accent-color); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem;">
          ${(tone || "professional")}
        </span>
      </div>

      <pre>${text}</pre>

      <div class="example-actions">
        <button class="btn btn-secondary" data-copy style="flex: 1;">
          Копировать
        </button>
        <button class="btn btn-primary" data-use style="flex: 1;">
          Использовать
        </button>
      </div>
    </div>
  `;

  // Кнопки
  const copyBtn = grid.querySelector("[data-copy]");
  const useBtn = grid.querySelector("[data-use]");

  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Скопировано!";
      copyBtn.classList.add("btn-primary");
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove("btn-primary");
      }, 2000);
    };
  }

  if (useBtn) {
    useBtn.onclick = () => {
      selectedType = type;

      const modalTitle = modal.querySelector(".modal-title");
      modalTitle.textContent = `Кастомизация: ${promptTemplates[selectedType]?.name || selectedType}`;

      renderTechnicalParams(selectedType);

      // Заполняем значения из примера
      toneSelect.value = tone || "professional";
      customInput.value = idea;

      // Заполняем технические параметры из примера
      for (const [key, value] of Object.entries(exampleParams)) {
        const paramEl = modal.querySelector(`#param-${key}`);
        if (paramEl) {
          if (paramEl.tagName === 'SELECT') {
            paramEl.value = value;
          } else if (paramEl.classList.contains('multi-select')) {
            // Для мультиселектов
            const checkboxes = paramEl.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
              checkbox.checked = value.includes(checkbox.value);
            });
          }
        }
      }

      modal.querySelector("#final-prompt").textContent = "";
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    };
  }
}

promptForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Отслеживаем изменения
    isFormDirty = true;
    
    let customText = customInput.value?.trim();
    const tone = toneSelect.value;

    if (!customText) return alert("Пожалуйста, опишите вашу идею");
    
    // ===== ЦЕНЗУРА =====
    const originalText = customText;
    customText = censorText(customText);
    
    if (!promptTemplates[selectedType]) return alert("Шаблон для этого типа промпта еще не готов");

    // Показать анимацию
    const overlay = document.getElementById('generationOverlay');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const animationTitle = document.getElementById('animationTitle');
    const animationSubtitle = document.getElementById('animationSubtitle');
    
    if (overlay) {
        // Устанавливаем заголовок в зависимости от типа промпта
        const typeName = promptTemplates[selectedType]?.name || selectedType;
        animationTitle.textContent = `Генерируем ${typeName.toLowerCase()}...`;
        animationSubtitle.textContent = `Анализируем параметры: "${customText.substring(0, 30)}${customText.length > 30 ? '...' : ''}"`;
        
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Запускаем анимацию прогресса
        await animateGenerationProgress(progressFill, progressText, overlay);
    }

    const params = {};
    for (const [key, param] of Object.entries(promptTemplates[selectedType].params || {})) {
        if (param.type === "select") {
            const el = modal.querySelector(`#param-${key}`);
            if (el) params[key] = el.value;
        } else if (param.type === "multiselect") {
            const box = modal.querySelector(`#param-${key}`);
            if (box) {
                const checked = box.querySelectorAll('input[type="checkbox"]:checked');
                params[key] = Array.from(checked).map((cb) => cb.value).join(", ");
            }
        }
    }

    // Небольшая задержка для "реалистичности" генерации
    await new Promise(resolve => setTimeout(resolve, 800));

    const finalPromptText = buildPromptText(selectedType, customText, tone, params);

    incGeneration();
    finalPrompt.textContent = finalPromptText;
    finalPrompt.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Устанавливаем флаг, что промпт сгенерирован
    isPromptGenerated = true;
  
    // Скрыть анимацию
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ✅ копирование — ОДИН раз, не внутри submit
copyButton.addEventListener("click", function () {
  if (!finalPrompt.textContent) return alert("Сначала сгенерируйте промпт");
  navigator.clipboard.writeText(finalPrompt.textContent).then(() => {
    const originalText = this.textContent;
    this.textContent = "Скопировано!";
    this.classList.add("btn-primary");
    setTimeout(() => {
      this.textContent = originalText;
      this.classList.remove("btn-primary");
    }, 2000);
  });
});

const downloadButton = modal.querySelector("#download-prompt");

downloadButton.addEventListener("click", () => {
  const text = finalPrompt.textContent?.trim();
  if (!text) return alert("Сначала сгенерируйте промпт");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10); // 2025-12-18
  a.href = url;
  a.download = `TAIPrompts_${selectedType}_${date}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
});

  // Инициализируем цветные селекты
  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('color-select')) {
      updateColorSelect(e.target);
    }
  });
  
  // Инициализируем существующие
  setTimeout(() => {
    document.querySelectorAll('.color-select').forEach(updateColorSelect);
  }, 300);

  console.log("✅ Генератор инициализирован");

  // Защита при перезагрузке страницы, если модалка открыта
  window.addEventListener('beforeunload', function(event) {
    if (modal.classList.contains('active') && (isPromptGenerated || isFormDirty)) {
      event.preventDefault();
      event.returnValue = '';
      return 'У вас есть несохранённый промпт. Вы уверены, что хотите покинуть страницу?';
    }
  });

  // Новая функция для анимации прогресса
  async function animateGenerationProgress(progressFill, progressText, overlay) {
    return new Promise(resolve => {
      let progress = 0;
      const stages = [
        { percent: 10, text: "10% - Анализ параметров" },
        { percent: 25, text: "25% - Инициализация ИИ" },
        { percent: 40, text: "40% - Обработка запроса" },
        { percent: 55, text: "55% - Генерация шаблона" },
        { percent: 70, text: "70% - Оптимизация промпта" },
        { percent: 85, text: "85% - Добавление деталей" },
        { percent: 95, text: "95% - Финальная проверка" },
        { percent: 100, text: "100% - Готово!" }
      ];
      
      const stagesElements = document.querySelectorAll('.stage');
      
      function updateProgress() {
        if (progress < 100) {
          const nextStage = stages.find(s => s.percent > progress) || stages[stages.length - 1];
          const increment = Math.random() * 15 + 5; // 5-20% за шаг
          
          progress = Math.min(progress + increment, nextStage.percent);
          
          progressFill.style.width = `${progress}%`;
          progressText.textContent = `${Math.round(progress)}%`;
          
          // Обновляем заголовок прогресса
          const stage = stages.find(s => s.percent >= progress) || stages[stages.length - 1];
          progressText.textContent = stage.text;
          
          // Активируем стадии
          const activeIndex = Math.floor((progress / 100) * stagesElements.length);
          stagesElements.forEach((el, index) => {
            if (index <= activeIndex) {
              el.classList.add('active');
              if (index < activeIndex) {
                el.classList.add('completed');
              }
            } else {
              el.classList.remove('active');
            }
          });
          
          // Случайная задержка для реалистичности
          const delay = Math.random() * 300 + 100; // 100-400ms
          setTimeout(updateProgress, delay);
        } else {
          // Все стадии завершены
          stagesElements.forEach(el => {
            el.classList.add('completed');
            el.classList.add('active');
          });
          
          // Небольшая задержка перед закрытием
          setTimeout(() => {
            if (overlay) {
              overlay.classList.add('closing');
              setTimeout(() => {
                overlay.classList.remove('active', 'closing');
                resolve();
              }, 300);
            } else {
              resolve();
            }
          }, 800);
        }
      }
      
      updateProgress();
    });
  }
}

// ===== ПОИСК ПО КАРТОЧКАМ =====
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchStats = document.getElementById('searchStats');
    const foundCount = document.getElementById('foundCount');
    const totalCount = document.getElementById('totalCount');
    const typeCards = document.querySelectorAll('.type-card');
    
    if (!searchInput || typeCards.length === 0) return;
    
    // Установим общее количество
    totalCount.textContent = typeCards.length;
    
    function highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    function searchCards(searchTerm) {
        searchTerm = searchTerm.toLowerCase().trim();
        let visibleCount = 0;
        
        typeCards.forEach(card => {
            // Собираем весь текст карточки для поиска
            const title = card.querySelector('h3')?.textContent || '';
            const description = card.querySelector('p')?.textContent || '';
            const vibeDescription = card.querySelector('.vibe-description')?.textContent || '';
            const tags = Array.from(card.querySelectorAll('.vibe-tag'))
                .map(tag => tag.textContent)
                .join(' ');
            
            const allText = `${title} ${description} ${vibeDescription} ${tags}`.toLowerCase();
            
            // Проверяем совпадение
            const isVisible = searchTerm === '' || allText.includes(searchTerm);
            
            // Показываем/скрываем карточку
            card.style.display = isVisible ? '' : 'none';
            card.style.opacity = isVisible ? '1' : '0';
            card.style.transform = isVisible ? '' : 'scale(0.95)';
            card.style.transition = 'all 0.3s ease';
            
            if (isVisible) {
                visibleCount++;
                
                // Подсветка текста (только если есть поисковый запрос)
                if (searchTerm) {
                    const titleEl = card.querySelector('h3');
                    const descEl = card.querySelector('p');
                    const vibeEl = card.querySelector('.vibe-description');
                    
                    if (titleEl) {
                        const originalTitle = titleEl.getAttribute('data-original') || titleEl.textContent;
                        titleEl.setAttribute('data-original', originalTitle);
                        titleEl.innerHTML = highlightText(originalTitle, searchTerm);
                    }
                    
                    if (descEl) {
                        const originalDesc = descEl.getAttribute('data-original') || descEl.textContent;
                        descEl.setAttribute('data-original', originalDesc);
                        descEl.innerHTML = highlightText(originalDesc, searchTerm);
                    }
                    
                    if (vibeEl) {
                        const originalVibe = vibeEl.getAttribute('data-original') || vibeEl.textContent;
                        vibeEl.setAttribute('data-original', originalVibe);
                        vibeEl.innerHTML = highlightText(originalVibe, searchTerm);
                    }
                }
            } else {
                // Восстанавливаем оригинальный текст при скрытии
                const titleEl = card.querySelector('h3');
                const descEl = card.querySelector('p');
                const vibeEl = card.querySelector('.vibe-description');
                
                if (titleEl?.hasAttribute('data-original')) {
                    titleEl.innerHTML = titleEl.getAttribute('data-original');
                }
                if (descEl?.hasAttribute('data-original')) {
                    descEl.innerHTML = descEl.getAttribute('data-original');
                }
                if (vibeEl?.hasAttribute('data-original')) {
                    vibeEl.innerHTML = vibeEl.getAttribute('data-original');
                }
            }
        });
        
        // Обновляем статистику
        foundCount.textContent = visibleCount;
        searchStats.classList.toggle('visible', searchTerm !== '');
        
        // Показываем сообщение "ничего не найдено"
        let noResultsEl = document.querySelector('.no-results');
        if (visibleCount === 0 && searchTerm !== '') {
            if (!noResultsEl) {
                const grid = document.querySelector('.prompt-types-grid');
                noResultsEl = document.createElement('div');
                noResultsEl.className = 'no-results';
                noResultsEl.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте другой поисковый запрос или проверьте опечатки</p>
                    <button id="clearSearch" class="btn btn-secondary" style="margin-top: 15px;">
                        Очистить поиск
                    </button>
                `;
                grid.appendChild(noResultsEl);
                
                // Обработчик кнопки очистки
                noResultsEl.querySelector('#clearSearch').addEventListener('click', () => {
                    searchInput.value = '';
                    searchInput.focus();
                    searchCards('');
                });
            }
            noResultsEl.style.display = 'block';
        } else if (noResultsEl) {
            noResultsEl.style.display = 'none';
        }
    }
    
    // Обработчик ввода
    searchInput.addEventListener('input', (e) => {
        searchCards(e.target.value);
    });
    
    // Очистка по кнопке ESC
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchCards('');
        }
    });
    
    // Фокус на поиск при нажатии Ctrl+F
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });
}

function runDebug() {
  console.log("=== TAIPrompts Debug ===");
  console.log("Current page:", window.location.pathname);

  const files = ["index.html", "generator.html", "pricing.html", "development.html", "year.html", "faq.html", "settings.html"];
  files.forEach((file) => {
    fetch(file)
      .then((response) => console.log(`${file}: ${response.ok ? "✅ OK" : "❌ Not found"}`))
      .catch((error) => console.log(`${file}: ❌ Error - ${error.message}`));
  });
}

// ====== START ======
document.addEventListener("DOMContentLoaded", async () => {
  await inject("site-header", "components/header.html");
  await inject("site-footer", "components/footer.html");
  
initCookieBanner();

// если согласие уже было — пишем просмотр страницы
incPathView(location.pathname);


// Автообновление года в футере
const yearEl = document.getElementById('currentYear');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

  setActiveNavLink();
  initNav();
  initGenerator();
  initLightbox();
  initAnimations();
  initSearch();
  runDebug();

  // === ЗАЩИТА ОТ ЗАКРЫТИЯ (только на generator.html) ===
  if (window.location.pathname.includes('generator.html') || 
      window.location.pathname.endsWith('generator.html') ||
      window.location.pathname.endsWith('/generator')) {
    window.addEventListener('beforeunload', function(event) {
      event.preventDefault();
      event.returnValue = '';
    });
  }
  // === КОНЕЦ ЗАЩИТЫ ===

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.error("SW error:", err));
  }
});
