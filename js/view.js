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

    /* ---------- 工具：从当前 URL hash 解析目标屏（无 hash 或不存在时返回 null） ---------- */
  function hashTarget() {
    const h = (location.hash || '').replace('#', '');
    if (!h) return null;
    return order.find(v => v.id === h) || null;
  }

    /* ---------- 主动切屏推进历史栈：记录当前屏的 hash，支持浏览器前进/后退 ----------
     首屏（order[0]，hero）视为根地址，不挂 hash；其余屏才带 #id。 */
  function pushHash(view) {
    const isHome = (view === order[0]);
    const url = isHome ? location.pathname : '#' + view.id;
    history.pushState({ viewId: view.id }, '', url);
  }

  /* ---------- 替换当前历史记录（用于初始化 / 直跳：不新增历史条目） ---------- */
  function replaceHash(view) {
    const isHome = (view === order[0]);
    const url = isHome ? location.pathname : '#' + view.id;
    history.replaceState({ viewId: view.id }, '', url);
  }

    /* ---------- 无过渡直跳切屏（导航跳转 / 后退前进复用；永不播放色块填充） ---------- */
  function directShow(to, from) {
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
  }

  /* ---------- 工具：切到某屏（核心切换入口） ----------
     · clickPos  = {x, y} 色块过渡扩散起点（默认屏幕中心）
     · useOverlay = false 时无过渡直跳（导航链接 / 后退前进）
     · fromHistory = true 时仅切屏、不压栈（popstate 回放用） */
  function show(i, clickPos, useOverlay, fromHistory) {
    if (i < 0 || i >= order.length) return;
    const next = order[i];
    if (next === current) return; // 点击当前屏则不重复切
    if (useOverlay !== false && animating) return; // 动画进行中忽略重复点击

    const from = current;
    const to = next;

    // 前进 / 后退回放（来自 popstate 或 hashchange）：只切屏，不再压入历史栈
    if (fromHistory) {
      directShow(to, from);
      return;
    }

    // 主动切换：先把当前屏写入历史栈（供浏览器前进/后退）
    pushHash(to);

    // 导航跳转：无过渡，直接切换（无色块填充）
    if (useOverlay === false) {
      directShow(to, from);
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
      // 自然页六个卡片：由 nature.js 中心散开动画驱动，不在此做通用翻转
      if (el.classList.contains('nature-card')) return;
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
        // 统一从按钮中心开始扩散（含 hero 大球，保证色块扩散从圆心发起）
        const pos = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
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

        /* ---------- 浏览器前进/后退：回读 URL （hash 或首屏无 hash）对应屏，直跳切换（不压栈） ---------- */
  window.addEventListener('popstate', () => {
    if (!location.hash) {
      // 无 hash → 首屏（order[0]）
      if (current !== order[0]) directShow(order[0], current);
      return;
    }
    const t = hashTarget();
    if (t && t !== current) {
      show(order.indexOf(t), null, false, true); // fromHistory=true → 仅切屏，不再压栈
    }
  });

    /* ---------- 初始化：处理 URL 携带的 hash（书签 / 分享直达；无 hash 则确保地址栏显示当前屏） ----------
     采用做法一 —— 若 URL 带 hash 且匹配某屏，直接打开该屏并激活其入场动画；
     否则回落在当前屏（首屏 hero），用 replace 保证地址栏体现当前屏（不新增历史）。 */
  const initialTarget = hashTarget() || current;
  if (initialTarget !== current) {
    // 直达目标屏（directShow 内部已触发 .reveal 入场 + 导航高亮）
    directShow(initialTarget, current);
    replaceHash(initialTarget);
  } else {
    replaceHash(current); // 地址栏体现当前屏，但不新增历史条目
    // 当前屏内部 .reveal 已在脚本加载后默认状态，仍显式触发一次入场
    activateReveals(current);
    updateNav(current);
  }
})();
