// ===== Дебаг-функции для проверки работы сайта =====

window.TAIPrompts = window.TAIPrompts || {};
TAIPrompts.debug = {};

TAIPrompts.debug.run = function() {
  // Запускаем только в режиме разработки или при наличии параметра debug
  const urlParams = new URLSearchParams(window.location.search);
  const isDebug = urlParams.get('debug') === '1' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isDebug) return;
  
  console.log("=== TAIPrompts Debug Mode ===");
  console.log("Current page:", window.location.pathname);
  console.log("Screen size:", window.innerWidth, "x", window.innerHeight);
  console.log("User Agent:", navigator.userAgent);
  console.log("Cookies enabled:", navigator.cookieEnabled);
  
  // Проверка наличия всех необходимых файлов
  const files = [
    "index.html", 
    "generator.html", 
    "faq.html", 
    "components/header.html", 
    "components/footer.html"
  ];
  
  files.forEach((file) => {
    fetch(file)
      .then((response) => console.log(`${file}: ${response.ok ? "✅ OK" : "❌ Not found"}`))
      .catch((error) => console.log(`${file}: ❌ Error - ${error.message}`));
  });
  
  // Проверка наличия элементов на странице
  setTimeout(() => {
    console.log("=== DOM Elements Check ===");
    
    const checks = [
      { selector: "#site-header", name: "Header container" },
      { selector: "#site-footer", name: "Footer container" },
      { selector: ".nav-list", name: "Navigation" },
      { selector: ".burger", name: "Burger menu" },
      { selector: ".type-card", name: "Type cards" },
      { selector: ".faq-item", name: "FAQ items" },
      { selector: ".possibility-card", name: "Possibility cards" },
    ];
    
    checks.forEach(check => {
      const elements = document.querySelectorAll(check.selector);
      console.log(`${check.name}: ${elements.length > 0 ? `✅ Found (${elements.length})` : "❌ Not found"}`);
    });
    
    // Проверка наличия TAIPrompts объекта
    console.log("=== TAIPrompts Object ===");
    console.log("TAIPrompts exists:", !!window.TAIPrompts);
    if (window.TAIPrompts) {
      console.log("Modules loaded:", Object.keys(window.TAIPrompts));
    }
    
    console.log("=== Debug Complete ===");
  }, 1000);
};

// Функция для принудительного запуска дебага
TAIPrompts.debug.force = function() {
  const oldDebug = TAIPrompts.debug?.run;
  if (oldDebug) {
    console.clear();
    oldDebug();
  }
};

// Добавляем глобальную функцию для вызова дебага из консоли
window.debugTAIPrompts = function() {
  if (window.TAIPrompts?.debug?.force) {
    window.TAIPrompts.debug.force();
  } else {
    console.log("TAIPrompts debug not available yet");
  }
};
