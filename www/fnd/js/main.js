Fancybox.bind("[data-fancybox]", {
  autoFocus: false,
  placeFocusBack: false,
  iframe: {
    preload: false,
  },
  animated: true,
  showClass: "fancybox-fadeIn",
  hideClass: "fancybox-fadeOut"
});

document.addEventListener("DOMContentLoaded", function () {
  const otziviTable = document.querySelector(".otzivi__table");
  if (otziviTable) {
    const items = otziviTable.querySelectorAll(".otz");
    const dotsContainer = document.querySelector(".otz__palochki");
    const visibleSlides = 2;
    let currentIndex = 0;

    if (dotsContainer && items.length > 0) {
      const totalDots = Math.ceil(items.length / visibleSlides);
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (i === 0) dot.classList.add("active");
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
      }
    }

    const dots = document.querySelectorAll(".dot");

    function showSlides(startIndex) {
      items.forEach(item => {
        item.classList.remove("active");
        item.style.display = "none";
      });

      for (let i = 0; i < visibleSlides; i++) {
        const slideIndex = (startIndex + i) % items.length;
        if (items[slideIndex]) {
          items[slideIndex].style.display = "block";
          items[slideIndex].classList.add("active");
        }
      }

      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === Math.floor(startIndex / visibleSlides));
      });
    }

    showSlides(currentIndex);

    // Обработчики стрелок
    const prevArrow = document.querySelector(".otx__whitearr");
    const nextArrow = document.querySelector(".otx__blackarr");

    if (prevArrow) {
      prevArrow.addEventListener("click", () => {
        currentIndex = (currentIndex - visibleSlides + items.length) % items.length;
        showSlides(currentIndex);
      });
    }

    if (nextArrow) {
      nextArrow.addEventListener("click", () => {
        currentIndex = (currentIndex + visibleSlides) % items.length;
        showSlides(currentIndex);
      });
    }

    // Обработчики точек
    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const dotIndex = parseInt(dot.dataset.index);
        currentIndex = dotIndex * visibleSlides;
        showSlides(currentIndex);
      });
    });
  }

  //для вопросов
  const askButtons = document.querySelectorAll('.asks__but');
  askButtons.forEach(button => {
    button.addEventListener('click', function() {
      const questItem = this.closest('.asks__quest');
      const answer = questItem.querySelector('.asks__answer');
      const icon = this.querySelector('.icon');
      
      if (answer) {
        answer.classList.toggle('active');
        if (icon) {
          icon.textContent = answer.classList.contains('active') ? '--' : '+';
        }
      }
    });
  });

  // Фильтрация элементов
  const filterButtons = document.querySelectorAll('.filter');
  const filterItems = document.querySelectorAll('.seventh__item');
  const table = document.querySelector('.seventh__table');

  if (filterButtons.length > 0 && filterItems.length > 0) {
    function filterItemsByCategory(category) {
      let delay = 0;
      
      filterItems.forEach((item, index) => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || itemCategory === category) {
          setTimeout(() => {
            item.classList.remove('hidden');
            item.style.opacity = '0';
            
            setTimeout(() => {
              item.style.opacity = '1';
            }, 50);
          }, delay);
          
          delay += 50;
        } else {
          item.style.opacity = '0';
          setTimeout(() => {
            item.classList.add('hidden');
          }, 150);
        }
      });

      reorganizeGrid();
    }
    
    function reorganizeGrid() {
      if (table) {
        table.style.display = 'block';
        setTimeout(() => {
          table.style.display = 'grid';
        }, 50);
      }
    }
    
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        filterButtons.forEach(btn => {
          btn.classList.remove('active');
          btn.style.color = '#939191';
        });
        this.classList.add('active');
        this.style.color = '#000';
        
        const filterValue = this.getAttribute('data-filter');
        filterItemsByCategory(filterValue);
      });
    });
    
    // Настройка анимации и активной кнопки
    filterItems.forEach(item => {
      item.style.transition = 'all 0.4s ease';
    });
    
    const activeButton = document.querySelector('.filter.active');
    if (activeButton) {
      activeButton.style.color = '#000';
    }
  }
});