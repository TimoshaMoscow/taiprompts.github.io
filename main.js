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
        🍪 Мы используем cookies для простой статистики (просмотры, клики, генерации).
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

  const promptTemplates = {
    recipes: {
      name: "🍳 Рецепты",
      template:
        "Создай подробный рецепт {cuisine} кухни, блюда с описанием: '{idea}'. Ограничения: {dietary}, Сложность: {complexity}. Включи ингредиенты, пошаговое приготовление, время готовки и полезную информацию, например КБЖУ.",
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

    minecraft: {
      name: "⛏️ Моды Minecraft",
      template:
        "Разработай {type} для Minecraft {version} {loader} для {compatibility} с описанием: '{idea}'. Особенности: {features} и {additionally}. Детально опиши функционал и механики.",
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
          options: ["1.21.4", "1.21", "1.20.1", "1.19.2", "1.18.2", "1.17", "1.16.5", "Любая", "1.12.2", "1.8.9"],
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

    bots: {
      name: "📱 Боты и автоматизация",
      template:
        "Создай бота на {language} для платформы {platform}, с функционалом '{idea}'. Включи: описание функций, {functionality}, {additionally}, обработку сообщений и установочные инструкции.",
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

    websites: {
      name: "🌐 Веб-сайты",
      template:
        "Разработай веб-сайт типа {type} на {stack} по описанию '{idea}'. Включи: {additionally}, {features}. Основная палитра: {color}. Стиль сайта: {style}",
      params: {
        type: {
          type: "select",
          label: "Тип сайта",
          options: ["Лендинг", "Интернет-магазин", "Блог", "Портфолио", "Социальную сеть", "Панель управления", "Многостраничное приложение"],
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
          options: ["Минимализм", "Матовое стекло", "Брутализм", "Ретро", "Киперпанк", "PHP"],
          default: "Матовое стекло",
        },
        color: {
          type: "select",
          label: "Основная палитра",
          options: ["Красный", "Оранжевый", "Голубой", "Жёлтый", "Зелёный", "Чёрный", "Белый", "Киберпанк", "Другой"],
          default: "Красный",
        },
        features: {
          type: "multiselect",
          label: "Функции",
          options: ["Адаптивный дизайн", "PWA", "SEO оптимизация", "Корзина покупок", "Блог", "Комментарии", "Поиск", "Код в одном файле"],
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

    images: {
      name: "🎨 Генерация изображений",
      template:
        "Сгенерируй {style} изображение по описанию: '{idea}'. {aspect_ratio} {quality}. С детальным описанием: композиция, цвета, освещение, настроение и детали.",
      params: {
        style: {
          type: "select",
          label: "Стиль изображения",
          options: ["реалистичное", "мультяшное", "фэнтези", "футуристическое", "минималистичное", "абстрактное"],
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
      name: "🖼️ Стикеры и аватары",
      template:
        "Создай {style} стикерпак для {platform} с описанием: '{idea}'. Нужные эмоции: {emotions}. Включи разнообразные эмоции, действия и ситуации. Сделай всё на прозрачном фоне, чтобы можно было удобно вставить в любой мессенджер.",
      params: {
        style: {
          type: "select",
          label: "Стиль стикеров",
          options: ["мультяшный", "минималистичный", "реалистичный", "кавайный", "мемный", "абстрактный"],
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
      name: "🔷 3D модели",
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
      name: "🧸 Игрушки",
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
      name: "🤖 Character AI",
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
      name: "🎵 Suno AI",
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
      name: "💻 Приложения",
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
          ],
          default: "Python",
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
      name: "📚 Учёба и школа",
      template: "Помоги с заданием по предмету {subj}, Тип задания: {task}, Учусь в {class}. Подробности по заданию: '{idea}'.",
      params: {
        subj: {
          type: "select",
          label: "Предмет",
          options: ["Математика", "Русский", "Литература", "Информатика", "География", "Биология", "Физика", "История", "Химия", "Другое"],
          default: "Математика",
        },
        task: {
          type: "select",
          label: "Задание",
          options: ["Задача", "Чертёж", "Сочинение", "Изложение", "Код", "Сочинение-рассуждение", "Другое"],
          default: "Задача",
        },
        class: {
          type: "select",
          label: "Класс",
          options: ["1-4 класс", "5-8 класс", "9-11 класс", "Колледж", "Университет", "1 курс", "2 курс", "3 курс", "Другой"],
          default: "5-8 класс",
        },
      },
    },

    youtube: {
      name: "📺 YouTube",
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
      name: "↕️ Плагины и расширения",
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
        hang: {
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
    <button id="copy-prompt" class="btn btn-secondary" type="button">Копировать промпт</button>
    <button id="download-prompt" class="btn btn-primary" type="button">Скачать .txt</button>
  </div>
</div>

      </div>
    </div>
  `;
  document.body.appendChild(modal);

  function renderTechnicalParams(type) {
    const container = modal.querySelector("#technical-params");
    const params = promptTemplates[type]?.params || {};
    let html = `<h4 style="margin-bottom: 1.5rem; color: var(--accent-color);">${promptTemplates[type]?.name || type}</h4>`;

    for (const [key, param] of Object.entries(params)) {
      html += `<div class="param-group">`;
      html += `<label>${param.label}</label>`;

      if (param.type === "select") {
        html += `<select id="param-${key}" class="tech-param">`;
        param.options.forEach((option) => {
          const selected = option === param.default ? "selected" : "";
          html += `<option value="${option}" ${selected}>${option}</option>`;
        });
        html += `</select>`;
      } else if (param.type === "multiselect") {
        html += `<div class="multi-select" id="param-${key}">`;
        const defaultValues = Array.isArray(param.default) ? param.default : [param.default];
        param.options.forEach((option) => {
          const checked = defaultValues.includes(option) ? "checked" : "";
          html += `
            <label class="checkbox-label">
              <input type="checkbox" value="${option}" ${checked}>
              ${option}
            </label>
          `;
        });
        html += `</div>`;
      }

      html += `</div>`;
    }

    container.innerHTML = html || "<p>Для этого типа промпта не требуется дополнительных параметров.</p>";
  }

  // Открытие модалки по клику на карточку
  typeCards.forEach((card) => {
    card.addEventListener("click", function () {
    selectedType = this.getAttribute("data-type") || "recipes";
      incCategory(selectedType);
      renderExamples(selectedType);

      const modalTitle = modal.querySelector(".modal-title");
      modalTitle.textContent = `Кастомизация: ${promptTemplates[selectedType]?.name || selectedType}`;

      renderTechnicalParams(selectedType);

      const form = modal.querySelector("#prompt-form");
      form.reset();
      modal.querySelector("#final-prompt").textContent = "";

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  // Закрытие
  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  modal.querySelector(".modal-close").addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
  });

  // ===== Генерация =====
  const promptForm = modal.querySelector("#prompt-form");
  const customInput = modal.querySelector("#custom-input");
  const toneSelect = modal.querySelector("#tone-select");
  const finalPrompt = modal.querySelector("#final-prompt");
  const copyButton = modal.querySelector("#copy-prompt");

function buildPromptText(type, idea, tone = "professional", overrideParams = {}) {
  if (!promptTemplates[type]) return "";

  const tplParams = promptTemplates[type].params || {};
  const params = {};

  // Сначала копируем значения из overrideParams (это переменные из примера)
  for (const [key, value] of Object.entries(overrideParams)) {
    params[key] = value;
  }

  // Затем заполняем оставшиеся параметры из шаблона
  for (const [key, param] of Object.entries(tplParams)) {
    // Если параметр уже есть в overrideParams, пропускаем
    if (params[key] !== undefined) continue;
    
    if (param.type === "select") {
      params[key] = param.default ?? param.options?.[0] ?? "";
    } else if (param.type === "multiselect") {
      const def = param.default;
      params[key] = Array.isArray(def) ? def.join(", ") : def ?? "";
    }
  }

  let tonePrefix = "";
  switch (tone) {
    case "professional": tonePrefix = "Используй профессиональный технический язык. "; break;
    case "friendly": tonePrefix = "Будь дружелюбным и приветливым. "; break;
    case "creative": tonePrefix = "Прояви креативность и оригинальность. "; break;
    case "technical": tonePrefix = "Сфокусируйся на технических деталях. "; break;
    case "detailed": tonePrefix = "Дай максимально детализированный ответ. "; break;
  }

  let text = promptTemplates[type].template;
  text = text.replace("{idea}", idea);

  // Заменяем все параметры в шаблоне
  for (const [key, value] of Object.entries(params)) {
    const paramValue = value || ""; // Если значение undefined или null, используем пустую строку
    text = text.replace(new RegExp(`\\{${key}\\}`, "g"), paramValue);
  }

  // Удаляем оставшиеся неиспользованные параметры {param}
  text = text.replace(/\{[^}]+\}/g, "").replace(/\s{2,}/g, " ").trim();
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
      color: "Голубой",
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
          📋 Копировать
        </button>
        <button class="btn btn-primary" data-use style="flex: 1;">
          🚀 Использовать
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

promptForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const customText = customInput.value?.trim();
  const tone = toneSelect.value;

  if (!customText) return alert("Пожалуйста, опишите вашу идею");
  if (!promptTemplates[selectedType]) return alert("Шаблон для этого типа промпта еще не готов");

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

  const finalPromptText = buildPromptText(selectedType, customText, tone, params);

  incGeneration();
  finalPrompt.textContent = finalPromptText;
  finalPrompt.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

  console.log("✅ Генератор инициализирован");
}

function runDebug() {
  console.log("=== TAIPrompts Debug ===");
  console.log("Current page:", window.location.pathname);

  const files = ["index.html", "generator.html", "pricing.html", "development.html", "year.html"];
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
  runDebug();

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.error("SW error:", err));
  }
});
