// ===== Логика для отдельных страниц: FAQ, Index =====

window.TAIPrompts = window.TAIPrompts || {};
TAIPrompts.pages = {};

// ===== FAQ СТРАНИЦА =====
TAIPrompts.pages.initFaq = function() {
  // Проверяем, что мы на странице FAQ
  const faqPage = document.querySelector('.faq-page');
  if (!faqPage) return;
  
  console.log("Инициализация FAQ...");
  
  const faqItems = document.querySelectorAll('.faq-item');
  const searchInput = document.getElementById('faqSearch');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const faqContainer = document.getElementById('faqContainer');
  const notFoundMessage = document.getElementById('faqNotFound');
  
  if (!faqItems.length) {
    console.log("FAQ элементы не найдены");
    return;
  }
  
  let activeCategory = 'all';
  let searchQuery = '';

  // Открытие/закрытие вопросов
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const toggle = item.querySelector('.faq-toggle');
    
    if (!question || !toggle) return;
    
    question.addEventListener('click', (e) => {
      e.preventDefault();
      
      const isActive = item.classList.contains('active');
      
      // Закрываем все вопросы
      faqItems.forEach(i => {
        i.classList.remove('active');
        const t = i.querySelector('.faq-toggle');
        if (t) t.textContent = '+';
      });
      
      // Если вопрос не был активен, открываем его
      if (!isActive) {
        item.classList.add('active');
        toggle.textContent = '−';
        
        // Плавная прокрутка к открытому вопросу
        setTimeout(() => {
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
  });

  // Поиск по FAQ
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      searchQuery = this.value.toLowerCase().trim();
      filterFAQ();
    });
  }

  // Фильтрация по категориям
  if (categoryButtons.length) {
    categoryButtons.forEach(button => {
      button.addEventListener('click', function() {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        activeCategory = this.dataset.category;
        filterFAQ();
        
        if (searchInput) {
          searchInput.value = '';
          searchQuery = '';
        }
      });
    });
  }

  function filterFAQ() {
    let visibleItems = 0;
    
    faqItems.forEach(item => {
      const category = item.dataset.category;
      const questionEl = item.querySelector('h3');
      const answerEl = item.querySelector('.faq-answer');
      
      if (!questionEl || !answerEl) return;
      
      const question = questionEl.textContent.toLowerCase();
      const answer = answerEl.textContent.toLowerCase();
      
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = !searchQuery || 
                          question.includes(searchQuery) || 
                          answer.includes(searchQuery);
      
      if (matchesCategory && matchesSearch) {
        item.style.display = 'block';
        visibleItems++;
      } else {
        item.style.display = 'none';
      }
    });
    
    // Показываем/скрываем сообщение "не найдено"
    if (visibleItems === 0) {
      if (notFoundMessage) notFoundMessage.style.display = 'block';
      if (faqContainer) faqContainer.style.display = 'none';
    } else {
      if (notFoundMessage) notFoundMessage.style.display = 'none';
      if (faqContainer) faqContainer.style.display = 'block';
      
      // Автоматически открываем первый найденный вопрос при поиске
      if (searchQuery) {
        const firstVisible = document.querySelector('.faq-item[style="display: block"]');
        if (firstVisible && !firstVisible.classList.contains('active')) {
          faqItems.forEach(i => i.classList.remove('active'));
          firstVisible.classList.add('active');
          const t = firstVisible.querySelector('.faq-toggle');
          if (t) t.textContent = '−';
        }
      }
    }
  }
  
  // Открываем первый вопрос по умолчанию через небольшую задержку
  setTimeout(() => {
    if (faqItems.length > 0 && !faqItems[0].classList.contains('active')) {
      faqItems[0].classList.add('active');
      const toggle = faqItems[0].querySelector('.faq-toggle');
      if (toggle) toggle.textContent = '−';
    }
    
    // Добавляем аккордеону анимацию появления
    faqItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.05}s`;
      item.classList.add('animated');
    });
  }, 300);
  
  console.log("FAQ инициализирован, элементов:", faqItems.length);
};

// ===== ГЛАВНАЯ СТРАНИЦА (index.html) =====
TAIPrompts.pages.initIndex = function() {
  // Проверяем, что мы на главной странице
  if (!document.querySelector('.hero')) return;
  
  const grid = document.getElementById('possibilitiesGrid');
  const button = document.getElementById('showAllBtn');
  
  if (!grid || !button) return;
  
  const hiddenCards = grid.querySelectorAll('.possibility-card.hidden-card');
  if (hiddenCards.length === 0) {
    button.style.display = 'none';
    return;
  }
  
  button.classList.add('pulse');
  
  button.addEventListener('click', function() {
    const isShowingAll = grid.classList.toggle('show-all');
    const btnText = button.querySelector('.btn-text');
    
    if (btnText) {
      btnText.textContent = isShowingAll ? 'Скрыть' : 'Показать всё';
    }
    
    button.classList.toggle('show-all', isShowingAll);
    
    if (isShowingAll) {
      button.classList.remove('pulse');
      setTimeout(() => {
        button.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 100);
    } else {
      setTimeout(() => button.classList.add('pulse'), 500);
    }
  });
  
  setTimeout(() => {
    button.style.opacity = '1';
    button.style.transform = 'translateY(0)';
  }, 1000);
};

// ===== ФУНКЦИЯ ДЛЯ ОТКРЫТИЯ ВОПРОСОВ FAQ ПО ИНДЕКСУ =====
TAIPrompts.pages.openFAQQuestion = function(index) {
  const items = document.querySelectorAll('.faq-item');
  if (items[index]) {
    items.forEach(item => {
      item.classList.remove('active');
      const t = item.querySelector('.faq-toggle');
      if (t) t.textContent = '+';
    });
    
    items[index].classList.add('active');
    const toggle = items[index].querySelector('.faq-toggle');
    if (toggle) toggle.textContent = '−';
    
    items[index].scrollIntoView({ behavior: 'smooth' });
  }
};
