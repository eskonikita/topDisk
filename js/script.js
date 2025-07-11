ymaps.ready(function () {
  // Проверка: если экран меньше 768px, ставим другой центр
  const isMobile = window.innerWidth < 768;

  const map = new ymaps.Map("yandex-map", {
    center: isMobile
      ? [55.05, 82.884686]
      : [55.038150, 82.87],
    zoom: 14,
    controls: []
  });
  map.container.getElement().blur();
  const placemark = new ymaps.Placemark(
    [55.038150, 82.884686], // координаты пина
    {
      hintContent: 'г. Новосибирск, ул. Саратовская, 14'
    },
    {
      preset: 'islands#redHomeIcon'
    }
  );

  map.geoObjects.add(placemark);
  map.controls.remove("mapTools")
    .remove("typeSelector")
    .remove("searchControl")
    .remove("trafficControl")
    .remove("miniMap")
    .remove("scaleLine")
    .remove("routeEditor")
    .remove("smallZoomControl");
  map.behaviors.disable('scrollZoom');
  map.behaviors.disable('drag');
});

ymaps.ready(function () {
  const mapcalc = new ymaps.Map("yandex-calc-map", {
    center: [53.346785, 83.776856], // Пример: Барнаул
    zoom: 10,
    controls: []
  });
  mapcalc.container.getElement().blur();
  const placemark = new ymaps.Placemark(
    [53.346785, 83.776856],
    {
      hintContent: 'г. Барнаул',
      balloonContent: 'г. Барнаул, центр'
    },
    { preset: 'islands#redHomeIcon' }
  );

});

const slidesCount = document.querySelectorAll('.swiper .swiper-slide').length;

const isDesktop = window.innerWidth >= 992;
const enableSlider = isDesktop && slidesCount > 4;

const driversSwiper = new Swiper('.swiper', {
  loop: enableSlider,
  slidesPerView: 1.1,
  spaceBetween: 10,
  navigation: {
    nextEl: '.swiper-button-next-drivers',
    prevEl: '.swiper-button-prev-drivers',
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
      spaceBetween: 40,
    },
    992: {
      slidesPerView: 4,
      spaceBetween: 40,
    },
  },
  on: {
    init: function () {
      // отключаем навигацию, если слайдов мало
      if (!enableSlider) {
        document.querySelector('.swiper-button-next-drivers')?.classList.add('hidden');
        document.querySelector('.swiper-button-prev-drivers')?.classList.add('hidden');
      }
    }
  }
});

/* === после полной загрузки разметки ==================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* FAQ‑аккордеон (одновременное раскрытие только одного пункта) */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.faq-item').forEach(el => {
        if (el !== item) el.classList.remove('active');
      });
      item.classList.toggle('active');
    });
  });

  /* табы «Классы автомобилей» */
  initTabs('.car-tabs__button', '.car-tabs__content');

  /* табы «Популярные направления» */
  initTabs('.routes__tab', '.routes__tab-content');

  /* запрет прокрутки <body> при открытом боковом меню
     (работает только на экранах < 768 px) */
  const sideCb = document.getElementById('side-checkbox');
  const htmlRoot = document.documentElement;

  sideCb.addEventListener('change', () => {
    if (window.innerWidth >= 768) return;
    const method = sideCb.checked ? 'add' : 'remove';
    document.body.classList[method]('no-scroll');
    htmlRoot.classList[method]('no-scroll'); // для iOS
  });

  /* кастомные селекты .c-select */
  document.querySelectorAll('.c-select').forEach(setupCustomSelect);

  /* дропдаун выбора города (синхронизируются между собой) */
  initCityDropdowns();
});

/* ----------------------------------------------------------------------- */
/* универсальная функция переключателя табов */
function initTabs(btnSelector, contentSelector) {
  const buttons = document.querySelectorAll(btnSelector);
  const contents = document.querySelectorAll(contentSelector);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      contents.forEach(c => c.classList.remove('is-visible'));
      document.getElementById(btn.dataset.target).classList.add('is-visible');
    });
  });
}

/* ----------------------------------------------------------------------- */
/* ============================================================
   ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: закрывает все .c-select.open кроме except
   ============================================================ */
