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

/* ---------- 2. Hero 3D 飞入入场（GSAP） ---------- */
(function heroIntro() {
  if (typeof gsap === 'undefined') return;
  const chips = document.querySelectorAll('#heroSeq .seq-chip');
  if (!chips.length) return;

  // 先做一次小抖动再飞入，增强“数字之舞”的灵动感
  gsap.from(chips, {
    x: (i) => (i % 2 === 0 ? -140 : 140),   // 左右交替入场
    y: 90,
    z: -260,
    rotationY: (i) => (i % 2 === 0 ? -75 : 75),
    rotationX: 30,
    opacity: 0,
    scale: 0.7,
    stagger: 0.09,
    ease: 'power3.out',
    duration: 1.1,
    delay: 0.35,
    clearProps: 'transform'
  });

  // 标题与描述文字同步浮现
  gsap.from('.hero h1', {
    y: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.1
  });
  gsap.from('.hero p.desc', {
    y: 40, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2
  });
  gsap.from('.hero .cta', {
    y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.3
  });
})();

/* ---------- 3. Hero 滚动驱动（单屏模式下已由 view.js 接管退出，故移除） ----------
   原滚动淡出逻辑在「整屏跳转」架构下不再需要：点击 Next 时 view.js 会
   完成当前屏的 GSAP 退出过渡。此模块保留为空占位，未来如需在 Hero 内
   做滚动视差，可在本处扩展。 */
