// ===== UI-компоненты: анимации, лайтбокс, поиск по карточкам =====

window.TAIPrompts = window.TAIPrompts || {};
TAIPrompts.ui = {};

// ===== АНИМАЦИИ =====
TAIPrompts.ui.initAnimations = function() {
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

  document.querySelectorAll(".type-card").forEach((card, index) => {
    card.classList.add(`delay-${index % 3}`);
  });

  checkScroll();
};

// ===== ЛАЙТБОКС =====
TAIPrompts.ui.initLightbox = function() {
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
};

// ===== ПОИСК ПО КАРТОЧКАМ (на странице generator.html) =====
TAIPrompts.ui.initSearch = function() {
  const searchInput = document.getElementById('searchInput');
  const searchStats = document.getElementById('searchStats');
  const foundCount = document.getElementById('foundCount');
  const totalCount = document.getElementById('totalCount');
  const typeCards = document.querySelectorAll('.type-card');
  
  if (!searchInput || typeCards.length === 0) return;
  
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
      const title = card.querySelector('h3')?.textContent || '';
      const description = card.querySelector('p')?.textContent || '';
      const vibeDescription = card.querySelector('.vibe-description')?.textContent || '';
      const tags = Array.from(card.querySelectorAll('.vibe-tag'))
        .map(tag => tag.textContent)
        .join(' ');
      
      const allText = `${title} ${description} ${vibeDescription} ${tags}`.toLowerCase();
      
      const isVisible = searchTerm === '' || allText.includes(searchTerm);
      
      card.style.display = isVisible ? '' : 'none';
      card.style.opacity = isVisible ? '1' : '0';
      card.style.transform = isVisible ? '' : 'scale(0.95)';
      card.style.transition = 'all 0.3s ease';
      
      if (isVisible) {
        visibleCount++;
        
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
    
    foundCount.textContent = visibleCount;
    searchStats.classList.toggle('visible', searchTerm !== '');
    
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
  
  searchInput.addEventListener('input', (e) => {
    searchCards(e.target.value);
  });
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchCards('');
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
};
