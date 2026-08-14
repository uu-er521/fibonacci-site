/* ============================================================
   cursor.js — 自定义紫色圆形光标
   ------------------------------------------------------------
   · 在 html 上挂 cursor-custom 类，隐藏默认箭头（cursor:none）
   · 一个紫色圆形 .cursor-dot 跟随鼠标移动
   · 当悬停在可点击/交互元素上时，圆点放大变亮（is-hover）
   ============================================================ */

(function customCursor() {
  // 触屏设备或系统禁用动画偏好：不启用自定义光标
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('cursor-custom');

  // 创建光标元素
  let dot = document.getElementById('cursorDot');
  if (!dot) {
    dot = document.createElement('div');
    dot.id = 'cursorDot';
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
  }

  let raf = null;
  let targetX = -100, targetY = -100;
  let curX = -100, curY = -100;

  // 平滑跟随
  function loop() {
    curX += (targetX - curX) * 0.22;
    curY += (targetY - curY) * 0.22;
    dot.style.left = curX + 'px';
    dot.style.top = curY + 'px';
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!raf) {
      // 首次：直接定位，避免从角落飘过来
      curX = targetX; curY = targetY;
      dot.style.left = curX + 'px';
      dot.style.top = curY + 'px';
      raf = requestAnimationFrame(loop);
    }
  });

  // 悬停可点击元素 -> 放大变亮
  const HOVER_SEL = [
    'a', 'button', '[role="button"]', 'input[type=range]',
    'input[type="checkbox"]', 'label', 'select',
    '.nature-card', '.quiz-opt', '.mat-head', '.yh-cell',
    '.tray-piece', '.piece-shape', '.next-btn', '.next-btn-inline',
    '.fs-nav', '.fs-close', '.fo-nav', '.fo-close'
  ].join(',');

  document.addEventListener('mouseover', (e) => {
    if (e.target && e.target.closest && e.target.closest(HOVER_SEL)) {
      dot.classList.add('is-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target && e.target.closest && e.target.closest(HOVER_SEL)) {
      dot.classList.remove('is-hover');
    }
  });

  // 鼠标离开窗口时隐藏
  document.addEventListener('mouseleave', () => {
    if (dot) dot.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (dot) dot.style.opacity = '1';
  });
})();
