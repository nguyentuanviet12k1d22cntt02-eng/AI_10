// Interactive 4-scene video-style player for Extended Chapter 3
(function () {
  const studio = document.querySelector('[data-excel-studio]');
  if (!studio) return;

  const tabs = [...studio.querySelectorAll('[data-scene-tab]')];
  const views = [...studio.querySelectorAll('[data-scene-view]')];
  const stage = studio.querySelector('.video-stage');
  const directorCards = [...studio.querySelectorAll('[data-director-scene]')];
  const headerTitle = studio.querySelector('[data-video-title]');
  const timecodes = [...studio.querySelectorAll('[data-video-tc]')];
  const fillEl = studio.querySelector('[data-video-fill]');
  const playBtn = studio.querySelector('[data-video-play]');
  const prevBtn = studio.querySelector('[data-scene-prev]');
  const nextBtn = studio.querySelector('[data-scene-next]');

  const meta = {
    1: { title: '● CẢNH 1 / 4 · VIẾT CÔNG THỨC TỪ ẢNH BẢNG', tc: '00:00:08 / 00:00:42', pct: '25%' },
    2: { title: '● CẢNH 2 / 4 · KIỂM CHỨNG THỦ CÔNG 1 DÒNG', tc: '00:00:18 / 00:00:42', pct: '50%' },
    3: { title: '● CẢNH 3 / 4 · GIẢI THÍCH & TỐI ƯU HÀM', tc: '00:00:30 / 00:00:42', pct: '75%' },
    4: { title: '● CẢNH 4 / 4 · BẮT BỆNH & SỬA LỖI #NAME?', tc: '00:00:42 / 00:00:42', pct: '100%' }
  };

  let current = 1;
  let timerId = null;

  function setScene(num) {
    const target = Math.max(1, Math.min(4, Number(num) || 1));
    current = target;

    tabs.forEach((btn) => {
      const active = Number(btn.dataset.sceneTab) === target;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    views.forEach((v) => {
      v.style.display = Number(v.dataset.sceneView) === target ? 'flex' : 'none';
    });

    directorCards.forEach((card) => {
      card.style.display = Number(card.dataset.directorScene) === target ? 'block' : 'none';
    });

    const info = meta[target];
    if (headerTitle) headerTitle.textContent = info.title;
    timecodes.forEach((el) => { el.textContent = info.tc; });
    if (fillEl) fillEl.style.width = info.pct;
    if (stage) stage.scrollTop = 0;
    if (prevBtn) prevBtn.disabled = target === 1;
    if (nextBtn) nextBtn.disabled = target === 4;
  }

  function stopAuto() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    if (playBtn) {
      playBtn.textContent = '▶ Phát tự động';
      playBtn.setAttribute('aria-pressed', 'false');
    }
  }

  function toggleAuto() {
    if (timerId) {
      stopAuto();
      return;
    }
    if (current === 4) setScene(1);
    if (playBtn) {
      playBtn.textContent = '⏸ Tạm dừng';
      playBtn.setAttribute('aria-pressed', 'true');
    }
    timerId = setInterval(() => {
      if (current >= 4) {
        stopAuto();
        return;
      }
      setScene(current + 1);
    }, 4500);
  }

  tabs.forEach((btn) => btn.addEventListener('click', () => { stopAuto(); setScene(btn.dataset.sceneTab); }));
  studio.querySelectorAll('[data-scene-jump]').forEach((btn) => {
    btn.addEventListener('click', () => { stopAuto(); setScene(btn.dataset.sceneJump); });
  });
  if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); setScene(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); setScene(current + 1); });
  if (playBtn) playBtn.addEventListener('click', toggleAuto);

  setScene(1);
})();
