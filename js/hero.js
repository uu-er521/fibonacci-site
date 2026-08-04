/* ============================================================
   hero.js — Hero 首屏模块
   1) heroSequence()  生成首屏斐波那契数列 chips
   2) heroFade()      滚动时首屏渐隐淡出 + 上移
   （斐波那契教学页面 · 脚本封装 part 2）
   ============================================================ */

/* ---------- 1. Hero 数列展示 ---------- */
(function heroSequence() {
  const heroSeq = document.getElementById('heroSeq');
  const heroFib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  heroFib.forEach((v, i) => {
    const c = document.createElement('div');
    c.className = 'seq-chip';
    c.textContent = v;
    c.style.animationDelay = (i * 0.15) + 's';
    heroSeq.appendChild(c);
  });
})();

/* ---------- 2. Hero 首屏滚动淡出 ---------- */
(function heroFade() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const fadeStart = 120;      // 滚动超过该值后开始淡出
  const fadeLength = hero.offsetHeight * 0.6; // 继续滚动此距离后完全消失

  function update() {
    const y = window.pageYOffset || document.documentElement.scrollTop;
    const t = Math.min(1, Math.max(0, (y - fadeStart) / fadeLength));
    hero.style.opacity = (1 - t).toFixed(3);
    hero.style.transform = 'translateY(' + (t * 70) + 'px)';
    hero.style.pointerEvents = t > 0.9 ? 'none' : '';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
