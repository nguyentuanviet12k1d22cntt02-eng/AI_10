// Controller cho trang Bài tập thêm (Copy prompt + Mở khóa mật mã 1009)
(function () {
  const lockModal = document.getElementById('lock-modal');
  const lockModalForm = document.getElementById('lock-modal-form');
  const lockModalInput = document.getElementById('lock-modal-input');
  const lockModalClose = document.getElementById('lock-modal-close');
  const lockModalError = document.getElementById('lock-modal-error');
  const masterUnlockBtn = document.getElementById('btn-master-unlock');

  let activeCardTarget = null;

  function isPasscodeMatch(val) {
    const s = (val || '').trim();
    return s === '1009' || s === '*' || s === '•' || s === '1009*';
  }

  function openLockModal(card = null) {
    activeCardTarget = card;
    if (lockModalError) {
      lockModalError.hidden = true;
    }
    if (lockModalInput) lockModalInput.value = '';
    if (lockModal) {
      if (typeof lockModal.showModal === 'function') {
        lockModal.showModal();
      } else {
        lockModal.setAttribute('open', '');
      }
      setTimeout(() => lockModalInput?.focus(), 40);
    }
  }

  function closeLockModal() {
    if (!lockModal) return;
    if (typeof lockModal.close === 'function') {
      lockModal.close();
    } else {
      lockModal.removeAttribute('open');
    }
    if (lockModalError) lockModalError.hidden = true;
    if (lockModalInput) lockModalInput.value = '';
    activeCardTarget = null;
  }

  function unlockCard(card) {
    card.classList.add('is-unlocked');
    const trigger = card.querySelector('.prompt-lock-trigger');
    const box = card.querySelector('.prompt-box-inner');
    if (trigger) trigger.hidden = true;
    if (box) box.hidden = false;
  }

  function relockCard(card) {
    card.classList.remove('is-unlocked');
    const trigger = card.querySelector('.prompt-lock-trigger');
    const box = card.querySelector('.prompt-box-inner');
    if (trigger) trigger.hidden = false;
    if (box) box.hidden = true;
  }

  function updateMasterBtn() {
    if (!masterUnlockBtn) return;
    const cards = Array.from(document.querySelectorAll('[data-prompt-card]'));
    const allUnlocked = cards.length > 0 && cards.every((c) => c.classList.contains('is-unlocked'));
    masterUnlockBtn.innerHTML = allUnlocked
      ? '<span aria-hidden="true">🔓</span><span>Khóa lại toàn bộ</span>'
      : '<span aria-hidden="true">🔒</span><span>Mở khóa toàn bộ</span>';
    masterUnlockBtn.style.background = allUnlocked ? '#dcfce7' : '#fef08a';
  }

  document.querySelectorAll('[data-prompt-card]').forEach((card) => {
    const trigger = card.querySelector('.prompt-lock-trigger');
    const relockBtn = card.querySelector('.relock-btn');
    trigger?.addEventListener('click', () => openLockModal(card));
    relockBtn?.addEventListener('click', () => {
      relockCard(card);
      updateMasterBtn();
    });
  });

  masterUnlockBtn?.addEventListener('click', () => {
    const cards = Array.from(document.querySelectorAll('[data-prompt-card]'));
    const allUnlocked = cards.length > 0 && cards.every((c) => c.classList.contains('is-unlocked'));
    if (allUnlocked) {
      cards.forEach(relockCard);
      updateMasterBtn();
    } else {
      openLockModal(null);
    }
  });

  lockModalClose?.addEventListener('click', closeLockModal);
  lockModal?.addEventListener('click', (e) => {
    if (e.target === lockModal) closeLockModal();
  });

  lockModalForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isPasscodeMatch(lockModalInput?.value)) {
      if (activeCardTarget) {
        unlockCard(activeCardTarget);
      } else {
        document.querySelectorAll('[data-prompt-card]').forEach(unlockCard);
      }
      updateMasterBtn();
      closeLockModal();
    } else {
      if (lockModalError) lockModalError.hidden = false;
      lockModalInput?.focus();
      lockModalInput?.select();
    }
  });

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const orig = btn.textContent.trim();
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.dataset.copy);
      const box = btn.closest('.prompt-box-inner');
      const status = box?.querySelector('.copy-status');
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        btn.textContent = '✓ Đã sao chép';
        if (status) status.textContent = 'Đã sao chép prompt — bạn có thể dán trực tiếp vào Google Flow.';
        setTimeout(() => {
          btn.textContent = orig;
          if (status) status.textContent = '';
        }, 3000);
      } catch {
        if (status) status.textContent = 'Không thể tự sao chép, vui lòng bôi đen nội dung và nhấn Ctrl+C.';
      }
    });
  });
})();
