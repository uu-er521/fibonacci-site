/* ============================================================
   music.js — 右下角悬浮音乐播放器
   （斐波那契教学页面 · 脚本封装 part X）

   功能：
   · 混合播放：首次交互（任意点击）后自动开始播放；
     之后可由右下角圆钮 / 面板播放键随时手动开/关。
   · 悬浮（桌面）或点击（触屏）展开面板：专辑封面 + 歌名/歌手
     + 进度条（可拖拽跳转）+ 音量条（可拖拽调节 + 静音图标变化）。
   · 音频跨屏不中断（全局 <audio>，循环播放）。
   ============================================================ */

(function musicPlayer() {
  const audio = document.getElementById('bgMusic');
  if (!audio) return;

  const pl = document.getElementById('musicPlayer');
  const fab = document.getElementById('mpFab');
  const toggle = document.getElementById('mpToggle');
  const progressBar = document.getElementById('mpProgress');
  const progressFill = document.getElementById('mpProgressFill');
  const progressTip = document.getElementById('mpProgressTip');
  const volumeBar = document.getElementById('mpVolumeBar');
  const volumeFill = document.getElementById('mpVolumeFill');
  const volIco = document.getElementById('mpVolIco');
  const curEl = document.getElementById('mpCurrent');
  const durEl = document.getElementById('mpDur');

  // 是否具备真正 hover 能力（触屏无 hover）
  const isTouch = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;

  audio.volume = 0.25; // 默认背景音量

  /* ---------- 工具 ---------- */
  function fmt(s) {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    s = Math.floor(s);
    const m = Math.floor(s / 60), ss = s % 60;
    return m + ':' + (ss < 10 ? '0' : '') + ss;
  }

  function updatePlayIcon() {
    const playing = !audio.paused && !audio.ended;
    toggle.textContent = playing ? '❚❚' : '▶';
    fab.textContent = playing ? '🎵' : '🔇';
    fab.title = playing ? '暂停背景音乐' : '播放背景音乐';
  }

  function playMusic() { audio.play().then(updatePlayIcon).catch(() => {}); }
  function pauseMusic() { audio.pause(); updatePlayIcon(); }

  function togglePlay() {
    if (audio.paused) playMusic(); else pauseMusic();
  }

  /* ---------- 展开 / 收起（JS 控制，避免 hover 与拖拽冲突） ---------- */
  function openPanel() { pl.classList.add('open'); }
  function closePanel() { pl.classList.remove('open'); }

  let draggingBar = false; // 正在拖进度或音量时，鼠标移出面板不收起

  pl.addEventListener('mouseenter', openPanel);
  pl.addEventListener('mouseleave', () => { if (!draggingBar) closePanel(); });

  /* ---------- 首次交互（任意点击）后自动播放（混合方案） ---------- */
  let autorun = true;
  document.addEventListener('pointerdown', function once() {
    if (autorun) { autorun = false; playMusic(); }
    document.removeEventListener('pointerdown', once);
  });

  /* ---------- 播放 / 暂停 ---------- */
  fab.addEventListener('click', togglePlay);
  toggle.addEventListener('click', togglePlay);
  fab.addEventListener('click', (e) => {
    // 触屏没有悬浮 hover，点击圆钮时顺带开合面板，便于调音量/进度
    if (isTouch) pl.classList.toggle('open');
  });

  /* ---------- 进度更新 ---------- */
  audio.addEventListener('timeupdate', () => {
    if (draggingBar) return;
    const p = audio.duration ? audio.currentTime / audio.duration : 0;
    progressFill.style.width = (p * 100) + '%';
    curEl.textContent = fmt(audio.currentTime);
    durEl.textContent = fmt(audio.duration);
    if (progressTip) {
      progressTip.style.left = (p * 100) + '%';
      progressTip.textContent = fmt(audio.currentTime);
    }
  });

  // 更新进度条与顶部的向上时间气泡位置
  function updateTip(p) {
    if (!progressTip) return;
    progressTip.style.left = (p * 100) + '%';
    progressTip.textContent = fmt(p * audio.duration);
  }
  function progressFromEvent(e) {
    const r = progressBar.getBoundingClientRect();
    return Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
  }
  function seekTo(e) {
    const p = progressFromEvent(e);
    progressFill.style.width = (p * 100) + '%';
    curEl.textContent = fmt(p * audio.duration);
    if (audio.duration) audio.currentTime = p * audio.duration;
    updateTip(p);
  }
  progressBar.addEventListener('pointerdown', (e) => {
    draggingBar = true;
    progressBar.classList.add('dragging');
    progressBar.setPointerCapture && progressBar.setPointerCapture(e.pointerId);
    pl.classList.add('open'); // 拖动时不收起
    seekTo(e);
  });
  progressBar.addEventListener('pointermove', (e) => { if (draggingBar) seekTo(e); });
  function endDrag() { draggingBar = false; progressBar.classList.remove('dragging'); settleClose(); }
  progressBar.addEventListener('pointerup', endDrag);
  progressBar.addEventListener('pointercancel', endDrag);

  /* ---------- 音量 ---------- */
  function volFromEvent(e) {
    const r = volumeBar.getBoundingClientRect();
    return Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
  }
  function setVol(e) {
    const v = volFromEvent(e);
    audio.volume = v;
    volumeFill.style.width = (v * 100) + '%';
    volIco.textContent = v === 0 ? '🔇' : (v < 0.5 ? '🔉' : '🔊');
  }
  volumeBar.addEventListener('pointerdown', (e) => {
    draggingBar = true;
    volumeBar.setPointerCapture && volumeBar.setPointerCapture(e.pointerId);
    pl.classList.add('open');
    setVol(e);
  });
  volumeBar.addEventListener('pointermove', (e) => { if (draggingBar) setVol(e); });
  volumeBar.addEventListener('pointerup', () => { draggingBar = false; settleClose(); });
  volumeBar.addEventListener('pointercancel', () => { draggingBar = false; settleClose(); });

  // 拖动结束后：若鼠标已不在播放器上，则收起面板
  function settleClose() {
    setTimeout(() => {
      if (!pl.matches(':hover') && !isTouch) closePanel();
    }, 40);
  }

  /* ---------- 初始化 ---------- */
  volumeFill.style.width = (audio.volume * 100) + '%';
  volIco.textContent = audio.volume === 0 ? '🔇' : (audio.volume < 0.5 ? '🔉' : '🔊');
  updatePlayIcon();
  // 元数据就绪后显示总时长
  audio.addEventListener('loadedmetadata', () => { durEl.textContent = fmt(audio.duration); });
})();
