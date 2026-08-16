/* ============================================================
   view.js — 单屏 View 切换核心
   （斐波那契教学页面 · 架构升级：由上下滚动改为「整屏跳转」）
   ------------------------------------------------------------
   核心机制：
   1) 全屏收集所有 .view 屏，一次只显示一个（.active）
   2) 点击 next 按钮 / 导航链接 -> GSAP「色块中心扩散铺满全屏
      -> 切换下一屏 -> 新屏由扩散色块内淡入呈现」
   3) 切换后对当前屏内部的 .reveal 元素统一触发 .visible
   ============================================================ */

(function viewController() {
  // 依赖 GSAP（本地引入）
  if (typeof gsap === 'undefined') return;

  const views = Array.from(document.querySelectorAll('.view'));
  if (!views.length) return;

  // 记录每一屏的 key（建议 .view 的 id 即其 key）
  const order = views;
  let current = views.find(v => v.classList.contains('active')) || views[0];
  let animating = false;

  // 单屏模式：锁定滚动，交给每屏内部滚动
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // 全局扩散过渡覆盖层（挂在 body 末尾）
  let overlay = document.getElementById('pageTransition');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pageTransition';
    overlay.className = 'page-transition';
    document.body.appendChild(overlay);
  }

  /* ---------- 工具：切到某屏 ----------
     clickPos = {x, y} 过渡扩散的起点（通常是按钮位置）
     useOverlay = false 时直接切换（导航跳转，不播放色块填充）
  */
  function show(i, clickPos, useOverlay) {
    if (i < 0 || i >= order.length) return;
    const next = order[i];
    if (next === current) return; // 点击当前屏则不重复切
    if (useOverlay !== false && animating) return; // 动画进行中忽略重复点击

    const from = current;
    const to = next;

    // 导航跳转：无过度，直接切换（无色块填充）
    if (useOverlay === false) {
      from.classList.remove('active');
      from.style.visibility = 'hidden';
      from.style.opacity = '';
      to.classList.add('active');
      to.style.visibility = 'visible';
      to.style.opacity = '';
      to.scrollTop = 0;
      activateReveals(to);
      current = to;
      updateNav(to);
      return;
    }

    animating = true;
    const cx = clickPos ? clickPos.x : window.innerWidth / 2;
    const cy = clickPos ? clickPos.y : window.innerHeight / 2;

    // 保证目标屏可见以便测量，且置于顶层之下
    to.style.visibility = 'visible';

    // ---- 阶段 A：色块从按钮中心扩散铺满全屏 ----
    const maxR = Math.ceil(Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    ));

    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    // 初始：色块为极小圆点置于点击中心
    gsap.set(overlay, {
      x: cx,
      y: cy,
      width: 8,
      height: 8,
      marginLeft: -4,
      marginTop: -4,
      borderRadius: '50%',
      opacity: 1,
      scale: 1,
      onComplete: () => {}
    });

    // 旧屏保持显示，由扩散的色块逐渐遮盖（不提前淡出）
    // 色块扩散到覆盖全屏（结尾加速冲向铺满，减少滞留感）
    gsap.to(overlay, {
      scale: maxR * 2,
      duration: 0.95,
      ease: 'power2.in',
      onComplete: () => {
                // ---- 阶段 B：切换屏幕 ----
        current.classList.remove('active');
        current.style.visibility = 'hidden';
        current.style.opacity = '';

        to.classList.add('active');
        to.style.visibility = 'visible';
        to.style.opacity = '';

        // ---- 阶段 C：色块淡出，露出新屏；完全淡出后再触发 3D 引入 ----
        // 铺满的瞬间立即淡出（无 delay），露出新屏
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.1,
          ease: 'power2.out',
          onComplete: () => {
            overlay.style.visibility = 'hidden';
            // 等色块彻底消失后，再播放新屏内容的 3D 立体引入，
            // 避免 3D 翻转动画与扩散色块的残影重叠、被遮挡而看不清。
            activateReveals(to);
            animating = false;
          }
        });

        // 更新当前指向与导航高亮
        current = to;
        updateNav(to);
      }
    });
  }

    /* ---------- 触发布局入场动画（reveal + 各屏内部的进入态） ----------
     ・首页 hero 屏不使用 .reveal，不受影响；
     ・问题引入页（#intro）：让标题单独优先入场，左右卡片随后错落入场，
       而数学家区域（.mat-section）改由「滚动到视口才入场」，交给 intro.js 的滚动 observer，
       切屏时不提前触发其动画。
     ------------------------------------------------------------ */
  function activateReveals(container) {
    const isIntro = container.id === 'intro';
    container.querySelectorAll('.reveal').forEach((el, idx) => {
      // 数学家区域：由滚动 observer 触发，不在此处理
      if (el.classList.contains('mat-section')) return;
      // 问题引入页：标题最先单独入场，卡片与它拉开明显间隔
      let delay;
      if (isIntro) {
        delay = el.classList.contains('sec-head') ? 0 : 0.5 + idx * 0.5;
      } else {
        delay = idx * 0.22;
      }
      el.style.transitionDelay = delay + 's';
      el.classList.add('visible');
    });
        // 数学家 accordion 卡片：同样交给 intro.js 的滚动 observer，切屏时不再处理
    container.querySelectorAll('.mat-item').forEach((el) => {
      if (el.closest('.mat-section')) return;
      el.style.transitionDelay = '0s';
      el.classList.add('entered');
    });

    // 广播"某屏已激活"，供需要「滚动到视口才入场」的模块（如问题引入页的数学家区域）择机启动
    window.dispatchEvent(new CustomEvent('viewactive', { detail: container.id }));
  }

  /* ---------- 导航高亮 ---------- */
  function updateNav(activeView) {
    const id = activeView.id;
    document.querySelectorAll('nav .links a').forEach((a) => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === '#' + id);
    });
  }

  /* ---------- 绑定 next 按钮 ---------- */
  document.querySelectorAll('[data-next]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-next');
      const idx = order.findIndex(v => v.id === targetId);
      if (idx !== -1) {
        const r = btn.getBoundingClientRect();
        let pos;
        if (btn.classList.contains('edge-start')) {
          // 从圆形按钮的右下边缘开始扩散（而非中心）
          pos = {
            x: r.left + r.width * 0.85,
            y: r.top + r.height * 0.85
          };
        } else {
          pos = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        show(idx, pos);
      }
    });
  });

  /* ---------- 绑定导航链接（导航跳转不做色块填充，直接切换） ---------- */
  document.querySelectorAll('nav .links a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = a.getAttribute('href').slice(1);
      const idx = order.findIndex(v => v.id === targetId);
      if (idx !== -1) {
        show(idx, null, false);
      }
    });
  });

  /* ---------- 初始化：高亮当前屏内部 reveal + 导航 ---------- */
  activateReveals(current);
  updateNav(current);
})();
