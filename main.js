console.log('=== TAIPrompts Debug ===');
console.log('Current page:', window.location.pathname);
console.log('Files in project:');

// Проверим доступность файлов
const files = ['index.html', 'generator.html', 'about.html', 'versions.html'];
files.forEach(file => {
    fetch(file)
        .then(response => {
            console.log(`${file}: ${response.ok ? '✅ OK' : '❌ Not found'}`);
        })
        .catch(error => {
            console.log(`${file}: ❌ Error - ${error.message}`);
        });
});

// Общие элементы
const navLinks = document.querySelectorAll('.nav-link');
const burger = document.querySelector('.burger');
const navList = document.querySelector('.nav-list');
const sections = document.querySelectorAll('section');

// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
        .then(() => console.log("SW registered"))
        .catch((err) => console.error("SW error:", err));
}

// Навигация
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Закрываем меню на мобильных устройствах
        if (navList && navList.classList.contains('active')) {
            navList.classList.remove('active');
            if (burger) burger.classList.remove('active');
        }
        
        // Обрабатываем только якоря (#)
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
        // Ссылки на другие страницы обрабатываются браузером
    });
});

// Бургер меню
if (burger) {
    burger.addEventListener('click', function() {
        this.classList.toggle('active');
        if (navList) {
            navList.classList.toggle('active');
        }
    });
}

// Активный пункт меню при прокрутке (только для якорей)
if (sections.length > 0) {
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                link.classList.remove('active');
                if (href === `#${current}`) {
                    link.classList.add('active');
                }
            }
        });
    });
}

