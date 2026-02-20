// ===== Весь код генератора =====

// ИСПОЛЬЗУЕМ СУЩЕСТВУЮЩИЙ ОБЪЕКТ
window.TAIPrompts = window.TAIPrompts || {};
TAIPrompts.generator = {};

// ===== ЦЕНЗУРА =====
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

TAIPrompts.generator.censorText = function(text) {
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
};

// ===== ШАБЛОНЫ ПРОМПТОВ =====
TAIPrompts.generator.promptTemplates = {
  recipes: {
    name: "Рецепты",
    template:
      "Создай подробный рецепт {cuisine} кухни, блюда с описанием: '{idea}'. Ограничения: {dietary}, Сложность: {complexity}. Включи ингредиенты, пошаговое приготовление, время готовки и полезную информацию.",
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
      "Разработай веб-сайт типа {type} на {stack} по описанию: '{idea}'. Основная палитра: {color}. Стиль сайта: {style}. Сложность реализации: {complexity}. Для всех изображений автоматически находи подходящие картинки и используй исключительно прямые ссылки на файлы изображений (jpg/png/webp), доступные по прямому URL. Включи: {additionally}, {features} и иконки типа {emoji}.",
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
        options: ["Минимализм", "Матовое стекло", "Брутализм", "Ретро", "Киберпанк", "Аниме-фэнтези"],
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
        options: ["Адаптивный дизайн", "PWA", "SEO оптимизация", "Корзина покупок", "Блог", "Комментарии", "Поиск", "Смена темы", "Бекенд", "Аккаунты", "Тарифы", "Галерея изображений", "Отзывы", "Код в одном файле"],
        default: "Адаптивный дизайн",
      },
      emoji: {
        type: "select",
        label: "Оформление",
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
        options: ["Полный код", "Структура проекта", "Объяснение ключевых понятий"],
        default: "Полный код",
      },
    },
  },

  bots: {
    name: "Боты и автоматизация",
    template:
      "Создай бота на {language} для платформы {platform}, с функционалом '{idea}'. Сложность реализации: {complexity}. Включи: описание функций, {functionality}, {additionally}, обработку сообщений и установочные инструкции.",
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
      "Разработай {type} для Minecraft {version} {loader} для {compatibility} с описанием: '{idea}'. Особенности: {features} и {additionally}. Сложность реализации: {complexity}. Детально опиши функционал и механики.",
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
      "Сгенерируй {style} изображение {aspect_ratio} качества {quality} по описанию: '{idea}'.",
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
      "Разработай {type} на {lang} для {oc} с функционалом {hang}, включи {additionally}, и инструкцией по сборке для {setupper}. Сложность реализации: {complexity}. Подробное описание идеи: '{idea}'",
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

// ===== ПРИМЕРЫ ПРОМПТОВ =====
TAIPrompts.generator.promptExamples = {
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

// ===== КРОСС-РЕКОМЕНДАЦИИ =====
TAIPrompts.generator.crossRecommendations = {
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

// ===== КОНТЕКСТНЫЕ ПРАВИЛА =====
TAIPrompts.generator.contextRules = {
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

// ===== ВАЛИДАЦИЯ =====
TAIPrompts.generator.validationRules = {
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
        recommendedColors: ["Убразный (#db0f00)", "Обнаружение (#26d13c)"],
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
        cannotHave: ["Изменение мира", "Конфиг"],
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
        cannotHave: ["Высокобелковое"],
        message: "Для веганских блюд сложно достичь высокого содержания белка"
      }
    ],
    
    recommendations: [
      {
        when: { cuisine: ["итальянской"] },
        recommendedComplexity: ["Простое", "Средней сложности"],
        message: "Итальянская кухня обычно проста в приготовлении"
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

// ===== ГЕНЕРАЦИЯ ТЕКСТА ПРОМПТА =====
TAIPrompts.generator.buildPromptText = function(type, idea, tone = "professional", overrideParams = {}) {
  if (!TAIPrompts.generator.promptTemplates[type]) return "";

  const tpl = TAIPrompts.generator.promptTemplates[type];
  const params = {};

  for (const [key, value] of Object.entries(overrideParams)) {
    params[key] = value;
  }

  const tplParams = tpl.params || {};
  for (const [key, param] of Object.entries(tplParams)) {
    if (params[key] !== undefined) continue;
    
    if (param.type === "select") {
      const el = document.querySelector(`#param-${key}`);
      if (el) params[key] = el.value;
    } else if (param.type === "multiselect") {
      const box = document.querySelector(`#param-${key}`);
      if (box) {
        const checked = box.querySelectorAll('input[type="checkbox"]:checked');
        params[key] = Array.from(checked).map(cb => cb.value);
      }
    }
  }

  if (typeof tpl.template === 'function') {
    return tpl.template(params, idea, tone);
  }

  let text = tpl.template;
  text = text.replace("{idea}", idea);

  for (const [key, value] of Object.entries(params)) {
    const paramValue = Array.isArray(value) ? value.join(", ") : value || "";
    text = text.replace(new RegExp(`\\{${key}\\}`, "g"), paramValue);
  }

  text = text.replace(/\{[^}]+\}/g, "").replace(/\s{2,}/g, " ").trim();
  
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
};

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ПРИМЕРАМИ =====
TAIPrompts.generator.renderExamples = function(type) {
  const grid = document.getElementById("examplesGrid");
  if (!grid) return;

  const examples = TAIPrompts.generator.promptExamples[type] || [];
  const firstExample = examples[0];
  
  if (!firstExample) {
    grid.innerHTML = `<div class="examples-placeholder">
      Выбери категорию, чтобы увидеть пример.
    </div>`;
    return;
  }

  const { title, idea, tone, ...exampleParams } = firstExample;
  
  const text = TAIPrompts.generator.buildPromptText(type, idea, tone || "professional", exampleParams);
  
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
      if (TAIPrompts.generator.openModalWithExample) {
        TAIPrompts.generator.openModalWithExample(type, idea, tone, exampleParams);
      }
    };
  }
};

// ===== ВАЛИДАЦИЯ =====
TAIPrompts.generator.validateCombination = function(type, selectedParams) {
  const rules = TAIPrompts.generator.validationRules[type];
  if (!rules) return { valid: true, warnings: [], errors: [] };
  
  const warnings = [];
  const errors = [];
  
  if (rules.incompatible) {
    rules.incompatible.forEach(rule => {
      let conditionMet = true;
      Object.keys(rule.when).forEach(paramKey => {
        const paramValue = selectedParams[paramKey];
        if (!paramValue || !rule.when[paramKey].includes(paramValue)) {
          conditionMet = false;
        }
      });
      
      if (conditionMet) {
        rule.cannotHave.forEach(forbidden => {
          let hasForbidden = false;
          
          Object.keys(selectedParams).forEach(key => {
            const value = selectedParams[key];
            if (Array.isArray(value) && value.includes(forbidden)) {
              hasForbidden = true;
            }
          });
          
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
        Object.keys(rule).forEach(ruleKey => {
          if (ruleKey.startsWith('recommended')) {
            const paramName = ruleKey.replace('recommended', '').toLowerCase();
            
            let actualValue = selectedParams[paramName];
            
            if (!actualValue) {
              Object.keys(selectedParams).forEach(key => {
                if (key.toLowerCase().includes(paramName.toLowerCase())) {
                  actualValue = selectedParams[key];
                }
              });
            }
            
            if (actualValue && !rule[ruleKey].includes(actualValue)) {
              const recommendations = rule[ruleKey].join(', ');
              let message = rule.message;
              
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
};

// ===== КОНТЕКСТНЫЕ ФУНКЦИИ =====
TAIPrompts.generator.applyContextualParams = function(category, userText) {
  const rules = TAIPrompts.generator.contextRules[category];
  if (!rules || !userText) return { autoParams: {}, suggestions: [] };
  
  const userTextLower = userText.toLowerCase();
  const autoParams = {};
  const suggestions = [];
  
  rules.forEach(rule => {
    const hasTrigger = rule.triggers.some(trigger => 
      userTextLower.includes(trigger.toLowerCase())
    );
    
    if (hasTrigger) {
      Object.assign(autoParams, rule.autoSet);
      if (rule.suggestions) {
        suggestions.push(...rule.suggestions);
      }
    }
  });
  
  return { autoParams, suggestions };
};

// ===== КРОСС-РЕКОМЕНДАЦИИ =====
TAIPrompts.generator.checkCrossRecommendations = function(category, userText) {
  const recommendations = TAIPrompts.generator.crossRecommendations[category];
  if (!recommendations || !userText) return null;
  
  const userTextLower = userText.toLowerCase();
  const matched = [];
  
  recommendations.forEach(rec => {
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
};

// ===== ИНИЦИАЛИЗАЦИЯ ГЕНЕРАТОРА =====
TAIPrompts.generator.init = function() {
  const typeCards = document.querySelectorAll(".type-card");
  const generationSection = document.querySelector(".generation");

  if (typeCards.length === 0 || !generationSection) {
    console.log("Генератор не найден на этой странице");
    return;
  }

  console.log("🚀 Инициализация генератора промптов...");

  let selectedType = "recipes";
  let isPromptGenerated = false;
  let isFormDirty = false;
  let modal = null;
  let customInput = null;
  let toneSelect = null;
  let finalPrompt = null;

  // Создание модального окна
  function createModal() {
    modal = document.createElement("div");
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
    
    customInput = modal.querySelector("#custom-input");
    toneSelect = modal.querySelector("#tone-select");
    finalPrompt = modal.querySelector("#final-prompt");
    
    setupModalEvents();
  }

  function setupModalEvents() {
    const closeBtn = modal.querySelector(".modal-close");
    closeBtn.addEventListener("click", closeModalWithCheck);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModalWithCheck();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        e.preventDefault();
        closeModalWithCheck();
      }
    });

    const form = modal.querySelector("#prompt-form");
    form.addEventListener("submit", handleFormSubmit);

    const copyButton = modal.querySelector("#copy-prompt");
    copyButton.addEventListener("click", handleCopy);

    const downloadButton = modal.querySelector("#download-prompt");
    downloadButton.addEventListener("click", handleDownload);

    customInput.addEventListener('input', handleInputChange);
    toneSelect.addEventListener('change', () => {
      isFormDirty = true;
    });
  }

  function renderTechnicalParams(type) {
    const container = modal.querySelector("#technical-params");
    const params = TAIPrompts.generator.promptTemplates[type]?.params || {};
    let html = `<h4 style="margin-bottom: 1.5rem; color: var(--accent-color);">${TAIPrompts.generator.promptTemplates[type]?.name || type}</h4>`;
    
    html += `<div id="validationMessages" style="margin-bottom: 20px;"></div>`;
    
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
      
      const validation = TAIPrompts.generator.validateCombination(type, selectedParams);
      showValidationMessages(validation);
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
        html += `</select>`;
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
    
    container.querySelectorAll('select.tech-param, .multi-select input[type="checkbox"]').forEach(element => {
      element.addEventListener('change', updateValidation);
    });
    
    setTimeout(updateValidation, 100);
  }

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

  function showCrossRecommendations() {
    let recommendationsContainer = document.getElementById('crossRecommendations');
    if (!recommendationsContainer) {
      recommendationsContainer = document.createElement('div');
      recommendationsContainer.id = 'crossRecommendations';
      recommendationsContainer.className = 'cross-recommendations';
      const form = modal.querySelector('#prompt-form');
      if (form) {
        form.parentNode.insertBefore(recommendationsContainer, form);
      }
    }
    
    const userText = customInput.value.trim();
    if (!userText || userText.length < 5) {
      recommendationsContainer.style.display = 'none';
      return;
    }
    
    const matchedRecommendations = TAIPrompts.generator.checkCrossRecommendations(selectedType, userText);
    
    if (!matchedRecommendations || matchedRecommendations.length === 0) {
      recommendationsContainer.style.display = 'none';
      return;
    }
    
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
    
    recommendationsContainer.querySelectorAll('.try-recommendation').forEach(btn => {
      btn.addEventListener('click', function() {
        const newCategory = this.getAttribute('data-category');
        const presetParams = JSON.parse(this.getAttribute('data-preset') || '{}');
        switchToCategory(newCategory, presetParams);
      });
    });
  }

  function switchToCategory(newCategory, presetParams = {}) {
    selectedType = newCategory;
    if (TAIPrompts.core?.incCategory) {
      TAIPrompts.core.incCategory(newCategory);
    }
    
    const modalTitle = modal.querySelector(".modal-title");
    modalTitle.textContent = `Кастомизация: ${TAIPrompts.generator.promptTemplates[newCategory]?.name || newCategory}`;
    
    const currentText = customInput.value;
    renderTechnicalParams(newCategory);
    customInput.value = currentText;
    
    if (Object.keys(presetParams).length > 0) {
      setTimeout(() => applyPresetParams(presetParams), 100);
    }
    
    setTimeout(showCrossRecommendations, 300);
  }

  function applyPresetParams(presetParams) {
    for (const [key, value] of Object.entries(presetParams)) {
      const paramEl = modal.querySelector(`#param-${key}`);
      if (paramEl) {
        if (paramEl.tagName === 'SELECT') {
          paramEl.value = value;
        } else if (paramEl.classList.contains('multi-select')) {
          const checkboxes = paramEl.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(checkbox => {
            checkbox.checked = Array.isArray(value) ? value.includes(checkbox.value) : checkbox.value === value;
          });
        }
      }
    }
  }

  function showContextSuggestions(suggestions) {
    let container = document.getElementById('contextSuggestions');
    if (!container) {
      container = document.createElement('div');
      container.id = 'contextSuggestions';
      container.className = 'context-suggestions';
      const generatedPrompt = modal.querySelector('.generated-prompt');
      if (generatedPrompt) {
        generatedPrompt.parentNode.insertBefore(container, generatedPrompt);
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

  function showContextToast(message) {
    const oldToast = document.querySelector('.context-toast');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'context-toast';
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-magic"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

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

  function handleInputChange() {
    if (customInput.value.trim()) {
      isFormDirty = true;
    }
    
    if (customInput.value.trim().length > 10) {
      showCrossRecommendations();
    }
  }

  const debouncedContextCheck = debounce(() => {
    const text = customInput.value.trim();
    if (text.length < 15) return;
    
    const result = TAIPrompts.generator.applyContextualParams(selectedType, text);
    
    if (Object.keys(result.autoParams).length > 0) {
      applyPresetParams(result.autoParams);
      showContextToast(`Автоматически настроены параметры для "${TAIPrompts.generator.promptTemplates[selectedType]?.name || selectedType}"`);
    }
    
    showContextSuggestions(result.suggestions);
  }, 800);

  customInput.addEventListener('input', debouncedContextCheck);

  function checkBeforeModalClose() {
    if (isPromptGenerated || isFormDirty) {
      return confirm('У вас есть несохранённый промпт. Вы уверены, что хотите закрыть?');
    }
    return true;
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  function closeModalWithCheck() {
    if (checkBeforeModalClose()) {
      closeModal();
      isPromptGenerated = false;
      isFormDirty = false;
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    isFormDirty = true;
    
    let customText = customInput.value?.trim();
    const tone = toneSelect.value;

    if (!customText) return alert("Пожалуйста, опишите вашу идею");
    
    customText = TAIPrompts.generator.censorText(customText);
    
    if (!TAIPrompts.generator.promptTemplates[selectedType]) return alert("Шаблон для этого типа промпта еще не готов");

    const overlay = document.getElementById('generationOverlay');
    
    if (overlay) {
      const typeName = TAIPrompts.generator.promptTemplates[selectedType]?.name || selectedType;
      const animationTitle = document.getElementById('animationTitle');
      const animationSubtitle = document.getElementById('animationSubtitle');
      
      if (animationTitle) animationTitle.textContent = `Генерируем ${typeName.toLowerCase()}...`;
      if (animationSubtitle) animationSubtitle.textContent = `Анализируем параметры: "${customText.substring(0, 30)}${customText.length > 30 ? '...' : ''}"`;
      
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      await animateGenerationProgress(overlay);
    }

    const params = {};
    for (const [key, param] of Object.entries(TAIPrompts.generator.promptTemplates[selectedType].params || {})) {
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

    await new Promise(resolve => setTimeout(resolve, 800));

    const finalPromptText = TAIPrompts.generator.buildPromptText(selectedType, customText, tone, params);

    if (TAIPrompts.core?.incGeneration) {
      TAIPrompts.core.incGeneration();
    }
    
    finalPrompt.textContent = finalPromptText;
    finalPrompt.scrollIntoView({ behavior: "smooth", block: "nearest" });

    isPromptGenerated = true;
  
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  function handleCopy() {
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
  }

  function handleDownload() {
    const text = finalPrompt.textContent?.trim();
    if (!text) return alert("Сначала сгенерируйте промпт");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `TAIPrompts_${selectedType}_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  async function animateGenerationProgress(overlay) {
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
      
      const progressFill = document.getElementById('progressFill');
      const progressText = document.getElementById('progressText');
      const stagesElements = document.querySelectorAll('.stage');
      
      function updateProgress() {
        if (progress < 100) {
          const nextStage = stages.find(s => s.percent > progress) || stages[stages.length - 1];
          const increment = Math.random() * 15 + 5;
          
          progress = Math.min(progress + increment, nextStage.percent);
          
          if (progressFill) progressFill.style.width = `${progress}%`;
          
          const stage = stages.find(s => s.percent >= progress) || stages[stages.length - 1];
          if (progressText) progressText.textContent = stage.text;
          
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
          
          const delay = Math.random() * 300 + 100;
          setTimeout(updateProgress, delay);
        } else {
          stagesElements.forEach(el => {
            el.classList.add('completed');
            el.classList.add('active');
          });
          
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

  TAIPrompts.generator.openModalWithExample = function(type, idea, tone, exampleParams) {
    selectedType = type;

    const modalTitle = modal.querySelector(".modal-title");
    modalTitle.textContent = `Кастомизация: ${TAIPrompts.generator.promptTemplates[selectedType]?.name || selectedType}`;

    renderTechnicalParams(selectedType);

    toneSelect.value = tone || "professional";
    customInput.value = idea;

    for (const [key, value] of Object.entries(exampleParams)) {
      const paramEl = modal.querySelector(`#param-${key}`);
      if (paramEl) {
        if (paramEl.tagName === 'SELECT') {
          paramEl.value = value;
        } else if (paramEl.classList.contains('multi-select')) {
          const checkboxes = paramEl.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(checkbox => {
            checkbox.checked = value.includes(checkbox.value);
          });
        }
      }
    }

    finalPrompt.textContent = "";
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  // Создаем модалку
  createModal();

  // Назначаем обработчики на карточки
  typeCards.forEach((card) => {
    card.addEventListener("click", function () {
      isPromptGenerated = false;
      isFormDirty = false;
      
      selectedType = this.getAttribute("data-type") || "recipes";
      if (TAIPrompts.core?.incCategory) {
        TAIPrompts.core.incCategory(selectedType);
      }
      
      if (typeof TAIPrompts.generator.renderExamples === 'function') {
        TAIPrompts.generator.renderExamples(selectedType);
      }

      const modalTitle = modal.querySelector(".modal-title");
      modalTitle.textContent = `Кастомизация: ${TAIPrompts.generator.promptTemplates[selectedType]?.name || selectedType}`;

      renderTechnicalParams(selectedType);

      const form = modal.querySelector("#prompt-form");
      form.reset();
      finalPrompt.textContent = "";

      const stages = document.querySelectorAll('.stage');
      if (stages.length > 0) {
        stages.forEach(stage => {
          stage.classList.remove('active', 'completed');
        });
        stages[0].classList.add('active');
      }

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  window.addEventListener('beforeunload', function(event) {
    if (modal.classList.contains('active') && (isPromptGenerated || isFormDirty)) {
      event.preventDefault();
      event.returnValue = '';
      return 'У вас есть несохранённый промпт. Вы уверены, что хотите покинуть страницу?';
    }
  });
};

// Дополнительная инициализация для карточек, которые могли быть загружены позже
TAIPrompts.generator.reinitCards = function() {
  const typeCards = document.querySelectorAll(".type-card");
  const generationSection = document.querySelector(".generation");

  if (typeCards.length === 0 || !generationSection) {
    return;
  }
  
  console.log("🔄 Переинициализация карточек генератора...");
  
  // Удаляем старые обработчики и добавляем новые
  typeCards.forEach((card) => {
    // Удаляем старый обработчик, если был
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);
    
    newCard.addEventListener("click", function(e) {
      e.preventDefault();
      
      const type = this.getAttribute("data-type") || "recipes";
      console.log("Клик по карточке:", type);
      
      // Вызываем открытие модалки
      if (window.TAIPrompts && window.TAIPrompts.generator) {
        window.TAIPrompts.generator.openModal(type);
      }
    });
  });
};

// Функция для открытия модалки напрямую
TAIPrompts.generator.openModal = function(type) {
  // Проверяем, существует ли модалка
  let modal = document.querySelector('.customization-modal');
  
  if (!modal) {
    console.error("Модальное окно не найдено");
    return;
  }
  
  const selectedType = type || "recipes";
  
  // Сбрасываем флаги
  if (this._isPromptGenerated !== undefined) this._isPromptGenerated = false;
  if (this._isFormDirty !== undefined) this._isFormDirty = false;
  
  // Обновляем заголовок
  const modalTitle = modal.querySelector(".modal-title");
  if (modalTitle) {
    modalTitle.textContent = `Кастомизация: ${this.promptTemplates[selectedType]?.name || selectedType}`;
  }
  
  // Рендерим параметры
  if (typeof this._renderTechnicalParams === 'function') {
    this._renderTechnicalParams(selectedType);
  }
  
  // Сбрасываем форму
  const form = modal.querySelector("#prompt-form");
  if (form) form.reset();
  
  const finalPrompt = modal.querySelector("#final-prompt");
  if (finalPrompt) finalPrompt.textContent = "";
  
  // Сбрасываем стадии анимации
  const stages = document.querySelectorAll('.stage');
  if (stages.length > 0) {
    stages.forEach(stage => {
      stage.classList.remove('active', 'completed');
    });
    stages[0]?.classList.add('active');
  }
  
  // Показываем модалку
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  
  // Рендерим примеры
  if (typeof this.renderExamples === 'function') {
    this.renderExamples(selectedType);
  }
  
  // Отмечаем категорию в статистике
  if (window.TAIPrompts?.core?.incCategory) {
    window.TAIPrompts.core.incCategory(selectedType);
  }
};

// Переопределяем функцию renderTechnicalParams, чтобы она была доступна
TAIPrompts.generator._renderTechnicalParams = function(type) {
  const modal = document.querySelector('.customization-modal');
  if (!modal) return;
  
  const container = modal.querySelector("#technical-params");
  if (!container) return;
  
  const params = this.promptTemplates[type]?.params || {};
  let html = `<h4 style="margin-bottom: 1.5rem; color: var(--accent-color);">${this.promptTemplates[type]?.name || type}</h4>`;
  
  html += `<div id="validationMessages" style="margin-bottom: 20px;"></div>`;
  
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
    
    const validation = this.validateCombination(type, selectedParams);
    this._showValidationMessages(validation);
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
      html += `</select>`;
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
  
  container.querySelectorAll('select.tech-param, .multi-select input[type="checkbox"]').forEach(element => {
    element.addEventListener('change', updateValidation);
  });
  
  setTimeout(updateValidation, 100);
};

TAIPrompts.generator._showValidationMessages = function(validation) {
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
};
