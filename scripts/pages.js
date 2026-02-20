// ===== Логика для отдельных страниц: FAQ, Index, Generator-page =====

window.TAIPrompts = window.TAIPrompts || {};
TAIPrompts.pages = {};

// ===== FAQ СТРАНИЦА =====
TAIPrompts.pages.initFaq = function() {
  // Проверяем, что мы на странице FAQ
  if (!document.querySelector('.faq-page')) return;
  
  const faqItems = document.querySelectorAll('.faq-item');
  const searchInput = document.getElementById('faqSearch');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const faqContainer = document.getElementById('faqContainer');
  const notFoundMessage = document.getElementById('faqNotFound');
  
  let activeCategory = 'all';
  let searchQuery = '';

  // Открытие/закрытие вопросов
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const toggle = item.querySelector('.faq-toggle');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-toggle').textContent = '+';
      });
      
      if (!isActive) {
        item.classList.add('active');
        toggle.textContent = '−';
        
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

  function filterFAQ() {
    let visibleItems = 0;
    
    faqItems.forEach(item => {
      const category = item.dataset.category;
      const question = item.querySelector('h3').textContent.toLowerCase();
      const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
      
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
    
    if (visibleItems === 0) {
      notFoundMessage.style.display = 'block';
      faqContainer.style.display = 'none';
    } else {
      notFoundMessage.style.display = 'none';
      faqContainer.style.display = 'block';
      
      if (searchQuery) {
        const firstVisible = document.querySelector('.faq-item[style="display: block"]');
        if (firstVisible && !firstVisible.classList.contains('active')) {
          faqItems.forEach(i => i.classList.remove('active'));
          firstVisible.classList.add('active');
          firstVisible.querySelector('.faq-toggle').textContent = '−';
        }
      }
    }
  }
  
  // Открываем первый вопрос по умолчанию
  if (faqItems.length > 0) {
    faqItems[0].classList.add('active');
    faqItems[0].querySelector('.faq-toggle').textContent = '−';
  }
  
  // Добавляем анимацию появления
  setTimeout(() => {
    faqItems.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.05}s`;
      item.classList.add('animated');
    });
  }, 300);
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
    const btnIcon = button.querySelector('.btn-icon');
    
    if (isShowingAll) {
      btnText.textContent = 'Скрыть';
      button.classList.add('show-all');
      button.classList.remove('pulse');
    } else {
      btnText.textContent = 'Показать всё';
      button.classList.remove('show-all');
      setTimeout(() => button.classList.add('pulse'), 500);
    }
    
    if (isShowingAll) {
      setTimeout(() => {
        button.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 100);
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
    items.forEach(item => item.classList.remove('active'));
    items[index].classList.add('active');
    items[index].querySelector('.faq-toggle').textContent = '−';
    items[index].scrollIntoView({ behavior: 'smooth' });
  }
};
