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
    setCookie(CONSENT_COOKIE, "accepted", 365);
    banner.remove();

    // Сразу запишем просмотр текущей страницы после согласия
    incPathView(location.pathname);
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
    'фак': '*',
    'мудак': '**',
    'гандон': '*',
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

const promptTemplates = {
  recipes: {
    name: "Рецепты",
    template:
      "Создай подробный рецепт {cuisine} кухни по идее: '{idea}'. Ограничения: {dietary}. Сложность: {complexity}. Структурируй ответ строго по разделам: название блюда, краткое описание, ингредиенты с количеством, пошаговое приготовление, время готовки, советы по подаче, замены ингредиентов и полезные замечания. Пиши конкретно, без общих фраз и лишней воды.",
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
        options: ["Легкая", "Нормальная", "Сложная", "Невозможная"],
        default: "Легкая",
      },
    },
  },

  websites: {
    name: "Веб-сайты",
    template:
      "Разработай веб-сайт типа {type} на {stack} по описанию: '{idea}'. Основная палитра: {color}. Стиль сайта: {style}. Сложность реализации: {complexity}. В ответе обязательно укажи: структуру страниц и блоков, логику интерфейса, адаптивность, UX-решения, анимации, доступность, SEO-детали и список компонентов. Учитывай: {features}, {emoji}, {additionally}. Если указан полный код, покажи готовую структуру проекта и объясни, как его собрать.",
    params: {
      type: {
        type: "select",
        label: "Тип сайта",
        options: ["Лендинг", "Интернет-магазин", "Блог", "Портфолио", "Социальная сеть", "Панель управления", "Многостраничное приложение", "Игра"],
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
        options: ["Минимализм", "Матовое стекло", "Брутализм", "Ретро", "Киберпанк", "Аниме-фэнтези", "Жидкое стекло", "Стекломорфизм"],
        default: "Матовое стекло",
      },
      color: {
        type: "select",
        label: "Основная палитра",
        options: ["Тайские подсказки (#5c71e5)", "Рубиновый (#db0f00)", "Апельсиновый (#f58631)", "Глубокие прятки (#276fdb)", "Лимонный (#f5ee22)", "Обнаружение (#26d13c)", "Угольный (#000000)", "Ванильный (#fffff7)", "Подход звезды (#e431f5)"],
        default: "Тайские подсказки (#5c71e5)",
      },
      features: {
        type: "multiselect",
        label: "Функции",
        options: ["Адаптивный дизайн", "PWA функции", "SEO оптимизация", "Корзина покупок", "Блог", "Комментарии", "Поиск", "Смена темы", "Бекенд", "Аккаунты", "Тарифы", "Галерея изображений", "Блок для отзывов"],
        default: "Адаптивный дизайн",
      },
      emoji: {
        type: "select",
        label: "Оформление иконок",
        options: ["Стандартные эмодзи", "Иконки Font Awesome", "Изображения"],
        default: "Стандартные эмодзи",
      },
      complexity: {
        type: "select",
        label: "Сложность",
        options: ["Легкая", "Нормальная", "Сложная", "Невозможная"],
        default: "Легкая",
      },
      additionally: {
        type: "multiselect",
        label: "Дополнительно",
        options: ["Полный код", "Структура проекта", "Объяснение ключевых понятий", "Изображения по ссылкам из интернета", "Изображения в папке images", "Код в одном файле"],
        default: "Полный код",
      },
    },
  },

  bots: {
    name: "Боты и автоматизация",
    template:
      "Создай бота на {language} для платформы {platform} по идее: '{idea}'. Сложность реализации: {complexity}. Опиши: назначение бота, список команд и сценариев, обработку сообщений и ошибок, работу с хранилищем данных, интеграции, требования к установке и запуску. Учти особенности: {functionality}. Дополнительно включи: {additionally}.",
    params: {
      platform: {
        type: "select",
        label: "Платформа",
        options: ["Telegram", "Discord", "Внешний", "Minecraft", "MAX", "Любой"],
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
        options: ["Админ-панель", "Платежи", "База данных", "API интеграции", "Модерация", "Игры", "Уведомления", "Работа с файлами", "Inline клавиатуры", "Команды"],
        default: "Модерация",
      },
      complexity: {
        type: "select",
        label: "Сложность",
        options: ["Легкая", "Нормальная", "Сложная", "Невозможная"],
        default: "Легкая",
      },
      additionally: {
        type: "multiselect",
        label: "Дополнительно",
        options: ["Полный код", "Структура проекта", "Объяснение ключевых понятий"],
        default: "Полный код",
      },
    },
  },

  minecraft: {
    name: "Моды Minecraft",
    template:
      "Разработай {type} для Minecraft {version} {loader} для {compatibility} по описанию: '{idea}'. Сложность реализации: {complexity}. В ответе опиши: основную механику, игровые изменения, блоки/предметы/мобы, рецепты, конфигурацию, совместимость, структуру файлов и этапы реализации. Особенности: {features}. Дополнительно: {additionally}.",
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
        options: ["1.21.8", "1.21.4", "1.21", "1.20.1", "1.19.2", "1.18.2", "1.17", "1.16.5", "1.12.2", "1.8.9"],
        default: "1.20.1",
      },
      loader: {
        type: "select",
        label: "Загрузчик",
        options: ["Forge", "Fabric", "Paper", "Spigot", "Bukkit", "Vanilla", "-"],
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
        options: ["Новые блоки", "Новые мобы", "Новые предметы", "Генерация структур", "Изменение мира", "Магическая система", "Технологии", "Квесты", "Боссы", "GUI", "Рецепты", "Оптимизация", "Клиентские фишки", "Конфиг", "Технические функции", "API интеграции"],
        default: "Оптимизация",
      },
      complexity: {
        type: "select",
        label: "Сложность",
        options: ["Легкая", "Нормальная", "Сложная", "Невозможная"],
        default: "Легкая",
      },
      additionally: {
        type: "multiselect",
        label: "Дополнительно",
        options: ["Полный код", "Структура проекта", "Объяснение ключевых понятий"],
        default: "Полный код",
      },
    },
  },

  images: {
    name: "Генерация изображений",
    template:
      "Сгенерируй {style} изображение формата {aspect_ratio} качества {quality} по описанию: '{idea}'. Укажи основной объект, композицию, свет, цветовую палитру, настроение, детали окружения и визуальные акценты. Формулируй как готовый промпт для генератора изображений.",
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
        options: ["Высокое (4K)", "Среднее (HD)", "Низкое (144p)"],
        default: "Высокое (4K)",
      },
    },
  },

    stickers: {
      name: "Стикеры и аватары",
      template:
        "Создай {style} стикерпак для {platform} по описанию: '{idea}'. Нужные эмоции и действия: {emotions}. Сделай набор разнообразным: разные эмоции, позы, жесты, реакции и ситуации. Обязательно укажи требования к прозрачному фону, читаемости и единообразию персонажа.",
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
        "Создай {style} 3D модель {type} на тему '{idea}'. ПО: {software}. Полигональность: {polygons}. Опиши результат как техническое ТЗ: форма и силуэт, топология, материалы, текстуры, UV-развёртка, освещение, рендеринг, а также возможные ограничения и шаги моделинга.",
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
    template: (params, idea) => {
      const rawName = normalizeValue(params.name).toLowerCase();
      const shouldInventName =
        !rawName ||
        ["придумать", "придумай", "придумай сам", "сгенерируй", "auto"].includes(rawName);

      const personality = formatPromptValue(params.personality, "не указаны");
      const appearance = formatPromptValue(params.appearance, "не указана");
      const tone = formatPromptValue(params.tone2, "Дружеский");

      const nameBlock = shouldInventName
        ? "Имя персонажа: придумай самостоятельно 3-5 подходящих вариантов и выбери лучший."
        : `Имя персонажа: "${params.name}".`;

      return [
        "Создай подробного персонажа для Character AI.",
        "",
        `Идея: ${idea}.`,
        nameBlock,
        `Личность: ${personality}.`,
        `Внешность: ${appearance}.`,
        `Тон общения: ${tone}.`,
        "",
        "Сделай результат в таком формате:",
        "1. Краткое описание персонажа",
        "2. Имя и почему оно подходит",
        "3. Манера речи и поведение",
        "4. Приветственное сообщение",
        "5. 5 примеров реплик",
        "6. Ограничения и особенности образа",
        "",
        "Требования:",
        "- Персонаж должен быть последовательным и легко отыгрываться в диалоге.",
        "- Не делай описание слишком общим.",
        "- Если имя нужно придумать, предложи только уместные варианты.",
        "- Учитывай, что это промпт для Character AI, а не для обычного чата."
      ].join("\n");
    },
    params: {
      name: {
        type: "text",
        label: "Имя персонажа",
        placeholder: "Введите имя или напишите 'придумать'",
        default: "придумать",
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
        "Создай текст песни для Suno AI по описанию: '{idea}'. Жанр: {genre}. Стиль: {style}. Структура: {structure}. Темп: {tempo}. Инструменты: {instruments}. Дай готовый промпт для песни с чёткой атмосферой, темой, структурой куплетов и припева, а также пометками в формате [Verse], [Chorus], [Bridge] и т.д.",
      params: {
      genre: {
        type: "select",
        label: "Музыкальный жанр",
        options: ["Поп", "Рок", "Хип-хоп", "Электроника", "Джаз", "Классика", "Фолк", "R&B", "Кантри", "Метал"],
        default: "Поп",
      },
      style: {
        type: "select",
        label: "Стиль исполнения",
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
          options: ["Куплет-Припев", "Куплет-Припев-Мост", "Свободная форма", "Поэтическая", "Интро-Куплет-Припев-Куплет-Мост-Аутро"],
          default: "Куплет-Припев",
        },
      },
    },

    setup: {
      name: "Приложения",
      template: (params, idea) => {
        const applicationLabel = formatSetupApplicationLabel(params.type);
        const language = formatPromptValue(params.lang, "выбранном языке");
        const style = formatPromptValue(params.style, "подходящем стиле");
        const color = formatPromptValue(params.color, "базовой палитре");
        const os = formatPromptValue(params.oc, "целевой ОС");
        const features = formatPromptValue(params.hang, "основной функционал");
        const extras = formatPromptValue(params.additionally, "дополнительные требования");
        const installer = formatPromptValue(params.setupper, "подходящим установщиком");
        const complexity = formatPromptValue(params.complexity, "небольшой");

        return [
          `Создай ${applicationLabel} на ${language} по идее: "${idea}".`,
          `Визуальный стиль: ${style}. Основная палитра: ${color}. Целевая ОС: ${os}.`,
          `Функционал: ${features}.`,
          `Дополнительно включи: ${extras}.`,
          `Обязательно опиши архитектуру, основные экраны или модули, сборку, установку через ${installer}, ограничения, риски и рекомендации по реализации.`,
          `Сложность реализации: ${complexity}.`,
          "Иконку не добавляй, если это явно не требуется.",
        ].join(" ");
      },
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
        ],
          default: "Утилита",
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
          ],
          default: "JavaScript",
        },
      style: {
        type: "select",
        label: "Стиль",
        options: ["Минимализм", "Матовое стекло", "Брутализм", "Ретро", "Киберпанк", "Аниме-фэнтези", "Жидкое стекло", "Стекломорфизм"],
        default: "Матовое стекло",
      },
      color: {
        type: "select",
        label: "Основная палитра",
        options: ["Тайские подсказки (#5c71e5)", "Рубиновый (#db0f00)", "Апельсиновый (#f58631)", "Глубокие прятки (#276fdb)", "Лимонный (#f5ee22)", "Обнаружение (#26d13c)", "Угольный (#000000)", "Ванильный (#fffff7)", "Подход звезды (#e431f5)"],
        default: "Тайские подсказки (#5c71e5)",
      },
        hang: {
          type: "multiselect",
          label: "Особенности",
          options: [
            "Смена темы",
            "Собственный тип файла",
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
          ],
          default: "Inno Setup",
          customPlaceholder: "Введите свой установщик или формат",
          customFallback: "свой установщик",
        },
        oc: {
          type: "select",
          label: "Система",
          options: ["Windows", "Linux", "Android", "IOS", "MacOS"],
          default: "Windows",
        },
      complexity: {
        type: "select",
        label: "Сложность",
        options: ["Легкая", "Нормальная", "Сложная", "Невозможная"],
        default: "Легкая",
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
        options: ["Математика", "Русский", "Литература", "Информатика", "География", "Биология", "Физика", "История", "Химия", "Технология"],
        default: "Математика",
      },
      task: {
        type: "select",
        label: "Задание",
        options: ["Задача", "Чертёж", "Сочинение", "Изложение", "Код", "Сочинение-рассуждение", "Поделка"],
        default: "Задача",
      },
      class: {
        type: "select",
        label: "Класс",
        options: ["1 класс", "2 класс", "3 класс", "5 класс", "6 класс", "7 класс", "8 класс", "9 класс", "10 класс", "11 класс", "Колледж", "Университет", "1 курс", "2 курс", "3 курс"],
        default: "1 класс",
        customPlaceholder: "Например: 4 класс или 4 курс",
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
        options: ["Реклама", "Спонсорство", "Краудфандинг", "Мерч", "Платная подписка", "Бесплатный контент", "Нет"],
        default: "Реклама",
      },
      },
    },
    
    plugin: {
      name: "Плагины и расширения",
      template:
        "Разработай {type} на {lang} для {browser} с функционалом {func}, включи {additionally}, и инструкцию по сборке. Сложность реализации: {complexity}. Подробное описание идеи: '{idea}'",
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
          customPlaceholder: "Например: Notion, Figma или другое ПО",
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
      complexity: {
        type: "select",
        label: "Сложность",
        options: ["Легкая", "Нормальная", "Сложная", "Невозможная"],
        default: "Легкая",
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

const CUSTOM_OPTION_VALUE = "__custom__";

function normalizeValue(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function isCustomOptionLabel(value) {
  const normalized = normalizeValue(value).toLowerCase();
  return ["другой", "другое", "свой вариант", "указать свой", "custom"].includes(normalized);
}

function splitValueList(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeValue).filter(Boolean);
  }

  const text = normalizeValue(value);
  if (!text) return [];

  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatPromptValue(value, fallback = "") {
  if (Array.isArray(value)) {
    const parts = value.map(normalizeValue).filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : fallback;
  }

  const text = normalizeValue(value);
  return text || fallback;
}

function getPromptInstructionPrefix(tone = "professional", generationMode = "standard") {
  const tonePrefix = {
    professional: "Используй профессиональный язык.",
    friendly: "Будь дружелюбным и приветливым.",
    creative: "Прояви креативность и оригинальность.",
    technical: "Сфокусируйся на технических деталях.",
    detailed: "Дай максимально детализированный ответ.",
  }[tone] || "Используй нейтральный и ясный язык.";

  const modePrefix = {
    short: "Сделай ответ компактным и без лишней воды.",
    standard: "Соблюдай баланс между краткостью и детализацией.",
    detailed: "Раскрой тему максимально полно, структурно и с пояснениями.",
  }[generationMode] || "Соблюдай баланс между краткостью и детализацией.";

  if (generationMode === "standard") {
    return `${tonePrefix} `;
  }

  return `${tonePrefix} ${modePrefix} `;
}

function cleanupPromptText(text) {
  return normalizeValue(text)
    .replace(/\b__custom__\b/gi, "")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/([,.!?;:])([^\s])/g, "$1 $2")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatSetupApplicationLabel(typeValue) {
  const normalized = normalizeValue(typeValue);
  const lower = normalized.toLowerCase();

  const labelMap = {
    "игра": "игру",
    "мессенджер": "мессенджер",
    "утилита": "утилиту",
    "приложение для видеоконференций": "приложение для видеоконференций",
    "стриминговый сервис": "стриминговый сервис",
    "видеохостинг": "видеохостинг",
    "конструктор сайтов/приложений": "конструктор сайтов и приложений",
    "цифровая визитка": "цифровую визитку",
    "учебное приложение": "учебное приложение",
  };

  if (labelMap[lower]) {
    return labelMap[lower];
  }

  return normalized ? `приложение типа "${normalized}"` : "приложение";
}

function getParamContainerValue(container, key, param) {
  if (!container || !param) return "";

  if (param.type === "text") {
    const input = container.querySelector(`#param-${key}`);
    return normalizeValue(input?.value);
  }

  if (param.type === "select") {
    const select = container.querySelector(`#param-${key}`);
    const customInput = container.querySelector(`[data-custom-input-for="${key}"]`);
    const value = normalizeValue(select?.value);
    const isCustomChoice = value === CUSTOM_OPTION_VALUE || isCustomOptionLabel(value);

    if (!isCustomChoice) {
      return value;
    }

    const customValue = normalizeValue(customInput?.value);
    return customValue || normalizeValue(param.customFallback || "свой вариант");
  }

  if (param.type === "multiselect") {
    const box = container.querySelector(`#param-${key}`);
    if (!box) return [];

    const checked = Array.from(box.querySelectorAll('input[type="checkbox"]:checked'))
      .map((cb) => normalizeValue(cb.value))
      .filter((item) => item && item !== CUSTOM_OPTION_VALUE && !isCustomOptionLabel(item));

    const customInput = container.querySelector(`[data-custom-input-for="${key}"]`);
    const customCheckbox = box.querySelector(`[data-custom-checkbox-for="${key}"]`);

    if (customCheckbox?.checked) {
      const customValues = splitValueList(customInput?.value);
      if (customValues.length > 0) {
        checked.push(...customValues);
      } else {
        checked.push(normalizeValue(param.customFallback || "свой вариант"));
      }
    }

    return checked;
  }

  return "";
}

function shouldShowCustomInput(param, value) {
  if (!param) return false;

  if (param.type === "select") {
    const normalized = normalizeValue(value);
    return normalized === CUSTOM_OPTION_VALUE || isCustomOptionLabel(normalized);
  }

  if (param.type === "multiselect") {
    const values = Array.isArray(value) ? value : splitValueList(value);
    return values.some((item) => item === CUSTOM_OPTION_VALUE || isCustomOptionLabel(item));
  }

  return false;
}

function isCustomParamActive(container, key, param) {
  if (!container || !param) return false;

  if (param.type === "select") {
    const selectValue = normalizeValue(container.querySelector(`#param-${key}`)?.value);
    return selectValue === CUSTOM_OPTION_VALUE || isCustomOptionLabel(selectValue);
  }

  if (param.type === "multiselect") {
    return Boolean(container.querySelector(`#param-${key} [data-custom-checkbox-for="${key}"]`)?.checked);
  }

  return false;
}

function syncCustomParamState(container, type) {
  const params = promptTemplates[type]?.params || {};

  Object.entries(params).forEach(([key, param]) => {
    if (!param || !container) return;

    const customInput = container.querySelector(`[data-custom-input-for="${key}"]`);
    const customHint = container.querySelector(`[data-custom-hint-for="${key}"]`);
    if (!customInput) return;

    const typedValue = normalizeValue(customInput.value);
    const shouldShow = isCustomParamActive(container, key, param) || typedValue.length > 0 || document.activeElement === customInput;
    customInput.hidden = !shouldShow;
    customInput.disabled = !shouldShow;
    customInput.classList.toggle("is-custom-empty", shouldShow && !typedValue);
    customInput.classList.toggle("is-custom-filled", shouldShow && typedValue.length > 0);

    if (customHint) {
      customHint.hidden = !shouldShow;
      if (!shouldShow) {
        customHint.textContent = "";
        customHint.classList.remove("is-warning");
      } else if (!typedValue) {
        customHint.textContent = "Введите свой вариант";
        customHint.classList.remove("is-warning");
      } else {
        customHint.textContent = `Будет подставлено: ${typedValue}`;
        customHint.classList.remove("is-warning");
      }
    }
  });
}

function collectPromptParams(type, overrideParams = {}) {
  const tpl = promptTemplates[type];
  const params = {};
  const tplParams = tpl?.params || {};

  for (const [key, value] of Object.entries(overrideParams || {})) {
    if (normalizeValue(value) === CUSTOM_OPTION_VALUE || isCustomOptionLabel(value)) {
      continue;
    }
    params[key] = value;
  }

  for (const [key, param] of Object.entries(tplParams)) {
    if (params[key] !== undefined) continue;
    params[key] = getParamContainerValue(modal, key, param);
  }

  return params;
}

function setParamFieldValue(container, key, param, value) {
  if (!container || !param) return;

  if (param.type === "text") {
    const input = container.querySelector(`#param-${key}`);
    if (input) input.value = normalizeValue(value);
    return;
  }

  if (param.type === "select") {
    const select = container.querySelector(`#param-${key}`);
    const customInput = container.querySelector(`[data-custom-input-for="${key}"]`);
    if (!select) return;

    const normalizedValue = normalizeValue(value);
    const optionValues = Array.from(select.options).map((option) => option.value);
    const hasExactMatch = optionValues.includes(normalizedValue);
    const needsCustom = !hasExactMatch && normalizedValue !== "";

    if (hasExactMatch) {
      select.value = normalizedValue;
      if (customInput) customInput.value = "";
    } else if (needsCustom) {
      const customOption = optionValues.includes(CUSTOM_OPTION_VALUE)
        ? CUSTOM_OPTION_VALUE
        : Array.from(select.options).find((option) => isCustomOptionLabel(option.value))?.value || CUSTOM_OPTION_VALUE;
      select.value = customOption;
      if (customInput) customInput.value = normalizedValue;
    } else {
      select.value = param.default || select.options[0]?.value || "";
      if (customInput) customInput.value = "";
    }

    return;
  }

  if (param.type === "multiselect") {
    const box = container.querySelector(`#param-${key}`);
    if (!box) return;

    const values = splitValueList(value);
    const optionValues = Array.from(box.querySelectorAll('input[type="checkbox"]'))
      .map((checkbox) => normalizeValue(checkbox.value));

    box.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      const optionValue = normalizeValue(checkbox.value);
      if (optionValue === CUSTOM_OPTION_VALUE || isCustomOptionLabel(optionValue)) {
        return;
      }

      checkbox.checked = values.includes(optionValue);
    });

    const customCheckbox = box.querySelector(`[data-custom-checkbox-for="${key}"]`);
    const customInput = container.querySelector(`[data-custom-input-for="${key}"]`);
    const customValues = values.filter((item) => !optionValues.includes(item));

    if (customCheckbox) {
      customCheckbox.checked = customValues.length > 0;
    }

    if (customInput) {
      customInput.value = customValues.join(", ");
    }
  }
}