// ===== ГЕНЕРАТОР ПРОМПТОВ =====
// Инициализируем только на странице генератора
(function initGenerator() {
    // Проверяем, есть ли элементы генератора на странице
    const typeCards = document.querySelectorAll('.type-card');
    const generationSection = document.querySelector('.generation');
    
    if (typeCards.length === 0 || !generationSection) {
        console.log('Генератор не найден на этой странице');
        return;
    }
    
    console.log('🚀 Инициализация генератора промптов...');
    
    // Шаблоны промптов с техническими параметрами
    const promptTemplates = {
        recipes: {
            name: "🍳 Рецепты",
            template: "Создай подробный рецепт {cuisine} кухни, блюда с описанием: '{idea}'. Ограничения: {dietary}, Сложность: {complexity}. Включи ингредиенты, пошаговое приготовление, время готовки и полезную информацию, например КБЖУ.",
            params: {
                cuisine: {
                    type: 'select',
                    label: 'Тип кухни',
                    options: ['любой', 'итальянской', 'азиатской', 'мексиканской', 'русской', 'французской', 'средиземноморской'],
                    default: 'любой'
                },
                dietary: {
                    type: 'select',
                    label: 'Диетические требования',
                    options: ['Без ограничений', 'Веганское', 'Вегетарианское', 'Без глютена', 'Низкоуглеводное', 'Высокобелковое'],
                    default: 'Без ограничений'
                },
                complexity: {
                    type: 'select',
                    label: 'Сложность',
                    options: ['Простое', 'Средней сложности', 'Сложное', 'Шеф-повар'],
                    default: 'Средней сложности'
                }
            }
        },
        minecraft: {
            name: "⛏️ Моды Minecraft",
            template: "Разработай {type} для Minecraft {version} с описанием: '{idea}'. Особенности: {features}. Совместимость: {compatibility}. Детально опиши функционал, рецепты и механики. Также напиши структуру проекта, полный код и гайд по сборке проекта в Intellij IDEA если требуется. (Например для датапаков не нужен IDEA)",
            params: {
                type: {
                    type: 'select',
                    label: 'Тип контента',
                    options: ['мод', 'ресурспак', 'датапак', 'плагин', 'аддон'],
                    default: 'мод'
                },
                version: {
                    type: 'select',
                    label: 'Версия Minecraft',
                    options: ['1.20.x', '1.19.x', '1.18.x', '1.17.x', '1.16.x', 'Любая', '1.12x', '1.8x'],
                    default: '1.20.x'
                },
                compatibility: {
                    type: 'select',
                    label: 'Совместимость',
                    options: ['Forge', 'Fabric', 'Paper', 'Spigot', 'Bukkit', 'Любая'],
                    default: 'Forge'
                },
                features: {
                    type: 'multiselect',
                    label: 'Особенности',
                    options: ['Новые блоки', 'Новые мобы', 'Новые предметы', 'Генерация структур', 'Магическая система', 'Технологии', 'Квесты', 'Боссы', 'GUI', 'Оптимизация', 'Клиентские фишки', 'Конфиг'],
                    default: 'Оптимизация'
                }
            }
        },
        bots: {
            name: "📱 Боты и автоматизация",
            template: "Создай {platform} бота на {language} с функционалом '{idea}'. Включи: описание функций, {functionality}, обработку сообщений и установочные инструкции. Добавить ИИ в бота: {ai}",
            params: {
                platform: {
                    type: 'select',
                    label: 'Платформа',
                    options: ['Telegram', 'Discord', 'Внешний', 'Minecraft', 'MAX', 'Другой', 'Любой'],
                    default: 'Telegram'
                },
                language: {
                    type: 'select',
                    label: 'Язык программирования',
                    options: ['Python', 'JavaScript', 'TypeScript', 'Java', 'PHP', 'Go', 'Любой'],
                    default: 'Python'
                },
                functionality: {
                    type: 'multiselect',
                    label: 'Особенности',
                    options: ['Админ-панель', 'Платежи', 'База данных', 'API интеграции', 'Модерация', 'Игры', 'Уведомления', 'Работа с файлами', 'Inline клавиатуры', 'Команды'],
                    default: 'Модерация'
                },
                ai: {
                    type: 'select',
                    label: 'Добавить ИИ в бота?',
                    options: ['Да', 'Нет'],
                    default: 'Нет' 
                }
            }
        },
        websites: {
            name: "🌐 Веб-сайты",
            template: "Разработай веб-сайт типа {type} на {stack} по описанию '{idea}'. Включи: структуру сайта, {features}. Основная палитра: {color}. Стиль сайта: {style}",
            params: {
                type: {
                    type: 'select',
                    label: 'Тип сайта',
                    options: ['Лендинг', 'Интернет-магазин', 'Блог', 'Портфолио', 'Социальную сеть', 'Панель управления', 'Многостраничное приложение'],
                    default: 'Лендинг'
                },
                stack: {
                    type: 'select',
                    label: 'Технологический стек',
                    options: ['HTML/CSS/JS', 'React', 'Vue.js', 'Angular', 'Node.js', 'PHP', 'Python/Django', 'Ruby on Rails'],
                    default: 'HTML/CSS/JS'
                },
                style: {
                    type: 'select',
                    label: 'Стиль сайта',
                    options: ['Минимализм', 'Матовое стекло', 'Брутализм', 'Ретро', 'Киперпанк', 'PHP'],
                    default: 'Матовое стекло'
                },
                color: {
                    type: 'select',
                    label: 'Основная палитра',
                    options: ['Красный', 'Оранжевый', 'Голубой', 'Жёлтый', 'Зелёный', 'Чёрный', 'Белый', 'Киберпанк', 'Другой'],
                    default: 'Красный'
                },
                features: {
                    type: 'multiselect',
                    label: 'Функции',
                    options: ['Адаптивный дизайн', 'PWA', 'SEO оптимизация', 'Корзина покупок', 'Блог', 'Комментарии', 'Поиск', 'Код в одном файле'],
                    default: 'Адаптивный дизайн'
                }
            }
        },
        images: {
            name: "🎨 Генерация изображений",
            template: "Сгенерируй {style} изображение по описанию: '{idea}'. {aspect_ratio} {quality}. С детальным описанием: композиция, цвета, освещение, настроение и детали.",
            params: {
                style: {
                    type: 'select',
                    label: 'Стиль изображения',
                    options: ['реалистичное', 'мультяшное', 'фэнтези', 'футуристическое', 'минималистичное', 'абстрактное'],
                    default: 'реалистичное'
                },
                aspect_ratio: {
                    type: 'select',
                    label: 'Соотношение сторон',
                    options: ['1:1 (квадрат)', '16:9 (широкоэкранное)', '9:16 (вертикальное)', '4:3 (стандартное)', '21:9 (кинематографическое)'],
                    default: '1:1 (квадрат)'
                },
                quality: {
                    type: 'select',
                    label: 'Качество',
                    options: ['Высокое (4K)', 'Среднее (HD)', 'Низкое (для web)'],
                    default: 'Высокое (4K)'
                }
            }
        },
        stickers: {
            name: "🖼️ Стикеры и аватары",
            template: "Создай {style} стикерпак для {platform} с описанием: '{idea}'. Нужные эмоции: {emotions}. Включи разнообразные эмоции, действия и ситуации. Сделай всё на прозрачном фоне, чтобы можно было удобно вставить в любой мессенджер.",
            params: {
                style: {
                    type: 'select',
                    label: 'Стиль стикеров',
                    options: ['мультяшный', 'минималистичный', 'реалистичный', 'кавайный', 'мемный', 'абстрактный'],
                    default: 'мультяшный'
                },
                platform: {
                    type: 'select',
                    label: 'Платформа',
                    options: ['Telegram', 'WhatsApp', 'Discord', 'Signal', 'Любая'],
                    default: 'Telegram'
                },
                emotions: {
                    type: 'multiselect',
                    label: 'Эмоции и действия',
                    options: ['Радость', 'Грусть', 'Удивление', 'Смех', 'Любовь', 'Приветствие', 'Прощание', 'Одобрение'],
                    default: 'Приветствие'
                }
            }
        },
        "3d": {
            name: "🔷 3D модели",
            template: "Создай {style} 3D модель {type} на тему '{idea}'. ПО: {software} Полигональность: {polygons}. Детально опиши: геометрию, материалы, текстуры, освещение и рендеринг.",
            params: {
                style: {
                    type: 'select',
                    label: 'Стиль модели',
                    options: ['реалистичный', 'low-poly', 'стилизованный', 'мультяшный', 'футуристический'],
                    default: 'реалистичный'
                },
                type: {
                    type: 'select',
                    label: 'Тип модели',
                    options: ['персонажа', 'окружения', 'предмета', 'архитектуры', 'транспорта'],
                    default: 'персонажа'
                },
                software: {
                    type: 'select',
                    label: 'Программа',
                    options: ['Blender', 'Maya', '3ds Max', 'ZBrush', 'Любая'],
                    default: 'Blender'
                },
                polygons: {
                    type: 'select',
                    label: 'Полигональность',
                    options: ['Low-poly (<10k)', 'Medium (10-50k)', 'High (50-200k)', 'Ultra (>200k)'],
                    default: 'Medium (10-50k)'
                }
            }
        },
        toys: {
            name: "🧸 Игрушки",
            template: "Разработай концепцию {type} игрушки для {age_group} с описанием: '{idea}'. Материалы: {materials}. Включи описание: внешний вид, функционал, материалы и образовательную ценность.",
            params: {
                type: {
                    type: 'select',
                    label: 'Тип игрушки',
                    options: ['развивающей', 'интерактивной', 'конструктора', 'мягкой', 'коллекционной', 'настольной игры'],
                    default: 'развивающей'
                },
                materials: {
                    type: 'select',
                    label: 'Материалы',
                    options: ['пластик', 'дерево', 'текстиль', 'металл', 'комбинированные', 'экологичные'],
                    default: 'пластик'
                },
                age_group: {
                    type: 'select',
                    label: 'Возрастная группа',
                    options: ['0-1 год', '1-3 года', '3-6 лет', '6-12 лет', '12+ лет', 'взрослые'],
                    default: '6-12 лет'
                }
            }
        },
        ai: {
            name: "🤖 AI & G4F",
            template: "Создай продвинутый промпт для ИИ на тему '{idea}'. Тип ИИ: {ai_type},  Сложность: {complexity}. Включи: контекст, ограничения, формат ответа и примеры.",
            params: {
                ai_type: {
                    type: 'select',
                    label: 'Тип ИИ',
                    options: ['ChatGPT', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Claude', 'Gemini', 'DeepSeek', 'Dylan', 'Любой'],
                    default: 'ChatGPT'
                },
                complexity: {
                    type: 'select',
                    label: 'Сложность',
                    options: ['Базовый', 'Продвинутый', 'Экспертный', 'Исследовательский'],
                    default: 'Продвинутый'
                }
            }
        },
        characterai: {
            name: "🤖 Character AI",
            template: "Создай персонажа для Character AI с описанием '{idea}'. Характеристики: {personality} {appearance}, Тип имени: {name}, Тон общения: {tone}.",
            params: {
                name: {
                    type: 'select',
                    label: 'Тип имени',
                    options: ['Реалистичное', 'Фэнтези', 'Научно-фантастическое', 'Историческое', 'Аниме', 'Уникальное'],
                    default: 'Реалистичное'
                },
                personality: {
                    type: 'multiselect',
                    label: 'Черты характера',
                    options: ['Дружелюбный', 'Застенчивый', 'Энергичный', 'Серьезный', 'Юмористический', 'Загадочный', 'Мудрый', 'Наивный'],
                    default: 'Дружелюбный'
                },
                appearance: {
                    type: 'multiselect',
                    label: 'Внешность',
                    options: ['Человек', 'Животное', 'Робот', 'Мифическое существо', 'Инопланетянин', 'Аниме персонаж', 'Историческая личность'],
                    default: 'Человек'
                },
                tone: {
                    type: 'select',
                    label: 'Тон общения',
                    options: ['Формальный', 'Неформальный', 'Дружеский', 'Профессиональный', 'Поэтический', 'Драматический'],
                    default: 'Дружеский'
                }
            }
        },
        suno: {
            name: "🎵 Suno AI",
            template: "Создай текст песни для Suno AI по описанию: '{idea}'. Жанр: {genre}, Стиль: {style}, Структура: {structure}, Особенности: {tempo} темп, {instruments}.",
            params: {
                genre: {
                    type: 'select',
                    label: 'Музыкальный жанр',
                    options: ['Поп', 'Рок', 'Хип-хоп', 'Электроника', 'Джаз', 'Классика', 'Фолк', 'R&B', 'Кантри', 'Метал'],
                    default: 'Поп'
                },
                style: {
                    type: 'select',
                    label: 'Стиль исполнение',
                    options: ['Веселый', 'Грустный', 'Романтический', 'Эпический', 'Расслабляющий', 'Энергичный', 'Ностальгический'],
                    default: 'Веселый'
                },
                tempo: {
                    type: 'select',
                    label: 'Темп',
                    options: ['Медленный', 'Умеренный', 'Быстрый', 'Очень быстрый'],
                    default: 'Умеренный'
                },
                instruments: {
                    type: 'multiselect',
                    label: 'Инструменты',
                    options: ['Гитара', 'Фортепиано', 'Барабаны', 'Синтезатор', 'Скрипка', 'Бас', 'Духовые', 'Вокал'],
                    default: ['Гитара', 'Фортепиано']
                },
                structure: {
                    type: 'select',
                    label: 'Структура песни',
                    options: ['Куплет-Припев', 'Куплет-Припев-Мост', 'ABAB', 'Свободная форма', 'Поэтическая'],
                    default: 'Куплет-Припев'
                }
            }
        },
        setup: {
            name: "💻 Приложения",
            template: "Напиши полный код и структуру проекта для {type} на {lang} для {oc} с функционалом {hang}, и инструкцией по сборке для {setupper}. Подробное описание идеи: '{idea}'",
            params: {
                type: {
                    type: 'select',
                    label: 'Тип приложения',
                    options: ['Игра', 'Мессенджер', 'Утилита', 'Приложение для видеоконференций', 'Стриминговый сервис', 'Видеохостинг', 'Конструктор сайтов/приложений', 'Цифровая визитка', 'Учебное приложение', 'Другое'],
                    default: 'Игра'
                },
                lang: {
                    type: 'select',
                    label: 'Язык программирования',
                    options: ['C#', 'C++', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Rust', 'Go', 'Dart', 'Swift', 'Kotlin', 'Objective-C', 'PHP', 'Ruby', 'Scala', 'Perl', 'Lua', 'Haskell', 'Elixir', 'Clojure', 'F#', 'VB.NET', 'Delphi', 'Assembly', 'SQL', 'R', 'MATLAB', 'Bash', 'PowerShell', 'Groovy', 'Julia', 'Fortran', 'COBOL', 'Lisp', 'Prolog', 'Ada', 'Scheme', 'Verilog', 'VHDL'],
                    default: 'Python'
                },
                hang: {
                    type: 'multiselect',
                    label: 'Особенности',
                    options: ['Смена темы', 'Сохранение чего-то в собственный формат файла (пример: название.тип_файла)', 'Автозагрузка', 'Горячие клавиши', 'Ассоциации файлов', 'Уведомления', 'Системные службы', 'Разрешения доступа', 'Иконка приложения', 'Экраны загрузки', 'Фоновые режимы', 'Меню', 'Хранилище данных'],
                    default: 'Умеренный'
                },
                setupper: {
                    type: 'select',
                    label: 'Установщики',
                    options: ['Inno Setup', 'WiX Toolset', 'NSIS', 'Advanced Installer', 'InstallShield', 'MSIX', 'DMG', 'PKG', 'Mac App Store', 'Homebrew Cask', 'APT', 'RPM', 'Pacman', 'Snap', 'Flatpak', 'AppImage', 'Make install', 'APK', 'AAB', 'Google Play', 'F-Droid', 'Side loading', 'TestFlight', 'Enterprise distribution', 'Ad-hoc', 'SFX архив', 'Другой'],
                    default: 'Inno Setup'
                },
                oc: {
                    type: 'select',
                    label: 'Система',
                    options: ['Windows', 'Linux', 'Android', 'IOS', 'MacOS', 'Другое'],
                    default: 'Windows'
                }
            }
        },
        school: {
            name: "📚 Учёба и школа",
            template: "Помоги с заданием по предмету {subj}, Тип задания: {task}, Учусь в {class}. Подробности по заданию: '{idea}'.",
            params: {
                subj: {
                    type: 'select',
                    label: 'Предмет',
                    options: ['Математика', 'Русский', 'Литература', 'Информатика', 'География', 'Биология', 'Физика', 'История', 'Химия', 'Другое'],
                    default: 'Математика'
                },
                task: {
                    type: 'select',
                    label: 'Задание',
                    options: ['Задача', 'Чертёж', 'Сочинение', 'Изложение', 'Код', 'Сочинение-рассуждение', 'Другое'],
                    default: 'Задача'
                },
                class: {
                    type: 'select',
                    label: 'Класс',
                    options: ['1-4 класс', '5-8 класс', '9-11 класс', 'Колледж', 'Университет', '1 курс', '2 курс', '3 курс', 'Другой'],
                    default: '5-8 класс'
                }
            }
        },
        youtube: {
            name: "📺 YouTube",
            template: "Создай контент для YouTube канала на тему '{idea}'. Формат контента: {content_type}, Целевая аудитория: {audience}, Частота выпуска: {frequency}, Превью: {thumbnail_style}, Монетизация контента: {monetization}",
            params: {
                content_type: {
                    type: 'select',
                    label: 'Тип контента',
                    options: ['Обзоры', 'Образовательный', 'Развлекательный', 'Влоги', 'Гейминг', 'Кулинария', 'Музыка', 'Новости', 'Спорт'],
                    default: 'Развлекательный'
                },
                audience: {
                    type: 'select',
                    label: 'Целевая аудитория',
                    options: ['Дети', 'Подростки', 'Взрослые', 'Семейная', 'Профессиональная', 'Нишевая'],
                    default: 'Взрослые'
                },
                frequency: {
                    type: 'select',
                    label: 'Частота выпуска',
                    options: ['Ежедневно', '2-3 раза в неделю', 'Еженедельно', 'Раз в две недели', 'Ежемесячно'],
                    default: 'Еженедельно'
                },
                thumbnail_style: {
                    type: 'select',
                    label: 'Стиль превью',
                    options: ['Яркий и контрастный', 'Минималистичный', 'Текстовый', 'Эмоциональный', 'Загадочный', 'Профессиональный'],
                    default: 'Яркий и контрастный'
                },
                monetization: {
                    type: 'select',
                    label: 'Монетизация',
                    options: ['Реклама', 'Спонсорство', 'Краудфандинг', 'Мерч', 'Платная подписка', 'Бесплатный контент', 'Нет', 'Другой'],
                    default: 'Реклама'
                }
            }
        }
    };
    
    // Модальное окно кастомизации
    let selectedType = 'recipes';
    const modal = document.createElement('div');
    modal.className = 'customization-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Кастомизация промпта</h3>
                <button class="modal-close">&times;</button>
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
                    <button id="copy-prompt" class="btn btn-secondary">Копировать промпт</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Функция отображения технических параметров
    function renderTechnicalParams(type) {
        const container = document.getElementById('technical-params');
        const params = promptTemplates[type]?.params || {};
        
        let html = '';
        
        html += `<h4 style="margin-bottom: 1.5rem; color: var(--accent-color);">${promptTemplates[type]?.name || type}</h4>`;
        
        for (const [key, param] of Object.entries(params)) {
            html += `<div class="param-group">`;
            html += `<label>${param.label}</label>`;
            
            if (param.type === 'select') {
                html += `<select id="param-${key}" class="tech-param">`;
                param.options.forEach(option => {
                    const selected = option === param.default ? 'selected' : '';
                    html += `<option value="${option}" ${selected}>${option}</option>`;
                });
                html += `</select>`;
            }
            else if (param.type === 'multiselect') {
                html += `<div class="multi-select" id="param-${key}">`;
                const defaultValues = Array.isArray(param.default) ? param.default : [param.default];
                param.options.forEach(option => {
                    const checked = defaultValues.includes(option) ? 'checked' : '';
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
        
        container.innerHTML = html || '<p>Для этого типа промпта не требуется дополнительных параметров.</p>';
    }
    
    // Обработчик выбора типа промпта
    typeCards.forEach(card => {
        card.addEventListener('click', function() {
            selectedType = this.getAttribute('data-type');
            
            const modalTitle = modal.querySelector('.modal-title');
            modalTitle.textContent = `Кастомизация: ${promptTemplates[selectedType]?.name || selectedType}`;
            
            renderTechnicalParams(selectedType);
            
            const form = modal.querySelector('#prompt-form');
            form.reset();
            modal.querySelector('#final-prompt').textContent = '';
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Закрытие модального окна
    modal.querySelector('.modal-close').addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Генерация промпта
    const promptForm = modal.querySelector('#prompt-form');
    const customInput = modal.querySelector('#custom-input');
    const toneSelect = modal.querySelector('#tone-select');
    const finalPrompt = modal.querySelector('#final-prompt');
    const copyButton = modal.querySelector('#copy-prompt');
    
    promptForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const customText = customInput.value;
        const tone = toneSelect.value;
        
        if (!customText) {
            alert('Пожалуйста, опишите вашу идею');
            return;
        }
        
        if (!promptTemplates[selectedType]) {
            alert('Шаблон для этого типа промпта еще не готов');
            return;
        }
        
        const params = {};
        for (const [key, param] of Object.entries(promptTemplates[selectedType].params)) {
            if (param.type === 'select') {
                const selectElement = modal.querySelector(`#param-${key}`);
                if (selectElement) {
                    params[key] = selectElement.value;
                }
            }
            else if (param.type === 'multiselect') {
                const container = modal.querySelector(`#param-${key}`);
                if (container) {
                    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
                    params[key] = Array.from(checkboxes).map(cb => cb.value).join(', ');
                }
            }
        }
        
        let tonePrefix = '';
        switch(tone) {
            case 'professional': tonePrefix = 'Используй профессиональный технический язык. '; break;
            case 'friendly': tonePrefix = 'Будь дружелюбным и приветливым. '; break;
            case 'creative': tonePrefix = 'Прояви креативность и оригинальность. '; break;
            case 'technical': tonePrefix = 'Сфокусируйся на технических деталях. '; break;
            case 'detailed': tonePrefix = 'Дай максимально детализированный ответ. '; break;
        }
        
        let finalPromptText = promptTemplates[selectedType].template;
        finalPromptText = finalPromptText.replace('{idea}', customText);
        
        for (const [key, value] of Object.entries(params)) {
            finalPromptText = finalPromptText.replace(`{${key}}`, value);
        }
        
        finalPromptText = finalPromptText.replace(/\{[^}]+\}/g, '');
        finalPromptText = tonePrefix + finalPromptText;
        // Добавляем водяной знак
        finalPromptText += '\n\nTAIPrompts';
        finalPrompt.textContent = finalPromptText;
        
        finalPrompt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    
    copyButton.addEventListener('click', function() {
        if (!finalPrompt.textContent) {
            alert('Сначала сгенерируйте промпт');
            return;
        }
        
        navigator.clipboard.writeText(finalPrompt.textContent)
            .then(() => {
                const originalText = this.textContent;
                this.textContent = 'Скопировано!';
                this.classList.add('btn-primary');
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.classList.remove('btn-primary');
                }, 2000);
            })
            .catch(err => {
                console.error('Ошибка копирования: ', err);
                alert('Не удалось скопировать текст');
            });
    });
    
    // Галерея
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeLightbox = document.querySelector('.close-lightbox');
    
    if (galleryItems.length > 0 && lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const imgSrc = this.querySelector('img').getAttribute('data-full');
                const caption = this.querySelector('h4').textContent;
                
                lightboxImg.setAttribute('src', imgSrc);
                lightboxCaption.textContent = caption;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        
        closeLightbox.addEventListener('click', function() {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
        
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Анимации
    const animatedElements = document.querySelectorAll('.card, .section-title, .type-card, .gallery-item, .possibility-card');
    
    function checkScroll() {
        animatedElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('fade-in');
            }
        });
    }
    
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('load', checkScroll);
    
    // Инициализация анимаций
    document.querySelectorAll('.type-card').forEach((card, index) => {
        card.classList.add(`delay-${index % 3}`);
    });
    
    checkScroll();
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    console.log('✅ Генератор инициализирован');
})();

// Анимации для всех страниц
const animatedElements = document.querySelectorAll('.card, .section-title, .type-card, .gallery-item, .possibility-card');

function checkScroll() {
    animatedElements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.classList.add('fade-in');
        }
    });
}

window.addEventListener('scroll', checkScroll);
window.addEventListener('load', checkScroll);