function closeOtherSelects(except) {
  document.querySelectorAll('.c-select.open').forEach(sel => {
    if (sel === except) return;

    sel.classList.remove('open');

    /* сбрасываем поиск и фильтр, если они были */
    const search = sel.querySelector('.c-select__search');
    if (search) search.value = '';

    sel.querySelectorAll('.c-select__item').forEach(li => li.hidden = false);
  });
}

/* ============================================================
 ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: закрывает все .c-select.open кроме except
 ============================================================ */
function closeOtherSelects(except) {
  document.querySelectorAll('.c-select.open').forEach(sel => {
    if (sel === except) return;

    sel.classList.remove('open');

    /* сбрасываем поиск и фильтр, если они были */
    const search = sel.querySelector('.c-select__search');
    if (search) search.value = '';

    sel.querySelectorAll('.c-select__item').forEach(li => li.hidden = false);
  });
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ ОДНОГО СЕЛЕКТА
   ============================================================ */
function setupCustomSelect(select) {
  const trigger = select.querySelector('.c-select__trigger');
  const label = select.querySelector('.c-select__label');
  const list = select.querySelector('.c-select__list');
  const hidden = select.querySelector('input[type="hidden"]');
  const items = list.querySelectorAll('.c-select__item');

  // может отсутствовать
  const search = select.querySelector('.c-select__search');
  const hasSearch = !!search;

  const placeholder = select.dataset.placeholder || label.textContent;

  if (!trigger || !label || !list || !hidden) {
    console.warn('setupCustomSelect: пропущены элементы внутри', select);
    return;
  }

  /* ------------ открыть / закрыть ------------ */
  trigger.addEventListener('click', e => {
    e.stopPropagation();

    /* ⬇️ сначала закрываем все другие селекты */
    closeOtherSelects(select);

    /* затем переключаем текущий */
    select.classList.toggle('open');

    if (select.classList.contains('open') && hasSearch) {
      search.value = '';
      resetFilter();
      setTimeout(() => search.focus(), 0);   // фокус в поиске
    }
  });

  /* ------------ выбор пункта ------------ */
  list.addEventListener('click', e => {
    const item = e.target.closest('.c-select__item');
    if (!item) return;

    label.textContent = item.dataset.value;
    hidden.value = item.dataset.value;
    closeSelect();                            // закрываем после выбора
  });

  /* ------------ поиск (если есть) ------------ */
  if (hasSearch) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      if (q.length < 2) return resetFilter();

      items.forEach(li => {
        li.hidden = !li.dataset.value.toLowerCase().includes(q);
      });
    });
  }

  /* ------------ клик вне селекта ------------ */
  document.addEventListener('click', e => {
    if (!select.contains(e.target)) closeSelect(true);
  });

  /* ------------ утилиты ------------ */
  function resetFilter() { items.forEach(li => li.hidden = false); }

  function closeSelect(resetLabelIfEmpty = false) {
    select.classList.remove('open');
    if (hasSearch) {
      search.value = '';
      resetFilter();
    }
    if (resetLabelIfEmpty && !hidden.value) {
      label.textContent = placeholder;
    }
  }
}

/* ============================================================
   ИНИЦИАЛИЗАЦИЯ ВСЕХ СЕЛЕКТОВ ПОСЛЕ ЗАГРУЗКИ DOM
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.c-select').forEach(setupCustomSelect);
});


/* ============================================================
   ИНИЦИАЛИЗАЦИЯ ВСЕХ СЕЛЕКТОВ ПОСЛЕ ЗАГРУЗКИ DOM
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.c-select').forEach(setupCustomSelect);
});

/* инициируем после загрузки DOM */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.c-select').forEach(setupCustomSelect);
});

/* инициализируем все селекты на странице */
document.querySelectorAll('.c-select').forEach(setupCustomSelect);


document.addEventListener('click', () => {
  document.querySelectorAll('.c-select.open')
    .forEach(s => s.classList.remove('open'));
});

