{
  const demo = document.querySelector('[data-canvas-demo]');
  const selection = demo.querySelector('[data-canvas-select]');
  const form = demo.querySelector('form');
  const input = form.querySelector('input');
  const status = demo.querySelector('[data-canvas-status]');
  const reset = demo.querySelector('[data-canvas-reset]');
  const originalDish = selection.textContent.trim();

  selection.addEventListener('click', () => {
    form.hidden = false;
    selection.setAttribute('aria-expanded', 'true');
    input.setCustomValidity('');
    input.value = selection.textContent.trim();
    input.focus();
    input.select();
  });

  input.addEventListener('input', () => input.setCustomValidity(''));
  input.addEventListener('keydown', (event) => {
    if (event.key.startsWith('Arrow')) event.stopPropagation();
  });

  // A swipe while selecting text in the field should not advance the slide.
  for (const eventName of ['touchstart', 'touchend']) {
    input.addEventListener(eventName, (event) => event.stopPropagation(), { passive: true });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const dish = input.value.trim();
    if (!dish) {
      input.setCustomValidity('Nhập tên món thay thế.');
      input.reportValidity();
      return;
    }

    selection.textContent = dish;
    demo.classList.add('is-updated');
    form.hidden = true;
    selection.setAttribute('aria-expanded', 'false');
    reset.hidden = false;
    status.textContent = dish.normalize('NFC').toLocaleLowerCase('vi') === 'cơm tấm'
      ? 'Đúng rồi! Kiểm lại 08h00, Trại Mát và 09h30.'
      : 'Đã sửa đúng vùng. Thử thay bằng “cơm tấm” theo bài.';
    selection.focus();
  });

  reset.addEventListener('click', () => {
    selection.textContent = originalDish;
    selection.setAttribute('aria-expanded', 'false');
    demo.classList.remove('is-updated');
    form.hidden = true;
    reset.hidden = true;
    status.textContent = '';
    selection.focus();
  });
}
