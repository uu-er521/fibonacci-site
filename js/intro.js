/* ============================================================
   intro.js — 问题引入：兔子繁衍动效 + 数学家 accordion
   introPhenomena()
   （斐波那契教学页面 · 脚本封装 part 4）
   ============================================================ */

(function introPhenomena() {
  /* ---- 兔子繁衍动效 ---- */
  const range = document.getElementById('rabbitRange');
  const monthLabel = document.getElementById('rabbitMonth');
  const countLabel = document.getElementById('rabbitCount');
  const track = document.getElementById('rabbitTrack');
  const seqBox = document.getElementById('rabbitSeq');
  if (range && monthLabel && countLabel && track && seqBox) {
    // 每月 (成兔, 幼兔)，展示 1–11 个月
    const months = [];
    let adult = 0, young = 1;
    for (let m = 1; m <= 11; m++) {
      months.push({ adult, young });
      const na = adult + young; // 幼兔长大为成兔
      const ny = adult;         // 成兔各产一对
      adult = na; young = ny;
    }
    const fibSeq = months.map(x => x.adult + x.young);

    function render(m) {
      const data = months[m - 1];
      monthLabel.textContent = '第 ' + m + ' 个月';
      const total = data.adult + data.young;
      countLabel.innerHTML = '兔子：<b style="color:var(--gold-1)">' + total + '</b> 对';

      track.innerHTML = '';
      const mk = (cl) => {
        const el = document.createElement('span');
        el.className = 'rabbit-pair' + cl;
        el.textContent = '🐇';
        return el;
      };
      // 成兔
      for (let i = 0; i < data.adult; i++) track.appendChild(mk(' adult'));
      // 幼兔
      for (let i = 0; i < data.young; i++) track.appendChild(mk(''));

      // 底部序列 chips
      seqBox.innerHTML = '';
      fibSeq.forEach((v, i) => {
        const c = document.createElement('span');
        c.className = 'rabbit-seq-chip' + (i <= m - 1 ? ' active' : '');
        c.textContent = v;
        c.style.animationDelay = (i * 0.08) + 's';
        if (i <= m - 1) { c.style.animation = 'fadeSlide 0.4s ease both'; }
        seqBox.appendChild(c);
      });
    }
    range.value = 1;
    render(1);
    range.addEventListener('input', () => render(+range.value));
  }

  /* ---- 数学家 accordion 折叠 + 滚动才入场 + 展开自动下移 ---- */
  const accordion = document.getElementById('matAccordion');
  if (accordion) {
    const items = Array.from(accordion.querySelectorAll('.mat-item'));

    items.forEach(item => {
      const head = item.querySelector('.mat-head');
      head.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // accordion：先全部关闭
        items.forEach(i => i.classList.remove('open', 'expand'));
        if (!isOpen) {
          item.classList.add('open', 'expand');
          // 展开后把生平正文平滑滚动进入视口，确保「信息可以全部看见」
          setTimeout(() => {
            const body = item.querySelector('.mat-body');
            if (body) body.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }, 120);
        }
      });
    });

    // 滚动才入场：整个数学家区域「滚动到视口后才入场」（容器从左滑入、带动内部卡片）
    // 单屏模式下所有 .view 重叠放置，若一开始就 observe，隐藏屏（#intro 未激活）里的
    // mat-section 会在加载时就被 IntersectionObserver 误判为可见而提前入场。
    // 因此仅在"问题引入屏被激活（viewactive）"后才真正启动滚动监听。
    const section = accordion.closest('.mat-section');
    if (section) {
      let started = false;
      const startScrollReveal = () => {
        if (started) return;
        started = true;

        // 数学家区域容器：滚动进入视口才从左滑入
        const secIO = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              section.classList.add('visible');
              secIO.unobserve(section);
            }
          });
        }, { threshold: 0.2 });
        secIO.observe(section);

        // 内部卡片：随容器滚动呈现
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('entered');
              io.unobserve(e.target);
            }
          });
        }, { threshold: 0.2 });
        items.forEach(item => io.observe(item));
      };

      window.addEventListener('viewactive', (ev) => {
        if (ev.detail === 'intro') startScrollReveal();
      });
      // 若当前激活屏正是问题引入（如导航直跳），立即启动
      if (accordion.closest('.view').classList.contains('active')) startScrollReveal();
    }
  }
})();