/* ----------------------------------------------------------------------- */
/* выпадающие списки выбора города (.city-dropdown)                        */
function initCityDropdowns() {

  /* список городов */
  const CITIES = [
    { code: 'nsk', title: 'Новосибирск' },
    { code: 'msk', title: 'Москва' },
    { code: 'spb', title: 'Санкт‑Петербург' },
    { code: 'ekb', title: 'Екатеринбург' },
    { code: 'kzn', title: 'Казань' },
  ];

  let currentCity = localStorage.getItem('cityCode') || CITIES[0].code;

  /* инициализация каждого дропдауна */
  document.querySelectorAll('.city-dropdown').forEach(dropdown => {
    const btn = dropdown.querySelector('.city-current');
    const name = dropdown.querySelector('.city-name');
    const list = dropdown.querySelector('.city-list');

    list.innerHTML = CITIES.map(c =>
      `<li role="option" data-code="${c.code}">${c.title}</li>`).join('');

    updateCaption();

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      closeAllCityLists();
      if (!isOpen) openList();
    });

    list.addEventListener('click', e => {
      const li = e.target.closest('[data-code]');
      if (!li) return;
      currentCity = li.dataset.code;
      localStorage.setItem('cityCode', currentCity);
      syncAllCaptions();
      closeAllCityLists();
    });

    /* helpers */
    function openList() {
      btn.setAttribute('aria-expanded', 'true');
      list.classList.add('show');
    }
    function updateCaption() {
      name.textContent = CITIES.find(c => c.code === currentCity).title;
    }
    dropdown.updateCaption = updateCaption;
  });

  function syncAllCaptions() {
    document.querySelectorAll('.city-dropdown')
      .forEach(dd => dd.updateCaption());
  }

  function closeAllCityLists() {
    document.querySelectorAll('.city-dropdown').forEach(dd => {
      dd.querySelector('.city-current').setAttribute('aria-expanded', 'false');
      dd.querySelector('.city-list').classList.remove('show');
    });
  }
  document.addEventListener('click', closeAllCityLists);
}
function initCarSwiper() {
  const swiperContainer = document.querySelector('.car-swiper');
  if (!swiperContainer) return;

  const wrapper = swiperContainer.querySelector('.car-cards');
  const slides = wrapper.querySelectorAll('.car-tabs__content');

  if (window.innerWidth < 768) {
    // Убираем .row чтобы не ломался swiper
    wrapper.classList.remove('row');
    swiperContainer.classList.add('swiper');
    wrapper.classList.add('swiper-wrapper');

    slides.forEach((slide) => {
      slide.classList.add('swiper-slide');
    });

    const tabButtons = document.querySelectorAll('.car-tabs__button');
    let initialIndex = 0;
    tabButtons.forEach((btn, i) => {
      if (btn.classList.contains('is-active')) {
        initialIndex = i;
      }
    });

    const swiper = new Swiper('.car-swiper', {
      slidesPerView: 1,
      spaceBetween: 10,
      loop: false,
      initialSlide: initialIndex,
      on: {
        slideChange(swiper) {
          const index = swiper.activeIndex;

          tabButtons.forEach((btn, i) => {
            const isActive = i === index;
            btn.classList.toggle('is-active', isActive);
          });
        }
      }
    });

    tabButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        swiper.slideTo(index);
        btn.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      });
    });
  }
}

window.addEventListener('DOMContentLoaded', initCarSwiper);

//MODAL
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('.js-modal');
  const modalSuccess = document.querySelector('.js-modal-success');
  const openBtns = document.querySelectorAll('.js-modal-open');
  const closeOverlays = document.querySelectorAll('.js-modal-close');
  const SubmitBtn = document.querySelector('.js-submit');

  const openModal = (el) => {
    el.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
  };

  const closeModals = () => {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('modal--active'));
    document.body.style.overflow = '';
  };

  // Открытие первой модалки
  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) openModal(modal);
    });
  });

  // Закрытие при клике по фону
  closeOverlays.forEach(el => {
    el.addEventListener('click', e => {
      if (e.target === el) closeModals();
    });
  });

  // "Фейковая отправка" — открытие успеха
  if (SubmitBtn) {
    SubmitBtn.addEventListener('click', () => {
      modal?.classList.remove('modal--active');
      modalSuccess?.classList.add('modal--active');
    });
  }

  // Закрытие успеха
  if (modalSuccess) {
    modalSuccess.addEventListener('click', e => {
      if (e.target.classList.contains('js-modal-close')) {
        closeModals();
      }
    });
  }
});