function applyPresetParams(presetParams = {}) {
  if (!modal) return;

  const type = selectedType;
  const params = promptTemplates[type]?.params || {};

  Object.entries(presetParams).forEach(([key, value]) => {
    const param = params[key];
    if (!param) return;
    setParamFieldValue(modal, key, param, value);
  });

  syncCustomParamState(modal, type);
  const validationContainer = modal.querySelector("#validationMessages");
  if (validationContainer) {
    const selectedParams = {};
    Object.entries(params).forEach(([key, param]) => {
      selectedParams[key] = getParamContainerValue(modal, key, param);
    });
    showValidationMessages(validateCombination(type, selectedParams));
  }

  updateGenerateButtonState();
  updatePromptPreview();
}

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
      triggers: ['рестор', 'каф', 'бар', 'кофе', 'пицц'],
      autoSet: {
        type: 'Лендинг',
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
  let container = document.getElementById('contextSuggestions');
  if (!container) {
    const newContainer = document.createElement('div');
    newContainer.id = 'contextSuggestions';
    newContainer.className = 'context-suggestions';
    // Вставляем перед сгенерированным промптом
    const generatedPrompt = modal.querySelector('.generated-prompt');
    if (generatedPrompt) {
      generatedPrompt.parentNode.insertBefore(newContainer, generatedPrompt);
    }
    container = newContainer;
  }
  
  if (!container) return;

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
      },
      {
        when: { type: ["Блог"] },
        cannotHave: ["Корзина покупок"],
        message: "Для блога корзина покупок не требуется"
      },
      {
        when: { type: ["Игра"] },
        cannotHave: ["SEO оптимизация"],
        message: "Для игр SEO оптимизация не актуальна"
      },
      {
        when: { additionally: ["Код в одном файле", "Структура проекта"] },
        cannotHave: [], // специальная проверка на конфликт
        message: "Нельзя выбрать одновременно 'Код в одном файле' и 'Структура проекта'"
      }
    ],
    
    recommendations: [
      {
        when: { type: ["Интернет-магазин", "Панель управления"] },
        recommendedStyle: ["Минимализм", "Матовое стекло"],
        message: "Для {type} лучше подходит {style}"
      },
      {
        when: { type: ["Портфолио", "Блог"] },
        recommendedStyle: ["Минимализм", "Матовое стекло", "Аниме-фэнтези"],
        message: "Для творческих проектов можно использовать креативные стили, например {style}"
      },
      {
        when: { type: ["Лендинг"] },
        recommendedFeatures: ["SEO оптимизация", "Адаптивный дизайн"],
        message: "Для лендинга обязательно нужны: {features}"
      },
      {
        when: { type: ["Интернет-магазин"] },
        recommendedFeatures: ["Корзина покупок", "Поиск"],
        message: "Для интернет-магазина рекомендуем: {features}"
      },
      {
        when: { type: ["Портфолио"] },
        recommendedFeatures: ["Галерея изображений"],
        message: "Для портфолио рекомендуем добавить галерею"
      },
      {
        when: { type: ["Социальная сеть"] },
        recommendedFeatures: ["Комментарии", "Аккаунты"],
        message: "Для соцсети необходимы: {features}"
      }
    ],
    
    colorWarnings: [
      {
        when: { style: ["Киберпанк"] },
        recommendedColors: ["Тайские подсказки (#5c71e5)", "Подход звезды (#e431f5)"],
        message: "Для киберпанк стиля лучше подходят неоновые цвета"
      },
      {
        when: { type: ["Интернет-магазин"] },
        recommendedColors: ["Рубиновый (#db0f00)", "Обнаружение (#26d13c)"],
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
      },
      {
        when: { functionality: ["Админ-панель", "Модерация"] },
        recommendedFeatures: ["Команды"],
        message: "Для администрирования добавьте команды"
      },
      {
        when: { functionality: ["Платежи"] },
        recommendedComplexity: ["Нормальная", "Сложная"],
        message: "Платежи требуют как минимум нормальной сложности"
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
      },
      {
        when: { style: ["реалистичное"] },
        recommendedQuality: ["Высокое (4K)"],
        message: "Реалистичные изображения лучше выглядят в 4K"
      },
      {
        when: { quality: ["Низкое (144p)"] },
        message: "Низкое качество не подходит для детализированных стилей"
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
      },
      {
        when: { platform: ["WhatsApp"] },
        cannotHave: ["Удивление"],
        message: "WhatsApp ограниченно поддерживает сложные эмоции"
      }
    ]
  },
  
  minecraft: {
    incompatible: [
      {
        when: { version: ["1.8.9", "1.12.2"] },
        cannotHave: ["Изменение мира", "Конфиг"],
        message: "Для старых версий Minecraft некоторые функции недоступны"
      },
      {
        when: { type: ["Ресурспак"] },
        cannotHave: ["Новые блоки", "Новые мобы", "Боссы"],
        message: "Ресурспак не может добавлять новую механику"
      },
      {
        when: { type: ["Датапак"] },
        cannotHave: ["GUI"],
        message: "Датапаки не поддерживают GUI"
      },
      {
        when: { type: ["Плагин"], loader: ["Forge", "Fabric"] },
        message: "Плагины обычно используют Paper/Spigot, не Forge/Fabric"
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
        recommendedVersion: ["1.20.1", "1.21", "1.21.4", "1.21.8"],
        message: "Для сложных мобов нужны современные версии"
      },
      {
        when: { features: ["Новые блоки"] },
        recommendedFeatures: ["Рецепты"],
        message: "Для новых блоков добавьте рецепты крафта"
      },
      {
        when: { features: ["Боссы"] },
        recommendedFeatures: ["Новые мобы"],
        message: "Боссы — это разновидность мобов"
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
      },
      {
        when: { style: ["low-poly"], polygons: ["High (50-200k)", "Ultra (>200k)"] },
        message: "Low-poly стиль несовместим с высокой полигональностью"
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
        recommendedTone2: ["Формальный", "Профессиональный"],
        message: "Для неорганических существ подходит формальный тон"
      },
      {
        when: { personality: ["Загадочный", "Мудрый"] },
        recommendedTone2: ["Поэтический", "Драматический"],
        message: "Для загадочного или мудрого персонажа лучше подходит атмосферный тон общения"
      },
      {
        when: { personality: ["Дружелюбный", "Юмористический"] },
        recommendedTone2: ["Неформальный", "Дружеский"],
        message: "Для дружелюбных персонажей выбирайте неформальный тон"
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
      },
      {
        when: { genre: ["Классика"], instruments: ["Синтезатор", "Барабаны"] },
        message: "Классика плохо сочетается с электронными инструментами"
      },
      {
        when: { style: ["Энергичный"] },
        recommendedTempo: ["Быстрый", "Очень быстрый"],
        message: "Энергичной песне нужен быстрый темп"
      }
    ]
  },
  
  recipes: {
    incompatible: [
      {
        when: { dietary: ["Веганское"] },
        cannotHave: ["Высокобелковое"],
        message: "Для веганских блюд сложно достичь высокого содержания белка"
      },
      {
        when: { dietary: ["Без глютена"], complexity: ["Сложная", "Невозможная"] },
        message: "Безглютеновые блюда лучше делать простыми или нормальной сложности"
      }
    ],
    
    recommendations: [
      {
        when: { cuisine: ["итальянской"] },
        recommendedComplexity: ["Легкая", "Нормальная"],
        message: "Итальянская кухня обычно проста в приготовлении"
      },
      {
        when: { dietary: ["Низкоуглеводное"] },
        recommendedCuisine: ["азиатской", "средиземноморской"],
        message: "Для низкоуглеводной диеты подходят эти кухни"
      },
      {
        when: { cuisine: ["французской"] },
        recommendedComplexity: ["Сложная", "Невозможная"],
        message: "Французская кухня часто требует высокой сложности"
      },
      {
        when: { cuisine: ["русской"] },
        recommendedComplexity: ["Нормальная"],
        message: "Русская кухня обычно средней сложности"
      },
      {
        when: { dietary: ["Веганское"], complexity: ["Невозможная"] },
        message: "Веганское блюдо не может быть невозможной сложности"
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
      },
      {
        when: { oc: ["IOS"], setupper: ["Google Play"] },
        message: "Google Play не для iOS"
      },
      {
        when: { oc: ["Android"], setupper: ["App Store"] },
        message: "App Store не для Android"
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
      },
      {
        when: { oc: ["Windows"] },
        recommendedSetupper: ["Inno Setup", "NSIS", "MSIX"],
        message: "Для Windows рекомендуем: {setupper}"
      }
    ],

    advice: [
      {
        when: { type: ["Игра"], lang: ["JavaScript"] },
        message: "Для игры на JavaScript лучше явно указать веб- или браузерный формат, иначе запрос может звучать слишком обобщённо"
      },
      {
        when: { type: ["Утилита"], setupper: ["Google Play", "App Store"] },
        message: "Для утилиты мобильный установщик обычно лишний, лучше выбрать десктопный формат"
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
      },
      {
        when: { browser: ["Safari"] },
        recommendedFunc: [],
        message: "Safari имеет строгие ограничения на разрешения"
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
      },
      {
        when: { audience: ["Дети"], monetization: ["Реклама"] },
        message: "Для детского контента реклама ограничена"
      },
      {
        when: { content_type: ["Новости"] },
        recommendedFrequency: ["Ежедневно"],
        message: "Новости требуют ежедневного выпуска"
      },
      {
        when: { content_type: ["Кулинария"] },
        recommendedThumbnail: ["Яркий и контрастный"],
        message: "Для кулинарии важно яркое превью"
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
      },
      {
        when: { class: ["1 класс", "2 класс"], task: ["Код", "Чертёж"] },
        message: "Для младших классов код и чертежи слишком сложны"
      },
      {
        when: { subj: ["Математика"] },
        recommendedTask: ["Задача", "Чертёж"],
        message: "Для математики рекомендуем задачи и чертежи"
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
      },
      {
        when: { age_group: ["0-1 год"], type: ["конструктора"] },
        message: "Конструкторы не подходят для младенцев"
      },
      {
        when: { age_group: ["12+ лет", "взрослые"], type: ["развивающей"] },
        message: "Развивающие игрушки в основном для детей"
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
        if (!paramValue || !matchesExpectedValue(paramValue, rule.when[paramKey])) {
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
        if (!paramValue || !matchesExpectedValue(paramValue, rule.when[paramKey])) {
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
            
            const actualValues = Array.isArray(actualValue) ? actualValue : [actualValue];
            const hasInvalidValue = actualValues.some((value) => value && !rule[ruleKey].includes(value));

            // Если нашли значение и оно не входит в рекомендованные
            if (actualValue && hasInvalidValue) {
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

  if (rules.advice) {
    rules.advice.forEach((rule) => {
      let conditionMet = true;
      Object.keys(rule.when).forEach((paramKey) => {
        const paramValue = selectedParams[paramKey];
        if (!paramValue || !matchesExpectedValue(paramValue, rule.when[paramKey])) {
          conditionMet = false;
        }
      });

      if (conditionMet) {
        warnings.push(`💡 ${rule.message}`);
      }
    });
  }
  
  // Проверка цветовых рекомендаций (только для websites)
  if (rules.colorWarnings && type === 'websites') {
    rules.colorWarnings.forEach(rule => {
      let conditionMet = true;
      Object.keys(rule.when).forEach(paramKey => {
        if (!selectedParams[paramKey] || !matchesExpectedValue(selectedParams[paramKey], rule.when[paramKey])) {
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

function matchesExpectedValue(paramValue, expectedValues) {
  const expectedList = Array.isArray(expectedValues) ? expectedValues : [expectedValues];
  if (Array.isArray(paramValue)) {
    return paramValue.some((item) => expectedList.includes(item));
  }

  return expectedList.includes(paramValue);
}

// ===== КРОСС-РЕКОМЕНДАЦИИ =====
function showCrossRecommendations() {
  let recommendationsContainer = document.getElementById('crossRecommendations');
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
    recommendationsContainer = container;
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
  modal.querySelector("#crossRecommendations")?.remove();
  modal.querySelector("#contextSuggestions")?.remove();
  
  // Применяем пресет параметры
  if (Object.keys(presetParams).length > 0) {
    setTimeout(() => applyPresetParams(presetParams), 100);
  }
  
  // Показываем новые рекомендации
  setTimeout(showCrossRecommendations, 300);
  setTimeout(() => setGeneratorTab("generate"), 0);
  setTimeout(updateGenerateButtonState, 120);
}

  // ===== МОДАЛКА =====
  let selectedType = "recipes";
  let activeGeneratorTab = "generate";

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

          <button type="submit" class="btn btn-primary" id="generate-prompt-btn">Сгенерировать промпт</button>
        </form>

<section class="generator-examples-panel" aria-label="Примеры промптов">
  <div class="generator-examples-head">
    <div>
      <h4>Примеры промптов</h4>
      <p class="generator-examples-subtitle">
        Выбирай категорию выше, а потом бери готовый пример за основу, копируй его или сразу применяй в генераторе.
      </p>
    </div>
    <div class="generator-examples-tip">
      <i class="fas fa-wand-magic-sparkles"></i>
      <span>Карточки обновляются под выбранную категорию</span>
    </div>
  </div>
  <div id="examplesGrid" class="examples-grid examples-grid--modal">
    <div class="examples-placeholder">
      Выбери категорию, чтобы увидеть примеры прямо здесь.
    </div>
  </div>
</section>

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

  const modalBody = modal.querySelector(".modal-body");
  const promptFormPanel = modal.querySelector("#prompt-form");
  const generatedPromptPanel = modal.querySelector(".generated-prompt");
  const examplesPanel = modal.querySelector(".generator-examples-panel");

  if (modalBody && promptFormPanel && generatedPromptPanel && examplesPanel) {
    const tabs = document.createElement("div");
    tabs.className = "modal-tabs";
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Разделы генератора");
    tabs.innerHTML = `
      <button type="button" class="modal-tab is-active" data-generator-tab="generate" aria-selected="true">Генерация</button>
      <button type="button" class="modal-tab" data-generator-tab="examples" aria-selected="false">Примеры</button>
    `;

    const generatePanel = document.createElement("section");
    generatePanel.className = "generator-tab-panel is-active";
    generatePanel.setAttribute("data-generator-tab-panel", "generate");

    const examplesPanelWrap = document.createElement("section");
    examplesPanelWrap.className = "generator-tab-panel";
    examplesPanelWrap.setAttribute("data-generator-tab-panel", "examples");

    generatePanel.append(promptFormPanel, generatedPromptPanel);
    examplesPanelWrap.append(examplesPanel);

    const toneGroup = promptFormPanel.querySelector('[for="tone-select"]')?.closest(".form-group");
    if (toneGroup) {
      const depthGroup = document.createElement("div");
      depthGroup.className = "form-group";
      depthGroup.innerHTML = `
        <label for="generation-mode-select">Глубина генерации</label>
        <select id="generation-mode-select">
          <option value="short">Короткий</option>
          <option value="standard" selected>Стандартный</option>
          <option value="detailed">Максимально подробный</option>
        </select>
      `;
      toneGroup.insertAdjacentElement("afterend", depthGroup);
    }

    modalBody.innerHTML = "";
    modalBody.append(tabs, generatePanel, examplesPanelWrap);
  }

  function setGeneratorTab(tabName) {
    activeGeneratorTab = tabName === "examples" ? "examples" : "generate";

    modal.querySelectorAll("[data-generator-tab]").forEach((button) => {
      const isActive = button.getAttribute("data-generator-tab") === activeGeneratorTab;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    modal.querySelectorAll("[data-generator-tab-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.getAttribute("data-generator-tab-panel") === activeGeneratorTab);
    });

    if (activeGeneratorTab === "examples") {
      renderExamples(selectedType);
    }
  }

  // ===== ЗАЩИТА МОДАЛКИ ОТ ЗАКРЫТИЯ =====
  let isPromptGenerated = false;
  let isFormDirty = false;
  
  function showGeneratorToast(message, variant = "info", timeout = 3000) {
    const oldToast = document.querySelector(".context-toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = `context-toast toast-${variant}`;
    toast.style.setProperty("--toast-duration", `${timeout}ms`);
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon-wrap">
          <i class="fas fa-${variant === "error" ? "triangle-exclamation" : variant === "success" ? "circle-check" : variant === "warning" ? "circle-info" : "sparkles"}"></i>
        </span>
        <span class="toast-text">${message}</span>
        <span class="toast-progress"></span>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, timeout);
  }

  function showGeneratorConfirmationModal({
    title,
    message,
    confirmText,
    cancelText,
    iconClass = "fa-triangle-exclamation",
    confirmVariant = "primary",
  }) {
    return new Promise((resolve) => {
      let dialog = document.getElementById("generator-confirm-dialog");
      if (!dialog) {
        dialog = document.createElement("div");
        dialog.id = "generator-confirm-dialog";
        dialog.className = "generator-confirm-modal";
        dialog.innerHTML = `
          <div class="generator-confirm-card" role="dialog" aria-modal="true" aria-labelledby="generator-confirm-title">
            <div class="generator-confirm-icon">
              <i class="fas ${iconClass}"></i>
            </div>
            <h3 id="generator-confirm-title"></h3>
            <p></p>
            <div class="generator-confirm-actions">
              <button type="button" class="btn btn-secondary" data-generator-cancel></button>
              <button type="button" class="btn btn-primary" data-generator-confirm></button>
            </div>
          </div>
        `;
        document.body.appendChild(dialog);
      }

      const iconWrap = dialog.querySelector(".generator-confirm-icon");
      if (iconWrap) {
        iconWrap.innerHTML = `<i class="fas ${iconClass}"></i>`;
      }
      dialog.querySelector("#generator-confirm-title").textContent = title;
      dialog.querySelector(".generator-confirm-card p").textContent = message;
      dialog.querySelector("[data-generator-cancel]").textContent = cancelText;
      const confirmButton = dialog.querySelector("[data-generator-confirm]");
      confirmButton.textContent = confirmText;
      confirmButton.classList.toggle("btn-primary", confirmVariant === "primary");
      confirmButton.classList.toggle("btn-secondary", confirmVariant === "secondary");

      const cleanup = (result) => {
        dialog.classList.remove("active");
        const confirmBtn = dialog.querySelector("[data-generator-confirm]");
        const cancelBtn = dialog.querySelector("[data-generator-cancel]");
        confirmBtn?.removeEventListener("click", onConfirm);
        cancelBtn?.removeEventListener("click", onCancel);
        dialog.removeEventListener("click", onBackdropClick);
        document.removeEventListener("keydown", onEscape);
        resolve(result);
      };

      const onConfirm = () => cleanup(true);
      const onCancel = () => cleanup(false);
      const onBackdropClick = (event) => {
        if (event.target === dialog) cleanup(false);
      };
      const onEscape = (event) => {
        if (event.key === "Escape") cleanup(false);
      };

      dialog.querySelector("[data-generator-confirm]")?.addEventListener("click", onConfirm);
      dialog.querySelector("[data-generator-cancel]")?.addEventListener("click", onCancel);
      dialog.addEventListener("click", onBackdropClick);
      document.addEventListener("keydown", onEscape);

      dialog.classList.add("active");
    });
  }

  async function closeModalWithCheck() {
    if (isPromptGenerated || isFormDirty) {
      const shouldClose = await showGeneratorConfirmationModal({
        title: "Закрыть генератор?",
        message: "У вас есть несохранённый промпт. Если закрыть окно сейчас, изменения могут пропасть.",
        confirmText: "Закрыть",
        cancelText: "Остаться",
        iconClass: "fa-triangle-exclamation",
      });
      if (!shouldClose) return;
    }

    closeModal();
    isPromptGenerated = false;
    isFormDirty = false;
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
      selectedParams[key] = getParamContainerValue(container, key, param);
    }
    
    const validation = validateCombination(type, selectedParams);

    Object.entries(params).forEach(([key, param]) => {
      if (!param) return;
      if (param.type !== "select" && param.type !== "multiselect") return;

      const customInput = container.querySelector(`[data-custom-input-for="${key}"]`);
      if (!customInput) return;

      const rawValue = normalizeValue(customInput.value);
      const selectValue = normalizeValue(container.querySelector(`#param-${key}`)?.value);
      const customCheckboxChecked = Boolean(container.querySelector(`[data-custom-checkbox-for="${key}"]`)?.checked);
      const isCustomFieldActive =
        (param.type === "select" && shouldShowCustomInput(param, selectValue)) ||
        (param.type === "multiselect" && customCheckboxChecked);

      const hint = container.querySelector(`[data-custom-hint-for="${key}"]`);
      const shouldWarn = isCustomFieldActive && !rawValue;

      if (hint) {
        hint.classList.toggle("is-warning", shouldWarn);
        if (shouldWarn) {
          hint.hidden = false;
          hint.textContent = `Введите свой вариант для параметра "${param.label}"`;
        }
      }

      customInput.classList.toggle("is-custom-missing", shouldWarn);

      if (shouldWarn) {
        validation.warnings.push(`Для параметра "${param.label}" выбрано "Другое", но свой вариант не введён`);
      }
    });

    showValidationMessages(validation);
    updateGenerateButtonState();
    updatePromptPreview();
  };

  for (const [key, param] of Object.entries(params)) {
    html += `<div class="param-group">`;
    html += `<label>${param.label}</label>`;

    if (param.type === "select") {
      html += `<select id="param-${key}" class="tech-param" data-param="${key}">`;
      param.options.forEach((option) => {
        const selected = option === param.default ? "selected" : "";
        html += `<option value="${option}" ${selected}>${option}</option>`;
      });
      if (!param.options.some((option) => isCustomOptionLabel(option))) {
        const customSelected = !param.options.includes(param.default || "");
        html += `<option value="${CUSTOM_OPTION_VALUE}" ${customSelected ? "selected" : ""}>Другое</option>`;
      }
      html += `</select>`;
      const customValue = normalizeValue(param.default) && !param.options.includes(param.default || "") ? param.default : "";
      html += `
        <input
          type="text"
          class="custom-param-input"
          data-custom-input-for="${key}"
          placeholder="${param.customPlaceholder || "Введите свой вариант"}"
          value="${customValue}"
          ${shouldShowCustomInput(param, param.default) ? "" : 'hidden'}
        >
        <div class="custom-param-hint" data-custom-hint-for="${key}" hidden aria-live="polite"></div>
      `;
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
      if (!param.options.some((option) => isCustomOptionLabel(option))) {
        html += `
          <label class="checkbox-label custom-checkbox-label">
            <input type="checkbox" value="${CUSTOM_OPTION_VALUE}" data-custom-checkbox-for="${key}">
            Другое
          </label>
        `;
      }
      html += `
        <input
          type="text"
          class="custom-param-input custom-multi-input"
          data-custom-input-for="${key}"
          placeholder="${param.customPlaceholder || "Введите свой вариант через запятую"}"
          hidden
        >
        <div class="custom-param-hint" data-custom-hint-for="${key}" hidden aria-live="polite"></div>
      `;
      html += `</div>`;
    } else if (param.type === "text") {
      html += `
        <input
          type="text"
          id="param-${key}"
          class="tech-param"
          data-param="${key}"
          placeholder="${param.placeholder || "Введите значение"}"
          value="${normalizeValue(param.default)}"
        >
      `;
    }

    html += `</div>`;
  }

  container.innerHTML = html || "<p>Для этого типа промпта не требуется дополнительных параметров.</p>";
  
  // Добавляем обработчики событий для валидации
  container.querySelectorAll('select.tech-param, .multi-select input[type="checkbox"], .custom-param-input, .tech-param').forEach(element => {
    element.addEventListener('change', updateValidation);
    element.addEventListener('input', updateValidation);
  });

  container.querySelectorAll('select.tech-param').forEach((select) => {
    select.addEventListener('change', () => syncCustomParamState(container, type));
  });

  container.querySelectorAll('.multi-select input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => syncCustomParamState(container, type));
  });

  container.querySelectorAll('.custom-param-input').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.getAttribute('data-custom-input-for');
      const param = params[key];
      if (!key || !param) return;

      if (param.type === "multiselect") {
        const box = container.querySelector(`#param-${key}`);
        const customCheckbox = box?.querySelector(`[data-custom-checkbox-for="${key}"]`);
        if (customCheckbox) {
          customCheckbox.checked = normalizeValue(input.value).length > 0;
        }
      }

      syncCustomParamState(container, type);
      updateGenerateButtonState();
    });
  });
  
  // Инициализируем валидацию с текущими значениями
  syncCustomParamState(container, type);
  setTimeout(updateValidation, 100);
  setTimeout(updateGenerateButtonState, 120);
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
        modal.querySelector("#crossRecommendations")?.remove();
        modal.querySelector("#contextSuggestions")?.remove();
        updatePromptPreview();
        setGeneratorTab("generate");
        setTimeout(updateGenerateButtonState, 50);

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

  modal.querySelectorAll("[data-generator-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTab = button.getAttribute("data-generator-tab") || "generate";
      setGeneratorTab(nextTab);
    });
  });

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
  const generationModeSelect = modal.querySelector("#generation-mode-select");
  const finalPrompt = modal.querySelector("#final-prompt");
  const promptPreview = modal.querySelector("#prompt-preview");
  const copyButton = modal.querySelector("#copy-prompt");
  const generateButton = modal.querySelector("#generate-prompt-btn");

  function getGeneratorRequirementsState() {
    const params = promptTemplates[selectedType]?.params || {};
    const selectedParams = {};

    for (const [key, param] of Object.entries(params)) {
      selectedParams[key] = getParamContainerValue(modal, key, param);
    }

    const validation = validateCombination(selectedType, selectedParams);
    const missingCustomFields = Array.from(modal.querySelectorAll(".custom-param-input")).some((input) => {
      const key = input.getAttribute("data-custom-input-for");
      const param = params[key];
      if (!key || !param) return false;

      const selectValue = normalizeValue(modal.querySelector(`#param-${key}`)?.value);
      const customCheckboxChecked = Boolean(modal.querySelector(`[data-custom-checkbox-for="${key}"]`)?.checked);
      const isCustomActive =
        (param.type === "select" && shouldShowCustomInput(param, selectValue)) ||
        (param.type === "multiselect" && customCheckboxChecked);

      return isCustomActive && !normalizeValue(input.value);
    });

    return {
      canGenerate: normalizeValue(customInput.value).length > 0 && validation.valid && !missingCustomFields,
      validation,
      missingCustomFields,
    };
  }

  function updateGenerateButtonState() {
    if (!generateButton) return;

    const { canGenerate } = getGeneratorRequirementsState();
    generateButton.disabled = !canGenerate;
    generateButton.classList.toggle("is-disabled", !canGenerate);
    generateButton.setAttribute("aria-disabled", String(!canGenerate));
  }

  function updatePromptPreview() {
    if (!promptPreview) return;

    const idea = normalizeValue(customInput.value);
    if (!idea) {
      promptPreview.textContent = "Введите идею или описание, чтобы увидеть предпросмотр.";
      promptPreview.classList.add("is-placeholder");
      return;
    }

    const previewText = buildPromptText(
      selectedType,
      idea,
      toneSelect.value,
      {},
      normalizeValue(generationModeSelect?.value) || "standard"
    );

    promptPreview.textContent = previewText;
    promptPreview.classList.remove("is-placeholder");
  }

  // Отслеживаем изменения в текстовом поле
customInput.addEventListener('input', () => {
  if (customInput.value.trim()) {
    isFormDirty = true;
  }
  
  // Анализируем текст для кросс-рекомендаций
  if (customInput.value.trim().length > 10) {
    showCrossRecommendations();
  }

  updateGenerateButtonState();
  updatePromptPreview();
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

  function showContextToast(message) {
    showGeneratorToast(message, "info");
  }
  
  // Отслеживаем изменения в селектах
  toneSelect.addEventListener('change', () => {
    isFormDirty = true;
    updatePromptPreview();
  });

  generationModeSelect?.addEventListener('change', () => {
    isFormDirty = true;
    updatePromptPreview();
  });

function buildPromptText(type, idea, tone = "professional", overrideParams = {}, generationMode = "standard") {
  if (!promptTemplates[type]) return "";

  const tpl = promptTemplates[type];
  const params = collectPromptParams(type, overrideParams);
  const promptPrefix = getPromptInstructionPrefix(tone, generationMode);

  // Если шаблон - функция, вызываем её с параметрами
  if (typeof tpl.template === 'function') {
    return cleanupPromptText(`${promptPrefix}${tpl.template(params, idea, tone)}\n\nПромпт создан с помощью TAIPrompts`);
  }

  // Иначе используем старый строковый шаблон
  let text = tpl.template;
  text = text.replace("{idea}", normalizeValue(idea));

  // Заменяем все параметры в шаблоне
  for (const [key, value] of Object.entries(params)) {
    const paramValue = Array.isArray(value) ? value.join(", ") : normalizeValue(value);
    text = text.replace(new RegExp(`\\{${key}\\}`, "g"), paramValue);
  }

  // Удаляем оставшиеся неиспользованные параметры {param}
  text = cleanupPromptText(text.replace(/\{[^}]+\}/g, ""));

  text = cleanupPromptText(`${promptPrefix}${text}\n\nПромпт создан с помощью TAIPrompts`);

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
    },
    {
      title: "Полезный завтрак",
      idea: "Белковый завтрак без глютена на каждый день",
      cuisine: "средиземноморской",
      dietary: "Без глютена",
      complexity: "Легкая",
      tone: "detailed"
    }
  ],

  websites: [
    {
      title: "Портфолио дизайнера",
      idea: "Портфолио UI/UX дизайнера в стиле матового стекла",
      type: "Портфолио",
      stack: "React",
      style: "Матовое стекло",
      color: "Тайские подсказки (#5c71e5)",
      features: "Адаптивный дизайн, PWA, SEO оптимизация",
      tone: "creative"
    },
    {
      title: "Интернет-магазин",
      idea: "Современный интернет-магазин одежды с каталогом и корзиной",
      type: "Интернет-магазин",
      stack: "HTML/CSS/JS",
      style: "Минимализм",
      color: "Обнаружение (#26d13c)",
      features: "Адаптивный дизайн, Корзина покупок, Поиск, SEO оптимизация",
      tone: "professional"
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
      idea: "Дружелюбная, игривая аниме-девушка, которая умеет подшучивать и поддерживать разговор",
      name: "придумать",
      personality: "Дружелюбный, Юмористический, Наивный",
      appearance: "Аниме персонаж, Человек",
      tone2: "Дружеский",
      tone: "friendly"
    },
    {
      title: "Мудрый наставник",
      idea: "Спокойный и мудрый персонаж-наставник с мягкой манерой общения и глубокими ответами",
      name: "Старый Мастер",
      personality: "Мудрый, Серьезный, Загадочный",
      appearance: "Человек",
      tone2: "Формальный",
      tone: "detailed"
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
      title: "Планировщик задач",
      idea: "Приложение для учёта личных задач с календарём, напоминаниями и приоритетами",
      type: "Утилита",
      lang: "Python",
      style: "Матовое стекло",
      color: "Тайские подсказки (#5c71e5)",
      hang: "Смена темы, Горячие клавиши, Сохранение данных в собственный формат файла",
      additionally: "Структура проекта, Объяснение ключевых понятий",
      setupper: "Inno Setup",
      oc: "Windows",
      tone: "technical"
    },
    {
      title: "Чат-приложение",
      idea: "Кроссплатформенный мессенджер с чатами, уведомлениями и синхронизацией",
      type: "Мессенджер",
      lang: "JavaScript",
      style: "Минимализм",
      color: "Обнаружение (#26d13c)",
      hang: "Чаты, Уведомления, Синхронизация сообщений",
      additionally: "Полный код, Архитектура проекта",
      setupper: "MSIX",
      oc: "Windows",
      tone: "professional"
    },
    {
      title: "Видеоконференции",
      idea: "Приложение для онлайн-встреч с комнатами, демонстрацией экрана и историей звонков",
      type: "Приложение для видеоконференций",
      lang: "TypeScript",
      style: "Стекломорфизм",
      color: "Подход звезды (#e431f5)",
      hang: "Комнаты, Демонстрация экрана, История звонков",
      additionally: "Структура проекта, Объяснение ключевых понятий",
      setupper: "PKG",
      oc: "MacOS",
      tone: "detailed"
    }
  ]
};

function renderExamples(type) {
  const grid = document.getElementById("examplesGrid");
  if (!grid) return;

  const panel = grid.closest(".generator-examples-panel");
  if (panel) {
    const title = panel.querySelector(".generator-examples-head h4");
    const subtitle = panel.querySelector(".generator-examples-subtitle");
    const templateName = promptTemplates[type]?.name || type;
    if (title) title.textContent = `Примеры для: ${templateName}`;
    if (subtitle) {
      subtitle.textContent = "Карточки собраны именно под этот шаблон. Их можно скопировать или сразу применить.";
    }
  }

  const examples = promptExamples[type] || [];
  const visibleExamples = examples.slice(0, 4);

  if (visibleExamples.length === 0) {
    grid.innerHTML = `<div class="examples-placeholder">
      Выбери категорию, чтобы увидеть примеры.
    </div>`;
    return;
  }

  const cardsHtml = visibleExamples.map((example, index) => {
    const { title, idea, tone, ...exampleParams } = example;
    const text = buildPromptText(type, idea, tone || "professional", exampleParams, "standard");
    const paramEntries = Object.entries(exampleParams)
      .filter(([_, value]) => normalizeValue(value).length > 0)
      .slice(0, 4);

    return `
      <article class="example-card example-card--modal" data-example-index="${index}">
        <div class="example-card-top">
          <div class="example-card-title-wrap">
            <strong class="example-card-title">${title || "Пример промпта"}</strong>
            <p class="example-card-idea">${idea}</p>
          </div>
          <span class="tag example-tone-tag">${tone || "professional"}</span>
        </div>

        <div class="example-meta">
          ${paramEntries.map(([key, value]) => `<span class="example-chip"><span>${key}</span>${Array.isArray(value) ? value.join(", ") : value}</span>`).join("")}
        </div>

        <pre>${text}</pre>

        <div class="example-actions">
          <button class="btn btn-secondary" data-copy-example="${index}" type="button">Копировать</button>
          <button class="btn btn-primary" data-use-example="${index}" type="button">Использовать</button>
        </div>
      </article>
    `;
  }).join("");

  grid.innerHTML = cardsHtml;

  visibleExamples.forEach((example, index) => {
    const { title, idea, tone, ...exampleParams } = example;
    const text = buildPromptText(type, idea, tone || "professional", exampleParams, "standard");

    const copyBtn = grid.querySelector(`[data-copy-example="${index}"]`);
    const useBtn = grid.querySelector(`[data-use-example="${index}"]`);

    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(text);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Скопировано!";
        copyBtn.classList.add("btn-primary");
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.classList.remove("btn-primary");
        }, 1800);
      };
    }

    if (useBtn) {
      useBtn.onclick = () => {
        selectedType = type;

        const modalTitle = modal.querySelector(".modal-title");
        modalTitle.textContent = `Кастомизация: ${promptTemplates[selectedType]?.name || selectedType}`;

        renderTechnicalParams(selectedType);

        toneSelect.value = tone || "professional";
        customInput.value = idea;
        applyPresetParams(exampleParams);
        updatePromptPreview();
        setGeneratorTab("generate");

        modal.querySelector("#final-prompt").textContent = "";
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        setTimeout(updateGenerateButtonState, 50);
      };
    }
  });
}

promptForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Отслеживаем изменения
    isFormDirty = true;
    
    let customText = customInput.value?.trim();
    const tone = toneSelect.value;

    if (!customText) {
      showGeneratorToast("Пожалуйста, опишите вашу идею", "error");
      return;
    }
    
    // ===== ЦЕНЗУРА =====
    const originalText = customText;
    customText = censorText(customText);
    
    if (!promptTemplates[selectedType]) {
      showGeneratorToast("Шаблон для этого типа промпта ещё не готов", "error");
      return;
    }

    const requirementsState = getGeneratorRequirementsState();
    if (!requirementsState.canGenerate) {
      if (!normalizeValue(customInput.value)) {
        showGeneratorToast("Пожалуйста, опишите вашу идею", "error");
      } else if (requirementsState.missingCustomFields) {
        showGeneratorToast("Заполните поле для варианта 'Другое'", "warning");
      } else {
        showGeneratorToast("Проверьте параметры перед генерацией", "warning");
      }
      updateGenerateButtonState();
      return;
    }

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

    const params = collectPromptParams(selectedType);

    // Небольшая задержка для "реалистичности" генерации
    await new Promise(resolve => setTimeout(resolve, 800));

    const finalPromptText = buildPromptText(
      selectedType,
      customText,
      tone,
      params,
      normalizeValue(generationModeSelect?.value) || "standard"
    );

    incGeneration();
    finalPrompt.textContent = finalPromptText;
    if (promptPreview) {
      promptPreview.textContent = finalPromptText;
      promptPreview.classList.remove("is-placeholder");
    }
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
  if (!finalPrompt.textContent) {
    showGeneratorToast("Сначала сгенерируйте промпт", "error");
    return;
  }
  navigator.clipboard.writeText(finalPrompt.textContent).then(() => {
    const originalText = this.textContent;
    this.textContent = "Скопировано!";
    this.classList.add("btn-primary");
    showGeneratorToast("Промпт скопирован", "success", 1800);
    setTimeout(() => {
      this.textContent = originalText;
      this.classList.remove("btn-primary");
    }, 2000);
  });
});

