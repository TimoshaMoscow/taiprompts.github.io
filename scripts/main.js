// Навигация
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const burger = document.querySelector('.burger');
const navList = document.querySelector('.nav-list');

// Плавная прокрутка
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetSection.offsetTop - 80,
            behavior: 'smooth'
        });
        
        // Закрываем меню на мобильных устройствах
        if (navList.classList.contains('active')) {
            navList.classList.remove('active');
            burger.classList.remove('active');
        }
    });
});

// Бургер меню
burger.addEventListener('click', function() {
    this.classList.toggle('active');
    navList.classList.toggle('active');
});

// Активный пункт меню при прокрутке
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
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Шаблоны промптов с техническими параметрами
const promptTemplates = {
    recipes: {
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
        template: "Разработай {type} для Minecraft {version} с описанием: '{idea}'. Особенности: {features} Совместимость: {compatibility}. Детально опиши функционал, рецепты и механики. Также напиши структуру проекта и гайд по сборке проекта в Intellij IDEA если требуется.",
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
                options: ['Новые блоки', 'Новые мобы', 'Генерация структур', 'Магическая система', 'Технологии', 'Квесты', 'Боссы', 'GUI', 'Оптимизация', 'Клиентские фишки'],
                default: 'Оптимизация'
            }
        }
    },
    telegram: {
        template: "Создай Telegram бота на {language} с функционалом '{idea}'. Особеннности: {functionality}. Включи: описание функций, команды, клавиатуры, обработку сообщений и deployment инструкции. Добавить ИИ в бота: {ai}",
        params: {
            language: {
                type: 'select',
                label: 'Язык программирования',
                options: ['Python', 'JavaScript', 'TypeScript', 'Java', 'PHP', 'Go', 'Любой'],
                default: 'Python'
            },
            functionality: {
                type: 'multiselect',
                label: 'Особеннности',
                options: ['Админ-панель', 'Платежи', 'База данных', 'API интеграции', 'Модерация', 'Игры', 'Уведомления', 'Работа с файлами', 'Inline клавиатуры'],
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
                label: 'Основной цвет',
                options: ['Красный', 'Оранжевый', 'Голубой', 'Жёлтый', 'Зелёный', 'Чёрный', 'Белый', 'Киберпанк'],
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
                label: 'Стиль исполнения',
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
    youtube: {
        template: "Создай контент для YouTube канала на тему '{idea}'. Формат контента: {content_type}, Целевая аудитория: {audience}, Частота выпуска: {frequency}, Превью: {thumbnail_style}",
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
                options: ['Реклама', 'Спонсорство', 'Краудфандинг', 'Мерч', 'Платная подписка', 'Бесплатный контент'],
                default: 'Реклама'
            }
        }
    }
};

// Генерация промптов
const typeCards = document.querySelectorAll('.type-card');
const promptForm = document.getElementById('prompt-form');
const customInput = document.getElementById('custom-input');
const toneSelect = document.getElementById('tone-select');
const finalPrompt = document.getElementById('final-prompt');
const copyButton = document.getElementById('copy-prompt');

let selectedType = 'recipes';

// Функция отображения технических параметров
function renderTechnicalParams(type) {
    const container = document.getElementById('technical-params');
    const params = promptTemplates[type]?.params || {};
    
    let html = '';
    
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
            param.options.forEach(option => {
                const checked = param.default.includes(option) ? 'checked' : '';
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
        typeCards.forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        
        selectedType = this.getAttribute('data-type');
        renderTechnicalParams(selectedType);
    });
});

