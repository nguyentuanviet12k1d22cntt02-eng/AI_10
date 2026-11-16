// Shared slide deck controller

(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const curEl   = document.getElementById('cur');
  const totalEl = document.getElementById('total');
  const dotTrack = document.getElementById('dot-track');

  const TOTAL = slides.length;
  const lesson = document.body.dataset.courseLesson;
  if (lesson) {
    try {
      localStorage.setItem(`lop-hoc-ai.course-opened.${lesson}`, '1');
    } catch {
      // Slides remain available when browser storage is disabled.
    }
  }
  let current = 0;      // 0-indexed
  let isAnimating = false;

  // ── Build dot indicators ──────────────────────────
  totalEl.textContent = TOTAL;
  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotTrack.appendChild(dot);
    return dot;
  });

  // ── Render a specific slide ───────────────────────
  function render(next, direction = 1) {
    if (next === current && slides[current].classList.contains('active')) return;
    if (isAnimating) return;
    isAnimating = true;

    const prev = current;
    current = next;

    // Exit old slide
    slides[prev].classList.remove('active');
    slides[prev].classList.add('exit-left');
    slides[prev].style.transform = direction > 0 ? 'translateX(-60px)' : 'translateX(60px)';

    // Prepare new slide
    slides[current].style.transform = direction > 0 ? 'translateX(60px)' : 'translateX(-60px)';
    slides[current].style.opacity = '0';

    // Force reflow
    slides[current].offsetHeight;

    // Activate new slide
    slides[current].classList.add('active');
    slides[current].style.transform = '';
    slides[current].style.opacity   = '';

    // After animation, clean up
    setTimeout(() => {
      slides[prev].classList.remove('exit-left');
      slides[prev].style.transform = '';
      slides[prev].style.opacity   = '';
      isAnimating = false;
    }, 300);

    updateUI();
  }

  function goTo(index) {
    if (index < 0 || index >= TOTAL || index === current) return;
    const direction = index > current ? 1 : -1;
    render(index, direction);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function updateUI() {
    curEl.textContent = current + 1;

    btnPrev.disabled = current === 0;
    btnNext.disabled = current === TOTAL - 1;
    btnNext.textContent = current === TOTAL - 2
      ? '→' : current === TOTAL - 1 ? '✓' : '→';

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      slides[i].inert = i !== current;
    });

    // Scroll slide to top on change
    slides[current].scrollTop = 0;
  }

  // ── Init ─────────────────────────────────────────
  slides[0].classList.add('active');
  updateUI();

  // ── Button events ─────────────────────────────────
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  document.querySelectorAll('[data-go-to]').forEach((button) => {
    button.addEventListener('click', () => {
      goTo(Number(button.dataset.goTo) - 1);
      const heading = slides[current].querySelector('h1, h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    });
  });

  // ── Keyboard navigation ───────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const canScroll = slides[current].scrollHeight > slides[current].clientHeight;
    if (e.key === 'ArrowRight' || (!canScroll && e.key === 'ArrowDown')) {
      e.preventDefault();
      next();
    }
    if (e.key === 'ArrowLeft' || (!canScroll && e.key === 'ArrowUp')) {
      e.preventDefault();
      prev();
    }
  });

  // ── Touch / swipe navigation ──────────────────────
  let touchStartX = 0;
  let touchStartY = 0;
  document.getElementById('deck').addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  document.getElementById('deck').addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  // ── Copy-to-clipboard ─────────────────────────────
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.dataset.copy);
      const status = btn.closest('.prompt-card').querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        btn.textContent = '✓ Đã sao chép';
        if (status) status.textContent = 'Dán vào công cụ AI bạn đang dùng.';
        setTimeout(() => {
          btn.textContent = 'Sao chép';
          if (status) status.textContent = '';
        }, 3000);
      } catch {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(target);
        sel.removeAllRanges();
        sel.addRange(range);
        if (status) status.textContent = 'Nhấn Ctrl+C để sao chép.';
      }
    });
  });

  // ── Take Selector (Bad vs Good Take Toggle for Dialogue Studio) ────────
  document.querySelectorAll('.take-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const monitor = btn.closest('.video-monitor');
      if (!monitor) return;
      const targetTake = btn.dataset.take; // 'bad' or 'good'
      monitor.querySelectorAll('.take-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.take === targetTake);
      });
      monitor.querySelectorAll('.take-view').forEach((v) => {
        v.style.display = (v.dataset.take === targetTake) ? 'flex' : 'none';
      });
      const slide = btn.closest('.slide');
      if (slide) {
        slide.querySelectorAll('.director-take-view').forEach((dv) => {
          dv.style.display = (dv.dataset.take === targetTake) ? 'grid' : 'none';
        });
      }
    });
  });

  // ── Prompt Lock System (Mật khẩu: 1009 hoặc *) ──────────────────
  const PASSCODE = '1009';
  const lockModal = document.getElementById('lock-modal');
  const lockModalForm = document.getElementById('lock-modal-form');
  const lockModalInput = document.getElementById('lock-modal-input');
  const lockModalClose = document.getElementById('lock-modal-close');
  const lockModalError = document.getElementById('lock-modal-error');
  const lockModalSubmit = document.getElementById('lock-modal-submit') || document.querySelector('.lock-modal-submit');
  const masterUnlockBtn = document.getElementById('btn-master-unlock');

  let activeCardTarget = null; // null: mở khóa toàn bộ; HTMLElement: mở khóa 1 card cụ thể

  function openLockModal(targetCard = null) {
    activeCardTarget = targetCard;
    if (lockModalError) {
      lockModalError.setAttribute('hidden', '');
      lockModalError.hidden = true;
      lockModalError.style.display = 'none';
    }
    if (lockModalInput) {
      lockModalInput.value = '';
    }
    if (lockModal) {
      if (typeof lockModal.showModal === 'function') {
        try {
          lockModal.showModal();
        } catch {
          lockModal.setAttribute('open', '');
        }
      } else {
        lockModal.setAttribute('open', '');
      }
      setTimeout(() => {
        if (lockModalInput) lockModalInput.focus();
      }, 50);
    }
  }

  function closeLockModal() {
    if (!lockModal) return;
    if (typeof lockModal.close === 'function') {
      try {
        lockModal.close();
      } catch {
        lockModal.removeAttribute('open');
      }
    } else {
      lockModal.removeAttribute('open');
    }
    if (lockModalError) {
      lockModalError.setAttribute('hidden', '');
      lockModalError.hidden = true;
      lockModalError.style.display = 'none';
    }
    if (lockModalInput) lockModalInput.value = '';
    activeCardTarget = null;
  }

  function unlockCard(card) {
    if (!card) return;
    card.classList.add('is-unlocked');
    const trigger = card.querySelector('.prompt-lock-trigger');
    const content = card.querySelector('.prompt-box-inner');
    if (trigger) {
      trigger.setAttribute('hidden', '');
      trigger.hidden = true;
      trigger.style.display = 'none';
    }
    if (content) {
      content.removeAttribute('hidden');
      content.hidden = false;
      content.style.display = 'grid';
    }
  }

  function relockCard(card) {
    if (!card) return;
    card.classList.remove('is-unlocked');
    const trigger = card.querySelector('.prompt-lock-trigger');
    const content = card.querySelector('.prompt-box-inner');
    if (trigger) {
      trigger.removeAttribute('hidden');
      trigger.hidden = false;
      trigger.style.display = 'flex';
    }
    if (content) {
      content.setAttribute('hidden', '');
      content.hidden = true;
      content.style.display = 'none';
    }
  }

  function updateMasterBtnState() {
    if (!masterUnlockBtn) return;
    const allCards = document.querySelectorAll('[data-prompt-card]');
    const allUnlocked = allCards.length > 0 && Array.from(allCards).every(c => c.classList.contains('is-unlocked'));
    if (allUnlocked) {
      masterUnlockBtn.innerHTML = '<span class="lock-icon" aria-hidden="true">🔓</span><span class="unlock-btn-text">Khóa lại toàn bộ</span>';
      masterUnlockBtn.style.background = '#dcfce7';
    } else {
      masterUnlockBtn.innerHTML = '<span class="lock-icon" aria-hidden="true">🔒</span><span class="unlock-btn-text">Mở khóa toàn bộ</span>';
      masterUnlockBtn.style.background = '#fef08a';
    }
  }

  function isPasscodeMatch(val) {
    const s = (val || '').trim();
    // Chấp nhận: 1009, hoặc * (dấu hoa thị khi người dùng nhập theo gợi ý ẩn mã), hoặc •, hoặc 1009*
    return s === '1009' || s === '*' || s === '•' || s === '1009*';
  }

  function submitUnlock() {
    const val = lockModalInput ? lockModalInput.value : '';
    if (isPasscodeMatch(val)) {
      if (activeCardTarget) {
        unlockCard(activeCardTarget);
      } else {
        document.querySelectorAll('[data-prompt-card]').forEach(unlockCard);
      }
      updateMasterBtnState();
      closeLockModal();
    } else {
      if (lockModalError) {
        lockModalError.removeAttribute('hidden');
        lockModalError.hidden = false;
        lockModalError.style.display = 'block';
        lockModalError.classList.remove('shake');
        void lockModalError.offsetWidth;
        lockModalError.classList.add('shake');
      }
      if (lockModalInput) {
        lockModalInput.focus();
        lockModalInput.select();
      }
    }
  }

  // Gắn sự kiện cho từng thẻ prompt
  document.querySelectorAll('[data-prompt-card]').forEach((card) => {
    const trigger = card.querySelector('.prompt-lock-trigger');
    const relockBtn = card.querySelector('.relock-btn');

    // Bấm vào ô ổ khóa -> Bật hộp thoại modal nhập mật mã ngay giữa màn hình
    if (trigger) {
      trigger.addEventListener('click', () => openLockModal(card));
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLockModal(card);
        }
      });
    }

    // Nút khóa lại riêng cho từng thẻ
    if (relockBtn) {
      relockBtn.addEventListener('click', () => {
        relockCard(card);
        updateMasterBtnState();
      });
    }
  });

  // Nút mở khóa toàn bộ trên thanh tiêu đề
  if (masterUnlockBtn) {
    masterUnlockBtn.addEventListener('click', () => {
      const allCards = document.querySelectorAll('[data-prompt-card]');
      const allUnlocked = allCards.length > 0 && Array.from(allCards).every(c => c.classList.contains('is-unlocked'));
      if (allUnlocked) {
        allCards.forEach(relockCard);
        updateMasterBtnState();
      } else {
        openLockModal(null); // null = mở khóa tất cả khi nhập đúng
      }
    });
  }

  // Đóng modal bằng nút [✕]
  if (lockModalClose) {
    lockModalClose.addEventListener('click', closeLockModal);
  }

  // Đóng modal khi bấm vào vùng nền mờ bên ngoài
  if (lockModal) {
    lockModal.addEventListener('click', (e) => {
      const rect = lockModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeLockModal();
      }
    });
  }

  // Xử lý gửi mật khẩu trong modal qua: Form submit, Nút mở khóa click, và phím Enter
  if (lockModalSubmit) {
    lockModalSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      submitUnlock();
    });
  }

  if (lockModalForm) {
    lockModalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitUnlock();
    });
  }

  if (lockModalInput) {
    lockModalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitUnlock();
      }
    });
  }

})();
