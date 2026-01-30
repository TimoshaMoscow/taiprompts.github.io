    document.addEventListener('DOMContentLoaded', function() {
      const billingOptions = document.querySelectorAll('.billing-option');
      const billingNote = document.getElementById('billingNote');
      
      billingOptions.forEach(option => {
        option.addEventListener('click', function() {
          const period = this.dataset.period;
          
          // Убираем активный класс у всех
          billingOptions.forEach(opt => opt.classList.remove('active'));
          // Добавляем активный класс текущему
          this.classList.add('active');
          
          // Показываем/скрываем цены
          document.querySelectorAll('.pricing-price.monthly').forEach(el => {
            el.style.display = period === 'monthly' ? 'block' : 'none';
          });
          
          document.querySelectorAll('.pricing-price.yearly').forEach(el => {
            el.style.display = period === 'yearly' ? 'block' : 'none';
          });
          
          // Обновляем заметку
          if (period === 'yearly') {
            billingNote.textContent = 'Оплачивайте раз в год, экономите до 15%';
          } else {
            billingNote.textContent = 'Оплачивайте ежемесячно, отмена в любой момент';
          }
        });
      });
    });