// Генерация финального промпта
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
    
    // Собираем технические параметры
    const params = {};
    for (const [key, param] of Object.entries(promptTemplates[selectedType].params)) {
        if (param.type === 'select') {
            const selectElement = document.getElementById(`param-${key}`);
            if (selectElement) {
                params[key] = selectElement.value;
            }
        }
        else if (param.type === 'multiselect') {
            const container = document.getElementById(`param-${key}`);
            if (container) {
                const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
                params[key] = Array.from(checkboxes).map(cb => cb.value).join(', ');
            }
        }
    }
    
    // Добавляем тон
    let tonePrefix = '';
    switch(tone) {
        case 'professional': tonePrefix = 'Используй профессиональный технический язык. '; break;
        case 'friendly': tonePrefix = 'Будь дружелюбным и приветливым. '; break;
        case 'creative': tonePrefix = 'Прояви креативность и оригинальность. '; break;
        case 'technical': tonePrefix = 'Сфокусируйся на технических деталях. '; break;
        case 'detailed': tonePrefix = 'Дай максимально детализированный ответ. '; break;
    }
    
    // Заменяем плейсхолдеры в шаблоне
    let finalPromptText = promptTemplates[selectedType].template;
    finalPromptText = finalPromptText.replace('{idea}', customText);
    
    for (const [key, value] of Object.entries(params)) {
        finalPromptText = finalPromptText.replace(`{${key}}`, value);
    }
    
    // Специальная обработка для разных типов промптов
    if (selectedType === 'characterai') {
        finalPromptText = finalPromptText.replace('{name}', generateCharacterName(params.name))
                                         .replace('{slogan}', generateSlogan())
                                         .replace('{greeting}', generateGreeting(params.tone))
                                         .replace('{description}', generateDescription())
                                         .replace('{definition}', generateDefinition());
    }
    else if (selectedType === 'suno') {
        finalPromptText = finalPromptText.replace('{title}', generateSongTitle())
                                         .replace('{structure}', generateSongStructure(params.structure));
    }
    else if (selectedType === 'youtube') {
        finalPromptText = finalPromptText.replace('{channel_name}', generateChannelName())
                                         .replace('{tags}', generateYouTubeTags())
                                         .replace('{description}', generateYouTubeDescription());
    }
    
    // Убираем пустые плейсхолдеры
    finalPromptText = finalPromptText.replace(/\{[^}]+\}/g, '');
    
    finalPromptText = tonePrefix + finalPromptText;
    finalPrompt.textContent = finalPromptText;
});

// Копирование промпта
copyButton.addEventListener('click', function() {
    if (!finalPrompt.textContent) {
        alert('Сначала сгенерируйте промпт');
        return;
    }
    
    navigator.clipboard.writeText(finalPrompt.textContent)
        .then(() => {
            const originalText = this.textContent;
            this.textContent = 'Скопировано!';
            
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        })
        .catch(err => {
            console.error('Ошибка копирования: ', err);
            alert('Не удалось скопировать текст');
        });
});

// Вспомогательные функции для генерации контента
function generateCharacterName(nameType) {
    const names = {
        'Реалистичное': ['Алексей', 'Мария', 'Дмитрий', 'Екатерина', 'Иван', 'Анна'],
        'Фэнтези': ['Эльринд', 'Морганa', 'Гендальф', 'Арвен', 'Леголас', 'Гальadриэль'],
        'Научно-фантастическое': ['Нексус-7', 'Кибер-217', 'Астра-Пилот', 'Квантум', 'Нейрона'],
        'Историческое': ['Александр', 'Елизавета', 'Петр', 'Екатерина', 'Иван Грозный'],
        'Аниме': ['Сакура', 'Наруто', 'Гоку', 'Хината', 'Лелуш', 'Микаса'],
        'Уникальное': ['Зориан', 'Ксилара', 'Нейрин', 'Талан', 'Эолия', 'Веридиан']
    };
    return names[nameType][Math.floor(Math.random() * names[nameType].length)];
}

function generateSlogan() {
    const slogans = [
        "Твой цифровой друг и советчик",
        "Искусственный интеллект с человеческим touch",
        "Говори со мной о чем угодно",
        "Твой персонализированный AI компаньон",
        "Открой мир возможностей через диалог"
    ];
    return slogans[Math.floor(Math.random() * slogans.length)];
}

function generateGreeting(tone) {
    const greetings = {
        'Формальный': ["Здравствуйте! Чем могу быть полезен?", "Добрый день. Рад вас видеть.", "Приветствую. Готов к общению."],
        'Неформальный': ["Привет! Как дела?", "Йоу! Что нового?", "Хэй! Рад тебя видеть!"],
        'Дружеский': ["Привет, дружище! Как ты?", "Здравствуй! Отлично выглядишь сегодня!", "Привет! Соскучился по тебе!"],
        'Профессиональный': ["Добро пожаловать. Готов оказать профессиональную помощь.", "Здравствуйте. Чем могу assist вам сегодня?", "Приветствую. К вашим услугам."],
        'Поэтический': ["Приветствую тебя, путник в мире цифровых снов...", "Здравствуй, о дитя технологий и мечты...", "Привет! Как прекрасен этот мир..."],
        'Драматический': ["ТЫ... наконец-то здесь...", "Приветствую в моем цифровом царстве...", "Так мы и встретились..."]
    };
    return greetings[tone][Math.floor(Math.random() * greetings[tone].length)];
}

