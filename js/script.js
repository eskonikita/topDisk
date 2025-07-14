document.querySelectorAll('.catalog__main-select').forEach(select => {
  const btn   = select.querySelector('.select__btn');
  const list  = select.querySelector('.select__list');
  const value = select.querySelector('.select__value');

  /* открытие / закрытие */
  btn.addEventListener('click', e => {
    select.classList.toggle('open');
  });

  /* выбор пункта */
  list.addEventListener('click', e => {
    const option = e.target.closest('.select__option');
    if (!option) return;

    /* меняем «текущий» текст */
    select.querySelector('.select__current').textContent = option.textContent;

    /* hidden-input для формы */
    value.value = option.dataset.value;

    /* подсветка активного */
    list.querySelectorAll('.select__option').forEach(o => o.classList.remove('active'));
    option.classList.add('active');

    /* закрываем список */
    select.classList.remove('open');
  });

  /* клик вне селекта – закрываем */
  document.addEventListener('click', e => {
    if (!select.contains(e.target)) {
      select.classList.remove('open');
    }
  });
});