const downloadButton = modal.querySelector("#download-prompt");

  downloadButton.addEventListener("click", () => {
  const text = finalPrompt.textContent?.trim();
  if (!text) {
    showGeneratorToast("Сначала сгенерируйте промпт", "error");
    return;
  }

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
  showGeneratorToast("Файл с промптом скачан", "success", 1800);
});

  document.addEventListener("click", async (event) => {
    const anchor = event.target.closest?.("a[href]");
    if (!anchor) return;
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

    const href = anchor.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

    const targetUrl = new URL(anchor.href, window.location.href);
    const currentUrl = new URL(window.location.href);
    const isSamePage = targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search && targetUrl.hash === currentUrl.hash;
    if (isSamePage) return;

    if (!(modal.classList.contains("active") && (isPromptGenerated || isFormDirty))) return;

    event.preventDefault();
    const shouldLeave = await showGeneratorConfirmationModal({
      title: "Покинуть генератор?",
      message: "У вас есть несохранённый промпт. Если перейти на другую страницу, изменения могут пропасть.",
      confirmText: "Покинуть",
      cancelText: "Остаться",
      iconClass: "fa-right-from-bracket",
    });

    if (shouldLeave) {
      window.location.href = anchor.href;
    }
  }, true);

  console.log("✅ Генератор инициализирован");

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


  setActiveNavLink();
  initNav();
  initGenerator();
  initLightbox();
  initAnimations();
  initSearch();
  runDebug();

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.error("SW error:", err));
  }
});
