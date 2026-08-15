/* ============================================================
   hero.js — Hero 首屏模块
   1) heroSequence()  生成首屏斐波那契数列 chips
   2) heroIntro()     GSAP 3D 飞入入场（数列 chips 立体翻转）
   3) heroFade()      ScrollTrigger 滚动驱动：银河视差 + 首屏淡出上移
   （斐波那契教学页面 · 脚本封装 part 2，升级为 GSAP 3D 效果）
   ============================================================ */

/* ---------- 1. Hero 数列展示 ---------- */
(function heroSequence() {
  const heroSeq = document.getElementById('heroSeq');
  if (!heroSeq) return;
  const heroFib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  heroFib.forEach((v) => {
    const c = document.createElement('div');
    c.className = 'seq-chip';
    c.textContent = v;
    // GSAP 会通过内联 transform 控制入场，故不再用 CSS animationDelay / popIn
    heroSeq.appendChild(c);
  });
})();

/* ---------- 2. Hero 3D 飞入入场（GSAP） ----------
   流程：
   1) 数字框(.seq-strip)先上移至「视口中心」
   2) 数字 chips 逐个 3D 飞入
   3) 全部数字飞完后：数字框平滑下移回原位 + 圆球同时做「墨滴/色块扩散」式放大
   ------------------------------------------------------------ */
(function heroIntro() {
  if (typeof gsap === 'undefined') return;
  const strip = document.getElementById('heroSeq');
  const orb = document.querySelector('.hero-orb');
  if (!strip || !orb) return;
  const chips = strip.querySelectorAll('.seq-chip');
  if (!chips.length) return;

  // chips 全部飞完的时刻（timeline 相对起点）
  const chipEnd = 0.35 + 1.1 + 0.09 * (chips.length - 1);

  // 先把数字框上移到「视口中心」（用 transform 精确居中，不改动布局流）
  const rect = strip.getBoundingClientRect();
  const centerOffset = (window.innerHeight / 2) - (rect.top + rect.height / 2);
  gsap.set(strip, { y: centerOffset, zIndex: 5 });
  // 圆球初始隐藏（收成一个极小墨滴点 + 透明），待数字全部飞完后才扩散出现
  gsap.set(orb, { clipPath: 'circle(0% at 50% 50%)', opacity: 0 });
  // 简介文字初始隐藏，待圆球浮现后再淡入
  gsap.set('.hero p.desc', { autoAlpha: 0, y: 40 });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      // 全部结束：清除残留 transform / clip-path，恢复纯 CSS 布局、保证间距
      gsap.set(strip, { clearProps: 'all' });
      gsap.set(orb, { clearProps: 'transform,clipPath' });
    }
  });

  // 1) 数字 chips 逐个 3D 飞入（此时数字框位于中心）
  tl.from(chips, {
    x: (i) => (i % 2 === 0 ? -140 : 140),   // 左右交替入场
    y: 90,
    z: -260,
    rotationY: (i) => (i % 2 === 0 ? -75 : 75),
    rotationX: 30,
    opacity: 0,
    scale: 0.7,
    stagger: 0.09,
    duration: 1.1,
    delay: 0.35
  }, 0);

  // 2) 所有数字飞完后：数字框平滑下移回原位
  tl.to(strip, {
    y: 0,
    duration: 0.95,
    ease: 'power3.inOut'
  }, chipEnd);

  // 3) 同时（与数字框下移并行）：圆球做「墨滴/色块扩散」式放大——
  //    从中心一个极小圆clip-path，向四周均匀扩散铺满整个正圆边界，
  //    区别于 scale 整体缩放，效果类似全屏过渡的色块扩散。
  tl.fromTo(orb, {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 0
  }, {
    clipPath: 'circle(50% at 50% 50%)',
    opacity: 1,
    duration: 1.15,
    ease: 'power4.out'
  }, chipEnd);

  // 4) 简介文字随圆球浮现（数字框下移到位后，由初始隐藏淡入归位）
  tl.to('.hero p.desc', {
    autoAlpha: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out'
  }, '>');
})();

/* ---------- 3. Hero 滚动驱动（单屏模式下已由 view.js 接管退出，故移除） ----------
   原滚动淡出逻辑在「整屏跳转」架构下不再需要：点击 Next 时 view.js 会
   完成当前屏的 GSAP 退出过渡。此模块保留为空占位，未来如需在 Hero 内
   做滚动视差，可在本处扩展。 */

