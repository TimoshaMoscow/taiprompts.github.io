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
        "Разработай {type} для Minecraft {version} с описанием: '{idea}'. Особенности: {features}. Совместимость: {compatibility}. Детально опиши функционал, рецепты и механики. Также напиши структуру проекта, полный код и гайд по сборке проекта в Intellij IDEA если требуется. (Например для датапаков не нужен IDEA)",
      params: {
        type: {
          type: "select",
          label: "Тип контента",
          options: ["мод", "ресурспак", "датапак", "плагин", "аддон"],
          default: "мод",
        },
        version: {
          type: "select",
          label: "Версия Minecraft",
          options: ["1.20.x", "1.19.x", "1.18.x", "1.17.x", "1.16.x", "Любая", "1.12x", "1.8x"],
          default: "1.20.x",
        },
        compatibility: {
          type: "select",
          label: "Совместимость",
          options: ["Forge", "Fabric", "Paper", "Spigot", "Bukkit", "Любая"],
          default: "Forge",
        },
        features: {
          type: "multiselect",
          label: "Особенности",
          options: [
            "Новые блоки",
            "Новые мобы",
            "Новые предметы",
            "Генерация структур",
            "Магическая система",
            "Технологии",
            "Квесты",
            "Боссы",
            "GUI",
            "Оптимизация",
            "Клиентские фишки",
            "Конфиг",
          ],
          default: "Оптимизация",
        },
      },
    },

    bots: {
      name: "📱 Боты и автоматизация",
      template:
        "Создай бота на {language} для платформы {platform}, с функционалом '{idea}'. Включи: описание функций, {functionality}, обработку сообщений и установочные инструкции. Добавить ИИ в бота: {ai}",
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
        ai: {
          type: "select",
          label: "Добавить ИИ в бота?",
          options: ["Да", "Нет"],
          default: "Нет",
        },
      },
    },

    websites: {
      name: "🌐 Веб-сайты",
      template:
        "Разработай веб-сайт типа {type} на {stack} по описанию '{idea}'. Включи: структуру сайта, {features}. Основная палитра: {color}. Стиль сайта: {style}",
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

    ai: {
      name: "🤖 AI & G4F",
      template:
        "Создай продвинутый промпт для ИИ на тему '{idea}'. Тип ИИ: {ai_type},  Сложность: {complexity}. Включи: контекст, ограничения, формат ответа и примеры.",
      params: {
        ai_type: {
          type: "select",
          label: "Тип ИИ",
          options: ["ChatGPT", "Midjourney", "DALL-E", "Stable Diffusion", "Claude", "Gemini", "DeepSeek", "Dylan", "Любой"],
          default: "ChatGPT",
        },
        complexity: {
          type: "select",
          label: "Сложность",
          options: ["Базовый", "Продвинутый", "Экспертный", "Исследовательский"],
          default: "Продвинутый",
        },
      },
    },

    characterai: {
      name: "🤖 Character AI",
      template:
        "Создай персонажа для Character AI с описанием '{idea}'. Характеристики: {personality} {appearance}, Тип имени: {name}, Тон общения: {tone}.",
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
        tone: {
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
        "Напиши полный код и структуру проекта для {type} на {lang} для {oc} с функционалом {hang}, и инструкцией по сборке для {setupper}. Подробное описание идеи: '{idea}'",
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
          default: "Умеренный",
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
          ],
          default: "Inno Setup",
        },
        oc: {
          type: "select",
          label: "Система",
          options: ["Windows", "Linux", "Android", "IOS", "MacOS", "Другое"],
          default: "Windows",
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

  for (const [key, param] of Object.entries(tplParams)) {
    if (overrideParams[key] !== undefined) {
      params[key] = overrideParams[key];
      continue;
    }

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

  for (const [key, value] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }

  text = text.replace(/\{[^}]+\}/g, "").replace(/\s{2,}/g, " ").trim();
  text = tonePrefix + text + "\n\nTAIPrompts";

  return text;
}

const promptExamples = {
  recipes: [
    {
      title: "Быстрый ужин",
      idea: "Быстрый ужин из курицы и овощей на сковороде",
      tone: "friendly"
    },
    {
      title: "Здоровый завтрак",
      idea: "Полезный завтрак для спортсмена с высоким содержанием белка",
      tone: "professional"
    }
  ],

  websites: [
    {
      title: "Лендинг курса",
      idea: "Лендинг для онлайн-курса по Python для подростков",
      tone: "professional"
    },
    {
      title: "Портфолио дизайнера",
      idea: "Портфолио UI/UX дизайнера в стиле матового стекла",
      tone: "creative"
    }
  ],

  images: [
    {
      title: "Киберпанк-город",
      idea: "Ночной киберпанк город под дождём с неоновыми вывесками",
      tone: "creative"
    },
    {
      title: "Минимализм",
      idea: "Минималистичный интерьер в светлых тонах",
      tone: "detailed"
    }
  ],

  stickers: [
    {
      title: "Telegram-стикеры",
      idea: "Милый кот для Telegram с эмоциями",
      tone: "friendly"
    },
    {
      title: "Мем-пак",
      idea: "Мемные стикеры для чата друзей",
      tone: "creative"
    }
  ],

  school: [
    {
      title: "Задача по алгебре",
      idea: "Решить квадратное уравнение с объяснением шагов",
      tone: "detailed"
    },
    {
      title: "Сочинение",
      idea: "Сочинение на тему дружбы для 7 класса",
      tone: "friendly"
    }
  ],

  toys: [
    {
      title: "Развивающая игрушка",
      idea: "Развивающая игрушка для детей 5 лет",
      tone: "professional"
    },
    {
      title: "Настольная игра",
      idea: "Настольная игра для всей семьи",
      tone: "creative"
    }
  ],

  "3d": [
    {
      title: "Персонаж",
      idea: "Фэнтези персонаж — воин с мечом",
      tone: "detailed"
    },
    {
      title: "Окружение",
      idea: "Средневековый город для игры",
      tone: "professional"
    }
  ],

  bots: [
    {
      title: "Telegram-бот",
      idea: "Telegram-бот для напоминаний и заметок",
      tone: "professional"
    },
    {
      title: "Discord-бот",
      idea: "Discord-бот для модерации сервера",
      tone: "technical"
    }
  ],

  minecraft: [
    {
      title: "Новая руда",
      idea: "Новая руда, броня и инструменты",
      tone: "technical"
    },
    {
      title: "Квесты",
      idea: "Датапак с системой квестов и наград",
      tone: "professional"
    }
  ],

  ai: [
    {
      title: "Продвинутый промпт",
      idea: "Помощник для анализа сложных текстов",
      tone: "detailed"
    },
    {
      title: "Креативный ИИ",
      idea: "ИИ для генерации идей стартапов",
      tone: "creative"
    }
  ],

  characterai: [
    {
      title: "Дружелюбный персонаж",
      idea: "Дружелюбный виртуальный помощник",
      tone: "friendly"
    },
    {
      title: "Загадочный герой",
      idea: "Загадочный персонаж с тёмным прошлым",
      tone: "creative"
    }
  ],

  suno: [
    {
      title: "Поп-песня",
      idea: "Песня про свободу и ночной город",
      tone: "creative"
    },
    {
      title: "Ностальгия",
      idea: "Ностальгичная песня про школьные годы",
      tone: "detailed"
    }
  ],

  youtube: [
    {
      title: "Идея видео",
      idea: "Видео про изучение программирования с нуля",
      tone: "professional"
    },
    {
      title: "Развлекательный контент",
      idea: "Развлекательное видео для подростков",
      tone: "friendly"
    }
  ],

  setup: [
    {
      title: "Десктоп-приложение",
      idea: "Приложение для учёта личных задач",
      tone: "technical"
    },
    {
      title: "Учебное ПО",
      idea: "Учебное приложение для изучения языков",
      tone: "professional"
    }
  ]
};

  function renderExamples(type) {
  const grid = document.getElementById("examplesGrid");
  if (!grid) return;

  const examples = promptExamples[type] || [];
  if (!examples.length) {
    grid.innerHTML = `<p style="opacity:.6">Примеры скоро появятся</p>`;
    return;
  }

  grid.innerHTML = examples.map((ex, i) => {
    const text = buildPromptText(type, ex.idea, ex.tone || "professional", ex.params || {});
    return `
      <div class="example-card" data-i="${i}">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
          <strong>${ex.title || "Пример"}</strong>
          <span class="tag" style="margin:0;">${(ex.tone || "professional")}</span>
        </div>

        <pre>${text}</pre>

        <div class="example-actions">
          <button class="btn btn-secondary" data-copy>Копировать</button>
          <button class="btn btn-primary" data-use>Использовать</button>
        </div>
      </div>
    `;
  }).join("");

  // кнопки
  grid.querySelectorAll(".example-card").forEach((card) => {
    const i = Number(card.getAttribute("data-i"));
    const ex = examples[i];
    const text = buildPromptText(type, ex.idea, ex.tone || "professional", ex.params || {});

    card.querySelector("[data-copy]").onclick = () => {
      navigator.clipboard.writeText(text);
    };

    card.querySelector("[data-use]").onclick = () => {
      // открываем модалку как будто юзер выбрал категорию
      selectedType = type;

      const modalTitle = modal.querySelector(".modal-title");
      modalTitle.textContent = `Кастомизация: ${promptTemplates[selectedType]?.name || selectedType}`;

      renderTechnicalParams(selectedType);

      // выставляем тон
      toneSelect.value = ex.tone || "professional";

      // заполняем идею
      customInput.value = ex.idea;

      // если хочешь — можно ещё применить ex.params к полям (скажи, сделаю)
      modal.querySelector("#final-prompt").textContent = "";
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    };
  });
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