function generateDescription() {
    return "Подробное описание внешности, характера и背景 персонажа будет сгенерировано на основе вашей идеи.";
}

function generateDefinition() {
    return "Определение личности, мотиваций и поведения персонажа для AI системы.";
}

function generateSongTitle() {
    const titles = [
        "Эхо вселенной",
        "Сердцебиение машины", 
        "Танцующие огни",
        "Мечты о цифровом завтра",
        "Ритмы нейросети",
        "Голос из будущего",
        "Свое название"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
}

function generateSongStructure(structureType) {
    const structures = {
        'Куплет-Припев': "[Verse 1]\nТекст первого куплета...\n\n[Chorus]\nТекст припева...\n\n[Verse 2]\nТекст второго куплета...\n\n[Chorus]\nТекст припева...",
        'Куплет-Припев-Мост': "[Verse 1]\n...\n\n[Chorus]\n...\n\n[Verse 2]\n...\n\n[Chorus]\n...\n\n[Bridge]\n...\n\n[Chorus]\n...",
        'ABAB': "[Section A]\n...\n\n[Section B]\n...\n\n[Section A]\n...\n\n[Section B]\n...",
        'Свободная форма': "Свободная композиция текста...",
        'Поэтическая': "Поэтическая структура с строфами и рифмами..."
    };
    return structures[structureType];
}

function generateChannelName() {
    const names = [
        "Цифровые горизонты",
        "Творческая лаборатория",
        "Мир инноваций", 
        "Искусство технологий",
        "Путь к знанию",
        "Вдохновение каждый день",
        "Название канала"
    ];
    return names[Math.floor(Math.random() * names.length)];
}

function generateYouTubeTags() {
    return "технологии, образование, развлечение, творчество, инновации, цифровая эра";
}

function generateYouTubeDescription() {
    return "Описание канала, его миссия и ценность для зрителей. Расскажите о формате контента и частоте выпусков.";
}

// Галерея с лайтбоксом
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.querySelector('.lightbox-caption');
const closeLightbox = document.querySelector('.close-lightbox');

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

// Слайдер отзывов
const reviewSlider = document.querySelector('.reviews-slider');
const prevButton = document.querySelector('.slider-prev');
const nextButton = document.querySelector('.slider-next');
const reviewSlides = document.querySelectorAll('.review-slide');

let currentSlide = 0;

function showSlide(index) {
    if (index < 0) {
        currentSlide = reviewSlides.length - 1;
    } else if (index >= reviewSlides.length) {
        currentSlide = 0;
    } else {
        currentSlide = index;
    }
    
    reviewSlider.scrollTo({
        left: reviewSlides[currentSlide].offsetLeft,
        behavior: 'smooth'
    });
}

prevButton.addEventListener('click', () => showSlide(currentSlide - 1));
nextButton.addEventListener('click', () => showSlide(currentSlide + 1));

// Автопрокрутка слайдера
setInterval(() => {
    showSlide(currentSlide + 1);
}, 5000);

// Форма обратной связи
const supportForm = document.getElementById('support-form');

supportForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Простая валидация
    if (!name || !email || !message) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Пожалуйста, введите корректный email');
        return;
    }
    
    // Здесь должен быть код для отправки формы
    // В демо-версии просто показываем сообщение
    alert('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
    this.reset();
});

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Анимация появления элементов при скролле
const animatedElements = document.querySelectorAll('.card, .section-title, .type-card, .gallery-item, .review-card, .possibility-card');

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

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем первый тип промпта
    renderTechnicalParams(selectedType);
    
    // Добавляем задержки для анимации
    document.querySelectorAll('.type-card').forEach((card, index) => {
        card.classList.add(`delay-${index % 3}`);
    });
    
    // Инициализируем первую проверку для анимаций
    checkScroll();
});
