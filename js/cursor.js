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

  // 拼图拖拽中：球场即时贴合鼠标（无阻尼），保证与拖拽的拼图同步
  function isPuzzleDragging() {
    return !!(document.querySelector('.piece-shape.dragging'));
  }

  // 平滑跟随
  function loop() {
    // 拖拽拼图时位置由 onPointerMove 直接接管，这里不再做阻尼变色
    if (!isPuzzleDragging()) {
      curX += (targetX - curX) * 0.22;
      curY += (targetY - curY) * 0.22;
      dot.style.left = curX + 'px';
      dot.style.top = curY + 'px';
    }
    raf = requestAnimationFrame(loop);
  }

  // 统一指针处理：拖拽拼图时即时同步，否则走平滑阻尼
  // 用 capture 阶段 + window 级监听，确保 setPointerCapture 重定向后仍能收到移动事件
  function onPointerMove(e) {
    targetX = e.clientX;
    targetY = e.clientY;
    if (isPuzzleDragging()) {
      // 拖拽拼图时：直接同步到位，避免缓动延迟导致小球跟不上拼图
      curX = targetX; curY = targetY;
      dot.style.left = curX + 'px';
      dot.style.top = curY + 'px';
    } else if (!raf) {
      // 首次：直接定位，避免从角落飘过来
      curX = targetX; curY = targetY;
      dot.style.left = curX + 'px';
      dot.style.top = curY + 'px';
      raf = requestAnimationFrame(loop);
    }
  }
  window.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
  // 旧浏览器兜底（指针事件不可用时退回鼠标事件）
  if (!window.PointerEvent) {
    document.addEventListener('mousemove', onPointerMove, { capture: true });
  }
  // 悬停可点击元素 -> 放大变亮
  const HOVER_SEL = [
    'a', 'button', '[role="button"]', 'input[type=range]',
    'input[type="checkbox"]', 'label', 'select',
    '.nature-card', '.quiz-opt', '.fact', '.mat-head', '.yh-cell',
    '.tray-piece', '.piece-shape', '.next-btn', '.next-btn-inline',
    '.fs-nav', '.fs-close', '.fo-nav', '.fo-close'
  ].join(',');

  // 大圆形按钮：小球放大并显示 explore
  const ORB_SEL = '.hero-orb';

  document.addEventListener('mouseover', (e) => {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest(ORB_SEL)) {
      dot.classList.remove('is-hover');
      dot.classList.add('is-explore');
    } else if (e.target.closest(HOVER_SEL)) {
      dot.classList.remove('is-explore');
      dot.classList.add('is-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest(ORB_SEL)) {
      dot.classList.remove('is-explore');
    } else if (e.target.closest(HOVER_SEL)) {
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

  // ---- Bug 修复：切屏时重置光标状态 ----
  // 当光标一直悬停在按钮/球体上就切到下一页（期间未移动鼠标），
  // 没有 mouseover/mouseout 触发，会导致 explore/hover 状态残留。
  // 这里监听 .view 的 active 切换，一旦切屏就强制清空光标状态。
  const resetCursorState = () => {
    dot.classList.remove('is-hover', 'is-explore');
  };

  const viewsRoot = document.querySelector('.views') || document.body;
  new MutationObserver(() => {
    resetCursorState();
  }).observe(viewsRoot, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
})();

