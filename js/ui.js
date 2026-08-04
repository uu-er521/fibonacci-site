/* ============================================================
   ui.js — 通用 UI 模块
   1) navActive()  导航栏当前模块高亮（滚动定位）
   2) revealOnScroll()  滚动渐显（.reveal / .visible）
   （斐波那契教学页面 · 脚本封装 part 1）
   ============================================================ */

/* ---------- 1. 导航栏高亮当前模块 ---------- */
(function navActive() {
  const links = Array.from(document.querySelectorAll('nav .links a[href^="#"]'));
  const areas = links
    .map(a => {
      const el = document.querySelector(a.getAttribute('href'));
      return el ? { link: a, el } : null;
    })
    .filter(Boolean);
  if (!areas.length) return;

  function update() {
    const y = window.pageYOffset || document.documentElement.scrollTop;
    const navH = 70; // 导航栏高度，作为"当前"判定点
    let currentId = null;
    for (const { link, el } of areas) {
      const rect = el.getBoundingClientRect();
      // 该 section 顶部进入视口导航区以下 1/3 处，视为当前
      if (rect.top <= navH + 10) {
        currentId = link.getAttribute('href');
      }
    }
    // 若已滚到底部则高亮最后一个
    if ((window.innerHeight + window.pageYOffset) >= document.body.scrollHeight - 4) {
      currentId = areas[areas.length - 1].link.getAttribute('href');
    }
    if (currentId === null) currentId = areas[0].link.getAttribute('href'); // 默认第一个
    areas.forEach(({ link }) => link.classList.toggle('active', link.getAttribute('href') === currentId));
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* ---------- 2. 滚动渐显 ---------- */
(function revealOnScroll() {
  const revealEls = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => obs.observe(el));
})();
